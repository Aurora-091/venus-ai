import { useState } from 'react';
import { Link } from 'wouter';

export default function Pricing() {
  const [callsPerMonth, setCallsPerMonth] = useState(1000);

  const calculateCost = () => {
    // 0.10c a minute -> say averaging 3 mins = 0.30c a call. For India rates maybe 10 INR per call
    const cost = Math.floor(callsPerMonth * 10);
    return cost.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-black text-[#EDEDED] font-sans selection:bg-[#333] selection:text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#222] bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-xs font-bold text-black">
              V
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">
              VoiceOS
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-[#A1A1A1]">
            <Link href="/" className="hover:text-white transition-colors">
              Solutions
            </Link>
            <Link href="/" className="hover:text-white transition-colors">
              Shopify Native
            </Link>
            <Link href="/" className="hover:text-white transition-colors">
              ROI Calculator
            </Link>
            <Link href="/pricing" className="text-white transition-colors">
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
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-up">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Transparent Pricing.
            <br />
            Scale as you grow.
          </h1>
          <p className="text-[#A1A1A1] text-lg max-w-2xl mx-auto">
            Get started for free. Upgrade when you need more minutes, phone
            numbers, or premium integrations.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-24 animate-fade-up-delay-1">
          {/* Starter */}
          <div className="border border-[#222] bg-[#0A0A0A] rounded-2xl p-8 flex flex-col">
            <h3 className="text-xl font-semibold text-white mb-2">Starter</h3>
            <p className="text-[#A1A1A1] text-sm mb-6">
              For small businesses trying out voice AI.
            </p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">₹999</span>
              <span className="text-[#666]">/mo</span>
            </div>
            <Link
              href="/sign-up"
              className="w-full text-center bg-[#111] hover:bg-[#222] border border-[#333] transition-colors text-white py-2 rounded-md text-sm font-medium mb-8"
            >
              Start Free Trial
            </Link>
            <ul className="space-y-3 mt-auto">
              <li className="flex items-center gap-2 text-sm text-[#A1A1A1]">
                <span className="text-[#10B981]">✓</span> 1 Phone Number
              </li>
              <li className="flex items-center gap-2 text-sm text-[#A1A1A1]">
                <span className="text-[#10B981]">✓</span> 200 min / mo
              </li>
              <li className="flex items-center gap-2 text-sm text-[#A1A1A1]">
                <span className="text-[#10B981]">✓</span> Google Calendar
              </li>
              <li className="flex items-center gap-2 text-sm text-[#A1A1A1]">
                <span className="text-[#10B981]">✓</span> SMS Confirmations
              </li>
            </ul>
          </div>

          {/* Growth */}
          <div className="border border-[#0070F3]/50 bg-[#0070F3]/5 rounded-2xl p-8 flex flex-col relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0070F3] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Most Popular
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Growth</h3>
            <p className="text-[#A1A1A1] text-sm mb-6">
              For high volume businesses handling real customers.
            </p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">₹1,999</span>
              <span className="text-[#666]">/mo</span>
            </div>
            <Link
              href="/sign-up"
              className="w-full text-center bg-white hover:bg-gray-200 transition-colors text-black py-2 rounded-md text-sm font-medium mb-8"
            >
              Start Free Trial
            </Link>
            <ul className="space-y-3 mt-auto">
              <li className="flex items-center gap-2 text-sm text-white">
                <span className="text-[#10B981]">✓</span> Unlimited min (fair
                use)
              </li>
              <li className="flex items-center gap-2 text-sm text-white">
                <span className="text-[#10B981]">✓</span> WhatsApp Confirmations
              </li>
              <li className="flex items-center gap-2 text-sm text-[#A1A1A1]">
                <span className="text-[#10B981]">✓</span> Agent Studio
              </li>
              <li className="flex items-center gap-2 text-sm text-[#A1A1A1]">
                <span className="text-[#10B981]">✓</span> Custom Knowledge Base
              </li>
            </ul>
          </div>

          {/* Agency */}
          <div className="border border-[#222] bg-[#0A0A0A] rounded-2xl p-8 flex flex-col">
            <h3 className="text-xl font-semibold text-white mb-2">Agency</h3>
            <p className="text-[#A1A1A1] text-sm mb-6">
              For agencies reselling Voice AI to clients.
            </p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">₹4,999</span>
              <span className="text-[#666]">/mo</span>
            </div>
            <button className="w-full text-center bg-[#111] hover:bg-[#222] border border-[#333] transition-colors text-white py-2 rounded-md text-sm font-medium mb-8">
              Contact Sales
            </button>
            <ul className="space-y-3 mt-auto">
              <li className="flex items-center gap-2 text-sm text-[#A1A1A1]">
                <span className="text-[#10B981]">✓</span> 10 Workspaces
              </li>
              <li className="flex items-center gap-2 text-sm text-[#A1A1A1]">
                <span className="text-[#10B981]">✓</span> White-label Dashboard
              </li>
              <li className="flex items-center gap-2 text-sm text-[#A1A1A1]">
                <span className="text-[#10B981]">✓</span> Priority Support
              </li>
            </ul>
          </div>
        </div>

        {/* Cost Estimator */}
        <div className="max-w-3xl mx-auto border border-[#222] bg-[#111] rounded-xl p-8 animate-fade-up-delay-2">
          <h3 className="text-2xl font-semibold text-white mb-2 text-center">
            Cost Estimator
          </h3>
          <p className="text-[#A1A1A1] text-sm text-center mb-10">
            Usage based pricing for minutes beyond your tier limits.
          </p>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex justify-between mb-4 text-sm font-medium text-white">
                <span>Expected Calls / Month</span>
                <span className="text-[#0070F3]">
                  {callsPerMonth.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="25000"
                step="100"
                value={callsPerMonth}
                onChange={(e) => setCallsPerMonth(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[#222] rounded-lg appearance-none cursor-pointer accent-[#0070F3]"
              />
              <p className="text-xs text-[#666] mt-4">
                Assumes an average call duration of 3 minutes per call using the
                standard English model.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center p-6 bg-black rounded-lg border border-[#222]">
              <span className="text-sm font-medium text-[#A1A1A1] mb-2">
                Estimated Usage Bill
              </span>
              <span className="text-4xl font-bold text-white">
                ₹{calculateCost()}
              </span>
              <span className="text-xs text-[#666] mt-2">+ Platform Fee</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
