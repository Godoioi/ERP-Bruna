import { BoardState, Cliente, StatusCol, statusLabel, CardColor } from "./types";

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
      valorPagamento: 2500.00,
      operador: "Bruna",
      cardColor: "amarelo",
      documentos: [],
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    },
    {
      id: "c2",
      nome: "Cliente Teste",
      cpf: "12345678901",
      status: "LIBERACAO_VALOR",
      valorPagamento: 1800.50,
      operador: "João",
      cardColor: "azul",
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
    const parsed = JSON.parse(raw) as BoardState;
    // migração simples: preencher campos novos se faltarem
    parsed.clientes = parsed.clientes.map(c => ({
      valorPagamento: 0,
      operador: "",
      cardColor: "azul",
      documentos: [],
      ...c,
    }));
    return parsed;
  } catch {
    localStorage.setItem(KEY, JSON.stringify(seed));
    return seed;
  }
}

export function saveBoard(data: BoardState) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function addCliente(nome: string, cpf: string, valorPagamento: number, operador: string): Cliente {
  const state = loadBoard();
  const novo: Cliente = {
    id: crypto.randomUUID(),
    nome,
    cpf,
    status: "CONTRATO_PENDENTE",
    valorPagamento,
    operador,
    cardColor: "azul",
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

export function updateCliente(id: string, patch: Partial<Pick<Cliente, "nome"|"cpf"|"valorPagamento"|"operador">>) {
  const st = loadBoard();
  const idx = st.clientes.findIndex(c => c.id === id);
  if (idx >= 0) {
    st.clientes[idx] = { ...st.clientes[idx], ...patch };
    saveBoard(st);
  }
}

export function setCardColor(id: string, color: CardColor) {
  const st = loadBoard();
  const c = st.clientes.find(x => x.id === id);
  if (c) {
    c.cardColor = color;
    saveBoard(st);
  }
}
