"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Mail, AlertCircle } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

function LoginForm() {
    const { signIn } = useAuthActions();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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

                <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24 }}>
                        Para acceder al sistema MIMS de Grupo Palacios, inicia sesión con tu cuenta corporativa.
                    </p>

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={async () => {
                            setError("");
                            setLoading(true);
                            try {
                                await signIn("google");
                            } catch (err: any) {
                                setError(err.message || "Error al iniciar sesión con Google");
                                setLoading(false);
                            }
                        }}
                        disabled={loading}
                        style={{ width: "100%", padding: "12px", fontSize: 16, display: "flex", justifyContent: "center", alignItems: "center", gap: 10, backgroundColor: "#fff", color: "#333", border: "1px solid #ccc", borderRadius: "var(--radius-md)" }}
                    >
                        {loading ? (
                            <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderColor: "#333", borderTopColor: "transparent" }} />
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-1 7.28-2.69l-3.57-2.77c-.99.69-2.26 1.1-3.71 1.1-2.87 0-5.3-1.94-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.11c-.22-.69-.35-1.43-.35-2.11s.13-1.42.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335" />
                            </svg>
                        )}
                        <span>Continuar con Google</span>
                    </button>
                </div>

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
