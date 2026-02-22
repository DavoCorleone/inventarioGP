import { mutation } from "./_generated/server";

// ==========================================
// Seed Data — Grupo Palacios Ecuador
// ==========================================
export const seedAll = mutation({
    args: {},
    handler: async (ctx) => {
        // Clear existing data
        const collections = ["users", "branches", "products", "packs", "withdrawals", "auditLog", "alerts"];
        for (const table of collections) {
            const items = await ctx.db.query(table as any).collect();
            for (const item of items) {
                await ctx.db.delete(item._id);
            }
        }

        // ==========================================
        // 1. BRANCHES
        // ==========================================
        const matrizId = await ctx.db.insert("branches", {
            name: "Matriz Av. Los Guaytambos",
            locationDetails: "Av. Los Guaytambos y Av. Atahualpa, Ambato",
            city: "Ambato",
            active: true,
        });

        const ficoaId = await ctx.db.insert("branches", {
            name: "Ficoa",
            locationDetails: "Frente al IESS, Ficoa, Ambato",
            city: "Ambato",
            active: true,
        });

        const elReyId = await ctx.db.insert("branches", {
            name: "Av. El Rey",
            locationDetails: "100m del Estadio Bellavista, Av. El Rey, Ambato",
            city: "Ambato",
            active: true,
        });

        const latacungaId = await ctx.db.insert("branches", {
            name: "Latacunga",
            locationDetails: "Centro Comercial Maltería Plaza, Latacunga",
            city: "Latacunga",
            active: true,
        });

        const seminuevosId = await ctx.db.insert("branches", {
            name: "Seminuevos",
            locationDetails: "Av. Los Guaytambos (junto a Matriz), Ambato",
            city: "Ambato",
            active: true,
        });

        // ==========================================
        // 2. USERS
        // ==========================================
        const adminId = await ctx.db.insert("users", {
            name: "D. Chavez",
            email: "info@carlospalacios.com",
            role: "admin",
            branchId: matrizId,
            approved: true,
        });

        const supervisorId = await ctx.db.insert("users", {
            name: "María Fernanda Torres",
            email: "supervisor@grupopalacios.ec",
            role: "supervisor",
            branchId: matrizId,
            approved: true,
        });

        const advisor1Id = await ctx.db.insert("users", {
            name: "Juan Pérez",
            email: "jperez@grupopalacios.ec",
            role: "advisor",
            branchId: ficoaId,
            approved: true,
        });

        const advisor2Id = await ctx.db.insert("users", {
            name: "Andrea Salazar",
            email: "asalazar@grupopalacios.ec",
            role: "advisor",
            branchId: elReyId,
            approved: true,
        });

        const advisor3Id = await ctx.db.insert("users", {
            name: "Roberto Caicedo",
            email: "rcaicedo@grupopalacios.ec",
            role: "advisor",
            branchId: latacungaId,
            approved: true,
        });

        // Assign managers
        await ctx.db.patch(matrizId, { managerId: adminId });
        await ctx.db.patch(ficoaId, { managerId: supervisorId });

        // ==========================================
        // 3. PRODUCTS — Merchandising
        // ==========================================
        const gorrasJAC = await ctx.db.insert("products", {
            sku: "MERCH-JAC-001",
            name: "Gorras JAC",
            brand: "JAC",
            category: "Merchandising",
            stock: 150,
            minStock: 30,
            description: "Gorras bordadas con logo JAC, color negro",
        });

        const gorrasJetour = await ctx.db.insert("products", {
            sku: "MERCH-JET-001",
            name: "Gorras Jetour",
            brand: "Jetour",
            category: "Merchandising",
            stock: 120,
            minStock: 25,
            description: "Gorras bordadas con logo Jetour, color azul",
        });

        const llaverosJAC = await ctx.db.insert("products", {
            sku: "MERCH-JAC-002",
            name: "Llaveros JAC",
            brand: "JAC",
            category: "Merchandising",
            stock: 300,
            minStock: 50,
            description: "Llaveros metálicos con logo JAC",
        });

        const llaverosJetour = await ctx.db.insert("products", {
            sku: "MERCH-JET-002",
            name: "Llaveros Jetour",
            brand: "Jetour",
            category: "Merchandising",
            stock: 250,
            minStock: 40,
            description: "Llaveros metálicos con logo Jetour",
        });

        const llaverosKarry = await ctx.db.insert("products", {
            sku: "MERCH-KAR-001",
            name: "Llaveros Karry",
            brand: "Karry",
            category: "Merchandising",
            stock: 200,
            minStock: 30,
            description: "Llaveros metálicos con logo Karry",
        });

        const termosJAC = await ctx.db.insert("products", {
            sku: "MERCH-JAC-003",
            name: "Termos JAC",
            brand: "JAC",
            category: "Merchandising",
            stock: 80,
            minStock: 15,
            description: "Termos térmicos 500ml con logo JAC",
        });

        const termosJetour = await ctx.db.insert("products", {
            sku: "MERCH-JET-003",
            name: "Termos Jetour",
            brand: "Jetour",
            category: "Merchandising",
            stock: 60,
            minStock: 15,
            description: "Termos térmicos 500ml con logo Jetour",
        });

        const camisetasJAC = await ctx.db.insert("products", {
            sku: "MERCH-JAC-004",
            name: "Camisetas JAC",
            brand: "JAC",
            category: "Merchandising",
            stock: 100,
            minStock: 20,
            description: "Camisetas polo con logo JAC bordado",
        });

        const esferos = await ctx.db.insert("products", {
            sku: "MERCH-CORP-001",
            name: "Esferos Corporativos",
            brand: "Corp",
            category: "Merchandising",
            stock: 500,
            minStock: 100,
            description: "Esferos con logo Grupo Palacios",
        });

        // ==========================================
        // 4. PRODUCTS — Exhibición
        // ==========================================
        const inflableJetour = await ctx.db.insert("products", {
            sku: "POP-JET-001",
            name: "Inflable Jetour T1",
            brand: "Jetour",
            category: "Exhibición",
            stock: 5,
            minStock: 2,
            description: "Inflable gigante modelo Jetour T1 para activaciones",
        });

        const tabletJAC = await ctx.db.insert("products", {
            sku: "POP-JAC-001",
            name: 'Tablet 10" JAC',
            brand: "JAC",
            category: "Exhibición",
            stock: 8,
            minStock: 3,
            description: "Tablet 10 pulgadas para exhibición de catálogo JAC",
        });

        const rollupJAC = await ctx.db.insert("products", {
            sku: "POP-JAC-002",
            name: "Roll-up JAC M4",
            brand: "JAC",
            category: "Exhibición",
            stock: 10,
            minStock: 3,
            description: "Roll-up banner modelo JAC M4",
        });

        const bannerJetour = await ctx.db.insert("products", {
            sku: "POP-JET-002",
            name: "Banner Jetour T1",
            brand: "Jetour",
            category: "Exhibición",
            stock: 12,
            minStock: 4,
            description: "Banner colgante Jetour T1 para concesionario",
        });

        const bannerKarry = await ctx.db.insert("products", {
            sku: "POP-KAR-001",
            name: "Banner Karry Plus",
            brand: "Karry",
            category: "Exhibición",
            stock: 6,
            minStock: 2,
            description: "Banner Karry Plus para exhibición",
        });

        // ==========================================
        // 5. PRODUCTS — Oficina
        // ==========================================
        const manualesJAC = await ctx.db.insert("products", {
            sku: "OFC-JAC-001",
            name: "Manuales de Usuario JAC",
            brand: "JAC",
            category: "Oficina",
            stock: 200,
            minStock: 40,
            description: "Manuales impresos para entrega con vehículo JAC",
        });

        const manualesJetour = await ctx.db.insert("products", {
            sku: "OFC-JET-001",
            name: "Manuales de Usuario Jetour",
            brand: "Jetour",
            category: "Oficina",
            stock: 150,
            minStock: 30,
            description: "Manuales impresos para entrega con vehículo Jetour",
        });

        const kitEmergencia = await ctx.db.insert("products", {
            sku: "OFC-CORP-001",
            name: "Kit de Emergencia",
            brand: "Corp",
            category: "Oficina",
            stock: 100,
            minStock: 20,
            description: "Kit de emergencia vehicular para entrega",
        });

        const carpetaEntrega = await ctx.db.insert("products", {
            sku: "OFC-CORP-002",
            name: "Carpeta de Entrega",
            brand: "Corp",
            category: "Oficina",
            stock: 180,
            minStock: 40,
            description: "Carpeta corporativa para documentos de entrega",
        });

        const llavesRepuesto = await ctx.db.insert("products", {
            sku: "OFC-CORP-003",
            name: "Juego de Llaves Repuesto",
            brand: "Corp",
            category: "Oficina",
            stock: 90,
            minStock: 15,
            description: "Juego de llaves de repuesto para vehículos",
        });

        // ==========================================
        // 6. PACKS (Bill of Materials)
        // ==========================================
        const packEntregaJetour = await ctx.db.insert("packs", {
            name: "Pack Entrega Jetour T1",
            description: "Pack completo para entrega de vehículo Jetour T1: incluye manual, llavero, gorra, kit emergencia y carpeta",
            brand: "Jetour",
            active: true,
        });

        await ctx.db.insert("packItems", { packId: packEntregaJetour, productId: manualesJetour, quantity: 1 });
        await ctx.db.insert("packItems", { packId: packEntregaJetour, productId: llaverosJetour, quantity: 2 });
        await ctx.db.insert("packItems", { packId: packEntregaJetour, productId: gorrasJetour, quantity: 1 });
        await ctx.db.insert("packItems", { packId: packEntregaJetour, productId: kitEmergencia, quantity: 1 });
        await ctx.db.insert("packItems", { packId: packEntregaJetour, productId: carpetaEntrega, quantity: 1 });
        await ctx.db.insert("packItems", { packId: packEntregaJetour, productId: llavesRepuesto, quantity: 1 });

        const packEntregaJAC = await ctx.db.insert("packs", {
            name: "Pack Entrega JAC",
            description: "Pack completo para entrega de vehículo JAC: incluye manual, llavero, gorra, kit emergencia y carpeta",
            brand: "JAC",
            active: true,
        });

        await ctx.db.insert("packItems", { packId: packEntregaJAC, productId: manualesJAC, quantity: 1 });
        await ctx.db.insert("packItems", { packId: packEntregaJAC, productId: llaverosJAC, quantity: 2 });
        await ctx.db.insert("packItems", { packId: packEntregaJAC, productId: gorrasJAC, quantity: 1 });
        await ctx.db.insert("packItems", { packId: packEntregaJAC, productId: kitEmergencia, quantity: 1 });
        await ctx.db.insert("packItems", { packId: packEntregaJAC, productId: carpetaEntrega, quantity: 1 });
        await ctx.db.insert("packItems", { packId: packEntregaJAC, productId: llavesRepuesto, quantity: 1 });

        const packFeriaJAC = await ctx.db.insert("packs", {
            name: "Pack Feria JAC",
            description: "Material para stand de feria JAC: incluye roll-ups, gorras, llaveros y esferos",
            brand: "JAC",
            active: true,
        });

        await ctx.db.insert("packItems", { packId: packFeriaJAC, productId: rollupJAC, quantity: 2 });
        await ctx.db.insert("packItems", { packId: packFeriaJAC, productId: gorrasJAC, quantity: 20 });
        await ctx.db.insert("packItems", { packId: packFeriaJAC, productId: llaverosJAC, quantity: 50 });
        await ctx.db.insert("packItems", { packId: packFeriaJAC, productId: esferos, quantity: 100 });
        await ctx.db.insert("packItems", { packId: packFeriaJAC, productId: termosJAC, quantity: 10 });

        const packActivacionMall = await ctx.db.insert("packs", {
            name: "Pack Activación Mall Jetour",
            description: "Material completo para activación en centros comerciales con Jetour",
            brand: "Jetour",
            active: true,
        });

        await ctx.db.insert("packItems", { packId: packActivacionMall, productId: inflableJetour, quantity: 1 });
        await ctx.db.insert("packItems", { packId: packActivacionMall, productId: bannerJetour, quantity: 3 });
        await ctx.db.insert("packItems", { packId: packActivacionMall, productId: gorrasJetour, quantity: 30 });
        await ctx.db.insert("packItems", { packId: packActivacionMall, productId: llaverosJetour, quantity: 50 });
        await ctx.db.insert("packItems", { packId: packActivacionMall, productId: termosJetour, quantity: 15 });

        // ==========================================
        // 7. SAMPLE WITHDRAWALS
        // ==========================================
        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;

        await ctx.db.insert("withdrawals", {
            userId: advisor1Id,
            branchId: ficoaId,
            items: [
                { productId: llaverosJAC, quantity: 5 },
                { productId: gorrasJAC, quantity: 2 },
            ],
            reason: "Entrega",
            status: "completed",
            timestamp: now - 7 * day,
        });

        await ctx.db.insert("withdrawals", {
            userId: advisor2Id,
            branchId: elReyId,
            items: [
                { productId: llaverosJetour, quantity: 10 },
                { productId: termosJetour, quantity: 3 },
            ],
            reason: "Feria",
            notes: "Feria automotriz Ambato Diciembre 2024",
            status: "completed",
            timestamp: now - 5 * day,
        });

        await ctx.db.insert("withdrawals", {
            userId: advisor3Id,
            branchId: latacungaId,
            authorizedById: supervisorId,
            items: [
                { productId: rollupJAC, quantity: 2 },
                { productId: bannerJetour, quantity: 1 },
            ],
            reason: "Activación Mall",
            notes: "Activación en Maltería Plaza Latacunga",
            status: "completed",
            timestamp: now - 3 * day,
        });

        await ctx.db.insert("withdrawals", {
            userId: advisor1Id,
            branchId: ficoaId,
            items: [
                { productId: esferos, quantity: 50 },
                { productId: gorrasJAC, quantity: 5 },
            ],
            reason: "Evento Corporativo",
            status: "completed",
            timestamp: now - 1 * day,
        });

        // ==========================================
        // 8. SAMPLE ALERTS
        // ==========================================
        await ctx.db.insert("alerts", {
            productId: inflableJetour,
            type: "low_stock",
            message: "Inflable Jetour T1: Stock 5/2 — nivel bajo para temporada de ferias",
            resolved: false,
            createdAt: now - 2 * day,
        });

        // Audit log
        await ctx.db.insert("auditLog", {
            action: "seed_data",
            details: "Base de datos inicializada con datos de ejemplo para Grupo Palacios",
            timestamp: Date.now(),
        });

        return {
            message: "✅ Seed completado: 5 sucursales, 5 usuarios, 19 productos, 4 packs, 4 retiros de ejemplo",
        };
    },
});
