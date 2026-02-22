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

    // Require an approved user role to show the internal app shell
    const currentUser = user as any;
    if (!isAuthenticated || !currentUser || !currentUser.approved) {
        return <>{children}</>;
    }

    return (
        <div className="app-layout">
            <Sidebar userName={currentUser.name || "Usuario"} userRole={currentUser.role || "asesor"} onLogout={logout} />
            <main className="main-content">{children}</main>
        </div>
    );
}
