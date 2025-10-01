import React from "react";
type="file"
ref={(el) => (fileRefs.current[c.id] = el)}
style={{ maxWidth: 220 }}
/>
<button type="button" style={btnSecondary} onClick={() => onUpload(c.id)}>
Enviar Documento
</button>
<button type="button" style={btnDanger} onClick={() => remover(c.id)}>
Remover
</button>
</div>
</div>
))}
</div>
</div>
);
}


const cardRow: React.CSSProperties = {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
border: "1px solid #eef0f4",
borderRadius: 12,
padding: 12,
background: "#fff",
};
const btnPrimary: React.CSSProperties = {
background: "#22c55e",
color: "white",
border: "none",
borderRadius: 10,
padding: "10px 14px",
fontWeight: 700,
cursor: "pointer",
};
const btnSecondary: React.CSSProperties = {
background: "#3b82f6",
color: "white",
border: "none",
borderRadius: 10,
padding: "10px 12px",
fontWeight: 700,
cursor: "pointer",
};
const btnDanger: React.CSSProperties = {
background: "#ef4444",
color: "white",
border: "none",
borderRadius: 10,
padding: "10px 12px",
fontWeight: 700,
cursor: "pointer",
};
