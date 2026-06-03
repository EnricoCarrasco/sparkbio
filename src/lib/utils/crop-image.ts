/**
 * Crop an image using canvas given pixel coordinates from react-easy-crop.
 *
 * Downscales the crop to a bounded dimension and encodes it as a compressed
 * format (WebP by default). A full-resolution lossless PNG of a detailed image
 * easily exceeds the 2MB upload limit even when the *source* file was small,
 * which previously surfaced as a generic "Failed to upload photo" error. By
 * capping the dimension and using lossy WebP, the output stays well under the
 * limit for both avatars and hero images.
 */
export async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  opts?: { maxDim?: number; mimeType?: string; quality?: number }
): Promise<Blob> {
  const maxDim = opts?.maxDim ?? 1024;
  const mimeType = opts?.mimeType ?? "image/webp";
  const quality = opts?.quality ?? 0.85;

  const image = await loadImage(imageSrc);

  // Scale the cropped region down so its longest side is <= maxDim.
  const longest = Math.max(pixelCrop.width, pixelCrop.height);
  const scale = longest > maxDim ? maxDim / longest : 1;
  const outW = Math.max(1, Math.round(pixelCrop.width * scale));
  const outH = Math.max(1, Math.round(pixelCrop.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outW,
    outH
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob failed"));
      },
      mimeType,
      quality
    );
  });
}

/**
 * Pad any image onto a square transparent canvas so the cropper
 * always receives a uniform aspect ratio. Wide/tall images get centered.
 * Returns a blob URL of the square image.
 */
export async function normalizeToSquare(src: string): Promise<string> {
  const img = await loadImage(src);
  const size = Math.max(img.width, img.height);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, (size - img.width) / 2, (size - img.height) / 2);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(URL.createObjectURL(blob!)), "image/png");
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
