import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  extractComponentsFromScreens,
  type ExtractedComponent as ServiceComponent,
  type ComponentCategory,
  CATEGORY_INFO,
} from '@/services/componentExtractorService';

export interface ExtractedComponent {
  id: string;
  name: string;
  category: string;
  sourceScreen: string;
  sourceScreenIds: string[];
  extractedAt: string;
  tags: string[];
  html: string;
  css: string;
  occurrences: number;
}

interface ComponentsState {
  components: ExtractedComponent[];
  selectedComponent: ExtractedComponent | null;
  searchQuery: string;
  selectedCategory: string | null;
  selectedTags: string[];
  isExtracting: boolean;
  lastExtractionTime: string | null;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  toggleTag: (tag: string) => void;
  clearFilters: () => void;
  selectComponent: (component: ExtractedComponent | null) => void;
  extractFromScreens: (screens: Array<{ id: string; editedHtml?: string; name: string }>) => Promise<void>;
  clearComponents: () => void;
}

// Convert service component to store component
function convertComponent(comp: ServiceComponent): ExtractedComponent {
  return {
    id: comp.id,
    name: comp.name,
    category: comp.category,
    sourceScreen: comp.sourceScreenIds[0] || 'unknown',
    sourceScreenIds: comp.sourceScreenIds,
    extractedAt: new Date().toISOString(),
    tags: generateTags(comp),
    html: comp.html,
    css: comp.styles,
    occurrences: comp.occurrences,
  };
}

// Generate tags from component metadata
function generateTags(comp: ServiceComponent): string[] {
  const tags: string[] = [];

  // Add category as tag
  const categoryInfo = CATEGORY_INFO[comp.category as ComponentCategory];
  if (categoryInfo) {
    tags.push(categoryInfo.label.toLowerCase());
  }

  // Add occurrence-based tags
  if (comp.occurrences > 5) {
    tags.push('frequently-used');
  }
  if (comp.occurrences === 1) {
    tags.push('unique');
  }

  // Add attribute-based tags
  if (comp.attributes.class) {
    const classes = comp.attributes.class.split(' ').slice(0, 3);
    classes.forEach(cls => {
      if (cls.length > 2 && cls.length < 20) {
        tags.push(cls);
      }
    });
  }

  // Add type-based tags for inputs
  if (comp.attributes.type) {
    tags.push(comp.attributes.type);
  }

  // Limit to 5 tags
  return [...new Set(tags)].slice(0, 5);
}

export const useComponentsStore = create<ComponentsState>()(
  persist(
    (set) => ({
      components: [],
      selectedComponent: null,
      searchQuery: '',
      selectedCategory: null,
      selectedTags: [],
      isExtracting: false,
      lastExtractionTime: null,

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

      selectComponent: (component) => set({ selectedComponent: component }),

      extractFromScreens: async (screens) => {
        set({ isExtracting: true });

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
              lastExtractionTime: new Date().toISOString(),
            });
            return;
          }

          // Extract components
          const extracted = extractComponentsFromScreens(screensWithHtml);

          // Convert to store format
          const components = extracted.map(convertComponent);

          set({
            components,
            isExtracting: false,
            lastExtractionTime: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error extracting components:', error);
          set({ isExtracting: false });
        }
      },

      clearComponents: () =>
        set({
          components: [],
          lastExtractionTime: null,
        }),
    }),
    {
      name: 'voxel-components-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        components: state.components,
        lastExtractionTime: state.lastExtractionTime,
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
