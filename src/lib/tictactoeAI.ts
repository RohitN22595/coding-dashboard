// ─────────────────────────────────────────────────────────────────────────────
// TIC TAC TOE AI — pure functions, no React
// ─────────────────────────────────────────────────────────────────────────────
export type Player = "X" | "O";
export type Cell = Player | null;
export type Board = Cell[];
export type Difficulty = "easy" | "medium" | "hard";

export const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6],         // diagonals
];

export function getWinLine(board: Board): number[] | null {
    for (const line of WIN_LINES) {
        const [a, b, c] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) return line;
    }
    return null;
}

export function getWinner(board: Board): Player | null {
    const line = getWinLine(board);
    return line ? (board[line[0]] as Player) : null;
}

export function isDraw(board: Board): boolean {
    return board.every(c => c !== null) && !getWinner(board);
}

function emptyIndices(board: Board): number[] {
    return board.reduce<number[]>((acc, c, i) => (c === null ? [...acc, i] : acc), []);
}

// Minimax with depth for "prefer faster wins"
function minimax(board: Board, depth: number, isMax: boolean): number {
    const winner = getWinner(board);
    if (winner === "O") return 10 - depth;
    if (winner === "X") return depth - 10;
    if (isDraw(board)) return 0;

    const empty = emptyIndices(board);
    if (isMax) {
        let best = -Infinity;
        for (const i of empty) {
            board[i] = "O";
            best = Math.max(best, minimax(board, depth + 1, false));
            board[i] = null;
        }
        return best;
    } else {
        let best = Infinity;
        for (const i of empty) {
            board[i] = "X";
            best = Math.min(best, minimax(board, depth + 1, true));
            board[i] = null;
        }
        return best;
    }
}

function bestMinimax(board: Board): number {
    const empty = emptyIndices(board);
    let bestScore = -Infinity, bestMove = empty[0];
    for (const i of empty) {
        board[i] = "O";
        const score = minimax(board, 0, false);
        board[i] = null;
        if (score > bestScore) { bestScore = score; bestMove = i; }
    }
    return bestMove;
}

function randomMove(board: Board): number {
    const empty = emptyIndices(board);
    return empty[Math.floor(Math.random() * empty.length)];
}

export function getBotMove(board: Board, difficulty: Difficulty): number {
    const empty = emptyIndices(board);
    if (!empty.length) return -1;

    if (difficulty === "easy") return randomMove(board);

    if (difficulty === "medium") {
        // 50% chance of minimax, 50% random
        return Math.random() < 0.5 ? bestMinimax([...board]) : randomMove(board);
    }

    // Hard: full minimax (unbeatable)
    return bestMinimax([...board]);
}
