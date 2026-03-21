"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { getPieceSVG } from "@/components/ChessPieces";



const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

export default function ChessBoard({
  game,
  onMove,
  playerColor = "w",
  disabled = false,
  lastMove = null,
  theme = "classic",
  coachHighlight = null,
}) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [promotionPending, setPromotionPending] = useState(null);
  const [dragPiece, setDragPiece] = useState(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const boardRef = useRef(null);

  const board = game.board();
  const isFlipped = playerColor === "b";
  const inCheck = game.inCheck();
  const turn = game.turn();

  // Find king position for check highlighting
  let kingSquare = null;
  if (inCheck) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === "k" && p.color === turn) {
          kingSquare = FILES[c] + RANKS[r];
        }
      }
    }
  }

  const getSquareFromCoords = useCallback((row, col) => {
    const r = isFlipped ? 7 - row : row;
    const c = isFlipped ? 7 - col : col;
    return FILES[c] + RANKS[r];
  }, [isFlipped]);

  const handleSquareClick = useCallback((square) => {
    if (disabled) return;

    if (selectedSquare) {
      // Check for castling by clicking King then Rook
      const piece = game.get(selectedSquare);
      const targetPiece = game.get(square);
      let finalTarget = square;

      if (piece?.type === "k" && targetPiece?.type === "r" && targetPiece?.color === piece.color) {
        if (selectedSquare === "e1") {
          if (square === "h1") finalTarget = "g1";
          if (square === "a1") finalTarget = "c1";
        } else if (selectedSquare === "e8") {
          if (square === "h8") finalTarget = "g8";
          if (square === "a8") finalTarget = "c8";
        }
      }

      const moveObj = {
        from: selectedSquare,
        to: finalTarget,
      };

      // Check if this is a promotion move
      if (
        piece?.type === "p" &&
        ((piece.color === "w" && finalTarget[1] === "8") ||
          (piece.color === "b" && finalTarget[1] === "1"))
      ) {
        setPromotionPending(moveObj);
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      const result = onMove(moveObj);
      setSelectedSquare(null);
      setLegalMoves([]);
      if (result) return;
    }

    // Select a new piece
    const piece = game.get(square);
    if (piece && piece.color === turn) {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setLegalMoves(moves.map((m) => m.to));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  }, [selectedSquare, game, turn, disabled, onMove]);

  const handlePromotion = useCallback((piece) => {
    if (promotionPending) {
      onMove({ ...promotionPending, promotion: piece });
      setPromotionPending(null);
    }
  }, [promotionPending, onMove]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e, square) => {
    if (disabled) return;
    const piece = game.get(square);
    if (!piece || piece.color !== turn) return;

    e.preventDefault();
    setDragPiece(square);
    setSelectedSquare(square);

    const moves = game.moves({ square, verbose: true });
    setLegalMoves(moves.map((m) => m.to));

    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    setDragPos({ x: clientX, y: clientY });
  }, [disabled, game, turn]);

  useEffect(() => {
    if (!dragPiece) return;

    const handleMouseMove = (e) => {
      const clientX = e.clientX || e.touches?.[0]?.clientX;
      const clientY = e.clientY || e.touches?.[0]?.clientY;
      setDragPos({ x: clientX, y: clientY });
    };

    const handleMouseUp = (e) => {
      if (!boardRef.current || !dragPiece) return;

      const rect = boardRef.current.getBoundingClientRect();
      const clientX = e.clientX || e.changedTouches?.[0]?.clientX;
      const clientY = e.clientY || e.changedTouches?.[0]?.clientY;

      const squareSize = rect.width / 8;
      let col = Math.floor((clientX - rect.left) / squareSize);
      let row = Math.floor((clientY - rect.top) / squareSize);

      if (col >= 0 && col < 8 && row >= 0 && row < 8) {
        const targetSquare = getSquareFromCoords(row, col);

        if (targetSquare === dragPiece) {
          // User clicked and released without dragging. Keep selection.
          setDragPiece(null);
          return;
        }

        const piece = game.get(dragPiece);
        let finalTarget = targetSquare;

        // Handle castling by dropping King on Rook
        if (piece?.type === "k") {
          const targetPiece = game.get(targetSquare);
          if (targetPiece?.type === "r" && targetPiece?.color === piece.color) {
            if (dragPiece === "e1") {
              if (targetSquare === "h1") finalTarget = "g1";
              if (targetSquare === "a1") finalTarget = "c1";
            } else if (dragPiece === "e8") {
              if (targetSquare === "h8") finalTarget = "g8";
              if (targetSquare === "a8") finalTarget = "c8";
            }
          }
        }

        if (
          piece?.type === "p" &&
          ((piece.color === "w" && finalTarget[1] === "8") ||
            (piece.color === "b" && finalTarget[1] === "1"))
        ) {
          setPromotionPending({ from: dragPiece, to: finalTarget });
        } else {
          onMove({ from: dragPiece, to: finalTarget });
        }
      }

      setDragPiece(null);
      setSelectedSquare(null);
      setLegalMoves([]);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleMouseMove, { passive: false });
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [dragPiece, game, onMove, getSquareFromCoords]);

  const renderBoard = () => {
    const squares = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const r = isFlipped ? 7 - row : row;
        const c = isFlipped ? 7 - col : col;
        const square = FILES[c] + RANKS[r];
        const piece = board[r][c];
        const isLight = (row + col) % 2 === 0;
        const isSelected = selectedSquare === square;
        const isLegal = legalMoves.includes(square);
        const isLastMove =
          lastMove && (square === lastMove.from || square === lastMove.to);
        const isCheck = kingSquare === square;
        const hasPiece = piece !== null;
        const isDragging = dragPiece === square;
        const isCoachHighlight = coachHighlight && (square === coachHighlight.from || square === coachHighlight.to);

        let className = `square ${isLight ? "light" : "dark"}`;
        if (isSelected) className += " selected";
        if (isLegal && hasPiece) className += " legal-capture";
        else if (isLegal) className += " legal-move";
        if (isLastMove) className += " last-move";
        if (isCoachHighlight) className += " coach-highlight";
        if (isCheck) className += " in-check";

        squares.push(
          <div
            key={square}
            className={className}
            onClick={() => handleSquareClick(square)}
            onMouseDown={(e) => piece && handleDragStart(e, square)}
            onTouchStart={(e) => piece && handleDragStart(e, square)}
          >
            {/* Coordinate labels */}
            {col === 0 && (
              <span className="coord-label coord-rank">
                {isFlipped ? row + 1 : 8 - row}
              </span>
            )}
            {row === 7 && (
              <span className="coord-label coord-file">
                {isFlipped ? FILES[7 - col] : FILES[col]}
              </span>
            )}

            {/* Piece */}
            {piece && !isDragging && (
              <span className={`piece piece-${piece.color}`}>
                {getPieceSVG(piece.color, piece.type)}
              </span>
            )}
          </div>
        );
      }
    }

    return squares;
  };

  return (
    <div className="board-wrapper" ref={boardRef}>
      <div className={`board-container theme-${theme}`}>{renderBoard()}</div>

      {/* Dragging piece */}
      {dragPiece && game.get(dragPiece) && (
        <span
          className={`piece dragging piece-${game.get(dragPiece).color}`}
          style={{
            left: dragPos.x - 28,
            top: dragPos.y - 28,
            width: '56px',
            height: '56px',
          }}
        >
          {getPieceSVG(game.get(dragPiece).color, game.get(dragPiece).type)}
        </span>
      )}

      {/* Promotion modal */}
      {promotionPending && (
        <div
          className="promotion-modal"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {["q", "r", "b", "n"].map((p) => (
            <div
              key={p}
              className={`promotion-option piece-${turn}`}
              onClick={() => handlePromotion(p)}
            >
              {getPieceSVG(turn, p)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
