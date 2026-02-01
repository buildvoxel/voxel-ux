import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UXGuideline, UXGuidelinesSet } from '@/types/models';

export type ContextType = 'text' | 'pdf' | 'video' | 'url' | 'image';

export interface ProductContext {
  id: string;
  type: ContextType;
  name: string;
  content: string; // For text, this is the actual content. For files, it's a data URL or path
  description?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    fileSize?: number;
    mimeType?: string;
    duration?: number; // For videos
    pageCount?: number; // For PDFs
    url?: string; // Original URL for url type
  };
  tags?: string[];
}

interface ContextState {
  contexts: ProductContext[];
  selectedContextIds: string[]; // Which contexts are active for AI

  // UX Guidelines
  uxGuidelinesSet: UXGuidelinesSet | null;
  uxGuidelinesEnabled: boolean;

  // Actions
  addContext: (context: Omit<ProductContext, 'id' | 'createdAt' | 'updatedAt'>) => ProductContext;
  updateContext: (id: string, updates: Partial<ProductContext>) => void;
  deleteContext: (id: string) => void;

  toggleContextSelection: (id: string) => void;
  selectAllContexts: () => void;
  deselectAllContexts: () => void;

  getSelectedContexts: () => ProductContext[];
  getContextsByType: (type: ContextType) => ProductContext[];

  // UX Guidelines actions
  setUXGuidelines: (guidelines: UXGuidelinesSet) => void;
  clearUXGuidelines: () => void;
  toggleUXGuidelinesEnabled: () => void;
  addUXGuideline: (guideline: Omit<UXGuideline, 'id'>) => void;
  updateUXGuideline: (id: string, updates: Partial<UXGuideline>) => void;
  deleteUXGuideline: (id: string) => void;

  // Get combined context for AI prompt
  getAIContextPrompt: () => string;

  // Get UX guidelines formatted for AI prompt
  getUXGuidelinesPrompt: () => string;
}

export const useContextStore = create<ContextState>()(
  persist(
    (set, get) => ({
      contexts: [],
      selectedContextIds: [],
      uxGuidelinesSet: null,
      uxGuidelinesEnabled: true,

      addContext: (contextData) => {
        const now = new Date().toISOString();
        const context: ProductContext = {
          ...contextData,
          id: `ctx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          contexts: [...state.contexts, context],
          selectedContextIds: [...state.selectedContextIds, context.id],
        }));

        return context;
      },

      updateContext: (id, updates) => {
        set((state) => ({
          contexts: state.contexts.map((ctx) =>
            ctx.id === id
              ? { ...ctx, ...updates, updatedAt: new Date().toISOString() }
              : ctx
          ),
        }));
      },

      deleteContext: (id) => {
        set((state) => ({
          contexts: state.contexts.filter((ctx) => ctx.id !== id),
          selectedContextIds: state.selectedContextIds.filter((cid) => cid !== id),
        }));
      },

      toggleContextSelection: (id) => {
        set((state) => ({
          selectedContextIds: state.selectedContextIds.includes(id)
            ? state.selectedContextIds.filter((cid) => cid !== id)
            : [...state.selectedContextIds, id],
        }));
      },

      selectAllContexts: () => {
        set((state) => ({
          selectedContextIds: state.contexts.map((ctx) => ctx.id),
        }));
      },

      deselectAllContexts: () => {
        set({ selectedContextIds: [] });
      },

      getSelectedContexts: () => {
        const state = get();
        return state.contexts.filter((ctx) =>
          state.selectedContextIds.includes(ctx.id)
        );
      },

      getContextsByType: (type) => {
        return get().contexts.filter((ctx) => ctx.type === type);
      },

      getAIContextPrompt: () => {
        const selectedContexts = get().getSelectedContexts();
        if (selectedContexts.length === 0) return '';

        const contextParts = selectedContexts.map((ctx) => {
          switch (ctx.type) {
            case 'text':
              return `### ${ctx.name}\n${ctx.content}`;
            case 'url':
              return `### Reference: ${ctx.name}\nURL: ${ctx.metadata?.url}\n${ctx.content}`;
            case 'pdf':
              return `### Document: ${ctx.name}\n${ctx.content}`;
            case 'video':
              return `### Video Notes: ${ctx.name}\n${ctx.content}`;
            case 'image':
              return `### Image Reference: ${ctx.name}\n${ctx.description || 'Visual reference'}`;
            default:
              return `### ${ctx.name}\n${ctx.content}`;
          }
        });

        return `## Product Context\n\n${contextParts.join('\n\n---\n\n')}`;
      },

      // UX Guidelines actions
      setUXGuidelines: (guidelines) => {
        set({ uxGuidelinesSet: guidelines });
      },

      clearUXGuidelines: () => {
        set({ uxGuidelinesSet: null });
      },

      toggleUXGuidelinesEnabled: () => {
        set((state) => ({ uxGuidelinesEnabled: !state.uxGuidelinesEnabled }));
      },

      addUXGuideline: (guidelineData) => {
        const state = get();
        if (!state.uxGuidelinesSet) return;

        const newGuideline: UXGuideline = {
          ...guidelineData,
          id: `uxg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        set({
          uxGuidelinesSet: {
            ...state.uxGuidelinesSet,
            guidelines: [...state.uxGuidelinesSet.guidelines, newGuideline],
            updatedAt: new Date().toISOString(),
          },
        });
      },

      updateUXGuideline: (id, updates) => {
        const state = get();
        if (!state.uxGuidelinesSet) return;

        set({
          uxGuidelinesSet: {
            ...state.uxGuidelinesSet,
            guidelines: state.uxGuidelinesSet.guidelines.map((g) =>
              g.id === id ? { ...g, ...updates } : g
            ),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      deleteUXGuideline: (id) => {
        const state = get();
        if (!state.uxGuidelinesSet) return;

        set({
          uxGuidelinesSet: {
            ...state.uxGuidelinesSet,
            guidelines: state.uxGuidelinesSet.guidelines.filter((g) => g.id !== id),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      getUXGuidelinesPrompt: () => {
        const state = get();
        if (!state.uxGuidelinesSet || !state.uxGuidelinesEnabled) return '';
        if (state.uxGuidelinesSet.guidelines.length === 0) return '';

        const categoryLabels: Record<string, string> = {
          navigation: 'Navigation Patterns',
          interaction: 'Interaction Patterns',
          feedback: 'Feedback & States',
          layout: 'Layout Conventions',
          content: 'Content & Microcopy',
          accessibility: 'Accessibility',
          flow: 'User Flows',
        };

        // Group guidelines by category
        const byCategory = state.uxGuidelinesSet.guidelines.reduce(
          (acc, guideline) => {
            if (!acc[guideline.category]) {
              acc[guideline.category] = [];
            }
            acc[guideline.category].push(guideline);
            return acc;
          },
          {} as Record<string, typeof state.uxGuidelinesSet.guidelines>
        );

        let prompt = `## UX Guidelines\n`;
        prompt += `Follow these established UX patterns when generating the prototype:\n\n`;

        for (const [category, guidelines] of Object.entries(byCategory)) {
          prompt += `### ${categoryLabels[category] || category}\n`;
          for (const g of guidelines) {
            prompt += `- **${g.title}**: ${g.description}`;
            if (g.examples && g.examples.length > 0) {
              prompt += ` (e.g., ${g.examples.slice(0, 2).join(', ')})`;
            }
            prompt += '\n';
          }
          prompt += '\n';
        }

        return prompt;
      },
    }),
    {
      name: 'voxel-context-storage',
      partialize: (state) => ({
        contexts: state.contexts,
        selectedContextIds: state.selectedContextIds,
        uxGuidelinesSet: state.uxGuidelinesSet,
        uxGuidelinesEnabled: state.uxGuidelinesEnabled,
      }),
    }
  )
);

// Helper function to get icon for context type
export const getContextTypeIcon = (type: ContextType): string => {
  switch (type) {
    case 'text': return 'file-text';
    case 'pdf': return 'file-pdf';
    case 'video': return 'video-camera';
    case 'url': return 'link';
    case 'image': return 'picture';
    default: return 'file';
  }
};

// Helper function to get color for context type
export const getContextTypeColor = (type: ContextType): string => {
  switch (type) {
    case 'text': return '#1890ff';
    case 'pdf': return '#f5222d';
    case 'video': return '#722ed1';
    case 'url': return '#13c2c2';
    case 'image': return '#52c41a';
    default: return '#999';
  }
};
