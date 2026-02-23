"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { UploadCloud, Image as ImageIcon, CheckCircle2, AlertCircle, Palette, MonitorSmartphone } from "lucide-react";
import { useEffect } from "react";

export default function ConfiguracionPage() {
    const settings = useQuery(api.appSettings.getSettings);
    const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
    const updateLogo = useMutation(api.appSettings.updateLogo);
    const updateFavicon = useMutation(api.appSettings.updateFavicon);
    const updateTheme = useMutation(api.appSettings.updateTheme);
    const currentUser = useQuery(api.auth.getCurrentUser);

    const [uploading, setUploading] = useState(false);
    const [faviconUploading, setFaviconUploading] = useState(false);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);

    const [themeForm, setThemeForm] = useState({
        appName: "MIMS — Grupo Palacios",
        primary: "#D2232A",
        sidebarBg: "#0F172A",
        sidebarText: "#F8FAFC"
    });
    const [savingTheme, setSavingTheme] = useState(false);

    useEffect(() => {
        if (settings) {
            setThemeForm({
                appName: settings.appName || "MIMS — Grupo Palacios",
                primary: settings.colors?.primary || "#D2232A",
                sidebarBg: settings.colors?.sidebarBg || "#0F172A",
                sidebarText: settings.colors?.sidebarText || "#F8FAFC"
            });
        }
    }, [settings]);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>, isFavicon: boolean = false) => {
        setError("");
        setSuccessMsg("");

        const file = e.target.files?.[0];
        if (!file) return;

        // Validation for image formats
        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
            setError("Formato no válido. Sube un archivo JPG, PNG o WebP.");
            return;
        }

        // Create browser preview
        const objectUrl = URL.createObjectURL(file);
        if (isFavicon) {
            setFaviconPreview(objectUrl);
            await handleUpload(file, true);
        } else {
            setPreviewUrl(objectUrl);
            await handleUpload(file, false);
        }
    };

    const handleUpload = async (file: File, isFavicon: boolean = false) => {
        try {
            if (isFavicon) setFaviconUploading(true);
            else setUploading(true);

            // 1. Get short-lived upload URL
            const postUrl = await generateUploadUrl();

            // 2. Upload file
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (!result.ok) throw new Error("Fallo al subir el archivo");

            const { storageId } = await result.json();

            // 3. Save storageId in appSettings
            if (isFavicon) {
                await updateFavicon({ storageId });
                setSuccessMsg("¡Favicon actualizado exitosamente!");
            } else {
                await updateLogo({ storageId });
                setSuccessMsg("¡Logo actualizado exitosamente!");
            }
        } catch (err: any) {
            setError(err.message || "Error al subir el archivo");
            if (isFavicon) setFaviconPreview(null);
            else setPreviewUrl(null);
        } finally {
            if (isFavicon) setFaviconUploading(false);
            else setUploading(false);
        }
    };

    const handleSaveTheme = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        setSavingTheme(true);
        try {
            await updateTheme({
                appName: themeForm.appName,
                colors: {
                    primary: themeForm.primary,
                    sidebarBg: themeForm.sidebarBg,
                    sidebarText: themeForm.sidebarText
                }
            });
            setSuccessMsg("¡Tematización guardada exitosamente!");
        } catch (err: any) {
            setError(err.message || "Error al guardar el tema");
        } finally {
            setSavingTheme(false);
        }
    };

    if (currentUser === undefined) return null;
    if (currentUser?.role !== "admin") {
        return (
            <div className="empty-state">
                <AlertCircle size={48} color="var(--danger)" />
                <h3>Acceso Denegado</h3>
                <p>Solo los administradores pueden acceder a Configuración.</p>
            </div>
        );
    }

    return (
        <>
            <div className="page-header">
                <h2>Configuración del Sistema</h2>
                <p>Ajustes globales y apariencia visual</p>
            </div>

            <div className="page-body fade-in">
                <div className="card" style={{ maxWidth: 600, padding: 24 }}>
                    <h3 style={{ fontSize: 18, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                        <ImageIcon size={20} style={{ color: "var(--jac-red)" }} />
                        Logotipo Corporativo
                    </h3>
                    <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
                        Sube un logotipo personalizado que se mostrará en el menú lateral y la pantalla de inicio de sesión.
                        Formatos soportados: JPG, PNG, WebP.
                    </p>

                    {error && (
                        <div className="login-error" style={{ marginBottom: 16 }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}
                    {successMsg && (
                        <div className="login-error" style={{ backgroundColor: "var(--success-light)", color: "var(--success-dark)", borderLeftColor: "var(--success)", marginBottom: 16 }}>
                            <CheckCircle2 size={16} />
                            {successMsg}
                        </div>
                    )}

                    <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
                        {/* Current/Preview Logo */}
                        <div
                            style={{
                                width: 140,
                                height: 140,
                                borderRadius: 12,
                                border: "1px dashed var(--border-color)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                                backgroundColor: "var(--bg-light)",
                                flexShrink: 0,
                            }}
                        >
                            {(previewUrl || settings?.logoUrl) ? (
                                <img
                                    src={previewUrl || settings?.logoUrl}
                                    alt="Logo preview"
                                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", padding: 8 }}
                                />
                            ) : (
                                <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
                                    <ImageIcon size={32} opacity={0.5} />
                                    <div style={{ fontSize: 12, marginTop: 4 }}>Sin Logo</div>
                                </div>
                            )}
                        </div>

                        {/* Upload Controls */}
                        <div style={{ flex: 1 }}>
                            <input
                                type="file"
                                accept="image/jpeg, image/png, image/webp"
                                ref={fileInputRef}
                                style={{ display: "none" }}
                                onChange={handleFileChange}
                            />

                            <button
                                className="btn btn-primary"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                style={{ width: "100%", justifyContent: "center" }}
                            >
                                {uploading ? <span className="spinner" /> : (
                                    <>
                                        <UploadCloud size={18} />
                                        Subir Nuevo Logo
                                    </>
                                )}
                            </button>
                            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12, lineHeight: 1.5 }}>
                                Recomendamos una imagen con fondo transparente (PNG) y dimensiones cuadradas u horizontales cortas (ej. 400x150px).
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ maxWidth: 600, padding: 24, marginTop: 24 }}>
                    <h3 style={{ fontSize: 18, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                        <MonitorSmartphone size={20} style={{ color: "var(--jac-red)" }} />
                        Favicon de Aplicación
                    </h3>
                    <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
                        Icono que se refleja en la pestaña del navegador web. Recomendable .png transparente y cuadrado (32x32px).
                    </p>
                    <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
                        <div
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 8,
                                border: "1px dashed var(--border-color)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                                backgroundColor: "var(--bg-light)",
                                flexShrink: 0,
                            }}
                        >
                            {(faviconPreview || settings?.faviconUrl) ? (
                                <img
                                    src={faviconPreview || settings?.faviconUrl}
                                    alt="Favicon preview"
                                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                                />
                            ) : (
                                <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
                                    <ImageIcon size={24} opacity={0.5} />
                                </div>
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <input
                                type="file"
                                accept="image/jpeg, image/png, image/webp, image/x-icon"
                                ref={faviconInputRef}
                                style={{ display: "none" }}
                                onChange={(e) => handleFileChange(e, true)}
                            />

                            <button
                                className="btn btn-outline"
                                onClick={() => faviconInputRef.current?.click()}
                                disabled={faviconUploading}
                                style={{ width: "100%", justifyContent: "center" }}
                            >
                                {faviconUploading ? <span className="spinner" /> : (
                                    <>
                                        <UploadCloud size={18} />
                                        Subir Favicon
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ maxWidth: 600, padding: 24, marginTop: 24 }}>
                    <h3 style={{ fontSize: 18, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                        <Palette size={20} style={{ color: "var(--jac-red)" }} />
                        Tematización Visual y Nomenclatura
                    </h3>
                    <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
                        Ajusta el nombre de la plataforma y los colores primarios para adaptarlo al branding de la marca que lo gestiona.
                    </p>

                    <form onSubmit={handleSaveTheme}>
                        <div className="form-group">
                            <label className="form-label">Nombre de la Aplicación (Título Superior)</label>
                            <input
                                type="text"
                                className="form-input"
                                value={themeForm.appName}
                                onChange={(e) => setThemeForm({ ...themeForm, appName: e.target.value })}
                                required
                            />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Color Principal</label>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <input
                                        type="color"
                                        style={{ height: 38, width: 44, padding: 0, background: "none", border: "none", cursor: "pointer" }}
                                        value={themeForm.primary}
                                        onChange={(e) => setThemeForm({ ...themeForm, primary: e.target.value })}
                                    />
                                    <span style={{ fontSize: 12, fontFamily: "monospace" }}>{themeForm.primary}</span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Fondo Menú Lateral</label>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <input
                                        type="color"
                                        style={{ height: 38, width: 44, padding: 0, background: "none", border: "none", cursor: "pointer" }}
                                        value={themeForm.sidebarBg}
                                        onChange={(e) => setThemeForm({ ...themeForm, sidebarBg: e.target.value })}
                                    />
                                    <span style={{ fontSize: 12, fontFamily: "monospace" }}>{themeForm.sidebarBg}</span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Texto Menú Lateral</label>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <input
                                        type="color"
                                        style={{ height: 38, width: 44, padding: 0, background: "none", border: "none", cursor: "pointer" }}
                                        value={themeForm.sidebarText}
                                        onChange={(e) => setThemeForm({ ...themeForm, sidebarText: e.target.value })}
                                    />
                                    <span style={{ fontSize: 12, fontFamily: "monospace" }}>{themeForm.sidebarText}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={savingTheme}
                            style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
                        >
                            {savingTheme ? <span className="spinner" /> : "Guardar Tematización"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
