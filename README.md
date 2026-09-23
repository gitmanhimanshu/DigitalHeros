# Digital Heroes - Golf Performance & Charity Prize Platform (Level 1)

A modern, subscription-driven full-stack web application combining golf performance tracking (Stableford format), guaranteed charity fundraising, and an automated monthly draw-based reward engine.

Built to feel emotionally engaging and premium, deliberately avoiding traditional golf aesthetics (no plaid, generic grass, or fairway clichés) and leading with charitable impact.

---

## 🔑 Demo Test Credentials

For frictionless evaluation, the database is pre-seeded with full operational test accounts:

| Role | Email | Password | Access / Scope |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@digitalheroes.com` | `admin123` | Full 5 control surfaces (Draw simulation, publishing, winner audits, charity CRUD, reports) |
| **Test Subscriber** | `user@digitalheroes.com` | `user123` | Active subscription, 5 rolling Stableford scores, prize winnings, proof upload |

> **Quick 1-Click Login**: The [`/login`](/login) page features instant demo buttons that autofill and sign in with these credentials immediately.

---

## 🌟 Core Features & PRD Compliance

### 1. Subscription & Payment System (§04)
### 1. Subscription & Direct Native Billing (§04)
- **Plans**: Monthly ($29/mo) and Annual ($290/yr with 17% discount / 2 months free).
- **Stripe Test Mode**: PCI-compliant payment simulation. Card details are never stored on platform.
- **Direct Native Subscription**: Fully self-contained billing method that requires no third-party gateway keys (no Stripe dependency) in either local development or production.
- **Access Control**: Server-side checks validate active subscription on all authenticated requests.
- **Lifecycle**: Full support for Active, Inactive, Lapsed, and Renewal cancellation toggle.

### 2. Stableford Golf Score Management (§05)
- **Score Range**: Integer range **1 to 45** (Stableford format).
- **Date Uniqueness**: Strictly **1 round per calendar date** per user. Duplicate dates are rejected with a clear error prompt to edit or delete existing entries.
- **Rolling-5 Retention**: Enforced atomically at the database transaction layer (`lib/engine/scores.ts`). Submitting a 6th round automatically prunes the oldest round, retaining strictly the top 5 most recent scores sorted reverse-chronologically.

### 3. Draw & Reward Engine (§06 & §07)
- **Dual Draw Logic**:
  - **Random**: Standard lottery-style selection of 5 unique balls from `[1, 45]`.
  - **Algorithmic**: Frequency-weighted selection based on score distributions across all active subscribers, enhanced with Laplace smoothing.
- **Dry-Run Simulation**: Administrators can run simulations to preview matches, prize distribution, and rollover amounts **without publishing or mutating subscriber state**.
- **Configurable Prize Pool Tiers**:
  - **5-Number Match (Jackpot)**: 40% pool share. **Rolls over** to subsequent draws if unclaimed.
  - **4-Number Match**: 35% pool share. Split equally among winners (no rollover).
  - **3-Number Match**: 25% pool share. Split equally among winners (no rollover).
- **Safe Re-runs**: Prize calculation and publishing logic are completely idempotent.

### 4. Charity Contribution System (§08)
- **Minimum 10% Pledge**: Minimum 10% of every subscription is allocated to the user's selected vetted charity.
- **Voluntary Upgrades**: Users can voluntarily increase their charity allocation up to 100%.
- **Direct Independent Donations**: Visitors and members can make direct standalone gifts to any charity independent of gameplay or subscriptions.
- **Directory & Profiles**: Searchable, filterable directory with upcoming charity golf days and events.
- **Zero Redeployment CRUD**: Administrators can add, edit, or deactivate charities dynamically via the Admin Panel.

### 5. Winner Verification & Payouts (§09)
- **Proof Upload**: Draw winners submit a screenshot/photo of their official golf handicap app or club scorecard.
- **Admin Review**: Review queue with image inspection lightbox to **Approve** or **Reject** with admin feedback.
- **Payout State Machine**: Transitions from `PENDING` $\rightarrow$ `PAID` upon administrative confirmation.

### 6. Five Operational Admin Surfaces (§11)
- **01 User Management**: Paginated user directory, score inspector, role and subscription state controls.
- **02 Draw Engine**: Schedule draws, switch logic (Random vs Algorithmic), run dry-run simulations, and publish live results.
- **03 Charity Management**: Add, update, and manage charities and upcoming golf scrambles.
- **04 Winner Audits**: Proof review and payout confirmation workflow.
- **05 Reports & Analytics**: Real-time KPIs, jackpot rollover balance, and Stableford score frequency distribution histogram.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript + React 18
- **Styling**: Tailwind CSS (Dark luxury palette `#0a0e14`, `#111722`, `#10b981`, `#f59e0b`)
- **Database & ORM**: Prisma ORM with SQLite for zero-friction local execution + PostgreSQL / Supabase ready (`supabase/schema.sql`)
- **Authentication**: Secure HttpOnly JWT session tokens with role-based route protection (`middleware.ts`)
- **Icons**: Lucide React

```
├── app/
│   ├── api/                  # Server-side API Route Handlers
│   │   ├── auth/             # Login, Signup, Logout, Session check
│   │   ├── scores/           # Rolling-5 Score entry, edit, delete
│   │   ├── charities/        # Directory, charity detail, direct donation
│   │   ├── subscription/     # Plan toggle, charity pledge, checkout
│   │   ├── draws/            # Listing, simulation, publish
│   │   ├── verifications/    # Proof upload, admin audit, payout
│   │   └── admin/            # Paginated users, dynamic config, analytics
│   ├── charities/            # Public Charity Directory & Detail pages
│   ├── dashboard/            # Subscriber Dashboard (all 5 modules)
│   ├── admin/                # Administrator Panel (all 5 surfaces)
│   ├── how-it-works/         # Draw mechanics & scoring explainer
│   ├── login/                # Sign In with 1-click test credentials
│   ├── signup/               # Multi-step onboarding
│   ├── globals.css           # Modern theme styling & custom scrollbars
│   ├── layout.tsx            # Root layout with responsive Navbar & Footer
│   └── page.tsx              # Public homepage with interactive simulator
├── components/               # Navbar, Footer, and UI elements
├── docs/
│   └── ASSUMPTIONS.md        # Documented decisions on PRD ambiguities
├── lib/
│   ├── auth.ts               # JWT, password hashing, role checkers
│   ├── prisma.ts             # Prisma client singleton
│   ├── utils.ts              # Formatters & tailwind merge
│   └── engine/               # Isolated, testable domain business engines
│       ├── scores.ts         # Stableford validation & atomic rolling 5
│       ├── draw.ts           # Random & Algorithmic draws, simulations
│       ├── charity.ts        # Pledges & independent donations
│       ├── subscription.ts   # Plan lifecycle & access controls
│       └── verification.ts   # Proof review & payout state transitions
├── prisma/
│   ├── schema.prisma         # Prisma relational schema with constraints
│   └── seed.js               # Database seeder
├── supabase/
│   └── schema.sql            # Native PostgreSQL schema for Supabase deployment
└── scripts/
    └── test-engines.js       # Automated test suite for all business rules
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js (v18 or v20+ recommended, tested on v24)
- npm or pnpm

### 2. Setup & Database Initialization
Clone and enter directory:
```bash
npm install
```

Initialize local SQLite database:
```bash
npx prisma generate
npx prisma db push
```

Seed initial accounts, charities, and past draw:
```bash
node prisma/seed.js
```

### 3. Run Automated Engine Verification Tests
Verify all PRD requirements (Score range, rolling 5, date uniqueness, draw simulation, prize splitting, jackpot rollover):
```bash
node scripts/test-engines.js
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Supabase & Vercel Deployment Instructions

### 1. Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard.
3. Paste and run the contents of [`supabase/schema.sql`](supabase/schema.sql).
4. Copy your project URL, anon key, and connection string from **Project Settings $\rightarrow$ API / Database**.

### 2. Vercel Deployment
1. Import this repository into a new Vercel account.
2. Under **Environment Variables**, add:
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
   JWT_SECRET="your-production-jwt-secret-key"
   NEXT_PUBLIC_APP_URL="https://your-deployment.vercel.app"
   NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   STRIPE_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   ```
3. Deploy! Vercel will build and launch the production application.
3. Deploy! Vercel will build and launch the production application without needing any third-party payment gateway setup.

---

## 🧪 Acceptance Testing Checklist Status

- [x] App runs locally without errors
- [x] Production build succeeds (`npm run build`)
- [x] Signup flow with charity selection & voluntary %
- [x] Login with 1-click test credentials
- [x] Role-based server & client protection (Public, Subscriber, Admin)
- [x] Stableford score validation (1–45)
- [x] Strictly 1 score per date blocked at database level
- [x] Atomic write-time rolling-5 retention (6th score replaces oldest)
- [x] Monthly draw scheduling
- [x] Random draw mode (standard lottery)
- [x] Algorithmic draw mode (frequency-weighted)
- [x] Draw simulation runs without publishing results
- [x] Draw publishing commits winners and creates verification records
- [x] 40% / 35% / 25% prize distribution with equal splits among winners
- [x] 5-match jackpot rollover carries over when unclaimed
- [x] Winner proof screenshot upload flow
- [x] Admin audit queue (Approve / Reject)
- [x] Admin payout confirmation (`Pending` $\rightarrow$ `Paid`)
- [x] Charity directory with filters & standalone direct donations
- [x] Admin charity CRUD without redeploying
- [x] Admin paginated users list & score inspector
- [x] Admin reports and score frequency analytics
- [x] Mobile-responsive modern luxury UI with no traditional golf clichés

