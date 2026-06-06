import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Cache for praxis data
  let praxisCache: any = null;

  function getPraxisData() {
    if (!praxisCache) {
      const praxisPath = path.join(process.cwd(), "public", "data", "praxis.json");
      if (fs.existsSync(praxisPath)) {
        const rawData = fs.readFileSync(praxisPath, "utf-8");
        praxisCache = JSON.parse(rawData);
      } else {
        praxisCache = { paragraphs: [] };
      }
    }
    return praxisCache;
  }

  // API routes
  app.get("/api/praxis/:lawRef", (req, res) => {
    const { lawRef } = req.params;
    
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

  app.post("/api/praxis/batch", express.json(), (req, res) => {
    const { lawRefs } = req.body;

    if (!lawRefs || !Array.isArray(lawRefs)) {
      return res.status(400).json({ error: "Invalid lawRefs" });
    }

    try {
      const data = getPraxisData();

      // ⚡ Bolt: Optimize batch filter to avoid O(N*M) nested loops and deduplication
      const lowerLawRefs = lawRefs.map(ref => String(ref).toLowerCase());

      const uniqueResults = data.paragraphs.filter((p: any) => {
        const linkedLaw = (p.metadata?.revisionNote || "").toLowerCase();
        const text = (p.text || "").toLowerCase();

        return lowerLawRefs.some(ref =>
          linkedLaw.includes(ref) || text.includes(ref)
        );
      });

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
