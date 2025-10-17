import { readFileSync } from 'fs';

const apiKey = process.env.GEMINI_API_KEY;
const imagePath = '/home/ubuntu/upload/fashion-muse-pose-6.png';

async function testGemini() {
  try {
    // Read and convert image to base64
    const imageBuffer = readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    console.log('Image loaded, size:', imageBuffer.length, 'bytes');
    console.log('Base64 length:', base64Image.length);
    
    const prompt = "Transform this person into a professional fashion photograph. CRITICAL: Keep the person's face, facial features, expression, skin tone, and overall appearance EXACTLY as shown in the original image.";
    
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
            {
              inline_data: {
                mime_type: "image/png",
                data: base64Image,
              },
            },
          ],
        },
      ],
    };
    
    console.log('\nSending request to Gemini API...');
    console.log('Model: gemini-2.5-flash-image');
    
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
    
    console.log('\nResponse status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('\nResponse data:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('\n❌ API Error:', data);
    } else {
      console.log('\n✅ Success!');
      if (data.candidates && data.candidates[0]?.content?.parts) {
        for (const part of data.candidates[0].content.parts) {
          if (part.inline_data) {
            console.log('✅ Image data found, length:', part.inline_data.data.length);
          }
          if (part.text) {
            console.log('Text response:', part.text);
          }
        }
      }
    }
  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

testGemini();
