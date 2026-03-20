/**
 * Strategos Chess Engine — Computer opponent with 4 difficulty levels
 * Uses chess.js for game logic
 */

// Piece values for evaluation
const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-square tables for positional evaluation
const PST = {
  p: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0],
  ],
  n: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50],
  ],
  b: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5,  5,  5,  5,  5,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20],
  ],
  r: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0],
  ],
  q: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [ -5,  0,  5,  5,  5,  5,  0, -5],
    [  0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20],
  ],
  k: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [ 20, 20,  0,  0,  0,  0, 20, 20],
    [ 20, 30, 10,  0,  0, 10, 30, 20],
  ],
};

/**
 * Evaluate board position from perspective of current turn
 */
export function evaluateBoard(game) {
  const board = game.board();
  let score = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) continue;

      const pstRow = piece.color === "w" ? row : 7 - row;
      const pieceValue = PIECE_VALUES[piece.type] + (PST[piece.type]?.[pstRow]?.[col] || 0);

      score += piece.color === "w" ? pieceValue : -pieceValue;
    }
  }

  return game.turn() === "w" ? score : -score;
}

/**
 * Minimax with alpha-beta pruning
 */
function minimax(game, depth, alpha, beta, maximizing) {
  if (depth === 0 || game.isGameOver()) {
    if (game.isCheckmate()) {
      return maximizing ? -99999 : 99999;
    }
    if (game.isDraw()) return 0;
    return evaluateBoard(game);
  }

  const moves = game.moves();

  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const eval_ = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const eval_ = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Order moves to improve alpha-beta pruning
 */
function orderMoves(game, moves) {
  return moves.sort((a, b) => {
    const moveA = game.move(a);
    game.undo();
    const moveB = game.move(b);
    game.undo();

    let scoreA = 0, scoreB = 0;
    if (moveA?.captured) scoreA += PIECE_VALUES[moveA.captured] * 10;
    if (moveB?.captured) scoreB += PIECE_VALUES[moveB.captured] * 10;
    if (moveA?.flags?.includes("p")) scoreA += 800;
    if (moveB?.flags?.includes("p")) scoreB += 800;

    return scoreB - scoreA;
  });
}

/**
 * NOVICE (Easy) — Random legal moves
 */
function getNoviceMove(game) {
  const moves = game.moves();
  return moves[Math.floor(Math.random() * moves.length)];
}

/**
 * SCHOLAR (Medium) — Greedy evaluation, 1-ply
 */
function getScholarMove(game) {
  const moves = game.moves();
  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    game.move(move);
    const score = -evaluateBoard(game);
    game.undo();

    // Add some randomness
    const randomized = score + (Math.random() * 50 - 25);
    if (randomized > bestScore) {
      bestScore = randomized;
      bestMove = move;
    }
  }

  return bestMove;
}

/**
 * STRATEGIST (Hard) — Minimax with alpha-beta, depth 3
 */
function getStrategistMove(game) {
  const moves = game.moves();
  const ordered = orderMoves(game, [...moves]);

  let bestMove = ordered[0];
  let bestScore = -Infinity;

  for (const move of ordered) {
    game.move(move);
    const score = -minimax(game, 2, -Infinity, Infinity, false);
    game.undo();

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

/**
 * Get computer move based on difficulty level
 */
export function getComputerMove(game, difficulty) {
  switch (difficulty) {
    case "novice":
      return getNoviceMove(game);
    case "scholar":
      return getScholarMove(game);
    case "strategist":
      return getStrategistMove(game);
    case "oracle":
      // Oracle uses strategist as fallback; the actual Oracle
      // move is handled by the coach/ollama integration in the component
      return getStrategistMove(game);
    default:
      return getNoviceMove(game);
  }
}
