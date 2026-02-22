import { convexAuth } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import Google from "@auth/core/providers/google";

export const { auth, signIn, signOut, store } = convexAuth({
    providers: [
        Google({
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    picture: profile.picture,
                };
            },
        }),
    ],
});

// Admin-only mutation to approve a pending user
export const approveUser = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("No autenticado");

        const currentUser = await ctx.db.get(userId) as any;
        if (currentUser?.role !== "admin") {
            throw new Error("No tienes permisos para aprobar usuarios.");
        }

        const userToApprove = await ctx.db.get(args.userId) as any;
        if (!userToApprove) throw new Error("Usuario no encontrado.");

        await ctx.db.patch(args.userId, { approved: true });

        // Audit log
        await ctx.db.insert("auditLog", {
            userId: currentUser._id,
            action: "APPROVE_USER",
            details: `Aprobado acceso para ${userToApprove.email || "Usuario sin correo"}`,
            timestamp: Date.now(),
        });

        return { success: true };
    },
});

// Admin-only mutation to reject (delete or block) a pending user
export const rejectUser = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("No autenticado");

        const currentUser = await ctx.db.get(userId) as any;
        if (currentUser?.role !== "admin") {
            throw new Error("No tienes permisos para rechazar usuarios.");
        }

        const userToReject = await ctx.db.get(args.userId) as any;
        if (!userToReject) throw new Error("Usuario no encontrado.");

        // We delete the unapproved account to keep the DB clean
        await ctx.db.delete(args.userId);

        // Audit log
        await ctx.db.insert("auditLog", {
            userId: currentUser._id,
            action: "REJECT_USER",
            details: `Rechazado y eliminado ${userToReject.email || "Usuario sin correo"}`,
            timestamp: Date.now(),
        });

        return { success: true };
    },
});

export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return null;

        const user = await ctx.db.get(userId) as any;
        if (!user) return null;

        return {
            ...user,
            id: user._id,
        };
    },
});

// Staging a user before Magic Link registration
export const createPendingUser = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        role: v.union(v.literal("admin"), v.literal("supervisor"), v.literal("advisor")),
        branchId: v.id("branches"),
    },
    handler: async (ctx, args) => {
        // Check if user already exists
        const existing = await ctx.db
            .query("users")
            .withIndex("email", (q) => q.eq("email", args.email))
            .first();

        if (existing) {
            throw new Error("El correo ya está registrado.");
        }

        // Insert pending user. Convex Auth will link to this via email when they click the Magic Link
        await ctx.db.insert("users", {
            name: args.name,
            email: args.email,
            role: args.role,
            branchId: args.branchId,
            approved: false, // Requires admin approval
        });

        return { success: true };
    },
});

export const listUsers = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return [];

        const users = await ctx.db.query("users").collect();
        // Return active users
        return users.filter((u: any) => u.approved !== false).map((u: any) => ({
            ...u,
            id: u._id,
            loginMode: "magic_link",
        }));
    },
});

export const listPendingUsers = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return [];

        const currentUser = await ctx.db.get(userId) as any;
        if (currentUser?.role !== "admin") return [];

        const pending = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("approved"), false))
            .collect();

        return pending.map((u: any) => ({
            ...u,
            id: u._id,
        }));
    },
});

// Deprecated for Magic links, but kept for UI compatibility if needed temporarily
export const changePassword = mutation({
    args: { currentPassword: v.string(), newPassword: v.string() },
    handler: async () => {
        throw new Error("El cambio de contraseña no aplica para cuentas gestionadas por Magic Links. Utiliza la opción de olvidé mi contraseña de ser necesario.");
    },
});
