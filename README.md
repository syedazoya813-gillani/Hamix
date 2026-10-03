# Hamiq — Supabase + AI

Hamiq is a full-stack personal scenario simulator. It stores the user's actual data in Supabase and uses a server-side AI provider for structured extraction and explanations.

## Stack
- Next.js App Router + TypeScript
- Supabase Auth + PostgreSQL + Storage
- Groq or Gemini AI
- Recharts
- Tailwind CSS

## 1. Install

```bash
npm install
```

## 2. Environment

Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_KEY

AI_PROVIDER=groq
GROQ_API_KEY=YOUR_GROQ_KEY
GROQ_MODEL=llama-3.3-70b-versatile

# Or use Gemini:
# AI_PROVIDER=gemini
# GEMINI_API_KEY=YOUR_GEMINI_KEY
# GEMINI_MODEL=gemini-2.5-flash
```

The AI keys are server-side only. Do not prefix them with `NEXT_PUBLIC_`.

## 3. Supabase database

Open Supabase SQL Editor and run:

`supabase/migrations/001_lifetwin.sql`

This creates the Hamiq tables, RLS policies, user trigger, and private `lifetwin-files` storage bucket.

## 4. Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Where AI is integrated

### Universal Inbox

`POST /api/inbox` calls `lib/ai/extraction.ts`.

Provider selection:

```text
AI_PROVIDER=groq   -> lib/ai/groq.ts
AI_PROVIDER=gemini -> lib/ai/gemini.ts
```

The AI extracts structured information such as:
- TASK
- GOAL
- HABIT
- EVENT
- DEADLINE
- PROJECT
- SCHEDULE
- CONSTRAINT
- NOTE

The extracted result is saved to `inbox_items` and shown to the user for confirmation before it becomes a task/goal.

### Scenario AI explanation

`POST /api/ai/insights` receives deterministic simulation results and asks the selected AI provider to explain them. The AI does not perform the core math and must not invent numbers.

### AI status

`GET /api/ai/status` reports whether the configured provider has an API key. Settings and Inbox show this status.

## Real user data

The app no longer depends on hard-coded demo data for the dashboard modules. Tasks, goals, habits, events, scenarios, memories, profiles and twin data are read/written through Supabase with RLS.

## Main flow

```text
Your data
   ↓
Supabase
   ↓
Hamiq baseline
   ↓
Scenario variables
   ↓
Deterministic simulation
   ↓
AI explanation
```

Hamiq is a scenario simulator, not a literal future predictor.


## Groq model
The default Groq model is `openai/gpt-oss-120b`. You can override it with `GROQ_MODEL` in `.env.local`.

## Task editing, reminders, and progress reports

Run the new migration after the original migration:

`supabase/migrations/002_task_reminders.sql`

It adds `progress`, `reminder_at`, `category`, and `actual_hours` to tasks.

### Task features
- Edit existing tasks
- Update deadline, estimated/actual hours, priority, category and progress
- Mark complete/incomplete
- Set a browser reminder time
- Enable browser notifications from the Tasks page

Browser reminders work while the Hamiq tab is open. For reminders while the app is completely closed, add Web Push/FCM + a scheduled server/cron worker in production.

### Progress reports
Open `/dashboard/reports` from the sidebar. The report always reads the latest Supabase data and can be regenerated at any time. It includes task completion, workload, goal progress, habits/activity, and an optional AI-written summary. Use **Print / Save PDF** to export the report through the browser print dialog.

## University timetable + personal assistant
Run `supabase/migrations/003_timetable.sql` after the previous migrations. The app now includes:
- `/dashboard/timetable` for recurring university classes
- `/dashboard/assistant` for one personal Hamiq chatbot
- `/api/recommendations` for deterministic task prioritization
- `/api/assistant` for AI planning using the user's real Supabase data

The assistant considers tasks, deadlines, progress, goals, class timetable, upcoming events, and Hamiq capacity. It provides suggestions, not guaranteed predictions.

## Hamiq access flow
- `/demo` is public and requires no login. It uses sample data only.
- `/login` is for authorized users only.
- Public self-registration is disabled; `/signup` redirects to `/login`.
- Access requests: hammalalam406@gmail.com
