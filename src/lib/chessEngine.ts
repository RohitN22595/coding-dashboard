// ─────────────────────────────────────────────────────────────────────────────
// CHESS ENGINE — pure functions, no React
// ─────────────────────────────────────────────────────────────────────────────

export type Color = 'w' | 'b';
export type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';
export type Piece = string; // e.g. 'wK', 'bP'
export type Board = (Piece | null)[][];
export type Sq = [number, number]; // [row, col]
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface CastleRights { wK: boolean; wQ: boolean; bK: boolean; bQ: boolean }

export interface CMove {
    from: Sq; to: Sq;
    castle?: 'K' | 'Q';
    ep?: boolean;
    promo?: PieceType;
}

export interface CS {
    board: Board;
    turn: Color;
    castle: CastleRights;
    ep: Sq | null;
    half: number;
    full: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
export const gc = (p: Piece): Color => p[0] as Color;
export const gt = (p: Piece): PieceType => p[1] as PieceType;
export const opp = (c: Color): Color => c === 'w' ? 'b' : 'w';
export const inB = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;

export function cloneState(s: CS): CS {
    return { ...s, board: s.board.map(r => [...r]), castle: { ...s.castle }, ep: s.ep ? [s.ep[0], s.ep[1]] : null };
}

export function makeInitialState(): CS {
    return {
        board: [
            ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
            ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
            ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'],
        ],
        turn: 'w', castle: { wK: true, wQ: true, bK: true, bQ: true }, ep: null, half: 0, full: 1,
    };
}

function findKing(board: Board, color: Color): Sq | null {
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (board[r][c] === `${color}K`) return [r, c];
    return null;
}

export function isAttacked(board: Board, r: number, c: number, by: Color): boolean {
    for (const [dr, dc] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]])
        if (inB(r + dr, c + dc) && board[r + dr][c + dc] === `${by}N`) return true;
    const pd = by === 'w' ? 1 : -1;
    for (const dc of [-1, 1]) if (inB(r + pd, c + dc) && board[r + pd][c + dc] === `${by}P`) return true;
    for (const [dr, dc] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]])
        if (inB(r + dr, c + dc) && board[r + dr][c + dc] === `${by}K`) return true;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        let [nr, nc] = [r + dr, c + dc];
        while (inB(nr, nc)) { const p = board[nr][nc]; if (p) { if (p === `${by}R` || p === `${by}Q`) return true; break; } nr += dr; nc += dc; }
    }
    for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
        let [nr, nc] = [r + dr, c + dc];
        while (inB(nr, nc)) { const p = board[nr][nc]; if (p) { if (p === `${by}B` || p === `${by}Q`) return true; break; } nr += dr; nc += dc; }
    }
    return false;
}

export function isInCheck(state: CS, color: Color): boolean {
    const king = findKing(state.board, color);
    return king ? isAttacked(state.board, king[0], king[1], opp(color)) : false;
}

export function pseudoLegal(state: CS, r: number, c: number): CMove[] {
    const piece = state.board[r][c];
    if (!piece || gc(piece) !== state.turn) return [];
    const type = gt(piece), color = state.turn, o = opp(color);
    const moves: CMove[] = [];
    const add = (to: Sq, extra: Partial<CMove> = {}) => moves.push({ from: [r, c], to, ...extra });

    if (type === 'P') {
        const dir = color === 'w' ? -1 : 1, sr = color === 'w' ? 6 : 1, pr = color === 'w' ? 0 : 7;
        const r1 = r + dir;
        if (inB(r1, c) && !state.board[r1][c]) {
            if (r1 === pr) { for (const p of ['Q', 'R', 'B', 'N'] as PieceType[]) add([r1, c], { promo: p }); }
            else { add([r1, c]); if (r === sr && !state.board[r + 2 * dir][c]) add([r + 2 * dir, c]); }
        }
        for (const dc of [-1, 1]) {
            const nc = c + dc; if (!inB(r1, nc)) continue;
            const t = state.board[r1][nc];
            if (t && gc(t) === o) { if (r1 === pr) { for (const p of ['Q', 'R', 'B', 'N'] as PieceType[]) add([r1, nc], { promo: p }); } else add([r1, nc]); }
            if (state.ep?.[0] === r1 && state.ep?.[1] === nc) add([r1, nc], { ep: true });
        }
    }
    if (type === 'N') {
        for (const [dr, dc] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) {
            const [nr, nc] = [r + dr, c + dc]; if (!inB(nr, nc)) continue;
            const t = state.board[nr][nc]; if (!t || gc(t) === o) add([nr, nc]);
        }
    }
    const slide = (dirs: [number, number][]) => {
        for (const [dr, dc] of dirs) {
            let [nr, nc] = [r + dr, c + dc];
            while (inB(nr, nc)) { const t = state.board[nr][nc]; if (!t) { add([nr, nc]); nr += dr; nc += dc; } else { if (gc(t) === o) add([nr, nc]); break; } }
        }
    };
    if (type === 'B') slide([[-1, -1], [-1, 1], [1, -1], [1, 1]]);
    if (type === 'R') slide([[-1, 0], [1, 0], [0, -1], [0, 1]]);
    if (type === 'Q') slide([[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]);
    if (type === 'K') {
        for (const [dr, dc] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) {
            const [nr, nc] = [r + dr, c + dc]; if (!inB(nr, nc)) continue; const t = state.board[nr][nc]; if (!t || gc(t) === o) add([nr, nc]);
        }
        const row = color === 'w' ? 7 : 0;
        if (r === row && c === 4 && !isInCheck(state, color)) {
            const cK = color === 'w' ? state.castle.wK : state.castle.bK, cQ = color === 'w' ? state.castle.wQ : state.castle.bQ;
            if (cK && !state.board[row][5] && !state.board[row][6] && !isAttacked(state.board, row, 5, o) && !isAttacked(state.board, row, 6, o)) add([row, 6], { castle: 'K' });
            if (cQ && !state.board[row][3] && !state.board[row][2] && !state.board[row][1] && !isAttacked(state.board, row, 3, o) && !isAttacked(state.board, row, 2, o)) add([row, 2], { castle: 'Q' });
        }
    }
    return moves;
}

export function applyMove(state: CS, m: CMove): CS {
    const s = cloneState(state);
    const piece = s.board[m.from[0]][m.from[1]]!;
    const color = gc(piece), type = gt(piece);
    s.ep = null;
    if (s.board[m.to[0]][m.to[1]]) s.half = 0; else s.half++;
    if (m.ep) { const cr = color === 'w' ? m.to[0] + 1 : m.to[0] - 1; s.board[cr][m.to[1]] = null; s.half = 0; }
    if (m.castle) {
        const row = color === 'w' ? 7 : 0;
        if (m.castle === 'K') { s.board[row][5] = s.board[row][7]; s.board[row][7] = null; }
        else { s.board[row][3] = s.board[row][0]; s.board[row][0] = null; }
    }
    s.board[m.to[0]][m.to[1]] = m.promo ? `${color}${m.promo}` : piece;
    s.board[m.from[0]][m.from[1]] = null;
    if (type === 'P') { s.half = 0; if (Math.abs(m.to[0] - m.from[0]) === 2) s.ep = [(m.from[0] + m.to[0]) / 2, m.from[1]]; }
    if (type === 'K') { if (color === 'w') { s.castle.wK = false; s.castle.wQ = false; } else { s.castle.bK = false; s.castle.bQ = false; } }
    if (type === 'R') {
        if (color === 'w') { if (m.from[0] === 7 && m.from[1] === 7) s.castle.wK = false; if (m.from[0] === 7 && m.from[1] === 0) s.castle.wQ = false; }
        else { if (m.from[0] === 0 && m.from[1] === 7) s.castle.bK = false; if (m.from[0] === 0 && m.from[1] === 0) s.castle.bQ = false; }
    }
    if (m.to[0] === 0 && m.to[1] === 0) s.castle.bQ = false; if (m.to[0] === 0 && m.to[1] === 7) s.castle.bK = false;
    if (m.to[0] === 7 && m.to[1] === 0) s.castle.wQ = false; if (m.to[0] === 7 && m.to[1] === 7) s.castle.wK = false;
    s.turn = opp(color); if (color === 'b') s.full++;
    return s;
}

export function legalAt(state: CS, r: number, c: number): CMove[] {
    return pseudoLegal(state, r, c).filter(m => !isInCheck(applyMove(state, m), state.turn));
}

export function allLegal(state: CS): CMove[] {
    const moves: CMove[] = [];
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const p = state.board[r][c]; if (p && gc(p) === state.turn) moves.push(...legalAt(state, r, c)); }
    return moves;
}

export function isCheckmate(state: CS): boolean { return allLegal(state).length === 0 && isInCheck(state, state.turn); }
export function isStalemate(state: CS): boolean { return allLegal(state).length === 0 && !isInCheck(state, state.turn); }

// ── AI ───────────────────────────────────────────────────────────────────────
const PV: Record<string, number> = { K: 10000, Q: 900, R: 500, B: 330, N: 320, P: 100 };
const PST_P = [[0, 0, 0, 0, 0, 0, 0, 0], [50, 50, 50, 50, 50, 50, 50, 50], [10, 10, 20, 30, 30, 20, 10, 10], [5, 5, 10, 25, 25, 10, 5, 5], [0, 0, 0, 20, 20, 0, 0, 0], [5, -5, -10, 0, 0, -10, -5, 5], [5, 10, 10, -20, -20, 10, 10, 5], [0, 0, 0, 0, 0, 0, 0, 0]];
const PST_N = [[-50, -40, -30, -30, -30, -30, -40, -50], [-40, -20, 0, 0, 0, 0, -20, -40], [-30, 0, 10, 15, 15, 10, 0, -30], [-30, 5, 15, 20, 20, 15, 5, -30], [-30, 0, 15, 20, 20, 15, 0, -30], [-30, 5, 10, 15, 15, 10, 5, -30], [-40, -20, 0, 5, 5, 0, -20, -40], [-50, -40, -30, -30, -30, -30, -40, -50]];

function evaluate(state: CS): number {
    let score = 0;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
        const p = state.board[r][c]; if (!p) continue;
        const color = gc(p), type = gt(p), sign = color === 'w' ? 1 : -1;
        let val = PV[type], pr = color === 'w' ? r : 7 - r;
        if (type === 'P') val += PST_P[pr][c]; if (type === 'N') val += PST_N[pr][c];
        score += sign * val;
    }
    return score;
}

function minimax(state: CS, depth: number, alpha: number, beta: number, max: boolean): number {
    if (depth === 0) return evaluate(state);
    const moves = allLegal(state);
    if (!moves.length) return isInCheck(state, state.turn) ? (max ? -99999 : 99999) : 0;
    if (max) {
        let best = -Infinity;
        for (const m of moves) { best = Math.max(best, minimax(applyMove(state, m), depth - 1, alpha, beta, false)); alpha = Math.max(alpha, best); if (beta <= alpha) break; }
        return best;
    } else {
        let best = Infinity;
        for (const m of moves) { best = Math.min(best, minimax(applyMove(state, m), depth - 1, alpha, beta, true)); beta = Math.min(beta, best); if (beta <= alpha) break; }
        return best;
    }
}

export function getBotMove(state: CS, diff: Difficulty): CMove | null {
    const moves = allLegal(state); if (!moves.length) return null;
    if (diff === 'easy') return moves[Math.floor(Math.random() * moves.length)];
    const depth = diff === 'medium' ? 2 : 3, max = state.turn === 'w';
    let bestMove = moves[0], bestScore = max ? -Infinity : Infinity;
    for (const m of moves) {
        const score = minimax(applyMove(state, m), depth - 1, -Infinity, Infinity, !max);
        if (max ? score > bestScore : score < bestScore) { bestScore = score; bestMove = m; }
    }
    return bestMove;
}
