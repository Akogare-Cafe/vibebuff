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
import type * as ai from "../ai.js";
import type * as architect from "../architect.js";
import type * as categories from "../categories.js";
import type * as compare from "../compare.js";
import type * as compatibility from "../compatibility.js";
import type * as decks from "../decks.js";
import type * as events from "../events.js";
import type * as evolution from "../evolution.js";
import type * as fusions from "../fusions.js";
import type * as graveyard from "../graveyard.js";
import type * as leaderboardSeasons from "../leaderboardSeasons.js";
import type * as lore from "../lore.js";
import type * as mastery from "../mastery.js";
import type * as nominations from "../nominations.js";
import type * as onboarding from "../onboarding.js";
import type * as popularity from "../popularity.js";
import type * as questHistory from "../questHistory.js";
import type * as relationships from "../relationships.js";
import type * as replays from "../replays.js";
import type * as reviews from "../reviews.js";
import type * as seed from "../seed.js";
import type * as seo from "../seo.js";
import type * as simulator from "../simulator.js";
import type * as speedruns from "../speedruns.js";
import type * as spinWheel from "../spinWheel.js";
import type * as stackBuilder from "../stackBuilder.js";
import type * as stackContracts from "../stackContracts.js";
import type * as startupStories from "../startupStories.js";
import type * as synergies from "../synergies.js";
import type * as templates from "../templates.js";
import type * as tierLists from "../tierLists.js";
import type * as timeMachine from "../timeMachine.js";
import type * as toolAffinity from "../toolAffinity.js";
import type * as toolUsage from "../toolUsage.js";
import type * as toolWhispers from "../toolWhispers.js";
import type * as tools from "../tools.js";
import type * as trading from "../trading.js";
import type * as trophyRoom from "../trophyRoom.js";
import type * as userProfiles from "../userProfiles.js";
import type * as userSettings from "../userSettings.js";
import type * as xpActivity from "../xpActivity.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  achievements: typeof achievements;
  ai: typeof ai;
  architect: typeof architect;
  categories: typeof categories;
  compare: typeof compare;
  compatibility: typeof compatibility;
  decks: typeof decks;
  events: typeof events;
  evolution: typeof evolution;
  fusions: typeof fusions;
  graveyard: typeof graveyard;
  leaderboardSeasons: typeof leaderboardSeasons;
  lore: typeof lore;
  mastery: typeof mastery;
  nominations: typeof nominations;
  onboarding: typeof onboarding;
  popularity: typeof popularity;
  questHistory: typeof questHistory;
  relationships: typeof relationships;
  replays: typeof replays;
  reviews: typeof reviews;
  seed: typeof seed;
  seo: typeof seo;
  simulator: typeof simulator;
  speedruns: typeof speedruns;
  spinWheel: typeof spinWheel;
  stackBuilder: typeof stackBuilder;
  stackContracts: typeof stackContracts;
  startupStories: typeof startupStories;
  synergies: typeof synergies;
  templates: typeof templates;
  tierLists: typeof tierLists;
  timeMachine: typeof timeMachine;
  toolAffinity: typeof toolAffinity;
  toolUsage: typeof toolUsage;
  toolWhispers: typeof toolWhispers;
  tools: typeof tools;
  trading: typeof trading;
  trophyRoom: typeof trophyRoom;
  userProfiles: typeof userProfiles;
  userSettings: typeof userSettings;
  xpActivity: typeof xpActivity;
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
