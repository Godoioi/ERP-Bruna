import React from "react";
import { BrowserRouter, Routes, Route, NavLink, Link } from "react-router-dom";
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
        <button style={{ background: "#f8fafc", color: "#2563eb", border: "none", borderRadius: 10, padding: "10px 12px", fontWeight: 700 }}>
          Sair
        </button>
      </div>
    </div>
  );
}
