"use client";
import { useState, useCallback, useEffect, useContext, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Chess } from "chess.js";
import ChessBoard from "@/components/ChessBoard";
import MoveHistory from "@/components/MoveHistory";
import CoachPanel from "@/components/CoachPanel";
import { UserContext } from "@/app/layout";
import { getComputerMove } from "@/lib/engine";
import { getOracleMove } from "@/lib/ollamaClient";

const PIECE_UNICODE = {
  p: "♟", n: "♞", b: "♝", r: "♜", q: "♛",
  P: "♙", N: "♘", B: "♗", R: "♖", Q: "♕",
};

function PlayContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || null;
  const { username } = useContext(UserContext);

  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [capturedPieces, setCapturedPieces] = useState({ w: [], b: [] });
  const [gameOver, setGameOver] = useState(null);
  const [showSetup, setShowSetup] = useState(true);
  const [gameMode, setGameMode] = useState(mode || "local");
  const [difficulty, setDifficulty] = useState("scholar");
  const [playerColor, setPlayerColor] = useState("w");
  const [isThinking, setIsThinking] = useState(false);
  const [boardTheme, setBoardTheme] = useState("classic");
  const [coachHighlight, setCoachHighlight] = useState(null);
  const gameRef = useRef(game);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  const checkGameOver = useCallback((g) => {
    if (g.isCheckmate()) {
      const winner = g.turn() === "w" ? "Black" : "White";
      setGameOver({ type: "checkmate", winner, message: `Checkmate! ${winner} wins!` });
    } else if (g.isStalemate()) {
      setGameOver({ type: "stalemate", message: "Stalemate! It's a draw." });
    } else if (g.isDraw()) {
      setGameOver({ type: "draw", message: "Draw!" });
    } else if (g.isThreefoldRepetition()) {
      setGameOver({ type: "draw", message: "Draw by threefold repetition." });
    } else if (g.isInsufficientMaterial()) {
      setGameOver({ type: "draw", message: "Draw by insufficient material." });
    }
  }, []);

  const makeComputerMove = useCallback(async (g, diff) => {
    setIsThinking(true);

    await new Promise((r) => setTimeout(r, 400 + Math.random() * 600));

    let move;
    if (diff === "oracle") {
      const oracleMove = await getOracleMove(g.fen(), g.history());
      if (oracleMove) {
        try {
          const result = g.move(oracleMove);
          if (result) {
            move = result;
          }
        } catch {
          // Oracle returned invalid move; fall back to engine
          g.undo();
        }
      }
    }

    if (!move) {
      const engineMove = getComputerMove(g, diff);
      if (engineMove) {
        move = g.move(engineMove);
      }
    }

    if (move) {
      const newGame = new Chess();
      newGame.loadPgn(g.pgn());

      if (move.captured) {
        setCapturedPieces((prev) => ({
          ...prev,
          [move.color]: [...prev[move.color], move.captured],
        }));
      }

      setGame(newGame);
      setMoveHistory(newGame.history());
      setLastMove({ from: move.from, to: move.to });
      checkGameOver(newGame);
    }

    setIsThinking(false);
  }, [checkGameOver]);

  const handleMove = useCallback((moveObj) => {
    setCoachHighlight(null);
    const freshGame = new Chess();
    freshGame.loadPgn(game.pgn());

    try {
      const result = freshGame.move(moveObj);
      if (!result) return false;

      const newGame = new Chess();
      newGame.loadPgn(freshGame.pgn());

      if (result.captured) {
        setCapturedPieces((prev) => ({
          ...prev,
          [result.color]: [...prev[result.color], result.captured],
        }));
      }

      setGame(newGame);
      setMoveHistory(newGame.history());
      setLastMove({ from: result.from, to: result.to });
      checkGameOver(newGame);

      // Computer's turn in vs computer mode
      if (gameMode === "computer" && !newGame.isGameOver()) {
        setTimeout(() => {
          const compFresh = new Chess();
          compFresh.loadPgn(newGame.pgn());
          makeComputerMove(compFresh, difficulty);
        }, 100);
      }

      return true;
    } catch {
      return false;
    }
  }, [game, gameMode, difficulty, makeComputerMove, checkGameOver]);

  const startNewGame = useCallback(() => {
    setCoachHighlight(null);
    const newGame = new Chess();
    setGame(newGame);
    setMoveHistory([]);
    setLastMove(null);
    setCapturedPieces({ w: [], b: [] });
    setGameOver(null);
    setShowSetup(false);

    // If player is black in computer mode, make computer move first
    if (gameMode === "computer" && playerColor === "b") {
      setTimeout(() => {
        const g = new Chess();
        makeComputerMove(g, difficulty);
      }, 500);
    }
  }, [gameMode, playerColor, difficulty, makeComputerMove]);

  const resignGame = useCallback(() => {
    const winner = game.turn() === "w" ? "Black" : "White";
    setGameOver({ type: "resign", winner, message: `${game.turn() === "w" ? "White" : "Black"} resigned. ${winner} wins!` });
  }, [game]);

  const getPlayerName = (color) => {
    if (gameMode === "local") return color === "w" ? "White" : "Black";
    if (gameMode === "computer") {
      return color === playerColor ? (username || "You") : `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} AI`;
    }
    return color === "w" ? "White" : "Black";
  };

  const isPlayerTurn = gameMode === "computer"
    ? game.turn() === playerColor
    : true;

  if (showSetup) {
    return (
      <div className="modal-overlay">
        <div className="modal" style={{ position: 'relative' }}>
          <button 
             onClick={() => setShowSetup(false)} 
             style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-dim)' }}
             title="Close"
          >×</button>
          <h2>⚔ New Game</h2>
          <p>Configure your battle</p>

          <div className="modal-group">
            <label>Game Mode</label>
            <div className="color-options">
              <div
                className={`color-option ${gameMode === "local" ? "selected" : ""}`}
                onClick={() => setGameMode("local")}
              >
                <span className="color-icon">⚔</span>
                Local
              </div>
              <div
                className={`color-option ${gameMode === "computer" ? "selected" : ""}`}
                onClick={() => setGameMode("computer")}
              >
                <span className="color-icon">⛊</span>
                Computer
              </div>
            </div>
          </div>

          <div className="modal-group">
            <label>Board Theme</label>
            <select 
              value={boardTheme} 
              onChange={(e) => setBoardTheme(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', marginTop: '8px', fontSize: '0.95rem' }}
            >
              <option value="classic">Classic Wood</option>
              <option value="tournament">Tournament Green</option>
              <option value="marble">Marble</option>
              <option value="walnut">Walnut</option>
              <option value="midnight">Midnight</option>
              <option value="forest">Forest</option>
              <option value="ocean">Ocean</option>
              <option value="neon">Neon Cyber</option>
            </select>
          </div>

          {gameMode === "computer" && (
            <div className="modal-group">
              <label>Difficulty</label>
              <div className="difficulty-options">
                {[
                  { id: "novice", icon: "◉", name: "Novice", desc: "Random moves — great for beginners" },
                  { id: "scholar", icon: "◈", name: "Scholar", desc: "Basic strategy — decent challenge" },
                  { id: "strategist", icon: "⬥", name: "Strategist", desc: "Deep thinking — minimax engine" },
                  { id: "oracle", icon: "◆", name: "Oracle", desc: "AI-powered — uses Qwen 2.5:3b" },
                ].map((d) => (
                  <div
                    key={d.id}
                    className={`difficulty-option ${difficulty === d.id ? "selected" : ""}`}
                    onClick={() => setDifficulty(d.id)}
                  >
                    <span className="diff-icon">{d.icon}</span>
                    <div className="diff-info">
                      <h4>{d.name}</h4>
                      <p>{d.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="modal-group">
            <label>Your Color (Bottom Side)</label>
            <div className="color-options">
              <div
                className={`color-option ${playerColor === "w" ? "selected" : ""}`}
                onClick={() => setPlayerColor("w")}
              >
                <span className="color-icon">♔</span>
                White
              </div>
              <div
                className={`color-option ${playerColor === "b" ? "selected" : ""}`}
                onClick={() => setPlayerColor("b")}
              >
                <span className="color-icon">♚</span>
                Black
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn btn-primary btn-lg" onClick={startNewGame} style={{ width: "100%" }}>
              ⚔ Start Battle
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      {/* Left Panel */}
      <div className="game-left-panel">
        {/* Opponent info */}
        <div className="panel">
          <div className="player-info">
            <div className={`player-avatar ${playerColor === "w" ? "black-player" : "white-player"}`}>
              {gameMode === "computer" ? "⛊" : (playerColor === "w" ? "♚" : "♔")}
            </div>
            <div>
              <div className="player-name">{getPlayerName(playerColor === "w" ? "b" : "w")}</div>
              <div className="player-rating">
                {gameMode === "computer" ? `Level: ${difficulty}` : ""}
              </div>
            </div>
            {game.turn() !== playerColor && !gameOver && (
              <span className="player-turn-indicator"></span>
            )}
          </div>
          <div className="captured-pieces">
            {capturedPieces[playerColor === "w" ? "b" : "w"].map((p, i) => (
              <span key={i}>{PIECE_UNICODE[playerColor === "w" ? p : p.toUpperCase()]}</span>
            ))}
          </div>
        </div>

        {/* Coach Panel (only for authorized users) */}
        <CoachPanel 
          game={game} 
          moveHistory={moveHistory} 
          playerColor={playerColor}
          onSuggest={setCoachHighlight}
        />
      </div>

      {/* Center — Board */}
      <div>
        <div style={{ minHeight: '44px', marginBottom: 12 }}>
          <div className="status-bar" style={{ visibility: isThinking ? 'visible' : 'hidden' }}>
            <span className="spinner" style={{ marginRight: 8, display: 'inline-block', verticalAlign: 'middle' }}></span>
            {difficulty === "oracle" ? "Oracle is consulting the cosmos..." : "Engine is calculating..."}
          </div>
        </div>

        <ChessBoard
          game={game}
          onMove={handleMove}
          playerColor={playerColor}
          disabled={!isPlayerTurn || isThinking || !!gameOver}
          lastMove={lastMove}
          theme={boardTheme}
          coachHighlight={coachHighlight}
        />

        {/* Game status */}
        {game.inCheck() && !gameOver && (
          <div className="status-bar" style={{ marginTop: 12 }}>
            ⚠️ Check!
          </div>
        )}

        {/* Controls */}
        <div className="panel" style={{ marginTop: 12 }}>
          <div className="game-controls">
            <button onClick={() => setShowSetup(true)} title="New Game">✦</button>
            <button onClick={() => {
              const g = new Chess();
              g.loadPgn(game.pgn());
              // Undo: in computer mode, undo 2 moves (computer + player)
              if (gameMode === "computer") {
                g.undo();
                g.undo();
              } else {
                g.undo();
              }
              const newGame = new Chess();
              newGame.loadPgn(g.pgn());
              setGame(newGame);
              setMoveHistory(newGame.history());
              // Reset last move indication since it's hard to get safely
              setLastMove(null);
            }} title="Undo" disabled={moveHistory.length === 0}>↶</button>
            <button onClick={resignGame} title="Resign" disabled={!!gameOver}>⚐</button>
            <button onClick={() => {
              navigator.clipboard?.writeText(game.fen());
            }} title="Copy FEN">⧉</button>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="game-right-panel">
        {/* Player info */}
        <div className="panel">
          <div className="player-info">
            <div className={`player-avatar ${playerColor === "w" ? "white-player" : "black-player"}`}>
              {playerColor === "w" ? "♔" : "♚"}
            </div>
            <div>
              <div className="player-name">{getPlayerName(playerColor)}</div>
              <div className="player-rating">{username || "Player"}</div>
            </div>
            {game.turn() === playerColor && !gameOver && (
              <span className="player-turn-indicator"></span>
            )}
          </div>
          <div className="captured-pieces">
            {capturedPieces[playerColor].map((p, i) => (
              <span key={i}>{PIECE_UNICODE[playerColor === "w" ? p.toUpperCase() : p]}</span>
            ))}
          </div>
        </div>

        {/* Move History */}
        <MoveHistory
          history={moveHistory}
          currentMoveIndex={moveHistory.length - 1}
        />
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-modal">
            <div className="result-icon">
              {gameOver.type === "checkmate" ? "♛" :
               gameOver.type === "resign" ? "⚐" : "⚖"}
            </div>
            <h2>{gameOver.type === "checkmate" ? "Checkmate!" :
                 gameOver.type === "resign" ? "Resignation" : "Draw"}</h2>
            <p className="result-detail">{gameOver.message}</p>
            <div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setGameOver(null);
                  setShowSetup(true);
                }}
              >
                ↻ New Game
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setGameOver(null)}
                style={{ marginLeft: 12 }}
              >
                ⧉ Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 64px)" }}>
        <div className="spinner" style={{ width: 32, height: 32 }}></div>
      </div>
    }>
      <PlayContent />
    </Suspense>
  );
}
