export interface Role {
  id: string;
  company: string;
  team: string;
  title: string;
  summary: string;
  salary: string;
  location: string;
  contract: string;
  teamSize: string;
  /** ISO date, e.g. "2026-11-27". */
  closesOn: string;
  /** ISO date, e.g. "2026-12-04". */
  replyBy: string;
  reviewDay: string;
  hiringManager: { name: string; role: string; initials: string };
  description: { intro: string[]; sections: { heading: string; body: string }[] };
}

export type CvFileType = "pdf" | "doc" | "docx";

/** CV metadata only — the file contents are never kept (spec FR-013). */
export interface CvFile {
  name: string;
  sizeBytes: number;
  type: CvFileType;
}

export interface ApplicationDraft {
  fullName: string;
  email: string;
  coverNote: string;
  cv: CvFile | null;
}

export interface Application {
  id: string;
  roleId: string;
  fullName: string;
  email: string;
  coverNote: string;
  cv: CvFile;
  /** ISO 8601 timestamp. */
  submittedAt: string;
}

export type FieldName = "fullName" | "email" | "cv";

export type FieldErrors = Partial<Record<FieldName, string>>;

export type FormStatus = "idle" | "submitting" | "success";
