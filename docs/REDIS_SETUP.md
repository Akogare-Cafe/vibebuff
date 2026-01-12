# Railway Redis Setup Guide

### Step 1: Access Railway Dashboard

1. Go to https://railway.com/project/11e6f292-d5c5-42a0-b7df-b31ae090509b
2. Click on the **Redis** service
3. Go to **Variables** tab
4. Copy the `REDIS_URL` value (format: `redis://default:password@host:port`)

### Step 2: Add to Local Development

Add to `.env.local`:

```bash
REDIS_URL=redis://default:your-password@your-host.railway.app:6379
```

### Step 3: Add to Production

**If deploying to Railway:**
- The `REDIS_URL` is automatically available to all services in the same project
- No manual configuration needed

**If deploying to Vercel:**
1. Go to Vercel dashboard > Settings > Environment Variables
2. Add `REDIS_URL` with the value from Railway
3. Redeploy

### Step 4: Verify

Test rate limiting:

```bash
# Make 100+ requests to trigger rate limit
for i in {1..110}; do curl https://your-app.com/api/ai/tools; done
```

You should see 429 responses after 100 requests.

### Pricing

Railway Redis pricing:
- $0.000463/GB-hour for memory
- $0.000231/GB-hour for disk
- Approximately $5-10/month for typical usage
