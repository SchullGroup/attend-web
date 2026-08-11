"use client";
import { cn } from "@/lib/utils";
import { InputHTMLAttributes, ReactNode, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// `prefix` is omitted from the inherited attributes because React types the HTML/RDFa
// attribute of that name as a string, which would clash with the ReactNode below. Nothing
// here needs the RDFa one.
interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  hint?: string;
  /**
   * Static, unselectable text pinned to the left of the value — a "+234" dial code, say.
   * Rendered inside the same bordered box, separated by a divider, so the prefix reads as
   * part of the value rather than as a second field.
   */
  prefix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, leftIcon, hint, prefix, className, id, type, ...props },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || props.name;
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      {prefix ? (
        // Prefixed variant: the border lives on the wrapper so the code, divider and value
        // share one box, and the focus ring is driven by focus-within instead of the input.
        <div
          className={cn(
            "flex h-11 w-full items-center rounded-xl border border-input bg-white transition-colors",
            "focus-within:border-primary focus-within:ring-2 focus-within:ring-ring",
            error && "border-destructive focus-within:ring-destructive",
          )}
        >
          {leftIcon && (
            <span className="pl-3 text-muted-foreground pointer-events-none">{leftIcon}</span>
          )}
          <span className={cn("select-none text-sm text-foreground", leftIcon ? "pl-2" : "pl-3")}>
            {prefix}
          </span>
          <span aria-hidden className="mx-2.5 h-5 w-px shrink-0 bg-border" />
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={cn(
              "h-full min-w-0 flex-1 bg-transparent pr-3 text-sm text-foreground",
              "placeholder:text-muted-foreground/70 outline-none disabled:opacity-50",
              className,
            )}
            {...props}
          />
        </div>
      ) : (
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-3 flex items-center text-muted-foreground pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={cn(
              "h-11 w-full rounded-xl border border-input bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground/70",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary",
              "disabled:opacity-50 transition-colors",
              leftIcon && "pl-10",
              isPassword && "pr-10",
              error && "border-destructive focus-visible:ring-destructive",
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
      )}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
});
