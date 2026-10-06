import { createEvent, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import type { CvFile } from "../../domain/types";
import { makeFile } from "../../test/fakes";
import { FileDrop } from "./FileDrop";

function Harness({ onReject = () => {}, onChange = () => {} }: { onReject?: (m: string) => void; onChange?: (f: CvFile | null) => void }) {
  const [value, setValue] = useState<CvFile | null>(null);
  return (
    <div role="group" aria-labelledby="cv-label">
      <span id="cv-label">CV</span>
      <FileDrop
        id="ap-cv"
        value={value}
        onChange={(file) => {
          setValue(file);
          onChange(file);
        }}
        onReject={onReject}
        hintId="ap-cv-message"
        labelledBy="cv-label"
      />
      <span id="ap-cv-message">PDF, DOC or DOCX, up to 10MB.</span>
    </div>
  );
}

function dragEvent(type: "dragEnter" | "dragOver" | "dragLeave" | "drop", target: Element, files: File[] = []) {
  const dataTransfer = { files, types: ["Files"], dropEffect: "none" };
  const event = createEvent[type](target, { dataTransfer });
  fireEvent(target, event);
}

describe("FileDrop", () => {
  it("opens the hidden file input from the drop area by click, Enter and Space", async () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => {});
    const { container } = render(<Harness />);
    const choose = screen.getByRole("button", { name: "CV Choose a file" });

    await userEvent.click(choose);
    choose.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");

    expect(clickSpy).toHaveBeenCalledTimes(3);
    expect(choose).toHaveAccessibleDescription("PDF, DOC or DOCX, up to 10MB.");
    expect(await axe(container)).toHaveNoViolations();
    clickSpy.mockRestore();
  });

  it("shows a dragging state that clears on leave and on drop", () => {
    render(<Harness />);
    const choose = screen.getByRole("button", { name: /choose a file/i });
    const target = choose.parentElement!;

    dragEvent("dragOver", target);
    expect(choose).toHaveAttribute("data-dragging", "true");
    dragEvent("dragLeave", target);
    expect(choose).not.toHaveAttribute("data-dragging");

    dragEvent("dragOver", target);
    dragEvent("drop", target, [makeFile("cv.pdf", 2048)]);
    expect(screen.queryByRole("button", { name: /choose a file/i })).not.toBeInTheDocument();
  });

  it("uses only the first of several dropped files", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const target = screen.getByRole("button", { name: /choose a file/i }).parentElement!;

    dragEvent("drop", target, [makeFile("first.pdf", 2048), makeFile("second.pdf", 4096)]);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ name: "first.pdf", sizeBytes: 2048, type: "pdf" });
  });

  it("shows the attached file and returns to the drop area on Remove", async () => {
    const onChange = vi.fn();
    const { container } = render(<Harness onChange={onChange} />);
    const longName = "Ravi Shah — Curriculum Vitae, Senior .NET Engineer, October 2026 final.pdf";

    // fireEvent rather than userEvent.upload: jsdom lets user-event focus the display:none input,
    // which a real browser cannot. Real-browser focus is covered by the e2e keyboard test.
    fireEvent.change(screen.getByTestId("ap-cv-input"), { target: { files: [makeFile(longName, 860_160)] } });

    expect(screen.getByText(longName)).toHaveAttribute("title", longName);
    expect(screen.getByText("840 KB")).toBeInTheDocument();
    const remove = screen.getByRole("button", { name: `Remove ${longName}` });
    expect(remove).toHaveFocus();
    expect(await axe(container)).toHaveNoViolations();

    await userEvent.click(remove);

    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(screen.getByRole("button", { name: /choose a file/i })).toHaveFocus();
  });

  it.each([
    ["photo.png", 2048, "That file type isn't supported. Use PDF, DOC or DOCX."],
    ["big.pdf", 10 * 1024 * 1024 + 1, "That file is over 10MB. Try a smaller version."],
    ["empty.pdf", 0, "That file looks empty. Try another file."],
  ])("rejects %s without attaching it", (name, size, message) => {
    const onReject = vi.fn();
    const onChange = vi.fn();
    render(<Harness onReject={onReject} onChange={onChange} />);
    const target = screen.getByRole("button", { name: /choose a file/i }).parentElement!;

    dragEvent("drop", target, [makeFile(name, size)]);

    expect(onReject).toHaveBeenCalledWith(message);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /choose a file/i })).toBeInTheDocument();
  });
});
