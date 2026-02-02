/**
 * Component Extractor Service
 * Parses HTML and extracts reusable components with metadata
 */

// ============================================================================
// Types
// ============================================================================

export interface ExtractedComponent {
  id: string;
  name: string;
  type: ComponentType;
  html: string;
  thumbnail?: string;
  props: ComponentProp[];
  slots: ComponentSlot[];
  styles: ComponentStyles;
  selector: string;
  sourceElement: string;
  metadata: ComponentMetadata;
  bounds: {
    width: number;
    height: number;
    x?: number;
    y?: number;
  };
}

export type ComponentType =
  | 'button'
  | 'input'
  | 'card'
  | 'navbar'
  | 'sidebar'
  | 'footer'
  | 'hero'
  | 'form'
  | 'table'
  | 'list'
  | 'modal'
  | 'dropdown'
  | 'tabs'
  | 'accordion'
  | 'image'
  | 'icon'
  | 'badge'
  | 'avatar'
  | 'alert'
  | 'breadcrumb'
  | 'pagination'
  | 'progress'
  | 'tooltip'
  | 'menu'
  | 'section'
  | 'container'
  | 'grid'
  | 'custom';

export interface ComponentProp {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'color' | 'select' | 'image';
  value: string | number | boolean;
  defaultValue?: string; // Alias for value as string
  options?: string[]; // For select type
  description?: string;
}

export interface ComponentSlot {
  name: string;
  selector: string;
  content: string;
  editable: boolean;
}

export interface ComponentStyles {
  width?: string;
  height?: string;
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  border?: string;
  boxShadow?: string;
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
  [key: string]: string | undefined;
}

export interface ComponentMetadata {
  isInteractive: boolean;
  hasChildren: boolean;
  childCount: number;
  depth: number;
  area: number; // width * height estimate
  importance: 'high' | 'medium' | 'low';
}

export interface ExtractionResult {
  components: ExtractedComponent[];
  summary: {
    totalComponents: number;
    byType: Record<ComponentType, number>;
    topLevel: string[]; // IDs of top-level components
  };
}

// ============================================================================
// Detection Patterns
// ============================================================================

interface ComponentPattern {
  type: ComponentType;
  selectors: string[];
  classPatterns: RegExp[];
  validators?: ((el: Element) => boolean)[];
  importance: 'high' | 'medium' | 'low';
}

const COMPONENT_PATTERNS: ComponentPattern[] = [
  // Navigation
  {
    type: 'navbar',
    selectors: ['nav', 'header nav', '[role="navigation"]'],
    classPatterns: [/nav(bar|igation)?/i, /header/i, /top-bar/i],
    importance: 'high'
  },
  {
    type: 'sidebar',
    selectors: ['aside', '[role="complementary"]'],
    classPatterns: [/side(bar|nav|menu)/i, /drawer/i],
    importance: 'high'
  },
  {
    type: 'footer',
    selectors: ['footer', '[role="contentinfo"]'],
    classPatterns: [/footer/i, /bottom-bar/i],
    importance: 'medium'
  },

  // Content Sections
  {
    type: 'hero',
    selectors: [],
    classPatterns: [/hero/i, /banner/i, /jumbotron/i, /splash/i],
    importance: 'high'
  },
  {
    type: 'section',
    selectors: ['section', 'article'],
    classPatterns: [/section/i, /block/i, /segment/i],
    importance: 'medium'
  },

  // Cards & Containers
  {
    type: 'card',
    selectors: ['[class*="card"]', 'article'],
    classPatterns: [/card/i, /tile/i, /panel/i, /box/i],
    validators: [(el) => el.children.length > 0],
    importance: 'high'
  },
  {
    type: 'modal',
    selectors: ['[role="dialog"]', '[aria-modal="true"]'],
    classPatterns: [/modal/i, /dialog/i, /popup/i, /overlay/i],
    importance: 'high'
  },

  // Forms
  {
    type: 'form',
    selectors: ['form'],
    classPatterns: [/form/i],
    importance: 'high'
  },
  {
    type: 'input',
    selectors: ['input:not([type="hidden"])', 'textarea', 'select'],
    classPatterns: [/input/i, /field/i, /form-control/i],
    importance: 'medium'
  },
  {
    type: 'button',
    selectors: ['button', '[role="button"]', 'input[type="submit"]', 'input[type="button"]'],
    classPatterns: [/btn/i, /button/i, /cta/i],
    importance: 'medium'
  },

  // Data Display
  {
    type: 'table',
    selectors: ['table'],
    classPatterns: [/table/i, /data-grid/i],
    importance: 'high'
  },
  {
    type: 'list',
    selectors: ['ul', 'ol', '[role="list"]'],
    classPatterns: [/list/i, /menu/i],
    validators: [(el) => el.children.length >= 2],
    importance: 'medium'
  },

  // Interactive
  {
    type: 'tabs',
    selectors: ['[role="tablist"]'],
    classPatterns: [/tab(s|list|bar)?/i],
    importance: 'high'
  },
  {
    type: 'accordion',
    selectors: [],
    classPatterns: [/accordion/i, /collapse/i, /expand/i],
    importance: 'medium'
  },
  {
    type: 'dropdown',
    selectors: ['[role="menu"]', '[role="listbox"]'],
    classPatterns: [/dropdown/i, /select/i, /combobox/i],
    importance: 'medium'
  },

  // Media & Visual
  {
    type: 'image',
    selectors: ['img', 'picture', 'figure'],
    classPatterns: [/image/i, /img/i, /photo/i, /thumbnail/i],
    importance: 'low'
  },
  {
    type: 'avatar',
    selectors: [],
    classPatterns: [/avatar/i, /profile-img/i, /user-img/i],
    importance: 'low'
  },
  {
    type: 'icon',
    selectors: ['svg', 'i[class*="icon"]'],
    classPatterns: [/icon/i, /fa-/i, /material-icons/i],
    importance: 'low'
  },

  // Feedback & Status
  {
    type: 'alert',
    selectors: ['[role="alert"]'],
    classPatterns: [/alert/i, /notification/i, /toast/i, /message/i, /notice/i],
    importance: 'medium'
  },
  {
    type: 'badge',
    selectors: [],
    classPatterns: [/badge/i, /tag/i, /chip/i, /label/i, /pill/i],
    importance: 'low'
  },
  {
    type: 'progress',
    selectors: ['progress', '[role="progressbar"]'],
    classPatterns: [/progress/i, /loading/i, /spinner/i],
    importance: 'low'
  },

  // Navigation helpers
  {
    type: 'breadcrumb',
    selectors: ['nav[aria-label="breadcrumb"]'],
    classPatterns: [/breadcrumb/i],
    importance: 'low'
  },
  {
    type: 'pagination',
    selectors: [],
    classPatterns: [/pagination/i, /pager/i],
    importance: 'medium'
  },
  {
    type: 'menu',
    selectors: ['[role="menu"]', 'nav ul'],
    classPatterns: [/menu/i, /nav-items/i],
    importance: 'medium'
  },

  // Layout
  {
    type: 'container',
    selectors: [],
    classPatterns: [/container/i, /wrapper/i, /content/i],
    importance: 'low'
  },
  {
    type: 'grid',
    selectors: [],
    classPatterns: [/grid/i, /row/i, /col/i, /flex/i],
    importance: 'low'
  }
];

// ============================================================================
// Helper Functions
// ============================================================================

let componentIdCounter = 0;

function generateComponentId(): string {
  return `comp-${++componentIdCounter}`;
}

function generateComponentName(type: ComponentType, element: Element): string {
  // Try to get a meaningful name from the element
  const id = element.id;
  if (id) {
    return id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) {
    return ariaLabel;
  }

  const title = element.getAttribute('title');
  if (title) {
    return title;
  }

  // Use first text content
  const text = element.textContent?.trim().slice(0, 30);
  if (text && text.length > 2) {
    return `${type.charAt(0).toUpperCase() + type.slice(1)}: ${text}`;
  }

  // Default to type with index
  return `${type.charAt(0).toUpperCase() + type.slice(1)} Component`;
}

function getComputedStyles(element: Element, doc: Document): ComponentStyles {
  const styles: ComponentStyles = {};

  // Get inline styles
  const inlineStyle = element.getAttribute('style');
  if (inlineStyle) {
    const styleProps = inlineStyle.split(';').filter(Boolean);
    styleProps.forEach(prop => {
      const [key, value] = prop.split(':').map(s => s.trim());
      if (key && value) {
        const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        styles[camelKey] = value;
      }
    });
  }

  // Get computed styles for key properties
  try {
    const computed = doc.defaultView?.getComputedStyle(element);
    if (computed) {
      const keyProps = [
        'width', 'height', 'backgroundColor', 'color', 'fontSize',
        'fontWeight', 'padding', 'margin', 'borderRadius', 'border',
        'boxShadow', 'display', 'flexDirection', 'justifyContent',
        'alignItems', 'gap'
      ];

      keyProps.forEach(prop => {
        const value = computed.getPropertyValue(
          prop.replace(/([A-Z])/g, '-$1').toLowerCase()
        );
        if (value && value !== 'none' && value !== 'auto' && value !== 'normal') {
          styles[prop] = value;
        }
      });
    }
  } catch {
    // Computed styles not available
  }

  return styles;
}

function extractProps(element: Element, type: ComponentType): ComponentProp[] {
  const props: ComponentProp[] = [];

  // Common props for all components
  if (element.id) {
    props.push({ name: 'id', type: 'string', value: element.id });
  }

  const className = element.className;
  if (typeof className === 'string' && className) {
    props.push({ name: 'className', type: 'string', value: className });
  }

  // Type-specific props
  switch (type) {
    case 'button':
      props.push({
        name: 'text',
        type: 'string',
        value: element.textContent?.trim() || 'Button'
      });
      props.push({
        name: 'variant',
        type: 'select',
        value: element.classList.contains('outline') ? 'outline' : 'filled',
        options: ['filled', 'outline', 'ghost', 'link']
      });
      props.push({
        name: 'disabled',
        type: 'boolean',
        value: element.hasAttribute('disabled')
      });
      break;

    case 'input':
      props.push({
        name: 'type',
        type: 'select',
        value: element.getAttribute('type') || 'text',
        options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search']
      });
      props.push({
        name: 'placeholder',
        type: 'string',
        value: element.getAttribute('placeholder') || ''
      });
      props.push({
        name: 'required',
        type: 'boolean',
        value: element.hasAttribute('required')
      });
      break;

    case 'image':
      props.push({
        name: 'src',
        type: 'image',
        value: element.getAttribute('src') || ''
      });
      props.push({
        name: 'alt',
        type: 'string',
        value: element.getAttribute('alt') || ''
      });
      break;

    case 'card':
    case 'section':
    case 'container':
      props.push({
        name: 'padding',
        type: 'string',
        value: '16px'
      });
      props.push({
        name: 'backgroundColor',
        type: 'color',
        value: '#ffffff'
      });
      break;
  }

  return props;
}

function extractSlots(element: Element, type: ComponentType): ComponentSlot[] {
  const slots: ComponentSlot[] = [];

  // Find common slot patterns
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach((heading, i) => {
    slots.push({
      name: `heading${i > 0 ? i + 1 : ''}`,
      selector: heading.tagName.toLowerCase(),
      content: heading.textContent?.trim() || '',
      editable: true
    });
  });

  const paragraphs = element.querySelectorAll('p');
  paragraphs.forEach((p, i) => {
    if (p.textContent && p.textContent.trim().length > 10) {
      slots.push({
        name: `text${i > 0 ? i + 1 : ''}`,
        selector: 'p',
        content: p.textContent.trim(),
        editable: true
      });
    }
  });

  // Type-specific slots
  switch (type) {
    case 'card':
      const cardImg = element.querySelector('img');
      if (cardImg) {
        slots.push({
          name: 'image',
          selector: 'img',
          content: cardImg.getAttribute('src') || '',
          editable: true
        });
      }
      break;

    case 'button':
      slots.push({
        name: 'label',
        selector: 'button',
        content: element.textContent?.trim() || 'Button',
        editable: true
      });
      break;
  }

  return slots;
}

function detectComponentType(element: Element): ComponentType | null {
  const tagName = element.tagName.toLowerCase();
  const className = element.className?.toString() || '';

  for (const pattern of COMPONENT_PATTERNS) {
    // Check selectors
    for (const selector of pattern.selectors) {
      if (element.matches(selector)) {
        // Run validators if any
        if (pattern.validators) {
          const passesAll = pattern.validators.every(v => v(element));
          if (!passesAll) continue;
        }
        return pattern.type;
      }
    }

    // Check class patterns
    for (const classPattern of pattern.classPatterns) {
      if (classPattern.test(className)) {
        if (pattern.validators) {
          const passesAll = pattern.validators.every(v => v(element));
          if (!passesAll) continue;
        }
        return pattern.type;
      }
    }
  }

  // Fallback detection by tag
  const tagTypeMap: Record<string, ComponentType> = {
    'button': 'button',
    'input': 'input',
    'textarea': 'input',
    'select': 'dropdown',
    'form': 'form',
    'table': 'table',
    'nav': 'navbar',
    'aside': 'sidebar',
    'footer': 'footer',
    'header': 'navbar',
    'article': 'card',
    'section': 'section',
    'img': 'image',
    'svg': 'icon'
  };

  return tagTypeMap[tagName] || null;
}

function calculateMetadata(element: Element, depth: number): ComponentMetadata {
  const rect = element.getBoundingClientRect?.() || { width: 0, height: 0 };
  const hasInteractive = element.querySelector(
    'button, a, input, select, textarea, [onclick], [role="button"]'
  ) !== null || element.matches('button, a, input, select, textarea, [onclick], [role="button"]');

  const childCount = element.children.length;
  const area = rect.width * rect.height;

  // Determine importance
  let importance: 'high' | 'medium' | 'low' = 'medium';
  if (area > 50000 || childCount > 5) importance = 'high';
  if (area < 5000 && childCount < 2) importance = 'low';

  return {
    isInteractive: hasInteractive,
    hasChildren: childCount > 0,
    childCount,
    depth,
    area,
    importance
  };
}

function generateSelector(element: Element): string {
  if (element.id) {
    return `#${element.id}`;
  }

  const tag = element.tagName.toLowerCase();
  const classes = Array.from(element.classList)
    .filter(c => !c.match(/^(hover|active|focus|disabled)/))
    .slice(0, 2);

  if (classes.length > 0) {
    return `${tag}.${classes.join('.')}`;
  }

  return tag;
}

// ============================================================================
// Main Extraction Functions
// ============================================================================

function extractComponent(
  element: Element,
  doc: Document,
  depth: number = 0
): ExtractedComponent | null {
  const type = detectComponentType(element);
  if (!type) return null;

  const id = generateComponentId();
  const name = generateComponentName(type, element);
  const html = element.outerHTML;
  const props = extractProps(element, type);
  const slots = extractSlots(element, type);
  const styles = getComputedStyles(element, doc);
  const metadata = calculateMetadata(element, depth);
  const selector = generateSelector(element);

  // Extract bounds from computed styles or default
  const computedWidth = parseInt(styles.width || '0', 10);
  const computedHeight = parseInt(styles.height || '0', 10);
  const bounds = {
    width: computedWidth || 200,
    height: computedHeight || 100,
    x: 0,
    y: 0,
  };

  return {
    id,
    name,
    type,
    html,
    props,
    slots,
    styles,
    selector,
    sourceElement: element.tagName.toLowerCase(),
    metadata,
    bounds,
  };
}

/**
 * Extract all components from HTML string
 */
export function extractComponents(html: string): ExtractionResult {
  componentIdCounter = 0; // Reset counter

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;

  const components: ExtractedComponent[] = [];
  const byType: Record<ComponentType, number> = {} as Record<ComponentType, number>;
  const topLevel: string[] = [];
  const processed = new Set<Element>();

  // Initialize type counts
  const allTypes: ComponentType[] = [
    'button', 'input', 'card', 'navbar', 'sidebar', 'footer', 'hero', 'form',
    'table', 'list', 'modal', 'dropdown', 'tabs', 'accordion', 'image', 'icon',
    'badge', 'avatar', 'alert', 'breadcrumb', 'pagination', 'progress', 'tooltip',
    'menu', 'section', 'container', 'grid', 'custom'
  ];
  allTypes.forEach(t => byType[t] = 0);

  // Recursive extraction function
  function processElement(element: Element, depth: number = 0, isTopLevel: boolean = false) {
    if (processed.has(element)) return;

    const component = extractComponent(element, doc, depth);
    if (component) {
      processed.add(element);
      components.push(component);
      byType[component.type]++;

      if (isTopLevel || depth === 0) {
        topLevel.push(component.id);
      }

      // Don't process children of certain component types
      const skipChildren = ['button', 'input', 'image', 'icon', 'badge', 'avatar'];
      if (!skipChildren.includes(component.type)) {
        Array.from(element.children).forEach(child => {
          processElement(child, depth + 1, false);
        });
      }
    } else {
      // Not a component, but process children
      Array.from(element.children).forEach(child => {
        processElement(child, depth, depth === 0);
      });
    }
  }

  // Start extraction from body's children
  Array.from(body.children).forEach(child => {
    processElement(child, 0, true);
  });

  return {
    components,
    summary: {
      totalComponents: components.length,
      byType,
      topLevel
    }
  };
}

/**
 * Extract a single component by selector
 */
export function extractComponentBySelector(html: string, selector: string): ExtractedComponent | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const element = doc.querySelector(selector);

  if (!element) return null;

  return extractComponent(element, doc, 0);
}

/**
 * Get component patterns for detection hints
 */
export function getComponentPatterns(): ComponentPattern[] {
  return COMPONENT_PATTERNS;
}

/**
 * Filter components by type
 */
export function filterComponentsByType(
  result: ExtractionResult,
  types: ComponentType[]
): ExtractedComponent[] {
  return result.components.filter(c => types.includes(c.type));
}

/**
 * Get high-importance components (good for component library display)
 */
export function getHighImportanceComponents(result: ExtractionResult): ExtractedComponent[] {
  return result.components.filter(c => c.metadata.importance === 'high');
}

/**
 * Sort components by importance and size
 */
export function sortComponentsByImportance(components: ExtractedComponent[]): ExtractedComponent[] {
  const importanceOrder = { high: 0, medium: 1, low: 2 };
  return [...components].sort((a, b) => {
    const impDiff = importanceOrder[a.metadata.importance] - importanceOrder[b.metadata.importance];
    if (impDiff !== 0) return impDiff;
    return b.metadata.area - a.metadata.area;
  });
}
