import { useState } from "react";
import type { Application, Role } from "../../domain/types";
import { ApplicationForm } from "./ApplicationForm";
import { ApplicationSent } from "./ApplicationSent";
import styles from "./JobApplicationPage.module.css";
import { RoleDescription } from "./RoleDescription";
import { RoleFacts } from "./RoleFacts";
import { RoleHeader } from "./RoleHeader";

export function JobApplicationPage({ role }: { role: Role }) {
  // The page always opens on an empty form; sent applications stay in storage only (research §10).
  const [sent, setSent] = useState<Application | null>(null);
  const [formKey, setFormKey] = useState(0);

  const startAgain = () => {
    setSent(null);
    setFormKey((key) => key + 1); // remount so the form returns to its default state (FR-020)
  };

  return (
    <>
      <RoleHeader role={role} />
      <div className={styles.columns}>
        <RoleFacts role={role} className={styles.facts} />
        <div className={styles.main}>
          <RoleDescription role={role} />
          {sent ? (
            <ApplicationSent role={role} application={sent} onReset={startAgain} />
          ) : (
            <ApplicationForm key={formKey} role={role} onSent={setSent} />
          )}
        </div>
      </div>
    </>
  );
}
