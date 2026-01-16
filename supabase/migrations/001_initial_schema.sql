-- Calls table
create table if not exists calls (
  call_id text primary key,
  title text not null,
  rep_id text not null,
  rep_name text not null,
  start_time_iso timestamptz not null,
  duration_sec integer not null,
  fathom_url text not null,
  synced_at_iso timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_calls_rep_id on calls(rep_id);
create index if not exists idx_calls_start_time on calls(start_time_iso desc);

-- Coaching table
create table if not exists coaching (
  call_id text primary key references calls(call_id) on delete cascade,
  rep_id text not null,
  coached_at_iso timestamptz not null default now(),
  scores jsonb not null default '{}',
  strengths jsonb not null default '[]',
  improvements jsonb not null default '[]',
  objections jsonb not null default '[]',
  evidence jsonb not null default '[]',
  coach_summary_md text not null default '',
  version text not null default '1.0',
  created_at timestamptz not null default now()
);

create index if not exists idx_coaching_rep_id on coaching(rep_id);

-- Rep ledger table (composite primary key)
create table if not exists rep_ledger (
  rep_id text not null,
  skill_id text not null,
  rolling_score_10 numeric(5,2) not null default 0,
  prev_rolling_score_10 numeric(5,2) not null default 0,
  trend_delta numeric(5,2) not null default 0,
  last_updated_iso timestamptz not null default now(),
  open_focus_area boolean not null default false,
  primary key (rep_id, skill_id)
);

create index if not exists idx_rep_ledger_rep_id on rep_ledger(rep_id);

-- Storage bucket for transcripts (run this in Supabase dashboard or via API)
-- insert into storage.buckets (id, name, public) values ('transcripts', 'transcripts', false);

-- RLS policies (enable row level security)
alter table calls enable row level security;
alter table coaching enable row level security;
alter table rep_ledger enable row level security;

-- Allow service role full access (for server-side operations)
create policy "Service role full access on calls" on calls for all using (true);
create policy "Service role full access on coaching" on coaching for all using (true);
create policy "Service role full access on rep_ledger" on rep_ledger for all using (true);
