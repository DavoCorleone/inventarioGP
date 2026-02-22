import { mutation, internalMutation } from "./_generated/server";

export const clearAuthTables = internalMutation({
    args: {},
    handler: async (ctx) => {
        // Clear auth core tables to prevent sync issues after clearing "users" table manually
        const collections = [
            "authSessions",
            "authAccounts",
            "authRefreshTokens",
            "authVerificationCodes",
            "authVerifiers",
            "authRateLimits"
        ];
        for (const table of collections) {
            const items = await ctx.db.query(table as any).collect();
            for (const item of items) {
                await ctx.db.delete(item._id);
            }
        }
    },
});
