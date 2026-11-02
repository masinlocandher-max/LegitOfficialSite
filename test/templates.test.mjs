import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  TEMPLATES,
  createDraft,
  changeTemplate,
  PALETTES,
} from "../studio/lib/templates.mjs";
import {
  validateDraft,
  parseDraft,
  serializeDraft,
  safeImage,
  safeExternalUrl,
  moveSection,
  buttonInk,
  MAX_DRAFT_BYTES,
} from "../studio/lib/model.mjs";
import { renderSite } from "../studio/lib/render.mjs";
import { readSaved, saveDraft } from "../studio/lib/storage.mjs";
import { suggestionsFor } from "../studio/lib/addons.mjs";
import { createStudioServer } from "../scripts/dev.mjs";

const css = await readFile(
  new URL("../studio/site.css", import.meta.url),
  "utf8",
);
test("all 16 designs are valid, portable, and contain complete visitor documents", () => {
  assert.equal(TEMPLATES.length, 16);
  assert.equal(new Set(TEMPLATES.map((t) => t.id)).size, 16);
  for (const t of TEMPLATES) {
    const draft = validateDraft(createDraft(t.id)),
      rendered = renderSite(draft, { css });
    assert.deepEqual(parseDraft(serializeDraft(draft)), draft);
    assert.ok(rendered.startsWith("<!doctype html>"));
    assert.ok(rendered.includes(`template-${t.id}`));
    assert.ok(rendered.includes('id="contact"'));
    assert.ok(!rendered.includes("<script"));
    assert.ok(!rendered.includes("<form"));
    assert.ok(!rendered.includes("legitofficialsite.com"));
    assert.ok(rendered.includes("noindex,nofollow"));
    assert.ok(
      css.includes(`.template-${t.id}`),
      `${t.id} needs its own composition`,
    );
  }
});
test("changing design retains all client content, images, links and section choices", () => {
  const draft = createDraft();
  draft.brand = "FMB Test";
  draft.email = "test@example.test";
  draft.heroImage = "data:image/png;base64,aGVsbG8=";
  draft.sections.reverse();
  draft.sections[0].visible = false;
  for (const t of TEMPLATES) {
    const changed = changeTemplate(draft, t.id);
    for (const key of Object.keys(draft).filter(
      (k) => !["templateId", "palette", "font"].includes(k),
    ))
      assert.deepEqual(changed[key], draft[key]);
    changed.offerings[0].title = "Changed copy";
    assert.notEqual(draft.offerings[0].title, "Changed copy");
  }
});
test("HTML is escaped in every exported customer content position", () => {
  const d = createDraft();
  const attack =
    "</style><script>alert(1)</script><img src=x onerror=alert(2)>";
  for (const key of [
    "brand",
    "headline",
    "intro",
    "about",
    "contactText",
    "description",
  ])
    d[key] = attack;
  d.offerings[0].title = "<script>alert(1)</script>";
  d.offerings[0].body = attack;
  d.heroAlt = attack;
  const html = renderSite(d, { css });
  assert.equal((html.match(/<script/g) || []).length, 0);
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(!html.includes("<img src=x"));
});
test("only bounded raster data and approved local sample image identifiers are accepted", () => {
  for (const value of [
    "javascript:alert(1)",
    "https://tracker.example/photo.jpg",
    "data:image/svg+xml;base64,PHN2Zz4=",
    "../../secret",
    { image: "ceramic" },
    'data:image/png;base64,abc"onerror="x',
  ])
    assert.throws(() => safeImage(value));
  assert.equal(safeImage("ceramic"), "ceramic");
  assert.equal(safeImage(""), "");
  assert.equal(
    safeImage("data:image/png;base64,aGVsbG8="),
    "data:image/png;base64,aGVsbG8=",
  );
});
test("tool and contact links reject executable URLs and credentials", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,bad",
    "http://plain.test",
    "//unsafe.test",
    "https://user:password@example.test",
  ])
    assert.throws(() => safeExternalUrl(value));
  assert.equal(
    safeExternalUrl("https://example.test/book"),
    "https://example.test/book",
  );
  const draft = createDraft("calm");
  draft.toolUrl = "javascript:alert(1)";
  assert.throws(() => renderSite(draft));
  draft.toolUrl = "https://example.test/book";
  const html = renderSite(draft);
  assert.ok(
    html.includes(
      'href="https://example.test/book" target="_blank" rel="noopener noreferrer"',
    ),
  );
});
test("malformed, future, oversized, and structurally unsafe imports are rejected", () => {
  for (const raw of [
    "",
    "no JSON",
    "null",
    "[]",
    "{}",
    "x".repeat(MAX_DRAFT_BYTES + 1),
  ])
    assert.throws(() => parseDraft(raw));
  for (const mutation of [
    (d) => (d.schemaVersion = 99),
    (d) => (d.templateId = "unknown"),
    (d) => (d.headline = "x".repeat(181)),
    (d) => (d.palette = "url(javascript:alert(1))"),
    (d) => (d.accent = "#123;}"),
    (d) => (d.sections[1].type = d.sections[0].type),
    (d) => (d.offerings[1].id = d.offerings[0].id),
    (d) => (d.email = "a\nb@example.test"),
  ]) {
    const d = createDraft();
    mutation(d);
    assert.throws(() => validateDraft(d));
  }
});
test("visible navigation and primary button always point at rendered sections", () => {
  const draft = createDraft("atelier");
  draft.sections.find((s) => s.type === "contact").visible = false;
  let html = renderSite(draft);
  assert.ok(!html.includes('href="#contact"'));
  assert.ok(html.includes('href="#offerings"'));
  draft.offerings = [];
  draft.sections.find((s) => s.type === "gallery").visible = true;
  draft.gallery = [];
  html = renderSite(draft);
  assert.ok(!html.includes('id="gallery"'));
  assert.ok(!html.includes('href="#offerings"'));
  assert.ok(html.includes('href="#about"'));
  draft.sections.forEach((s) => (s.visible = false));
  html = renderSite(draft);
  assert.ok(!html.includes('class="site-button"'));
});
test("section movement preserves data and stops at boundaries", () => {
  const draft = createDraft();
  assert.deepEqual(moveSection(draft, "offerings", -1), draft);
  const moved = moveSection(draft, "about", -1);
  assert.equal(moved.sections[0].type, "about");
  assert.equal(draft.sections[0].type, "offerings");
  const html = renderSite(moved);
  assert.ok(html.indexOf('id="about"') < html.indexOf('id="offerings"'));
});
test("all palette buttons and custom color extremes use readable ink", () => {
  assert.equal(buttonInk("#000000"), "#ffffff");
  assert.equal(buttonInk("#ffffff"), "#000000");
  for (const p of Object.values(PALETTES))
    assert.ok(["#000000", "#ffffff"].includes(buttonInk(p.accent)));
});
test("saved drafts round trip and storage failure never reports success", () => {
  const values = new Map();
  const storage = {
    getItem: (k) => values.get(k),
    setItem: (k, v) => values.set(k, v),
  };
  const draft = validateDraft(createDraft("table"));
  saveDraft(storage, draft);
  assert.deepEqual(readSaved(storage).draft, draft);
  assert.throws(
    () =>
      saveDraft(
        {
          setItem() {
            throw new DOMException("full", "QuotaExceededError");
          },
        },
        draft,
      ),
    /Download a draft backup/,
  );
  assert.match(
    readSaved({
      getItem() {
        return "{broken";
      },
    }).error,
    /not been overwritten/,
  );
});
test("booking and ordering suggestions do not claim purchase or entitlement", () => {
  assert.equal(
    suggestionsFor(TEMPLATES.find((t) => t.id === "calm"))[0].id,
    "booking",
  );
  const order = suggestionsFor(TEMPLATES.find((t) => t.id === "table"))[0];
  assert.equal(order.id, "ordering");
  assert.match(order.limit, /do not process orders or payments/);
});
test("preview export can embed assets and fonts without a hosted dependency", () => {
  const html = renderSite(createDraft(), {
    css,
    embeddedAssets: { ceramic: "data:image/webp;base64,YWJj" },
    fontData: "data:font/woff2;base64,YWJj",
  });
  assert.ok(html.includes("data:image/webp;base64,YWJj"));
  assert.ok(html.includes("data:font/woff2;base64,YWJj"));
  assert.ok(!html.includes('src="assets/'));
});
test("development server serves only studio files and rejects submissions and traversal", async () => {
  const server = createStudioServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    const response = await fetch(base);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /Choose and personalize/);
    assert.match(
      response.headers.get("content-security-policy"),
      /script-src 'self'/,
    );
    for (const path of [
      "/package.json",
      "/redirect.mjs",
      "/%2e%2e%2fpackage.json",
      "/.git/config",
      "/assets/unknown.webp",
    ])
      assert.equal((await fetch(base + path)).status, 404);
    assert.equal(
      (await fetch(base, { method: "POST", body: "private" })).status,
      405,
    );
    assert.equal(await (await fetch(base, { method: "HEAD" })).text(), "");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
