# Page Development Guidelines

## Page Layout Structure

All pages in this application follow a consistent layout structure. The `AppLayout` component provides:
- A sidebar navigation (240px width, collapsible to 64px)
- A top app bar with theme toggle and user menu
- **Main content area with `p: 3` (24px) padding on all sides**

### Root Container

**DO NOT add padding to the page root container.** The `AppLayout` already provides consistent padding.

```tsx
// CORRECT - No padding on root Box
export function MyPage() {
  return (
    <Box>
      <PageHeader title="My Page" />
      {/* Page content */}
    </Box>
  );
}

// INCORRECT - Double padding!
export function MyPage() {
  return (
    <Box sx={{ p: 3 }}> {/* DON'T DO THIS */}
      <PageHeader title="My Page" />
      {/* Page content */}
    </Box>
  );
}
```

## Page Header

Always use the `PageHeader` component for page titles. It provides:
- Consistent typography (uses theme-aware styles)
- Optional subtitle
- Optional action buttons on the right
- Consistent bottom margin (`mb: 3` by default)

```tsx
import { PageHeader } from '@/components/PageHeader';

<PageHeader
  title="Page Title"
  subtitle="Optional description"  // Optional
  actions={<Button>Action</Button>}  // Optional
  mb={4}  // Optional margin override
/>
```

## Standard Page Template

```tsx
import Box from '@mui/material/Box';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui';

export function MyNewPage() {
  return (
    <Box>
      {/* Page Header - Always first */}
      <PageHeader
        title="Page Title"
        subtitle="Brief description of this page"
        actions={
          <Button variant="contained">
            Primary Action
          </Button>
        }
      />

      {/* Page Content */}
      {/* Use Grid, Cards, etc. for layout */}
    </Box>
  );
}
```

## Component Imports

Use the polymorphic UI components from `@/components/ui`:

```tsx
import {
  Button,
  Card,
  CardContent,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  Tabs,
  Tab,
} from '@/components/ui';
```

## Theme-Aware Styling

Access theme colors and config via the store:

```tsx
import { useThemeStore } from '@/store/themeStore';

const { config, mode } = useThemeStore();

// Use config.colors for theme colors
<Box sx={{ color: config.colors.primary }}>

// Check mode for theme-specific behavior
{mode === 'modern' && <ModernFeature />}
```

## Spacing Guidelines

- Use MUI spacing units (1 unit = 8px in standard themes)
- Modern Gradient theme uses compact spacing
- Common patterns:
  - `mb: 3` - Standard section margin
  - `gap: 2` - Standard flex/grid gap
  - `p: 2` - Card content padding (internal)

## Checklist for New Pages

- [ ] Root `<Box>` has NO padding (AppLayout provides it)
- [ ] Uses `<PageHeader>` component for title
- [ ] Imports UI components from `@/components/ui`
- [ ] Uses theme-aware colors via `useThemeStore`
- [ ] Follows responsive patterns (Grid with breakpoints)
