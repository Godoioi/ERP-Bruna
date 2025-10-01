import { BoardState, Cliente, StatusCol, statusLabel } from "./types";
try {
return JSON.parse(raw) as BoardState;
} catch {
localStorage.setItem(KEY, JSON.stringify(seed));
return seed;
}
}


export function saveBoard(data: BoardState) {
localStorage.setItem(KEY, JSON.stringify(data));
}


export function addCliente(nome: string, cpf: string): Cliente {
const state = loadBoard();
const novo: Cliente = {
id: crypto.randomUUID(),
nome,
cpf,
status: "CONTRATO_PENDENTE",
documentos: [],
createdAt: Date.now(),
};
state.clientes.push(novo);
saveBoard(state);
return novo;
}


export function moveCliente(id: string, novoStatus: StatusCol) {
const st = loadBoard();
const i = st.clientes.findIndex((c) => c.id === id);
if (i >= 0) {
st.clientes[i].status = novoStatus;
saveBoard(st);
}
}


export function anexarDocumento(id: string, nome: string) {
const st = loadBoard();
const c = st.clientes.find((x) => x.id === id);
if (c) {
c.documentos ||= [];
c.documentos.push(nome);
saveBoard(st);
}
}


export function removerCliente(id: string) {
const st = loadBoard();
st.clientes = st.clientes.filter((c) => c.id !== id);
saveBoard(st);
}
