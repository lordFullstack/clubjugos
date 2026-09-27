import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "md" | "sm";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-b from-citrus-400 to-citrus-600 text-white shadow-soft",
  secondary: "border-2 border-ink-900/[0.06] bg-white text-ink-700 shadow-card",
  outline: "border border-ink-900/10 text-ink-700",
  ghost: "bg-citrus-500 text-white",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  // min-h-11 (44px) cumple el touch target mínimo aunque el texto sea corto.
  md: "min-h-[3.25rem] w-full gap-2 rounded-2xl px-4 py-4 text-base",
  sm: "min-h-11 gap-1.5 rounded-full px-3.5 py-1.5 text-xs",
};

const BASE =
  "inline-flex shrink-0 items-center justify-center text-center font-bold transition active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100";

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
  "aria-label"?: string;
};

/**
 * Botón base del design system. Si recibe `href`, se renderiza como
 * `next/link` (para CTAs de navegación tipo "ESCANEAR QR" / "VER ÁLBUM");
 * si no, como `<button>` normal (para acciones tipo canjear/confirmar).
 */
export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", children, className = "" } = props;
  const classes = `${BASE} ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`;

  if ("href" in props && props.href !== undefined) {
    const { href, "aria-label": ariaLabel } = props;
    return (
      <Link href={href} aria-label={ariaLabel} className={classes}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, children: _c, className: _cn, ...rest } =
    props as ButtonAsButton;
  void _v;
  void _s;
  void _c;
  void _cn;

  return (
    <button {...rest} className={classes}>
      {children}
    </button>
  );
}
