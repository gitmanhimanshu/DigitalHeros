# Digital Heroes Platform - Implementation Assumptions

This document records all design and business logic assumptions made to address ambiguities in the **Digital Heroes PRD (Level 1)**, in accordance with Section 24 of the project specifications.

---

## 1. Subscription Plans & Pricing
## 1. Subscription Plans & Direct Native Billing
- **Monthly Plan**: $29.00 / month.
- **Yearly Plan**: $290.00 / year (includes ~17% discount, equivalent to 2 months free).
- **Payment Processing**: Stripe Test Mode checkout sessions and webhook simulator. For zero-friction testing without live Stripe API keys, an interactive demo checkout flow is also provided.
- **Payment Method**: Built-in direct subscription billing. To maintain a simple, reliable, and frictionless assignment setup without third-party external dependencies, the platform uses a self-contained direct subscription method in both local development and production. No third-party payment gateway accounts (such as Stripe) or external webhook configurations are required. Transaction IDs and billing cycles are managed natively.

---

## 2. Prize Pool Calculation & Funding Model
- **Funding Logic**:
  - The PRD states: *"A fixed portion of each subscription contributes to the prize pool. Auto-calculation of each pool tier based on active subscriber count."*
  - By default, **50% of each active subscriber's base subscription fee** is allocated to the monthly prize pool.
  - The prize pool tier percentages are dynamically configured in the database (`PlatformSetting`) and not hard-coded:
    - **5-Number Match (Jackpot)**: 40% of pool (+ any rolled-over jackpot from previous draws).
    - **4-Number Match**: 35% of pool.
    - **3-Number Match**: 25% of pool.
- **Equal Split Rule**:
  - If multiple winners match the same tier in a draw, the tier's prize allocation is divided equally among all verified winners in that tier.
- **Jackpot Rollover Rule**:
  - If 0 subscribers achieve a 5-number match in a published draw, the 40% jackpot amount carries over (`jackpotRolloverOut`) and is added as an opening jackpot (`jackpotRolloverIn`) to the subsequent draw.
  - Unclaimed 4-match and 3-match tier funds do not roll over (they are retained in the platform charity/reserve fund).

---

## 3. Charity Contribution Model
- **Minimum Allocation**: 10% of the subscriber's monthly/annual fee.
- **Voluntary Allocation**: Subscribers can increase their allocation up to 100% during onboarding or in their dashboard settings.
- **Direct Giving**: A standalone direct donation flow is available on every charity profile, allowing public visitors and members to contribute directly without gameplay or subscription constraints.

---

## 4. Draw Generation Semantics
- **Ball Range**: 5 unique integers drawn from the inclusive set `[1, 45]` (matching the Stableford golf score range).
- **Draw Methods**:
  1. **Random (Standard Lottery)**: 5 distinct numbers sampled uniformly at random without replacement from `{1, ..., 45}`.
  2. **Algorithmic (Frequency-Weighted)**:
     - Tally the appearance count of each score (1–45) across all currently retained scores of all active subscribers.
     - Add a Laplace smoothing baseline (+1 count) so non-played numbers still maintain a non-zero probability.
     - Perform weighted random sampling without replacement to pick 5 winning numbers.
- **Simulation Workflow**:
  - Admins can trigger simulations at any time. Simulations calculate potential winners, match counts, and prize allocations based on live subscriber scores **without writing results to the public draw ledger or mutating user balances**.
  - A draw is only finalized and winner notifications generated when the Admin explicitly clicks **"Publish Draw"**.

---

## 5. Golf Score Retention (Rolling 5 Logic)
- **Score Range**: Strictly 1 to 45 (Stableford format).
- **Date Uniqueness**: Strictly 1 score entry per calendar date per user. Adding a score on an existing date is rejected with a descriptive error prompt directing the user to edit or delete the existing round.
- **Rolling 5 Enforcement**:
  - Stored and enforced atomically at the database/service layer.
  - When a user already has 5 scores and submits a new score with a newer date, the oldest score (earliest `playedOn` date) is automatically purged or archived, retaining strictly the top 5 most recent rounds.
  - Scores are always returned and displayed in reverse chronological order (`playedOn DESC`).

---

## 6. Winner Verification & Proof Upload
- Only subscribers who match 3, 4, or 5 numbers in a published draw qualify as winners.
- A winning user sees an alert on their dashboard prompting them to upload verification proof (e.g. a screenshot of their official golf handicap platform or club scorecard).
- Admin reviews the proof screenshot in the Admin Panel:
  - **Approve**: Transitions winner status from `PENDING` to `APPROVED`.
  - **Reject**: Transitions status to `REJECTED` with feedback notes explaining why.
- **Payout State**:
  - Transitions from `PENDING` to `PAID` once the administrator records payment completion.

---

## 7. Authentication & Roles
- Conceptual roles implemented:
  - `PUBLIC_VISITOR`: Unauthenticated browsing, charity directory, platform concept, signup.
  - `SUBSCRIBER`: Authenticated member with subscription management, score entry, charity selection, draw participation, and proof upload.
  - `ADMIN`: Full platform control (user management, draw simulation & publishing, charity CRUD, winner verification, analytics).
- Test Accounts:
  - Admin: `admin@digitalheroes.com` / `admin123`
  - Subscriber: `user@digitalheroes.com` / `user123`

