# AGENTS.md - Guidelines for AI Coding Agents

## Mandatory Icon Rules

### USE ONLY lucide-react

All icons in this project MUST come from `lucide-react`. This is non-negotiable.

```tsx
import { IconName } from "lucide-react";
<IconName className="w-4 h-4" />
```

### PROHIBITED - Do NOT Use

- **System emojis**: 🎮 ⭐ 🔍 ❌ ✅ 🚀 💡 ⚡ etc.
- **Unicode symbols**: ★ ✓ ✗ → ← ● ○ etc.
- **HTML entities**: `&star;` `&check;` `&times;` etc.
- **Other icon libraries**: Font Awesome, Heroicons, Material Icons, Feather, etc.
- **Inline SVG icons**: Unless creating custom artwork

### Common Icon Mappings

| Instead of | Use from lucide-react |
|------------|----------------------|
| ⭐ | `Star` |
| 🔍 | `Search` |
| ✅ | `Check` or `CheckCircle` |
| ❌ | `X` or `XCircle` |
| 🎮 | `Gamepad2` |
| ⚡ | `Zap` |
| 🔧 | `Wrench` |
| 📦 | `Package` |
| 🗄️ | `Database` |
| 🌐 | `Globe` |

## Code Guidelines

### Comments
- Do NOT add comments unless explicitly requested
- Do NOT delete existing comments unless explicitly requested
- Preserve all existing documentation

### Style
- TypeScript for all files
- Follow existing pixel/retro gaming aesthetic
- Use custom Pixel* components (PixelCard, PixelButton, PixelBadge, PixelInput)

## Tech Stack Reference

- **Next.js 15** - App Router
- **React 19** - UI
- **Tailwind CSS v4** - Styling
- **Radix UI** - Headless components
- **lucide-react** - Icons (ONLY icon library)
- **Convex** - Backend/Database
- **Clerk** - Authentication
- **Framer Motion** - Animations
- **@xyflow/react** - Flow diagrams

## File Structure

```
src/app/           → Pages (App Router)
src/components/    → React components
src/components/ui/ → Base UI (shadcn)
src/lib/           → Utilities
convex/            → Backend functions
docs/              → Documentation
```

## Before Committing Changes

1. Verify NO emojis or unicode icons are present
2. Confirm all icons use lucide-react
3. Check TypeScript compiles without errors
4. Ensure pixel aesthetic is maintained
