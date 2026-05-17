import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = createServer(app);

const wss = new WebSocketServer({ server });

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

wss.on("connection", async (client) => {
  console.log("Client connected");

  const session = await ai.live.connect({
    model: "gemini-2.0-flash-exp",
    config: {
      responseModalities: [Modality.AUDIO],
    },

    callbacks: {
      onmessage: (msg) => {
        const audio =
          msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;

        if (audio) {
          client.send(
            JSON.stringify({
              type: "audio",
              data: audio,
            })
          );
        }
      },
    },
  });

  client.on("message", (message) => {
    const msg = JSON.parse(message.toString());

    if (msg.audio) {
      session.sendRealtimeInput({
        audio: {
          data: msg.audio,
          mimeType: "audio/pcm;rate=16000",
        },
      });
    }

    if (msg.image) {
      session.sendRealtimeInput({
        video: {
          data: msg.image,
          mimeType: "image/jpeg",
        },
      });
    }
  });

  client.on("close", () => {
    session.close();
    console.log("Disconnected");
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Running on port 3000");
});
