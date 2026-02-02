/**
 * Collaborator Service
 * Manages collaborators and access control for shared prototypes
 */

import { supabase, supabasePublic, isSupabaseConfigured } from './supabase';
import type { ShareCollaborator, CollaboratorRole } from '@/types/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Types
export interface CollaboratorInput {
  shareToken: string;
  email: string;
  displayName?: string;
  role?: CollaboratorRole;
}

export interface CollaboratorWithPresence extends ShareCollaborator {
  isOnline?: boolean;
  cursor?: { x: number; y: number };
}

export type PresenceEventType = 'join' | 'leave' | 'sync';

export interface PresenceEvent {
  eventType: PresenceEventType;
  userId: string;
  email: string;
  displayName?: string;
  cursor?: { x: number; y: number };
}

/**
 * Invite a collaborator to a shared prototype
 */
export async function inviteCollaborator(
  input: CollaboratorInput
): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  console.log('[CollaboratorService] Inviting collaborator:', input);

  const { data, error } = await supabase.rpc('invite_collaborator', {
    p_share_token: input.shareToken,
    p_email: input.email,
    p_display_name: input.displayName ?? null,
    p_role: input.role ?? 'commenter',
  });

  if (error) {
    console.error('[CollaboratorService] Error inviting collaborator:', error);
    throw new Error(error.message || 'Failed to invite collaborator');
  }

  return data as string;
}

/**
 * Get all collaborators for a share
 */
export async function getCollaborators(
  shareToken: string
): Promise<CollaboratorWithPresence[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  // First get the share_id from the token
  const { data: shareData } = await supabase
    .from('vibe_shares')
    .select('id')
    .eq('share_token', shareToken)
    .single();

  if (!shareData) {
    return [];
  }

  const { data, error } = await supabase
    .from('share_collaborators')
    .select('*')
    .eq('share_id', shareData.id)
    .order('invited_at', { ascending: true });

  if (error) {
    console.error('[CollaboratorService] Error fetching collaborators:', error);
    return [];
  }

  return (data || []) as CollaboratorWithPresence[];
}

/**
 * Update a collaborator's role
 */
export async function updateCollaboratorRole(
  collaboratorId: string,
  role: CollaboratorRole
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const { error } = await supabase
    .from('share_collaborators')
    .update({ role })
    .eq('id', collaboratorId);

  if (error) {
    console.error('[CollaboratorService] Error updating role:', error);
    return false;
  }

  return true;
}

/**
 * Remove a collaborator from a share
 */
export async function removeCollaborator(
  collaboratorId: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const { error } = await supabase
    .from('share_collaborators')
    .delete()
    .eq('id', collaboratorId);

  if (error) {
    console.error('[CollaboratorService] Error removing collaborator:', error);
    return false;
  }

  return true;
}

/**
 * Update last seen timestamp (for presence tracking)
 */
export async function updateLastSeen(shareToken: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return;
  }

  // First get the share_id
  const { data: shareData } = await supabase
    .from('vibe_shares')
    .select('id')
    .eq('share_token', shareToken)
    .single();

  if (!shareData) {
    return;
  }

  await supabase
    .from('share_collaborators')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('share_id', shareData.id)
    .eq('email', user.email);
}

/**
 * Subscribe to presence changes using Supabase Realtime Presence
 */
export function subscribeToPresence(
  shareId: string,
  userInfo: { userId: string; email: string; displayName?: string },
  onPresenceChange: (presences: CollaboratorWithPresence[]) => void
): RealtimeChannel {
  console.log('[CollaboratorService] Subscribing to presence for share:', shareId);

  const channel = supabasePublic.channel(`presence:${shareId}`, {
    config: {
      presence: {
        key: userInfo.userId,
      },
    },
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const presences = Object.values(state).flat() as unknown as CollaboratorWithPresence[];
      console.log('[CollaboratorService] Presence sync:', presences);
      onPresenceChange(presences);
    })
    .on('presence', { event: 'join' }, ({ newPresences }) => {
      console.log('[CollaboratorService] User joined:', newPresences);
    })
    .on('presence', { event: 'leave' }, ({ leftPresences }) => {
      console.log('[CollaboratorService] User left:', leftPresences);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Track this user's presence
        await channel.track({
          id: userInfo.userId,
          email: userInfo.email,
          display_name: userInfo.displayName,
          isOnline: true,
          joined_at: new Date().toISOString(),
        });
      }
    });

  return channel;
}

/**
 * Update cursor position in presence
 */
export async function updateCursorPosition(
  channel: RealtimeChannel,
  cursor: { x: number; y: number }
): Promise<void> {
  const presenceState = channel.presenceState();
  const currentKey = Object.keys(presenceState)[0]; // Get current user's key

  if (currentKey) {
    const currentPresence = presenceState[currentKey][0] as Record<string, unknown>;
    await channel.track({
      ...currentPresence,
      cursor,
      updated_at: new Date().toISOString(),
    });
  }
}

/**
 * Unsubscribe from presence
 */
export async function unsubscribeFromPresence(
  channel: RealtimeChannel
): Promise<void> {
  await channel.untrack();
  await supabasePublic.removeChannel(channel);
}

/**
 * Check if current user has access to a share
 */
export async function checkShareAccess(
  shareToken: string
): Promise<{ hasAccess: boolean; role?: CollaboratorRole }> {
  if (!isSupabaseConfigured()) {
    // Without Supabase, allow access (for demo/local development)
    return { hasAccess: true };
  }

  // First check if the share is public/active
  const { data: shareData } = await supabasePublic
    .from('vibe_shares')
    .select('id, is_active, expires_at')
    .eq('share_token', shareToken)
    .single();

  if (!shareData || !shareData.is_active) {
    return { hasAccess: false };
  }

  // Check expiration
  if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
    return { hasAccess: false };
  }

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    // Anonymous users can view public shares
    return { hasAccess: true, role: 'viewer' };
  }

  // Check if user is a collaborator with specific role
  const { data: collaborator } = await supabase
    .from('share_collaborators')
    .select('role')
    .eq('share_id', shareData.id)
    .eq('email', user.email)
    .single();

  if (collaborator) {
    return { hasAccess: true, role: collaborator.role as CollaboratorRole };
  }

  // User is authenticated but not a collaborator - still allow viewing
  return { hasAccess: true, role: 'viewer' };
}

/**
 * Get collaborator count for a share
 */
export async function getCollaboratorCount(shareToken: string): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 0;
  }

  // First get the share_id
  const { data: shareData } = await supabasePublic
    .from('vibe_shares')
    .select('id')
    .eq('share_token', shareToken)
    .single();

  if (!shareData) {
    return 0;
  }

  const { count } = await supabasePublic
    .from('share_collaborators')
    .select('*', { count: 'exact', head: true })
    .eq('share_id', shareData.id);

  return count || 0;
}
