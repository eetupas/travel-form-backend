import express from "express";
import OpenAI from "openai";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: 'https://users.metropolia.fi/~eetupas/travel-form',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions)); // Use CORS middleware

app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
app.options('/api/suggest', cors(corsOptions));
app.post("/api/suggest", async (req, res) => {
  const {
    country,
    budget,
    destinationType,
    activities,
    duration,
    season,
    companions,
  } = req.body;

  try {
    const prompt = `
You are a helpful travel advisor. Based on the following user preferences, suggest a travel destination and explain why.

User is from: ${country}
Budget: ${budget}
Destination type: ${destinationType.join(", ")}
Activities: ${activities.join(", ")}
Trip duration: ${duration}
Season: ${season}
Traveling with: ${companions}

Return a short and friendly travel suggestion. Answer should be max 100 words.
Make sure to include the destination name and a brief explanation of why it's a good fit for the user.
If the user gives unclear or contradictory information, come up with a general popular fun destination.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful travel advisor." },
        { role: "user", content: prompt },
      ],
    });

    const reply = completion.choices[0].message.content;
    res.json({ suggestion: reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get suggestion from ChatGPT." });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
