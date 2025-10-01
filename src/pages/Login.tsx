import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [msg, setMsg]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) setMsg(error.message);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={doLogin} className="w-full max-w-sm bg-white rounded-xl border p-6 space-y-4">
        <h1 className="text-xl font-semibold">Entrar</h1>
        <input
          type="email" placeholder="email@empresa.com"
          className="w-full border rounded-lg p-2"
          value={email} onChange={e=>setEmail(e.target.value)}
          required
        />
        <input
          type="password" placeholder="Sua senha"
          className="w-full border rounded-lg p-2"
          value={pass} onChange={e=>setPass(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-black text-white py-2"
          disabled={loading}
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
        {msg && <div className="text-red-600 text-sm">{msg}</div>}
      </form>
    </div>
  );
}
