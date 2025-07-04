import type { ImageCropModel } from "~/server/delivery-api";

type FocalPoint = {
  left: number;
  top: number;
};

export default function buildCropUrl(
  baseImageUrl: string,
  crop: ImageCropModel | undefined,
  imageWidth: number | null = 0,
  focalPoint?: FocalPoint
): string {
  // Determine width and height values from imageWidth or crop dimensions.
  const width = imageWidth && imageWidth > 0 ? imageWidth : crop?.width ?? 0;
  const height = crop?.height ?? 0;

  const customParams: string[] = [];

  if (crop?.coordinates) {
    // Use fixed crop coordinates (pixel-based cropping)
    const { x1, y1, x2, y2 } = crop.coordinates;
    const cc = `${x1.toFixed(4)},${y1.toFixed(4)},${x2.toFixed(4)},${y2.toFixed(4)}`;
    customParams.push(`cc=${cc}`);
  } else if (focalPoint && width && height) {
    // Use focal point to calculate a centered crop box (percentage-based)
    const aspectRatio = width / height;

    // Choose a sensible width in percentage (e.g. 60%)
    const cropWidth = 0.6;
    const cropHeight = cropWidth / aspectRatio;

    // Center crop around the focal point
    let left = focalPoint.left - cropWidth / 2;
    let top = focalPoint.top - cropHeight / 2;

    // Clamp to 0-1
    left = Math.max(0, Math.min(1 - cropWidth, left));
    top = Math.max(0, Math.min(1 - cropHeight, top));

    const right = left + cropWidth;
    const bottom = top + cropHeight;

    const cropParam = `${left.toFixed(4)},${top.toFixed(4)},${right.toFixed(4)},${bottom.toFixed(4)}`;
    customParams.push(`crop=${cropParam}`, `cropmode=percentage`);
  }

  if (width) customParams.push(`width=${width}`);
  if (height) customParams.push(`height=${height}`);

  customParams.push("quality=80", "format=webp");
  
  return `${baseImageUrl}?${customParams.join("&")}`;
}
