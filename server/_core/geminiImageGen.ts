/**
 * Gemini Image Generation using gemini-2.5-flash-image model
 * 
 * This module provides image editing capabilities using Gemini's image generation model.
 * It transforms existing images based on text prompts while preserving facial features.
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
 * Generate images using Gemini's gemini-2.5-flash-image model
 * This model supports image editing - transforming an existing image based on a text prompt
 */
export async function generateImagesWithGemini(
  options: GeminiImageOptions
): Promise<GeminiImageResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  try {
    console.log("[Gemini] Starting image generation with gemini-2.5-flash-image");
    console.log("[Gemini] Prompt:", options.prompt.substring(0, 100) + "...");
    console.log("[Gemini] Image size:", options.imageBase64.length, "bytes (base64)");

    // Build the request body according to Gemini API format
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: options.prompt,
            },
            {
              inline_data: {
                mime_type: options.mimeType,
                data: options.imageBase64,
              },
            },
          ],
        },
      ],
    };

    console.log("[Gemini] Sending request to Gemini API...");
    
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

    console.log("[Gemini] Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[Gemini] API Error:", JSON.stringify(errorData, null, 2));
      throw new Error(`Gemini API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log("[Gemini] Response received");

    // Extract images from response
    const images: string[] = [];
    
    if (data.candidates && data.candidates.length > 0) {
      for (const candidate of data.candidates) {
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inline_data && part.inline_data.data) {
              console.log("[Gemini] Found image in response, size:", part.inline_data.data.length);
              images.push(part.inline_data.data);
            }
            if (part.text) {
              console.log("[Gemini] Text response:", part.text);
            }
          }
        }
      }
    }

    if (images.length === 0) {
      console.error("[Gemini] No images found in response:", JSON.stringify(data, null, 2));
      throw new Error("No image data in Gemini response");
    }

    console.log(`[Gemini] Successfully generated ${images.length} image(s)`);
    return { images };
  } catch (error) {
    console.error("[Gemini] Image generation error:", error);
    throw new Error(`Failed to generate images with Gemini: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Build a detailed prompt for fashion photography based on user selections
 */
export function buildFashionPrompt(options: {
  style?: string;
  cameraAngle?: string;
  lighting?: string;
}): string {
  const { style = "Editorial", cameraAngle = "Hero low angle", lighting = "Rembrandt" } = options;

  // Base instruction that MUST preserve the person's appearance
  let prompt = `Transform this photo into a professional fashion photograph. 

CRITICAL REQUIREMENTS:
- Keep the person's face, facial features, expression, and skin tone EXACTLY as shown in the original image
- Preserve their natural appearance, do not alter or stylize their face
- Maintain their clothing and overall look
- Only enhance the photography quality, lighting, and background

`;

  // Add style-specific instructions
  const stylePrompts: Record<string, string> = {
    Editorial: "Create a high-end editorial fashion photograph with sophisticated styling, professional studio lighting, and a clean minimalist background. The image should look like it belongs in Vogue or Harper's Bazaar magazine.",
    Streetwear: "Transform into an urban streetwear fashion photograph with contemporary street style aesthetics, natural outdoor lighting, and an authentic city environment background.",
    Luxury: "Create a luxury high-fashion photograph with opulent styling, dramatic professional lighting, and an elegant sophisticated background befitting luxury brands like Chanel or Dior.",
    Casual: "Transform into a casual lifestyle fashion photograph with relaxed natural styling, soft natural lighting, and a comfortable everyday environment background.",
    Vintage: "Create a vintage-inspired fashion photograph with classic retro styling, warm nostalgic lighting, and a timeless period-appropriate background.",
    Avant: "Transform into an avant-garde fashion photograph with bold experimental styling, dramatic artistic lighting, and a creative conceptual background."
  };

  prompt += stylePrompts[style] || stylePrompts["Editorial"];
  prompt += "\n\n";

  // Add camera angle instructions
  const anglePrompts: Record<string, string> = {
    "Hero low angle": "Shot from a low camera angle looking slightly upward, creating a powerful heroic perspective.",
    "Eye level": "Shot at eye level with the camera directly facing the subject at their eye height.",
    "High angle": "Shot from above looking down at the subject, creating an elegant overhead perspective.",
    "Dutch tilt": "Shot with a deliberately tilted camera angle for dynamic visual interest.",
    "Over shoulder": "Shot from behind and over the shoulder, creating depth and narrative interest.",
    "Profile side": "Shot from the side capturing the subject's profile.",
    "Three quarter": "Shot at a three-quarter angle showing both front and side of the subject.",
    "Bird eye": "Shot from directly above in a bird's eye view perspective."
  };

  prompt += anglePrompts[cameraAngle] || anglePrompts["Hero low angle"];
  prompt += "\n\n";

  // Add lighting instructions
  const lightingPrompts: Record<string, string> = {
    Rembrandt: "Use Rembrandt lighting with a characteristic triangle of light on the cheek, creating dramatic depth and dimension.",
    Butterfly: "Use butterfly lighting with the main light directly in front and above, creating a butterfly-shaped shadow under the nose.",
    Loop: "Use loop lighting with a small shadow of the nose on the cheek, creating a flattering natural look.",
    Split: "Use split lighting illuminating only half the face, creating dramatic contrast and mood.",
    Rim: "Use rim lighting from behind to create a glowing edge around the subject, separating them from the background.",
    Natural: "Use soft natural window lighting for an authentic, flattering, and timeless look."
  };

  prompt += lightingPrompts[lighting] || lightingPrompts["Rembrandt"];
  prompt += "\n\n";

  // Final quality instructions
  prompt += `
Technical specifications:
- Professional photography quality with sharp focus
- Realistic skin tones and textures
- Natural color grading appropriate for fashion photography
- High resolution and professional composition
- Studio-quality result that looks authentic and not AI-generated

Remember: The person's face and appearance must remain exactly as in the original image.`;

  return prompt;
}

