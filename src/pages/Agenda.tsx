import React from "react";
export default function Agenda() {
return (
<div style={{ padding: 24 }}>
<h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Agenda</h1>
<p>Em breve: compromissos e tarefas.</p>
</div>
);
}


// ===============================
// src/App.tsx (navbar + rotas)
// ===============================
import React from "react";
import { Link, NavLink, Outlet, Route, BrowserRouter, Routes } from "react-router-dom";
import EsteiraOperacional from "./pages/EsteiraOperacional";
import Clientes from "./pages/Clientes";
import Agenda from "./pages/Agenda";


export default function App() {
return (
<BrowserRouter>
<div>
<Topbar />
<Routes>
<Route path="/" element={<EsteiraOperacional />} />
<Route path="/clientes" element={<Clientes />} />
<Route path="/agenda" element={<Agenda />} />
</Routes>
</div>
</BrowserRouter>
);
}


function Topbar() {
const linkStyle = ({ isActive }: { isActive: boolean }) => ({
padding: "6px 12px",
borderRadius: 10,
fontWeight: 700,
background: isActive ? "#111827" : "#eef0f4",
color: isActive ? "#fff" : "#111827",
textDecoration: "none",
});


return (
<div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderBottom: "1px solid #f0f2f6" }}>
<Link to="/" style={{ fontWeight: 900, fontSize: 18, textDecoration: "none", color: "#111827", marginRight: 8 }}>
ERP Bruna
</Link>
<NavLink to="/" style={linkStyle} end>
Esteira Operacional
</NavLink>
<NavLink to="/clientes" style={linkStyle}>
Clientes
</NavLink>
<NavLink to="/agenda" style={linkStyle}>
Agenda
</NavLink>
<div style={{ marginLeft: "auto" }}>
<button style={{ ...btnSecondary, background: "#f8fafc", color: "#2563eb" }}>Sair</button>
</div>
</div>
);
}
