# Voxel - System Design & Architecture

## Overview

Voxel is a desktop-first AI prototyping tool that enables product teams to capture web UIs, generate AI-powered design variants, and collaborate on prototypes. The application uses a modern React frontend with Supabase backend services.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 Frontend                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   React     │  │   Zustand   │  │  TanStack   │  │    Monaco Editor    │ │
│  │   Router    │  │   Stores    │  │   Query     │  │   (Code Editing)    │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                      UI Components (MUI + Tailwind CSS)                  ││
│  │  VibePrototyping │ Repository │ DualModeEditor │ VariantComparison      ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Supabase Backend                                │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │    PostgreSQL DB    │  │   Edge Functions    │  │   Storage Buckets   │  │
│  │  - vibe_sessions    │  │  - generate-plan    │  │  - vibe-files       │  │
│  │  - vibe_variants    │  │  - generate-code    │  │  - screen-captures  │  │
│  │  - vibe_iterations  │  │  - iterate-variant  │  │  - components       │  │
│  │  - screens          │  │  - analyze-screen   │  │                     │  │
│  │  - components       │  │  - wireframe-gen    │  │                     │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘  │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             LLM Providers                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │    Anthropic    │  │     OpenAI      │  │  Google Gemini  │              │
│  │   (Claude 3.5)  │  │   (GPT-4o)      │  │   (Gemini Pro)  │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| React Router v6 | Client-side Routing |
| Zustand | Global State Management |
| TanStack Query | Server State & Caching |
| MUI (Material-UI) | Primary UI Components |
| Radix UI | Accessible UI Primitives |
| Monaco Editor | Code Editing |
| Framer Motion | Animations |

### Backend
| Technology | Purpose |
|------------|---------|
| Supabase | Backend-as-a-Service |
| PostgreSQL | Database |
| Deno | Edge Function Runtime |
| Row-Level Security | Data Authorization |

### LLM Integration
| Provider | Models | Use Case |
|----------|--------|----------|
| Anthropic | Claude 3.5 Sonnet/Haiku | Primary code generation |
| OpenAI | GPT-4o, GPT-4o-mini | Alternative provider |
| Google | Gemini 1.5 Pro/Flash | Alternative provider |

---

## Directory Structure

```
voxel_UX_demo/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── DualModeEditor.tsx    # Monaco + Tree view code editor
│   │   ├── HTMLTreeEditor.tsx    # DOM tree visualization
│   │   ├── VariantCard.tsx       # Variant display card
│   │   ├── ScreenCard.tsx        # Screen thumbnail card
│   │   └── ...
│   │
│   ├── layouts/              # Page layout wrappers
│   │   ├── AppLayout.tsx         # Main app with sidebar
│   │   ├── VibeLayout.tsx        # Prototyping workspace
│   │   └── AuthLayout.tsx        # Auth pages
│   │
│   ├── pages/                # Route-level components
│   │   ├── VibePrototyping.tsx   # AI prototyping workflow (~2400 lines)
│   │   ├── Repository.tsx        # Screen management
│   │   ├── RepositoryScreens.tsx # Screen list view
│   │   ├── ScreenPreview.tsx     # Full-screen preview
│   │   └── ...
│   │
│   ├── services/             # API & business logic
│   │   ├── supabase.ts           # Supabase client
│   │   ├── variantCodeService.ts # Variant generation
│   │   ├── variantPlanService.ts # Plan generation
│   │   ├── iterationService.ts   # Iteration handling
│   │   ├── wireframeService.ts   # Wireframe generation
│   │   ├── screenAnalyzerService.ts # UI analysis
│   │   └── ...
│   │
│   ├── store/                # Zustand state stores
│   │   ├── vibeStore.ts          # Prototyping state
│   │   ├── screensStore.ts       # Screen management
│   │   ├── themeStore.ts         # Theme configuration
│   │   └── ...
│   │
│   ├── types/                # TypeScript definitions
│   │   └── models.ts             # Domain models
│   │
│   └── utils/                # Helper utilities
│
├── supabase/
│   ├── functions/            # Edge Functions (Deno)
│   │   ├── generate-variant-plan/
│   │   ├── generate-variant-code/
│   │   ├── generate-variant-code-streaming/
│   │   ├── generate-wireframe/
│   │   ├── iterate-variant/
│   │   ├── analyze-screen/
│   │   └── ...
│   │
│   └── migrations/           # Database migrations
│       ├── 20260128_initial_schema.sql
│       ├── 20260130_vibe_prototyping.sql
│       ├── 20260131_iteration_history.sql
│       └── ...
│
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md       # This file
│   └── PRD.md                # Product Requirements
│
└── public/                   # Static assets
```

---

## Database Schema

### Core Tables

```sql
-- Captured screens from web
screens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  name TEXT,
  url TEXT,
  html TEXT,              -- Original captured HTML
  edited_html TEXT,       -- User-modified HTML
  thumbnail_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- AI prototyping sessions
vibe_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  screen_id UUID REFERENCES screens,
  name TEXT,
  prompt TEXT,            -- User's design prompt
  status TEXT,            -- pending|planning|plan_ready|generating|complete|failed
  plan_approved BOOLEAN,
  selected_variant_index INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Variant plans (4 design paradigms)
vibe_variant_plans (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES vibe_sessions,
  variant_index INTEGER,  -- 1=Conservative, 2=Modern, 3=Bold, 4=Alternative
  title TEXT,
  description TEXT,
  key_changes TEXT[],
  style_notes TEXT,
  wireframe_text TEXT,
  created_at TIMESTAMPTZ
)

-- Generated variant code
vibe_variants (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES vibe_sessions,
  plan_id UUID REFERENCES vibe_variant_plans,
  variant_index INTEGER,
  html_path TEXT,
  html_url TEXT,
  css_path TEXT,
  css_url TEXT,
  screenshot_path TEXT,
  screenshot_url TEXT,
  generation_model TEXT,
  generation_duration_ms INTEGER,
  token_count INTEGER,
  status TEXT,            -- pending|generating|capturing|complete|failed
  error_message TEXT,
  iteration_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Iteration history
vibe_iterations (
  id UUID PRIMARY KEY,
  variant_id UUID REFERENCES vibe_variants,
  session_id UUID REFERENCES vibe_sessions,
  variant_index INTEGER,
  iteration_number INTEGER,
  prompt TEXT,
  html_before TEXT,
  html_after TEXT,
  generation_model TEXT,
  generation_duration_ms INTEGER,
  created_at TIMESTAMPTZ
)

-- Screen UI metadata (extracted by AI)
screen_ui_metadata (
  id UUID PRIMARY KEY,
  screen_id UUID REFERENCES screens,
  components JSONB,       -- Detected UI components
  layout_structure JSONB, -- Page layout analysis
  color_palette JSONB,    -- Extracted colors
  typography JSONB,       -- Font analysis
  created_at TIMESTAMPTZ
)
```

### Row-Level Security

All tables implement RLS policies ensuring users can only access their own data:

```sql
-- Example policy
CREATE POLICY "Users can access own sessions"
  ON vibe_sessions
  FOR ALL
  USING (auth.uid() = user_id);
```

---

## Edge Functions

### 1. generate-variant-plan
**Purpose**: Generate 4 design paradigm plans from user prompt

**Input**:
```typescript
{
  sessionId: string,
  prompt: string,
  sourceHtml: string,
  uiMetadata?: UIMetadata,
  productContext?: string
}
```

**Output**: Array of 4 VariantPlan objects

### 2. generate-variant-code
**Purpose**: Generate HTML code for a single variant

**Input**:
```typescript
{
  sessionId: string,
  planId: string,
  variantIndex: number,
  plan: { title, description, keyChanges, styleNotes },
  sourceHtml: string,
  uiMetadata?: UIMetadata
}
```

**Output**: VibeVariant with HTML URL

### 3. generate-variant-code-streaming
**Purpose**: Stream HTML generation in real-time via SSE

**Input**: Same as generate-variant-code

**Output**: Server-Sent Events stream:
```
data: {"type":"chunk","content":"<div>..."}
data: {"type":"chunk","content":"</div>"}
data: {"type":"complete","htmlUrl":"...","htmlPath":"..."}
```

### 4. generate-wireframe
**Purpose**: Generate text-based wireframe description

**Input**:
```typescript
{
  sessionId: string,
  planId: string,
  variantIndex: number,
  plan: VariantPlan,
  sourceHtml: string
}
```

**Output**: Wireframe text description

### 5. iterate-variant
**Purpose**: Refine variant based on user feedback

**Input**:
```typescript
{
  sessionId: string,
  variantId: string,
  variantIndex: number,
  currentHtml: string,
  iterationPrompt: string
}
```

**Output**: Updated HTML and iteration record

### 6. analyze-screen
**Purpose**: Extract UI metadata from captured screen

**Input**: Screen HTML
**Output**: UIMetadata (components, colors, typography, layout)

---

## State Management

### Zustand Stores

| Store | Purpose | Key State |
|-------|---------|-----------|
| `vibeStore` | Prototyping workflow | session, plan, variants, status, progress |
| `screensStore` | Screen management | screens, selectedScreen, filters |
| `themeStore` | Theme configuration | mode (craftsman/modern), colors |
| `authStore` | Authentication | user, session, isAuthenticated |
| `workspaceStore` | Workspace settings | layout, preferences |

### vibeStore State Shape

```typescript
interface VibeState {
  // Session
  currentSession: VibeSession | null;
  sourceHtml: string | null;
  sourceMetadata: UIMetadata | null;

  // Plan
  plan: {
    plans: VariantPlan[];
    model: string;
    provider: string;
  } | null;

  // Variants
  variants: VibeVariant[];

  // Progress
  status: 'idle' | 'pending' | 'planning' | 'plan_ready' |
          'wireframing' | 'generating' | 'complete' | 'failed';
  progress: ProgressInfo | null;
  error: string | null;

  // UI State
  selectedVariantIndex: number | null;
  comparisonMode: 'grid' | 'split' | 'carousel';
  previewVariantIndex: number | null;
}
```

---

## Key Workflows

### 1. AI Prototyping Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Select     │────▶│   Enter      │────▶│   AI        │
│   Screen     │     │   Prompt     │     │   Analyzes  │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Compare    │◀────│   Generate   │◀────│   Review    │
│   Variants   │     │   Code       │     │   Plan      │
└──────┬───────┘     └──────────────┘     └──────────────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│   Select     │────▶│   Iterate/   │
│   Winner     │     │   Refine     │
└──────────────┘     └──────────────┘
```

### 2. Phase States

| Phase | Status | UI Display |
|-------|--------|------------|
| Understanding | `pending` | Analyzing screen structure... |
| Planning | `planning` | Generating 4 design paradigms... |
| Wireframing | `wireframing` | Creating layout sketches... |
| Building | `generating` | Generating prototypes... |
| Complete | `complete` | Summary with variant cards |

### 3. Streaming Code Generation

```typescript
// Frontend subscribes to SSE stream
const response = await fetch(streamUrl, { method: 'POST', body: ... });
const reader = response.body.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  // Parse SSE events
  const event = parseSSE(value);
  if (event.type === 'chunk') {
    // Update preview iframe with partial HTML
    setStreamingHtml(prev => prev + event.content);
  }
}
```

---

## Security

### Authentication
- Supabase Auth with email/password
- JWT tokens for API authentication
- Session management via Supabase client

### Authorization
- Row-Level Security on all tables
- Users can only access their own data
- Edge functions verify auth tokens

### Data Protection
- All HTML stored in Supabase Storage with private buckets
- API keys stored in Supabase secrets (not client-accessible)
- CORS configured for production domain only

---

## Performance Considerations

### Frontend
- Code splitting via React.lazy for large components
- TanStack Query caching for API responses
- Debounced search and filter operations
- Virtual scrolling for large lists (planned)

### Backend
- Edge functions deployed globally for low latency
- Database indexes on frequently queried columns
- Streaming responses to reduce perceived latency
- HTML compaction before sending to LLM (max 15KB)

---

## Deployment

### Frontend
- Hosted on Vercel/Netlify (recommended)
- Environment variables for Supabase config
- Production builds with Vite

### Backend
- Supabase hosted PostgreSQL
- Edge functions deployed via Supabase CLI
- Storage buckets for file assets

### Environment Variables

```bash
# Frontend (.env)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Edge Functions (Supabase secrets)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=...
LLM_PROVIDER=anthropic
LLM_MODEL=claude-3-5-sonnet-20241022
```

---

## Future Architecture Considerations

1. **Real-time Collaboration**: WebSocket integration for multiplayer editing
2. **Component Library**: Extracted components stored separately
3. **Version Control**: Git-like history for screen changes
4. **Plugin System**: Custom LLM providers and transformations
5. **Export Pipeline**: Figma, React, Vue code export
