const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, ".")));

let users = new Map(); // socket => username

function broadcastOnlineUsers() {
  const names = Array.from(users.values());
  const msg = JSON.stringify({ type: "users", users: names });
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

wss.on("connection", (socket) => {
  console.log("✅ Nieuwe verbinding gemaakt");

  socket.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.type === "register") {
        users.set(socket, data.name);
        broadcastOnlineUsers();
      }

      else if (data.type === "message") {
        const payload = JSON.stringify({
          type: "message",
          name: data.name,
          iv: data.iv,               // stuur IV mee
          encrypted: data.encrypted // stuur encrypted data mee
        });

        for (const client of wss.clients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
          }
        }
      }

    } catch (e) {
      console.error("❌ Fout bij verwerken bericht:", e);
    }
  });

  socket.on("close", () => {
    users.delete(socket);
    broadcastOnlineUsers();
    console.log("❌ Verbinding gesloten");
  });
});

server.listen(PORT, () => {
  console.log(`🟢 Server draait op poort ${PORT}`);
});
