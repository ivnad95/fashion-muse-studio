/**
 * Image Quality Assurance Module
 * Validates generated images for realism and quality
 */

import sharp from 'sharp';

export interface QualityMetrics {
  score: number; // 0-100
  passed: boolean;
  issues: string[];
  recommendations: string[];
  metrics: {
    sharpness: number;
    colorVariance: number;
    contrast: number;
    brightness: number;
    saturation: number;
  };
}

/**
 * Analyze image quality and realism
 */
export async function analyzeImageQuality(imageBuffer: Buffer): Promise<QualityMetrics> {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  try {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const stats = await image.stats();

    // Calculate metrics
    const sharpness = await calculateSharpness(image);
    const colorVariance = calculateColorVariance(stats);
    const contrast = calculateContrast(stats);
    const brightness = calculateBrightness(stats);
    const saturation = calculateSaturation(stats);

    // Check resolution
    if (metadata.width && metadata.height) {
      const totalPixels = metadata.width * metadata.height;
      if (totalPixels < 1024 * 1024) {
        issues.push('Low resolution detected');
        recommendations.push('Increase output resolution to at least 1024x1024');
      }
    }

    // Check sharpness
    if (sharpness < 30) {
      issues.push('Image appears too soft');
      recommendations.push('Apply sharpening filter');
    } else if (sharpness > 80) {
      issues.push('Image appears over-sharpened');
      recommendations.push('Reduce sharpening amount');
    }

    // Check color variance
    if (colorVariance < 20) {
      issues.push('Low color variance (may look artificial)');
      recommendations.push('Add subtle film grain or noise');
    }

    // Check contrast
    if (contrast < 30) {
      issues.push('Low contrast');
      recommendations.push('Increase contrast or use dramatic lighting');
    } else if (contrast > 90) {
      issues.push('Very high contrast');
      recommendations.push('Soften lighting or reduce contrast');
    }

    // Check brightness
    if (brightness < 30) {
      issues.push('Image too dark');
      recommendations.push('Increase exposure or add fill light');
    } else if (brightness > 220) {
      issues.push('Image too bright');
      recommendations.push('Reduce exposure or add shadows');
    }

    // Calculate overall score
    let score = 100;
    score -= issues.length * 10;
    score = Math.max(0, Math.min(100, score));

    const passed = score >= 70 && issues.length <= 2;

    return {
      score,
      passed,
      issues,
      recommendations,
      metrics: {
        sharpness,
        colorVariance,
        contrast,
        brightness,
        saturation,
      },
    };
  } catch (error) {
    console.error('Quality analysis error:', error);
    return {
      score: 50,
      passed: false,
      issues: ['Failed to analyze image quality'],
      recommendations: ['Retry generation with different parameters'],
      metrics: {
        sharpness: 0,
        colorVariance: 0,
        contrast: 0,
        brightness: 0,
        saturation: 0,
      },
    };
  }
}

/**
 * Calculate image sharpness using Laplacian variance
 */
async function calculateSharpness(image: sharp.Sharp): Promise<number> {
  try {
    // Convert to grayscale and get stats
    const { info } = await image
      .clone()
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Simplified sharpness metric (0-100)
    // In production, you'd use proper edge detection
    return Math.min(100, Math.random() * 40 + 40); // Placeholder
  } catch {
    return 50;
  }
}

/**
 * Calculate color variance across channels
 */
function calculateColorVariance(stats: sharp.Stats): number {
  const channels = stats.channels;
  const avgStdDev = channels.reduce((sum: number, ch: any) => sum + ch.stdev, 0) / channels.length;
  return Math.min(100, avgStdDev);
}

/**
 * Calculate image contrast
 */
function calculateContrast(stats: sharp.Stats): number {
  const channels = stats.channels;
  const avgRange = channels.reduce((sum: number, ch: any) => sum + (ch.max - ch.min), 0) / channels.length;
  return Math.min(100, (avgRange / 255) * 100);
}

/**
 * Calculate average brightness
 */
function calculateBrightness(stats: sharp.Stats): number {
  const channels = stats.channels;
  const avgMean = channels.reduce((sum: number, ch: any) => sum + ch.mean, 0) / channels.length;
  return avgMean;
}

/**
 * Calculate color saturation
 */
function calculateSaturation(stats: sharp.Stats): number {
  if (stats.channels.length < 3) return 0;
  
  const r = stats.channels[0].mean;
  const g = stats.channels[1].mean;
  const b = stats.channels[2].mean;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  
  if (max === 0) return 0;
  
  return ((max - min) / max) * 100;
}

/**
 * Check for common AI artifacts
 */
export async function detectAIArtifacts(imageBuffer: Buffer): Promise<{
  hasArtifacts: boolean;
  artifacts: string[];
  confidence: number;
}> {
  const artifacts: string[] = [];
  
  try {
    const image = sharp(imageBuffer);
    const stats = await image.stats();
    
    // Check for unnatural smoothness
    const colorVariance = calculateColorVariance(stats);
    if (colorVariance < 15) {
      artifacts.push('Unnatural color smoothness');
    }

    // Check for repetitive patterns (common in AI)
    // This is a simplified check
    const entropy = stats.entropy;
    if (entropy && entropy < 6) {
      artifacts.push('Low entropy (repetitive patterns)');
    }

    // Check for unnatural color distribution
    const channels = stats.channels;
    if (channels.length >= 3) {
      const rStdDev = channels[0].stdev;
      const gStdDev = channels[1].stdev;
      const bStdDev = channels[2].stdev;
      
      const stdDevDiff = Math.max(rStdDev, gStdDev, bStdDev) - Math.min(rStdDev, gStdDev, bStdDev);
      if (stdDevDiff < 5) {
        artifacts.push('Unnatural color channel similarity');
      }
    }

    const confidence = artifacts.length > 0 ? artifacts.length * 25 : 0;

    return {
      hasArtifacts: artifacts.length > 0,
      artifacts,
      confidence: Math.min(100, confidence),
    };
  } catch (error) {
    console.error('Artifact detection error:', error);
    return {
      hasArtifacts: false,
      artifacts: [],
      confidence: 0,
    };
  }
}

/**
 * Validate that face and clothing are preserved (for editorial mode)
 */
export async function validatePreservation(
  originalBuffer: Buffer,
  generatedBuffer: Buffer
): Promise<{
  preserved: boolean;
  similarity: number;
  issues: string[];
}> {
  // This is a simplified implementation
  // In production, you'd use computer vision models to compare faces
  
  try {
    const originalStats = await sharp(originalBuffer).stats();
    const generatedStats = await sharp(generatedBuffer).stats();

    // Compare color distribution as a proxy for preservation
    const originalBrightness = calculateBrightness(originalStats);
    const generatedBrightness = calculateBrightness(generatedStats);
    
    const brightnessDiff = Math.abs(originalBrightness - generatedBrightness);
    const similarity = Math.max(0, 100 - brightnessDiff);

    const issues: string[] = [];
    if (similarity < 70) {
      issues.push('Significant changes detected - face or clothing may not be preserved');
    }

    return {
      preserved: similarity >= 70,
      similarity,
      issues,
    };
  } catch (error) {
    console.error('Preservation validation error:', error);
    return {
      preserved: false,
      similarity: 0,
      issues: ['Failed to validate preservation'],
    };
  }
}

