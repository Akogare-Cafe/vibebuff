# VibeBuff - Complete App Features & Architecture

> Comprehensive documentation of all features, pages, and systems in the VibeBuff platform.

---

## Overview

**VibeBuff** is an AI-powered tech stack recommendation platform with a **retro gaming/RPG aesthetic**. It helps developers discover, compare, and build optimal technology stacks for their projects through gamified experiences.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15 (App Router) |
| **UI** | React 19 + Tailwind CSS v4 |
| **Backend/DB** | Convex (realtime database) |
| **Auth** | Clerk |
| **Icons** | lucide-react (exclusively) |
| **Animations** | Framer Motion |
| **Flow Diagrams** | @xyflow/react |
| **Components** | Custom Pixel* components + shadcn/ui |

---

## App Pages & Routes

### Core Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | `src/app/page.tsx` | **Home** - Hero section, tool search, featured tools, category browsing |
| `/tools` | `src/app/tools/page.tsx` | **Tools Browser** - RPG-style inventory view of all dev tools with rarity tiers |
| `/tools/[slug]` | `src/app/tools/[slug]/` | **Tool Detail** - Individual tool pages |
| `/quest` | `src/app/quest/page.tsx` | **Quest Mode** - AI-powered questionnaire for stack recommendations |
| `/compare` | `src/app/compare/page.tsx` | **Compare Tools** - Side-by-side tool comparison |
| `/compare/[slug]` | `src/app/compare/[slug]/` | **SEO Comparison** - Pre-built comparison pages |
| `/profile` | `src/app/profile/page.tsx` | **User Profile** - RPG character sheet with stats, skill tree, inventory, badges |
| `/stack-builder` | `src/app/stack-builder/page.tsx` | **Visual Stack Builder** - Drag-and-drop flow diagram for building stacks |
| `/deck/[token]` | `src/app/deck/[token]/` | **Shared Deck** - View shared deck loadouts |

### Static/Auth Pages

| Route | Description |
|-------|-------------|
| `/about` | About page |
| `/blog` | Blog with SEO content |
| `/contact` | Contact form |
| `/privacy`, `/terms` | Legal pages |
| `/sign-in`, `/sign-up`, `/forgot-password`, `/sso-callback` | Auth flows |
| `/get-started` | Onboarding |

---

## Major Features (30+ Gamified Systems)

### 1. Core Tool Management

| Feature | Description | Schema Tables |
|---------|-------------|---------------|
| **Tool Database** | Comprehensive dev tools with categories, pricing, pros/cons, RPG stats | `tools`, `categories`, `pricingTiers` |
| **Tool Synergies** | Combo/integration/conflict relationships between tools | `toolSynergies` |
| **Tool Search & Filtering** | By category, pricing model, features | - |

### 2. Gamification & Progression

| Feature | Description | Schema Tables |
|---------|-------------|---------------|
| **User Profiles & XP** | Level system, titles, stats tracking | `userProfiles` |
| **Achievements & Badges** | Unlockable rewards (exploration, collection, social, mastery) | `achievements`, `userAchievements` |
| **Tool Mastery** | Per-tool XP and mastery levels (novice to grandmaster) | `toolMastery` |
| **Daily/Weekly Loot Drops** | Featured tool discoveries with bonus XP | `lootDrops`, `userLootClaims` |
| **Streaks** | Daily login rewards | `userStreaks` |

### 3. Deck Building & Collections

| Feature | Description | Schema Tables |
|---------|-------------|---------------|
| **Card Collection & Deck Building** | Create tool "loadouts" with synergy scoring | `userDecks`, `userCollection` |
| **Stack Templates** | Pre-built stacks for different project types (indie, startup, enterprise) | `stackTemplates` |
| **Gacha/Pack System** | Open packs to discover tools with rarity tiers | `packTypes`, `userPackOpens` |
| **Tier List Builder** | Create S/A/B/C/D tier rankings | `tierLists`, `tierListVotes` |

### 4. Competitive & Social

| Feature | Description | Schema Tables |
|---------|-------------|---------------|
| **Boss Battle Mode** | Tool vs tool battles with RPG stats | `battleHistory` |
| **Legendary Tool Voting** | Monthly category voting | `monthlyVotingPeriods`, `toolVotes` |
| **Party System** | Team collaboration on decks | `parties`, `partyMembers`, `partyDecks`, `partyComments` |
| **Guild System** | Team stacks and guild challenges | `guilds`, `guildMembers`, `guildStacks`, `guildChallenges` |
| **Trading Post** | Card trading marketplace | `tradableCards`, `tradeListings`, `tradeHistory` |
| **Mentor/Apprentice System** | Learning partnerships | `mentorships`, `mentorChallenges` |
| **Global Chat** | Realtime chat with reactions | `globalChatMessages`, `chatSettings`, `chatUserState` |

### 5. Advanced Game Modes

| Feature | Description | Schema Tables |
|---------|-------------|---------------|
| **Tool Draft Mode** | Multiplayer drafting lobbies | `draftLobbies`, `draftPlayers`, `draftVotes` |
| **Roguelike Quest Mode** | Room-by-room tool selection challenges | `roguelikeRuns`, `roguelikeLeaderboard` |
| **Stack Simulator/Sandbox** | Test stacks against scenarios | `simulations`, `simulationScenarios` |
| **Stack Architect Puzzles** | Constraint-based stack building challenges | `architectPuzzles`, `puzzleSolutions` |
| **Speedrun Mode** | Timed stack building with leaderboards | `speedrunCategories`, `speedruns`, `weeklyRaces` |
| **Tool Debate Arena** | Structured debates between tools | `debates`, `debateArguments`, `debateVotes` |

### 6. Content & Discovery

| Feature | Description | Schema Tables |
|---------|-------------|---------------|
| **Tool Lore & Encyclopedia** | Origin stories, creator info, version history | `toolLore`, `loreUnlocks` |
| **Tool Evolution & Prestige** | Tool tier progression (bronze to legendary) | `toolEvolutions`, `ogCollectors` |
| **Tool Graveyard** | Deprecated tools with obituaries and migration guides | `toolGraveyard`, `graveyardMemorials`, `resurrectionWatch`, `legacyMigrationGuides` |
| **Time Machine** | Build stacks with historical tool availability | `toolSnapshots`, `timeMachineChallenges`, `timeMachineSubmissions` |
| **Startup Stack Stories** | Real company tech stack case studies | `startupStories` |
| **Tool Relationship Map** | Visual connections between tools | `toolRelationships`, `migrationPaths` |
| **Compatibility Matrix** | Integration scores and guides | `compatibilityScores`, `compatibilityReports` |
| **Tech Trend Predictions** | Betting on tool futures | `predictions`, `predictionBets`, `predictionLeaderboard` |

### 7. Seasonal & Events

| Feature | Description | Schema Tables |
|---------|-------------|---------------|
| **Battle Pass** | Seasonal progression with rewards | `seasons`, `battlePassRewards`, `userSeasonProgress` |
| **Seasonal Events** | Hackathons, retro weeks, framework wars | `seasonalEvents`, `eventParticipants` |
| **Weekly Meta Reports** | Trend analysis and predictions | `metaReports`, `metaPredictionBets` |
| **Stack Replays** | Save and share gameplay highlights | `stackReplays`, `replayVotes`, `weeklyHighlights` |

### 8. Learning & Career

| Feature | Description | Schema Tables |
|---------|-------------|---------------|
| **Stack Interview Prep** | Practice system design scenarios | `interviewScenarios`, `interviewAttempts` |
| **Daily Challenges & Bounty Board** | Quests with XP rewards | `challenges`, `userChallengeProgress` |
| **Quest History & Replay** | Track past recommendations | `questHistory` |

### 9. Analytics & Tracking

| Feature | Description | Schema Tables |
|---------|-------------|---------------|
| **Tool Popularity** | Views, clicks, favorites, trend scores | `toolPopularity`, `toolPopularityEvents` |
| **Tool Usage** | User interaction tracking | `toolUsage` |
| **Tool Comparisons** | Saved comparisons | `toolComparisons` |
| **Trophy Room** | Achievement showcase | `trophyRooms`, `profileFrames` |

---

## Key Components

### Feature Components (`src/components/`)

| Component | Purpose |
|-----------|---------|
| `visual-stack-builder.tsx` | ReactFlow-based drag-and-drop stack designer |
| `deck-loadout.tsx` | Deck management UI |
| `deck-share.tsx` | Deck sharing functionality |
| `tool-reviews.tsx` | User review system |
| `tool-mastery.tsx` | Mastery progression display |
| `tool-fusion.tsx` | Combine tools for bonuses |
| `tool-graveyard.tsx` | Deprecated tools memorial |
| `tool-lore.tsx` | Tool encyclopedia |
| `tool-whispers.tsx` | Tool affinity/recommendations |
| `tool-evolution.tsx` | Tool tier progression |
| `tool-relationship-map.tsx` | Tool connection visualization |
| `tool-affinity-display.tsx` | User tool preferences |
| `tool-nominations-board.tsx` | Tool nomination system |
| `tier-list-builder.tsx` | Drag-and-drop tier lists |
| `trading-post.tsx` | Card trading UI |
| `trophy-room.tsx` | Achievement showcase |
| `speedrun-mode.tsx` | Timed challenges |
| `time-machine.tsx` | Historical stack building |
| `startup-stories.tsx` | Company case studies |
| `synergy-matrix.tsx` | Tool compatibility visualization |
| `compatibility-matrix.tsx` | Integration scoring |
| `skill-tree.tsx` | User skill progression |
| `spin-wheel.tsx` | Gacha/reward wheel |
| `seasonal-events.tsx` | Event participation |
| `seasonal-leaderboard.tsx` | Event rankings |
| `stack-architect.tsx` | Puzzle mode UI |
| `stack-contracts.tsx` | Stack agreements |
| `stack-replays.tsx` | Replay viewer |
| `stack-simulator.tsx` | Sandbox testing |
| `stack-templates.tsx` | Pre-built stacks |
| `quest-history.tsx` | Past quest tracking |
| `xp-activity-feed.tsx` | XP gain notifications |
| `user-profile.tsx` | Profile display |
| `beginner-onboarding.tsx` | New user flow |
| `onboarding.tsx` | Onboarding wrapper |

### Custom UI Components

| Component | Purpose |
|-----------|---------|
| `pixel-button.tsx` | Retro-styled button |
| `pixel-card.tsx` | Retro-styled card container |
| `pixel-badge.tsx` | Retro-styled badge |
| `pixel-input.tsx` | Retro-styled input field |
| `dynamic-icon.tsx` | Dynamic icon loader |
| `header.tsx` | App header |
| `footer.tsx` | App footer |
| `theme-switcher.tsx` | Dark/light mode toggle |

### Provider Components (`src/components/providers/`)

- Theme provider
- Convex client provider
- Clerk auth provider

### UI Components (`src/components/ui/`)

- shadcn/ui base components (11 files)

---

## Convex Backend

### Backend Files (`convex/`)

**77 backend files** organized by feature:

#### Core
| File | Purpose |
|------|---------|
| `schema.ts` | Database schema (~2900 lines, 60+ tables) |
| `tools.ts` | Tool CRUD operations |
| `categories.ts` | Category management |
| `seed.ts` | Database seeding |
| `seedEducation.ts` | Educational content seeding |

#### AI & Recommendations
| File | Purpose |
|------|---------|
| `ai.ts` | AI recommendation generation |
| `toolAffinity.ts` | Tool preference learning |
| `toolWhispers.ts` | Personalized suggestions |
| `compare.ts` | Tool comparison logic |
| `compatibility.ts` | Compatibility scoring |
| `synergies.ts` | Synergy calculations |

#### Gamification
| File | Purpose |
|------|---------|
| `achievements.ts` | Achievement system |
| `battlePass.ts` | Seasonal pass |
| `battles.ts` | Boss battle mode |
| `challenges.ts` | Daily/weekly challenges |
| `dailyQuests.ts` | Quest system |
| `mastery.ts` | Tool mastery |
| `prestige.ts` | Prestige system |
| `streaks.ts` | Login streaks |
| `xpActivity.ts` | XP tracking |

#### Collections & Decks
| File | Purpose |
|------|---------|
| `decks.ts` | Deck management |
| `packs.ts` | Gacha system |
| `trading.ts` | Trading post |
| `tierLists.ts` | Tier list builder |
| `templates.ts` | Stack templates |
| `starterTemplates.ts` | Beginner templates |

#### Game Modes
| File | Purpose |
|------|---------|
| `draft.ts` | Draft mode |
| `roguelike.ts` | Roguelike mode |
| `simulator.ts` | Stack simulator |
| `architect.ts` | Puzzle mode |
| `speedruns.ts` | Speedrun mode |
| `debates.ts` | Debate arena |

#### Social
| File | Purpose |
|------|---------|
| `guilds.ts` | Guild system |
| `parties.ts` | Party system |
| `mentorship.ts` | Mentor system |
| `globalChat.ts` | Realtime chat |
| `reviews.ts` | Tool reviews |
| `voting.ts` | Voting system |
| `communityQA.ts` | Q&A system |

#### Content
| File | Purpose |
|------|---------|
| `lore.ts` | Tool lore |
| `graveyard.ts` | Tool graveyard |
| `evolution.ts` | Tool evolution |
| `timeMachine.ts` | Time machine |
| `startupStories.ts` | Case studies |
| `interviews.ts` | Interview prep |
| `glossary.ts` | Tech glossary |
| `learningPaths.ts` | Learning paths |
| `videoTutorials.ts` | Video content |
| `setupGuides.ts` | Setup guides |

#### Events & Seasons
| File | Purpose |
|------|---------|
| `events.ts` | Seasonal events |
| `leaderboardSeasons.ts` | Seasonal leaderboards |
| `metaReports.ts` | Meta analysis |
| `predictions.ts` | Prediction market |

#### Analytics & SEO
| File | Purpose |
|------|---------|
| `popularity.ts` | Popularity tracking |
| `toolUsage.ts` | Usage analytics |
| `seo.ts` | SEO content |
| `seoBlog.ts` | Blog SEO |

#### Misc
| File | Purpose |
|------|---------|
| `userProfiles.ts` | User management |
| `onboarding.ts` | Onboarding flow |
| `loot.ts` | Loot drops |
| `spinWheel.ts` | Reward wheel |
| `replays.ts` | Replay system |
| `trophyRoom.ts` | Trophy display |
| `stackBuilder.ts` | Stack builder logic |
| `stackContracts.ts` | Stack contracts |
| `relationships.ts` | Tool relationships |
| `fusions.ts` | Tool fusions |
| `comboChains.ts` | Combo system |
| `bountyHunts.ts` | Bounty system |
| `globalRaids.ts` | Raid events |
| `promptPlayground.ts` | AI playground |
| `questHistory.ts` | Quest tracking |
| `beginnerComparisons.ts` | Beginner comparisons |
| `rateLimit.ts` | Rate limiting |

---

## Database Schema Overview

The schema (`convex/schema.ts`) defines **60+ tables** organized into feature groups:

### Core Tables
- `categories` - Tool categories
- `tools` - Development tools
- `pricingTiers` - Tool pricing

### User Tables
- `userProfiles` - User accounts
- `userDecks` - User deck collections
- `userCollection` - Collected tools
- `userAchievements` - Earned achievements
- `toolMastery` - Per-tool mastery
- `toolUsage` - Usage tracking

### Gamification Tables
- `achievements` - Achievement definitions
- `challenges` - Challenge definitions
- `seasons` - Battle pass seasons
- `battlePassRewards` - Season rewards

### Social Tables
- `parties` - Team parties
- `guilds` - Guild organizations
- `mentorships` - Mentor relationships
- `globalChatMessages` - Chat messages

### Content Tables
- `toolLore` - Tool backstories
- `toolGraveyard` - Deprecated tools
- `startupStories` - Case studies
- `predictions` - Trend predictions

---

## File Structure

```
vibebuff/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Home
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css         # Global styles
│   │   ├── tools/              # Tool pages
│   │   ├── quest/              # Quest mode
│   │   ├── compare/            # Comparison pages
│   │   ├── profile/            # User profile
│   │   ├── stack-builder/      # Visual builder
│   │   ├── deck/               # Shared decks
│   │   ├── blog/               # Blog content
│   │   └── [auth pages]/       # Sign in/up, etc.
│   ├── components/             # React components (63 files)
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── providers/          # Context providers
│   │   └── [feature].tsx       # Feature components
│   ├── lib/                    # Utilities
│   └── middleware.ts           # Auth middleware
├── convex/                     # Backend (77 files)
│   ├── schema.ts               # Database schema
│   ├── _generated/             # Generated types
│   └── [feature].ts            # Feature functions
├── docs/                       # Documentation
├── public/                     # Static assets
└── scripts/                    # Build scripts
```

---

## Design System

### Visual Theme
- **Aesthetic**: Retro gaming / RPG / Pixel art
- **Color Scheme**: Dark mode primary with purple accents
- **Typography**: Pixel-style headings, clean body text

### Component Patterns
- Use `Pixel*` components for consistent styling
- All icons from `lucide-react` only
- Framer Motion for animations
- ReactFlow for diagrams

### Code Standards
- TypeScript throughout
- No emojis or unicode symbols in code
- Preserve existing comments
- Follow existing patterns

---

## Related Documentation

- `ARCHITECTURE.md` - System architecture diagrams
- `PRODUCT_PLAN.md` - Product roadmap
- `IMPLEMENTATION_ROADMAP.md` - Development phases
- `UI_WIREFRAMES.md` - Design mockups
- `SEO_STRATEGY.md` - SEO approach
- `TECH_STACK_DATABASE.md` - Tool database structure
- `ADS_MARKETING_STRATEGY.md` - Marketing plans
