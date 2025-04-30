// server.js – Glitch-geschikte WebSocket server + frontend

const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// 📁 Statische bestanden (zoals index.html)
app.use(express.static(path.join(__dirname, ".")));

wss.on("connection", (socket) => {
  console.log("✅ Verbonden via WebSocket");

  socket.on("message", (msg) => {
    console.log("📩 Bericht:", msg);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  });

  socket.on("close", () => {
    console.log("❌ Verbinding gesloten");
  });
});

server.listen(PORT, () => {
  console.log(`🟢 Server draait op poort ${PORT}`);
});
