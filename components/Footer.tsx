import Link from 'next/link';
import { Shield, Heart, Trophy, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-surface-border bg-surface-subtle/50 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base tracking-tight">
                DIGITAL<span className="text-brand-400">HEROES</span>
              </span>
            </Link>
            <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
              Empowering everyday golfers to drive meaningful change. Every round entered funds verified
              charitable partners while putting you in the running for monthly jackpot draws.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-400 font-medium">
              <Heart className="w-3.5 h-3.5 fill-brand-400" />
              <span>Minimum 10% of every subscription pledged to charity</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/charities" className="hover:text-brand-400 transition-colors">
                  Charity Directory
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-brand-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-brand-400 transition-colors">
                  Subscription Plans
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-brand-400 transition-colors">
                  Subscriber Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Evaluation & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Compliance & Security
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strictly PCI-compliant payment gateways. Stableford score verification and rolling-5
              Direct frictionless membership billing. Stableford score verification and rolling-5
              database constraints enforced at the transaction layer.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-card text-[11px] font-medium text-slate-300 border border-surface-border">
                <Trophy className="w-3 h-3 text-gold-400" />
                PRD Level 1 Edition 2026
              </span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-surface-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 Digital Heroes Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Built for Trainee Selection Process</span>
            <span className="text-slate-600">•</span>
            <span>Single Source of Truth: PRD Level 1</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

