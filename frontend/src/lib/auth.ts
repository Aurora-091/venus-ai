import { useCallback, useEffect } from "react";
import { useRecoilState } from "recoil";
import { sessionLoadingState, sessionUserState } from "../state/appState";

async function authRequest(path: string, body?: unknown) {
  const res = await fetch(`/api/auth${path}`, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error || "Request failed", data: null };
  return { data, error: null };
}

export const authClient = {
  useSession() {
    const [user, setUser] = useRecoilState(sessionUserState);
    const [isPending, setPending] = useRecoilState(sessionLoadingState);

    const loadSession = useCallback(async () => {
      setPending(true);
      const res = await authRequest("/session");
      setUser(res.data?.user || null);
      setPending(false);
    }, [setPending, setUser]);

    useEffect(() => {
      loadSession();
    }, [loadSession]);

    return {
      data: user ? { user } : null,
      isPending,
      refetch: loadSession,
    };
  },
  signUp: {
    email: (body: { name: string; email: string; password: string }) => authRequest("/sign-up", body),
  },
  signIn: {
    email: (body: { email: string; password: string }) => authRequest("/sign-in", body),
  },
  signOut: () => authRequest("/sign-out", {}),
};
