import { create } from "zustand";
import { BoardState, StatusCol } from "./types";
import { loadBoard, addCliente as addC, moveCliente as moveC, anexarDocumento as anexarDoc, removerCliente as removerC } from "./storage";

interface Store {
  data: BoardState;
  refresh: () => void;
  addCliente: (nome: string, cpf: string) => void;
  moveCliente: (id: string, status: StatusCol) => void;
  anexar: (id: string, nome: string) => void;
  remover: (id: string) => void;
}

export const useERP = create<Store>((set) => ({
  data: loadBoard(),
  refresh: () => set({ data: loadBoard() }),
  addCliente: (nome, cpf) => {
    addC(nome, cpf);
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
}));
