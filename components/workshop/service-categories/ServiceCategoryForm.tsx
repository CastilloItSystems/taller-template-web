"use client";
import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { ColorPicker, ColorPickerChangeEvent } from "primereact/colorpicker";
import { ServiceCategory } from "@/libs/interfaces/workshop";
import {
  serviceCategorySchema,
  ServiceCategoryFormData,
} from "@/libs/zods/workshop";
import {
  createServiceCategory,
  updateServiceCategory,
} from "@/app/api/workshop";

interface ServiceCategoryFormProps {
  category: ServiceCategory | null;
  onSave: () => void;
  onCancel: () => void;
  toast: React.RefObject<any>;
}

export default function ServiceCategoryForm({
  category,
  onSave,
  onCancel,
  toast,
}: ServiceCategoryFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceCategoryFormData>({
    resolver: zodResolver(serviceCategorySchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      codigo: "",
      color: "#4CAF50",
      icono: "",
      orden: 0,
      activo: true,
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        nombre: category.nombre || "",
        descripcion: category.descripcion || "",
        codigo: category.codigo || "",
        color: category.color || "#4CAF50",
        icono: category.icono || "",
        orden: category.orden ?? 0,
        activo: category.activo ?? true,
      });
    } else {
      reset({
        nombre: "",
        descripcion: "",
        codigo: "",
        color: "#4CAF50",
        icono: "",
        orden: 0,
        activo: true,
      });
    }
  }, [category, reset]);

  const onSubmit = async (data: ServiceCategoryFormData) => {
    try {
      if (category?._id) {
        await updateServiceCategory(category._id, data);
      } else {
        await createServiceCategory(data);
      }
      onSave();
    } catch (error: any) {
      console.error("Error saving category:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          error.response?.data?.message || "Error al guardar la categoría",
        life: 3000,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
      <div className="grid">
        {/* Código */}
        <div className="col-12 md:col-6">
          <div className="field">
            <label htmlFor="codigo" className="font-bold">
              Código <span className="text-red-500">*</span>
            </label>
            <Controller
              name="codigo"
              control={control}
              render={({ field }) => (
                <InputText
                  id="codigo"
                  {...field}
                  placeholder="Ej: MECANICA"
                  className={errors.codigo ? "p-invalid" : ""}
                  style={{ fontFamily: "monospace" }}
                />
              )}
            />
            {errors.codigo && (
              <small className="p-error">{errors.codigo.message}</small>
            )}
          </div>
        </div>

        {/* Nombre */}
        <div className="col-12 md:col-6">
          <div className="field">
            <label htmlFor="nombre" className="font-bold">
              Nombre <span className="text-red-500">*</span>
            </label>
            <Controller
              name="nombre"
              control={control}
              render={({ field }) => (
                <InputText
                  id="nombre"
                  {...field}
                  placeholder="Ej: Mantenimiento Preventivo"
                  className={errors.nombre ? "p-invalid" : ""}
                />
              )}
            />
            {errors.nombre && (
              <small className="p-error">{errors.nombre.message}</small>
            )}
          </div>
        </div>

        {/* Descripción */}
        <div className="col-12">
          <div className="field">
            <label htmlFor="descripcion" className="font-bold">
              Descripción
            </label>
            <Controller
              name="descripcion"
              control={control}
              render={({ field }) => (
                <InputTextarea
                  id="descripcion"
                  {...field}
                  rows={3}
                  placeholder="Descripción de la categoría"
                />
              )}
            />
          </div>
        </div>

        {/* Color */}
        <div className="col-12 md:col-4">
          <div className="field">
            <label htmlFor="color" className="font-bold">
              Color
            </label>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <div className="flex align-items-center gap-2">
                  <ColorPicker
                    id="color"
                    value={field.value?.replace("#", "") || "4CAF50"}
                    onChange={(e: ColorPickerChangeEvent) => {
                      const colorValue = e.value as string;
                      field.onChange(`#${colorValue}`);
                    }}
                    format="hex"
                  />
                  <InputText
                    value={field.value || "#4CAF50"}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder="#4CAF50"
                    style={{ fontFamily: "monospace" }}
                  />
                </div>
              )}
            />
            {errors.color && (
              <small className="p-error">{errors.color.message}</small>
            )}
          </div>
        </div>

        {/* Icono */}
        <div className="col-12 md:col-4">
          <div className="field">
            <label htmlFor="icono" className="font-bold">
              Icono (PrimeIcons)
            </label>
            <Controller
              name="icono"
              control={control}
              render={({ field }) => (
                <div className="p-inputgroup">
                  <span className="p-inputgroup-addon">
                    <i className={`pi pi-${field.value || "cog"}`}></i>
                  </span>
                  <InputText
                    id="icono"
                    {...field}
                    placeholder="Ej: wrench, engine, cog"
                  />
                </div>
              )}
            />
            <small className="text-500">
              Ver iconos en{" "}
              <a
                href="https://primereact.org/icons"
                target="_blank"
                rel="noopener noreferrer"
              >
                primereact.org/icons
              </a>
            </small>
          </div>
        </div>

        {/* Orden */}
        <div className="col-12 md:col-4">
          <div className="field">
            <label htmlFor="orden" className="font-bold">
              Orden
            </label>
            <Controller
              name="orden"
              control={control}
              render={({ field }) => (
                <InputNumber
                  id="orden"
                  value={field.value}
                  onValueChange={(e) => field.onChange(e.value)}
                  placeholder="0"
                  showButtons
                  min={0}
                />
              )}
            />
            {errors.orden && (
              <small className="p-error">{errors.orden.message}</small>
            )}
          </div>
        </div>

        {/* Activo */}
        <div className="col-12">
          <div className="field-checkbox">
            <Controller
              name="activo"
              control={control}
              render={({ field }) => (
                <div className="flex align-items-center">
                  <Checkbox
                    inputId="activo"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.checked)}
                  />
                  <label htmlFor="activo" className="ml-2 font-bold">
                    Categoría activa
                  </label>
                </div>
              )}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-content-end gap-2 mt-4">
        <Button
          label="Cancelar"
          icon="pi pi-times"
          outlined
          onClick={onCancel}
          type="button"
          disabled={isSubmitting}
        />
        <Button
          label={category?._id ? "Actualizar" : "Crear"}
          icon="pi pi-check"
          type="submit"
          loading={isSubmitting}
        />
      </div>
    </form>
  );
}
