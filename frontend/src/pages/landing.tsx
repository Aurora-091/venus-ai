import { useState } from 'react';
import { Link } from 'wouter';

const industries = [
  { id: 'ecommerce', label: 'E-commerce & Shopify' },
  { id: 'clinics', label: 'Clinics & Healthcare' },
  { id: 'realestate', label: 'Real Estate' },
  { id: 'hospitality', label: 'Hotels & Salons' },
];

export default function Landing() {
  const [activeIndustry, setActiveIndustry] = useState(industries[0].id);

  // ROI Calculator State
  const [callsPerDay, setCallsPerDay] = useState(50);
  const [ticketSize, setTicketSize] = useState(1500);
  const [missRate, setMissRate] = useState(30);

  const missedCalls = callsPerDay * (missRate / 100);
  const revenueLostDaily = missedCalls * ticketSize;
  const revenueLostMonthly = revenueLostDaily * 30;

  return (
    <div className="min-h-screen bg-black text-[#EDEDED] font-sans selection:bg-[#333] selection:text-white pb-24">
      {/* Vercel-style Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#222] bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-xs font-bold text-black">
              V
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">
              VoiceOS
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-[#A1A1A1]">
            <a href="#solutions" className="hover:text-white transition-colors">
              Solutions
            </a>
            <a href="#shopify" className="hover:text-white transition-colors">
              Shopify Native
            </a>
            <a href="#roi" className="hover:text-white transition-colors">
              ROI Calculator
            </a>
            <Link
              href="/pricing"
              className="hover:text-white transition-colors"
            >
              Pricing
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm text-[#A1A1A1] hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/sign-up"
              className="text-sm bg-white hover:bg-gray-200 transition-colors text-black px-3 py-1.5 rounded-md font-medium"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 px-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#333] bg-[#111] text-[#A1A1A1] text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] pulse-live" />
            Live AI Agents for Clinics & Healthcare
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-white max-w-4xl leading-tight">
            Your clinic answers every call.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#EDEDED] to-[#666]">
              24/7.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-[#EDEDED] max-w-2xl mb-10 leading-relaxed font-light">
            Books to Google Calendar. ₹1,999/month.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 w-full justify-center">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-gray-200 transition-colors text-black px-8 py-3.5 rounded-md font-medium text-base"
            >
              Start Free Trial
            </Link>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 border border-[#333] bg-[#0A0A0A] hover:bg-[#111] hover:border-[#444] transition-all text-[#EDEDED] px-8 py-3.5 rounded-md font-medium text-base">
              Book a Demo
            </button>
          </div>
        </div>

        {/* Dynamic Industry Focus */}
        <div
          id="solutions"
          className="max-w-5xl mx-auto mb-32 animate-fade-up-delay-1"
        >
          <div className="flex overflow-x-auto border-b border-[#222] hide-scrollbar mb-8">
            {industries.map((ind) => (
              <button
                key={ind.id}
                onClick={() => setActiveIndustry(ind.id)}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeIndustry === ind.id
                    ? 'border-white text-white'
                    : 'border-transparent text-[#666] hover:text-[#A1A1A1]'
                }`}
              >
                {ind.label}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center bg-[#0A0A0A] border border-[#222] rounded-xl overflow-hidden p-8">
            <div className="flex flex-col gap-6">
              {activeIndustry === 'ecommerce' && (
                <>
                  <h3 className="text-2xl font-semibold text-white tracking-tight">
                    Automate Customer Support & Order Tracking
                  </h3>
                  <p className="text-[#A1A1A1] leading-relaxed">
                    Stop letting support tickets pile up. Our e-commerce AI
                    hooks directly into your storefront, tracking orders and
                    answering return policy questions over the phone in
                    real-time.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm text-[#A1A1A1]">
                      <span className="text-[#10B981]">✓</span> Instant Order
                      Status Lookups
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[#A1A1A1]">
                      <span className="text-[#10B981]">✓</span> Read Return
                      Policies Automatically
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[#A1A1A1]">
                      <span className="text-[#10B981]">✓</span> Escalate angry
                      customers to live agents
                    </li>
                  </ul>
                  <div className="mt-4 p-4 bg-[#111] rounded-lg border border-[#333] flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[#666] font-mono mb-1">
                        Try the demo
                      </div>
                      <div className="text-lg font-medium text-white">
                        +91 98765 43210
                      </div>
                    </div>
                    <button className="bg-white text-black px-3 py-1.5 rounded text-sm font-medium">
                      Call Now
                    </button>
                  </div>
                </>
              )}
              {activeIndustry === 'clinics' && (
                <>
                  <h3 className="text-2xl font-semibold text-white tracking-tight">
                    Fill your calendar, zero missed bookings
                  </h3>
                  <p className="text-[#A1A1A1] leading-relaxed">
                    Patient missed calls cost thousands in lost revenue. Agent
                    connects to your Google Calendar and books appointments 24/7
                    without double-booking.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm text-[#A1A1A1]">
                      <span className="text-[#10B981]">✓</span> Google Calendar
                      2-way sync
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[#A1A1A1]">
                      <span className="text-[#10B981]">✓</span> Automatic
                      appointment confirmation SMS
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[#A1A1A1]">
                      <span className="text-[#10B981]">✓</span> Handles basic
                      triage and FAQs
                    </li>
                  </ul>
                  <div className="mt-4 p-4 bg-[#111] rounded-lg border border-[#333] flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[#666] font-mono mb-1">
                        Try the demo
                      </div>
                      <div className="text-lg font-medium text-white">
                        +91 98765 43211
                      </div>
                    </div>
                    <button className="bg-white text-black px-3 py-1.5 rounded text-sm font-medium">
                      Call Now
                    </button>
                  </div>
                </>
              )}
              {activeIndustry === 'realestate' && (
                <>
                  <h3 className="text-2xl font-semibold text-white tracking-tight">
                    Qualify leads instantly upon inquiry
                  </h3>
                  <p className="text-[#A1A1A1] leading-relaxed">
                    Real estate is hyper-competitive. Call leads instantly when
                    they submit forms, qualify their budget, and schedule site
                    visits natively.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm text-[#A1A1A1]">
                      <span className="text-[#10B981]">✓</span> Instant outbound
                      calls on new leads
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[#A1A1A1]">
                      <span className="text-[#10B981]">✓</span> Qualify budget,
                      timeline, and urgency
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[#A1A1A1]">
                      <span className="text-[#10B981]">✓</span> Push structured
                      data to CRM
                    </li>
                  </ul>
                </>
              )}
              {activeIndustry === 'hospitality' && (
                <>
                  <h3 className="text-2xl font-semibold text-white tracking-tight">
                    24/7 Concierge & Reservations
                  </h3>
                  <p className="text-[#A1A1A1] leading-relaxed">
                    Stop waking up front desk staff for simple Wi-Fi queries.
                    Our agent acts as the primary switchboard and reservation
                    handler.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm text-[#A1A1A1]">
                      <span className="text-[#10B981]">✓</span> Multi-lingual
                      guest support
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[#A1A1A1]">
                      <span className="text-[#10B981]">✓</span> Service &
                      amenity FAQs
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[#A1A1A1]">
                      <span className="text-[#10B981]">✓</span> Front desk call
                      routing
                    </li>
                  </ul>
                </>
              )}
            </div>
            <div className="hidden md:flex justify-center items-center h-full min-h-[300px] border border-[#222] bg-[#111] rounded-xl relative overflow-hidden group">
              {/* Decorative Abstract Visual representing the AI waveform */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"></div>
              <div className="relative z-10 w-32 h-32 rounded-full border border-blue-500/30 flex items-center justify-center p-4">
                <div className="w-full h-full rounded-full border border-blue-400/50 flex items-center justify-center animate-[pulse_2s_ease-in-out_infinite]">
                  <div className="w-1/2 h-1/2 bg-blue-500/50 rounded-full blur-md"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shopify USP Priority Block */}
        <div
          id="shopify"
          className="max-w-5xl mx-auto mb-32 border-t border-[#222] pt-24 animate-fade-up-delay-2"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-3 py-1 bg-[#0070F3]/10 border border-[#0070F3]/30 text-[#0070F3] text-xs font-semibold rounded-full mb-6">
                Pre-built Integration
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-white mb-6">
                Deep Shopify integration out of the box.
              </h2>
              <p className="text-[#A1A1A1] leading-relaxed mb-6">
                Unlike generic voice bots, VoiceOS connects directly to your
                Shopify Admin API. Your agent can securely pull order status,
                shipping details, and process simple returns without manual
                intervention.
              </p>
              <div className="flex items-center gap-4 text-sm font-medium text-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#111] border border-[#333] flex items-center justify-center">
                    🛍️
                  </div>
                  Shopify
                </div>
                <div className="text-[#666]">← syncs →</div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#0070F3]/20 border border-[#0070F3]/40 flex items-center justify-center text-[10px]">
                    V
                  </div>
                  VoiceOS Agent
                </div>
              </div>
            </div>
            <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-6 relative">
              <div className="absolute top-0 right-8 px-3 py-1 bg-[#111] border-b border-l border-r border-[#333] rounded-b-md text-[10px] text-[#666] font-mono">
                LIVE TRANSCRIPT
              </div>
              <div className="space-y-4 mt-4">
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#222] shrink-0"></div>
                  <div className="bg-[#111] border border-[#222] rounded-lg rounded-tl-none p-3 text-sm text-[#A1A1A1] max-w-[80%]">
                    Hi, I'm calling to check where my order is. Order number is
                    4492.
                  </div>
                </div>
                <div className="flex gap-4 flex-row-reverse">
                  <div className="w-6 h-6 rounded-full bg-[#0070F3]/20 border border-[#0070F3]/50 shrink-0 flex justify-center items-center text-[10px] text-blue-400">
                    AI
                  </div>
                  <div className="bg-[#0070F3]/10 border border-[#0070F3]/20 rounded-lg rounded-tr-none p-3 text-sm text-white max-w-[80%] text-right shadow-[0_0_15px_rgba(0,112,243,0.1)]">
                    I see order 4492! It looks like it was shipped yesterday via
                    Delhivery and is scheduled to arrive tomorrow by 8 PM. Would
                    you like me to SMS you the tracking link?
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ROI Calculator */}
        <div
          id="roi"
          className="max-w-5xl mx-auto mb-32 border border-[#222] bg-[#0A0A0A] rounded-2xl overflow-hidden animate-fade-up-delay-3"
        >
          <div className="grid md:grid-cols-5 h-full">
            <div className="md:col-span-3 p-10 md:p-12 relative flex flex-col justify-center border-r border-[#222]">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#0070F3] to-transparent opacity-50"></div>
              <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
                Cost of Missed Calls
              </h2>
              <p className="text-[#A1A1A1] text-sm mb-10">
                Calculate how much revenue you are losing by not having a 24/7
                reception desk.
              </p>

              <div className="space-y-8">
                <div>
                  <div className="flex justify-between mb-2 text-sm font-medium text-white">
                    <span>Average Calls per Day</span>
                    <span>{callsPerDay}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    value={callsPerDay}
                    onChange={(e) => setCallsPerDay(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#222] rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2 text-sm font-medium text-white">
                    <span>Missed Call Rate (%)</span>
                    <span>{missRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="80"
                    value={missRate}
                    onChange={(e) => setMissRate(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#222] rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2 text-sm font-medium text-white">
                    <span>Avg Revenue per Customer (₹)</span>
                    <span>₹{ticketSize.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="500"
                    value={ticketSize}
                    onChange={(e) => setTicketSize(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#222] rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>
              </div>
            </div>
            <div className="md:col-span-2 bg-[#111] p-10 md:p-12 flex flex-col justify-center items-center text-center">
              <div className="text-sm font-semibold text-[#A1A1A1] uppercase tracking-wider mb-2">
                Potential Lost Revenue
              </div>
              <div className="text-5xl font-bold tracking-tighter text-white mb-2">
                ₹{revenueLostMonthly.toLocaleString()}
              </div>
              <div className="text-[#666] text-sm font-mono mb-8">
                per month
              </div>
              <p className="text-sm text-[#A1A1A1] mb-6">
                VoiceOS starts at just{' '}
                <span className="text-white font-semibold">₹4,999/mo</span>.
                Plug the leak today.
              </p>
              <Link
                href="/sign-up"
                className="w-full bg-white hover:bg-gray-200 transition-colors text-black px-4 py-2.5 rounded-md font-medium text-sm"
              >
                Plug the exact leak
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#222] py-12 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-sm text-[#666]">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <div className="w-5 h-5 rounded bg-[#333] flex items-center justify-center text-[10px] font-bold text-white">
            V
          </div>
          <span>VoiceOS © 2026. All rights reserved.</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-[#A1A1A1]">
            Terms
          </a>
          <a href="#" className="hover:text-[#A1A1A1]">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-[#A1A1A1]">
            Twitter
          </a>
        </div>
      </footer>
    </div>
  );
}
