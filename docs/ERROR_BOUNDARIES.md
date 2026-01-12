# Error Boundaries Documentation

## Overview

Comprehensive error boundary implementation for the VibeBuff webapp, providing graceful error handling and user-friendly error UI throughout the application.

## Components

### Core Error Boundary Components

#### `ErrorBoundary` (`src/components/error-boundary.tsx`)
Main error boundary class component that catches React errors in child components.

**Features:**
- Catches JavaScript errors anywhere in child component tree
- Logs error information to console
- Displays fallback UI when errors occur
- Supports custom fallback components
- Reset functionality to recover from errors
- Optional `onError` callback for custom error handling

**Usage:**
```tsx
import { ErrorBoundary } from "@/components/error-boundary";

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

**With custom fallback:**
```tsx
<ErrorBoundary fallback={CustomErrorFallback}>
  <YourComponent />
</ErrorBoundary>
```

#### `DefaultErrorFallback`
Full-page error display with:
- Large error icon with glow effect
- Error message
- Stack trace (development mode only)
- "Try Again" button to reset error
- "Go Home" button to navigate to homepage

#### `CompactErrorFallback`
Compact inline error display for smaller components:
- Minimal error message
- Retry button
- Suitable for embedding within other components

### Route-Level Error Handlers

#### Root Error Handler (`src/app/error.tsx`)
Catches errors at the root application level.

#### Global Error Handler (`src/app/global-error.tsx`)
Catches critical errors that occur outside the normal React tree.

#### Route-Specific Error Handlers
- `/tools/error.tsx` - Tools page errors
- `/admin/error.tsx` - Admin panel errors
- `/battles/error.tsx` - Battle system errors
- `/profile/error.tsx` - Profile page errors
- `/deck/error.tsx` - Deck management errors
- `/stack-builder/error.tsx` - Stack builder errors

### Provider Components

#### `ErrorBoundaryProvider` (`src/components/providers/error-boundary-provider.tsx`)
Wraps the entire application in the root layout, providing top-level error catching.

### Utility Hooks

#### `useErrorHandler` (`src/hooks/use-error-handler.ts`)
Hook for managing error state in components:
```tsx
const { error, handleError, resetError } = useErrorHandler();

try {
  // risky operation
} catch (err) {
  handleError(err);
}
```

#### `useAsyncError`
Hook for throwing errors from async operations to be caught by error boundaries:
```tsx
const throwError = useAsyncError();

async function fetchData() {
  try {
    await riskyAsyncOperation();
  } catch (err) {
    throwError(err); // Will be caught by error boundary
  }
}
```

### 404 Handler

#### `not-found.tsx` (`src/app/not-found.tsx`)
Custom 404 page with:
- Large 404 display
- Search icon overlay
- Navigation options (Home, Browse Tools, Go Back)
- Pixel-styled UI matching app theme

## Architecture

### Error Boundary Hierarchy

```
Root Layout (ErrorBoundaryProvider)
├── Clerk Provider
├── Convex Provider
├── Theme Provider
└── Page Tour Provider
    ├── Header
    ├── Main Content
    │   ├── Route-specific error boundaries
    │   └── Component-level error boundaries
    └── Footer
```

### Error Flow

1. **Error occurs** in a component
2. **Error boundary catches** the error
3. **Error is logged** to console (and can be sent to error tracking service)
4. **Fallback UI renders** with error details
5. **User can retry** or navigate away
6. **Error boundary resets** on retry, re-rendering children

## Best Practices

### When to Use Error Boundaries

✅ **Use error boundaries for:**
- Route segments (pages)
- Complex feature components
- Third-party integrations
- Data fetching components
- Components with external dependencies

❌ **Don't use error boundaries for:**
- Event handlers (use try-catch instead)
- Async code (use try-catch or useAsyncError)
- Server-side rendering errors (use error.tsx files)

### Error Boundary Placement

**High-level boundaries:**
- Protect entire routes
- Provide full-page error UI
- Allow navigation to safety

**Component-level boundaries:**
- Protect specific features
- Use compact error UI
- Allow rest of page to function

### Example: Wrapping a Complex Component

```tsx
import { ErrorBoundary, CompactErrorFallback } from "@/components/error-boundary";

export function MyFeature() {
  return (
    <ErrorBoundary fallback={CompactErrorFallback}>
      <ComplexComponent />
    </ErrorBoundary>
  );
}
```

### Example: Custom Error Handling

```tsx
import { ErrorBoundary } from "@/components/error-boundary";

function handleError(error: Error, errorInfo: React.ErrorInfo) {
  // Send to error tracking service
  console.error("Feature error:", error, errorInfo);
  // Could send to Sentry, LogRocket, etc.
}

<ErrorBoundary onError={handleError}>
  <MyComponent />
</ErrorBoundary>
```

## Testing Error Boundaries

### Manual Testing

Create a test component that throws an error:

```tsx
function ErrorTest() {
  const [shouldError, setShouldError] = useState(false);
  
  if (shouldError) {
    throw new Error("Test error!");
  }
  
  return (
    <button onClick={() => setShouldError(true)}>
      Trigger Error
    </button>
  );
}
```

Wrap it in an error boundary and test:
- Error is caught and displayed
- Error UI shows correct information
- Retry button resets the error
- Navigation buttons work

### Development vs Production

**Development mode:**
- Shows full stack traces
- Displays error names and messages
- Helpful for debugging

**Production mode:**
- Hides technical details
- Shows user-friendly messages
- Maintains professional appearance

## Integration with Error Tracking

To integrate with services like Sentry:

```tsx
import * as Sentry from "@sentry/nextjs";

<ErrorBoundary
  onError={(error, errorInfo) => {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }}
>
  <YourApp />
</ErrorBoundary>
```

## Styling

All error UI components use:
- **PixelCard** for containers
- **PixelButton** for actions
- **lucide-react** icons (AlertTriangle, RefreshCw, Home, etc.)
- Pixel/retro gaming aesthetic
- Consistent with app theme

## Future Enhancements

Potential improvements:
- [ ] Error boundary for Suspense fallbacks
- [ ] Automatic error reporting to backend
- [ ] User feedback form on error pages
- [ ] Error recovery suggestions based on error type
- [ ] A/B testing different error messages
- [ ] Analytics tracking for error occurrences

## Files Created

- `src/components/error-boundary.tsx` - Core error boundary components
- `src/components/providers/error-boundary-provider.tsx` - Root provider
- `src/hooks/use-error-handler.ts` - Error handling hooks
- `src/app/error.tsx` - Root error handler
- `src/app/global-error.tsx` - Global error handler
- `src/app/not-found.tsx` - 404 page
- `src/app/tools/error.tsx` - Tools page error handler
- `src/app/admin/error.tsx` - Admin page error handler
- `src/app/battles/error.tsx` - Battles page error handler
- `src/app/profile/error.tsx` - Profile page error handler
- `src/app/deck/error.tsx` - Deck page error handler
- `src/app/stack-builder/error.tsx` - Stack builder error handler

## Summary

The error boundary system provides comprehensive error handling throughout the VibeBuff webapp with:
- ✅ Graceful error recovery
- ✅ User-friendly error messages
- ✅ Consistent pixel-styled UI
- ✅ Development-friendly debugging
- ✅ Production-ready error handling
- ✅ Route-level and component-level protection
- ✅ Custom 404 handling
