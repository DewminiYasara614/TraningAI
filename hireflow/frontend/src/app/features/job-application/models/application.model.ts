import { CvFile } from './cv-file.model';

export interface Application {
  id: string;
  roleId: string;
  jobTitle: string;
  fullName: string;
  email: string;
  coverNote: string;
  cv: CvFile;
  /** ISO 8601 timestamp. */
  submittedAt: string;
}

export interface ApplicationDraft {
  fullName: string;
  email: string;
  coverNote: string;
  cv: CvFile | null;
}

export type FieldName = 'fullName' | 'email' | 'cv';

export type FieldErrors = Partial<Record<FieldName, string>>;
