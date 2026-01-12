# Security Documentation

## Bot Scanner Protection

### Overview

Vibebuff implements comprehensive bot scanner protection in the middleware layer to block automated vulnerability scanners that probe for common CMS and framework exploits.

### Protected Paths

The following vulnerability scan patterns are automatically blocked with a 404 response:

#### WordPress Vulnerabilities
- `/wp-admin/*` - WordPress admin panel
- `/wp-login.php` - WordPress login
- `/xmlrpc.php` - WordPress XML-RPC (common DDoS vector)
- `/wordpress/*` - WordPress installation paths
- `/wp-content/*` - WordPress content directory
- `/wp-includes/*` - WordPress core files
- `/wp-json/*` - WordPress REST API

#### PHP Exploits
- `*.php` - Any PHP file requests
- `/admin.php` - Generic admin scripts
- `/config.php` - Configuration files
- `/setup.php` - Setup scripts
- `/install.php` - Installation scripts
- `/shell.php` - Web shells
- `/c99.php` - C99 shell variant
- `/upload.php` - File upload exploits
- `/fileupload.php` - File upload exploits

#### Database Management Tools
- `/phpMyAdmin/*` - phpMyAdmin
- `/phpmyadmin/*` - phpMyAdmin (lowercase)
- `/pma/*` - phpMyAdmin shorthand
- `/adminer/*` - Adminer database tool
- `/db/*` - Database directories
- `/database/*` - Database directories
- `/sql` - SQL files
- `/mysql` - MySQL directories

#### CMS & Framework Exploits
- `/administrator/*` - Joomla admin
- `/cgi-bin/*` - CGI scripts
- `/vendor/*` - Composer vendor directory
- `/composer.json` - Composer config
- `/package.json` - NPM config (blocked to prevent dependency scanning)

#### Sensitive Files & Directories
- `/.env` - Environment variables
- `/.git/*` - Git repository
- `/.aws/*` - AWS credentials
- `/.ssh/*` - SSH keys
- `/backup` - Backup directories
- `/.htaccess` - Apache config
- `/web.config` - IIS config

### Implementation

Protection is implemented in `src/middleware.ts`:

```typescript
const BLOCKED_PATHS = [
  /\/wp-admin/i,
  /\/wp-login\.php/i,
  // ... (see middleware.ts for full list)
];

function isSuspiciousBot(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;
  return BLOCKED_PATHS.some(pattern => pattern.test(pathname));
}
```

Requests matching these patterns receive an immediate 404 response before any application logic runs.

### Benefits

1. **Edge-level protection** - Blocks malicious requests at the middleware layer
2. **Zero performance impact** - Rejected before hitting application code
3. **Reduced noise** - Cleaner analytics and logs
4. **Attack surface reduction** - Prevents information disclosure
5. **Bandwidth savings** - No processing of malicious requests

### Monitoring

Bot scanner attempts will appear in Vercel Analytics as 404 responses. You can monitor these in:
- Vercel Dashboard → Analytics → Status Codes
- Vercel Dashboard → Logs (filtered by 404 status)

### Adding New Patterns

To block additional vulnerability scan patterns, add regex patterns to the `BLOCKED_PATHS` array in `src/middleware.ts`:

```typescript
const BLOCKED_PATHS = [
  // ... existing patterns
  /\/your-new-pattern/i,
];
```

After modifying, verify the build:
```bash
npx next build
```

### Security Headers

In addition to bot protection, the application implements comprehensive security headers:

**In `next.config.ts`:**
- `X-DNS-Prefetch-Control: on`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

**In `middleware.ts`:**
- Content Security Policy (CSP) with strict directives
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### Country Blocking

Optional country-level blocking is available via environment variable:

```bash
BLACKLISTED_COUNTRIES=CN,RU,KP
```

Blocked users are redirected to `/blocked` page.

### Rate Limiting

The application uses Redis-based rate limiting (see `botid` package integration in `next.config.ts`).

### Best Practices

1. **Never expose sensitive paths** - Ensure no legitimate routes match blocked patterns
2. **Monitor 404s** - Regularly check for false positives
3. **Keep patterns updated** - Add new exploit patterns as they emerge
4. **Test after changes** - Always run `npx next build` after modifying middleware
5. **Review logs** - Periodically audit blocked requests in Vercel Analytics
