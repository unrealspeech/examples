import express from "express";
import { UnrealSpeechAPI } from "unrealspeech";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const unrealSpeech = new UnrealSpeechAPI(process.env.UNREAL_SPEECH_API_KEY);
app.use(cors());

app.use(express.json());

app.post("/stream", async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const voiceId = "Scarlett";
    const bitrate = "192k";
    const audioBuffer = await unrealSpeech.stream(text, voiceId, bitrate);

    res.set("Content-Type", "audio/mpeg");
    res.status(200).send(audioBuffer);
  } catch (error) {
    next(error);
  }
});

// Error handling middleware should be last
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
