import { mutation } from "./_generated/server";

export const execute = mutation({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").filter(q => q.eq(q.field("email"), "info@automotorescarlospalacios.com")).collect();
        let changed = 0;
        for (const u of users) {
            await ctx.db.patch(u._id, { approved: true, role: "admin" });
            changed++;
        }
        return `Aprobados ${changed} usuarios`;
    }
});
