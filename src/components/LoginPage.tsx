"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Mail, AlertCircle } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

function LoginForm() {
    const { signIn } = useAuthActions();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState("");
    const [role, setRole] = useState("advisor");
    const [branchId, setBranchId] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const branches = useQuery(api.branches.listBranches);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        setLoading(true);
        try {
            if (isRegistering) {
                if (!branchId) throw new Error("Selecciona una sucursal");
                // Custom user creation mapped by Password provider
                await signIn("password", {
                    email,
                    password,
                    flow: "signUp",
                    name,
                    role,
                    branchId,
                });
                setSuccessMsg("¡Registro exitoso! Tu cuenta está pendiente de aprobación.");
                setIsRegistering(false);
            } else {
                // Standard Password login
                await signIn("password", { email, password, flow: "signIn" });
            }
        } catch (err: any) {
            setError(err.message || "Credenciales incorrectas");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <div className="login-logo-icon">GP</div>
                    <h2>MIMS</h2>
                    <p>Marketing Inventory Management System</p>
                </div>

                {error && (
                    <div className="login-error">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}
                {successMsg && (
                    <div className="login-error" style={{ backgroundColor: "var(--success-light)", color: "var(--success-dark)", borderLeftColor: "var(--success)" }}>
                        <AlertCircle size={16} />
                        {successMsg}
                    </div>
                )}

                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                    <button type="button" className={`btn ${!isRegistering ? "btn-primary" : "btn-outline"}`} style={{ flex: 1 }} onClick={() => { setIsRegistering(false); setError(""); }}>Entrar</button>
                    <button type="button" className={`btn ${isRegistering ? "btn-primary" : "btn-outline"}`} style={{ flex: 1 }} onClick={() => { setIsRegistering(true); setError(""); }}>Registrarse</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {isRegistering && (
                        <>
                            <div className="form-group">
                                <label className="form-label">Nombre completo</label>
                                <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Rol</label>
                                <select className="form-input" value={role} onChange={(e) => setRole(e.target.value)}>
                                    <option value="advisor">Asesor Comercial</option>
                                    <option value="supervisor">Supervisor</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Sucursal</label>
                                <select className="form-input" value={branchId} onChange={(e) => setBranchId(e.target.value)} required>
                                    <option value="">Selecciona sucursal...</option>
                                    {branches?.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                </select>
                            </div>
                        </>
                    )}
                    <div className="form-group">
                        <label className="form-label">Correo electrónico</label>
                        <div style={{ position: "relative" }}>
                            <Mail
                                size={18}
                                style={{
                                    position: "absolute",
                                    left: 12,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "var(--text-muted)",
                                }}
                            />
                            <input
                                type="email"
                                className="form-input"
                                placeholder="usuario@grupopalacios.ec"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ paddingLeft: 40 }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contraseña</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: "100%", marginTop: 12, justifyContent: "center" }}
                    >
                        {loading ? <span className="spinner" /> : (isRegistering ? "Crear cuenta" : "Iniciar Sesión")}
                    </button>
                </form>

                <div
                    style={{
                        textAlign: "center",
                        marginTop: 24,
                        paddingTop: 20,
                        borderTop: "1px solid var(--border-color)",
                    }}
                >
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        Grupo Palacios — JAC · Jetour · Karry
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                        Ambato · Latacunga · Ecuador
                    </p>
                </div>
            </div>
        </div>
    );
}

function SeedButton() {
    const seedAll = useMutation(api.seed.seedAll);
    const [seeding, setSeeding] = useState(false);
    const [result, setResult] = useState("");

    return (
        <div style={{ textAlign: "center", marginTop: 16 }}>
            <button
                className="btn btn-outline btn-sm"
                onClick={async () => {
                    setSeeding(true);
                    try {
                        const r = await seedAll();
                        setResult(r.message);
                    } catch (e: any) {
                        setResult(e.message);
                    } finally {
                        setSeeding(false);
                    }
                }}
                disabled={seeding}
            >
                {seeding ? "Cargando datos..." : "🌱 Inicializar datos de ejemplo"}
            </button>
            {result && (
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>{result}</p>
            )}
        </div>
    );
}

import { useConvexAuth } from "convex/react";

function AppContent({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useConvexAuth();
    if (!isAuthenticated) {
        return (
            <>
                <LoginForm />
                <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100 }}>
                    <SeedButton />
                </div>
            </>
        );
    }
    return <AppShell>{children}</AppShell>;
}

export { AppContent, LoginForm, SeedButton };
