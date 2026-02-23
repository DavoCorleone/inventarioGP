import type { Metadata } from "next";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "MIMS — Marketing Inventory Management | Grupo Palacios",
  description:
    "Sistema de gestión de inventario de marketing para Grupo Palacios Ecuador. Administra activos de merchandising JAC, Jetour y Karry.",
  keywords: "inventario, marketing, Grupo Palacios, JAC, Jetour, Karry, Ambato, Ecuador",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ConvexClientProvider>
          <ClientLayout>{children}</ClientLayout>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
