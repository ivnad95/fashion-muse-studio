# Gemini API Documentation Findings

## Correct Model Name
**Model:** `gemini-2.5-flash-image`

Source: https://ai.google.dev/gemini-api/docs/image-generation

## Image Editing (Text-and-Image-to-Image)

### Python SDK Example (from official docs):
```python
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

client = genai.Client()

prompt = (
    "Create a picture of my cat eating a nano-banana in a "
    "fancy restaurant under the Gemini constellation",
)

image = Image.open("/path/to/cat_image.png")

response = client.models.generate_content(
    model="gemini-2.5-flash-image",
    contents=[prompt, image],
)

for part in response.candidates[0].content.parts:
    if part.text is not None:
        print(part.text)
    elif part.inline_data is not None:
        image = Image.open(BytesIO(part.inline_data.data))
        image.save("generated_image.png")
```

## Key Points for Our Implementation

1. **Model Name**: `gemini-2.5-flash-image` (NOT `gemini-2.5-flash-image-editing`)
2. **Image Input**: Can pass PIL Image object directly OR base64 inline_data
3. **Contents Array**: `[prompt, image]` - prompt first, then image
4. **Response Format**: 
   - `response.candidates[0].content.parts`
   - Check `part.inline_data` for image data
   - Image data is in `part.inline_data.data` as bytes
5. **No URL Downloads Needed**: Images should be uploaded directly from device

## REST API Format (for Node.js/TypeScript)

Based on Python SDK, the REST API should accept:
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "prompt here"
        },
        {
          "inline_data": {
            "mime_type": "image/jpeg",
            "data": "base64_encoded_image_here"
          }
        }
      ]
    }
  ]
}
```

Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=API_KEY`

## What We Need to Fix

1. ✅ Model name is already correct: `gemini-2.5-flash-image`
2. ❌ Remove URL download logic - only handle base64 from frontend
3. ❌ Simplify routers.ts to directly use base64 from file upload
4. ✅ API endpoint is correct
5. ✅ Request format is correct (inline_data with base64)

