import * as React from "react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

const inputVariants = cva(
  "border-transparent placeholder:text-neutral-400 selection:bg-blue-500 selection:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex h-9 w-full min-w-0 rounded-lg px-4 py-2 text-base bg-transparent transition-all duration-300 ease-in-out shadow-md hover:shadow-lg focus:shadow-lg outline-none disabled:pointer-events-none disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default:
          "border border-neutral-300 bg-transparent text-neutral-800 placeholder:text-neutral-400 hover:border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        destructive:
          "bg-red-500 text-white placeholder:text-red-300 hover:bg-red-400 focus:ring-red-500 focus:border-red-500",
        outline:
          "border border-neutral-400 bg-transparent text-neutral-800 hover:border-neutral-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        invisible:
          "border-0 bg-transparent text-neutral-800 focus:ring-2 focus:ring-blue-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Input({
  className,
  type,
  value,
  variant,
  ...props
}) {
  const safeValue = value === null || value === undefined ? "" : value;
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, className }))}
      value={type !== 'file' ? safeValue : value}
      {...props} />
  );
}

export { Input };
