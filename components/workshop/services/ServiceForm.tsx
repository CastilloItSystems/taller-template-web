"use client";
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Chips } from "primereact/chips";
import {
  Service,
  ServiceCategory,
  ServiceSubcategory,
} from "@/libs/interfaces/workshop";
import { serviceSchema, ServiceFormData } from "@/libs/zods/workshop";
import {
  createService,
  updateService,
  getServiceCategories,
  getServiceSubcategories,
} from "@/app/api/workshop";

interface ServiceFormProps {
  service: Service | null;
  onSave: () => void;
  onCancel: () => void;
  toast: React.RefObject<any>;
}

export default function ServiceForm({
  service,
  onSave,
  onCancel,
  toast,
}: ServiceFormProps) {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [subcategories, setSubcategories] = useState<ServiceSubcategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const [loadingSubcategories, setLoadingSubcategories] =
    useState<boolean>(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      descripcion: "",
      categoria: "",
      subcategoria: "",
      precioBase: 0,
      tiempoEstimadoMinutos: 30,
      unidadTiempo: "minutos",
      costoHoraAdicional: 0,
      dificultad: "media",
      requiereEspecialista: false,
      garantiaMeses: 0,
      herramientasRequeridas: [],
      piezasComunes: [],
      activo: true,
    },
  });

  const categoriaWatch = watch("categoria");

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (service) {
      const categoriaId =
        typeof service.categoria === "string"
          ? service.categoria
          : service.categoria._id || "";

      const subcategoriaId = service.subcategoria
        ? typeof service.subcategoria === "string"
          ? service.subcategoria
          : service.subcategoria._id || ""
        : "";

      setSelectedCategoryId(categoriaId);

      reset({
        codigo: service.codigo || "",
        nombre: service.nombre || "",
        descripcion: service.descripcion || "",
        categoria: categoriaId,
        subcategoria: subcategoriaId,
        precioBase: service.precioBase || 0,
        tiempoEstimadoMinutos: service.tiempoEstimadoMinutos || 30,
        unidadTiempo: service.unidadTiempo || "minutos",
        costoHoraAdicional: service.costoHoraAdicional || 0,
        dificultad: service.dificultad || "media",
        requiereEspecialista: service.requiereEspecialista || false,
        garantiaMeses: service.garantiaMeses || 0,
        herramientasRequeridas: service.herramientasRequeridas || [],
        piezasComunes: service.piezasComunes || [],
        activo: service.activo ?? true,
      });

      // Load subcategories for the selected category
      if (categoriaId) {
        loadSubcategories(categoriaId);
      }
    } else {
      reset({
        codigo: "",
        nombre: "",
        descripcion: "",
        categoria: "",
        subcategoria: "",
        precioBase: 0,
        tiempoEstimadoMinutos: 30,
        unidadTiempo: "minutos",
        costoHoraAdicional: 0,
        dificultad: "media",
        requiereEspecialista: false,
        garantiaMeses: 0,
        herramientasRequeridas: [],
        piezasComunes: [],
        activo: true,
      });
    }
  }, [service, reset]);

  // Watch categoria changes to load subcategories
  useEffect(() => {
    if (categoriaWatch && categoriaWatch !== selectedCategoryId) {
      setSelectedCategoryId(categoriaWatch);
      setValue("subcategoria", ""); // Reset subcategory when category changes
      loadSubcategories(categoriaWatch);
    }
  }, [categoriaWatch, selectedCategoryId, setValue]);

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

  const loadSubcategories = async (categoriaId: string) => {
    if (!categoriaId) {
      setSubcategories([]);
      return;
    }

    try {
      setLoadingSubcategories(true);
      const response = await getServiceSubcategories({
        categoria: categoriaId,
        activo: true,
      });
      setSubcategories(response.data || []);
    } catch (error) {
      console.error("Error loading subcategories:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Error al cargar subcategorías",
        life: 3000,
      });
    } finally {
      setLoadingSubcategories(false);
    }
  };

  const onSubmit = async (data: ServiceFormData) => {
    try {
      if (service?._id) {
        await updateService(service._id, data);
      } else {
        await createService(data);
      }
      onSave();
    } catch (error: any) {
      console.error("Error saving service:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Error al guardar el servicio",
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

  const dificultadOptions = [
    { label: "Baja", value: "baja" },
    { label: "Media", value: "media" },
    { label: "Alta", value: "alta" },
    { label: "Experto", value: "experto" },
  ];

  const unidadTiempoOptions = [
    { label: "Minutos", value: "minutos" },
    { label: "Horas", value: "horas" },
    { label: "Días", value: "dias" },
  ];

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
                  placeholder="Ej: CAMBIO_ACEITE"
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
                  placeholder="Ej: Cambio de Aceite"
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
              Descripción <span className="text-red-500">*</span>
            </label>
            <Controller
              name="descripcion"
              control={control}
              render={({ field }) => (
                <InputTextarea
                  id="descripcion"
                  {...field}
                  rows={3}
                  placeholder="Descripción detallada del servicio"
                  className={errors.descripcion ? "p-invalid" : ""}
                />
              )}
            />
            {errors.descripcion && (
              <small className="p-error">{errors.descripcion.message}</small>
            )}
          </div>
        </div>

        {/* Categoría */}
        <div className="col-12 md:col-6">
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

        {/* Subcategoría */}
        <div className="col-12 md:col-6">
          <div className="field">
            <label htmlFor="subcategoria" className="font-bold">
              Subcategoría
            </label>
            <Controller
              name="subcategoria"
              control={control}
              render={({ field }) => (
                <Dropdown
                  id="subcategoria"
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  options={subcategories}
                  optionLabel="nombre"
                  optionValue="_id"
                  placeholder={
                    selectedCategoryId
                      ? "Seleccione una subcategoría"
                      : "Primero seleccione una categoría"
                  }
                  filter
                  filterBy="nombre,codigo"
                  emptyMessage="No hay subcategorías disponibles"
                  emptyFilterMessage="No se encontraron subcategorías"
                  disabled={!selectedCategoryId}
                  loading={loadingSubcategories}
                />
              )}
            />
            {errors.subcategoria && (
              <small className="p-error">{errors.subcategoria.message}</small>
            )}
          </div>
        </div>

        {/* Precio Base */}
        <div className="col-12 md:col-4">
          <div className="field">
            <label htmlFor="precioBase" className="font-bold">
              Precio Base (VES) <span className="text-red-500">*</span>
            </label>
            <Controller
              name="precioBase"
              control={control}
              render={({ field }) => (
                <InputNumber
                  id="precioBase"
                  value={field.value}
                  onValueChange={(e) => field.onChange(e.value)}
                  mode="currency"
                  currency="VES"
                  locale="es-VE"
                  minFractionDigits={2}
                  min={0}
                  className={errors.precioBase ? "p-invalid" : ""}
                />
              )}
            />
            {errors.precioBase && (
              <small className="p-error">{errors.precioBase.message}</small>
            )}
          </div>
        </div>

        {/* Tiempo Estimado */}
        <div className="col-12 md:col-4">
          <div className="field">
            <label htmlFor="tiempoEstimadoMinutos" className="font-bold">
              Tiempo Estimado <span className="text-red-500">*</span>
            </label>
            <Controller
              name="tiempoEstimadoMinutos"
              control={control}
              render={({ field }) => (
                <InputNumber
                  id="tiempoEstimadoMinutos"
                  value={field.value}
                  onValueChange={(e) => field.onChange(e.value)}
                  showButtons
                  min={1}
                  suffix=" min"
                  className={errors.tiempoEstimadoMinutos ? "p-invalid" : ""}
                />
              )}
            />
            {errors.tiempoEstimadoMinutos && (
              <small className="p-error">
                {errors.tiempoEstimadoMinutos.message}
              </small>
            )}
          </div>
        </div>

        {/* Unidad de Tiempo */}
        <div className="col-12 md:col-4">
          <div className="field">
            <label htmlFor="unidadTiempo" className="font-bold">
              Unidad de Tiempo
            </label>
            <Controller
              name="unidadTiempo"
              control={control}
              render={({ field }) => (
                <Dropdown
                  id="unidadTiempo"
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  options={unidadTiempoOptions}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Seleccione unidad"
                />
              )}
            />
          </div>
        </div>

        {/* Costo Hora Adicional */}
        <div className="col-12 md:col-4">
          <div className="field">
            <label htmlFor="costoHoraAdicional" className="font-bold">
              Costo Hora Adicional (VES)
            </label>
            <Controller
              name="costoHoraAdicional"
              control={control}
              render={({ field }) => (
                <InputNumber
                  id="costoHoraAdicional"
                  value={field.value}
                  onValueChange={(e) => field.onChange(e.value)}
                  mode="currency"
                  currency="VES"
                  locale="es-VE"
                  minFractionDigits={2}
                  min={0}
                />
              )}
            />
          </div>
        </div>

        {/* Dificultad */}
        <div className="col-12 md:col-4">
          <div className="field">
            <label htmlFor="dificultad" className="font-bold">
              Dificultad
            </label>
            <Controller
              name="dificultad"
              control={control}
              render={({ field }) => (
                <Dropdown
                  id="dificultad"
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  options={dificultadOptions}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Seleccione dificultad"
                />
              )}
            />
          </div>
        </div>

        {/* Garantía */}
        <div className="col-12 md:col-4">
          <div className="field">
            <label htmlFor="garantiaMeses" className="font-bold">
              Garantía (meses)
            </label>
            <Controller
              name="garantiaMeses"
              control={control}
              render={({ field }) => (
                <InputNumber
                  id="garantiaMeses"
                  value={field.value}
                  onValueChange={(e) => field.onChange(e.value)}
                  showButtons
                  min={0}
                  suffix=" meses"
                />
              )}
            />
          </div>
        </div>

        {/* Herramientas Requeridas */}
        <div className="col-12 md:col-6">
          <div className="field">
            <label htmlFor="herramientasRequeridas" className="font-bold">
              Herramientas Requeridas
            </label>
            <Controller
              name="herramientasRequeridas"
              control={control}
              render={({ field }) => (
                <Chips
                  id="herramientasRequeridas"
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  placeholder="Presione Enter para agregar"
                  separator=","
                />
              )}
            />
            <small className="text-500">
              Escriba y presione Enter para agregar cada herramienta
            </small>
          </div>
        </div>

        {/* Piezas Comunes */}
        <div className="col-12 md:col-6">
          <div className="field">
            <label htmlFor="piezasComunes" className="font-bold">
              Piezas Comunes
            </label>
            <Controller
              name="piezasComunes"
              control={control}
              render={({ field }) => (
                <Chips
                  id="piezasComunes"
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  placeholder="Presione Enter para agregar"
                  separator=","
                />
              )}
            />
            <small className="text-500">
              Escriba y presione Enter para agregar cada pieza
            </small>
          </div>
        </div>

        {/* Requiere Especialista */}
        <div className="col-12 md:col-6">
          <div className="field-checkbox">
            <Controller
              name="requiereEspecialista"
              control={control}
              render={({ field }) => (
                <div className="flex align-items-center">
                  <Checkbox
                    inputId="requiereEspecialista"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.checked)}
                  />
                  <label
                    htmlFor="requiereEspecialista"
                    className="ml-2 font-bold"
                  >
                    Requiere Especialista
                  </label>
                </div>
              )}
            />
          </div>
        </div>

        {/* Activo */}
        <div className="col-12 md:col-6">
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
                    Servicio activo
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
          label={service?._id ? "Actualizar" : "Crear"}
          icon="pi pi-check"
          type="submit"
          loading={isSubmitting}
        />
      </div>
    </form>
  );
}
