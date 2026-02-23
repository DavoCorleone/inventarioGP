"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Boxes, Package, CheckCircle2, XCircle, Plus, Edit, X, Trash2 } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

export default function PacksPage() {
    const packs = useQuery(api.packs.listPacks, {});
    const products = useQuery(api.inventory.listProducts, {});
    const createPack = useMutation(api.packs.createPack);
    const updatePack = useMutation(api.packs.updatePack);

    const [showModal, setShowModal] = useState(false);
    const [editingPack, setEditingPack] = useState<any>(null);

    const [form, setForm] = useState({
        name: "",
        brand: "JAC" as "JAC" | "Jetour" | "Karry" | "Corp",
        description: "",
        active: true,
        items: [] as { productId: Id<"products">; quantity: number }[],
    });

    const [selectedProduct, setSelectedProduct] = useState("");

    const resetForm = () => {
        setEditingPack(null);
        setForm({
            name: "",
            brand: "JAC",
            description: "",
            active: true,
            items: [],
        });
        setSelectedProduct("");
    };

    const handleEdit = (pack: any) => {
        setEditingPack(pack);
        setForm({
            name: pack.name,
            brand: pack.brand,
            description: pack.description || "",
            active: pack.active,
            items: pack.items.map((i: any) => ({
                productId: i.productId,
                quantity: i.quantity,
            })),
        });
        setSelectedProduct("");
        setShowModal(true);
    };

    const addItem = () => {
        if (!selectedProduct) return;
        // Check if already in list
        if (form.items.some((i) => i.productId === selectedProduct)) {
            alert("Este producto ya está en el pack. Ajusta la cantidad.");
            setSelectedProduct("");
            return;
        }

        setForm({
            ...form,
            items: [...form.items, { productId: selectedProduct as Id<"products">, quantity: 1 }],
        });
        setSelectedProduct("");
    };

    const removeItem = (productId: Id<"products">) => {
        setForm({
            ...form,
            items: form.items.filter((i) => i.productId !== productId),
        });
    };

    const updateItemQuantity = (productId: Id<"products">, quantity: number) => {
        if (quantity < 1) quantity = 1;
        setForm({
            ...form,
            items: form.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (form.items.length === 0) {
                alert("El pack debe tener al menos 1 producto.");
                return;
            }

            if (editingPack) {
                await updatePack({
                    id: editingPack._id,
                    name: form.name,
                    description: form.description,
                    active: form.active,
                    items: form.items,
                });
            } else {
                await createPack({
                    name: form.name,
                    brand: form.brand,
                    description: form.description,
                    active: form.active,
                    items: form.items,
                });
            }
            setShowModal(false);
            resetForm();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <>
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h2>Packs (BOM)</h2>
                    <p>Bill of Materials — Paquetes de productos para entregas y eventos</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                >
                    <Plus size={18} />
                    Nuevo Pack
                </button>
            </div>

            <div className="page-body fade-in">
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                        gap: 20,
                    }}
                >
                    {packs?.map((pack) => (
                        <div key={pack._id} className="card" style={{ position: "relative" }}>
                            <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 8 }}>
                                <button className="btn-ghost" onClick={() => handleEdit(pack)} title="Editar" style={{ padding: 4 }}>
                                    <Edit size={16} />
                                </button>
                            </div>

                            <div className="card-header" style={{ paddingRight: 40 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 10,
                                            background:
                                                pack.brand === "JAC"
                                                    ? "var(--jac-red-light)"
                                                    : pack.brand === "Jetour"
                                                        ? "var(--jetour-blue-light)"
                                                        : "#F3F4F6",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color:
                                                pack.brand === "JAC"
                                                    ? "var(--jac-red)"
                                                    : pack.brand === "Jetour"
                                                        ? "var(--jetour-blue)"
                                                        : "#1F2937",
                                        }}
                                    >
                                        <Boxes size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 15 }}>{pack.name}</div>
                                        <span className={`brand-dot ${pack.brand}`} style={{ fontSize: 12 }}>
                                            {pack.brand}
                                        </span>
                                    </div>
                                </div>
                                {pack.active ? (
                                    <span className="badge optimal">
                                        <CheckCircle2 size={12} /> Activo
                                    </span>
                                ) : (
                                    <span className="badge critical">
                                        <XCircle size={12} /> Inactivo
                                    </span>
                                )}
                            </div>

                            <div style={{ padding: "0 24px 8px" }}>
                                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                                    {pack.description}
                                </p>
                            </div>

                            <div style={{ padding: "0 24px 20px" }}>
                                <div
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: "var(--text-muted)",
                                        textTransform: "uppercase",
                                        letterSpacing: 0.5,
                                        marginBottom: 8,
                                    }}
                                >
                                    Componentes ({pack.itemCount})
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {pack.items.map((item: any) => {
                                        const stockOk = item.currentStock >= item.quantity;
                                        return (
                                            <div
                                                key={item._id}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    padding: "8px 12px",
                                                    background: stockOk ? "#F8FAFC" : "var(--danger-bg)",
                                                    borderRadius: "var(--radius-sm)",
                                                    fontSize: 13,
                                                    border: `1px solid ${stockOk ? "var(--border-color)" : "#FECACA"}`,
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <Package size={14} style={{ color: "var(--text-muted)" }} />
                                                    <span style={{ fontWeight: 500 }}>{item.productName}</span>
                                                    <code style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                                        {item.productSku}
                                                    </code>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                    <span style={{ fontWeight: 700 }}>×{item.quantity}</span>
                                                    <span
                                                        style={{
                                                            fontSize: 11,
                                                            color: stockOk ? "var(--success)" : "var(--danger)",
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        Stock: {item.currentStock}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {!packs || packs.length === 0 ? (
                    <div className="empty-state">
                        <Boxes />
                        <p>No hay packs configurados</p>
                        <span>Crea un nuevo pack o ejecuta el seed</span>
                    </div>
                ) : null}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 650 }}>
                        <div className="modal-header">
                            <h3>{editingPack ? "Editar Pack" : "Nuevo Pack"}</h3>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Nombre del Pack</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder="Ej. Kit de Bienvenida JAC"
                                            required
                                        />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Marca</label>
                                        <select
                                            className="form-select"
                                            value={form.brand}
                                            onChange={(e) => setForm({ ...form, brand: e.target.value as any })}
                                            disabled={!!editingPack}
                                        >
                                            <option value="JAC">JAC</option>
                                            <option value="Jetour">Jetour</option>
                                            <option value="Karry">Karry</option>
                                            <option value="Corp">Corporativo</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Descripción</label>
                                    <textarea
                                        className="form-textarea"
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        placeholder="Lista rápida de qué incluye o uso principal"
                                        rows={2}
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <input
                                        type="checkbox"
                                        id="activeStatusPack"
                                        checked={form.active}
                                        onChange={(e) => setForm({ ...form, active: e.target.checked })}
                                        style={{ width: 18, height: 18 }}
                                    />
                                    <label htmlFor="activeStatusPack" className="form-label" style={{ margin: 0 }}>Pack Activo</label>
                                </div>

                                <div style={{ marginTop: 24 }}>
                                    <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Componentes del Pack (BOM)</h4>

                                    <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                                        <select
                                            className="form-select"
                                            value={selectedProduct}
                                            onChange={(e) => setSelectedProduct(e.target.value)}
                                            style={{ flex: 1 }}
                                        >
                                            <option value="">Selecciona un producto para agregar...</option>
                                            {products?.map((p: any) => (
                                                <option key={p._id} value={p._id}>
                                                    {p.sku} — {p.name} (Stock: {p.stock})
                                                </option>
                                            ))}
                                        </select>
                                        <button type="button" className="btn btn-secondary" onClick={addItem} disabled={!selectedProduct}>
                                            Añadir
                                        </button>
                                    </div>

                                    {form.items.length === 0 ? (
                                        <div style={{ padding: 20, textAlign: "center", background: "#f8fafc", borderRadius: 8, color: "var(--text-muted)", fontSize: 13 }}>
                                            No hay productos en este pack.
                                        </div>
                                    ) : (
                                        <div style={{ border: "1px solid var(--border-color)", borderRadius: 8, overflow: "hidden" }}>
                                            <table className="data-table" style={{ margin: 0 }}>
                                                <thead>
                                                    <tr style={{ background: "#f8fafc" }}>
                                                        <th>Producto</th>
                                                        <th style={{ width: 100 }}>Cantidad</th>
                                                        <th style={{ width: 60 }}></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {form.items.map((item) => {
                                                        const p = products?.find((prod: any) => prod._id === item.productId) as any;
                                                        return (
                                                            <tr key={item.productId}>
                                                                <td>
                                                                    <div style={{ fontWeight: 500, fontSize: 13 }}>{p?.name || "Cargando..."}</div>
                                                                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p?.sku}</div>
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="number"
                                                                        className="form-input"
                                                                        value={item.quantity}
                                                                        onChange={(e) => updateItemQuantity(item.productId, parseInt(e.target.value) || 1)}
                                                                        min={1}
                                                                        style={{ padding: "4px 8px", height: 32 }}
                                                                    />
                                                                </td>
                                                                <td style={{ textAlign: "right" }}>
                                                                    <button
                                                                        type="button"
                                                                        className="btn-ghost"
                                                                        onClick={() => removeItem(item.productId)}
                                                                        style={{ color: "var(--danger)", padding: 4 }}
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingPack ? "Guardar Cambios" : "Crear Pack"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
