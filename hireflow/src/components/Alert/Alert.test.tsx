import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { Alert } from "./Alert";

describe("Alert", () => {
  it("is an alert that can receive focus through its ref", async () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Alert ref={ref} title="A few things need fixing before you can send this.">
        Check the highlighted fields below.
      </Alert>,
    );

    ref.current?.focus();

    const alert = screen.getByRole("alert");
    expect(alert).toHaveFocus();
    expect(alert).toHaveTextContent("A few things need fixing before you can send this.");
    expect(alert).toHaveTextContent("Check the highlighted fields below.");
    expect(await axe(container)).toHaveNoViolations();
  });
});
