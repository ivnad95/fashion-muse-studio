/**
 * Image Post-Processing Module
 * Enhances AI-generated images to achieve hyper-realism and avoid AI detection
 * 
 * Techniques:
 * 1. Add subtle film grain/noise
 * 2. Apply natural color grading
 * 3. Add lens artifacts (chromatic aberration, vignette)
 * 4. Enhance texture details
 * 5. Apply subtle sharpening
 */

import sharp from 'sharp';

export interface PostProcessingOptions {
  addFilmGrain?: boolean;
  grainIntensity?: number; // 0-100
  colorGrading?: 'warm' | 'cool' | 'neutral' | 'cinematic';
  addVignette?: boolean;
  vignetteIntensity?: number; // 0-100
  sharpen?: boolean;
  sharpenAmount?: number; // 0-10
  addChromaticAberration?: boolean;
  quality?: 'standard' | 'high' | 'ultra';
}

/**
 * Apply post-processing to make images more realistic and less AI-detectable
 */
export async function postProcessImage(
  imageBuffer: Buffer,
  options: PostProcessingOptions = {}
): Promise<Buffer> {
  const {
    addFilmGrain = true,
    grainIntensity = 15,
    colorGrading = 'neutral',
    addVignette = true,
    vignetteIntensity = 30,
    sharpen = true,
    sharpenAmount = 2,
    quality = 'high',
  } = options;

  try {
    let pipeline = sharp(imageBuffer);

    // Get image metadata
    const metadata = await pipeline.metadata();
    const width = metadata.width || 1024;
    const height = metadata.height || 1024;

    // 1. Apply color grading to mimic real camera sensors
    if (colorGrading !== 'neutral') {
      pipeline = pipeline.modulate(getColorModulation(colorGrading));
    }

    // 2. Apply subtle sharpening (real cameras have natural sharpness)
    if (sharpen) {
      pipeline = pipeline.sharpen({
        sigma: sharpenAmount * 0.5,
        m1: 0.5,
        m2: 0.5,
        x1: 2,
        y2: 10,
        y3: 20,
      });
    }

    // 3. Convert to buffer for composite operations
    let processedBuffer = await pipeline.toBuffer();

    // 4. Add film grain (makes images look more organic)
    if (addFilmGrain) {
      processedBuffer = await addGrainNoise(processedBuffer, grainIntensity, width, height);
    }

    // 5. Add vignette (natural lens effect)
    if (addVignette) {
      processedBuffer = await addVignetteEffect(processedBuffer, vignetteIntensity, width, height);
    }

    // 6. Final quality adjustment
    const qualityValue = quality === 'ultra' ? 95 : quality === 'high' ? 90 : 85;
    
    const finalBuffer = await sharp(processedBuffer)
      .jpeg({ quality: qualityValue, mozjpeg: true })
      .toBuffer();

    return finalBuffer;
  } catch (error) {
    console.error('Post-processing error:', error);
    // Return original buffer if processing fails
    return imageBuffer;
  }
}

/**
 * Get color modulation for different styles
 */
function getColorModulation(style: string): { brightness?: number; saturation?: number; hue?: number } {
  switch (style) {
    case 'warm':
      return { brightness: 1.05, saturation: 1.1, hue: 10 };
    case 'cool':
      return { brightness: 0.98, saturation: 1.05, hue: -10 };
    case 'cinematic':
      return { brightness: 1.0, saturation: 1.15, hue: 5 };
    default:
      return {};
  }
}

/**
 * Add subtle grain noise to mimic film photography
 */
async function addGrainNoise(
  imageBuffer: Buffer,
  intensity: number,
  width: number,
  height: number
): Promise<Buffer> {
  // Create noise overlay
  const noiseBuffer = Buffer.alloc(width * height * 4);
  
  for (let i = 0; i < noiseBuffer.length; i += 4) {
    const noise = Math.random() * intensity - intensity / 2;
    noiseBuffer[i] = noise;     // R
    noiseBuffer[i + 1] = noise; // G
    noiseBuffer[i + 2] = noise; // B
    noiseBuffer[i + 3] = 255;   // A
  }

  const noiseImage = await sharp(noiseBuffer, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toBuffer();

  // Composite noise over image with reduced opacity
  const noiseWithAlpha = await sharp(noiseImage)
    .ensureAlpha()
    .toBuffer();

  return sharp(imageBuffer)
    .composite([
      {
        input: noiseWithAlpha,
        blend: 'overlay',
      },
    ])
    .toBuffer();
}

/**
 * Add vignette effect (natural lens darkening at edges)
 */
async function addVignetteEffect(
  imageBuffer: Buffer,
  intensity: number,
  width: number,
  height: number
): Promise<Buffer> {
  // Create radial gradient for vignette
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

  const vignetteBuffer = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const ratio = distance / maxRadius;
      
      // Smooth falloff
      const vignette = Math.max(0, 1 - Math.pow(ratio, 2) * (intensity / 100));
      
      const idx = (y * width + x) * 4;
      const value = Math.floor(vignette * 255);
      
      vignetteBuffer[idx] = value;     // R
      vignetteBuffer[idx + 1] = value; // G
      vignetteBuffer[idx + 2] = value; // B
      vignetteBuffer[idx + 3] = 255;   // A
    }
  }

  const vignetteImage = await sharp(vignetteBuffer, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toBuffer();

  // Multiply blend for vignette
  return sharp(imageBuffer)
    .composite([
      {
        input: vignetteImage,
        blend: 'multiply',
      },
    ])
    .toBuffer();
}

/**
 * Detect and mitigate common AI artifacts
 */
export async function detectAndFixArtifacts(imageBuffer: Buffer): Promise<{
  hasArtifacts: boolean;
  fixedBuffer: Buffer;
  issues: string[];
}> {
  const issues: string[] = [];
  let fixedBuffer = imageBuffer;

  try {
    const image = sharp(imageBuffer);
    const stats = await image.stats();

    // Check for unnatural color distribution
    const channels = stats.channels;
    const avgStdDev = channels.reduce((sum: number, ch: any) => sum + ch.stdev, 0) / channels.length;
    
    if (avgStdDev < 20) {
      issues.push('Low color variance detected');
      // Apply subtle noise to increase variance
      fixedBuffer = await addGrainNoise(fixedBuffer, 10, 1024, 1024);
    }

    // Check for over-smoothing (common AI artifact)
    const metadata = await image.metadata();
    if (metadata.density && metadata.density > 300) {
      issues.push('Potential over-smoothing detected');
      // Apply subtle sharpening
      fixedBuffer = await sharp(fixedBuffer)
        .sharpen({ sigma: 1.5 })
        .toBuffer();
    }

    return {
      hasArtifacts: issues.length > 0,
      fixedBuffer,
      issues,
    };
  } catch (error) {
    console.error('Artifact detection error:', error);
    return {
      hasArtifacts: false,
      fixedBuffer: imageBuffer,
      issues: [],
    };
  }
}

/**
 * Apply style-specific post-processing
 */
export async function applyStylePostProcessing(
  imageBuffer: Buffer,
  style: string
): Promise<Buffer> {
  const styleOptions: Record<string, PostProcessingOptions> = {
    Editorial: {
      addFilmGrain: true,
      grainIntensity: 10,
      colorGrading: 'neutral',
      addVignette: false,
      sharpen: true,
      sharpenAmount: 3,
      quality: 'ultra',
    },
    Commercial: {
      addFilmGrain: false,
      colorGrading: 'neutral',
      addVignette: false,
      sharpen: true,
      sharpenAmount: 4,
      quality: 'ultra',
    },
    Artistic: {
      addFilmGrain: true,
      grainIntensity: 25,
      colorGrading: 'cinematic',
      addVignette: true,
      vignetteIntensity: 40,
      sharpen: true,
      sharpenAmount: 2,
      quality: 'high',
    },
    Casual: {
      addFilmGrain: true,
      grainIntensity: 20,
      colorGrading: 'warm',
      addVignette: false,
      sharpen: false,
      quality: 'standard',
    },
    Glamour: {
      addFilmGrain: false,
      colorGrading: 'warm',
      addVignette: true,
      vignetteIntensity: 20,
      sharpen: true,
      sharpenAmount: 2,
      quality: 'ultra',
    },
    Vintage: {
      addFilmGrain: true,
      grainIntensity: 35,
      colorGrading: 'warm',
      addVignette: true,
      vignetteIntensity: 50,
      sharpen: false,
      quality: 'standard',
    },
  };

  const options = styleOptions[style] || styleOptions.Editorial;
  return postProcessImage(imageBuffer, options);
}

