/**
 * Gemini Image Editing using gemini-2.5-flash-image model
 * Docs: https://ai.google.dev/gemini-api/docs/image-generation#gemini-image-editing
 * 
 * This uses the Gemini image editing model to generate images from text+image prompts,
 * preserving the person's facial features while transforming the styling.
 */

export interface GeminiImageGenerationOptions {
  prompt: string;
  referenceImageBase64: string; // Base64 encoded reference image
  numberOfImages?: number;
  style?: string;
  cameraAngle?: string;
  lighting?: string;
}

export interface GeminiImageGenerationResult {
  images: string[]; // Base64 encoded images
}

/**
 * Build a detailed fashion photography prompt that preserves identity
 */
function buildFashionPrompt(
  basePrompt: string,
  style?: string,
  cameraAngle?: string,
  lighting?: string
): string {
  let prompt = `Create a professional fashion photography image of this person. Transform them into a fashion model while keeping their face, facial features, and identity EXACTLY the same. Preserve their eyes, nose, mouth, skin tone, and overall facial appearance. Only change the clothing, styling, background, and photography aesthetics. `;
  
  prompt += basePrompt;
  
  // Add style details
  if (style) {
    prompt += ` Create this in ${style} fashion photography style`;
  }
  
  // Add camera angle
  if (cameraAngle) {
    prompt += `, shot from ${cameraAngle} camera angle`;
  }
  
  // Add lighting
  if (lighting) {
    prompt += `, with ${lighting} lighting setup`;
  }
  
  // Add professional photography details
  prompt += `. Professional high-end fashion editorial photography, sharp focus on face and details, photorealistic, studio quality, magazine cover worthy, elegant composition, sophisticated styling, 8k resolution, shot on Hasselblad medium format camera. The person's face must remain identical to the reference image.`;
  
  return prompt;
}

/**
 * Generate fashion images using Gemini's image editing model
 * Uses gemini-2.5-flash-image for image generation with reference image
 */
export async function generateImagesWithGemini(
  options: GeminiImageGenerationOptions
): Promise<GeminiImageGenerationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  try {
    const numberOfImages = options.numberOfImages || 1;
    const images: string[] = [];

    // Build the enhanced prompt
    const enhancedPrompt = buildFashionPrompt(
      options.prompt,
      options.style,
      options.cameraAngle,
      options.lighting
    );

    // Generate images using Gemini image editing model
    for (let i = 0; i < numberOfImages; i++) {
      // Construct the request body with text prompt and reference image
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: enhancedPrompt,
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: options.referenceImageBase64,
                },
              },
            ],
          },
        ],
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API error:`, errorText);
        throw new Error(`Gemini API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      // Extract image from response
      if (data.candidates && data.candidates.length > 0) {
        const candidate = data.candidates[0];
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            // Look for inline_data containing the generated image
            if (part.inline_data && part.inline_data.data) {
              images.push(part.inline_data.data);
              break;
            }
          }
        }
      }
      
      if (images.length <= i) {
        throw new Error("No image data in Gemini response");
      }
    }

    return { images };
  } catch (error) {
    console.error("Gemini image generation error:", error);
    throw new Error(`Failed to generate images with Gemini: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Convert base64 image to data URL
 */
export function base64ToDataUrl(base64: string, mimeType: string = "image/png"): string {
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Convert data URL to base64
 */
export function dataUrlToBase64(dataUrl: string): string {
  if (dataUrl.startsWith('data:')) {
    return dataUrl.split(',')[1];
  }
  return dataUrl;
}

/**
 * Build enhanced fashion prompt with style parameters
 */
export function buildEnhancedFashionPrompt(
  basePrompt: string,
  style?: string,
  cameraAngle?: string,
  lighting?: string
): string {
  return buildFashionPrompt(basePrompt, style, cameraAngle, lighting);
}

