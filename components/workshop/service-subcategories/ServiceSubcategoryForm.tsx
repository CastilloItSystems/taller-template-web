"use client";
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import {
  ServiceSubcategory,
  ServiceCategory,
  ServiceCategoryReference,
} from "@/libs/interfaces/workshop";
import {
  serviceSubcategorySchema,
  ServiceSubcategoryFormData,
} from "@/libs/zods/workshop";
import {
  createServiceSubcategory,
  updateServiceSubcategory,
  getServiceCategories,
} from "@/app/api/workshop";

interface ServiceSubcategoryFormProps {
  subcategory: ServiceSubcategory | null;
  onSave: () => void;
  onCancel: () => void;
  toast: React.RefObject<any>;
}

export default function ServiceSubcategoryForm({
  subcategory,
  onSave,
  onCancel,
  toast,
}: ServiceSubcategoryFormProps) {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceSubcategoryFormData>({
    resolver: zodResolver(serviceSubcategorySchema),
    defaultValues: {
      categoria: "",
      nombre: "",
      descripcion: "",
      codigo: "",
      activo: true,
    },
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (subcategory) {
      const categoriaId =
        typeof subcategory.categoria === "string"
          ? subcategory.categoria
          : (subcategory.categoria as ServiceCategoryReference)._id;

      reset({
        categoria: categoriaId || "",
        nombre: subcategory.nombre || "",
        descripcion: subcategory.descripcion || "",
        codigo: subcategory.codigo || "",
        activo: subcategory.activo ?? true,
      });
    } else {
      reset({
        categoria: "",
        nombre: "",
        descripcion: "",
        codigo: "",
        activo: true,
      });
    }
  }, [subcategory, reset]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await getServiceCategories({ activo: true });
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Error al cargar categorías",
        life: 3000,
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  const onSubmit = async (data: ServiceSubcategoryFormData) => {
    try {
      if (subcategory?._id) {
        await updateServiceSubcategory(subcategory._id, data);
      } else {
        await createServiceSubcategory(data);
      }
      onSave();
    } catch (error: any) {
      console.error("Error saving subcategory:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          error.response?.data?.message || "Error al guardar la subcategoría",
        life: 3000,
      });
    }
  };

  // Template for category dropdown items with color
  const categoryOptionTemplate = (option: ServiceCategory) => {
    if (!option) return null;

    return (
      <div className="flex align-items-center gap-2">
        <Tag
          value={option.codigo}
          style={{
            backgroundColor: option.color || "#607D8B",
            color: getContrastColor(option.color || "#607D8B"),
            minWidth: "100px",
          }}
        />
        <span>{option.nombre}</span>
      </div>
    );
  };

  // Helper function to get contrast color
  const getContrastColor = (hexColor: string): string => {
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155 ? "#000000" : "#FFFFFF";
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
      <div className="grid">
        {/* Categoría */}
        <div className="col-12">
          <div className="field">
            <label htmlFor="categoria" className="font-bold">
              Categoría <span className="text-red-500">*</span>
            </label>
            <Controller
              name="categoria"
              control={control}
              render={({ field }) => (
                <Dropdown
                  id="categoria"
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  options={categories}
                  optionLabel="nombre"
                  optionValue="_id"
                  placeholder="Seleccione una categoría"
                  filter
                  filterBy="nombre,codigo"
                  emptyMessage="No hay categorías disponibles"
                  emptyFilterMessage="No se encontraron categorías"
                  className={errors.categoria ? "p-invalid" : ""}
                  loading={loadingCategories}
                  itemTemplate={categoryOptionTemplate}
                  valueTemplate={(option, props) => {
                    if (option) {
                      const selectedCategory = categories.find(
                        (c) => c._id === option
                      );
                      if (selectedCategory) {
                        return categoryOptionTemplate(selectedCategory);
                      }
                    }
                    return <span>{props.placeholder}</span>;
                  }}
                />
              )}
            />
            {errors.categoria && (
              <small className="p-error">{errors.categoria.message}</small>
            )}
          </div>
        </div>

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
                  placeholder="Ej: MOTOR"
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
                  placeholder="Ej: Motor"
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
                  placeholder="Descripción de la subcategoría"
                />
              )}
            />
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
                    Subcategoría activa
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
          label={subcategory?._id ? "Actualizar" : "Crear"}
          icon="pi pi-check"
          type="submit"
          loading={isSubmitting}
        />
      </div>
    </form>
  );
}
