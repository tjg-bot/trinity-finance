"use client";

import * as React from "react";
import { cn } from "../utils";

interface MonetaryInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onChange?: (value: string) => void;
}

/**
 * Monetary input: formats with commas, strips non-numeric on change.
 * Stores raw numeric string value (e.g., "150000.00").
 */
export function MonetaryInput({ className, onChange, value, ...props }: MonetaryInputProps) {
  const format = (v: string): string => {
    const num = v.replace(/[^0-9.]/g, "");
    const parts = num.split(".");
    const integer = parts[0]?.replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? "";
    const decimal = parts[1] !== undefined ? `.${parts[1].slice(0, 2)}` : "";
    return integer + decimal;
  };

  const [display, setDisplay] = React.useState(format(String(value ?? "")));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    setDisplay(format(raw));
    onChange?.(raw);
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">$</span>
      <input
        {...props}
        type="text"
        inputMode="decimal"
        value={display}
        onChange={handleChange}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background pl-7 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      />
    </div>
  );
}
