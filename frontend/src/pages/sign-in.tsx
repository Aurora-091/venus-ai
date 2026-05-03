import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { authClient } from '../lib/auth';
import GoogleSignInButton from '../components/GoogleSignInButton';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const parseOAuthError = (raw: string) => {
      const params = new URLSearchParams(raw.replace(/^#/, ''));
      const desc =
        params.get('error_description') ||
        params.get('error_code') ||
        params.get('error');
      return desc ? decodeURIComponent(desc.replace(/\+/g, ' ')) : null;
    };
    const fromHash = typeof window !== 'undefined' ? window.location.hash : '';
    const fromSearch =
      typeof window !== 'undefined' ? window.location.search : '';
    let msg = fromHash ? parseOAuthError(fromHash) : null;
    if (!msg && fromSearch) {
      const q = new URLSearchParams(fromSearch.replace(/^\?/, ''));
      msg = q.get('error_description') || q.get('error_code') || q.get('error');
      if (msg) msg = decodeURIComponent(msg.replace(/\+/g, ' '));
    }
    if (msg) {
      setError(msg);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const res = await authClient.signIn.google({
        redirectPath: '/dashboard',
      });
      if (res.error) {
        setError(res.error.message || 'Google sign-in failed');
        setGoogleLoading(false);
      }
      // Success: browser redirects to Google
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Google sign-in failed');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authClient.signIn.email({ email, password });
      if (res.error) {
        setError(res.error.message || 'Invalid credentials');
      } else {
        window.location.href = '/dashboard';
      }
    } catch (e: any) {
      setError(e.message || 'Sign in failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 font-sans text-[#EDEDED] selection:bg-[#333] selection:text-white">
      <div className="w-full max-w-sm animate-fade-up">
        <Link href="/" className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center text-sm font-bold text-black">
            V
          </div>
          <span className="font-semibold text-[15px] tracking-tight">
            VoiceOS
          </span>
        </Link>

        <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#666] to-transparent opacity-50"></div>
          <h1 className="text-xl font-semibold mb-1 text-white tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-[#A1A1A1] mb-6">
            Sign in to your VoiceOS account
          </p>

          {error && (
            <div className="text-xs text-[#E00] bg-[#E00]/10 border border-[#E00]/30 rounded-md px-3 py-2 mb-4">
              {error}
            </div>
          )}

          <GoogleSignInButton onClick={handleGoogle} loading={googleLoading} />

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#222]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#0A0A0A] px-3 text-[#666]">or email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#A1A1A1] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-[#111] border border-[#333] focus:border-white rounded-md px-3.5 py-2.5 text-sm text-white placeholder-[#666] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A1A1A1] mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-[#111] border border-[#333] focus:border-white rounded-md px-3.5 py-2.5 text-sm text-white placeholder-[#666] outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-gray-200 disabled:opacity-50 transition-colors text-black font-medium py-2.5 rounded-md text-sm mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#222] text-center">
            <p className="text-xs text-[#A1A1A1]">
              Don't have an account?{' '}
              <Link
                href="/sign-up"
                className="text-white hover:underline transition-all"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-6 bg-[#0A0A0A] border border-[#222] rounded-md p-4 text-xs text-[#A1A1A1]">
          <p className="font-medium text-white mb-2">Demo account</p>
          <div className="flex flex-col gap-1">
            <p className="flex justify-between">
              <span>Email:</span>{' '}
              <span className="font-mono text-white">demo@voiceos.ai</span>
            </p>
            <p className="flex justify-between">
              <span>Password:</span>{' '}
              <span className="font-mono text-white">demo1234</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
