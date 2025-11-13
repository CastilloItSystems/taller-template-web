import { useInventoryStore } from "@/store/inventoryStore";

// Interfaces importadas
import {
  Item,
  Movement,
  PurchaseOrder,
  SalesOrder,
  Supplier,
  Warehouse,
  Reservation,
} from "@/libs/interfaces/inventory";

// Función para inicializar datos mock en el store
export const initializeInventoryMockData = () => {
  const store = useInventoryStore.getState();

  // Solo inicializar si no hay datos
  if (store.items.length === 0) {
    // Artículos mock
    const mockItems: Item[] = [
      {
        id: "ITEM001",
        sku: "ACEITE-5W30",
        codigo: "ACE-001",
        nombre: "Aceite Motor 5W-30",
        descripcion: "Aceite sintético para motores de alto rendimiento",
        marca: "Castrol",
        modelo: "Edge 5W-30",
        categoria: "Lubricantes",
        unidad: "litro",
        precioCosto: 450.0,
        precioVenta: 650.0,
        stockMinimo: 10,
        stockMaximo: 100,
        estado: "activo",
        createdBy: "admin",
        createdAt: "2025-11-01T10:00:00Z",
      },
      {
        id: "ITEM002",
        sku: "FILTRO-AIRE",
        codigo: "FIL-001",
        nombre: "Filtro de Aire",
        descripcion: "Filtro de aire para motores Toyota",
        marca: "Toyota",
        modelo: "Corolla 2020",
        categoria: "Filtros",
        unidad: "pieza",
        precioCosto: 120.0,
        precioVenta: 180.0,
        stockMinimo: 5,
        stockMaximo: 50,
        estado: "activo",
        createdBy: "admin",
        createdAt: "2025-11-01T10:00:00Z",
      },
      {
        id: "ITEM003",
        sku: "BUJIA-IRIDIUM",
        codigo: "BUJ-001",
        nombre: "Bujía Iridium",
        descripcion: "Bujía de iridio de alto rendimiento",
        marca: "NGK",
        modelo: "IXEH22",
        categoria: "Encendido",
        unidad: "pieza",
        precioCosto: 85.0,
        precioVenta: 130.0,
        stockMinimo: 20,
        stockMaximo: 200,
        estado: "activo",
        createdBy: "admin",
        createdAt: "2025-11-01T10:00:00Z",
      },
    ];

    mockItems.forEach((item) => store.agregarItem(item));
  }

  if (store.suppliers.length === 0) {
    // Proveedores mock
    const mockSuppliers: Supplier[] = [
      {
        id: "SUP001",
        nombre: "AutoParts México",
        contacto: "Juan García",
        telefono: "555-0101",
        correo: "ventas@autoparts.mx",
        direccion: "Av. Insurgentes 123, CDMX",
        estado: "activo",
        createdAt: "2025-11-01T10:00:00Z",
      },
      {
        id: "SUP002",
        nombre: "Lubricantes del Valle",
        contacto: "María López",
        telefono: "555-0102",
        correo: "info@lubricantesvalle.com",
        direccion: "Calle Juárez 456, Guadalajara",
        estado: "activo",
        createdAt: "2025-11-01T10:00:00Z",
      },
    ];

    mockSuppliers.forEach((supplier) => store.agregarSupplier(supplier));
  }

  if (store.warehouses.length === 0) {
    // Almacenes mock
    const mockWarehouses: Warehouse[] = [
      {
        id: "WH001",
        nombre: "Almacén Principal",
        ubicacion: "Av. Principal 123, CDMX",
        tipo: "almacen",
        capacidad: 10000,
        estado: "activo",
        createdAt: "2025-11-01T10:00:00Z",
      },
      {
        id: "WH002",
        nombre: "Almacén Refacciones",
        ubicacion: "Calle Secundaria 456, CDMX",
        tipo: "bodega",
        capacidad: 5000,
        estado: "activo",
        createdAt: "2025-11-01T10:00:00Z",
      },
    ];

    mockWarehouses.forEach((warehouse) => store.agregarWarehouse(warehouse));
  }

  if (store.purchaseOrders.length === 0) {
    // Órdenes de compra mock
    const mockPurchaseOrders: PurchaseOrder[] = [
      {
        id: "PO001",
        numero: "OC-2025-001",
        proveedor: {
          id: "SUP001",
          nombre: "AutoParts México",
          _id: "SUP001",
          telefono: "555-0101",
          correo: "ventas@autoparts.mx",
          tipo: "empresa",
        },
        fecha: "2025-11-10",
        items: [
          {
            item: "ITEM001",
            cantidad: 50,
            precioUnitario: 450.0,
            recibido: 30,
          },
          {
            item: "ITEM002",
            cantidad: 25,
            precioUnitario: 120.0,
            recibido: 25,
          },
        ],
        estado: "parcial",
        creadoPor: "admin",
        createdAt: "2025-11-10T09:00:00Z",
      },
      {
        id: "PO002",
        numero: "OC-2025-002",
        proveedor: {
          id: "SUP002",
          nombre: "Lubricantes del Valle",
          _id: "SUP002",
          telefono: "555-0102",
          correo: "info@lubricantesvalle.com",
          tipo: "empresa",
        },
        fecha: "2025-11-11",
        items: [
          {
            item: "ITEM003",
            cantidad: 100,
            precioUnitario: 85.0,
            recibido: 0,
          },
        ],
        estado: "pendiente",
        creadoPor: "admin",
        createdAt: "2025-11-11T10:00:00Z",
      },
    ];

    mockPurchaseOrders.forEach((po) => store.agregarPurchaseOrder(po));
  }

  if (store.salesOrders.length === 0) {
    // Órdenes de venta mock
    const mockSalesOrders: SalesOrder[] = [
      {
        id: "SO001",
        numero: "OV-2025-001",
        customer: {
          id: "C001",
          nombre: "Cliente A",
          telefono: "555-0201",
          correo: "carlos@clienteA.com",
          direccion: "Calle Principal 789, CDMX",
          tipo: "empresa",
          _id: "C001",
        },
        fecha: "2025-11-10",
        estado: "confirmada",
        items: [
          {
            item: "ITEM001",
            cantidad: 5,
            precioUnitario: 650.0,
            entregado: 5,
          },
          {
            item: "ITEM002",
            cantidad: 2,
            precioUnitario: 180.0,
            entregado: 2,
          },
        ],
        createdAt: "2025-11-10T14:00:00Z",
      },
      {
        id: "SO002",
        numero: "OV-2025-002",
        customer: {
          id: "C002",
          nombre: "Cliente B",
          telefono: "555-0202",
          correo: "maria@clienteB.com",
          direccion: "Avenida Reforma 101, CDMX",
          tipo: "empresa",
          _id: "C002",
        },
        fecha: "2025-11-11",
        estado: "pendiente",
        items: [
          {
            item: "ITEM003",
            cantidad: 4,
            precioUnitario: 130.0,
            entregado: 0,
          },
        ],
        createdAt: "2025-11-11T15:00:00Z",
      },
    ];

    mockSalesOrders.forEach((so) => store.agregarSalesOrder(so));
  }

  if (store.movements.length === 0) {
    // Movimientos mock
    const mockMovements: Movement[] = [
      {
        id: "MOV001",
        tipo: "entrada",
        referencia: "PO001",
        item: "ITEM001",
        cantidad: 30,
        costoUnitario: 450.0,
        warehouseTo: "WH001",
        usuario: "admin",
        createdAt: "2025-11-10T11:00:00Z",
      },
      {
        id: "MOV002",
        tipo: "salida",
        referencia: "SO001",
        item: "ITEM001",
        cantidad: 5,
        costoUnitario: 450.0,
        warehouseFrom: "WH001",
        usuario: "admin",
        createdAt: "2025-11-10T16:00:00Z",
      },
      {
        id: "MOV003",
        tipo: "entrada",
        referencia: "PO001",
        item: "ITEM002",
        cantidad: 25,
        costoUnitario: 120.0,
        warehouseTo: "WH001",
        usuario: "admin",
        createdAt: "2025-11-10T12:00:00Z",
      },
    ];

    mockMovements.forEach((movement) => store.agregarMovement(movement));
  }
};
