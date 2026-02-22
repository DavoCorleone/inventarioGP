"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useMimsAuth } from "@/components/AppShell";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowDownToLine,
    Package,
    AlertTriangle,
    CheckCircle2,
    Shield,
    Clock,
    Boxes,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";

const REASONS = [
    "Entrega",
    "Feria",
    "Obsequio",
    "Activación Mall",
    "Reposición Sucursal",
    "Evento Corporativo",
    "Otro",
] as const;

export default function RetirosPage() {
    const { isAuthenticated } = useMimsAuth();
    const products = useQuery(api.inventory.listProducts, {});
    const packs = useQuery(api.packs.listPacks, { activeOnly: true });
    const branches = useQuery(api.branches.listBranches);
    const withdrawals = useQuery(api.inventory.listWithdrawals, { limit: 30 });
    const users = useQuery(api.auth.listUsers);
    const registerWithdrawal = useMutation(api.inventory.registerWithdrawal);

    const [branchId, setBranchId] = useState("");
    const [reason, setReason] = useState<typeof REASONS[number]>("Entrega");
    const [notes, setNotes] = useState("");
    const [authorizedById, setAuthorizedById] = useState("");
    const [selectedItems, setSelectedItems] = useState<
        { productId?: string; packId?: string; quantity: number }[]
    >([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const supervisors = users?.filter((u) => u.role === "supervisor" || u.role === "admin") ?? [];

    // Check if any selected product is Exhibición category
    const hasPOPPermanente = selectedItems.some((item) => {
        if (item.productId) {
            const product = products?.find((p: any) => p._id === item.productId);
            return product?.category === "Exhibición";
        }
        if (item.packId) {
            const pack = packs?.find((p) => p._id === item.packId);
            return pack?.items?.some((pi: any) => {
                const product = products?.find((p: any) => p._id === pi.productId);
                return product?.category === "Exhibición";
            });
        }
        return false;
    });

    const addProduct = () => {
        setSelectedItems([...selectedItems, { productId: "", quantity: 1 }]);
    };

    const addPack = () => {
        setSelectedItems([...selectedItems, { packId: "", quantity: 1 }]);
    };

    const updateItem = (index: number, updates: Partial<typeof selectedItems[0]>) => {
        const next = [...selectedItems];
        next[index] = { ...next[index], ...updates };
        setSelectedItems(next);
    };

    const removeItem = (index: number) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated || !branchId || selectedItems.length === 0) return;

        setSubmitting(true);
        setError("");
        setSuccess("");

        try {
            const items = selectedItems
                .filter((item) => item.productId || item.packId)
                .map((item) => ({
                    productId: item.productId ? (item.productId as any) : undefined,
                    packId: item.packId ? (item.packId as any) : undefined,
                    quantity: item.quantity,
                }));

            const result = await registerWithdrawal({
                branchId: branchId as any,
                reason,
                notes: notes || undefined,
                authorizedById: authorizedById ? (authorizedById as any) : undefined,
                items,
            });

            setSuccess(
                `✅ Retiro registrado: ${result.itemCount} items procesados`
            );
            setSelectedItems([]);
            setNotes("");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="page-header">
                <h2>Retiros de Material</h2>
                <p>Registro de retiros — Transacciones BOM atómicas</p>
            </div>

            <div className="page-body fade-in">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                    {/* Withdrawal Form */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">Nuevo Retiro</span>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: "0 24px 24px" }}>
                            {error && (
                                <div
                                    className="login-error"
                                    style={{ marginBottom: 16 }}
                                >
                                    <AlertTriangle size={16} />
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div
                                    style={{
                                        background: "var(--success-bg)",
                                        border: "1px solid #A7F3D0",
                                        borderRadius: "var(--radius-sm)",
                                        padding: "10px 14px",
                                        fontSize: 13,
                                        color: "#059669",
                                        marginBottom: 16,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                    }}
                                >
                                    <CheckCircle2 size={16} />
                                    {success}
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Sucursal</label>
                                <select
                                    className="form-select"
                                    value={branchId}
                                    onChange={(e) => setBranchId(e.target.value)}
                                    required
                                >
                                    <option value="">Seleccionar sucursal...</option>
                                    {branches?.map((b) => (
                                        <option key={b._id} value={b._id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Razón</label>
                                <select
                                    className="form-select"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value as any)}
                                >
                                    {REASONS.map((r) => (
                                        <option key={r} value={r}>
                                            {r}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Items */}
                            <div className="form-group">
                                <label className="form-label">
                                    Items ({selectedItems.length})
                                </label>

                                {selectedItems.map((item, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: "flex",
                                            gap: 8,
                                            marginBottom: 8,
                                            alignItems: "center",
                                        }}
                                    >
                                        {item.packId !== undefined && !item.productId ? (
                                            <select
                                                className="form-select"
                                                value={item.packId}
                                                onChange={(e) =>
                                                    updateItem(idx, { packId: e.target.value })
                                                }
                                                style={{ flex: 1 }}
                                            >
                                                <option value="">Seleccionar pack...</option>
                                                {packs?.map((p) => (
                                                    <option key={p._id} value={p._id}>
                                                        📦 {p.name} ({p.itemCount} items)
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <select
                                                className="form-select"
                                                value={item.productId}
                                                onChange={(e) =>
                                                    updateItem(idx, { productId: e.target.value })
                                                }
                                                style={{ flex: 1 }}
                                            >
                                                <option value="">Seleccionar producto...</option>
                                                {products?.map((p: any) => (
                                                    <option key={p._id} value={p._id}>
                                                        {p.name} ({p.brand}) — Stock: {p.stock}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={item.quantity}
                                            onChange={(e) =>
                                                updateItem(idx, {
                                                    quantity: parseInt(e.target.value) || 1,
                                                })
                                            }
                                            min={1}
                                            style={{ width: 70 }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => removeItem(idx)}
                                            style={{ color: "var(--danger)" }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}

                                <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                        type="button"
                                        className="btn btn-outline btn-sm"
                                        onClick={addProduct}
                                    >
                                        <Package size={14} />
                                        + Producto
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline btn-sm"
                                        onClick={addPack}
                                    >
                                        <Boxes size={14} />
                                        + Pack
                                    </button>
                                </div>
                            </div>

                            {/* Exhibición authorization */}
                            {hasPOPPermanente && (
                                <div
                                    className="form-group"
                                    style={{
                                        background: "var(--warning-bg)",
                                        border: "1px solid #FDE68A",
                                        borderRadius: "var(--radius-sm)",
                                        padding: 14,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            marginBottom: 10,
                                        }}
                                    >
                                        <Shield size={16} style={{ color: "var(--warning)" }} />
                                        <label
                                            className="form-label"
                                            style={{ margin: 0, color: "#92400E" }}
                                        >
                                            Declaración de Autorización (Material Crítico)
                                        </label>
                                    </div>
                                    <p style={{ fontSize: 13, color: "#B45309", marginBottom: 12 }}>
                                        El material seleccionado (POP/Exhibición) requiere que indiques con quién fue coordinada y autorizada esta salida.
                                    </p>
                                    <select
                                        className="form-select"
                                        value={authorizedById}
                                        onChange={(e) => setAuthorizedById(e.target.value)}
                                        required
                                    >
                                        <option value="">
                                            Selecciona quién autorizó este movimiento...
                                        </option>
                                        {supervisors.map((u) => (
                                            <option key={u._id} value={u._id}>
                                                {u.name} ({u.role})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Notas (opcional)</label>
                                <textarea
                                    className="form-textarea"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Observaciones del retiro..."
                                    rows={2}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting || selectedItems.length === 0}
                                style={{ width: "100%" }}
                            >
                                {submitting ? (
                                    <>
                                        <span
                                            className="spinner"
                                            style={{ width: 16, height: 16, borderWidth: 2 }}
                                        />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <ArrowDownToLine size={18} />
                                        Registrar Retiro
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Withdrawal History */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">Historial de Retiros</span>
                            <span
                                style={{ fontSize: 13, color: "var(--text-muted)" }}
                            >
                                {withdrawals?.length ?? 0} registros
                            </span>
                        </div>
                        <div style={{ padding: "0 24px 24px", maxHeight: 600, overflowY: "auto" }}>
                            {withdrawals?.map((w) => (
                                <div
                                    key={w._id}
                                    style={{
                                        padding: "14px 0",
                                        borderBottom: "1px solid var(--border-color)",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 14 }}>
                                                {w.userName}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 13,
                                                    color: "var(--text-secondary)",
                                                    marginTop: 2,
                                                }}
                                            >
                                                {w.branchName} — {w.reason}
                                            </div>
                                            {w.authorizerName && (
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        color: "var(--text-muted)",
                                                        marginTop: 2,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 4,
                                                    }}
                                                >
                                                    <Shield size={12} />
                                                    Autorizado por: {w.authorizerName}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    color: "var(--text-muted)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 4,
                                                }}
                                            >
                                                <Clock size={12} />
                                                {formatDistanceToNow(new Date(w.timestamp), {
                                                    addSuffix: true,
                                                    locale: es,
                                                })}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "var(--text-muted)",
                                                    marginTop: 2,
                                                }}
                                            >
                                                {format(new Date(w.timestamp), "dd/MM/yyyy HH:mm", {
                                                    locale: es,
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                                        {w.items.map((item, idx) => (
                                            <span
                                                key={idx}
                                                className="badge brand-corp"
                                                style={{ fontSize: 11 }}
                                            >
                                                {item.productName} ×{item.quantity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {!withdrawals || withdrawals.length === 0 ? (
                                <div className="empty-state">
                                    <ArrowDownToLine />
                                    <p>Sin retiros registrados</p>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
