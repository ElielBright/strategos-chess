"use client";

export default function MoveHistory({ history, onGoToMove, currentMoveIndex }) {
  // Group moves into pairs (white + black)
  const movePairs = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1] || null,
      whiteIndex: i,
      blackIndex: i + 1,
    });
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-icon">📜</span>
        Moves
      </div>
      <div className="move-history">
        {movePairs.length === 0 && (
          <div
            style={{
              padding: "16px",
              textAlign: "center",
              color: "var(--text-dim)",
              fontSize: "0.85rem",
            }}
          >
            Game awaits its first move...
          </div>
        )}
        {movePairs.map((pair) => (
          <div className="move-row" key={pair.number}>
            <span className="move-number">{pair.number}.</span>
            <span
              className={`move-white ${
                currentMoveIndex === pair.whiteIndex ? "current" : ""
              }`}
              onClick={() => onGoToMove && onGoToMove(pair.whiteIndex)}
            >
              {pair.white}
            </span>
            {pair.black && (
              <span
                className={`move-black ${
                  currentMoveIndex === pair.blackIndex ? "current" : ""
                }`}
                onClick={() => onGoToMove && onGoToMove(pair.blackIndex)}
              >
                {pair.black}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
