const PROJECT_REF = "unniwdupcuirqjdqsesp";            // ex: abcdxyz123
const SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVubml3ZHVwY3VpcnFqZHFzZXNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTI2MTY1MywiZXhwIjoyMDc0ODM3NjUzfQ.jzKTFLTkkXBc7LvAPvKFe2UJoz7jcuFPsNRCruJI5v8";          // chave secreta do Supabase (Service key)
const users = [
  { email: "bruna@empresa.com",  password: "SenhaForte123!", name: "Bruna" },
  { email: "ryan@empresa.com",   password: "SenhaForte123!", name: "Ryan" },
  { email: "juan@empresa.com",   password: "SenhaForte123!", name: "Juan" },
  { email: "carlos@empresa.com", password: "SenhaForte123!", name: "Carlos" },
  { email: "matheus@empresa.com",password: "SenhaForte123!", name: "Matheus" },
];

async function createUser(u) {
  const res = await fetch(`https://${PROJECT_REF}.supabase.co/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "apikey": SERVICE_ROLE,
      "Authorization": `Bearer ${SERVICE_ROLE}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: u.email, password: u.password, email_confirm: true })
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error("Falhou:", u.email, res.status, txt);
  } else {
    console.log("OK:", u.email);
  }
}

for (const u of users) await createUser(u);
