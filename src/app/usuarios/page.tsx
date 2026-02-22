"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Users, Shield, User, MapPin, Check, X, Clock } from "lucide-react";
import { useMimsAuth } from "@/components/AppShell";

const ROLE_LABELS: Record<string, string> = {
    admin: "Administrador",
    supervisor: "Supervisor",
    advisor: "Asesor",
};

const ROLE_ICONS: Record<string, typeof Shield> = {
    admin: Shield,
    supervisor: Shield,
    advisor: User,
};

export default function UsuariosPage() {
    const { user: currentUser, isAuthenticated } = useMimsAuth();
    const users = useQuery(api.auth.listUsers);
    const pendingUsers = useQuery(
        api.auth.listPendingUsers,
        currentUser?.role === "admin" && isAuthenticated ? {} : "skip"
    );

    const approveMutation = useMutation(api.auth.approveUser);
    const rejectMutation = useMutation(api.auth.rejectUser);

    const handleApprove = async (userId: any) => {
        if (!isAuthenticated) return;
        try {
            await approveMutation({ userId });
        } catch (e: any) {
            alert(e.message || "Error al aprobar");
        }
    };

    const handleReject = async (userId: any) => {
        if (!isAuthenticated || !confirm("¿Seguro que deseas rechazar y eliminar este registro?")) return;
        try {
            await rejectMutation({ userId });
        } catch (e: any) {
            alert(e.message || "Error al rechazar");
        }
    };

    return (
        <>
            <div className="page-header">
                <h2>Usuarios</h2>
                <p>Equipo Grupo Palacios — {users?.length ?? 0} usuarios registrados</p>
            </div>

            <div className="page-body fade-in">
                {currentUser?.role === "admin" && pendingUsers && pendingUsers.length > 0 && (
                    <div className="card" style={{ marginBottom: 24, borderLeft: "4px solid var(--warning)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                            <div style={{ background: "var(--warning-light)", color: "var(--warning-dark)", padding: 8, borderRadius: "50%" }}>
                                <Clock size={20} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 16 }}>Aprobaciones Pendientes</h3>
                                <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
                                    Usuarios que se han registrado y esperan acceso al sistema.
                                </p>
                            </div>
                        </div>
                        <div style={{ overflowX: "auto" }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Usuario</th>
                                        <th>Email</th>
                                        <th>Rol Solicitado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingUsers.map((pUser: any) => (
                                        <tr key={pUser._id} style={{ background: "#FFFCF5" }}>
                                            <td style={{ fontWeight: 500 }}>{pUser.name}</td>
                                            <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{pUser.email}</td>
                                            <td>
                                                <span className={`badge ${pUser.role === "admin" ? "brand-jac" : "brand-corp"}`}>
                                                    {ROLE_LABELS[pUser.role] || pUser.role}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", gap: 8 }}>
                                                    <button
                                                        className="btn btn-sm"
                                                        style={{ background: "var(--success)", color: "white", padding: "4px 12px" }}
                                                        onClick={() => handleApprove(pUser._id)}
                                                    >
                                                        <Check size={14} style={{ marginRight: 4 }} /> Aprobar
                                                    </button>
                                                    <button
                                                        className="btn btn-outline btn-sm"
                                                        style={{ color: "var(--danger)", borderColor: "var(--danger)", padding: "4px 12px" }}
                                                        onClick={() => handleReject(pUser._id)}
                                                    >
                                                        <X size={14} style={{ marginRight: 4 }} /> Rechazar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="card">
                    <div style={{ overflowX: "auto" }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Email</th>
                                    <th>Rol</th>
                                    <th>Sucursal</th>
                                    <th>Modo Login</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users?.map((user) => {
                                    const RoleIcon = ROLE_ICONS[user.role] || User;
                                    return (
                                        <tr key={user._id}>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                    <div
                                                        style={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: "50%",
                                                            background:
                                                                user.role === "admin"
                                                                    ? "linear-gradient(135deg, var(--jac-red), var(--jac-red-dark))"
                                                                    : user.role === "supervisor"
                                                                        ? "linear-gradient(135deg, var(--jetour-blue), var(--jetour-blue-dark))"
                                                                        : "linear-gradient(135deg, #6B7280, #4B5563)",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            color: "white",
                                                            fontWeight: 700,
                                                            fontSize: 13,
                                                        }}
                                                    >
                                                        {user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{user.email}</td>
                                            <td>
                                                <span
                                                    className={`badge ${user.role === "admin"
                                                        ? "brand-jac"
                                                        : user.role === "supervisor"
                                                            ? "brand-jetour"
                                                            : "brand-karry"
                                                        }`}
                                                >
                                                    <RoleIcon size={12} />
                                                    {ROLE_LABELS[user.role]}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                                                    <MapPin size={12} style={{ color: "var(--text-muted)" }} />
                                                    {user.branchName}
                                                </div>
                                            </td>
                                            <td>
                                                <span
                                                    className="badge brand-corp"
                                                    style={{ fontSize: 11 }}
                                                >
                                                    {user.loginMode === "password"
                                                        ? "🔒 Contraseña"
                                                        : user.loginMode === "passkey"
                                                            ? "🔑 Passkey"
                                                            : "🔐 Híbrido"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {!users || users.length === 0 ? (
                        <div className="empty-state">
                            <Users />
                            <p>No hay usuarios registrados</p>
                        </div>
                    ) : null}
                </div>
            </div>
        </>
    );
}
