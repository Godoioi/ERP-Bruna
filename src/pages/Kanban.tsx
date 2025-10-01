import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Modal from "react-modal";

Modal.setAppElement("#root");

type Case = {
  id: string;
  cliente: string;
  valor_contratado: number;
  current_stage: string;
  obs: string | null;
};

type Stage = "CONTRATO_PENDENTE" | "DESBLOQUEIO" | "LIBERACAO_VALOR" | "PAGAMENTO" | "CONCLUIDO" | "CANCELADO";

const stageLabels: Record<Stage, string> = {
  CONTRATO_PENDENTE: "Contrato Pendente",
  DESBLOQUEIO: "Desbloqueio",
  LIBERACAO_VALOR: "Liberação Valor",
  PAGAMENTO: "Pagamento",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

const stageColors: Record<Stage, string> = {
  CONTRATO_PENDENTE: "bg-yellow-200",
  DESBLOQUEIO: "bg-blue-200",
  LIBERACAO_VALOR: "bg-green-200",
  PAGAMENTO: "bg-purple-200",
  CONCLUIDO: "bg-green-400",
  CANCELADO: "bg-red-300",
};

export default function Kanban() {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  useEffect(() => {
    fetchCases();
  }, []);

  async function fetchCases() {
    const { data, error } = await supabase
      .from("v_kanban")
      .select("case_id, cliente, valor_contratado, current_stage, obs");
    if (error) console.error(error);
    else
      setCases(
        data.map((c: any) => ({
          id: c.case_id,
          cliente: c.cliente,
          valor_contratado: c.valor_contratado,
          current_stage: c.current_stage,
          obs: c.obs,
        }))
      );
  }

  async function updateCaseStage(id: string, newStage: Stage) {
    const { error } = await supabase
      .from("cases")
      .update({ current_stage: newStage, status: newStage })
      .eq("id", id);
    if (error) console.error(error);
    else fetchCases();
  }

  function onDragEnd(result: any) {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId !== destination.droppableId) {
      updateCaseStage(draggableId, destination.droppableId as Stage);
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Esteira Operacional</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-6 gap-4">
          {Object.keys(stageLabels).map((stageKey) => (
            <Droppable droppableId={stageKey} key={stageKey}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-100 rounded p-2 min-h-[300px]"
                >
                  <h2 className="font-semibold text-sm mb-2">
                    {stageLabels[stageKey as Stage]}
                  </h2>
                  {cases
                    .filter((c) => c.current_stage === stageKey)
                    .map((c, index) => (
                      <Draggable draggableId={c.id} index={index} key={c.id}>
                        {(provided) => (
                          <div
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                            className={`p-2 mb-2 rounded cursor-pointer ${stageColors[stageKey as Stage]}`}
                            onClick={() => setSelectedCase(c)}
                          >
                            <p className="font-bold">{c.cliente}</p>
                            <p className="text-xs">R$ {c.valor_contratado}</p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Modal de detalhes */}
      {selectedCase && (
        <Modal
          isOpen={true}
          onRequestClose={() => setSelectedCase(null)}
          contentLabel="Detalhes do Cliente"
          className="bg-white p-4 rounded shadow-lg max-w-lg mx-auto mt-20"
        >
          <h2 className="text-xl font-bold mb-2">{selectedCase.cliente}</h2>
          <p>Valor contratado: R$ {selectedCase.valor_contratado}</p>
          <p>Observações: {selectedCase.obs || "Nenhuma"}</p>

          <h3 className="mt-4 font-semibold">Documentos</h3>
          <ul>
            {/* Aqui listamos os documentos do cliente */}
            <li>📄 Exemplo de documento anexado</li>
          </ul>

          <button
            onClick={() => setSelectedCase(null)}
            className="mt-4 bg-blue-500 text-white px-3 py-1 rounded"
          >
            Fechar
          </button>
        </Modal>
      )}
    </div>
  );
}
