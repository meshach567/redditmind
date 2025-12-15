<h1 align="center">Reddit Mastermind</h1>
<h2 align="center">AI-Powered Reddit Content Calendar Platform</h2>

<p align="center">
  Automate high-quality Reddit content planning with intelligent algorithms. Generates engaging posts and comment threads across multiple personas.
</p>

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone redditmind.git
cd redditmind
npm install
```

### 2. Set Up Supabase
- Go to [supabase.com](https://supabase.com) and create a project
- Copy your Project URL and Publishable Key
- Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_public_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Create Database Tables
In Supabase SQL Editor, run the SQL schema below (see [Database Schema](#database-schema) section).

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

Copy and paste this SQL into your Supabase SQL Editor:

```sql
-- Personas table (Reddit accounts)
CREATE TABLE IF NOT EXISTS personas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username text NOT NULL,
  bio text,
  subreddits text[] DEFAULT '{}',
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, username)
);

-- Keywords table (Search terms and intents)
CREATE TABLE IF NOT EXISTS keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  keyword text NOT NULL,
  search_intent text,
  intent_category text CHECK (intent_category IN ('comparison', 'recommendation', 'how-to', 'problem-driven', 'general')),
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, keyword)
);

-- Content calendars (Weekly plans)
CREATE TABLE IF NOT EXISTS content_calendars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start date NOT NULL,
  quality_score float CHECK (quality_score >= 0 AND quality_score <= 1),
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id uuid REFERENCES content_calendars(id) ON DELETE CASCADE NOT NULL,
  subreddit text NOT NULL,
  persona_id uuid REFERENCES personas(id),
  title text NOT NULL,
  body text,
  scheduled_time timestamp,
  keyword_id uuid REFERENCES keywords(id),
  created_at timestamp DEFAULT now()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  persona_id uuid REFERENCES personas(id),
  parent_comment_id uuid REFERENCES comments(id),
  text text NOT NULL,
  scheduled_time timestamp,
  created_at timestamp DEFAULT now()
);

-- Persona activity tracking
CREATE TABLE IF NOT EXISTS persona_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id uuid REFERENCES personas(id) ON DELETE CASCADE NOT NULL,
  week_start date NOT NULL,
  posts_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  updated_at timestamp DEFAULT now(),
  UNIQUE(persona_id, week_start)
);

-- Keyword usage history
CREATE TABLE IF NOT EXISTS keyword_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id uuid REFERENCES keywords(id) ON DELETE CASCADE NOT NULL,
  subreddit text NOT NULL,
  week_start date NOT NULL,
  used boolean DEFAULT true,
  updated_at timestamp DEFAULT now(),
  UNIQUE(keyword_id, subreddit, week_start)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_personas_user_id ON personas(user_id);
CREATE INDEX IF NOT EXISTS idx_keywords_user_id ON keywords(user_id);
CREATE INDEX IF NOT EXISTS idx_content_calendars_user_id ON content_calendars(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_calendar_id ON posts(calendar_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_persona_activity_persona_id ON persona_activity(persona_id);
CREATE INDEX IF NOT EXISTS idx_keyword_usage_keyword_id ON keyword_usage(keyword_id);
```

## 🎯 Features

### Persona Management
- Create multiple Reddit accounts/personas
- Track per-persona activity and limits
- Prevent astroturfing with smart rules

### Keyword Management  
- Add search keywords your content targets
- Categorize by intent (comparison, recommendation, how-to, problem-driven)
- Track usage to prevent repetition

### Content Calendar Generation
- One-click generate weekly content plans
- Automatic post + comment thread creation
- Quality scoring (must be 0.7+)
- Realistic scheduling across the week

### Planning Algorithm
**Phase 1: Topic Pool** - Generate 3 templates per keyword
**Phase 2: Selection** - Pick diverse topics with constraints
**Phase 3: Persona Assignment** - Distribute posts fairly across personas
**Phase 4: Post Generation** - Create authentic Reddit posts
**Phase 5: Comments** - Generate realistic conversation threads
**Phase 6: Scheduling** - Realistic timing and distribution

### Dashboard
- View generated calendars
- Preview posts and comments
- Manage personas and keywords
- Generate new weeks on demand

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Next.js API Routes, Supabase (Auth + Database)
- **Error Tracking**: Sentry
- **Rate Limiting**: Upstash Redis
- **Validation**: Zod
- **Deployment**: Vercel + Supabase

## 🔒 Production Features

This project includes production-ready features:

- ✅ **Error Logging**: Sentry integration for error tracking and monitoring
- ✅ **Rate Limiting**: Upstash Redis-based rate limiting to prevent abuse
- ✅ **Input Validation**: Zod schemas for type-safe request validation
- ✅ **CORS Support**: Configurable CORS for cross-origin requests
- ✅ **Security Headers**: Content Security Policy and other security headers
- ✅ **Authentication**: Secure authentication with Supabase
- ✅ **Authorization**: User-based data access control

## 📁 Project Structure

```
app/
├── api/                          # API routes
│   ├── personas/route.ts         # Create/list personas
│   ├── keywords/route.ts         # Create/list keywords
│   └── planning/
│       ├── generate-week/route.ts  # Generate calendar
│       └── calendars/route.ts      # List calendars
├── auth/                         # Auth pages
│   ├── login/page.tsx
│   ├── sign-up/page.tsx
│   └── forgot-password/page.tsx
├── protected/                    # Protected dashboard
│   ├── layout.tsx
│   └── page.tsx
├── layout.tsx
└── page.tsx

components/
├── dashboard/                    # Dashboard components
│   ├── personas-section.tsx
│   ├── keywords-section.tsx
│   ├── calendar-section.tsx
│   └── generate-button.tsx
├── auth/
│   ├── login-form.tsx
│   └── sign-up-form.tsx
└── ui/                          # Shadcn components

lib/
└── supabase/
    ├── client.ts
    └── server.ts
```

## 🚀 Deployment to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables (see [Environment Variables](#environment-variables) section)
5. Deploy!

## 🔧 Production Setup

### Environment Variables

All environment variables should be set in your deployment platform (Vercel, etc.):

#### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Your Supabase publishable key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (keep secret!)

#### Recommended for Production

**Sentry Error Tracking**
- `NEXT_PUBLIC_SENTRY_DSN` - Your Sentry DSN for error tracking
- `NEXT_PUBLIC_SENTRY_DEBUG` - Set to `false` in production

**Upstash Redis (Rate Limiting)**
- `UPSTASH_REDIS_REST_URL` - Your Upstash Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN` - Your Upstash Redis REST token

**CORS Configuration**
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins (optional)

### Setting Up Sentry

1. Create a project at [sentry.io](https://sentry.io)
2. Get your DSN from project settings
3. Add `NEXT_PUBLIC_SENTRY_DSN` to your environment variables
4. Errors will automatically be tracked in production

### Setting Up Rate Limiting

1. Create a Redis database at [Upstash](https://console.upstash.com/)
2. Copy the REST URL and token
3. Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to environment variables
4. Rate limiting is automatically enabled:
   - **Standard**: 10 requests per 10 seconds (most endpoints)
   - **Strict**: 5 requests per minute (expensive operations like calendar generation)

### CORS Configuration

If you need to allow cross-origin requests:
1. Set `ALLOWED_ORIGINS` to a comma-separated list of allowed origins
2. Example: `ALLOWED_ORIGINS=https://example.com,https://app.example.com`
3. If not set, only same-origin requests are allowed

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Run production server
npm run lint     # Check code quality
```

## 🔗 API Routes

- `POST /api/personas` - Create persona
- `GET /api/personas` - List personas
- `POST /api/keywords` - Create keyword
- `GET /api/keywords` - List keywords
- `POST /api/planning/generate-week` - Generate calendar
- `GET /api/planning/calendars` - List calendars

## 📖 Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Feedback and issues

Please file feedback and issues over on the [Supabase GitHub org](https://github.com/supabase/supabase/issues/new/choose).

## More Supabase examples

- [Next.js Subscription Payments Starter](https://github.com/vercel/nextjs-subscription-payments)
- [Cookie-based Auth and the Next.js 13 App Router (free course)](https://youtube.com/playlist?list=PL5S4mPUpp4OtMhpnp93EFSo42iQ40XjbF)
- [Supabase Auth and the Next.js App Router](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)
