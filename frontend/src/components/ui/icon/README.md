# Icon

A typed icon component for the IFEN Dashboard that provides optimized SVG icons using Next.js Image.

## Features

- 🎯 TypeScript support with strict icon name typing
- ⚡ Optimized with Next.js Image component
- 📏 Configurable size and styling
- 🔒 Type-safe icon selection
- 🎨 CSS class support for custom styling

## Usage

### Basic Usage

```tsx
import { Icon } from "@/components/ui";

function MyComponent() {
  return (
    <Icon name="home" />
  );
}
```

### With Custom Size

```tsx
<Icon name="play" width={24} height={24} />
```

### With Custom Styling

```tsx
<Icon name="arrow" className="text-blue-500 hover:text-blue-700" />
```

## Available Icons

| Icon Name | Description | Path |
|-----------|-------------|------|
| `home` | Home icon | `/images/icons/home.svg` |
| `arrow` | Arrow circle right | `/images/icons/arrow-circle-right.svg` |
| `play` | Play icon | `/images/icons/play.svg` |

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `IconName` | - | **Required.** The name of the icon to display |
| `className` | `string` | `"w-5 h-5"` | Additional CSS classes for styling |
| `width` | `number` | `20` | Icon width in pixels |
| `height` | `number` | `20` | Icon height in pixels |

## IconName Type

```typescript
type IconName = "home" | "arrow" | "play";
```

## Examples

### Navigation Icons
```tsx
<Icon name="home" className="mr-2" />
<span>Home</span>
```

### Action Buttons
```tsx
<button className="flex items-center">
  <Icon name="play" className="mr-2" />
  Start
</button>
```

### Custom Sizing
```tsx
<Icon name="arrow" width={32} height={32} />
```

## Notes

- Only predefined icons from the `iconMap` are supported
- Component returns `null` if an invalid icon name is provided
- Uses Next.js `Image` component for automatic optimization
- Default size is 20x20 pixels (w-5 h-5 in Tailwind)
- Icons are loaded from the `/public/images/icons/` directory</content>
<parameter name="filePath">/home/solo/JUNK/CLN/ifen-dashboard/src/components/ui/Icon/README.md
