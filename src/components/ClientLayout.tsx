"use client";

import { AppContent } from "@/components/LoginPage";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <AppContent>{children}</AppContent>
    );
}
