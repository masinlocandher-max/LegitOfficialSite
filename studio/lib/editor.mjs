import { PALETTES, FONTS, SECTION_TYPES, templateById } from "./templates.mjs";
import { suggestionsFor, QUOTE_URL } from "./addons.mjs";
import { escapeHtml as e } from "./render.mjs";

export const sectionName = {
  offerings: "Services, products & work",
  about: "About",
  gallery: "Photo gallery",
  faq: "Questions & answers",
  contact: "Contact",
};
export const icon = (name) =>
  `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${{ arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>', desktop: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>', mobile: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>', up: '<path d="m6 14 6-6 6 6"/>', down: '<path d="m6 10 6 6 6-6"/>', close: '<path d="m6 6 12 12M6 18 18 6"/>', plus: '<path d="M12 5v14M5 12h14"/>', back: '<path d="M19 12H5m5-5-5 5 5 5"/>', check: '<path d="m5 12 4 4L19 6"/>' }[name] || ""}</svg>`;
const field = (
  label,
  path,
  value,
  { max = 300, area = false, hint = "", type = "text" } = {},
) =>
  `<label class="field"><span>${e(label)}</span>${area ? `<textarea aria-label="${e(label)}"${hint ? ` aria-describedby="hint-${path}"` : ""} data-field="${path}" maxlength="${max}" rows="3">${e(value)}</textarea>` : `<input aria-label="${e(label)}"${hint ? ` aria-describedby="hint-${path}"` : ""} type="${type}" data-field="${path}" value="${e(value)}" maxlength="${max}">`}${hint ? `<small id="hint-${path}">${e(hint)}</small>` : ""}</label>`;
const select = (label, path, value, options) =>
  `<label class="field"><span>${e(label)}</span><select aria-label="${e(label)}" data-field="${path}">${Object.entries(
    options,
  )
    .map(
      ([v, name]) =>
        `<option value="${v}"${v === value ? " selected" : ""}>${e(name)}</option>`,
    )
    .join("")}</select></label>`;
const upload = (label, path, value) =>
  `<div class="image-field"><label class="upload"><span>${e(label)}</span><input type="file" data-image="${path}" accept="image/jpeg,image/png,image/webp"></label>${value ? `<button class="text-button" type="button" data-remove-image="${path}">Remove image</button>` : ""}</div>`;
const group = (title, body, open = false) =>
  `<details class="field-group"${open ? " open" : ""}><summary>${e(title)}</summary><div class="field-group-body">${body}</div></details>`;
export function contentPanel(d) {
  return (
    `<div class="intro-fields">${field("Website name", "brand", d.brand, { max: 80 })}${field("Headline", "headline", d.headline, { max: 180, area: true })}${field("Introduction", "intro", d.intro, { max: 600, area: true })}${field("Button label", "actionLabel", d.actionLabel, { max: 50 })}${select("Button destination", "actionTarget", d.actionTarget, Object.fromEntries(SECTION_TYPES.map((s) => [s, sectionName[s]])))}</div>` +
    group(
      "Images & logo",
      `${upload("Upload your main photo", "heroImage", d.heroImage)}${field("Main photo description", "heroAlt", d.heroAlt, { max: 180, hint: "Describe the photo for visitors using screen readers." })}${select("Photo focus", "imageFocus", d.imageFocus, { left: "Left", center: "Center", right: "Right" })}${upload("Upload your logo", "logo", d.logo)}${field("Logo description", "logoAlt", d.logoAlt, { max: 180 })}<p class="help">Use photos you have permission to publish. Sample imagery is for demonstration; uploads stay on this device.</p>`,
    ) +
    group(
      "Services, products & work",
      `${field("Section heading", "offeringsHeading", d.offeringsHeading, { max: 100 })}<div class="item-list">${d.offerings.map((i, n) => `<fieldset><legend>Item ${n + 1}</legend>${field("Title", `offerings.${n}.title`, i.title, { max: 100 })}${field("Description", `offerings.${n}.body`, i.body, { max: 600, area: true })}${field("Price, duration, or detail", `offerings.${n}.detail`, i.detail || "", { max: 80, hint: "Optional. Only enter details you can confirm." })}${upload("Item photo", `offerings.${n}.image`, i.image)}${field("Item photo description", `offerings.${n}.alt`, i.alt, { max: 180 })}<button type="button" class="text-button danger" data-remove="offerings.${n}">Remove item ${n + 1}</button></fieldset>`).join("")}</div><button type="button" class="button secondary small" data-add="offerings"${d.offerings.length >= 12 ? " disabled" : ""}>${icon("plus")}Add item</button>`,
    ) +
    group(
      "About",
      field("Heading", "aboutHeading", d.aboutHeading, { max: 100 }) +
        field("Your story", "about", d.about, { max: 3000, area: true }),
    ) +
    group(
      "Photo gallery",
      `${field("Gallery heading", "galleryHeading", d.galleryHeading, { max: 100 })}${d.gallery.map((i, n) => `<fieldset><legend>Photo ${n + 1}</legend>${upload("Upload photo", `gallery.${n}.image`, i.image)}${field("Photo description", `gallery.${n}.alt`, i.alt, { max: 180 })}${field("Caption", `gallery.${n}.caption`, i.caption, { max: 200 })}<button class="text-button danger" data-remove="gallery.${n}">Remove photo ${n + 1}</button></fieldset>`).join("")}<button class="button secondary small" data-add="gallery"${d.gallery.length >= 12 ? " disabled" : ""}>${icon("plus")}Add photo</button>`,
    ) +
    group(
      "Questions & answers",
      `${field("FAQ heading", "faqHeading", d.faqHeading, { max: 100 })}${d.faqs.map((i, n) => `<fieldset><legend>Question ${n + 1}</legend>${field("Question", `faqs.${n}.question`, i.question, { max: 200 })}${field("Answer", `faqs.${n}.answer`, i.answer, { max: 1200, area: true })}<button class="text-button danger" data-remove="faqs.${n}">Remove question ${n + 1}</button></fieldset>`).join("")}<button class="button secondary small" data-add="faqs"${d.faqs.length >= 12 ? " disabled" : ""}>${icon("plus")}Add question</button>`,
    ) +
    group(
      "Contact details",
      `${field("Contact heading", "contactHeading", d.contactHeading, { max: 100 })}${field("Contact introduction", "contactText", d.contactText, { max: 1000, area: true })}${field("Email address", "email", d.email, { type: "email", max: 254 })}${field("Phone number", "phone", d.phone, { type: "tel", max: 30 })}${field("Location or opening hours", "location", d.location, { max: 200, area: true })}${field("Another website or social link", "externalUrl", d.externalUrl, { type: "url", max: 2048, hint: "Use a complete https:// address." })}${field("Link label", "externalLabel", d.externalLabel, { max: 80 })}`,
    ) +
    group(
      "Search description",
      field("Page description", "description", d.description, {
        max: 300,
        area: true,
        hint: "Used as the website description. Previews are marked not to be indexed.",
      }),
    )
  );
}
export function stylePanel(d) {
  return `<h3 class="panel-heading">Make it feel like you.</h3><p class="help">Change the overall palette, type, and button color.</p><fieldset class="palette-field"><legend>Color palette</legend><div class="palette-options">${Object.entries(
    PALETTES,
  )
    .map(
      ([id, p]) =>
        `<label class="palette-option"><input type="radio" aria-label="${p.name}" name="palette" data-field="palette" value="${id}"${d.palette === id ? " checked" : ""}><span class="palette-dot" aria-hidden="true" style="--swatch:${p.background};--swatch-ink:${p.text}">Aa</span><span>${p.name}</span></label>`,
    )
    .join(
      "",
    )}</div></fieldset>${select("Typography", "font", d.font, FONTS)}<label class="field color-field"><span>Button color</span><input type="color" data-field="accent" value="${d.accent || PALETTES[d.palette].accent}"></label><p class="help">Button text automatically adjusts for readable contrast.</p><button class="text-button" data-action="reset-accent">Use palette button color</button><div class="panel-note"><h3>Try another layout</h3><p>Your content stays with you when you switch templates.</p><button class="button secondary small" data-action="gallery">Choose another template</button></div>`;
}
export function sectionsPanel(d) {
  return `<h3 class="panel-heading">Tell your story in your order.</h3><p class="help">Show the sections you need. Use the arrows to move them.</p><div class="section-list">${d.sections.map((s, i) => `<div class="section-row"><label><input type="checkbox" data-section="${s.type}"${s.visible ? " checked" : ""}><span>${sectionName[s.type]}</span></label><div class="section-actions"><button class="icon-button" data-move="${s.type}" data-direction="-1" aria-label="Move ${sectionName[s.type]} up"${i === 0 ? " disabled" : ""}>${icon("up")}</button><button class="icon-button" data-move="${s.type}" data-direction="1" aria-label="Move ${sectionName[s.type]} down"${i === d.sections.length - 1 ? " disabled" : ""}>${icon("down")}</button></div></div>`).join("")}</div><p class="help">Empty galleries and lists stay hidden. Your main button falls back to a visible section if its destination is hidden.</p>`;
}
export function toolsPanel(d) {
  const t = templateById(d.templateId);
  return `<h3 class="panel-heading">A website now. More tools when you need them.</h3><p class="help">Your template controls how you appear. Digital products are separate add-ons, quoted and activated through SENZ.</p>${suggestionsFor(
    t,
  )
    .map(
      (a) =>
        `<article class="addon"><h4>${e(a.name)}</h4><p>${e(a.text)}</p><small>${e(a.limit)}</small><a class="text-link" href="${QUOTE_URL}" target="_blank" rel="noopener noreferrer" aria-label="Request a quote for ${e(a.name)}">Request an add-on quote ${icon("arrow")}</a></article>`,
    )
    .join(
      "",
    )}<div class="panel-note"><h3>Already have an active tool?</h3>${field("Public booking or ordering link", "toolUrl", d.toolUrl || "", { type: "url", max: 2048, hint: "Use the public https:// link supplied for your active tool. Never paste an admin or private link." })}<p class="help">This connects your main button to that page. Update its label under Content. Adding a link does not purchase or activate a product.</p></div>`;
}
