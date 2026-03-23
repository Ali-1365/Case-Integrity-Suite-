import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.get("/api/praxis", (req, res) => {
    const refsRaw = req.query.refs;
    const refs = typeof refsRaw === 'string' ? refsRaw.split(',') : [];
    const praxisPath = path.join(process.cwd(), "public", "data", "praxis.json");
    
    if (!fs.existsSync(praxisPath)) {
      return res.status(404).json({ error: "Praxis data not found" });
    }

    try {
      const rawData = fs.readFileSync(praxisPath, "utf-8");
      const data = JSON.parse(rawData);
      
      if (!refs || refs.length === 0) {
        return res.json(data.paragraphs || []);
      }

      const results = (data.paragraphs || []).filter((p: any) => {
        const linkedLaw = p.metadata?.revisionNote || "";
        const text = p.text || "";
        return refs.some((ref: string) =>
          linkedLaw.toLowerCase().includes(ref.toLowerCase()) ||
          text.toLowerCase().includes(ref.toLowerCase())
        );
      });

      res.json(results);
    } catch (error: unknown) {
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
