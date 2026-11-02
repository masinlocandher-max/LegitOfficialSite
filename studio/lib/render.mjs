import { PALETTES, ASSETS, templateById } from "./templates.mjs";
import { validateDraft, buttonInk } from "./model.mjs";

export const escapeHtml = (v) =>
  String(v).replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );
const p = (text) => escapeHtml(text).replace(/\n/g, "<br>");
export function renderSite(
  input,
  {
    css = "",
    assetBase = "",
    embeddedAssets = {},
    fontData = "",
    preview = true,
  } = {},
) {
  const d = validateDraft(input),
    t = templateById(d.templateId),
    palette = PALETTES[d.palette],
    accent = d.accent || palette.accent;
  const imageUrl = (value) =>
    embeddedAssets[value] ||
    (Object.hasOwn(ASSETS, value) ? `${assetBase}${ASSETS[value]}` : value);
  const img = (value, alt, className = "", eager = false) =>
    value
      ? `<img class="${className}" src="${escapeHtml(imageUrl(value))}" alt="${escapeHtml(alt)}" loading="${eager ? "eager" : "lazy"}" decoding="async">`
      : "";
  const headings = {
    offerings: d.offeringsHeading,
    about: d.aboutHeading,
    gallery: d.galleryHeading,
    faq: d.faqHeading,
    contact: d.contactHeading,
  };
  const populated = {
    offerings: d.offerings.length > 0,
    about: !!d.about,
    gallery: d.gallery.some((i) => i.image),
    faq: d.faqs.length > 0,
    contact: true,
  };
  const visible = d.sections.filter((s) => s.visible && populated[s.type]);
  const target =
    visible.find((s) => s.type === d.actionTarget)?.type || visible[0]?.type;
  const offeringLabel = {
    atelier: "Work",
    presence: "Services",
    gather: "Explore",
    outline: "Work",
    forma: "Collection",
    horizon: "Focus",
    calm: "Services",
    stay: "Spaces",
    table: "Menu",
    frame: "Work",
    signal: "Details",
    occasion: "Programme",
    chapter: "Programmes",
    common: "Initiatives",
    address: "Spaces",
    portrait: "Experience",
  }[d.templateId];
  const nav = visible
    .slice(0, 5)
    .map(
      (s) =>
        `<a href="#${s.type}">${escapeHtml({ offerings: offeringLabel, about: "About", gallery: "Gallery", faq: "FAQ", contact: "Contact" }[s.type])}</a>`,
    )
    .join("");
  const cta =
    (target || d.toolUrl) && d.actionLabel
      ? `<a class="site-button" href="${d.toolUrl ? escapeHtml(d.toolUrl) : "#" + target}"${d.toolUrl ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(d.actionLabel)}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg></a>`
      : "";
  const media = d.heroImage
    ? `<div class="hero-media">${img(d.heroImage, d.heroAlt, "", true)}</div>`
    : "";
  const hero = `<section class="hero ${d.heroImage ? "" : "no-image"}"><div class="hero-copy"><h1>${p(d.headline)}</h1>${d.intro ? `<p class="intro">${p(d.intro)}</p>` : ""}${cta}</div>${media}</section>`;
  const section = (type) => {
    let body = "";
    if (type === "offerings")
      body = `<div class="offerings">${d.offerings.map((i, n) => `<article class="offering">${img(i.image, i.alt)}<span class="item-number" aria-hidden="true">${String(n + 1).padStart(2, "0")}</span><h3>${escapeHtml(i.title)}</h3><p>${p(i.body)}</p>${i.detail ? `<p class="item-detail">${escapeHtml(i.detail)}</p>` : ""}</article>`).join("")}</div>`;
    if (type === "about")
      body = `<div class="about-copy"><p>${p(d.about)}</p></div>`;
    if (type === "gallery")
      body = `<div class="photo-grid">${d.gallery
        .filter((i) => i.image)
        .map(
          (i) =>
            `<figure>${img(i.image, i.alt)}${i.caption ? `<figcaption>${escapeHtml(i.caption)}</figcaption>` : ""}</figure>`,
        )
        .join("")}</div>`;
    if (type === "faq")
      body = `<div class="questions">${d.faqs.map((i) => `<details><summary>${escapeHtml(i.question)}</summary><p>${p(i.answer)}</p></details>`).join("")}</div>`;
    if (type === "contact")
      body = `<div class="contact-body"><p>${p(d.contactText)}</p><div class="contact-links">${d.email ? `<a href="mailto:${escapeHtml(d.email)}">${escapeHtml(d.email)}</a>` : ""}${d.phone ? `<a href="tel:${escapeHtml(d.phone.replace(/[ ()-]/g, ""))}">${escapeHtml(d.phone)}</a>` : ""}${d.externalUrl ? `<a href="${escapeHtml(d.externalUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(d.externalLabel || d.externalUrl)}</a>` : ""}</div>${d.location ? `<p class="location">${p(d.location)}</p>` : ""}</div>`;
    return `<section class="site-section section-${type}" id="${type}"><h2>${escapeHtml(headings[type])}</h2>${body}</section>`;
  };
  const fontFace = fontData
    ? `@font-face{font-family:SiteSans;src:url('${fontData}') format('woff2');font-weight:100 900;font-display:swap}`
    : `@font-face{font-family:SiteSans;src:url('${assetBase}assets/fonts/InterVariable.woff2') format('woff2');font-weight:100 900;font-display:swap}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="referrer" content="no-referrer">${preview ? '<meta name="robots" content="noindex,nofollow">' : ""}<meta name="description" content="${escapeHtml(d.description)}"><title>${escapeHtml(d.brand || "Your website")}</title><style>${fontFace}\n${css}\n:root{--bg:${palette.background};--ink:${palette.text};--accent:${accent};--button-ink:${buttonInk(accent)};--image-focus:${d.imageFocus};}</style></head><body class="template-${d.templateId} layout-${t.layout} font-${d.font}"><a class="skip-link" href="#main">Skip to content</a><header class="site-header"><a class="site-brand" href="#main">${img(d.logo, d.logoAlt || d.brand, "site-logo", true)}<span>${escapeHtml(d.brand)}</span></a><nav aria-label="Website navigation">${nav}</nav></header><main id="main">${hero}${visible.map((s) => section(s.type)).join("")}</main><footer class="site-footer"><span>${escapeHtml(d.brand)}</span><a href="#main">Back to top</a></footer></body></html>`;
}
