"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Users, Shield, User, MapPin, Check, X, Clock, UserPlus, Link as LinkIcon, Copy, Edit2, Trash2 } from "lucide-react";
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
    const updateMutation = useMutation(api.auth.updateUser);
    const deleteMutation = useMutation(api.auth.deleteUser);

    // For editing assignment options
    const branches = useQuery(api.branches.listBranches);

    const [showInviteModal, setShowInviteModal] = useState(false);
    const [copied, setCopied] = useState(false);

    // Editing state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editUser, setEditUser] = useState<any>(null);
    const [editForm, setEditForm] = useState({ name: "", role: "", branchName: "" });

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

    const copyInviteLink = () => {
        const link = window.location.origin;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const openEditModal = (user: any) => {
        setEditUser(user);
        setEditForm({ name: user.name, role: user.role, branchName: user.branchName || "" });
        setEditModalOpen(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateMutation({
                userId: editUser._id,
                name: editForm.name,
                role: editForm.role as "admin" | "supervisor" | "advisor",
                branchName: editForm.branchName
            });
            setEditModalOpen(false);
        } catch (err: any) {
            alert(err.message || "Error al actualizar usuario");
        }
    };

    const handleDelete = async (userId: string, email: string) => {
        if (!confirm(`¿Eliminar definitivamente a ${email}? Esta acción cortará todas sus sesiones activas y no se puede deshacer.`)) return;
        try {
            await deleteMutation({ userId: userId as any });
        } catch (err: any) {
            alert(err.message || "Error al eliminar usuario");
        }
    };

    return (
        <>
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h2>Usuarios</h2>
                    <p>Equipo Grupo Palacios — {users?.length ?? 0} usuarios registrados</p>
                </div>
                {currentUser?.role === "admin" && (
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowInviteModal(true)}
                    >
                        <UserPlus size={18} />
                        Invitar Usuario
                    </button>
                )}
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
                                    <th>Acciones</th>
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
                                            <td>
                                                <div style={{ display: "flex", gap: 8 }}>
                                                    {(currentUser?.role === "admin" || (currentUser?.role === "supervisor" && user.role === "advisor")) && (
                                                        <button
                                                            className="btn-ghost"
                                                            style={{ padding: 4, color: "var(--text-secondary)" }}
                                                            onClick={() => openEditModal(user)}
                                                            title="Editar Perfil"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                    )}
                                                    {currentUser?.role === "admin" && user._id !== currentUser._id && (
                                                        <button
                                                            className="btn-ghost"
                                                            style={{ padding: 4, color: "var(--danger)" }}
                                                            onClick={() => handleDelete(user._id, user.email)}
                                                            title="Eliminar Cuenta Definitivamente"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
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

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
                        <div className="modal-header">
                            <h3>Añadir Nuevo Usuario</h3>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowInviteModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div style={{ textAlign: "center", marginBottom: 20 }}>
                                <div style={{ background: "var(--bg-secondary)", width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--primary)" }}>
                                    <Shield size={32} />
                                </div>
                                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Proceso de Registro Seguro</h4>
                                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                                    Para proteger el sistema, cada usuario debe establecer su propia contraseña directamente en la página de inicio.
                                </p>
                            </div>

                            <hr style={{ border: "none", borderTop: "1px solid var(--border-color)", margin: "20px 0" }} />

                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                <div style={{ display: "flex", gap: 12 }}>
                                    <div style={{ background: "var(--primary-light)", color: "var(--primary-dark)", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>1</div>
                                    <p style={{ margin: 0, fontSize: 14, color: "var(--text-primary)" }}>
                                        <button className="btn-ghost" onClick={copyInviteLink} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 6px", color: "var(--primary)" }}>
                                            {copied ? <Check size={14} /> : <Copy size={14} />} Copiar enlace de inicio
                                        </button>
                                        y envíalo al nuevo empleado.
                                    </p>
                                </div>
                                <div style={{ display: "flex", gap: 12 }}>
                                    <div style={{ background: "var(--primary-light)", color: "var(--primary-dark)", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>2</div>
                                    <p style={{ margin: 0, fontSize: 14, color: "var(--text-primary)" }}>
                                        El empleado hará clic en <b>Registrarse</b>, llenará sus datos y creará su contraseña personal.
                                    </p>
                                </div>
                                <div style={{ display: "flex", gap: 12 }}>
                                    <div style={{ background: "var(--primary-light)", color: "var(--primary-dark)", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>3</div>
                                    <p style={{ margin: 0, fontSize: 14, color: "var(--text-primary)" }}>
                                        Su cuenta aparecerá automáticamente en la sección superior de <b>Aprobaciones Pendientes</b> para que tú valides su acceso final.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={() => setShowInviteModal(false)} style={{ width: "100%" }}>
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {editModalOpen && editUser && (
                <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 450 }}>
                        <div className="modal-header">
                            <h3>Editar Usuario</h3>
                            <button className="btn btn-ghost btn-sm" onClick={() => setEditModalOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate}>
                            <div className="modal-body">
                                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
                                    Usuario: <strong>{editUser.email}</strong>
                                </p>

                                <div className="form-group">
                                    <label className="form-label">Nombre Completo</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Rol de Acceso</label>
                                    <select
                                        className="form-select"
                                        value={editForm.role}
                                        onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                        disabled={currentUser?.role !== "admin"} // Only Admins can edit roles
                                    >
                                        <option value="advisor">Asesor Comercial</option>
                                        <option value="supervisor">Supervisor Ejecutivo</option>
                                        <option value="admin">Administrador SuperUser</option>
                                    </select>
                                    {currentUser?.role !== "admin" && (
                                        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Solo los administradores pueden cambiar roles.</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Sucursal / Agencia</label>
                                    <select
                                        className="form-select"
                                        value={editForm.branchName}
                                        onChange={e => setEditForm({ ...editForm, branchName: e.target.value })}
                                    >
                                        <option value="">Oficina Central (Sin asignar)</option>
                                        {branches?.map(b => (
                                            <option key={b._id} value={b.name}>{b.name} ({b.city})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setEditModalOpen(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
