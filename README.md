# ⚙️ RakshaAI Backend – AI Cyber Security Engine

🔗 Live API: https://rakshaai-backend-srh2.onrender.com

This is the backend service for RakshaAI, an AI-powered cybersecurity assistant that analyzes suspicious messages and provides threat insights.

---

## 🚀 Features

- 🧠 AI-based threat analysis using Gemini API
- 🔁 Retry logic for handling API failures
- ⚡ Multi-model fallback system (high reliability)
- 📊 Structured JSON response
- 🛡️ Safe error handling (no crashes)

---

## 🧠 How It Works

1. Receives user input via `/analyze` endpoint
2. Sends request to Gemini AI models
3. Uses fallback models if one fails
4. Parses AI response into structured JSON
5. Returns clean response to frontend

---

## 🔌 API Endpoint

### POST `/analyze`

#### Request Body:
```json id="c9g3jv"
{
  "text": "Your bank account is blocked. Click here to verify."
}
