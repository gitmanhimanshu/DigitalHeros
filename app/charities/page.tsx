'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Heart, Users, ArrowRight, Filter } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function CharitiesPage() {
  const [charities, setCharities] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Youth', 'Veterans', 'Environment', 'Health'];

  useEffect(() => {
    fetchCharities();
  }, [selectedCategory]);

  const fetchCharities = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/charities', window.location.origin);
      if (selectedCategory !== 'All') {
        url.searchParams.set('category', selectedCategory);
      }
      if (search) {
        url.searchParams.set('search', search);
      }
      const res = await fetch(url.toString());
      const data = await res.json();
      setCharities(data.charities || []);
    } catch (err) {
      console.error('Error fetching charities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCharities();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold uppercase tracking-wider border border-rose-500/20">
          <Heart className="w-3.5 h-3.5 fill-rose-400" />
          <span>Vetted Nonprofit Partners</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Charity Directory
        </h1>
        <p className="text-slate-300 text-base sm:text-lg">
          Discover verified charitable organizations supported by our golfing community. 
          Every subscription directs a minimum 10% directly to your chosen cause.
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-surface-card border border-surface-border">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search causes or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
          />
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-500 text-slate-950 shadow-md'
                  : 'bg-surface-subtle text-slate-300 hover:text-white border border-surface-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-96 rounded-3xl bg-surface-card animate-pulse border border-surface-border"
            />
          ))}
        </div>
      ) : charities.length === 0 ? (
        <div className="text-center py-16 bg-surface-card rounded-3xl border border-surface-border">
          <Heart className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No charities found</h3>
          <p className="text-slate-400 text-sm mt-1">
            Try adjusting your search criteria or category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {charities.map((charity) => {
            const events = JSON.parse(charity.upcomingEvents || '[]');
            return (
              <div
                key={charity.id}
                className="rounded-3xl bg-surface-card border border-surface-border overflow-hidden flex flex-col justify-between hover:border-brand-500/50 transition-all hover:shadow-xl group"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    <img
                      src={charity.coverImageUrl}
                      alt={charity.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[11px] font-bold text-slate-200 border border-white/10">
                      {charity.category}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-3">
                    <h3 className="text-xl font-bold text-white group-hover:text-brand-400 transition-colors">
                      {charity.name}
                    </h3>
                    <p className="text-slate-300 text-sm line-clamp-2 leading-relaxed">
                      {charity.mission}
                    </p>

                    {events.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 font-medium">
                          Next event: {events[0].name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="p-6 pt-0">
                  <div className="pt-4 border-t border-surface-border/60 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-slate-400">Total Raised</p>
                      <p className="text-lg font-black text-brand-400">
                        {formatCurrency(charity.totalRaised)}
                      </p>
                    </div>

                    <Link
                      href={`/charities/${charity.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-200 hover:text-white px-3 py-2 rounded-xl bg-surface-subtle hover:bg-surface-hover transition-colors border border-surface-border"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

