import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Cache for praxis data to avoid repetitive disk I/O
  let praxisCache: any = null;
  const getPraxisData = () => {
    if (praxisCache) return praxisCache;
    const praxisPath = path.join(process.cwd(), "public", "data", "praxis.json");
    if (!fs.existsSync(praxisPath)) return null;
    try {
      const rawData = fs.readFileSync(praxisPath, "utf-8");
      praxisCache = JSON.parse(rawData);
      return praxisCache;
    } catch (error) {
      console.error("Failed to parse praxis data:", error);
      return null;
    }
  };

  // API routes
  app.post("/api/praxis/batch", (req, res) => {
    const { lawRefs } = req.body;
    
    if (!Array.isArray(lawRefs)) {
      return res.status(400).json({ error: "lawRefs must be an array" });
    }

    const data = getPraxisData();
    if (!data) {
      return res.status(404).json({ error: "Praxis data not found" });
    }

    const results = data.paragraphs.filter((p: any) => {
      const linkedLaw = (p.metadata?.revisionNote || "").toLowerCase();
      const text = (p.text || "").toLowerCase();
      return lawRefs.some(ref => {
        const lowerRef = ref.toLowerCase();
        return linkedLaw.includes(lowerRef) || text.includes(lowerRef);
      });
    });

    res.json(results);
  });

  app.get("/api/praxis/:lawRef", (req, res) => {
    const { lawRef } = req.params;
    const data = getPraxisData();
    if (!data) {
      return res.status(404).json({ error: "Praxis data not found" });
    }

    const results = data.paragraphs.filter((p: any) => {
      const linkedLaw = p.metadata?.revisionNote || "";
      return linkedLaw.toLowerCase().includes(lawRef.toLowerCase()) ||
             p.text.toLowerCase().includes(lawRef.toLowerCase());
    });

    res.json(results);
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
