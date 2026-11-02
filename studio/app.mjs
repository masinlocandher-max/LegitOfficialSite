import {
  ASSETS,
  TEMPLATES,
  createDraft,
  changeTemplate,
  templateById,
} from "./lib/templates.mjs";
import {
  validateDraft,
  parseDraft,
  serializeDraft,
  moveSection,
  MAX_DRAFT_BYTES,
} from "./lib/model.mjs";
import { renderSite, escapeHtml as e } from "./lib/render.mjs";
import {
  contentPanel,
  stylePanel,
  sectionsPanel,
  toolsPanel,
  icon,
} from "./lib/editor.mjs";
import { readSaved, saveDraft, download } from "./lib/storage.mjs";
import { readImage, assetData } from "./lib/media.mjs";

const app = document.querySelector("#app");
const base = new URL("./", import.meta.url).href;
const panels = {
  content: contentPanel,
  style: stylePanel,
  sections: sectionsPanel,
  tools: toolsPanel,
};
const categories = {
  all: "All templates",
  booking: "Booking",
  appointments: "Appointments",
  portfolio: "Portfolio",
  ordering: "Ordering",
  individuals: "Personal",
  professionals: "Professional",
  businesses: "Business & shops",
  events: "Events",
  education: "Education",
  organizations: "Community",
  property: "Property",
};
let draft = null,
  validDraft = null,
  dirty = false,
  saved = false,
  css = "",
  previewFont = "",
  tab = "content",
  view = "gallery",
  device = "desktop",
  filter = "all",
  search = "",
  toastTimer,
  updateTimer,
  thumbnailObserver,
  canvasObserver;
let storage;
try {
  storage = window.localStorage;
} catch {
  storage = {
    getItem() {
      return null;
    },
    setItem() {
      throw new DOMException("Storage unavailable", "SecurityError");
    },
  };
}
const loaded = readSaved(storage);
draft = loaded.draft;
validDraft = draft ? structuredClone(draft) : null;
saved = !!draft;

function say(text) {
  document.querySelector("#announcement").textContent = text;
}
function toast(message) {
  const el = document.querySelector("#toast");
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.hidden = true;
  }, 6000);
  say(message);
}
function focusTitle() {
  requestAnimationFrame(() =>
    document.querySelector("#main-heading")?.focus({ preventScroll: true }),
  );
}
function header() {
  return `<header class="app-header"><a class="brand" href="#gallery" data-action="gallery">Legit Official Site <span>by SENZ</span></a><nav class="workflow" aria-label="Website setup"><button data-action="gallery" class="${view === "gallery" ? "active" : ""}"${view === "gallery" ? ' aria-current="step"' : ""}>Choose a template</button><button data-action="edit" class="${view === "editor" ? "active" : ""}"${!draft ? " disabled" : ""}${view === "editor" ? ' aria-current="step"' : ""}>Edit your website</button></nav><div class="header-action">${view === "editor" ? '<button class="button secondary" data-action="visitor">Visitor preview</button>' : draft ? '<button class="button secondary" data-action="edit">Resume draft</button>' : '<button class="text-button" data-action="import">Import draft</button>'}</div></header>`;
}
function bindCommon() {
  app.querySelectorAll('[data-action="gallery"]').forEach((el) =>
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      gallery();
      focusTitle();
    }),
  );
  app.querySelectorAll('[data-action="edit"]').forEach((el) =>
    el.addEventListener("click", () => {
      if (draft) {
        editor();
        focusTitle();
      }
    }),
  );
  app
    .querySelectorAll('[data-action="import"]')
    .forEach((el) => el.addEventListener("click", importFile));
  app
    .querySelectorAll('[data-action="visitor"]')
    .forEach((el) => el.addEventListener("click", visitor));
}
function websiteDoc(model, extras = {}) {
  return renderSite(model, {
    css,
    assetBase: base,
    fontData: previewFont,
    ...extras,
  });
}
function gallery() {
  view = "gallery";
  thumbnailObserver?.disconnect();
  canvasObserver?.disconnect();
  document.title = "Website templates · Legit Official Site by SENZ";
  app.innerHTML = `${header()}<main id="main" class="gallery-page"><div class="gallery-intro"><div><h1 id="main-heading" tabindex="-1">A website that feels like you.</h1><p>Choose a starting point. Make every detail your own.</p></div><p class="template-count">16 templates.<br>Your own point of view.</p></div><div class="gallery-controls"><div class="filters" role="group" aria-label="Website type">${Object.entries(
    categories,
  )
    .map(
      ([id, label]) =>
        `<button class="filter" data-filter="${id}" aria-pressed="${filter === id}">${label}</button>`,
    )
    .join(
      "",
    )}</div><label class="search-field"><span class="sr-only">Search templates</span><input type="search" placeholder="Search templates" value="${e(search)}" id="template-search"></label></div>${draft ? '<p class="gallery-note">Your draft is kept while you explore. Apply a new design with your content, or start a separate fresh draft.</p>' : ""}<div id="template-grid" class="template-grid"></div><div class="gallery-footer"><p>Sample content is editable. Preview your site before sharing.</p><p>Booking, ordering, and other digital tools are separate add-ons.</p><button class="text-button" data-action="import">Import a saved draft</button></div></main>`;
  bindCommon();
  app.querySelectorAll("[data-filter]").forEach((el) =>
    el.addEventListener("click", () => {
      filter = el.dataset.filter;
      app
        .querySelectorAll("[data-filter]")
        .forEach((b) => b.setAttribute("aria-pressed", String(b === el)));
      fillGallery();
    }),
  );
  document.querySelector("#template-search").addEventListener("input", (ev) => {
    search = ev.target.value;
    fillGallery();
  });
  fillGallery();
}
function fillGallery() {
  thumbnailObserver?.disconnect();
  const visible = TEMPLATES.filter(
    (t) =>
      (filter === "all" || t.category === filter) &&
      `${t.name} ${t.description} ${t.category} ${t.headline}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const grid = document.querySelector("#template-grid");
  grid.innerHTML =
    visible
      .map(
        (t) =>
          `<article class="template-card"><button class="template-thumbnail" data-preview="${t.id}" aria-label="Preview ${t.name} template"><iframe tabindex="-1" inert aria-hidden="true" title="${t.name} miniature" sandbox="" loading="lazy" data-thumb="${t.id}"></iframe><span class="thumbnail-label">Preview template ${icon("arrow")}</span></button><div class="template-caption"><div><h2>${t.name}</h2><p>${t.description}</p></div><button class="button secondary small" data-use="${t.id}" aria-label="Use ${t.name} template">Use template</button></div></article>`,
      )
      .join("") ||
    '<div class="empty-state"><h2>No templates match yet.</h2><p>Try a broader search or choose another website type.</p><button class="button secondary" id="clear-filters">Show all templates</button></div>';
  thumbnailObserver = new ResizeObserver((entries) =>
    entries.forEach(({ target, contentRect }) => {
      const frame = target.querySelector("iframe");
      if (frame) frame.style.transform = `scale(${contentRect.width / 1100})`;
    }),
  );
  grid.querySelectorAll("[data-thumb]").forEach((frame) => {
    frame.srcdoc = websiteDoc(createDraft(frame.dataset.thumb));
    thumbnailObserver.observe(frame.parentElement);
  });
  grid
    .querySelectorAll("[data-use]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        selectTemplate(button.dataset.use),
      ),
    );
  grid
    .querySelectorAll("[data-preview]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        previewTemplate(button.dataset.preview),
      ),
    );
  document.querySelector("#clear-filters")?.addEventListener("click", () => {
    filter = "all";
    search = "";
    gallery();
  });
  say(`${visible.length} template${visible.length === 1 ? "" : "s"} shown.`);
}
function modal(markup, className = "") {
  const previousFocus = document.activeElement;
  const dialog = document.createElement("dialog");
  dialog.className = className;
  dialog.innerHTML = markup;
  const heading = dialog.querySelector("h2");
  if (heading) {
    heading.id = `dialog-${crypto.randomUUID()}`;
    dialog.setAttribute("aria-labelledby", heading.id);
  }
  document.body.append(dialog);
  dialog.showModal();
  dialog.addEventListener("close", () => {
    dialog.remove();
    if (previousFocus?.isConnected) previousFocus.focus();
  });
  dialog
    .querySelectorAll("[data-close]")
    .forEach((b) => b.addEventListener("click", () => dialog.close()));
  return dialog;
}
function selectTemplate(id) {
  if (!draft) {
    draft = createDraft(id);
    validDraft = validateDraft(draft);
    dirty = true;
    saved = false;
    editor();
    focusTitle();
    return;
  }
  const name = templateById(id).name;
  const dialog = modal(
    `<h2>Make ${e(name)} yours.</h2><p>Keep what you have written, or start with this template’s sample content.</p><div class="dialog-actions"><button class="button" data-keep>Keep my content</button><button class="button secondary" data-fresh>Start fresh</button><button class="text-button" data-close>Cancel</button></div><p class="help">Starting fresh replaces the current editor draft. Download a backup first if you want to keep it.</p>`,
  );
  dialog.querySelector("[data-keep]").addEventListener("click", () => {
    draft = changeTemplate(draft, id);
    dirty = true;
    validateCurrent();
    dialog.close();
    editor();
    focusTitle();
  });
  dialog.querySelector("[data-fresh]").addEventListener("click", () => {
    dialog.close();
    confirmReplace(() => {
      draft = createDraft(id);
      validDraft = validateDraft(draft);
      dirty = true;
      saved = false;
      editor();
      focusTitle();
    });
  });
}
function confirmReplace(action) {
  const dialog = modal(
    '<h2>Replace this draft?</h2><p>This replaces your current work in the editor. A downloaded draft can be imported later.</p><div class="dialog-actions"><button class="button" data-confirm>Replace draft</button><button class="button secondary" data-backup>Download draft first</button><button class="text-button" data-close>Cancel</button></div>',
  );
  dialog.querySelector("[data-confirm]").addEventListener("click", () => {
    dialog.close();
    action();
  });
  dialog.querySelector("[data-backup]").addEventListener("click", exportDraft);
}
function previewTemplate(id) {
  const t = templateById(id);
  const dialog = modal(
    `<div class="preview-modal-bar"><div><h2>${t.name}</h2><p>${e(t.description)} Sample website.</p></div><div class="preview-modal-actions"><button class="button" data-choose>Use template</button><button class="icon-button" data-close aria-label="Close preview">${icon("close")}</button></div></div><iframe title="${t.name} visitor website preview" sandbox="allow-popups allow-popups-to-escape-sandbox"></iframe>`,
    "preview-modal",
  );
  dialog.querySelector("iframe").srcdoc = websiteDoc(createDraft(id));
  dialog.querySelector("[data-choose]").addEventListener("click", () => {
    dialog.close();
    selectTemplate(id);
  });
}
function editor() {
  if (!draft) return gallery();
  view = "editor";
  thumbnailObserver?.disconnect();
  document.title = "Edit your website · Legit Official Site by SENZ";
  app.innerHTML = `${header()}<main id="main" class="editor-shell"><aside class="inspector" aria-label="Website editor"><div class="inspector-heading"><h1 id="main-heading" tabindex="-1">Make it yours</h1><p>Edit here. See every change on your website.</p></div><div class="editor-tabs" role="tablist" aria-label="Editing controls">${Object.entries(
    {
      content: "Content",
      style: "Style",
      sections: "Sections",
      tools: "Tools",
    },
  )
    .map(
      ([id, title]) =>
        `<button role="tab" id="tab-${id}" aria-controls="editor-panel" data-tab="${id}" aria-selected="${tab === id}" tabindex="${tab === id ? "0" : "-1"}">${title}</button>`,
    )
    .join(
      "",
    )}</div><div id="editor-panel" class="editor-panel" role="tabpanel" aria-labelledby="tab-${tab}"></div><div class="save-area"><p id="validation-error" class="error-message" role="alert" hidden></p><button class="button save-button" data-action="save">Save draft</button><p id="save-status" class="save-status" role="status">${dirty ? "Changes not saved on this device" : saved ? "Saved on this device" : "New draft · not published"}</p><div class="file-actions"><button class="text-button" data-action="backup">Download draft</button><button class="text-button" data-action="import">Import draft</button></div><button class="text-button" data-action="export-html">Download website preview</button><p class="storage-note">Drafts are saved in this browser, not to your SENZ account. Download a backup to move devices.</p></div></aside><section class="preview-stage" aria-label="Your website preview"><div class="preview-toolbar"><div><strong>${templateById(draft.templateId).name}</strong><span>Website preview</span></div><div class="device-toggle" role="group" aria-label="Preview size"><button data-device="desktop" aria-pressed="${device === "desktop"}">${icon("desktop")}<span>Desktop</span></button><button data-device="mobile" aria-pressed="${device === "mobile"}">${icon("mobile")}<span>Mobile</span></button></div></div><div class="canvas-wrap ${device === "mobile" ? "mobile-canvas" : ""}"><iframe id="site-preview" title="Your visitor website preview" sandbox="allow-popups allow-popups-to-escape-sandbox"></iframe></div><p class="preview-footnote">Only your website appears to visitors. Editor controls stay here.</p></section></main>`;
  bindCommon();
  renderPanel();
  updatePreview();
  canvasObserver?.disconnect();
  canvasObserver = new ResizeObserver(sizePreview);
  canvasObserver.observe(app.querySelector(".canvas-wrap"));
  app.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => changeTab(button.dataset.tab));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
        return;
      event.preventDefault();
      const keys = Object.keys(panels),
        index = keys.indexOf(tab);
      const next =
        event.key === "Home"
          ? keys[0]
          : event.key === "End"
            ? keys.at(-1)
            : keys[
                (index + (event.key === "ArrowRight" ? 1 : -1) + keys.length) %
                  keys.length
              ];
      changeTab(next);
      document.querySelector(`#tab-${next}`).focus();
    });
  });
  app.querySelectorAll("[data-device]").forEach((button) =>
    button.addEventListener("click", () => {
      device = button.dataset.device;
      app
        .querySelectorAll("[data-device]")
        .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      app
        .querySelector(".canvas-wrap")
        .classList.toggle("mobile-canvas", device === "mobile");
      sizePreview();
      say(`${device} website preview selected.`);
    }),
  );
  app.querySelector('[data-action="save"]').addEventListener("click", save);
  app
    .querySelector('[data-action="backup"]')
    .addEventListener("click", exportDraft);
  app
    .querySelector('[data-action="export-html"]')
    .addEventListener("click", exportWebsite);
  validateCurrent();
}
function changeTab(id) {
  tab = id;
  app.querySelectorAll("[data-tab]").forEach((b) => {
    b.setAttribute("aria-selected", String(b.dataset.tab === id));
    b.tabIndex = b.dataset.tab === id ? 0 : -1;
  });
  renderPanel();
}
function renderPanel() {
  const panel = document.querySelector("#editor-panel");
  panel.setAttribute("aria-labelledby", `tab-${tab}`);
  panel.innerHTML = panels[tab](draft);
  panel.querySelectorAll("[data-field]").forEach((el) =>
    el.addEventListener(
      el.tagName === "SELECT" || el.type === "radio" ? "change" : "input",
      () => {
        setPath(draft, el.dataset.field, el.value);
        changed();
      },
    ),
  );
  panel.querySelectorAll("[data-image]").forEach((el) =>
    el.addEventListener("change", async () => {
      if (!el.files[0]) return;
      const owner = draft,
        path = el.dataset.image;
      el.disabled = true;
      try {
        const image = await readImage(el.files[0]);
        if (owner !== draft) return;
        setPath(draft, path, image);
        changed();
        toast("Photo added to this draft.");
        renderPanelKeepingDetails();
      } catch (error) {
        toast(error.message);
      } finally {
        if (el.isConnected) {
          el.disabled = false;
          el.value = "";
        }
      }
    }),
  );
  panel.querySelectorAll("[data-remove-image]").forEach((el) =>
    el.addEventListener("click", () => {
      setPath(draft, el.dataset.removeImage, "");
      changed();
      renderPanelKeepingDetails();
    }),
  );
  panel.querySelectorAll("[data-add]").forEach((el) =>
    el.addEventListener("click", () => {
      const key = el.dataset.add;
      if (draft[key].length >= 12) return;
      const id = crypto.randomUUID();
      draft[key].push(
        key === "offerings"
          ? { id, title: "New item", body: "", detail: "", image: "", alt: "" }
          : key === "gallery"
            ? { id, image: "", alt: "", caption: "" }
            : { id, question: "New question", answer: "" },
      );
      if (key === "gallery" || key === "faqs")
        draft.sections.find(
          (s) => s.type === (key === "faqs" ? "faq" : "gallery"),
        ).visible = true;
      changed();
      renderPanelKeepingDetails();
      say("Item added.");
    }),
  );
  panel.querySelectorAll("[data-remove]").forEach((el) =>
    el.addEventListener("click", () => {
      const [key, index] = el.dataset.remove.split(".");
      draft[key].splice(Number(index), 1);
      changed();
      renderPanelKeepingDetails();
      say("Item removed.");
    }),
  );
  panel.querySelectorAll("[data-section]").forEach((el) =>
    el.addEventListener("change", () => {
      draft.sections.find((s) => s.type === el.dataset.section).visible =
        el.checked;
      changed();
    }),
  );
  panel.querySelectorAll("[data-move]").forEach((el) =>
    el.addEventListener("click", () => {
      const type = el.dataset.move,
        direction = Number(el.dataset.direction);
      draft = moveSection(draft, type, direction);
      changed();
      renderPanel();
      const focus =
        panel.querySelector(
          `[data-move="${type}"][data-direction="${direction}"]:not(:disabled)`,
        ) || panel.querySelector(`[data-section="${type}"]`);
      focus?.focus();
      say("Section order updated.");
    }),
  );
  panel
    .querySelector('[data-action="gallery"]')
    ?.addEventListener("click", gallery);
  panel
    .querySelector('[data-action="reset-accent"]')
    ?.addEventListener("click", () => {
      draft.accent = "";
      changed();
      renderPanel();
    });
}
function renderPanelKeepingDetails() {
  const panel = document.querySelector("#editor-panel"),
    position = panel.scrollTop;
  const open = [...panel.querySelectorAll(".field-group")].map((el) => el.open);
  renderPanel();
  panel.querySelectorAll(".field-group").forEach((el, n) => {
    el.open = open[n];
  });
  panel.scrollTop = position;
}
function setPath(object, path, value) {
  const keys = path.split(".");
  let target = object;
  keys.slice(0, -1).forEach((key) => {
    target = target[key];
  });
  target[keys.at(-1)] = value;
}
function changed() {
  dirty = true;
  const el = document.querySelector("#save-status");
  if (el) el.textContent = "Changes not saved on this device";
  clearTimeout(updateTimer);
  updateTimer = setTimeout(updatePreview, 220);
}
function validateCurrent() {
  try {
    validDraft = validateDraft(draft);
    const el = document.querySelector("#validation-error");
    if (el) {
      el.hidden = true;
      el.textContent = "";
    }
    return true;
  } catch (error) {
    const el = document.querySelector("#validation-error");
    if (el) {
      el.textContent = error.message;
      el.hidden = false;
    }
    return false;
  }
}
function updatePreview() {
  if (!validateCurrent()) return;
  const frame = document.querySelector("#site-preview");
  if (frame) frame.srcdoc = websiteDoc(validDraft);
}
function sizePreview() {
  const wrap = document.querySelector(".canvas-wrap"),
    frame = document.querySelector("#site-preview");
  if (!wrap || !frame) return;
  const width =
    device === "desktop" ? Math.max(900, wrap.clientWidth) : wrap.clientWidth;
  const scale = wrap.clientWidth / width;
  frame.style.width = `${width}px`;
  frame.style.height = `${wrap.clientHeight / scale}px`;
  frame.style.transformOrigin = "top left";
  frame.style.transform = `scale(${scale})`;
}
function save() {
  if (!validateCurrent())
    return toast("Check the highlighted draft error before saving.");
  try {
    saveDraft(storage, validDraft);
    dirty = false;
    saved = true;
    document.querySelector("#save-status").textContent = "Saved on this device";
    toast("Draft saved on this device.");
  } catch (error) {
    toast(error.message);
    document.querySelector("#save-status").textContent =
      "Not saved · download a backup";
  }
}
function exportDraft() {
  try {
    download(
      serializeDraft(draft),
      "legit-website-draft.json",
      "application/json",
    );
    toast("Editable draft downloaded. Keep it as your backup.");
  } catch (error) {
    toast(error.message);
  }
}
async function exportWebsite() {
  if (!validateCurrent())
    return toast("Check the highlighted draft error before exporting.");
  const snapshot = structuredClone(validDraft),
    button = document.querySelector('[data-action="export-html"]');
  button.disabled = true;
  button.textContent = "Preparing website…";
  try {
    const values = [
      snapshot.heroImage,
      snapshot.logo,
      ...snapshot.offerings.map((i) => i.image),
      ...snapshot.gallery.map((i) => i.image),
    ];
    const keys = [...new Set(values.filter((v) => Object.hasOwn(ASSETS, v)))];
    const embeddedAssets = Object.fromEntries(
      await Promise.all(
        keys.map(async (key) => [
          key,
          await assetData(`${base}${ASSETS[key]}`),
        ]),
      ),
    );
    download(
      websiteDoc(snapshot, { embeddedAssets }),
      "your-website-preview.html",
      "text/html",
    );
    toast("Website preview downloaded. This does not publish your website.");
  } catch (error) {
    toast(error.message);
  } finally {
    if (button.isConnected) {
      button.disabled = false;
      button.textContent = "Download website preview";
    }
  }
}
function importFile() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,application/json";
  input.addEventListener("change", async () => {
    const file = input.files[0];
    if (!file) return;
    try {
      if (file.size > MAX_DRAFT_BYTES)
        throw new Error("Choose a draft file smaller than 8 MB.");
      const next = parseDraft(await file.text());
      const apply = () => {
        draft = next;
        validDraft = structuredClone(next);
        dirty = true;
        saved = false;
        tab = "content";
        editor();
        focusTitle();
        toast("Draft imported. Save it on this device when ready.");
      };
      if (draft) confirmReplace(apply);
      else apply();
    } catch (error) {
      toast(error.message);
    }
  });
  input.click();
}
function visitor() {
  if (!validateCurrent())
    return toast("Check the highlighted draft error before previewing.");
  const dialog = modal(
    `<div class="preview-modal-bar"><div><h2>Visitor preview</h2><p>Private preview · your website is not published</p></div><button class="button secondary" data-close>Back to editing</button></div><iframe title="Full visitor preview" sandbox="allow-popups allow-popups-to-escape-sandbox"></iframe>`,
    "preview-modal",
  );
  dialog.querySelector("iframe").srcdoc = websiteDoc(validDraft);
}
window.addEventListener("beforeunload", (event) => {
  if (dirty) {
    event.preventDefault();
    event.returnValue = "";
  }
});
try {
  const response = await fetch(new URL("./site.css", import.meta.url));
  if (!response.ok) throw new Error("Website styles could not be loaded.");
  css = await response.text();
  previewFont = await assetData(`${base}assets/fonts/InterVariable.woff2`);
  gallery();
  if (loaded.error) toast(loaded.error);
} catch (error) {
  app.innerHTML = `<main class="loading"><h1>The studio could not open.</h1><p>${e(error.message)}</p><button class="button" id="retry">Try again</button></main>`;
  document
    .querySelector("#retry")
    .addEventListener("click", () => location.reload());
}
