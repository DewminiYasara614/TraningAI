import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { FailingStorage } from "../../test/fakes";
import { fields, fillValid, renderPage } from "./testUtils";

const FAILURE = "We couldn't send your application. Your details are still here — please try again.";

describe("When the application cannot be saved (FR-019)", () => {
  it("returns to the form with everything kept and focuses the failure alert", async () => {
    const { user, container } = renderPage({ storage: new FailingStorage() });
    await fillValid(user);
    await user.type(fields.note(), "Hello Dana.");

    await user.click(fields.send());

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(FAILURE);
    expect(alert).toHaveFocus();
    expect(fields.name()).toHaveValue("Ravi Shah");
    expect(fields.email()).toHaveValue("ravi@example.com");
    expect(fields.note()).toHaveValue("Hello Dana.");
    expect(screen.getByText("Ravi Shah CV.pdf")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send application" })).not.toHaveAttribute("aria-busy");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("clears the failure alert on the next send attempt", async () => {
    const { user } = renderPage({ storage: new FailingStorage() });
    await fillValid(user);
    await user.click(fields.send());
    await screen.findByText(FAILURE);

    await user.clear(fields.name());
    await user.click(fields.send());

    expect(screen.queryByText(FAILURE)).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("One thing needs fixing before you can send this.");
  });
});
