"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { UploadCloud, Image as ImageIcon, CheckCircle2, AlertCircle } from "lucide-react";

export default function ConfiguracionPage() {
    const settings = useQuery(api.appSettings.getSettings);
    const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
    const updateLogo = useMutation(api.appSettings.updateLogo);
    const currentUser = useQuery(api.auth.getCurrentUser);

    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
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
        setPreviewUrl(objectUrl);
        await handleUpload(file);
    };

    const handleUpload = async (file: File) => {
        try {
            setUploading(true);

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
            await updateLogo({ storageId });

            setSuccessMsg("¡Logo actualizado exitosamente!");
        } catch (err: any) {
            setError(err.message || "Error al subir el logo");
            setPreviewUrl(null);
        } finally {
            setUploading(false);
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
            </div>
        </>
    );
}
