'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Trophy,
  Heart,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Target,
  Users,
  CheckCircle2,
  Dice5,
  TrendingUp,
  Calendar,
  Layers,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function HomePage() {
  const [featuredCharity, setFeaturedCharity] = useState<any>(null);
  const [sliderPercent, setSliderPercent] = useState<number>(15);
  const [selectedPlan, setSelectedPlan] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [demoDrawNumbers, setDemoDrawNumbers] = useState<number[]>([14, 22, 35, 38, 41]);
  const [demoUserScores, setDemoUserScores] = useState<number[]>([32, 35, 38, 41, 44]);
  const [demoMatches, setDemoMatches] = useState<number[]>([]);

  useEffect(() => {
    // Fetch featured charity
    fetch('/api/charities?featured=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.charities?.length > 0) {
          setFeaturedCharity(data.charities[0]);
        }
      })
      .catch(() => {});

    // Initial demo match
    const matched = demoUserScores.filter((s) => demoDrawNumbers.includes(s));
    setDemoMatches(matched);
  }, []);

  const handleSimulateRandom = () => {
    const numbers = new Set<number>();
    while (numbers.size < 5) {
      numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    const sorted = Array.from(numbers).sort((a, b) => a - b);
    setDemoDrawNumbers(sorted);
    const matched = demoUserScores.filter((s) => sorted.includes(s));
    setDemoMatches(matched);
  };

  const planPrice = selectedPlan === 'YEARLY' ? 290 : 29;
  const charityAmount = (planPrice * (sliderPercent / 100)).toFixed(2);
  const prizePoolShare = (planPrice * 0.5).toFixed(2);

  return (
    <div className="flex flex-col gap-24 pb-20 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-card border border-surface-border/80 text-xs font-semibold text-brand-300 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
            <span>Digital Heroes PRD Edition 2026</span>
            <span className="text-slate-600">•</span>
            <span className="text-gold-400 flex items-center gap-1 font-bold">
              <Trophy className="w-3 h-3" /> $4,500+ Monthly Jackpots
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Golf With <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-emerald-300 to-teal-400">Heart</span>.
            <br />
            Win With <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-gold-400 to-amber-500">Impact</span>.
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
            A revolutionary subscription platform transforming everyday golf rounds into life-changing
            charity contributions and thrilling monthly prize pools. No fairways or plaid — just pure purpose and real rewards.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full justify-center">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-base transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 group active:scale-95"
            >
              <span>Join As Subscriber</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/charities"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-surface-card hover:bg-surface-hover text-slate-200 font-semibold text-base border border-surface-border transition-all flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Explore Charities</span>
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold text-sm border border-amber-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Instant Test Demo</span>
            </Link>
          </div>

          {/* Live Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full pt-8 border-t border-surface-border/60">
            <div className="p-4 rounded-2xl bg-surface-card/60 border border-surface-border">
              <p className="text-xs uppercase font-medium text-slate-400">Total Charity Directed</p>
              <p className="text-2xl font-bold text-brand-400 mt-1">$64,720+</p>
            </div>
            <div className="p-4 rounded-2xl bg-surface-card/60 border border-surface-border">
              <p className="text-xs uppercase font-medium text-slate-400">Active Prize Pool</p>
              <p className="text-2xl font-bold text-gold-400 mt-1">$3,200</p>
            </div>
            <div className="p-4 rounded-2xl bg-surface-card/60 border border-surface-border">
              <p className="text-xs uppercase font-medium text-slate-400">Rollover Jackpot</p>
              <p className="text-2xl font-bold text-amber-300 mt-1">$960.00</p>
            </div>
            <div className="p-4 rounded-2xl bg-surface-card/60 border border-surface-border">
              <p className="text-xs uppercase font-medium text-slate-400">Verified Nonprofits</p>
              <p className="text-2xl font-bold text-white mt-1">4 Partners</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (FOUR CORE PILLARS) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs uppercase font-bold tracking-wider text-brand-400">
            Engine & Mechanics
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
            Four Simple Steps to Play & Give
          </h3>
          <p className="text-slate-400 text-sm sm:text-base">
            Engineered for complete transparency, guaranteed charitable pledge, and an automated rolling handicap draw system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-surface-card border border-surface-border flex flex-col justify-between hover:border-brand-500/40 transition-all group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                01
              </div>
              <h4 className="text-xl font-bold text-white">Subscribe & Pledge</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Choose monthly ($29) or annual ($290 with 2 months free). Minimum 10% goes straight to your selected vetted charity.
              </p>
            </div>
            <div className="pt-6 border-t border-surface-border/40 mt-6 flex items-center gap-2 text-xs font-medium text-brand-400">
              <Heart className="w-3.5 h-3.5" />
              <span>Direct giving empowered</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-surface-card border border-surface-border flex flex-col justify-between hover:border-brand-500/40 transition-all group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                02
              </div>
              <h4 className="text-xl font-bold text-white">Log 5 Stableford Rounds</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Submit golf rounds (Stableford scores 1–45). Only 1 round per date is allowed. When a 6th round is added, your oldest score automatically rolls off.
              </p>
            </div>
            <div className="pt-6 border-t border-surface-border/40 mt-6 flex items-center gap-2 text-xs font-medium text-brand-400">
              <Target className="w-3.5 h-3.5" />
              <span>Rolling 5-score retention</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-surface-card border border-surface-border flex flex-col justify-between hover:border-brand-500/40 transition-all group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-gold-400 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                03
              </div>
              <h4 className="text-xl font-bold text-white">Monthly Jackpot Draw</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your latest 5 scores automatically enter the monthly draw. Match 3, 4, or 5 numbers. The 5-number match jackpot rolls over if unclaimed!
              </p>
            </div>
            <div className="pt-6 border-t border-surface-border/40 mt-6 flex items-center gap-2 text-xs font-medium text-gold-400">
              <Trophy className="w-3.5 h-3.5" />
              <span>40% / 35% / 25% prize splits</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-3xl bg-surface-card border border-surface-border flex flex-col justify-between hover:border-brand-500/40 transition-all group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                04
              </div>
              <h4 className="text-xl font-bold text-white">Verify & Get Paid</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Winners upload a screenshot proof of their rounds. Once admin approves the proof, payouts transition seamlessly from Pending to Paid.
              </p>
            </div>
            <div className="pt-6 border-t border-surface-border/40 mt-6 flex items-center gap-2 text-xs font-medium text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Protected winner audits</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE DRAW SIMULATOR DEMO */}
      <section id="draws" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-surface-card via-surface-card to-[#121927] border border-surface-border relative overflow-hidden shadow-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-400 mb-2">
                <Dice5 className="w-4 h-4" />
                <span>Interactive Draw Simulator</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                See How Your 5 Scores Match the Draw
              </h3>
              <p className="text-slate-400 text-sm mt-1 max-w-xl">
                Test the matching algorithm. 5 winning numbers are drawn (Random or Frequency-Weighted). 
                Matching 3, 4, or 5 numbers wins you a share of the monthly pool!
              </p>
            </div>

            <button
              onClick={handleSimulateRandom}
              className="px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 active:scale-95 whitespace-nowrap"
            >
              <Dice5 className="w-4 h-4" />
              <span>Simulate Draw Roll</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Draw Numbers Display */}
            <div className="p-6 rounded-2xl bg-surface-subtle/80 border border-surface-border space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-slate-400">
                  Winning Numbers Drawn
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/30">
                  Stableford [1–45]
                </span>
              </div>
              <div className="flex items-center gap-3">
                {demoDrawNumbers.map((num) => (
                  <div
                    key={num}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-xl sm:text-2xl flex items-center justify-center shadow-lg shadow-amber-500/20"
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>

            {/* User Sample Scorecard */}
            <div className="p-6 rounded-2xl bg-surface-subtle/80 border border-surface-border space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-slate-400">
                  Your Retained 5 Scores
                </span>
                <span className="text-xs font-semibold text-brand-400">
                  {demoMatches.length} Matches Found!
                </span>
              </div>
              <div className="flex items-center gap-3">
                {demoUserScores.map((score) => {
                  const isMatch = demoDrawNumbers.includes(score);
                  return (
                    <div
                      key={score}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl font-black text-xl sm:text-2xl flex items-center justify-center transition-all ${
                        isMatch
                          ? 'bg-brand-500 text-slate-950 ring-4 ring-brand-400/40 scale-105 shadow-lg shadow-brand-500/25'
                          : 'bg-surface-card text-slate-400 border border-surface-border'
                      }`}
                    >
                      {score}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Outcome Banner */}
          <div className="mt-8 p-4 rounded-xl bg-surface-card border border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-400 flex items-center justify-center font-bold">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {demoMatches.length === 5
                    ? '🎉 5-MATCH JACKPOT WINNER! You win a share of the 40% Tier!'
                    : demoMatches.length === 4
                    ? '🥈 4-MATCH TIER WINNER! You win a share of the 35% Tier!'
                    : demoMatches.length === 3
                    ? '🥉 3-MATCH TIER WINNER! You win a share of the 25% Tier!'
                    : 'Match 3 or more numbers to enter the winner circle!'}
                </p>
                <p className="text-xs text-slate-400">
                  Matched numbers: {demoMatches.length > 0 ? demoMatches.join(', ') : 'None'}
                </p>
              </div>
            </div>

            <Link
              href="/signup"
              className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              <span>Play for real</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FEATURED CHARITY SPOTLIGHT */}
      {featuredCharity && (
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="relative rounded-3xl overflow-hidden border border-surface-border bg-surface-card">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold uppercase tracking-wider border border-rose-500/30 flex items-center gap-1.5">
                      <Heart className="w-3 h-3 fill-rose-400" /> Featured Nonprofit
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      Category: {featuredCharity.category}
                    </span>
                  </div>

                  <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
                    {featuredCharity.name}
                  </h3>
                  <p className="text-slate-300 text-base leading-relaxed">
                    {featuredCharity.mission}
                  </p>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {featuredCharity.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-surface-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <p className="text-xs uppercase font-medium text-slate-400">Total Raised via Platform</p>
                    <p className="text-3xl font-extrabold text-brand-400 mt-0.5">
                      {formatCurrency(featuredCharity.totalRaised)}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Supported by {featuredCharity.activeSupporters} golfers
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/charities/${featuredCharity.slug}`}
                      className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm transition-all"
                    >
                      View Profile & Events
                    </Link>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full">
                <img
                  src={featuredCharity.coverImageUrl}
                  alt={featuredCharity.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-surface-card via-surface-card/40 to-transparent" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. PRICING & CHARITY CONTRIBUTION SLIDER */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-xs uppercase font-bold tracking-wider text-brand-400">
            Transparent Pricing
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
            Choose Your Plan. Direct Your Impact.
          </h3>
          <p className="text-slate-400 text-sm sm:text-base">
            Every subscription is split automatically: prize pool, guaranteed charity contribution, and zero hidden platform deductions.
          </p>

          {/* Plan Toggle */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-surface-card border border-surface-border mt-4">
            <button
              onClick={() => setSelectedPlan('MONTHLY')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                selectedPlan === 'MONTHLY'
                  ? 'bg-brand-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Member ($29/mo)
            </button>
            <button
              onClick={() => setSelectedPlan('YEARLY')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                selectedPlan === 'YEARLY'
                  ? 'bg-brand-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Champion ($290/yr)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-300 font-bold">
                17% OFF
              </span>
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto p-8 sm:p-10 rounded-3xl bg-surface-card border border-surface-border shadow-xl space-y-8">
          {/* Interactive Charity Contribution Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-lg">Your Charity Contribution</h4>
                <p className="text-xs text-slate-400">
                  Minimum 10% required. You may voluntarily increase this anytime.
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-brand-400">{sliderPercent}%</span>
                <p className="text-xs text-slate-400">of fee pledged</p>
              </div>
            </div>

            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={sliderPercent}
              onChange={(e) => setSliderPercent(Number(e.target.value))}
              className="w-full h-3 bg-surface-subtle rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span>10% (PRD Minimum)</span>
              <span>25%</span>
              <span>50%</span>
              <span>100% (Pure Hero Mode)</span>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-surface-border/60">
            <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border">
              <p className="text-xs text-slate-400">Membership Fee</p>
              <p className="text-2xl font-bold text-white mt-1">
                ${planPrice}
                <span className="text-xs font-normal text-slate-400">
                  /{selectedPlan === 'YEARLY' ? 'year' : 'month'}
                </span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border">
              <p className="text-xs text-rose-400 flex items-center gap-1 font-semibold">
                <Heart className="w-3.5 h-3.5" /> Charity Portion
              </p>
              <p className="text-2xl font-bold text-rose-400 mt-1">${charityAmount}</p>
              <p className="text-[11px] text-slate-400">Directly to verified causes</p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border">
              <p className="text-xs text-gold-400 flex items-center gap-1 font-semibold">
                <Trophy className="w-3.5 h-3.5" /> Prize Pool Portion
              </p>
              <p className="text-2xl font-bold text-gold-400 mt-1">${prizePoolShare}</p>
              <p className="text-[11px] text-slate-400">Enters monthly jackpot</p>
            </div>
          </div>

          {/* Subscribe CTA Button */}
          <div className="pt-2">
            <Link
              href={`/signup?plan=${selectedPlan}&charityPercent=${sliderPercent}`}
              className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-extrabold text-base transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 group"
            >
              <span>Get Started with {sliderPercent}% Charity Impact</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-center text-xs text-slate-500 mt-3">
              Protected Stripe PCI-compliant test checkout • Cancel or switch anytime
              Simple Direct Subscription • Instant Activation • Cancel or switch anytime
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

