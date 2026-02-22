"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Boxes, Package, CheckCircle2, XCircle } from "lucide-react";

export default function PacksPage() {
    const packs = useQuery(api.packs.listPacks, {});

    return (
        <>
            <div className="page-header">
                <h2>Packs (BOM)</h2>
                <p>Bill of Materials — Paquetes de productos para entregas y eventos</p>
            </div>

            <div className="page-body fade-in">
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                        gap: 20,
                    }}
                >
                    {packs?.map((pack) => (
                        <div key={pack._id} className="card">
                            <div className="card-header">
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 10,
                                            background:
                                                pack.brand === "JAC"
                                                    ? "var(--jac-red-light)"
                                                    : pack.brand === "Jetour"
                                                        ? "var(--jetour-blue-light)"
                                                        : "#F3F4F6",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color:
                                                pack.brand === "JAC"
                                                    ? "var(--jac-red)"
                                                    : pack.brand === "Jetour"
                                                        ? "var(--jetour-blue)"
                                                        : "#1F2937",
                                        }}
                                    >
                                        <Boxes size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 15 }}>{pack.name}</div>
                                        <span className={`brand-dot ${pack.brand}`} style={{ fontSize: 12 }}>
                                            {pack.brand}
                                        </span>
                                    </div>
                                </div>
                                {pack.active ? (
                                    <span className="badge optimal">
                                        <CheckCircle2 size={12} /> Activo
                                    </span>
                                ) : (
                                    <span className="badge critical">
                                        <XCircle size={12} /> Inactivo
                                    </span>
                                )}
                            </div>

                            <div style={{ padding: "0 24px 8px" }}>
                                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                                    {pack.description}
                                </p>
                            </div>

                            <div style={{ padding: "0 24px 20px" }}>
                                <div
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: "var(--text-muted)",
                                        textTransform: "uppercase",
                                        letterSpacing: 0.5,
                                        marginBottom: 8,
                                    }}
                                >
                                    Componentes ({pack.itemCount})
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {pack.items.map((item: any) => {
                                        const stockOk = item.currentStock >= item.quantity;
                                        return (
                                            <div
                                                key={item._id}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    padding: "8px 12px",
                                                    background: stockOk ? "#F8FAFC" : "var(--danger-bg)",
                                                    borderRadius: "var(--radius-sm)",
                                                    fontSize: 13,
                                                    border: `1px solid ${stockOk ? "var(--border-color)" : "#FECACA"}`,
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <Package size={14} style={{ color: "var(--text-muted)" }} />
                                                    <span style={{ fontWeight: 500 }}>{item.productName}</span>
                                                    <code style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                                        {item.productSku}
                                                    </code>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                    <span style={{ fontWeight: 700 }}>×{item.quantity}</span>
                                                    <span
                                                        style={{
                                                            fontSize: 11,
                                                            color: stockOk ? "var(--success)" : "var(--danger)",
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        Stock: {item.currentStock}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {!packs || packs.length === 0 ? (
                    <div className="empty-state">
                        <Boxes />
                        <p>No hay packs configurados</p>
                        <span>Ejecuta el seed para cargar packs de ejemplo</span>
                    </div>
                ) : null}
            </div>
        </>
    );
}
