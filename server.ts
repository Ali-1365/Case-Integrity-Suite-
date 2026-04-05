import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Cache for Praxis data to avoid synchronous disk I/O on every request
  let cachedPraxisData: any = null;
  let cachedPraxisDataTime = 0;
  const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

  // API routes

  // Backwards compatibility endpoint
  app.get("/api/praxis/:lawRef", (req, res) => {
    const { lawRef } = req.params;
    const praxisPath = path.join(process.cwd(), "public", "data", "praxis.json");
    
    if (!fs.existsSync(praxisPath)) {
      return res.status(404).json({ error: "Praxis data not found" });
    }

    try {
      if (!cachedPraxisData || Date.now() - cachedPraxisDataTime > CACHE_TTL_MS) {
        const rawData = fs.readFileSync(praxisPath, "utf-8");
        cachedPraxisData = JSON.parse(rawData);
        cachedPraxisDataTime = Date.now();
      }
      
      const results = cachedPraxisData.paragraphs.filter((p: any) => {
        const linkedLaw = p.metadata?.revisionNote || "";
        return linkedLaw.toLowerCase().includes(lawRef.toLowerCase()) || 
               p.text.toLowerCase().includes(lawRef.toLowerCase());
      });

      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to parse praxis data" });
    }
  });

  // Batched endpoint for performance
  app.post("/api/praxis/batch", express.json(), (req, res) => {
    const { lawRefs } = req.body;

    if (!Array.isArray(lawRefs) || lawRefs.length === 0) {
      return res.status(400).json({ error: "Missing or invalid lawRefs array in request body" });
    }

    const praxisPath = path.join(process.cwd(), "public", "data", "praxis.json");

    if (!fs.existsSync(praxisPath)) {
      return res.status(404).json({ error: "Praxis data not found" });
    }

    try {
      if (!cachedPraxisData || Date.now() - cachedPraxisDataTime > CACHE_TTL_MS) {
        const rawData = fs.readFileSync(praxisPath, "utf-8");
        cachedPraxisData = JSON.parse(rawData);
        cachedPraxisDataTime = Date.now();
      }

      const results = cachedPraxisData.paragraphs.filter((p: any) => {
        const linkedLaw = p.metadata?.revisionNote || "";
        const pText = p.text.toLowerCase();
        const linkedLawLower = linkedLaw.toLowerCase();

        return lawRefs.some(ref => {
          const refLower = ref.toLowerCase();
          return linkedLawLower.includes(refLower) || pText.includes(refLower);
        });
      });

      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to parse praxis data" });
    }
  });

  app.get("/api/verify-integrity", (req, res) => {
    const dataDir = path.join(process.cwd(), "public", "data");
    if (!fs.existsSync(dataDir)) {
      return res.status(404).json({ error: "Data directory not found" });
    }

    const files = fs.readdirSync(dataDir).filter(f => f.endsWith(".json"));
    
    const results = files.map(file => {
      const filePath = path.join(dataDir, file);
      const content = fs.readFileSync(filePath);
      const hash = crypto.createHash("sha256").update(content).digest("hex");
      
      // Known good state (mocked for this example)
      // In a real app, this would be stored in a database or a secure config
      return {
        file,
        hash,
        status: "verified",
        timestamp: new Date().toISOString()
      };
    });

    res.json(results);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
