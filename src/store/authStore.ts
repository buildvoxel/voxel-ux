import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/services/supabase';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;

  // Actions
  initialize: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;

  // Helpers
  isAdmin: () => boolean;
}

// Fetch user profile from database
async function fetchUserProfile(userId: string): Promise<Partial<User> | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return {
    name: data.name,
    role: data.role as 'admin' | 'user' | 'viewer',
  };
}

// Convert Supabase user to app User type
async function mapSupabaseUser(supabaseUser: SupabaseUser): Promise<User> {
  const profile = await fetchUserProfile(supabaseUser.id);

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: profile?.name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
    role: profile?.role || 'user',
    avatar: supabaseUser.user_metadata?.avatar_url,
    createdAt: supabaseUser.created_at,
  };
}

// Track if auth listener is already set up to prevent duplicate listeners
let authListenerSetUp = false;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      supabaseUser: null,
      isAuthenticated: false,
      isLoading: true,
      accessToken: null,

      initialize: async () => {
        if (!isSupabaseConfigured()) {
          // Use mock admin user for development without Supabase
          set({
            user: {
              id: 'mock-user-1',
              email: 'admin@voxel.ai',
              name: 'Admin User',
              role: 'admin',
            },
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }

        // Prevent setting up multiple listeners
        if (authListenerSetUp) {
          return;
        }
        authListenerSetUp = true;

        // Use onAuthStateChange as the primary way to get auth state
        // This avoids race conditions with detectSessionInUrl that cause AbortError
        // The INITIAL_SESSION event fires when the client first initializes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('[AuthStore] Auth state change:', event);

          if (session?.user) {
            const user = await mapSupabaseUser(session.user);
            set({
              supabaseUser: session.user,
              user,
              isAuthenticated: true,
              accessToken: session.access_token,
              isLoading: false,
            });
          } else if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
            set({
              supabaseUser: null,
              user: null,
              isAuthenticated: false,
              accessToken: null,
              isLoading: false,
            });
          }
        });

        // Store subscription for potential cleanup (not strictly needed in this app)
        (window as unknown as { __authSubscription?: typeof subscription }).__authSubscription = subscription;
      },

      loginWithEmail: async (email, password) => {
        if (!isSupabaseConfigured()) {
          // Mock login for development
          set({
            user: {
              id: 'mock-user-1',
              email,
              name: email.split('@')[0],
              role: 'admin',
            },
            isAuthenticated: true,
          });
          return {};
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return { error: error.message };
        }

        // Set auth state immediately on successful login (don't wait for listener)
        if (data.session?.user) {
          const user = await mapSupabaseUser(data.session.user);
          set({
            supabaseUser: data.session.user,
            user,
            isAuthenticated: true,
            accessToken: data.session.access_token,
          });
        }

        return {};
      },

      logout: async () => {
        if (isSupabaseConfigured()) {
          await supabase.auth.signOut();
        }

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({
          user: null,
          supabaseUser: null,
          isAuthenticated: false,
          accessToken: null,
        });
      },

      refreshProfile: async () => {
        const { supabaseUser } = get();
        if (!supabaseUser) return;

        const user = await mapSupabaseUser(supabaseUser);
        set({ user });
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },
    }),
    {
      name: 'auth-storage',
      partialize: () => ({
        // Don't persist - always fetch fresh from Supabase
      }),
    }
  )
);
