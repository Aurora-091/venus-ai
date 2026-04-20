import { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { sessionLoadingState, sessionUserState } from "../state/appState";
import { supabase } from "./supabase";

export const authClient = {
  useSession() {
    const [user, setUser] = useRecoilState(sessionUserState);
    const [isPending, setPending] = useRecoilState(sessionLoadingState);

    const loadSession = useCallback(async () => {
      setPending(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Extract metadata we stored
        const meta = session.user.user_metadata || {};
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name: meta.name || session.user.email?.split("@")[0] || "",
          role: meta.role || "tenant_admin",
          tenantId: meta.tenantId || "",
        });
      } else {
        setUser(null);
      }
      setPending(false);
    }, [setPending, setUser]);

    useEffect(() => {
      loadSession();
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
        loadSession();
      });
      
      return () => {
        subscription.unsubscribe();
      };
    }, [loadSession]);

    return {
      data: user ? { user } : null,
      isPending,
      refetch: loadSession,
    };
  },
  signUp: {
    email: async (body: { name: string; email: string; password: string }) => {
      const { data, error } = await supabase.auth.signUp({
        email: body.email,
        password: body.password,
        options: {
          data: {
            name: body.name,
          }
        }
      });
      return { data, error };
    },
  },
  signIn: {
    email: async (body: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: body.email,
        password: body.password,
      });
      return { data, error };
    },
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { data: null, error };
  },
};
