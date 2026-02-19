import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "fetch-ai-tooling-feeds",
  { minutes: 30 },
  internal.feeds.fetchAllDueFeeds
);

crons.weekly(
  "send-weekly-digest",
  { dayOfWeek: "monday", hourUTC: 14, minuteUTC: 0 },
  internal.email.sendWeeklyDigest
);

crons.cron(
  "scrape-tool-logos-morning",
  "0 8 * * *",
  internal.logoScraper.scrapeLogosCron
);

crons.cron(
  "scrape-tool-logos-evening",
  "0 20 * * *",
  internal.logoScraper.scrapeLogosCron
);

crons.interval(
  "refresh-tool-external-data",
  { hours: 6 },
  internal.externalData.refreshExternalDataBatch
);

export default crons;
