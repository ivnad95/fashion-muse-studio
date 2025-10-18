/**
 * Gemini Image Generation using gemini-2.5-flash-image-preview model
 * 
 * This implementation is based on a proven working backend that successfully
 * generates fashion photography while preserving facial features.
 */

interface GeminiImageOptions {
  imageBase64: string;
  mimeType: string;
  prompt: string;
  style?: string;
  cameraAngle?: string;
  lighting?: string;
}

interface GeminiImageResult {
  images: string[]; // Array of base64 encoded images
}

/**
 * Generate images using Gemini's gemini-2.5-flash-image-preview model
 * This is the EXACT implementation from the working code
 */
export async function generateImagesWithGemini(
  options: GeminiImageOptions
): Promise<GeminiImageResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  try {
    console.log("[Gemini] Starting image generation with gemini-2.5-flash-image-preview");
    console.log("[Gemini] Prompt:", options.prompt.substring(0, 100) + "...");

    // Build the request payload EXACTLY as in the working code
    const payload = {
      contents: [{
        parts: [
          { text: options.prompt },
          { inlineData: { mimeType: "image/png", data: options.imageBase64 } }
        ]
      }],
      generationConfig: { responseModalities: ['IMAGE'] },
    };

    console.log("[Gemini] Sending request to Gemini API...");
    
    // Use the EXACT model name from the working code
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log("[Gemini] Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[Gemini] API Error:", JSON.stringify(errorData, null, 2));
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    const result = await response.json();
    console.log("[Gemini] Response received");

    // Extract images EXACTLY as in the working code
    const candidate = result?.candidates?.[0];
    const imageData = candidate?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;
    
    if (imageData) {
      console.log(`[Gemini] Successfully generated image, size: ${imageData.length} bytes`);
      return { images: [imageData] };
    } else {
      const finishReason = candidate?.finishReason;
      const textResponse = candidate?.content?.parts?.find((p: any) => p.text)?.text;
      let errorMessage = "No image data in response.";
      if (finishReason && finishReason !== "STOP") {
        errorMessage = `Failed: ${finishReason}`;
      } else if (textResponse) {
        errorMessage = `API Error: ${textResponse}`;
      }
      console.error(`[Gemini] Error:`, errorMessage, result);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error("[Gemini] Image generation error:", error);
    throw new Error(`Failed to generate images with Gemini: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Build a detailed prompt for fashion photography based on user selections
 * This follows the same pattern as the working code but with fashion-specific variations
 */
export function buildFashionPrompt(options: {
  style?: string;
  cameraAngle?: string;
  lighting?: string;
}): string {
  const { style = "Editorial", cameraAngle = "Hero low angle", lighting = "Rembrandt" } = options;

  // Base instruction that preserves the person's appearance (from working code)
  let prompt = `Using the uploaded image as a perfect reference, generate a new, ultra-realistic professional fashion photoshoot image.
- IMPORTANT: Do NOT change the model's clothing or the background environment. They must remain exactly the same as in the original photo.
- The ONLY change should be the camera perspective, pose, and professional photography quality.
- Maintain the model's facial features and likeness EXACTLY.
- Style: The final image must be of the highest quality, like a shot for a luxury fashion magazine, with realistic textures and professional lighting.

`;

  // Add camera angle variation
  const angleDescriptions: Record<string, string> = {
    "Hero low angle": "a low-angle, full-body shot, with the model in a confident stance",
    "Eye level": "an eye-level shot, with the model looking directly at the camera",
    "High angle": "a high-angle shot looking down at the model, who is standing elegantly",
    "Dutch tilt": "a dynamic shot with a tilted camera angle, creating visual interest",
    "Over shoulder": "an over-the-shoulder shot, creating a sense of depth and looking towards the camera",
    "Profile side": "a profile view (side view) of the model, capturing their silhouette",
    "Three quarter": "a three-quarter angle shot showing both front and side of the model",
    "Bird eye": "a bird's eye view shot from directly above the model"
  };

  prompt += `New Camera View and Pose: ${angleDescriptions[cameraAngle] || angleDescriptions["Hero low angle"]}.\n\n`;

  // Add style-specific instructions
  const styleDescriptions: Record<string, string> = {
    Editorial: "High-end editorial fashion photography with sophisticated styling and clean background",
    Streetwear: "Urban streetwear fashion with contemporary street style aesthetics",
    Luxury: "Luxury high-fashion photography with opulent styling and dramatic lighting",
    Casual: "Casual lifestyle fashion with relaxed natural styling",
    Vintage: "Vintage-inspired fashion with classic retro styling and warm tones",
    Avant: "Avant-garde fashion with bold experimental styling"
  };

  prompt += `Photography Style: ${styleDescriptions[style] || styleDescriptions["Editorial"]}.\n\n`;

  // Add lighting instructions
  const lightingDescriptions: Record<string, string> = {
    Rembrandt: "Use Rembrandt lighting with a characteristic triangle of light on the cheek",
    Butterfly: "Use butterfly lighting with the main light directly in front and above",
    Loop: "Use loop lighting with a small shadow of the nose on the cheek",
    Split: "Use split lighting illuminating only half the face",
    Rim: "Use rim lighting from behind to create a glowing edge around the subject",
    Natural: "Use soft natural window lighting for an authentic look"
  };

  prompt += `Lighting: ${lightingDescriptions[lighting] || lightingDescriptions["Rembrandt"]}.`;

  return prompt;
}

