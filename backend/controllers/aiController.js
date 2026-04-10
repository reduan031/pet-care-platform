const axios = require('axios');

/**
 * @desc    Chat with OpenRouter AI
 * @route   POST /api/ai/chat
 * @access  Public (or Private if you want to restrict)
 */
exports.chatWithAI = async (req, res) => {
  try {
    const { messages } = req.body;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('CRITICAL: OPENROUTER_API_KEY is missing from environment variables');
      return res.status(500).json({ success: false, message: 'AI configuration error: API Key missing' });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'Messages array is required' });
    }

const systemPrompt = {
      role: 'system',
      content: `You are PawVerse AI, a professional and compassionate veterinary assistant. 
Your goal is to provide helpful, evidence-based advice for pet care, health, and behavior. 
Always be warm, empathetic, and use emojis 🐾❤️.

**MANDATORY FORMATTING (ChatGPT-style):**
• Use **bold headers** for sections (e.g. **Symptoms**, **What to do**)
• One idea per paragraph (double enter between paragraphs)
• Step-by-step: Number your steps 1️⃣ 2️⃣ 3️⃣
• Bullet points: • or - for lists
• Emojis: Add relevant ones 🐶🐱💊📅🚨
• Short sentences for readability

**EMERGENCIES**: Always end with 🚨 **URGENT: Contact your vet or emergency clinic immediately if symptoms worsen.** 

Respond conversationally but structured.`
    };

    // Keep only the last 10 messages for context + system prompt
    const recentMessages = messages.slice(-10);
    const fullMessages = [systemPrompt, ...recentMessages];

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free',
        messages: fullMessages,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://pawverse-pet-care.com', // Optional but good practice
          'X-OpenRouter-Title': 'PawVerse Pet Care Platform',
        },
      }
    );

    const aiMessage = response.data.choices[0].message.content;

    res.status(200).json({
      success: true,
      data: aiMessage
    });
  } catch (error) {
    console.error('OpenRouter AI Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'AI Service currently unavailable',
      error: error.response?.data?.error?.message || error.message
    });
  }
};