import { mutation, internalMutation } from "./_generated/server";

export const clearOldFields = internalMutation({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();
        for (const user of users) {
            const updates: any = {};
            if ("loginMode" in user) updates.loginMode = undefined;
            if ("passwordHash" in user) updates.passwordHash = undefined;
            if ("sessionToken" in user) updates.sessionToken = undefined;
            if ("sessionExpiry" in user) updates.sessionExpiry = undefined;

            if (Object.keys(updates).length > 0) {
                await ctx.db.patch(user._id, updates);
            }
        }
    },
});
