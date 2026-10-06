import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { act } from "react";
import { DeferredStorage, InMemoryStorage } from "../../test/fakes";
import { fields, fillValid, renderPage } from "./testUtils";

describe("Sending an application (US1)", () => {
  it("shows the submitting state, then the confirmation with focus on its heading", async () => {
    const storage = new DeferredStorage();
    const { user, container } = renderPage({ storage });
    await fillValid(user);

    await user.click(fields.send());

    const sending = await screen.findByRole("button", { name: "Sending…" });
    expect(sending).toHaveAttribute("aria-busy", "true");
    expect(sending).toHaveAttribute("aria-disabled", "true");

    await act(async () => storage.release());
    const heading = await screen.findByRole("heading", { name: "Application sent" });
    expect(heading).toHaveFocus();
    expect(
      screen.getByText(
        "Thanks Ravi. Dana and the Platform team review applications every Thursday, and you’ll hear from us either way by 4 December. We’ll reply to ravi@example.com.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse other roles" })).toHaveAttribute("href", "/roles");
    expect(screen.queryByRole("heading", { name: "Apply for this role" })).not.toBeInTheDocument();

    expect(storage.applications).toHaveLength(1);
    expect(storage.applications[0]).toMatchObject({
      roleId: "northgate-senior-dotnet",
      fullName: "Ravi Shah",
      email: "ravi@example.com",
      coverNote: "",
      cv: { name: "Ravi Shah CV.pdf", sizeBytes: 860_160, type: "pdf" },
    });
    expect(await axe(container)).toHaveNoViolations();
  });

  it("saves exactly one application when send is activated repeatedly (SC-007)", async () => {
    const storage = new DeferredStorage();
    const { user } = renderPage({ storage });
    await fillValid(user);

    const send = fields.send();
    for (let i = 0; i < 5; i += 1) await user.click(send);
    await user.keyboard("{Enter}");

    await act(async () => storage.release());
    await screen.findByRole("heading", { name: "Application sent" });
    expect(storage.applications).toHaveLength(1);
  });

  it("keeps focus on the send button while submitting", async () => {
    const storage = new DeferredStorage();
    const { user } = renderPage({ storage });
    await fillValid(user);
    fields.send().focus();

    await user.keyboard("{Enter}");

    expect(await screen.findByRole("button", { name: "Sending…" })).toHaveFocus();
    await act(async () => storage.release());
    await screen.findByRole("heading", { name: "Application sent" });
  });

  it("'Start again' shows an empty default form and keeps the stored application", async () => {
    const storage = new InMemoryStorage();
    const { user } = renderPage({ storage });
    await fillValid(user);
    await user.click(fields.send());
    await screen.findByRole("heading", { name: "Application sent" });

    await user.click(screen.getByRole("button", { name: "Start again" }));

    expect(fields.name()).toHaveValue("");
    expect(fields.email()).toHaveValue("");
    expect(fields.note()).toHaveValue("");
    expect(screen.getByRole("button", { name: /choose a file/i })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(fields.name()).toHaveAccessibleDescription("As it appears on your CV.");
    await waitFor(() => expect(storage.applications).toHaveLength(1));
  });
});
