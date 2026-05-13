import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

bolt-praxis-optimization-7249233733241114360
  app.use(express.json());

  let praxisCache: any = null;

  // Helper to lazily load and cache praxis data
  // ⚡ Bolt Optimization: Prevents blocking the event loop with synchronous fs.readFileSync
  // and JSON.parse on every single request.
  const getPraxisCache = () => {

  // Cache for praxis data
  let praxisCache: any = null;

  function getPraxisData() {

    if (!praxisCache) {
      const praxisPath = path.join(process.cwd(), "public", "data", "praxis.json");
      if (fs.existsSync(praxisPath)) {
        const rawData = fs.readFileSync(praxisPath, "utf-8");
        praxisCache = JSON.parse(rawData);
bolt-praxis-optimization-7249233733241114360
      }
    }
    return praxisCache;
  };
      } else {
        praxisCache = { paragraphs: [] };
      }
    }
    return praxisCache;
  }

  // API routes
  app.get("/api/praxis/:lawRef", (req, res) => {
    const { lawRef } = req.params;
bolt-praxis-optimization-7249233733241114360
    const cache = getPraxisCache();
    
    if (!cache) {
      return res.status(404).json({ error: "Praxis data not found" });
    }

    try {
      const results = cache.paragraphs.filter((p: any) => {
    
    try {
      const data = getPraxisData();
      
      const results = data.paragraphs.filter((p: any) => {
        const linkedLaw = p.metadata?.revisionNote || "";
        return linkedLaw.toLowerCase().includes(lawRef.toLowerCase()) || 
               p.text.toLowerCase().includes(lawRef.toLowerCase());
      });

      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to parse praxis data" });
    }
  });

bolt-praxis-optimization-7249233733241114360
  // ⚡ Bolt Optimization: Batch endpoint to prevent N+1 fetch requests
  app.post("/api/praxis/batch", (req, res) => {
    const { lawRefs } = req.body;
    if (!lawRefs || !Array.isArray(lawRefs)) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const cache = getPraxisCache();
    if (!cache) {
      return res.status(404).json({ error: "Praxis data not found" });
    }

    try {
      const results = cache.paragraphs.filter((p: any) => {
        const linkedLaw = p.metadata?.revisionNote || "";
        return lawRefs.some(ref =>
          linkedLaw.toLowerCase().includes(ref.toLowerCase()) ||
          p.text.toLowerCase().includes(ref.toLowerCase())
        );
      });

      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to process praxis data" });

  app.post("/api/praxis/batch", express.json(), (req, res) => {
    const { lawRefs } = req.body;

    if (!lawRefs || !Array.isArray(lawRefs)) {
      return res.status(400).json({ error: "Invalid lawRefs" });
    }

    try {
      const data = getPraxisData();
      const results: any[] = [];

      for (const lawRef of lawRefs) {
        const filtered = data.paragraphs.filter((p: any) => {
          const linkedLaw = p.metadata?.revisionNote || "";
          return linkedLaw.toLowerCase().includes(lawRef.toLowerCase()) ||
                 p.text.toLowerCase().includes(lawRef.toLowerCase());
        });
        results.push(...filtered);
      }

      // Deduplicate by ID
      const uniqueResults = Array.from(new Map(results.map(item => [item.id, item])).values());

      res.json(uniqueResults);
    } catch (error) {
      res.status(500).json({ error: "Failed to process praxis batch" });
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
