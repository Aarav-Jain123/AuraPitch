const session = await ai.live.connect({
  model: "gemini-2.0-flash-exp",

  config: {
    responseModalities: [Modality.AUDIO],

    systemInstruction: {
      parts: [
        {
          text: `
You are AuraPitch, an elite executive speaking coach.

Your role:
- Analyze voice confidence
- Analyze pacing
- Analyze posture and eye contact
- Give concise realtime coaching
- Keep feedback short
- Sound authoritative and professional
          `,
        },
      ],
    },
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
