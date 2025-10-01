import React, { useMemo, useState, useRef } from "react";
import { DndContext, DragEndEvent, useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useERP } from "../store";
import { StatusCol, statusLabel, CardColor, Cliente } from "../types";

const COLS: StatusCol[] = [
  "CONTRATO_PENDENTE",
  "DESBLOQUEIO",
  "LIBERACAO_VALOR",
  "PAGAMENTO",
  "CONCLUIDO",
  "CANCELADO",
];

const colorMap: Record<CardColor, string> = {
  vermelho: "#fee2e2",
  verde: "#dcfce7",
  amarelo: "#fef9c3",
  azul: "#dbeafe",
};

const colorBorder: Record<CardColor, string> = {
  vermelho: "#ef4444",
  verde: "#22c55e",
  amarelo: "#eab308",
  azul: "#3b82f6",
};

function Card({ id, title, subtitle, color, onOpen }: { id: string; title: string; subtitle?: string; color: CardColor; onOpen:(id:string)=>void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: colorMap[color] || "#fff",
    border: `2px solid ${colorBorder[color] || "#e5e7eb"}`,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    boxShadow: "0 2px 6px rgba(0,0,0,.06)",
    cursor: "grab",
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onDoubleClick={()=>onOpen(id)} onClick={()=>onOpen(id)}>
      <div style={{ fontWeight: 700, display:"flex", alignItems:"center", justifyContent:"space-between"}}>
        <span>{title}</span>
        <span style={{ fontSize: 10, color: "#6b7280" }}>abrir</span>
      </div>
      {subtitle && <div style={{ fontSize: 12, color: "#374151", marginTop: 4 }}>{subtitle}</div>}
    </div>
  );
}

function Column({ col, ids, onOpen }: { col: StatusCol; ids: string[]; onOpen:(id:string)=>void }) {
  const { data } = useERP();
  const clients = useMemo(()=> data.clientes.filter((c) => ids.includes(c.id)), [data, ids]);
  const { setNodeRef, isOver } = useDroppable({ id: col });

  const colStyle: React.CSSProperties = {
    background: isOver ? "#eef6ff" : "#f6f7f9",
    border: "1px solid #eef0f4",
    borderRadius: 14,
    padding: 14,
    minHeight: 420,
    transition: "background .12s ease",
  };

  return (
    <div ref={setNodeRef} style={colStyle}>
      <div style={{ fontWeight: 800, marginBottom: 12 }}>{statusLabel[col]}</div>
      <SortableContext items={clients.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        {clients.map((c) => (
          <Card
            key={c.id}
            id={c.id}
            title={c.nome}
            color={c.cardColor || "azul"}
            subtitle={`CPF: ${c.cpf} • R$ ${c.valorPagamento.toFixed(2)} • Op.: ${c.operador}${c.documentos?.length ? ` • ${c.documentos.length} doc(s)` : ""}`}
            onOpen={onOpen}
          />
        ))}
      </SortableContext>
    </div>
  );
}

export default function Kanban() {
  const { data, moveCliente } = useERP();
  const [openId, setOpenId] = useState<string|undefined>(undefined);

  const idsByCol: Record<StatusCol, string[]> = {
    CONTRATO_PENDENTE: [],
    DESBLOQUEIO: [],
    LIBERACAO_VALOR: [],
    PAGAMENTO: [],
    CONCLUIDO: [],
    CANCELADO: [],
  };
  data.clientes.forEach((c) => idsByCol[c.status].push(c.id));

  const handleDragEnd = (evt: DragEndEvent) => {
    const activeId = String(evt.active.id);
    const overId = evt.over?.id ? String(evt.over.id) : undefined;
    if (!overId) return;
    if ((COLS as string[]).includes(overId)) {
      moveCliente(activeId, overId as StatusCol);
    }
  };

  const boardStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(6, minmax(220px, 1fr))",
    gap: 16,
  };

  return (
    <>
      <DndContext onDragEnd={handleDragEnd}>
        <div style={boardStyle}>
          {COLS.map((col) => (
            <Column key={col} col={col} ids={idsByCol[col]} onOpen={setOpenId} />
          ))}
        </div>
      </DndContext>
      <DetailModal id={openId} onClose={()=>setOpenId(undefined)} />
    </>
  );
}

function DetailModal({ id, onClose }: { id?: string; onClose: ()=>void }) {
  const { data, anexar, remover, updateCliente, setCardColor } = useERP();
  const c = data.clientes.find(x => x.id === id);
  const [edit, setEdit] = useState(false);
  const [nome, setNome] = useState(c?.nome || "");
  const [cpf, setCpf] = useState(c?.cpf || "");
  const [valor, setValor] = useState(c ? String(c.valorPagamento) : "");
  const [operador, setOperador] = useState(c?.operador || "");
  const fileRef = useRef<HTMLInputElement|null>(null);
  const [color, setColor] = useState(c?.cardColor || "azul");

  React.useEffect(()=>{
    if (c) {
      setNome(c.nome); setCpf(c.cpf); setValor(String(c.valorPagamento)); setOperador(c.operador); setColor(c.cardColor || "azul");
    }
  }, [id]);

  if (!id || !c) return null;

  const backdrop: React.CSSProperties = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", display:"flex", alignItems:"center", justifyContent:"center", zIndex: 50
  };
  const modal: React.CSSProperties = {
    width: 720, maxWidth: "90vw", background:"#fff", borderRadius: 16, padding: 18, boxShadow:"0 10px 30px rgba(0,0,0,.2)"
  };
  const row: React.CSSProperties = { display:"grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
  const label: React.CSSProperties = { fontSize:12, color:"#6b7280", fontWeight:600 };
  const input: React.CSSProperties = { padding:10, border:"1px solid #e5e7eb", borderRadius:10, background:"#fff" };

  const save = () => {
    const valorNum = Number(String(valor).replace(/\./g, '').replace(',', '.'));
    updateCliente(c.id, { nome, cpf, valorPagamento: isNaN(valorNum)? c.valorPagamento : valorNum, operador });
    setCardColor(c.id, color as CardColor);
    setEdit(false);
  };

  const upload = () => {
    if (!fileRef.current || !fileRef.current.files || fileRef.current.files.length===0) return;
    anexar(c.id, fileRef.current.files[0].name);
    fileRef.current.value = "";
  };

  return (
    <div style={backdrop} onClick={onClose}>
      <div style={modal} onClick={(e)=>e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 12 }}>
          <h2 style={{ margin:0, fontSize:20, fontWeight:800 }}>Cliente</h2>
          <div style={{ display:"flex", gap:8 }}>
            <button title="Editar" onClick={()=>setEdit(v=>!v)} style={{ border:"1px solid #e5e7eb", background:"#fff", borderRadius:10, padding:"6px 10px", cursor:"pointer" }}>✏️</button>
            <button onClick={onClose} style={{ border:"1px solid #e5e7eb", background:"#fff", borderRadius:10, padding:"6px 10px", cursor:"pointer" }}>✖</button>
          </div>
        </div>

        <div style={row}>
          <div>
            <div style={label}>Nome do cliente</div>
            {edit ? <input value={nome} onChange={e=>setNome(e.target.value)} style={input}/> : <div style={{ fontWeight:700 }}>{c.nome}</div>}
          </div>
          <div>
            <div style={label}>CPF</div>
            {edit ? <input value={cpf} onChange={e=>setCpf(e.target.value)} style={input}/> : <div>{c.cpf}</div>}
          </div>
          <div>
            <div style={label}>Valor do pagamento (R$)</div>
            {edit ? <input value={valor} onChange={e=>setValor(e.target.value)} style={input}/> : <div>R$ {c.valorPagamento.toFixed(2)}</div>}
          </div>
          <div>
            <div style={label}>Operador vinculado</div>
            {edit ? <input value={operador} onChange={e=>setOperador(e.target.value)} style={input}/> : <div>{c.operador}</div>}
          </div>
          <div>
            <div style={label}>Cor do card</div>
            {edit ? (
              <select value={color} onChange={e=>setColor(e.target.value as CardColor)} style={{ ...input, padding: 10 }}>
                <option value="vermelho">Vermelho</option>
                <option value="verde">Verde</option>
                <option value="amarelo">Amarelo</option>
                <option value="azul">Azul</option>
              </select>
            ) : (
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ width:14, height:14, borderRadius:4, display:"inline-block", background: colorMap[c.cardColor || "azul"] }}></span>
                <span style={{ textTransform:"capitalize" }}>{c.cardColor || "azul"}</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop:16 }}>
          <div style={{ fontWeight:800, marginBottom: 8 }}>Documentos</div>
          {c.documentos?.length ? (
            <ul style={{ marginTop: 6 }}>
              {c.documentos.map((d,i)=>(<li key={i} style={{ fontSize:14 }}>{d}</li>))}
            </ul>
          ) : (
            <div style={{ fontSize: 14, color:"#6b7280" }}>Nenhum documento anexado.</div>
          )}
          <div style={{ display:"flex", gap: 8, alignItems:"center", marginTop: 10 }}>
            <input type="file" ref={fileRef} />
            <button onClick={upload} style={{ background:"#3b82f6", color:"#fff", border:"none", borderRadius:10, padding:"8px 12px", fontWeight:700, cursor:"pointer" }}>Anexar</button>
          </div>
        </div>

        {edit && (
          <div style={{ marginTop:16, display:"flex", justifyContent:"flex-end", gap: 8 }}>
            <button onClick={()=>setEdit(false)} style={{ border:"1px solid #e5e7eb", background:"#fff", borderRadius:10, padding:"10px 12px", fontWeight:700, cursor:"pointer" }}>Cancelar</button>
            <button onClick={save} style={{ background:"#22c55e", color:"#fff", border:"none", borderRadius:10, padding:"10px 12px", fontWeight:700, cursor:"pointer" }}>Salvar</button>
          </div>
        )}
      </div>
    </div>
  );
}
