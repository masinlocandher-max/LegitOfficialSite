import { STORAGE_KEY, parseDraft, serializeDraft } from "./model.mjs";

export function readSaved(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return { draft: raw ? parseDraft(raw) : null, error: "" };
  } catch {
    return {
      draft: null,
      error:
        "The saved draft could not be loaded. It has not been overwritten. Import a backup or start a new draft.",
    };
  }
}
export function saveDraft(storage, draft) {
  try {
    storage.setItem(STORAGE_KEY, serializeDraft(draft));
  } catch (error) {
    if (error.name === "QuotaExceededError" || error.name === "SecurityError")
      throw new Error(
        "Device storage is unavailable or full. Download a draft backup to keep your changes.",
      );
    throw error;
  }
}
export function download(contents, name, type) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
