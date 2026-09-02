import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Initialize Gemini AI Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Mock in-memory database store with default event settings
let eventConfig = {
  honoree: "Clara Hoggan",
  eventType: "Mis 15",
  date: "2026-10-17T20:00:00",
  venue: "Salón de Eventos Gala",
  address: "Av. Libertador 2450, Buenos Aires",
  dressCode: "Elegante / Disco Chic",
  suggestedColors: ["Plata", "Negro", "Gris Plomo", "Blanco", "Brillos Metálicos"],
  forbiddenColors: ["Colores exclusivos de la Quinceañera"],
  cbu: "0000003100098765432100",
  alias: "CLARA.MIS15",
  mpQrUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80",
  timeline: [
    { time: "20:00", title: "Recepción & Cocktails", desc: "Bienvenida al aire libre con sushi bar, fondues y barra de tragos y mocktails." },
    { time: "21:30", title: "Ingreso Triunfal & Cena", desc: "Apertura de salón principal con show de luces disco y menú gourmet." },
    { time: "23:00", title: "El Tradicional Vals & Baile", desc: "Vals de los 15 con la familia y cortejo de honor." },
    { time: "23:30", title: "Apertura de Pista & Show DJ", desc: "Set en vivo con iluminación robótica, efectos de neón y música disco." },
    { time: "01:00", title: "Video Sorpresa & Homenaje", desc: "Proyección especial en pantalla gigante." },
    { time: "02:30", title: "Brindis & Mesa Dulce", desc: "Corte de torta, brindis y degustación." },
    { time: "04:00", title: "Cotillón LED & Carnaval Carioca", desc: "Cotillón lumínico, robots LED y explosión disco." },
    { time: "06:00", title: "Desayuno & Fin de Fiesta", desc: "Churros calientes, medialunas y café de despedida." },
  ]
};

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/event-info", (_req, res) => {
  res.json(eventConfig);
});

// AI Concierge virtual assistant
app.post("/api/ai/concierge", async (req, res) => {
  try {
    const { question, guestName } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Pregunta requerida" });
    }

    const prompt = `
Eres la Asistente Virtual Concierge de Inteligencia Artificial para la fiesta de Mis 15 de ${eventConfig.honoree}.
Responde de forma sumamente educada, elegante, cordial, moderna y servicial.
Contexto del evento:
- Homenajeada: ${eventConfig.honoree} (${eventConfig.eventType})
- Fecha y Hora: ${eventConfig.date} (17 de Octubre)
- Lugar: ${eventConfig.venue} (${eventConfig.address})
- Dress Code: ${eventConfig.dressCode}
- Colores sugeridos: ${eventConfig.suggestedColors.join(", ")}
- Colores prohibidos: ${eventConfig.forbiddenColors.join(", ")}
- CBU/Alias para regalos: ${eventConfig.alias} / ${eventConfig.cbu}
- Cronograma: ${JSON.stringify(eventConfig.timeline)}

Pregunta del invitado (${guestName || "Invitado"}): "${question}"

Proporciona una respuesta breve, útil y amistosa en español, con emojis elegantes.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    res.json({ reply: response.text || "¡Hola! Con gusto te puedo ayudar con cualquier detalle del evento." });
  } catch (err: any) {
    console.error("AI Concierge error:", err);
    res.status(500).json({ 
      reply: `En este momento estoy consultando la información. La fiesta de 15 de ${eventConfig.honoree} es el 17 de Octubre a las 20:00 hs con dress code Elegante / Disco Chic.`
    });
  }
});

// AI Thank You Generator
app.post("/api/ai/generate-thanks", async (req, res) => {
  let guestName = "amigo/a";
  try {
    const { guestName: reqName, giftOrPresence } = req.body;
    if (reqName) guestName = reqName;

    const prompt = `
Escribe un mensaje de agradecimiento sumamente emotivo, dulce y elegante en nombre de ${eventConfig.honoree} para su invitado ${guestName} por su asistencia o regalo (${giftOrPresence || "asistir a sus 15 años"}).
Debe sonar cercano, festivo y cálido. Máximo 3 oraciones.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    res.json({ message: response.text || `¡Muchas gracias por acompañarme en una noche tan soñada, ${guestName}!` });
  } catch (err) {
    res.json({ message: `¡Querido/a ${guestName}, gracias de todo corazón por compartir conmigo este momento inolvidable de mis 15!` });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
