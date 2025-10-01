import React from "react";
import Kanban from "../components/Kanban";

export default function EsteiraOperacional() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>
        Esteira Operacional
      </h1>
      <Kanban />
    </div>
  );
}
