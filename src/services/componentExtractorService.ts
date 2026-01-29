/**
 * Component Extractor Service
 * Automatically extracts reusable UI components from captured HTML screens
 */

export interface ExtractedComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  html: string;
  styles: string;
  selector: string;
  occurrences: number;
  sourceScreenIds: string[];
  preview?: string;
  attributes: Record<string, string>;
  dimensions?: { width: number; height: number };
}

export type ComponentCategory =
  | 'button'
  | 'input'
  | 'form'
  | 'card'
  | 'navigation'
  | 'header'
  | 'footer'
  | 'list'
  | 'modal'
  | 'image'
  | 'icon'
  | 'link'
  | 'table'
  | 'other';

interface ComponentPattern {
  category: ComponentCategory;
  selectors: string[];
  nameExtractor: (el: Element) => string;
  validator?: (el: Element) => boolean;
}

// Define patterns for identifying components
const COMPONENT_PATTERNS: ComponentPattern[] = [
  {
    category: 'button',
    selectors: [
      'button',
      '[role="button"]',
      'a.btn',
      'a.button',
      '.btn',
      '.button',
      'input[type="submit"]',
      'input[type="button"]',
    ],
    nameExtractor: (el) => {
      const text = el.textContent?.trim().slice(0, 30) || '';
      const ariaLabel = el.getAttribute('aria-label');
      const title = el.getAttribute('title');
      return ariaLabel || title || text || 'Button';
    },
    validator: (el) => {
      // Exclude very small or very large elements
      const rect = el.getBoundingClientRect?.();
      if (rect && (rect.width < 20 || rect.height < 20)) return false;
      return true;
    },
  },
  {
    category: 'input',
    selectors: [
      'input[type="text"]',
      'input[type="email"]',
      'input[type="password"]',
      'input[type="search"]',
      'input[type="tel"]',
      'input[type="url"]',
      'input[type="number"]',
      'textarea',
      'select',
      '[contenteditable="true"]',
    ],
    nameExtractor: (el) => {
      const label = el.getAttribute('aria-label') || el.getAttribute('placeholder');
      const name = el.getAttribute('name');
      const id = el.getAttribute('id');
      return label || name || id || 'Input Field';
    },
  },
  {
    category: 'form',
    selectors: ['form', '[role="form"]'],
    nameExtractor: (el) => {
      const name = el.getAttribute('name') || el.getAttribute('aria-label');
      const id = el.getAttribute('id');
      return name || id || 'Form';
    },
    validator: (el) => {
      // Forms should have at least one input
      return el.querySelectorAll('input, textarea, select').length > 0;
    },
  },
  {
    category: 'card',
    selectors: [
      '.card',
      '[class*="card"]',
      'article',
      '.panel',
      '.tile',
      '[class*="tile"]',
    ],
    nameExtractor: (el) => {
      const heading = el.querySelector('h1, h2, h3, h4, h5, h6');
      const title = heading?.textContent?.trim().slice(0, 30);
      return title || 'Card';
    },
    validator: (el) => {
      // Cards should have some content
      return el.children.length > 0 && el.textContent!.trim().length > 10;
    },
  },
  {
    category: 'navigation',
    selectors: ['nav', '[role="navigation"]', '.navbar', '.nav', '.menu', '.sidebar'],
    nameExtractor: (el) => {
      const label = el.getAttribute('aria-label');
      const className = el.className;
      if (className.includes('sidebar')) return 'Sidebar Navigation';
      if (className.includes('navbar') || className.includes('header')) return 'Header Navigation';
      if (className.includes('footer')) return 'Footer Navigation';
      return label || 'Navigation';
    },
  },
  {
    category: 'header',
    selectors: ['header', '[role="banner"]', '.header', '.page-header'],
    nameExtractor: () => 'Header',
  },
  {
    category: 'footer',
    selectors: ['footer', '[role="contentinfo"]', '.footer', '.page-footer'],
    nameExtractor: () => 'Footer',
  },
  {
    category: 'list',
    selectors: ['ul', 'ol', '[role="list"]', '.list', '[class*="list"]'],
    nameExtractor: (el) => {
      const itemCount = el.querySelectorAll('li, [role="listitem"]').length;
      return `List (${itemCount} items)`;
    },
    validator: (el) => {
      // Lists should have at least 2 items
      return el.querySelectorAll('li, [role="listitem"]').length >= 2;
    },
  },
  {
    category: 'modal',
    selectors: [
      '[role="dialog"]',
      '[role="alertdialog"]',
      '.modal',
      '.dialog',
      '[class*="modal"]',
      '[class*="dialog"]',
    ],
    nameExtractor: (el) => {
      const title = el.querySelector('[class*="title"], h1, h2, h3');
      return title?.textContent?.trim().slice(0, 30) || 'Modal';
    },
  },
  {
    category: 'table',
    selectors: ['table', '[role="table"]', '.table', '[class*="table"]'],
    nameExtractor: (el) => {
      const caption = el.querySelector('caption');
      return caption?.textContent?.trim() || 'Data Table';
    },
    validator: (el) => {
      // Tables should have at least one row
      return el.querySelectorAll('tr').length > 0;
    },
  },
  {
    category: 'image',
    selectors: ['img', 'picture', 'svg', '[role="img"]'],
    nameExtractor: (el) => {
      const alt = el.getAttribute('alt');
      const title = el.getAttribute('title');
      const ariaLabel = el.getAttribute('aria-label');
      return alt || title || ariaLabel || 'Image';
    },
    validator: (el) => {
      // Images should have reasonable size
      const width = parseInt(el.getAttribute('width') || '0');
      const height = parseInt(el.getAttribute('height') || '0');
      if (width > 0 && width < 16) return false;
      if (height > 0 && height < 16) return false;
      return true;
    },
  },
  {
    category: 'link',
    selectors: ['a[href]'],
    nameExtractor: (el) => {
      const text = el.textContent?.trim().slice(0, 30);
      const ariaLabel = el.getAttribute('aria-label');
      return ariaLabel || text || 'Link';
    },
    validator: (el) => {
      // Skip buttons styled as links
      if (el.classList.contains('btn') || el.classList.contains('button')) return false;
      // Skip empty links
      if (!el.textContent?.trim() && !el.querySelector('img, svg')) return false;
      return true;
    },
  },
];

/**
 * Extract inline styles from an element
 */
function extractInlineStyles(el: Element): string {
  const styleAttr = el.getAttribute('style');
  if (!styleAttr) return '';
  return styleAttr;
}

/**
 * Get computed styles as a string (for elements with class-based styling)
 */
function getRelevantStyles(el: Element): string {
  const styles: string[] = [];
  const inlineStyle = extractInlineStyles(el);
  if (inlineStyle) {
    styles.push(inlineStyle);
  }

  // Also check for common style classes to extract
  const classList = Array.from(el.classList);
  if (classList.length > 0) {
    styles.push(`/* Classes: ${classList.join(', ')} */`);
  }

  return styles.join('\n');
}

/**
 * Generate a unique component ID
 */
function generateComponentId(): string {
  return `comp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Get the outer HTML of an element with cleaned attributes
 */
function getCleanedHtml(el: Element): string {
  const clone = el.cloneNode(true) as Element;

  // Remove event handlers and data attributes we don't need
  const removeAttrs = ['onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur'];
  removeAttrs.forEach(attr => clone.removeAttribute(attr));

  // Clean up data attributes (keep some useful ones)
  Array.from(clone.attributes).forEach(attr => {
    if (attr.name.startsWith('data-') && !['data-testid', 'data-id'].includes(attr.name)) {
      clone.removeAttribute(attr.name);
    }
  });

  return clone.outerHTML;
}

/**
 * Extract components from a single HTML string
 */
export function extractComponentsFromHtml(
  html: string,
  screenId: string
): ExtractedComponent[] {
  const components: ExtractedComponent[] = [];
  const seenHtml = new Set<string>();

  // Parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Process each pattern
  COMPONENT_PATTERNS.forEach(pattern => {
    pattern.selectors.forEach(selector => {
      try {
        const elements = doc.querySelectorAll(selector);

        elements.forEach(el => {
          // Validate if validator exists
          if (pattern.validator && !pattern.validator(el)) return;

          const cleanedHtml = getCleanedHtml(el);

          // Skip duplicates within same screen
          const htmlHash = cleanedHtml.slice(0, 200); // Use first 200 chars as hash
          if (seenHtml.has(htmlHash)) return;
          seenHtml.add(htmlHash);

          const component: ExtractedComponent = {
            id: generateComponentId(),
            name: pattern.nameExtractor(el),
            category: pattern.category,
            html: cleanedHtml,
            styles: getRelevantStyles(el),
            selector: selector,
            occurrences: 1,
            sourceScreenIds: [screenId],
            attributes: {},
          };

          // Extract useful attributes
          ['class', 'id', 'role', 'type', 'href'].forEach(attr => {
            const value = el.getAttribute(attr);
            if (value) {
              component.attributes[attr] = value;
            }
          });

          components.push(component);
        });
      } catch (e) {
        // Skip invalid selectors
        console.warn(`Invalid selector: ${selector}`, e);
      }
    });
  });

  return components;
}

/**
 * Extract components from multiple screens and deduplicate
 */
export function extractComponentsFromScreens(
  screens: Array<{ id: string; html: string; name: string }>
): ExtractedComponent[] {
  const componentMap = new Map<string, ExtractedComponent>();

  screens.forEach(screen => {
    if (!screen.html) return;

    const components = extractComponentsFromHtml(screen.html, screen.id);

    components.forEach(comp => {
      // Create a signature for deduplication based on category and structure
      const signature = `${comp.category}:${comp.html.slice(0, 100)}`;

      if (componentMap.has(signature)) {
        // Update existing component
        const existing = componentMap.get(signature)!;
        existing.occurrences++;
        if (!existing.sourceScreenIds.includes(screen.id)) {
          existing.sourceScreenIds.push(screen.id);
        }
      } else {
        componentMap.set(signature, comp);
      }
    });
  });

  // Convert map to array and sort by occurrences
  return Array.from(componentMap.values())
    .sort((a, b) => b.occurrences - a.occurrences);
}

/**
 * Group components by category
 */
export function groupComponentsByCategory(
  components: ExtractedComponent[]
): Record<ComponentCategory, ExtractedComponent[]> {
  const grouped: Record<ComponentCategory, ExtractedComponent[]> = {
    button: [],
    input: [],
    form: [],
    card: [],
    navigation: [],
    header: [],
    footer: [],
    list: [],
    modal: [],
    image: [],
    icon: [],
    link: [],
    table: [],
    other: [],
  };

  components.forEach(comp => {
    grouped[comp.category].push(comp);
  });

  return grouped;
}

/**
 * Get category display info
 */
export const CATEGORY_INFO: Record<ComponentCategory, { label: string; icon: string; color: string }> = {
  button: { label: 'Buttons', icon: 'CursorClick', color: '#3b82f6' },
  input: { label: 'Inputs', icon: 'TextT', color: '#8b5cf6' },
  form: { label: 'Forms', icon: 'Textbox', color: '#ec4899' },
  card: { label: 'Cards', icon: 'Square', color: '#f59e0b' },
  navigation: { label: 'Navigation', icon: 'List', color: '#10b981' },
  header: { label: 'Headers', icon: 'TextHOne', color: '#06b6d4' },
  footer: { label: 'Footers', icon: 'TextAlignBottom', color: '#6366f1' },
  list: { label: 'Lists', icon: 'ListBullets', color: '#84cc16' },
  modal: { label: 'Modals', icon: 'FrameCorners', color: '#f43f5e' },
  image: { label: 'Images', icon: 'Image', color: '#14b8a6' },
  icon: { label: 'Icons', icon: 'Star', color: '#a855f7' },
  link: { label: 'Links', icon: 'Link', color: '#0ea5e9' },
  table: { label: 'Tables', icon: 'Table', color: '#64748b' },
  other: { label: 'Other', icon: 'Puzzle', color: '#9ca3af' },
};
