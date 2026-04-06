require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // ✅ add this

const app = express();
app.use(cors());
app.use(express.json());

app.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;

    const prompt = `
You are RakshaAI, a cyber security assistant.

⚠️ VERY IMPORTANT:
You MUST return ALL fields. DO NOT skip any field.
If you don't know, still give a meaningful answer.

Return ONLY JSON:
{
  "riskLevel": "",
  "score": 0,
  "whatIsHappening": "",
  "whyDangerous": "",
  "immediateSteps": ["", ""],
  "preventionTips": ["", ""],
  "reportingOptions": ["", ""]
}

Input: ${text}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    }
    );

    // check response
    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({
        error: "API request failed",
        details: errText
      });
    }

    const data = await response.json();

    console.log("FULL API RESPONSE:", JSON.stringify(data, null, 2));

    let output = "No response";

    if (data.candidates && data.candidates.length > 0) {
      const parts = data.candidates[0].content.parts;

      if (parts && parts.length > 0) {
        output = parts.map(p => p.text).join(" ");
      }
    }

    // remove ```json ``` wrapper if present
    let clean = output
      .replace(/```json|```/g, "")
      .replace(/^[^{]*/, "")   // remove text before JSON
      .replace(/[^}]*$/, "")   // remove text after JSON
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(clean);
    } catch {
      parsed = {
        riskLevel: "Unknown",
        score: 0,
        whatIsHappening: clean,
        whyDangerous: "AI response format issue",
        immediateSteps: [],
        preventionTips: [],
        reportingOptions: []
      };
    }

    res.json(parsed);
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
const fetch = require('node-fetch');