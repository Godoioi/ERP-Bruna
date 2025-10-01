// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Clientes() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    customer_nome: "",
    customer_cpf: "",
    customer_telefone: "",
    customer_email: "",
    customer_uf: "",
    valor_contratado: "",
    origem: "",
    operator_id: "",
    obs: "",
  });

  const { data: operators } = useQuery({
    queryKey: ["operators"],
    queryFn: async () => {
      const { data, error } = await supabase.from("operators" as "operators").select("*");
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers", searchTerm],
    queryFn: async () => {
      let query = supabase.from("customers" as "customers").select("*");
      
      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query.order("nome");
      if (error) throw error;
      return data as any[];
    },
  });

  const createCaseMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.rpc("create_case_with_stage" as "create_case_with_stage", {
        p_customer_nome: data.customer_nome,
        p_customer_cpf: data.customer_cpf,
        p_customer_telefone: data.customer_telefone || null,
        p_customer_email: data.customer_email || null,
        p_customer_uf: data.customer_uf || null,
        p_operator_id: data.operator_id,
        p_valor_contratado: parseFloat(data.valor_contratado),
        p_origem: data.origem || null,
        p_obs: data.obs || null,
      } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["kanban"] });
      toast.success("Cliente e caso criados com sucesso!");
      setOpen(false);
      setFormData({
        customer_nome: "",
        customer_cpf: "",
        customer_telefone: "",
        customer_email: "",
        customer_uf: "",
        valor_contratado: "",
        origem: "",
        operator_id: "",
        obs: "",
      });
    },
    onError: (error) => {
      toast.error(`Erro ao criar caso: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCaseMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gerencie seus clientes e casos</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Caso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Cliente e Caso</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_nome">Nome do Cliente *</Label>
                  <Input
                    id="customer_nome"
                    value={formData.customer_nome}
                    onChange={(e) => setFormData({ ...formData, customer_nome: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_cpf">CPF *</Label>
                  <Input
                    id="customer_cpf"
                    value={formData.customer_cpf}
                    onChange={(e) => setFormData({ ...formData, customer_cpf: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_telefone">Telefone</Label>
                  <Input
                    id="customer_telefone"
                    value={formData.customer_telefone}
                    onChange={(e) => setFormData({ ...formData, customer_telefone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_email">E-mail</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_uf">UF</Label>
                  <Input
                    id="customer_uf"
                    maxLength={2}
                    value={formData.customer_uf}
                    onChange={(e) => setFormData({ ...formData, customer_uf: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor_contratado">Valor Contratado *</Label>
                  <Input
                    id="valor_contratado"
                    type="number"
                    step="0.01"
                    value={formData.valor_contratado}
                    onChange={(e) => setFormData({ ...formData, valor_contratado: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="operator_id">Operador Responsável *</Label>
                  <Select
                    value={formData.operator_id}
                    onValueChange={(value) => setFormData({ ...formData, operator_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um operador" />
                    </SelectTrigger>
                    <SelectContent>
                      {operators?.map((op) => (
                        <SelectItem key={op.id} value={op.id}>
                          {op.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="origem">Origem</Label>
                  <Input
                    id="origem"
                    value={formData.origem}
                    onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="obs">Observações</Label>
                <Textarea
                  id="obs"
                  value={formData.obs}
                  onChange={(e) => setFormData({ ...formData, obs: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createCaseMutation.isPending}>
                  {createCaseMutation.isPending ? "Criando..." : "Criar Caso"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : customers?.length === 0 ? (
          <p className="text-muted-foreground">Nenhum cliente encontrado</p>
        ) : (
          customers?.map((customer) => (
            <Card key={customer.id} className="shadow-card hover-scale">
              <CardHeader>
                <CardTitle className="text-lg">{customer.nome}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">CPF:</span> {customer.cpf}
                </p>
                {customer.telefone && (
                  <p>
                    <span className="font-medium">Telefone:</span> {customer.telefone}
                  </p>
                )}
                {customer.email && (
                  <p>
                    <span className="font-medium">E-mail:</span> {customer.email}
                  </p>
                )}
                {customer.uf && (
                  <p>
                    <span className="font-medium">UF:</span> {customer.uf}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
