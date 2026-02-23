"use client";

import { AppContent } from "@/components/LoginPage";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const settings = useQuery(api.appSettings.getSettings);

    useEffect(() => {
        if (settings) {
            if (settings.appName) {
                document.title = settings.appName;
            } else {
                document.title = "MIMS — Marketing Inventory Management";
            }
            if (settings.faviconUrl) {
                let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
                if (!link) {
                    link = document.createElement('link');
                    link.rel = 'icon';
                    document.head.appendChild(link);
                }
                link.href = settings.faviconUrl;
            }
        }
    }, [settings]);

    // Safely cast CSS variables to React.CSSProperties
    const dynamicStyles = settings?.colors ? {
        "--jac-red": settings.colors.primary,
        "--jac-red-dark": settings.colors.primary,
        "--bg-sidebar": settings.colors.sidebarBg,
        "--text-inverse": settings.colors.sidebarText,
    } as React.CSSProperties : {};

    return (
        <div style={{ display: "contents", ...dynamicStyles }}>
            <AppContent>
                {children}
            </AppContent>
        </div>
    );
}
