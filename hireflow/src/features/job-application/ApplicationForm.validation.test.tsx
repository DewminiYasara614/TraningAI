import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { makeFile } from "../../test/fakes";
import { fields, renderPage } from "./testUtils";

const PLURAL = "A few things need fixing before you can send this.";
const SINGULAR = "One thing needs fixing before you can send this.";

describe("Correcting mistakes before sending (US2)", () => {
  it("shows no errors while typing or leaving fields before the first send (FR-005)", async () => {
    const { user } = renderPage();

    await user.type(fields.email(), "ravi@example");
    await user.tab();
    await user.click(fields.name());
    await user.tab();

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(fields.email()).not.toHaveAttribute("aria-invalid");
    expect(fields.email()).toHaveAccessibleDescription("We'll only use this about your application.");
  });

  it("blocks an empty send with a plural summary, field messages and focus on the summary", async () => {
    const { user, container } = renderPage();

    await user.click(fields.send());

    const summary = screen.getByRole("alert");
    expect(summary).toHaveTextContent(PLURAL);
    expect(summary).toHaveTextContent("Check the highlighted fields below.");
    expect(summary).toHaveFocus();
    expect(fields.name()).toHaveAttribute("aria-invalid", "true");
    expect(fields.name()).toHaveAccessibleDescription("Enter your name.");
    expect(fields.email()).toHaveAttribute("aria-invalid", "true");
    expect(fields.email()).toHaveAccessibleDescription("Enter your email address.");
    expect(screen.getByRole("button", { name: /choose a file/i })).toHaveAccessibleDescription(
      "Attach your CV to apply.",
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("updates messages and summary on the same change that fixes them (SC-003)", async () => {
    const { user } = renderPage();
    await user.click(fields.send());

    await user.type(fields.name(), "R");
    expect(fields.name()).not.toHaveAttribute("aria-invalid");
    expect(fields.name()).toHaveAccessibleDescription("As it appears on your CV.");
    expect(screen.getByRole("alert")).toHaveTextContent(PLURAL);

    await user.type(fields.email(), "ravi@example.com");
    expect(fields.email()).not.toHaveAttribute("aria-invalid");
    expect(screen.getByRole("alert")).toHaveTextContent(SINGULAR);

    await user.upload(fields.cvInput(), makeFile("cv.pdf", 2048));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("asks for a domain when the email has none", async () => {
    const { user } = renderPage();
    await user.type(fields.email(), "ravi@example");
    await user.click(fields.send());

    expect(fields.email()).toHaveAccessibleDescription("Add a domain, like name@company.com.");
  });

  it("rejects a whitespace-only name", async () => {
    const { user } = renderPage();
    await user.type(fields.name(), "   ");
    await user.click(fields.send());

    expect(fields.name()).toHaveAccessibleDescription("Enter your name.");
  });

  it("moves focus back to the summary on every failed send", async () => {
    const { user } = renderPage();
    await user.click(fields.send());
    await user.click(fields.name());

    await user.click(fields.send());

    expect(screen.getByRole("alert")).toHaveFocus();
  });
});
