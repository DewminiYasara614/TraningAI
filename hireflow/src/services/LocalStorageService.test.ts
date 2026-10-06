import { describe, expect, it } from "vitest";
import type { Application } from "../domain/types";
import { APPLICATIONS_KEY, LocalStorageService } from "./LocalStorageService";
import { StorageError } from "./StorageService";

const application: Application = {
  id: "a1",
  roleId: "northgate-senior-dotnet",
  fullName: "Ravi Shah",
  email: "ravi@example.com",
  coverNote: "",
  cv: { name: "cv.pdf", sizeBytes: 1000, type: "pdf" },
  submittedAt: "2026-10-01T14:32:05.000Z",
};

function throwingStorage(error: unknown): () => Storage {
  return () =>
    ({
      getItem: () => null,
      setItem: () => {
        throw error;
      },
    }) as unknown as Storage;
}

describe("LocalStorageService", () => {
  it("round-trips applications, oldest first", async () => {
    const service = new LocalStorageService();
    await service.saveApplication(application);
    await service.saveApplication({ ...application, id: "a2" });

    const saved = await service.loadApplications();
    expect(saved.map((a) => a.id)).toEqual(["a1", "a2"]);
    expect(JSON.parse(localStorage.getItem(APPLICATIONS_KEY)!)).toHaveLength(2);
  });

  it("returns [] when nothing is stored", async () => {
    expect(await new LocalStorageService().loadApplications()).toEqual([]);
  });

  it("returns [] for malformed JSON or a non-array value", async () => {
    localStorage.setItem(APPLICATIONS_KEY, "{not json");
    expect(await new LocalStorageService().loadApplications()).toEqual([]);
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify({ id: "x" }));
    expect(await new LocalStorageService().loadApplications()).toEqual([]);
  });

  it("overwrites a malformed value when saving", async () => {
    localStorage.setItem(APPLICATIONS_KEY, "{not json");
    await new LocalStorageService().saveApplication(application);
    expect(await new LocalStorageService().loadApplications()).toEqual([application]);
  });

  it("maps a quota error to StorageError('quota')", async () => {
    const service = new LocalStorageService(throwingStorage(new DOMException("full", "QuotaExceededError")));
    await expect(service.saveApplication(application)).rejects.toMatchObject({
      name: "StorageError",
      kind: "quota",
    });
  });

  it("maps a security error or missing storage to StorageError('unavailable')", async () => {
    const blocked = new LocalStorageService(throwingStorage(new DOMException("no", "SecurityError")));
    await expect(blocked.saveApplication(application)).rejects.toMatchObject({ kind: "unavailable" });

    const missing = new LocalStorageService(() => {
      throw new StorageError("unavailable");
    });
    await expect(missing.saveApplication(application)).rejects.toMatchObject({ kind: "unavailable" });
    expect(await missing.loadApplications()).toEqual([]);
  });

  it("maps anything else to StorageError('unknown')", async () => {
    const service = new LocalStorageService(throwingStorage(new Error("boom")));
    const error = await service.saveApplication(application).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(StorageError);
    expect((error as StorageError).kind).toBe("unknown");
  });
});
