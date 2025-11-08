export type PurchaseOrderStatus =
  | "pendiente"
  | "parcial"
  | "recibido"
  | "cancelado";

export interface PurchaseOrderLine {
  item: string; // Item id
  cantidad: number;
  precioUnitario: number;
  recibido?: number;
}

export interface PurchaseOrder {
  id: string;
  numero: string; // unique, required
  proveedor: string; // Supplier id
  fecha?: string;
  items: PurchaseOrderLine[]; // array requerida
  estado?: PurchaseOrderStatus; // default: 'pendiente'
  creadoPor?: string;
  eliminado?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
