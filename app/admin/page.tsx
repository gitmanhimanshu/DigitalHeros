'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  Users,
  Trophy,
  Heart,
  FileCheck,
  BarChart3,
  Sliders,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Share2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  Dice5,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    'USERS' | 'DRAWS' | 'CHARITIES' | 'WINNERS' | 'ANALYTICS' | 'CONFIG'
  >('USERS');
  const [loading, setLoading] = useState(true);

  // Surface 1: Users
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userPagination, setUserPagination] = useState<any>(null);

  // Surface 2: Draws & Simulation
  const [draws, setDraws] = useState<any[]>([]);
  const [selectedDrawForSimulation, setSelectedDrawForSimulation] = useState<any>(null);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [simulationLogic, setSimulationLogic] = useState<'RANDOM' | 'ALGORITHMIC'>('ALGORITHMIC');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [createDrawModalOpen, setCreateDrawModalOpen] = useState(false);
  const [newDrawTitle, setNewDrawTitle] = useState('');
  const [newDrawDate, setNewDrawDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [newDrawLogic, setNewDrawLogic] = useState<'RANDOM' | 'ALGORITHMIC'>('ALGORITHMIC');

  // Surface 3: Charities
  const [charities, setCharities] = useState<any[]>([]);
  const [charityModalOpen, setCharityModalOpen] = useState(false);
  const [newCharityName, setNewCharityName] = useState('');
  const [newCharityCategory, setNewCharityCategory] = useState('Youth');
  const [newCharityMission, setNewCharityMission] = useState('');
  const [newCharityDesc, setNewCharityDesc] = useState('');
  const [newCharityLogo, setNewCharityLogo] = useState('');
  const [newCharityCover, setNewCharityCover] = useState('');

  // Surface 4: Winners
  const [verifications, setVerifications] = useState<any[]>([]);
  const [winnerFilter, setWinnerFilter] = useState('ALL');
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);

  // Surface 5: Analytics & Config
  const [analytics, setAnalytics] = useState<any>(null);
  const [config, setConfig] = useState<any>({
    tier5Share: 0.4,
    tier4Share: 0.35,
    tier3Share: 0.25,
    subscriberContributionRate: 0.5,
  });
  const [configSaveSuccess, setConfigSaveSuccess] = useState(false);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  useEffect(() => {
    if (activeTab === 'USERS') fetchUsers();
    if (activeTab === 'DRAWS') fetchDraws();
    if (activeTab === 'CHARITIES') fetchCharities();
    if (activeTab === 'WINNERS') fetchWinners();
    if (activeTab === 'ANALYTICS') fetchAnalytics();
    if (activeTab === 'CONFIG') fetchConfig();
  }, [activeTab, userPage, userSearch, winnerFilter]);

  const checkAdminAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!data.authenticated || data.user.role !== 'ADMIN') {
        router.push('/login');
        return;
      }
      setCurrentUser(data.user);
      fetchUsers();
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  // Surface 1: Fetch Users
  const fetchUsers = async () => {
    try {
      const url = new URL('/api/admin/users', window.location.origin);
      url.searchParams.set('page', String(userPage));
      url.searchParams.set('limit', '8');
      if (userSearch) url.searchParams.set('search', userSearch);

      const res = await fetch(url.toString());
      const data = await res.json();
      setUsers(data.users || []);
      setUserPagination(data.pagination);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUserStatus = async (userId: string, status: string) => {
    try {
      await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subscriptionStatus: status }),
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // Surface 2: Fetch & Simulate Draws
  const fetchDraws = async () => {
    try {
      const res = await fetch('/api/draws');
      const data = await res.json();
      setDraws(data.draws || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDraw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/draws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newDrawTitle,
          drawDate: newDrawDate,
          drawLogic: newDrawLogic,
        }),
      });
      if (res.ok) {
        setCreateDrawModalOpen(false);
        setNewDrawTitle('');
        fetchDraws();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunSimulation = async (drawId: string) => {
    setIsSimulating(true);
    try {
      const res = await fetch(`/api/draws/${drawId}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drawLogic: simulationLogic }),
      });
      const data = await res.json();
      if (res.ok) {
        setSimulationResult(data.simulation);
        fetchDraws();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const handlePublishDraw = async (drawId: string) => {
    if (!confirm('Are you sure you want to publish this draw and finalize winners?')) return;
    setIsPublishing(true);
    try {
      const res = await fetch(`/api/draws/${drawId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setSimulationResult(null);
        setSelectedDrawForSimulation(null);
        fetchDraws();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  // Surface 3: Charities
  const fetchCharities = async () => {
    try {
      const res = await fetch('/api/charities');
      const data = await res.json();
      setCharities(data.charities || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCharity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/charities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCharityName,
          category: newCharityCategory,
          mission: newCharityMission,
          description: newCharityDesc,
          logoUrl: newCharityLogo,
          coverImageUrl: newCharityCover,
        }),
      });
      if (res.ok) {
        setCharityModalOpen(false);
        setNewCharityName('');
        setNewCharityMission('');
        setNewCharityDesc('');
        fetchCharities();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Surface 4: Winners
  const fetchWinners = async () => {
    try {
      const url = new URL('/api/verifications', window.location.origin);
      if (winnerFilter !== 'ALL') url.searchParams.set('status', winnerFilter);
      const res = await fetch(url.toString());
      const data = await res.json();
      setVerifications(data.verifications || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewWinner = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const res = await fetch(`/api/verifications/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, adminNotes: `Reviewed by admin on ${new Date().toLocaleDateString()}` }),
      });
      if (res.ok) fetchWinners();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      const res = await fetch(`/api/verifications/${id}/payout`, {
        method: 'POST',
      });
      if (res.ok) fetchWinners();
    } catch (err) {
      console.error(err);
    }
  };

  // Surface 5: Analytics & Config
  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      const data = await res.json();
      setAnalytics(data.analytics);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/config');
      const data = await res.json();
      if (data.config) setConfig(data.config);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok) {
        setConfigSaveSuccess(true);
        setTimeout(() => setConfigSaveSuccess(false), 3000);
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading Admin Operations...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Digital Heroes Operational Console</span>
          </div>
          <h1 className="text-3xl font-black text-white">Administrator Control Surfaces</h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-surface-card hover:bg-surface-hover text-xs font-bold text-slate-300 border border-surface-border"
          >
            Switch to Subscriber View
          </Link>
        </div>
      </div>

      {/* Control Surface Navigation Tabs (5 Surfaces) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'USERS'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-surface-card text-slate-300 hover:text-white border border-surface-border'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>01. User Management</span>
        </button>

        <button
          onClick={() => setActiveTab('DRAWS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'DRAWS'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-surface-card text-slate-300 hover:text-white border border-surface-border'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>02. Draw Engine & Simulation</span>
        </button>

        <button
          onClick={() => setActiveTab('CHARITIES')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'CHARITIES'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-surface-card text-slate-300 hover:text-white border border-surface-border'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>03. Charity Management</span>
        </button>

        <button
          onClick={() => setActiveTab('WINNERS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'WINNERS'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-surface-card text-slate-300 hover:text-white border border-surface-border'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>04. Winner Verification & Payouts</span>
        </button>

        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'ANALYTICS'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-surface-card text-slate-300 hover:text-white border border-surface-border'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>05. Reports & Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('CONFIG')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'CONFIG'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-surface-card text-slate-300 hover:text-white border border-surface-border'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Prize Pool Settings</span>
        </button>
      </div>

      {/* SURFACE 01: USER MANAGEMENT */}
      {activeTab === 'USERS' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-card border border-surface-border space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Platform Users & Subscriptions</h2>
              <p className="text-xs text-slate-400">
                Paginated user database with real-time subscription lifecycle management.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-subtle border border-surface-border text-xs text-white placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-surface-subtle text-slate-400 uppercase font-bold border-b border-surface-border">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Subscription Status</th>
                  <th className="py-3 px-4">Retained Scores</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-subtle/50">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div>{u.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-surface-subtle text-slate-400'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.subscription?.planType || 'None'}
                      <div className="text-[10px] text-slate-400">
                        {u.subscription?.charity?.name ? `Pledging to: ${u.subscription.charity.name}` : ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.subscription?.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-300'
                            : 'bg-rose-500/10 text-rose-300'
                        }`}
                      >
                        {u.subscription?.status || 'INACTIVE'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.scores?.length > 0 ? (
                        <div className="flex items-center gap-1">
                          {u.scores.map((s: any) => (
                            <span
                              key={s.id}
                              className="px-1.5 py-0.5 rounded bg-surface-subtle text-[11px] font-bold text-brand-300 border border-surface-border"
                            >
                              {s.score}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500">0 scores</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.subscription && (
                        <select
                          value={u.subscription.status}
                          onChange={(e) => handleUpdateUserStatus(u.id, e.target.value)}
                          className="px-2 py-1 rounded bg-surface-subtle border border-surface-border text-[11px] text-white"
                        >
                          <option value="ACTIVE">Set Active</option>
                          <option value="INACTIVE">Set Inactive</option>
                          <option value="LAPSED">Set Lapsed</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {userPagination && userPagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-surface-border text-xs text-slate-400">
              <span>
                Page {userPagination.page} of {userPagination.totalPages} ({userPagination.total} users)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={userPage <= 1}
                  onClick={() => setUserPage(userPage - 1)}
                  className="p-1.5 rounded-lg bg-surface-subtle border border-surface-border disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={userPage >= userPagination.totalPages}
                  onClick={() => setUserPage(userPage + 1)}
                  className="p-1.5 rounded-lg bg-surface-subtle border border-surface-border disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SURFACE 02: DRAW MANAGEMENT & SIMULATION */}
      {activeTab === 'DRAWS' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-card border border-surface-border space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Monthly Draw Operations</h2>
                <p className="text-xs text-slate-400">
                  Configure draw mechanics (Random vs Algorithmic), simulate dry-run matches, and publish results.
                </p>
              </div>

              <button
                onClick={() => setCreateDrawModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 w-fit"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule New Draw</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {draws.map((draw) => (
                <div
                  key={draw.id}
                  className={`p-6 rounded-2xl border transition-all space-y-4 ${
                    draw.status === 'PUBLISHED'
                      ? 'bg-surface-subtle/80 border-emerald-500/30'
                      : 'bg-surface-subtle border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white">Draw #{draw.drawNumber}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          draw.status === 'PUBLISHED'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {draw.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{formatDate(draw.drawDate)}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{draw.title}</h3>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-surface-card border border-surface-border">
                      <span className="text-slate-400 block text-[10px]">Total Prize Pool</span>
                      <span className="font-bold text-gold-400 text-sm">
                        {formatCurrency(draw.totalPrizePool)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-card border border-surface-border">
                      <span className="text-slate-400 block text-[10px]">Rollover In / Out</span>
                      <span className="font-bold text-amber-300 text-sm">
                        +${draw.jackpotRolloverIn} / -${draw.jackpotRolloverOut}
                      </span>
                    </div>
                  </div>

                  {draw.status === 'PUBLISHED' && (
                    <div className="p-3 rounded-xl bg-surface-card border border-surface-border space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Winning Numbers</span>
                      <div className="flex items-center gap-2">
                        {JSON.parse(draw.winningNumbers || '[]').map((n: number) => (
                          <span
                            key={n}
                            className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions for Scheduled / Simulated Draw */}
                  {draw.status !== 'PUBLISHED' && (
                    <div className="pt-2 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={simulationLogic}
                          onChange={(e) => setSimulationLogic(e.target.value as any)}
                          className="px-3 py-2 rounded-xl bg-surface-card border border-surface-border text-xs text-white flex-1"
                        >
                          <option value="ALGORITHMIC">Algorithmic (Frequency Weighted)</option>
                          <option value="RANDOM">Standard Random Lottery</option>
                        </select>
                        <button
                          onClick={() => {
                            setSelectedDrawForSimulation(draw);
                            handleRunSimulation(draw.id);
                          }}
                          disabled={isSimulating}
                          className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>{isSimulating ? 'Simulating...' : 'Run Simulation'}</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handlePublishDraw(draw.id)}
                        disabled={isPublishing}
                        className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20"
                      >
                        {isPublishing ? 'Publishing Results...' : 'Publish Draw Results Live'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SIMULATION PREVIEW DRAWER (If simulation run) */}
          {simulationResult && (
            <div className="p-6 sm:p-8 rounded-3xl bg-surface-card border border-amber-500/40 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase">
                    <Sparkles className="w-4 h-4" />
                    <span>Dry-Run Simulation Output (Not Yet Published)</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mt-1">
                    Simulation for Draw #{simulationResult.drawNumber}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-surface-subtle text-slate-300 border border-surface-border">
                    Mode: {simulationResult.drawLogic}
                  </span>
                </div>
              </div>

              {/* Winning Numbers Drawn in Simulation */}
              <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border space-y-2">
                <span className="text-xs uppercase font-bold text-slate-400">Simulated Winning Balls:</span>
                <div className="flex items-center gap-3">
                  {simulationResult.winningNumbers.map((num: number) => (
                    <div
                      key={num}
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-lg flex items-center justify-center shadow-md"
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pool & Rollover Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border">
                  <span className="text-slate-400">Total Simulated Pool</span>
                  <span className="text-xl font-bold text-white block mt-1">
                    {formatCurrency(simulationResult.totalPrizePool)}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border">
                  <span className="text-slate-400">5-Match Winners (40%)</span>
                  <span className="text-xl font-bold text-gold-400 block mt-1">
                    {simulationResult.tier5WinnersCount} ({formatCurrency(simulationResult.tier5PrizePerWinner)} ea)
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border">
                  <span className="text-slate-400">4-Match Winners (35%)</span>
                  <span className="text-xl font-bold text-slate-200 block mt-1">
                    {simulationResult.tier4WinnersCount} ({formatCurrency(simulationResult.tier4PrizePerWinner)} ea)
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border">
                  <span className="text-slate-400">Jackpot Rollover Out</span>
                  <span className="text-xl font-bold text-amber-300 block mt-1">
                    {formatCurrency(simulationResult.jackpotRolloverOut)}
                  </span>
                </div>
              </div>

              {/* Participant Match Breakdown */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">Evaluated Subscribers:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-surface-subtle uppercase text-slate-400 border-b border-surface-border">
                      <tr>
                        <th className="py-2.5 px-3">Subscriber</th>
                        <th className="py-2.5 px-3">Scores Submitted</th>
                        <th className="py-2.5 px-3">Matched Balls</th>
                        <th className="py-2.5 px-3">Prize Tier</th>
                        <th className="py-2.5 px-3 text-right">Prize Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border/60">
                      {simulationResult.participants.map((p: any) => (
                        <tr key={p.userId} className="hover:bg-surface-subtle/40">
                          <td className="py-2.5 px-3 font-semibold text-white">{p.userName}</td>
                          <td className="py-2.5 px-3">{p.scores.join(', ')}</td>
                          <td className="py-2.5 px-3 font-bold text-brand-300">
                            {p.matchedNumbers.length > 0 ? p.matchedNumbers.join(', ') : 'None'} ({p.matchedCount})
                          </td>
                          <td className="py-2.5 px-3 font-bold text-gold-400">{p.tier}</td>
                          <td className="py-2.5 px-3 text-right font-black text-white">
                            {formatCurrency(p.prizeWon)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SURFACE 03: CHARITY MANAGEMENT */}
      {activeTab === 'CHARITIES' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-card border border-surface-border space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Vetted Charity Directory Management</h2>
              <p className="text-xs text-slate-400">
                Add, edit, or configure charitable partners without redeploying the application.
              </p>
            </div>

            <button
              onClick={() => setCharityModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 w-fit"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Charity</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {charities.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-surface-subtle border border-surface-border flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-surface-card text-brand-300 border border-surface-border">
                      {c.category}
                    </span>
                    <span className="text-xs font-bold text-brand-400">
                      Raised: {formatCurrency(c.totalRaised)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{c.name}</h3>
                  <p className="text-xs text-slate-300 line-clamp-2">{c.mission}</p>
                </div>

                <div className="pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{c.activeSupporters} Supporters</span>
                  <Link
                    href={`/charities/${c.slug}`}
                    className="font-bold text-brand-400 hover:underline flex items-center gap-1"
                  >
                    <span>View Public Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SURFACE 04: WINNERS & VERIFICATIONS */}
      {activeTab === 'WINNERS' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-card border border-surface-border space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Winner Verification & Payout Queue</h2>
              <p className="text-xs text-slate-400">
                Inspect score proof screenshots submitted by draw winners, approve or reject submissions, and mark payouts as completed.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {['ALL', 'PENDING', 'APPROVED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setWinnerFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    winnerFilter === st
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-surface-subtle text-slate-300 hover:text-white border border-surface-border'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-surface-subtle text-slate-400 uppercase font-bold border-b border-surface-border">
                <tr>
                  <th className="py-3 px-4">Winner</th>
                  <th className="py-3 px-4">Draw</th>
                  <th className="py-3 px-4">Tier & Prize</th>
                  <th className="py-3 px-4">Score Proof</th>
                  <th className="py-3 px-4">Audit Status</th>
                  <th className="py-3 px-4">Payout</th>
                  <th className="py-3 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60">
                {verifications.map((v) => (
                  <tr key={v.id} className="hover:bg-surface-subtle/50">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div>{v.user?.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{v.user?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{v.draw?.title}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gold-400">{v.tier}</div>
                      <div className="text-sm font-black text-white">
                        {formatCurrency(v.prizeAmount)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {v.proofImageUrl ? (
                        <button
                          onClick={() => setProofPreviewUrl(v.proofImageUrl)}
                          className="px-2.5 py-1 rounded bg-surface-subtle hover:bg-surface-hover text-brand-300 border border-brand-500/30 text-xs font-bold flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Proof</span>
                        </button>
                      ) : (
                        <span className="text-slate-500 italic">No proof uploaded</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : v.status === 'REJECTED'
                            ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.payoutStatus === 'PAID'
                            ? 'bg-brand-500/10 text-brand-300 border border-brand-500/30'
                            : 'bg-surface-card text-slate-400 border border-surface-border'
                        }`}
                      >
                        {v.payoutStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {v.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleReviewWinner(v.id, 'APPROVE')}
                            className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-bold text-[11px]"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReviewWinner(v.id, 'REJECT')}
                            className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-bold text-[11px]"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {v.status === 'APPROVED' && v.payoutStatus !== 'PAID' && (
                        <button
                          onClick={() => handleMarkPaid(v.id)}
                          className="px-3 py-1 rounded bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-[11px] shadow-sm"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SURFACE 05: REPORTS & ANALYTICS */}
      {activeTab === 'ANALYTICS' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-2xl bg-surface-card border border-surface-border">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Users</span>
              <span className="text-2xl font-black text-white block mt-1">
                {analytics.totalUsers}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-surface-card border border-surface-border">
              <span className="text-[10px] uppercase font-bold text-slate-400">Active Subscribers</span>
              <span className="text-2xl font-black text-brand-400 block mt-1">
                {analytics.activeSubscribers}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-surface-card border border-surface-border">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Charity Directed</span>
              <span className="text-2xl font-black text-rose-400 block mt-1">
                {formatCurrency(analytics.totalCharityRaised)}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-surface-card border border-surface-border">
              <span className="text-[10px] uppercase font-bold text-slate-400">Prize Pool Published</span>
              <span className="text-2xl font-black text-gold-400 block mt-1">
                {formatCurrency(analytics.totalPrizePoolPublished)}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-surface-card border border-surface-border">
              <span className="text-[10px] uppercase font-bold text-slate-400">Jackpot Rollover Bal</span>
              <span className="text-2xl font-black text-amber-300 block mt-1">
                {formatCurrency(analytics.currentRolloverJackpot)}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-surface-card border border-surface-border">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Paid Out</span>
              <span className="text-2xl font-black text-emerald-400 block mt-1">
                {formatCurrency(analytics.totalPaidOut)}
              </span>
            </div>
          </div>

          {/* Score Frequency Histogram */}
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-card border border-surface-border space-y-4">
            <h3 className="text-lg font-bold text-white">
              Golf Score Distribution (Stableford 1–45)
            </h3>
            <p className="text-xs text-slate-400">
              Live score frequency across all subscriber scorecards used by the Algorithmic Draw Engine.
            </p>
            <div className="flex items-end gap-1 h-36 pt-4 border-b border-surface-border">
              {Object.entries(analytics.scoreFrequency || {}).map(([score, count]: any) => (
                <div
                  key={score}
                  title={`Score ${score}: ${count} rounds logged`}
                  className="flex-1 bg-brand-500/30 hover:bg-brand-400 transition-all rounded-t relative group cursor-pointer"
                  style={{ height: `${Math.min(100, Math.max(8, count * 25))}%` }}
                >
                  <span className="hidden group-hover:block absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-white font-bold border border-surface-border">
                    {score}: {count}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>Score 1</span>
              <span>Score 23</span>
              <span>Score 45</span>
            </div>
          </div>
        </div>
      )}

      {/* SURFACE 06: DYNAMIC PRIZE POOL CONFIGURATION */}
      {activeTab === 'CONFIG' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-card border border-surface-border space-y-6 max-w-2xl">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Prize Pool & Tier Distribution Config</h2>
            <p className="text-xs text-slate-400">
              PRD Section 07 & 14 requirement: Pool percentages must be configurable and not hard-coded.
            </p>
          </div>

          {configSaveSuccess && (
            <div className="p-3.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Configurations saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                5-Number Match Tier Share (Default 40% = 0.40)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.05"
                max="0.80"
                value={config.tier5Share}
                onChange={(e) => setConfig({ ...config, tier5Share: parseFloat(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                4-Number Match Tier Share (Default 35% = 0.35)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.05"
                max="0.80"
                value={config.tier4Share}
                onChange={(e) => setConfig({ ...config, tier4Share: parseFloat(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                3-Number Match Tier Share (Default 25% = 0.25)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.05"
                max="0.80"
                value={config.tier3Share}
                onChange={(e) => setConfig({ ...config, tier3Share: parseFloat(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Subscriber Subscription Share to Pool (Default 50% = 0.50)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.10"
                max="0.80"
                value={config.subscriberContributionRate}
                onChange={(e) =>
                  setConfig({ ...config, subscriberContributionRate: parseFloat(e.target.value) })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-white text-sm"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
            >
              Update Tier Allocations
            </button>
          </form>
        </div>
      )}

      {/* SCHEDULE DRAW MODAL */}
      {createDrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-3xl bg-surface-card border border-surface-border p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Schedule New Monthly Draw</h3>
              <button
                onClick={() => setCreateDrawModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDraw} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Draw Title
                </label>
                <input
                  type="text"
                  required
                  value={newDrawTitle}
                  onChange={(e) => setNewDrawTitle(e.target.value)}
                  placeholder="e.g. May 2026 Memorial Draw"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  required
                  value={newDrawDate}
                  onChange={(e) => setNewDrawDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Draw Logic
                </label>
                <select
                  value={newDrawLogic}
                  onChange={(e) => setNewDrawLogic(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-white text-sm"
                >
                  <option value="ALGORITHMIC">Algorithmic (Frequency Weighted)</option>
                  <option value="RANDOM">Standard Random Lottery</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm"
              >
                Create Scheduled Draw
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CHARITY MODAL */}
      {charityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-3xl bg-surface-card border border-surface-border p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Add New Charity Partner</h3>
              <button
                onClick={() => setCharityModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCharity} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={newCharityName}
                  onChange={(e) => setNewCharityName(e.target.value)}
                  placeholder="e.g. Adaptive Golf Association"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={newCharityCategory}
                  onChange={(e) => setNewCharityCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-white text-sm"
                >
                  <option value="Youth">Youth</option>
                  <option value="Veterans">Veterans</option>
                  <option value="Health">Health</option>
                  <option value="Environment">Environment</option>
                  <option value="Community">Community</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mission Statement
                </label>
                <textarea
                  required
                  value={newCharityMission}
                  onChange={(e) => setNewCharityMission(e.target.value)}
                  placeholder="Concise mission statement"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-white text-sm h-20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm"
              >
                Publish Charity
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PROOF PREVIEW LIGHTBOX */}
      {proofPreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="max-w-2xl w-full rounded-3xl bg-surface-card border border-surface-border p-6 space-y-4 relative">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Uploaded Scorecard Proof</h4>
              <button
                onClick={() => setProofPreviewUrl(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-2xl bg-black flex items-center justify-center">
              <img
                src={proofPreviewUrl}
                alt="Winner Proof"
                className="max-h-[65vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

