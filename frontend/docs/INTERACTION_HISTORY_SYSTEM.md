# Interaction History System - Global Documentation

## Overview
The Interaction History System is a session-based state management solution that tracks which items users interact with in admin tables. It remembers the last clicked item per route and highlights it when users return to that page, improving user experience and navigation awareness.

## Purpose
- **Track user interactions** across different admin routes
- **Persist selection state** during admin sessions
- **Highlight last interacted row** for visual feedback
- **Maintain context** when navigating between admin sections

## Architecture

### Components

#### 1. **Zustand Store** (`src/zustand/stores/ui.ts`)
Central state management using Zustand with sessionStorage persistence.

```typescript
export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      lastInteractedItems: {},
      // ... other properties
      
      setLastInteractedItem: (route: AdminRoute, itemId: string) => void,
      clearLastInteractedItem: (route: AdminRoute) => void,
      clearAllLastInteractedItems: () => void,
    }),
    {
      name: "ui-store",
      storage: sessionStorage, // Session-based persistence
    }
  )
);
```

**Key Features:**
- Stores interaction history per route
- Auto-persists to `sessionStorage`
- Data cleared on browser session end
- Survives page refreshes within same session

#### 2. **Hook: useTableInteraction** (`src/hooks/useTableInteraction.ts`)
Provides a reactive interface for table components to handle interactions.

```typescript
export const useTableInteraction = (route: AdminRoute) => {
  const lastInteractedId = useUIStore(
    (state) => state.lastInteractedItems[route]
  );

  const handleInteraction = useCallback(
    (itemId: string) => setLastInteractedItem(route, itemId),
    [route, setLastInteractedItem]
  );

  const isLastInteracted = useCallback(
    (itemId: string) => lastInteractedId === itemId,
    [lastInteractedId]
  );

  return { handleInteraction, isLastInteracted };
};
```

**Usage:**
```typescript
const { handleInteraction, isLastInteracted } = useTableInteraction("/admin/course");

// Call when user interacts with item
handleInteraction(courseId);

// Check if item is the last interacted one
isLastInteracted(courseId) // Returns boolean
```

#### 3. **Hook: useRouteTracking** (`src/hooks/useRouteTracking.ts`)
Manages session lifecycle and clears history when appropriate.

```typescript
export const useRouteTracking = () => {
  const pathname = usePathname();
  const clearAll = useUIStore((state) => state.clearAllLastInteractedItems);

  useEffect(() => {
    const prevPathname = prevPathnameRef.current;

    // Only clear when leaving admin section entirely
    if (prevPathname.startsWith("/admin") && !pathname.startsWith("/admin")) {
      clearAll();
    }

    prevPathnameRef.current = pathname;
  }, [pathname, clearAll]);
};
```

**Behavior:**
- Preserves history when navigating between admin routes
- Clears history only when leaving `/admin/*` completely
- Integrated in `/admin/layout.tsx`

#### 4. **Component: InteractiveTableRow** (`src/components/ui/table/InteractiveTableRow.tsx`)
Visual component that highlights the last interacted row.

```typescript
export const InteractiveTableRow = ({
  children,
  isLastInteracted = false,
}: InteractiveTableRowProps) => {
  return (
    <Table.Row
      className={`
        hover:bg-[var(--Primary-light)] 
        transition-colors duration-150 
        ${isLastInteracted ? "bg-pressed-bg" : ""}
      `}
    >
      {children}
    </Table.Row>
  );
};
```

**Styling:**
- `hover:bg-[var(--Primary-light)]`: Hover effect for all rows
- `bg-pressed-bg`: Special background for last interacted row
- Smooth transitions for better UX

#### 5. **Component: InteractiveLink** (`src/components/ui/table/InteractiveLink.tsx`)
Flexible link component that can work with or without href.

```typescript
export const InteractiveLink = ({
  href,
  children,
  onClick,
}: InteractiveLinkProps) => {
  // Renders as Link if href provided, Button otherwise
  // Handles onClick interactions
};
```

## Supported Routes

The following admin routes support interaction history:

```typescript
type AdminRoute =
  | "/admin/user"
  | "/admin/course"
  | "/admin/section"
  | "/admin/lesson"
  | "/admin/item"
  | "/admin/enrollment"
  | "/admin/tag"
  | "/admin/category";
```

## Implementation Guide

### Basic Setup in a Table Component

```typescript
"use client";

import { useTableInteraction } from "@/hooks/useTableInteraction";
import { InteractiveTableRow } from "@/components/ui/table/InteractiveTableRow";

const MyTable = ({ items }) => {
  // Initialize for your route
  const { handleInteraction, isLastInteracted } = 
    useTableInteraction("/admin/course");

  return (
    <Table.Body>
      {items.map((item) => (
        <InteractiveTableRow
          key={item._id}
          isLastInteracted={isLastInteracted(item._id)}
        >
          <Table.Cell>
            <button onClick={() => handleInteraction(item._id)}>
              Action
            </button>
          </Table.Cell>
          <Table.Cell>{item.name}</Table.Cell>
        </InteractiveTableRow>
      ))}
    </Table.Body>
  );
};
```

### Integration Checklist

- [ ] Import `useTableInteraction` hook with correct route
- [ ] Wrap each row with `InteractiveTableRow` component
- [ ] Pass `isLastInteracted(item._id)` to the component
- [ ] Call `handleInteraction(item._id)` on user actions
- [ ] Use `InteractiveLink` for menu items (optional but recommended)

## Data Flow Diagram

```
User clicks item in table
         ↓
handleInteraction(itemId) called
         ↓
setLastInteractedItem(route, itemId) dispatches action
         ↓
Zustand store updates state
         ↓
sessionStorage persisted automatically
         ↓
useTableInteraction selector triggers re-render
         ↓
InteractiveTableRow highlights row via isLastInteracted prop
```

## Storage Details

### sessionStorage Format
```json
{
  "ui-store": {
    "lastInteractedItems": {
      "/admin/course": "course-id-123",
      "/admin/user": "user-id-456"
    },
    "sidebarCollapsed": true
  }
}
```

### Lifecycle
- **Created:** When user enters admin section
- **Updated:** Each time user interacts with a table row
- **Persisted:** Automatically via sessionStorage
- **Cleared:** When user leaves `/admin/*` section entirely

## Performance Considerations

### Optimizations
1. **useCallback**: Memoized callbacks prevent unnecessary function recreation
2. **Zustand Selectors**: Direct state selection ensures minimal re-renders
3. **InteractiveTableRow Memoization**: Can be wrapped with `memo()` for optimization
4. **sessionStorage**: Lightweight persistence, no network calls

### Best Practices
- Don't store large objects in `lastInteractedItems`
- Use item IDs only (strings/numbers)
- Keep routes consistent with `AdminRoute` type
- Avoid calling `handleInteraction` in render logic

## Common Issues & Solutions

### Issue: History cleared when navigating between routes
**Solution:** This was the root cause fixed in `useRouteTracking.ts`. Now history persists across admin routes.

### Issue: History not updating after interaction
**Problem:** Not using proper Zustand selectors  
**Solution:** Use `const lastId = useUIStore((state) => state.lastInteractedItems[route])`

### Issue: Row not highlighting
**Checklist:**
- Is `isLastInteracted` prop being passed to `InteractiveTableRow`?
- Is `handleInteraction` being called on user action?
- Check browser DevTools → Application → Session Storage → ui-store

### Issue: History persists across sessions
**Expected Behavior:** History is stored in `sessionStorage`, which is cleared when browser tab/window closes. This is intentional for privacy.

## Type Definitions

```typescript
// src/zustand/types/ui.ts

export type AdminRoute =
  | "/admin/user"
  | "/admin/course"
  | "/admin/section"
  | "/admin/lesson"
  | "/admin/item"
  | "/admin/enrollment"
  | "/admin/tag"
  | "/admin/category";

export interface UIStore {
  lastInteractedItems: Partial<Record<AdminRoute, string>>;
  sidebarCollapsed: boolean;
  setLastInteractedItem: (route: AdminRoute, itemId: string) => void;
  clearLastInteractedItem: (route: AdminRoute) => void;
  clearAllLastInteractedItems: () => void;
  toggleSidebar: () => void;
}
```

## Files Involved

```
src/
├── hooks/
│   ├── useTableInteraction.ts      # Main hook for table components
│   └── useRouteTracking.ts         # Route lifecycle management
├── components/ui/table/
│   ├── InteractiveTableRow.tsx     # Row highlighting component
│   └── InteractiveLink.tsx         # Interactive link/button component
├── zustand/
│   ├── stores/
│   │   └── ui.ts                   # Zustand store with persistence
│   └── types/
│       └── ui.ts                   # TypeScript type definitions
└── app/(protected)/admin/
    └── layout.tsx                  # useRouteTracking integration
```

## Future Enhancements

Potential improvements for future versions:

1. **Persist to localStorage** for cross-session history
2. **Add interaction timestamps** to track when items were clicked
3. **Implement interaction analytics** to see popular items
4. **Add context menu position memory** for better UX
5. **Multi-select support** to track multiple interacted items
6. **Undo/Redo history** for interaction state

## Testing

### Manual Testing Checklist
- [ ] Click item on `/admin/course` → Row highlights
- [ ] Navigate to `/admin/user` → Return to `/admin/course` → Row still highlighted
- [ ] Refresh page on any admin route → Highlight persists
- [ ] Click different item → Previous highlight removed, new one applied
- [ ] Leave admin section → Return to admin → Highlight restored
- [ ] Close and reopen browser tab → Highlight cleared (sessionStorage cleared)

### Debug Mode
Enable sessionStorage inspection in browser DevTools:
1. Open DevTools → Application tab
2. Navigate to Session Storage → Select your domain
3. Look for "ui-store" key to see current state

## Related Documentation

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Next.js Navigation Hooks](https://nextjs.org/docs/app/api-reference/functions/use-pathname)
- [sessionStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)
- [Radix UI Themes](https://www.radix-ui.com/themes/docs/overview/getting-started)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-29 | Initial implementation with route-based interaction tracking |
| 1.1 | 2025-12-29 | Fixed history clearing issue, improved `useRouteTracking` logic |

## Questions & Support

For questions about the Interaction History System:
1. Check this documentation first
2. Review the example implementations in existing components
3. Check sessionStorage in DevTools to debug state
4. Review git history for recent changes to core files
