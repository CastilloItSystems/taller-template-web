import { Customer } from "./customer.interface";

export type SalesOrderStatus =
  | "borrador"
  | "pendiente"
  | "confirmada"
  | "parcial"
  | "despachada"
  | "cancelada";

export interface SalesLine {
  _id?: string;
  item: string; // Item id or populated object
  cantidad: number;
  precioUnitario: number;
  reservado?: number;
  entregado?: number;
}

export interface SalesReservation {
  _id: string;
  item: {
    _id: string;
    nombre: string;
    codigo?: string;
  };
  warehouse: {
    _id: string;
    nombre: string;
    codigo?: string;
  };
  cantidad: number;
  estado: "activo" | "liberado" | "consumido" | "cancelado";
  origenTipo: string;
  origen: string;
}

export interface SalesOrder {
  id: string;
  numero: string; // unique
  cliente?: Customer;
  fecha: string;
  estado: SalesOrderStatus;
  items: SalesLine[];
  reservations?: SalesReservation[];

  // Idempotency keys
  confirmIdempotencyKey?: string;
  shipIdempotencyKey?: string;
  cancelIdempotencyKey?: string;

  // Tracking dates
  fechaConfirmacion?: string;
  fechaDespacho?: string;
  fechaCancelacion?: string;

  // Audit
  creadoPor?: string;
  eliminado?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
