/**
 * Element Summary Service
 *
 * Extracts a compact, LLM-friendly representation of HTML structure.
 * This allows AI to generate edit operations without seeing full HTML.
 *
 * Output is ~100x smaller than raw HTML while preserving:
 * - Element hierarchy
 * - Selectors (tag, id, classes, data attributes)
 * - Key text content
 * - Semantic hints
 */

export interface ElementNode {
  // Selector info
  tag: string;
  id?: string;
  classes?: string[];
  dataAttrs?: Record<string, string>;

  // Content
  text?: string; // Direct text content (truncated)

  // Computed selector for targeting this element
  selector: string;

  // Semantic hints
  role?: string; // ARIA role or semantic tag hint
  type?: string; // For inputs
  href?: string; // For links (truncated)
  src?: string; // For images (truncated)

  // Children
  children?: ElementNode[];

  // For debugging/reference
  depth: number;
}

export interface ElementSummary {
  tree: ElementNode;
  textContent: string; // Full text representation for context
  stats: {
    totalElements: number;
    maxDepth: number;
    uniqueSelectors: number;
  };
}

// Tags to skip entirely
const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'svg', 'path', 'meta', 'link', 'head']);

// Tags with semantic meaning
const SEMANTIC_ROLES: Record<string, string> = {
  'button': 'button',
  'a': 'link',
  'input': 'input',
  'textarea': 'input',
  'select': 'dropdown',
  'img': 'image',
  'video': 'video',
  'audio': 'audio',
  'form': 'form',
  'table': 'table',
  'ul': 'list',
  'ol': 'list',
  'li': 'list-item',
  'h1': 'heading-1',
  'h2': 'heading-2',
  'h3': 'heading-3',
  'h4': 'heading-4',
  'h5': 'heading-5',
  'h6': 'heading-6',
  'p': 'paragraph',
  'label': 'label',
  'span': 'text',
  'div': 'container',
};

// Maximum text length to include
const MAX_TEXT_LENGTH = 100;
const MAX_ATTR_LENGTH = 50;
const MAX_DEPTH = 15;
const MAX_CHILDREN = 50;

/**
 * Generate a unique CSS selector for an element
 */
function generateSelector(element: Element, parentSelector: string): string {
  const tag = element.tagName.toLowerCase();
  const id = element.id;
  const classes = Array.from(element.classList).filter(c =>
    // Skip utility classes that are too specific
    !c.match(/^(css-|sc-|emotion-|__)/i) && c.length < 30
  );

  // ID is most specific
  if (id && !id.match(/^(:|css-|sc-)/)) {
    return `#${id}`;
  }

  // Build class-based selector
  if (classes.length > 0) {
    // Use up to 2 meaningful classes
    const meaningfulClasses = classes.slice(0, 2).join('.');
    return `${tag}.${meaningfulClasses}`;
  }

  // Use data attributes if available
  const dataAttrs = Array.from(element.attributes)
    .filter(attr => attr.name.startsWith('data-') && attr.value.length < 30)
    .slice(0, 1);

  if (dataAttrs.length > 0) {
    return `${tag}[${dataAttrs[0].name}="${dataAttrs[0].value}"]`;
  }

  // Fall back to tag with nth-child if needed
  if (parentSelector && element.parentElement) {
    const siblings = Array.from(element.parentElement.children).filter(
      s => s.tagName === element.tagName
    );
    if (siblings.length > 1) {
      const index = siblings.indexOf(element) + 1;
      return `${parentSelector} > ${tag}:nth-child(${index})`;
    }
  }

  return tag;
}

/**
 * Get direct text content (not from children)
 */
function getDirectText(element: Element): string {
  let text = '';
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent || '';
    }
  }
  return text.trim().replace(/\s+/g, ' ').substring(0, MAX_TEXT_LENGTH);
}

/**
 * Extract data attributes
 */
function getDataAttributes(element: Element): Record<string, string> | undefined {
  const dataAttrs: Record<string, string> = {};
  for (const attr of element.attributes) {
    if (attr.name.startsWith('data-') && attr.value.length < MAX_ATTR_LENGTH) {
      dataAttrs[attr.name] = attr.value;
    }
  }
  return Object.keys(dataAttrs).length > 0 ? dataAttrs : undefined;
}

/**
 * Process a single element into an ElementNode
 */
function processElement(
  element: Element,
  parentSelector: string,
  depth: number,
  selectorMap: Map<string, number>
): ElementNode | null {
  const tag = element.tagName.toLowerCase();

  // Skip certain tags
  if (SKIP_TAGS.has(tag)) {
    return null;
  }

  // Limit depth
  if (depth > MAX_DEPTH) {
    return null;
  }

  const selector = generateSelector(element, parentSelector);

  // Track selector uniqueness
  const selectorCount = selectorMap.get(selector) || 0;
  selectorMap.set(selector, selectorCount + 1);

  // Build the node
  const node: ElementNode = {
    tag,
    selector: selectorCount > 0 ? `${selector}:nth-of-type(${selectorCount + 1})` : selector,
    depth,
  };

  // Add ID if present
  if (element.id && !element.id.match(/^(:|css-|sc-)/)) {
    node.id = element.id;
  }

  // Add meaningful classes
  const classes = Array.from(element.classList).filter(c =>
    !c.match(/^(css-|sc-|emotion-|__)/i) && c.length < 30
  );
  if (classes.length > 0) {
    node.classes = classes.slice(0, 5); // Limit to 5 classes
  }

  // Add data attributes
  node.dataAttrs = getDataAttributes(element);

  // Add semantic role
  const role = element.getAttribute('role') || SEMANTIC_ROLES[tag];
  if (role) {
    node.role = role;
  }

  // Add type for inputs
  if (tag === 'input') {
    node.type = element.getAttribute('type') || 'text';
  }

  // Add href for links (truncated)
  if (tag === 'a') {
    const href = element.getAttribute('href');
    if (href && !href.startsWith('javascript:')) {
      node.href = href.substring(0, MAX_ATTR_LENGTH);
    }
  }

  // Add src for images (truncated)
  if (tag === 'img') {
    const src = element.getAttribute('src');
    const alt = element.getAttribute('alt');
    if (src) {
      node.src = src.substring(0, MAX_ATTR_LENGTH);
    }
    if (alt) {
      node.text = alt.substring(0, MAX_TEXT_LENGTH);
    }
  }

  // Get direct text content
  const text = getDirectText(element);
  if (text && text.length > 0) {
    node.text = text;
  }

  // Process children
  const children: ElementNode[] = [];
  let childCount = 0;

  for (const child of element.children) {
    if (childCount >= MAX_CHILDREN) break;

    const childNode = processElement(child, node.selector, depth + 1, selectorMap);
    if (childNode) {
      children.push(childNode);
      childCount++;
    }
  }

  if (children.length > 0) {
    node.children = children;
  }

  return node;
}

/**
 * Count total elements in tree
 */
function countElements(node: ElementNode): number {
  let count = 1;
  if (node.children) {
    for (const child of node.children) {
      count += countElements(child);
    }
  }
  return count;
}

/**
 * Find max depth in tree
 */
function findMaxDepth(node: ElementNode): number {
  if (!node.children || node.children.length === 0) {
    return node.depth;
  }
  return Math.max(...node.children.map(findMaxDepth));
}

/**
 * Convert tree to text representation for LLM context
 */
function treeToText(node: ElementNode, indent: string = ''): string {
  let result = '';

  // Build line
  let line = `${indent}${node.selector}`;
  if (node.text) {
    line += ` "${node.text}"`;
  }
  if (node.role && !['container', 'text'].includes(node.role)) {
    line += ` [${node.role}]`;
  }
  result += line + '\n';

  // Process children
  if (node.children) {
    for (const child of node.children) {
      result += treeToText(child, indent + '  ');
    }
  }

  return result;
}

/**
 * Extract element summary from HTML string
 */
export function extractElementSummary(html: string): ElementSummary {
  // Parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Start from body or root
  const root = doc.body || doc.documentElement;

  // Track selectors for uniqueness
  const selectorMap = new Map<string, number>();

  // Process the tree
  const tree = processElement(root, '', 0, selectorMap);

  if (!tree) {
    throw new Error('Failed to extract element summary');
  }

  // Generate text representation
  const textContent = treeToText(tree);

  return {
    tree,
    textContent,
    stats: {
      totalElements: countElements(tree),
      maxDepth: findMaxDepth(tree),
      uniqueSelectors: selectorMap.size,
    },
  };
}

/**
 * Extract a minimal summary optimized for token efficiency
 * This is the version we send to the LLM
 */
export function extractMinimalSummary(html: string, maxTokens: number = 2000): string {
  const summary = extractElementSummary(html);

  // Start with text representation
  let text = summary.textContent;

  // Truncate if too long (rough estimate: 4 chars per token)
  const maxChars = maxTokens * 4;
  if (text.length > maxChars) {
    text = text.substring(0, maxChars) + '\n... (truncated)';
  }

  return text;
}

/**
 * Find elements matching a pattern in the summary
 * Useful for validating selectors before sending to LLM
 */
export function findMatchingElements(
  summary: ElementSummary,
  pattern: { tag?: string; class?: string; id?: string; role?: string }
): ElementNode[] {
  const matches: ElementNode[] = [];

  function search(node: ElementNode) {
    let isMatch = true;

    if (pattern.tag && node.tag !== pattern.tag) isMatch = false;
    if (pattern.id && node.id !== pattern.id) isMatch = false;
    if (pattern.class && (!node.classes || !node.classes.includes(pattern.class))) isMatch = false;
    if (pattern.role && node.role !== pattern.role) isMatch = false;

    if (isMatch) {
      matches.push(node);
    }

    if (node.children) {
      for (const child of node.children) {
        search(child);
      }
    }
  }

  search(summary.tree);
  return matches;
}
