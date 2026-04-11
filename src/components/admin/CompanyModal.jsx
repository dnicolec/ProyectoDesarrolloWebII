import { useState, useEffect, useRef } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { actualizarEmpresa } from "../../services/empresasService";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signOut,
} from "firebase/auth";
import { getApp, getApps, initializeApp } from "firebase/app";
import { db, firebaseConfig } from "../../lib/firebase";
import { doc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";

const CLOUDINARY_CLOUD_NAME = "djvuvmjix";
const CLOUDINARY_UPLOAD_PRESET = "logos-empresas";

const validarCodigo = (codigo) => /^[A-Za-z]{3}\d{3}$/.test(codigo);
const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validarTelefono = (tel) => /^\d{4}-?\d{4}$/.test(tel.trim());
const validarComision = (val) => {
  const n = Number(val);
  return !isNaN(n) && n >= 0 && n <= 100;
};

// creamos conexión fantasma para poder crear las empresas y que se puedan registrar
const appFantasma = getApps().find((app) => app.name === "AppFantasma")
  ? getApp("AppFantasma")
  : initializeApp(firebaseConfig, "AppFantasma");
const authFantasma = getAuth(appFantasma);

export default function CompanyModal({ empresa, rubros, onClose, onGuardado }) {
  const esEdicion = !!empresa;
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    nombre: "",
    codigo: "",
    email: "",
    telefono: "",
    rubro: "",
    direccion: "",
    nombre_contacto: "",
    porcentaje_comision: "",
    sitio_web: "",
  });
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState("");

  useEffect(() => {
    if (empresa) {
      setForm({
        nombre: empresa.nombre || "",
        codigo: empresa.codigo || "",
        email: empresa.email || "",
        telefono: empresa.telefono || "",
        rubro: empresa.rubro || "",
        direccion: empresa.direccion || "",
        nombre_contacto: empresa.nombre_contacto || "",
        porcentaje_comision: empresa.porcentaje_comision ?? "",
        sitio_web: empresa.sitio_web || "",
      });
      if (empresa.logo) {
        setLogoUrl(empresa.logo);
        setLogoPreview(empresa.logo);
      }
    }
  }, [empresa]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrores((prev) => ({ ...prev, [field]: "" }));
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview local inmediato
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Subir a Cloudinary
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
      );
      const data = await res.json();

      if (data.secure_url) {
        setLogoUrl(data.secure_url);
      } else {
        console.error("Respuesta de Cloudinary:", data);
        throw new Error(
          data.error?.message || "No se obtuvo URL de Cloudinary",
        );
      }
    } catch {
      setErrorGeneral("Error al subir la imagen. Intenta de nuevo.");
      setLogoPreview("");
      setLogoUrl("");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl("");
    setLogoPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Nombre requerido";
    if (!validarCodigo(form.codigo)) e.codigo = "Formato inválido (ej: ABC123)";
    if (!validarEmail(form.email)) e.email = "Correo inválido";
    if (!validarTelefono(form.telefono)) e.telefono = "Debe tener 8 dígitos";
    if (!form.rubro) e.rubro = "Selecciona un rubro";
    if (!form.direccion.trim()) e.direccion = "Dirección requerida";
    if (!form.nombre_contacto.trim())
      e.nombre_contacto = "Nombre de contacto requerido";
    if (!validarComision(form.porcentaje_comision))
      e.porcentaje_comision = "Debe ser un número entre 0 y 100";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const erroresValidacion = validar();
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion);
      return;
    }
    if (uploadingLogo) {
      setErrorGeneral("Espera a que termine de subir la imagen.");
      return;
    }
    setLoading(true);
    setErrorGeneral("");
    try {
      const datos = {
        ...form,
        porcentaje_comision: Number(form.porcentaje_comision),
        logo: logoUrl || null,
      };
      if (esEdicion) {
        await actualizarEmpresa(empresa.id, datos);
      } else {
        const passwordTemporal = import.meta.env.VITE_DEFAULT_PASSWORD;

        if (!passwordTemporal) {
          throw new Error("Falta la contraseña por defecto en el archivo .env");
        }

        const companyCredential = await createUserWithEmailAndPassword(
          authFantasma,
          form.email,
          passwordTemporal,
        );

        const nuevoUid = companyCredential.user.uid;
        await setDoc(doc(db, "empresas", nuevoUid), {
          ...datos,
          id: nuevoUid,
          status: "activa",
          createdAt: serverTimestamp(),
        });

        await setDoc(doc(db, "usuarios", nuevoUid), {
          nombre: datos.nombre_contacto,
          correo: datos.email,
          role: "admin_empresa",
          empresaId: nuevoUid,
          mustChangePass: true,
          activo: true,
          createdAt: serverTimestamp(),
        });

        await signOut(authFantasma);
      }
      onGuardado();
      onClose();
    } catch {
      setErrorGeneral("Ocurrió un error al guardar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-cream w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream sticky top-0 bg-white z-10 gap-3">
          <h2 className="font-serif font-bold text-navy text-lg shrink-0">
            {esEdicion ? "Editar empresa" : "Nueva empresa"}
          </h2>
          <div className="flex items-center gap-2 ml-auto">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="company-form"
              size="sm"
              loading={loading}
              disabled={uploadingLogo}
            >
              {esEdicion ? "Guardar" : "Crear empresa"}
            </Button>
          </div>
          <button
            onClick={onClose}
            className="text-navy/40 hover:text-navy transition-colors p-1 shrink-0"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form
          id="company-form"
          onSubmit={handleSubmit}
          className="px-6 py-5 space-y-4"
        >
          {errorGeneral && (
            <div className="bg-coral/10 border border-coral/30 text-coral text-sm rounded-xl px-4 py-3">
              {errorGeneral}
            </div>
          )}

          {/* Logo uploader */}
          <div>
            <label className="text-sm font-medium text-navy block mb-1.5">
              Logo de la empresa
            </label>
            <div className="flex items-center gap-4">
              {/* Preview */}
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-cream bg-cream-bg flex items-center justify-center flex-shrink-0 overflow-hidden">
                {uploadingLogo ? (
                  <svg
                    className="animate-spin w-5 h-5 text-teal"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-navy/20"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                )}
              </div>
              {/* Botones */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="text-xs font-medium text-teal border border-teal/30 rounded-lg px-3 py-1.5 hover:bg-teal/5 transition-colors disabled:opacity-50"
                >
                  {uploadingLogo
                    ? "Subiendo..."
                    : logoPreview
                      ? "Cambiar imagen"
                      : "Subir imagen"}
                </button>
                {logoPreview && !uploadingLogo && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="text-xs font-medium text-coral border border-coral/30 rounded-lg px-3 py-1.5 hover:bg-coral/5 transition-colors"
                  >
                    Quitar imagen
                  </button>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
            <p className="text-xs text-navy/40 mt-1.5">
              PNG, JPG o SVG. Se sube automáticamente al seleccionar.
            </p>
          </div>

          <Input
            label="Nombre de la empresa"
            required
            value={form.nombre}
            onChange={handleChange("nombre")}
            error={errores.nombre}
            placeholder="Ej: Restaurante San Juan"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Código"
              required
              value={form.codigo}
              onChange={handleChange("codigo")}
              error={errores.codigo}
              placeholder="ABC123"
              hint="3 letras + 3 dígitos"
            />
            <Input
              label="% Comisión"
              required
              type="number"
              min="0"
              max="100"
              value={form.porcentaje_comision}
              onChange={handleChange("porcentaje_comision")}
              error={errores.porcentaje_comision}
              placeholder="Ej: 5"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-navy block mb-1.5">
              Rubro <span className="text-coral ml-0.5">*</span>
            </label>
            <select
              value={form.rubro}
              onChange={handleChange("rubro")}
              className={`w-full rounded-xl border-2 bg-white px-4 py-2.5 text-navy text-[0.9rem] font-sans transition-all focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/20
                ${errores.rubro ? "border-coral ring-2 ring-coral/20" : "border-cream hover:border-coral/50"}`}
            >
              <option value="">Selecciona un rubro</option>
              {rubros.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
            {errores.rubro && (
              <p className="text-sm text-coral mt-1">{errores.rubro}</p>
            )}
          </div>

          <Input
            label="Nombre del contacto"
            required
            value={form.nombre_contacto}
            onChange={handleChange("nombre_contacto")}
            error={errores.nombre_contacto}
            placeholder="Ej: Juan García"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Correo"
              required
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              error={errores.email}
              placeholder="contacto@empresa.com"
            />
            <Input
              label="Teléfono"
              required
              value={form.telefono}
              onChange={handleChange("telefono")}
              error={errores.telefono}
              placeholder="12345678"
            />
          </div>

          <Input
            label="Dirección"
            required
            value={form.direccion}
            onChange={handleChange("direccion")}
            error={errores.direccion}
            placeholder="Ej: Col. Escalón, San Salvador"
          />
          <Input
            label="Sitio web"
            value={form.sitio_web}
            onChange={handleChange("sitio_web")}
            placeholder="https://empresa.com"
          />
        </form>
      </div>
    </div>
  );
}
