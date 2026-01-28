/**
 * Profile Service
 * Handles user profile updates and team management
 */

import { supabase, isSupabaseConfigured } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'user' | 'viewer';
  avatar_url: string | null;
  company_name: string | null;
  job_title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

// Local storage keys for dev mode
const PROFILE_KEY = 'voxel-user-profile';
const TEAMS_KEY = 'voxel-teams';

/**
 * Get user profile from database
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data as UserProfile;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, 'name' | 'avatar_url' | 'company_name' | 'job_title'>>
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    // Use localStorage for development
    const stored = localStorage.getItem(PROFILE_KEY);
    const profile = stored ? JSON.parse(stored) : { id: userId };
    const updated = { ...profile, ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    return { success: true };
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Upload profile avatar
 */
export async function uploadAvatar(file: File, userId: string): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!isSupabaseConfigured()) {
    // For development without Supabase, create a local blob URL
    const url = URL.createObjectURL(file);

    // Update local profile with avatar
    const stored = localStorage.getItem(PROFILE_KEY);
    const profile = stored ? JSON.parse(stored) : { id: userId };
    profile.avatar_url = url;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

    return { success: true, url };
  }

  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const extension = file.name.split('.').pop() || 'png';
    const fileName = `avatars/${userId}/${timestamp}-${randomId}.${extension}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('editor-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Avatar upload error:', uploadError);
      return { success: false, error: uploadError.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('editor-images')
      .getPublicUrl(fileName);

    // Update user profile with avatar URL
    await updateUserProfile(userId, { avatar_url: publicUrl });

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Avatar upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Get all teams
 */
export async function getTeams(): Promise<Team[]> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem(TEAMS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    // Return default mock teams
    const defaultTeams: Team[] = [
      { id: '1', name: 'Design', color: '#764ba2', created_by: 'mock-user-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), member_count: 2 },
      { id: '2', name: 'Product', color: '#667eea', created_by: 'mock-user-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), member_count: 1 },
      { id: '3', name: 'Engineering', color: '#52c41a', created_by: 'mock-user-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), member_count: 1 },
    ];
    localStorage.setItem(TEAMS_KEY, JSON.stringify(defaultTeams));
    return defaultTeams;
  }

  const { data, error } = await supabase
    .from('teams')
    .select('*, team_members(count)')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching teams:', error);
    return [];
  }

  return (data || []).map(team => ({
    ...team,
    member_count: team.team_members?.[0]?.count || 0,
  }));
}

/**
 * Create a new team
 */
export async function createTeam(
  name: string,
  color: string,
  userId: string
): Promise<{ success: boolean; team?: Team; error?: string }> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem(TEAMS_KEY);
    const teams: Team[] = stored ? JSON.parse(stored) : [];

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name,
      color,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      member_count: 0,
    };

    teams.push(newTeam);
    localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));

    return { success: true, team: newTeam };
  }

  const { data, error } = await supabase
    .from('teams')
    .insert({
      name,
      color,
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating team:', error);
    return { success: false, error: error.message };
  }

  return { success: true, team: data as Team };
}

/**
 * Update a team
 */
export async function updateTeam(
  teamId: string,
  updates: Partial<Pick<Team, 'name' | 'color'>>
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem(TEAMS_KEY);
    const teams: Team[] = stored ? JSON.parse(stored) : [];

    const index = teams.findIndex(t => t.id === teamId);
    if (index >= 0) {
      teams[index] = { ...teams[index], ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
    }

    return { success: true };
  }

  const { error } = await supabase
    .from('teams')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', teamId);

  if (error) {
    console.error('Error updating team:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Delete a team
 */
export async function deleteTeam(teamId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem(TEAMS_KEY);
    const teams: Team[] = stored ? JSON.parse(stored) : [];

    const filtered = teams.filter(t => t.id !== teamId);
    localStorage.setItem(TEAMS_KEY, JSON.stringify(filtered));

    return { success: true };
  }

  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', teamId);

  if (error) {
    console.error('Error deleting team:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Invite a user to a team
 */
export async function inviteUser(
  email: string,
  role: 'admin' | 'user',
  teamName: string | null
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    // For development, just simulate success
    console.log(`[Dev] Invited ${email} as ${role} to team: ${teamName || 'none'}`);
    return { success: true };
  }

  // In production, this would call a Supabase Edge Function to send invite email
  // and create a pending invite record
  const { error } = await supabase.functions.invoke('invite-user', {
    body: { email, role, teamName },
  });

  if (error) {
    console.error('Error inviting user:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
