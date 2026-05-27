const axios = require("axios");

class ChatbotController {

  static async processQuery(req, res) {
    try {
      const { message, portfolio } = req.body;

      console.log("🔥 OpenRouter AI Running");
      console.log("User message:", message);
      console.log("User portfolio:", portfolio);

      // 🧠 Enhanced AI Prompt for Actionable Advice
      const prompt = `
You are a smart AI Financial Advisor.

Rules:
* Give clear, actionable advice (avoid generic explanations)
* Always suggest specific investments (stocks, ETFs, allocations)
* If user mentions money → provide allocation plan
* If user mentions risk → classify as Low / Medium / High
* Keep answers structured and easy to read
* Consider user's current portfolio: ${JSON.stringify(portfolio || [])}

User Query: ${message}

Response format:
Advice:
Recommendation:
Example Stocks:
Next Step:

Always guide the user to take an action.
`;

      // 🚀 OpenRouter API Call
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        },
        {
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      // 📥 Raw AI response
      const text =
        response.data.choices?.[0]?.message?.content || "No AI response";

      console.log("🧠 AI RAW:", text);

      // ✅ Final response (structured text format)
      return res.json({
        text: text,
        aiPowered: true
      });

    } catch (error) {
      console.error("❌ OpenRouter error:", error.response?.data || error.message);

      return res.status(500).json({
        text: "AI failed. Try again!",
        recommendations: [],
        aiPowered: false
      });
    }
  }

  static async analyzeStock(req, res) {
    res.json({ message: "Stock analysis coming soon" });
  }

  static async optimizePortfolio(req, res) {
    res.json({ message: "Portfolio optimization coming soon" });
  }
}

module.exports = ChatbotController;