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
- **AI Providers**: Claude (Anthropic), OpenAI, Google Gemini
- **Storage**: Local CSV + JSON files

## Setup

### Prerequisites

- Node.js 18+
- Fathom API key
- At least one AI provider API key (Claude, OpenAI, or Gemini)

### Installation

```bash
npm install
```

### Environment Variables

Create `.env.local`:

```env
FATHOM_API_KEY=your_fathom_api_key
CLAUDE_API_KEY=your_anthropic_api_key          # optional
OPENAI_API_KEY=your_openai_api_key             # optional
GEMINI_API_KEY=your_gemini_api_key             # optional
FATHOM_WEBHOOK_SECRET=your_webhook_secret      # optional
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
├── storage/             # CSV data layer
└── fathom.ts            # Fathom API client

data/
├── calls.csv            # Call metadata
├── coaching.csv         # Coaching feedback
├── rep_ledger.csv       # Performance metrics
└── transcripts/         # JSON transcripts
```

## Usage

1. Click **Sync Calls** on the dashboard to pull calls from Fathom
2. Select a call to view its transcript
3. Choose an AI model and click **Run Coaching**
4. Review skill scores, strengths, areas to improve, and key moments
5. Track team performance under the **Reps** page
