import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InMemoryStorage } from "../../test/fakes";
import { fields, fillValid, renderPage } from "./testUtils";

describe("Cover note (US4)", () => {
  it("shows the allowance, then a live count", async () => {
    const { user } = renderPage();
    expect(fields.note()).toHaveAccessibleDescription("Up to 500 characters.");

    await user.type(fields.note(), "Hello Dana.");

    expect(fields.note()).toHaveAccessibleDescription("11 / 500 characters");
  });

  it("keeps only the first 500 characters of a longer paste", () => {
    renderPage();
    const long = "a".repeat(600);

    fireEvent.change(fields.note(), { target: { value: long } });

    expect(fields.note()).toHaveValue("a".repeat(500));
    expect(fields.note()).toHaveAccessibleDescription("500 / 500 characters");
  });

  it("stores the note with the application, and an empty note is valid", async () => {
    const storage = new InMemoryStorage();
    const { user } = renderPage({ storage });
    await fillValid(user);
    await user.type(fields.note(), "I led a similar decomposition.");

    await user.click(fields.send());
    await screen.findByRole("heading", { name: "Application sent" });

    expect(storage.applications[0].coverNote).toBe("I led a similar decomposition.");
  });
});
