export type StatusCol =
| "CONTRATO_PENDENTE"
| "DESBLOQUEIO"
| "LIBERACAO_VALOR"
| "PAGAMENTO"
| "CONCLUIDO"
| "CANCELADO";


export interface Cliente {
id: string;
nome: string;
cpf: string;
status: StatusCol;
documentos?: string[]; // nomes simulados
createdAt: number;
}


export interface BoardState {
cols: Record<StatusCol, string>; // label das colunas
clientes: Cliente[];
}


// Helpers
export const statusLabel: Record<StatusCol, string> = {
CONTRATO_PENDENTE: "Contrato Pendente",
DESBLOQUEIO: "Desbloqueio",
LIBERACAO_VALOR: "Liberação Valor",
PAGAMENTO: "Pagamento",
CONCLUIDO: "Concluído",
CANCELADO: "Cancelado",
};
