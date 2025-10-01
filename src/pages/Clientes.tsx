import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

type Customer = { id: string; nome: string; cpf: string | null; email?: string | null; telefone?: string | null };
type Operator = { id: string; nome: string; email: string | null };

export default function Clientes() {
  const [clientes, setClientes] = useState<Customer[]>([]);
  const [ops, setOps] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // form novo cliente + caso
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [valor, setValor] = useState<number | "">("");
  const [dataVenda, setDataVenda] = useState("");
  const [origem, setOrigem] = useState("WhatsApp");
  const [operador, setOperador] = useState<string>("");

  // follow-up
  const [fuDate, setFuDate] = useState(""); // datetime-local
  const [fuNote, setFuNote] = useState("");
  const followCustomerId = useRef<string | null>(null);

  // upload
  const fileInput = useRef<HTMLInputElement | null>(null);
  const uploadCustomerId = useRef<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const [{ data: cs, error: e1 }, { data: os, error: e2 }] = await Promise.all([
        supabase.from("customers").select("id,nome,cpf,email,telefone").order("nome"),
        supabase.from("operators").select("id,nome,email").order("nome"),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      setClientes(cs || []);
      setOps(os || []);
      if (!operador && os?.length) setOperador(os[0].id);
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      // cria cliente
      const { data: cIns, error: cErr } = await supabase
        .from("customers")
        .insert({ nome, cpf: cpf.replace(/\D/g, "").padEnd(11, "0"), telefone, email })
        .select("id")
        .single();
      if (cErr) throw cErr;
      const customerId = cIns!.id;

      // pega meu operator_id (quem está criando)
      const { data: user } = await supabase.auth.getUser();
      const myEmail = user?.user?.email || "";
      const { data: me } = await supabase.from("operators").select("id").eq("email", myEmail).maybeSingle();
      const createdBy = me?.id ?? null;

      // cria caso via RPC
      const { data: caseIdRows, error: rErr } = await supabase.rpc("create_case_with_stage", {
        p_customer_id: customerId,
        p_operator_id: operador || null,
        p_valor_contratado: valor === "" ? null : Number(valor),
        p_data_venda: dataVenda || null,
        p_origem: origem,
        p_obs: null,
      });
      if (rErr) throw rErr;
      const caseId = caseIdRows as unknown as string;

      // preenche autoria e vendedor
      if (createdBy || operador) {
        await supabase.from("cases").update({
          created_by_operator_id: createdBy,
          sold_by_operator_id: operador || null,
        }).eq("id", caseId);
      }

      // reload
      setNome(""); setCpf(""); setTelefone(""); setEmail("");
      setValor(""); setDataVenda(""); setOrigem("WhatsApp");
      load();
      alert("Cliente + caso criados!");
    } catch (e: any) {
      setErr(e.message || String(e));
    }
  }

  async function openUpload(customerId: string) {
    uploadCustomerId.current = customerId;
    fileInput.current?.click();
  }
  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !uploadCustomerId.current) return;
    const path = `${uploadCustomerId.current}/${file.name}`;
    const { error: upErr } = await supabase.storage.from("cliente_docs").upload(path, file, { upsert: true });
    if (upErr) { alert(upErr.message); return; }
    const { data: user } = await supabase.auth.getUser();
    const email = user?.user?.email || "";
    const { data: me } = await supabase.from("operators").select("id").eq("email", email).maybeSingle();
    await supabase.from("customer_files").insert({
      customer_id: uploadCustomerId.current,
      uploaded_by_operator_id: me?.id ?? null,
      path,
      original_name: file.name,
    });
    alert("Arquivo anexado!");
    e.target.value = "";
  }

  async function openFollowUp(customerId: string) {
    followCustomerId.current = customerId;
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1);
    setFuDate(defaultDate.toISOString().slice(0,16)); // yyyy-MM-ddTHH:mm
    setFuNote("");
    (document.getElementById("fu-modal") as HTMLDialogElement)?.showModal();
  }
  async function saveFollowUp() {
    if (!followCustomerId.current || !fuDate) return;
    const iso = new Date(fuDate).toISOString();
    const { error } = await supabase.rpc("create_follow_up_for_me", {
      p_customer_id: followCustomerId.current,
      p_when: iso,
      p_note: fuNote || null,
    });
    if (error) { alert(error.message); return; }
    (document.getElementById("fu-modal") as HTMLDialogElement)?.close();
    alert("Lembrete criado!");
  }

  if (loading) return <div className="p-4">Carregando clientes…</div>;
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold">Clientes</h1>

      {err && <div className="text-red-600">{err}</div>}

      {/* Form novo cliente + caso */}
      <form onSubmit={handleCreate} className="grid md:grid-cols-4 gap-3 bg-white border rounded-xl p-4">
        <input className="border rounded p-2" placeholder="Nome" value={nome} onChange={e=>setNome(e.target.value)} required />
        <input className="border rounded p-2" placeholder="CPF" value={cpf} onChange={e=>setCpf(e.target.value)} required />
        <input className="border rounded p-2" placeholder="Telefone" value={telefone} onChange={e=>setTelefone(e.target.value)} />
        <input className="border rounded p-2" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} />

        <input className="border rounded p-2" type="number" placeholder="Valor contratado" value={valor} onChange={e=>setValor(e.target.value===""? "": Number(e.target.value))} />
        <input className="border rounded p-2" type="date" value={dataVenda} onChange={e=>setDataVenda(e.target.value)} />
        <input className="border rounded p-2" placeholder="Origem" value={origem} onChange={e=>setOrigem(e.target.value)} />

        <select className="border rounded p-2" value={operador} onChange={e=>setOperador(e.target.value)} required>
          <option value="">Selecione o operador</option>
          {ops.map(o => <option key={o.id} value={o.id}>{o.nome} ({o.email})</option>)}
        </select>

        <button className="rounded bg-black text-white py-2 col-span-full">Salvar cliente + caso</button>
      </form>

      {/* Lista de clientes */}
      <ul className="space-y-2">
        {clientes.map(c => (
          <li key={c.id} className="border rounded-xl p-3 bg-white flex items-center justify-between">
            <div>
              <div className="font-medium">{c.nome}</div>
              <div className="text-sm text-gray-600">{c.cpf}</div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded bg-indigo-600 text-white" onClick={() => openFollowUp(c.id)}>
                Lembrar depois
              </button>
              <button className="px-3 py-1 rounded bg-gray-800 text-white" onClick={() => openUpload(c.id)}>
                Anexar doc
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* input hidden para upload */}
      <input ref={fileInput} type="file" className="hidden" onChange={onFileChange} />

      {/* modal follow-up */}
      <dialog id="fu-modal" className="rounded-xl">
        <div className="p-4 space-y-3 min-w-[320px]">
          <h3 className="font-semibold">Agendar lembrete</h3>
          <input type="datetime-local" className="border rounded p-2 w-full" value={fuDate} onChange={e=>setFuDate(e.target.value)} />
          <input type="text" className="border rounded p-2 w-full" placeholder="Anotação (opcional)" value={fuNote} onChange={e=>setFuNote(e.target.value)} />
          <div className="flex justify-end gap-2">
            <button className="px-3 py-1 rounded border" onClick={() => (document.getElementById("fu-modal") as HTMLDialogElement)?.close()}>Cancelar</button>
            <button className="px-3 py-1 rounded bg-black text-white" onClick={saveFollowUp}>Salvar</button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
