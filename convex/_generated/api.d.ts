/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as achievements from "../achievements.js";
import type * as architect from "../architect.js";
import type * as battlePass from "../battlePass.js";
import type * as battles from "../battles.js";
import type * as categories from "../categories.js";
import type * as challenges from "../challenges.js";
import type * as compare from "../compare.js";
import type * as compatibility from "../compatibility.js";
import type * as debates from "../debates.js";
import type * as decks from "../decks.js";
import type * as draft from "../draft.js";
import type * as events from "../events.js";
import type * as evolution from "../evolution.js";
import type * as fusions from "../fusions.js";
import type * as graveyard from "../graveyard.js";
import type * as guilds from "../guilds.js";
import type * as interviews from "../interviews.js";
import type * as loot from "../loot.js";
import type * as lore from "../lore.js";
import type * as mastery from "../mastery.js";
import type * as mentorship from "../mentorship.js";
import type * as metaReports from "../metaReports.js";
import type * as packs from "../packs.js";
import type * as parties from "../parties.js";
import type * as popularity from "../popularity.js";
import type * as predictions from "../predictions.js";
import type * as questHistory from "../questHistory.js";
import type * as relationships from "../relationships.js";
import type * as replays from "../replays.js";
import type * as reviews from "../reviews.js";
import type * as roguelike from "../roguelike.js";
import type * as seed from "../seed.js";
import type * as simulator from "../simulator.js";
import type * as speedruns from "../speedruns.js";
import type * as startupStories from "../startupStories.js";
import type * as synergies from "../synergies.js";
import type * as templates from "../templates.js";
import type * as tierLists from "../tierLists.js";
import type * as timeMachine from "../timeMachine.js";
import type * as toolUsage from "../toolUsage.js";
import type * as tools from "../tools.js";
import type * as trading from "../trading.js";
import type * as trophyRoom from "../trophyRoom.js";
import type * as userProfiles from "../userProfiles.js";
import type * as voting from "../voting.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  achievements: typeof achievements;
  architect: typeof architect;
  battlePass: typeof battlePass;
  battles: typeof battles;
  categories: typeof categories;
  challenges: typeof challenges;
  compare: typeof compare;
  compatibility: typeof compatibility;
  debates: typeof debates;
  decks: typeof decks;
  draft: typeof draft;
  events: typeof events;
  evolution: typeof evolution;
  fusions: typeof fusions;
  graveyard: typeof graveyard;
  guilds: typeof guilds;
  interviews: typeof interviews;
  loot: typeof loot;
  lore: typeof lore;
  mastery: typeof mastery;
  mentorship: typeof mentorship;
  metaReports: typeof metaReports;
  packs: typeof packs;
  parties: typeof parties;
  popularity: typeof popularity;
  predictions: typeof predictions;
  questHistory: typeof questHistory;
  relationships: typeof relationships;
  replays: typeof replays;
  reviews: typeof reviews;
  roguelike: typeof roguelike;
  seed: typeof seed;
  simulator: typeof simulator;
  speedruns: typeof speedruns;
  startupStories: typeof startupStories;
  synergies: typeof synergies;
  templates: typeof templates;
  tierLists: typeof tierLists;
  timeMachine: typeof timeMachine;
  toolUsage: typeof toolUsage;
  tools: typeof tools;
  trading: typeof trading;
  trophyRoom: typeof trophyRoom;
  userProfiles: typeof userProfiles;
  voting: typeof voting;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
