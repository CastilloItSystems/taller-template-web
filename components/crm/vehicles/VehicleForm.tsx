"use client";
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { classNames } from "primereact/utils";
import {
  vehicleSchema,
  VehicleFormData,
} from "@/libs/zods/inventory/vehicleZod";
import { createVehicle, updateVehicle } from "@/app/api/crm/vehicleService";
import { getCustomers } from "@/app/api/inventory/customerService";
import { getVehicleModels } from "@/app/api/crm/vehicleModelService";
import { Vehicle, Customer, VehicleModel } from "@/libs/interfaces/inventory";
import { handleFormError } from "@/utils/errorHandlers";

interface VehicleFormProps {
  vehicle: Vehicle | null;
  hideFormDialog: () => void;
  vehicles: Vehicle[];
  setVehicles: (vehicles: Vehicle[]) => void;
  setVehicle: (vehicle: Vehicle | null) => void;
  showToast: (
    severity: "success" | "error",
    summary: string,
    detail: string
  ) => void;
  toast: React.RefObject<any>;
}

const VehicleForm: React.FC<VehicleFormProps> = ({
  vehicle,
  hideFormDialog,
  vehicles,
  setVehicles,
  setVehicle,
  showToast,
  toast,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      customer: vehicle?.customer || "",
      model: vehicle?.model || "",
      year: vehicle?.year || new Date().getFullYear(),
      placa: vehicle?.placa || "",
      vin: vehicle?.vin || "",
      color: vehicle?.color || "",
      kilometraje: vehicle?.kilometraje || 0,
      estado: vehicle?.estado || "activo",
    },
  });

  useEffect(() => {
    fetchCustomers();
    fetchModels();
  }, []);

  useEffect(() => {
    if (vehicle) {
      reset({
        customer:
          typeof vehicle.customer === "string"
            ? vehicle.customer
            : vehicle.customer.id,
        model:
          typeof vehicle.model === "string" ? vehicle.model : vehicle.model.id,
        year: vehicle.year,
        placa: vehicle.placa,
        vin: vehicle.vin || "",
        color: vehicle.color,
        kilometraje: vehicle.kilometraje || 0,
        estado: vehicle.estado,
      });
    }
  }, [vehicle, reset]);

  const fetchCustomers = async () => {
    try {
      const customersDB = await getCustomers();
      if (customersDB && Array.isArray(customersDB.customers)) {
        setCustomers(customersDB.customers);
      }
    } catch (error) {
      console.error("Error al obtener los clientes:", error);
    }
  };

  const fetchModels = async () => {
    try {
      const modelsDB = await getVehicleModels();
      if (modelsDB && Array.isArray(modelsDB.vehicleModels)) {
        setModels(modelsDB.vehicleModels);
      }
    } catch (error) {
      console.error("Error al obtener los modelos:", error);
    }
  };

  const onSubmit = async (data: VehicleFormData) => {
    setLoading(true);
    try {
      if (vehicle) {
        const updatedVehicle = await updateVehicle(vehicle.id, data);
        const updatedVehicles = vehicles.map((v) =>
          v.id === vehicle.id ? updatedVehicle : v
        );
        setVehicles(updatedVehicles);
        showToast("success", "Éxito", "Vehículo actualizado correctamente");
      } else {
        const newVehicle = await createVehicle(data);
        setVehicles([...vehicles, newVehicle]);
        showToast("success", "Éxito", "Vehículo creado correctamente");
      }
      hideFormDialog();
    } catch (error) {
      handleFormError(error, toast);
    } finally {
      setLoading(false);
    }
  };

  const getFormErrorMessage = (name: string) => {
    const error = errors[name as keyof VehicleFormData];
    return error ? (
      <small className="p-error">
        {typeof error.message === "string"
          ? error.message
          : "Error de validación"}
      </small>
    ) : (
      <small className="p-error">&nbsp;</small>
    );
  };

  const customerOptions = customers.map((customer) => ({
    label: customer.nombre,
    value: customer.id,
  }));

  const modelOptions = models.map((model) => ({
    label: `${model.nombre} (${
      typeof model.brand === "string" ? "Cargando..." : model.brand.nombre
    })`,
    value: model.id,
  }));

  const estadoOptions = [
    { label: "Activo", value: "activo" },
    { label: "Inactivo", value: "inactivo" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
      <div className="card p-fluid surface-50 p-3 border-round shadow-2">
        <div className="mb-2 text-center md:text-left">
          <div className="border-bottom-2 border-primary pb-2">
            <h2 className="text-2xl font-bold text-900 mb-2 flex align-items-center justify-content-center md:justify-content-start">
              <i className="pi pi-tag mr-3 text-primary text-3xl"></i>
              {vehicle ? "Modificar Vehículo" : "Crear Vehículo"}
            </h2>
          </div>
        </div>
        <div className="grid">
          <div className="col-12 md:col-6">
            <label
              htmlFor="customer"
              className="block text-900 font-medium mb-2"
            >
              Cliente *
            </label>
            <Controller
              name="customer"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <Dropdown
                    id={field.name}
                    value={field.value}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Selecciona un cliente"
                    options={customerOptions}
                    focusInputRef={field.ref}
                    onChange={(e) => field.onChange(e.value)}
                    className={classNames({
                      "p-invalid": fieldState.error,
                    })}
                  />
                  {getFormErrorMessage(field.name)}
                </>
              )}
            />
          </div>

          <div className="col-12 md:col-6">
            <label htmlFor="model" className="block text-900 font-medium mb-2">
              Modelo *
            </label>
            <Controller
              name="model"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <Dropdown
                    id={field.name}
                    value={field.value}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Selecciona un modelo"
                    options={modelOptions}
                    focusInputRef={field.ref}
                    onChange={(e) => field.onChange(e.value)}
                    filter={true}
                    filterBy="label"
                    className={classNames({
                      "p-invalid": fieldState.error,
                    })}
                  />
                  {getFormErrorMessage(field.name)}
                </>
              )}
            />
          </div>

          <div className="col-12 md:col-6">
            <label htmlFor="year" className="block text-900 font-medium mb-2">
              Año *
            </label>
            <Controller
              name="year"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <InputNumber
                    id={field.name}
                    value={field.value}
                    onValueChange={(e) => field.onChange(e.value)}
                    min={1900}
                    max={new Date().getFullYear() + 1}
                    className={classNames({
                      "p-invalid": fieldState.error,
                    })}
                    placeholder="Año del vehículo"
                  />
                  {getFormErrorMessage(field.name)}
                </>
              )}
            />
          </div>

          <div className="col-12 md:col-6">
            <label htmlFor="placa" className="block text-900 font-medium mb-2">
              Placa *
            </label>
            <Controller
              name="placa"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <InputText
                    id={field.name}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className={classNames({
                      "p-invalid": fieldState.error,
                    })}
                    placeholder="Número de placa"
                  />
                  {getFormErrorMessage(field.name)}
                </>
              )}
            />
          </div>

          <div className="col-12 md:col-6">
            <label htmlFor="vin" className="block text-900 font-medium mb-2">
              VIN
            </label>
            <Controller
              name="vin"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <InputText
                    id={field.name}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className={classNames({
                      "p-invalid": fieldState.error,
                    })}
                    placeholder="Número de VIN (opcional)"
                  />
                  {getFormErrorMessage(field.name)}
                </>
              )}
            />
          </div>

          <div className="col-12 md:col-6">
            <label htmlFor="color" className="block text-900 font-medium mb-2">
              Color *
            </label>
            <Controller
              name="color"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <InputText
                    id={field.name}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className={classNames({
                      "p-invalid": fieldState.error,
                    })}
                    placeholder="Color del vehículo"
                  />
                  {getFormErrorMessage(field.name)}
                </>
              )}
            />
          </div>

          <div className="col-12 md:col-6">
            <label
              htmlFor="kilometraje"
              className="block text-900 font-medium mb-2"
            >
              Kilometraje *
            </label>
            <Controller
              name="kilometraje"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <InputNumber
                    id={field.name}
                    value={field.value}
                    onValueChange={(e) => field.onChange(e.value)}
                    min={0}
                    className={classNames({
                      "p-invalid": fieldState.error,
                    })}
                    placeholder="Kilometraje actual"
                  />
                  {getFormErrorMessage(field.name)}
                </>
              )}
            />
          </div>

          <div className="col-12 md:col-6">
            <label htmlFor="estado" className="block text-900 font-medium mb-2">
              Estado *
            </label>
            <Controller
              name="estado"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <Dropdown
                    id={field.name}
                    value={field.value}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Selecciona el estado"
                    options={estadoOptions}
                    focusInputRef={field.ref}
                    onChange={(e) => field.onChange(e.value)}
                    className={classNames({
                      "p-invalid": fieldState.error,
                    })}
                  />
                  {getFormErrorMessage(field.name)}
                </>
              )}
            />
          </div>
        </div>

        <div className="flex justify-content-end gap-2 mt-4">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            type="button"
            outlined
            onClick={hideFormDialog}
          />
          <Button
            label={vehicle ? "Actualizar" : "Crear"}
            icon="pi pi-check"
            type="submit"
            loading={loading}
          />
        </div>
      </div>
    </form>
  );
};

export default VehicleForm;
