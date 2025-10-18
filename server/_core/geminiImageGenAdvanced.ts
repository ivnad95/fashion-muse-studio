/**
 * Advanced Gemini Image Generation with Catalog Poses & Themes
 * Model: gemini-2.5-flash-image-preview
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Catalog of 24 professional fashion poses
export const CATALOG_POSES = [
  // Standing Poses (10)
  "Standing confidently with hands on hips, looking directly at the camera.",
  "A relaxed standing pose, one hand in a pocket, with a slight, natural smile.",
  "Three-quarter view, looking over the shoulder towards the camera.",
  "Full body shot, standing straight with feet slightly apart, arms relaxed at the sides.",
  "Leaning casually against an invisible wall, one leg crossed in front of the other.",
  "A dynamic walking pose, captured mid-stride as if walking towards the viewer.",
  "Hands clasped gently in front, with a soft and approachable expression.",
  "Profile view, standing straight and looking forward, highlighting the silhouette of the outfit.",
  "Adjusting a cuff or a collar, creating a natural, candid moment.",
  "A simple pose with one hand gently touching the chin or side of the face.",
  
  // Seated Poses (4)
  "Sitting elegantly on a simple stool or block, legs crossed, looking at the camera.",
  "A casual seated pose on the floor, knees bent, leaning back on one hand.",
  "Sitting on a low bench, leaning forward with elbows on knees, looking thoughtful.",
  "Profile view while seated, showcasing the drape and fit of the clothing from the side.",

  // Detail & Action Poses (10)
  "A close-up shot from the waist up, focusing on the details of the upper garment.",
  "A pose showing movement, like a gentle twirl to show the flow of a skirt or dress.",
  "A pose that highlights a specific feature, like putting a hand in a pocket to show its placement.",
  "Looking down at their shoes, as if admiring them, good for full outfit shots.",
  "A laughing, candid pose, looking slightly away from the camera.",
  "Arms crossed over the chest with a confident and strong stance.",
  "A 'contrapposto' pose, with weight shifted to one foot, creating a natural S-curve in the body.",
  "Reaching for something just out of frame, creating a sense of action.",
  "A simple, elegant pose with hands held behind the back.",
  "A dynamic pose as if just turning around to face the camera."
];

// Theme-specific instructions
export const THEME_INSTRUCTIONS = {
  studio: `**Scene & Lighting:** Place the model on a solid, seamless, neutral-colored studio background (e.g., light grey, off-white). The background must be simple and non-distracting. Use bright, even, and soft studio lighting. The lighting should be flattering and commercial, eliminating harsh shadows and clearly showing the clothing details.`,
  
  urban: `**Scene & Lighting:** Place the model in a realistic urban environment like a graffiti-covered alley, a modern city crosswalk at dusk, or against brutalist architecture. The lighting should be dynamic, with potential for neon glows or harsh sunlight creating long shadows. The overall mood should be edgy and cool.`,
  
  beach: `**Scene & Lighting:** Generate a scene with the model on a beautiful, sunny beach. The background should feature white sand, turquoise water, and possibly some distant palm trees. The lighting must be bright and natural, evoking a warm, relaxed, and joyful vacation vibe.`,
  
  vintage: `**Scene & Lighting:** Recreate the aesthetic of a vintage film photograph from the 1970s. Use warm, slightly faded colors with a subtle film grain. The lighting should be soft and nostalgic. The background could be a retro-styled interior or a sun-drenched outdoor scene. The pose should feel candid and timeless.`,
  
  business: `**New Outfit & Scene:** Transform the model's outfit into a sharp, modern, and professional business suit or attire. For men, a well-tailored dark suit, crisp shirt, and tie. For women, a stylish pantsuit, blazer with a blouse, or a sophisticated business dress. The clothing must look high-end. The background should be a modern office interior with soft, professional lighting.`,
  
  millionaire: `**New Outfit & Scene:** Dress the model in an outfit that signifies 'quiet luxury' and wealth. Use high-end designer styles, luxurious fabrics (cashmere, silk), and tasteful, expensive accessories (e.g., a classic luxury watch). Avoid garish logos. The setting should be opulent, like a luxury penthouse apartment, a private jet, or a modern villa with a pool. The mood is sophisticated and powerful.`,
  
  vip_star: `**New Outfit & Scene:** Style the model as a VIP star at an exclusive, high-fashion event. The outfit must be glamorous, trendy, and eye-catching—a designer cocktail dress, a custom-tailored jacket, or a chic, edgy ensemble. The background should be a dimly lit, exclusive lounge or a rooftop party at night with city lights.`,
  
  red_carpet: `**New Outfit & Scene:** Dress the model in a breathtaking, formal gown or a bespoke tuxedo suitable for a major awards ceremony like the Oscars. The outfit must be haute couture, elegant, and dramatic. The background must be a classic red carpet setting with the soft glow of paparazzi camera flashes in the distance, creating a prestigious atmosphere.`
};

// Themes that change the outfit
export const OUTFIT_CHANGING_THEMES = ['business', 'millionaire', 'vip_star', 'red_carpet'];

// Automatic negative prompt
export const NEGATIVE_PROMPT = "text, watermark, signature, logo, blurry, fuzzy, low-quality, out of focus, distorted, disfigured, ugly, bad anatomy, extra limbs, missing limbs, poorly drawn hands, poorly drawn feet, mutated hands, long neck, tiling, artifacts, jpeg artifacts, compression artifacts, error, duplicate, AI-generated, cartoon, illustration, painting, 3d render, cgi, video game, artstation, deviantart, oversmoothing, airbrushed skin, plastic skin, uncanny valley, synthetic appearance, unrealistic";

interface GenerateImageParams {
  imageBase64: string;
  mimeType: string;
  pose: string;
  aspectRatio: 'portrait' | 'landscape' | 'square';
  theme?: string;
}

export function buildAdvancedPrompt(params: {
  pose: string;
  aspectRatio: 'portrait' | 'landscape' | 'square';
  theme: string;
}): string {
  const { pose, aspectRatio, theme } = params;
  
  const aspectRatioDescription = {
    'portrait': 'portrait (taller than it is wide)',
    'square': 'square',
    'landscape': 'landscape (wider than it is tall)'
  }[aspectRatio] || 'portrait';
  
  const isOutfitChangingTheme = OUTFIT_CHANGING_THEMES.includes(theme);
  
  const fidelityInstruction = isOutfitChangingTheme 
    ? `**Identity Lock:** The model's face, identity, hair, and body type from the source image **must be perfectly replicated with 100% accuracy**. This is the most important rule. The clothing **must be completely replaced** by a new outfit according to the theme description below. Do not copy the original clothing.`
    : `**Identity & Clothing Lock:** The model's face, identity, hair, AND the exact clothing (including color, texture, and fit) from the source image **must be perfectly replicated with 100% accuracy**. Do not change the outfit.`;

  const selectedThemeInstruction = THEME_INSTRUCTIONS[theme as keyof typeof THEME_INSTRUCTIONS] || THEME_INSTRUCTIONS.studio;

  const negativePromptSection = NEGATIVE_PROMPT.trim() 
    ? `\n**5. Exclusions (Negative Prompt):** Do NOT include any of the following: ${NEGATIVE_PROMPT}.`
    : '';

  return `
**//-- ABSOLUTE MANDATE: PHOTOREALISM & IDENTITY PRESERVATION --//**
**Primary Objective:** Generate a single, ultra-realistic photograph. The output *must* be indistinguishable from a photo taken by a world-class portrait photographer using professional equipment. The most critical, non-negotiable rule is to perfectly preserve the facial identity of the person in the source image. Any deviation is a failure.

**//-- STRICT GENERATION DIRECTIVES --//**

**1. Fidelity (CRITICAL):**
    *   ${fidelityInstruction}
    *   **Skin Texture:** Render skin with natural, high-resolution texture. Avoid any airbrushed, plastic, or overly smooth appearance. Pores and subtle imperfections must be visible for realism.

**2. Photographic Emulation:**
    *   **Camera & Lens:** Emulate the output of a professional full-frame DSLR camera (e.g., Sony A7R IV) with a high-quality prime lens (e.g., 85mm f/1.4). This means sharp focus on the subject, natural depth of field (bokeh), and no digital artifacts.
    *   **Realism:** Absolutely NO digital art, illustration, 3D rendering, or "AI" aesthetic. The final image must look like a real-life photograph, not a digital creation.
    *   **No Defects:** Ensure there are no anatomical defects, distorted features, extra limbs, or poorly rendered hands/feet.

**3. Pose & Composition:**
    *   **New Pose:** The model's new pose is: "${pose}". The pose must look natural and appropriate for the theme.
    *   **Aspect Ratio:** The photo must have a ${aspectRatioDescription} aspect ratio.

**4. Scene & Style (Theme: ${theme}):**
    *   ${selectedThemeInstruction}

${negativePromptSection}

**//-- FINAL CHECK --//**
**Final Mandate:** Before outputting, verify: Is the person's face an exact match to the source? Does the image look like a genuine photograph? If not, regenerate.
  `.trim();
}

export async function generateImageWithAdvancedPrompt(params: GenerateImageParams): Promise<{
  success: boolean;
  imageBase64?: string;
  error?: string;
}> {
  try {
    const { imageBase64, mimeType, pose, aspectRatio, theme = 'studio' } = params;
    
    // Build the advanced prompt
    const prompt = buildAdvancedPrompt({ pose, aspectRatio, theme });
    
    console.log(`[Gemini Advanced] Generating image with theme: ${theme}, pose: ${pose.substring(0, 50)}...`);
    
    // Use gemini-2.5-flash-image model (official stable model)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-image"
    });
    
    // Prepare the parts
    const parts = [
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType
        }
      },
      {
        text: prompt
      }
    ];
    
    // Generate content with IMAGE response modality
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseModalities: ["IMAGE"]
      }
    });
    
    const response = await result.response;
    
    // Extract image from response
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            console.log(`[Gemini Advanced] Successfully generated image`);
            return {
              success: true,
              imageBase64: part.inlineData.data
            };
          }
        }
      }
    }
    
    throw new Error("No image data in response");
    
  } catch (error) {
    console.error("[Gemini Advanced] Generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// Helper to select random poses from catalog
export function selectRandomPoses(count: number): string[] {
  const shuffled = [...CATALOG_POSES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, CATALOG_POSES.length));
}

