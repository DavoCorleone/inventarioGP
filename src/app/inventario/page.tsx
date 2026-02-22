"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Package, Search, Plus, Edit, Trash2, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function getStockStatus(stock: number, minStock: number) {
    if (stock === 0) return "critical";
    if (stock <= minStock) return "reorder";
    return "optimal";
}

export default function InventarioPage() {
    const [brandFilter, setBrandFilter] = useState<string>("");
    const [categoryFilter, setCategoryFilter] = useState<string>("");
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);

    const products = useQuery(api.inventory.listProducts, {});
    const createProduct = useMutation(api.inventory.createProduct);
    const updateProduct = useMutation(api.inventory.updateProduct);
    const deleteProduct = useMutation(api.inventory.deleteProduct);

    const [form, setForm] = useState({
        sku: "",
        name: "",
        brand: "JAC" as "JAC" | "Jetour" | "Karry" | "Corp",
        category: "Merchandising" as "Merchandising" | "Exhibición" | "Oficina",
        stock: 0,
        minStock: 0,
        description: "",
    });

    const filteredProducts = products?.filter((p: any) => {
        if (brandFilter && p.brand !== brandFilter) return false;
        if (categoryFilter && p.category !== categoryFilter) return false;
        if (search) {
            const terms = search.toLowerCase();
            return (
                p.name.toLowerCase().includes(terms) ||
                p.sku.toLowerCase().includes(terms) ||
                p.brand.toLowerCase().includes(terms)
            );
        }
        return true;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await updateProduct({
                    id: editingProduct._id,
                    name: form.name,
                    stock: form.stock,
                    minStock: form.minStock,
                    description: form.description,
                });
            } else {
                await createProduct(form);
            }
            setShowModal(false);
            resetForm();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        setForm({
            sku: product.sku,
            name: product.name,
            brand: product.brand,
            category: product.category,
            stock: product.stock,
            minStock: product.minStock,
            description: product.description || "",
        });
        setShowModal(true);
    };

    const handleDelete = async (id: any) => {
        if (confirm("¿Estás seguro de eliminar este producto?")) {
            try {
                await deleteProduct({ id });
            } catch (err: any) {
                alert(err.message);
            }
        }
    };

    const resetForm = () => {
        setEditingProduct(null);
        setForm({
            sku: "",
            name: "",
            brand: "JAC",
            category: "Merchandising",
            stock: 0,
            minStock: 0,
            description: "",
        });
    };

    return (
        <>
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h2>Inventario</h2>
                    <p>Gestión de productos de marketing — {filteredProducts?.length ?? 0} productos</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                >
                    <Plus size={18} />
                    Nuevo Producto
                </button>
            </div>

            <div className="page-body fade-in">
                {/* Filters */}
                <div className="filter-bar">
                    <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
                        <Search
                            size={18}
                            style={{
                                position: "absolute",
                                left: 12,
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "var(--text-muted)",
                            }}
                        />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Buscar por nombre, SKU o marca..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: 40, width: "100%" }}
                        />
                    </div>

                    <select
                        className="form-select"
                        value={brandFilter}
                        onChange={(e) => setBrandFilter(e.target.value)}
                    >
                        <option value="">Todas las marcas</option>
                        <option value="JAC">JAC</option>
                        <option value="Jetour">Jetour</option>
                        <option value="Karry">Karry</option>
                        <option value="Corp">Corporativo</option>
                    </select>

                    <select
                        className="form-select"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">Todas las categorías</option>
                        <option value="Merchandising">Merchandising</option>
                        <option value="Exhibición">Exhibición</option>
                        <option value="Oficina">Oficina</option>
                    </select>

                    {(brandFilter || categoryFilter || search) && (
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => {
                                setBrandFilter("");
                                setCategoryFilter("");
                                setSearch("");
                            }}
                        >
                            <X size={14} />
                            Limpiar
                        </button>
                    )}
                </div>

                {/* Product Table */}
                <div className="card">
                    <div style={{ overflowX: "auto" }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Producto</th>
                                    <th>Marca</th>
                                    <th>Categoría</th>
                                    <th>Stock</th>
                                    <th>Mínimo</th>
                                    <th>Estado</th>
                                    <th>Nivel</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts?.map((product: any) => {
                                    const status = getStockStatus(product.stock, product.minStock);
                                    const pct = Math.min(
                                        (product.stock / Math.max(product.minStock * 3, 1)) * 100,
                                        100
                                    );
                                    return (
                                        <tr key={product._id}>
                                            <td>
                                                <code style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                                    {product.sku}
                                                </code>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{product.name}</div>
                                                {product.description && (
                                                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                                                        {product.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`brand-dot ${product.brand}`}>{product.brand}</span>
                                            </td>
                                            <td style={{ fontSize: 13 }}>{product.category}</td>
                                            <td style={{ fontWeight: 700 }}>{product.stock}</td>
                                            <td style={{ color: "var(--text-muted)" }}>{product.minStock}</td>
                                            <td>
                                                <span className={`badge ${status}`}>
                                                    {status === "optimal" ? "Óptimo" : status === "reorder" ? "Reorden" : "Crítico"}
                                                </span>
                                            </td>
                                            <td style={{ minWidth: 80 }}>
                                                <div className="stock-bar">
                                                    <div
                                                        className={`stock-bar-fill ${status}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", gap: 4 }}>
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => handleEdit(product)}
                                                        title="Editar"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => handleDelete(product._id)}
                                                        title="Eliminar"
                                                        style={{ color: "var(--danger)" }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {filteredProducts?.length === 0 && (
                        <div className="empty-state">
                            <Package size={48} />
                            <p>No se encontraron productos</p>
                            <span>Agrega productos o ajusta los filtros</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</h3>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {!editingProduct && (
                                    <div className="form-group">
                                        <label className="form-label">SKU</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={form.sku}
                                            onChange={(e) => setForm({ ...form, sku: e.target.value })}
                                            placeholder="MERCH-JAC-XXX"
                                            required
                                        />
                                    </div>
                                )}
                                <div className="form-group">
                                    <label className="form-label">Nombre</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Nombre del producto"
                                        required
                                    />
                                </div>
                                {!editingProduct && (
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                        <div className="form-group">
                                            <label className="form-label">Marca</label>
                                            <select
                                                className="form-select"
                                                value={form.brand}
                                                onChange={(e) => setForm({ ...form, brand: e.target.value as any })}
                                            >
                                                <option value="JAC">JAC</option>
                                                <option value="Jetour">Jetour</option>
                                                <option value="Karry">Karry</option>
                                                <option value="Corp">Corporativo</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Categoría</label>
                                            <select
                                                className="form-select"
                                                value={form.category}
                                                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                                            >
                                                <option value="Merchandising">Merchandising</option>
                                                <option value="Exhibición">Exhibición</option>
                                                <option value="Oficina">Oficina</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                    <div className="form-group">
                                        <label className="form-label">Stock</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={form.stock}
                                            onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                                            min={0}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Stock Mínimo</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={form.minStock}
                                            onChange={(e) =>
                                                setForm({ ...form, minStock: parseInt(e.target.value) || 0 })
                                            }
                                            min={0}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Descripción</label>
                                    <textarea
                                        className="form-textarea"
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        placeholder="Descripción del producto (opcional)"
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingProduct ? "Guardar Cambios" : "Crear Producto"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
