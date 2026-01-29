# Button

Flexible, accessible button component for the IFEN Dashboard design system.

## Features

- 🎨 Figma-compliant design with exact color tokens
- ♿ Full accessibility support (ARIA, keyboard navigation)
- 🔄 Complete state management (hover, focus, active, disabled)
- 🎯 TypeScript support with proper interfaces
- 📱 Responsive and consistent sizing
- 🎪 Icon support with start and end icons

## Usage

### Basic Usage

```tsx
import { Button } from "@/components/ui";

function MyComponent() {
  return (
    <Button onClick={() => console.log("Clicked!")}>
      Click me
    </Button>
  );
}
```

### With Icons

```tsx
// Start icon
<Button startIcon={<span>🔍</span>}>Search</Button>

// End icon
<Button endIcon={<span>→</span>}>Next</Button>

// Icon only
<Button variant="icon" aria-label="Notifications">🔔</Button>
```

### Variants

```tsx
// Default button (text with background)
<Button>Default Button</Button>

// Icon button (light background, icon-only)
<Button variant="icon">⭐</Button>

// Light button (white background, accent text)
<Button variant="light">Light Button</Button>
```

### States

All buttons automatically handle these states:
- **Default**: Base styling
- **Hover**: Darker background (`--Accent-dark-1`)
- **Pressed/Active**: Darkest background (`--Accent-dark-2`)
- **Focused**: Ring indicator + background change
- **Disabled**: Light background with reduced opacity

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "icon" \| "light"` | `"default"` | Button style variant |
| `startIcon` | `React.ReactNode` | `undefined` | Leading icon element |
| `endIcon` | `React.ReactNode` | `undefined` | Trailing icon element |
| `disabled` | `boolean` | `false` | Disables the button |
| `className` | `string` | `""` | Additional CSS classes |
| `...props` | `ButtonHTMLAttributes` | - | All native button props |

## Accessibility

- Uses semantic `<button>` element
- Supports all native button attributes
- Focus management with visible indicators
- ARIA labels for icon-only buttons
- Keyboard navigation support

## Design Tokens

Uses these CSS variables from `globals.css`:

- `--Primary-light`: Light backgrounds
- `--Accent-default`: Primary color
- `--Accent-dark-1`: Hover state
- `--Accent-dark-2`: Active/pressed state
- `--Accent-light`: Disabled state

## Examples

### Action Buttons
```tsx
<Button>Save Changes</Button>
<Button startIcon={<span>💾</span>}>Save</Button>
<Button disabled>Processing...</Button>
```

### Navigation
```tsx
<Button variant="icon" aria-label="Home">🏠</Button>
<Button variant="icon" aria-label="Settings">⚙️</Button>
```

### Form Actions
```tsx
<Button type="submit">Submit Form</Button>
<Button variant="icon" type="button" aria-label="Clear">🗑️</Button>
```

### With Icons
```tsx
<Button startIcon={<span>📧</span>}>Send Email</Button>
<Button endIcon={<span>↓</span>}>Download</Button>
<Button variant="light" startIcon={<span>🔗</span>}>External Link</Button>
```

## Notes

- Icon buttons require `aria-label` for accessibility
- Colors automatically adapt to your theme
- Smooth transitions on all state changes
- Consistent 48px height across variants</content>
<parameter name="filePath">/home/solo/JUNK/CLN/ifen-dashboard/src/components/ui/Button/README.md
