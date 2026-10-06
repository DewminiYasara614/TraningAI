import styles from "./App.module.css";
import { role } from "./content/role";
import { JobApplicationPage } from "./features/job-application/JobApplicationPage";

export function App() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.brand}>
            <span className={styles.mark} aria-hidden="true" />
            HireFlow
          </span>
          <a href="/roles" className={styles.navLink}>
            All open roles
          </a>
        </div>
      </header>

      <main className={styles.main}>
        <JobApplicationPage role={role} />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.powered}>Powered by HireFlow</span>
          <nav aria-label="Footer" className={styles.footerLinks}>
            <a href="#privacy">Privacy</a>
            <a href="#accessibility">Accessibility</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
