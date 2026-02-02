/**
 * Injection Engine - Main Export
 *
 * Provides interactivity to static HTML prototypes through:
 * - DOM analysis to find injection points
 * - Injection compilation to generate runtime scripts
 * - Mock data generation for realistic content
 * - Runtime execution in sandboxed iframes
 */

// Export all modules
export * from './domAnalyzer';
export * from './injectionCompiler';
export * from './prototypeRuntime';
export * from './mockDataGenerator';

// Re-export main functions for convenience
export { analyzeForInjections, getAnalysisSummaryForLLM } from './domAnalyzer';
export { compileInjections, compileInjection, INJECTION_TYPES } from './injectionCompiler';
export { injectRuntime, injectRuntimeCore, createMessageHandler, createRuntimeController } from './prototypeRuntime';
export { generateFromPreset, generateRows, populateTable, getAvailablePresets, PREDEFINED_SCHEMAS } from './mockDataGenerator';
