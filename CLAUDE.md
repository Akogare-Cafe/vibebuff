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

## When Making Changes

1. Check for existing patterns in the codebase
2. Use lucide-react icons exclusively
3. Maintain the retro gaming aesthetic
4. Test that changes don't break existing functionality
