import { describe, expect, it } from "vitest";
import type { ApplicationDraft } from "./types";
import { MAX_CV_BYTES, messages, toCvFile, validateApplication, validateCvFile } from "./validation";

const cv = { name: "Ravi Shah CV.pdf", sizeBytes: 860_160, type: "pdf" as const };
const valid: ApplicationDraft = { fullName: "Ravi Shah", email: "ravi@example.com", coverNote: "", cv };

describe("validateApplication", () => {
  it("accepts a complete draft", () => {
    expect(validateApplication(valid)).toEqual({});
  });

  it("reports every missing required field", () => {
    expect(validateApplication({ fullName: "", email: "", coverNote: "", cv: null })).toEqual({
      fullName: messages.nameRequired,
      email: messages.emailRequired,
      cv: messages.cvRequired,
    });
  });

  it("treats whitespace-only name and email as missing", () => {
    const errors = validateApplication({ ...valid, fullName: "   ", email: "  " });
    expect(errors.fullName).toBe("Enter your name.");
    expect(errors.email).toBe("Enter your email address.");
  });

  it("asks for a domain when the email has none", () => {
    expect(validateApplication({ ...valid, email: "ravi@example" }).email).toBe(
      "Add a domain, like name@company.com.",
    );
    expect(validateApplication({ ...valid, email: "ravi" }).email).toBe(messages.emailInvalid);
    expect(validateApplication({ ...valid, email: "ra vi@example.com" }).email).toBe(messages.emailInvalid);
  });

  it("trims the email before checking it", () => {
    expect(validateApplication({ ...valid, email: "  ravi@example.com  " })).toEqual({});
  });

  it("does not require a cover note", () => {
    expect(validateApplication({ ...valid, coverNote: "" }).fullName).toBeUndefined();
  });
});

describe("validateCvFile", () => {
  it.each(["cv.pdf", "CV.PDF", "cv.doc", "cv.docx", "my.cv.Docx"])("accepts %s", (name) => {
    expect(validateCvFile({ name, size: 1000 })).toBeNull();
  });

  it("rejects other file types", () => {
    expect(validateCvFile({ name: "photo.png", size: 1000 })).toBe(
      "That file type isn't supported. Use PDF, DOC or DOCX.",
    );
    expect(validateCvFile({ name: "pdf", size: 1000 })).toBe(messages.cvType);
  });

  it("accepts exactly 10MB and rejects one byte more", () => {
    expect(validateCvFile({ name: "cv.pdf", size: MAX_CV_BYTES })).toBeNull();
    expect(validateCvFile({ name: "cv.pdf", size: MAX_CV_BYTES + 1 })).toBe(
      "That file is over 10MB. Try a smaller version.",
    );
  });

  it("rejects empty files", () => {
    expect(validateCvFile({ name: "cv.pdf", size: 0 })).toBe("That file looks empty. Try another file.");
  });
});

describe("toCvFile", () => {
  it("keeps name, size and lower-cased type only", () => {
    expect(toCvFile({ name: "Ravi.DOCX", size: 2048 })).toEqual({
      name: "Ravi.DOCX",
      sizeBytes: 2048,
      type: "docx",
    });
  });
});
