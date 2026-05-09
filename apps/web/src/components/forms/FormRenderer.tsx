"use client";

/**
 * Trinity Finance Form Renderer
 * Consumes FieldDef[] schema, evaluates showIf conditions reactively,
 * and renders the appropriate input for each field type.
 * Form progress is auto-saved every 5 seconds.
 */
import { useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import type { FieldDef } from "@trinity/forms";
import { isFieldVisible } from "@trinity/forms";
import { Label } from "@trinity/ui";
import { Input } from "@trinity/ui";
import { Textarea } from "@trinity/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@trinity/ui";
import { SignaturePad } from "@trinity/ui";
import { MonetaryInput } from "@trinity/ui";
import { cn } from "@trinity/ui";

interface FormRendererProps {
  fields: FieldDef[];
  defaultValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
  onAutoSave?: (values: Record<string, unknown>) => void;
  isLoading?: boolean;
  submitLabel?: string;
  className?: string;
}

export function FormRenderer({
  fields,
  defaultValues,
  onSubmit,
  onAutoSave,
  isLoading,
  submitLabel = "Continue",
  className,
}: FormRendererProps) {
  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues ?? {},
    mode: "onSubmit",
  });

  const allValues = watch();

  // Auto-save every 5 seconds
  useEffect(() => {
    if (!onAutoSave) return;
    const interval = setInterval(() => {
      onAutoSave(getValues() as Record<string, unknown>);
    }, 5000);
    return () => clearInterval(interval);
  }, [onAutoSave, getValues]);

  const handleFormSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      // Strip invisible fields before submit
      const filtered: Record<string, unknown> = {};
      for (const field of fields) {
        if (isFieldVisible(field, data)) {
          filtered[field.id] = data[field.id];
        }
      }
      await onSubmit(filtered);
    },
    [fields, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit(handleFormSubmit as Parameters<typeof handleSubmit>[0])} className={cn("space-y-6", className)}>
      {fields.map((field) => {
        const visible = isFieldVisible(field, allValues as Record<string, unknown>);
        if (!visible) return null;

        return (
          <FieldRenderer
            key={field.id}
            field={field}
            control={control}
            error={errors[field.id]?.message as string | undefined}
          />
        );
      })}

      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-[#0B2545] px-6 py-3 font-semibold text-[#C9A227] transition hover:bg-[#0d2d52] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[200px]"
        >
          {isLoading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

interface FieldRendererProps {
  field: FieldDef;
  control: ReturnType<typeof useForm>["control"];
  error?: string;
}

function FieldRenderer({ field, control, error }: FieldRendererProps) {
  return (
    <div className="space-y-1.5">
      {field.inputType !== "auto_date" && (
        <Label htmlFor={field.id} className="flex items-start gap-1">
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
        </Label>
      )}

      {field.helpText && (
        <p className="text-sm text-gray-500">{field.helpText}</p>
      )}

      <Controller
        name={field.id}
        control={control}
        rules={{ required: field.required ? `${field.label} is required` : false }}
        render={({ field: rhfField }) => {
          switch (field.inputType) {
            case "text":
            case "email":
            case "tel":
            case "url":
            case "number":
              return (
                <Input
                  {...rhfField}
                  id={field.id}
                  type={field.inputType === "number" ? "number" : field.inputType === "email" ? "email" : field.inputType === "tel" ? "tel" : field.inputType === "url" ? "url" : "text"}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  value={String(rhfField.value ?? "")}
                  className={error ? "border-red-500" : ""}
                />
              );

            case "textarea":
              return (
                <Textarea
                  {...rhfField}
                  id={field.id}
                  placeholder={field.placeholder}
                  rows={field.rows ?? 3}
                  value={String(rhfField.value ?? "")}
                  className={error ? "border-red-500" : ""}
                />
              );

            case "monetary":
              return (
                <MonetaryInput
                  id={field.id}
                  placeholder={field.placeholder ?? "0.00"}
                  value={String(rhfField.value ?? "")}
                  onChange={(v) => rhfField.onChange(v)}
                  className={error ? "border-red-500" : ""}
                />
              );

            case "dropdown":
            case "select_one":
              return (
                <Select
                  value={String(rhfField.value ?? "")}
                  onValueChange={rhfField.onChange}
                >
                  <SelectTrigger id={field.id} className={error ? "border-red-500" : ""}>
                    <SelectValue placeholder={field.placeholder ?? `Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );

            case "signature":
              return (
                <SignaturePad
                  onChange={(dataUrl) => rhfField.onChange(dataUrl)}
                  className={error ? "border-red-500" : ""}
                />
              );

            case "auto_date":
              // Auto-filled server-side, displayed read-only
              return (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Date:</span>
                  <span>{new Date().toLocaleDateString("en-US")}</span>
                  <input type="hidden" {...rhfField} value={new Date().toISOString()} />
                </div>
              );

            default:
              return (
                <Input
                  {...rhfField}
                  id={field.id}
                  value={String(rhfField.value ?? "")}
                />
              );
          }
        }}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
