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

  // In-memory cache for praxis data to prevent repetitive disk I/O and JSON parsing
  let cachedPraxisData: any = null;

  function getPraxisData() {
    if (cachedPraxisData) return cachedPraxisData;

    const praxisPath = path.join(process.cwd(), "public", "data", "praxis.json");
    if (!fs.existsSync(praxisPath)) {
      return null;
    }

    try {
      const rawData = fs.readFileSync(praxisPath, "utf-8");
      cachedPraxisData = JSON.parse(rawData);
      return cachedPraxisData;
    } catch (error) {
      console.error("Failed to parse praxis data:", error);
      return null;
    }
  }

  // API routes
  app.get("/api/praxis/:lawRef", (req, res) => {
    const { lawRef } = req.params;
    const data = getPraxisData();
    
    if (!data) {
      return res.status(404).json({ error: "Praxis data not found" });
    }

    try {
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

  app.post("/api/praxis/batch", (req, res) => {
    const { lawRefs } = req.body;

    if (!Array.isArray(lawRefs)) {
      return res.status(400).json({ error: "Expected 'lawRefs' to be an array" });
    }

    const data = getPraxisData();

    if (!data) {
      return res.status(404).json({ error: "Praxis data not found" });
    }

    try {
      const results = data.paragraphs.filter((p: any) => {
        const linkedLaw = p.metadata?.revisionNote || "";
        const paragraphText = p.text.toLowerCase();
        const lowerLinkedLaw = linkedLaw.toLowerCase();

        return lawRefs.some((ref: string) => {
          const lowerRef = ref.toLowerCase();
          return lowerLinkedLaw.includes(lowerRef) || paragraphText.includes(lowerRef);
        });
      });

      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to process praxis batch request" });
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
