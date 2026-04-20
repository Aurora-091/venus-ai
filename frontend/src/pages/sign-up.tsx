import { useState } from "react";
import { Link } from "wouter";
import { authClient } from "../lib/auth";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await authClient.signUp.email({ name, email, password });
      if (res.error) { setError(res.error.message || "Sign up failed"); }
      else { window.location.href = "/onboarding"; }
    } catch (e: any) {
      setError(e.message || "Sign up failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 font-sans text-[#EDEDED] selection:bg-[#333] selection:text-white">
      <div className="w-full max-w-sm animate-fade-up">
        <Link href="/" className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center text-sm font-bold text-black">V</div>
          <span className="font-semibold text-[15px] tracking-tight">VoiceOS</span>
        </Link>

        <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#666] to-transparent opacity-50"></div>
          <h1 className="text-xl font-semibold mb-1 text-white tracking-tight">Create your account</h1>
          <p className="text-sm text-[#A1A1A1] mb-6">Get your AI agent live in 10 minutes</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#A1A1A1] mb-1.5">Full name</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)} required
                placeholder="Your name"
                className="w-full bg-[#111] border border-[#333] focus:border-white rounded-md px-3.5 py-2.5 text-sm text-white placeholder-[#666] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A1A1A1] mb-1.5">Work email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@company.com"
                className="w-full bg-[#111] border border-[#333] focus:border-white rounded-md px-3.5 py-2.5 text-sm text-white placeholder-[#666] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A1A1A1] mb-1.5">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                placeholder="Min 8 characters"
                className="w-full bg-[#111] border border-[#333] focus:border-white rounded-md px-3.5 py-2.5 text-sm text-white placeholder-[#666] outline-none transition-colors"
              />
            </div>
            {error && <div className="text-xs text-[#E00] bg-[#E00]/10 border border-[#E00]/30 rounded-md px-3 py-2">{error}</div>}
            <button
              type="submit" disabled={loading}
              className="w-full bg-white hover:bg-gray-200 disabled:opacity-50 transition-colors text-black font-medium py-2.5 rounded-md text-sm mt-2"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-xs text-[#666] text-center mt-4">
            By signing up you agree to our Terms of Service
          </p>

          <div className="mt-6 pt-6 border-t border-[#222] text-center">
            <p className="text-xs text-[#A1A1A1]">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-white hover:underline transition-all">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
