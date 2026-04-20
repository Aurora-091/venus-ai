import { useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import {
  activeTenantState,
  realtimeEventsState,
  socketConnectedState,
  tenantsState,
} from '../state/appState';
import { socket } from '../lib/socket';

export function useRealtime() {
  const [tenant] = useRecoilState(activeTenantState);
  const setConnected = useSetRecoilState(socketConnectedState);
  const setEvents = useSetRecoilState(realtimeEventsState);
  const setTenants = useSetRecoilState(tenantsState);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const pushEvent = (type: string, payload: unknown) => {
      setEvents((events) =>
        [
          { type, payload, receivedAt: new Date().toISOString() },
          ...events,
        ].slice(0, 25)
      );
    };

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onTenantCreated = (payload: any) => {
      setTenants((tenants) => [
        payload,
        ...tenants.filter((tenantItem) => tenantItem.id !== payload.id),
      ]);
      pushEvent('tenant:created', payload);
    };
    const onTenantUpdated = (payload: any) => {
      setTenants((tenants) =>
        tenants.map((tenantItem) =>
          tenantItem.id === payload.id ? payload : tenantItem
        )
      );
      pushEvent('tenant:updated', payload);
    };
    const onCallCreated = (payload: any) => pushEvent('call:created', payload);
    const onServerReady = (payload: any) => pushEvent('server:ready', payload);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('tenant:created', onTenantCreated);
    socket.on('tenant:updated', onTenantUpdated);
    socket.on('call:created', onCallCreated);
    socket.on('server:ready', onServerReady);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('tenant:created', onTenantCreated);
      socket.off('tenant:updated', onTenantUpdated);
      socket.off('call:created', onCallCreated);
      socket.off('server:ready', onServerReady);
    };
  }, [setConnected, setEvents, setTenants]);

  useEffect(() => {
    if (!tenant?.id) return;
    socket.emit('tenant:join', tenant.id);
    return () => {
      socket.emit('tenant:leave', tenant.id);
    };
  }, [tenant?.id]);
}
