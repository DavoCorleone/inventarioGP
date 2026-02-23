"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Building2, MapPin, User, CheckCircle2, XCircle, Plus, Edit, X } from "lucide-react";

export default function SucursalesPage() {
    const branches = useQuery(api.branches.listBranches);
    const users = useQuery(api.auth.listUsers);
    const createBranch = useMutation(api.branches.createBranch);
    const updateBranch = useMutation(api.branches.updateBranch);

    const [showModal, setShowModal] = useState(false);
    const [editingBranch, setEditingBranch] = useState<any>(null);

    const [form, setForm] = useState({
        name: "",
        city: "",
        locationDetails: "",
        active: true,
        managerId: "",
    });

    const resetForm = () => {
        setEditingBranch(null);
        setForm({
            name: "",
            city: "",
            locationDetails: "",
            active: true,
            managerId: "",
        });
    };

    const handleEdit = (branch: any) => {
        setEditingBranch(branch);
        setForm({
            name: branch.name,
            city: branch.city,
            locationDetails: branch.locationDetails,
            active: branch.active,
            managerId: branch.managerId || "",
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingBranch) {
                await updateBranch({
                    id: editingBranch._id,
                    name: form.name,
                    city: form.city,
                    locationDetails: form.locationDetails,
                    active: form.active,
                    managerId: (form.managerId as any) || undefined,
                });
            } else {
                await createBranch({
                    ...form,
                    managerId: (form.managerId as any) || undefined,
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
                    <h2>Sucursales</h2>
                    <p>Red de concesionarios Grupo Palacios — {branches?.length ?? 0} sucursales</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                >
                    <Plus size={18} />
                    Nueva Sucursal
                </button>
            </div>

            <div className="page-body fade-in">
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                        gap: 20,
                    }}
                >
                    {branches?.map((branch) => (
                        <div key={branch._id} className="card" style={{ padding: 24, position: "relative" }}>
                            <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 8 }}>
                                <button className="btn-ghost" onClick={() => handleEdit(branch)} title="Editar" style={{ padding: 4 }}>
                                    <Edit size={16} />
                                </button>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, paddingRight: 32 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div
                                        style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 10,
                                            background: "linear-gradient(135deg, var(--jetour-blue-light), var(--jac-red-light))",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "var(--jetour-blue)",
                                        }}
                                    >
                                        <Building2 size={22} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: 16, fontWeight: 700 }}>{branch.name}</h3>
                                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                            {branch.city}
                                        </span>
                                    </div>
                                </div>
                                {branch.active ? (
                                    <span className="badge optimal">
                                        <CheckCircle2 size={12} /> Activa
                                    </span>
                                ) : (
                                    <span className="badge critical">
                                        <XCircle size={12} /> Inactiva
                                    </span>
                                )}
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                                    <MapPin size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                                    {branch.locationDetails}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                                    <User size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                                    Gerente: {branch.managerName}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {!branches || branches.length === 0 ? (
                    <div className="empty-state">
                        <Building2 />
                        <p>No hay sucursales registradas</p>
                        <span>Crea una nueva sucursal o ejecuta el seed</span>
                    </div>
                ) : null}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingBranch ? "Editar Sucursal" : "Nueva Sucursal"}</h3>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Nombre de la Sucursal</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Ej. Matriz Guayaquil"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ciudad</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={form.city}
                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                        placeholder="Ej. Guayaquil"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Dirección / Detalles de ubicación</label>
                                    <textarea
                                        className="form-textarea"
                                        value={form.locationDetails}
                                        onChange={(e) => setForm({ ...form, locationDetails: e.target.value })}
                                        placeholder="Ej. Av. Francisco de Orellana y Plaza Dañín"
                                        rows={2}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Jefe de Agencia (Opcional)</label>
                                    <select
                                        className="form-input"
                                        value={form.managerId}
                                        onChange={(e) => setForm({ ...form, managerId: e.target.value })}
                                    >
                                        <option value="">-- Sin asignar --</option>
                                        {users?.map(u => (
                                            <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <input
                                        type="checkbox"
                                        id="activeStatus"
                                        checked={form.active}
                                        onChange={(e) => setForm({ ...form, active: e.target.checked })}
                                        style={{ width: 18, height: 18 }}
                                    />
                                    <label htmlFor="activeStatus" className="form-label" style={{ margin: 0 }}>Sucursal Activa</label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingBranch ? "Guardar Cambios" : "Crear Sucursal"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
