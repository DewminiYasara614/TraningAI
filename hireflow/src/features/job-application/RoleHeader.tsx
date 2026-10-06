import type { Role } from "../../domain/types";
import styles from "./RoleHeader.module.css";

export function RoleHeader({ role }: { role: Role }) {
  return (
    <div className={styles.header}>
      <span className={styles.eyebrow}>
        {role.company} · {role.team}
      </span>
      <h1 className={styles.title}>{role.title}</h1>
      <p className={styles.summary}>{role.summary}</p>
    </div>
  );
}
