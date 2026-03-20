"use client";
import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Chess } from "chess.js";
import { UserContext } from "@/app/layout";
import ChessBoard from "@/components/ChessBoard";
import MoveHistory from "@/components/MoveHistory";
import CoachPanel from "@/components/CoachPanel";

export default function LobbyPage() {
  const { username } = useContext(UserContext);
  const router = useRouter();

  const [screen, setScreen] = useState("lobby"); // lobby | game
  const [rooms, setRooms] = useState([]);
  const [joinCode, setJoinCode] = useState("");
  const [currentRoom, setCurrentRoom] = useState(null);
  const [socket, setSocket] = useState(null);
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [playerColor, setPlayerColor] = useState("w");
  const [gameOver, setGameOver] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [connected, setConnected] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState("");
  const wsRef = useRef(null);

  const connectToServer = useCallback((url) => {
    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setConnected(true);
        setError("");
        ws.send(JSON.stringify({ type: "set_username", username }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "room_list":
            setRooms(data.rooms || []);
            break;

          case "room_created":
            setCurrentRoom(data.room);
            setPlayerColor(data.color);
            setWaiting(true);
            setScreen("game");
            break;

          case "room_joined":
            setCurrentRoom(data.room);
            setPlayerColor(data.color);
            setGame(new Chess());
            setMoveHistory([]);
            setLastMove(null);
            setGameOver(null);
            setWaiting(false);
            setScreen("game");
            break;

          case "game_start":
            setGame(new Chess());
            setMoveHistory([]);
            setLastMove(null);
            setGameOver(null);
            setWaiting(false);
            break;

          case "move":
            const g = new Chess();
            data.history.forEach((m) => g.move(m));
            setGame(new Chess(g.fen()));
            setMoveHistory(g.history());
            if (data.lastMove) setLastMove(data.lastMove);
            if (g.isGameOver()) {
              if (g.isCheckmate()) {
                const winner = g.turn() === "w" ? "Black" : "White";
                setGameOver({ type: "checkmate", message: `Checkmate! ${winner} wins!` });
              } else {
                setGameOver({ type: "draw", message: "Draw!" });
              }
            }
            break;

          case "chat":
            setChatMessages((prev) => [...prev, { author: data.author, text: data.text }]);
            break;

          case "opponent_disconnected":
            setGameOver({ type: "disconnect", message: "Opponent disconnected." });
            break;

          case "error":
            setError(data.message);
            break;
        }
      };

      ws.onclose = () => {
        setConnected(false);
        setWaiting(false);
      };

      ws.onerror = () => {
        setError("Connection failed. Check the server URL.");
        setConnected(false);
      };

      wsRef.current = ws;
      setSocket(ws);

    } catch (err) {
      setError("Invalid server URL");
    }
  }, [username]);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  const createRoom = () => {
    wsRef.current?.send(JSON.stringify({ type: "create_room" }));
  };

  const joinRoom = (code) => {
    wsRef.current?.send(JSON.stringify({ type: "join_room", code: code || joinCode }));
  };

  const handleMove = useCallback((moveObj) => {
    const gameCopy = new Chess();
    moveHistory.forEach((m) => gameCopy.move(m));

    try {
      const result = gameCopy.move(moveObj);
      if (!result) return false;

      wsRef.current?.send(
        JSON.stringify({
          type: "move",
          move: moveObj,
          history: gameCopy.history(),
          lastMove: { from: result.from, to: result.to },
        })
      );

      setGame(new Chess(gameCopy.fen()));
      setMoveHistory(gameCopy.history());
      setLastMove({ from: result.from, to: result.to });

      if (gameCopy.isGameOver()) {
        if (gameCopy.isCheckmate()) {
          const winner = gameCopy.turn() === "w" ? "Black" : "White";
          setGameOver({ type: "checkmate", message: `Checkmate! ${winner} wins!` });
        } else {
          setGameOver({ type: "draw", message: "Draw!" });
        }
      }

      return true;
    } catch {
      return false;
    }
  }, [moveHistory]);

  const sendChat = () => {
    if (!chatInput.trim()) return;
    wsRef.current?.send(JSON.stringify({ type: "chat", text: chatInput.trim() }));
    setChatMessages((prev) => [...prev, { author: username, text: chatInput.trim() }]);
    setChatInput("");
  };

  // Lobby screen
  if (screen === "lobby") {
    return (
      <div className="lobby-container">
        <h1>🌐 Online Arena</h1>
        <p>Connect to a server, create a room, or join an existing game.</p>

        {!connected ? (
          <div className="panel" style={{ padding: 24, maxWidth: 500 }}>
            <div className="panel-header" style={{ border: "none", padding: 0, marginBottom: 16 }}>
              <span className="panel-icon">🖧</span>
              Connect to Server
            </div>
            <div className="room-input-group" style={{ marginBottom: 12 }}>
              <input
                type="text"
                placeholder="ws://localhost:3001 or wss://your-server.com"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && connectToServer(serverUrl)}
                style={{ flex: 1, textTransform: "none", letterSpacing: "normal" }}
              />
              <button className="btn btn-primary btn-sm" onClick={() => connectToServer(serverUrl)}>
                Connect
              </button>
            </div>
            {error && (
              <div style={{ color: "var(--red)", fontSize: "0.85rem", marginTop: 8 }}>
                ⚠️ {error}
              </div>
            )}
            <div style={{ color: "var(--text-dim)", fontSize: "0.8rem", marginTop: 12 }}>
              💡 Run the Strategos server first, or connect to a deployed instance.
            </div>
          </div>
        ) : (
          <>
            <div style={{ color: "var(--green)", fontSize: "0.85rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", display: "inline-block" }}></span>
              Connected to {serverUrl}
            </div>

            <div className="lobby-actions">
              <button className="btn btn-primary" onClick={createRoom}>
                ➕ Create Room
              </button>
              <div className="room-input-group">
                <input
                  type="text"
                  placeholder="Room code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
                <button className="btn btn-secondary btn-sm" onClick={() => joinRoom()}>
                  Join
                </button>
              </div>
            </div>

            {error && (
              <div style={{ color: "var(--red)", fontSize: "0.85rem", marginBottom: 12 }}>
                ⚠️ {error}
              </div>
            )}

            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem", color: "var(--gold-primary)", marginBottom: 12 }}>
              Available Rooms
            </h2>
            <div className="rooms-list">
              {rooms.length === 0 && (
                <div style={{ color: "var(--text-dim)", textAlign: "center", padding: 24 }}>
                  No rooms available. Create one to start!
                </div>
              )}
              {rooms.map((room) => (
                <div className="room-card" key={room.code}>
                  <span className="room-code">{room.code}</span>
                  <span className="room-host">Host: {room.host}</span>
                  <span className="room-status">
                    <span className="dot"></span>
                    {room.players}/2
                  </span>
                  {room.players < 2 && (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ marginLeft: 12 }}
                      onClick={() => joinRoom(room.code)}
                    >
                      Join
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Online game screen
  return (
    <div className="game-container">
      {/* Left Panel */}
      <div className="game-left-panel">
        <div className="panel">
          <div className="player-info">
            <div className={`player-avatar ${playerColor === "w" ? "black-player" : "white-player"}`}>
              {playerColor === "w" ? "♚" : "♔"}
            </div>
            <div>
              <div className="player-name">Opponent</div>
              <div className="player-rating">Online</div>
            </div>
            {game.turn() !== playerColor && !gameOver && (
              <span className="player-turn-indicator"></span>
            )}
          </div>
        </div>

        <CoachPanel game={game} moveHistory={moveHistory} />

        {/* Chat */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-icon">💬</span>
            Chat
          </div>
          <div className="chat-container">
            <div className="chat-messages">
              {chatMessages.map((msg, i) => (
                <div className="chat-message" key={i}>
                  <span className="chat-author">{msg.author}:</span>
                  <span className="chat-text">{msg.text}</span>
                </div>
              ))}
            </div>
            <div className="chat-input-row">
              <input
                type="text"
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
              />
              <button onClick={sendChat}>Send</button>
            </div>
          </div>
        </div>
      </div>

      {/* Center — Board */}
      <div>
        {waiting && (
          <div className="status-bar" style={{ marginBottom: 12 }}>
            <span className="spinner" style={{ marginRight: 8 }}></span>
            Waiting for opponent to join...
            <span style={{ marginLeft: 12, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Room: <strong>{currentRoom?.code}</strong>
            </span>
          </div>
        )}

        {currentRoom && !waiting && (
          <div className="status-bar" style={{ marginBottom: 12 }}>
            Room: <strong style={{ marginLeft: 4 }}>{currentRoom.code}</strong>
            <span style={{ margin: "0 8px", color: "var(--text-dim)" }}>|</span>
            You play as {playerColor === "w" ? "White ♔" : "Black ♚"}
          </div>
        )}

        <ChessBoard
          game={game}
          onMove={handleMove}
          playerColor={playerColor}
          disabled={waiting || game.turn() !== playerColor || !!gameOver}
          lastMove={lastMove}
        />
      </div>

      {/* Right Panel */}
      <div className="game-right-panel">
        <div className="panel">
          <div className="player-info">
            <div className={`player-avatar ${playerColor === "w" ? "white-player" : "black-player"}`}>
              {playerColor === "w" ? "♔" : "♚"}
            </div>
            <div>
              <div className="player-name">{username || "You"}</div>
              <div className="player-rating">Online</div>
            </div>
            {game.turn() === playerColor && !gameOver && (
              <span className="player-turn-indicator"></span>
            )}
          </div>
        </div>

        <MoveHistory history={moveHistory} currentMoveIndex={moveHistory.length - 1} />
      </div>

      {/* Game Over */}
      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-modal">
            <div className="result-icon">
              {gameOver.type === "checkmate" ? "👑" :
               gameOver.type === "disconnect" ? "📡" : "🤝"}
            </div>
            <h2>{gameOver.type === "checkmate" ? "Checkmate!" :
                 gameOver.type === "disconnect" ? "Disconnected" : "Draw"}</h2>
            <p className="result-detail">{gameOver.message}</p>
            <button className="btn btn-primary" onClick={() => {
              setScreen("lobby");
              setGameOver(null);
              setCurrentRoom(null);
              setGame(new Chess());
              setMoveHistory([]);
            }}>
              🏛️ Return to Lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
