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

## Convex Backend - CRITICAL

**ALWAYS run this command immediately after modifying ANY file in the `convex/` folder:**

```bash
npx convex dev --once --typecheck disable
```

### When to Sync (MANDATORY)
- After editing any `.ts` file in `convex/`
- After changing function signatures or validators
- After adding/removing Convex functions
- After modifying database schema (`schema.ts`)
- Before testing changes in the browser
- Before marking a feature as complete

**Failing to sync will cause "Server Error" runtime errors in the application.**

This command deploys your local Convex functions to the development backend, ensuring the deployed code matches your local changes.

## Before Committing Changes

1. Verify NO emojis or unicode icons are present
2. Confirm all icons use lucide-react
3. Check TypeScript compiles without errors
4. Ensure pixel aesthetic is maintained
5. **If Convex functions were modified, run `npx convex dev --once --typecheck disable` IMMEDIATELY**
6. **Run production build verification**: `pnpm build`

## Feature Completion Checklist

A feature is NOT complete until ALL of these pass:

```bash
# 1. Sync Convex functions (if you modified convex/ folder)
npx convex dev --once --typecheck disable

# 2. Verify production build
pnpm build
```

The build must succeed with:
- Zero TypeScript errors
- All pages/routes generating successfully
- No prerender errors
- All route handlers returning proper Response objects

**Do NOT mark a feature as complete if the build fails.**

### Common Mistake to Avoid
If you see "Server Error" in the browser console mentioning Convex functions, you forgot to run `npx convex dev --once`. Run it immediately.

## HMR Module Instantiation Errors

If you encounter errors like:
- `Module was instantiated because it was required from module... but the module factory is not available`
- `It might have been deleted in an HMR update`
- Clerk/React module instantiation failures

**This is a Hot Module Replacement cache corruption issue.**

### Fix

Run the clean script and restart the dev server:

```bash
pnpm clean
pnpm dev
```

Then hard refresh the browser (Cmd+Shift+R / Ctrl+Shift+R).

### When This Happens
- After package updates
- After switching branches with different dependencies
- After interrupted builds
- Random HMR state corruption during development
