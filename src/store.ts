import { create } from "zustand";
import { BoardState, StatusCol, CardColor } from "./types";
import { loadBoard, addCliente as addC, moveCliente as moveC, anexarDocumento as anexarDoc, removerCliente as removerC, updateCliente as updC, setCardColor as setColor } from "./storage";

interface Store {
  data: BoardState;
  refresh: () => void;
  addCliente: (nome: string, cpf: string, valorPagamento: number, operador: string) => void;
  moveCliente: (id: string, status: StatusCol) => void;
  anexar: (id: string, nome: string) => void;
  remover: (id: string) => void;
  updateCliente: (id: string, patch: {nome?: string; cpf?: string; valorPagamento?: number; operador?: string}) => void;
  setCardColor: (id: string, color: CardColor) => void;
}

export const useERP = create<Store>((set) => ({
  data: loadBoard(),
  refresh: () => set({ data: loadBoard() }),
  addCliente: (nome, cpf, valorPagamento, operador) => {
    addC(nome, cpf, valorPagamento, operador);
    set({ data: loadBoard() });
  },
  moveCliente: (id, status) => {
    moveC(id, status);
    set({ data: loadBoard() });
  },
  anexar: (id, nome) => {
    anexarDoc(id, nome);
    set({ data: loadBoard() });
  },
  remover: (id) => {
    removerC(id);
    set({ data: loadBoard() });
  },
  updateCliente: (id, patch) => {
    updC(id, patch);
    set({ data: loadBoard() });
  },
  setCardColor: (id, color) => {
    setColor(id, color);
    set({ data: loadBoard() });
  }
}));
