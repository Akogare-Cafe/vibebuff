# Timeline Auto-Mapping Feature

## Overview

The timeline at https://www.vibebuff.com/timeline now automatically checks and maps new tools based on their release dates from external data sources (GitHub and npm).

## How It Works

### Automatic Release Date Detection

The system automatically extracts release dates from:
1. **GitHub**: `externalData.github.createdAt` - Repository creation date
2. **npm**: `externalData.npm.firstPublished` - First package publication date

### New Tool Detection

Tools added to the database within the last 30 days are automatically flagged as "recently added" and display a **NEW** badge on the timeline.

## Changes Made

### Backend (`convex/tools.ts`)

Enhanced the `getToolsForTimeline` query to:
- Calculate if a tool was added in the last 30 days
- Include `isRecentlyAdded` flag in the response
- Include `addedToDbAt` timestamp for tracking

```typescript
const now = Date.now();
const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
const isRecentlyAdded = tool._creationTime > thirtyDaysAgo;
```

### Frontend (`src/app/timeline/page.tsx`)

Added visual indicators for new tools:
- **NEW** badge with green styling for recently added tools
- Plus icon from lucide-react
- Updated TypeScript types to include new fields

## Visual Indicators

- **Featured Tools**: Sparkles icon
- **Open Source**: Unlock icon + "OSS" label
- **Recently Added**: Green "NEW" badge with Plus icon
- **Release Date**: Calendar badge showing when the tool was originally released

## Automatic Behavior

When a new tool is added to the database:
1. The system automatically checks for release date in `externalData`
2. If a release date exists, the tool appears on the timeline
3. For the first 30 days, the tool displays a "NEW" badge
4. Tools are sorted by their actual release date (not when added to DB)
5. Tools are grouped by year on the timeline

## No Manual Mapping Required

The timeline automatically updates whenever:
- A new tool is added to the database
- External data is fetched/updated for existing tools
- Release date information becomes available

All tools with valid release dates are automatically included in the timeline view.
