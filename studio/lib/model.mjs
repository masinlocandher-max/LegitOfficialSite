import {
  SCHEMA_VERSION,
  ASSETS,
  PALETTES,
  FONTS,
  SECTION_TYPES,
  templateById,
} from "./templates.mjs";

export const MAX_DRAFT_BYTES = 8 * 1024 * 1024;
export const MAX_IMAGE_CHARS = 900000;
export const STORAGE_KEY = "senz.legit-template-studio.v1";
const object = (v) => v && typeof v === "object" && !Array.isArray(v);
const text = (v, max, label) => {
  if (typeof v !== "string" || v.length > max)
    throw new Error(`${label} must be text of at most ${max} characters.`);
  return v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");
};
const choice = (v, options, label) => {
  if (!options.includes(v)) throw new Error(`Choose a valid ${label}.`);
  return v;
};
export function safeImage(value) {
  if (value === "" || Object.hasOwn(ASSETS, value)) return value;
  if (
    typeof value !== "string" ||
    value.length > MAX_IMAGE_CHARS ||
    !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)
  )
    throw new Error(
      "Use a PNG, JPG or WebP image under 650 KB after resizing.",
    );
  return value;
}
export function safeExternalUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password)
      throw new Error();
    return url.href;
  } catch {
    throw new Error("Use a complete https:// link without passwords.");
  }
}
function records(value, max, label, clean) {
  if (!Array.isArray(value) || value.length > max)
    throw new Error(`${label} allows up to ${max} items.`);
  const ids = new Set();
  return value.map((item, i) => {
    if (!object(item)) throw new Error(`Check ${label} item ${i + 1}.`);
    const id = text(item.id, 80, "Item ID");
    if (!/^[a-zA-Z0-9_-]+$/.test(id) || ids.has(id))
      throw new Error("Each item must have a unique ID.");
    ids.add(id);
    return { id, ...clean(item) };
  });
}
export function validateDraft(input) {
  if (!object(input) || input.schemaVersion !== SCHEMA_VERSION)
    throw new Error("This is not a supported Legit Official Site draft.");
  if (!templateById(input.templateId))
    throw new Error("This draft uses an unknown template.");
  const out = { schemaVersion: SCHEMA_VERSION, templateId: input.templateId };
  for (const [key, max] of Object.entries({
    brand: 80,
    headline: 180,
    intro: 600,
    actionLabel: 50,
    heroAlt: 180,
    logoAlt: 180,
    description: 300,
    offeringsHeading: 100,
    aboutHeading: 100,
    about: 3000,
    galleryHeading: 100,
    faqHeading: 100,
    contactHeading: 100,
    contactText: 1000,
    email: 254,
    phone: 30,
    location: 200,
    externalUrl: 2048,
    externalLabel: 80,
  }))
    out[key] = text(input[key], max, key);
  out.palette = choice(input.palette, Object.keys(PALETTES), "palette");
  out.font = choice(input.font, Object.keys(FONTS), "typeface");
  out.actionTarget = choice(
    input.actionTarget,
    SECTION_TYPES,
    "button destination",
  );
  out.heroImage = safeImage(input.heroImage);
  out.logo = safeImage(input.logo);
  out.accent = text(input.accent ?? "", 7, "Accent color");
  if (out.accent && !/^#[a-fA-F0-9]{6}$/.test(out.accent))
    throw new Error("Use a six-digit hex color.");
  out.imageFocus = choice(
    input.imageFocus ?? "center",
    ["left", "center", "right"],
    "image position",
  );
  if (out.email && !/^[^\s@<>"\\]+@[^\s@<>"\\]+\.[^\s@<>"\\]+$/.test(out.email))
    throw new Error("Enter a complete email address.");
  if (out.phone && !/^\+?[0-9 ()-]{5,30}$/.test(out.phone))
    throw new Error("Enter a phone number using digits, spaces, +, ( ), or -.");
  out.externalUrl = safeExternalUrl(out.externalUrl);
  out.toolUrl = safeExternalUrl(
    text(input.toolUrl ?? "", 2048, "Connected tool link"),
  );
  out.offerings = records(input.offerings, 12, "Services or products", (i) => ({
    title: text(i.title, 100, "Title"),
    body: text(i.body, 600, "Description"),
    detail: text(i.detail ?? "", 80, "Price or detail"),
    image: safeImage(i.image),
    alt: text(i.alt, 180, "Image description"),
  }));
  out.gallery = records(input.gallery, 12, "Gallery", (i) => ({
    image: safeImage(i.image),
    alt: text(i.alt, 180, "Image description"),
    caption: text(i.caption, 200, "Caption"),
  }));
  out.faqs = records(input.faqs, 12, "Questions", (i) => ({
    question: text(i.question, 200, "Question"),
    answer: text(i.answer, 1200, "Answer"),
  }));
  if (
    !Array.isArray(input.sections) ||
    input.sections.length !== SECTION_TYPES.length
  )
    throw new Error("The draft must include all section settings.");
  const seen = new Set();
  out.sections = input.sections.map((section) => {
    if (
      !object(section) ||
      !SECTION_TYPES.includes(section.type) ||
      seen.has(section.type) ||
      typeof section.visible !== "boolean"
    )
      throw new Error("Section settings are invalid.");
    seen.add(section.type);
    return { type: section.type, visible: section.visible };
  });
  if (JSON.stringify(out).length > MAX_DRAFT_BYTES)
    throw new Error(
      "This draft is too large. Remove some photos before saving.",
    );
  return out;
}
export function parseDraft(raw) {
  if (typeof raw !== "string" || raw.length > MAX_DRAFT_BYTES)
    throw new Error("Choose a draft file smaller than 8 MB.");
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("This file is not a valid JSON draft.");
  }
  return validateDraft(data);
}
export function serializeDraft(draft) {
  return JSON.stringify(validateDraft(draft), null, 2);
}
export function buttonInk(hex) {
  const rgb = hex
    .slice(1)
    .match(/../g)
    .map((s) => parseInt(s, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const l = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  return (l + 0.05) / 0.05 >= 1.05 / (l + 0.05) ? "#000000" : "#ffffff";
}
export function moveSection(draft, type, direction) {
  const next = structuredClone(draft),
    index = next.sections.findIndex((s) => s.type === type),
    target = index + direction;
  if (index >= 0 && target >= 0 && target < next.sections.length)
    [next.sections[index], next.sections[target]] = [
      next.sections[target],
      next.sections[index],
    ];
  return next;
}
