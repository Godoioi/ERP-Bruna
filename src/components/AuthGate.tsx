import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Login from "@/pages/Login";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setReady(true);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // sem sessão → mostra Login
  if (!ready) return <div className="p-6">Carregando…</div>;
  if (!session) return <Login />;

  // tem sessão → garante vínculo com operators
  return <LinkOperatorOnce>{children}</LinkOperatorOnce>;
}

function LinkOperatorOnce({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        await supabase.rpc("link_me_to_operator");
      } catch (e) {
        console.warn("link_me_to_operator:", e);
      } finally {
        setDone(true);
      }
    })();
  }, []);
  if (!done) return <div className="p-6">Preparando sua conta…</div>;
  return <>{children}</>;
}
