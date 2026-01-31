# Implementation Review: Current State vs Approach B (Progressive Enhancement)

## Executive Summary

**Current Architecture:** Full LLM Rewrite (Approach A)
**Target Architecture:** Progressive Enhancement (Approach B)

The current implementation generates **complete new HTML** via LLM. Approach B keeps the **original HTML intact** and injects JavaScript for interactivity. This requires significant architectural changes but leverages much of the existing infrastructure.

---

## What Exists and Can Be Reused ✅

### 1. Screen Capture & Storage
**Status:** Complete, fully reusable

| Component | Status | Notes |
|-----------|--------|-------|
| Chrome Extension (SingleFile) | ✅ Keep | Works perfectly for capturing |
| `screens` table | ✅ Keep | Schema is correct |
| `screen_versions` table | ✅ Keep | Version history works |
| `screensStore.ts` | ✅ Keep | All CRUD operations work |
| Supabase Storage | ✅ Keep | File storage infrastructure |

**No changes needed** - capture pipeline is solid.

---

### 2. Screen Analysis
**Status:** Complete, partially reusable

| Component | Status | Notes |
|-----------|--------|-------|
| `screenAnalyzerService.ts` | ✅ Keep | UI metadata extraction |
| `analyze-screen` edge function | ✅ Keep | Color/typography/layout analysis |
| `screen_ui_metadata` table | ✅ Keep | Caches analysis results |
| `htmlCompactor.ts` | ✅ Keep | Reduces payload for LLM |

**Enhancement needed:** Add component boundary detection for injection points.

---

### 3. Understanding Phase
**Status:** Complete, fully reusable

| Component | Status | Notes |
|-----------|--------|-------|
| `understandingService.ts` | ✅ Keep | Request interpretation |
| `understand-request` edge function | ✅ Keep | LLM understands user intent |
| Understanding UI in VibePrototyping | ✅ Keep | Approval flow works |

**No changes needed** - understanding is approach-agnostic.

---

### 4. Planning Phase
**Status:** Complete, needs modification

| Component | Status | Notes |
|-----------|--------|-------|
| `variantPlanService.ts` | ⚠️ Modify | Plans should describe *injections* not *rewrites* |
| `generate-variant-plan` edge function | ⚠️ Modify | Change output format |
| `vibe_variant_plans` table | ⚠️ Modify | Add injection specification fields |
| Plan UI (PlanReviewGrid) | ✅ Keep | Display works, content changes |

**Changes needed:**
- Plan output should be "what to inject" not "how to rewrite"
- Add fields: `injection_targets[]`, `mock_data_schema`, `navigation_map`

---

### 5. Wireframing Phase
**Status:** Partially implemented, may not be needed

| Component | Status | Notes |
|-----------|--------|-------|
| `wireframeService.ts` | ❓ Evaluate | May not fit progressive enhancement |
| Visual wireframes | ❓ Evaluate | Original IS the wireframe in Approach B |

**Decision point:** With Approach B, the original screen IS the base. Wireframing may be replaced with "injection preview" showing what will be added.

---

### 6. Code Generation Phase
**Status:** Complete but wrong approach - needs replacement

| Component | Status | Notes |
|-----------|--------|-------|
| `variantCodeService.ts` | ❌ Replace | Currently generates full HTML |
| `generate-variant-code` edge function | ❌ Replace | Needs injection-based approach |
| `vibe_variants` table | ⚠️ Modify | Store injection scripts, not full HTML |

**This is the core change** - instead of generating new HTML, generate:
1. JavaScript injection scripts
2. Mock data JSON
3. Event handler mappings
4. Navigation configurations

---

### 7. Iteration Phase
**Status:** Complete, needs modification

| Component | Status | Notes |
|-----------|--------|-------|
| `iterationService.ts` | ⚠️ Modify | Iterate on injections, not HTML |
| `iterate-variant` edge function | ⚠️ Modify | Modify injection scripts |
| `vibe_iterations` table | ⚠️ Modify | Store injection diffs |

---

### 8. Sharing & Hosting
**Status:** Partially implemented, needs enhancement

| Component | Status | Notes |
|-----------|--------|-------|
| `sharingService.ts` | ✅ Keep | Share token generation works |
| `vibe_shares` table | ✅ Keep | Schema is correct |
| Share pages (`/share/:token`) | ⚠️ Modify | Must inject scripts on-the-fly |
| Static hosting | ❌ Change | Need injection server |

**Key change:** Hosting can't be purely static - need to inject scripts when serving.

---

### 9. Collaboration & Analytics
**Status:** Scaffolded, needs completion

| Component | Status | Notes |
|-----------|--------|-------|
| `multiplayerStore.ts` | ⚠️ Incomplete | Needs real-time implementation |
| Comments system | ⚠️ Incomplete | UI exists but limited |
| `vibe_share_views` | ✅ Keep | Analytics tracking works |
| Insights page | ⚠️ Incomplete | Dashboard needs building |

---

## What Needs to Be Built 🔨

### 1. Injection Engine (NEW - Core of Approach B)

**Purpose:** Transform static HTML into interactive prototype without modifying original

```
┌─────────────────────────────────────────────────────────────────┐
│                     INJECTION ENGINE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Original   │    │  Injection   │    │   Enhanced   │       │
│  │    HTML      │ +  │   Scripts    │ =  │  Prototype   │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                                                                  │
│  Injection Types:                                                │
│  ├─ Navigation (SPA routing)                                    │
│  ├─ Forms (validation, mock submit)                             │
│  ├─ Buttons (click handlers, state)                             │
│  ├─ Data (inject mock data into lists/tables)                   │
│  ├─ Modals (open/close triggers)                                │
│  ├─ Tabs (tab switching)                                        │
│  └─ Custom (LLM-generated handlers)                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Files to create:**
- `src/services/injectionEngine.ts` - Core injection logic
- `src/services/injectionPatterns.ts` - Pre-built patterns (nav, forms, etc.)
- `src/services/mockDataGenerator.ts` - Generate realistic mock data
- `src/services/domAnalyzer.ts` - Find injection points in HTML

---

### 2. Injection Script Generator (Edge Function)

**Purpose:** LLM generates JavaScript injection scripts instead of full HTML

**Input:**
```json
{
  "originalHtml": "...",
  "uiMetadata": { ... },
  "userRequest": "Add a user profile dropdown",
  "existingInjections": [ ... ]
}
```

**Output:**
```json
{
  "injections": [
    {
      "id": "profile-dropdown",
      "type": "custom",
      "targetSelector": ".header-right",
      "position": "append",
      "html": "<div class='profile-dropdown'>...</div>",
      "css": ".profile-dropdown { ... }",
      "js": "document.querySelector('.profile-dropdown')...",
      "mockData": { "user": { "name": "John", "avatar": "..." } }
    }
  ],
  "navigationMap": {
    "/profile": { "screen": "profile", "injections": ["profile-dropdown"] }
  }
}
```

**Files to create:**
- `supabase/functions/generate-injections/index.ts`

---

### 3. Prototype Runtime (Client-Side)

**Purpose:** Execute injections in the browser when viewing prototype

```typescript
// src/runtime/prototypeRuntime.ts
class PrototypeRuntime {
  private originalHtml: string;
  private injections: Injection[];
  private mockData: Record<string, unknown>;
  private router: ClientRouter;

  constructor(config: RuntimeConfig) { ... }

  // Initialize prototype in iframe
  mount(container: HTMLElement): void { ... }

  // Apply all injections
  applyInjections(): void { ... }

  // Handle navigation
  navigate(path: string): void { ... }

  // Update mock data
  setMockData(key: string, value: unknown): void { ... }

  // Hot-reload injection (for iteration)
  updateInjection(id: string, injection: Injection): void { ... }
}
```

**Files to create:**
- `src/runtime/prototypeRuntime.ts` - Main runtime
- `src/runtime/clientRouter.ts` - SPA navigation
- `src/runtime/formHandler.ts` - Form interactivity
- `src/runtime/stateManager.ts` - Prototype state

---

### 4. Prototype Viewer Component

**Purpose:** Render prototype with injections in Voxel UI

```tsx
// src/components/PrototypeViewer.tsx
function PrototypeViewer({
  screenHtml,
  injections,
  mockData,
  onInteraction,
}: PrototypeViewerProps) {
  const runtimeRef = useRef<PrototypeRuntime>();

  useEffect(() => {
    runtimeRef.current = new PrototypeRuntime({
      html: screenHtml,
      injections,
      mockData,
      onEvent: onInteraction,
    });
    runtimeRef.current.mount(containerRef.current);
  }, [screenHtml, injections]);

  return <div ref={containerRef} className="prototype-container" />;
}
```

---

### 5. Multi-Screen Prototype Support

**Purpose:** Link multiple captured screens into one prototype

```sql
-- New table: prototype_screens
prototype_screens (
  id UUID PRIMARY KEY,
  prototype_id UUID REFERENCES prototypes(id),
  screen_id UUID REFERENCES screens(id),
  route_path TEXT,           -- '/dashboard', '/settings', etc.
  is_entry_point BOOLEAN,    -- Starting screen
  injections JSONB,          -- Screen-specific injections
  created_at TIMESTAMPTZ
)

-- New table: prototype_navigation
prototype_navigation (
  id UUID PRIMARY KEY,
  prototype_id UUID REFERENCES prototypes(id),
  from_screen_id UUID,
  to_screen_id UUID,
  trigger_selector TEXT,     -- CSS selector that triggers navigation
  trigger_event TEXT,        -- 'click', 'submit', etc.
  animation TEXT             -- 'slide', 'fade', 'none'
)
```

---

### 6. Hosting Service for Enhanced Prototypes

**Purpose:** Serve prototypes with runtime injection

**Option A: Edge Function Injection**
```
Request /share/:token
    ↓
Edge Function:
    ├─ Fetch original HTML
    ├─ Fetch injections from DB
    ├─ Inject runtime script
    ├─ Inject analytics script
    └─ Return enhanced HTML
```

**Option B: Client-Side Runtime**
```
Request /share/:token
    ↓
Static page with:
    ├─ Runtime loader script
    ├─ Fetch HTML from storage
    ├─ Fetch injections from API
    └─ Runtime applies injections
```

**Recommendation:** Start with Option B (simpler), migrate to A if performance issues.

---

## Database Schema Changes

### Modify: `vibe_variant_plans`
```sql
ALTER TABLE vibe_variant_plans ADD COLUMN injection_targets JSONB;
-- Array of { selector, type, description }

ALTER TABLE vibe_variant_plans ADD COLUMN mock_data_schema JSONB;
-- Schema for mock data this variant needs

ALTER TABLE vibe_variant_plans ADD COLUMN navigation_additions JSONB;
-- New routes/links this variant adds
```

### Modify: `vibe_variants`
```sql
-- Remove or deprecate:
-- html_path, css_path (no longer generating full HTML)

-- Add:
ALTER TABLE vibe_variants ADD COLUMN injections JSONB;
-- Array of Injection objects

ALTER TABLE vibe_variants ADD COLUMN mock_data JSONB;
-- Actual mock data values

ALTER TABLE vibe_variants ADD COLUMN runtime_config JSONB;
-- Runtime settings (animations, transitions, etc.)
```

### New: `prototypes` (if not exists with right schema)
```sql
CREATE TABLE prototypes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,

  -- Multi-screen support
  entry_screen_id UUID REFERENCES screens(id),

  -- Runtime configuration
  global_injections JSONB,  -- Applied to all screens
  global_mock_data JSONB,   -- Shared mock data
  navigation_config JSONB,  -- Global nav settings

  -- Metadata
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### New: `prototype_screens`
```sql
CREATE TABLE prototype_screens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prototype_id UUID REFERENCES prototypes(id) ON DELETE CASCADE,
  screen_id UUID REFERENCES screens(id),
  route_path TEXT NOT NULL,
  display_name TEXT,
  is_entry BOOLEAN DEFAULT false,
  screen_injections JSONB,  -- Screen-specific injections
  position INTEGER,         -- Order in navigation
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(prototype_id, route_path)
);
```

---

## Files to Modify

### High Priority (Core Flow)

| File | Change Type | Description |
|------|-------------|-------------|
| `variantPlanService.ts` | Modify | Change plan output to injection specs |
| `variantCodeService.ts` | Replace | Generate injections, not HTML |
| `generate-variant-plan` edge function | Modify | New prompt for injection planning |
| `generate-variant-code` edge function | Replace | → `generate-injections` |
| `VibePrototyping.tsx` | Modify | Use PrototypeViewer instead of raw HTML |
| `vibeStore.ts` | Modify | Store injections instead of HTML URLs |

### Medium Priority (Viewing & Sharing)

| File | Change Type | Description |
|------|-------------|-------------|
| `Share.tsx` | Modify | Load runtime, apply injections |
| `SharedView.tsx` | Modify | Same as above |
| `sharingService.ts` | Modify | Include injections in share data |
| `VariantComparisonView.tsx` | Modify | Use PrototypeViewer |

### New Files to Create

| File | Purpose |
|------|---------|
| `src/services/injectionEngine.ts` | Core injection logic |
| `src/services/injectionPatterns.ts` | Pre-built patterns |
| `src/services/mockDataGenerator.ts` | Mock data creation |
| `src/services/domAnalyzer.ts` | Find injection points |
| `src/runtime/prototypeRuntime.ts` | Client-side runtime |
| `src/runtime/clientRouter.ts` | SPA navigation |
| `src/components/PrototypeViewer.tsx` | Render with injections |
| `supabase/functions/generate-injections/` | LLM injection generator |

---

## Duplication Analysis

### Potential Duplications Found

1. **Variant storage in multiple places**
   - `vibeStore.ts` has `variants[]`
   - `variantsStore.ts` also exists (legacy?)
   - **Action:** Consolidate to `vibeStore.ts` only

2. **Screen metadata extraction**
   - `screenAnalyzerService.ts` extracts metadata
   - `componentExtractorService.ts` also analyzes HTML
   - **Action:** Merge into unified analysis pipeline

3. **HTML rendering in multiple components**
   - `ScreenPreview.tsx`
   - `VariantPreviewModal.tsx`
   - Various iframe renderers in `VibePrototyping.tsx`
   - **Action:** Create single `PrototypeViewer.tsx`

4. **Share viewing pages**
   - `Share.tsx`
   - `SharedView.tsx`
   - `Collaborate.tsx`
   - **Action:** Consolidate share viewing logic

### Files That May Be Obsolete

| File | Reason | Action |
|------|--------|--------|
| `variantsStore.ts` | Duplicates vibeStore | Remove or merge |
| `editorStore.ts` | Unclear usage | Evaluate |
| `generate-html` edge function | Legacy? | Remove if unused |

---

## Migration Strategy

### Phase 1: Foundation (Keep existing working)
1. Create new injection services alongside existing
2. Add new database columns (non-breaking)
3. Build PrototypeViewer component
4. Create runtime library

### Phase 2: Parallel Implementation
1. Create `generate-injections` edge function
2. Modify planning prompts to output injection specs
3. Build injection preview UI
4. Test with simple cases (buttons, forms)

### Phase 3: Feature Parity
1. Support all current features via injections
2. Multi-screen prototype support
3. Navigation between screens
4. Mock data injection

### Phase 4: Switch Over
1. Update VibePrototyping to use new flow
2. Update sharing to use runtime
3. Deprecate full HTML generation
4. Clean up old code

### Phase 5: Enhancement
1. Add more injection patterns
2. Improve mock data quality
3. Add animations/transitions
4. Real-time collaboration

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Injection breaks original layout | Medium | High | Thorough CSS scoping, shadow DOM option |
| Complex interactions hard to inject | High | Medium | Pre-built patterns, fallback to Approach A |
| Performance with many injections | Low | Medium | Lazy loading, code splitting |
| Cross-browser compatibility | Medium | Medium | Polyfills, testing matrix |
| LLM generates invalid JS | Medium | High | Sandboxed execution, validation |

---

## Recommended Next Steps

1. **Experiment First**
   - Build minimal injection POC with 1 screen
   - Test: navigation, forms, buttons, mock data
   - Evaluate feasibility before full implementation

2. **Create Runtime Library**
   - Start with `prototypeRuntime.ts`
   - Add patterns incrementally
   - Test in isolation

3. **Modify Planning Phase**
   - Update LLM prompts for injection output
   - Keep generating both (A and B) initially
   - Compare quality

4. **Parallel Development**
   - Keep current flow working
   - Build new flow alongside
   - Feature flag to switch

---

## Questions to Resolve

1. **Shadow DOM vs Direct Injection?**
   - Shadow DOM: Better isolation, harder to style
   - Direct: Easier, but may conflict with original CSS

2. **How to handle screens without clear components?**
   - Some captured HTML may be heavily custom
   - Need fallback strategy

3. **State persistence across screens?**
   - Where to store prototype state?
   - LocalStorage? Runtime memory? Server?

4. **How to handle external resources?**
   - Images, fonts, scripts from original site
   - May fail when hosted on different domain

5. **Versioning of injections?**
   - How to track injection changes?
   - Diff format for injections?
