# CLAUDE.md - AI Assistant Guidelines for Vibebuff

## Critical Rules

### Icons - MANDATORY
- **ONLY use `lucide-react` for all icons**
- **NEVER use system emojis or unicode icons** (no 🎮 ⭐ 🔍 ❌ ✅ etc.)
- **NEVER use HTML entities** for icons
- **NEVER use other icon libraries** (Font Awesome, Heroicons, Material Icons, etc.)

```tsx
// CORRECT
import { Search, Star, Gamepad2, Check, X } from "lucide-react";
<Search className="w-4 h-4" />

// WRONG - DO NOT DO THIS
<span>🔍</span>  // NO emojis
<span>⭐</span>  // NO unicode
```

### Code Style
- Do NOT add or delete comments unless explicitly requested
- Preserve existing code structure and patterns
- Use TypeScript for all files
- Follow the existing pixel/retro gaming aesthetic

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 |
| Components | Radix UI, Custom Pixel* components |
| Icons | lucide-react |
| Backend | Convex |
| Auth | Clerk |
| Animations | Framer Motion |
| Flow Diagrams | @xyflow/react |

## Project Structure

```
src/
├── app/          # Next.js App Router pages
├── components/   # React components
│   ├── ui/       # Base UI components (shadcn)
│   └── pixel-*   # Custom pixel-styled components
├── lib/          # Utilities
convex/           # Convex backend functions
docs/             # Documentation
```

## Custom Components

Use these pixel-styled components for consistency:
- `PixelCard`, `PixelCardHeader`, `PixelCardTitle`, `PixelCardContent`
- `PixelButton`
- `PixelBadge`
- `PixelInput`

## Convex Backend

When modifying files in the `convex/` folder, you MUST sync the functions to the dev deployment:

```bash
npx convex dev --once
```

This ensures the deployed Convex functions match the local code. Failing to do this will cause runtime errors if validators or function signatures have changed.

## When Making Changes

1. Check for existing patterns in the codebase
2. Use lucide-react icons exclusively
3. Maintain the retro gaming aesthetic
4. Test that changes don't break existing functionality
5. If Convex functions were modified, run `npx convex dev --once`

## After Completing Features

**MANDATORY**: After completing any feature or making significant changes, verify the production build:

```bash
pnpm build
```

This catches:
- TypeScript compilation errors
- Next.js static generation issues
- Route handler problems
- Missing Response objects
- Runtime errors in production mode

**A feature is NOT complete until `pnpm build` succeeds.**
