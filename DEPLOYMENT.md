# Deployment Guide

This document covers deployment procedures for the Canon CIO Command Center application, including Vercel deployment, environment configuration, CI/CD integration, and preview deployments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build Configuration](#build-configuration)
- [Environment Variables](#environment-variables)
- [Vercel Deployment](#vercel-deployment)
  - [Initial Setup via GitHub Integration](#initial-setup-via-github-integration)
  - [Manual Deployment via Vercel CLI](#manual-deployment-via-vercel-cli)
  - [SPA Rewrite Configuration](#spa-rewrite-configuration)
- [CI/CD via GitHub Integration](#cicd-via-github-integration)
  - [Production Deployments](#production-deployments)
  - [Preview Deployments](#preview-deployments)
- [Manual Deployment](#manual-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- A [Vercel](https://vercel.com) account (for Vercel deployments)
- A GitHub repository connected to Vercel (for CI/CD)

## Build Configuration

The application uses **Vite 6** as its build tool. The build configuration is defined in `vite.config.js`:

```js
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

### Build Command

```bash
npm run build
```

This produces a production-optimized build in the `dist/` directory. The output includes:

- Minified JavaScript bundles with code splitting
- Optimized CSS with Tailwind CSS purging
- Source maps for debugging
- Static assets with content hashing for cache busting

### Preview the Build Locally

```bash
npm run preview
```

This serves the `dist/` directory locally so you can verify the production build before deploying.

### Run Tests Before Deploying

```bash
npm test
```

Always run the full test suite before deploying to catch regressions. The test suite includes unit tests for services (`UserManager`, `SessionManager`, `AIEngine`, `DashboardDataService`, `EngagementAnalytics`) and integration tests for `LoginForm` and `RegistrationForm`.

---

## Environment Variables

Environment variables are managed via `.env` files locally and through the Vercel dashboard for deployed environments.

| Variable | Default | Description |
|---|---|---|
| `VITE_APP_TITLE` | `Canon CIO Command Center` | Application title displayed in the header and browser tab |

### Local Development

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set any required values:

   ```
   VITE_APP_TITLE=Canon CIO Command Center
   ```

### Vercel Environment Variables

Set environment variables in the Vercel dashboard:

1. Navigate to your project in the [Vercel Dashboard](https://vercel.com/dashboard)
2. Go to **Settings** → **Environment Variables**
3. Add each variable with the appropriate scope:
   - **Production** — applied to production deployments (main/master branch)
   - **Preview** — applied to preview deployments (pull request branches)
   - **Development** — applied when using `vercel dev` locally

| Variable | Scope | Value |
|---|---|---|
| `VITE_APP_TITLE` | Production, Preview | `Canon CIO Command Center` |

> **Note:** All client-side environment variables must be prefixed with `VITE_` to be exposed to the application via `import.meta.env`.

---

## Vercel Deployment

### Initial Setup via GitHub Integration

This is the recommended approach for automated deployments.

1. **Import your repository:**
   - Log in to [Vercel](https://vercel.com)
   - Click **Add New...** → **Project**
   - Select your GitHub repository (`canon-cio-command-center`)
   - Vercel auto-detects the **Vite** framework

2. **Configure build settings:**
   Vercel should auto-detect these, but verify they are correct:

   | Setting | Value |
   |---|---|
   | **Framework Preset** | Vite |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |
   | **Install Command** | `npm install` |
   | **Node.js Version** | 18.x or 20.x |

3. **Set environment variables:**
   Add any required environment variables in the **Environment Variables** section (see [Vercel Environment Variables](#vercel-environment-variables) above).

4. **Deploy:**
   Click **Deploy**. Vercel will install dependencies, run the build, and deploy the application.

5. **Custom domain (optional):**
   - Go to **Settings** → **Domains**
   - Add your custom domain and configure DNS records as instructed

### Manual Deployment via Vercel CLI

If you prefer deploying from the command line:

1. **Install the Vercel CLI:**

   ```bash
   npm install -g vercel
   ```

2. **Log in to Vercel:**

   ```bash
   vercel login
   ```

3. **Deploy a preview build:**

   ```bash
   vercel
   ```

   This creates a preview deployment with a unique URL.

4. **Deploy to production:**

   ```bash
   vercel --prod
   ```

   This deploys to your production domain.

5. **Set environment variables via CLI:**

   ```bash
   vercel env add VITE_APP_TITLE
   ```

   Follow the prompts to set the value and scope.

### SPA Rewrite Configuration

The application uses client-side routing via `react-router-dom`. All routes must be rewritten to `index.html` so the React router can handle them. This is configured in `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/((?!assets/).*)",
      "destination": "/index.html"
    }
  ]
}
```

**How it works:**

- Any request that does **not** match the `/assets/` path prefix is rewritten to `/index.html`
- Requests to `/assets/*` (Vite's default static asset output directory) are served directly as static files
- This ensures that deep links like `/dashboard`, `/login`, and `/register` are handled by the React router instead of returning a 404

**Routes handled by the client-side router:**

| Path | Component |
|---|---|
| `/` | Redirects to `/login` |
| `/login` | `LoginForm` |
| `/register` | `RegistrationForm` |
| `/dashboard` | `DashboardPage` (protected, requires authentication) |
| `*` | Redirects to `/login` (catch-all) |

---

## CI/CD via GitHub Integration

When your GitHub repository is connected to Vercel, deployments are triggered automatically based on Git events.

### Production Deployments

Production deployments are triggered when commits are pushed to the **production branch** (typically `main` or `master`).

**Workflow:**

1. Developer merges a pull request into `main`
2. Vercel detects the push event via the GitHub integration
3. Vercel runs the build pipeline:
   - `npm install` — installs dependencies
   - `npm run build` — creates the production build in `dist/`
4. Vercel deploys the `dist/` output to the production domain
5. The deployment is assigned to the production URL

**Build pipeline summary:**

```
Push to main → npm install → npm run build → Deploy dist/ → Production URL
```

### Preview Deployments

Preview deployments are created automatically for every **pull request** and for pushes to **non-production branches**.

**Workflow:**

1. Developer opens a pull request or pushes to a feature branch
2. Vercel detects the event and creates a preview deployment
3. Vercel runs the same build pipeline as production:
   - `npm install`
   - `npm run build`
4. A unique preview URL is generated (e.g., `canon-cio-command-center-<hash>.vercel.app`)
5. Vercel posts the preview URL as a comment on the pull request
6. Team members can review the changes at the preview URL before merging

**Preview deployment features:**

- Each pull request gets its own isolated deployment
- Preview URLs are unique and persistent for the lifetime of the PR
- Updated automatically when new commits are pushed to the PR branch
- Environment variables scoped to **Preview** are applied
- Preview deployments do not affect the production deployment

**Recommended PR workflow:**

1. Create a feature branch from `main`
2. Make changes and push to the feature branch
3. Open a pull request against `main`
4. Vercel automatically creates a preview deployment
5. Review the preview deployment URL posted in the PR comments
6. Run tests locally: `npm test`
7. Once approved, merge the PR into `main`
8. Vercel automatically deploys to production

### Branch Configuration

To configure which branch triggers production deployments:

1. Go to your project in the Vercel Dashboard
2. Navigate to **Settings** → **Git**
3. Under **Production Branch**, set the branch name (default: `main`)

---

## Manual Deployment

For deploying to any static file server without Vercel:

1. **Build the application:**

   ```bash
   npm install
   npm run build
   ```

2. **Serve the `dist/` directory** with any static file server (e.g., Nginx, Apache, Caddy, or a cloud storage service like AWS S3 + CloudFront).

3. **Configure SPA rewrites** on your server. All routes must fall back to `index.html` for client-side routing to work.

   **Nginx example:**

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /assets/ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

   **Apache `.htaccess` example:**

   ```apache
   RewriteEngine On
   RewriteBase /
   RewriteRule ^assets/ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

4. **Set environment variables** at build time. Since Vite embeds environment variables during the build step, set them before running `npm run build`:

   ```bash
   VITE_APP_TITLE="Canon CIO Command Center" npm run build
   ```

---

## Troubleshooting

### Common Issues

**Build fails with missing dependencies:**

```bash
rm -rf node_modules
npm install
npm run build
```

**Blank page after deployment:**

- Verify the `vercel.json` rewrite rules are in place
- Check that the **Output Directory** is set to `dist` in Vercel project settings
- Ensure `index.html` exists in the `dist/` directory after build

**Routes return 404:**

- Confirm the SPA rewrite configuration in `vercel.json` is deployed
- For non-Vercel servers, ensure the fallback to `index.html` is configured correctly

**Environment variables not available:**

- Ensure variables are prefixed with `VITE_`
- Verify variables are set in the correct scope (Production, Preview, or Development) in the Vercel dashboard
- Environment variables are embedded at build time — redeploy after changing them

**Tests fail before deployment:**

```bash
npm test
```

Review test output for failures. All tests must pass before deploying. The test suite uses Vitest with jsdom environment and React Testing Library.

**Stale localStorage data after deployment:**

The application includes a storage version check (`localStorageUtils.checkStorageVersion`). If the storage schema changes between versions, localStorage data is automatically reset on the client. Users may need to log in again after a major update.

### Vercel Build Logs

To debug build failures:

1. Go to your project in the Vercel Dashboard
2. Click on the failed deployment
3. Review the **Build Logs** tab for error details
4. Common issues include:
   - Node.js version mismatch (ensure >= 18.x)
   - Missing environment variables
   - TypeScript or ESLint errors (if configured)

### Support

For Vercel-specific issues, refer to the [Vercel Documentation](https://vercel.com/docs).