import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ==========================================
// Branch Management
// ==========================================
export const listBranches = query({
    args: {},
    handler: async (ctx) => {
        const branches = await ctx.db.query("branches").collect();
        return Promise.all(
            branches.map(async (b) => {
                const manager = b.managerId ? await ctx.db.get(b.managerId) : null;
                return {
                    ...b,
                    managerName: manager?.name ?? "Sin asignar",
                };
            })
        );
    },
});

export const createBranch = mutation({
    args: {
        name: v.string(),
        locationDetails: v.string(),
        city: v.string(),
        active: v.boolean(),
        managerId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("branches", {
            ...args,
        });
    },
});

export const updateBranch = mutation({
    args: {
        id: v.id("branches"),
        name: v.optional(v.string()),
        locationDetails: v.optional(v.string()),
        city: v.optional(v.string()),
        managerId: v.optional(v.id("users")),
        active: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const cleanUpdates: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) cleanUpdates[key] = value;
        }
        await ctx.db.patch(id, cleanUpdates);
    },
});
