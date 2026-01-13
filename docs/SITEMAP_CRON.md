# Sitemap Cron Job

## Overview

The sitemap is automatically updated daily at 2:00 AM UTC using Vercel Cron Jobs. This ensures search engines always have access to the latest content without manual intervention.

## Implementation

### Files Created

- **`vercel.json`** - Vercel cron configuration
- **`src/app/api/cron/update-sitemap/route.ts`** - API endpoint that revalidates the sitemap

### How It Works

1. Vercel triggers the cron job daily at 2:00 AM UTC
2. The cron job calls `/api/cron/update-sitemap` with authentication
3. The API route revalidates the sitemap cache using `revalidatePath("/sitemap.xml")`
4. Next.js regenerates the sitemap with fresh data from Convex

## Setup Instructions

### 1. Generate a Cron Secret

```bash
openssl rand -base64 32
```

### 2. Add Environment Variable

Add the generated secret to your Vercel project:

**Via Vercel Dashboard:**
1. Go to your project settings
2. Navigate to Environment Variables
3. Add `CRON_SECRET` with your generated value
4. Apply to Production, Preview, and Development environments

**Via Vercel CLI:**
```bash
vercel env add CRON_SECRET
```

### 3. Deploy

The cron job will automatically activate after deployment:

```bash
pnpm build
vercel --prod
```

## Configuration

### Schedule

The cron schedule is defined in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/update-sitemap",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Schedule Format:** `minute hour day month dayOfWeek`
- Current: `0 2 * * *` = Every day at 2:00 AM UTC

### Customizing Schedule

To change the frequency, modify the `schedule` field:

- **Every 6 hours:** `0 */6 * * *`
- **Twice daily (2 AM & 2 PM):** `0 2,14 * * *`
- **Weekly on Monday at 3 AM:** `0 3 * * 1`

## Security

The endpoint is protected by Bearer token authentication:

```typescript
const authHeader = request.headers.get("authorization");
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

Vercel automatically includes the `CRON_SECRET` in the Authorization header when triggering cron jobs.

## Monitoring

### Check Cron Logs

View cron execution logs in Vercel Dashboard:
1. Go to your project
2. Click on "Deployments"
3. Select a deployment
4. Navigate to "Functions" tab
5. Find `/api/cron/update-sitemap`

### Manual Trigger

Test the endpoint locally or manually trigger:

```bash
curl -X GET https://vibebuff.dev/api/cron/update-sitemap \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Expected response:
```json
{
  "success": true,
  "message": "Sitemap revalidated successfully",
  "timestamp": "2025-01-13T08:15:00.000Z"
}
```

## Sitemap Details

The sitemap (`src/app/sitemap.ts`) includes:

- Static pages (home, tools, compare, etc.)
- Dynamic comparison pages from Convex
- Tool pages and alternatives
- Company pages
- Blog posts
- Category and "best for" pages

The sitemap has `revalidate = 3600` (1 hour cache), but the cron job forces a daily refresh to ensure consistency.

## Troubleshooting

### Cron Not Running

1. Verify `CRON_SECRET` is set in Vercel environment variables
2. Check deployment logs for errors
3. Ensure `vercel.json` is committed and deployed

### 401 Unauthorized Error

- The `CRON_SECRET` environment variable doesn't match
- Redeploy after updating environment variables

### 500 Server Error

- Check function logs in Vercel Dashboard
- Verify Convex queries are working
- Ensure sitemap.ts has no syntax errors

## Best Practices

1. **Keep the secret secure** - Never commit `CRON_SECRET` to version control
2. **Monitor execution** - Regularly check cron logs for failures
3. **Test changes** - Use manual trigger to test before relying on scheduled runs
4. **Update schedule wisely** - Balance freshness with API quota limits

## Related Files

- `src/app/sitemap.ts` - Sitemap generation logic
- `vercel.json` - Cron configuration
- `.env.example` - Environment variable template
- `convex/seo.ts` - Convex queries for comparison data
- `convex/tools.ts` - Convex queries for tool data
- `convex/companies.ts` - Convex queries for company data
