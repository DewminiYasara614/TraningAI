import { useEffect, useRef, useState, type FormEvent } from "react";
import { Alert } from "../../components/Alert/Alert";
import { Button } from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import { FileDrop } from "../../components/FileDrop/FileDrop";
import { TextField } from "../../components/TextField/TextField";
import type { Application, CvFile, FormStatus, Role } from "../../domain/types";
import { MAX_COVER_NOTE, validateApplication } from "../../domain/validation";
import { useServices } from "../../services/ServicesContext";
import styles from "./ApplicationForm.module.css";

export interface ApplicationFormProps {
  role: Role;
  onSent: (application: Application) => void;
}

const FAILURE_MESSAGE = "We couldn't send your application. Your details are still here — please try again.";

type FocusRequest = { target: "summary" | "failure"; seq: number } | null;

export function ApplicationForm({ role, onSent }: ApplicationFormProps) {
  const { applicationService } = useServices();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [cv, setCv] = useState<CvFile | null>(null);
  const [cvRejection, setCvRejection] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  const [status, setStatus] = useState<Exclude<FormStatus, "success">>("idle");
  const [saveFailed, setSaveFailed] = useState(false);
  const [focusRequest, setFocusRequest] = useState<FocusRequest>(null);

  const submittingRef = useRef(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const failureRef = useRef<HTMLDivElement>(null);

  // Errors appear only after the first send attempt, then track every change live (FR-005, FR-007).
  const errors = tried ? validateApplication({ fullName, email, coverNote, cv }) : {};
  const errorCount = Object.keys(errors).length;
  const cvMessage = cvRejection ?? errors.cv;

  useEffect(() => {
    if (!focusRequest) return;
    (focusRequest.target === "summary" ? summaryRef : failureRef).current?.focus();
  }, [focusRequest]);

  const requestFocus = (target: "summary" | "failure") =>
    setFocusRequest((previous) => ({ target, seq: (previous?.seq ?? 0) + 1 }));

  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (submittingRef.current) return;
    setSaveFailed(false);

    const failures = validateApplication({ fullName, email, coverNote, cv });
    if (!cv || Object.keys(failures).length > 0) {
      setTried(true);
      requestFocus("summary");
      return;
    }

    submittingRef.current = true;
    setStatus("submitting");
    try {
      const application = await applicationService.submit({ roleId: role.id, fullName, email, coverNote, cv });
      onSent(application);
    } catch {
      submittingRef.current = false;
      setStatus("idle");
      setSaveFailed(true);
      requestFocus("failure");
    }
  };

  const chooseCv = (file: CvFile | null) => {
    setCv(file);
    setCvRejection(null);
  };

  return (
    <Card as="section" className={styles.form} aria-labelledby="apply-heading">
      <div className={styles.intro}>
        <h2 id="apply-heading" className={styles.heading}>
          Apply for this role
        </h2>
        <p className={styles.lead}>Takes about five minutes. We reply to every application.</p>
      </div>

      <form className={styles.fields} noValidate onSubmit={send} aria-labelledby="apply-heading">
        {errorCount > 0 && (
          <Alert
            ref={summaryRef}
            title={
              errorCount === 1
                ? "One thing needs fixing before you can send this."
                : "A few things need fixing before you can send this."
            }
          >
            Check the highlighted fields below.
          </Alert>
        )}
        {saveFailed && <Alert ref={failureRef} title={FAILURE_MESSAGE} />}

        <div className={styles.pair}>
          <TextField
            id="ap-name"
            label="Full name"
            hint="As it appears on your CV."
            error={errors.fullName}
            value={fullName}
            onChange={setFullName}
            placeholder="Ravi Shah"
            autoComplete="name"
          />
          <TextField
            id="ap-email"
            type="email"
            label="Email"
            hint="We'll only use this about your application."
            error={errors.email}
            value={email}
            onChange={setEmail}
            placeholder="name@company.com"
            autoComplete="email"
          />
        </div>

        <div className={styles.cv} role="group" aria-labelledby="ap-cv-label">
          <span id="ap-cv-label" className={styles.cvLabel}>
            CV
          </span>
          <FileDrop
            id="ap-cv"
            value={cv}
            onChange={chooseCv}
            onReject={setCvRejection}
            error={cvMessage}
            hintId="ap-cv-message"
            labelledBy="ap-cv-label"
          />
          <span id="ap-cv-message" className={cvMessage ? styles.error : styles.hint} aria-live="polite">
            {cvMessage ?? "PDF, DOC or DOCX, up to 10MB."}
          </span>
        </div>

        <TextField
          id="ap-note"
          multiline
          rows={5}
          label="Cover note"
          optionalLabel="(optional)"
          hint={coverNote.length === 0 ? "Up to 500 characters." : `${coverNote.length} / ${MAX_COVER_NOTE} characters`}
          value={coverNote}
          onChange={(value) => setCoverNote(value.slice(0, MAX_COVER_NOTE))}
          maxLength={MAX_COVER_NOTE}
          placeholder={`Anything you'd like ${role.hiringManager.name.split(" ")[0]} to know before reading your CV.`}
        />

        <div className={styles.actions}>
          <Button type="submit" className={styles.send} busy={status === "submitting"} busyLabel="Sending…">
            Send application
          </Button>
          <span className={styles.privacy}>
            Your details go to {role.company} only. We delete applications six months after the role closes.
          </span>
        </div>
      </form>
    </Card>
  );
}
