import { MAX_IMAGE_CHARS, safeImage } from "./model.mjs";

export async function readImage(file) {
  if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error(
      "Choose a JPG, PNG, or WebP image. SVG and animated formats are not supported.",
    );
  if (file.size > 10 * 1024 * 1024)
    throw new Error("Choose an image smaller than 10 MB.");
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    try {
      await image.decode();
    } catch {
      throw new Error("This image could not be opened. Try a different image.");
    }
    if (!image.naturalWidth || !image.naturalHeight)
      throw new Error("This image has no visible dimensions.");
    const scale = Math.min(
      1,
      1600 / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not prepare this image.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    let result = canvas.toDataURL("image/webp", 0.84);
    if (result.length > MAX_IMAGE_CHARS)
      result = canvas.toDataURL("image/webp", 0.65);
    return safeImage(result);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
export async function assetData(url) {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error("A website asset could not be loaded. Please try again.");
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () =>
      reject(new Error("The asset could not be exported."));
    reader.readAsDataURL(blob);
  });
}
