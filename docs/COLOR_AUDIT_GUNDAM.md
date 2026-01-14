# VibeBuff Light Mode Color Audit - Gundam Theme

## Color Palette Analysis

### From Gundam Image
- **Primary Blue**: Deep navy/royal blue (#1e40af)
- **White/Light Gray**: Clean white panels (#ffffff, #f8fafc)
- **Yellow/Gold Accents**: Bright yellow details (#fbbf24)
- **Red Accents**: Vibrant red (#dc2626)
- **Dark Gray/Gunmetal**: Structural elements (#475569, #334155)
- **Light Blue**: Panel highlights (#e0e7ff)

## Updated Light Mode Colors

### Core Colors
| Variable | Old Value | New Value | Rationale |
|----------|-----------|-----------|-----------|
| `--background` | `#f8fafc` | `#f8fafc` | ✓ Kept - matches white Gundam panels |
| `--foreground` | `#0f172a` | `#1e293b` | Updated to softer dark gray for better contrast |
| `--card` | `#ffffff` | `#ffffff` | ✓ Kept - pure white like Gundam armor |
| `--card-foreground` | `#0f172a` | `#1e293b` | Matches foreground update |

### Primary Colors (Blue)
| Variable | Old Value | New Value | Rationale |
|----------|-----------|-----------|-----------|
| `--primary` | `#2563eb` | `#1e40af` | Deeper royal blue matching Gundam's main blue |
| `--primary-foreground` | `#ffffff` | `#ffffff` | ✓ Kept - white text on blue |
| `--ring` | `#2563eb` | `#1e40af` | Matches primary for consistency |

### Secondary Colors
| Variable | Old Value | New Value | Rationale |
|----------|-----------|-----------|-----------|
| `--secondary` | `#f1f5f9` | `#e0e7ff` | Light blue tint matching Gundam panel highlights |
| `--secondary-foreground` | `#334155` | `#1e293b` | Better contrast with new secondary |

### Accent Colors
| Variable | Old Value | New Value | Rationale |
|----------|-----------|-----------|-----------|
| `--accent` | `#dc2626` | `#fbbf24` | Changed to yellow/gold matching Gundam's yellow details |
| `--accent-foreground` | `#ffffff` | `#1e293b` | Dark text for better readability on yellow |

### Border & Surface
| Variable | Old Value | New Value | Rationale |
|----------|-----------|-----------|-----------|
| `--border` | `#e2e8f0` | `#cbd5e1` | Slightly darker for better definition |
| `--surface-border` | `#e2e8f0` | `#cbd5e1` | Matches border update |
| `--input` | `#f8fafc` | `#f1f5f9` | Subtle gray for input fields |

### Chart Colors
| Variable | Old Value | New Value | Rationale |
|----------|-----------|-----------|-----------|
| `--chart-1` | `#2563eb` | `#1e40af` | Primary blue |
| `--chart-2` | `#dc2626` | `#dc2626` | ✓ Kept - red accent |
| `--chart-3` | `#eab308` | `#fbbf24` | Brighter yellow/gold |
| `--chart-4` | `#06b6d4` | `#475569` | Gunmetal gray |
| `--chart-5` | `#22c55e` | `#e0e7ff` | Light blue |

### Sidebar Colors
| Variable | Old Value | New Value | Rationale |
|----------|-----------|-----------|-----------|
| `--sidebar` | `#f8fafc` | `#ffffff` | Pure white for cleaner look |
| `--sidebar-primary` | `#2563eb` | `#1e40af` | Matches primary blue |
| `--sidebar-accent` | `#f1f5f9` | `#e0e7ff` | Light blue tint |
| `--sidebar-border` | `#e2e8f0` | `#cbd5e1` | Matches border update |

## Key Changes Summary

1. **Primary Blue**: Deepened from `#2563eb` to `#1e40af` for a more royal, Gundam-like blue
2. **Accent Color**: Changed from red (`#dc2626`) to yellow/gold (`#fbbf24`) to match Gundam's iconic yellow details
3. **Secondary Backgrounds**: Added light blue tint (`#e0e7ff`) for panel-like highlights
4. **Borders**: Slightly darkened for better visual definition
5. **Foreground**: Softened to `#1e293b` for improved readability

## Color Harmony

The updated palette creates a cohesive Gundam-inspired theme:
- **White base** (#ffffff, #f8fafc) - Clean armor panels
- **Royal blue** (#1e40af) - Primary color, main armor sections
- **Light blue** (#e0e7ff) - Secondary highlights, panel details
- **Yellow/Gold** (#fbbf24) - Accent details, important elements
- **Red** (#dc2626) - Destructive/warning states
- **Gunmetal** (#475569) - Structural elements

## Testing Recommendations

1. Check button states with new primary blue
2. Verify accent color (yellow) works for important CTAs
3. Test border visibility with new darker borders
4. Ensure text contrast meets WCAG AA standards
5. Review sidebar appearance with pure white background
