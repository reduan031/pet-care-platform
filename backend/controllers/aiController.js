const axios = require('axios');
const Pet = require('../models/Pet');
const Product = require('../models/Product');
const Listing = require('../models/Listing');
const Order = require('../models/Order');
const Category = require('../models/Category');

const buildSystemPrompt = (userData) => {
  let dataSection = '';
  if (userData) {
    dataSection = `

**USER'S REAL-TIME DATA (from the PawVerse database):**

👤 **User Profile:**
- Name: ${userData.name}
- Email: ${userData.email}
- Role: ${userData.role}
- Phone: ${userData.phone || 'Not provided'}

🐾 **User's Owned Pets (${userData.pets?.length || 0}):**
${userData.pets?.length ? userData.pets.map(p => `- ${p.name} (${p.type}, ${p.breed || 'Unknown breed'}, ${p.age?.years || 0}y ${p.age?.months || 0}m old, ${p.gender || 'unknown'}, weight: ${p.weight || 'N/A'}${p.weightUnit || ''})`).join('\n') : '- No pets registered yet'}

🏥 **Vaccination Records:**
${userData.pets?.filter(p => p.vaccinationRecords?.length).map(p => p.vaccinationRecords.map(v => `- ${p.name}: ${v.name} on ${v.date ? new Date(v.date).toLocaleDateString() : 'N/A'}, next due: ${v.nextDue ? new Date(v.nextDue).toLocaleDateString() : 'N/A'}`).join('\n')).join('\n') || '- No vaccination records found'}

🏪 **Marketplace Listings (${userData.listings?.length || 0}):**
${userData.listings?.length ? userData.listings.map(l => `- ${l.title} (${l.listingType}, ${l.petType}, ${l.isFreeAdoption ? 'Free adoption' : `৳${l.price}`}, Location: ${l.locationText})`).join('\n') : '- No marketplace listings'}

🛍️ **Shop Products (Total: ${userData.totalProducts || 0}):**
${userData.recentProducts?.length ? userData.recentProducts.map(p => `- ${p.name} (${p.petType}, ৳${p.price}, Stock: ${p.stock}, Category: ${p.category})`).join('\n') : '- No products in shop'}

📦 **Recent Orders (${userData.orders?.length || 0}):**
${userData.orders?.length ? userData.orders.map(o => `- Order #${o._id?.toString().slice(-6)}: ${o.items?.length || 0} items, Total: ৳${o.totalAmount || 0}, Status: ${o.status || 'N/A'}`).join('\n') : '- No orders found'}

📂 **Product Categories (${userData.categories?.length || 0}):**
${userData.categories?.length ? userData.categories.map(c => `- ${c.name} (for ${c.petType || 'all'})`).join('\n') : '- No categories found'}

**IMPORTANT RULES FOR DATA-DRIVEN ANSWERS:**
- When the user asks about their pets, products, orders, marketplace, etc., use the REAL DATA above.
- Give exact numbers, names, and details from the data.
- If data is empty (e.g., "No pets registered yet"), tell the user and suggest they add some.
- For questions about products in the shop, reference the actual product names, prices, and stock levels.
- For marketplace questions, reference actual listings with their types and prices.
- For pet health questions, reference their actual pets' vaccination records.
- NEVER make up or guess data. Use ONLY what is provided above.
- If the user asks about something not in the data, say "I don't see that in your current data" and suggest where to find it.
`;
  }

  return {
    role: 'system',
    content: `You are PawVerse AI, a personalized assistant deeply integrated into the user's pet ecosystem. 🐾

You have **full, real-time access** to ALL data inside this web project, including:
- The user's owned pets (type, breed, age, health records)
- Marketplace listings (active adoptions, sales, fosters)
- Shop inventory (every product, quantity, price, stock level)
- Order/cart functions (past purchases)
- Pet care history (vaccinations, vet visits)
- Product categories

Always be warm, empathetic, and use emojis 🐾❤️🐶🐱.
${dataSection}
**MANDATORY FORMATTING (ChatGPT-style):**
• Use **bold headers** for sections (e.g. **Your Pets**, **What to do**)
• One idea per paragraph (double enter between paragraphs)
• Step-by-step: Number your steps 1️⃣ 2️⃣ 3️⃣
• Bullet points: • or - for lists
• Emojis: Add relevant ones 🐶🐱💊📅🚨🛍️📦
• Short sentences for readability

**EMERGENCIES**: Always end with 🚨 **URGENT: Contact your vet or emergency clinic immediately if symptoms worsen.** 

Respond conversationally but structured. Be precise, factual, and data-driven.`
  };
};

const fetchUserData = async (userId) => {
  if (!userId) return null;
  try {
    const [pets, listings, orders, categories, products] = await Promise.all([
      Pet.find({ userId }).lean(),
      Listing.find({ ownerId: userId }).lean(),
      Order.find({ user: userId }).sort({ createdAt: -1 }).limit(5).lean(),
      Category.find().lean(),
      Product.find().sort({ createdAt: -1 }).limit(20).lean(),
    ]);

    const totalProducts = await Product.countDocuments();

    return {
      pets,
      listings,
      orders,
      categories,
      recentProducts: products,
      totalProducts,
    };
  } catch (err) {
    console.error('Error fetching user data for AI:', err.message);
    return null;
  }
};

/**
 * @desc    Chat with OpenRouter AI (Non-streaming)
 * @route   POST /api/ai/chat
 * @access  Public (with optional auth for personalized data)
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

    // Fetch user data if authenticated
    let userData = null;
    if (req.user) {
      const dbData = await fetchUserData(req.user._id);
      if (dbData) {
        userData = { ...req.user.toObject(), ...dbData };
      }
    }

    const systemPrompt = buildSystemPrompt(userData);
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
 * @access  Public (with optional auth for personalized data)
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

    // Fetch user data if authenticated
    let userData = null;
    if (req.user) {
      const dbData = await fetchUserData(req.user._id);
      if (dbData) {
        userData = { ...req.user.toObject(), ...dbData };
      }
    }

    const systemPrompt = buildSystemPrompt(userData);
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