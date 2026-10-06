import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { renderPage } from "./testUtils";

describe("JobApplicationPage", () => {
  it("shows the role header, facts, full description and form", async () => {
    const { container } = renderPage();

    expect(screen.getByText("Northgate Labs · Platform")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Senior .NET Engineer (Remote, UK)" })).toBeInTheDocument();
    expect(screen.getByText("Own the .NET services behind our scheduling and messaging products.")).toBeInTheDocument();

    const facts = within(screen.getByRole("complementary", { name: "Role details" }));
    for (const [label, value] of [
      ["Salary", "£78,000 – £92,000"],
      ["Location", "Remote, UK"],
      ["Contract", "Permanent, full time"],
      ["Team", "Platform, 9 people"],
      ["Applications close", "27 November 2026"],
    ]) {
      expect(facts.getByText(label)).toBeInTheDocument();
      expect(facts.getByText(value)).toBeInTheDocument();
    }
    expect(facts.getByText("Dana Kowalski")).toBeInTheDocument();
    expect(facts.getByText("Hiring manager")).toBeInTheDocument();

    expect(screen.getByText(/Northgate Labs builds scheduling and messaging software/)).toBeInTheDocument();
    expect(screen.getByText(/You would join a team of nine engineers/)).toBeInTheDocument();
    for (const heading of ["What you'll do", "What we're looking for", "How we hire"]) {
      expect(screen.getByRole("heading", { level: 2, name: heading })).toBeInTheDocument();
    }
    expect(screen.getByText(/we give feedback at every stage whether or not you move forward\./)).toBeInTheDocument();

    expect(screen.getByRole("heading", { level: 2, name: "Apply for this role" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
