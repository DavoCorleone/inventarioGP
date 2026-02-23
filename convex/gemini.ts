// Gemini AI Engine — runs in Convex V8 runtime using fetch API
import { action, query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// ==========================================
// Gemini REST API Helper (V8 compatible)
// ==========================================
async function callGemini(prompt: string, imageBase64?: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error(
            "GEMINI_API_KEY no configurada. Configúrela en las variables de entorno de Convex."
        );
    }

    const parts: any[] = [{ text: prompt }];
    if (imageBase64) {
        parts.push({
            inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64,
            },
        });
    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 4096,
                },
            }),
        }
    );

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Gemini API error: ${response.status} — ${err}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sin respuesta de Gemini.";
}

// ==========================================
// 1. Predictive Stock Analysis
// ==========================================
export const predictiveStockAnalysis = action({
    args: {
        brand: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const products = await ctx.runQuery(api.inventory.listProducts, {});
        const withdrawals = await ctx.runQuery(api.inventory.listWithdrawals, {});
        const stats = await ctx.runQuery(api.inventory.getDashboardStats, {});

        const prompt = `Eres un analista de inventario experto de Grupo Palacios, concesionario de vehículos en Ecuador (marcas JAC, Jetour, Karry).

DATOS ACTUALES DE INVENTARIO:
${JSON.stringify(products.map((p: any) => ({ nombre: p.name, marca: p.brand, stock: p.stock, minimo: p.minStock, categoria: p.category })), null, 2)}

HISTORIAL DE RETIROS (últimos registros):
${JSON.stringify(withdrawals.slice(0, 20).map((w: any) => ({ fecha: new Date(w.timestamp).toLocaleDateString('es-EC'), razon: w.reason, sucursal: w.branchName, items: w.items.length })), null, 2)}

RESUMEN:
- Productos totales: ${stats.totalProducts}
- Stock por marca: JAC=${stats.stockByBrand.JAC}, Jetour=${stats.stockByBrand.Jetour}, Karry=${stats.stockByBrand.Karry}
- Alertas activas: ${stats.activeAlerts}

${args.brand ? `Enfócate especialmente en la marca ${args.brand}.` : ""}

TAREA: Genera un análisis predictivo en español que incluya:
1. Productos que se agotarán primero según tendencia de retiros
2. Recomendaciones de reabastecimiento para los próximos 30 días
3. Predicción para eventos estacionales (Feria de Fin de Año, activaciones de mall)
4. Alertas tempranas de posible desabastecimiento

Responde en formato JSON con la estructura:
{
  "predictions": [{ "product": "", "daysUntilDepletion": 0, "recommendation": "" }],
  "seasonalAlerts": [{ "event": "", "affectedProducts": [], "recommendation": "" }],
  "summary": ""
}`;

        const response = await callGemini(prompt);

        await ctx.runMutation(api.gemini.storeInsight, {
            type: "prediction",
            content: response,
            relevanceScore: 0.9,
        });

        return response;
    },
});

// ==========================================
// 2. Natural Language Query (NLQ)
// ==========================================
export const naturalLanguageQuery = action({
    args: {
        query: v.string(),
    },
    handler: async (ctx, args) => {
        const products = await ctx.runQuery(api.inventory.listProducts, {});
        const withdrawals = await ctx.runQuery(api.inventory.listWithdrawals, {});
        const branches = await ctx.runQuery(api.branches.listBranches, {});
        const stats = await ctx.runQuery(api.inventory.getDashboardStats, {});

        const prompt = `Eres un asistente de inventario de Grupo Palacios (Ecuador). Responde consultas en español natural.

DATOS DISPONIBLES:
- Productos: ${JSON.stringify(products.map((p: any) => ({ nombre: p.name, marca: p.brand, stock: p.stock, sku: p.sku, categoria: p.category })))}
- Retiros: ${JSON.stringify(withdrawals.slice(0, 30).map((w: any) => ({ fecha: new Date(w.timestamp).toLocaleDateString('es-EC'), razon: w.reason, sucursal: w.branchName, usuario: w.userName, items: w.items.map((i: any) => ({ producto: i.productName, cantidad: i.quantity })) })))}
- Sucursales: ${JSON.stringify(branches.map((b: any) => ({ nombre: b.name, ubicacion: b.locationDetails, ciudad: b.city })))}
- Estadísticas: ${JSON.stringify(stats)}

CONSULTA DEL USUARIO: "${args.query}"

Responde de forma clara y concisa en español. Si los datos disponibles no son suficientes para responder con certeza, indícalo. Incluye datos numéricos cuando sea posible.`;

        const response = await callGemini(prompt);

        await ctx.runMutation(api.gemini.storeInsight, {
            type: "nlq_response",
            content: JSON.stringify({ query: args.query, response }),
            relevanceScore: 0.85,
        });

        return response;
    },
});

// ==========================================
// 3. Marketing Copy Generation
// ==========================================
export const generateMarketingCopy = action({
    args: {
        platform: v.union(
            v.literal("whatsapp"),
            v.literal("instagram"),
            v.literal("facebook")
        ),
        context: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const products = await ctx.runQuery(api.inventory.listProducts, {});
        const availableProducts = products.filter((p: any) => p.stock > 0);

        const platformInstructions: Record<string, string> = {
            whatsapp: "Texto breve para WhatsApp blast. Usa emojis. Máximo 300 caracteres. Incluye llamada a acción.",
            instagram: "Caption para Instagram. Usa hashtags relevantes (#GrupoPalacios #JAC #Jetour #Ambato). Máximo 2200 caracteres. Tono aspiracional.",
            facebook: "Post para Facebook. Tono profesional pero amigable. Incluye llamada a acción con enlace placeholder.",
        };

        const prompt = `Eres el community manager de Grupo Palacios, concesionario autorizado JAC, Jetour y Karry en Ambato, Ecuador.

INVENTARIO DISPONIBLE PARA PROMOCIÓN:
${JSON.stringify(availableProducts.map((p: any) => ({ nombre: p.name, marca: p.brand, stock: p.stock })), null, 2)}

CONTEXTO ADICIONAL: ${args.context || "Promoción general de mercadería disponible"}

INSTRUCCIONES DE PLATAFORMA (${args.platform}):
${platformInstructions[args.platform]}

REGLAS:
- Menciona la ubicación: Ambato, Ecuador
- Usa el nombre oficial: Grupo Palacios
- No inventes productos que no estén en el inventario
- Incluye marcas disponibles (JAC, Jetour, Karry)
- Tono: profesional, ecuatoriano, cercano

Genera 3 opciones de copy.`;

        const response = await callGemini(prompt);

        await ctx.runMutation(api.gemini.storeInsight, {
            type: "marketing_copy",
            content: response,
            relevanceScore: 0.8,
        });

        return response;
    },
});

// ==========================================
// 4. Computer Vision Audit
// ==========================================
export const auditActivationPhoto = action({
    args: {
        imageBase64: v.string(),
        activationType: v.string(),
        location: v.string(),
    },
    handler: async (ctx, args) => {
        const prompt = `Eres un auditor de activaciones de marketing de Grupo Palacios (concesionario JAC, Jetour, Karry) en Ecuador.

TIPO DE ACTIVACIÓN: ${args.activationType}
UBICACIÓN: ${args.location}

Analiza esta imagen de una activación en mall/evento y evalúa:

1. **Visibilidad de marca**: ¿Se ven claramente los logos de JAC/Jetour/Karry? (0-10)
2. **Colocación de material POP**: ¿Los banners, roll-ups e inflables están correctamente posicionados? (0-10)
3. **Estado del material**: ¿El material se ve en buen estado o deteriorado? (0-10)
4. **Impacto visual**: ¿La activación genera impacto y atrae público? (0-10)
5. **Cumplimiento de lineamientos**: ¿Cumple con los estándares de imagen corporativa? (0-10)

Responde en JSON:
{
  "scores": { "visibilidad": 0, "colocacion": 0, "estado": 0, "impacto": 0, "cumplimiento": 0 },
  "overallScore": 0,
  "observations": [],
  "recommendations": []
}`;

        const response = await callGemini(prompt, args.imageBase64);

        await ctx.runMutation(api.gemini.storeInsight, {
            type: "vision_audit",
            content: response,
            relevanceScore: 0.75,
        });

        return response;
    },
});

// ==========================================
// Store AI Insight (internal helper)
// ==========================================
export const storeInsight = mutation({
    args: {
        type: v.union(
            v.literal("prediction"),
            v.literal("nlq_response"),
            v.literal("marketing_copy"),
            v.literal("vision_audit")
        ),
        content: v.string(),
        relevanceScore: v.number(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("aiInsights", {
            type: args.type,
            content: args.content,
            relevanceScore: args.relevanceScore,
            generatedAt: Date.now(),
        });
    },
});

export const listInsights = query({
    args: {
        type: v.optional(
            v.union(
                v.literal("prediction"),
                v.literal("nlq_response"),
                v.literal("marketing_copy"),
                v.literal("vision_audit")
            )
        ),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let q: any;
        if (args.type) {
            q = ctx.db
                .query("aiInsights")
                .withIndex("by_type", (idx: any) => idx.eq("type", args.type!));
        } else {
            q = ctx.db.query("aiInsights");
        }
        return await q.order("desc").take(args.limit ?? 20);
    },
});
