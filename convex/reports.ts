// Reports module — runs in Convex V8 runtime
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// ==========================================
// Reports — Audit Export Data Generator
// ==========================================

export const generateAuditReport = action({
    args: {
        startDate: v.number(),
        endDate: v.number(),
        brand: v.optional(
            v.union(v.literal("JAC"), v.literal("Jetour"), v.literal("Karry"), v.literal("Corp"))
        ),
        branchId: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<any> => {
        // Fetch all withdrawals
        const withdrawals: any[] = await ctx.runQuery(api.inventory.listWithdrawals, {});

        // Filter by date range
        const filtered: any[] = withdrawals.filter((w: any) => {
            if (w.timestamp < args.startDate || w.timestamp > args.endDate) return false;
            return true;
        });

        // Fetch all products for brand filtering
        const products = await ctx.runQuery(api.inventory.listProducts, {
            brand: args.brand,
        });
        const productIds = new Set(products.map((p: any) => p._id));

        // Build report rows
        const rows = [];
        for (const w of filtered) {
            for (const item of w.items) {
                // If brand filter is set, skip items not from that brand
                if (args.brand && !productIds.has(item.productId)) continue;

                rows.push({
                    fecha: new Date(w.timestamp).toISOString().split("T")[0],
                    hora: new Date(w.timestamp).toLocaleTimeString("es-EC"),
                    sucursal: w.branchName,
                    usuario: w.userName,
                    autorizador: w.authorizerName || "N/A",
                    razon: w.reason,
                    producto: item.productName,
                    sku: item.productSku,
                    cantidad: item.quantity,
                    estado: w.status,
                    notas: w.notes || "",
                });
            }
        }

        // Summary stats
        const totalWithdrawals = filtered.length;
        const totalItems = rows.reduce((sum: number, r: any) => sum + r.cantidad, 0);
        const byReason: Record<string, number> = {};
        for (const w of filtered) {
            // Remove accents and special chars from keys to prevent Convex validation errors
            const safeKey = w.reason.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9 ]/g, "");
            byReason[safeKey] = (byReason[safeKey] || 0) + 1;
        }

        return {
            generatedAt: new Date().toISOString(),
            dateRange: {
                start: new Date(args.startDate).toISOString().split("T")[0],
                end: new Date(args.endDate).toISOString().split("T")[0],
            },
            filters: {
                brand: args.brand || "Todas",
                branch: args.branchId || "Todas",
            },
            summary: {
                totalWithdrawals,
                totalItems,
                byReason,
            },
            rows,
        };
    },
});
