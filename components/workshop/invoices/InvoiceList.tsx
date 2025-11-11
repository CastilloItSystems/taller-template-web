"use client";

import React, { useState, useEffect, useRef } from "react";
import { DataTable, DataTableFilterMeta } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { FilterMatchMode } from "primereact/api";
import {
  getInvoices,
  deleteInvoice,
  emitInvoice,
  markInvoiceAsPaid,
} from "@/app/api/workshop/invoiceService";
import { Invoice, InvoiceFilters } from "@/libs/interfaces/workshop";
import { motion } from "framer-motion";
import CreateButton from "@/components/common/CreateButton";
import CustomActionButtons from "@/components/common/CustomActionButtons";
import InvoiceForm from "./InvoiceForm";

const InvoiceList: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filters, setFilters] = useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [formDialog, setFormDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  const toast = useRef<Toast>(null);

  const statusOptions = [
    { label: "Todos", value: null },
    { label: "Borrador", value: "borrador" },
    { label: "Emitida", value: "emitida" },
    { label: "Pagada Parcial", value: "pagada_parcial" },
    { label: "Pagada Total", value: "pagada_total" },
    { label: "Vencida", value: "vencida" },
    { label: "Cancelada", value: "cancelada" },
  ];

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const filterParams: InvoiceFilters & { page?: number; limit?: number } = {
        page: currentPage,
        limit: rows,
        eliminado: false,
      };

      if (globalFilterValue) {
        filterParams.search = globalFilterValue;
      }

      if (statusFilter) {
        filterParams.status = statusFilter;
      }

      const response = await getInvoices(filterParams);
      setInvoices(response.data.docs);
      setTotalRecords(response.data.totalDocs);
    } catch (error) {
      console.error("Error loading invoices:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Error al cargar las facturas",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [currentPage, rows, globalFilterValue, statusFilter]);

  const onPage = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
    setCurrentPage(event.page + 1);
  };

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    setCurrentPage(1);
    setFirst(0);
  };

  const openNew = () => {
    setInvoice(null);
    setFormDialog(true);
  };

  const hideDialog = () => {
    setFormDialog(false);
    setInvoice(null);
  };

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
    setInvoice(null);
  };

  const editInvoice = (invoice: Invoice) => {
    setInvoice({ ...invoice });
    setFormDialog(true);
  };

  const confirmDeleteInvoice = (invoice: Invoice) => {
    setInvoice(invoice);
    setDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!invoice?._id) return;

    try {
      await deleteInvoice(invoice._id);
      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Factura eliminada correctamente",
        life: 3000,
      });
      loadInvoices();
      hideDeleteDialog();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Error al eliminar la factura",
        life: 3000,
      });
    }
  };

  const handleSave = () => {
    toast.current?.show({
      severity: "success",
      summary: "Éxito",
      detail: invoice?._id
        ? "Factura actualizada correctamente"
        : "Factura creada correctamente",
      life: 3000,
    });
    loadInvoices();
    hideDialog();
  };

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4 className="m-0">Facturas</h4>
      <div className="flex gap-2">
        <Dropdown
          value={statusFilter}
          options={statusOptions}
          onChange={(e) => {
            setStatusFilter(e.value);
            setCurrentPage(1);
            setFirst(0);
          }}
          placeholder="Filtrar por estado"
          className="w-full md:w-14rem"
        />
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Buscar..."
          />
        </span>
        <CreateButton label="Nueva Factura" onClick={openNew} />
      </div>
    </div>
  );

  const invoiceNumberTemplate = (rowData: Invoice) => {
    return <span className="font-mono">{rowData.invoiceNumber}</span>;
  };

  const customerTemplate = (rowData: Invoice) => {
    if (typeof rowData.customer === "object" && rowData.customer !== null) {
      return rowData.customer.nombreCompleto || rowData.customer.nombre;
    }
    return rowData.customer;
  };

  const workOrderTemplate = (rowData: Invoice) => {
    if (typeof rowData.workOrder === "object" && rowData.workOrder !== null) {
      const wo = rowData.workOrder;
      return (
        <div className="text-sm">
          <div className="font-semibold">OT-{wo._id?.slice(-6)}</div>
        </div>
      );
    }
    return rowData.workOrder;
  };

  const dateTemplate = (date: string | Date) => {
    if (!date) return "-";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("es-VE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const issueDateTemplate = (rowData: Invoice) => {
    return dateTemplate(rowData.issueDate);
  };

  const dueDateTemplate = (rowData: Invoice) => {
    return dateTemplate(rowData.dueDate);
  };

  const statusTemplate = (rowData: Invoice) => {
    const statusConfig: Record<
      string,
      {
        severity:
          | "success"
          | "info"
          | "warning"
          | "danger"
          | "secondary"
          | "contrast";
        label: string;
        icon: string;
      }
    > = {
      borrador: { severity: "info", label: "Borrador", icon: "pi-file-edit" },
      emitida: { severity: "warning", label: "Emitida", icon: "pi-send" },
      pagada_parcial: {
        severity: "contrast",
        label: "Pagada Parcial",
        icon: "pi-dollar",
      },
      pagada_total: {
        severity: "success",
        label: "Pagada Total",
        icon: "pi-check-circle",
      },
      vencida: {
        severity: "danger",
        label: "Vencida",
        icon: "pi-exclamation-triangle",
      },
      cancelada: {
        severity: "secondary",
        label: "Cancelada",
        icon: "pi-times-circle",
      },
    };

    const config = statusConfig[rowData.status] || {
      severity: "info" as const,
      label: rowData.status,
      icon: "pi-question",
    };

    return (
      <Tag severity={config.severity} icon={config.icon} rounded>
        {config.label}
      </Tag>
    );
  };

  const currencyTemplate = (value: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  const subtotalTemplate = (rowData: Invoice) => {
    return currencyTemplate(rowData.subtotal);
  };

  const totalTemplate = (rowData: Invoice) => {
    return (
      <span className="font-semibold">{currencyTemplate(rowData.total)}</span>
    );
  };

  const paidAmountTemplate = (rowData: Invoice) => {
    return currencyTemplate(rowData.paidAmount);
  };

  const balanceTemplate = (rowData: Invoice) => {
    const balance = rowData.balance;
    const color = balance > 0 ? "text-red-600" : "text-green-600";
    return (
      <span className={`font-semibold ${color}`}>
        {currencyTemplate(balance)}
      </span>
    );
  };

  const actionTemplate = (rowData: Invoice) => {
    return (
      <CustomActionButtons
        rowData={rowData}
        onEdit={() => editInvoice(rowData)}
        onDelete={() => confirmDeleteInvoice(rowData)}
      />
    );
  };

  const deleteDialogFooter = (
    <>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        onClick={hideDeleteDialog}
      />
      <Button
        label="Sí"
        icon="pi pi-check"
        severity="danger"
        onClick={handleDelete}
      />
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Toast ref={toast} />
      <div className="card">
        <DataTable
          value={invoices}
          loading={loading}
          header={header}
          filters={filters}
          paginator
          lazy
          first={first}
          rows={rows}
          totalRecords={totalRecords}
          onPage={onPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} facturas"
          emptyMessage="No se encontraron facturas"
          stripedRows
          removableSort
        >
          <Column
            field="invoiceNumber"
            header="N° Factura"
            body={invoiceNumberTemplate}
            sortable
            style={{ minWidth: "8rem" }}
          />
          <Column
            field="customer"
            header="Cliente"
            body={customerTemplate}
            sortable
            style={{ minWidth: "12rem" }}
          />
          <Column
            field="workOrder"
            header="Orden de Trabajo"
            body={workOrderTemplate}
            style={{ minWidth: "12rem" }}
          />
          <Column
            field="issueDate"
            header="Fecha Emisión"
            body={issueDateTemplate}
            sortable
            style={{ minWidth: "10rem" }}
          />
          <Column
            field="dueDate"
            header="Fecha Vencimiento"
            body={dueDateTemplate}
            sortable
            style={{ minWidth: "10rem" }}
          />
          <Column
            field="status"
            header="Estado"
            body={statusTemplate}
            sortable
            style={{ minWidth: "10rem" }}
          />
          <Column
            field="subtotal"
            header="Subtotal"
            body={subtotalTemplate}
            sortable
            style={{ minWidth: "10rem" }}
          />
          <Column
            field="total"
            header="Total"
            body={totalTemplate}
            sortable
            style={{ minWidth: "10rem" }}
          />
          <Column
            field="paidAmount"
            header="Pagado"
            body={paidAmountTemplate}
            sortable
            style={{ minWidth: "10rem" }}
          />
          <Column
            field="balance"
            header="Saldo"
            body={balanceTemplate}
            sortable
            style={{ minWidth: "10rem" }}
          />
          <Column
            body={actionTemplate}
            exportable={false}
            style={{ minWidth: "10rem" }}
          />
        </DataTable>
      </div>

      {/* Form Dialog */}
      <Dialog
        visible={formDialog}
        style={{ width: "600px" }}
        header={
          <div className="mb-2 text-center md:text-left">
            <div className="border-bottom-2 border-primary pb-2">
              <h2 className="text-2xl font-bold text-900 mb-2 flex align-items-center justify-content-center md:justify-content-start">
                <i className="pi pi-tag mr-3 text-primary text-3xl"></i>
                {invoice?._id ? "Editar Factura" : "Nueva Factura"}
              </h2>
            </div>
          </div>
        }
        modal
        className="p-fluid"
        onHide={hideDialog}
        maximizable
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
      >
        <InvoiceForm
          invoice={invoice}
          onSave={handleSave}
          onCancel={hideDialog}
        />
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        visible={deleteDialog}
        style={{ width: "450px" }}
        header="Confirmar"
        modal
        footer={deleteDialogFooter}
        onHide={hideDeleteDialog}
      >
        <div className="confirmation-content flex align-items-center">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {invoice && (
            <span>
              ¿Está seguro de eliminar la factura <b>{invoice.invoiceNumber}</b>
              ?
            </span>
          )}
        </div>
      </Dialog>
    </motion.div>
  );
};

export default InvoiceList;
