const axios = require('axios');

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

/**
 * @desc    Chat with OpenRouter AI (Non-streaming)
 * @route   POST /api/ai/chat
 * @access  Public
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
          'HTTP-Referer': 'https://pawverse-pet-care.com',
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

/**
 * @desc    Chat with OpenRouter AI (Streaming)
 * @route   POST /api/ai/chat?stream=true
 * @access  Public
 */
exports.chatWithAIStream = async (req, res) => {
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

    // Keep only the last 10 messages for context + system prompt
    const recentMessages = messages.slice(-10);
    const fullMessages = [systemPrompt, ...recentMessages];

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free',
        messages: fullMessages,
        stream: true,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://pawverse-pet-care.com',
          'X-OpenRouter-Title': 'PawVerse Pet Care Platform',
          'Accept': 'text/event-stream',
        },
        responseType: 'stream',
      }
    );

    // Pipe the stream to the response
    response.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            res.write('data: [DONE]\n\n');
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch (e) {
            // Ignore parsing errors for incomplete chunks
          }
        }
      }
    });

    response.data.on('end', () => {
      res.write('data: [DONE]\n\n');
      res.end();
    });

    response.data.on('error', (error) => {
      console.error('Stream error:', error);
      res.write(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`);
      res.end();
    });

  } catch (error) {
    console.error('OpenRouter AI Stream Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'AI Service currently unavailable',
      error: error.response?.data?.error?.message || error.message
    });
  }
};