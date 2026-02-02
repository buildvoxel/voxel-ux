/**
 * Canvas Elements Index
 * Export all canvas element components and their utilities
 */

// Chart Element
export { default as ChartElement, ChartTypeSelector, createDefaultChartConfig } from './ChartElement';
export type { ChartType, ChartDataPoint, ChartConfig, ChartElementProps } from './ChartElement';

// Drawing Tool
export { default as DrawingTool, createDefaultDrawingConfig } from './DrawingTool';
export type { DrawingMode, Point, PathData, DrawingConfig, DrawingToolProps } from './DrawingTool';

// Animation Element
export { default as AnimationElement, AnimationConfigEditor, createDefaultAnimationConfig, SAMPLE_LOTTIE_URLS } from './AnimationElement';
export type { AnimationType, CSSAnimationPreset, AnimationConfig, AnimationElementProps } from './AnimationElement';
