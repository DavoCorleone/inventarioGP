"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import {
    FileSpreadsheet,
    FileDown,
    Calendar,
    Filter,
    Download,
    Loader2,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const BRANDS = ["", "JAC", "Jetour", "Karry", "Corp"] as const;

export default function ReportesPage() {
    const branches = useQuery(api.branches.listBranches);
    const generateReport = useAction(api.reports.generateAuditReport);

    const [startDate, setStartDate] = useState(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    );
    const [endDate, setEndDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [brand, setBrand] = useState("");
    const [branchId, setBranchId] = useState("");
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<any>(null);
    const [error, setError] = useState("");

    const handleGenerate = async () => {
        setLoading(true);
        setError("");
        try {
            const result = await generateReport({
                startDate: new Date(startDate).getTime(),
                endDate: new Date(endDate + "T23:59:59").getTime(),
                brand: brand || undefined,
                branchId: branchId || undefined,
            } as any);
            setReport(result);
        } catch (err: any) {
            setError(err.message || "Error al generar reporte");
        } finally {
            setLoading(false);
        }
    };

    const exportCSV = () => {
        if (!report) return;
        const headers = ["Fecha", "Hora", "Sucursal", "Usuario", "Autorizador", "Razón", "Producto", "SKU", "Cantidad", "Estado", "Notas"];
        const csvContent = [
            headers.join(","),
            ...report.rows.map((r: any) =>
                [r.fecha, r.hora, `"${r.sucursal}"`, `"${r.usuario}"`, `"${r.autorizador}"`, `"${r.razon}"`, `"${r.producto}"`, r.sku, r.cantidad, r.estado, `"${r.notas}"`].join(",")
            ),
        ].join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `reporte_mims_${startDate}_${endDate}.csv`;
        link.click();
    };

    const exportPDF = () => {
        if (!report) return;
        const doc = new jsPDF({ orientation: "landscape" });

        // Header
        doc.setFontSize(18);
        doc.setTextColor(210, 35, 42);
        doc.text("MIMS — Reporte de Auditoría", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Grupo Palacios — ${report.dateRange.start} a ${report.dateRange.end}`, 14, 28);
        doc.text(`Marca: ${report.filters.brand} | Sucursal: ${report.filters.branch}`, 14, 34);
        doc.text(`Generado: ${report.generatedAt}`, 14, 40);

        // Summary
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Total retiros: ${report.summary.totalWithdrawals} | Total ítems: ${report.summary.totalItems}`, 14, 50);

        // Table
        (doc as any).autoTable({
            startY: 58,
            head: [["Fecha", "Sucursal", "Usuario", "Razón", "Producto", "SKU", "Cant.", "Estado"]],
            body: report.rows.map((r: any) => [
                r.fecha, r.sucursal, r.usuario, r.razon, r.producto, r.sku, r.cantidad, r.estado,
            ]),
            styles: { fontSize: 8 },
            headStyles: {
                fillColor: [210, 35, 42],
                textColor: 255,
                fontStyle: "bold",
            },
            alternateRowStyles: { fillColor: [248, 250, 252] },
        });

        doc.save(`reporte_mims_${startDate}_${endDate}.pdf`);
    };

    return (
        <>
            <div className="page-header">
                <h2>Reportes y Auditoría</h2>
                <p>Genera reportes filtrados por fecha, marca y sucursal · Exporta a CSV o PDF</p>
            </div>

            <div className="page-body fade-in">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Filters */}
                    <div className="card" style={{ marginBottom: 24 }}>
                        <div className="card-header">
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Filter size={18} style={{ color: "var(--jetour-blue)" }} />
                                <span style={{ fontWeight: 700, fontSize: 16 }}>Filtros del Reporte</span>
                            </div>
                        </div>
                        <div className="card-body">
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">
                                        <Calendar size={14} style={{ marginRight: 4 }} />
                                        Fecha inicio
                                    </label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">
                                        <Calendar size={14} style={{ marginRight: 4 }} />
                                        Fecha fin
                                    </label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Marca</label>
                                    <select
                                        className="form-select"
                                        value={brand}
                                        onChange={(e) => setBrand(e.target.value)}
                                    >
                                        <option value="">Todas las marcas</option>
                                        <option value="JAC">JAC</option>
                                        <option value="Jetour">Jetour</option>
                                        <option value="Karry">Karry</option>
                                        <option value="Corp">Corporativo</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Sucursal</label>
                                    <select
                                        className="form-select"
                                        value={branchId}
                                        onChange={(e) => setBranchId(e.target.value)}
                                    >
                                        <option value="">Todas las sucursales</option>
                                        {branches?.map((b: any) => (
                                            <option key={b._id} value={b._id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleGenerate}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={16} className="spin" />
                                            Generando...
                                        </>
                                    ) : (
                                        <>
                                            <FileSpreadsheet size={16} />
                                            Generar Reporte
                                        </>
                                    )}
                                </button>
                            </div>

                            {error && (
                                <div style={{ marginTop: 12, color: "var(--danger)", fontSize: 13 }}>
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results */}
                    {report && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                        >
                            {/* Summary Cards */}
                            <div className="stats-grid" style={{ marginBottom: 24 }}>
                                <div className="stat-card info">
                                    <div className="stat-card-label">Período</div>
                                    <div className="stat-card-value info" style={{ fontSize: 18 }}>
                                        {report.dateRange.start} — {report.dateRange.end}
                                    </div>
                                </div>
                                <div className="stat-card brand-jac">
                                    <div className="stat-card-label">Total Retiros</div>
                                    <div className="stat-card-value" style={{ color: "var(--jac-red)" }}>
                                        {report.summary.totalWithdrawals}
                                    </div>
                                </div>
                                <div className="stat-card brand-jetour">
                                    <div className="stat-card-label">Total Ítems</div>
                                    <div className="stat-card-value" style={{ color: "var(--jetour-blue)" }}>
                                        {report.summary.totalItems}
                                    </div>
                                </div>
                                <div className="stat-card optimal">
                                    <div className="stat-card-label">Registros</div>
                                    <div className="stat-card-value optimal">
                                        {report.rows.length}
                                    </div>
                                </div>
                            </div>

                            {/* Export Actions */}
                            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                                <button className="btn btn-secondary" onClick={exportCSV}>
                                    <Download size={16} />
                                    Exportar CSV
                                </button>
                                <button className="btn btn-primary" onClick={exportPDF}>
                                    <FileDown size={16} />
                                    Exportar PDF
                                </button>
                            </div>

                            {/* Data Table */}
                            <div className="card">
                                <div style={{ overflowX: "auto" }}>
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Sucursal</th>
                                                <th>Usuario</th>
                                                <th>Autorizador</th>
                                                <th>Razón</th>
                                                <th>Producto</th>
                                                <th>SKU</th>
                                                <th>Cant.</th>
                                                <th>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.rows.map((row: any, idx: number) => (
                                                <tr key={idx}>
                                                    <td style={{ whiteSpace: "nowrap" }}>{row.fecha}</td>
                                                    <td>{row.sucursal}</td>
                                                    <td>{row.usuario}</td>
                                                    <td style={{ color: row.autorizador === "N/A" ? "var(--text-muted)" : "inherit" }}>
                                                        {row.autorizador}
                                                    </td>
                                                    <td>
                                                        <span className="badge brand-corp">{row.razon}</span>
                                                    </td>
                                                    <td style={{ fontWeight: 500 }}>{row.producto}</td>
                                                    <td>
                                                        <code style={{ fontSize: 12, color: "var(--text-muted)" }}>{row.sku}</code>
                                                    </td>
                                                    <td style={{ fontWeight: 700, textAlign: "center" }}>{row.cantidad}</td>
                                                    <td>
                                                        <span className={`badge ${row.estado === "completed" ? "optimal" : "critical"}`}>
                                                            {row.estado === "completed" ? "Completado" : "Revertido"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {report.rows.length === 0 && (
                                    <div className="empty-state">
                                        <FileSpreadsheet />
                                        <p>No hay datos para el rango seleccionado</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </>
    );
}
