# Smart Book Mobile Wrapper (Android via Capacitor)

This folder provides the Capacitor Android shell that wraps the built Smart Book web bundle (`../dist`).

## Build Android Project

1. Build the web frontend from the repository root:
   ```bash
   npm ci
   npm run build
   ```
2. Install pinned mobile dependencies and add the Android native project:
   ```bash
   cd mobile
   npm ci
   npx cap add android
   npx cap sync android
   npx cap open android
   ```
