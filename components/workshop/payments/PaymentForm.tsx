"use client";
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { classNames } from "primereact/utils";
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
  CreatePaymentData,
} from "@/libs/interfaces/workshop/payment.interface";
import { Invoice } from "@/libs/interfaces/workshop/invoice.interface";
import {
  paymentSchema,
  PaymentFormData,
} from "@/libs/zods/workshop/paymentZod";
import { getInvoices } from "@/app/api/workshop/invoiceService";
import {
  createPayment,
  updatePayment,
} from "@/app/api/workshop/paymentService";

interface PaymentFormProps {
  payment: Payment | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function PaymentForm({
  payment,
  onSave,
  onCancel,
}: PaymentFormProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      invoice: payment?.invoice
        ? typeof payment.invoice === "string"
          ? payment.invoice
          : payment.invoice._id
        : "",
      amount: payment?.amount || 0,
      paymentDate: payment?.paymentDate
        ? new Date(payment.paymentDate)
        : new Date(),
      paymentMethod: payment?.paymentMethod || "efectivo",
      reference: payment?.reference || "",
      notes: payment?.notes || "",
      status: payment?.status || "confirmado",
      paymentDetails: payment?.paymentDetails || {},
    },
  });

  const selectedMethod = watch("paymentMethod");
  const selectedInvoiceId = watch("invoice");

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    if (selectedInvoiceId) {
      const invoice = invoices.find((inv) => inv._id === selectedInvoiceId);
      setSelectedInvoice(invoice || null);
    }
  }, [selectedInvoiceId, invoices]);

  const loadInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const response = await getInvoices({
        status: "emitida",
        eliminado: false,
        limit: 1000,
      });
      // Filter invoices that have balance > 0
      const unpaidInvoices = response.data.docs.filter(
        (inv) => inv.balance > 0 || inv._id === payment?.invoice
      );
      setInvoices(unpaidInvoices);
    } catch (error) {
      console.error("Error loading invoices:", error);
      setError("Error al cargar facturas");
    } finally {
      setLoadingInvoices(false);
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setLoading(true);
      setError(null);

      const paymentData: CreatePaymentData = {
        invoice: data.invoice,
        amount: data.amount,
        paymentDate: data.paymentDate,
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        notes: data.notes,
        status: data.status,
        paymentDetails: data.paymentDetails,
      };

      if (payment?._id) {
        await updatePayment(payment._id, paymentData);
      } else {
        await createPayment(paymentData);
      }

      onSave();
    } catch (error: any) {
      console.error("Error saving payment:", error);
      setError(error.response?.data?.msg || "Error al guardar el pago");
    } finally {
      setLoading(false);
    }
  };

  // Payment method options
  const paymentMethodOptions = [
    { label: "Efectivo", value: "efectivo" },
    { label: "Transferencia Bancaria", value: "transferencia" },
    { label: "Tarjeta de Crédito", value: "tarjeta_credito" },
    { label: "Tarjeta de Débito", value: "tarjeta_debito" },
    { label: "Cheque", value: "cheque" },
    { label: "Criptomoneda", value: "cripto" },
    { label: "Otro", value: "otro" },
  ];

  // Payment status options
  const paymentStatusOptions = [
    { label: "Pendiente", value: "pendiente" },
    { label: "Confirmado", value: "confirmado" },
    { label: "Rechazado", value: "rechazado" },
    { label: "Reembolsado", value: "reembolsado" },
  ];

  // Invoice item template for dropdown
  const invoiceItemTemplate = (option: Invoice) => {
    return (
      <div className="flex flex-column">
        <span style={{ fontFamily: "monospace", fontWeight: "bold" }}>
          {option.invoiceNumber}
        </span>
        <span className="text-sm text-gray-500">
          Balance: {formatCurrency(option.balance)}
        </span>
      </div>
    );
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Render payment details fields based on selected method
  const renderPaymentDetailsFields = () => {
    switch (selectedMethod) {
      case "transferencia":
        return (
          <>
            <div className="field col-12 md:col-6">
              <label htmlFor="bankName">Banco</label>
              <Controller
                name="paymentDetails.bankName"
                control={control}
                render={({ field }) => (
                  <InputText
                    id="bankName"
                    {...field}
                    placeholder="Nombre del banco"
                  />
                )}
              />
            </div>
            <div className="field col-12 md:col-6">
              <label htmlFor="accountNumber">Número de Cuenta</label>
              <Controller
                name="paymentDetails.accountNumber"
                control={control}
                render={({ field }) => (
                  <InputText
                    id="accountNumber"
                    {...field}
                    placeholder="Número de cuenta"
                  />
                )}
              />
            </div>
          </>
        );

      case "tarjeta_credito":
      case "tarjeta_debito":
        return (
          <>
            <div className="field col-12 md:col-6">
              <label htmlFor="cardLastFour">Últimos 4 Dígitos</label>
              <Controller
                name="paymentDetails.cardLastFour"
                control={control}
                render={({ field }) => (
                  <InputText
                    id="cardLastFour"
                    {...field}
                    placeholder="1234"
                    maxLength={4}
                  />
                )}
              />
            </div>
            <div className="field col-12 md:col-6">
              <label htmlFor="cardType">Tipo de Tarjeta</label>
              <Controller
                name="paymentDetails.cardType"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    id="cardType"
                    {...field}
                    options={[
                      { label: "Visa", value: "visa" },
                      { label: "Mastercard", value: "mastercard" },
                      { label: "American Express", value: "amex" },
                      { label: "Otra", value: "other" },
                    ]}
                    placeholder="Seleccione tipo"
                  />
                )}
              />
            </div>
          </>
        );

      case "cheque":
        return (
          <div className="field col-12">
            <label htmlFor="checkNumber">Número de Cheque</label>
            <Controller
              name="paymentDetails.checkNumber"
              control={control}
              render={({ field }) => (
                <InputText
                  id="checkNumber"
                  {...field}
                  placeholder="Número de cheque"
                />
              )}
            />
          </div>
        );

      case "cripto":
        return (
          <>
            <div className="field col-12 md:col-6">
              <label htmlFor="cryptoCurrency">Criptomoneda</label>
              <Controller
                name="paymentDetails.cryptoCurrency"
                control={control}
                render={({ field }) => (
                  <InputText
                    id="cryptoCurrency"
                    {...field}
                    placeholder="Bitcoin, Ethereum, etc."
                  />
                )}
              />
            </div>
            <div className="field col-12 md:col-6">
              <label htmlFor="walletAddress">Dirección de Wallet</label>
              <Controller
                name="paymentDetails.walletAddress"
                control={control}
                render={({ field }) => (
                  <InputText
                    id="walletAddress"
                    {...field}
                    placeholder="Dirección de wallet"
                  />
                )}
              />
            </div>
          </>
        );

      case "otro":
        return (
          <div className="field col-12">
            <label htmlFor="otherDetails">Detalles Adicionales</label>
            <Controller
              name="paymentDetails.otherDetails"
              control={control}
              render={({ field }) => (
                <InputTextarea
                  id="otherDetails"
                  {...field}
                  rows={2}
                  placeholder="Especifique el método de pago"
                />
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <div className="p-message p-message-error mb-3">
          <span className="p-message-icon pi pi-times-circle"></span>
          <span className="p-message-detail">{error}</span>
        </div>
      )}

      <div className="formgrid grid">
        {/* Invoice Selection */}
        <div className="field col-12">
          <label htmlFor="invoice" className="font-bold">
            Factura *
          </label>
          <Controller
            name="invoice"
            control={control}
            rules={{ required: "Factura es requerida" }}
            render={({ field }) => (
              <Dropdown
                id="invoice"
                {...field}
                options={invoices}
                optionLabel="invoiceNumber"
                optionValue="_id"
                placeholder="Seleccione una factura"
                filter
                filterBy="invoiceNumber"
                itemTemplate={invoiceItemTemplate}
                valueTemplate={(option) => {
                  if (!option) return "Seleccione una factura";
                  const invoice = invoices.find((inv) => inv._id === option);
                  return invoice ? invoice.invoiceNumber : option;
                }}
                loading={loadingInvoices}
                disabled={!!payment?._id}
                className={classNames({
                  "p-invalid": errors.invoice,
                })}
              />
            )}
          />
          {errors.invoice && (
            <small className="p-error">{errors.invoice.message}</small>
          )}
        </div>

        {/* Balance Info */}
        {selectedInvoice && (
          <div className="field col-12">
            <div className="surface-100 border-round p-3">
              <div className="grid">
                <div className="col-4">
                  <span className="text-500 text-sm">Total Factura:</span>
                  <div className="text-xl font-bold">
                    {formatCurrency(selectedInvoice.total)}
                  </div>
                </div>
                <div className="col-4">
                  <span className="text-500 text-sm">Pagado:</span>
                  <div className="text-xl font-bold text-green-500">
                    {formatCurrency(selectedInvoice.paidAmount || 0)}
                  </div>
                </div>
                <div className="col-4">
                  <span className="text-500 text-sm">Balance Pendiente:</span>
                  <div className="text-xl font-bold text-orange-500">
                    {formatCurrency(selectedInvoice.balance)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Amount */}
        <div className="field col-12 md:col-6">
          <label htmlFor="amount" className="font-bold">
            Monto (VES) *
          </label>
          <Controller
            name="amount"
            control={control}
            rules={{ required: "Monto es requerido" }}
            render={({ field }) => (
              <InputNumber
                id="amount"
                value={field.value}
                onValueChange={(e) => field.onChange(e.value)}
                mode="currency"
                currency="VES"
                locale="es-VE"
                minFractionDigits={2}
                className={classNames({
                  "p-invalid": errors.amount,
                })}
              />
            )}
          />
          {errors.amount && (
            <small className="p-error">{errors.amount.message}</small>
          )}
        </div>

        {/* Payment Date */}
        <div className="field col-12 md:col-6">
          <label htmlFor="paymentDate" className="font-bold">
            Fecha de Pago
          </label>
          <Controller
            name="paymentDate"
            control={control}
            render={({ field }) => (
              <Calendar
                id="paymentDate"
                value={field.value}
                onChange={(e) => field.onChange(e.value)}
                dateFormat="dd/mm/yy"
                showIcon
                placeholder="Seleccione fecha"
              />
            )}
          />
        </div>

        {/* Payment Method */}
        <div className="field col-12 md:col-6">
          <label htmlFor="paymentMethod" className="font-bold">
            Método de Pago *
          </label>
          <Controller
            name="paymentMethod"
            control={control}
            render={({ field }) => (
              <Dropdown
                id="paymentMethod"
                {...field}
                options={paymentMethodOptions}
                placeholder="Seleccione método"
                className={classNames({
                  "p-invalid": errors.paymentMethod,
                })}
              />
            )}
          />
          {errors.paymentMethod && (
            <small className="p-error">{errors.paymentMethod.message}</small>
          )}
        </div>

        {/* Status */}
        <div className="field col-12 md:col-6">
          <label htmlFor="status" className="font-bold">
            Estado
          </label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Dropdown
                id="status"
                {...field}
                options={paymentStatusOptions}
                placeholder="Seleccione estado"
              />
            )}
          />
        </div>

        {/* Reference */}
        <div className="field col-12">
          <label htmlFor="reference">Referencia / Número de Transacción</label>
          <Controller
            name="reference"
            control={control}
            render={({ field }) => (
              <InputText
                id="reference"
                {...field}
                placeholder="Ej: TRF-001234, AUTH-567890"
              />
            )}
          />
        </div>

        {/* Dynamic Payment Details Fields */}
        {renderPaymentDetailsFields()}

        {/* Notes */}
        <div className="field col-12">
          <label htmlFor="notes">Notas</label>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <InputTextarea
                id="notes"
                {...field}
                rows={3}
                placeholder="Notas adicionales sobre el pago"
              />
            )}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-content-end gap-2">
        <Button
          label="Cancelar"
          icon="pi pi-times"
          outlined
          onClick={onCancel}
          type="button"
        />
        <Button
          label="Guardar"
          icon="pi pi-check"
          loading={loading}
          type="submit"
        />
      </div>
    </form>
  );
}
