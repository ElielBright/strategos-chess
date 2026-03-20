/**
 * Strategos Chess — WebSocket Server for Online Multiplayer
 *
 * Run standalone: node server/index.js
 * Can also be deployed on Vercel, Railway, etc.
 */

const { WebSocketServer } = require("ws");
const http = require("http");
const { Chess } = require("chess.js");

const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  // Health check endpoint
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", rooms: Object.keys(rooms).length }));
    return;
  }

  // CORS headers
  res.writeHead(200, {
    "Content-Type": "text/plain",
    "Access-Control-Allow-Origin": "*",
  });
  res.end("Strategos Chess Server ♟️");
});

const wss = new WebSocketServer({ server });

// Game rooms
const rooms = {};
const clients = new Map();

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function broadcastRoomList() {
  const roomList = Object.values(rooms).map((r) => ({
    code: r.code,
    host: r.host,
    players: r.players.length,
  }));

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ type: "room_list", rooms: roomList }));
    }
  });
}

wss.on("connection", (ws) => {
  const clientId = Math.random().toString(36).substring(2);
  clients.set(ws, { id: clientId, username: "Anonymous", roomCode: null });

  // Send initial room list
  const roomList = Object.values(rooms).map((r) => ({
    code: r.code,
    host: r.host,
    players: r.players.length,
  }));
  ws.send(JSON.stringify({ type: "room_list", rooms: roomList }));

  ws.on("message", (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      return;
    }

    const client = clients.get(ws);

    switch (msg.type) {
      case "set_username":
        client.username = msg.username || "Anonymous";
        break;

      case "create_room": {
        let code = generateCode();
        while (rooms[code]) code = generateCode();

        const room = {
          code,
          host: client.username,
          players: [{ ws, clientId: client.id, username: client.username, color: "w" }],
          game: new Chess(),
          history: [],
        };

        rooms[code] = room;
        client.roomCode = code;

        ws.send(
          JSON.stringify({
            type: "room_created",
            room: { code, host: client.username },
            color: "w",
          })
        );

        broadcastRoomList();
        break;
      }

      case "join_room": {
        const code = msg.code?.toUpperCase();
        const room = rooms[code];

        if (!room) {
          ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
          break;
        }

        if (room.players.length >= 2) {
          ws.send(JSON.stringify({ type: "error", message: "Room is full" }));
          break;
        }

        room.players.push({
          ws,
          clientId: client.id,
          username: client.username,
          color: "b",
        });
        client.roomCode = code;

        ws.send(
          JSON.stringify({
            type: "room_joined",
            room: { code, host: room.host },
            color: "b",
          })
        );

        // Notify host that game is starting
        room.players[0].ws.send(
          JSON.stringify({
            type: "game_start",
            opponent: client.username,
          })
        );

        broadcastRoomList();
        break;
      }

      case "move": {
        const room = rooms[client.roomCode];
        if (!room) break;

        // Forward move to opponent
        room.history = msg.history || [];

        room.players.forEach((p) => {
          if (p.ws !== ws && p.ws.readyState === 1) {
            p.ws.send(
              JSON.stringify({
                type: "move",
                move: msg.move,
                history: msg.history,
                lastMove: msg.lastMove,
              })
            );
          }
        });
        break;
      }

      case "chat": {
        const room = rooms[client.roomCode];
        if (!room) break;

        room.players.forEach((p) => {
          if (p.ws !== ws && p.ws.readyState === 1) {
            p.ws.send(
              JSON.stringify({
                type: "chat",
                author: client.username,
                text: msg.text,
              })
            );
          }
        });
        break;
      }
    }
  });

  ws.on("close", () => {
    const client = clients.get(ws);

    if (client?.roomCode) {
      const room = rooms[client.roomCode];
      if (room) {
        // Notify other player
        room.players.forEach((p) => {
          if (p.ws !== ws && p.ws.readyState === 1) {
            p.ws.send(JSON.stringify({ type: "opponent_disconnected" }));
          }
        });

        // Remove room if empty
        room.players = room.players.filter((p) => p.ws !== ws);
        if (room.players.length === 0) {
          delete rooms[client.roomCode];
        }

        broadcastRoomList();
      }
    }

    clients.delete(ws);
  });
});

server.listen(PORT, () => {
  console.log(`\n  ♟️  Strategos Chess Server`);
  console.log(`  ========================`);
  console.log(`  🖧  WebSocket: ws://localhost:${PORT}`);
  console.log(`  📡 Health:    http://localhost:${PORT}/health\n`);
});
