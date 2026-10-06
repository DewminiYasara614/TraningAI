import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { TextField } from "./TextField";

function Controlled({ error }: { error?: string }) {
  const [value, setValue] = useState("");
  return (
    <TextField
      id="ap-name"
      label="Full name"
      hint="As it appears on your CV."
      error={error}
      value={value}
      onChange={setValue}
    />
  );
}

describe("TextField", () => {
  it("associates the label and hint with the input", async () => {
    const { container } = render(<Controlled />);
    const input = screen.getByLabelText("Full name");

    await userEvent.type(input, "Ravi");

    expect(input).toHaveValue("Ravi");
    expect(input).toHaveAccessibleDescription("As it appears on your CV.");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("replaces the hint with the error and marks the input invalid", async () => {
    const { container } = render(<Controlled error="Enter your name." />);
    const input = screen.getByLabelText("Full name");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Enter your name.");
    expect(screen.queryByText("As it appears on your CV.")).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders a multiline variant with an optional marker", () => {
    render(
      <TextField id="ap-note" label="Cover note" optionalLabel="(optional)" hint="Up to 500 characters." multiline value="" onChange={() => {}} />,
    );
    const textarea = screen.getByRole("textbox", { name: "Cover note (optional)" });
    expect(textarea.tagName).toBe("TEXTAREA");
  });
});
