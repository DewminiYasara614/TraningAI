import { Card } from "../../components/Card/Card";
import { formatLongDate } from "../../domain/format";
import type { Role } from "../../domain/types";
import styles from "./RoleFacts.module.css";

export function RoleFacts({ role, className }: { role: Role; className?: string }) {
  const facts: [string, string][] = [
    ["Salary", role.salary],
    ["Location", role.location],
    ["Contract", role.contract],
    ["Team", role.teamSize],
  ];

  return (
    <Card as="aside" aria-label="Role details" className={`${styles.facts} ${className ?? ""}`}>
      <dl className={styles.list}>
        {facts.map(([label, value]) => (
          <div key={label} className={styles.fact}>
            <dt className={styles.label}>{label}</dt>
            <dd className={styles.value}>{value}</dd>
          </div>
        ))}
      </dl>
      <hr className={styles.divider} />
      <dl className={styles.list}>
        <div className={styles.fact}>
          <dt className={styles.label}>Applications close</dt>
          <dd className={styles.value}>{formatLongDate(role.closesOn)}</dd>
        </div>
      </dl>
      <div className={styles.manager}>
        <span className={styles.avatar} aria-hidden="true">
          {role.hiringManager.initials}
        </span>
        <div className={styles.managerText}>
          <span className={styles.managerName}>{role.hiringManager.name}</span>
          <span className={styles.managerRole}>{role.hiringManager.role}</span>
        </div>
      </div>
    </Card>
  );
}
