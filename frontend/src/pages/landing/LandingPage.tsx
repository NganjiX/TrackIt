import { Link } from 'react-router-dom';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ROUTES } from '@/lib/constants';

/**
 * Marketing-style landing screen in the new neon-dark visual system.
 * Intentionally presentational only.
 */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-10 md:py-14 space-y-16">
        <header className="flex items-center justify-between rounded-2xl border border-[#1E1E1E] bg-[#0D0D0D] px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg border border-[#1E1E1E] bg-[#111111] flex items-center justify-center">
              <MaterialIcon name="account_balance_wallet" className="text-[#BFFF00]" />
            </div>
            <div>
              <p className="font-bold text-white leading-none">FinTrack</p>
              <p className="text-[10px] uppercase tracking-widest text-[#A0A0A0]">MSME Solutions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={ROUTES.LOGIN}
              className="rounded-full border border-[#1E1E1E] bg-black px-4 py-2 text-xs font-semibold text-white hover:border-[#BFFF00]/50"
            >
              Log In
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="rounded-full bg-[#BFFF00] px-4 py-2 text-xs font-bold text-black hover:bg-[#CCFF00]"
            >
              Get Started
            </Link>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#1E1E1E] bg-[#0D0D0D] px-4 py-1 text-xs uppercase tracking-[0.2em] text-[#A0A0A0]">
              <span className="h-2 w-2 rounded-full bg-[#BFFF00]" />
              FinTrack
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white">
              Stop Tracking.
              <br />
              Start Accumulating.
            </h1>
            <p className="max-w-xl text-[#A0A0A0] text-base md:text-lg">
              Smart, dark-mode money intelligence for modern businesses. Track revenue, optimize spending, and
              visualize growth with clarity.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to={ROUTES.LOGIN}
                className="inline-flex items-center gap-2 rounded-full bg-[#BFFF00] px-6 py-3 text-sm font-bold text-black shadow-[0_10px_24px_rgba(0,0,0,0.4)]"
              >
                Log In
                <MaterialIcon name="arrow_forward" />
              </Link>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-[#1E1E1E] bg-[#0D0D0D] px-6 py-3 text-sm font-semibold text-white"
              >
                <MaterialIcon name="play_circle" />
                Watch Demo
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#1E1E1E] bg-[#0D0D0D] p-6 shadow-[0_12px_28px_rgba(0,0,0,0.4)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[#A0A0A0]">Monthly Revenue</p>
            <p className="mt-2 text-4xl font-bold text-white">RWF 3,120,000</p>
            <div className="mt-6 grid grid-cols-6 gap-2">
              {[32, 48, 25, 58, 66, 41].map((h, i) => (
                <div key={i} className="rounded-md bg-[#111111] p-2">
                  <div className="h-20 w-full rounded-sm bg-[#0A0A0A]">
                    <div className="mx-auto mt-auto w-full rounded-sm bg-[#BFFF00]" style={{ height: `${h}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-3xl font-bold text-white">Built to Help You Spend Smarter</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#1E1E1E] bg-[#0D0D0D] p-6 space-y-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#A0A0A0]">Spending Clarity</p>
              <div className="space-y-3">
                {[
                  ['Utilities', '72%'],
                  ['Transport', '55%'],
                  ['Inventory', '90%'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="mb-1 flex justify-between text-sm text-[#A0A0A0]">
                      <span>{label}</span>
                      <span>{value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#111111]">
                      <div className="h-2 rounded-full bg-[#BFFF00]" style={{ width: value }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-[#1E1E1E] bg-[#0D0D0D] p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-[#A0A0A0]">Smart Budgets</p>
              <p className="mt-3 text-3xl font-bold text-white">RWF 8,000</p>
              <div className="mt-6 h-28 rounded-xl bg-[#111111] p-4">
                <div className="h-full w-full rounded-lg bg-gradient-to-t from-[#BFFF00]/35 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#1E1E1E] bg-[#0D0D0D] p-8">
          <h3 className="text-2xl font-bold text-white text-center">Financial Clarity in 3 Steps</h3>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ['Connect', 'Secure your business accounts and sources.'],
              ['Categorize', 'Auto-sort transactions and spending flows.'],
              ['Optimize', 'Get actionable recommendations weekly.'],
            ].map(([title, desc], idx) => (
              <div key={title} className="relative text-center">
                {idx < 2 && (
                  <div className="hidden md:block absolute top-5 left-[65%] w-[70%] h-px bg-[#BFFF00]/40" />
                )}
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#1E1E1E] bg-black text-[#BFFF00]">
                  {idx + 1}
                </div>
                <p className="text-lg font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm text-[#A0A0A0]">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
