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
import type * as battlePass from "../battlePass.js";
import type * as battles from "../battles.js";
import type * as beginnerComparisons from "../beginnerComparisons.js";
import type * as bountyHunts from "../bountyHunts.js";
import type * as categories from "../categories.js";
import type * as challenges from "../challenges.js";
import type * as comboChains from "../comboChains.js";
import type * as communityQA from "../communityQA.js";
import type * as compare from "../compare.js";
import type * as compatibility from "../compatibility.js";
import type * as dailyQuests from "../dailyQuests.js";
import type * as debates from "../debates.js";
import type * as decks from "../decks.js";
import type * as draft from "../draft.js";
import type * as events from "../events.js";
import type * as evolution from "../evolution.js";
import type * as fusions from "../fusions.js";
import type * as globalChat from "../globalChat.js";
import type * as globalRaids from "../globalRaids.js";
import type * as glossary from "../glossary.js";
import type * as graveyard from "../graveyard.js";
import type * as guilds from "../guilds.js";
import type * as interviews from "../interviews.js";
import type * as leaderboardSeasons from "../leaderboardSeasons.js";
import type * as learningPaths from "../learningPaths.js";
import type * as loot from "../loot.js";
import type * as lore from "../lore.js";
import type * as mastery from "../mastery.js";
import type * as mentorship from "../mentorship.js";
import type * as metaReports from "../metaReports.js";
import type * as nominations from "../nominations.js";
import type * as onboarding from "../onboarding.js";
import type * as packs from "../packs.js";
import type * as parties from "../parties.js";
import type * as popularity from "../popularity.js";
import type * as predictions from "../predictions.js";
import type * as prestige from "../prestige.js";
import type * as promptPlayground from "../promptPlayground.js";
import type * as questHistory from "../questHistory.js";
import type * as rateLimit from "../rateLimit.js";
import type * as relationships from "../relationships.js";
import type * as replays from "../replays.js";
import type * as reviews from "../reviews.js";
import type * as roguelike from "../roguelike.js";
import type * as seed from "../seed.js";
import type * as seedEducation from "../seedEducation.js";
import type * as seo from "../seo.js";
import type * as seoBlog from "../seoBlog.js";
import type * as setupGuides from "../setupGuides.js";
import type * as simulator from "../simulator.js";
import type * as speedruns from "../speedruns.js";
import type * as spinWheel from "../spinWheel.js";
import type * as stackBuilder from "../stackBuilder.js";
import type * as stackContracts from "../stackContracts.js";
import type * as starterTemplates from "../starterTemplates.js";
import type * as startupStories from "../startupStories.js";
import type * as streaks from "../streaks.js";
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
import type * as videoTutorials from "../videoTutorials.js";
import type * as voting from "../voting.js";
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
  battlePass: typeof battlePass;
  battles: typeof battles;
  beginnerComparisons: typeof beginnerComparisons;
  bountyHunts: typeof bountyHunts;
  categories: typeof categories;
  challenges: typeof challenges;
  comboChains: typeof comboChains;
  communityQA: typeof communityQA;
  compare: typeof compare;
  compatibility: typeof compatibility;
  dailyQuests: typeof dailyQuests;
  debates: typeof debates;
  decks: typeof decks;
  draft: typeof draft;
  events: typeof events;
  evolution: typeof evolution;
  fusions: typeof fusions;
  globalChat: typeof globalChat;
  globalRaids: typeof globalRaids;
  glossary: typeof glossary;
  graveyard: typeof graveyard;
  guilds: typeof guilds;
  interviews: typeof interviews;
  leaderboardSeasons: typeof leaderboardSeasons;
  learningPaths: typeof learningPaths;
  loot: typeof loot;
  lore: typeof lore;
  mastery: typeof mastery;
  mentorship: typeof mentorship;
  metaReports: typeof metaReports;
  nominations: typeof nominations;
  onboarding: typeof onboarding;
  packs: typeof packs;
  parties: typeof parties;
  popularity: typeof popularity;
  predictions: typeof predictions;
  prestige: typeof prestige;
  promptPlayground: typeof promptPlayground;
  questHistory: typeof questHistory;
  rateLimit: typeof rateLimit;
  relationships: typeof relationships;
  replays: typeof replays;
  reviews: typeof reviews;
  roguelike: typeof roguelike;
  seed: typeof seed;
  seedEducation: typeof seedEducation;
  seo: typeof seo;
  seoBlog: typeof seoBlog;
  setupGuides: typeof setupGuides;
  simulator: typeof simulator;
  speedruns: typeof speedruns;
  spinWheel: typeof spinWheel;
  stackBuilder: typeof stackBuilder;
  stackContracts: typeof stackContracts;
  starterTemplates: typeof starterTemplates;
  startupStories: typeof startupStories;
  streaks: typeof streaks;
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
  videoTutorials: typeof videoTutorials;
  voting: typeof voting;
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
