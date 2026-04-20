import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { authClient } from '../lib/auth';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: '◈' },
  { href: '/dashboard/calls', label: 'Call Logs', icon: '☎' },
  { href: '/dashboard/bookings', label: 'Bookings', icon: '◻' },
  { href: '/dashboard/agent', label: 'Agent Studio', icon: '◎' },
  { href: '/dashboard/integrations', label: 'Integrations', icon: '⬡' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: '▲' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙' },
];

interface Props {
  children: React.ReactNode;
  tenant?: any;
  tenants?: any[];
  onTenantChange?: (id: string) => void;
}

export default function DashboardLayout({
  children,
  tenant,
  tenants = [],
  onTenantChange,
}: Props) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = '/';
  };

  const verticalIcon =
    { clinic: '🏥', hotel: '🏨', ecommerce: '🛍️' }[tenant?.vertical || ''] ||
    '◈';
  const verticalColor =
    {
      clinic: 'bg-emerald-500/10 text-emerald-400',
      hotel: 'bg-blue-500/10 text-blue-400',
      ecommerce: 'bg-violet-500/10 text-violet-400',
    }[tenant?.vertical || ''] || 'bg-blue-500/10 text-blue-400';

  const hasRealAgent =
    !!tenant?.agentId && !tenant.agentId.startsWith('local-');
  const hasRealPhoneNumber =
    !!tenant?.phoneNumberId && !tenant.phoneNumberId.startsWith('local-');

  return (
    <div className="flex h-screen bg-[#080C14] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[240px] shrink-0 flex flex-col border-r border-[#1E2A3E] bg-[#0A0E1A]">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-[#1E2A3E]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold">
              V
            </div>
            <span className="font-semibold text-sm tracking-tight">
              VoiceOS
            </span>
          </Link>
        </div>

        {/* Tenant picker */}
        {tenant && (
          <div className="px-4 py-3 border-b border-[#1E2A3E]">
            <div className="flex items-center gap-2.5 bg-[#0F1623] rounded-xl px-3 py-2.5">
              <span className="text-base">{verticalIcon}</span>
              <div className="min-w-0">
                <div className="text-xs font-medium text-white truncate">
                  {tenant.name}
                </div>
                <div
                  className={`text-[10px] px-1.5 py-0.5 rounded-full inline-block mt-0.5 ${verticalColor}`}
                >
                  {tenant.vertical}
                </div>
              </div>
            </div>
            {tenants.length > 1 && (
              <select
                onChange={(e) => onTenantChange?.(e.target.value)}
                className="w-full mt-2 bg-transparent text-[#475569] text-xs outline-none cursor-pointer"
                value={tenant.id}
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const active =
              location === item.href ||
              (item.href !== '/dashboard' && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-[#1E2A3E] text-white font-medium'
                    : 'text-[#475569] hover:text-[#94A3B8] hover:bg-[#0F1623]'
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Agent status */}
        {tenant && (
          <div className="px-4 py-3 border-t border-[#1E2A3E]">
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`w-1.5 h-1.5 rounded-full ${hasRealAgent ? 'bg-emerald-400 pulse-live' : 'bg-[#475569]'}`}
              />
              <span
                className={hasRealAgent ? 'text-emerald-400' : 'text-[#475569]'}
              >
                {hasRealAgent ? 'Agent connected' : 'Not configured'}
              </span>
            </div>
            {hasRealPhoneNumber && tenant.phoneNumber && (
              <div className="font-mono text-[10px] text-[#475569] mt-1">
                {tenant.phoneNumber}
              </div>
            )}
          </div>
        )}

        {/* User */}
        <div className="px-4 py-3 border-t border-[#1E2A3E]">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs text-[#475569] hover:text-[#94A3B8] transition-colors w-full"
          >
            <span>⬡</span> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
