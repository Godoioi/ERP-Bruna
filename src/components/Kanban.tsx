import React from "react";
PAGAMENTO: [],
CONCLUIDO: [],
CANCELADO: [],
};
data.clientes.forEach((c) => idsByCol[c.status].push(c.id));


const handleDragEnd = (evt: DragEndEvent) => {
const activeId = String(evt.active.id);
const overId = evt.over?.id ? String(evt.over.id) : undefined;


// overId será um droppable id do container (coluna) se arrastar para a área vazia
// Para simplificar, usaremos a convenção de droppable ids = nome da coluna
if (!overId) return;
const maybeCol = overId as StatusCol;
if ((COLS as string[]).includes(maybeCol)) {
moveCliente(activeId, maybeCol);
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


function Column({ col, ids }: { col: StatusCol; ids: string[] }) {
const { data } = useERP();
const clients = data.clientes.filter((c) => ids.includes(c.id));


const colStyle: React.CSSProperties = {
background: "#f6f7f9",
border: "1px solid #eef0f4",
borderRadius: 14,
padding: 14,
minHeight: 420,
};


return (
<div style={colStyle} id={col}>
<div style={{ fontWeight: 700, marginBottom: 12 }}>{statusLabel[col]}</div>
<SortableContext items={clients.map((c) => c.id)} strategy={verticalListSortingStrategy}>
{clients.map((c) => (
<Card key={c.id} id={c.id} title={c.nome} subtitle={`CPF: ${c.cpf}${c.documentos?.length ? ` • ${c.documentos.length} doc(s)` : ""}`} />
))}
</SortableContext>
</div>
);
}
