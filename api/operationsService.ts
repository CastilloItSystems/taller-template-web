import { useOperationsStore } from "@/store/operationsStore";
import { initializeInventoryMockData } from "./inventoryService";

// Interfaces importadas
import {
  WorkOrder,
  WorkOrderStatus,
  Invoice,
  Payment,
  Service,
  ServiceBay,
  ServiceCategory,
} from "@/libs/interfaces/workshop";

// Función para inicializar datos mock en el store
export const initializeMockData = () => {
  const store = useOperationsStore.getState();

  // Solo inicializar si no hay datos
  if (store.workOrders.length === 0) {
    // Órdenes de trabajo mock
    const mockWorkOrders = [
      {
        _id: "WO001",
        workOrderNumber: "OT-2025-001",
        customer: {
          _id: "C001",
          nombre: "Juan Pérez",
          telefono: "555-0101",
          id: "C001",
        },
        vehicle: { _id: "V001", placa: "ABC-123", id: "V001" },
        estado: { nombre: "En Progreso", color: "#3b82f6" },
        priority: "high",
        prioridad: "alta",
        description: "Mantenimiento general",
        totalAmount: 2500.0,
        fechaApertura: "2025-11-10",
        items: [],
        createdBy: { _id: "U001", nombre: "Admin" },
        historial: [],
      } as any,
      {
        _id: "WO002",
        workOrderNumber: "OT-2025-002",
        customer: {
          _id: "C002",
          nombre: "María García",
          telefono: "555-0102",
          id: "C002",
        },
        vehicle: { _id: "V002", placa: "DEF-456", id: "V002" },
        estado: { nombre: "Pendiente", color: "#fbbf24" },
        priority: "urgent",
        prioridad: "urgente",
        description: "Reparación urgente",
        totalAmount: 1800.0,
        fechaApertura: "2025-11-11",
        items: [],
        createdBy: { _id: "U001", nombre: "Admin" },
        historial: [],
      } as any,
      {
        _id: "WO003",
        workOrderNumber: "OT-2025-003",
        customer: {
          _id: "C003",
          nombre: "Carlos López",
          telefono: "555-0103",
          id: "C003",
        },
        vehicle: { _id: "V003", placa: "GHI-789", id: "V003" },
        estado: { nombre: "Completada", color: "#22c55e" },
        priority: "medium",
        prioridad: "normal",
        description: "Servicio completado",
        totalAmount: 3200.0,
        fechaApertura: "2025-11-09",
        items: [],
        createdBy: { _id: "U001", nombre: "Admin" },
        historial: [],
      } as any,
    ];

    mockWorkOrders.forEach((wo) => store.agregarWorkOrder(wo as any));
  }

  if (store.invoices.length === 0) {
    // Facturas mock
    const mockInvoices: Invoice[] = [
      {
        _id: "INV001",
        invoiceNumber: "FAC-2025-001",
        workOrder: "WO001",
        customer: {
          _id: "C001",
          nombre: "Juan Pérez",
          telefono: "555-0101",
          id: "C001",
        },
        status: "emitida",
        subtotal: 2500.0,
        total: 2500.0,
        paidAmount: 1500.0,
        balance: 1000.0,
        issueDate: "2025-11-10",
        dueDate: "2025-11-25",
        taxes: [],
        items: [],
      },
      {
        _id: "INV002",
        invoiceNumber: "FAC-2025-002",
        workOrder: "WO002",
        customer: {
          _id: "C002",
          nombre: "María García",
          telefono: "555-0102",
          id: "C002",
        },
        status: "pagada_total",
        subtotal: 1800.0,
        total: 1800.0,
        paidAmount: 1800.0,
        balance: 0.0,
        issueDate: "2025-11-11",
        dueDate: "2025-11-26",
        taxes: [],
        items: [],
      },
    ];

    mockInvoices.forEach((inv) => store.agregarInvoice(inv as any));
  }

  if (store.payments.length === 0) {
    // Pagos mock
    const mockPayments = [
      {
        _id: "PAY001",
        invoice: "INV001",
        amount: 1500.0,
        paymentDate: "2025-11-12",
        paymentMethod: "transferencia",
        status: "confirmado",
      } as any,
      {
        _id: "PAY002",
        invoice: "INV002",
        amount: 1800.0,
        paymentDate: "2025-11-11",
        paymentMethod: "efectivo",
        status: "confirmado",
      } as any,
    ];

    mockPayments.forEach((pay) => store.agregarPayment(pay as any));
  }

  if (store.services.length === 0) {
    // Servicios mock
    const mockServices = [
      {
        _id: "SERV001",
        nombre: "Cambio de Aceite",
        descripcion: "Cambio completo de aceite y filtro",
        precioBase: 450.0,
        tiempoEstimadoMinutos: 30,
        dificultad: "baja",
        activo: true,
      } as any,
      {
        _id: "SERV002",
        nombre: "Reparación de Frenos",
        descripcion: "Reemplazo de pastillas y discos de freno",
        precioBase: 1200.0,
        tiempoEstimadoMinutos: 120,
        dificultad: "media",
        activo: true,
      } as any,
    ];

    mockServices.forEach((srv) => store.agregarService(srv as any));
  }

  if (store.serviceBays.length === 0) {
    // Bahías de servicio mock
    const mockServiceBays = [
      {
        _id: "BAY001",
        name: "Bahía 1 - Mecánica",
        code: "B01",
        area: "mecanica",
        status: "ocupado",
        capacity: "mediana",
        maxTechnicians: 2,
        currentTechnicians: [{ technician: "Juan Silva", role: "principal" }],
        occupiedSince: "2025-11-12T08:00:00Z",
      } as any,
      {
        _id: "BAY002",
        name: "Bahía 2 - Electricidad",
        code: "B02",
        area: "electricidad",
        status: "disponible",
        capacity: "pequeña",
        maxTechnicians: 1,
        currentTechnicians: [],
      } as any,
    ];

    mockServiceBays.forEach((bay) => store.agregarServiceBay(bay as any));
  }

  if (store.stockAlerts.length === 0) {
    // Alertas de stock mock
    const mockStockAlerts = [
      {
        item: "Pastillas de Freno Delanteras",
        code: "PF-001",
        currentStock: 2,
        minStock: 5,
        status: "critical",
      },
      {
        item: "Filtro de Aceite",
        code: "FA-002",
        currentStock: 8,
        minStock: 10,
        status: "warning",
      },
      {
        item: "Batería 12V",
        code: "BAT-003",
        currentStock: 15,
        minStock: 20,
        status: "low",
      },
    ];

    store.actualizarStockAlerts(mockStockAlerts);
  }

  if (store.rotationMetrics.length === 0) {
    // Métricas de rotación mock
    const mockRotationMetrics = [
      {
        item: "Aceite 5W30",
        monthlyUsage: 45,
        averageStock: 120,
        rotationRate: 0.375,
        status: "good",
      },
      {
        item: "Pastillas de Freno",
        monthlyUsage: 12,
        averageStock: 50,
        rotationRate: 0.24,
        status: "slow",
      },
    ];

    store.actualizarRotationMetrics(mockRotationMetrics);
  }

  // Inicializar datos de inventory
  initializeInventoryMockData();
};

// Función para obtener datos del store
export const getOperationsData = () => {
  const store = useOperationsStore.getState();
  return {
    workOrders: store.workOrders,
    invoices: store.invoices,
    payments: store.payments,
    services: store.services,
    serviceBays: store.serviceBays,
    stockAlerts: store.stockAlerts,
    rotationMetrics: store.rotationMetrics,
    stats: store.obtenerEstadisticas(),
  };
};
