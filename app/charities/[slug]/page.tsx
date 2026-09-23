'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Heart,
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Share2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function CharityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [charity, setCharity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState('50');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.slug) {
      fetch(`/api/charities/${params.slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.charity) setCharity(data.charity);
        })
        .finally(() => setLoading(false));
    }
  }, [params.slug]);

  const handleDirectDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!charity) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/charities/${charity.id}/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(donationAmount),
          donorName,
          donorEmail,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDonationSuccess(true);
        // Refresh charity stats
        setCharity({
          ...charity,
          totalRaised: charity.totalRaised + Number(donationAmount),
          activeSupporters: charity.activeSupporters + 1,
        });
      } else {
        alert(data.error || 'Failed to submit donation');
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting donation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 animate-pulse space-y-6">
        <div className="h-64 rounded-3xl bg-surface-card" />
        <div className="h-8 w-1/2 bg-surface-card rounded-lg" />
        <div className="h-24 bg-surface-card rounded-lg" />
      </div>
    );
  }

  if (!charity) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white">Charity Not Found</h2>
        <p className="text-slate-400 mt-2 mb-6">The charity profile you requested does not exist.</p>
        <Link
          href="/charities"
          className="px-6 py-2.5 rounded-xl bg-brand-500 text-slate-950 font-bold"
        >
          Return to Directory
        </Link>
      </div>
    );
  }

  const events = JSON.parse(charity.upcomingEvents || '[]');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back button */}
      <Link
        href="/charities"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Directory</span>
      </Link>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-surface-border bg-surface-card min-h-[320px] flex flex-col justify-end p-8 sm:p-12">
        <img
          src={charity.coverImageUrl}
          alt={charity.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
            {charity.category}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">{charity.name}</h1>
          <p className="text-slate-200 text-base sm:text-lg">{charity.mission}</p>
        </div>
      </div>

      {/* Metrics Bar & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-surface-card border border-surface-border">
        <div>
          <p className="text-xs uppercase font-medium text-slate-400">Total Funds Directed</p>
          <p className="text-3xl font-black text-brand-400 mt-1">
            {formatCurrency(charity.totalRaised)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase font-medium text-slate-400">Active Supporters</p>
          <p className="text-3xl font-black text-white mt-1">{charity.activeSupporters} Golfers</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setDonationSuccess(false);
              setDonationModalOpen(true);
            }}
            className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4 fill-slate-950" />
            <span>Direct Donation</span>
          </button>
        </div>
      </div>

      {/* Story & Description */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 rounded-3xl bg-surface-card border border-surface-border space-y-4">
            <h3 className="text-xl font-bold text-white">About the Organization</h3>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line">
              {charity.description}
            </p>
          </div>

          {/* Upcoming Events */}
          <div className="p-8 rounded-3xl bg-surface-card border border-surface-border space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-400" />
                <span>Upcoming Charity Golf Days & Events</span>
              </h3>
            </div>

            {events.length === 0 ? (
              <p className="text-sm text-slate-400">No scheduled events at this time.</p>
            ) : (
              <div className="space-y-4">
                {events.map((evt: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-surface-subtle border border-surface-border space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="font-bold text-white text-base">{evt.name}</h4>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20 flex items-center gap-1 w-fit">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(evt.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    {evt.location && (
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {evt.location}
                      </p>
                    )}
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">{evt.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-surface-card border border-surface-border space-y-4">
            <h4 className="font-bold text-white text-base">Make this your primary cause</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              When you subscribe, you can designate a percentage of your monthly membership fee
              (minimum 10%) directly to {charity.name}.
            </p>
            <Link
              href={`/signup?charityId=${charity.id}`}
              className="w-full block text-center py-3 rounded-xl bg-surface-hover hover:bg-brand-500 hover:text-slate-950 text-white font-bold text-sm border border-surface-border transition-all"
            >
              Select for Subscription
            </Link>
          </div>
        </div>
      </div>

      {/* Direct Donation Modal */}
      {donationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-3xl bg-surface-card border border-surface-border p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-brand-400 font-bold text-sm">
                <Heart className="w-4 h-4 fill-brand-400" />
                <span>Direct Independent Donation</span>
              </div>
              <button
                onClick={() => setDonationModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {donationSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-brand-500/20 text-brand-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white">Thank You for Your Generosity!</h4>
                <p className="text-xs text-slate-300">
                  Your direct donation of ${donationAmount} to {charity.name} has been processed
                  successfully in demo mode.
                </p>
                <button
                  onClick={() => setDonationModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-brand-500 text-slate-950 font-bold text-sm"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleDirectDonation} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Select Donation Amount ($USD)
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {['25', '50', '100', '250'].map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setDonationAmount(amt)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          donationAmount === amt
                            ? 'bg-brand-500 text-slate-950 border-brand-500'
                            : 'bg-surface-subtle text-slate-300 border-surface-border hover:text-white'
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-white text-sm focus:outline-none focus:border-brand-500"
                    placeholder="Custom amount"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Donor Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Alex Morgan or Anonymous"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-white text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Donor Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-white text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  * 100% of this direct gift goes to {charity.name}. This is an independent donation
                  not tied to gameplay or prize pools.
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm transition-all disabled:opacity-50"
                >
                  {submitting ? 'Processing Donation...' : `Donate $${donationAmount} Now`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

