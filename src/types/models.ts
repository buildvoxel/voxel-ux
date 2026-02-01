export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: User[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface SelectOption {
  label: string;
  value: string | number;
}

// Voxel Types

export interface ScreenVersion {
  id: string;
  html: string;
  createdAt: string;
  createdBy?: string;
  prompt?: string; // AI prompt that generated this version
  description?: string;
}

export interface CapturedScreen {
  id: string;
  name: string;
  fileName: string;
  filePath: string;
  capturedAt: string;
  thumbnail?: string;
  source?: string;
  tags?: string[];
  // Editing support
  editedHtml?: string; // Current edited HTML (overrides filePath when present)
  versions?: ScreenVersion[]; // Version history
  currentVersionId?: string;
  updatedAt?: string;
}

export interface ExtractedComponent {
  id: string;
  name: string;
  screenId: string;
  html: string;
  thumbnail?: string;
  category?: string;
  tags?: string[];
}

export interface Prototype {
  id: string;
  name: string;
  screenId: string;
  html: string;
  createdAt: string;
  updatedAt: string;
}

export interface Variant {
  id: string;
  prototypeId: string;
  name: string;
  label: 'A' | 'B' | 'C' | 'D';
  html: string;
  createdAt: string;
}

export interface ProductContext {
  id: string;
  name: string;
  type: 'text' | 'pdf' | 'video' | 'url';
  content: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  prototypeId: string;
  variantId?: string;
  userId: string;
  content: string;
  position?: { x: number; y: number };
  resolved: boolean;
  createdAt: string;
}

// UX Guidelines - extracted from product videos to guide prototype generation
export interface UXGuideline {
  id: string;
  category: UXGuidelineCategory;
  title: string;
  description: string;
  examples?: string[];
}

export type UXGuidelineCategory =
  | 'navigation'      // How users navigate between screens/sections
  | 'interaction'     // Button behaviors, form patterns, click/hover states
  | 'feedback'        // Loading states, success/error messages, confirmations
  | 'layout'          // Spacing patterns, component placement conventions
  | 'content'         // Tone of voice, labeling conventions, microcopy
  | 'accessibility'   // A11y patterns, keyboard nav, screen reader considerations
  | 'flow';           // Multi-step processes, wizard patterns, state transitions

export interface UXGuidelinesSet {
  id: string;
  name: string;
  sourceVideoId?: string;      // ID of video context file used to extract
  sourceVideoName?: string;
  guidelines: UXGuideline[];
  createdAt: string;
  updatedAt: string;
}
