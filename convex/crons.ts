import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "fetch-ai-tooling-feeds",
  { minutes: 30 },
  internal.feeds.fetchAllDueFeeds
);

export default crons;
