import { describe, expect, it } from "vitest";
import { firstName, formatDayMonth, formatFileSize, formatLongDate } from "./format";

describe("formatFileSize", () => {
  it("floors tiny files to 1 KB", () => {
    expect(formatFileSize(0)).toBe("1 KB");
    expect(formatFileSize(500)).toBe("1 KB");
  });

  it("rounds to whole KB up to 1 MiB", () => {
    expect(formatFileSize(860_160)).toBe("840 KB");
    expect(formatFileSize(1024 * 1024)).toBe("1024 KB");
  });

  it("shows one-decimal MB above 1 MiB", () => {
    expect(formatFileSize(1024 * 1024 + 1)).toBe("1.0 MB");
    expect(formatFileSize(2.3 * 1024 * 1024)).toBe("2.3 MB");
  });
});

describe("dates", () => {
  it("formats the closing date in full", () => {
    expect(formatLongDate("2026-11-27")).toBe("27 November 2026");
  });

  it("formats the reply-by date as day and month", () => {
    expect(formatDayMonth("2026-12-04")).toBe("4 December");
  });
});

describe("firstName", () => {
  it("takes the first word", () => {
    expect(firstName("Ravi Shah")).toBe("Ravi");
    expect(firstName("  Ravi   Shah ")).toBe("Ravi");
  });

  it("keeps single-word names", () => {
    expect(firstName("Madonna")).toBe("Madonna");
  });

  it("falls back to 'there' for blank names", () => {
    expect(firstName("")).toBe("there");
    expect(firstName("   ")).toBe("there");
  });
});
