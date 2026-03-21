"use client";
import { useState, useEffect, useContext, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Chess } from "chess.js";
import { UserContext } from "@/app/layout";
import ChessBoard from "@/components/ChessBoard";
import MoveHistory from "@/components/MoveHistory";
import CoachPanel from "@/components/CoachPanel";

function LobbyContent() {
  const { username } = useContext(UserContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const peerParam = searchParams.get("peer"); // If present, we are joining someone's game

  const [screen, setScreen] = useState("lobby"); // lobby | game
  const [myPeerId, setMyPeerId] = useState("");
  const [currentRoom, setCurrentRoom] = useState(null);
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [playerColor, setPlayerColor] = useState("w");
  const [gameOver, setGameOver] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const [opponentName, setOpponentName] = useState("Opponent");
  const [joinCode, setJoinCode] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const peerRef = useRef(null);
  const connRef = useRef(null);

  // Initialize peer connection
  const initPeer = useCallback(() => {
    return new Promise((resolve, reject) => {
      import("peerjs").then(({ default: Peer }) => {
        const peer = new Peer();

        peer.on("open", (id) => {
          setMyPeerId(id);
          peerRef.current = peer;
          resolve(peer);
        });

        peer.on("error", (err) => {
          console.error("Peer error:", err);
          setError(`Connection error: ${err.type}`);
          reject(err);
        });

        peer.on("disconnected", () => {
          setConnected(false);
        });
      });
    });
  }, []);

  // Setup data channel handlers
  const setupConnection = useCallback((conn, isHost) => {
    connRef.current = conn;

    const sendIdentity = () => {
      conn.send({ type: "username", name: username || "Guest" });
    };

    conn.on("open", () => {
      setConnected(true);
      setWaiting(false);
      setScreen("game");

      // Send our username
      sendIdentity();

      // If host, send game start signal with color assignment
      if (isHost) {
        conn.send({ type: "game_start", hostColor: "w" });
        setPlayerColor("w");
      }
    });

    // If connection is already open (race condition), send identity immediately
    if (conn.open) {
      setConnected(true);
      setWaiting(false);
      setScreen("game");
      sendIdentity();
      if (isHost) {
        conn.send({ type: "game_start", hostColor: "w" });
        setPlayerColor("w");
      }
    }

    conn.on("data", (data) => {
      switch (data.type) {
        case "username":
          setOpponentName(data.name);
          break;

        case "game_start":
          // Guest receives color assignment (opposite of host)
          setPlayerColor(data.hostColor === "w" ? "b" : "w");
          setGame(new Chess());
          setMoveHistory([]);
          setLastMove(null);
          setGameOver(null);
          // Re-send our identity to guarantee the host gets it
          conn.send({ type: "username", name: username || "Guest" });
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

        case "resign":
          setGameOver({ type: "resign", message: `${data.player} resigned!` });
          break;
      }
    });

    conn.on("close", () => {
      setConnected(false);
      if (!gameOver) {
        setGameOver({ type: "disconnect", message: "Opponent disconnected." });
      }
    });

    conn.on("error", (err) => {
      setError(`Connection error: ${err}`);
    });
  }, [username, gameOver]);

  // Host: Create a room and wait for someone to join
  const createRoom = useCallback(async () => {
    try {
      setError("");
      const peer = await initPeer();

      setCurrentRoom({ code: peer.id?.slice(0, 8)?.toUpperCase() || "ROOM" });
      setWaiting(true);
      setScreen("game");

      // Listen for incoming connections
      peer.on("connection", (conn) => {
        setupConnection(conn, true);
      });
    } catch {
      setError("Failed to create room. Please try again.");
    }
  }, [initPeer, setupConnection]);

  // Guest: Join a host's room
  const joinRoom = useCallback(async (rawInput) => {
    if (!rawInput) {
      setError("Please enter a valid room code.");
      return;
    }
    // If user pasted a full invite link, extract the peer ID from it
    let hostPeerId = rawInput.trim();
    try {
      const url = new URL(hostPeerId);
      const extracted = url.searchParams.get("peer");
      if (extracted) hostPeerId = extracted;
    } catch {
      // Not a URL, use as-is (it's a raw peer ID)
    }
    try {
      setError("");
      const peer = await initPeer();
      const conn = peer.connect(hostPeerId);
      setupConnection(conn, false);
      setCurrentRoom({ code: hostPeerId.slice(0, 8).toUpperCase() });
    } catch {
      setError("Failed to join room. Please try again.");
    }
  }, [initPeer, setupConnection]);

  // Auto-join if URL has ?peer= parameter
  useEffect(() => {
    if (peerParam && !connected && !connRef.current) {
      joinRoom(peerParam);
    }
  }, [peerParam, connected, joinRoom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      connRef.current?.close();
      peerRef.current?.destroy();
    };
  }, []);

  const handleMove = useCallback((moveObj) => {
    const gameCopy = new Chess();
    moveHistory.forEach((m) => gameCopy.move(m));

    try {
      const result = gameCopy.move(moveObj);
      if (!result) return false;

      // Send move to opponent
      connRef.current?.send({
        type: "move",
        move: moveObj,
        history: gameCopy.history(),
        lastMove: { from: result.from, to: result.to },
      });

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
    connRef.current?.send({ type: "chat", author: username || "You", text: chatInput.trim() });
    setChatMessages((prev) => [...prev, { author: username || "You", text: chatInput.trim() }]);
    setChatInput("");
  };

  const copyInviteLink = () => {
    const peerId = peerRef.current?.id;
    if (peerId) {
      const link = `${window.location.origin}/lobby?peer=${peerId}`;
      navigator.clipboard?.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  // Lobby screen
  if (screen === "lobby") {
    return (
      <div className="lobby-container">
        <h1>🌐 Online Arena</h1>
        <p>Play chess with a friend — no server needed! Create a room and share your invite link.</p>

        <div className="lobby-actions" style={{ marginTop: 24 }}>
          <button className="btn btn-primary btn-lg" onClick={createRoom} style={{ width: "100%", padding: "16px" }}>
            ✦ Create Room & Get Invite Link
          </button>
        </div>

        <div style={{ margin: "24px 0", textAlign: "center", color: "var(--text-dim)", fontSize: "0.85rem" }}>
          — or join a friend&apos;s game —
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <div className="panel-header" style={{ border: "none", padding: 0, marginBottom: 12 }}>
            <span className="panel-icon">⧉</span>
            Join with Room Code
          </div>
          <div className="room-input-group">
            <input
              type="text"
              placeholder="Paste Peer ID from invite link"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && joinRoom(joinCode)}
              style={{ flex: 1, textTransform: "none", letterSpacing: "normal" }}
            />
            <button className="btn btn-secondary btn-sm" onClick={() => joinRoom(joinCode)}>
              Join
            </button>
          </div>
          <div style={{ color: "var(--text-dim)", fontSize: "0.8rem", marginTop: 8 }}>
            ▹ Ask your friend to send you their invite link — it will auto-join!
          </div>
        </div>

        {error && (
          <div style={{ color: "var(--red)", fontSize: "0.85rem", marginTop: 12, textAlign: "center" }}>
            ⚠️ {error}
          </div>
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
              <div className="player-name">{opponentName}</div>
              <div className="player-rating">Online</div>
            </div>
            {game.turn() !== playerColor && !gameOver && (
              <span className="player-turn-indicator"></span>
            )}
          </div>
        </div>

        <CoachPanel game={game} moveHistory={moveHistory} playerColor={playerColor} />

        {/* Chat */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-icon">≡</span>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span className="spinner" style={{ marginRight: 8, verticalAlign: 'middle' }}></span>
                <span style={{ verticalAlign: 'middle' }}>Waiting for opponent...</span>
              </div>
              <button
                className={`btn ${linkCopied ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                onClick={copyInviteLink}
              >
                {linkCopied ? '✓ Link Copied!' : '⧉ Copy Invite Link'}
              </button>
            </div>
          </div>
        )}

        {currentRoom && !waiting && (
          <div className="status-bar" style={{ marginBottom: 12 }}>
            ● Connected
            <span style={{ margin: "0 8px", color: "var(--text-dim)" }}>|</span>
            You play as {playerColor === "w" ? "White ♔" : "Black ♚"}
            <span style={{ margin: "0 8px", color: "var(--text-dim)" }}>|</span>
            vs <strong style={{ marginLeft: 4 }}>{opponentName}</strong>
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

      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-modal">
            <div className="result-icon">
              {gameOver.type === "checkmate" ? "♛" :
               gameOver.type === "disconnect" ? "⚠" :
               gameOver.type === "resign" ? "⚐" : "⚖"}
            </div>
            <h2>{gameOver.type === "checkmate" ? "Checkmate!" :
                 gameOver.type === "disconnect" ? "Disconnected" :
                 gameOver.type === "resign" ? "Resignation" : "Draw"}</h2>
            <p className="result-detail">{gameOver.message}</p>
            <button className="btn btn-primary" onClick={() => {
              setScreen("lobby");
              setGameOver(null);
              setCurrentRoom(null);
              setGame(new Chess());
              setMoveHistory([]);
              setConnected(false);
              setWaiting(false);
              connRef.current?.close();
              peerRef.current?.destroy();
              peerRef.current = null;
              connRef.current = null;
              window.history.replaceState(null, '', '/lobby');
            }}>
              ⌂ Return to Lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LobbyPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 64px)" }}>
        <div className="spinner" style={{ width: 32, height: 32 }}></div>
      </div>
    }>
      <LobbyContent />
    </Suspense>
  );
}
