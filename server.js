
const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, ".")));

let users = new Map(); // naam => socket

function updateUserList() {
  const names = Array.from(users.keys());
  const msg = JSON.stringify({ type: "users", users: names });
  for (const socket of users.values()) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(msg);
    }
  }
}

wss.on("connection", (socket) => {
  let username = null;

  socket.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.type === "register") {
        username = data.name;
        users.set(username, socket);
        updateUserList();
      }

      else if (data.type === "message") {
        const toSocket = users.get(data.to);
        if (toSocket && toSocket.readyState === WebSocket.OPEN) {
          toSocket.send(JSON.stringify({
            type: "message",
            from: username,
            encrypted: data.encrypted
          }));
        }
      }
    } catch (err) {
      console.error("Fout bij verwerken:", err);
    }
  });

  socket.on("close", () => {
    if (username) {
      users.delete(username);
      updateUserList();
    }
  });
});

server.listen(PORT, () => {
  console.log(`🟢 Server draait op poort ${PORT}`);
});
