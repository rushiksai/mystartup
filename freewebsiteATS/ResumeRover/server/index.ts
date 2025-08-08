
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import express from 'express';

const app = express();
const PORT = process.env.PORT || 5000; // Use the environment variable PORT or default to 5000

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

// Rest of your server logic here...

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware for logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Server setup
(async () => {
  try {
    const viteServer = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      console.error(err);
    });

    // Set up Vite in development
    if (app.get("env") === "development") {
      await setupVite(app, viteServer);
    } else {
      serveStatic(app);
    }

    // Serve the app on port 5000 at 0.0.0.0
    const port = parseInt(process.env.PORT ?? "5000", 10);
    const server = app.listen(port, "0.0.0.0", () => {
      log(`Server running on http://0.0.0.0:${port}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        log('Process terminated');
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
