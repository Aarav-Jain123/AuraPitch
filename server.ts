import express from "express";
import path from "path";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { geminiKEY } from "./api";

const app = express();
app.use(express.json());

const httpServer = createServer(app);
const PORT = process.env.PORT || 8080;
export function getGeminiKey(): string {
  const key = process.env.GEMINI_API_KEY || geminiKEY;

  if (!key || !key.trim()) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  return key;
}

const getGenAI = () => {
  try {
    const apiKey = getGeminiKey();
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error("Gemini initialization failed:", err);
    return null;
  }
};


app.post("/api/generate-report", async (req, res) => {
  try {
    const { title, description, duration, metrics, transcripts } = req.body;

    const ai = getGenAI();

    if (!ai) {
      return res.status(500).json({
        error: "Gemini API key is not configured",
      });
    }

    const transcriptText = transcripts
      ? transcripts
          .map((t: any) => `${t.type.toUpperCase()}: ${t.text}`)
          .join("\n")
      : "No transcript available.";

    const prompt = `
      You are AuraPitch, an elite executive coach. 
      Analyze this rehearsal session and provide a STRICT, RIGID report.
      
      SESSION TITLE: ${title}
      SESSION CONTEXT: ${description}
      SESSION DURATION: ${duration}
      TRANSCRIPT:
      ${transcriptText}
      
      METRICS OVER TIME (JSON): ${JSON.stringify(metrics)}

      PROVIDE OUTPUT IN JSON FORMAT:
      {
        "aiSuggestions": [string, string, string, string],
        "scores": {
          "tone": number,
          "voice": number,
          "visual": number
        }
      }

      CRITICAL INSTRUCTIONS:
      - Be brutally honest.
      - Scores above 95 are extremely rare.
      - Return ONLY valid JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text =
      response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No AI response text");
    }

    const report = JSON.parse(
      text.replace(/```json|```/g, "").trim()
    );

    res.json(report);
  } catch (error) {
    console.error("Report generation error:", error);

    res.status(500).json({
      error: "Failed to generate AI report",
    });
  }
});

const wss = new WebSocketServer({ noServer: true });

wss.on("connection", async (clientWs: WebSocket) => {
  console.log("Client connected to Gemini Live bridge");

  let session: any = null;

  const ai = getGenAI();

  if (!ai) {
    console.error("Gemini init failed");

    clientWs.send(
      JSON.stringify({
        type: "error",
        message: "Gemini initialization failed",
      })
    );

    clientWs.close(1011, "Gemini init failed");
    return;
  }

  clientWs.on("message", async (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.setup) {
        const { title, description } = msg.setup;

        console.log("Initializing Gemini Live session...");

        try {
          session = await ai.live.connect({
            model: "gemini-3.1-pro-preview",

            callbacks: {
              onmessage: (message: LiveServerMessage) => {
                try {
                  const audio =
                    message.serverContent?.modelTurn?.parts?.[0]
                      ?.inlineData?.data;

                  if (audio && clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(
                      JSON.stringify({
                        type: "audio",
                        data: audio,
                      })
                    );
                  }

                  const modelTranscript =
                    message.serverContent?.modelTurn?.parts?.[0]
                      ?.text;

                  if (
                    modelTranscript &&
                    clientWs.readyState === WebSocket.OPEN
                  ) {
                    clientWs.send(
                      JSON.stringify({
                        type: "modelTranscript",
                        data: modelTranscript,
                      })
                    );
                  }

                  const userTranscript = (message as any)
                    ?.serverContent?.userTranscript;

                  if (
                    userTranscript &&
                    clientWs.readyState === WebSocket.OPEN
                  ) {
                    clientWs.send(
                      JSON.stringify({
                        type: "userTranscript",
                        data: userTranscript,
                      })
                    );
                  }

                  if (
                    message.serverContent?.interrupted &&
                    clientWs.readyState === WebSocket.OPEN
                  ) {
                    clientWs.send(
                      JSON.stringify({
                        type: "interrupted",
                      })
                    );
                  }
                } catch (callbackErr) {
                  console.error(
                    "Callback processing error:",
                    callbackErr
                  );
                }
              },

              onerror: (err: any) => {
                console.error("Gemini session error:", err);

                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(
                    JSON.stringify({
                      type: "error",
                      message: "Gemini realtime error",
                    })
                  );
                }
              },
            },

            config: {
              responseModalities: [Modality.AUDIO],

              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: "Zephyr",
                  },
                },
              },

              // @ts-ignore
              outputAudioTranscription: {},

              // @ts-ignore
              inputAudioTranscription: {},

              systemInstruction: {
                parts: [
                  {
                    text: `
You are AuraPitch, a world-class Executive Communication Coach.

YOUR MISSION:
Transform the user into a high-impact speaker.

SESSION TITLE:
"${title}"

SESSION CONTEXT:
"${description}"

COACHING STYLE:
- highly specific
- elite
- demanding
- concise
- proactive

Keep live interventions under 8 seconds.
                    `,
                  },
                ],
              },
            },
          });

          console.log("Gemini Live connected");

          clientWs.send(
            JSON.stringify({
              type: "connected",
            })
          );
        } catch (connectErr) {
          console.error(
            "Gemini Live connection failed:",
            connectErr
          );

          clientWs.send(
            JSON.stringify({
              type: "error",
              message: "Failed to initialize Gemini Live",
            })
          );

          clientWs.close(1011, "Gemini Live init failed");
        }

        return;
      }

      if (!session) return;

      if (msg.audio) {
        session.sendRealtimeInput({
          audio: {
            data: msg.audio,
            mimeType: "audio/pcm;rate=16000",
          },
        });
      } else if (msg.video) {
        session.sendRealtimeInput({
          video: {
            data: msg.video,
            mimeType: "image/jpeg",
          },
        });
      }
    } catch (e) {
      console.error("Message processing error:", e);

      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(
          JSON.stringify({
            type: "error",
            message: "Message processing failed",
          })
        );
      }
    }
  });

  clientWs.on("close", () => {
    console.log("Client disconnected");

    try {
      if (session) {
        session.close();
      }
    } catch (err) {
      console.error("Session cleanup error:", err);
    }
  });

  clientWs.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

httpServer.on("upgrade", (request, socket, head) => {
  try {
    const { pathname } = new URL(
      request.url || "",
      `http://${request.headers.host}`
    );

    if (pathname === "/api/live") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  } catch (err) {
    console.error("Upgrade error:", err);
    socket.destroy();
  }
});


async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

setupVite().then(() => {
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
});
