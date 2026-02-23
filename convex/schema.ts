import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Users
  users: defineTable({
    name: v.optional(v.string()), // auth adds this implicitly but we keep it
    email: v.optional(v.string()), // auth adds this
    image: v.optional(v.string()), // auth adds this
    emailVerificationTime: v.optional(v.number()), // auth adds this
    phone: v.optional(v.string()), // auth adds this
    phoneVerificationTime: v.optional(v.number()), // auth adds this
    isAnonymous: v.optional(v.boolean()), // auth adds this

    // MIMS Custom Fields
    role: v.optional(v.union(v.literal("admin"), v.literal("supervisor"), v.literal("advisor"))),
    branchId: v.optional(v.id("branches")),
    approved: v.optional(v.boolean()), // Admin must approve before full access
    loginMode: v.optional(v.string()), // Auth provider tracking
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_role", ["role"])
    .index("by_branch", ["branchId"]),

  branches: defineTable({
    name: v.string(),
    locationDetails: v.string(),
    managerId: v.optional(v.id("users")),
    city: v.string(),
    active: v.boolean(),
  })
    .index("by_name", ["name"])
    .index("by_city", ["city"]),

  products: defineTable({
    sku: v.string(),
    name: v.string(),
    brand: v.union(
      v.literal("JAC"),
      v.literal("Jetour"),
      v.literal("Karry"),
      v.literal("Corp")
    ),
    category: v.union(
      v.literal("Merchandising"),
      v.literal("Exhibición"),
      v.literal("Oficina")
    ),
    stock: v.number(),
    minStock: v.number(),
    imageUrl: v.optional(v.string()),
    description: v.optional(v.string()),
  })
    .index("by_sku", ["sku"])
    .index("by_brand", ["brand"])
    .index("by_category", ["category"]),

  packs: defineTable({
    name: v.string(),
    description: v.string(),
    active: v.boolean(),
    brand: v.union(
      v.literal("JAC"),
      v.literal("Jetour"),
      v.literal("Karry"),
      v.literal("Corp")
    ),
  }).index("by_active", ["active"]),

  packItems: defineTable({
    packId: v.id("packs"),
    productId: v.id("products"),
    quantity: v.number(),
  }).index("by_pack", ["packId"]),

  withdrawals: defineTable({
    userId: v.id("users"),
    authorizedById: v.optional(v.id("users")),
    branchId: v.id("branches"),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
        fromPack: v.optional(v.id("packs")),
      })
    ),
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
    status: v.union(
      v.literal("completed"),
      v.literal("reverted")
    ),
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_branch", ["branchId"])
    .index("by_user", ["userId"])
    .index("by_reason", ["reason"]),

  aiInsights: defineTable({
    type: v.union(
      v.literal("prediction"),
      v.literal("nlq_response"),
      v.literal("marketing_copy"),
      v.literal("vision_audit")
    ),
    content: v.string(),
    relevanceScore: v.number(),
    metadata: v.optional(v.any()),
    generatedAt: v.number(),
  }).index("by_type", ["type"]),

  alerts: defineTable({
    productId: v.id("products"),
    type: v.union(
      v.literal("low_stock"),
      v.literal("out_of_stock"),
      v.literal("reorder")
    ),
    message: v.string(),
    resolved: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_resolved", ["resolved"]),

  appSettings: defineTable({
    logoUrl: v.optional(v.string()), // The public URL of the logo uploaded
    logoStorageId: v.optional(v.id("_storage")),
  }).index("by_creation", ["_creationTime"]),

  auditLog: defineTable({
    userId: v.optional(v.id("users")),
    action: v.string(),
    details: v.string(),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_action", ["action"]),
});
