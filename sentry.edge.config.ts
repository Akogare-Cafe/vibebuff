import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: 1.0,

  environment: process.env.NODE_ENV,

  beforeSend(event) {
    if (event.exception?.values?.[0]?.value?.includes("ECONNRESET")) {
      return null;
    }
    return event;
  },

  ignoreErrors: [
    "ECONNRESET",
    "ENOTFOUND",
    "ETIMEDOUT",
  ],

  debug: false,
});
