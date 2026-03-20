require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function list() {
  const models = await genAI.models.list();
  console.log(models.models.map(m => m.name));
}
list();
