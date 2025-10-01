import React from "react";
import { DndContext, DragEndEvent, useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useERP } from "../store";
import { StatusCol, statusLabel } from "../types";

const COLS: StatusCol[] = [
  "CONTRATO_PENDENTE",
  "DESBLOQUEIO",
  "LIBERACAO_VALOR",
  "PAGAMENTO",
  "CONCLUIDO",
  "CANCELADO",
];

function Card({ id, title, subtitle }: { id: string; title: string; subtitle?: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    boxShadow: "0 2px 6px rgba(0,0,0,.06)",
    cursor: "grab",
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div style={{ fontWeight: 600 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{subtitle}</div>}
    </div>
  );
}

function Column({ col, ids }: { col: StatusCol; ids: string[] }) {
  const { data } = useERP();
  const clients = data.clientes.filter((c) => ids.includes(c.id));
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
      <div style={{ fontWeight: 700, marginBottom: 12 }}>{statusLabel[col]}</div>
      <SortableContext items={clients.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        {clients.map((c) => (
          <Card
            key={c.id}
            id={c.id}
            title={c.nome}
            subtitle={`CPF: ${c.cpf}${c.documentos?.length ? ` • ${c.documentos.length} doc(s)` : ""}`}
          />
        ))}
      </SortableContext>
    </div>
  );
}

export default function Kanban() {
  const { data, moveCliente } = useERP();

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
    <DndContext onDragEnd={handleDragEnd}>
      <div style={boardStyle}>
        {COLS.map((col) => (
          <Column key={col} col={col} ids={idsByCol[col]} />
        ))}
      </div>
    </DndContext>
  );
}
