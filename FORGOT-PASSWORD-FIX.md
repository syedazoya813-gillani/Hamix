# Hamiq Password Reset Fix

This version adds a complete Supabase password-reset flow:

1. `/forgot-password` sends a reset email for an authorized account.
2. `/auth/callback` exchanges the Supabase recovery code for a session.
3. `/reset-password` validates the recovery session and updates the password.
4. The login page already links to `/forgot-password`.

## Required Supabase configuration

In Supabase Authentication > URL Configuration, add:

`https://hamiq.vercel.app/auth/callback`

For local development also add your local callback URL, for example:

`http://localhost:3000/auth/callback`

The Vercel project must have:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The Hamiq administrator contact is `hammalalam406@gmail.com`.
