import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { Button, LinkButton } from "./Button";

describe("Button", () => {
  it("renders an accessible button and handles clicks", async () => {
    const onClick = vi.fn();
    const { container } = render(<Button onClick={onClick}>Send application</Button>);

    await userEvent.click(screen.getByRole("button", { name: "Send application" }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("ignores activation and shows the busy label while busy, but stays focusable", async () => {
    const onClick = vi.fn();
    render(
      <Button busy busyLabel="Sending…" onClick={onClick}>
        Send application
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Sending…" });

    await userEvent.click(button);
    button.focus();

    expect(onClick).not.toHaveBeenCalled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveFocus();
  });

  it("renders a link styled as a button", () => {
    render(<LinkButton href="/roles">Browse other roles</LinkButton>);
    expect(screen.getByRole("link", { name: "Browse other roles" })).toHaveAttribute("href", "/roles");
  });
});
