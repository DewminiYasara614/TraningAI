import { createEvent, fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { makeFile } from "../../test/fakes";
import { fields, renderPage } from "./testUtils";

function drop(file: File) {
  const target = screen.getByRole("button", { name: /choose a file/i }).parentElement!;
  fireEvent(target, createEvent.drop(target, { dataTransfer: { files: [file], types: ["Files"] } }));
}

describe("CV in the form (US3)", () => {
  it("shows a rejection in the CV message and clears it on the next valid file", async () => {
    const { user } = renderPage();
    const choose = () => screen.getByRole("button", { name: /choose a file/i });

    drop(makeFile("photo.png", 2048, "image/png"));
    expect(choose()).toHaveAccessibleDescription("That file type isn't supported. Use PDF, DOC or DOCX.");

    await user.upload(fields.cvInput(), makeFile("cv.pdf", 2048));
    expect(screen.getByRole("button", { name: "Remove cv.pdf" })).toHaveAccessibleDescription(
      "PDF, DOC or DOCX, up to 10MB.",
    );
  });

  it("shows the required message again after Remove once a send was attempted", async () => {
    const { user } = renderPage();
    await user.upload(fields.cvInput(), makeFile("cv.pdf", 2048));
    await user.click(fields.send());

    await user.click(screen.getByRole("button", { name: "Remove cv.pdf" }));

    expect(screen.getByRole("button", { name: /choose a file/i })).toHaveAccessibleDescription(
      "Attach your CV to apply.",
    );
  });

  it("prefers the rejection message over the required message", async () => {
    const { user } = renderPage();
    await user.click(fields.send());

    drop(makeFile("big.pdf", 10 * 1024 * 1024 + 1));

    expect(screen.getByRole("button", { name: /choose a file/i })).toHaveAccessibleDescription(
      "That file is over 10MB. Try a smaller version.",
    );
  });
});
