import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { formatFileSize } from "../../domain/format";
import type { CvFile } from "../../domain/types";
import { toCvFile, validateCvFile } from "../../domain/validation";
import { Button } from "../Button/Button";
import styles from "./FileDrop.module.css";

export interface FileDropProps {
  id: string;
  value: CvFile | null;
  onChange: (file: CvFile | null) => void;
  /** Called with the reason when a chosen or dropped file is not acceptable. */
  onReject: (message: string) => void;
  error?: string;
  /** Id of the hint/error element describing this control. */
  hintId: string;
  /** Id of the visible "CV" label. */
  labelledBy: string;
}

const ACCEPT = ".pdf,.doc,.docx";

export function FileDrop({ id, value, onChange, onReject, error, hintId, labelledBy }: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const chooseRef = useRef<HTMLButtonElement>(null);
  const removeRef = useRef<HTMLButtonElement>(null);
  const focusAfterChange = useRef<"choose" | "remove" | null>(null);
  const [dragging, setDragging] = useState(false);

  // Keep keyboard focus on the control as it swaps between the drop area and the file row.
  useEffect(() => {
    if (focusAfterChange.current === "remove") removeRef.current?.focus();
    if (focusAfterChange.current === "choose") chooseRef.current?.focus();
    focusAfterChange.current = null;
  }, [value]);

  // A file dropped outside the drop area must not make the browser navigate away and lose the form.
  useEffect(() => {
    const block = (event: globalThis.DragEvent) => {
      if (event.dataTransfer?.types.includes("Files")) event.preventDefault();
    };
    window.addEventListener("dragover", block);
    window.addEventListener("drop", block);
    return () => {
      window.removeEventListener("dragover", block);
      window.removeEventListener("drop", block);
    };
  }, []);

  const take = (file: File | undefined, refocus: boolean) => {
    if (!file) return;
    const problem = validateCvFile(file);
    if (problem) {
      onReject(problem);
      return;
    }
    if (refocus) focusAfterChange.current = "remove";
    onChange(toCvFile(file));
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    take(event.target.files?.[0], true);
    // Reset so choosing the same file again still fires a change.
    event.target.value = "";
  };

  const hasFiles = (event: DragEvent) => Array.from(event.dataTransfer.types).includes("Files");

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!hasFiles(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    if (!dragging) setDragging(true);
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setDragging(false);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    take(event.dataTransfer.files[0], false);
  };

  const remove = () => {
    focusAfterChange.current = "choose";
    onChange(null);
  };

  return (
    <>
      {value ? (
        <div className={styles.fileRow}>
          <div className={styles.fileInfo}>
            <span className={styles.badge} aria-hidden="true">
              {value.type.toUpperCase()}
            </span>
            <div className={styles.fileText}>
              <span className={styles.fileName} title={value.name}>
                {value.name}
              </span>
              <span className={styles.fileSize}>{formatFileSize(value.sizeBytes)}</span>
            </div>
          </div>
          <Button
            ref={removeRef}
            variant="ghost"
            onClick={remove}
            aria-label={`Remove ${value.name}`}
            aria-describedby={hintId}
          >
            Remove
          </Button>
        </div>
      ) : (
        <div
          className={styles.dropTarget}
          onDragEnter={onDragOver}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <button
            ref={chooseRef}
            id={id}
            type="button"
            className={[styles.dropZone, dragging ? styles.dragging : "", error ? styles.invalid : ""]
              .filter(Boolean)
              .join(" ")}
            data-dragging={dragging || undefined}
            aria-labelledby={`${labelledBy} ${id}-action`}
            aria-describedby={hintId}
            onClick={() => inputRef.current?.click()}
          >
            <span id={`${id}-action`} className={styles.action}>
              Choose a file
            </span>
            <span className={styles.secondary}>or drag it here · PDF, DOC or DOCX up to 10MB</span>
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className={styles.input}
        tabIndex={-1}
        aria-hidden="true"
        data-testid={`${id}-input`}
        onChange={onInputChange}
      />
    </>
  );
}
