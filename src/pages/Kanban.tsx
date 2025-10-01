// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, User, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const stages = [
  { key: "CONTRATO_PENDENTE", label: "Contrato Pendente" },
  { key: "DESBLOQUEIO", label: "Desbloqueio" },
  { key: "LIBERACAO_VALOR", label: "Liberação do Valor" },
  { key: "PAGAMENTO", label: "Pagamento" },
];

export default function Kanban() {
  const queryClient = useQueryClient();

  const { data: kanbanData, isLoading } = useQuery({
    queryKey: ["kanban"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_kanban" as "v_kanban")
        .select("*")
        .order("data_entrada_etapa", { ascending: false });
      
      if (error) throw error;
      return data as any[];
    },
  });

  const advanceStageMutation = useMutation({
    mutationFn: async ({ caseId, notes }: { caseId: string; notes?: string }) => {
      const { data, error } = await supabase.rpc("advance_case_stage" as "advance_case_stage", {
        p_case_id: caseId,
        p_actor_operator_id: null,
        p_notes: notes || null,
      } as any);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban"] });
      toast.success("Caso avançado para próxima etapa!");
    },
    onError: (error) => {
      toast.error(`Erro ao avançar caso: ${error.message}`);
    },
  });

  const handleAdvance = (caseId: string) => {
    advanceStageMutation.mutate({ caseId });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Kanban</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map((stage) => (
            <div key={stage.key} className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const casesByStage = stages.reduce((acc, stage) => {
    acc[stage.key] = kanbanData?.filter((c) => c.current_stage === stage.key) || [];
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Kanban</h1>
        <p className="text-muted-foreground">Pipeline de casos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage) => (
          <div key={stage.key} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">{stage.label}</h2>
              <Badge variant="secondary">{casesByStage[stage.key].length}</Badge>
            </div>

            <div className="space-y-3">
              {casesByStage[stage.key].map((caseItem) => (
                <Card key={caseItem.case_id} className="shadow-card hover-scale">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{caseItem.customer_nome}</CardTitle>
                    <p className="text-xs text-muted-foreground">CPF: {caseItem.customer_cpf}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(caseItem.valor_contratado)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{caseItem.operator_nome}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(caseItem.data_entrada_etapa).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      {caseItem.prazo_sla && (
                        <div className="text-xs">
                          <span className="font-medium">SLA: </span>
                          {new Date(caseItem.prazo_sla).toLocaleDateString("pt-BR")}
                        </div>
                      )}
                    </div>

                    {stage.key !== "PAGAMENTO" && (
                      <Button
                        onClick={() => handleAdvance(caseItem.case_id)}
                        disabled={advanceStageMutation.isPending}
                        size="sm"
                        className="w-full"
                      >
                        Avançar <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}

              {casesByStage[stage.key].length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhum caso nesta etapa
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
