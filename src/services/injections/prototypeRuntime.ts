/**
 * Prototype Runtime Service
 * Injects interactive runtime into prototype HTML and handles iframe communication
 */

import { compileInjections, getRuntimeCore } from './injectionCompiler';
import type { InjectionConfig } from './injectionCompiler';

// ============================================================================
// Types
// ============================================================================

export interface RuntimeMessage {
  type: 'event' | 'state' | 'error' | 'ready' | 'log';
  payload: unknown;
  timestamp: number;
}

export interface RuntimeEventPayload {
  eventType: string;
  selector: string;
  data?: Record<string, unknown>;
}

export interface RuntimeOptions {
  enableLogging?: boolean;
  enableAnalytics?: boolean;
  sandboxMode?: boolean;
  mockDataEnabled?: boolean;
  parentOrigin?: string;
}

// ============================================================================
// Communication Bridge Script
// ============================================================================

const COMMUNICATION_BRIDGE = `
// Voxel Communication Bridge
(function(window) {
  'use strict';

  const VoxelBridge = {
    parentOrigin: '*',
    eventBuffer: [],
    ready: false,

    init(options = {}) {
      this.parentOrigin = options.parentOrigin || '*';
      this.enableLogging = options.enableLogging || false;
      this.enableAnalytics = options.enableAnalytics || false;

      // Listen for messages from parent
      window.addEventListener('message', this.handleMessage.bind(this));

      // Notify parent that we're ready
      this.ready = true;
      this.sendToParent({ type: 'ready', payload: { url: window.location.href } });

      // Intercept console for logging
      if (this.enableLogging) {
        this.interceptConsole();
      }

      // Track interactions for analytics
      if (this.enableAnalytics) {
        this.setupAnalytics();
      }

      console.log('[VoxelBridge] Initialized');
    },

    handleMessage(event) {
      // In production, verify origin
      // if (event.origin !== this.parentOrigin) return;

      const message = event.data;
      if (!message || !message.type) return;

      switch (message.type) {
        case 'execute':
          // Execute JavaScript in prototype context
          try {
            eval(message.payload.code);
            this.sendToParent({ type: 'execute-result', payload: { success: true } });
          } catch (error) {
            this.sendToParent({ type: 'execute-result', payload: { success: false, error: error.message } });
          }
          break;

        case 'get-state':
          // Return current state
          this.sendToParent({
            type: 'state',
            payload: window.VoxelRuntime ? window.VoxelRuntime.state : {}
          });
          break;

        case 'set-state':
          // Update state
          if (window.VoxelRuntime) {
            Object.assign(window.VoxelRuntime.state, message.payload);
          }
          break;

        case 'query':
          // Query DOM and return result
          try {
            const elements = document.querySelectorAll(message.payload.selector);
            const results = Array.from(elements).map(el => ({
              tagName: el.tagName,
              id: el.id,
              className: el.className,
              textContent: el.textContent?.slice(0, 100)
            }));
            this.sendToParent({ type: 'query-result', payload: { results } });
          } catch (error) {
            this.sendToParent({ type: 'query-result', payload: { error: error.message } });
          }
          break;

        case 'highlight':
          // Highlight elements
          const selector = message.payload.selector;
          document.querySelectorAll('.voxel-highlight-overlay').forEach(el => el.remove());
          document.querySelectorAll(selector).forEach(el => {
            el.style.outline = '2px solid #3b82f6';
            el.style.outlineOffset = '2px';
          });
          break;

        case 'clear-highlight':
          document.querySelectorAll('*').forEach(el => {
            el.style.outline = '';
            el.style.outlineOffset = '';
          });
          break;
      }
    },

    sendToParent(message) {
      const fullMessage = {
        ...message,
        timestamp: Date.now(),
        source: 'voxel-prototype'
      };

      if (window.parent !== window) {
        window.parent.postMessage(fullMessage, this.parentOrigin);
      }
    },

    interceptConsole() {
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;
      const self = this;

      console.log = function(...args) {
        self.sendToParent({ type: 'log', payload: { level: 'log', args: args.map(String) } });
        originalLog.apply(console, args);
      };

      console.error = function(...args) {
        self.sendToParent({ type: 'log', payload: { level: 'error', args: args.map(String) } });
        originalError.apply(console, args);
      };

      console.warn = function(...args) {
        self.sendToParent({ type: 'log', payload: { level: 'warn', args: args.map(String) } });
        originalWarn.apply(console, args);
      };
    },

    setupAnalytics() {
      // Track clicks
      document.addEventListener('click', (e) => {
        const target = e.target;
        this.sendToParent({
          type: 'event',
          payload: {
            eventType: 'click',
            selector: this.getSelector(target),
            data: {
              tagName: target.tagName,
              textContent: target.textContent?.slice(0, 50),
              x: e.clientX,
              y: e.clientY
            }
          }
        });
      }, true);

      // Track form submissions
      document.addEventListener('submit', (e) => {
        this.sendToParent({
          type: 'event',
          payload: {
            eventType: 'submit',
            selector: this.getSelector(e.target),
            data: { formId: e.target.id }
          }
        });
      }, true);

      // Track scroll
      let scrollTimeout;
      document.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          this.sendToParent({
            type: 'event',
            payload: {
              eventType: 'scroll',
              selector: 'document',
              data: {
                scrollTop: document.documentElement.scrollTop,
                scrollHeight: document.documentElement.scrollHeight
              }
            }
          });
        }, 100);
      }, true);
    },

    getSelector(element) {
      if (!element || element === document.body) return 'body';
      if (element.id) return '#' + element.id;
      if (element.className && typeof element.className === 'string') {
        const classes = element.className.split(' ').filter(c => c).slice(0, 2);
        if (classes.length) return '.' + classes.join('.');
      }
      return element.tagName.toLowerCase();
    }
  };

  window.VoxelBridge = VoxelBridge;

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => VoxelBridge.init(window.__VOXEL_OPTIONS__ || {}));
  } else {
    VoxelBridge.init(window.__VOXEL_OPTIONS__ || {});
  }
})(window);
`;

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Inject the runtime into HTML
 */
export function injectRuntime(
  html: string,
  injections: InjectionConfig[],
  options: RuntimeOptions = {}
): string {
  // Compile injections
  const bundle = compileInjections(injections);

  // Create options script
  const optionsScript = `
<script>
window.__VOXEL_OPTIONS__ = ${JSON.stringify({
    enableLogging: options.enableLogging || false,
    enableAnalytics: options.enableAnalytics || false,
    parentOrigin: options.parentOrigin || '*'
  })};
</script>
`;

  // Create the full injection script
  const injectionScript = `
<script>
// Voxel Prototype Runtime
${bundle.fullScript}

// Communication Bridge
${COMMUNICATION_BRIDGE}
</script>
`;

  // Find insertion point (before </body> or </html> or at end)
  let injectedHtml = html;

  if (html.includes('</body>')) {
    injectedHtml = html.replace('</body>', `${optionsScript}${injectionScript}</body>`);
  } else if (html.includes('</html>')) {
    injectedHtml = html.replace('</html>', `${optionsScript}${injectionScript}</html>`);
  } else {
    injectedHtml = html + optionsScript + injectionScript;
  }

  return injectedHtml;
}

/**
 * Inject only the runtime core (without specific injections)
 */
export function injectRuntimeCore(html: string, options: RuntimeOptions = {}): string {
  const optionsScript = `
<script>
window.__VOXEL_OPTIONS__ = ${JSON.stringify(options)};
</script>
`;

  const runtimeScript = `
<script>
${getRuntimeCore()}
${COMMUNICATION_BRIDGE}
</script>
`;

  if (html.includes('</body>')) {
    return html.replace('</body>', `${optionsScript}${runtimeScript}</body>`);
  } else if (html.includes('</html>')) {
    return html.replace('</html>', `${optionsScript}${runtimeScript}</html>`);
  }
  return html + optionsScript + runtimeScript;
}

/**
 * Create a message handler for iframe communication
 */
export function createMessageHandler(
  onEvent?: (event: RuntimeEventPayload) => void,
  onLog?: (level: string, args: string[]) => void,
  onReady?: () => void,
  onError?: (error: string) => void
): (event: MessageEvent) => void {
  return (event: MessageEvent) => {
    const data = event.data;
    if (!data || data.source !== 'voxel-prototype') return;

    switch (data.type) {
      case 'ready':
        onReady?.();
        break;

      case 'event':
        onEvent?.(data.payload as RuntimeEventPayload);
        break;

      case 'log':
        onLog?.(data.payload.level, data.payload.args);
        break;

      case 'error':
        onError?.(data.payload.message);
        break;
    }
  };
}

/**
 * Send a message to the iframe
 */
export function sendToIframe(
  iframe: HTMLIFrameElement,
  message: { type: string; payload: unknown }
): void {
  iframe.contentWindow?.postMessage(message, '*');
}

/**
 * Execute code in the iframe context
 */
export function executeInIframe(iframe: HTMLIFrameElement, code: string): void {
  sendToIframe(iframe, { type: 'execute', payload: { code } });
}

/**
 * Highlight elements in the iframe
 */
export function highlightInIframe(iframe: HTMLIFrameElement, selector: string): void {
  sendToIframe(iframe, { type: 'highlight', payload: { selector } });
}

/**
 * Clear highlights in the iframe
 */
export function clearHighlightsInIframe(iframe: HTMLIFrameElement): void {
  sendToIframe(iframe, { type: 'clear-highlight', payload: {} });
}

/**
 * Query elements in the iframe
 */
export function queryInIframe(iframe: HTMLIFrameElement, selector: string): void {
  sendToIframe(iframe, { type: 'query', payload: { selector } });
}

// ============================================================================
// React Hook for Iframe Communication
// ============================================================================

export interface UsePrototypeRuntimeOptions {
  onEvent?: (event: RuntimeEventPayload) => void;
  onLog?: (level: string, args: string[]) => void;
  onReady?: () => void;
  onError?: (error: string) => void;
}

/**
 * Custom hook for managing prototype runtime communication
 * Usage:
 * ```
 * const { iframeRef, isReady, sendMessage, executeCode } = usePrototypeRuntime({
 *   onEvent: (e) => console.log('Event:', e),
 *   onReady: () => console.log('Prototype ready')
 * });
 * ```
 */
export function createRuntimeController(options: UsePrototypeRuntimeOptions = {}) {
  let iframeRef: HTMLIFrameElement | null = null;
  let isReady = false;
  let messageHandler: ((event: MessageEvent) => void) | null = null;

  const connect = (iframe: HTMLIFrameElement) => {
    iframeRef = iframe;

    // Setup message handler
    messageHandler = createMessageHandler(
      options.onEvent,
      options.onLog,
      () => {
        isReady = true;
        options.onReady?.();
      },
      options.onError
    );

    window.addEventListener('message', messageHandler);
  };

  const disconnect = () => {
    if (messageHandler) {
      window.removeEventListener('message', messageHandler);
      messageHandler = null;
    }
    iframeRef = null;
    isReady = false;
  };

  const sendMessage = (type: string, payload: unknown) => {
    if (iframeRef) {
      sendToIframe(iframeRef, { type, payload });
    }
  };

  const executeCode = (code: string) => {
    if (iframeRef) {
      executeInIframe(iframeRef, code);
    }
  };

  const highlight = (selector: string) => {
    if (iframeRef) {
      highlightInIframe(iframeRef, selector);
    }
  };

  const clearHighlights = () => {
    if (iframeRef) {
      clearHighlightsInIframe(iframeRef);
    }
  };

  return {
    connect,
    disconnect,
    sendMessage,
    executeCode,
    highlight,
    clearHighlights,
    getIsReady: () => isReady,
    getIframe: () => iframeRef
  };
}
