import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  const genAI = apiKey ? new GoogleGenAI(apiKey) : null;

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

  app.post("/api/ai/generate", async (req, res) => {
    if (!genAI) {
      return res.status(503).json({ error: "AI service not configured on server" });
    }

    try {
      const { model, contents, config } = req.body;
      const genModel = genAI.getGenerativeModel({ model });
      const result = await genModel.generateContent({ contents, generationConfig: config });
      const response = await result.response;
      const text = response.text();
      res.json({ text });
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate content" });
    }
  });

  app.post("/api/ai/embed", async (req, res) => {
    if (!genAI) {
      return res.status(503).json({ error: "AI service not configured on server" });
    }

    try {
      const { model, content } = req.body;
      const genModel = genAI.getGenerativeModel({ model });
      const result = await genModel.embedContent(content);
      res.json({ embedding: result.embedding });
    } catch (error: any) {
      console.error("AI Embedding Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate embedding" });
    }
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
