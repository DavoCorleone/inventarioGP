"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Boxes,
  Bell,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

function getStockStatus(stock: number, minStock: number) {
  if (stock === 0) return "critical";
  if (stock <= minStock) return "reorder";
  return "optimal";
}

const BRAND_COLORS: Record<string, string> = {
  JAC: "#D2232A",
  Jetour: "#0056A4",
  Karry: "#000000",
  Corp: "#6366F1",
};

const REASON_COLORS = ["#D2232A", "#0056A4", "#10B981", "#F59E0B", "#8B5CF6", "#6B7280"];

export default function DashboardPage() {
  const stats = useQuery(api.inventory.getDashboardStats);
  const alerts = useQuery(api.inventory.listAlerts, { resolved: false });
  const withdrawalsByReason = useQuery(api.inventory.getWithdrawalsByReason);
  const withdrawalsByBranch = useQuery(api.inventory.getWithdrawalsByBranch);
  const products = useQuery(api.inventory.listProducts, {});

  if (!stats) {
    return (
      <div className="loading-screen" style={{ minHeight: "50vh" }}>
        <div className="spinner" />
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  const brandData = Object.entries(stats.stockByBrand).map(([brand, stock]) => ({
    name: brand,
    value: stock as number,
  }));

  return (
    <>
      <div className="page-header">
        <h2>Dashboard Ejecutivo</h2>
        <p>Vista general del inventario de marketing — Grupo Palacios</p>
      </div>

      <div className="page-body fade-in">
        {/* Stock Health Cards */}
        <motion.div
          className="stats-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="stat-card info">
            <div className="stat-card-icon info">
              <Package size={22} />
            </div>
            <div className="stat-card-label">Total Productos</div>
            <div className="stat-card-value info">{stats.totalProducts}</div>
            <div className="stat-card-sublabel">{stats.totalStock} unidades en stock</div>
          </div>

          <div className="stat-card optimal">
            <div className="stat-card-icon optimal">
              <CheckCircle2 size={22} />
            </div>
            <div className="stat-card-label">Óptimo</div>
            <div className="stat-card-value optimal">{stats.optimalProducts}</div>
            <div className="stat-card-sublabel">Stock sobre el mínimo</div>
          </div>

          <div className="stat-card reorder">
            <div className="stat-card-icon reorder">
              <AlertTriangle size={22} />
            </div>
            <div className="stat-card-label">Reorden</div>
            <div className="stat-card-value reorder">{stats.reorderProducts}</div>
            <div className="stat-card-sublabel">Necesitan reabastecimiento</div>
          </div>

          <div className="stat-card critical">
            <div className="stat-card-icon critical">
              <XCircle size={22} />
            </div>
            <div className="stat-card-label">Crítico</div>
            <div className="stat-card-value critical">{stats.criticalProducts}</div>
            <div className="stat-card-sublabel">Sin stock disponible</div>
          </div>

          <div className="stat-card info">
            <div className="stat-card-icon info">
              <Boxes size={22} />
            </div>
            <div className="stat-card-label">Packs Activos</div>
            <div className="stat-card-value info">{stats.activePacks}</div>
            <div className="stat-card-sublabel">BOM configurados</div>
          </div>

          <div className="stat-card" style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: stats.activeAlerts > 0
                  ? "linear-gradient(90deg, #EF4444, #F87171)"
                  : "linear-gradient(90deg, #10B981, #34D399)",
              }}
            />
            <div
              className="stat-card-icon"
              style={{
                background: stats.activeAlerts > 0 ? "var(--danger-bg)" : "var(--success-bg)",
                color: stats.activeAlerts > 0 ? "var(--danger)" : "var(--success)",
              }}
            >
              <Bell size={22} />
            </div>
            <div className="stat-card-label">Alertas Activas</div>
            <div
              className="stat-card-value"
              style={{ color: stats.activeAlerts > 0 ? "var(--danger)" : "var(--success)" }}
            >
              {stats.activeAlerts}
            </div>
            <div className="stat-card-sublabel">Requieren atención</div>
          </div>
        </motion.div>

        {/* Brand Stock Cards */}
        <motion.div
          className="stats-grid"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {Object.entries(stats.stockByBrand).map(([brand, stock]) => (
            <div key={brand} className={`stat-card brand-${brand.toLowerCase()}`}>
              <div className="stat-card-label">
                <span className={`brand-dot ${brand}`}>{brand}</span>
              </div>
              <div className="stat-card-value" style={{ color: BRAND_COLORS[brand], fontSize: 28 }}>
                {stock as number}
              </div>
              <div className="stat-card-sublabel">unidades totales</div>
            </div>
          ))}
        </motion.div>

        {/* Charts */}
        <motion.div
          className="charts-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="chart-card">
            <div className="chart-card-title">Retiros por Razón</div>
            <div className="chart-card-subtitle">
              Distribución de retiros según motivo
            </div>
            {withdrawalsByReason && withdrawalsByReason.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={withdrawalsByReason}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="reason"
                    tick={{ fontSize: 11 }}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
                    }}
                  />
                  <Bar dataKey="count" name="Cantidad" radius={[6, 6, 0, 0]}>
                    {withdrawalsByReason.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={REASON_COLORS[index % REASON_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <TrendingUp />
                <p>Sin datos de retiros</p>
                <span>Los gráficos aparecerán con los primeros retiros</span>
              </div>
            )}
          </div>

          <div className="chart-card">
            <div className="chart-card-title">Rendimiento por Sucursal</div>
            <div className="chart-card-subtitle">
              Retiros totales por ubicación
            </div>
            {withdrawalsByBranch && withdrawalsByBranch.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={withdrawalsByBranch} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey="branch"
                    type="category"
                    tick={{ fontSize: 11 }}
                    width={130}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
                    }}
                  />
                  <Bar dataKey="count" name="Retiros" fill="#0056A4" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <TrendingUp />
                <p>Sin datos por sucursal</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stock by Brand Pie + Alerts */}
        <motion.div
          className="charts-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <div className="chart-card">
            <div className="chart-card-title">Distribución de Stock por Marca</div>
            <div className="chart-card-subtitle">
              Porcentaje de inventario por marca
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={brandData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {brandData.map((entry) => (
                    <Cell key={entry.name} fill={BRAND_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <div className="chart-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Bell size={18} style={{ color: "var(--warning)" }} />
              Alertas Activas
            </div>
            <div className="chart-card-subtitle">Productos que requieren atención</div>
            <div style={{ maxHeight: 280, overflowY: "auto" }}>
              {alerts && alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div key={alert._id} className={`alert-item ${alert.type}`}>
                    <div className="alert-item-icon">
                      {alert.type === "out_of_stock" ? (
                        <XCircle size={16} />
                      ) : (
                        <AlertTriangle size={16} />
                      )}
                    </div>
                    <div className="alert-item-content">
                      <div className="alert-item-title">
                        {alert.productName}
                        {alert.productBrand && (
                          <span
                            className={`badge brand-${alert.productBrand.toLowerCase()}`}
                            style={{ marginLeft: 8, fontSize: 10 }}
                          >
                            {alert.productBrand}
                          </span>
                        )}
                      </div>
                      <div className="alert-item-message">{alert.message}</div>
                      <div className="alert-item-time">
                        {formatDistanceToNow(new Date(alert.createdAt), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state" style={{ padding: 40 }}>
                  <CheckCircle2 />
                  <p>Sin alertas activas</p>
                  <span>Todo el inventario está en niveles saludables</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Products Stock Overview Table */}
        {products && products.length > 0 && (
          <div className="card" style={{ marginTop: 24 }}>
            <div className="card-header">
              <span className="card-title">Estado del Inventario Completo</span>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {products.length} productos
              </span>
            </div>
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
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: any) => {
                    const status = getStockStatus(product.stock, product.minStock);
                    const percentage = Math.min(
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
                        <td style={{ fontWeight: 600 }}>{product.name}</td>
                        <td>
                          <span className={`brand-dot ${product.brand}`}>{product.brand}</span>
                        </td>
                        <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                          {product.category}
                        </td>
                        <td style={{ fontWeight: 700 }}>{product.stock}</td>
                        <td style={{ color: "var(--text-muted)" }}>{product.minStock}</td>
                        <td>
                          <span className={`badge ${status}`}>
                            {status === "optimal"
                              ? "Óptimo"
                              : status === "reorder"
                                ? "Reorden"
                                : "Crítico"}
                          </span>
                        </td>
                        <td style={{ minWidth: 100 }}>
                          <div className="stock-bar">
                            <div
                              className={`stock-bar-fill ${status}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
