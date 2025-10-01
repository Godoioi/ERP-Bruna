import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type FU = {
  id: string; customer_id: string; operator_id: string;
  scheduled_at: string; note: string | null; done: boolean;
};

export default function Agenda() {
  const [rows, setRows] = useState<FU[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      // pega e-mail do usuário e resolve operator_id
      const { data: user } = await supabase.auth.getUser();
      const email = user?.user?.email;
      const { data: op, error: e1 } = await supabase.from("operators").select("id").eq("email", email).maybeSingle();
      if (e1) throw e1;
      const operator_id = op?.id;
      if (!operator_id) { setRows([]); setLoading(false); return; }

      const { data, error } = await supabase
        .from("follow_ups")
        .select("*")
        .eq("operator_id", operator_id)
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      setRows(data || []);
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function markDone(id: string, done: boolean) {
    await supabase.from("follow_ups").update({ done }).eq("id", id);
    load();
  }

  if (loading) return <div className="p-4">Carregando agenda…</div>;
  if (err) return <div className="p-4 text-red-600">Erro: {err}</div>;
  if (!rows.length) return <div className="p-4">Sem lembretes.</div>;

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">Minha Agenda</h1>
      <ul className="space-y-2">
        {rows.map(r => (
          <li key={r.id} className="border rounded-lg p-3 bg-white flex items-center justify-between">
            <div>
              <div className="font-medium">{new Date(r.scheduled_at).toLocaleString()}</div>
              {r.note && <div className="text-sm text-gray-600">{r.note}</div>}
            </div>
            <button
              className={`px-3 py-1 rounded ${r.done ? "bg-gray-200" : "bg-black text-white"}`}
              onClick={() => markDone(r.id, !r.done)}
            >
              {r.done ? "Reabrir" : "Concluir"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
