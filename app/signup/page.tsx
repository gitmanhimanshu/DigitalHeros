'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  Heart,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lock,
  Mail,
  User,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [planType, setPlanType] = useState<'MONTHLY' | 'YEARLY'>(
    (searchParams.get('plan') as 'MONTHLY' | 'YEARLY') || 'MONTHLY'
  );
  const [charities, setCharities] = useState<any[]>([]);
  const [selectedCharityId, setSelectedCharityId] = useState<string>('');
  const [charityPercent, setCharityPercent] = useState<number>(
    Number(searchParams.get('charityPercent')) || 15
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/charities')
      .then((res) => res.json())
      .then((data) => {
        if (data.charities?.length > 0) {
          setCharities(data.charities);
          const preselected = searchParams.get('charityId');
          if (preselected && data.charities.some((c: any) => c.id === preselected)) {
            setSelectedCharityId(preselected);
          } else {
            setSelectedCharityId(data.charities[0].id);
          }
        }
      });
  }, [searchParams]);

  const handleCompleteSignup = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          planType,
          charityId: selectedCharityId,
          charityPercent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Signup error');
      setStep(1); // Return to first step to review
    } finally {
      setLoading(false);
    }
  };

  const selectedCharity = charities.find((c) => c.id === selectedCharityId);
  const planPrice = planType === 'YEARLY' ? 290 : 29;
  const charityAmount = (planPrice * (charityPercent / 100)).toFixed(2);

  return (
    <div className="max-w-xl w-full p-8 sm:p-10 rounded-3xl bg-surface-card border border-surface-border shadow-2xl space-y-8 relative">
      {/* Step Indicator */}
      <div className="flex items-center justify-between pb-4 border-b border-surface-border/60">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step >= 1 ? 'bg-brand-500 text-slate-950' : 'bg-surface-subtle text-slate-400'
            }`}
          >
            1
          </span>
          <span>Account</span>
        </div>
        <div className="h-0.5 w-12 bg-surface-border" />
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step >= 2 ? 'bg-brand-500 text-slate-950' : 'bg-surface-subtle text-slate-400'
            }`}
          >
            2
          </span>
          <span>Plan & Charity</span>
        </div>
        <div className="h-0.5 w-12 bg-surface-border" />
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step >= 3 ? 'bg-brand-500 text-slate-950' : 'bg-surface-subtle text-slate-400'
            }`}
          >
            3
          </span>
          <span>Activate</span>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* STEP 1: ACCOUNT DETAILS */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
            <p className="text-xs text-slate-400">
              Join the platform and start logging your Stableford golf rounds.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jordan Spieth"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!name || !email || !password) {
                setError('Please fill in all account fields.');
                return;
              }
              if (password.length < 6) {
                setError('Password must be at least 6 characters.');
                return;
              }
              setError('');
              setStep(2);
            }}
            className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <span>Continue to Plan & Charity Selection</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: PLAN & CHARITY SELECTION */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Select Plan & Charity Cause</h2>
            <p className="text-xs text-slate-400">
              Pick your subscription tier and designate the charity you wish to empower.
            </p>
          </div>

          {/* Plan selection */}
          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => setPlanType('MONTHLY')}
              className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                planType === 'MONTHLY'
                  ? 'bg-brand-500/10 border-brand-500 text-white'
                  : 'bg-surface-subtle border-surface-border text-slate-400'
              }`}
            >
              <p className="text-xs font-bold uppercase">Monthly Member</p>
              <p className="text-2xl font-extrabold text-white mt-1">$29/mo</p>
              <p className="text-[11px] text-slate-400 mt-1">Flexible monthly renewal</p>
            </div>

            <div
              onClick={() => setPlanType('YEARLY')}
              className={`p-4 rounded-2xl cursor-pointer border transition-all relative ${
                planType === 'YEARLY'
                  ? 'bg-brand-500/10 border-brand-500 text-white'
                  : 'bg-surface-subtle border-surface-border text-slate-400'
              }`}
            >
              <span className="absolute -top-2.5 right-3 text-[10px] px-2 py-0.5 rounded-full bg-gold-500 text-slate-950 font-black">
                17% OFF
              </span>
              <p className="text-xs font-bold uppercase">Annual Champion</p>
              <p className="text-2xl font-extrabold text-white mt-1">$290/yr</p>
              <p className="text-[11px] text-slate-400 mt-1">2 months free</p>
            </div>
          </div>

          {/* Charity selection dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Choose Your Vetted Nonprofit Partner
            </label>
            <select
              value={selectedCharityId}
              onChange={(e) => setSelectedCharityId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-white text-sm focus:outline-none focus:border-brand-500"
            >
              {charities.map((c) => (
                <option key={c.id} value={c.id} className="bg-surface-card text-white">
                  {c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>

          {/* Voluntary percentage slider */}
          <div className="space-y-2 p-4 rounded-2xl bg-surface-subtle border border-surface-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Charity Allocation Percentage
              </span>
              <span className="text-base font-black text-brand-400">{charityPercent}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={charityPercent}
              onChange={(e) => setCharityPercent(Number(e.target.value))}
              className="w-full h-2 bg-surface-card rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <p className="text-[11px] text-slate-400">
              Minimum 10% required. Your fee directly yields <strong>${charityAmount}</strong> for {selectedCharity?.name || 'charity'}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-3 rounded-xl bg-surface-subtle border border-surface-border text-slate-300 text-sm font-semibold hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex-1 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Review & Activate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW & ACTIVATE */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Review & Confirm</h2>
            <p className="text-xs text-slate-400">
              Activate your membership in Stripe test mode.
              Activate your membership directly and begin logging scores.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-subtle border border-surface-border space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Subscriber:</span>
              <span className="font-semibold text-white">{name} ({email})</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Selected Plan:</span>
              <span className="font-semibold text-white">
                {planType === 'YEARLY' ? 'Annual Champion ($290/year)' : 'Monthly Member ($29/month)'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Designated Charity:</span>
              <span className="font-semibold text-brand-400">{selectedCharity?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Charity Pledge:</span>
              <span className="font-semibold text-rose-400">
                {charityPercent}% (${charityAmount})
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-surface-border/60">
              <span className="text-slate-400">Draw Participation:</span>
              <span className="font-semibold text-gold-400">Monthly Jackpot Included</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-3 rounded-xl bg-surface-subtle border border-surface-border text-slate-300 text-sm font-semibold hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleCompleteSignup}
              className="flex-1 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
            >
              {loading ? 'Activating Membership...' : 'Complete & Open Dashboard'}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>

          <p className="text-center text-xs text-slate-500">
            Safe Stripe test simulation mode • Instant activation
            Simple Direct Membership Activation • Cancel or adjust anytime
          </p>
        </div>
      )}
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-slate-400">Loading signup...</div>}>
        <SignupContent />
      </Suspense>
    </div>
  );
}

