"use client";
import { useState, useContext, useEffect, useRef, useCallback } from "react";
import { UserContext } from "@/app/layout";
import { hasOracleAccess } from "@/lib/accessControl";
import { askOracle, checkOllamaStatus } from "@/lib/ollamaClient";
import { getComputerMove } from "@/lib/engine";
import { Chess } from "chess.js";

export default function CoachPanel({ game, moveHistory, playerColor = "w", onSuggest }) {
  const { username } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [error, setError] = useState(null);
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [autoCoach, setAutoCoach] = useState(false);
  const lastEvaluatedFen = useRef(null);

  const hasAccess = hasOracleAccess(username);

  const handleAskOracle = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuggestion(null);

    try {
      lastEvaluatedFen.current = game.fen();
      // Check Ollama status first
      const status = await checkOllamaStatus();
      setOllamaStatus(status);

      const engineMoveObj = new Chess();
      engineMoveObj.loadPgn(game.pgn());
      const engineMove = await getComputerMove(game, "strategist");

      if (!status.available || !status.hasQwen) {
        setSuggestion({
          move: engineMove,
          explanation: status.available 
            ? "Ollama is running, but the Qwen model is missing. However, the Strategist engine still recommends this move."
            : "The Oracle is currently disconnected (Ollama is offline). However, the internal Strategist still highly recommends this move."
        });
        
        // Pass to parent for highlighting
        if (onSuggest) {
          const moveObj = engineMoveObj.move(engineMove);
          if (moveObj) {
            onSuggest({ from: moveObj.from, to: moveObj.to });
          }
        }
        setLoading(false);
        return;
      }

      const result = await askOracle(game.fen(), moveHistory, playerColor, engineMove);
      setSuggestion(result);

      if (result.move && onSuggest) {
        try {
          const tempGame = new Chess();
          tempGame.loadPgn(game.pgn());
          const moveObj = tempGame.move(result.move);
          if (moveObj) {
            onSuggest({ from: moveObj.from, to: moveObj.to });
          }
        } catch (e) {
          // ignore parsing errors
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [game, moveHistory, playerColor, onSuggest]);

  // Hook to automatically trigger if autoCoach is enabled and it's playerColor's turn
  useEffect(() => {
    if (autoCoach && game.turn() === playerColor && !loading && !game.isGameOver()) {
      if (lastEvaluatedFen.current !== game.fen()) {
        handleAskOracle();
      }
    }
  }, [autoCoach, game, playerColor, loading, handleAskOracle]);

  if (!hasAccess) return null;

  return (
    <div className="panel coach-panel">
      <div className="panel-header">
        <span className="panel-icon">⚜</span>
        Oracle&apos;s Wisdom
      </div>
      <div className="panel-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <button
            className="coach-btn"
            style={{ flex: 1, marginRight: '16px', marginBottom: 0 }}
            onClick={handleAskOracle}
            disabled={loading || game.isGameOver()}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ display: "inline-block" }}></span>
                Consulting...
              </>
            ) : (
              <>
                ◆ Ask Oracle
              </>
            )}
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '6px' }}>
              <input 
                type="checkbox" 
                checked={autoCoach} 
                onChange={(e) => setAutoCoach(e.target.checked)} 
              />
              Auto-Analyze
            </label>
          </div>
        </div>

        {error && (
          <div
            className="coach-suggestion"
            style={{ borderColor: "rgba(232, 64, 87, 0.3)", color: "var(--red)" }}
          >
            ⚠️ {error}
          </div>
        )}

        {suggestion && (
          <div className="coach-suggestion">
            <span className="suggested-move">
              ⬥ Suggested: {suggestion.move || "Could not determine a move"}
            </span>
            {suggestion.explanation}
          </div>
        )}
      </div>
    </div>
  );
}
