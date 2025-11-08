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
  vehicleModelSchema,
  VehicleModelFormData,
} from "@/libs/zods/inventory/vehicleZod";
import {
  createVehicleModel,
  updateVehicleModel,
} from "@/app/api/crm/vehicleModelService";
import { getVehicleBrands } from "@/app/api/crm/vehicleBrandService";
import { VehicleModel, VehicleBrand } from "@/libs/interfaces/inventory";
import { handleFormError } from "@/utils/errorHandlers";

interface VehicleModelFormProps {
  model: VehicleModel | null;
  hideFormDialog: () => void;
  models: VehicleModel[];
  setModels: (models: VehicleModel[]) => void;
  setModel: (model: VehicleModel | null) => void;
  showToast: (
    severity: "success" | "error",
    summary: string,
    detail: string
  ) => void;
  toast: React.RefObject<any>;
}

const VehicleModelForm: React.FC<VehicleModelFormProps> = ({
  model,
  hideFormDialog,
  models,
  setModels,
  setModel,
  showToast,
  toast,
}) => {
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<VehicleModelFormData>({
    resolver: zodResolver(vehicleModelSchema),
    defaultValues: {
      brand: model?.brand || "",
      nombre: model?.nombre || "",
      tipo: model?.tipo || "sedan",
      motor: model?.motor || "gasolina",
      yearInicio: model?.yearInicio || undefined,
      yearFin: model?.yearFin || undefined,
      estado: model?.estado || "activo",
    },
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (model) {
      reset({
        brand: typeof model.brand === "string" ? model.brand : model.brand.id,
        nombre: model.nombre,
        tipo: model.tipo,
        motor: model.motor,
        yearInicio: model.yearInicio,
        yearFin: model.yearFin,
        estado: model.estado,
      });
    }
  }, [model, reset]);

  const fetchBrands = async () => {
    try {
      const brandsDB = await getVehicleBrands();
      if (brandsDB && Array.isArray(brandsDB.vehicleBrands)) {
        setBrands(brandsDB.vehicleBrands);
      }
    } catch (error) {
      console.error("Error al obtener las marcas:", error);
    }
  };

  const onSubmit = async (data: VehicleModelFormData) => {
    setLoading(true);
    try {
      if (model) {
        const updatedModel = await updateVehicleModel(model.id, data);
        const updatedModels = models.map((m) =>
          m.id === model.id ? updatedModel : m
        );
        setModels(updatedModels);
        showToast("success", "Éxito", "Modelo actualizado correctamente");
      } else {
        const newModel = await createVehicleModel(data);
        setModels([...models, newModel]);
        showToast("success", "Éxito", "Modelo creado correctamente");
      }
      hideFormDialog();
    } catch (error) {
      handleFormError(error, toast);
    } finally {
      setLoading(false);
    }
  };

  const getFormErrorMessage = (name: string) => {
    const error = errors[name as keyof VehicleModelFormData];
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

  const brandOptions = brands.map((brand) => ({
    label: brand.nombre,
    value: brand.id,
  }));

  const tipoOptions = [
    { label: "Sedán", value: "sedan" },
    { label: "SUV", value: "suv" },
    { label: "Pickup", value: "pickup" },
    { label: "Hatchback", value: "hatchback" },
    { label: "Cupé", value: "coupe" },
    { label: "Convertible", value: "convertible" },
    { label: "Wagon", value: "wagon" },
    { label: "Van", value: "van" },
  ];

  const motorOptions = [
    { label: "Gasolina", value: "gasolina" },
    { label: "Diésel", value: "diesel" },
    { label: "Eléctrico", value: "electrico" },
    { label: "Híbrido", value: "hibrido" },
  ];

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
              {model ? "Modificar Modelo" : "Crear Modelo"}
            </h2>
          </div>
        </div>
        <div className="grid">
          <div className="col-12 md:col-6">
            <label htmlFor="brand" className="block text-900 font-medium mb-2">
              Marca *
            </label>
            <Controller
              name="brand"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <Dropdown
                    id={field.name}
                    value={field.value}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Selecciona una marca"
                    options={brandOptions}
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
            <label htmlFor="nombre" className="block text-900 font-medium mb-2">
              Nombre del Modelo *
            </label>
            <Controller
              name="nombre"
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
                    placeholder="Nombre del modelo"
                  />
                  {getFormErrorMessage(field.name)}
                </>
              )}
            />
          </div>

          <div className="col-12 md:col-6">
            <label htmlFor="tipo" className="block text-900 font-medium mb-2">
              Tipo de Vehículo *
            </label>
            <Controller
              name="tipo"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <Dropdown
                    id={field.name}
                    value={field.value}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Selecciona el tipo"
                    options={tipoOptions}
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
            <label htmlFor="motor" className="block text-900 font-medium mb-2">
              Tipo de Motor *
            </label>
            <Controller
              name="motor"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <Dropdown
                    id={field.name}
                    value={field.value}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Selecciona el motor"
                    options={motorOptions}
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
            <label
              htmlFor="yearInicio"
              className="block text-900 font-medium mb-2"
            >
              Año Inicio
            </label>
            <Controller
              name="yearInicio"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <InputNumber
                    id={field.name}
                    value={field.value}
                    onValueChange={(e) => field.onChange(e.value)}
                    min={1900}
                    max={new Date().getFullYear() + 5}
                    className={classNames({
                      "p-invalid": fieldState.error,
                    })}
                    placeholder="Año de inicio de producción"
                  />
                  {getFormErrorMessage(field.name)}
                </>
              )}
            />
          </div>

          <div className="col-12 md:col-6">
            <label
              htmlFor="yearFin"
              className="block text-900 font-medium mb-2"
            >
              Año Fin
            </label>
            <Controller
              name="yearFin"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <InputNumber
                    id={field.name}
                    value={field.value}
                    onValueChange={(e) => field.onChange(e.value)}
                    min={1900}
                    max={new Date().getFullYear() + 10}
                    className={classNames({
                      "p-invalid": fieldState.error,
                    })}
                    placeholder="Año de fin de producción"
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
            label={model ? "Actualizar" : "Crear"}
            icon="pi pi-check"
            type="submit"
            loading={loading}
          />
        </div>
      </div>
    </form>
  );
};

export default VehicleModelForm;
