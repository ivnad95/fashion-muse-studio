/**
 * Gemini Image Editing using gemini-2.5-flash-image model
 * Docs: https://ai.google.dev/gemini-api/docs/image-generation#gemini-image-editing
 * 
 * Transforms regular images into realistic, professional photographs
 * while preserving the person's real face, expression, and clothing.
 * Never stylizes, animates, or artificially alters the person.
 */

export interface GeminiImageGenerationOptions {
  prompt: string;
  referenceImageBase64: string;
  numberOfImages?: number;
  style?: string;
  cameraAngle?: string;
  lighting?: string;
}

export interface GeminiImageGenerationResult {
  images: string[];
}

/**
 * Style-specific prompts that preserve identity while enhancing quality
 */
const STYLE_PROMPTS: Record<string, string> = {
  Editorial: "High-end fashion editorial photograph with professional studio lighting, clean minimalist background, sharp focus, magazine-quality composition, natural pose, sophisticated atmosphere, Vogue-style editorial quality",
  Commercial: "Professional commercial photography shot with bright even lighting, clean white or neutral background, product-focused composition, catalog-ready quality, approachable and friendly atmosphere",
  Artistic: "Artistic portrait photograph with creative lighting, shadows and highlights, textured or gradient background, dramatic composition, fine art photography quality, emotional depth",
  Casual: "Natural lifestyle photograph with soft natural lighting, outdoor or home environment background, candid feel, relaxed composition, authentic everyday photography style",
  Glamour: "Glamorous beauty photograph with soft diffused lighting and glow, elegant background, polished composition, high-end beauty photography quality, sophisticated and luxurious feel",
  Vintage: "Vintage-style photograph with warm film-like tones, classic photography lighting, timeless background, nostalgic composition, retro photography aesthetic from 1960s-1980s era",
};

/**
 * Camera angle prompts for professional composition
 */
const CAMERA_ANGLE_PROMPTS: Record<string, string> = {
  "Eye Level": "shot at eye level with straight-on perspective, direct connection with viewer, balanced composition, standard portrait framing, professional headshot angle",
  "High Angle": "shot from above looking down, camera positioned higher than subject, flattering downward angle, elongating effect, editorial fashion angle that creates elegance",
  "Low Angle": "shot from below looking up, camera positioned lower than subject, powerful perspective, dramatic upward angle that creates confidence and authority, fashion runway style",
  "Dutch Angle": "shot with tilted camera angle, dynamic diagonal composition, creative perspective that adds energy and movement, artistic editorial style, modern fashion photography",
  "Over Shoulder": "shot from behind and to the side with over-the-shoulder perspective, creates depth, storytelling angle, editorial narrative style that adds context and dimension",
  "Three Quarter": "shot at 45-degree angle with three-quarter view, classic portrait angle that shows depth and dimension, most flattering perspective, professional photography standard",
  Profile: "shot from the side with full profile view, silhouette emphasis, artistic composition that highlights facial features, classic portrait style, elegant and timeless",
  "Close Up": "tight framing on face and upper body, intimate perspective with detailed view, beauty photography style that emphasizes facial features and expression, magazine cover quality",
};

/**
 * Lighting setup prompts for professional illumination
 */
const LIGHTING_PROMPTS: Record<string, string> = {
  "Natural Light": "lit with soft natural window light, gentle shadows, authentic daylight quality, no artificial lighting, organic feel, golden hour warmth, photojournalistic style",
  "Studio Light": "lit with professional studio lighting setup including key light and fill light, controlled shadows, even illumination, commercial photography quality, clean and polished look",
  "Dramatic Light": "lit with high-contrast dramatic lighting, strong shadows and highlights, chiaroscuro effect, moody atmosphere, artistic photography style that creates depth and emotion",
  "Soft Light": "lit with diffused soft lighting, minimal shadows, flattering illumination, beauty photography quality, gentle and even light that creates smooth and polished look",
  Backlight: "lit from behind with rim lighting effect, glowing edges, silhouette elements, creates separation from background, editorial fashion style that adds dimension and drama",
  "Golden Hour": "lit with warm golden hour sunlight, soft directional light, warm color temperature, natural outdoor quality, romantic atmosphere, sunset or sunrise photography style",
};

/**
 * Build a detailed realistic photography prompt
 */
function buildRealisticPrompt(
  basePrompt: string,
  style?: string,
  cameraAngle?: string,
  lighting?: string
): string {
  // Core instruction to preserve identity
  let prompt = `Transform this into a professional photograph while keeping the person's face, expression, and clothing EXACTLY as they are in the original image. Never stylize, animate, or artificially alter the person. Only enhance the photography quality, lighting, and background.\n\n`;
  
  // Add user's base prompt
  if (basePrompt && basePrompt.trim()) {
    prompt += `User Request: ${basePrompt}\n\n`;
  }
  
  // Add style details
  if (style && STYLE_PROMPTS[style]) {
    prompt += `Photography Style: ${STYLE_PROMPTS[style]}.\n\n`;
  }
  
  // Add camera angle
  if (cameraAngle && CAMERA_ANGLE_PROMPTS[cameraAngle]) {
    prompt += `Camera Angle: ${CAMERA_ANGLE_PROMPTS[cameraAngle]}.\n\n`;
  }
  
  // Add lighting
  if (lighting && LIGHTING_PROMPTS[lighting]) {
    prompt += `Lighting Setup: ${LIGHTING_PROMPTS[lighting]}.\n\n`;
  }
  
  // Add professional photography requirements
  prompt += `Technical Requirements: Photorealistic result, studio-quality professional photography, 8k resolution, shot on Hasselblad medium format camera, natural and authentic appearance, preserves all original facial features, expression, and clothing. The person must look exactly the same, only the photo quality, lighting, and background are enhanced to professional standards.`;
  
  return prompt;
}

/**
 * Generate realistic professional photographs using Gemini
 */
export async function generateImagesWithGemini(
  options: GeminiImageGenerationOptions
): Promise<GeminiImageGenerationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set. Get your API key at https://aistudio.google.com/app/apikey");
  }

  try {
    const numberOfImages = options.numberOfImages || 1;
    const images: string[] = [];

    // Build the realistic photography prompt
    const enhancedPrompt = buildRealisticPrompt(
      options.prompt,
      options.style,
      options.cameraAngle,
      options.lighting
    );

    console.log("Gemini Prompt:", enhancedPrompt);

    // Generate images using Gemini image editing model
    for (let i = 0; i < numberOfImages; i++) {
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
        console.error(`Gemini API error (${response.status} ${response.statusText}):`, errorText);
        throw new Error(`Gemini API error: ${response.status} ${errorText}`);
      }

      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse Gemini API response as JSON:", parseError);
        throw new Error("Invalid JSON response from Gemini API");
      }
      
      // Extract image from response
      if (data.candidates && data.candidates.length > 0) {
        const candidate = data.candidates[0];
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inline_data && part.inline_data.data) {
              images.push(part.inline_data.data);
              break;
            }
          }
        }
      }
      
      if (images.length <= i) {
        console.error("No image data in Gemini response:", JSON.stringify(data, null, 2));
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

