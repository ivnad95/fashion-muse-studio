/**
 * FLUX Image Generation using BFL API
 * Docs: https://docs.bfl.ai
 */

export interface FluxImageGenerationOptions {
  prompt: string;
  width?: number;
  height?: number;
  numImages?: number;
}

export interface FluxImageGenerationResult {
  images: string[]; // URLs to generated images
}

/**
 * Generate images using FLUX API
 */
export async function generateImagesWithFlux(
  options: FluxImageGenerationOptions
): Promise<FluxImageGenerationResult> {
  const apiKey = process.env.BFL_API_KEY;
  if (!apiKey) {
    throw new Error("BFL_API_KEY environment variable is not set");
  }

  try {
    const numImages = options.numImages || 1;
    const images: string[] = [];

    // Generate images sequentially
    for (let i = 0; i < numImages; i++) {
      // Step 1: Create generation request
      const createResponse = await fetch("https://api.bfl.ai/v1/flux-pro-1.1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-key": apiKey,
        },
        body: JSON.stringify({
          prompt: options.prompt,
          width: options.width || 768,
          height: options.height || 1024,
        }),
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error(`FLUX API error (create):`, errorText);
        throw new Error(`FLUX API error: ${createResponse.status} ${errorText}`);
      }

      const createData = await createResponse.json();
      const requestId = createData.id;

      // Step 2: Poll for result
      let imageUrl: string | null = null;
      const maxAttempts = 60; // 60 attempts * 2 seconds = 2 minutes max
      
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

        const resultResponse = await fetch(`https://api.bfl.ai/v1/get_result?id=${requestId}`, {
          headers: {
            "x-key": apiKey,
          },
        });

        if (!resultResponse.ok) {
          console.error(`FLUX API error (get_result): ${resultResponse.status}`);
          continue;
        }

        const resultData = await resultResponse.json();
        
        if (resultData.status === "Ready" && resultData.result?.sample) {
          imageUrl = resultData.result.sample;
          break;
        } else if (resultData.status === "Error") {
          throw new Error(`FLUX generation failed: ${resultData.error || "Unknown error"}`);
        }
        
        // Status is still "Pending", continue polling
      }

      if (imageUrl) {
        images.push(imageUrl);
      } else {
        throw new Error(`FLUX generation timed out for image ${i + 1}`);
      }
    }

    return { images };
  } catch (error) {
    console.error("FLUX image generation error:", error);
    throw new Error(`Failed to generate images with FLUX: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

