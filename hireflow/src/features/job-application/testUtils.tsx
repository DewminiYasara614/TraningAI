import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { role } from "../../content/role";
import type { CreateServicesOptions } from "../../services/ServicesContext";
import { makeFile, renderWithServices } from "../../test/fakes";
import { JobApplicationPage } from "./JobApplicationPage";

export function renderPage(services?: CreateServicesOptions) {
  const user = userEvent.setup();
  return { user, ...renderWithServices(<JobApplicationPage role={role} />, { services }) };
}

export const fields = {
  name: () => screen.getByLabelText("Full name"),
  email: () => screen.getByLabelText("Email"),
  note: () => screen.getByRole("textbox", { name: "Cover note (optional)" }),
  cvInput: () => screen.getByTestId("ap-cv-input") as HTMLInputElement,
  send: () => screen.getByRole("button", { name: /send application|sending…/i }),
};

export async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(fields.name(), "Ravi Shah");
  await user.type(fields.email(), "ravi@example.com");
  await user.upload(fields.cvInput(), makeFile("Ravi Shah CV.pdf", 860_160));
}
