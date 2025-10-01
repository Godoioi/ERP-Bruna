import React, { useEffect, useState } from "react";
import { supabase } from "../client";

type Customer = {
  id: string;
  nome: string;
  cpf: string;
};

export default function Clientes() {
  const [clientes, setClientes] = useState<Customer[]>([]);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  async function fetchClientes() {
    const { data, error } = await supabase
      .from("customers")
      .select("id, nome, cpf")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setClientes(data);
  }

  async function addCliente() {
    const { error } = await supabase
      .from("customers")
      .insert([{ nome, cpf }]);
    if (error) alert("Erro: " + error.message);
    else {
      setNome("");
      setCpf("");
      fetchClientes();
    }
  }

  async function uploadFile(customerId: string) {
    if (!file) return;
    const filePath = `${customerId}/${file.name}`;
    const { error } = await supabase.storage
      .from("cliente_docs")
      .upload(filePath, file, { upsert: true });
    if (error) {
      alert("Erro no upload: " + error.message);
    } else {
      await supabase.from("customer_files").insert([
        {
          customer_id: customerId,
          path: filePath,
          original_name: file.name,
        },
      ]);
      setFile(null);
      alert("Upload concluído!");
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Clientes</h1>

      <div className="mb-4 space-x-2">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome"
          className="border p-1"
        />
        <input
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          placeholder="CPF"
          className="border p-1"
        />
        <button
          onClick={addCliente}
          className="bg-green-500 text-white px-3 py-1 rounded"
        >
          Adicionar
        </button>
      </div>

      <ul>
        {clientes.map((c) => (
          <li key={c.id} className="mb-2 border p-2 rounded">
            <p className="font-bold">{c.nome}</p>
            <p className="text-xs">CPF: {c.cpf}</p>

            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-2"
            />
            <button
              onClick={() => uploadFile(c.id)}
              className="ml-2 bg-blue-500 text-white px-2 py-1 rounded"
            >
              Enviar Documento
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
