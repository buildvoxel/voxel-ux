/**
 * Typography Constants
 * Standardized typography styles for consistent UI across the app
 */

export const TYPOGRAPHY = {
  /**
   * Page title - Main heading on each page
   * Used for: "Prototypes", "Screens", "Insights", etc.
   */
  pageTitle: {
    fontSize: '1.75rem',  // 28px - slightly smaller than before for cleaner look
    fontWeight: 600,
    lineHeight: 1.3,
  },

  /**
   * Section title - Major sections within a page
   * Used for: Card headers, section dividers
   */
  sectionTitle: {
    fontSize: '1.25rem',  // 20px
    fontWeight: 600,
    lineHeight: 1.4,
  },

  /**
   * Subsection title - Minor sections
   * Used for: Form group labels, sidebar headings
   */
  subsectionTitle: {
    fontSize: '1rem',  // 16px
    fontWeight: 600,
    lineHeight: 1.5,
  },

  /**
   * Card title - Titles on cards
   * Used for: ThumbnailCard, StatCard titles
   */
  cardTitle: {
    fontSize: '0.875rem',  // 14px
    fontWeight: 600,
    lineHeight: 1.4,
  },

  /**
   * Body text - Standard paragraph text
   */
  body: {
    fontSize: '0.875rem',  // 14px
    fontWeight: 400,
    lineHeight: 1.6,
  },

  /**
   * Small text - Secondary information
   */
  small: {
    fontSize: '0.75rem',  // 12px
    fontWeight: 400,
    lineHeight: 1.5,
  },

  /**
   * Overline - Category labels, section indicators
   */
  overline: {
    fontSize: '0.7rem',  // 11px
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
  },
};

/**
 * Get page title styles with theme support
 */
export const getPageTitleStyles = (config: { fonts: { display: string }; colors: { textPrimary: string } }, mode: string) => ({
  fontFamily: config.fonts.display,
  ...TYPOGRAPHY.pageTitle,
  fontWeight: mode === 'craftsman' ? 400 : TYPOGRAPHY.pageTitle.fontWeight,
  color: config.colors.textPrimary,
});

/**
 * Get section title styles with theme support
 */
export const getSectionTitleStyles = (config: { fonts: { display: string }; colors: { textPrimary: string } }, mode: string) => ({
  fontFamily: config.fonts.display,
  ...TYPOGRAPHY.sectionTitle,
  fontWeight: mode === 'craftsman' ? 400 : TYPOGRAPHY.sectionTitle.fontWeight,
  color: config.colors.textPrimary,
});
