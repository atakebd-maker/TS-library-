import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API
let ai: GoogleGenAI | null = null;
try {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} catch (e) {
  console.warn("GEMINI_API_KEY is not set.");
}

// Moderation API Endpoint
app.post('/api/moderate', async (req, res) => {
  const { text, imageUrl } = req.body;
  
  if (!ai) {
    return res.json({ safe: true, reason: "Moderation bypassed (no API key)" });
  }
  
  try {
    const prompt = `You are a strict content moderator for a Bangla social media platform.
Analyze the following content for policy violations.
Policies strictly forbid:
- Pornographic, sexually explicit, or nude content
- Extremely violent/gory content
- Illegal content, spam, harassment, or malicious intent

Text Content: "${text || ''}"
Image URL: ${imageUrl || 'None'}

Respond with JSON only:
{
  "safe": boolean,
  "reason": "short explanation in Bangla"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const resultText = response.text || "";
    if (!resultText) {
      throw new Error("Empty response from model");
    }
    
    const result = JSON.parse(resultText);
    res.json(result);
  } catch (error) {
    console.error("Moderation error:", error);
    res.json({ safe: false, reason: "সিস্টেম ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
