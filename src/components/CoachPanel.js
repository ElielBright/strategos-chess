"use client";
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

  const hasAccess = hasOracleAccess(username);

  if (!hasAccess) return null;

  const handleAskOracle = async () => {
    setLoading(true);
    setError(null);
    setSuggestion(null);

    try {
      // Check Ollama status first
      const status = await checkOllamaStatus();
      setOllamaStatus(status);

      const engineMoveObj = new Chess();
      engineMoveObj.loadPgn(game.pgn());
      const engineMove = getComputerMove(game, "strategist");

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
  };

  return (
    <div className="panel coach-panel">
      <div className="panel-header">
        <span className="panel-icon">🏛️</span>
        Oracle&apos;s Wisdom
      </div>
      <div className="panel-body">
        <button
          className="coach-btn"
          onClick={handleAskOracle}
          disabled={loading || game.isGameOver()}
        >
          {loading ? (
            <>
              <span className="spinner" style={{ display: "inline-block" }}></span>
              Consulting the Oracle...
            </>
          ) : (
            <>
              🔮 Ask the Oracle
            </>
          )}
        </button>

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
              ♟️ Suggested: {suggestion.move || "Could not determine a move"}
            </span>
            {suggestion.explanation}
          </div>
        )}
      </div>
    </div>
  );
}
