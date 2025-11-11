import { useRefineriaStore } from "@/store/refineriaStore";
import AppSubMenu from "./AppSubMenu";
import type { MenuModel } from "@/types";
import { useAutoSysStore } from "@/store/autoSysStore";

const AppMenuAutoSys = () => {
  const { activeAutoSys } = useAutoSysStore();
  const model: MenuModel[] = [
    {
      label: activeAutoSys?.nombre || "Seleciona un autoSys",
      icon: "pi pi-home",
      items: [
        {
          label: "Operaciones",
          icon: "pi pi-fw pi-home",
          to: "/",
        },
        {
          label: "Finanzas",
          icon: "pi pi-fw pi-image",
          to: "/",
        },
        {
          label: "Ordenes de Trabajo",
          icon: "pi pi-fw pi-file",
          to: "/autosys/operation/workshop",
        },
      ],
    },

    {
      label: "Gestión de " + activeAutoSys?.nombre,
      icon: "pi pi-fw pi-building", // Cambiado a un icono más representativo de empresa
      items: [
        {
          label: "Configuración",
          icon: "pi pi-fw pi-cog",
          items: [],
        },
        {
          label: "Finanzas",
          icon: "pi pi-fw pi-dollar",
          items: [
            {
              label: "Contactos",
              icon: "pi pi-fw pi-id-card",
              to: "/bunkering/contacto",
            },
            {
              label: "Contrato Compra",
              icon: "pi pi-fw pi-briefcase",
              to: "/bunkering/contrato-compra",
            },
            {
              label: "Contrato Venta",
              icon: "pi pi-fw pi-briefcase",
              to: "/bunkering/contrato-venta",
            },
          ],
        },

        {
          label: "Inventario",
          icon: "pi pi-fw pi-box",
          items: [
            {
              label: "Almacenes",
              icon: "pi pi-fw pi-database",
              to: "/autosys/inventario/almacenes",
            },
            {
              label: "Proveedores",
              icon: "pi pi-fw pi-users",
              to: "/autosys/inventario/proveedores",
            },
            {
              label: "Categorías",
              icon: "pi pi-fw pi-tags",
              to: "/autosys/inventario/categorias",
            },
            {
              label: "Marcas",
              icon: "pi pi-fw pi-flag",
              to: "/autosys/inventario/marcas",
            },
            {
              label: "Modelos",
              icon: "pi pi-fw pi-book",
              to: "/autosys/inventario/modelos",
            },
            {
              label: "Unidades",
              icon: "pi pi-fw pi-box",
              to: "/autosys/inventario/unidades",
            },
            {
              label: "Artículos",
              icon: "pi pi-fw pi-box",
              to: "/autosys/inventario/items",
            },
            {
              label: "Stock",
              icon: "pi pi-fw pi-chart-bar",
              to: "/autosys/inventario/stock",
            },
            {
              label: "Movimientos",
              icon: "pi pi-fw pi-exchange",
              to: "/autosys/inventario/movimientos",
            },
            {
              label: "Órdenes de Compra",
              icon: "pi pi-fw pi-shopping-cart",
              to: "/autosys/inventario/ordenes-compra",
            },
            {
              label: "Órdenes de Venta",
              icon: "pi pi-fw pi-money-bill",
              to: "/autosys/inventario/ordenes-venta",
            },
            {
              label: "Reservas",
              icon: "pi pi-fw pi-bookmark",
              to: "/autosys/inventario/reservas",
            },
          ],
        },
        {
          label: "CRM",
          icon: "pi pi-fw pi-box",
          items: [
            {
              label: "Clientes",
              icon: "pi pi-fw pi-users",
              to: "/autosys/crm/clientes",
            },
            {
              label: "Vehículos",
              icon: "pi pi-fw pi-car",
              items: [
                {
                  label: "Vehículos",
                  icon: "pi pi-fw pi-car",
                  to: "/autosys/crm/vehiculos/",
                },
                {
                  label: "Marcas",
                  icon: "pi pi-fw pi-tag",
                  to: "/autosys/crm/vehiculos/marcas",
                },
                {
                  label: "Modelos",
                  icon: "pi pi-fw pi-list",
                  to: "/autosys/crm/vehiculos/modelos",
                },
              ],
            },
          ],
        },
        {
          label: "Taller",
          icon: "pi pi-fw pi-wrench",
          items: [
            {
              label: "Operaciones",
              icon: "pi pi-fw pi-cog",
              to: "/autosys/operation/service-bays",
            },
            {
              label: "Órdenes de Trabajo",
              icon: "pi pi-fw pi-file-edit",
              to: "/autosys/workshop",
            },
            {
              label: "Gestión de Puestos",
              icon: "pi pi-fw pi-sitemap",
              to: "/autosys/workshop/service-bays",
            },
            {
              label: "Facturas",
              icon: "pi pi-fw pi-file",
              to: "/autosys/workshop/invoices",
            },
            {
              label: "Pagos",
              icon: "pi pi-fw pi-money-bill",
              to: "/autosys/workshop/payments",
            },
            {
              label: "Servicios",
              icon: "pi pi-fw pi-cog",
              to: "/autosys/workshop/services",
            },
            {
              label: "Categorías de Servicios",
              icon: "pi pi-fw pi-tags",
              to: "/autosys/workshop/service-categories",
            },
            {
              label: "Subcategorías de Servicios",
              icon: "pi pi-fw pi-tag",
              to: "/autosys/workshop/service-subcategories",
            },
            {
              label: "Estados de Orden de Trabajo",
              icon: "pi pi-fw pi-tags",
              to: "/autosys/workshop/work-order-statuses",
            },
          ],
        },
      ],
    },
  ];

  return <AppSubMenu model={model} />;
};

export default AppMenuAutoSys;
