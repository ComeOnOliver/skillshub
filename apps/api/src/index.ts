import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { skillsRouter } from "./routes/skills.js";
import { authRouter } from "./routes/auth.js";
import { agentsRouter } from "./routes/agents.js";
import { apiKeysRouter } from "./routes/api-keys.js";
import { donationsRouter } from "./routes/donations.js";
import { errorHandler } from "./middleware/error.js";
import { rateLimit } from "./middleware/rate-limit.js";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  })
);
app.use("/api/*", rateLimit());
app.onError(errorHandler);

app.get("/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() })
);

// Routes
app.route("/api/v1/skills", skillsRouter);
app.route("/api/v1/auth", authRouter);
app.route("/api/v1/agents", agentsRouter);
app.route("/api/v1/api-keys", apiKeysRouter);
app.route("/api/v1", donationsRouter);

const port = Number(process.env.PORT ?? 3001);
console.log(`API server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });

export default app;
