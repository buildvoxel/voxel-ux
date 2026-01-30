# Voxel - Product Requirements Document (PRD)

## Product Overview

**Product Name**: Voxel
**Version**: 1.0 (Current State)
**Last Updated**: January 2026

### Vision
Voxel is an AI-powered prototyping platform that transforms how product teams create and iterate on UI designs. By capturing existing web interfaces and using AI to generate design variants, Voxel dramatically accelerates the prototyping process.

### Target Users
- Product Designers
- UX Designers
- Product Managers
- Frontend Developers
- Design System Teams

---

## Current Features

### 1. Screen Capture & Repository

**Description**: Import and manage captured web page screenshots as the source for AI prototyping.

**Capabilities**:
- Upload HTML captures from SingleFile browser extension
- Store screens with metadata (URL, name, date)
- Generate and display thumbnails
- Edit captured HTML before prototyping
- Organize screens in a visual repository
- Search and filter screens

**User Flow**:
1. User captures web page using SingleFile extension
2. User uploads HTML file to Voxel repository
3. System generates thumbnail preview
4. User can rename, tag, or edit the screen
5. Screen is ready for AI prototyping

**Status**: ✅ Implemented

---

### 2. AI Prototyping (Vibe Prototyping)

**Description**: The core feature that generates design variants from captured screens using AI.

**Capabilities**:
- Natural language prompts for design direction
- AI analyzes existing screen structure
- Generates 4 distinct design paradigms:
  - **Conservative**: Minimal changes, preserves existing design
  - **Modern**: Contemporary UI patterns and aesthetics
  - **Bold**: Dramatic redesign with strong visual changes
  - **Alternative**: Creative exploration of different approaches
- Real-time streaming of code generation
- Side-by-side variant comparison
- Select winning variant

**User Flow**:
1. User selects a screen from repository
2. User enters design prompt (e.g., "Make it more modern and minimalist")
3. System displays phase progress:
   - Understanding (analyzing screen)
   - Planning (generating 4 paradigms)
   - Wireframing (creating layout sketches)
   - Building (generating HTML code)
4. User reviews 4 variant cards with descriptions
5. User approves plan to generate full prototypes
6. System streams HTML generation in real-time
7. User compares variants side-by-side
8. User selects winning variant

**Status**: ✅ Implemented

---

### 3. Code Editor

**Description**: Dual-mode editor for viewing and modifying generated HTML.

**Capabilities**:
- **Tree View**: DOM-style hierarchical view of HTML
  - Expandable/collapsible nodes
  - Inline text editing
  - Node selection highlighting
- **Code View**: Full Monaco editor
  - Syntax highlighting
  - Line numbers
  - Search and replace
  - Code folding
- Seamless switching between views
- Changes sync between views
- Save edited HTML back to variant

**User Flow**:
1. User clicks "Edit" on a variant
2. Editor opens with HTML content
3. User toggles between Tree/Code view
4. User makes edits
5. User saves changes
6. Preview updates with new HTML

**Status**: ✅ Implemented

---

### 4. Variant Iteration

**Description**: Refine generated variants with follow-up prompts.

**Capabilities**:
- Enter refinement prompt for specific variant
- AI modifies HTML based on feedback
- Track iteration history
- Revert to previous iterations
- Iteration count displayed per variant

**User Flow**:
1. User selects a variant
2. User clicks "Iterate" button
3. User enters refinement prompt (e.g., "Make the header sticky")
4. System generates updated HTML
5. Preview updates immediately
6. User can view iteration history
7. User can revert to any previous version

**Status**: ✅ Implemented

---

### 5. Variant Comparison

**Description**: Compare generated variants to select the best option.

**Capabilities**:
- Grid view (2x2 layout)
- Split view (side-by-side)
- Carousel view (full-width scrolling)
- Interactive iframe previews
- Variant metadata display
- Winner selection

**User Flow**:
1. After code generation completes
2. User views all 4 variants in grid
3. User can switch comparison modes
4. User clicks on variant for full preview
5. User selects winning variant
6. Winner is saved to session

**Status**: ✅ Implemented

---

### 6. Screen Preview

**Description**: Full-screen preview of screens and variants.

**Capabilities**:
- Responsive iframe embedding
- Zoom controls
- Original vs. edited toggle
- Share preview link (planned)

**Status**: ✅ Implemented

---

### 7. Theme Support

**Description**: Multiple visual themes for the application.

**Capabilities**:
- **Craftsman Mode**: Warm, woodgrain-inspired aesthetic
- **Modern Mode**: Clean, teal-accented interface
- Theme affects all UI components
- Persisted preference

**Status**: ✅ Implemented

---

## Feature Status Summary

| Feature | Status | Priority |
|---------|--------|----------|
| Screen Repository | ✅ Complete | P0 |
| AI Prototyping | ✅ Complete | P0 |
| Dual-Mode Editor | ✅ Complete | P0 |
| Variant Iteration | ✅ Complete | P1 |
| Streaming Generation | ✅ Complete | P1 |
| Variant Comparison | ✅ Complete | P0 |
| Screen Preview | ✅ Complete | P1 |
| Theme Support | ✅ Complete | P2 |
| Component Library | 🔄 Partial | P2 |
| Product Context | 🔄 Partial | P2 |
| Analytics Dashboard | 📋 Planned | P3 |
| Multiplayer Collaboration | 📋 Planned | P3 |
| Export to Figma/Code | 📋 Planned | P3 |

---

## User Journeys

### Journey 1: First-Time Prototyping

**Persona**: Sarah, Product Designer

**Goal**: Create modern variants of an existing dashboard

**Steps**:
1. Sarah captures her company's analytics dashboard using SingleFile
2. She uploads the HTML to Voxel's repository
3. She clicks "Prototype with AI" on the screen
4. She enters: "Modernize this dashboard with a cleaner layout and better data visualization hierarchy"
5. She watches the AI analyze and plan 4 variants
6. She reviews the Conservative, Modern, Bold, and Alternative approaches
7. She approves the plan and watches code stream in real-time
8. She compares all 4 variants in grid view
9. She selects the "Modern" variant as the winner
10. She iterates with: "Add more whitespace between sections"
11. Final result is ready for stakeholder review

---

### Journey 2: Design Iteration

**Persona**: Marcus, UX Designer

**Goal**: Refine a generated variant based on feedback

**Steps**:
1. Marcus opens a previous prototyping session
2. He views the 4 generated variants
3. Stakeholders prefer Variant 3 but want changes
4. Marcus clicks "Iterate" on Variant 3
5. He enters: "Make the CTA buttons more prominent with a gradient background"
6. AI generates updated HTML
7. Marcus reviews the change
8. He iterates again: "Add subtle hover animations to the cards"
9. He's satisfied with version 3 of the iteration
10. He shares the final preview link

---

### Journey 3: Code Customization

**Persona**: Alex, Frontend Developer

**Goal**: Fine-tune generated HTML before implementation

**Steps**:
1. Alex opens a selected variant in the editor
2. He switches to Code View for full control
3. He adds custom CSS classes for their design system
4. He modifies responsive breakpoints
5. He switches to Tree View to verify structure
6. He saves changes
7. Preview updates with modifications
8. He copies the final HTML for implementation

---

## Technical Requirements

### Performance
- Page load time: < 2 seconds
- AI response (plan generation): < 15 seconds
- Code streaming: First chunk within 3 seconds
- Editor responsiveness: < 100ms for interactions

### Browser Support
- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

### Accessibility
- WCAG 2.1 AA compliance (target)
- Keyboard navigation
- Screen reader compatibility
- Color contrast ratios

### Security
- User authentication required
- Data isolation per user
- No storage of API keys in frontend
- Secure file uploads

---

## Data Models

### Screen
```typescript
interface Screen {
  id: string;
  userId: string;
  name: string;
  url: string;
  html: string;
  editedHtml?: string;
  thumbnailUrl?: string;
  metadata: {
    capturedAt: Date;
    viewport: { width: number; height: number };
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### VibeSession
```typescript
interface VibeSession {
  id: string;
  userId: string;
  screenId: string;
  name: string;
  prompt: string;
  status: 'pending' | 'planning' | 'plan_ready' |
          'wireframing' | 'generating' | 'complete' | 'failed';
  planApproved: boolean;
  selectedVariantIndex: number | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### VariantPlan
```typescript
interface VariantPlan {
  id: string;
  sessionId: string;
  variantIndex: 1 | 2 | 3 | 4;
  title: string;           // e.g., "Conservative", "Modern"
  description: string;
  keyChanges: string[];
  styleNotes: string | null;
  wireframeText: string | null;
  createdAt: Date;
}
```

### VibeVariant
```typescript
interface VibeVariant {
  id: string;
  sessionId: string;
  planId: string;
  variantIndex: number;
  htmlPath: string;
  htmlUrl: string;
  cssPath: string | null;
  cssUrl: string | null;
  screenshotPath: string | null;
  screenshotUrl: string | null;
  generationModel: string;
  generationDurationMs: number;
  tokenCount: number | null;
  status: 'pending' | 'generating' | 'capturing' | 'complete' | 'failed';
  errorMessage: string | null;
  iterationCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### VibeIteration
```typescript
interface VibeIteration {
  id: string;
  variantId: string;
  sessionId: string;
  variantIndex: number;
  iterationNumber: number;
  prompt: string;
  htmlBefore: string;
  htmlAfter: string;
  generationModel: string | null;
  generationDurationMs: number | null;
  createdAt: Date;
}
```

---

## Planned Features (Roadmap)

### Phase 2: Collaboration
- [ ] Share prototypes via public links
- [ ] Comment on specific elements
- [ ] Real-time multiplayer editing
- [ ] Team workspaces

### Phase 3: Export & Integration
- [ ] Export to Figma
- [ ] Export to React components
- [ ] Export to Vue components
- [ ] Design token extraction
- [ ] CSS-in-JS output

### Phase 4: Advanced AI
- [ ] Image-based input (screenshot → prototype)
- [ ] Voice-guided prototyping
- [ ] Brand guideline enforcement
- [ ] Accessibility auto-improvements
- [ ] A/B test suggestions

### Phase 5: Analytics
- [ ] Prototype engagement tracking
- [ ] Heatmaps on shared prototypes
- [ ] Variant performance comparison
- [ ] User feedback collection

---

## Success Metrics

### Adoption
- Daily active users
- Screens captured per user
- Prototyping sessions per week

### Engagement
- Average variants generated per session
- Iteration count per variant
- Time from prompt to selection

### Quality
- Variant selection rate (how often users find a suitable variant)
- Iteration satisfaction (do iterations improve the design)
- Error rate in generation

### Performance
- Time to first variant preview
- Streaming latency
- Editor save success rate

---

## Glossary

| Term | Definition |
|------|------------|
| Screen | A captured web page HTML file |
| Vibe Session | A single prototyping workflow from prompt to selection |
| Variant | One of 4 generated design alternatives |
| Plan | The AI's proposed approach for a variant |
| Wireframe | Text description of layout structure |
| Iteration | A refinement cycle on a specific variant |
| Conservative | Variant 1: Minimal changes to original |
| Modern | Variant 2: Contemporary design patterns |
| Bold | Variant 3: Dramatic visual redesign |
| Alternative | Variant 4: Creative exploration |

---

## Appendix: LLM Prompt Patterns

### Plan Generation Prompt (Summary)
```
Given a user's design request and existing HTML, generate 4 distinct
design paradigms:
1. Conservative - preserve essence, subtle improvements
2. Modern - contemporary patterns, fresh aesthetics
3. Bold - dramatic transformation, strong visual impact
4. Alternative - unexpected direction, creative exploration

For each, provide: title, description, key changes, style notes.
```

### Code Generation Prompt (Summary)
```
Transform the source HTML according to the approved plan.
Maintain structural integrity while applying specified changes.
Output complete, valid HTML with inline styles.
Preserve responsive behavior and accessibility.
```

### Iteration Prompt (Summary)
```
Given current HTML and user feedback, modify the design.
Apply specific changes requested while maintaining overall coherence.
Return updated HTML only.
```
