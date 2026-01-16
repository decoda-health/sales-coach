# Sales Coach

AI-powered sales call analysis platform that integrates with Fathom to automatically transcribe, analyze, and provide coaching feedback on sales calls.

## Features

- **Fathom Integration** - Sync calls directly from Fathom video meetings
- **Multi-Model AI Coaching** - Choose from Claude, OpenAI, or Gemini for analysis
- **Skill Assessment** - Scores across 8 sales competencies (Discovery, Active Listening, Value Articulation, Objection Handling, Closing, Rapport Building, Product Knowledge, Competitive Positioning)
- **Evidence-Based Feedback** - Key moments with transcript quotes
- **Team Performance Tracking** - Monitor individual reps and team trends

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes
- **AI**: LangChain with Claude, OpenAI, and Google Gemini
- **Storage**: Supabase (PostgreSQL + Storage)

## Setup

### Prerequisites

- Node.js 18+
- Supabase project (free tier works)
- Fathom API key
- At least one AI provider API key (Claude, OpenAI, or Gemini)

### Installation

```bash
npm install
```

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)

2. Run the migration in **SQL Editor**:
   - Go to SQL Editor in Supabase dashboard
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Execute the SQL

3. Create the transcripts storage bucket:
   - Go to **Storage** in Supabase dashboard
   - Click **New bucket**
   - Name: `transcripts`
   - Public: **No** (keep private)

4. Get your credentials from **Settings > API**:
   - Project URL → `SUPABASE_URL`
   - Service Role Key (secret) → `SUPABASE_SERVICE_ROLE_KEY`

### Environment Variables

Create `.env.local`:

```env
# Supabase (required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Fathom
FATHOM_API_KEY=your_fathom_api_key
FATHOM_WEBHOOK_SECRET=your_webhook_secret      # optional

# AI Providers (at least one required)
ANTHROPIC_API_KEY=your_anthropic_api_key       # optional
OPENAI_API_KEY=your_openai_api_key             # optional
GOOGLE_API_KEY=your_google_api_key             # optional
```

### Run

```bash
npm run dev        # Development server at http://localhost:3000
npm run build      # Production build
npm start          # Start production server
```

## Project Structure

```
app/
├── api/                  # API routes
│   ├── calls/           # Call management
│   ├── coach/run/       # AI coaching generation
│   ├── fathom/sync/     # Fathom sync
│   └── reps/            # Team endpoints
├── calls/[id]/          # Call detail page
├── reps/                # Team pages
└── page.tsx             # Dashboard

lib/
├── coach/               # Coaching logic & prompts
│   └── providers/       # AI provider integrations
├── storage/             # Supabase data layer
├── supabase/            # Supabase client & types
└── fathom.ts            # Fathom API client

supabase/
└── migrations/          # Database migrations
```

## Usage

1. Click **Sync Calls** on the dashboard to pull calls from Fathom
2. Select a call to view its transcript
3. Choose an AI model and click **Run Coaching**
4. Review skill scores, strengths, areas to improve, and key moments
5. Track team performance under the **Reps** page
