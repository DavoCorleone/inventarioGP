"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Package,
    ArrowDownToLine,
    Building2,
    Users,
    Brain,
    Boxes,
    LogOut,
    Menu,
    X,
    FileSpreadsheet,
    Settings,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";



interface SidebarProps {
    userName?: string;
    userRole?: string;
    onLogout?: () => void;
}

export default function Sidebar({ userName = "Admin", userRole = "admin", onLogout }: SidebarProps) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const settings = useQuery(api.appSettings.getSettings);

    const NAV_ITEMS = [
        {
            section: "Principal",
            items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard }],
        },
        {
            section: "Operaciones",
            items: [
                { label: "Inventario", href: "/inventario", icon: Package },
                { label: "Retiros", href: "/retiros", icon: ArrowDownToLine },
                { label: "Packs", href: "/packs", icon: Boxes },
            ],
        },
        {
            section: "Administración",
            items: [
                { label: "Sucursales", href: "/sucursales", icon: Building2 },
                { label: "Usuarios", href: "/usuarios", icon: Users },
                { label: "Reportes", href: "/reportes", icon: FileSpreadsheet },
                ...(userRole === "admin" ? [{ label: "Configuración", href: "/configuracion", icon: Settings }] : []),
            ],
        },
        {
            section: "Inteligencia",
            items: [{ label: "AI Insights", href: "/ai", icon: Brain }],
        },
    ];

    const initials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <>
            {/* Mobile toggle */}
            <button
                className="btn-ghost"
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{
                    position: "fixed",
                    top: 16,
                    left: 16,
                    zIndex: 60,
                    display: "none",
                }}
                id="mobile-menu-toggle"
            >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        {settings?.logoUrl ? (
                            <img src={settings.logoUrl} alt="Logo" style={{ maxHeight: 40, maxWidth: "100%", objectFit: "contain", flexShrink: 0 }} />
                        ) : (
                            <div className="sidebar-brand-logo">GP</div>
                        )}
                        <div>
                            <h1>MIMS</h1>
                            <p>Grupo Palacios</p>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map((section) => (
                        <div key={section.section} className="sidebar-section">
                            <div className="sidebar-section-title">{section.section}</div>
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`sidebar-link ${isActive ? "active" : ""}`}
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <Icon size={20} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-user-avatar">{initials}</div>
                        <div className="sidebar-user-info">
                            <Link href="/perfil" className="sidebar-user-name" style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}>
                                {userName}
                            </Link>
                            <div className="sidebar-user-role">{userRole}</div>
                        </div>
                        {onLogout && (
                            <button
                                className="btn-ghost"
                                onClick={onLogout}
                                title="Cerrar sesión"
                                style={{ padding: 6 }}
                            >
                                <LogOut size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0,0,0,0.5)",
                        zIndex: 45,
                    }}
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </>
    );
}
