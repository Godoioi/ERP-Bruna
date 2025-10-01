import React, { useRef, useState } from "react";
import { useERP } from "../store";

export default function Clientes() {
  const { data, addCliente, anexar, remover } = useERP();
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !cpf.trim()) return;
    addCliente(nome.trim(), cpf.replace(/\D/g, ""));
    setNome("");
    setCpf("");
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

      <form onSubmit={onAdd} style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb", minWidth: 260 }}
        />
        <input
          placeholder="CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb", minWidth: 200 }}
        />
        <button type="submit" style={btnPrimary}>Adicionar</button>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {data.clientes
          .sort((a, b) => b.createdAt - a.createdAt)
          .map((c) => (
            <div key={c.id} style={cardRow}>
              <div>
                <div style={{ fontWeight: 700 }}>{c.nome}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>CPF: {c.cpf}</div>
                {c.documentos?.length ? (
                  <div style={{ fontSize: 12, color: "#374151", marginTop: 6 }}>
                    Documentos: {c.documentos.join(", ")}
                  </div>
                ) : null}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="file"
                  ref={(el) => (fileRefs.current[c.id] = el)}
                  style={{ maxWidth: 220 }}
                />
                <button type="button" style={btnSecondary} onClick={() => onUpload(c.id)}>
                  Enviar Documento
                </button>
                <button type="button" style={btnDanger} onClick={() => remover(c.id)}>
                  Remover
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

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
