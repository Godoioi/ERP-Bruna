import { create } from "zustand";
import { BoardState, Cliente, StatusCol } from "./types";
import { loadBoard, saveBoard, addCliente, moveCliente, anexarDocumento, removerCliente } from "./storage";


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
addCliente(nome, cpf);
set({ data: loadBoard() });
},
moveCliente: (id, status) => {
moveCliente(id, status);
set({ data: loadBoard() });
},
anexar: (id, nome) => {
anexarDocumento(id, nome);
set({ data: loadBoard() });
},
remover: (id) => {
removerCliente(id);
set({ data: loadBoard() });
},
}));
