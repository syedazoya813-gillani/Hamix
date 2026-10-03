# Hamiq Fixes Included

## 1. Settings save fix

The Settings page now uses Supabase `upsert` with `onConflict: 'user_id'` for `twin_profiles`.

This fixes:

`duplicate key value violates unique constraint "twin_profiles_user_id_key"`

The first save creates the user's twin profile and later saves update the same row.

Profile data is also safely upserted by `id`.

## 2. Study time remains variable

Study hours per day, preferred study start time, and preferred study end time are stored from the user's settings. There is no hardcoded 2h/day study value in the Settings flow.

## 3. Installable Hamiq app

Hamiq now includes:

- Web App Manifest
- Hamiq 192x192 and 512x512 app icons
- Service worker
- PWA registration
- An `Install Hamiq` button in the dashboard when the browser exposes the install prompt

On Chrome/Edge desktop, open the deployed Hamiq site over HTTPS. The install option should appear in the browser UI or through the Hamiq dashboard install button when supported.

## 4. Vercel deployment

After replacing the project with this version, make sure these Vercel environment variables are configured:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `AI_PROVIDER`
- `GROQ_API_KEY` (if using Groq)
- `GROQ_MODEL` (optional)
- `GEMINI_API_KEY` (if using Gemini)
- `GEMINI_MODEL` (optional)

Do not put private AI API keys in `NEXT_PUBLIC_` variables.
