"use server";

import sharp from "sharp";
import { faviconSizes } from "../utils/faviconSizes";
import ico from "png-to-ico";

export async function processImage(formData: FormData) {
  try {
    const imageFile = formData.get("image") as File;
    const format = formData.get("format") as string;
    const generateFavicon = formData.get("generateFavicon") as string;

    if (!imageFile) {
      return { success: false, error: "No image file provided" };
    }

    const buffer = Buffer.from(await imageFile.arrayBuffer());

    if (generateFavicon === "true") {
      const faviconBuffer = await generateFaviconIco(buffer);
      return {
        success: true,
        processedImage: faviconBuffer.toString("base64"),
      };
    } else {
      const processedImage = await sharp(buffer)
        .toFormat(format as keyof sharp.FormatEnum)
        .toBuffer();

      return {
        success: true,
        processedImage: processedImage.toString("base64"),
      };
    }
  } catch (error) {
    console.error("Error processing image:", error);
    return { success: false, error: "Error processing image" };
  }
}

async function generateFaviconIco(inputBuffer: Buffer): Promise<Buffer> {
  const sizes = faviconSizes;

  const resizedImages = await Promise.all(
    sizes.map((size) =>
      sharp(inputBuffer).resize(size, size).toFormat("png").toBuffer()
    )
  );

  const icoBuffer = await ico(resizedImages);
  return icoBuffer;
}
