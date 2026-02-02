/**
 * Comment Service
 * Manages comments on shared prototypes with real-time support
 */

import { supabase, supabasePublic, isSupabaseConfigured } from './supabase';
import type { ShareComment } from '@/types/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Types
export interface CommentInput {
  shareToken: string;
  content: string;
  userEmail: string;
  userName: string;
  positionX?: number;
  positionY?: number;
  variantIndex?: number;
  parentId?: string;
}

export interface CommentWithReplies extends ShareComment {
  reply_count: number;
  replies?: CommentWithReplies[];
}

export type CommentEventType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface CommentChangeEvent {
  eventType: CommentEventType;
  comment: ShareComment;
}

/**
 * Add a comment to a shared prototype
 */
export async function addComment(input: CommentInput): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  console.log('[CommentService] Adding comment:', input);

  // Use the RPC function which handles everything including insights updates
  const { data, error } = await supabasePublic.rpc('add_share_comment', {
    p_share_token: input.shareToken,
    p_content: input.content,
    p_user_email: input.userEmail,
    p_user_name: input.userName,
    p_position_x: input.positionX ?? null,
    p_position_y: input.positionY ?? null,
    p_variant_index: input.variantIndex ?? null,
    p_parent_id: input.parentId ?? null,
  });

  if (error) {
    console.error('[CommentService] Error adding comment:', error);
    throw new Error(error.message || 'Failed to add comment');
  }

  console.log('[CommentService] Comment added with ID:', data);
  return data as string;
}

/**
 * Get all comments for a shared prototype
 */
export async function getComments(shareToken: string): Promise<CommentWithReplies[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  console.log('[CommentService] Fetching comments for token:', shareToken);

  const { data, error } = await supabasePublic.rpc('get_share_comments', {
    p_share_token: shareToken,
  });

  if (error) {
    console.error('[CommentService] Error fetching comments:', error);
    return [];
  }

  // Transform the flat list into a threaded structure
  const comments = (data || []) as CommentWithReplies[];
  return organizeCommentsIntoThreads(comments);
}

/**
 * Update a comment's content
 */
export async function updateComment(
  commentId: string,
  content: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const { error } = await supabase
    .from('share_comments')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', commentId);

  if (error) {
    console.error('[CommentService] Error updating comment:', error);
    return false;
  }

  return true;
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const { error } = await supabase
    .from('share_comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    console.error('[CommentService] Error deleting comment:', error);
    return false;
  }

  return true;
}

/**
 * Toggle comment resolved status
 */
export async function toggleCommentResolved(
  commentId: string,
  resolved: boolean
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const { data, error } = await supabase.rpc('toggle_comment_resolved', {
    p_comment_id: commentId,
    p_resolved: resolved,
  });

  if (error) {
    console.error('[CommentService] Error toggling resolved:', error);
    return false;
  }

  return data === true;
}

/**
 * Subscribe to real-time comment changes
 */
export function subscribeToComments(
  shareId: string,
  onCommentChange: (event: CommentChangeEvent) => void
): RealtimeChannel {
  console.log('[CommentService] Subscribing to comments for share:', shareId);

  const channel = supabasePublic
    .channel(`share_comments:${shareId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'share_comments',
        filter: `share_id=eq.${shareId}`,
      },
      (payload) => {
        console.log('[CommentService] Real-time event:', payload);

        const eventType = payload.eventType as CommentEventType;
        const comment = (payload.new || payload.old) as ShareComment;

        onCommentChange({ eventType, comment });
      }
    )
    .subscribe((status) => {
      console.log('[CommentService] Subscription status:', status);
    });

  return channel;
}

/**
 * Unsubscribe from comment changes
 */
export async function unsubscribeFromComments(channel: RealtimeChannel): Promise<void> {
  await supabasePublic.removeChannel(channel);
}

/**
 * Get comment count for a share
 */
export async function getCommentCount(shareToken: string): Promise<{
  total: number;
  unresolved: number;
}> {
  if (!isSupabaseConfigured()) {
    return { total: 0, unresolved: 0 };
  }

  // First get the share_id from the token
  const { data: shareData } = await supabasePublic
    .from('vibe_shares')
    .select('id')
    .eq('share_token', shareToken)
    .eq('is_active', true)
    .single();

  if (!shareData) {
    return { total: 0, unresolved: 0 };
  }

  // Get total count
  const { count: total } = await supabasePublic
    .from('share_comments')
    .select('*', { count: 'exact', head: true })
    .eq('share_id', shareData.id);

  // Get unresolved count
  const { count: unresolved } = await supabasePublic
    .from('share_comments')
    .select('*', { count: 'exact', head: true })
    .eq('share_id', shareData.id)
    .eq('resolved', false);

  return {
    total: total || 0,
    unresolved: unresolved || 0,
  };
}

/**
 * Get pin comments (comments with positions) for overlay display
 */
export async function getPinComments(
  shareToken: string,
  variantIndex?: number
): Promise<CommentWithReplies[]> {
  const comments = await getComments(shareToken);

  // Filter to only comments with positions (pins)
  let pins = comments.filter(
    (c) => c.position_x !== null && c.position_y !== null
  );

  // Optionally filter by variant
  if (variantIndex !== undefined) {
    pins = pins.filter(
      (c) => c.variant_index === null || c.variant_index === variantIndex
    );
  }

  return pins;
}

// Helper function to organize flat comments into threaded structure
function organizeCommentsIntoThreads(
  comments: CommentWithReplies[]
): CommentWithReplies[] {
  const commentMap = new Map<string, CommentWithReplies>();
  const rootComments: CommentWithReplies[] = [];

  // First pass: create map of all comments
  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: organize into threads
  comments.forEach((comment) => {
    const commentWithReplies = commentMap.get(comment.id)!;

    if (comment.parent_id) {
      // This is a reply - add to parent's replies
      const parent = commentMap.get(comment.parent_id);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(commentWithReplies);
      }
    } else {
      // This is a root comment
      rootComments.push(commentWithReplies);
    }
  });

  // Sort root comments by created_at (newest first for display)
  rootComments.sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Sort replies within each thread
  const sortReplies = (comment: CommentWithReplies) => {
    if (comment.replies && comment.replies.length > 0) {
      comment.replies.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      comment.replies.forEach(sortReplies);
    }
  };

  rootComments.forEach(sortReplies);

  return rootComments;
}
