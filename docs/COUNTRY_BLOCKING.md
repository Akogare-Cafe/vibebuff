# Country Blocking Implementation

This document explains how to use the country blocking feature in VibeBuff.

## Overview

The country blocking feature uses Vercel's geolocation headers to detect a user's country and block access from specified countries. This is implemented at the middleware level for maximum efficiency.

## Configuration

### Environment Variable

Add the `BLACKLISTED_COUNTRIES` environment variable to your `.env.local` file:

```bash
BLACKLISTED_COUNTRIES=CN,RU,KP
```

- Use ISO 3166-1 alpha-2 country codes (2-letter codes)
- Separate multiple countries with commas
- Leave empty to disable country blocking

### Common Country Codes

- `CN` - China
- `RU` - Russia
- `KP` - North Korea
- `IR` - Iran
- `CU` - Cuba
- `SY` - Syria
- `US` - United States
- `GB` - United Kingdom
- `DE` - Germany
- `FR` - France

Full list: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2

## How It Works

1. **Middleware Detection**: The middleware checks the `x-vercel-ip-country` header on every request
2. **Country Comparison**: If the country code matches any in the blacklist, the user is redirected
3. **Blocked Page**: Users from blacklisted countries see a friendly blocked page at `/blocked`
4. **Bypass for Blocked Route**: The `/blocked` route itself is not subject to blocking to prevent redirect loops

## Implementation Details

### Files Modified

1. **`src/middleware.ts`**: Added country blocking logic
2. **`src/app/blocked/page.tsx`**: Created blocked page
3. **`.env.example`**: Added environment variable documentation

### Code Flow

```typescript
// Middleware checks country on every request
const country = request.headers.get("x-vercel-ip-country");

// Compare against blacklist
if (BLACKLISTED_COUNTRIES.includes(country)) {
  return NextResponse.redirect(new URL("/blocked", request.url));
}
```

## Testing

### Local Development

Vercel's geolocation headers are only available in production. To test locally:

1. Deploy to Vercel preview or production
2. Use a VPN to simulate different countries
3. Check that blocked countries redirect to `/blocked`

### Vercel Edge Network

The `x-vercel-ip-country` header is automatically set by Vercel's Edge Network based on the request's IP address.

## Production Deployment

1. Add `BLACKLISTED_COUNTRIES` to your Vercel environment variables:
   - Go to your project settings on Vercel
   - Navigate to Environment Variables
   - Add `BLACKLISTED_COUNTRIES` with your desired country codes
   - Deploy or redeploy your application

2. The blocking will take effect immediately on the next deployment

## Limitations

- Only works on Vercel (uses Vercel-specific headers)
- VPN users can bypass by connecting through allowed countries
- No blocking at the DNS/CDN level (users can still make requests, they just get redirected)

## Security Considerations

- This is a soft block (redirect-based), not a hard block
- Determined users with VPNs can bypass this
- For stricter blocking, consider:
  - Cloudflare Access or similar services
  - IP-based blocking at the CDN level
  - Additional verification mechanisms

## Monitoring

Monitor blocked access attempts by:
- Checking analytics for `/blocked` page views
- Setting up Vercel Analytics to track country-based metrics
- Adding logging to the middleware for blocked requests
