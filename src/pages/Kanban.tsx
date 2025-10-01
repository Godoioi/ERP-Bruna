import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type KanbanRow = {
  case_id: string;
  current_stage: "CONTRATO_PENDENTE" | "DESBLOQUEIO" | "LIBERACAO_VALOR" | "PAGAMENTO" | "CONCLUIDO" | "CANCELADO";
  status: string;
  operator_id: string | null;
  operador: string | null;
  customer_id: string;
  cliente: string;
  cpf: string | null;
  valor_contratado: number | null;
  data_venda: string | null;
  created_at: string;
  etapa_started_at: string | null;
  etapa_sla_due_at: string | null;
  sla_days: number | null;
};

const STAGES: KanbanRow["current_stage"][] = [
  "CONTRATO_PENDENTE",
  "DESBLOQUEIO",
  "LIBERACAO_VALOR",
  "PAGAMENTO",
  "CONCLUIDO",
  "CANCELADO",
];

function nextStage(s: KanbanRow["current_stage"]): KanbanRow["current_stage"] {
  if (s === "CONTRATO_PENDENTE") return "DESBLOQUEIO";
  if (s === "DESBLOQUEIO") return "LIBERACAO_VALOR";
  if (s === "LIBERACAO_VALOR") return "PAGAMENTO";
  if (s === "PAGAMENTO") return "CONCLUIDO";
  return s; // CONCLUIDO/CANCELADO não avança
}

export default function Kanban() {
  const [rows, setRows] = useState<KanbanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const { data, error } = await supabase
        .from("v_kanban")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      setRows((data as KanbanRow[]) || []);
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function advance(c: KanbanRow) {
    const nxt = nextStage(c.current_stage);
    if (nxt === c.current_stage) return;
    const { error } = await supabase.rpc("advance_case_stage", {
      p_case_id: c.case_id,
      p_next_stage: nxt,
      p_actor: c.operator_id, // quem move: operador atual (ou null)
    });
    if (error) {
      alert(error.message);
    } else {
      load();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Esteira Operacional</h1>
        <button
          className="px-3 py-1.5 rounded-lg border"
          onClick={load}
        >
          Atualizar
        </button>
      </div>

      {err && <div className="text-red-600">Erro: {err}</div>}
      {loading && <div>Carregando cartões…</div>}
      {!loading && !rows.length && !err && <div>Sem cards no momento.</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STAGES.map((stage) => {
          const cards = rows.filter(r => r.current_stage === stage);
          return (
            <div key={stage} className="bg-white border rounded-xl p-3">
              <div className="font-semibold mb-2">
                {labelStage(stage)} <span className="text-sm text-gray-500">({cards.length})</span>
              </div>
              <div className="space-y-2">
                {cards.map(card => (
                  <div key={card.case_id} className="border rounded-lg p-3">
                    <div className="font-medium">{card.cliente}</div>
                    <div className="text-xs text-gray-600">{fmtCpf(card.cpf)} • {card.operador ?? "—"}</div>
                    <div className="text-sm">
                      {fmtMoney(card.valor_contratado)} • {card.data_venda ? new Date(card.data_venda).toLocaleDateString() : "s/ data"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Início etapa: {card.etapa_started_at ? new Date(card.etapa_started_at).toLocaleString() : "—"}
                    </div>
                    {canAdvance(card.current_stage) && (
                      <button
                        className="mt-2 text-sm px-2 py-1 rounded bg-black text-white"
                        onClick={() => advance(card)}
                      >
                        Avançar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function labelStage(s: KanbanRow["current_stage"]) {
  switch (s) {
    case "CONTRATO_PENDENTE": return "Contrato pendente";
    case "DESBLOQUEIO": return "Desbloqueio";
    case "LIBERACAO_VALOR": return "Liberação do valor";
    case "PAGAMENTO": return "Pagamento";
    case "CONCLUIDO": return "Concluído";
    case "CANCELADO": return "Cancelado";
  }
}

function canAdvance(s: KanbanRow["current_stage"]) {
  return s !== "CONCLUIDO" && s !== "CANCELADO";
}

function fmtMoney(n: number | null) {
  if (n == null) return "R$ 0,00";
  try { return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
  catch { return `R$ ${n}`; }
}
function fmtCpf(cpf: string | null) {
  if (!cpf) return "CPF —";
  const c = cpf.replace(/\D/g, "").padStart(11, "0");
  return c.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}
