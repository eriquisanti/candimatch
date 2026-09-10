import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline";
type ButtonSize = "md" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 hover:-translate-y-0.5 active:translate-y-0",
  secondary:
    "bg-white text-zinc-900 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50",
  outline: "bg-transparent text-white border border-white/40 hover:bg-white/10",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: "px-6 py-3.5 text-base",
  sm: "px-5 py-2.5 text-sm",
};

export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    />
  );
}
