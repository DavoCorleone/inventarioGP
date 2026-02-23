"use client";

import { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import Sidebar from "./Sidebar";

// Export a specialized hook for MIMS user profile
export function useMimsAuth() {
    const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
    const { signOut } = useAuthActions();

    // The currently authenticated user from Convex Auth
    const user = useQuery(api.auth.getCurrentUser, isAuthenticated ? undefined : "skip");

    const isLoading = authLoading || (isAuthenticated && user === undefined);

    return {
        isAuthenticated,
        isLoading,
        user,
        logout: signOut,
    };
}

export function AppShell({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading, user, logout } = useMimsAuth();

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="spinner" style={{ width: 40, height: 40 }} />
                <p>Cargando MIMS...</p>
            </div>
        );
    }

    const currentUser = user as any;

    if (!isAuthenticated || !currentUser) {
        return <>{children}</>;
    }

    if (currentUser.approved === false) {
        return (
            <div className="login-page">
                <div className="login-card" style={{ textAlign: "center" }}>
                    <div className="login-logo-icon" style={{ margin: "0 auto 16px", background: "var(--warning)", color: "white" }}>⏳</div>
                    <h2>Cuenta en Revisión</h2>
                    <p style={{ marginTop: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                        Tu cuenta ha sido registrada existosamente pero está esperando la aprobación de un administrador del sistema para iniciar operaciones.
                    </p>
                    <button className="btn btn-outline" onClick={() => logout()} style={{ marginTop: 24, width: "100%", justifyContent: "center" }}>
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <Sidebar userName={currentUser.name || "Usuario"} userRole={currentUser.role || "asesor"} onLogout={logout} />
            <main className="main-content">{children}</main>
        </div>
    );
}
