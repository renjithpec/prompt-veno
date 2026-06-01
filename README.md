# Prompt Veno

Prompt Veno is a production-ready, mobile-first AI prompt marketplace built with Next.js 15, TypeScript, Tailwind CSS, Shadcn-style UI primitives, Framer Motion, Supabase, PostgreSQL, React Hook Form-ready forms, Zod validation, and Lucide icons.

## Features

- Dark premium SaaS UI optimized for Instagram traffic and small screens
- Homepage, marketplace, category pages, prompt detail pages, admin dashboard, login, sitemap, robots.txt, OpenGraph, Twitter cards, and JSON-LD
- Live search, search suggestions, category filtering, tag filtering, newest, most viewed, most copied, and trending sorting
- Mobile-safe copy prompt button with animated success feedback
- Creator Instagram growth block on every prompt page
- Supabase Auth with Google and email login
- Protected admin routes when Supabase is configured
- Admin settings for Instagram URL, username, creator name, avatar, site title, and description
- Prompt creation and deletion, Supabase Storage image uploads, analytics overview, popular prompt metrics, full SQL schema, indexes, RLS policies, and seed content

## 1. Install Node.js

Install Node.js 20 LTS or newer from [nodejs.org](https://nodejs.org/). Then verify:

```bash
node -v
npm -v
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Create Supabase Project

Create a new Supabase project at [supabase.com](https://supabase.com/). In Project Settings, copy:

- Project URL
- anon public key
- service role key

## 4. Run SQL

Open Supabase SQL Editor and run:

```sql
-- Paste the contents of supabase/migrations/001_promptvault_schema.sql
```

After creating your first admin user through Supabase Auth, promote that user:

```sql
update public.profiles
set role = 'admin'
where email = 'you@example.com';
```

## 5. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in real values:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

For Google Login, enable Google in Supabase Auth Providers and add this redirect URL:

```text
http://localhost:3000/auth/callback
```

For production, also add:

```text
https://yourdomain.com/auth/callback
```

## 6. Run Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 7. Deploy To Vercel

Push the project to GitHub, import it in Vercel, and add the same environment variables in Vercel Project Settings.

Use:

```bash
npm run build
```

as the production build command.

## 8. Connect Domain

In Vercel, open Project Settings, Domains, add your domain, and follow the DNS instructions. Update:

```bash
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

in Vercel and Supabase redirect URLs.

## 9. Production Setup

- Replace seed prompts with your premium marketplace prompts.
- Upload creator avatars and prompt preview images to Supabase Storage or another image CDN.
- Keep `SUPABASE_SERVICE_ROLE_KEY` only in server-side environment variables.
- Review RLS policies before inviting other admins.
- Run Lighthouse on mobile after deploying and keep preview images compressed.

## Useful Routes

- `/` homepage
- `/prompts` marketplace
- `/prompt/cinematic-veo3-car-commercial` prompt detail
- `/category/veo3` category page
- `/login` auth
- `/admin` dashboard
- `/admin/prompts` prompt management
- `/admin/settings` creator and site settings
- `/admin/analytics` analytics
