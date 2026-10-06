import { useEffect, useRef } from "react";
import { Button, LinkButton } from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import { firstName, formatDayMonth } from "../../domain/format";
import type { Application, Role } from "../../domain/types";
import styles from "./ApplicationSent.module.css";

export interface ApplicationSentProps {
  role: Role;
  application: Application;
  onReset: () => void;
}

export function ApplicationSent({ role, application, onReset }: ApplicationSentProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // FR-017: focus the confirmation heading when it replaces the form.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <Card as="section" tone="accent" padding="lg" className={styles.sent} aria-labelledby="sent-heading">
      <span className={styles.badge} aria-hidden="true">
        ✓
      </span>
      <h2 id="sent-heading" ref={headingRef} tabIndex={-1} className={styles.heading}>
        Application sent
      </h2>
      <p className={styles.body}>
        Thanks {firstName(application.fullName)}. {role.hiringManager.name.split(" ")[0]} and the {role.team} team
        review applications every {role.reviewDay}, and you&rsquo;ll hear from us either way by{" "}
        {formatDayMonth(role.replyBy)}. We&rsquo;ll reply to {application.email}.
      </p>
      <div className={styles.actions}>
        <LinkButton href="/roles" size="md">
          Browse other roles
        </LinkButton>
        <Button variant="secondary" onClick={onReset}>
          Start again
        </Button>
      </div>
    </Card>
  );
}
