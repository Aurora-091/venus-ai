import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { Route, Switch, useLocation } from 'wouter';
import { Provider } from './components/provider';
import { RunableBadge } from '@runablehq/website-runtime';

import DashboardLayout from './components/DashboardLayout';
import Landing from './pages/landing';
import Pricing from './pages/pricing';
import SignIn from './pages/sign-in';
import SignUp from './pages/sign-up';
import Onboarding from './pages/onboarding';
import Overview from './pages/dashboard/overview';
import Calls from './pages/dashboard/calls';
import Bookings from './pages/dashboard/bookings';
import AgentStudio from './pages/dashboard/agent';
import Integrations from './pages/dashboard/integrations';
import Analytics from './pages/dashboard/analytics';
import Settings from './pages/dashboard/settings';
import { authClient } from './lib/auth';
import { api } from './lib/api';
import { useRealtime } from './hooks/useRealtime';
import { activeTenantState, tenantsState } from './state/appState';

function Spinner() {
  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#333333] border-t-white rounded-full animate-spin" />
    </div>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      navigate('/sign-in');
    }
  }, [session, isPending]);

  if (isPending) return <Spinner />;
  if (!session) return null;
  return <>{children}</>;
}

function DashboardShell() {
  const [tenants, setTenants] = useRecoilState(tenantsState);
  const [tenant, setTenant] = useRecoilState(activeTenantState);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();

  const loadTenants = () => {
    api
      .get('/tenants')
      .then((r) => {
        const list = r.tenants || [];
        setTenants(list);
        if (list.length === 0) {
          navigate('/onboarding');
          return;
        }
        setTenant((prev) => {
          if (prev && list.find((t: any) => t.id === prev.id)) return prev;
          return list[0];
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const handleTenantChange = (id: string) => {
    const t = tenants.find((t) => t.id === id);
    if (t) setTenant(t);
  };

  const handleTenantUpdate = (updated: any) => {
    setTenant(updated);
    setTenants((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  if (loading) return <Spinner />;

  const props = { tenant, tenants, onTenantUpdate: handleTenantUpdate };

  return (
    <DashboardLayout
      tenant={tenant}
      tenants={tenants}
      onTenantChange={handleTenantChange}
    >
      <Switch>
        <Route path="/dashboard" component={() => <Overview {...props} />} />
        <Route
          path="/dashboard/calls"
          component={() => <Calls tenant={tenant} />}
        />
        <Route
          path="/dashboard/bookings"
          component={() => <Bookings tenant={tenant} />}
        />
        <Route
          path="/dashboard/agent"
          component={() => <AgentStudio {...props} />}
        />
        <Route
          path="/dashboard/integrations"
          component={() => <Integrations tenant={tenant} />}
        />
        <Route
          path="/dashboard/analytics"
          component={() => <Analytics tenant={tenant} tenants={tenants} />}
        />
        <Route
          path="/dashboard/settings"
          component={() => <Settings {...props} />}
        />
        <Route component={() => <Overview {...props} />} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  useRealtime();

  return (
    <Provider>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/sign-in" component={SignIn} />
        <Route path="/sign-up" component={SignUp} />
        <Route
          path="/onboarding"
          component={() => (
            <AuthGuard>
              <Onboarding />
            </AuthGuard>
          )}
        />
        <Route
          path="/dashboard"
          component={() => (
            <AuthGuard>
              <DashboardShell />
            </AuthGuard>
          )}
        />
        <Route
          path="/dashboard/:rest*"
          component={() => (
            <AuthGuard>
              <DashboardShell />
            </AuthGuard>
          )}
        />
        <Route component={() => <Landing />} />
      </Switch>
      {<RunableBadge />}
    </Provider>
  );
}

export default App;
