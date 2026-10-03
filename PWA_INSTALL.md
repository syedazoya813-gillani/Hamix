# Hamiq mobile installation

Hamiq is configured as a Progressive Web App (PWA).

## Android / Chrome
1. Deploy the project over HTTPS (Vercel provides HTTPS).
2. Open the deployed Hamiq URL in Chrome.
3. Refresh once after the new deployment is live so the service worker can register.
4. Use Chrome's menu and choose **Install app** / **Add to Home screen** when offered.
5. From the Hamiq dashboard, the install icon in the mobile header will also become available when Chrome exposes the install prompt.

The app manifest is generated from `app/manifest.ts`, icons are in `public/icons/`, and the service worker is `public/sw.js`.

## Important after updating a previous Hamiq installation
If an older service worker is cached, open Chrome site settings for Hamiq, clear the site's stored data, reload the site, and install again. The service worker uses a versioned cache (`hamiq-shell-v1`) so future versions can be bumped safely.
