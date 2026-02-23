import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

export const getSettings = query({
    args: {},
    handler: async (ctx) => {
        const settings = await ctx.db.query("appSettings").order("desc").first();
        return settings || null;
    }
});

export const updateLogo = mutation({
    args: {
        storageId: v.id("_storage"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("No autenticado");

        const currentUser = await ctx.db.get(userId) as any;
        if (currentUser?.role !== "admin") {
            throw new Error("No tienes permisos para modificar la configuración.");
        }

        const logoUrl = await ctx.storage.getUrl(args.storageId);
        if (!logoUrl) throw new Error("Error obteniendo URL de la imagen.");

        const currentSettings = await ctx.db.query("appSettings").order("desc").first();

        if (currentSettings) {
            // Delete old logo from storage if it exists
            if (currentSettings.logoStorageId) {
                await ctx.storage.delete(currentSettings.logoStorageId);
            }

            await ctx.db.patch(currentSettings._id, {
                logoUrl,
                logoStorageId: args.storageId,
            });
        } else {
            await ctx.db.insert("appSettings", {
                logoUrl,
                logoStorageId: args.storageId,
            });
        }

        await ctx.db.insert("auditLog", {
            userId: currentUser._id,
            action: "UPDATE_LOGO",
            details: `Logo de la aplicación actualizado.`,
            timestamp: Date.now(),
        });

        return { success: true, logoUrl };
    }
});
