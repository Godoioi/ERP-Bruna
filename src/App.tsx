import { useState } from "react";
import AuthGate from "@/components/AuthGate";
import Clientes from "@/pages/Clientes";
import Kanban from "@/pages/Kanban";
import Agenda from "@/pages/Agenda";
import { supabase } from "@/integrations/supabase/client";

type TabKey = "kanban" | "clientes" | "agenda";

export default function App() {
  const [tab, setTab] = useState<TabKey>("kanban");

  return (
    <AuthGate>
      <div className="min-h-screen bg-gray-50">
        {/* Topbar simples */}
        <header className="sticky top-0 bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold">ERP Bruna</span>
              <nav className="flex items-center gap-2">
                <button
                  className={`px-3 py-1.5 rounded-lg text-sm ${tab==='kanban' ? 'bg-black text-white' : 'bg-gray-100'}`}
                  onClick={() => setTab("kanban")}
                >
                  Esteira Operacional
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg text-sm ${tab==='clientes' ? 'bg-black text-white' : 'bg-gray-100'}`}
                  onClick={() => setTab("clientes")}
                >
                  Clientes
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg text-sm ${tab==='agenda' ? 'bg-black text-white' : 'bg-gray-100'}`}
                  onClick={() => setTab("agenda")}
                >
                  Agenda
                </button>
              </nav>
            </div>

            <button
              onClick={async () => { await supabase.auth.signOut(); location.reload(); }}
              className="px-3 py-1.5 rounded-lg text-sm bg-gray-100"
              title="Sair"
            >
              Sair
            </button>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="max-w-6xl mx-auto px-4 py-6">
          {tab === "kanban" && <Kanban />}
          {tab === "clientes" && <Clientes />}
          {tab === "agenda" && <Agenda />}
        </main>
      </div>
    </AuthGate>
  );
}
