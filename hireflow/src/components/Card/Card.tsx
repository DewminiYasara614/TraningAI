import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.css";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "section" | "aside";
  /** "accent" uses the primary border (success card). */
  tone?: "default" | "accent";
  padding?: "md" | "lg";
  children: ReactNode;
}

export function Card({ as: Tag = "div", tone = "default", padding = "md", className, children, ...rest }: CardProps) {
  const classNames = [styles.card, styles[padding], tone === "accent" ? styles.accent : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  return (
    <Tag className={classNames} {...rest}>
      {children}
    </Tag>
  );
}
