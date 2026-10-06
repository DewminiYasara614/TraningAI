const MIB = 1024 * 1024;

/** "2.3 MB" above 1 MiB, otherwise whole KB with a 1 KB floor ("840 KB", "1 KB"). */
export function formatFileSize(bytes: number): string {
  if (bytes > MIB) return `${(bytes / MIB).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function parseIsoDate(iso: string): { day: number; month: string; year: number } {
  const [year, month, day] = iso.split("-").map(Number);
  return { day, month: MONTHS[month - 1], year };
}

/** "2026-11-27" → "27 November 2026". Parsed by hand so the result never shifts with time zone. */
export function formatLongDate(iso: string): string {
  const { day, month, year } = parseIsoDate(iso);
  return `${day} ${month} ${year}`;
}

/** "2026-12-04" → "4 December". */
export function formatDayMonth(iso: string): string {
  const { day, month } = parseIsoDate(iso);
  return `${day} ${month}`;
}

/** First whitespace-separated word of the name, or "there" when none. */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || "there";
}
