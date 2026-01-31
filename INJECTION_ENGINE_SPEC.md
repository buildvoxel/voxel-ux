# Injection Engine Technical Specification

## Overview

The Injection Engine transforms static captured HTML into interactive prototypes by injecting JavaScript, CSS, and mock data **without modifying the original HTML structure**. This preserves pixel-perfect fidelity while adding functionality.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            INJECTION ENGINE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐     │
│  │   Original  │   │    DOM      │   │  Injection  │   │   Runtime   │     │
│  │    HTML     │ → │  Analyzer   │ → │  Compiler   │ → │  Executor   │     │
│  └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘     │
│                           │                 │                 │             │
│                           ▼                 ▼                 ▼             │
│                    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐     │
│                    │  Injection  │   │   Compiled  │   │  Interactive│     │
│                    │   Points    │   │   Bundle    │   │  Prototype  │     │
│                    └─────────────┘   └─────────────┘   └─────────────┘     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Components

1. **DOM Analyzer** - Parses HTML, identifies interactive elements and injection points
2. **Injection Compiler** - Converts injection specs into executable JavaScript bundle
3. **Runtime Executor** - Runs in browser, applies injections, manages state

---

## Injection Types

### Type 1: Event Handlers
Attach behavior to existing elements without changing them.

```typescript
interface EventInjection {
  type: 'event';
  id: string;
  target: string;           // CSS selector
  event: 'click' | 'submit' | 'change' | 'hover' | 'focus' | 'blur';
  handler: string;          // JavaScript code or action reference
  preventDefault?: boolean;
  stopPropagation?: boolean;
}
```

**Example:**
```json
{
  "type": "event",
  "id": "logout-handler",
  "target": "button.logout",
  "event": "click",
  "handler": "actions.showConfirmDialog('Are you sure you want to logout?', actions.navigate('/login'))"
}
```

---

### Type 2: Content Injection
Insert new HTML content relative to existing elements.

```typescript
interface ContentInjection {
  type: 'content';
  id: string;
  target: string;           // CSS selector
  position: 'before' | 'after' | 'prepend' | 'append' | 'replace';
  html: string;             // HTML to inject
  css?: string;             // Scoped CSS for injected content
  condition?: string;       // JavaScript expression for conditional rendering
}
```

**Example:**
```json
{
  "type": "content",
  "id": "user-dropdown",
  "target": ".header-actions",
  "position": "append",
  "html": "<div class='dropdown' data-inject='user-dropdown'>...</div>",
  "css": ".dropdown { position: absolute; ... }"
}
```

---

### Type 3: Data Binding
Populate elements with mock data.

```typescript
interface DataInjection {
  type: 'data';
  id: string;
  target: string;           // CSS selector (container)
  template: string;         // Item template with {{placeholders}}
  dataSource: string;       // Key in mock data store
  emptyState?: string;      // HTML when no data
  listMode?: 'replace' | 'append';
}
```

**Example:**
```json
{
  "type": "data",
  "id": "user-list",
  "target": "table.users tbody",
  "template": "<tr><td>{{name}}</td><td>{{email}}</td><td>{{role}}</td></tr>",
  "dataSource": "users",
  "emptyState": "<tr><td colspan='3'>No users found</td></tr>"
}
```

---

### Type 4: Navigation
Convert links to client-side routing.

```typescript
interface NavigationInjection {
  type: 'navigation';
  id: string;
  routes: Record<string, {
    screenId: string;       // Screen to load
    title?: string;         // Page title
    injections?: string[];  // Additional injections for this route
  }>;
  defaultRoute?: string;
  linkSelector?: string;    // CSS selector for links to intercept (default: 'a[href]')
  preserveScroll?: boolean;
}
```

**Example:**
```json
{
  "type": "navigation",
  "id": "app-router",
  "routes": {
    "/": { "screenId": "dashboard", "title": "Dashboard" },
    "/users": { "screenId": "users-list", "title": "Users" },
    "/settings": { "screenId": "settings", "title": "Settings" }
  },
  "defaultRoute": "/"
}
```

---

### Type 5: Form Enhancement
Add validation, submission handling, and state to forms.

```typescript
interface FormInjection {
  type: 'form';
  id: string;
  target: string;           // CSS selector for form
  validation?: Record<string, {
    rules: ValidationRule[];
    message: string;
  }>;
  onSubmit: {
    action: 'mock-api' | 'navigate' | 'show-message' | 'custom';
    config: Record<string, unknown>;
  };
  resetOnSubmit?: boolean;
  showLoadingState?: boolean;
}

interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: string | number;
  customValidator?: string;  // JavaScript function
}
```

**Example:**
```json
{
  "type": "form",
  "id": "login-form",
  "target": "form.login",
  "validation": {
    "input[name='email']": {
      "rules": [
        { "type": "required" },
        { "type": "email" }
      ],
      "message": "Please enter a valid email"
    },
    "input[name='password']": {
      "rules": [
        { "type": "required" },
        { "type": "minLength", "value": 8 }
      ],
      "message": "Password must be at least 8 characters"
    }
  },
  "onSubmit": {
    "action": "mock-api",
    "config": {
      "delay": 1000,
      "successRate": 0.9,
      "onSuccess": "navigate('/dashboard')",
      "onError": "showToast('Invalid credentials', 'error')"
    }
  }
}
```

---

### Type 6: Modal/Dialog Control
Wire up modal open/close triggers.

```typescript
interface ModalInjection {
  type: 'modal';
  id: string;
  modalSelector: string;    // CSS selector for modal element
  triggers: {
    open: string[];         // Selectors that open the modal
    close: string[];        // Selectors that close the modal
  };
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  onOpen?: string;          // JavaScript to run on open
  onClose?: string;         // JavaScript to run on close
}
```

**Example:**
```json
{
  "type": "modal",
  "id": "delete-confirm",
  "modalSelector": ".modal-delete",
  "triggers": {
    "open": ["button.delete-user", ".delete-action"],
    "close": [".modal-close", ".modal-cancel", ".modal-backdrop"]
  },
  "closeOnBackdrop": true,
  "closeOnEscape": true
}
```

---

### Type 7: Tab/Accordion Control
Handle tab switching and accordion expand/collapse.

```typescript
interface TabInjection {
  type: 'tabs';
  id: string;
  tabContainer: string;     // CSS selector for tab buttons container
  contentContainer: string; // CSS selector for tab content container
  tabSelector: string;      // CSS selector for individual tabs
  contentSelector: string;  // CSS selector for individual content panels
  activeClass: string;      // Class to add to active tab
  hiddenClass?: string;     // Class for hidden content (or use display:none)
  defaultTab?: number;      // Index of default active tab
}
```

**Example:**
```json
{
  "type": "tabs",
  "id": "settings-tabs",
  "tabContainer": ".tabs-nav",
  "contentContainer": ".tabs-content",
  "tabSelector": ".tab-button",
  "contentSelector": ".tab-panel",
  "activeClass": "active",
  "hiddenClass": "hidden",
  "defaultTab": 0
}
```

---

### Type 8: State Management
Define and manage prototype state.

```typescript
interface StateInjection {
  type: 'state';
  id: string;
  initialState: Record<string, unknown>;
  computedValues?: Record<string, string>;  // Derived state expressions
  persistence?: 'none' | 'session' | 'local';
}
```

**Example:**
```json
{
  "type": "state",
  "id": "app-state",
  "initialState": {
    "currentUser": null,
    "isLoggedIn": false,
    "theme": "light",
    "notifications": []
  },
  "computedValues": {
    "notificationCount": "state.notifications.length",
    "userName": "state.currentUser?.name || 'Guest'"
  },
  "persistence": "session"
}
```

---

### Type 9: Style Override
Apply CSS modifications without changing original styles.

```typescript
interface StyleInjection {
  type: 'style';
  id: string;
  css: string;              // CSS rules to inject
  scope?: string;           // Optional scope selector
  priority?: 'normal' | 'important';
  media?: string;           // Media query
}
```

**Example:**
```json
{
  "type": "style",
  "id": "dark-mode",
  "css": "body { background: #1a1a1a !important; color: #fff !important; }",
  "scope": "[data-theme='dark']"
}
```

---

### Type 10: Animation/Transition
Add animations to elements.

```typescript
interface AnimationInjection {
  type: 'animation';
  id: string;
  target: string;           // CSS selector
  trigger: 'load' | 'click' | 'hover' | 'scroll-in' | 'state-change';
  animation: {
    type: 'css' | 'keyframes';
    name?: string;          // For keyframes
    properties?: Record<string, string>;  // For CSS transitions
    duration: number;
    easing?: string;
    delay?: number;
  };
}
```

---

## DOM Analyzer

### Purpose
Automatically identify injection points in captured HTML.

### Detection Patterns

```typescript
interface DOMAnalysis {
  // Interactive elements
  buttons: ElementInfo[];      // <button>, [role="button"], .btn
  links: ElementInfo[];        // <a>, [role="link"]
  forms: FormInfo[];           // <form>, [role="form"]
  inputs: InputInfo[];         // <input>, <select>, <textarea>

  // Container patterns
  lists: ListInfo[];           // <ul>, <ol>, <table>, [role="list"]
  cards: ElementInfo[];        // .card, [role="article"], repeated patterns
  modals: ElementInfo[];       // .modal, [role="dialog"], [aria-modal]
  tabs: TabInfo[];             // [role="tablist"], .tabs

  // Navigation
  navElements: ElementInfo[];  // <nav>, [role="navigation"]
  headerLinks: ElementInfo[];  // Links in header area

  // Content areas
  mainContent: ElementInfo;    // <main>, [role="main"]
  sidebars: ElementInfo[];     // <aside>, .sidebar

  // Semantic structure
  headings: ElementInfo[];     // h1-h6
  sections: ElementInfo[];     // <section>, [role="region"]
}

interface ElementInfo {
  selector: string;            // Unique CSS selector
  tagName: string;
  text?: string;               // Inner text (truncated)
  classes: string[];
  attributes: Record<string, string>;
  boundingBox: { x: number; y: number; width: number; height: number };
}

interface FormInfo extends ElementInfo {
  fields: InputInfo[];
  submitButton?: ElementInfo;
  method?: string;
  action?: string;
}

interface InputInfo extends ElementInfo {
  inputType: string;
  name?: string;
  placeholder?: string;
  required: boolean;
  validation?: string[];       // HTML5 validation attributes
}

interface ListInfo extends ElementInfo {
  itemCount: number;
  itemSelector: string;        // Selector for list items
  itemTemplate?: string;       // Extracted template from first item
}

interface TabInfo extends ElementInfo {
  tabCount: number;
  tabSelector: string;
  panelSelector: string;
  activeIndex: number;
}
```

### Analyzer Implementation

```typescript
// src/services/domAnalyzer.ts

export class DOMAnalyzer {
  private doc: Document;

  constructor(html: string) {
    const parser = new DOMParser();
    this.doc = parser.parseFromString(html, 'text/html');
  }

  analyze(): DOMAnalysis {
    return {
      buttons: this.findButtons(),
      links: this.findLinks(),
      forms: this.findForms(),
      inputs: this.findInputs(),
      lists: this.findLists(),
      cards: this.findCards(),
      modals: this.findModals(),
      tabs: this.findTabs(),
      navElements: this.findNavigation(),
      headerLinks: this.findHeaderLinks(),
      mainContent: this.findMainContent(),
      sidebars: this.findSidebars(),
      headings: this.findHeadings(),
      sections: this.findSections(),
    };
  }

  private findButtons(): ElementInfo[] {
    const selectors = [
      'button',
      '[role="button"]',
      'input[type="submit"]',
      'input[type="button"]',
      '.btn',
      '.button',
      '[class*="button"]',
      '[class*="btn-"]',
    ];
    return this.queryAll(selectors.join(', ')).map(el => this.toElementInfo(el));
  }

  private findForms(): FormInfo[] {
    return this.queryAll('form, [role="form"]').map(form => ({
      ...this.toElementInfo(form),
      fields: this.findInputsIn(form),
      submitButton: this.findSubmitButton(form),
      method: form.getAttribute('method') || 'get',
      action: form.getAttribute('action') || '',
    }));
  }

  private findLists(): ListInfo[] {
    const lists: ListInfo[] = [];

    // Table bodies
    this.queryAll('table tbody').forEach(tbody => {
      const rows = tbody.querySelectorAll('tr');
      if (rows.length > 0) {
        lists.push({
          ...this.toElementInfo(tbody),
          itemCount: rows.length,
          itemSelector: 'tr',
          itemTemplate: this.extractTemplate(rows[0]),
        });
      }
    });

    // UL/OL lists
    this.queryAll('ul, ol').forEach(list => {
      const items = list.querySelectorAll(':scope > li');
      if (items.length > 0) {
        lists.push({
          ...this.toElementInfo(list),
          itemCount: items.length,
          itemSelector: ':scope > li',
          itemTemplate: this.extractTemplate(items[0]),
        });
      }
    });

    // Card grids (repeated similar elements)
    this.findRepeatedPatterns().forEach(pattern => {
      lists.push(pattern);
    });

    return lists;
  }

  private findModals(): ElementInfo[] {
    const selectors = [
      '[role="dialog"]',
      '[aria-modal="true"]',
      '.modal',
      '.dialog',
      '[class*="modal"]',
      '[class*="dialog"]',
      '[class*="overlay"]',
    ];
    return this.queryAll(selectors.join(', '))
      .filter(el => this.isLikelyModal(el))
      .map(el => this.toElementInfo(el));
  }

  private findTabs(): TabInfo[] {
    const tabLists = this.queryAll('[role="tablist"], .tabs, .tab-nav');
    return tabLists.map(tabList => {
      const tabs = tabList.querySelectorAll('[role="tab"], .tab, .tab-button');
      const activeIndex = Array.from(tabs).findIndex(t =>
        t.classList.contains('active') || t.getAttribute('aria-selected') === 'true'
      );

      return {
        ...this.toElementInfo(tabList),
        tabCount: tabs.length,
        tabSelector: this.getSelectorForElements(tabs),
        panelSelector: this.findTabPanels(tabList),
        activeIndex: activeIndex >= 0 ? activeIndex : 0,
      };
    });
  }

  private generateUniqueSelector(el: Element): string {
    // Generate minimal unique CSS selector
    if (el.id) return `#${el.id}`;

    const path: string[] = [];
    let current: Element | null = el;

    while (current && current !== this.doc.body) {
      let selector = current.tagName.toLowerCase();

      if (current.id) {
        selector = `#${current.id}`;
        path.unshift(selector);
        break;
      }

      if (current.className) {
        const classes = Array.from(current.classList)
          .filter(c => !c.match(/^(active|open|show|hidden|visible)/))
          .slice(0, 2);
        if (classes.length) {
          selector += '.' + classes.join('.');
        }
      }

      // Add nth-child if needed for uniqueness
      const siblings = current.parentElement?.children;
      if (siblings && siblings.length > 1) {
        const index = Array.from(siblings).indexOf(current);
        const sameTags = Array.from(siblings).filter(s =>
          s.tagName === current!.tagName
        );
        if (sameTags.length > 1) {
          selector += `:nth-child(${index + 1})`;
        }
      }

      path.unshift(selector);
      current = current.parentElement;
    }

    return path.join(' > ');
  }

  private extractTemplate(element: Element): string {
    const clone = element.cloneNode(true) as Element;

    // Replace text content with placeholders
    const textNodes = this.getTextNodes(clone);
    textNodes.forEach((node, i) => {
      const text = node.textContent?.trim();
      if (text && text.length > 0) {
        node.textContent = `{{field_${i}}}`;
      }
    });

    // Replace src/href with placeholders
    clone.querySelectorAll('[src]').forEach(el => {
      el.setAttribute('src', '{{image}}');
    });
    clone.querySelectorAll('[href]').forEach(el => {
      if (!el.getAttribute('href')?.startsWith('#')) {
        el.setAttribute('href', '{{link}}');
      }
    });

    return clone.outerHTML;
  }

  private queryAll(selector: string): Element[] {
    try {
      return Array.from(this.doc.querySelectorAll(selector));
    } catch {
      return [];
    }
  }

  private toElementInfo(el: Element): ElementInfo {
    const rect = { x: 0, y: 0, width: 0, height: 0 }; // Would need rendering for real bounds
    return {
      selector: this.generateUniqueSelector(el),
      tagName: el.tagName.toLowerCase(),
      text: el.textContent?.trim().slice(0, 50),
      classes: Array.from(el.classList),
      attributes: this.getAttributes(el),
      boundingBox: rect,
    };
  }
}
```

---

## Injection Compiler

### Purpose
Convert injection specs into executable JavaScript bundle.

```typescript
// src/services/injectionCompiler.ts

export class InjectionCompiler {
  compile(injections: Injection[]): CompiledBundle {
    const eventHandlers: string[] = [];
    const initCode: string[] = [];
    const styles: string[] = [];
    const dependencies: string[] = [];

    for (const injection of injections) {
      switch (injection.type) {
        case 'event':
          eventHandlers.push(this.compileEventInjection(injection));
          break;
        case 'content':
          initCode.push(this.compileContentInjection(injection));
          if (injection.css) styles.push(injection.css);
          break;
        case 'data':
          initCode.push(this.compileDataInjection(injection));
          break;
        case 'navigation':
          dependencies.push('router');
          initCode.push(this.compileNavigationInjection(injection));
          break;
        case 'form':
          dependencies.push('formValidator');
          initCode.push(this.compileFormInjection(injection));
          break;
        case 'modal':
          initCode.push(this.compileModalInjection(injection));
          break;
        case 'tabs':
          initCode.push(this.compileTabInjection(injection));
          break;
        case 'state':
          initCode.unshift(this.compileStateInjection(injection)); // State first
          break;
        case 'style':
          styles.push(injection.css);
          break;
      }
    }

    return {
      js: this.wrapBundle(eventHandlers, initCode, dependencies),
      css: styles.join('\n'),
      dependencies,
    };
  }

  private compileEventInjection(injection: EventInjection): string {
    return `
      runtime.on('${injection.target}', '${injection.event}', (e) => {
        ${injection.preventDefault ? 'e.preventDefault();' : ''}
        ${injection.stopPropagation ? 'e.stopPropagation();' : ''}
        ${injection.handler}
      }, '${injection.id}');
    `;
  }

  private compileContentInjection(injection: ContentInjection): string {
    const position = {
      before: 'beforebegin',
      after: 'afterend',
      prepend: 'afterbegin',
      append: 'beforeend',
      replace: 'replace',
    }[injection.position];

    if (injection.condition) {
      return `
        runtime.conditionalContent('${injection.target}', '${position}',
          \`${this.escapeTemplate(injection.html)}\`,
          () => ${injection.condition},
          '${injection.id}'
        );
      `;
    }

    return `
      runtime.injectContent('${injection.target}', '${position}',
        \`${this.escapeTemplate(injection.html)}\`,
        '${injection.id}'
      );
    `;
  }

  private compileDataInjection(injection: DataInjection): string {
    return `
      runtime.bindData('${injection.target}', '${injection.dataSource}',
        \`${this.escapeTemplate(injection.template)}\`,
        {
          emptyState: \`${this.escapeTemplate(injection.emptyState || '')}\`,
          mode: '${injection.listMode || 'replace'}'
        },
        '${injection.id}'
      );
    `;
  }

  private compileNavigationInjection(injection: NavigationInjection): string {
    return `
      runtime.initRouter(${JSON.stringify(injection.routes)}, {
        defaultRoute: '${injection.defaultRoute || '/'}',
        linkSelector: '${injection.linkSelector || 'a[href]'}',
        preserveScroll: ${injection.preserveScroll || false}
      }, '${injection.id}');
    `;
  }

  private compileFormInjection(injection: FormInjection): string {
    return `
      runtime.enhanceForm('${injection.target}', {
        validation: ${JSON.stringify(injection.validation || {})},
        onSubmit: ${JSON.stringify(injection.onSubmit)},
        resetOnSubmit: ${injection.resetOnSubmit || false},
        showLoadingState: ${injection.showLoadingState || true}
      }, '${injection.id}');
    `;
  }

  private compileModalInjection(injection: ModalInjection): string {
    return `
      runtime.wireModal('${injection.modalSelector}', {
        openTriggers: ${JSON.stringify(injection.triggers.open)},
        closeTriggers: ${JSON.stringify(injection.triggers.close)},
        closeOnBackdrop: ${injection.closeOnBackdrop || false},
        closeOnEscape: ${injection.closeOnEscape || false},
        onOpen: ${injection.onOpen ? `() => { ${injection.onOpen} }` : 'null'},
        onClose: ${injection.onClose ? `() => { ${injection.onClose} }` : 'null'}
      }, '${injection.id}');
    `;
  }

  private compileTabInjection(injection: TabInjection): string {
    return `
      runtime.wireTabs({
        tabContainer: '${injection.tabContainer}',
        contentContainer: '${injection.contentContainer}',
        tabSelector: '${injection.tabSelector}',
        contentSelector: '${injection.contentSelector}',
        activeClass: '${injection.activeClass}',
        hiddenClass: '${injection.hiddenClass || 'hidden'}',
        defaultTab: ${injection.defaultTab || 0}
      }, '${injection.id}');
    `;
  }

  private compileStateInjection(injection: StateInjection): string {
    return `
      runtime.initState(${JSON.stringify(injection.initialState)}, {
        computed: ${JSON.stringify(injection.computedValues || {})},
        persistence: '${injection.persistence || 'none'}'
      }, '${injection.id}');
    `;
  }

  private wrapBundle(
    eventHandlers: string[],
    initCode: string[],
    dependencies: string[]
  ): string {
    return `
(function(runtime, actions, state) {
  'use strict';

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    try {
      // Initialize state and core systems
      ${initCode.join('\n')}

      // Bind event handlers
      ${eventHandlers.join('\n')}

      // Signal ready
      runtime.emit('ready');
    } catch (error) {
      console.error('[Injection Engine] Init error:', error);
      runtime.emit('error', error);
    }
  }
})(window.__PROTOTYPE_RUNTIME__, window.__PROTOTYPE_ACTIONS__, window.__PROTOTYPE_STATE__);
    `;
  }

  private escapeTemplate(str: string): string {
    return str.replace(/`/g, '\\`').replace(/\$/g, '\\$');
  }
}

interface CompiledBundle {
  js: string;
  css: string;
  dependencies: string[];
}
```

---

## Runtime Executor

### Purpose
Runs in the browser, executes compiled injections, manages state.

```typescript
// src/runtime/prototypeRuntime.ts

export class PrototypeRuntime {
  private container: HTMLElement;
  private iframe: HTMLIFrameElement;
  private state: ReactiveState;
  private router: ClientRouter;
  private eventBindings: Map<string, EventBinding[]> = new Map();
  private dataBindings: Map<string, DataBinding> = new Map();
  private injectionIds: Set<string> = new Set();

  constructor(config: RuntimeConfig) {
    this.container = config.container;
    this.state = new ReactiveState(config.initialState || {});
    this.router = new ClientRouter(this);
  }

  // Mount prototype into container
  mount(html: string, injections: Injection[]): void {
    // Create sandboxed iframe
    this.iframe = document.createElement('iframe');
    this.iframe.sandbox.add('allow-scripts', 'allow-same-origin', 'allow-forms');
    this.iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
    this.container.appendChild(this.iframe);

    // Write HTML to iframe
    const doc = this.iframe.contentDocument!;
    doc.open();
    doc.write(html);
    doc.close();

    // Inject runtime into iframe
    this.injectRuntime(doc);

    // Compile and inject bundle
    const compiler = new InjectionCompiler();
    const bundle = compiler.compile(injections);

    // Inject styles
    if (bundle.css) {
      const style = doc.createElement('style');
      style.textContent = bundle.css;
      doc.head.appendChild(style);
    }

    // Inject script
    const script = doc.createElement('script');
    script.textContent = bundle.js;
    doc.body.appendChild(script);
  }

  private injectRuntime(doc: Document): void {
    const runtimeScript = doc.createElement('script');
    runtimeScript.textContent = `
      window.__PROTOTYPE_RUNTIME__ = {
        // Event binding
        on: function(selector, event, handler, id) {
          document.querySelectorAll(selector).forEach(el => {
            el.addEventListener(event, handler);
          });
        },

        // Content injection
        injectContent: function(selector, position, html, id) {
          const target = document.querySelector(selector);
          if (!target) return console.warn('Target not found:', selector);

          if (position === 'replace') {
            target.outerHTML = html;
          } else {
            target.insertAdjacentHTML(position, html);
          }
        },

        conditionalContent: function(selector, position, html, condition, id) {
          if (condition()) {
            this.injectContent(selector, position, html, id);
          }
        },

        // Data binding
        bindData: function(selector, dataKey, template, options, id) {
          const container = document.querySelector(selector);
          if (!container) return;

          const render = () => {
            const data = window.__PROTOTYPE_STATE__[dataKey] || [];
            if (data.length === 0 && options.emptyState) {
              container.innerHTML = options.emptyState;
              return;
            }

            const html = data.map(item => {
              return template.replace(/\\{\\{(\\w+)\\}\\}/g, (_, key) => {
                return item[key] ?? '';
              });
            }).join('');

            if (options.mode === 'append') {
              container.insertAdjacentHTML('beforeend', html);
            } else {
              container.innerHTML = html;
            }
          };

          render();
          // TODO: Subscribe to state changes
        },

        // Router
        initRouter: function(routes, options, id) {
          const navigate = (path) => {
            const route = routes[path];
            if (!route) return;

            history.pushState({}, route.title || '', path);
            document.title = route.title || document.title;

            // Load screen content
            window.parent.postMessage({
              type: 'NAVIGATE',
              path: path,
              screenId: route.screenId
            }, '*');
          };

          // Intercept link clicks
          document.addEventListener('click', (e) => {
            const link = e.target.closest(options.linkSelector);
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href || href.startsWith('http') || href.startsWith('#')) return;

            e.preventDefault();
            navigate(href);
          });

          window.__NAVIGATE__ = navigate;
        },

        // Form enhancement
        enhanceForm: function(selector, options, id) {
          const form = document.querySelector(selector);
          if (!form) return;

          form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate
            let isValid = true;
            if (options.validation) {
              for (const [fieldSelector, rules] of Object.entries(options.validation)) {
                const field = form.querySelector(fieldSelector);
                if (!field) continue;

                const value = field.value;
                for (const rule of rules.rules) {
                  if (rule.type === 'required' && !value) {
                    isValid = false;
                    this.showFieldError(field, rules.message);
                    break;
                  }
                  if (rule.type === 'email' && !/^[^@]+@[^@]+\\.[^@]+$/.test(value)) {
                    isValid = false;
                    this.showFieldError(field, rules.message);
                    break;
                  }
                  if (rule.type === 'minLength' && value.length < rule.value) {
                    isValid = false;
                    this.showFieldError(field, rules.message);
                    break;
                  }
                }
              }
            }

            if (!isValid) return;

            // Show loading
            const submitBtn = form.querySelector('[type="submit"], button:not([type])');
            const originalText = submitBtn?.textContent;
            if (submitBtn && options.showLoadingState) {
              submitBtn.textContent = 'Loading...';
              submitBtn.disabled = true;
            }

            // Mock API call
            if (options.onSubmit.action === 'mock-api') {
              await new Promise(r => setTimeout(r, options.onSubmit.config.delay || 1000));

              const success = Math.random() < (options.onSubmit.config.successRate || 1);
              if (success) {
                eval(options.onSubmit.config.onSuccess);
              } else {
                eval(options.onSubmit.config.onError);
              }
            }

            // Reset
            if (submitBtn) {
              submitBtn.textContent = originalText;
              submitBtn.disabled = false;
            }
            if (options.resetOnSubmit) {
              form.reset();
            }
          });
        },

        showFieldError: function(field, message) {
          field.style.borderColor = 'red';
          let errorEl = field.nextElementSibling;
          if (!errorEl || !errorEl.classList.contains('field-error')) {
            errorEl = document.createElement('div');
            errorEl.className = 'field-error';
            errorEl.style.cssText = 'color: red; font-size: 12px; margin-top: 4px;';
            field.parentNode.insertBefore(errorEl, field.nextSibling);
          }
          errorEl.textContent = message;
        },

        // Modal wiring
        wireModal: function(modalSelector, options, id) {
          const modal = document.querySelector(modalSelector);
          if (!modal) return;

          const open = () => {
            modal.style.display = 'flex';
            modal.classList.add('open');
            if (options.onOpen) options.onOpen();
          };

          const close = () => {
            modal.style.display = 'none';
            modal.classList.remove('open');
            if (options.onClose) options.onClose();
          };

          options.openTriggers.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
              el.addEventListener('click', open);
            });
          });

          options.closeTriggers.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
              el.addEventListener('click', close);
            });
          });

          if (options.closeOnEscape) {
            document.addEventListener('keydown', (e) => {
              if (e.key === 'Escape') close();
            });
          }
        },

        // Tab wiring
        wireTabs: function(options, id) {
          const tabs = document.querySelectorAll(
            options.tabContainer + ' ' + options.tabSelector
          );
          const panels = document.querySelectorAll(
            options.contentContainer + ' ' + options.contentSelector
          );

          const activate = (index) => {
            tabs.forEach((tab, i) => {
              tab.classList.toggle(options.activeClass, i === index);
            });
            panels.forEach((panel, i) => {
              panel.classList.toggle(options.hiddenClass, i !== index);
            });
          };

          tabs.forEach((tab, i) => {
            tab.addEventListener('click', () => activate(i));
          });

          activate(options.defaultTab);
        },

        // State management
        initState: function(initial, options, id) {
          window.__PROTOTYPE_STATE__ = { ...initial };

          if (options.persistence === 'session') {
            const saved = sessionStorage.getItem('prototype_state');
            if (saved) {
              Object.assign(window.__PROTOTYPE_STATE__, JSON.parse(saved));
            }
          } else if (options.persistence === 'local') {
            const saved = localStorage.getItem('prototype_state');
            if (saved) {
              Object.assign(window.__PROTOTYPE_STATE__, JSON.parse(saved));
            }
          }
        },

        // Event emitter
        emit: function(event, data) {
          window.parent.postMessage({ type: 'RUNTIME_EVENT', event, data }, '*');
        }
      };

      window.__PROTOTYPE_STATE__ = {};

      window.__PROTOTYPE_ACTIONS__ = {
        navigate: (path) => window.__NAVIGATE__?.(path),
        setState: (key, value) => {
          window.__PROTOTYPE_STATE__[key] = value;
        },
        showToast: (message, type) => {
          // Simple toast implementation
          const toast = document.createElement('div');
          toast.className = 'prototype-toast ' + type;
          toast.textContent = message;
          toast.style.cssText = \`
            position: fixed; bottom: 20px; right: 20px; padding: 12px 24px;
            background: \${type === 'error' ? '#f44336' : '#4caf50'}; color: white;
            border-radius: 4px; z-index: 10000; animation: fadeIn 0.3s;
          \`;
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 3000);
        },
        showConfirmDialog: (message, onConfirm) => {
          if (confirm(message)) {
            if (typeof onConfirm === 'function') onConfirm();
            else if (typeof onConfirm === 'string') eval(onConfirm);
          }
        }
      };
    `;
    doc.head.insertBefore(runtimeScript, doc.head.firstChild);
  }

  // Update state from parent
  setState(key: string, value: unknown): void {
    this.iframe.contentWindow?.postMessage({
      type: 'SET_STATE',
      key,
      value,
    }, '*');
  }

  // Navigate to route
  navigate(path: string): void {
    this.iframe.contentWindow?.postMessage({
      type: 'NAVIGATE_INTERNAL',
      path,
    }, '*');
  }

  // Hot-reload injection
  updateInjection(id: string, injection: Injection): void {
    // Remove old injection
    // Apply new injection
    // This enables live editing
  }

  // Cleanup
  destroy(): void {
    this.iframe.remove();
    this.eventBindings.clear();
    this.dataBindings.clear();
  }
}

interface RuntimeConfig {
  container: HTMLElement;
  initialState?: Record<string, unknown>;
  onEvent?: (event: RuntimeEvent) => void;
}

interface RuntimeEvent {
  type: string;
  data?: unknown;
}
```

---

## Mock Data Generator

### Purpose
Generate realistic mock data for data bindings.

```typescript
// src/services/mockDataGenerator.ts

export class MockDataGenerator {
  private faker: typeof import('@faker-js/faker').faker;

  async generate(schema: MockDataSchema): Promise<Record<string, unknown[]>> {
    const { faker } = await import('@faker-js/faker');
    this.faker = faker;

    const result: Record<string, unknown[]> = {};

    for (const [key, config] of Object.entries(schema)) {
      result[key] = this.generateCollection(config);
    }

    return result;
  }

  private generateCollection(config: CollectionConfig): unknown[] {
    const count = config.count || 10;
    const items: unknown[] = [];

    for (let i = 0; i < count; i++) {
      items.push(this.generateItem(config.fields));
    }

    return items;
  }

  private generateItem(fields: Record<string, FieldConfig>): Record<string, unknown> {
    const item: Record<string, unknown> = {};

    for (const [fieldName, fieldConfig] of Object.entries(fields)) {
      item[fieldName] = this.generateField(fieldConfig);
    }

    return item;
  }

  private generateField(config: FieldConfig): unknown {
    switch (config.type) {
      case 'id':
        return this.faker.string.uuid();
      case 'name':
        return this.faker.person.fullName();
      case 'firstName':
        return this.faker.person.firstName();
      case 'lastName':
        return this.faker.person.lastName();
      case 'email':
        return this.faker.internet.email();
      case 'phone':
        return this.faker.phone.number();
      case 'avatar':
        return this.faker.image.avatar();
      case 'image':
        return this.faker.image.url({ width: config.width || 400, height: config.height || 300 });
      case 'date':
        return this.faker.date.recent().toISOString();
      case 'pastDate':
        return this.faker.date.past().toISOString();
      case 'futureDate':
        return this.faker.date.future().toISOString();
      case 'number':
        return this.faker.number.int({ min: config.min || 0, max: config.max || 1000 });
      case 'price':
        return this.faker.commerce.price({ min: config.min || 10, max: config.max || 1000 });
      case 'boolean':
        return this.faker.datatype.boolean();
      case 'text':
        return this.faker.lorem.sentence();
      case 'paragraph':
        return this.faker.lorem.paragraph();
      case 'address':
        return this.faker.location.streetAddress();
      case 'city':
        return this.faker.location.city();
      case 'country':
        return this.faker.location.country();
      case 'company':
        return this.faker.company.name();
      case 'jobTitle':
        return this.faker.person.jobTitle();
      case 'status':
        return this.faker.helpers.arrayElement(config.options || ['active', 'inactive', 'pending']);
      case 'enum':
        return this.faker.helpers.arrayElement(config.options || []);
      case 'custom':
        return config.generator ? config.generator(this.faker) : null;
      default:
        return this.faker.lorem.word();
    }
  }
}

interface MockDataSchema {
  [collectionName: string]: CollectionConfig;
}

interface CollectionConfig {
  count?: number;
  fields: Record<string, FieldConfig>;
}

interface FieldConfig {
  type: string;
  options?: string[];
  min?: number;
  max?: number;
  width?: number;
  height?: number;
  generator?: (faker: unknown) => unknown;
}
```

---

## LLM Prompt for Injection Generation

### System Prompt

```
You are an expert at analyzing static HTML and generating JavaScript injections to make it interactive.

Given:
1. Original HTML of a captured web page
2. UI metadata (colors, typography, components)
3. User's feature request

Generate injection specifications that add the requested functionality WITHOUT modifying the original HTML structure.

Rules:
1. Use CSS selectors to target existing elements
2. Inject new content adjacent to existing elements, never replace core structure
3. Use event delegation where possible
4. Generate realistic mock data schemas
5. Handle edge cases (missing elements, multiple matches)

Output JSON array of injection objects following these types:
- event: Attach event handlers
- content: Inject new HTML
- data: Bind mock data
- navigation: Set up routing
- form: Enhance forms
- modal: Wire modals
- tabs: Wire tabs
- state: Define state
- style: Add CSS
```

### Example Prompt

```
User Request: "Add a user profile dropdown in the header"

Original HTML Analysis:
- Header element: .header, contains .header-logo, .header-nav, .header-actions
- .header-actions contains: search icon, notification bell
- No existing dropdown component

Generate injections to:
1. Add dropdown HTML after .header-actions
2. Wire click handler on profile button
3. Close on click outside
4. Populate with mock user data
```

### Example Output

```json
{
  "injections": [
    {
      "type": "state",
      "id": "user-state",
      "initialState": {
        "currentUser": null,
        "dropdownOpen": false
      }
    },
    {
      "type": "content",
      "id": "profile-button",
      "target": ".header-actions",
      "position": "append",
      "html": "<button class='profile-trigger' data-inject='profile-trigger'><img src='{{user.avatar}}' class='avatar-sm'/><span>{{user.name}}</span></button>",
      "css": ".profile-trigger { display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; } .avatar-sm { width: 32px; height: 32px; border-radius: 50%; }"
    },
    {
      "type": "content",
      "id": "profile-dropdown",
      "target": ".header-actions",
      "position": "append",
      "html": "<div class='profile-dropdown' data-inject='profile-dropdown'><div class='dropdown-header'><img src='{{user.avatar}}' class='avatar-lg'/><div><strong>{{user.name}}</strong><span>{{user.email}}</span></div></div><div class='dropdown-menu'><a href='/profile'>My Profile</a><a href='/settings'>Settings</a><hr/><a href='/logout'>Logout</a></div></div>",
      "css": ".profile-dropdown { position: absolute; top: 100%; right: 0; width: 280px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: none; z-index: 1000; } .profile-dropdown.open { display: block; } .dropdown-header { padding: 16px; display: flex; gap: 12px; border-bottom: 1px solid #eee; } .avatar-lg { width: 48px; height: 48px; border-radius: 50%; } .dropdown-menu a { display: block; padding: 12px 16px; color: #333; text-decoration: none; } .dropdown-menu a:hover { background: #f5f5f5; }"
    },
    {
      "type": "event",
      "id": "toggle-dropdown",
      "target": ".profile-trigger",
      "event": "click",
      "handler": "document.querySelector('.profile-dropdown').classList.toggle('open')",
      "stopPropagation": true
    },
    {
      "type": "event",
      "id": "close-dropdown-outside",
      "target": "document",
      "event": "click",
      "handler": "document.querySelector('.profile-dropdown')?.classList.remove('open')"
    }
  ],
  "mockData": {
    "user": {
      "id": "1",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://randomuser.me/api/portraits/men/1.jpg"
    }
  }
}
```

---

## Limitations & Edge Cases

### Known Limitations

1. **CSS Specificity Conflicts**
   - Original CSS may override injected styles
   - Mitigation: Use `!important` or higher specificity selectors

2. **Dynamic Original Content**
   - If original HTML has JS that modifies DOM, injections may break
   - Mitigation: Run injections after DOMContentLoaded, use MutationObserver

3. **Cross-Origin Resources**
   - Images/fonts from original site may not load
   - Mitigation: Proxy resources or use placeholders

4. **Complex Interactions**
   - Drag-and-drop, complex animations hard to inject
   - Mitigation: Fall back to Approach A for complex features

5. **State Synchronization**
   - Multiple injections may conflict on shared state
   - Mitigation: Centralized state management with namespacing

### Edge Cases to Handle

| Case | Handling |
|------|----------|
| Selector matches multiple elements | Apply to all or first based on config |
| Selector matches nothing | Log warning, skip injection |
| Injected content has same class as original | Namespace injected classes |
| Form without submit button | Find any button in form |
| Modal without backdrop | Create backdrop if closeOnBackdrop=true |
| Tabs with dynamic content | Re-apply bindings on content change |

---

## Performance Considerations

1. **Bundle Size**
   - Runtime library: ~15KB gzipped
   - Per-injection overhead: ~0.5KB

2. **Execution Time**
   - DOM analysis: <100ms for typical page
   - Injection compilation: <50ms
   - Runtime initialization: <100ms

3. **Memory Usage**
   - State stored in memory (~1KB per 100 state entries)
   - Event listeners: delegated where possible

4. **Optimization Strategies**
   - Lazy-load faker.js only when generating mock data
   - Compile injections once, cache bundle
   - Use requestIdleCallback for non-critical injections

---

## Testing Strategy

### Unit Tests
- DOM Analyzer: Test pattern detection on sample HTML
- Injection Compiler: Test each injection type compiles correctly
- Mock Data Generator: Test each field type

### Integration Tests
- Full flow: HTML → Analyze → Compile → Execute
- Multi-injection scenarios
- State persistence

### E2E Tests
- Load prototype, interact, verify behavior
- Navigation between screens
- Form submission flows

---

## Open Questions

1. **Should injections support TypeScript?**
   - Pro: Type safety, better tooling
   - Con: Compilation step, larger bundle

2. **How to handle accessibility?**
   - Injected content should maintain a11y
   - Add ARIA attributes automatically?

3. **Version control for injections?**
   - JSON diffs?
   - Full history like git?

4. **Live collaboration on injections?**
   - Real-time editing?
   - Conflict resolution?
