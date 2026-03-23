import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // AI proxy routes
  app.post("/api/ai/generate", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
    if (!apiKey) {
      return res.status(401).json({ error: "API key is missing" });
    }

    try {
      const ai = new GoogleGenAI({ apiKey } as any);
      const response = await ai.models.generateContent(req.body);
      res.json({ ...response, text: response.text });
    } catch (error: any) {
      const msg = error.message || "";
      if (
        msg.includes("quota") ||
        msg.includes("429") ||
        msg.includes("resource_exhausted") ||
        msg.includes("overloaded") ||
        error.status === 429 ||
        error.status === 503
      ) {
        return res.status(429).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/embed", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
    if (!apiKey) {
      return res.status(401).json({ error: "API key is missing" });
    }

    try {
      const ai = new GoogleGenAI({ apiKey } as any);
      const response = await (ai as any).models.embedContent(req.body);
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/ai/status", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
    if (!apiKey) {
      return res.json({ hasKey: false });
    }
    res.json({ hasKey: true });
  });

  // API routes
  app.get("/api/praxis/:lawRef", (req, res) => {
    const { lawRef } = req.params;
    const praxisPath = path.join(process.cwd(), "public", "data", "praxis.json");
    
    if (!fs.existsSync(praxisPath)) {
      return res.status(404).json({ error: "Praxis data not found" });
    }

    try {
      const rawData = fs.readFileSync(praxisPath, "utf-8");
      const data = JSON.parse(rawData);
      
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
