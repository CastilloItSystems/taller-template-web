// Workshop Work Order Status Interface

export interface WorkOrderStatus {
  _id?: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  icono?: string;
  orden?: number;
  activo?: boolean;
  eliminado?: boolean;
  tipo?: "inicial" | "intermedio" | "final" | "cancelado";
  requiereAprobacion?: boolean;
  requiereDocumentacion?: boolean;
  notificarCliente?: boolean;
  notificarTecnico?: boolean;
  transicionesPermitidas?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  id?: string;
}

export interface WorkOrderStatusReference {
  _id: string;
  codigo: string;
  nombre: string;
  color?: string;
  icono?: string;
  id: string;
}
