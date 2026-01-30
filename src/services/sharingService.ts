/**
 * Sharing Service
 * Manages share links for vibe prototypes
 */

import { supabase, isSupabaseConfigured } from './supabase';

// Types
export type ShareType = 'specific' | 'random';

export interface ShareConfig {
  sessionId: string;
  shareType: ShareType;
  variantIndex?: number; // Required for 'specific' type
  expiresInDays?: number; // null = never expires
}

export interface ShareLink {
  shareId: string;
  shareToken: string;
  shareUrl: string;
  shareType: ShareType;
  variantIndex?: number;
  expiresAt?: string;
  createdAt: string;
}

export interface ShareData {
  share: {
    id: string;
    type: ShareType;
    created_at: string;
  };
  session: {
    id: string;
    name: string;
    prompt: string;
  };
  variant: {
    index: number;
    html_url: string;
    title: string;
    description: string;
  };
}

export interface ShareWithViews extends ShareLink {
  viewCount: number;
  isActive: boolean;
}

/**
 * Create a share link for a vibe session
 */
export async function createShareLink(config: ShareConfig): Promise<ShareLink> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  // Validate config
  if (config.shareType === 'specific' && !config.variantIndex) {
    throw new Error('Variant index required for specific share type');
  }

  console.log('[SharingService] Creating share link:', config);

  // Call the database function to create the share
  const { data, error } = await supabase.rpc('create_share_link', {
    p_session_id: config.sessionId,
    p_share_type: config.shareType,
    p_variant_index: config.variantIndex || null,
    p_expires_in_days: config.expiresInDays || null,
  });

  if (error) {
    console.error('[SharingService] Error creating share:', error);
    throw new Error(error.message || 'Failed to create share link');
  }

  if (!data || data.length === 0) {
    throw new Error('Failed to create share link');
  }

  const result = data[0];
  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/share/${result.share_token}`;

  // Fetch the full share details
  const { data: shareDetails } = await supabase
    .from('vibe_shares')
    .select('*')
    .eq('id', result.share_id)
    .single();

  return {
    shareId: result.share_id,
    shareToken: result.share_token,
    shareUrl,
    shareType: config.shareType,
    variantIndex: config.variantIndex,
    expiresAt: shareDetails?.expires_at,
    createdAt: shareDetails?.created_at || new Date().toISOString(),
  };
}

/**
 * Get share data for public viewing (no auth required)
 */
export async function getShareData(token: string): Promise<ShareData | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  console.log('[SharingService] Fetching share data for token:', token);

  const { data, error } = await supabase.rpc('get_share_data', {
    p_token: token,
  });

  if (error) {
    console.error('[SharingService] Error fetching share:', error);
    return null;
  }

  if (data?.error) {
    console.error('[SharingService] Share error:', data.error);
    return null;
  }

  return data as ShareData;
}

/**
 * Record a view for analytics
 */
export async function recordShareView(
  shareId: string,
  variantIndex: number,
  userAgent?: string
): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  // Hash the IP for privacy (we'll do this on the edge function for real IP)
  // For now, just use a placeholder
  const ipHash = 'anonymous';

  await supabase.from('vibe_share_views').insert({
    share_id: shareId,
    variant_index: variantIndex,
    viewer_ip_hash: ipHash,
    user_agent: userAgent || navigator.userAgent,
  });
}

/**
 * Get all shares for a session
 */
export async function getSharesForSession(sessionId: string): Promise<ShareWithViews[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('vibe_shares')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[SharingService] Error fetching shares:', error);
    return [];
  }

  const baseUrl = window.location.origin;

  return (data || []).map((share) => ({
    shareId: share.id,
    shareToken: share.share_token,
    shareUrl: `${baseUrl}/share/${share.share_token}`,
    shareType: share.share_type as ShareType,
    variantIndex: share.variant_index,
    expiresAt: share.expires_at,
    createdAt: share.created_at,
    viewCount: share.view_count,
    isActive: share.is_active,
  }));
}

/**
 * Deactivate a share link
 */
export async function deactivateShare(shareId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const { error } = await supabase
    .from('vibe_shares')
    .update({ is_active: false })
    .eq('id', shareId);

  if (error) {
    console.error('[SharingService] Error deactivating share:', error);
    return false;
  }

  return true;
}

/**
 * Get view analytics for a share
 */
export async function getShareAnalytics(shareId: string): Promise<{
  totalViews: number;
  viewsByVariant: Record<number, number>;
  recentViews: Array<{ viewedAt: string; variantIndex: number }>;
}> {
  if (!isSupabaseConfigured()) {
    return { totalViews: 0, viewsByVariant: {}, recentViews: [] };
  }

  const { data, error } = await supabase
    .from('vibe_share_views')
    .select('*')
    .eq('share_id', shareId)
    .order('viewed_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('[SharingService] Error fetching analytics:', error);
    return { totalViews: 0, viewsByVariant: {}, recentViews: [] };
  }

  const views = data || [];
  const viewsByVariant: Record<number, number> = {};

  views.forEach((view) => {
    viewsByVariant[view.variant_index] = (viewsByVariant[view.variant_index] || 0) + 1;
  });

  return {
    totalViews: views.length,
    viewsByVariant,
    recentViews: views.slice(0, 10).map((v) => ({
      viewedAt: v.viewed_at,
      variantIndex: v.variant_index,
    })),
  };
}
