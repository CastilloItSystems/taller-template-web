import { z } from "zod";

// Work Order Status Schema
export const workOrderStatusSchema = z.object({
  codigo: z.string().min(1, "El código es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional(),
  color: z.string().optional(),
  icono: z.string().optional(),
  orden: z.number().min(0).optional(),
  estado: z.enum(["activo", "inactivo"]).optional(),
});

export type WorkOrderStatusFormData = z.infer<typeof workOrderStatusSchema>;
