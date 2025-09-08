
const host="http://192.168.255.194:3000"

import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from 'dotenv'
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ASYNC_API_KEY = process.env.ASYNC_API_KEY;

app.post("/tts", async (req, res) => {
  try {
    const { text } = req.body;

    const response = await fetch("https://api.async.ai/text_to_speech/streaming", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": ASYNC_API_KEY,
      },
      body: JSON.stringify({
        model_id: "asyncflow_v2.0",
        transcript: text,
        voice: {
          mode: "id",
          id: "69cb82f6-3831-4f97-84fb-181f5f60a04b" // <-- replace with your chosen voice ID
        },
        output_format: {
          container: "raw",       // must be raw
          encoding: "pcm_s16le",  // required encoding
          sample_rate: 44100      // required sample rate
        },
      }),
    });

    if (!response.ok) {
      const errMsg = await response.text();
      throw new Error(`AsyncTTS failed: ${response.status} ${response.statusText} - ${errMsg}`);
    }

    // Get raw PCM buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Send back as WAV (browser can play WAV easily)
    const wavHeader = Buffer.alloc(44);

    const writeString = (buf, offset, str) => {
      buf.write(str, offset, str.length, "ascii");
    };

    const sampleRate = 44100;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const dataSize = buffer.length;
    const chunkSize = 36 + dataSize;

    writeString(wavHeader, 0, "RIFF");
    wavHeader.writeUInt32LE(chunkSize, 4);
    writeString(wavHeader, 8, "WAVE");
    writeString(wavHeader, 12, "fmt ");
    wavHeader.writeUInt32LE(16, 16); // PCM chunk size
    wavHeader.writeUInt16LE(1, 20);  // PCM format
    wavHeader.writeUInt16LE(numChannels, 22);
    wavHeader.writeUInt32LE(sampleRate, 24);
    wavHeader.writeUInt32LE(byteRate, 28);
    wavHeader.writeUInt16LE(blockAlign, 32);
    wavHeader.writeUInt16LE(bitsPerSample, 34);
    writeString(wavHeader, 36, "data");
    wavHeader.writeUInt32LE(dataSize, 40);

    const wavBuffer = Buffer.concat([wavHeader, buffer]);

    res.setHeader("Content-Type", "audio/wav");
    res.send(wavBuffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "TTS failed", details: err.message });
  }
});



app.listen(3000, () => console.log(`Server running on ${host}`));








