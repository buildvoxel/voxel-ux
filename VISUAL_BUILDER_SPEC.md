# Visual Builder Specification

## Overview

This document specifies **Approach E: Visual Builder** - a canvas-based prototyping system that addresses the limitations of the Injection Engine approach. While Approach B (Progressive Enhancement) handles ~70-80% of use cases, this approach targets complex interactions that require:

- Drag-and-drop functionality
- Canvas elements and drawing
- Complex state management
- Custom animations and transitions
- Real-time data simulation

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         VISUAL BUILDER SYSTEM                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐               │
│  │   CAPTURE    │───▶│   EXTRACT    │───▶│  COMPONENT   │               │
│  │  (HTML/CSS)  │    │  COMPONENTS  │    │   LIBRARY    │               │
│  └──────────────┘    └──────────────┘    └──────────────┘               │
│                                                 │                        │
│                                                 ▼                        │
│  ┌──────────────────────────────────────────────────────────────┐       │
│  │                      VISUAL CANVAS                            │       │
│  │  ┌─────────────────────────────────────────────────────┐     │       │
│  │  │                    DROP ZONE                         │     │       │
│  │  │                                                      │     │       │
│  │  │   [Component]  [Component]  [Component]             │     │       │
│  │  │        │            │            │                  │     │       │
│  │  │        └────────────┼────────────┘                  │     │       │
│  │  │                     ▼                               │     │       │
│  │  │              State Machine                          │     │       │
│  │  │                                                      │     │       │
│  │  └─────────────────────────────────────────────────────┘     │       │
│  └──────────────────────────────────────────────────────────────┘       │
│                                 │                                        │
│                                 ▼                                        │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐               │
│  │    RENDER    │───▶│    EXPORT    │───▶│     HOST     │               │
│  │   (Preview)  │    │   (Bundle)   │    │   (Share)    │               │
│  └──────────────┘    └──────────────┘    └──────────────┘               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Component Extractor

Extracts reusable components from captured HTML, making them available for drag-and-drop.

```typescript
interface ExtractedComponent {
  id: string;
  name: string;
  type: ComponentType;

  // Visual representation
  html: string;
  css: string;
  thumbnail: string;

  // Component metadata
  bounds: { width: number; height: number };
  slots: ComponentSlot[];      // Editable content areas
  props: ComponentProp[];      // Configurable properties
  variants: ComponentVariant[]; // Style variants (hover, active, etc.)

  // Interaction capabilities
  interactions: InteractionCapability[];
  dataBindings: DataBinding[];
}

type ComponentType =
  | 'layout'      // Containers, grids, flex
  | 'navigation'  // Nav bars, menus, tabs
  | 'form'        // Inputs, buttons, selects
  | 'display'     // Cards, lists, tables
  | 'media'       // Images, videos, icons
  | 'feedback'    // Modals, toasts, alerts
  | 'chart'       // Data visualizations
  | 'custom';     // User-defined

interface ComponentSlot {
  id: string;
  name: string;
  selector: string;
  type: 'text' | 'html' | 'component';
  defaultValue: string;
}

interface ComponentProp {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'color' | 'select';
  cssProperty?: string;
  options?: string[];  // For select type
  defaultValue: unknown;
}

interface InteractionCapability {
  trigger: 'click' | 'hover' | 'focus' | 'drag' | 'drop' | 'scroll';
  actions: ActionType[];
}

type ActionType =
  | 'navigate'
  | 'toggle-visibility'
  | 'update-state'
  | 'animate'
  | 'open-modal'
  | 'submit-form'
  | 'drag-start'
  | 'drop-receive';
```

### 2. Visual Canvas

The main editing surface with drag-and-drop support.

```typescript
interface CanvasState {
  // Viewport
  zoom: number;
  pan: { x: number; y: number };

  // Selection
  selectedIds: string[];
  hoveredId: string | null;

  // Editing
  editMode: 'select' | 'pan' | 'draw' | 'text';
  snapToGrid: boolean;
  gridSize: number;

  // Layers
  layers: CanvasLayer[];
  activeLayerId: string;
}

interface CanvasLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  nodes: CanvasNode[];
}

interface CanvasNode {
  id: string;
  type: 'component' | 'group' | 'frame' | 'shape' | 'text' | 'canvas-element';

  // Transform
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;

  // Component reference (if type === 'component')
  componentId?: string;
  componentProps?: Record<string, unknown>;
  slotContent?: Record<string, string>;

  // Canvas element (if type === 'canvas-element')
  canvasConfig?: CanvasElementConfig;

  // Styling
  style: NodeStyle;

  // Hierarchy
  parentId: string | null;
  children: string[];

  // Interactions
  interactions: NodeInteraction[];
}

interface NodeStyle {
  opacity: number;
  overflow: 'visible' | 'hidden' | 'scroll';
  background?: string;
  border?: string;
  borderRadius?: number;
  boxShadow?: string;
}

interface NodeInteraction {
  id: string;
  trigger: InteractionTrigger;
  action: InteractionAction;
  condition?: InteractionCondition;
}
```

### 3. Canvas Elements

Support for HTML5 canvas-based elements (charts, drawings, custom graphics).

```typescript
interface CanvasElementConfig {
  type: 'chart' | 'drawing' | 'animation' | 'custom';

  // Chart config
  chart?: {
    library: 'recharts' | 'chart.js' | 'visx';
    chartType: 'line' | 'bar' | 'pie' | 'scatter' | 'area';
    data: DataSource;
    options: Record<string, unknown>;
  };

  // Drawing config
  drawing?: {
    strokes: DrawingStroke[];
    background: string;
  };

  // Animation config
  animation?: {
    type: 'lottie' | 'rive' | 'css';
    source: string;  // URL or inline JSON
    autoplay: boolean;
    loop: boolean;
  };

  // Custom canvas code
  custom?: {
    renderFn: string;  // Serialized function
    updateFn?: string;
    cleanupFn?: string;
  };
}

interface DrawingStroke {
  points: { x: number; y: number; pressure?: number }[];
  color: string;
  width: number;
  tool: 'pen' | 'highlighter' | 'eraser';
}

interface DataSource {
  type: 'static' | 'mock' | 'binding';
  static?: unknown[];
  mock?: MockDataConfig;
  binding?: string;  // State path
}
```

### 4. Drag & Drop System

```typescript
interface DragDropContext {
  // Current drag operation
  isDragging: boolean;
  dragSource: DragSource | null;
  dragPreview: HTMLElement | null;

  // Drop targets
  dropTargets: DropTarget[];
  activeDropTarget: DropTarget | null;

  // Handlers
  startDrag: (source: DragSource) => void;
  updateDrag: (position: { x: number; y: number }) => void;
  endDrag: (target: DropTarget | null) => void;
  cancelDrag: () => void;
}

interface DragSource {
  type: 'component' | 'node' | 'external';

  // For component library drag
  componentId?: string;

  // For existing node drag
  nodeId?: string;

  // For external file drag
  fileType?: string;
  fileData?: unknown;
}

interface DropTarget {
  id: string;
  nodeId: string;
  zone: 'inside' | 'before' | 'after' | 'replace';
  accepts: string[];  // Component types accepted
  onDrop: (source: DragSource, position: { x: number; y: number }) => void;
}

// Drag preview rendering
interface DragPreviewRenderer {
  renderComponentPreview(componentId: string): HTMLElement;
  renderNodePreview(nodeId: string): HTMLElement;
  updatePreviewPosition(x: number, y: number): void;
  showDropIndicator(target: DropTarget): void;
  hideDropIndicator(): void;
}
```

### 5. State Machine

Manages prototype state, enabling complex interactions.

```typescript
interface PrototypeState {
  // Global state
  global: Record<string, unknown>;

  // Per-node state
  nodes: Record<string, NodeState>;

  // Navigation state
  navigation: {
    currentScreen: string;
    history: string[];
    params: Record<string, string>;
  };

  // Form state
  forms: Record<string, FormState>;

  // Mock data state
  mockData: Record<string, unknown[]>;
}

interface NodeState {
  visible: boolean;
  disabled: boolean;
  loading: boolean;
  error: string | null;
  data: unknown;
  customState: Record<string, unknown>;
}

interface FormState {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// State machine definition
interface StateMachine {
  id: string;
  initial: string;
  context: Record<string, unknown>;
  states: Record<string, StateDefinition>;
}

interface StateDefinition {
  on: Record<string, StateTransition>;
  entry?: StateAction[];
  exit?: StateAction[];
}

interface StateTransition {
  target: string;
  guard?: string;  // Condition expression
  actions?: StateAction[];
}

interface StateAction {
  type: 'assign' | 'invoke' | 'send' | 'navigate' | 'animate';
  params: Record<string, unknown>;
}
```

### 6. Interaction System

Handles all user interactions with the prototype.

```typescript
interface InteractionTrigger {
  type: 'click' | 'double-click' | 'hover' | 'focus' | 'blur' |
        'drag-start' | 'drag-end' | 'drop' | 'scroll' | 'key' |
        'timer' | 'state-change' | 'data-load';

  // For key triggers
  key?: string;
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];

  // For timer triggers
  delay?: number;
  repeat?: boolean;

  // For state-change triggers
  statePath?: string;
  condition?: string;
}

interface InteractionAction {
  type: ActionType;
  target?: string;  // Node ID or 'self'
  params: ActionParams;
  delay?: number;
  duration?: number;
}

type ActionParams =
  | NavigateParams
  | VisibilityParams
  | StateParams
  | AnimateParams
  | ModalParams
  | FormParams
  | DragDropParams
  | ApiParams;

interface NavigateParams {
  screen: string;
  transition?: 'slide' | 'fade' | 'none';
  direction?: 'left' | 'right' | 'up' | 'down';
}

interface VisibilityParams {
  visible?: boolean;
  toggle?: boolean;
  animation?: 'fade' | 'slide' | 'scale' | 'none';
}

interface StateParams {
  path: string;
  value?: unknown;
  operation?: 'set' | 'toggle' | 'increment' | 'decrement' | 'append' | 'remove';
}

interface AnimateParams {
  properties: Record<string, unknown>;
  easing?: string;
  fill?: 'forwards' | 'backwards' | 'both' | 'none';
}

interface DragDropParams {
  allowDrop?: boolean;
  dragData?: unknown;
  dropEffect?: 'move' | 'copy' | 'link';
  onDrop?: string;  // State action ID
}

interface ApiParams {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  body?: unknown;
  mockResponse?: unknown;
  mockDelay?: number;
  onSuccess?: string;  // State action ID
  onError?: string;
}
```

---

## Mock Data System

### Data Generator

```typescript
interface MockDataConfig {
  schema: DataSchema;
  count: number;
  seed?: number;  // For reproducible data
  locale?: string;
}

interface DataSchema {
  type: 'object' | 'array';
  properties?: Record<string, FieldSchema>;
  items?: FieldSchema;
}

interface FieldSchema {
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';

  // String generators
  generator?:
    | 'name' | 'firstName' | 'lastName' | 'email' | 'phone'
    | 'company' | 'jobTitle' | 'address' | 'city' | 'country'
    | 'paragraph' | 'sentence' | 'word' | 'uuid' | 'url'
    | 'image' | 'avatar' | 'color';

  // Number constraints
  min?: number;
  max?: number;
  precision?: number;

  // Date constraints
  dateMin?: string;
  dateMax?: string;

  // Enum values
  enum?: unknown[];

  // Nested schemas
  properties?: Record<string, FieldSchema>;
  items?: FieldSchema;
}

// Usage example
const userSchema: DataSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', generator: 'uuid' },
    name: { type: 'string', generator: 'name' },
    email: { type: 'string', generator: 'email' },
    avatar: { type: 'string', generator: 'avatar' },
    role: { type: 'string', enum: ['admin', 'user', 'guest'] },
    createdAt: { type: 'date', dateMin: '2023-01-01', dateMax: '2024-01-01' },
    stats: {
      type: 'object',
      properties: {
        posts: { type: 'number', min: 0, max: 100 },
        followers: { type: 'number', min: 0, max: 10000 },
      }
    }
  }
};
```

### API Mocking

```typescript
interface MockApiConfig {
  endpoints: MockEndpoint[];
  globalDelay?: number;
  errorRate?: number;  // 0-1, probability of mock errors
}

interface MockEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;  // Supports :param syntax

  // Response configuration
  response: MockResponse | MockResponseFn;
  delay?: number;
  status?: number;

  // Conditional responses
  conditions?: MockCondition[];
}

interface MockResponse {
  data: unknown | DataSchema;  // Static data or schema to generate
  headers?: Record<string, string>;
}

type MockResponseFn = (request: MockRequest) => MockResponse;

interface MockRequest {
  method: string;
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
  body: unknown;
  headers: Record<string, string>;
}

interface MockCondition {
  match: {
    params?: Record<string, unknown>;
    query?: Record<string, unknown>;
    body?: Record<string, unknown>;
  };
  response: MockResponse;
}
```

---

## Real-time Simulation

```typescript
interface RealtimeSimulator {
  connections: SimulatedConnection[];
  start(): void;
  stop(): void;
  emit(event: string, data: unknown): void;
}

interface SimulatedConnection {
  type: 'websocket' | 'sse' | 'polling';
  url: string;

  // Event simulation
  events: SimulatedEvent[];

  // State binding
  stateBindings: Record<string, string>;  // event -> state path
}

interface SimulatedEvent {
  name: string;
  data: unknown | DataSchema;

  // Timing
  trigger: 'interval' | 'random' | 'manual';
  interval?: number;
  minDelay?: number;
  maxDelay?: number;
}

// Usage example
const chatSimulator: SimulatedConnection = {
  type: 'websocket',
  url: 'ws://mock/chat',
  events: [
    {
      name: 'new-message',
      data: {
        type: 'object',
        properties: {
          id: { type: 'string', generator: 'uuid' },
          text: { type: 'string', generator: 'sentence' },
          user: { type: 'string', generator: 'name' },
          timestamp: { type: 'date' }
        }
      },
      trigger: 'random',
      minDelay: 3000,
      maxDelay: 10000
    }
  ],
  stateBindings: {
    'new-message': 'chat.messages'  // Appends to array
  }
};
```

---

## Export & Hosting

### Bundle Generation

```typescript
interface BundleConfig {
  format: 'standalone' | 'react' | 'vue' | 'vanilla';

  // Standalone: Single HTML file with embedded JS/CSS
  standalone?: {
    inlineAssets: boolean;
    minify: boolean;
  };

  // Framework export
  framework?: {
    componentLibrary: 'antd' | 'material-ui' | 'chakra' | 'tailwind';
    typescript: boolean;
    stateManagement: 'zustand' | 'redux' | 'context';
  };
}

interface ExportedBundle {
  files: ExportedFile[];
  entryPoint: string;
  dependencies: Record<string, string>;
}

interface ExportedFile {
  path: string;
  content: string;
  type: 'html' | 'js' | 'css' | 'json' | 'asset';
}
```

### Hosting Service

```typescript
interface HostingConfig {
  // Access control
  access: 'public' | 'password' | 'email-gate' | 'team-only';
  password?: string;
  allowedEmails?: string[];

  // Analytics
  analytics: {
    trackClicks: boolean;
    trackScrolls: boolean;
    trackForms: boolean;
    heatmaps: boolean;
  };

  // Collaboration
  collaboration: {
    comments: boolean;
    reactions: boolean;
    cursors: boolean;  // Show other viewers
  };

  // Custom domain
  customDomain?: string;
}
```

---

## Hybrid Approach Integration

This Visual Builder works alongside the Injection Engine:

```
┌─────────────────────────────────────────────────────────────────┐
│                    VOXEL PROTOTYPING SYSTEM                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CAPTURED HTML ──┬──▶ APPROACH B (Injection Engine)             │
│                  │    - Quick prototypes                         │
│                  │    - Preserves exact design                   │
│                  │    - Simple interactions                      │
│                  │                                               │
│                  └──▶ APPROACH E (Visual Builder)               │
│                       - Complex interactions                     │
│                       - Drag-and-drop                           │
│                       - Canvas elements                         │
│                       - Custom state logic                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   USER CHOICE                            │    │
│  │                                                          │    │
│  │   "Quick Prototype" ──▶ Injection Engine                │    │
│  │   "Full Builder"    ──▶ Visual Builder                  │    │
│  │   "Hybrid"          ──▶ Start with injection,           │    │
│  │                         upgrade sections to builder      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Hybrid Workflow

1. **Start with Injection Engine** (Approach B)
   - Fast initial prototype
   - Works on entire captured screen
   - Basic interactions work immediately

2. **Identify Complex Sections**
   - User or AI identifies sections needing advanced features
   - Examples: Kanban board, data visualization, drag-drop list

3. **Extract to Visual Builder**
   - Selected sections become components in the builder
   - Full control over interactions and state
   - Can add canvas elements, custom animations

4. **Re-integrate**
   - Enhanced components are re-embedded into the prototype
   - Seamless transition between approaches

---

## Implementation Phases

### Phase 1: Component Extraction (Week 1-2)
- [ ] Build component extractor from captured HTML
- [ ] Create component library UI with thumbnails
- [ ] Implement component prop and slot detection
- [ ] Store extracted components in Supabase

### Phase 2: Visual Canvas (Week 3-4)
- [ ] Implement canvas renderer with layers
- [ ] Build node selection and transform controls
- [ ] Add zoom, pan, and grid snapping
- [ ] Create property inspector panel

### Phase 3: Drag & Drop (Week 5)
- [ ] Implement drag source handlers
- [ ] Create drop zone detection
- [ ] Build drag preview rendering
- [ ] Add drop indicators and validation

### Phase 4: Interaction System (Week 6-7)
- [ ] Build interaction trigger system
- [ ] Implement action executors
- [ ] Create state machine runner
- [ ] Add visual interaction editor

### Phase 5: Canvas Elements (Week 8)
- [ ] Integrate chart library (Recharts)
- [ ] Add drawing tool with canvas
- [ ] Support Lottie/Rive animations
- [ ] Create custom canvas element API

### Phase 6: Mock Data & APIs (Week 9)
- [ ] Build mock data generator with faker
- [ ] Create API mocking layer
- [ ] Add real-time simulation
- [ ] Implement data binding system

### Phase 7: Export & Hosting (Week 10)
- [ ] Build standalone HTML exporter
- [ ] Create React component exporter
- [ ] Set up hosting infrastructure
- [ ] Add analytics and collaboration

---

## Technology Choices

| Feature | Technology | Rationale |
|---------|------------|-----------|
| Canvas Rendering | React + HTML/CSS | Familiar, good performance |
| Drag & Drop | @dnd-kit/core | Modern, accessible, flexible |
| State Machine | XState | Industry standard, visual editor |
| Charts | Recharts | React-native, composable |
| Animations | Framer Motion | Declarative, performant |
| Drawing | Perfect Freehand | Pressure-sensitive, smooth |
| Mock Data | @faker-js/faker | Comprehensive, localized |
| Code Editor | Monaco Editor | VSCode-based, full featured |

---

## Comparison: Approach B vs E

| Aspect | Approach B (Injection) | Approach E (Visual Builder) |
|--------|------------------------|----------------------------|
| **Speed** | Fast (seconds) | Slower (manual building) |
| **Fidelity** | Exact match | Approximation |
| **Complexity** | Simple interactions | Any complexity |
| **Drag-Drop** | Limited | Full support |
| **Canvas** | Not supported | Full support |
| **Learning Curve** | Low | Higher |
| **Use Case** | Quick prototypes | Production-quality demos |

---

## Next Steps

1. Review this spec with the team
2. Create POC for component extraction
3. Build basic canvas with drag-drop
4. Test integration with Injection Engine
5. Iterate based on user feedback
