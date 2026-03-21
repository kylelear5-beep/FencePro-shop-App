const { GoogleGenAI } = require('@google/genai');
const genAI = new GoogleGenAI({ apiKey: 'test' });
// I can't call generateContent without a real key easily here, 
// but I can check the prototype of what it returns if I could.
// Instead, I'll trust the search result or common knowledge of this new SDK.
console.log('Done');
