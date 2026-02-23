import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ==========================================
// Pack Management
// ==========================================
export const listPacks = query({
    args: { activeOnly: v.optional(v.boolean()) },
    handler: async (ctx, args) => {
        let q;
        if (args.activeOnly) {
            q = ctx.db.query("packs").withIndex("by_active", (idx) => idx.eq("active", true));
        } else {
            q = ctx.db.query("packs");
        }

        const packs = await q.collect();

        return Promise.all(
            packs.map(async (pack) => {
                const items = await ctx.db
                    .query("packItems")
                    .withIndex("by_pack", (idx) => idx.eq("packId", pack._id))
                    .collect();

                const enrichedItems = await Promise.all(
                    items.map(async (item) => {
                        const product = await ctx.db.get(item.productId);
                        return {
                            ...item,
                            productName: product?.name ?? "Eliminado",
                            productSku: product?.sku ?? "N/A",
                            currentStock: product?.stock ?? 0,
                        };
                    })
                );

                return {
                    ...pack,
                    items: enrichedItems,
                    itemCount: items.length,
                };
            })
        );
    },
});

export const createPack = mutation({
    args: {
        name: v.string(),
        description: v.string(),
        brand: v.union(v.literal("JAC"), v.literal("Jetour"), v.literal("Karry"), v.literal("Corp")),
        active: v.boolean(),
        items: v.array(
            v.object({
                productId: v.id("products"),
                quantity: v.number(),
            })
        ),
    },
    handler: async (ctx, args) => {
        const packId = await ctx.db.insert("packs", {
            name: args.name,
            description: args.description,
            brand: args.brand,
            active: args.active,
        });

        for (const item of args.items) {
            await ctx.db.insert("packItems", {
                packId,
                productId: item.productId,
                quantity: item.quantity,
            });
        }

        await ctx.db.insert("auditLog", {
            action: "create_pack",
            details: `Pack creado: ${args.name} con ${args.items.length} items`,
            entityType: "packs",
            entityId: packId,
            timestamp: Date.now(),
        });

        return packId;
    },
});

export const updatePack = mutation({
    args: {
        id: v.id("packs"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        active: v.optional(v.boolean()),
        items: v.optional(
            v.array(
                v.object({
                    productId: v.id("products"),
                    quantity: v.number(),
                })
            )
        ),
    },
    handler: async (ctx, args) => {
        const { id, items, ...updates } = args;
        const cleanUpdates: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) cleanUpdates[key] = value;
        }
        await ctx.db.patch(id, cleanUpdates);

        // If items are provided, replace the entire BOM list for this pack
        if (items !== undefined) {
            const existingItems = await ctx.db
                .query("packItems")
                .withIndex("by_pack", (q) => q.eq("packId", id))
                .collect();

            for (const item of existingItems) {
                await ctx.db.delete(item._id);
            }

            for (const item of items) {
                await ctx.db.insert("packItems", {
                    packId: id,
                    productId: item.productId,
                    quantity: item.quantity,
                });
            }
        }
    },
});

export const getPackItems = query({
    args: { packId: v.id("packs") },
    handler: async (ctx, args) => {
        const items = await ctx.db
            .query("packItems")
            .withIndex("by_pack", (q) => q.eq("packId", args.packId))
            .collect();

        return Promise.all(
            items.map(async (item) => {
                const product = await ctx.db.get(item.productId);
                return {
                    ...item,
                    productName: product?.name ?? "Eliminado",
                    productSku: product?.sku ?? "N/A",
                    currentStock: product?.stock ?? 0,
                    minStock: product?.minStock ?? 0,
                };
            })
        );
    },
});
