# POPUP.NYC Control Room

A secured admin application for the POPUP.NYC generative media database.

## Capabilities

- Read authenticated user profiles.
- Create, read, update, and delete AI-generated concepts.
- Read community upvotes and downvotes.
- Inspect creation velocity, approval pulse, neighborhood concentration, and model usage.
- Google OAuth plus a database-backed `profiles.is_superadmin` authorization gate.

## Security model

Authentication and authorization are intentionally separate:

1. Supabase Google OAuth establishes the signed-in user.
2. `proxy.ts` refreshes the session and blocks anonymous access to every application route.
3. The protected route-group layout re-checks the authenticated user and the `is_superadmin` profile flag on the server.
4. Row Level Security repeats the superadmin check inside Postgres for every read or write. Direct Data API calls cannot bypass the application UI.

The only public application endpoints are `/login` and `/auth/callback`, which must remain reachable to establish a Google session. They return no database records.

## First-admin bootstrap

Run `supabase/admin_security.sql` in the Supabase SQL editor. The database owner console is the trusted out-of-band control plane, so it can set the initial `is_superadmin = true` value without creating a public promotion endpoint. This avoids both lockout and privilege escalation.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Add both the local callback and the final Vercel callback to Supabase Authentication → URL Configuration:

```text
http://localhost:3000/auth/callback
https://YOUR-DEPLOYMENT.vercel.app/auth/callback
```
