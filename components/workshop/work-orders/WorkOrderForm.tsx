"use client";
import React, { useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { classNames } from "primereact/utils";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Divider } from "primereact/divider";
import { workOrderSchema, WorkOrderFormData } from "@/libs/zods/workshop";
import {
  createWorkOrder,
  updateWorkOrder,
  getWorkOrderStatuses,
  createWorkOrderItem,
  getWorkOrderItems,
} from "@/app/api/workshop/workOrderService";
import { getCustomers } from "@/app/api/inventory/customerService";
import { getVehicles } from "@/app/api/crm/vehicleService";
import { getUsers } from "@/app/api/userService";
import { handleFormError } from "@/utils/errorHandlers";
import { LayoutContext } from "@/layout/context/layoutcontext";
import { WorkOrder, WorkOrderItem } from "@/libs/interfaces/workshop";
import WorkOrderItemsForm from "./WorkOrderItemsForm";

interface WorkOrderFormProps {
  workOrder: WorkOrder | null;
  onSave: () => void;
  onCancel: () => void;
  toast: React.RefObject<Toast>;
}

const prioridadOptions = [
  { label: "Baja", value: "baja" },
  { label: "Normal", value: "normal" },
  { label: "Alta", value: "alta" },
  { label: "Urgente", value: "urgente" },
];

const WorkOrderForm = ({
  workOrder,
  onSave,
  onCancel,
  toast,
}: WorkOrderFormProps) => {
  const { layoutConfig } = useContext(LayoutContext);
  const filledInput = layoutConfig.inputStyle === "filled";
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [items, setItems] = useState<WorkOrderItem[]>([]);

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    watch,
  } = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      motivo: "",
      kilometraje: 0,
      prioridad: "normal",
      descripcionProblema: "",
      subtotalRepuestos: 0,
      subtotalServicios: 0,
      descuento: 0,
      impuesto: 0,
      costoTotal: 0,
    },
  });

  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    if (workOrder) {
      // Set form values
      setValue(
        "customer",
        typeof workOrder.customer === "object"
          ? workOrder.customer._id
          : workOrder.customer
      );
      setValue(
        "vehicle",
        typeof workOrder.vehicle === "object"
          ? workOrder.vehicle._id
          : workOrder.vehicle
      );
      setValue("motivo", workOrder.motivo);
      setValue("kilometraje", workOrder.kilometraje);
      setValue("prioridad", workOrder.prioridad);
      setValue("descripcionProblema", workOrder.descripcionProblema || "");

      if (workOrder.estado) {
        const estadoId =
          typeof workOrder.estado === "object"
            ? workOrder.estado._id
            : workOrder.estado;
        if (estadoId) {
          setValue("estado", estadoId);
        }
      }

      if (workOrder.tecnicoAsignado) {
        setValue(
          "tecnicoAsignado",
          typeof workOrder.tecnicoAsignado === "object"
            ? workOrder.tecnicoAsignado._id
            : workOrder.tecnicoAsignado
        );
      }

      if (workOrder.fechaEstimadaEntrega) {
        setValue(
          "fechaEstimadaEntrega",
          new Date(workOrder.fechaEstimadaEntrega)
        );
      }

      setValue("observaciones", workOrder.observaciones || "");

      // Set customer for vehicle filtering
      if (typeof workOrder.customer === "object") {
        setSelectedCustomer(workOrder.customer._id);
      }

      // Load items if editing existing work order
      const workOrderId = workOrder._id || workOrder.id;
      if (workOrderId) {
        loadWorkOrderItems(workOrderId);
      }
    }
  }, [workOrder, setValue]);

  const loadWorkOrderItems = async (workOrderId: string) => {
    try {
      const itemsData = await getWorkOrderItems(workOrderId);
      setItems(itemsData || []);
    } catch (error) {
      console.error("Error loading work order items:", error);
      setItems([]);
    }
  };

  const loadFormData = async () => {
    try {
      const [customersRes, vehiclesRes, usersRes, statusesRes] =
        await Promise.all([
          getCustomers(),
          getVehicles(),
          getUsers(),
          getWorkOrderStatuses(),
        ]);

      setCustomers(Array.isArray(customersRes) ? customersRes : []);
      setVehicles(Array.isArray(vehiclesRes) ? vehiclesRes : []);
      setTechnicians(Array.isArray(usersRes) ? usersRes : []);
      setStatuses(Array.isArray(statusesRes) ? statusesRes : []);
    } catch (error) {
      console.error("Error loading form data:", error);
    }
  };

  const onSubmit = async (data: WorkOrderFormData) => {
    try {
      setSubmitting(true);

      // Calculate totals from items
      const subtotalServicios = items
        .filter((item) => item.tipo === "servicio")
        .reduce((sum, item) => sum + item.precioFinal, 0);

      const subtotalRepuestos = items
        .filter((item) => item.tipo === "repuesto")
        .reduce((sum, item) => sum + item.precioFinal, 0);

      const costoTotal = subtotalServicios + subtotalRepuestos;

      // Update data with calculated totals
      const workOrderData = {
        ...data,
        subtotalServicios,
        subtotalRepuestos,
        costoTotal,
      };

      if (workOrder?._id || workOrder?.id) {
        const id = workOrder._id || workOrder.id!;
        await updateWorkOrder(id, workOrderData);
        toast.current?.show({
          severity: "success",
          summary: "Éxito",
          detail: "Orden de trabajo actualizada correctamente",
          life: 3000,
        });
      } else {
        const createdWorkOrder = await createWorkOrder(workOrderData);

        // Create items for the new work order
        if (items.length > 0 && createdWorkOrder._id) {
          await Promise.all(
            items.map((item) =>
              createWorkOrderItem(createdWorkOrder._id!, item)
            )
          );
        }

        toast.current?.show({
          severity: "success",
          summary: "Éxito",
          detail: "Orden de trabajo creada correctamente",
          life: 3000,
        });
      }
      onSave();
    } catch (error) {
      handleFormError(error, toast);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter vehicles by selected customer
  const filteredVehicles = selectedCustomer
    ? vehicles.filter((v) => {
        const customerId =
          typeof v.customer === "object"
            ? v.customer._id || v.customer.id
            : v.customer;
        return customerId === selectedCustomer;
      })
    : vehicles;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
      {/* Customer */}
      <div className="field">
        <label htmlFor="customer" className="font-bold">
          Cliente *
        </label>
        <Controller
          name="customer"
          control={control}
          render={({ field }) => (
            <Dropdown
              id="customer"
              value={field.value}
              options={customers}
              onChange={(e) => {
                field.onChange(e.value);
                setSelectedCustomer(e.value);
                setValue("vehicle", ""); // Reset vehicle when customer changes
              }}
              optionLabel="nombre"
              optionValue="_id"
              placeholder="Seleccione un cliente"
              filter
              className={classNames(
                { "p-invalid": errors.customer },
                filledInput ? "p-filled" : ""
              )}
            />
          )}
        />
        {errors.customer && (
          <small className="p-error">{errors.customer.message}</small>
        )}
      </div>

      {/* Vehicle */}
      <div className="field">
        <label htmlFor="vehicle" className="font-bold">
          Vehículo *
        </label>
        <Controller
          name="vehicle"
          control={control}
          render={({ field }) => (
            <Dropdown
              id="vehicle"
              value={field.value}
              options={filteredVehicles}
              onChange={(e) => field.onChange(e.value)}
              optionLabel="placa"
              optionValue="_id"
              placeholder={
                selectedCustomer
                  ? "Seleccione un vehículo"
                  : "Primero seleccione un cliente"
              }
              filter
              disabled={!selectedCustomer}
              className={classNames(
                { "p-invalid": errors.vehicle },
                filledInput ? "p-filled" : ""
              )}
            />
          )}
        />
        {errors.vehicle && (
          <small className="p-error">{errors.vehicle.message}</small>
        )}
      </div>

      {/* Motivo */}
      <div className="field">
        <label htmlFor="motivo" className="font-bold">
          Motivo *
        </label>
        <Controller
          name="motivo"
          control={control}
          render={({ field }) => (
            <InputText
              id="motivo"
              {...field}
              className={classNames(
                { "p-invalid": errors.motivo },
                filledInput ? "p-filled" : ""
              )}
              placeholder="Ej: Servicio de mantenimiento preventivo"
            />
          )}
        />
        {errors.motivo && (
          <small className="p-error">{errors.motivo.message}</small>
        )}
      </div>

      <div className="formgrid grid">
        {/* Kilometraje */}
        <div className="field col-12 md:col-6">
          <label htmlFor="kilometraje" className="font-bold">
            Kilometraje *
          </label>
          <Controller
            name="kilometraje"
            control={control}
            render={({ field }) => (
              <InputNumber
                id="kilometraje"
                value={field.value}
                onValueChange={(e) => field.onChange(e.value)}
                suffix=" km"
                className={classNames({ "p-invalid": errors.kilometraje })}
              />
            )}
          />
          {errors.kilometraje && (
            <small className="p-error">{errors.kilometraje.message}</small>
          )}
        </div>

        {/* Prioridad */}
        <div className="field col-12 md:col-6">
          <label htmlFor="prioridad" className="font-bold">
            Prioridad *
          </label>
          <Controller
            name="prioridad"
            control={control}
            render={({ field }) => (
              <Dropdown
                id="prioridad"
                value={field.value}
                options={prioridadOptions}
                onChange={(e) => field.onChange(e.value)}
                className={classNames({ "p-invalid": errors.prioridad })}
              />
            )}
          />
          {errors.prioridad && (
            <small className="p-error">{errors.prioridad.message}</small>
          )}
        </div>
      </div>

      <div className="formgrid grid">
        {/* Estado */}
        <div className="field col-12 md:col-6">
          <label htmlFor="estado" className="font-bold">
            Estado *
          </label>
          <Controller
            name="estado"
            control={control}
            render={({ field }) => (
              <Dropdown
                id="estado"
                value={field.value}
                options={statuses}
                onChange={(e) => field.onChange(e.value)}
                optionLabel="nombre"
                optionValue="_id"
                placeholder="Seleccione un estado"
                className={classNames({ "p-invalid": errors.estado })}
              />
            )}
          />
          {errors.estado && (
            <small className="p-error">{errors.estado.message}</small>
          )}
        </div>

        {/* Técnico Asignado */}
        <div className="field col-12 md:col-6">
          <label htmlFor="tecnicoAsignado" className="font-bold">
            Técnico Asignado
          </label>
          <Controller
            name="tecnicoAsignado"
            control={control}
            render={({ field }) => (
              <Dropdown
                id="tecnicoAsignado"
                value={field.value}
                options={technicians}
                onChange={(e) => field.onChange(e.value)}
                optionLabel="nombre"
                optionValue="_id"
                placeholder="Seleccione un técnico"
                filter
                showClear
              />
            )}
          />
        </div>
      </div>

      {/* Descripción del Problema */}
      <div className="field">
        <label htmlFor="descripcionProblema" className="font-bold">
          Descripción del Problema
        </label>
        <Controller
          name="descripcionProblema"
          control={control}
          render={({ field }) => (
            <InputTextarea
              id="descripcionProblema"
              {...field}
              rows={3}
              placeholder="Describa el problema o los síntomas reportados"
              className={filledInput ? "p-filled" : ""}
            />
          )}
        />
      </div>

      {/* Fecha Estimada de Entrega */}
      <div className="field">
        <label htmlFor="fechaEstimadaEntrega" className="font-bold">
          Fecha Estimada de Entrega
        </label>
        <Controller
          name="fechaEstimadaEntrega"
          control={control}
          render={({ field }) => (
            <Calendar
              id="fechaEstimadaEntrega"
              value={
                field.value instanceof Date
                  ? field.value
                  : field.value
                  ? new Date(field.value)
                  : null
              }
              onChange={(e) => field.onChange(e.value)}
              showTime
              hourFormat="24"
              placeholder="Seleccione fecha y hora"
              dateFormat="dd/mm/yy"
            />
          )}
        />
      </div>

      {/* Observaciones */}
      <div className="field">
        <label htmlFor="observaciones" className="font-bold">
          Observaciones
        </label>
        <Controller
          name="observaciones"
          control={control}
          render={({ field }) => (
            <InputTextarea
              id="observaciones"
              {...field}
              rows={2}
              placeholder="Notas adicionales"
              className={filledInput ? "p-filled" : ""}
            />
          )}
        />
      </div>

      <Divider />

      {/* Items Section */}
      <WorkOrderItemsForm items={items} onChange={setItems} />

      {/* Buttons */}
      <div className="flex gap-2 justify-content-end mt-4">
        <Button
          label="Cancelar"
          icon="pi pi-times"
          severity="secondary"
          onClick={onCancel}
          type="button"
          disabled={submitting}
        />
        <Button
          label="Guardar"
          icon="pi pi-check"
          type="submit"
          loading={submitting}
        />
      </div>
    </form>
  );
};

export default WorkOrderForm;
