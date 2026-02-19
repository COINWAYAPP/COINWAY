-- Run this in: Supabase → SQL Editor → New query → Run

create table if not exists agents (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text not null default '',
  owner_wallet  text not null,
  target_url    text not null,
  price_usdc    numeric not null,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists payments (
  id            uuid primary key default gen_random_uuid(),
  agent_id      uuid not null references agents(id),
  tx_hash       text not null unique,
  from_wallet   text not null,
  amount_usdc   numeric not null,
  fee_usdc      numeric not null,
  net_usdc      numeric not null,
  status        text not null default 'confirmed',
  created_at    timestamptz not null default now()
);

create table if not exists sessions (
  token         text primary key,
  wallet        text not null,
  expires_at    timestamptz not null,
  created_at    timestamptz not null default now()
);

create index if not exists idx_agents_owner   on agents(owner_wallet);
create index if not exists idx_payments_agent on payments(agent_id);
create index if not exists idx_payments_hash  on payments(tx_hash);

alter table agents   disable row level security;
alter table payments disable row level security;
alter table sessions disable row level security;
