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
    <div className="min-h-screen bg-[#080C14] flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-up">
        <Link href="/" className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold">V</div>
          <span className="font-semibold text-[15px]">VoiceOS</span>
        </Link>

        <div className="bg-[#0F1623] border border-[#1E2A3E] rounded-2xl p-8">
          <h1 className="text-xl font-semibold mb-1">Create your account</h1>
          <p className="text-sm text-[#94A3B8] mb-6">Get your AI agent live in 10 minutes</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Full name</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)} required
                placeholder="Your name"
                className="w-full bg-[#080C14] border border-[#1E2A3E] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Work email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@clinic.com"
                className="w-full bg-[#080C14] border border-[#1E2A3E] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                placeholder="Min 8 characters"
                className="w-full bg-[#080C14] border border-[#1E2A3E] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors"
              />
            </div>
            {error && <div className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</div>}
            <button
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors text-white font-medium py-2.5 rounded-xl text-sm"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-xs text-[#475569] text-center mt-4">
            By signing up you agree to our Terms of Service
          </p>

          <div className="mt-5 pt-5 border-t border-[#1E2A3E] text-center">
            <p className="text-xs text-[#475569]">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-blue-400 hover:text-blue-300 transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
