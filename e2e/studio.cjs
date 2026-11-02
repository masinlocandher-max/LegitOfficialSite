// Optional browser verification. Install Playwright in the development environment.
// CHROMIUM_EXECUTABLE_PATH can select an existing Chromium binary; no product dependency.
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const { chromium } = require("playwright");

(async () => {
  const { createStudioServer } = await import("../scripts/dev.mjs");
  const { TEMPLATES, createDraft } = await import(
    "../studio/lib/templates.mjs"
  );
  const { renderSite } = await import("../studio/lib/render.mjs");
  const { STORAGE_KEY } = await import("../studio/lib/model.mjs");
  const server = createStudioServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const url = `http://127.0.0.1:${server.address().port}`;
  const out =
    process.env.QA_OUTPUT_DIR ||
    (await fs.mkdtemp(path.join(os.tmpdir(), "legit-studio-")));
  await fs.mkdir(out, { recursive: true });
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || undefined,
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-zygote"],
    });
    const context = await browser.newContext({
      viewport: { width: 1536, height: 1024 },
      acceptDownloads: true,
    });
    const page = await context.newPage(),
      errors = [];
    page.setDefaultTimeout(12000);
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    const expectCount = async (locator, expected) =>
      assert.equal(await locator.count(), expected);
    const frame = () => page.frameLocator("#site-preview");
    const waitText = async (text) =>
      frame().getByRole("heading", { name: text, exact: true }).waitFor();
    await page.goto(url);
    await page
      .getByRole("heading", { name: "A website that feels like you." })
      .waitFor();
    assert.match(await page.title(), /Website templates/);
    await expectCount(page.locator(".template-card"), 16);
    await page.getByRole("button", { name: "Booking", exact: true }).click();
    await expectCount(page.locator(".template-card"), 1);
    await page
      .getByRole("button", { name: "Appointments", exact: true })
      .click();
    await expectCount(page.locator(".template-card"), 1);
    await page.getByRole("button", { name: "Ordering", exact: true }).click();
    await expectCount(page.locator(".template-card"), 1);
    await page
      .getByRole("button", { name: "All templates", exact: true })
      .click();
    await page
      .getByRole("searchbox", { name: "Search templates" })
      .fill("no such template");
    await page
      .getByRole("heading", { name: "No templates match yet." })
      .waitFor();
    await page.getByRole("button", { name: "Show all templates" }).click();
    // Wait for the visible thumbnail images before recording visual evidence.
    await Promise.all(
      page
        .frames()
        .slice(1, 7)
        .map((f) =>
          f.evaluate(async () => {
            await document.fonts.ready;
            await Promise.all(
              [...document.images]
                .filter(
                  (i) =>
                    i.loading !== "lazy" ||
                    i.getBoundingClientRect().top < innerHeight,
                )
                .map((i) => i.decode().catch(() => {})),
            );
          }),
        ),
    );
    await page.screenshot({ path: path.join(out, "gallery-desktop.png") });
    await page
      .getByRole("button", { name: "Preview Calm template", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("heading", { name: "Calm", exact: true })
      .waitFor();
    await page.getByRole("button", { name: "Close preview" }).click();
    await page
      .getByRole("button", { name: "Use Atelier template", exact: true })
      .click();
    await waitText("Good work. Clearly seen.");
    await page.screenshot({ path: path.join(out, "editor-desktop.png") });
    await page
      .getByLabel("Website name", { exact: true })
      .fill("FMB Design Test");
    await page
      .getByLabel("Headline", { exact: true })
      .fill("Your story. Your space.");
    await waitText("Your story. Your space.");
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    assert.equal(
      await page.locator("#save-status").textContent(),
      "Saved on this device",
    );
    await page.reload();
    await page.getByRole("button", { name: "Resume draft" }).click();
    assert.equal(
      await page.getByLabel("Website name", { exact: true }).inputValue(),
      "FMB Design Test",
    );
    await waitText("Your story. Your space.");
    await page.getByRole("tab", { name: "Style", exact: true }).click();
    await page.getByLabel("Soft sage", { exact: true }).check();
    await page.getByLabel("Typography", { exact: true }).selectOption("modern");
    await page.waitForFunction(() =>
      document.querySelector("#site-preview").srcdoc.includes("font-modern"),
    );
    await page.getByRole("tab", { name: "Sections", exact: true }).click();
    await page.getByLabel("About", { exact: true }).uncheck();
    await page.waitForFunction(
      () =>
        !document.querySelector("#site-preview").srcdoc.includes('id="about"'),
    );
    await page
      .getByRole("button", { name: "Move Contact up", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Move Contact up", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Move Contact up", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Move Contact up", exact: true })
      .click();
    await page.waitForFunction(() => {
      const s = document.querySelector("#site-preview").srcdoc;
      return s.indexOf('id="contact"') < s.indexOf('id="offerings"');
    });
    await page.getByRole("tab", { name: "Content", exact: true }).click();
    await page.locator("summary").filter({ hasText: "Images & logo" }).click();
    await page
      .locator('[data-image="heroImage"]')
      .setInputFiles(path.join(__dirname, "../studio/assets/ceramic.webp"));
    await page.waitForFunction(() =>
      document
        .querySelector("#site-preview")
        .srcdoc.includes("data:image/webp;base64,"),
    );
    await page
      .getByRole("button", { name: "Choose a template", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Use Calm template", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Keep my content", exact: true })
      .click();
    assert.equal(
      await page.getByLabel("Website name", { exact: true }).inputValue(),
      "FMB Design Test",
    );
    await waitText("Your story. Your space.");
    await page.getByRole("tab", { name: "Tools", exact: true }).click();
    await page
      .getByRole("heading", { name: "Appointment tools", exact: true })
      .waitFor();
    await page
      .getByLabel("Public booking or ordering link", { exact: true })
      .fill("https://example.test/book");
    await page.waitForFunction(() =>
      document
        .querySelector("#site-preview")
        .srcdoc.includes('href="https://example.test/book"'),
    );
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    const backupEvent = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Download draft", exact: true })
      .click();
    const backup = await backupEvent,
      backupPath = path.join(out, "test-draft.json");
    await backup.saveAs(backupPath);
    const downloaded = JSON.parse(await fs.readFile(backupPath, "utf8"));
    assert.equal(downloaded.brand, "FMB Design Test");
    assert.equal(downloaded.templateId, "calm");
    const importEvent = page.waitForEvent("filechooser");
    await page
      .getByRole("button", { name: "Import draft", exact: true })
      .click();
    const chooser = await importEvent;
    await chooser.setFiles(backupPath);
    await page
      .getByRole("button", { name: "Replace draft", exact: true })
      .click();
    await waitText("Your story. Your space.");
    const exportEvent = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Download website preview", exact: true })
      .click();
    const exported = await exportEvent,
      exportPath = path.join(out, "test-website.html");
    await exported.saveAs(exportPath);
    const html = await fs.readFile(exportPath, "utf8");
    assert.ok(html.includes("data:font/woff2;base64,"));
    assert.ok(html.includes("FMB Design Test"));
    assert.ok(!html.includes("<script"));
    const offline = await context.newPage();
    await offline.goto("file://" + exportPath);
    await offline
      .getByRole("heading", { name: "Your story. Your space." })
      .waitFor();
    await offline.close();
    await page
      .getByRole("button", { name: "Visitor preview", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Visitor preview", exact: true })
      .waitFor();
    await page
      .getByRole("button", { name: "Back to editing", exact: true })
      .click();
    await page.getByRole("button", { name: "Mobile", exact: true }).click();
    await page.waitForFunction(
      () =>
        Number.parseFloat(
          getComputedStyle(document.querySelector("#site-preview")).width,
        ) <= 390,
    );
    await page.screenshot({
      path: path.join(out, "editor-mobile-preview.png"),
    });
    // Save before leaving the editing session; no beforeunload override needed.
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    const css = await fs.readFile(
      path.join(__dirname, "../studio/site.css"),
      "utf8",
    );
    const fontData =
      "data:font/woff2;base64," +
      (
        await fs.readFile(
          path.join(__dirname, "../studio/assets/fonts/InterVariable.woff2"),
        )
      ).toString("base64");
    const visitor = await context.newPage();
    for (const width of [1440, 390, 320]) {
      await visitor.setViewportSize({ width, height: 1000 });
      for (const t of TEMPLATES) {
        await visitor.setContent(
          renderSite(createDraft(t.id), {
            css,
            assetBase: url + "/",
            fontData,
          }),
        );
        await visitor.evaluate(() => document.fonts.ready);
        assert.ok(
          await visitor.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          `${t.id} overflows at ${width}px`,
        );
        await visitor.getByRole("heading", { level: 1 }).waitFor();
        assert.equal(await visitor.locator("form,script").count(), 0);
        if (width === 390 && ["calm", "table", "frame", "stay"].includes(t.id))
          await visitor.screenshot({
            path: path.join(out, `${t.id}-mobile.png`),
            fullPage: true,
          });
      }
    }
    await visitor.close();
    await page.setViewportSize({ width: 390, height: 844 });
    await page
      .getByRole("button", { name: "Choose a template", exact: true })
      .click();
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await page.screenshot({ path: path.join(out, "gallery-mobile.png") });
    await page
      .getByRole("button", { name: "Resume draft", exact: true })
      .click();
    await page.getByRole("tab", { name: "Tools", exact: true }).click();
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await waitText("Your story. Your space.");
    await page.screenshot({
      path: path.join(out, "editor-phone.png"),
      fullPage: true,
    });
    await page.getByRole("button", { name: "Desktop", exact: true }).click();
    assert.ok(
      Number.parseFloat(
        await page
          .locator("#site-preview")
          .evaluate((el) => getComputedStyle(el).width),
      ) >= 900,
      "Desktop canvas must remain desktop-sized on phones",
    );
    // Invalid imports cannot execute code; validation errors are visible and preserve the existing preview.
    await page.getByRole("tab", { name: "Content", exact: true }).click();
    await page
      .locator("summary")
      .filter({ hasText: "Contact details" })
      .click();
    await page
      .getByLabel("Another website or social link", { exact: true })
      .fill("javascript:alert(1)");
    await page.locator("#validation-error").waitFor({ state: "visible" });
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    const savedValue = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)).externalUrl,
      STORAGE_KEY,
    );
    assert.equal(savedValue, "");
    assert.equal(errors.length, 0, errors.join("\n"));
    console.log(
      `PASS: 16 templates at 1440/390/320px; gallery filters; edits; local save/reload; style; sections; image upload; template switching; add-on links; JSON round trip; offline HTML; visitor preview; mobile editor; unsafe link rejection. No console errors. Evidence: ${out}`,
    );
  } finally {
    await browser?.close();
    await new Promise((r) => server.close(r));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
