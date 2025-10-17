/**
 * Image generation helper using internal ImageService
 *
 * Example usage:
 *   const { url: imageUrl } = await generateImage({
 *     prompt: "A serene landscape with mountains"
 *   });
 *
 * For editing:
 *   const { url: imageUrl } = await generateImage({
 *     prompt: "Add a rainbow to this landscape",
 *     originalImages: [{
 *       url: "https://example.com/original.jpg",
 *       mimeType: "image/jpeg"
 *     }]
 *   });
 */
import { storagePut } from "server/storage";
import { ENV } from "./env";

export type GenerateImageOptions = {
  prompt: string;
  originalImages?: Array<{
    url?: string;
    b64Json?: string;
    mimeType?: string;
  }>;
};

export type GenerateImageResponse = {
  url?: string;
};

export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerateImageResponse> {
  if (!ENV.forgeApiUrl) {
    throw new Error("BUILT_IN_FORGE_API_URL is not configured");
  }
  if (!ENV.forgeApiKey) {
    throw new Error("BUILT_IN_FORGE_API_KEY is not configured");
  }

  // Build the full URL by appending the service path to the base URL
  const baseUrl = ENV.forgeApiUrl.endsWith("/")
    ? ENV.forgeApiUrl
    : `${ENV.forgeApiUrl}/`;
  const fullUrl = new URL(
    "images.v1.ImageService/GenerateImage",
    baseUrl
  ).toString();

  // Prepare original images array - normalize field names for API
  const originalImages = (options.originalImages || []).map(img => ({
    url: img.url,
    b64_json: img.b64Json,
    mime_type: img.mimeType,
  }));

  const response = await fetch(fullUrl, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "connect-protocol-version": "1",
      authorization: `Bearer ${ENV.forgeApiKey}`,
    },
    body: JSON.stringify({
      prompt: options.prompt,
      original_images: originalImages,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error(`Image generation API error: ${response.status} ${response.statusText}`, detail);
    throw new Error(
      `Image generation request failed (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
    );
  }

  let result: any;
  try {
    result = await response.json();
  } catch (error) {
    console.error("Failed to parse API response as JSON:", error);
    throw new Error("Invalid JSON response from image generation API");
  }
  
  // Validate response structure
  if (!result || !result.image) {
    console.error("Invalid API response structure:", JSON.stringify(result));
    throw new Error("Invalid response structure from image generation API");
  }
  
  const imageData = result.image as {
    b64Json?: string;
    b64_json?: string;
    mimeType?: string;
    mime_type?: string;
  };
  
  // Support both camelCase and snake_case field names
  const base64Data = imageData.b64Json || imageData.b64_json;
  const mimeType = imageData.mimeType || imageData.mime_type || "image/png";
  
  if (!base64Data) {
    throw new Error("No image data in API response");
  }
  
  const buffer = Buffer.from(base64Data, "base64");
  
  // Get appropriate file extension from mime type
  const extension = getFileExtensionFromMimeType(mimeType);

  // Save to S3
  const { url } = await storagePut(
    `generated/${Date.now()}${extension}`,
    buffer,
    mimeType
  );
  return {
    url,
  };
}

/**
 * Get file extension from MIME type
 */
function getFileExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };
  return mimeToExt[mimeType.toLowerCase()] || ".png";
}
