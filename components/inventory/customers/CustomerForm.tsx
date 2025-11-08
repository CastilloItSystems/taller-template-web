"use client";
import React, { useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { classNames } from "primereact/utils";
import { customerSchema } from "@/libs/zods/inventory/customerZod";
import {
  createCustomer,
  updateCustomer,
} from "@/app/api/inventory/customerService";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { handleFormError } from "@/utils/errorHandlers";
import { LayoutContext } from "@/layout/context/layoutcontext";

type FormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  customer: any;
  hideFormDialog: () => void;
  customers: any[];
  setCustomers: (customers: any[]) => void;
  setCustomer: (customer: any) => void;
  showToast: (
    severity: "success" | "error",
    summary: string,
    detail: string
  ) => void;
  toast: React.RefObject<Toast> | null;
}

const tipoOptions = [
  { label: "Persona", value: "persona" },
  { label: "Empresa", value: "empresa" },
];

const estadoOptions = [
  { label: "Activo", value: "activo" },
  { label: "Inactivo", value: "inactivo" },
];

const CustomerForm = ({
  customer,
  toast,
  hideFormDialog,
  customers,
  setCustomers,
  showToast,
}: CustomerFormProps) => {
  const { layoutConfig } = useContext(LayoutContext);
  const filledInput = layoutConfig.inputStyle === "filled";

  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      tipo: "persona",
      estado: "activo",
    },
  });

  const tipoValue = watch("tipo");

  useEffect(() => {
    if (customer) {
      // Set form values
      Object.keys(customer).forEach((key) => {
        const k = key as keyof FormData;
        const val = (customer as any)[key];
        setValue(k, val as any);
      });
    }
  }, [customer, setValue]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const payload: any = { ...data };

      if (customer) {
        const updatedCustomer = await updateCustomer(customer.id, payload);
        const updatedCustomers = customers.map((c) =>
          c.id === updatedCustomer.id ? updatedCustomer : c
        );
        setCustomers(updatedCustomers);
        showToast("success", "Éxito", "Cliente actualizado");
      } else {
        const newCustomer = await createCustomer(payload);
        setCustomers([...customers, newCustomer]);
        showToast("success", "Éxito", "Cliente creado");
      }
      hideFormDialog();
    } catch (error) {
      handleFormError(error, toast);
    } finally {
      setSubmitting(false);
    }
  };

  const getFormErrorMessage = (name: string) => {
    return (
      errors[name as keyof FormData] && (
        <small className="p-error">
          {errors[name as keyof FormData]?.message}
        </small>
      )
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
      <div className="grid">
        {/* Nombre */}
        <div className="col-12 md:col-6">
          <label htmlFor="nombre" className="block text-900 font-medium mb-2">
            Nombre *
          </label>
          <InputText
            id="nombre"
            {...register("nombre")}
            className={classNames(
              { "p-invalid": errors.nombre },
              { "p-filled": filledInput }
            )}
            placeholder="Ingrese el nombre"
          />
          {getFormErrorMessage("nombre")}
        </div>

        {/* Tipo */}
        <div className="col-12 md:col-6">
          <label htmlFor="tipo" className="block text-900 font-medium mb-2">
            Tipo *
          </label>
          <Controller
            name="tipo"
            control={control}
            render={({ field }) => (
              <Dropdown
                id="tipo"
                {...field}
                options={tipoOptions}
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccione el tipo"
                className={classNames(
                  { "p-invalid": errors.tipo },
                  { "p-filled": filledInput }
                )}
              />
            )}
          />
          {getFormErrorMessage("tipo")}
        </div>

        {/* Teléfono */}
        <div className="col-12 md:col-6">
          <label htmlFor="telefono" className="block text-900 font-medium mb-2">
            Teléfono
          </label>
          <InputText
            id="telefono"
            {...register("telefono")}
            className={classNames(
              { "p-invalid": errors.telefono },
              { "p-filled": filledInput }
            )}
            placeholder="Ingrese el teléfono"
          />
          {getFormErrorMessage("telefono")}
        </div>

        {/* Correo */}
        <div className="col-12 md:col-6">
          <label htmlFor="correo" className="block text-900 font-medium mb-2">
            Correo
          </label>
          <InputText
            id="correo"
            {...register("correo")}
            className={classNames(
              { "p-invalid": errors.correo },
              { "p-filled": filledInput }
            )}
            placeholder="Ingrese el correo"
          />
          {getFormErrorMessage("correo")}
        </div>

        {/* Dirección */}
        <div className="col-12">
          <label
            htmlFor="direccion"
            className="block text-900 font-medium mb-2"
          >
            Dirección
          </label>
          <InputText
            id="direccion"
            {...register("direccion")}
            className={classNames(
              { "p-invalid": errors.direccion },
              { "p-filled": filledInput }
            )}
            placeholder="Ingrese la dirección"
          />
          {getFormErrorMessage("direccion")}
        </div>

        {/* RIF - Solo para empresas */}
        {tipoValue === "empresa" && (
          <div className="col-12 md:col-6">
            <label htmlFor="rif" className="block text-900 font-medium mb-2">
              RIF
            </label>
            <InputText
              id="rif"
              {...register("rif")}
              className={classNames(
                { "p-invalid": errors.rif },
                { "p-filled": filledInput }
              )}
              placeholder="Ingrese el RIF"
            />
            {getFormErrorMessage("rif")}
          </div>
        )}

        {/* Razón Social - Solo para empresas */}
        {tipoValue === "empresa" && (
          <div className="col-12 md:col-6">
            <label
              htmlFor="razonSocial"
              className="block text-900 font-medium mb-2"
            >
              Razón Social
            </label>
            <InputText
              id="razonSocial"
              {...register("razonSocial")}
              className={classNames(
                { "p-invalid": errors.razonSocial },
                { "p-filled": filledInput }
              )}
              placeholder="Ingrese la razón social"
            />
            {getFormErrorMessage("razonSocial")}
          </div>
        )}

        {/* Notas */}
        <div className="col-12">
          <label htmlFor="notas" className="block text-900 font-medium mb-2">
            Notas
          </label>
          <Controller
            name="notas"
            control={control}
            render={({ field }) => (
              <InputTextarea
                id="notas"
                {...field}
                rows={3}
                className={classNames(
                  { "p-invalid": errors.notas },
                  { "p-filled": filledInput }
                )}
                placeholder="Ingrese notas adicionales"
              />
            )}
          />
          {getFormErrorMessage("notas")}
        </div>

        {/* Estado */}
        <div className="col-12 md:col-6">
          <label htmlFor="estado" className="block text-900 font-medium mb-2">
            Estado *
          </label>
          <Controller
            name="estado"
            control={control}
            render={({ field }) => (
              <Dropdown
                id="estado"
                {...field}
                options={estadoOptions}
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccione el estado"
                className={classNames(
                  { "p-invalid": errors.estado },
                  { "p-filled": filledInput }
                )}
              />
            )}
          />
          {getFormErrorMessage("estado")}
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-content-end gap-2 mt-4">
        <Button
          type="button"
          label="Cancelar"
          icon="pi pi-times"
          className="p-button-text"
          onClick={hideFormDialog}
        />
        <Button
          type="submit"
          label={customer ? "Actualizar" : "Crear"}
          icon="pi pi-check"
          loading={submitting}
          disabled={submitting}
        />
      </div>
    </form>
  );
};

export default CustomerForm;
