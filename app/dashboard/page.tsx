'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy,
  Heart,
  Plus,
  Calendar,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Upload,
  RefreshCw,
  ExternalLink,
  Shield,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [charities, setCharities] = useState<any[]>([]);
  const [upcomingDraw, setUpcomingDraw] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Score Entry Modal & Form
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [scoreValue, setScoreValue] = useState<number>(36);
  const [playedOnDate, setPlayedOnDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [courseName, setCourseName] = useState<string>('');
  const [scoreNotes, setScoreNotes] = useState<string>('');
  const [scoreError, setScoreError] = useState<string>('');
  const [scoreSuccessMessage, setScoreSuccessMessage] = useState<string>('');
  const [submittingScore, setSubmittingScore] = useState<boolean>(false);

  // Charity Update
  const [selectedCharityId, setSelectedCharityId] = useState<string>('');
  const [charityPercent, setCharityPercent] = useState<number>(10);
  const [charitySaveSuccess, setCharitySaveSuccess] = useState<boolean>(false);

  // Proof Upload Modal
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedVerificationId, setSelectedVerificationId] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState<string>('');
  const [submittingProof, setSubmittingProof] = useState<boolean>(false);
  const [proofSuccess, setProofSuccess] = useState<boolean>(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      if (!authData.authenticated) {
        router.push('/login');
        return;
      }
      setUser(authData.user);

      // Load Subscriptions
      const subRes = await fetch('/api/subscription');
      const subData = await subRes.json();
      setSubscription(subData.subscription);
      if (subData.subscription) {
        setSelectedCharityId(subData.subscription.charityId || '');
        setCharityPercent(subData.subscription.charityPercent || 10);
      }

      // Load Scores
      const scoresRes = await fetch('/api/scores');
      const scoresData = await scoresRes.json();
      setScores(scoresData.scores || []);

      // Load Verifications
      const verifRes = await fetch('/api/verifications');
      const verifData = await verifRes.json();
      setVerifications(verifData.verifications || []);

      // Load Charities for charity selector
      const charRes = await fetch('/api/charities');
      const charData = await charRes.json();
      setCharities(charData.charities || []);

      // Load Draws
      const drawsRes = await fetch('/api/draws');
      const drawsData = await drawsRes.json();
      const scheduled = (drawsData.draws || []).find((d: any) => d.status === 'SCHEDULED');
      setUpcomingDraw(scheduled || null);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Submit / Edit Score
  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setScoreError('');
    setScoreSuccessMessage('');
    setSubmittingScore(true);

    try {
      if (editingScoreId) {
        // Edit score
        const res = await fetch(`/api/scores/${editingScoreId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: Number(scoreValue),
            playedOn: playedOnDate,
            courseName,
            notes: scoreNotes,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update score');
        setScoreSuccessMessage('Round updated successfully!');
      } else {
        // Add new score
        const res = await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: Number(scoreValue),
            playedOn: playedOnDate,
            courseName,
            notes: scoreNotes,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add score');
        setScoreSuccessMessage(data.message || 'Round saved successfully!');
      }

      // Refresh scores
      const refreshRes = await fetch('/api/scores');
      const refreshData = await refreshRes.json();
      setScores(refreshData.scores || []);

      setTimeout(() => {
        setScoreModalOpen(false);
        setEditingScoreId(null);
        setScoreSuccessMessage('');
        setCourseName('');
        setScoreNotes('');
      }, 1200);
    } catch (err: any) {
      setScoreError(err.message || 'Error saving score');
    } finally {
      setSubmittingScore(false);
    }
  };

  // Delete Score
  const handleDeleteScore = async (id: string) => {
    if (!confirm('Are you sure you want to remove this golf round?')) return;
    try {
      const res = await fetch(`/api/scores/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setScores(scores.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete score:', err);
    }
  };

  // Update Charity Preferences
  const handleUpdateCharity = async () => {
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_CHARITY',
          charityId: selectedCharityId,
          charityPercent,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubscription(data.subscription);
        setCharitySaveSuccess(true);
        setTimeout(() => setCharitySaveSuccess(false), 3000);
      } else {
        alert(data.error || 'Failed to update charity');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating charity');
    }
  };

  // Toggle Cancel / Reactivate Subscription
  const handleToggleCancel = async () => {
    try {
      const res = await fetch('/api/subscription/toggle-cancel', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSubscription(data.subscription);
        alert(data.message);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Submit Winner Proof
  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVerificationId) return;

    setSubmittingProof(true);
    try {
      const res = await fetch('/api/verifications/upload-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId: selectedVerificationId,
          proofImageUrl: proofUrl,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setProofSuccess(true);
        // Refresh verifications
        const verifRes = await fetch('/api/verifications');
        const verifData = await verifRes.json();
        setVerifications(verifData.verifications || []);
        setTimeout(() => {
          setProofModalOpen(false);
          setProofSuccess(false);
          setProofUrl('');
        }, 1500);
      } else {
        alert(data.error || 'Failed to submit proof');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingProof(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-8 animate-pulse">
        <div className="h-12 w-64 bg-surface-card rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-surface-card rounded-3xl" />
          <div className="h-44 bg-surface-card rounded-3xl" />
          <div className="h-44 bg-surface-card rounded-3xl" />
        </div>
      </div>
    );
  }

  const totalWon = verifications.reduce((sum, v) => sum + v.prizeAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. TOP HEADER & WELCOME */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Shield className="w-3.5 h-3.5 text-brand-400" />
            <span>Subscriber Member Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Welcome back, {user?.name}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingScoreId(null);
              setScoreValue(36);
              setPlayedOnDate(new Date().toISOString().split('T')[0]);
              setCourseName('');
              setScoreNotes('');
              setScoreError('');
              setScoreSuccessMessage('');
              setScoreModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-brand-500/20 flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Golf Score</span>
          </button>
        </div>
      </div>

      {/* 2. WINNINGS NOTIFICATION BANNER (If User has prizes!) */}
      {verifications.length > 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-surface-card to-brand-500/10 border border-amber-500/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Prize Winnings Alert! Total Won: {formatCurrency(totalWon)}
                </h3>
                <p className="text-xs text-slate-300">
                  You have placed in draw prize pools. Upload your score proof to finalize payouts.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {verifications.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-2xl bg-surface-subtle border border-surface-border flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gold-400 uppercase">
                      {v.tier.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">• {v.draw?.title}</span>
                  </div>
                  <p className="text-lg font-black text-white mt-0.5">
                    {formatCurrency(v.prizeAmount)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        v.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : v.status === 'REJECTED'
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      Proof: {v.status}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        v.payoutStatus === 'PAID'
                          ? 'bg-brand-500/10 text-brand-300 border border-brand-500/30'
                          : 'bg-surface-card text-slate-400 border border-surface-border'
                      }`}
                    >
                      Payout: {v.payoutStatus}
                    </span>
                  </div>
                </div>

                {v.payoutStatus !== 'PAID' && (
                  <button
                    onClick={() => {
                      setSelectedVerificationId(v.id);
                      setProofUrl(v.proofImageUrl || '');
                      setProofSuccess(false);
                      setProofModalOpen(true);
                    }}
                    className="px-3 py-2 rounded-xl bg-surface-hover text-xs font-semibold text-white border border-surface-border hover:border-brand-500 flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-brand-400" />
                    <span>{v.proofImageUrl ? 'Update Proof' : 'Upload Proof'}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CORE SUMMARY MODULES (3 CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Module 1: Subscription Status */}
        <div className="p-6 rounded-3xl bg-surface-card border border-surface-border flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-slate-400">
                Subscription Status
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  subscription?.status === 'ACTIVE'
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}
              >
                {subscription?.status || 'INACTIVE'}
              </span>
            </div>
            <h3 className="text-2xl font-black text-white">
              {subscription?.planType === 'YEARLY' ? 'Annual Champion' : 'Monthly Member'}
            </h3>
            <p className="text-xs text-slate-400">
              {subscription?.renewalDate
                ? `Renews on ${formatDate(subscription.renewalDate)}`
                : 'No active renewal date'}
            </p>
          </div>

          <div className="pt-4 border-t border-surface-border/60 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {subscription?.cancelAtPeriodEnd ? 'Cancels at period end' : 'Auto-renew enabled'}
            </span>
            <button
              onClick={handleToggleCancel}
              className="text-xs font-bold text-slate-300 hover:text-white underline"
            >
              {subscription?.cancelAtPeriodEnd ? 'Reactivate' : 'Cancel Renewal'}
            </button>
          </div>
        </div>

        {/* Module 2: Selected Charity & Impact */}
        <div className="p-6 rounded-3xl bg-surface-card border border-surface-border flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-slate-400">Designated Charity</span>
              <span className="text-xs font-black text-rose-400">
                {subscription?.charityPercent || 10}% Pledged
              </span>
            </div>
            <h3 className="text-2xl font-black text-white">
              {subscription?.charity?.name || 'No Charity Selected'}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-2">
              {subscription?.charity?.mission || 'Choose a verified cause to receive your pledge.'}
            </p>
          </div>

          <div className="pt-4 border-t border-surface-border/60 flex items-center justify-between text-xs">
            <Link
              href="/charities"
              className="font-bold text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>Explore All Charities</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Module 3: Next Draw Participation */}
        <div className="p-6 rounded-3xl bg-surface-card border border-surface-border flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-slate-400">Upcoming Draw</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-gold-500/10 text-gold-400 font-bold border border-gold-500/30">
                Monthly Cadence
              </span>
            </div>
            <h3 className="text-2xl font-black text-white">
              {upcomingDraw?.title || 'Next Monthly Jackpot'}
            </h3>
            <p className="text-xs text-slate-400">
              {upcomingDraw?.drawDate
                ? `Draw date: ${formatDate(upcomingDraw.drawDate)}`
                : 'Scheduled for mid-month'}
            </p>
          </div>

          <div className="pt-4 border-t border-surface-border/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Active Retained Scores:</span>
            <span className="font-bold text-white">{scores.length} / 5 Logged</span>
          </div>
        </div>
      </div>

      {/* 4. SCORE MANAGEMENT INTERFACE (ROLLING 5 STABLEFORD) */}
      <div className="p-8 rounded-3xl bg-surface-card border border-surface-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Stableford Scorecard (Latest 5 Rounds)
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-300 font-bold border border-brand-500/20">
                1–45 Range
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Strictly 1 score per date. New scores automatically retain the latest 5 rounds, purging older entries.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingScoreId(null);
              setScoreValue(36);
              setPlayedOnDate(new Date().toISOString().split('T')[0]);
              setCourseName('');
              setScoreNotes('');
              setScoreError('');
              setScoreSuccessMessage('');
              setScoreModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Round</span>
          </button>
        </div>

        {/* Scores Table / Visual Cards */}
        {scores.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-surface-subtle border border-surface-border space-y-3">
            <Calendar className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-base font-bold text-white">No Golf Rounds Recorded Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add your recent Stableford scores (1–45). Once you have recorded rounds, they will automatically enter the monthly prize draw.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {scores.map((round, idx) => (
              <div
                key={round.id}
                className="p-5 rounded-2xl bg-surface-subtle border border-surface-border flex flex-col justify-between hover:border-brand-500/40 transition-all relative group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Round #{idx + 1}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {formatDate(round.playedOn)}
                    </span>
                  </div>
                  <div className="text-3xl font-black text-brand-400">{round.score}</div>
                  <p className="text-xs text-slate-300 font-semibold truncate">
                    {round.courseName || 'Unspecified Course'}
                  </p>
                  {round.notes && (
                    <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                      "{round.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-surface-border/40 mt-3 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingScoreId(round.id);
                      setScoreValue(round.score);
                      setPlayedOnDate(new Date(round.playedOn).toISOString().split('T')[0]);
                      setCourseName(round.courseName || '');
                      setScoreNotes(round.notes || '');
                      setScoreError('');
                      setScoreSuccessMessage('');
                      setScoreModalOpen(true);
                    }}
                    title="Edit round"
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-surface-card"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteScore(round.id)}
                    title="Delete round"
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-surface-card"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. CHARITY ALLOCATION SETTINGS CARD */}
      <div className="p-8 rounded-3xl bg-surface-card border border-surface-border space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400" />
              <span>Manage Your Charitable Contribution</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Adjust your designated charity or increase your voluntary contribution percentage anytime.
            </p>
          </div>
          {charitySaveSuccess && (
            <span className="text-xs font-bold text-brand-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Saved!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Designated Charity Partner
            </label>
            <select
              value={selectedCharityId}
              onChange={(e) => setSelectedCharityId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-subtle border border-surface-border text-white text-sm focus:outline-none focus:border-brand-500"
            >
              {charities.map((c) => (
                <option key={c.id} value={c.id} className="bg-surface-card text-white">
                  {c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Pledge Percentage (Min 10%)
              </label>
              <span className="text-lg font-black text-rose-400">{charityPercent}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={charityPercent}
              onChange={(e) => setCharityPercent(Number(e.target.value))}
              className="w-full h-2.5 bg-surface-subtle rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <p className="text-[11px] text-slate-400">
              Directly directing {charityPercent}% of your membership fee to this organization.
            </p>
          </div>
        </div>

        <button
          onClick={handleUpdateCharity}
          className="px-6 py-2.5 rounded-xl bg-surface-subtle hover:bg-surface-hover text-white font-bold text-xs border border-surface-border"
        >
          Save Charity Preferences
        </button>
      </div>

      {/* ADD / EDIT SCORE MODAL */}
      {scoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-3xl bg-surface-card border border-surface-border p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {editingScoreId ? 'Edit Golf Round' : 'Add Stableford Score'}
              </h3>
              <button
                onClick={() => setScoreModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {scoreError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{scoreError}</span>
              </div>
            )}

            {scoreSuccessMessage && (
              <div className="p-3.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{scoreSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleScoreSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Stableford Score (1–45)
                </label>
                <input
                  type="number"
                  min="1"
                  max="45"
                  required
                  value={scoreValue}
                  onChange={(e) => setScoreValue(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-white text-base font-bold focus:outline-none focus:border-brand-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Valid range: 1 to 45 points in Stableford format.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Round Date
                </label>
                <input
                  type="date"
                  required
                  value={playedOnDate}
                  onChange={(e) => setPlayedOnDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-white text-sm focus:outline-none focus:border-brand-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Strictly one round allowed per calendar date.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Golf Course Name (Optional)
                </label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g. Pine Valley Memorial"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={scoreNotes}
                  onChange={(e) => setScoreNotes(e.target.value)}
                  placeholder="e.g. Sunny day, great back nine"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingScore}
                  className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm transition-all disabled:opacity-50"
                >
                  {submittingScore ? 'Saving Round...' : editingScoreId ? 'Update Round' : 'Save Round'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROOF UPLOAD MODAL */}
      {proofModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-3xl bg-surface-card border border-surface-border p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-brand-400" />
                <span>Submit Winner Score Proof</span>
              </h3>
              <button
                onClick={() => setProofModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Per PRD Section 09, winners must provide a screenshot or image of their scores from their official golf club or handicap platform for admin verification.
            </p>

            {proofSuccess ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-brand-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">Proof Submitted!</h4>
                <p className="text-xs text-slate-400">
                  Our administrators will review your scorecard. Payout will update upon approval.
                </p>
              </div>
            ) : (
              <form onSubmit={handleProofSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Proof Screenshot URL / Image
                  </label>
                  <input
                    type="url"
                    required
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    placeholder="https://example.com/scorecard-proof.jpg"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-white text-sm focus:outline-none focus:border-brand-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enter direct link to scorecard image or golf app screenshot.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submittingProof}
                    className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm transition-all disabled:opacity-50"
                  >
                    {submittingProof ? 'Uploading Proof...' : 'Submit For Admin Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

