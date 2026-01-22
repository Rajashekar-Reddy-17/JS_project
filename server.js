import express from "express";
import jsonServer from "json-server";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// ES module dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JSON Server
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

app.use(express.json());
app.use(middlewares);

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// APIs
app.use(router);

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "auth.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});