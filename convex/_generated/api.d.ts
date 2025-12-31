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
import type * as battles from "../battles.js";
import type * as categories from "../categories.js";
import type * as compare from "../compare.js";
import type * as decks from "../decks.js";
import type * as loot from "../loot.js";
import type * as parties from "../parties.js";
import type * as questHistory from "../questHistory.js";
import type * as seed from "../seed.js";
import type * as synergies from "../synergies.js";
import type * as toolUsage from "../toolUsage.js";
import type * as tools from "../tools.js";
import type * as userProfiles from "../userProfiles.js";
import type * as voting from "../voting.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  achievements: typeof achievements;
  battles: typeof battles;
  categories: typeof categories;
  compare: typeof compare;
  decks: typeof decks;
  loot: typeof loot;
  parties: typeof parties;
  questHistory: typeof questHistory;
  seed: typeof seed;
  synergies: typeof synergies;
  toolUsage: typeof toolUsage;
  tools: typeof tools;
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
