import { atom } from "recoil";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  tenantId?: string;
};

export type TenantState = {
  id: string;
  name: string;
  vertical: string;
  slug?: string;
  plan?: string;
  status?: string;
  agentName?: string;
  agentLanguage?: string;
  agentStatus?: string;
  [key: string]: unknown;
};

export type RealtimeEvent = {
  type: string;
  payload: unknown;
  receivedAt: string;
};

export const sessionUserState = atom<SessionUser | null>({
  key: "sessionUserState",
  default: null,
});

export const sessionLoadingState = atom({
  key: "sessionLoadingState",
  default: true,
});

export const tenantsState = atom<TenantState[]>({
  key: "tenantsState",
  default: [],
});

export const activeTenantState = atom<TenantState | null>({
  key: "activeTenantState",
  default: null,
});

export const socketConnectedState = atom({
  key: "socketConnectedState",
  default: false,
});

export const realtimeEventsState = atom<RealtimeEvent[]>({
  key: "realtimeEventsState",
  default: [],
});
