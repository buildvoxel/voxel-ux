import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  extractComponentsFromMultipleScreens,
  type ExtractedComponentLLM,
  type ComponentCategory,
  type ComponentVariant,
  type ExtractionProgress,
  CATEGORY_INFO,
} from '@/services/componentExtractionService';

export interface ExtractedComponent {
  id: string;
  name: string;
  category: string;
  description: string;
  sourceScreen: string;
  sourceScreenIds: string[];
  extractedAt: string;
  tags: string[];
  html: string;
  css: string;
  occurrences: number;
  variants?: ComponentVariant[];
  props?: string[];
  generatedBy: 'dom-parser' | 'llm';
}

interface ComponentsState {
  components: ExtractedComponent[];
  selectedComponent: ExtractedComponent | null;
  selectedVariant: string | null; // variant name for detail view
  searchQuery: string;
  selectedCategory: string | null;
  selectedTags: string[];
  isExtracting: boolean;
  extractionProgress: ExtractionProgress | null;
  lastExtractionTime: string | null;
  lastExtractionProvider: string | null;
  lastExtractionModel: string | null;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  toggleTag: (tag: string) => void;
  clearFilters: () => void;
  selectComponent: (component: ExtractedComponent | null) => void;
  selectVariant: (variantName: string | null) => void;
  extractWithLLM: (
    screens: Array<{ id: string; name: string; editedHtml?: string }>,
    options?: {
      provider?: 'anthropic' | 'openai' | 'google';
      model?: string;
    }
  ) => Promise<{
    extractedCount: number;
    totalScreens: number;
    failedScreens: number;
    errors: Array<{ screenId: string; error: string }>;
  } | undefined>;
  clearComponents: () => void;
}

// Convert LLM extracted component to store component
function convertLLMComponent(comp: ExtractedComponentLLM): ExtractedComponent {
  return {
    id: comp.id,
    name: comp.name,
    category: comp.category,
    description: comp.description,
    sourceScreen: comp.sourceScreenIds[0] || 'unknown',
    sourceScreenIds: comp.sourceScreenIds,
    extractedAt: comp.extractedAt,
    tags: generateTags(comp),
    html: comp.html,
    css: comp.css,
    occurrences: comp.occurrences,
    variants: comp.variants,
    props: comp.props,
    generatedBy: 'llm',
  };
}

// Generate tags from component metadata
function generateTags(comp: ExtractedComponentLLM): string[] {
  const tags: string[] = [];

  // Add category as tag
  const categoryInfo = CATEGORY_INFO[comp.category as ComponentCategory];
  if (categoryInfo) {
    tags.push(categoryInfo.label.toLowerCase());
  }

  // Add occurrence-based tags
  if (comp.occurrences > 3) {
    tags.push('frequently-used');
  }
  if (comp.occurrences === 1) {
    tags.push('unique');
  }

  // Add variant-based tags
  if (comp.variants && comp.variants.length > 0) {
    tags.push('has-variants');
    comp.variants.forEach((v) => {
      if (v.name.toLowerCase().includes('hover')) tags.push('interactive');
      if (v.name.toLowerCase().includes('disabled')) tags.push('has-disabled');
    });
  }

  // Add props-based tags
  if (comp.props && comp.props.length > 0) {
    tags.push('customizable');
  }

  // Limit to 5 unique tags
  return [...new Set(tags)].slice(0, 5);
}

export const useComponentsStore = create<ComponentsState>()(
  persist(
    (set) => ({
      components: [],
      selectedComponent: null,
      selectedVariant: null,
      searchQuery: '',
      selectedCategory: null,
      selectedTags: [],
      isExtracting: false,
      extractionProgress: null,
      lastExtractionTime: null,
      lastExtractionProvider: null,
      lastExtractionModel: null,

      setSearchQuery: (query) => set({ searchQuery: query }),

      setSelectedCategory: (category) => set({ selectedCategory: category }),

      toggleTag: (tag) =>
        set((state) => ({
          selectedTags: state.selectedTags.includes(tag)
            ? state.selectedTags.filter((t) => t !== tag)
            : [...state.selectedTags, tag],
        })),

      clearFilters: () =>
        set({
          searchQuery: '',
          selectedCategory: null,
          selectedTags: [],
        }),

      selectComponent: (component) =>
        set({ selectedComponent: component, selectedVariant: null }),

      selectVariant: (variantName) => set({ selectedVariant: variantName }),

      extractWithLLM: async (screens, options) => {
        set({ isExtracting: true, extractionProgress: null });

        try {
          // Filter screens with HTML content
          const screensWithHtml = screens
            .filter((s) => s.editedHtml)
            .map((s) => ({
              id: s.id,
              html: s.editedHtml!,
              name: s.name,
            }));

          if (screensWithHtml.length === 0) {
            set({
              components: [],
              isExtracting: false,
              extractionProgress: null,
              lastExtractionTime: new Date().toISOString(),
            });
            return {
              extractedCount: 0,
              totalScreens: 0,
              failedScreens: 0,
              errors: [],
            };
          }

          // Extract components with progress tracking
          const result = await extractComponentsFromMultipleScreens(
            screensWithHtml,
            {
              provider: options?.provider,
              model: options?.model,
              onProgress: (progress) => {
                set({ extractionProgress: progress });
              },
            }
          );

          // Convert to store format
          const components = result.components.map(convertLLMComponent);

          set({
            components,
            isExtracting: false,
            extractionProgress: null,
            lastExtractionTime: new Date().toISOString(),
          });

          // Log any errors and return result for caller to handle
          if (result.errors.length > 0) {
            console.warn('[ComponentsStore] Some screens failed:', result.errors);
          }

          return {
            extractedCount: components.length,
            totalScreens: screensWithHtml.length,
            failedScreens: result.errors.length,
            errors: result.errors,
          };
        } catch (error) {
          console.error('[ComponentsStore] Error extracting components:', error);
          set({
            isExtracting: false,
            extractionProgress: null,
          });
          throw error;
        }
      },

      clearComponents: () =>
        set({
          components: [],
          lastExtractionTime: null,
          lastExtractionProvider: null,
          lastExtractionModel: null,
        }),
    }),
    {
      name: 'voxel-components-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        components: state.components,
        lastExtractionTime: state.lastExtractionTime,
        lastExtractionProvider: state.lastExtractionProvider,
        lastExtractionModel: state.lastExtractionModel,
      }),
    }
  )
);

// Helper to get categories from components
export const getCategories = (components: ExtractedComponent[]): string[] => {
  return [...new Set(components.map((c) => c.category))].sort();
};

// Helper to get all tags from components
export const getAllTags = (components: ExtractedComponent[]): string[] => {
  return [...new Set(components.flatMap((c) => c.tags))].sort();
};

// Re-export types and constants
export type { ExtractedComponentLLM, ComponentCategory, ComponentVariant };
export { CATEGORY_INFO };
