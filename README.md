# Hamiq

### Plan. Track. Achieve.

Hamiq is a personal AI-powered planning and decision-support platform designed to help you understand your workload, organize your time, track your goals, and explore different **“what if?”** scenarios before making decisions.

Instead of keeping tasks, goals, study time, habits, deadlines, and schedules in separate places, Hamiq brings them together into one personal workspace.

## What Hamiq Does

### 1. Plan your day
Hamiq helps organize your available time around your tasks, classes, deadlines, study hours, goals, and other commitments.

### 2. Track tasks and deadlines
Create and manage tasks with priorities, deadlines, progress, categories, estimated hours, actual hours, and reminders.

### 3. Manage goals
Keep your long-term and short-term goals in one place and track progress toward them.

### 4. Manage your schedule
Use your timetable and events to understand when you are busy and where you have free time available.

### 5. Track study time
Your study time is treated as a variable rather than a fixed 2-hour-per-day assumption. Hamiq can work with the amount of study time you actually have available.

### 6. Simulate “what if?” scenarios
Hamiq can compare changes to your schedule, workload, available time, study time, sleep, and other personal variables using deterministic simulation logic.

For example:

> What happens if I increase my study time?

> What happens if I add another assignment?

> What happens if I reduce my available time?

The simulator calculates scenario results from the provided variables rather than claiming to predict the future.

### 7. AI-powered assistance
Hamiq can use Groq or Gemini to understand unstructured information and turn it into useful structured items such as:

- Tasks
- Goals
- Habits
- Events
- Deadlines
- Projects
- Schedules
- Constraints
- Notes

The AI can also explain simulation results in a human-readable way.

### 8. Universal Inbox
You can provide information through the Inbox and Hamiq can extract useful items from it. Extracted information can be reviewed before it becomes part of your workspace.

### 9. Reports and insights
Hamiq provides progress and planning information so you can understand your workload, completed work, goals, and time usage.

### 10. Personal memory
Hamiq can store relevant personal planning information so your workspace can become more useful over time.

## Demo and Authorized Access

Hamiq includes a demo experience that can be explored without creating an account or logging in.

The full workspace can be restricted to authorized users. Login credentials are provided by the administrator.

For authorized access or project-related information, contact:

**hammalalam406@gmail.com**

## Core Idea

Hamiq follows a simple workflow:

```text
Your Tasks + Goals + Schedule + Time + Habits
                    ↓
                 Hamiq
                    ↓
          Personal Baseline Model
                    ↓
             Scenario Variables
                    ↓
        Deterministic Simulation
                    ↓
             AI Explanation
                    ↓
          Clearer Planning Decisions
```

Hamiq is designed to support decision-making. It does not claim to know or predict the future with certainty.

## Technology Stack

- Next.js 15 App Router
- TypeScript
- React
- Tailwind CSS
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Groq AI
- Google Gemini AI
- Recharts

## Project Structure

```text
app/                  Next.js pages and API routes
lib/                  Core application logic
lib/ai/               AI providers and extraction
lib/simulation/       Deterministic scenario engine
lib/supabase/         Supabase clients
supabase/migrations/  Database migrations
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_KEY

AI_PROVIDER=groq
GROQ_API_KEY=YOUR_GROQ_KEY
GROQ_MODEL=openai/gpt-oss-120b

# Or use Gemini:
# AI_PROVIDER=gemini
# GEMINI_API_KEY=YOUR_GEMINI_KEY
# GEMINI_MODEL=gemini-2.5-flash
```

AI keys must remain server-side. Do not prefix private AI keys with `NEXT_PUBLIC_`.

### 3. Configure Supabase

Open the Supabase SQL Editor and run the migrations in the `supabase/migrations/` directory in the intended order.

The original database migration is:

```text
supabase/migrations/001_lifetwin.sql
```

The filename is retained for database migration compatibility.

The task/reminder migration is:

```text
supabase/migrations/002_task_reminders.sql
```

### 4. Start Hamiq

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## AI Integration

### Universal Inbox

`POST /api/inbox` uses `lib/ai/extraction.ts` to extract structured information from user input.

Provider selection:

```text
AI_PROVIDER=groq   → lib/ai/groq.ts
AI_PROVIDER=gemini → lib/ai/gemini.ts
```

### Scenario Explanations

`POST /api/ai/insights` receives deterministic simulation results and asks the configured AI provider to explain those results clearly.

The AI is not responsible for the core simulation calculations and should not invent numerical results.

### AI Status

`GET /api/ai/status` reports whether the configured AI provider is available.

## Data and Privacy

Hamiq is designed to work with user-specific planning data stored in Supabase. Supabase Row Level Security (RLS) is used to restrict database access according to the application's authorization model.

Keep production API keys, database credentials, and other secrets out of source control.

## Task Editing, Reminders, and Progress

The task system supports:

- Progress tracking
- Reminder times
- Categories
- Estimated hours
- Actual hours
- Priorities
- Deadlines

These features are added by:

```text
supabase/migrations/002_task_reminders.sql
```

## Deployment

Hamiq can be deployed to Vercel as a Next.js application.

Before deploying, add the required environment variables in the Vercel project settings, especially the Supabase and AI provider variables required by the features you enable.

## Vision

Hamiq is built around one simple idea:

**Plan better. Track what matters. Understand your choices. Achieve your goals.**

