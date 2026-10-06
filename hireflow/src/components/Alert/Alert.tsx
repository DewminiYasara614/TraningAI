import { forwardRef, type ReactNode } from "react";
import styles from "./Alert.module.css";

export interface AlertProps {
  title: string;
  children?: ReactNode;
}

/** Error summary / failure alert. Announced on appearance; focusable so callers can move focus to it. */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert({ title, children }, ref) {
  return (
    <div ref={ref} role="alert" tabIndex={-1} className={styles.alert}>
      <span className={styles.title}>{title}</span>
      {children && <span className={styles.body}>{children}</span>}
    </div>
  );
});
