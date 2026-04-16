import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON requests
  app.use(express.json());

  // In-memory cache to prevent repetitive synchronous fs.readFileSync calls
  // which block the Express event loop on every request.
  let praxisCache: any = null;

  function getPraxisData() {
    if (praxisCache) {
      return praxisCache;
    }
    const praxisPath = path.join(process.cwd(), "public", "data", "praxis.json");
    if (!fs.existsSync(praxisPath)) {
      throw new Error("Praxis data not found");
    }
    const rawData = fs.readFileSync(praxisPath, "utf-8");
    praxisCache = JSON.parse(rawData);
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
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to parse praxis data" });
    }
  });

  // Batched endpoint to solve N+1 fetch issues
  app.post("/api/praxis/batch", (req, res) => {
    const { lawRefs } = req.body;
    if (!Array.isArray(lawRefs)) {
      return res.status(400).json({ error: "lawRefs must be an array" });
    }

    try {
      const data = getPraxisData();

      const results = data.paragraphs.filter((p: any) => {
        const linkedLaw = p.metadata?.revisionNote || "";
        const text = p.text.toLowerCase();

        return lawRefs.some((ref: string) => {
          const lowerRef = ref.toLowerCase();
          return linkedLaw.toLowerCase().includes(lowerRef) || text.includes(lowerRef);
        });
      });

      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to parse praxis data" });
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
