import { Link } from "wouter";

const verticals = [
  {
    icon: "🏥",
    title: "Clinics & Hospitals",
    pain: "40% of calls go unanswered",
    fix: "AI books appointments 24/7 in Hindi & English",
    stat: "₹10L+ recovered per clinic/year",
    color: "from-emerald-500/10 to-transparent border-emerald-500/20",
    accent: "text-emerald-400",
  },
  {
    icon: "🏨",
    title: "Hotels & Hospitality",
    pain: "Night calls wake up staff",
    fix: "AI handles reservations, requests & concierge",
    stat: "100% call coverage, zero missed bookings",
    color: "from-blue-500/10 to-transparent border-blue-500/20",
    accent: "text-blue-400",
  },
  {
    icon: "🛍️",
    title: "E-commerce & D2C",
    pain: "Support team buried in order queries",
    fix: "AI resolves order status, returns instantly",
    stat: "80% queries resolved without human",
    color: "from-violet-500/10 to-transparent border-violet-500/20",
    accent: "text-violet-400",
  },
];

const stats = [
  { value: "< 10 min", label: "Onboarding time" },
  { value: "24/7", label: "Call coverage" },
  { value: "₹5K/mo", label: "Starting price" },
  { value: "10+", label: "Languages supported" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#080C14] text-[#F1F5F9]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1E2A3E]/60 bg-[#080C14]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold">V</div>
            <span className="font-semibold text-[15px] tracking-tight">VoiceOS</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#94A3B8]">
            <a href="#verticals" className="hover:text-white transition-colors">Solutions</a>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm text-[#94A3B8] hover:text-white transition-colors px-4 py-2">Sign in</Link>
            <Link href="/sign-up" className="text-sm bg-blue-600 hover:bg-blue-500 transition-colors text-white px-4 py-2 rounded-lg font-medium">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 max-w-7xl mx-auto">
        <div className="max-w-3xl animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-live" />
            Live AI voice agents on real phone calls
          </div>
          <h1 className="text-[56px] font-normal leading-[1.08] tracking-tight mb-6" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Your AI receptionist<br />
            <em className="text-blue-400 not-italic">that actually works.</em>
          </h1>
          <p className="text-lg text-[#94A3B8] leading-relaxed mb-10 max-w-xl">
            VoiceOS gives any business an AI voice agent on their phone number — answers every call, books appointments, speaks Hindi & English, never sleeps.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/sign-up" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition-all text-white px-6 py-3 rounded-xl font-medium text-sm">
              Start free — live in 10 minutes
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <a href="#demo" className="inline-flex items-center gap-2 border border-[#1E2A3E] hover:border-[#2A3A54] transition-colors text-[#94A3B8] hover:text-white px-6 py-3 rounded-xl font-medium text-sm">
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Watch demo
            </a>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1E2A3E] rounded-2xl overflow-hidden animate-fade-up-delay-2">
          {stats.map((s) => (
            <div key={s.label} className="bg-[#0F1623] px-6 py-5">
              <div className="text-2xl font-semibold text-white mb-1">{s.value}</div>
              <div className="text-xs text-[#94A3B8]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Verticals */}
      <section id="verticals" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="mb-14">
          <p className="text-xs font-medium text-[#475569] uppercase tracking-widest mb-3">Solutions</p>
          <h2 className="text-4xl font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>Built for your industry</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {verticals.map((v) => (
            <div key={v.title} className={`rounded-2xl bg-gradient-to-br ${v.color} border p-6 flex flex-col gap-4`}>
              <div className="text-3xl">{v.icon}</div>
              <div>
                <h3 className="text-lg font-semibold mb-1">{v.title}</h3>
                <p className="text-sm text-[#94A3B8] mb-3">❌ {v.pain}</p>
                <p className="text-sm text-[#F1F5F9]">✓ {v.fix}</p>
              </div>
              <div className={`text-xs font-medium ${v.accent} bg-white/5 rounded-lg px-3 py-2 mt-auto`}>
                {v.stat}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6 max-w-7xl mx-auto border-t border-[#1E2A3E]">
        <div className="mb-14">
          <p className="text-xs font-medium text-[#475569] uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-4xl font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>Live in 10 minutes</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Pick your vertical", desc: "Clinic, hotel, or e-commerce. Each comes with a pre-built agent template." },
            { step: "02", title: "Add your details", desc: "Business name, language, working hours, agent name and voice." },
            { step: "03", title: "Connect your calendar", desc: "One-click Google Calendar OAuth. Agent checks real availability instantly." },
            { step: "04", title: "Go live", desc: "Your AI agent answers every call, books appointments, never misses a lead." },
          ].map((item) => (
            <div key={item.step} className="relative">
              <div className="text-5xl font-mono font-bold text-[#1E2A3E] mb-4">{item.step}</div>
              <h3 className="text-base font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto border-t border-[#1E2A3E]">
        <div className="mb-14">
          <p className="text-xs font-medium text-[#475569] uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-4xl font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>Simple, per-tenant pricing</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl">
          {[
            { name: "Starter", price: "₹4,999", period: "/mo", calls: "500 calls/mo", features: ["1 phone number", "Basic analytics", "Email support", "Hindi + English"], highlight: false },
            { name: "Growth", price: "₹9,999", period: "/mo", calls: "2,000 calls/mo", features: ["2 phone numbers", "Full analytics", "Priority support", "All languages", "Google Calendar", "Custom agent voice"], highlight: true },
            { name: "Enterprise", price: "Custom", period: "", calls: "Unlimited calls", features: ["Unlimited numbers", "White-label", "Dedicated support", "Custom integrations", "SLA guarantee"], highlight: false },
          ].map((plan) => (
            <div key={plan.name} className={`rounded-2xl border p-6 ${plan.highlight ? "border-blue-500/50 bg-blue-500/5" : "border-[#1E2A3E] bg-[#0F1623]"}`}>
              {plan.highlight && <div className="text-xs font-medium text-blue-400 bg-blue-500/10 rounded-full px-3 py-1 inline-block mb-4">Most popular</div>}
              <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-[#94A3B8] text-sm">{plan.period}</span>
              </div>
              <p className="text-xs text-[#475569] mb-5">{plan.calls}</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#94A3B8]">
                    <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className={`block text-center text-sm font-medium py-2.5 rounded-xl transition-colors ${plan.highlight ? "bg-blue-600 hover:bg-blue-500 text-white" : "border border-[#2A3A54] hover:border-[#3B82F6] text-[#94A3B8] hover:text-white"}`}>
                {plan.name === "Enterprise" ? "Contact us" : "Get started"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/20 p-12 text-center">
          <h2 className="text-4xl font-normal mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Ready to never miss a call again?
          </h2>
          <p className="text-[#94A3B8] mb-8 text-base">Live in 10 minutes. No code needed. Cancel anytime.</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition-all text-white px-8 py-3.5 rounded-xl font-medium">
            Start your free trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1E2A3E] py-8 px-6 max-w-7xl mx-auto flex items-center justify-between text-xs text-[#475569]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-xs font-bold text-white">V</div>
          <span>VoiceOS</span>
        </div>
        <span>© 2026 VoiceOS. All rights reserved.</span>
      </footer>
    </div>
  );
}
