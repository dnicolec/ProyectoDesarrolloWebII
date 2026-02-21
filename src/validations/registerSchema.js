import { z } from "zod";

export const registerSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido"),
  apellido: z.string().min(2, "Apellido requerido"),
  telefono: z.string().regex(/^\d{8}$/, "Teléfono debe tener 8 dígitos"),
  correo: z.string().email("Correo inválido"),
  direccion: z.string().min(5, "Dirección requerida"),
  dui: z.string().regex(/^\d{8}-\d$/, "DUI inválido (formato 00000000-0)"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});