# Voxel Architecture Plan: Static Screens → Functional Prototypes

## Executive Summary

Transform captured web app screens into functional, shareable prototypes with collaborative feedback. The system must support multiple technical approaches since LLM-based code generation is experimental.

---

## Core Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   CAPTURE   │────▶│    STORE    │────▶│  TRANSFORM  │────▶│    HOST     │
│  (Extension)│     │  (Screens)  │     │ (Prototype) │     │  (Share)    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                               │                    │
                                               ▼                    ▼
                                        ┌─────────────┐     ┌─────────────┐
                                        │   ITERATE   │     │ COLLABORATE │
                                        │  (Versions) │     │ (Feedback)  │
                                        └─────────────┘     └─────────────┘
                                                                   │
                                                                   ▼
                                                            ┌─────────────┐
                                                            │  INSIGHTS   │
                                                            │ (Analytics) │
                                                            └─────────────┘
```

---

## Phase 1: Capture & Storage

### Chrome Extension (Already Exists: SingleFile-based)

**Current State:**
- Captures full HTML with inlined CSS
- Saves as single .html file
- Uploads to Supabase storage

**Enhancements Needed:**
1. Extract computed styles separately (for component isolation)
2. Capture interaction states (hover, focus, active)
3. Tag semantic regions (header, nav, main, footer, forms)
4. Extract component boundaries (buttons, cards, modals, etc.)

### Screen Storage Schema

```sql
-- Captured screens
screens (
  id, user_id, org_id,
  name, description, source_url,
  html_url,           -- Full HTML in storage
  css_extracted,      -- Separated CSS (optional)
  component_map,      -- JSON: identified components
  semantic_regions,   -- JSON: page structure
  capture_metadata,   -- viewport, timestamp, etc.
  created_at, updated_at
)
```

---

## Phase 2: Transform - Static to Functional

### The Core Challenge

**Input:** Static HTML snapshot (no JS, no state, no routing)
**Output:** Functional prototype with:
- Working navigation
- Interactive components
- Mock data
- State management
- New features (user-requested)

### Approach A: Full LLM Rewrite (High Risk, High Reward)

**Strategy:** LLM rewrites the entire HTML into a React/Vue/vanilla JS app

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Static HTML  │────▶│   LLM Call   │────▶│  React App   │
│  (captured)  │     │  (rewrite)   │     │ (functional) │
└──────────────┘     └──────────────┘     └──────────────┘
```

**Pros:**
- Clean, modern code output
- Full interactivity possible
- Easy to add new features

**Cons:**
- LLM may misinterpret design
- High token cost (full page rewrite)
- Layout/styling drift from original
- Slow generation time

**Experiment:** Try with Claude 3.5 Sonnet on 3 sample screens, measure fidelity.

---

### Approach B: Progressive Enhancement (Low Risk, Incremental)

**Strategy:** Keep original HTML, inject JS for interactivity layer-by-layer

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Static HTML  │────▶│ Analyze DOM  │────▶│ Inject JS    │
│  (captured)  │     │ (find forms, │     │ (event       │
│              │     │  buttons,    │     │  handlers,   │
│              │     │  links)      │     │  mock data)  │
└──────────────┘     └──────────────┘     └──────────────┘
```

**Layers:**
1. **Navigation:** Convert `<a>` tags to client-side routing
2. **Forms:** Add submit handlers, validation, mock responses
3. **Buttons:** Add click handlers, state changes
4. **Data:** Inject mock data into tables, lists, cards
5. **Modals:** Wire up open/close triggers

**Pros:**
- Preserves original design exactly
- Incremental, testable
- Lower LLM cost (targeted injections)
- Faster iteration

**Cons:**
- Limited by original HTML structure
- Complex state management across injections
- May not support all interaction patterns

**Experiment:** Build injection library, test on 3 sample screens.

---

### Approach C: Hybrid Component Extraction (Medium Risk, Flexible)

**Strategy:** Extract components from HTML, rewrite only those, reassemble

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Static HTML  │────▶│   Extract    │────▶│ LLM Rewrite  │────▶│  Reassemble  │
│  (captured)  │     │  Components  │     │  Components  │     │   Page       │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

**Component Types:**
- Forms → Functional form components with validation
- Navigation → Router-aware nav component
- Cards/Lists → Data-driven components with mock data
- Modals → Stateful modal components
- Tables → Sortable/filterable data tables

**Pros:**
- Targeted LLM usage (lower cost)
- Components can be reused
- Original layout preserved
- Easier to debug (component-level)

**Cons:**
- Complex extraction logic needed
- Component boundaries may be ambiguous
- Integration complexity

**Experiment:** Build component extractor, test extraction accuracy on 5 screens.

---

### Approach D: Iframe + Postmessage Bridge (Lowest Risk, Isolation)

**Strategy:** Keep original HTML in iframe, bridge interactivity via postMessage

```
┌─────────────────────────────────────────────────────────┐
│                    Host Application                      │
│  ┌─────────────────────────────────────────────────┐    │
│  │              IFRAME (Original HTML)              │    │
│  │                                                  │    │
│  │   [Button] ──postMessage──▶ Host handles click   │    │
│  │                                                  │    │
│  │   Host ──postMessage──▶ Updates DOM              │    │
│  │                                                  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  State Management, Routing, Mock Data (Host)             │
└─────────────────────────────────────────────────────────┘
```

**Pros:**
- Zero design drift (exact original)
- Clear separation of concerns
- Easy rollback (just show original)
- Works with any captured HTML

**Cons:**
- Cross-frame communication complexity
- Limited deep DOM manipulation
- May feel less "native"
- CSP issues with some captured sites

**Experiment:** Build bridge POC, test interaction latency and reliability.

---

## Phase 3: Feature Addition via LLM

Regardless of approach chosen, adding new features follows similar pattern:

### Feature Request Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────▶│ Understand  │────▶│    Plan     │────▶│  Generate   │
│  Prompt     │     │  Request    │     │  Changes    │     │    Code     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   ▼
                                                            ┌─────────────┐
                                                            │   Inject    │
                                                            │ into Proto  │
                                                            └─────────────┘
```

### LLM Prompt Strategy Options

**Option 1: Full Context**
- Send entire HTML + request
- LLM returns complete modified HTML
- High fidelity, high cost

**Option 2: Diff-Based**
- Send relevant section + request
- LLM returns patch/diff
- Lower cost, integration complexity

**Option 3: Instruction-Based**
- LLM returns DOM manipulation instructions
- Client executes instructions
- Lowest cost, most complex client

**Recommendation:** Start with Option 1 for reliability, optimize to Option 2 once working.

---

## Phase 4: Prototype Storage & Versioning

### Data Model

```sql
-- Prototypes (apps built from screens)
prototypes (
  id, screen_id, user_id,
  name, description,
  approach,           -- 'rewrite' | 'enhance' | 'hybrid' | 'iframe'
  status,             -- 'draft' | 'published' | 'archived'
  created_at, updated_at
)

-- Prototype versions (iterations)
prototype_versions (
  id, prototype_id,
  version_number,
  html_url,           -- Generated HTML in storage
  js_url,             -- Injected JS (if progressive enhancement)
  css_url,            -- Modified CSS (if any)
  mock_data,          -- JSON mock data
  change_prompt,      -- User's request that created this version
  change_summary,     -- LLM-generated summary
  generation_metadata,-- model, tokens, duration
  created_at
)

-- Version relationships (for branching)
prototype_branches (
  id, prototype_id,
  name,               -- 'main', 'experiment-1', etc.
  head_version_id,
  created_at
)
```

### Version Control Features

1. **Linear history:** Each change creates new version
2. **Branching:** Fork a version to explore alternatives
3. **Comparison:** Side-by-side diff of versions
4. **Rollback:** Revert to any previous version
5. **Merge:** Combine changes from branches (advanced)

---

## Phase 5: Hosting & Sharing

### Hosting Options

**Option A: Static File Hosting (Supabase Storage + CDN)**

```
prototype.html + prototype.js + mock-data.json
        │
        ▼
   Supabase Storage
        │
        ▼
   CDN (Cloudflare/Vercel Edge)
        │
        ▼
   share.voxel.app/[token]
```

**Pros:** Simple, cheap, fast
**Cons:** No server-side logic, limited analytics

---

**Option B: Serverless Rendering (Edge Functions)**

```
Request → Edge Function → Fetch HTML → Inject Analytics → Return
```

**Pros:** Can inject tracking, customize per-viewer
**Cons:** More complex, slight latency

---

**Option C: Dedicated Preview Service**

```
Request → Preview Service → Render in headless browser → Return
```

**Pros:** Can run JS, screenshot generation
**Cons:** Most complex, highest cost

---

### Recommended: Option A + Edge Enhancement

Start with static hosting, add edge function layer for:
- Analytics injection
- Access control (password, email gate)
- View tracking

### Sharing Features

1. **Public link:** Anyone with link can view
2. **Password protected:** Requires password
3. **Email gated:** Collects email before viewing
4. **Team only:** Org members only
5. **Embeddable:** iframe embed code

---

## Phase 6: Collaboration & Feedback

### Implicit Feedback (Usage Data)

```sql
-- Prototype view sessions
prototype_sessions (
  id, prototype_id, version_id,
  viewer_id,          -- null for anonymous
  viewer_email,       -- if email-gated
  session_start, session_end,
  device_info,
  created_at
)

-- Interaction events
prototype_events (
  id, session_id,
  event_type,         -- 'click', 'scroll', 'hover', 'form_submit'
  element_selector,
  element_text,
  coordinates,
  timestamp
)

-- Heatmap aggregates (computed)
prototype_heatmaps (
  id, prototype_id, version_id,
  heatmap_type,       -- 'click', 'scroll', 'attention'
  data,               -- JSON heatmap data
  session_count,
  computed_at
)
```

### Explicit Feedback (Comments)

```sql
-- Comments on prototypes
prototype_comments (
  id, prototype_id, version_id,
  user_id,
  parent_id,          -- for threading
  content,
  -- Position data for anchored comments
  anchor_type,        -- 'point', 'element', 'region'
  anchor_data,        -- JSON: coordinates or selector
  status,             -- 'open', 'resolved', 'archived'
  created_at, updated_at
)

-- Comment reactions
comment_reactions (
  id, comment_id, user_id,
  reaction_type,      -- 'agree', 'disagree', 'question', 'love'
  created_at
)
```

### Real-time Collaboration

**Technology Options:**
1. **Supabase Realtime:** Built-in, easy, limited features
2. **Liveblocks:** Purpose-built for collaboration, more features
3. **Yjs + WebSocket:** Most flexible, most complex

**Recommendation:** Start with Supabase Realtime for comments, evaluate Liveblocks if need cursors/presence.

---

## Phase 7: Insights & Analytics

### Dashboard Metrics

1. **Engagement:**
   - Views per prototype
   - Session duration
   - Return visitors

2. **Interaction:**
   - Click heatmaps
   - Scroll depth
   - Form completion rates

3. **Feedback:**
   - Comment volume
   - Sentiment (from comment text)
   - Resolution rate

4. **Comparison:**
   - A/B metrics across versions
   - Feature adoption rates

### Data Pipeline

```
Events → Supabase → Edge Function (aggregate) → Analytics Tables → Dashboard
                          │
                          ▼
                   Weekly Digest Email
```

---

## Technical Experiments Needed

Before committing to an approach, run these experiments:

### Experiment 1: LLM Rewrite Fidelity
**Goal:** Can LLM faithfully convert static HTML to React while preserving design?
**Method:**
1. Capture 5 diverse screens (dashboard, form, landing, settings, list)
2. Prompt Claude to convert each to React
3. Render both, screenshot, compare pixel diff
4. Score: <5% diff = pass

### Experiment 2: Progressive Enhancement Viability
**Goal:** Can we make static HTML interactive without breaking it?
**Method:**
1. Take same 5 screens
2. Build injection script for common patterns
3. Inject, test interactions work
4. Score: All major interactions work = pass

### Experiment 3: Component Extraction Accuracy
**Goal:** Can we reliably identify and extract components?
**Method:**
1. Take same 5 screens
2. Run extraction algorithm
3. Manually verify extracted components match reality
4. Score: >80% accuracy = pass

### Experiment 4: Iframe Bridge Performance
**Goal:** Is postMessage bridge fast enough for smooth UX?
**Method:**
1. Build bridge POC
2. Measure round-trip latency
3. Test with rapid interactions
4. Score: <50ms latency, no dropped events = pass

---

## Recommended Implementation Order

### Phase 1: Foundation (Week 1-2)
- [ ] Define final database schema
- [ ] Build screen metadata extraction (extend capture)
- [ ] Set up prototype storage and versioning tables
- [ ] Build basic hosting (static files)

### Phase 2: Experiment (Week 3-4)
- [ ] Run all 4 experiments in parallel
- [ ] Document results and tradeoffs
- [ ] Choose primary approach based on results
- [ ] Build POC of chosen approach

### Phase 3: Core Transform (Week 5-6)
- [ ] Implement chosen transformation approach
- [ ] Build feature addition via LLM
- [ ] Implement version control
- [ ] Build comparison view

### Phase 4: Collaboration (Week 7-8)
- [ ] Implement sharing with access controls
- [ ] Build comment system with anchoring
- [ ] Add usage tracking
- [ ] Build basic analytics dashboard

### Phase 5: Polish (Week 9-10)
- [ ] Heatmap visualization
- [ ] Advanced analytics
- [ ] Performance optimization
- [ ] Edge cases and error handling

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| LLM output quality varies | Multiple approach experiments, fallback options |
| Token costs too high | Implement caching, diff-based updates, model selection |
| Real-time collab complexity | Start simple (polling), upgrade if needed |
| Captured HTML too large | Implement compression, chunking, progressive loading |
| Cross-browser compatibility | Test matrix, polyfills, graceful degradation |

---

## Decision Points

1. **After experiments:** Which transform approach to use?
2. **After Phase 3:** Is LLM quality sufficient or need fine-tuning?
3. **After Phase 4:** Is Supabase Realtime sufficient for collaboration?
4. **Ongoing:** Which LLM provider/model gives best results?

---

## Next Steps

1. Review this plan
2. Prioritize which experiments to run first
3. Set up experiment tracking (results doc)
4. Begin Phase 1 foundation work in parallel with experiments
