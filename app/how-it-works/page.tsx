import Link from 'next/link';
import {
  Target,
  Trophy,
  Heart,
  ShieldCheck,
  RefreshCw,
  Coins,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 text-xs font-bold uppercase tracking-wider border border-brand-500/20">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Rules & Architecture</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          How Digital Heroes Works
        </h1>
        <p className="text-slate-300 text-base sm:text-lg">
          A clear breakdown of the Stableford scoring system, rolling retention, monthly draw mechanics,
          and jackpot rollover mathematics.
        </p>
      </div>

      {/* Section 1: Stableford Format & 5-Score Retention */}
      <div className="p-8 sm:p-10 rounded-3xl bg-surface-card border border-surface-border space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">1. Stableford Golf Scores & Retention</h2>
            <p className="text-xs text-slate-400">Strictly enforced at the database transaction level</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="p-6 rounded-2xl bg-surface-subtle border border-surface-border space-y-3">
            <h3 className="font-bold text-white text-base">Stableford Scoring Range [1–45]</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Unlike stroke play where lower is better, Stableford awards points per hole relative to par.
              Typical rounds range between 25 and 42 points. The platform accepts integer scores between 1 and 45.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-subtle border border-surface-border space-y-3">
            <h3 className="font-bold text-white text-base">Date Uniqueness & Rolling 5 Rules</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Only <strong>one round per calendar date</strong> is permitted. Only your <strong>latest 5 rounds</strong> are retained. When you submit a 6th round, the oldest round automatically rolls off.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Prize Pool Distribution & Rollover */}
      <div className="p-8 sm:p-10 rounded-3xl bg-surface-card border border-surface-border space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-400 flex items-center justify-center font-bold">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">2. Monthly Prize Pool & Rollover</h2>
            <p className="text-xs text-slate-400">Dynamic tier splits & idempotent prize calculations</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          50% of subscriber fees fund the monthly prize pool. Distribution across tiers is configured in the platform engine:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-surface-subtle border border-amber-500/30 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-400">Tier 1</span>
            <h3 className="text-2xl font-black text-white">5-Match</h3>
            <p className="text-3xl font-extrabold text-gold-400">40% Share</p>
            <p className="text-xs text-slate-300">
              <strong>Rolls Over:</strong> If no subscriber matches all 5 numbers, this entire 40% jackpot carries forward into next month's pool!
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-subtle border border-surface-border space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tier 2</span>
            <h3 className="text-2xl font-black text-white">4-Match</h3>
            <p className="text-3xl font-extrabold text-white">35% Share</p>
            <p className="text-xs text-slate-300">
              Split equally among all subscribers who match 4 numbers. Does not roll over.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-subtle border border-surface-border space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tier 3</span>
            <h3 className="text-2xl font-black text-white">3-Match</h3>
            <p className="text-3xl font-extrabold text-white">25% Share</p>
            <p className="text-xs text-slate-300">
              Split equally among all subscribers who match 3 numbers. Does not roll over.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Charity Model & Winner Verification */}
      <div className="p-8 sm:p-10 rounded-3xl bg-surface-card border border-surface-border space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">3. Charity Guarantee & Winner Verification</h2>
            <p className="text-xs text-slate-400">Integrity, accountability, and real giving</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-surface-subtle border border-surface-border space-y-3">
            <h3 className="font-bold text-white text-base">Charitable Impact Leading the Story</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Subscribers select their preferred cause at signup. A minimum of 10% is pledged, with the freedom to voluntarily increase this percentage up to 100%. Direct donations can also be made independently of membership.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-subtle border border-surface-border space-y-3">
            <h3 className="font-bold text-white text-base">Audited Winner Verification</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Winners submit screenshot proof of their golf scores from their official handicap system or club card. Platform administrators review and approve proof before marking payouts as completed.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-8 sm:p-12 rounded-3xl bg-brand-500 text-slate-950 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl sm:text-3xl font-black">Ready to turn your golf game into good?</h3>
          <p className="text-slate-900 font-medium text-sm mt-1">
            Join hundreds of golfers making a genuine difference every single month.
          </p>
        </div>
        <Link
          href="/signup"
          className="px-8 py-4 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-sm transition-all whitespace-nowrap shadow-xl"
        >
          Sign Up Now
        </Link>
      </div>
    </div>
  );
}

