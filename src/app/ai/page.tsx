"use client";

import { useState, useRef } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
    Brain,
    Send,
    TrendingUp,
    MessageSquare,
    Megaphone,
    Camera,
    Sparkles,
    User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

type TabType = "nlq" | "prediction" | "marketing" | "vision";

export default function AIPage() {
    const [activeTab, setActiveTab] = useState<TabType>("nlq");

    return (
        <>
            <div className="page-header">
                <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Sparkles size={24} style={{ color: "var(--jetour-blue)" }} />
                    AI Insights
                </h2>
                <p>Motor analítico con Google Gemini 1.5 Pro</p>
            </div>

            <div className="page-body fade-in">
                {/* Tab Navigation */}
                <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                    {([
                        { id: "nlq", label: "Consulta Natural", icon: MessageSquare },
                        { id: "prediction", label: "Análisis Predictivo", icon: TrendingUp },
                        { id: "marketing", label: "Copy Marketing", icon: Megaphone },
                        { id: "vision", label: "Auditoría Visual", icon: Camera },
                    ] as { id: TabType; label: string; icon: typeof Brain }[]).map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                className={`btn ${activeTab === tab.id ? "btn-secondary" : "btn-outline"}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {activeTab === "nlq" && <NLQTab />}
                {activeTab === "prediction" && <PredictionTab />}
                {activeTab === "marketing" && <MarketingTab />}
                {activeTab === "vision" && <VisionTab />}
            </div>
        </>
    );
}

function NLQTab() {
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState<
        { role: "user" | "assistant"; content: string }[]
    >([]);
    const [loading, setLoading] = useState(false);
    const nlq = useAction(api.gemini.naturalLanguageQuery);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || loading) return;

        const userMessage = query;
        setQuery("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setLoading(true);

        try {
            const response = await nlq({ query: userMessage });
            setMessages((prev) => [...prev, { role: "assistant", content: response }]);
        } catch (err: any) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: `❌ Error: ${err.message}. Asegúrate de configurar GEMINI_API_KEY en Convex.`,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-chat">
            <div className="ai-chat-messages">
                {messages.length === 0 && (
                    <div className="empty-state" style={{ padding: 40 }}>
                        <MessageSquare />
                        <p>Consulta tu inventario en lenguaje natural</p>
                        <span>
                            Ejemplo: &quot;¿Cuál es la sucursal con mayor retiro de llaveros en Ambato?&quot;
                        </span>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`ai-message ${msg.role}`}>
                        <div className="ai-message-avatar">
                            {msg.role === "user" ? <User size={16} /> : <Brain size={16} />}
                        </div>
                        <div className="ai-message-content">
                            <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="ai-message assistant">
                        <div className="ai-message-avatar">
                            <Brain size={16} />
                        </div>
                        <div className="ai-message-content">
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                Analizando datos...
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="ai-chat-input">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Pregunta sobre tu inventario..."
                    disabled={loading}
                />
                <button type="submit" className="btn btn-secondary btn-sm" disabled={loading || !query.trim()}>
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
}

function PredictionTab() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");
    const [brand, setBrand] = useState("");
    const predict = useAction(api.gemini.predictiveStockAnalysis);

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const response = await predict({ brand: brand || undefined });
            setResult(response);
        } catch (err: any) {
            setResult(`❌ Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <select
                        className="form-select"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        style={{ maxWidth: 200 }}
                    >
                        <option value="">Todas las marcas</option>
                        <option value="JAC">JAC</option>
                        <option value="Jetour">Jetour</option>
                        <option value="Karry">Karry</option>
                    </select>
                    <button
                        className="btn btn-secondary"
                        onClick={handleAnalyze}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                Analizando...
                            </>
                        ) : (
                            <>
                                <TrendingUp size={16} />
                                Ejecutar Análisis Predictivo
                            </>
                        )}
                    </button>
                </div>
            </div>

            {result && (
                <div className="card" style={{ padding: 24 }}>
                    <div className="chart-card-title" style={{ marginBottom: 16 }}>
                        <Sparkles size={18} style={{ color: "var(--jetour-blue)" }} /> Resultado del Análisis
                    </div>
                    <div style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6 }}>{result}</div>
                </div>
            )}
        </div>
    );
}

function MarketingTab() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");
    const [platform, setPlatform] = useState<"whatsapp" | "instagram" | "facebook">("whatsapp");
    const [context, setContext] = useState("");
    const generate = useAction(api.gemini.generateMarketingCopy);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const response = await generate({ platform, context: context || undefined });
            setResult(response);
        } catch (err: any) {
            setResult(`❌ Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                <div className="form-group">
                    <label className="form-label">Plataforma</label>
                    <div style={{ display: "flex", gap: 8 }}>
                        {(["whatsapp", "instagram", "facebook"] as const).map((p) => (
                            <button
                                key={p}
                                className={`btn ${platform === p ? "btn-secondary" : "btn-outline"} btn-sm`}
                                onClick={() => setPlatform(p)}
                            >
                                {p === "whatsapp" ? "📱 WhatsApp" : p === "instagram" ? "📸 Instagram" : "📘 Facebook"}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Contexto (opcional)</label>
                    <input
                        type="text"
                        className="form-input"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="Ej: Tenemos 50 gorras JAC para la feria de fin de año"
                    />
                </div>
                <button
                    className="btn btn-secondary"
                    onClick={handleGenerate}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                            Generando...
                        </>
                    ) : (
                        <>
                            <Megaphone size={16} />
                            Generar Copy
                        </>
                    )}
                </button>
            </div>

            {result && (
                <div className="card" style={{ padding: 24 }}>
                    <div className="chart-card-title" style={{ marginBottom: 16 }}>
                        <Megaphone size={18} style={{ color: "var(--jac-red)" }} /> Copy Generado
                    </div>
                    <div style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6 }}>{result}</div>
                </div>
            )}
        </div>
    );
}

function VisionTab() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");
    const [activationType, setActivationType] = useState("Activación Mall");
    const [location, setLocation] = useState("Ambato");
    const audit = useAction(api.gemini.auditActivationPhoto);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = (reader.result as string).split(",")[1];
            try {
                const response = await audit({
                    imageBase64: base64,
                    activationType,
                    location,
                });
                setResult(response);
            } catch (err: any) {
                setResult(`❌ Error: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div>
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Tipo de Activación</label>
                        <input
                            type="text"
                            className="form-input"
                            value={activationType}
                            onChange={(e) => setActivationType(e.target.value)}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Ubicación</label>
                        <input
                            type="text"
                            className="form-input"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                </div>

                <label
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "40px 20px",
                        border: "2px dashed var(--border-color)",
                        borderRadius: "var(--radius)",
                        cursor: "pointer",
                        transition: "border-color 0.2s",
                        background: "#F8FAFC",
                    }}
                >
                    <Camera size={32} style={{ color: "var(--text-muted)", marginBottom: 12 }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>
                        {loading ? "Analizando imagen..." : "Subir foto de activación"}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                        JPG, PNG — Máximo 10MB
                    </span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        style={{ display: "none" }}
                        disabled={loading}
                    />
                    {loading && (
                        <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2, marginTop: 12 }} />
                    )}
                </label>
            </div>

            {result && (
                <div className="card" style={{ padding: 24 }}>
                    <div className="chart-card-title" style={{ marginBottom: 16 }}>
                        <Camera size={18} style={{ color: "var(--jetour-blue)" }} /> Resultado de Auditoría
                    </div>
                    <div style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6 }}>{result}</div>
                </div>
            )}
        </div>
    );
}
