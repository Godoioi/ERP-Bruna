// Tipos temporários até os tipos do Supabase serem gerados automaticamente
export type SupabaseTable = 
  | "operators"
  | "customers" 
  | "cases"
  | "payments"
  | "v_kanban"
  | "v_operator_summary";

export type SupabaseRPC = 
  | "create_case_with_stage"
  | "advance_case_stage";
