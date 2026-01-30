# Vibe Prototyping - Feature Implementation Plan

## Executive Summary

This document outlines the gap analysis and implementation plan to evolve the vibe prototyping feature to match the desired user experience.

---

## Desired User Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 1: UNDERSTANDING                                                      │
│  User enters prompt → LLM responds with understanding in its own words       │
│  User confirms understanding OR provides clarification                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 2: PLANNING                                                           │
│  LLM generates 4 distinct solution approaches (paradigms)                    │
│  User reviews, edits, approves OR requests changes                          │
│  User can reduce to fewer than 4 if desired                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 3: WIREFRAMING                                                        │
│  Visual wireframes generated for approved variants (up to 4)                │
│  Progressive streaming in 4-way split view                                  │
│  User can focus on individual, iterate, or view all                         │
│  User approves wireframes OR requests changes                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 4: HIGH-FIDELITY PROTOTYPING                                          │
│  Full HTML/CSS prototypes generated for each approved wireframe             │
│  Progressive streaming with live preview                                    │
│  User can focus, iterate, compare all variants                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 5: SHARING                                                            │
│  Share specific variant link                                                │
│  Share "magic link" that randomly shows 1 of N variants                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Gap Analysis

### What EXISTS and WORKS Well (Reuse)

| Feature | Status | Assessment |
|---------|--------|------------|
| User prompt input | ✅ Works | Keep as-is |
| LLM provider/model dropdown | ✅ Works | Keep, verify integration |
| API keys in Supabase Vault | ✅ Works | Keep as-is |
| 4 variant plan generation | ✅ Works | Keep, add "understanding" phase before |
| Plan editing before approval | ✅ Works | Keep as-is |
| ASCII wireframe generation | ⚠️ Partial | Replace with visual wireframes |
| High-fidelity HTML generation | ✅ Works | Keep as-is |
| Streaming code generation | ✅ Works | Keep, apply to wireframes too |
| Iteration on variants | ✅ Works | Extend to wireframe phase |
| Grid view comparison | ✅ Works | Enhance for focus mode |
| Supabase DB schema | ✅ Works | Minor additions needed |
| Edge functions | ✅ Works | Add new, modify existing |
| vibeStore state management | ✅ Works | Extend for new phases |

### What's MISSING (Build New)

| Feature | Priority | Effort |
|---------|----------|--------|
| Understanding phase (LLM echo-back) | P0 | Medium |
| Visual wireframe generation (SVG/HTML) | P0 | High |
| Streaming wireframe generation | P1 | Medium |
| 4-way split view with focus mode | P1 | Medium |
| Iteration during wireframe phase | P1 | Low (reuse existing) |
| Variant selection (fewer than 4) | P1 | Low |
| Share specific variant link | P0 | Medium |
| Share magic/random link | P1 | Medium |
| Public share page | P0 | Medium |

### What Needs REFACTORING

| Component | Issue | Solution |
|-----------|-------|----------|
| Phase progression | Jumps from plan to wireframe without "understanding" | Add understanding phase |
| Wireframe display | Shows ASCII text, not visual | Generate HTML/SVG wireframes |
| Status flow | Missing statuses for new phases | Add `understanding`, `understanding_ready` |
| Comparison view | Only grid, no focus mode | Add focus/overlay modes |

---

## Detailed Implementation Plan

### Phase 1: Add Understanding Step

**Goal**: After user prompt, LLM responds with its interpretation before planning.

**New Status Flow**:
```
idle → analyzing → understanding → understanding_ready → planning → plan_ready → ...
```

**Database Changes**:
```sql
-- Add to vibe_sessions
ALTER TABLE vibe_sessions
ADD COLUMN llm_understanding TEXT,
ADD COLUMN understanding_approved BOOLEAN DEFAULT false;
```

**New Edge Function**: `understand-request/index.ts`
```typescript
// Input: prompt, source HTML, UI metadata
// Output: LLM's interpretation paragraph
// "I understand you want to [summary]. The key goals are:
//  1. [goal 1]
//  2. [goal 2]
//  This will involve [scope description]."
```

**Frontend Changes**:
- Add "Understanding" phase UI showing LLM's interpretation
- Add "Confirm Understanding" / "Clarify" buttons
- Store clarification history in messages

**Files to Modify**:
- `src/pages/VibePrototyping.tsx` - Add understanding phase UI
- `src/store/vibeStore.ts` - Add understanding state and actions
- `src/services/understandingService.ts` - New service
- `supabase/functions/understand-request/` - New edge function
- `supabase/migrations/` - Schema update

---

### Phase 2: Enhance Plan Approval Flow

**Goal**: User can approve all 4, or select fewer variants to proceed with.

**UI Changes**:
- Each variant card has checkbox for selection
- "Proceed with Selected" button (requires at least 1)
- Visual indicator of selected vs. deselected variants

**Database Changes**:
```sql
-- Add to vibe_variant_plans
ALTER TABLE vibe_variant_plans
ADD COLUMN is_selected BOOLEAN DEFAULT true;
```

**Files to Modify**:
- `src/pages/VibePrototyping.tsx` - Add selection UI
- `src/store/vibeStore.ts` - Track selected variants
- `src/services/variantPlanService.ts` - Filter by selected

---

### Phase 3: Visual Wireframe Generation

**Goal**: Replace ASCII wireframes with visual HTML/SVG wireframes that look like "fat marker sketches".

**Approach**: Generate simplified HTML with:
- Gray boxes for images
- Simple outlined rectangles for text blocks
- Basic shapes for buttons/inputs
- Hand-drawn/sketch aesthetic CSS

**New Edge Function**: `generate-visual-wireframes/index.ts`
```typescript
// Input: plan, source HTML structure
// Output: Simplified HTML wireframe with sketch styling
// Uses: inline CSS with hand-drawn borders, sketch fonts
```

**Wireframe Style**:
```css
/* Sketch aesthetic */
.wireframe-container {
  font-family: 'Caveat', 'Comic Sans MS', cursive;
  border: 2px solid #333;
  border-radius: 3px;
  /* Hand-drawn effect via rough.js or CSS filters */
}
.wireframe-box {
  background: #f0f0f0;
  border: 2px dashed #666;
}
.wireframe-text {
  background: repeating-linear-gradient(...); /* Scribble lines */
}
```

**Streaming Support**: Same SSE pattern as code generation

**Files to Create**:
- `supabase/functions/generate-visual-wireframes/index.ts`
- `src/services/visualWireframeService.ts`

**Files to Modify**:
- `src/pages/VibePrototyping.tsx` - Display visual wireframes in iframes
- `src/store/vibeStore.ts` - Track wireframe HTML per variant

---

### Phase 4: 4-Way Split View with Focus Mode

**Goal**: Show all variants simultaneously with ability to focus on one.

**UI Layout**:
```
┌─────────────────────────────────────────────────┐
│  [Grid 2x2] [Focus] [Compare 2]    [Iterate]    │
├───────────────────┬─────────────────────────────┤
│                   │                             │
│   Variant 1       │   Variant 2                 │
│   (iframe)        │   (iframe)                  │
│                   │                             │
├───────────────────┼─────────────────────────────┤
│                   │                             │
│   Variant 3       │   Variant 4                 │
│   (iframe)        │   (iframe)                  │
│                   │                             │
└───────────────────┴─────────────────────────────┘
         ↓ Click to focus ↓
┌─────────────────────────────────────────────────┐
│  [← Back to Grid]              [Iterate]        │
├─────────────────────────────────────────────────┤
│                                                 │
│              Variant 2 (Full Width)             │
│              (large iframe preview)             │
│                                                 │
│  [Edit Code] [Approve] [Request Changes]        │
└─────────────────────────────────────────────────┘
```

**Component**: `VariantComparisonView.tsx`
- Props: `variants`, `mode` (grid | focus | compare)
- State: `focusedIndex`, `compareIndices`
- Features: Click to focus, keyboard navigation, responsive

**Files to Create**:
- `src/components/Vibe/VariantComparisonView.tsx`

**Files to Modify**:
- `src/pages/VibePrototyping.tsx` - Use new comparison component

---

### Phase 5: Iteration from Any Phase

**Goal**: Allow iteration during wireframe AND prototype phases.

**Current State**: Iteration only works on final HTML prototypes.

**Extension**:
- Reuse `iterateOnVariant()` for wireframes
- Same UI pattern: click "Iterate" → enter prompt → regenerate

**Database Changes**: None (vibe_iterations already supports this)

**Files to Modify**:
- `src/pages/VibePrototyping.tsx` - Enable iteration button during wireframe phase
- `src/services/iterationService.ts` - Handle wireframe iterations

---

### Phase 6: Sharing System

**Goal**: Share prototypes via links.

#### 6a. Specific Variant Link

**URL Pattern**: `/share/{session_id}/variant/{variant_index}`

**Example**: `https://voxel.app/share/abc123/variant/2`

#### 6b. Magic Random Link

**URL Pattern**: `/share/{session_id}/random`

**Behavior**: Server randomly selects one of the approved variants

**Database Changes**:
```sql
-- Add sharing table
CREATE TABLE vibe_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES vibe_sessions(id),
  share_type TEXT NOT NULL, -- 'specific' | 'random'
  variant_index INTEGER, -- NULL for random
  share_token TEXT UNIQUE NOT NULL, -- Short URL-safe token
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ -- Optional expiration
);

-- Track which variant was shown for random shares
CREATE TABLE vibe_share_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID REFERENCES vibe_shares(id),
  variant_index INTEGER NOT NULL,
  viewer_fingerprint TEXT, -- Anonymous tracking
  viewed_at TIMESTAMPTZ DEFAULT now()
);
```

**New Pages**:
- `src/pages/ShareView.tsx` - Public share viewer
- `src/pages/ShareRandomView.tsx` - Random variant selector

**New Service**: `src/services/shareService.ts`
```typescript
export async function createShare(sessionId: string, type: 'specific' | 'random', variantIndex?: number): Promise<ShareLink>
export async function getShareByToken(token: string): Promise<ShareData>
export async function trackView(shareId: string, variantIndex: number): Promise<void>
```

**New Routes**:
```typescript
// In App.tsx or router config
<Route path="/share/:token" element={<ShareView />} />
```

---

## Implementation Order

### Sprint 1: Foundation (Understanding + Selection)
1. [ ] Add `llm_understanding` column to vibe_sessions
2. [ ] Create `understand-request` edge function
3. [ ] Add understanding phase UI
4. [ ] Add variant selection checkboxes
5. [ ] Update status flow

### Sprint 2: Visual Wireframes
6. [ ] Create `generate-visual-wireframes` edge function
7. [ ] Create visual wireframe service
8. [ ] Add wireframe streaming support
9. [ ] Display wireframes in iframes (not ASCII)
10. [ ] Enable wireframe iteration

### Sprint 3: Comparison View
11. [ ] Create `VariantComparisonView` component
12. [ ] Implement grid mode (2x2)
13. [ ] Implement focus mode (single variant)
14. [ ] Implement compare mode (2 side-by-side)
15. [ ] Add keyboard navigation

### Sprint 4: Sharing
16. [ ] Create share database tables
17. [ ] Create share service
18. [ ] Create ShareView page
19. [ ] Implement specific variant sharing
20. [ ] Implement random/magic link sharing
21. [ ] Add share button UI

---

## Verification Checklist

- [ ] User enters prompt → sees LLM understanding → confirms
- [ ] LLM generates 4 plans → user can select subset
- [ ] Approved plans → visual wireframes stream progressively
- [ ] Wireframes shown in 4-way grid with focus option
- [ ] User can iterate on wireframes
- [ ] Approved wireframes → high-fidelity HTML streams
- [ ] User can iterate on prototypes
- [ ] Share specific variant → public page shows that variant
- [ ] Share magic link → public page shows random variant
- [ ] All data persisted in Supabase
- [ ] All LLM calls use user's configured API keys

---

## Files Summary

### New Files to Create
| File | Purpose |
|------|---------|
| `supabase/functions/understand-request/index.ts` | LLM understanding generation |
| `supabase/functions/generate-visual-wireframes/index.ts` | Visual wireframe generation |
| `src/services/understandingService.ts` | Understanding phase service |
| `src/services/visualWireframeService.ts` | Visual wireframe service |
| `src/services/shareService.ts` | Sharing functionality |
| `src/components/Vibe/VariantComparisonView.tsx` | Multi-mode comparison |
| `src/pages/ShareView.tsx` | Public share viewer |
| `supabase/migrations/xxx_understanding.sql` | Understanding schema |
| `supabase/migrations/xxx_sharing.sql` | Sharing schema |

### Files to Modify
| File | Changes |
|------|---------|
| `src/pages/VibePrototyping.tsx` | Add understanding phase, selection UI, new comparison view |
| `src/store/vibeStore.ts` | Add understanding state, selected variants |
| `src/services/variantPlanService.ts` | Support variant selection |
| `src/services/wireframeService.ts` | Switch to visual wireframes |
| `src/App.tsx` | Add share routes |

---

## Decision Points

1. **Wireframe Style**: Hand-drawn sketch (CSS) vs. clean boxes vs. actual rough.js library?
2. **Share Expiration**: Should magic links expire? Default duration?
3. **View Tracking**: How much analytics on shared links?
4. **Focus Mode**: Modal overlay vs. inline expansion vs. new page?
5. **Iteration History**: Show full history in UI or just current + count?
