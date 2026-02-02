/**
 * Visual Builder Components Index
 * Export all Visual Builder components and utilities
 */

// Main Components
export { default as VisualCanvas } from './VisualCanvas';
export { default as ComponentLibrary } from './ComponentLibrary';
export { default as PropertyInspector } from './PropertyInspector';
export { default as InteractionEditor } from './InteractionEditor';
export { default as ExportPreview } from './ExportPreview';

// Types
export type { CanvasElement, CanvasElementContent, VisualCanvasProps } from './VisualCanvas';
export type { ComponentLibraryProps } from './ComponentLibrary';
export type { PropertyInspectorProps } from './PropertyInspector';
export type {
  InteractionEditorProps,
  Interaction,
  InteractionTrigger,
  InteractionAction,
  InteractionConfig,
} from './InteractionEditor';
export type { ExportPreviewProps } from './ExportPreview';

// Canvas Elements
export * from './elements';
