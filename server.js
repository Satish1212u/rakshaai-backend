require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 Retry function
async function callGemini(url, options, retries = 3) {
  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    return res;

  } catch (err) {
    console.log("Retrying Gemini...", retries);

    if (retries > 0) {
      await new Promise(r => setTimeout(r, 2000));
      return callGemini(url, options, retries - 1);
    }

    throw err;
  }
}

// Home route
app.get("/", (req, res) => {
  res.send("RakshaAI Backend Running ✅");
});

// ✅ SINGLE analyze route
app.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;

    const prompt = `
You are RakshaAI, a cyber security assistant.

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

    const URL = `https://generativelanguage.googleapis.com/v1/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    };

    // ✅ USE retry logic
    const response = await callGemini(URL, options);

    const data = await response.json();

    let output = "No response";

    if (data?.candidates?.length) {
      const parts = data.candidates[0]?.content?.parts;
      if (Array.isArray(parts)) {
        output = parts.map(p => p.text || "").join(" ");
      }
    }

    let clean = output
      .replace(/```json|```/g, "")
      .replace(/^[^{]*/, "")
      .replace(/[^}]*$/, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(clean);
    } catch {
      parsed = {
        riskLevel: "Unknown",
        score: 0,
        whatIsHappening: clean,
        whyDangerous: "AI format issue",
        immediateSteps: [],
        preventionTips: [],
        reportingOptions: []
      };
    }

    res.json(parsed);

  } catch (err) {
    console.log("FINAL ERROR:", err);

    // ✅ fallback response (no crash)
    res.status(200).json({
      riskLevel: "Unknown",
      score: 0,
      whatIsHappening: "AI server busy, try again",
      whyDangerous: "Temporary issue",
      immediateSteps: [],
      preventionTips: [],
      reportingOptions: []
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});