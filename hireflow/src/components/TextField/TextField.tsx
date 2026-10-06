import type { ChangeEvent, ReactNode } from "react";
import styles from "./TextField.module.css";

interface BaseProps {
  id: string;
  label: string;
  /** Rendered after the label in muted text, e.g. "(optional)". */
  optionalLabel?: string;
  hint: ReactNode;
  /** Replaces the hint and marks the field invalid. */
  error?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  autoComplete?: string;
}

export type TextFieldProps = BaseProps &
  ({ multiline?: false; type?: "text" | "email"; rows?: never } | { multiline: true; rows?: number; type?: never });

export function TextField(props: TextFieldProps) {
  const { id, label, optionalLabel, hint, error, value, onChange, placeholder, maxLength, autoComplete } = props;
  const messageId = `${id}-message`;
  const shared = {
    id,
    value,
    placeholder,
    maxLength,
    autoComplete,
    "aria-describedby": messageId,
    "aria-invalid": error ? true : undefined,
    className: [styles.control, error ? styles.invalid : ""].filter(Boolean).join(" "),
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
  };

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {optionalLabel && (
          <>
            {" "}
            <span className={styles.optional}>{optionalLabel}</span>
          </>
        )}
      </label>
      {props.multiline ? (
        <textarea {...shared} rows={props.rows ?? 5} className={`${shared.className} ${styles.multiline}`} />
      ) : (
        <input {...shared} type={props.type ?? "text"} />
      )}
      <span id={messageId} className={error ? styles.error : styles.hint}>
        {error ?? hint}
      </span>
    </div>
  );
}
