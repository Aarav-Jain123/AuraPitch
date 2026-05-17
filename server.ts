import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const wss = new WebSocketServer({ server });

wss.on("connection", async (client) => {
  console.log("Client connected");

  let session;

  try {
    session = await ai.live.connect({
      model: "gemini-2.0-flash-exp",

      config: {
        responseModalities: [Modality.AUDIO],

        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Zephyr",
            },
          },
        },

        // Enables speech-to-text internally
        // @ts-ignore
        inputAudioTranscription: {},

        // Enables model transcript internally
        // @ts-ignore
        outputAudioTranscription: {},

        systemInstruction: {
          parts: [
            {
              text: `
You are AuraPitch, an elite executive communication coach.

Your purpose is to train the user to become a world-class public speaker.

You receive:
- Live microphone audio
- Live camera feed

You must analyze:
- Vocal confidence
- Speaking pace
- Filler words
- Clarity
- Energy
- Eye contact
- Posture
- Presence

Rules:
- Keep responses SHORT.
- Maximum 1-2 sentences.
- Sound authoritative and professional.
- Interrupt when necessary.
- Give actionable coaching.
- Do NOT ramble.
- Behave like a high-performance executive speaking trainer.

Examples:
- "Slow down. You're rushing the ending."
- "Good posture. Maintain eye contact."
- "Too many filler words. Pause before your next point."
- "Stronger opening. Start with conviction."

Your tone:
Demanding, elite, concise, confident.
              `,
            },
          ],
        },
      },

      callbacks: {
        onmessage: (message) => {
          // AUDIO RESPONSE
          const audio =
            message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;

          if (audio) {
            client.send(
              JSON.stringify({
                type: "audio",
                data: audio,
              })
            );
          }

          // MODEL TRANSCRIPT
          const transcript =
            message.serverContent?.modelTurn?.parts?.[0]?.text;

          if (transcript) {
            client.send(
              JSON.stringify({
                type: "transcript",
                data: transcript,
              })
            );
          }
        },

        onerror: (err) => {
          console.error("Gemini Error:", err);
        },
      },
    });

    client.on("message", async (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        // AUDIO STREAM
        if (msg.audio) {
          session.sendRealtimeInput({
            audio: {
              data: msg.audio,
              mimeType: "audio/pcm;rate=16000",
            },
          });
        }

        // VIDEO FRAME
        if (msg.image) {
          session.sendRealtimeInput({
            video: {
              data: msg.image,
              mimeType: "image/jpeg",
            },
          });
        }
      } catch (err) {
        console.error("Message parse error:", err);
      }
    });

    client.on("close", () => {
      console.log("Client disconnected");

      if (session) {
        session.close();
      }
    });
  } catch (err) {
    console.error("Connection error:", err);
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
