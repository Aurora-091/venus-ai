import { useState } from "react";
import { Link } from "wouter";
import { authClient } from "../lib/auth";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await authClient.signIn.email({ email, password });
      if (res.error) { setError(res.error.message || "Invalid credentials"); }
      else { window.location.href = "/dashboard"; }
    } catch (e: any) {
      setError(e.message || "Sign in failed");
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
          <h1 className="text-xl font-semibold mb-1">Welcome back</h1>
          <p className="text-sm text-[#94A3B8] mb-6">Sign in to your VoiceOS account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com"
                className="w-full bg-[#080C14] border border-[#1E2A3E] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="w-full bg-[#080C14] border border-[#1E2A3E] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors"
              />
            </div>
            {error && <div className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</div>}
            <button
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors text-white font-medium py-2.5 rounded-xl text-sm"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-[#1E2A3E] text-center">
            <p className="text-xs text-[#475569]">
              Don't have an account?{" "}
              <Link href="/sign-up" className="text-blue-400 hover:text-blue-300 transition-colors">Create one</Link>
            </p>
          </div>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-4 bg-[#0F1623] border border-[#1E2A3E] rounded-xl p-4 text-xs text-[#94A3B8]">
          <p className="font-medium text-[#F1F5F9] mb-1">Demo account</p>
          <p>Email: <span className="font-mono text-blue-400">demo@voiceos.ai</span></p>
          <p>Password: <span className="font-mono text-blue-400">demo1234</span></p>
        </div>
      </div>
    </div>
  );
}
