/**
 * Ollama Client — communicates with Qwen 2.5:3b for chess coaching
 */

const OLLAMA_URL = process.env.NEXT_PUBLIC_OLLAMA_URL || "http://localhost:11434";

/**
 * Ask the Oracle (Qwen 2.5:3b) for a move suggestion
 * @param {string} fen - Current board position in FEN notation
 * @param {string[]} moveHistory - Array of moves in algebraic notation
 * @returns {Promise<{move: string, explanation: string}>}
 */
export async function askOracle(fen, moveHistory = [], playerColor = "w", engineMove = null) {
  const historyStr = moveHistory.length > 0
    ? `\nMoves played so far: ${moveHistory.join(", ")}`
    : "";

  const pColor = playerColor === "w" ? "White" : "Black";
  
  let prompt;
  if (engineMove) {
    prompt = `You are a chess grandmaster advisor. The human player is playing as ${pColor}. The best move in the current position is ${engineMove}.
Explain in 1-2 brief sentences WHY ${engineMove} is a strong positional or tactical move.

Respond in this exact format:
MOVE: ${engineMove}
EXPLANATION: [Brief 1-2 sentence explanation here]`;
  } else {
    prompt = `You are a chess grandmaster advisor. The human player is playing as ${pColor}. Analyze this chess position and suggest the best move for the side currently to move.

Current position (FEN): ${fen}${historyStr}

Respond in this exact format:
MOVE: [your suggested move in standard algebraic notation]
EXPLANATION: [Brief 1-2 sentence explanation of why this is the best move]

Be concise. Only suggest legal moves.`;
  }

  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen2.5:3b",
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 150,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama responded with status ${response.status}`);
    }

    const data = await response.json();
    const text = data.response || "";

    // Parse the response
    const moveMatch = text.match(/MOVE:\s*([^\n]+)/i);
    const explanationMatch = text.match(/EXPLANATION:\s*([^\n]+)/i);

    return {
      move: moveMatch ? moveMatch[1].trim() : null,
      explanation: explanationMatch
        ? explanationMatch[1].trim()
        : "The Oracle speaks in mysterious ways...",
      raw: text,
    };
  } catch (error) {
    console.error("Oracle error:", error);
    throw new Error(
      error.message.includes("fetch")
        ? "Cannot connect to Ollama. Make sure it's running on localhost:11434"
        : error.message
    );
  }
}

/**
 * Ask Oracle specifically for the computer's move (Expert difficulty)
 */
export async function getOracleMove(fen, moveHistory = []) {
  const prompt = `You are a chess engine. Given this position, provide ONLY the best move in standard algebraic notation. Nothing else.

Position (FEN): ${fen}
Moves so far: ${moveHistory.join(", ") || "none"}

Respond with ONLY the move (e.g., "e4" or "Nf3" or "O-O"). No explanation.`;

  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen2.5:3b",
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.2,
          num_predict: 10,
        },
      }),
    });

    if (!response.ok) throw new Error("Ollama error");

    const data = await response.json();
    return data.response?.trim().split(/\s/)[0] || null;
  } catch (error) {
    console.error("Oracle move error:", error);
    return null;
  }
}

/**
 * Check if Ollama is available
 */
export async function checkOllamaStatus() {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    
    if (!response.ok) return { available: false, models: [] };
    
    const data = await response.json();
    const models = data.models?.map((m) => m.name) || [];
    const hasQwen = models.some((m) => m.includes("qwen2.5"));
    
    return { available: true, models, hasQwen };
  } catch {
    return { available: false, models: [], hasQwen: false };
  }
}
