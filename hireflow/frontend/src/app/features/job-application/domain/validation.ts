import { ApplicationDraft, FieldErrors } from '../models/application.model';
import { CvFile, CvFileType } from '../models/cv-file.model';

export const MAX_CV_BYTES = 10 * 1024 * 1024;
export const MAX_COVER_NOTE = 500;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MESSAGES = {
  nameRequired: 'Enter your name.',
  emailRequired: 'Enter your email address.',
  emailInvalid: 'Add a domain, like name@company.com.',
  cvRequired: 'Attach your CV to apply.',
  cvType: "That file type isn't supported. Use PDF, DOC or DOCX.",
  cvTooLarge: 'That file is over 10MB. Try a smaller version.',
  cvEmpty: 'That file looks empty. Try another file.',
} as const;

/** Field rules from the spec's User Story 2 table. Empty object when the draft is valid. */
export function validateApplication(draft: ApplicationDraft): FieldErrors {
  const errors: FieldErrors = {};
  const email = draft.email.trim();

  if (!draft.fullName.trim()) errors.fullName = MESSAGES.nameRequired;
  if (!email) errors.email = MESSAGES.emailRequired;
  else if (!EMAIL_PATTERN.test(email)) errors.email = MESSAGES.emailInvalid;
  if (!draft.cv) errors.cv = MESSAGES.cvRequired;

  return errors;
}

function cvTypeOf(fileName: string): CvFileType | null {
  const dot = fileName.lastIndexOf('.');
  if (dot < 0) return null;
  const extension = fileName.slice(dot + 1).toLowerCase();
  return extension === 'pdf' || extension === 'doc' || extension === 'docx' ? extension : null;
}

/** Checks a chosen or dropped file at selection time (FR-011). A message, or null if acceptable. */
export function validateCvFile(file: { name: string; size: number }): string | null {
  if (!cvTypeOf(file.name)) return MESSAGES.cvType;
  if (file.size < 1) return MESSAGES.cvEmpty;
  if (file.size > MAX_CV_BYTES) return MESSAGES.cvTooLarge;
  return null;
}

/** The details kept for a validated file — never its contents (FR-013). */
export function toCvFile(file: { name: string; size: number }): CvFile {
  const type = cvTypeOf(file.name);
  if (!type) throw new Error(`Unsupported CV file: ${file.name}`);
  return { name: file.name, sizeBytes: file.size, type };
}
