---
title: "Micro-Frontends Architecture Guide for 2025"
description: "Build scalable frontend applications with micro-frontends. Compare Module Federation, Single-SPA, and modern implementation patterns."
date: "2024-12-03"
readTime: "12 min read"
tags: ["Architecture", "Micro-Frontends", "Webpack", "Module Federation"]
category: "Architecture"
featured: false
author: "VIBEBUFF Team"
---

## Understanding Micro-Frontends

Micro-frontends extend microservices concepts to frontend development. According to [ThoughtWorks Technology Radar 2024](https://www.thoughtworks.com/radar), micro-frontends have moved to **"Adopt"** status for large-scale applications.

## Why Micro-Frontends?

**Benefits:**
- Independent deployments
- Team autonomy
- Technology diversity
- Incremental upgrades
- Isolated failures

**Challenges:**
- Increased complexity
- Performance overhead
- Shared state management
- Consistent UX
- Tooling setup

## Implementation Approaches

### Module Federation (Webpack 5)

The modern standard for micro-frontends:

**Host App:**
\`\`\`javascript
// webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        app1: 'app1@http://localhost:3001/remoteEntry.js',
        app2: 'app2@http://localhost:3002/remoteEntry.js',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
};
\`\`\`

**Remote App:**
\`\`\`javascript
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/Button',
        './Header': './src/Header',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
};
\`\`\`

### Single-SPA

Framework-agnostic micro-frontend orchestration:

\`\`\`typescript
import { registerApplication, start } from 'single-spa';

registerApplication({
  name: '@org/navbar',
  app: () => import('@org/navbar'),
  activeWhen: '/',
});

registerApplication({
  name: '@org/dashboard',
  app: () => import('@org/dashboard'),
  activeWhen: '/dashboard',
});

start();
\`\`\`

### Web Components

Native browser standard:

\`\`\`typescript
class UserProfile extends HTMLElement {
  connectedCallback() {
    this.innerHTML = \`
      <div class="profile">
        <h2>\${this.getAttribute('name')}</h2>
      </div>
    \`;
  }
}

customElements.define('user-profile', UserProfile);
\`\`\`

## Comparison Matrix

| Approach | Setup | Performance | Flexibility | Ecosystem |
|----------|-------|-------------|-------------|-----------|
| Module Federation | Medium | Good | High | Growing |
| Single-SPA | Complex | Good | Very High | Mature |
| Web Components | Simple | Excellent | Medium | Limited |
| iFrames | Simple | Poor | Low | Universal |

## Shared Dependencies

### Strategy 1: Singleton Sharing
\`\`\`javascript
shared: {
  react: {
    singleton: true,
    requiredVersion: '^18.0.0',
  },
}
\`\`\`

### Strategy 2: Version Ranges
\`\`\`javascript
shared: {
  lodash: {
    requiredVersion: '^4.17.0',
    singleton: false,
  },
}
\`\`\`

## Communication Patterns

### Custom Events
\`\`\`typescript
// Emit
window.dispatchEvent(new CustomEvent('user-login', {
  detail: { userId: '123' }
}));

// Listen
window.addEventListener('user-login', (e) => {
  console.log(e.detail.userId);
});
\`\`\`

### Shared State
\`\`\`typescript
// Using Zustand
import create from 'zustand';

export const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
\`\`\`

## Routing Strategies

### Centralized Routing
Host app controls all routing:
\`\`\`typescript
<Routes>
  <Route path="/app1/*" element={<App1 />} />
  <Route path="/app2/*" element={<App2 />} />
</Routes>
\`\`\`

### Decentralized Routing
Each micro-frontend manages its routes:
\`\`\`typescript
// App1 internal routing
<Routes>
  <Route path="dashboard" element={<Dashboard />} />
  <Route path="settings" element={<Settings />} />
</Routes>
\`\`\`

## Performance Optimization

### Code Splitting
\`\`\`typescript
const RemoteApp = lazy(() => import('remote/App'));

<Suspense fallback={<Loading />}>
  <RemoteApp />
</Suspense>
\`\`\`

### Preloading
\`\`\`typescript
const preloadRemote = () => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'script';
  link.href = 'http://localhost:3001/remoteEntry.js';
  document.head.appendChild(link);
};
\`\`\`

## Testing Strategies

### Integration Testing
\`\`\`typescript
test('micro-frontend loads', async () => {
  render(<Host />);
  await waitFor(() => {
    expect(screen.getByText('Remote Content')).toBeInTheDocument();
  });
});
\`\`\`

### E2E Testing
\`\`\`typescript
test('navigation between micro-frontends', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="nav-app1"]');
  await expect(page).toHaveURL('/app1');
});
\`\`\`

## When to Use Micro-Frontends

### Good Fit:
- Large teams (10+ developers)
- Multiple products/domains
- Different release cycles needed
- Technology migration required
- Independent team ownership

### Poor Fit:
- Small applications
- Single team
- Tight coupling required
- Performance critical
- Simple architecture sufficient

## Real-World Examples

### Spotify
- Multiple teams, independent features
- Module Federation
- Shared design system

### Zalando
- 200+ micro-frontends
- Custom orchestration
- Team autonomy

### IKEA
- Single-SPA implementation
- Multiple frameworks
- Gradual migration

## Our Recommendation

For **large organizations**: **Module Federation**
- Modern approach
- Good performance
- Growing ecosystem

For **framework diversity**: **Single-SPA**
- Mix React, Vue, Angular
- Mature solution
- Proven at scale

For **simple cases**: **Avoid micro-frontends**
- Use monolith with good architecture
- Simpler deployment
- Better performance

Explore architecture patterns in our [Tools directory](/tools?category=architecture) or compare options with our [Compare tool](/compare).

## Sources

- [Module Federation Documentation](https://webpack.js.org/concepts/module-federation/)
- [Single-SPA Documentation](https://single-spa.js.org/)
- [ThoughtWorks Technology Radar](https://www.thoughtworks.com/radar)
