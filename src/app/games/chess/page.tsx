"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useCoins } from "@/lib/useCoins";
import {
    type Color, type Difficulty, type CMove, type CS, type PieceType, type Sq,
    makeInitialState, legalAt, allLegal, applyMove,
    isInCheck, isCheckmate, isStalemate, getBotMove, opp, gc, gt,
} from "@/lib/chessEngine";
import ChessBoard from "./_components/ChessBoard";
import ModePanel from "./_components/ModePanel";
import StatsPanel, { type ChessStats } from "./_components/StatsPanel";
import Controls from "./_components/Controls";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
type GameMode = "bot" | "local";

const INIT_STATS: ChessStats = {
    wins: 0, losses: 0, draws: 0,
    winsEasy: 0, winsMedium: 0, winsHard: 0,
    winsLocal: 0, currentStreak: 0, bestStreak: 0, fastestWin: null,
};

const COIN_REWARDS: Record<string, number> = { easy: 10, medium: 20, hard: 40, local: 10, draw: 5 };
const UNDO_COST = 2;
const LS_STATS = "chess_stats";

// ─────────────────────────────────────────────────────────────────────────────
// GAME OVER OVERLAY
// ─────────────────────────────────────────────────────────────────────────────
function GameOverlay({
    status, winner, playerColor, gameMode, earnedCoins,
    onRestart, onMenu,
}: {
    status: string; winner: Color | "draw" | null;
    playerColor: Color; gameMode: GameMode; earnedCoins: number;
    onRestart: () => void; onMenu: () => void;
}) {
    if (status !== "checkmate" && status !== "stalemate") return null;

    const isDraw = status === "stalemate" || winner === "draw";
    const playerWon = !isDraw && winner === playerColor;
    const botWon = !isDraw && !playerWon;

    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-black/70 backdrop-blur-sm">
            <div className="text-center max-w-[280px]">
                {/* Icon */}
                <div className={`mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-xl ${isDraw ? "bg-gray-500/30 border border-gray-400/30"
                        : playerWon ? "bg-green-500/30 border border-green-400/30 animate-pulse"
                            : "bg-red-500/20 border border-red-400/20"
                    }`}>
                    {isDraw ? "🤝" : playerWon ? "♛" : "♟"}
                </div>

                <h2 className={`text-2xl font-extrabold mb-1 ${isDraw ? "text-gray-300"
                        : playerWon ? "text-green-300"
                            : "text-red-300"
                    }`}>
                    {isDraw ? "Draw!" : playerWon || gameMode === "local" ? `${winner === "w" ? "White" : "Black"} Wins!` : "You Lose"}
                </h2>
                <p className="text-white/40 text-sm mb-3">
                    {status === "checkmate" ? "Checkmate" : "Stalemate"}
                </p>
                {earnedCoins > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full mb-4">
                        <span className="text-amber-300 font-bold text-sm">+{earnedCoins} coins earned!</span>
                    </div>
                )}

                <div className="flex gap-2 justify-center">
                    <button onClick={onRestart}
                        className="px-5 py-2.5 bg-indigo-500/80 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105">
                        Play Again
                    </button>
                    <button onClick={onMenu}
                        className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white/70 rounded-xl text-sm font-bold transition-all duration-200">
                        Menu
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ChessPage() {
    const { coins, addCoins, spendCoins } = useCoins();

    // ── Menu state ────────────────────────────────────────────────────────────
    const [screen, setScreen] = useState<"menu" | "playing">("menu");
    const [gameMode, setGameMode] = useState<GameMode>("bot");
    const [difficulty, setDifficulty] = useState<Difficulty>("medium");
    const [playerColor, setPlayerColor] = useState<Color>("w");
    const [flipped, setFlipped] = useState(false);

    // ── Game state ────────────────────────────────────────────────────────────
    const [cs, setCs] = useState<CS>(makeInitialState);
    const [selected, setSelected] = useState<Sq | null>(null);
    const [moves, setMoves] = useState<CMove[]>([]);
    const [lastMove, setLastMove] = useState<CMove | null>(null);
    const [history, setHistory] = useState<CS[]>([]);
    const [status, setStatus] = useState<"playing" | "check" | "checkmate" | "stalemate">("playing");
    const [winner, setWinner] = useState<Color | "draw" | null>(null);
    const [earnedCoins, setEarnedCoins] = useState(0);
    const [botThinking, setBotThinking] = useState(false);

    // ── Promotion ─────────────────────────────────────────────────────────────
    const [promoTarget, setPromoTarget] = useState<{ from: Sq; to: Sq } | null>(null);

    // ── Timer ─────────────────────────────────────────────────────────────────
    const [elapsed, setElapsed] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Stats ─────────────────────────────────────────────────────────────────
    const [stats, setStats] = useState<ChessStats>(INIT_STATS);

    useEffect(() => {
        try { setStats({ ...INIT_STATS, ...JSON.parse(localStorage.getItem(LS_STATS) ?? "{}") }); } catch {/**/ }
    }, []);

    // Timer
    useEffect(() => {
        if (screen !== "playing" || status === "checkmate" || status === "stalemate") {
            if (timerRef.current) clearInterval(timerRef.current); return;
        }
        timerRef.current = setInterval(() => setElapsed(t => t + 1), 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [screen, status]);

    function calcStatus(state: CS): "playing" | "check" | "checkmate" | "stalemate" {
        if (isCheckmate(state)) return "checkmate";
        if (isStalemate(state)) return "stalemate";
        if (isInCheck(state, state.turn)) return "check";
        return "playing";
    }

    const saveStats = useCallback((s: ChessStats) => {
        setStats(s);
        localStorage.setItem(LS_STATS, JSON.stringify(s));
    }, []);

    function endGame(state: CS, st: "checkmate" | "stalemate") {
        if (timerRef.current) clearInterval(timerRef.current);
        let w: Color | "draw" | null = null;
        let earned = 0;
        const s = { ...stats };

        if (st === "stalemate") {
            w = "draw"; earned = COIN_REWARDS.draw;
            s.draws++;
            s.currentStreak = 0;
        } else {
            w = opp(state.turn);
            if (gameMode === "bot") {
                if (w === playerColor) {
                    earned = COIN_REWARDS[difficulty];
                    s.wins++; s.currentStreak++;
                    s.bestStreak = Math.max(s.bestStreak, s.currentStreak);
                    if (difficulty === "easy") s.winsEasy++;
                    else if (difficulty === "medium") s.winsMedium++;
                    else s.winsHard++;
                    if (!s.fastestWin || elapsed < s.fastestWin) s.fastestWin = elapsed;
                } else {
                    s.losses++; s.currentStreak = 0;
                }
            } else {
                earned = COIN_REWARDS.local;
                s.wins++; s.winsLocal++;
                s.currentStreak++;
                s.bestStreak = Math.max(s.bestStreak, s.currentStreak);
            }
        }
        if (earned > 0) addCoins(earned);
        setEarnedCoins(earned);
        setWinner(w);
        saveStats(s);
    }

    const doMove = useCallback((state: CS, m: CMove) => {
        setHistory(h => [...h, state]);
        setLastMove(m);
        const next = applyMove(state, m);
        setCs(next);
        setSelected(null); setMoves([]);
        const st = calcStatus(next);
        setStatus(st);
        if (st === "checkmate" || st === "stalemate") endGame(next, st);
        return next;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameMode, difficulty, playerColor, stats, elapsed, addCoins]);

    // Bot move trigger
    useEffect(() => {
        if (screen !== "playing" || status === "checkmate" || status === "stalemate") return;
        if (gameMode !== "bot" || cs.turn === playerColor || botThinking) return;
        setBotThinking(true);
        const t = setTimeout(() => {
            const m = getBotMove(cs, difficulty);
            if (m) doMove(cs, m);
            setBotThinking(false);
        }, 500);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cs.turn, screen, status]);

    function handleCellClick(r: number, c: number) {
        if (status === "checkmate" || status === "stalemate" || botThinking) return;
        if (gameMode === "bot" && cs.turn !== playerColor) return;
        const piece = cs.board[r][c];

        if (selected) {
            const target = moves.find(m => m.to[0] === r && m.to[1] === c);
            if (target) {
                const movingPiece = cs.board[selected[0]][selected[1]];
                if (movingPiece && gt(movingPiece) === "P" && (r === 0 || r === 7) && !target.promo) {
                    setPromoTarget({ from: selected, to: [r, c] });
                    return;
                }
                doMove(cs, target);
                return;
            }
        }
        if (piece && gc(piece) === cs.turn) {
            setSelected([r, c]); setMoves(legalAt(cs, r, c));
        } else {
            setSelected(null); setMoves([]);
        }
    }

    function handlePromoChoice(pt: PieceType) {
        if (!promoTarget) return;
        const all = legalAt(cs, promoTarget.from[0], promoTarget.from[1]);
        const m = all.find(mv => mv.to[0] === promoTarget.to[0] && mv.to[1] === promoTarget.to[1] && mv.promo === pt);
        if (m) doMove(cs, m);
        setPromoTarget(null);
    }

    function handleUndo() {
        if (!spendCoins(UNDO_COST)) return;
        const steps = gameMode === "bot" ? 2 : 1;
        const idx = Math.max(0, history.length - steps);
        const prev = history[idx] ?? makeInitialState();
        setHistory(h => h.slice(0, idx));
        setCs(prev); setSelected(null); setMoves([]);
        setLastMove(null); setStatus(calcStatus(prev));
    }

    function startGame() {
        setCs(makeInitialState()); setHistory([]); setSelected(null); setMoves([]);
        setLastMove(null); setStatus("playing"); setWinner(null);
        setEarnedCoins(0); setElapsed(0); setBotThinking(false); setPromoTarget(null);
        setScreen("playing");
    }

    function resetStats() {
        saveStats(INIT_STATS);
    }

    // ── Status bar text ───────────────────────────────────────────────────────
    const statusText =
        status === "checkmate" ? `Checkmate — ${opp(cs.turn) === "w" ? "White" : "Black"} wins`
            : status === "stalemate" ? "Stalemate — Draw"
                : status === "check" ? `${cs.turn === "w" ? "White ♔" : "Black ♚"} is in Check!`
                    : botThinking ? "AI thinking…"
                        : `${cs.turn === "w" ? "⬜ White" : "⬛ Black"}'s turn`;

    const statusColor =
        status === "checkmate" ? "text-red-400 border-red-500/30 bg-red-500/10"
            : status === "stalemate" ? "text-gray-300 border-white/10 bg-white/5"
                : status === "check" ? "text-orange-300 border-orange-500/40 bg-orange-500/10 animate-pulse"
                    : "text-white/60 border-white/10 bg-white/5";

    // ── PROMO MODAL ───────────────────────────────────────────────────────────
    const PIECE_SYM: Record<string, string> = { wQ: "♕", wR: "♖", wB: "♗", wN: "♘", bQ: "♛", bR: "♜", bB: "♝", bN: "♞" };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white px-3 py-6">

            {/* Subtle background grid */}
            <div className="fixed inset-0 pointer-events-none"
                style={{ backgroundImage: "radial-gradient(rgba(99,102,241,0.04) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />

            <div className="relative max-w-7xl mx-auto">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-6">
                    <Link href="/games" className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors">
                        <ChevronLeft size={16} /> Games
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-xl">♟</span>
                        <h1 className="text-lg font-bold text-white/90 tracking-tight">Chess</h1>
                    </div>
                    <div className="w-20" />
                </div>

                {/* ── MENU ── */}
                {screen === "menu" && (
                    <div className="max-w-sm mx-auto">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                            <ModePanel
                                gameMode={gameMode} difficulty={difficulty} playerColor={playerColor}
                                onModeChange={setGameMode} onDifficultyChange={setDifficulty}
                                onColorChange={setPlayerColor} onStart={startGame}
                            />
                        </div>
                        {/* Stats preview below menu */}
                        <div className="mt-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
                            <StatsPanel stats={stats} coins={coins} elapsed={0} />
                        </div>
                    </div>
                )}

                {/* ── PLAYING ── */}
                {screen === "playing" && (
                    <div className="flex flex-col lg:flex-row gap-4 items-start justify-center">

                        {/* Left panel */}
                        <div className="w-full lg:w-64 xl:w-72 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl order-2 lg:order-1">
                            <ModePanel
                                gameMode={gameMode} difficulty={difficulty} playerColor={playerColor}
                                onModeChange={m => { setGameMode(m); }}
                                onDifficultyChange={setDifficulty}
                                onColorChange={setPlayerColor}
                                onStart={startGame}
                            />
                        </div>

                        {/* Center: board + status + controls */}
                        <div className="flex flex-col items-center gap-4 order-1 lg:order-2">

                            {/* Status badge */}
                            <div className={`px-4 py-2 rounded-xl border text-sm font-semibold ${statusColor}`}>
                                {statusText}
                            </div>

                            {/* Board wrapper (relative for overlay) */}
                            <div className="relative">
                                <ChessBoard
                                    cs={cs} selected={selected} legalMoves={moves}
                                    lastMove={lastMove} flipped={flipped}
                                    botThinking={botThinking}
                                    onCellClick={handleCellClick}
                                />
                                {/* Game over overlay */}
                                <GameOverlay
                                    status={status} winner={winner}
                                    playerColor={playerColor} gameMode={gameMode}
                                    earnedCoins={earnedCoins}
                                    onRestart={startGame}
                                    onMenu={() => setScreen("menu")}
                                />
                            </div>

                            {/* Controls below board */}
                            <Controls
                                onRestart={startGame}
                                onChangeMode={() => setScreen("menu")}
                                onFlipBoard={() => setFlipped(f => !f)}
                                onResetStats={resetStats}
                                onUndo={handleUndo}
                                canUndo={history.length > 0}
                                undoCost={UNDO_COST}
                                coins={coins}
                                gameStarted={history.length > 0}
                            />
                        </div>

                        {/* Right panel: Stats */}
                        <div className="w-full lg:w-64 xl:w-72 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl order-3">
                            <StatsPanel stats={stats} coins={coins} elapsed={elapsed} />
                        </div>
                    </div>
                )}
            </div>

            {/* Promotion modal */}
            {promoTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
                        <p className="text-sm font-bold text-white/70 mb-4 text-center">Promote pawn to:</p>
                        <div className="flex gap-3">
                            {(["Q", "R", "B", "N"] as PieceType[]).map(pt => (
                                <button key={pt} onClick={() => handlePromoChoice(pt)}
                                    className="w-14 h-14 flex items-center justify-center bg-white/5 hover:bg-indigo-500/20 rounded-xl text-3xl transition-all duration-150 border border-white/10 hover:border-indigo-400/50 hover:scale-110">
                                    {PIECE_SYM[`${cs.turn}${pt}`] ?? pt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
