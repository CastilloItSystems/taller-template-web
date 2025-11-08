import { array, boolean, date, number, object, string, union, z } from "zod";

export const salesOrderStatusSchema = z.enum([
  "borrador",
  "pendiente",
  "confirmada",
  "parcial",
  "despachada",
  "cancelada",
]);

export const salesLineSchema = object({
  _id: string().optional(),
  item: string().min(1, "El item es obligatorio"),
  cantidad: number()
    .min(1, "La cantidad debe ser al menos 1")
    .refine((val) => val > 0, {
      message: "La cantidad debe ser mayor a 0",
    }),
  precioUnitario: number()
    .min(0, "El precio unitario no puede ser negativo")
    .default(0),
  reservado: number()
    .min(0, "La cantidad reservada no puede ser negativa")
    .default(0)
    .optional(),
  entregado: number()
    .min(0, "La cantidad entregada no puede ser negativa")
    .default(0)
    .optional(),
});

export const salesOrderSchema = object({
  id: string().optional(),
  numero: string()
    .min(1, "El número de orden es obligatorio")
    .max(50, "El número de orden no puede exceder los 50 caracteres")
    .optional(),
  cliente: string().optional(),
  fecha: union([string(), date()]).optional(),
  items: array(salesLineSchema)
    .min(1, "Debe incluir al menos un item en la orden")
    .refine((items) => items.length > 0, {
      message: "La orden debe tener al menos un item",
    }),
  estado: salesOrderStatusSchema.default("borrador").optional(),

  // Idempotency keys
  confirmIdempotencyKey: string().optional(),
  shipIdempotencyKey: string().optional(),
  cancelIdempotencyKey: string().optional(),

  // Tracking dates
  fechaConfirmacion: string().optional(),
  fechaDespacho: string().optional(),
  fechaCancelacion: string().optional(),

  // Audit
  creadoPor: string().optional(),
  eliminado: boolean().default(false).optional(),
  createdAt: string().optional(),
  updatedAt: string().optional(),
});
