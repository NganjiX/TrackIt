import { Link } from 'react-router-dom';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ROUTES } from '@/lib/constants';

/**
 * Marketing-style landing screen in the new neon-dark visual system.
 * Intentionally presentational only.
 */
export function LandingPage() {
  const partnerLogos = ['Pay', 'GPay', 'PhonePe', 'Paytm'];
  const faqs = [
    {
      q: 'Is FinTrack good for small businesses?',
      a: 'Yes. FinTrack is designed for MSMEs and teams that need simple, reliable financial visibility without heavy setup.',
    },
    {
      q: 'Can I use it before my backend is live?',
      a: 'Yes. Presentation mode keeps your experience fully navigable with realistic mock data for demos and reviews.',
    },
    {
      q: 'Do I need accounting knowledge to use it?',
      a: 'No. The product uses clear labels, guided actions, and visual summaries so non-finance users can operate confidently.',
    },
  ];

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
              Version 1.0
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white">
              Stop Tracking.
              <br />
              Start Accumulating.
            </h1>
            <p className="max-w-xl text-[#A0A0A0] text-base md:text-lg">
              Most apps tell you where your money went. FinTrack tells you what to keep, fix, and grow with real-time
              visibility and automated controls.
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
            <div className="flex items-center gap-3 text-xs text-[#A0A0A0]">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((v) => (
                  <div key={v} className="h-7 w-7 rounded-full border border-[#1E1E1E] bg-[#111111]" />
                ))}
              </div>
              <span>Trusted by 5000+ users</span>
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

        <section className="grid grid-cols-2 gap-8 border-y border-[#1E1E1E] py-5 md:grid-cols-4">
          {partnerLogos.map((logo) => (
            <div key={logo} className="text-center text-sm md:text-xl font-semibold text-[#A0A0A0]">
              {logo}
            </div>
          ))}
        </section>

        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center rounded-full border border-[#1E1E1E] bg-[#0D0D0D] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#A0A0A0]">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Built to help you spend smarter, not less.</h2>
            <p className="text-[#A0A0A0] max-w-2xl mx-auto text-sm md:text-base">
              Visualize spending, automate budgeting, and improve your decision making with clear, actionable
              dashboards.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#1E1E1E] bg-[#0D0D0D] p-6 space-y-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#A0A0A0]">Spending Clarity</p>
              <div className="space-y-3">
                {[
                  ['Dining & Food', '82%'],
                  ['Transport', '56%'],
                  ['Entertainment', '43%'],
                  ['Others', '31%'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="mb-1 flex justify-between text-xs text-[#A0A0A0]">
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

            <div className="grid gap-4">
              <div className="rounded-2xl border border-[#1E1E1E] bg-[#0D0D0D] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[#A0A0A0]">Smart Budgets</p>
                <p className="mt-2 text-sm text-[#A0A0A0]">Stay on target with auto budget caps.</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-2xl font-bold text-white">Rs. 8,300</p>
                  <div className="h-14 w-14 rounded-full border-4 border-[#BFFF00] border-r-transparent" />
                </div>
              </div>
              <div className="rounded-2xl border border-[#1E1E1E] bg-[#0D0D0D] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[#A0A0A0]">Automatic Savings</p>
                <div className="mt-6 h-20 rounded-xl bg-[#111111] p-2">
                  <div className="h-full w-full rounded-lg bg-gradient-to-t from-[#BFFF00]/50 to-transparent" />
                </div>
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

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#1E1E1E] bg-[#0D0D0D] p-6 space-y-4">
            <span className="inline-flex items-center rounded-full border border-[#1E1E1E] bg-[#111111] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[#A0A0A0]">
              Benefits
            </span>
            <h3 className="text-3xl font-bold text-white">Tools built for wealth.</h3>
            <div className="space-y-3 text-sm">
              {[
                ['Smart Budgets', 'Set category budgets and alerts.'],
                ['Impulse Control', 'See risk spots before spending.'],
                ['Goal Buckets', 'Track savings goals clearly.'],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-xl border border-[#1E1E1E] bg-[#111111] p-4">
                  <p className="font-semibold text-white">{title}</p>
                  <p className="text-[#A0A0A0] mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-[#1E1E1E] bg-[#0D0D0D] p-6">
            <p className="text-3xl font-bold text-white">Rs. 8,000</p>
            <div className="mt-4 h-3 rounded-full bg-[#111111]">
              <div className="h-3 w-2/3 rounded-full bg-[#BFFF00]" />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#1E1E1E] bg-[#111111] p-3">
                <p className="text-xs uppercase text-[#A0A0A0]">Monthly Save</p>
                <p className="text-xl font-bold text-white mt-1">Rs. 400</p>
              </div>
              <div className="rounded-xl border border-[#1E1E1E] bg-[#111111] p-3">
                <p className="text-xs uppercase text-[#A0A0A0]">Progress</p>
                <p className="text-xl font-bold text-[#BFFF00] mt-1">Rs. 1200</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            ['12K+', 'Active merchants'],
            ['98.9%', 'Uptime reliability'],
            ['43%', 'Avg cost visibility uplift'],
            ['24/7', 'Monitoring and alerts'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl border border-[#1E1E1E] bg-[#0D0D0D] p-5">
              <p className="text-3xl font-bold text-[#BFFF00]">{value}</p>
              <p className="mt-2 text-sm text-[#A0A0A0]">{label}</p>
            </div>
          ))}
        </section>

        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center rounded-full border border-[#1E1E1E] bg-[#0D0D0D] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#A0A0A0]">
              Use Cases
            </span>
            <h3 className="text-3xl font-bold text-white">Made for every finance workflow</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['Retail Owners', 'Track sales, purchases, and low-stock risk in one dashboard.'],
              ['Finance Teams', 'Monitor trends, cashflow, and budgets with quick reporting.'],
              ['Operators', 'Keep daily transactions clean and improve credit readiness.'],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl border border-[#1E1E1E] bg-[#0D0D0D] p-6">
                <p className="text-lg font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm text-[#A0A0A0]">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#1E1E1E] bg-[#0D0D0D] p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-[#A0A0A0]">Testimonial</p>
          <p className="mt-4 text-2xl md:text-3xl font-semibold text-white leading-relaxed">
            "FinTrack changed how we run our cash cycle. We now see issues earlier and make better weekly decisions."
          </p>
          <div className="mt-5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border border-[#1E1E1E] bg-[#111111]" />
            <div>
              <p className="font-semibold text-white">Aline Uwase</p>
              <p className="text-sm text-[#A0A0A0]">Owner, Kigali Retail Hub</p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center rounded-full border border-[#1E1E1E] bg-[#0D0D0D] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#A0A0A0]">
              Pricing
            </span>
            <h3 className="text-3xl font-bold text-white">Simple plans for growing businesses</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#1E1E1E] bg-[#0D0D0D] p-6">
              <p className="text-sm text-[#A0A0A0]">Starter</p>
              <p className="mt-2 text-3xl font-bold text-white">Free</p>
              <ul className="mt-4 space-y-2 text-sm text-[#A0A0A0]">
                <li>Basic dashboard</li>
                <li>Manual transaction logs</li>
                <li>Up to 1 business</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-[#BFFF00] bg-[#0D0D0D] p-6 shadow-[0_12px_28px_rgba(0,0,0,0.4)]">
              <p className="text-sm text-[#A0A0A0]">Growth</p>
              <p className="mt-2 text-3xl font-bold text-white">RWF 19,000</p>
              <p className="text-xs text-[#A0A0A0]">per month</p>
              <ul className="mt-4 space-y-2 text-sm text-[#A0A0A0]">
                <li>Advanced analytics</li>
                <li>Credit readiness reports</li>
                <li>Team access</li>
              </ul>
              <Link
                to={ROUTES.REGISTER}
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#BFFF00] px-4 py-2 text-sm font-bold text-black hover:bg-[#CCFF00]"
              >
                Start Growth Plan
              </Link>
            </div>
            <div className="rounded-2xl border border-[#1E1E1E] bg-[#0D0D0D] p-6">
              <p className="text-sm text-[#A0A0A0]">Scale</p>
              <p className="mt-2 text-3xl font-bold text-white">Custom</p>
              <ul className="mt-4 space-y-2 text-sm text-[#A0A0A0]">
                <li>Enterprise controls</li>
                <li>Priority support</li>
                <li>Custom integrations</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-3xl font-bold text-white text-center">Frequently Asked Questions</h3>
          <div className="space-y-3 max-w-4xl mx-auto">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-[#1E1E1E] bg-[#0D0D0D] p-5">
                <p className="font-semibold text-white">{faq.q}</p>
                <p className="mt-2 text-sm text-[#A0A0A0]">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#1E1E1E] bg-[#0D0D0D] p-8 md:p-10 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white">Ready to run your finances with clarity?</h3>
          <p className="mt-3 text-[#A0A0A0] max-w-2xl mx-auto">
            Join growing businesses using FinTrack to improve decisions, cash discipline, and funding readiness.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to={ROUTES.REGISTER}
              className="inline-flex items-center gap-2 rounded-full bg-[#BFFF00] px-6 py-3 text-sm font-bold text-black hover:bg-[#CCFF00]"
            >
              Get Started Free
              <MaterialIcon name="arrow_forward" />
            </Link>
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center gap-2 rounded-full border border-[#1E1E1E] bg-[#111111] px-6 py-3 text-sm font-semibold text-white hover:border-[#BFFF00]/50"
            >
              Go to Login
            </Link>
          </div>
        </section>
      </div>

      <footer className="border-t border-[#1E1E1E] bg-[#050505]">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-12">
          <div className="grid gap-8 md:grid-cols-5">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg border border-[#1E1E1E] bg-[#111111] flex items-center justify-center">
                  <MaterialIcon name="account_balance_wallet" className="text-[#BFFF00]" />
                </div>
                <div>
                  <p className="font-bold text-white leading-none">FinTrack</p>
                  <p className="text-[10px] uppercase tracking-widest text-[#A0A0A0]">MSME Solutions</p>
                </div>
              </div>
              <p className="mt-4 max-w-sm text-sm text-[#A0A0A0]">
                Smart financial operating system for modern African businesses. Track better. Decide faster. Grow
                confidently.
              </p>
            </div>

            {[
              { title: 'Product', items: ['Features', 'Pricing', 'Security', 'Roadmap'] },
              { title: 'Company', items: ['About', 'Customers', 'Blog', 'Careers'] },
              { title: 'Resources', items: ['Help Center', 'API Docs', 'Status', 'Contact'] },
            ].map((group) => (
              <div key={group.title}>
                <p className="text-sm font-semibold text-white">{group.title}</p>
                <ul className="mt-3 space-y-2 text-sm text-[#A0A0A0]">
                  {group.items.map((item) => (
                    <li key={item} className="hover:text-[#CCFF00] cursor-pointer">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-[#1E1E1E] pt-5 text-sm text-[#A0A0A0] md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} FinTrack. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-[#CCFF00] cursor-pointer">Privacy</span>
              <span className="hover:text-[#CCFF00] cursor-pointer">Terms</span>
              <span className="hover:text-[#CCFF00] cursor-pointer">Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
