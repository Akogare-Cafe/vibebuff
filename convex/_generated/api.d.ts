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
import type * as admin from "../admin.js";
import type * as adminActions from "../adminActions.js";
import type * as ads from "../ads.js";
import type * as ai from "../ai.js";
import type * as apiKeys from "../apiKeys.js";
import type * as architect from "../architect.js";
import type * as articles from "../articles.js";
import type * as battles from "../battles.js";
import type * as categories from "../categories.js";
import type * as communityStacks from "../communityStacks.js";
import type * as companies from "../companies.js";
import type * as compare from "../compare.js";
import type * as compatibility from "../compatibility.js";
import type * as crons from "../crons.js";
import type * as decks from "../decks.js";
import type * as email from "../email.js";
import type * as events from "../events.js";
import type * as evolution from "../evolution.js";
import type * as externalData from "../externalData.js";
import type * as externalDataInternal from "../externalDataInternal.js";
import type * as externalDataQueries from "../externalDataQueries.js";
import type * as feeds from "../feeds.js";
import type * as feedsInternal from "../feedsInternal.js";
import type * as feedsQueries from "../feedsQueries.js";
import type * as forum from "../forum.js";
import type * as forumSeed from "../forumSeed.js";
import type * as friends from "../friends.js";
import type * as fusions from "../fusions.js";
import type * as globalSearch from "../globalSearch.js";
import type * as graveyard from "../graveyard.js";
import type * as groups from "../groups.js";
import type * as ingest from "../ingest.js";
import type * as leaderboardSeasons from "../leaderboardSeasons.js";
import type * as leaderboards from "../leaderboards.js";
import type * as lib_auth from "../lib/auth.js";
import type * as liveCursors from "../liveCursors.js";
import type * as logoScraper from "../logoScraper.js";
import type * as lore from "../lore.js";
import type * as mastery from "../mastery.js";
import type * as mcpServers from "../mcpServers.js";
import type * as newsletter from "../newsletter.js";
import type * as nominations from "../nominations.js";
import type * as notifications from "../notifications.js";
import type * as onboarding from "../onboarding.js";
import type * as packageAnalyzer from "../packageAnalyzer.js";
import type * as packageImport from "../packageImport.js";
import type * as popularity from "../popularity.js";
import type * as presence from "../presence.js";
import type * as questHistory from "../questHistory.js";
import type * as referrals from "../referrals.js";
import type * as relationships from "../relationships.js";
import type * as replays from "../replays.js";
import type * as reviews from "../reviews.js";
import type * as seed from "../seed.js";
import type * as seo from "../seo.js";
import type * as simulator from "../simulator.js";
import type * as speedruns from "../speedruns.js";
import type * as spinWheel from "../spinWheel.js";
import type * as stackBuilder from "../stackBuilder.js";
import type * as stackBuilderCollab from "../stackBuilderCollab.js";
import type * as stackContracts from "../stackContracts.js";
import type * as stackMarketplace from "../stackMarketplace.js";
import type * as startupStories from "../startupStories.js";
import type * as status from "../status.js";
import type * as synergies from "../synergies.js";
import type * as templates from "../templates.js";
import type * as tierLists from "../tierLists.js";
import type * as timeMachine from "../timeMachine.js";
import type * as toolAffinity from "../toolAffinity.js";
import type * as toolStats from "../toolStats.js";
import type * as toolSuggestions from "../toolSuggestions.js";
import type * as toolUsage from "../toolUsage.js";
import type * as toolWhispers from "../toolWhispers.js";
import type * as tools from "../tools.js";
import type * as toolsLeaderboard from "../toolsLeaderboard.js";
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
  admin: typeof admin;
  adminActions: typeof adminActions;
  ads: typeof ads;
  ai: typeof ai;
  apiKeys: typeof apiKeys;
  architect: typeof architect;
  articles: typeof articles;
  battles: typeof battles;
  categories: typeof categories;
  communityStacks: typeof communityStacks;
  companies: typeof companies;
  compare: typeof compare;
  compatibility: typeof compatibility;
  crons: typeof crons;
  decks: typeof decks;
  email: typeof email;
  events: typeof events;
  evolution: typeof evolution;
  externalData: typeof externalData;
  externalDataInternal: typeof externalDataInternal;
  externalDataQueries: typeof externalDataQueries;
  feeds: typeof feeds;
  feedsInternal: typeof feedsInternal;
  feedsQueries: typeof feedsQueries;
  forum: typeof forum;
  forumSeed: typeof forumSeed;
  friends: typeof friends;
  fusions: typeof fusions;
  globalSearch: typeof globalSearch;
  graveyard: typeof graveyard;
  groups: typeof groups;
  ingest: typeof ingest;
  leaderboardSeasons: typeof leaderboardSeasons;
  leaderboards: typeof leaderboards;
  "lib/auth": typeof lib_auth;
  liveCursors: typeof liveCursors;
  logoScraper: typeof logoScraper;
  lore: typeof lore;
  mastery: typeof mastery;
  mcpServers: typeof mcpServers;
  newsletter: typeof newsletter;
  nominations: typeof nominations;
  notifications: typeof notifications;
  onboarding: typeof onboarding;
  packageAnalyzer: typeof packageAnalyzer;
  packageImport: typeof packageImport;
  popularity: typeof popularity;
  presence: typeof presence;
  questHistory: typeof questHistory;
  referrals: typeof referrals;
  relationships: typeof relationships;
  replays: typeof replays;
  reviews: typeof reviews;
  seed: typeof seed;
  seo: typeof seo;
  simulator: typeof simulator;
  speedruns: typeof speedruns;
  spinWheel: typeof spinWheel;
  stackBuilder: typeof stackBuilder;
  stackBuilderCollab: typeof stackBuilderCollab;
  stackContracts: typeof stackContracts;
  stackMarketplace: typeof stackMarketplace;
  startupStories: typeof startupStories;
  status: typeof status;
  synergies: typeof synergies;
  templates: typeof templates;
  tierLists: typeof tierLists;
  timeMachine: typeof timeMachine;
  toolAffinity: typeof toolAffinity;
  toolStats: typeof toolStats;
  toolSuggestions: typeof toolSuggestions;
  toolUsage: typeof toolUsage;
  toolWhispers: typeof toolWhispers;
  tools: typeof tools;
  toolsLeaderboard: typeof toolsLeaderboard;
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
