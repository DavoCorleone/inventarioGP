import { mutation } from "./_generated/server";
import { auth } from "./auth";

export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("No autenticado");

        const currentUser = await ctx.db.get(userId) as any;
        if (currentUser?.role !== "admin") {
            throw new Error("Solo los administradores pueden subir archivos de configuración.");
        }

        // Return a short-lived upload URL
        return await ctx.storage.generateUploadUrl();
    },
});
