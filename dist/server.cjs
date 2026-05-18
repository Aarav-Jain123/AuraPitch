var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_http = require("http");
var import_ws = require("ws");
var import_vite = require("vite");
var import_genai = require("@google/genai");

// api.ts
var import_meta = {};
var baseURL = process.env.BASE_URL;
var geminiKEY = process.env.GEMINI_API_KEY;

// server.ts
var app = (0, import_express.default)();
app.use(import_express.default.json());
var httpServer = (0, import_http.createServer)(app);
var PORT = 8080;
var getGeminiKey = () => {
  const key = process.env.GEMINI_API_KEY || geminiKEY;
  if (!key || key === geminiKEY || key.trim() === "") {
    return null;
  }
  return key;
};
var getGenAI = () => {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    console.warn("Gemini API key is missing from environment variables.");
    return null;
  }
  return new import_genai.GoogleGenAI({ apiKey });
};
app.post("/api/generate-report", async (req, res) => {
  try {
    const { title, description, duration, metrics, transcripts } = req.body;
    const ai = getGenAI();
    if (!ai) {
      return res.status(500).json({
        error: "Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable in the application settings."
      });
    }
    const transcriptText = transcripts ? transcripts.map((t) => `${t.type.toUpperCase()}: ${t.text}`).join("\n") : "No transcript available.";
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
          "tone": number (0-100),
          "voice": number (0-100),
          "visual": number (0-100)
        }
      }

      CRITICAL INSTRUCTIONS:
      - Be brutally honest. If they were average, give them a C (70-79).
      - Scores above 95 are extremely rare\u2014only for world-class delivery.
      - Suggestions should be actionable and professional based on the TRANSCRIPT and METRICS.
      - If the metrics show pace fluctuations, mention it.
      - Return ONLY the JSON.
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json"
      }
    });
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      const report = JSON.parse(text.replace(/```json|```/g, "").trim());
      res.json(report);
    } else {
      throw new Error("Invalid AI response format: no text content found");
    }
  } catch (error) {
    console.error("Report generation error:", error);
    res.status(500).json({ error: "Failed to generate AI report" });
  }
});
var wss = new import_ws.WebSocketServer({ noServer: true });
wss.on("connection", async (clientWs) => {
  console.log("Client connected to Gemini Live bridge");
  let session = null;
  const ai = getGenAI();
  if (!ai) {
    console.error("WebSocket connection failed: Gemini API key missing");
    clientWs.close(1008, "Gemini API key missing");
    return;
  }
  clientWs.on("message", async (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.setup) {
        const { title, description } = msg.setup;
        session = await ai.live.connect({
          model: "gemini-2.0-flash-exp",
          callbacks: {
            onmessage: (message) => {
              const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (audio) {
                clientWs.send(JSON.stringify({ type: "audio", data: audio }));
              }
              const modelTranscript = message.serverContent?.modelTurn?.parts?.[0]?.text;
              if (modelTranscript) {
                clientWs.send(JSON.stringify({ type: "modelTranscript", data: modelTranscript }));
              }
              const userTranscript = message.serverContent?.userTranscript;
              if (userTranscript) {
                clientWs.send(JSON.stringify({ type: "userTranscript", data: userTranscript }));
              }
              if (message.serverContent?.interrupted) {
                clientWs.send(JSON.stringify({ type: "interrupted" }));
              }
            }
          },
          config: {
            responseModalities: [import_genai.Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } }
            },
            // @ts-ignore
            outputAudioTranscription: {},
            // @ts-ignore
            inputAudioTranscription: {},
            systemInstruction: {
              parts: [{
                text: `You are AuraPitch, a world-class Executive Communication Coach. 
                
                YOUR MISSION: Transform the user into a high-impact speaker for their session: "${title}".
                CONTEXT: "${description}"

                CRITICAL COACHING BEHAVIORS:
                1. PROACTIVE & SPECIFIC: Don't just say "good job". Say "That opening hook about [Topic] was strong, but your pace accelerated during the second sentence. Breathe."
                2. MICRO-INTERVENTIONS: If you hear a series of filler words (ums/ahs) or a sharp increase in pace, interject immediately with a brief, actionable correction (e.g., "Pause there. Reset your pace.").
                3. BREVITY IS KEY: During the session, keep your verbal feedback under 8 seconds. Use short, punchy directives.
                4. EYE CONTACT & POSTURE: You can see them. If they look down at notes too much or slouch, correct them: "Eyes up. Project to the back of the room."
                5. TRANSITIONS: Coach them on their transitions. If they sound abrupt, suggest a "bridge" phrase.

                REAL-TIME DATA GATHERING:
                - Listen for: Certainty in voice, filler word density, vocal variety, and speaking rate.
                - Watch for: Open vs. closed posture, eye contact consistency, and expressive hand gestures.

                TONE: authoritative, encouraging but demanding, elite, and intensely focused on performance excellence.`
              }]
            }
          }
        });
        console.log("Gemini session initialized with context");
        return;
      }
      if (!session) return;
      if (msg.audio) {
        session.sendRealtimeInput({
          audio: { data: msg.audio, mimeType: "audio/pcm;rate=16000" }
        });
      } else if (msg.video) {
        session.sendRealtimeInput({
          video: { data: msg.video, mimeType: "image/jpeg" }
        });
      }
    } catch (e) {
      console.error("Error processing message:", e);
    }
  });
  clientWs.on("close", () => {
    console.log("Client disconnected, closing Gemini session");
    if (session) session.close();
  });
});
httpServer.on("upgrade", (request, socket, head) => {
  const { pathname } = new URL(request.url || "", `http://${request.headers.host}`);
  if (pathname === "/api/live") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
}
setupVite().then(() => {
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running`);
  });
});
