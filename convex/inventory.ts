import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { auth } from "./auth";

// ==========================================
// Product Management
// ==========================================
export const listProducts = query({
    args: {
        brand: v.optional(
            v.union(v.literal("JAC"), v.literal("Jetour"), v.literal("Karry"), v.literal("Corp"))
        ),
        category: v.optional(
            v.union(v.literal("Merchandising"), v.literal("Exhibición"), v.literal("Oficina"))
        ),
    },
    handler: async (ctx, args) => {
        let q: any = ctx.db.query("products");

        if (args.brand) {
            q = ctx.db.query("products").withIndex("by_brand", (idx: any) => idx.eq("brand", args.brand!));
        } else if (args.category) {
            q = ctx.db
                .query("products")
                .withIndex("by_category", (idx: any) => idx.eq("category", args.category!));
        }

        return await q.collect();
    },
});

export const getProductBySku = query({
    args: { sku: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("products")
            .withIndex("by_sku", (q) => q.eq("sku", args.sku))
            .first();
    },
});

export const createProduct = mutation({
    args: {
        sku: v.string(),
        name: v.string(),
        brand: v.union(v.literal("JAC"), v.literal("Jetour"), v.literal("Karry"), v.literal("Corp")),
        category: v.union(
            v.literal("Merchandising"),
            v.literal("Exhibición"),
            v.literal("Oficina")
        ),
        stock: v.number(),
        minStock: v.number(),
        description: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("products")
            .withIndex("by_sku", (q) => q.eq("sku", args.sku))
            .first();

        if (existing) {
            throw new Error(`Ya existe un producto con SKU: ${args.sku}`);
        }

        const productId = await ctx.db.insert("products", {
            ...args,
        });

        await ctx.db.insert("auditLog", {
            action: "create_product",
            details: `Producto creado: ${args.name} (${args.sku})`,
            entityType: "products",
            entityId: productId,
            timestamp: Date.now(),
        });

        return productId;
    },
});

export const updateProduct = mutation({
    args: {
        id: v.id("products"),
        name: v.optional(v.string()),
        stock: v.optional(v.number()),
        minStock: v.optional(v.number()),
        description: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const product = await ctx.db.get(id);
        if (!product) throw new Error("Producto no encontrado.");

        const cleanUpdates: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) cleanUpdates[key] = value;
        }

        await ctx.db.patch(id, cleanUpdates);

        // Check stock alarm after update
        if (updates.stock !== undefined) {
            const minStock = updates.minStock ?? product.minStock;
            if (updates.stock <= minStock) {
                const existingAlert = await ctx.db
                    .query("alerts")
                    .withIndex("by_product", (q) => q.eq("productId", id))
                    .filter((q) => q.eq(q.field("resolved"), false))
                    .first();

                if (!existingAlert) {
                    await ctx.db.insert("alerts", {
                        productId: id,
                        type: updates.stock === 0 ? "out_of_stock" : "low_stock",
                        message: `${product.name}: Stock actual ${updates.stock}, mínimo ${minStock}`,
                        resolved: false,
                        createdAt: Date.now(),
                    });
                }
            }
        }

        await ctx.db.insert("auditLog", {
            action: "update_product",
            details: `Producto actualizado: ${product.name}`,
            entityType: "products",
            entityId: id,
            timestamp: Date.now(),
        });
    },
});

export const deleteProduct = mutation({
    args: { id: v.id("products") },
    handler: async (ctx, args) => {
        const product = await ctx.db.get(args.id);
        if (!product) throw new Error("Producto no encontrado.");

        await ctx.db.delete(args.id);

        await ctx.db.insert("auditLog", {
            action: "delete_product",
            details: `Producto eliminado: ${product.name} (${product.sku})`,
            entityType: "products",
            entityId: args.id,
            timestamp: Date.now(),
        });
    },
});

// ==========================================
// BOM Atomic Transaction — Register Withdrawal
// ==========================================
export const registerWithdrawal = mutation({
    args: {
        branchId: v.id("branches"),
        reason: v.union(
            v.literal("Entrega"),
            v.literal("Feria"),
            v.literal("Obsequio"),
            v.literal("Activación Mall"),
            v.literal("Reposición Sucursal"),
            v.literal("Evento Corporativo"),
            v.literal("Otro")
        ),
        notes: v.optional(v.string()),
        authorizedById: v.optional(v.id("users")),
        // Can contain individual products and/or packs
        items: v.array(
            v.object({
                productId: v.optional(v.id("products")),
                packId: v.optional(v.id("packs")),
                quantity: v.number(),
            })
        ),
    },
    handler: async (ctx, args) => {
        // 1. Authenticate user
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("No autenticado.");
        const user = await ctx.db.get(userId);
        if (!user || user.approved === false) throw new Error("Cuenta no aprobada o inactiva.");

        // 2. Expand BOM — resolve packs into individual items
        const expandedItems: {
            productId: typeof args.items[0]["productId"];
            quantity: number;
            fromPack?: typeof args.items[0]["packId"];
        }[] = [];

        for (const item of args.items) {
            if (item.packId) {
                // Expand pack into BOM components
                const pack = await ctx.db.get(item.packId);
                if (!pack || !pack.active) {
                    throw new Error(`Pack no encontrado o inactivo.`);
                }

                const packItems = await ctx.db
                    .query("packItems")
                    .withIndex("by_pack", (q) => q.eq("packId", item.packId!))
                    .collect();

                for (const pi of packItems) {
                    expandedItems.push({
                        productId: pi.productId,
                        quantity: pi.quantity * item.quantity,
                        fromPack: item.packId,
                    });
                }
            } else if (item.productId) {
                expandedItems.push({
                    productId: item.productId,
                    quantity: item.quantity,
                });
            }
        }

        if (expandedItems.length === 0) {
            throw new Error("No se seleccionaron productos para el retiro.");
        }

        // 3. Authorization check for Exhibición (permanent display assets)
        const productsToCheck = await Promise.all(
            expandedItems.map(async (item) => {
                const product = await ctx.db.get(item.productId!);
                if (!product) throw new Error("Producto no encontrado en el sistema.");
                return { ...item, product };
            })
        );

        const hasPOPPermanente = productsToCheck.some(
            (p) => p.product.category === "Exhibición"
        );

        if (hasPOPPermanente) {
            if (!args.authorizedById) {
                throw new Error(
                    "Los artículos de Exhibición requieren autorización de un Supervisor o Admin."
                );
            }
            const authorizer = await ctx.db.get(args.authorizedById);
            if (
                !authorizer ||
                !["admin", "supervisor"].includes(authorizer.role || "")
            ) {
                throw new Error(
                    "Autorización denegada. Solo un Supervisor o Admin puede aprobar este retiro."
                );
            }
        }

        // 4. Verify stock for ALL items before deducting
        for (const item of productsToCheck) {
            if (item.product.stock < item.quantity) {
                throw new Error(
                    `Stock insuficiente para "${item.product.name}": disponible ${item.product.stock}, solicitado ${item.quantity}. Transacción cancelada.`
                );
            }
        }

        // 5. Atomic deduction — all or nothing (within the same mutation = ACID)
        const withdrawalItems: {
            productId: any;
            quantity: number;
            fromPack?: any;
        }[] = [];

        for (const item of productsToCheck) {
            const newStock = item.product.stock - item.quantity;
            await ctx.db.patch(item.productId!, { stock: newStock });

            withdrawalItems.push({
                productId: item.productId!,
                quantity: item.quantity,
                fromPack: item.fromPack,
            });

            // 6. Stock alarm check
            if (newStock <= item.product.minStock) {
                const existingAlert = await ctx.db
                    .query("alerts")
                    .withIndex("by_product", (q) => q.eq("productId", item.productId!))
                    .filter((q) => q.eq(q.field("resolved"), false))
                    .first();

                if (!existingAlert) {
                    await ctx.db.insert("alerts", {
                        productId: item.productId!,
                        type: newStock === 0 ? "out_of_stock" : "low_stock",
                        message: `${item.product.name}: Stock ${newStock}/${item.product.minStock}`,
                        resolved: false,
                        createdAt: Date.now(),
                    });
                }
            }
        }

        // 7. Record withdrawal
        const withdrawalId = await ctx.db.insert("withdrawals", {
            userId: user._id,
            authorizedById: args.authorizedById,
            branchId: args.branchId,
            items: withdrawalItems,
            reason: args.reason,
            notes: args.notes,
            status: "completed",
            timestamp: Date.now(),
        });

        // 8. Audit log
        await ctx.db.insert("auditLog", {
            userId: user._id,
            action: "NEW_WITHDRAWAL",
            details: `Retiro: ${withdrawalItems.length} items, razón: ${args.reason}`,
            entityType: "withdrawals",
            entityId: withdrawalId,
            timestamp: Date.now(),
        });

        return { withdrawalId, itemCount: withdrawalItems.length };
    },
});

export const revertWithdrawal = mutation({
    args: {
        withdrawalId: v.id("withdrawals"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("No autenticado.");
        const user = await ctx.db.get(userId);
        if (!user || user.approved === false) throw new Error("Cuenta no aprobada o inactiva.");

        const withdrawal = await ctx.db.get(args.withdrawalId);
        if (!withdrawal) throw new Error("Retiro no encontrado.");
        if (withdrawal.status === "reverted") throw new Error("Este retiro ya ha sido revertido.");

        // Revert stock for each item
        for (const item of withdrawal.items) {
            const product = await ctx.db.get(item.productId);
            if (product) {
                await ctx.db.patch(item.productId, { stock: product.stock + item.quantity });
            }
        }

        // Update withdrawal status
        await ctx.db.patch(args.withdrawalId, { status: "reverted" });

        // Audit log
        await ctx.db.insert("auditLog", {
            userId: user._id,
            action: "REVERT_WITHDRAWAL",
            details: `Retiro revertido: ${args.withdrawalId}`,
            entityType: "withdrawals",
            entityId: args.withdrawalId,
            timestamp: Date.now(),
        });
    },
});

// ==========================================
// Withdrawal Queries
// ==========================================
export const listWithdrawals = query({
    args: {
        branchId: v.optional(v.id("branches")),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let q;
        if (args.branchId) {
            q = ctx.db
                .query("withdrawals")
                .withIndex("by_branch", (idx) => idx.eq("branchId", args.branchId!));
        } else {
            q = ctx.db.query("withdrawals").withIndex("by_timestamp");
        }

        const withdrawals = await q.order("desc").take(args.limit ?? 50);

        return Promise.all(
            withdrawals.map(async (w) => {
                const user = await ctx.db.get(w.userId);
                const branch = await ctx.db.get(w.branchId);
                const authorizer = w.authorizedById
                    ? await ctx.db.get(w.authorizedById)
                    : null;

                const enrichedItems = await Promise.all(
                    w.items.map(async (item) => {
                        const product = await ctx.db.get(item.productId);
                        return {
                            ...item,
                            productName: product?.name ?? "Eliminado",
                            productSku: product?.sku ?? "N/A",
                        };
                    })
                );

                return {
                    ...w,
                    userName: user?.name ?? "Usuario eliminado",
                    branchName: branch?.name ?? "Sucursal eliminada",
                    authorizerName: authorizer?.name,
                    items: enrichedItems,
                };
            })
        );
    },
});

// ==========================================
// Alerts
// ==========================================
export const listAlerts = query({
    args: { resolved: v.optional(v.boolean()) },
    handler: async (ctx, args) => {
        let q;
        if (args.resolved !== undefined) {
            q = ctx.db
                .query("alerts")
                .withIndex("by_resolved", (idx) => idx.eq("resolved", args.resolved!));
        } else {
            q = ctx.db.query("alerts");
        }
        const alerts = await q.collect();

        return Promise.all(
            alerts.map(async (a) => {
                const product = await ctx.db.get(a.productId);
                return {
                    ...a,
                    productName: product?.name ?? "Producto eliminado",
                    productSku: product?.sku ?? "N/A",
                    productBrand: product?.brand,
                    currentStock: product?.stock,
                };
            })
        );
    },
});

export const resolveAlert = mutation({
    args: { alertId: v.id("alerts") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.alertId, { resolved: true });
    },
});

// ==========================================
// Dashboard Stats
// ==========================================
export const getDashboardStats = query({
    args: {},
    handler: async (ctx) => {
        const products = await ctx.db.query("products").collect();
        const alerts = await ctx.db
            .query("alerts")
            .withIndex("by_resolved", (q) => q.eq("resolved", false))
            .collect();
        const packs = await ctx.db
            .query("packs")
            .withIndex("by_active", (q) => q.eq("active", true))
            .collect();

        const totalProducts = products.length;
        const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
        const criticalProducts = products.filter((p) => p.stock === 0).length;
        const reorderProducts = products.filter(
            (p) => p.stock > 0 && p.stock <= p.minStock
        ).length;
        const optimalProducts = products.filter(
            (p) => p.stock > p.minStock
        ).length;

        const stockByBrand = {
            JAC: products
                .filter((p) => p.brand === "JAC")
                .reduce((sum, p) => sum + p.stock, 0),
            Jetour: products
                .filter((p) => p.brand === "Jetour")
                .reduce((sum, p) => sum + p.stock, 0),
            Karry: products
                .filter((p) => p.brand === "Karry")
                .reduce((sum, p) => sum + p.stock, 0),
            Corp: products
                .filter((p) => p.brand === "Corp")
                .reduce((sum, p) => sum + p.stock, 0),
        };

        return {
            totalProducts,
            totalStock,
            criticalProducts,
            reorderProducts,
            optimalProducts,
            activeAlerts: alerts.length,
            activePacks: packs.length,
            stockByBrand,
        };
    },
});

export const getWithdrawalsByReason = query({
    args: {},
    handler: async (ctx) => {
        const withdrawals = await ctx.db.query("withdrawals").collect();

        const byReason: Record<string, number> = {};
        for (const w of withdrawals) {
            byReason[w.reason] = (byReason[w.reason] || 0) + 1;
        }

        return Object.entries(byReason).map(([reason, count]) => ({
            reason,
            count,
        }));
    },
});

export const getWithdrawalsByBranch = query({
    args: {},
    handler: async (ctx) => {
        const withdrawals = await ctx.db.query("withdrawals").collect();
        const branches = await ctx.db.query("branches").collect();

        const byBranch: Record<string, number> = {};
        for (const w of withdrawals) {
            const branch = branches.find((b) => b._id === w.branchId);
            const name = branch?.name ?? "Desconocida";
            byBranch[name] = (byBranch[name] || 0) + 1;
        }

        return Object.entries(byBranch).map(([branch, count]) => ({
            branch,
            count,
        }));
    },
});
