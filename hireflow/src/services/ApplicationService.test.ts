import { describe, expect, it } from "vitest";
import { FailingStorage, InMemoryStorage } from "../test/fakes";
import { LocalApplicationService } from "./ApplicationService";
import { StorageError } from "./StorageService";

const input = {
  roleId: "northgate-senior-dotnet",
  fullName: "  Ravi Shah ",
  email: " ravi@example.com ",
  coverNote: "Hello Dana.",
  cv: { name: "cv.pdf", sizeBytes: 1000, type: "pdf" as const },
};

describe("LocalApplicationService", () => {
  it("trims, stamps id and time, saves and resolves the record", async () => {
    const storage = new InMemoryStorage();
    const service = new LocalApplicationService({
      storage,
      latencyMs: 0,
      clock: () => new Date("2026-10-06T09:00:00.000Z"),
      idGenerator: () => "id-1",
    });

    const saved = await service.submit(input);

    expect(saved).toEqual({
      id: "id-1",
      roleId: "northgate-senior-dotnet",
      fullName: "Ravi Shah",
      email: "ravi@example.com",
      coverNote: "Hello Dana.",
      cv: { name: "cv.pdf", sizeBytes: 1000, type: "pdf" },
      submittedAt: "2026-10-06T09:00:00.000Z",
    });
    expect(storage.applications).toEqual([saved]);
    expect(await service.list()).toEqual([saved]);
  });

  it("passes a StorageError through", async () => {
    const service = new LocalApplicationService({ storage: new FailingStorage(), latencyMs: 0 });
    await expect(service.submit(input)).rejects.toBeInstanceOf(StorageError);
  });
});
