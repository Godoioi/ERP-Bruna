import { BoardState, Cliente, StatusCol, statusLabel } from "./types";

const KEY = "erpbrunaops_v1";

const seed: BoardState = {
  cols: {
    CONTRATO_PENDENTE: statusLabel.CONTRATO_PENDENTE,
    DESBLOQUEIO: statusLabel.DESBLOQUEIO,
    LIBERACAO_VALOR: statusLabel.LIBERACAO_VALOR,
    PAGAMENTO: statusLabel.PAGAMENTO,
    CONCLUIDO: statusLabel.CONCLUIDO,
    CANCELADO: statusLabel.CANCELADO,
  },
  clientes: [
    {
      id: "c1",
      nome: "Tânia Priscila Godoi",
      cpf: "14311497997",
      status: "CONTRATO_PENDENTE",
      documentos: [],
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    },
    {
      id: "c2",
      nome: "Cliente Teste",
      cpf: "12345678901",
      status: "LIBERACAO_VALOR",
      documentos: ["RG.pdf"],
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    },
  ],
};

export function loadBoard(): BoardState {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify(seed));
    return seed;
  }
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
