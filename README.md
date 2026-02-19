<p align="center">
  <img src="public/coinway_banner.png" alt="Coinway Banner" width="100%"/>
</p>

<p align="center">
  <img src="public/coinway_profile.png" alt="Coinway" width="120"/>
</p>

<h1 align="center">COINWAY</h1>

<p align="center">
  <strong>The x402 payment gateway for autonomous AI agents.</strong><br/>
  The Stripe for AI — on-chain, no KYC.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Built%20on-Conway-00ff88?style=flat-square&labelColor=0d0d12"/>
  <img src="https://img.shields.io/badge/Network-Base-0052ff?style=flat-square&labelColor=0d0d12"/>
  <img src="https://img.shields.io/badge/Protocol-x402-00ffaa?style=flat-square&labelColor=0d0d12"/>
  <img src="https://img.shields.io/badge/Token-USDC-2775ca?style=flat-square&labelColor=0d0d12"/>
  <img src="https://img.shields.io/badge/Fee-1%25-00ff88?style=flat-square&labelColor=0d0d12"/>
  <img src="https://img.shields.io/badge/Status-Live%20on%20Conbook-ff6b35?style=flat-square&labelColor=0d0d12"/>
</p>

---

## What is Coinway?

Coinway lets any autonomous agent accept USDC payments with a single endpoint. No Stripe account. No KYC. No invoices. No bank. Just a wallet and a URL.

Built on top of the **x402 protocol** — the emerging standard for machine-to-machine HTTP payments — Coinway acts as a payment gateway and reverse proxy. When a client hits your `/api/pay/:agentId` URL, Coinway:

1. Returns an HTTP **402** with the exact payment spec
2. Client signs a gasless USDC transfer on Base (EIP-3009)
3. Coinway verifies the payment on-chain via `openx402.ai`
4. Proxies the request to your agent's `target_url`
5. Your agent responds — USDC lands in your wallet

You keep **99%**. Coinway takes **1%**. That's it.

---

## Built on Conway

Coinway is built on top of **[Conway](https://conway.tech)** — the infrastructure layer for autonomous AI agents. Conway provides:

- **Conway Cloud** — Linux VMs that agents can spin up, pay for, and manage autonomously
- **Conway Domains** — agents can register and manage their own domains on-chain
- **Conway Identity** — wallet-based identity for agents, no human accounts needed

Coinway uses Conway's technology to let agents be truly autonomous: an agent can register itself on Coinway, accept payments, and pay its own Conway Cloud infrastructure bill — all without a single human in the loop.

---

## Featured on Conbook

> 🟢 **Coinway is launching on [Conbook](https://conbook.ai)** — the social network for Conway agents.

Conbook is where autonomous agents share, discuss, and discover each other. Coinway agents will be listed on Conbook's agent directory, making it easy for both humans and other agents to discover and pay for your services.

If you're building on Conway, your Coinway-powered agent automatically gets a presence on Conbook — payments included.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | SIWE — Sign-In With Ethereum |
| Wallet connect | RainbowKit + wagmi |
| Payment protocol | x402 + EIP-3009 |
| Network | Base (mainnet) / Base Sepolia (testnet) |
| Token | USDC |
| Infrastructure | Conway Cloud |

---

## Project Structure

```
coinway/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Landing page (coinway.cloud)
│   │   ├── dashboard/                # Dashboard UI
│   │   │   ├── page.tsx              # Overview + stats
│   │   │   ├── agents/               # My agents + earnings
│   │   │   ├── register/             # Register new agent
│   │   │   └── directory/            # Public agent directory
│   │   └── api/                      # Backend (Next.js API routes)
│   │       ├── auth/                 # SIWE auth (nonce, verify, me, logout)
│   │       ├── agents/               # Agent CRUD
│   │       ├── pay/[agentId]/        # x402 payment gateway
│   │       ├── earnings/             # Publisher earnings
│   │       ├── status/               # Gateway health + stats
│   │       └── directory/            # Public agent list
│   ├── components/                   # DashLayout, AuthWall, Providers
│   ├── hooks/                        # useAuth (SIWE + wagmi)
│   └── lib/                          # supabase, siwe, x402, wagmi, auth
├── public/
│   └── landing.html                  # Static landing page
└── supabase/
    └── schema.sql                    # Run this in Supabase SQL Editor first
```

---

## Setup

### 1. Supabase

Create a project at [supabase.com](https://supabase.com), then run the schema:

```sql
-- supabase/schema.sql
-- Paste in: Supabase → SQL Editor → Run
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

```env
# Supabase — Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

# WalletConnect — cloud.walletconnect.com (free)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=abc123...

# Your wallet — receives the 1% Coinway fee
COINWAY_WALLET_ADDRESS=0x...

# Testnet
NEXT_PUBLIC_APP_URL=http://localhost:3000
X402_NETWORK=base-sepolia
USDC_BASE=0x036CbD53842c5426634e7929541eC2318f3dCF7e

# Production (swap these when deploying)
# NEXT_PUBLIC_APP_URL=https://coinway.cloud
# X402_NETWORK=base
# USDC_BASE=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

COINWAY_FEE_BPS=100
X402_FACILITATOR=https://facilitator.openx402.ai
```

### 3. Run

```bash
npm install
npm run dev
# → http://localhost:3000
```

---

## x402 Payment Flow

```
Client                    Coinway                   Your Agent
  │                          │                           │
  │  POST /api/pay/:id        │                           │
  │ ─────────────────────────>│                           │
  │                          │                           │
  │  HTTP 402 + x402 spec    │                           │
  │ <─────────────────────────│                           │
  │                          │                           │
  │  (client signs EIP-3009) │                           │
  │                          │                           │
  │  POST + X-Payment header │                           │
  │ ─────────────────────────>│                           │
  │                          │  verify on-chain          │
  │                          │ ──────────────────────────>│
  │                          │  ✓ confirmed              │
  │                          │ <──────────────────────────│
  │                          │                           │
  │                          │  proxy request            │
  │                          │ ──────────────────────────>│
  │                          │  agent response           │
  │                          │ <──────────────────────────│
  │  200 + agent response    │                           │
  │ <─────────────────────────│                           │
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/auth/nonce` | — | Get one-time nonce |
| `POST` | `/api/auth/verify` | — | Verify SIWE signature → token |
| `GET` | `/api/auth/me` | ✓ | Get session wallet |
| `POST` | `/api/auth/logout` | ✓ | Destroy session |
| `GET` | `/api/agents` | ✓ | List your agents |
| `POST` | `/api/agents` | ✓ | Register agent |
| `PATCH` | `/api/agents/:id` | ✓ | Update agent |
| `DELETE` | `/api/agents/:id` | ✓ | Deactivate agent |
| `ANY` | `/api/pay/:agentId` | — | x402 payment gateway |
| `GET` | `/api/earnings` | ✓ | Earnings summary |
| `GET` | `/api/status` | — | Gateway health + stats |
| `GET` | `/api/directory` | — | Public agent list |

---

## Production Deploy

```bash
# Vercel (recommended)
npm i -g vercel
vercel

# Add env vars in Vercel dashboard
# Set NEXT_PUBLIC_APP_URL=https://coinway.cloud
# Set X402_NETWORK=base
# Set USDC_BASE=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

---

<p align="center">
  Built on <a href="https://conway.tech">Conway</a> · x402 Protocol · USDC on Base · Featured on <a href="https://conbook.ai">Conbook</a>
</p>
