import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const KEY = "hireflow:applications:v1";
const pdf = (name = "Ravi Shah CV.pdf", bytes = 860_160) => ({
  name,
  mimeType: "application/pdf",
  buffer: Buffer.alloc(bytes, 1),
});

const nameField = (page: Page) => page.getByLabel("Full name");
const emailField = (page: Page) => page.getByLabel("Email");
const sendButton = (page: Page) => page.getByRole("button", { name: "Send application" });
const chooseFile = (page: Page) => page.getByRole("button", { name: /choose a file/i });

async function fillValid(page: Page) {
  await nameField(page).fill("Ravi Shah");
  await emailField(page).fill("ravi@example.com");
  await page.locator('input[type="file"]').setInputFiles(pdf());
}

/** Describes how the focused element shows focus, so tests can assert it is visible. */
function focusStyle(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return null;
    const style = getComputedStyle(el);
    return {
      tag: el.tagName,
      text: (el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 40),
      boxShadow: style.boxShadow,
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
    };
  });
}

async function expectVisibleFocus(page: Page) {
  const style = await focusStyle(page);
  expect(style, "something should have focus").not.toBeNull();
  expect(style!.boxShadow, `focus ring on ${style!.tag} "${style!.text}"`).not.toBe("none");
}

async function expectNoAxeViolations(page: Page, state: string) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`), state).toEqual(
    [],
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate((key) => localStorage.removeItem(key), KEY);
});

test("happy path: send, confirm, reload keeps the record but shows an empty form", async ({ page }) => {
  await fillValid(page);
  await sendButton(page).click();

  await expect(page.getByRole("button", { name: "Sending…" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Application sent" })).toBeFocused();
  await expect(page.getByText("Thanks Ravi.", { exact: false })).toContainText(
    "you’ll hear from us either way by 4 December. We’ll reply to ravi@example.com.",
  );

  await page.reload();

  await expect(page.getByRole("heading", { name: "Apply for this role" })).toBeVisible();
  await expect(nameField(page)).toHaveValue("");
  const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "[]"), KEY);
  expect(stored).toHaveLength(1);
  expect(stored[0]).toMatchObject({
    fullName: "Ravi Shah",
    email: "ravi@example.com",
    cv: { name: "Ravi Shah CV.pdf", sizeBytes: 860_160, type: "pdf" },
  });
  expect(Object.keys(stored[0].cv).sort()).toEqual(["name", "sizeBytes", "type"]);
});

test("keyboard only: every control is reachable with visible focus, and the flow completes", async ({ page }) => {
  await page.locator("body").focus();

  const reached: string[] = [];
  for (let i = 0; i < 12; i += 1) {
    await page.keyboard.press("Tab");
    const style = await focusStyle(page);
    if (!style) break;
    reached.push(style.text || style.tag);
    await expectVisibleFocus(page);
  }
  for (const control of ["All open roles", "INPUT", "Choose a file", "TEXTAREA", "Send application", "Privacy", "Accessibility"]) {
    expect(reached.some((r) => r.includes(control)), `${control} reached by Tab (got ${reached.join(" | ")})`).toBe(true);
  }

  // Send the empty form from the keyboard: focus lands on the summary.
  await sendButton(page).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("alert")).toBeFocused();

  // Fix every field by keyboard.
  await nameField(page).focus();
  await page.keyboard.type("Ravi Shah");
  await page.keyboard.press("Tab");
  await page.keyboard.type("ravi@example.com");
  await page.keyboard.press("Tab");
  await expect(chooseFile(page)).toBeFocused();
  const [chooser] = await Promise.all([page.waitForEvent("filechooser"), page.keyboard.press("Space")]);
  await chooser.setFiles(pdf());
  await expect(page.getByRole("button", { name: /^Remove/ })).toBeFocused();

  await sendButton(page).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Application sent" })).toBeFocused();
});

test("360px: no horizontal scroll in any state, facts before description", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-360", "mobile only");
  const noHorizontalScroll = async (state: string) =>
    expect(await page.evaluate(() => document.documentElement.scrollWidth), state).toBeLessThanOrEqual(360);

  await noHorizontalScroll("default");
  const factsTop = (await page.getByRole("complementary", { name: "Role details" }).boundingBox())!.y;
  const descriptionTop = (await page.getByRole("region", { name: "About the role" }).boundingBox())!.y;
  expect(factsTop).toBeLessThan(descriptionTop);

  await sendButton(page).click();
  await noHorizontalScroll("error");

  await page.locator('input[type="file"]').setInputFiles(pdf("A very long CV file name for a senior engineer, final version 3.pdf"));
  await noHorizontalScroll("long file name");

  await nameField(page).fill("Ravi Shah");
  await emailField(page).fill("ravi@example.com");
  await sendButton(page).click();
  await expect(page.getByRole("heading", { name: "Application sent" })).toBeVisible();
  await noHorizontalScroll("success");
});

test("desktop: facts sit in the right column and stay visible while scrolling", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop only");
  const facts = page.getByRole("complementary", { name: "Role details" });
  const description = page.getByRole("region", { name: "About the role" });

  expect((await facts.boundingBox())!.x).toBeGreaterThan((await description.boundingBox())!.x + 400);

  await sendButton(page).scrollIntoViewIfNeeded();
  await expect(facts).toBeInViewport();
});

test("axe: no WCAG A/AA violations in default, error, failure and success states", async ({ page }) => {
  test.setTimeout(60_000); // four full-page axe scans
  await expectNoAxeViolations(page, "default");

  await sendButton(page).click();
  await expectNoAxeViolations(page, "error");

  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("full", "QuotaExceededError");
    };
  });
  await fillValid(page);
  await sendButton(page).click();
  await expect(page.getByRole("alert")).toContainText("We couldn't send your application.");
  await expectNoAxeViolations(page, "save failure");

  await page.reload();
  await fillValid(page);
  await sendButton(page).click();
  await expect(page.getByRole("heading", { name: "Application sent" })).toBeVisible();
  await expectNoAxeViolations(page, "success");
});

test("focus rings: solid ring on buttons and links, input ring on fields, visible in forced colours", async ({ page }) => {
  const ringFor = async (focus: () => Promise<void>) => {
    await focus();
    return (await focusStyle(page))!;
  };

  await page.locator("body").focus();
  await page.keyboard.press("Tab"); // "All open roles"
  const link = (await focusStyle(page))!;
  const button = await ringFor(() => chooseFile(page).focus());
  const input = await ringFor(() => nameField(page).focus());

  // --focus-ring: 2px white + 4px primary (rgb(29, 78, 216)).
  for (const ring of [link, button]) {
    expect(ring.boxShadow).toContain("rgb(29, 78, 216) 0px 0px 0px 4px");
  }
  // --focus-ring-input: inset primary border + translucent halo.
  expect(input.boxShadow).toContain("inset");
  expect(input.boxShadow).toContain("rgba(29, 78, 216, 0.32)");

  await page.emulateMedia({ forcedColors: "active" });
  for (const focus of [() => chooseFile(page).focus(), () => sendButton(page).focus(), () => nameField(page).focus()]) {
    const ring = await ringFor(focus);
    expect(ring.outlineStyle, `${ring.tag} "${ring.text}" outline in forced colours`).not.toBe("none");
    expect(parseFloat(ring.outlineWidth)).toBeGreaterThanOrEqual(2);
  }
});
