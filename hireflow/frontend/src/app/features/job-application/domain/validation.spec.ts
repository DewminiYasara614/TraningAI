import { describe, expect, it } from 'vitest';
import { ApplicationDraft } from '../models/application.model';
import {
  MAX_CV_BYTES,
  MESSAGES,
  toCvFile,
  validateApplication,
  validateCvFile,
} from './validation';

const valid: ApplicationDraft = {
  fullName: 'Ravi Shah',
  email: 'ravi@example.com',
  coverNote: '',
  cv: { name: 'Ravi Shah CV.pdf', sizeBytes: 860_160, type: 'pdf' },
};

describe('validateApplication', () => {
  it('accepts a complete draft, with or without a cover note', () => {
    expect(validateApplication(valid)).toEqual({});
  });

  it('reports every missing required field', () => {
    expect(validateApplication({ fullName: '', email: '', coverNote: '', cv: null })).toEqual({
      fullName: 'Enter your name.',
      email: 'Enter your email address.',
      cv: 'Attach your CV to apply.',
    });
  });

  it('treats whitespace-only name and email as missing', () => {
    const errors = validateApplication({ ...valid, fullName: '   ', email: '  ' });
    expect(errors.fullName).toBe(MESSAGES.nameRequired);
    expect(errors.email).toBe(MESSAGES.emailRequired);
  });

  it('asks for a domain when the email has none or is malformed', () => {
    for (const email of ['ravi@example', 'ravi', 'ra vi@example.com', 'a@b@c.com']) {
      expect(validateApplication({ ...valid, email }).email).toBe(
        'Add a domain, like name@company.com.',
      );
    }
  });

  it('trims the email before checking it', () => {
    expect(validateApplication({ ...valid, email: '  ravi@example.com  ' })).toEqual({});
  });
});

describe('validateCvFile', () => {
  it.each(['cv.pdf', 'CV.PDF', 'cv.doc', 'cv.docx', 'my.cv.Docx'])('accepts %s', (name) => {
    expect(validateCvFile({ name, size: 1000 })).toBeNull();
  });

  it('rejects other types, including names without an extension', () => {
    expect(validateCvFile({ name: 'photo.png', size: 1000 })).toBe(
      "That file type isn't supported. Use PDF, DOC or DOCX.",
    );
    expect(validateCvFile({ name: 'pdf', size: 1000 })).toBe(MESSAGES.cvType);
  });

  it('accepts exactly 10MB and rejects one byte more', () => {
    expect(validateCvFile({ name: 'cv.pdf', size: MAX_CV_BYTES })).toBeNull();
    expect(validateCvFile({ name: 'cv.pdf', size: MAX_CV_BYTES + 1 })).toBe(
      'That file is over 10MB. Try a smaller version.',
    );
  });

  it('rejects empty files', () => {
    expect(validateCvFile({ name: 'cv.pdf', size: 0 })).toBe(
      'That file looks empty. Try another file.',
    );
  });
});

describe('toCvFile', () => {
  it('keeps name, size and lower-cased type only', () => {
    expect(toCvFile({ name: 'Ravi.DOCX', size: 2048 })).toEqual({
      name: 'Ravi.DOCX',
      sizeBytes: 2048,
      type: 'docx',
    });
  });
});
