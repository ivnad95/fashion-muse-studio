# Gemini API Integration Guide

## Getting Your Gemini API Key

1. **Visit Google AI Studio**
   - Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account

2. **Create API Key**
   - Click "Get API Key" or "Create API Key"
   - Select "Create API key in new project" or choose an existing project
   - Copy the generated API key

3. **Set Environment Variable**
   - Add to your `.env` file: `GEMINI_API_KEY=your_api_key_here`
   - Or set via platform environment settings

4. **API Pricing**
   - Gemini 2.5 Flash Image model pricing: Check [Google AI Pricing](https://ai.google.dev/pricing)
   - Free tier available with rate limits
   - Pay-as-you-go for production use

## How It Works

The app uses **gemini-2.5-flash-image** model which:

- Takes a reference image (person's photo)
- Applies professional photography transformations
- **Preserves the person's real face, expression, and clothing**
- Enhances lighting, background, and overall photo quality
- Generates natural poses and studio-quality results
- **Never stylizes, animates, or artificially alters the person**

## Prompt Strategy

Each button combination creates a specific prompt that:

1. **Preserves Identity**: Explicitly instructs to keep face, expression, and clothing identical
2. **Enhances Quality**: Transforms into professional photography
3. **Applies Style**: Based on selected style button
4. **Sets Camera Angle**: Based on selected camera angle
5. **Configures Lighting**: Based on selected lighting setup

---

## Style Button Prompts

### Editorial

```
Transform this into a high-end fashion editorial photograph. Keep the person's face, expression, and clothing EXACTLY as they are. Enhance with professional studio lighting, clean minimalist background, sharp focus, magazine-quality composition. Natural pose, sophisticated atmosphere, Vogue-style editorial quality.
```

### Commercial

```
Transform this into a professional commercial photography shot. Preserve the person's real face, expression, and outfit completely. Add bright, even lighting, clean white or neutral background, product-focused composition, catalog-ready quality, approachable and friendly atmosphere.
```

### Artistic

```
Transform this into an artistic portrait photograph. Keep the person's actual face, expression, and clothing unchanged. Add creative lighting with shadows and highlights, textured or gradient background, dramatic composition, fine art photography quality, emotional depth.
```

### Casual

```
Transform this into a natural lifestyle photograph. Maintain the person's real face, expression, and clothes exactly. Add soft natural lighting, outdoor or home environment background, candid feel, relaxed composition, authentic everyday photography style.
```

### Glamour

```
Transform this into a glamorous beauty photograph. Preserve the person's genuine face, expression, and attire. Add soft diffused lighting with glow, elegant background, polished composition, high-end beauty photography quality, sophisticated and luxurious feel.
```

### Vintage

```
Transform this into a vintage-style photograph. Keep the person's true face, expression, and clothing intact. Add warm film-like tones, classic photography lighting, timeless background, nostalgic composition, retro photography aesthetic from the 1960s-1980s.
```

---

## Camera Angle Prompts

### Eye Level

```
Shot at eye level, straight-on perspective, direct connection with viewer, balanced composition, standard portrait framing, professional headshot angle.
```

### High Angle

```
Shot from above looking down, camera positioned higher than subject, flattering downward angle, elongating effect, editorial fashion angle, creates elegance.
```

### Low Angle

```
Shot from below looking up, camera positioned lower than subject, powerful perspective, dramatic upward angle, creates confidence and authority, fashion runway style.
```

### Dutch Angle

```
Shot with tilted camera angle, dynamic diagonal composition, creative perspective, adds energy and movement, artistic editorial style, modern fashion photography.
```

### Over Shoulder

```
Shot from behind and to the side, over-the-shoulder perspective, creates depth, storytelling angle, editorial narrative style, adds context and dimension.
```

### Three Quarter

```
Shot at 45-degree angle, three-quarter view, classic portrait angle, shows depth and dimension, most flattering perspective, professional photography standard.
```

### Profile

```
Shot from the side, full profile view, silhouette emphasis, artistic composition, highlights facial features, classic portrait style, elegant and timeless.
```

### Close Up

```
Tight framing on face and upper body, intimate perspective, detailed view, beauty photography style, emphasizes facial features and expression, magazine cover quality.
```

---

## Lighting Setup Prompts

### Natural Light

```
Lit with soft natural window light, gentle shadows, authentic daylight quality, no artificial lighting, organic feel, golden hour warmth, photojournalistic style.
```

### Studio Light

```
Lit with professional studio lighting setup, key light and fill light, controlled shadows, even illumination, commercial photography quality, clean and polished look.
```

### Dramatic Light

```
Lit with high-contrast dramatic lighting, strong shadows and highlights, chiaroscuro effect, moody atmosphere, artistic photography style, creates depth and emotion.
```

### Soft Light

```
Lit with diffused soft lighting, minimal shadows, flattering illumination, beauty photography quality, gentle and even, creates smooth and polished look.
```

### Backlight

```
Lit from behind, rim lighting effect, glowing edges, silhouette elements, creates separation from background, editorial fashion style, adds dimension and drama.
```

### Golden Hour

```
Lit with warm golden hour sunlight, soft directional light, warm color temperature, natural outdoor quality, romantic atmosphere, sunset/sunrise photography style.
```

---

## Complete Prompt Construction

When a user selects:

- **Style**: Editorial
- **Camera Angle**: Three Quarter
- **Lighting**: Soft Light

The final prompt becomes:

```
Transform this into a professional photograph while keeping the person's face, expression, and clothing EXACTLY as they are in the original image. Never stylize, animate, or artificially alter the person.

Style: High-end fashion editorial photograph with professional studio lighting, clean minimalist background, sharp focus, magazine-quality composition, natural pose, sophisticated atmosphere, Vogue-style editorial quality.

Camera Angle: Shot at 45-degree angle, three-quarter view, classic portrait angle, shows depth and dimension, most flattering perspective, professional photography standard.

Lighting: Lit with diffused soft lighting, minimal shadows, flattering illumination, beauty photography quality, gentle and even, creates smooth and polished look.

Result: Photorealistic, studio-quality, professional photography, 8k resolution, shot on Hasselblad medium format camera, natural and authentic, preserves all original features.
```

---

## Testing Your Integration

1. **Upload a photo** of a person
2. **Select style, camera angle, and lighting**
3. **Generate** the image
4. **Verify** that:
   - Face remains identical
   - Expression is preserved
   - Clothing is unchanged
   - Only lighting, background, and photo quality are enhanced
   - Result looks like a professional photograph, not AI art

---

## Troubleshooting

### API Key Issues

- Ensure `GEMINI_API_KEY` is set in environment variables
- Check API key is valid at [Google AI Studio](https://aistudio.google.com/app/apikey)
- Verify billing is enabled for production use

### Quality Issues

- Use high-resolution reference images (min 512x512px)
- Ensure good lighting in original photo
- Face should be clearly visible
- Avoid heavily filtered or edited source images

### Rate Limits

- Free tier: Limited requests per minute
- Upgrade to paid tier for production
- Implement request queuing for multiple images

---

## API Usage Example

```typescript
const result = await generateImagesWithGemini({
  prompt: "Transform this into a professional photograph...",
  referenceImageBase64: base64Image,
  numberOfImages: 1,
  style: "Editorial",
  cameraAngle: "Three Quarter",
  lighting: "Soft Light",
});
```

The system automatically constructs the detailed prompt based on your selections.
