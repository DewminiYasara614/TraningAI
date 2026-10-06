import { Fragment } from "react";
import type { Role } from "../../domain/types";
import styles from "./RoleDescription.module.css";

/** The full description — never truncated (FR-002). */
export function RoleDescription({ role }: { role: Role }) {
  return (
    <section className={styles.description} aria-label="About the role">
      {role.description.intro.map((paragraph) => (
        <p key={paragraph.slice(0, 32)} className={styles.paragraph}>
          {paragraph}
        </p>
      ))}
      {role.description.sections.map((section) => (
        <Fragment key={section.heading}>
          <h2 className={styles.heading}>{section.heading}</h2>
          <p className={styles.paragraph}>{section.body}</p>
        </Fragment>
      ))}
    </section>
  );
}
