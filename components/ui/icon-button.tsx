import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

export type IconButtonSize = "md" | "lg";

type CommonProps = {
  children: ReactNode;
  className?: string;
  size?: IconButtonSize;
  "aria-label": string;
};

type IconButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type IconButtonAsLink = CommonProps & { href: string };

// md = h-11 w-11 (44x44px), el touch target mínimo del design system.
// lg = h-16 w-16, para el CTA circular destacado (ej. escanear en la nav).
const SIZE_CLASS: Record<IconButtonSize, string> = {
  md: "h-11 w-11",
  lg: "h-16 w-16",
};

const BASE = "inline-flex shrink-0 items-center justify-center rounded-full transition active:scale-95";

/** Botón circular solo-ícono. Igual que `Button`, se renderiza como link si recibe `href`. */
export function IconButton(props: IconButtonAsButton | IconButtonAsLink) {
  const { children, className = "", size = "md", "aria-label": ariaLabel } = props;
  const classes = `${BASE} ${SIZE_CLASS[size]} ${className}`;

  if ("href" in props && props.href !== undefined) {
    return (
      <Link href={props.href} aria-label={ariaLabel} className={classes}>
        {children}
      </Link>
    );
  }

  const { children: _c, className: _cn, href: _h, size: _s, ...rest } =
    props as IconButtonAsButton;
  void _c;
  void _cn;
  void _h;
  void _s;

  return (
    <button {...rest} aria-label={ariaLabel} className={classes}>
      {children}
    </button>
  );
}
