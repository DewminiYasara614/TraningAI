import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type MouseEvent } from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "lg" | "md" | "sm";

const defaultSize: Record<ButtonVariant, ButtonSize> = { primary: "lg", secondary: "md", ghost: "sm" };

function classes(variant: ButtonVariant, size: ButtonSize | undefined, fullWidth: boolean, extra?: string) {
  return [
    styles.button,
    styles[variant],
    styles[size ?? defaultSize[variant]],
    fullWidth ? styles.fullWidth : "",
    extra ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** While busy the button stays focusable but ignores activation, and shows `busyLabel`. */
  busy?: boolean;
  busyLabel?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size, fullWidth = false, busy = false, busyLabel, className, type = "button", onClick, children, ...rest },
  ref,
) {
  // aria-disabled rather than disabled while busy, so keyboard focus is not lost mid-submit.
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (busy) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      ref={ref}
      type={type}
      className={classes(variant, size, fullWidth, className)}
      aria-busy={busy || undefined}
      aria-disabled={busy || rest.disabled || undefined}
      onClick={handleClick}
      {...rest}
    >
      {busy && busyLabel ? busyLabel : children}
    </button>
  );
});

export interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** A link that looks like a button (e.g. "Browse other roles"). */
export function LinkButton({ variant = "primary", size, className, children, ...rest }: LinkButtonProps) {
  return (
    <a className={classes(variant, size, false, className)} {...rest}>
      {children}
    </a>
  );
}
