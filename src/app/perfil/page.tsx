"use client";

import { useState } from "react";
import { useMimsAuth } from "@/components/AppShell";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Lock, User, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";

export default function PerfilPage() {
    const { user, isAuthenticated } = useMimsAuth();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const changePassword = useMutation(api.auth.changePassword);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError("Las contraseñas nuevas no coinciden.");
            return;
        }

        if (newPassword.length < 6) {
            setError("La nueva contraseña debe tener al menos 6 caracteres.");
            return;
        }

        if (!isAuthenticated) {
            setError("Error de sesión. Por favor inicia sesión nuevamente.");
            return;
        }

        setLoading(true);
        try {
            await changePassword({
                // Note: Convex Auth handles the session securely via cookies automatically.
                currentPassword,
                newPassword,
            });
            setSuccess("Contraseña actualizada exitosamente.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setError(err.message || "Error al cambiar la contraseña");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <>
            <div className="page-header">
                <h2>Mi Perfil</h2>
                <p>Gestiona tu cuenta y seguridad</p>
            </div>

            <div className="page-body fade-in">
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
                    {/* User Info Card */}
                    <div className="card" style={{ flex: 1, minWidth: 300 }}>
                        <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <User size={18} /> Información Personal
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
                            <div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Nombre completo</div>
                                <div style={{ fontWeight: 500 }}>{user.name}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Correo electrónico</div>
                                <div>{user.email}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Rol / Permisos</div>
                                <span className={`badge ${user.role === "admin" ? "brand-jac" : "brand-corp"}`}>
                                    {user.role}
                                </span>
                            </div>
                            {user.branchName && (
                                <div>
                                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Sucursal Asignada</div>
                                    <div>{user.branchName}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Change Password Card */}
                    <div className="card" style={{ flex: 2, minWidth: 300 }}>
                        <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <KeyRound size={18} /> Cambiar Contraseña
                        </h3>

                        {error && (
                            <div className="login-error" style={{ marginTop: 20 }}>
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="login-error" style={{ marginTop: 20, backgroundColor: "var(--success-light)", color: "var(--success-dark)", borderLeftColor: "var(--success)" }}>
                                <CheckCircle2 size={16} />
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Contraseña actual</label>
                                <div style={{ position: "relative" }}>
                                    <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                        style={{ paddingLeft: 36 }}
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Nueva contraseña</label>
                                <div style={{ position: "relative" }}>
                                    <KeyRound size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        style={{ paddingLeft: 36 }}
                                    />
                                </div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Mínimo 6 caracteres</div>
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Confirmar nueva contraseña</label>
                                <div style={{ position: "relative" }}>
                                    <KeyRound size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        style={{ paddingLeft: 36 }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: 8 }}>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : "Actualizar Contraseña"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
