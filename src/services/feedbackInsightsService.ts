/**
 * Feedback Insights Service
 * Aggregates comment and share data for the Insights dashboard
 */

import { supabase, isSupabaseConfigured } from './supabase';
// Types are managed locally to avoid DB type mismatches

// Types
export interface ProjectInsight {
  id: string;
  sessionId: string;
  name: string;
  creatorEmail: string;
  variants: number;
  participants: number;
  comments: number;
  totalTimeSpent: string;
  totalViews: number;
  status: 'draft' | 'shared' | 'expired';
  createdAt: string;
}

export interface VariantInsight {
  variantIndex: number;
  label: string;
  title: string;
  description: string;
  sessions: number;
  participants: number;
  comments: number;
  resolvedComments: number;
  totalTimeSpent: string;
  avgTimeSpent: number;
  viewCount: number;
  sentimentScore: number | null;
  keyThemes: string[];
  summary: string | null;
  isTopPerformer: boolean;
}

export interface FeedbackComment {
  id: string;
  userName: string;
  userEmail: string;
  content: string;
  createdAt: string;
  resolved: boolean;
  positionX: number | null;
  positionY: number | null;
  variantIndex: number | null;
  replyCount: number;
}

export interface VariantDetailInsight extends Omit<VariantInsight, 'comments'> {
  comments: FeedbackComment[];
  commentCount: number;
  feedbackSummary: string;
  participantsFunnel: {
    label: string;
    count: number;
    percent: number;
  }[];
}

/**
 * Get all projects with insights for the current user
 */
export async function getProjectInsights(): Promise<ProjectInsight[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  // Get all sessions with their shares and comment counts
  const { data: sessions, error } = await supabase
    .from('vibe_sessions')
    .select(`
      id,
      name,
      user_id,
      created_at,
      status
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[FeedbackInsightsService] Error fetching sessions:', error);
    return [];
  }

  // For each session, get share and comment data
  const projectInsights: ProjectInsight[] = await Promise.all(
    (sessions || []).map(async (session) => {
      // Get shares for this session
      const { data: shares } = await supabase
        .from('vibe_shares')
        .select('id, view_count, is_active')
        .eq('session_id', session.id);

      // Get comment counts from all shares
      let totalComments = 0;
      let uniqueParticipants = new Set<string>();
      let totalViews = 0;

      if (shares && shares.length > 0) {
        const shareIds = shares.map((s) => s.id);
        totalViews = shares.reduce((sum, s) => sum + (s.view_count || 0), 0);

        // Get comments for all shares
        const { data: comments } = await supabase
          .from('share_comments')
          .select('user_email')
          .in('share_id', shareIds);

        if (comments) {
          totalComments = comments.length;
          comments.forEach((c) => uniqueParticipants.add(c.user_email));
        }
      }

      // Get variant count
      const { count: variantCount } = await supabase
        .from('vibe_variants')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', session.id);

      // Determine status
      const hasActiveShare = shares?.some((s) => s.is_active);
      const status: 'draft' | 'shared' | 'expired' = hasActiveShare
        ? 'shared'
        : shares && shares.length > 0
        ? 'expired'
        : 'draft';

      return {
        id: session.id,
        sessionId: session.id,
        name: session.name,
        creatorEmail: session.user_id, // Would need join for actual email
        variants: variantCount || 0,
        participants: uniqueParticipants.size,
        comments: totalComments,
        totalTimeSpent: formatDuration(totalViews * 30), // Estimate 30s per view
        totalViews,
        status,
        createdAt: session.created_at,
      };
    })
  );

  // Filter to only show projects with shares
  return projectInsights.filter((p) => p.status !== 'draft');
}

/**
 * Get variant insights for a specific session/project
 */
export async function getVariantInsights(sessionId: string): Promise<VariantInsight[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  // Get variants with their plans
  const { data: variants, error } = await supabase
    .from('vibe_variants')
    .select(`
      id,
      variant_index,
      session_id,
      vibe_variant_plans!inner (
        title,
        description
      )
    `)
    .eq('session_id', sessionId)
    .order('variant_index');

  if (error) {
    console.error('[FeedbackInsightsService] Error fetching variants:', error);
    return [];
  }

  // Get shares for this session
  const { data: shares } = await supabase
    .from('vibe_shares')
    .select('id, variant_index, view_count')
    .eq('session_id', sessionId);

  // Get feedback insights
  const { data: insights } = await supabase
    .from('share_feedback_insights')
    .select('*')
    .eq('session_id', sessionId);

  // Get comments grouped by variant
  const shareIds = shares?.map((s) => s.id) || [];
  const { data: comments } = shareIds.length > 0
    ? await supabase
        .from('share_comments')
        .select('variant_index, user_email, resolved')
        .in('share_id', shareIds)
    : { data: [] };

  // Build variant insights
  const variantInsights: VariantInsight[] = (variants || []).map((variant) => {
    const plan = (variant as unknown as { vibe_variant_plans: { title: string; description: string } }).vibe_variant_plans;
    const variantIndex = variant.variant_index;
    const label = `Variant ${String.fromCharCode(64 + variantIndex)}`;

    // Get views for this variant
    const variantShares = shares?.filter((s) => s.variant_index === variantIndex) || [];
    const viewCount = variantShares.reduce((sum, s) => sum + (s.view_count || 0), 0);

    // Get comments for this variant
    const variantComments = comments?.filter(
      (c) => c.variant_index === variantIndex || c.variant_index === null
    ) || [];
    const uniqueParticipants = new Set(variantComments.map((c) => c.user_email));
    const resolvedComments = variantComments.filter((c) => c.resolved).length;

    // Get insights for this variant
    const variantInsight = insights?.find((i) => i.variant_index === variantIndex);

    return {
      variantIndex,
      label,
      title: plan?.title || label,
      description: plan?.description || '',
      sessions: viewCount,
      participants: uniqueParticipants.size,
      comments: variantComments.length,
      resolvedComments,
      totalTimeSpent: formatDuration(viewCount * 30),
      avgTimeSpent: 30, // Placeholder
      viewCount,
      sentimentScore: variantInsight?.sentiment_score || null,
      keyThemes: (variantInsight?.key_themes as string[]) || [],
      summary: variantInsight?.summary || null,
      isTopPerformer: false, // Will be set after comparison
    };
  });

  // Mark top performer
  if (variantInsights.length > 0) {
    const topPerformer = variantInsights.reduce((best, current) =>
      current.viewCount > best.viewCount ? current : best
    );
    const topIdx = variantInsights.findIndex((v) => v.variantIndex === topPerformer.variantIndex);
    if (topIdx >= 0) {
      variantInsights[topIdx].isTopPerformer = true;
    }
  }

  return variantInsights;
}

/**
 * Get detailed insights for a specific variant including all comments
 */
export async function getVariantDetailInsight(
  sessionId: string,
  variantIndex: number
): Promise<VariantDetailInsight | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  // Get variant insights first
  const variantInsights = await getVariantInsights(sessionId);
  const variantInsight = variantInsights.find((v) => v.variantIndex === variantIndex);

  if (!variantInsight) {
    return null;
  }

  // Get shares for this session
  const { data: shares } = await supabase
    .from('vibe_shares')
    .select('id')
    .eq('session_id', sessionId);

  // Get all comments for this variant
  const shareIds = shares?.map((s) => s.id) || [];
  const { data: commentsData } = shareIds.length > 0
    ? await supabase
        .from('share_comments')
        .select('*')
        .in('share_id', shareIds)
        .or(`variant_index.eq.${variantIndex},variant_index.is.null`)
        .is('parent_id', null) // Only root comments
        .order('created_at', { ascending: false })
    : { data: [] };

  // Count replies for each comment
  const commentsWithReplies: FeedbackComment[] = await Promise.all(
    (commentsData || []).map(async (comment) => {
      const { count } = await supabase
        .from('share_comments')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', comment.id);

      return {
        id: comment.id,
        userName: comment.user_name,
        userEmail: comment.user_email,
        content: comment.content,
        createdAt: comment.created_at,
        resolved: comment.resolved,
        positionX: comment.position_x,
        positionY: comment.position_y,
        variantIndex: comment.variant_index,
        replyCount: count || 0,
      };
    })
  );

  // Generate feedback summary (in real app, this would be AI-generated)
  const feedbackSummary = variantInsight.summary || generateFeedbackSummary(commentsWithReplies);

  // Build participants funnel
  const participantsFunnel = [
    { label: 'Viewed', count: variantInsight.viewCount, percent: 100 },
    {
      label: 'Engaged',
      count: Math.round(variantInsight.viewCount * 0.65),
      percent: 65,
    },
    {
      label: 'Commented',
      count: variantInsight.participants,
      percent: variantInsight.viewCount > 0
        ? Math.round((variantInsight.participants / variantInsight.viewCount) * 100)
        : 0,
    },
    {
      label: 'Resolved feedback',
      count: variantInsight.resolvedComments,
      percent: variantInsight.comments > 0
        ? Math.round((variantInsight.resolvedComments / variantInsight.comments) * 100)
        : 0,
    },
  ];

  return {
    ...variantInsight,
    comments: commentsWithReplies,
    commentCount: variantInsight.comments,
    feedbackSummary,
    participantsFunnel,
  };
}

/**
 * Get feedback insights for a session (for the sharing service integration)
 */
export async function getSessionFeedbackInsights(sessionId: string): Promise<{
  totalComments: number;
  resolvedComments: number;
  uniqueParticipants: number;
  sentimentScore: number | null;
  summary: string | null;
}> {
  if (!isSupabaseConfigured()) {
    return {
      totalComments: 0,
      resolvedComments: 0,
      uniqueParticipants: 0,
      sentimentScore: null,
      summary: null,
    };
  }

  const { data, error } = await supabase.rpc('get_session_feedback_insights', {
    p_session_id: sessionId,
  });

  if (error || !data || data.length === 0) {
    return {
      totalComments: 0,
      resolvedComments: 0,
      uniqueParticipants: 0,
      sentimentScore: null,
      summary: null,
    };
  }

  // Aggregate across all shares
  const aggregated = data.reduce(
    (acc: {
      totalComments: number;
      resolvedComments: number;
      uniqueCommenters: Set<number>;
    }, row: {
      total_comments: number;
      resolved_comments: number;
      unique_commenters: number;
      sentiment_score: number | null;
      summary: string | null;
    }) => {
      acc.totalComments += row.total_comments;
      acc.resolvedComments += row.resolved_comments;
      acc.uniqueCommenters.add(row.unique_commenters);
      return acc;
    },
    { totalComments: 0, resolvedComments: 0, uniqueCommenters: new Set() }
  );

  const latestWithSummary = data.find((d: { summary: string | null }) => d.summary);

  return {
    totalComments: aggregated.totalComments,
    resolvedComments: aggregated.resolvedComments,
    uniqueParticipants: aggregated.uniqueCommenters.size,
    sentimentScore: latestWithSummary?.sentiment_score || null,
    summary: latestWithSummary?.summary || null,
  };
}

// Helper function to format duration
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Helper function to generate a basic feedback summary (placeholder for AI)
function generateFeedbackSummary(comments: FeedbackComment[]): string {
  if (comments.length === 0) {
    return 'No feedback received yet.';
  }

  const resolvedCount = comments.filter((c) => c.resolved).length;
  const pinCount = comments.filter((c) => c.positionX !== null).length;

  const parts = [
    `Received ${comments.length} comment${comments.length === 1 ? '' : 's'} from reviewers.`,
  ];

  if (resolvedCount > 0) {
    parts.push(`${resolvedCount} item${resolvedCount === 1 ? '' : 's'} resolved.`);
  }

  if (pinCount > 0) {
    parts.push(`${pinCount} pin-based comment${pinCount === 1 ? '' : 's'} on specific UI elements.`);
  }

  return parts.join(' ');
}
