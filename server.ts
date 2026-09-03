import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

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
