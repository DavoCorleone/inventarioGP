"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Building2, MapPin, User, CheckCircle2, XCircle } from "lucide-react";

export default function SucursalesPage() {
    const branches = useQuery(api.branches.listBranches);

    return (
        <>
            <div className="page-header">
                <h2>Sucursales</h2>
                <p>Red de concesionarios Grupo Palacios — {branches?.length ?? 0} sucursales</p>
            </div>

            <div className="page-body fade-in">
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                        gap: 20,
                    }}
                >
                    {branches?.map((branch) => (
                        <div key={branch._id} className="card" style={{ padding: 24 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div
                                        style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 10,
                                            background: "linear-gradient(135deg, var(--jetour-blue-light), var(--jac-red-light))",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "var(--jetour-blue)",
                                        }}
                                    >
                                        <Building2 size={22} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: 16, fontWeight: 700 }}>{branch.name}</h3>
                                        <span
                                            style={{ fontSize: 12, color: "var(--text-muted)" }}
                                        >
                                            {branch.city}
                                        </span>
                                    </div>
                                </div>
                                {branch.active ? (
                                    <span className="badge optimal">
                                        <CheckCircle2 size={12} /> Activa
                                    </span>
                                ) : (
                                    <span className="badge critical">
                                        <XCircle size={12} /> Inactiva
                                    </span>
                                )}
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                                    <MapPin size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                                    {branch.locationDetails}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                                    <User size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                                    Gerente: {branch.managerName}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {!branches || branches.length === 0 ? (
                    <div className="empty-state">
                        <Building2 />
                        <p>No hay sucursales registradas</p>
                        <span>Ejecuta el seed para cargar datos iniciales</span>
                    </div>
                ) : null}
            </div>
        </>
    );
}
