import React, { useRef, useState } from "react";
import { useERP } from "../store";

export default function Clientes() {
  const { data, addCliente, anexar, remover } = useERP();
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [valor, setValor] = useState<string>("");
  const [operador, setOperador] = useState("");
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !cpf.trim() || !valor.trim() || !operador.trim()) return;
    const valorNum = Number(valor.replace(/\./g, '').replace(',', '.'));
    addCliente(nome.trim(), cpf.replace(/\D/g, ""), isNaN(valorNum) ? 0 : valorNum, operador.trim());
    setNome(""); setCpf(""); setValor(""); setOperador("");
  };

  const onUpload = (id: string) => {
    const input = fileRefs.current[id];
    if (!input || !input.files || input.files.length === 0) return;
    anexar(id, input.files[0].name);
    input.value = "";
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Clientes</h1>

      <form onSubmit={onAdd} style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} style={inputStyle} />
        <input placeholder="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} style={inputStyle} />
        <input placeholder="Valor do pagamento" value={valor} onChange={(e) => setValor(e.target.value)} style={inputStyle} />
        <input placeholder="Operador vinculado" value={operador} onChange={(e) => setOperador(e.target.value)} style={inputStyle} />
        <div style={{ gridColumn: "1 / -1" }}>
          <button type="submit" style={btnPrimary}>Adicionar</button>
        </div>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {data.clientes
          .sort((a, b) => b.createdAt - a.createdAt)
          .map((c) => (
            <div key={c.id} style={cardRow}>
              <div>
                <div style={{ fontWeight: 700 }}>{c.nome}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>CPF: {c.cpf} • R$ {c.valorPagamento.toFixed(2)} • Op.: {c.operador}</div>
                {c.documentos?.length ? (
                  <div style={{ fontSize: 12, color: "#374151", marginTop: 6 }}>
                    Documentos: {c.documentos.join(", ")}
                  </div>
                ) : null}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="file" ref={(el) => (fileRefs.current[c.id] = el)} style={{ maxWidth: 220 }} />
                <button type="button" style={btnSecondary} onClick={() => onUpload(c.id)}>Enviar Documento</button>
                <button type="button" style={btnDanger} onClick={() => remover(c.id)}>Remover</button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = { padding: 10, borderRadius: 10, border: "1px solid #e5e7eb", minWidth: 160, background:"#fff" };

const cardRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  border: "1px solid #eef0f4",
  borderRadius: 12,
  padding: 12,
  background: "#fff",
};
const btnPrimary: React.CSSProperties = {
  background: "#22c55e",
  color: "white",
  border: "none",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
};
const btnSecondary: React.CSSProperties = {
  background: "#3b82f6",
  color: "white",
  border: "none",
  borderRadius: 10,
  padding: "10px 12px",
  fontWeight: 700,
  cursor: "pointer",
};
const btnDanger: React.CSSProperties = {
  background: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: 10,
  padding: "10px 12px",
  fontWeight: 700,
  cursor: "pointer",
};
