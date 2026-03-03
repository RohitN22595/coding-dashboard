"use client";

import { useState, useEffect, useCallback } from "react";
import { useCoins } from "@/lib/useCoins";
import {
    type Player, type Board, type Difficulty,
    getWinner, getWinLine, isDraw, getBotMove,
} from "@/lib/tictactoeAI";
import TicTacToeBoard from "./_components/Board";
import ModeSelector from "./_components/ModeSelector";
import StatsPanel from "./_components/StatsPanel";
import Controls from "./_components/Controls";
import { ChevronLeft, Coins } from "lucide-react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
type GameMode = "bot" | "local";
type GameStatus = "idle" | "playing" | "won" | "draw";
interface Stats { played: number; wins: number; draws: number; losses: number }

const INIT_STATS: Stats = { played: 0, wins: 0, draws: 0, losses: 0 };
const LS_STATS = "ttt_stats";
const COIN_WIN = 5, COIN_DRAW = 2;

function emptyBoard(): Board { return Array(9).fill(null); }

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────
function StatusBadge({ status, winner, turn, mode, botThinking }: {
    status: GameStatus; winner: Player | null; turn: Player;
    mode: GameMode; botThinking: boolean;
}) {
    if (status === "won") {
        const label = mode === "local"
            ? `Player ${winner} Wins! 🎉`
            : winner === "X" ? "You Win! 🎉" : "Bot Wins! 🤖";
        const cls = winner === "X"
            ? "bg-indigo-500/20 border-indigo-400/40 text-indigo-200 shadow-[0_0_20px_rgba(99,102,241,0.25)]"
            : "bg-rose-500/20 border-rose-400/40 text-rose-200 shadow-[0_0_20px_rgba(251,113,133,0.2)]";
        return (
            <div className={`px-5 py-2.5 rounded-2xl border text-sm font-bold animate-pulse ${cls}`}>
                {label}
            </div>
        );
    }
    if (status === "draw") return (
        <div className="px-5 py-2.5 rounded-2xl border text-sm font-bold bg-white/8 border-white/15 text-white/60">
            It&apos;s a Draw! 🤝
        </div>
    );
    if (botThinking) return (
        <div className="px-5 py-2.5 rounded-2xl border text-sm font-semibold bg-white/5 border-white/10 text-white/50 flex items-center gap-2">
            <span className="flex gap-1">
                {[0, 1, 2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
            </span>
            Bot thinking…
        </div>
    );
    const turnColor = turn === "X" ? "text-indigo-300" : "text-rose-300";
    return (
        <div className="px-5 py-2.5 rounded-2xl border text-sm font-semibold bg-white/5 border-white/10 text-white/50">
            <span className={`font-bold ${turnColor}`}>Player {turn}</span>&apos;s turn
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// COIN POPUP
// ─────────────────────────────────────────────────────────────────────────────
function CoinPopup({ amount }: { amount: number }) {
    return (
        <div className="absolute top-0 right-0 -translate-y-full text-xs font-bold text-amber-300
            animate-[coinPop_1s_ease-out_forwards]">
            +{amount} coins!
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function TicTacToePage() {
    const { coins, addCoins } = useCoins();

    const [gameMode, setGameMode] = useState<GameMode>("bot");
    const [difficulty, setDifficulty] = useState<Difficulty>("medium");
    const [board, setBoard] = useState<Board>(emptyBoard);
    const [turn, setTurn] = useState<Player>("X");
    const [status, setStatus] = useState<GameStatus>("idle");
    const [winner, setWinner] = useState<Player | null>(null);
    const [winLine, setWinLine] = useState<number[] | null>(null);
    const [botThinking, setBotThinking] = useState(false);
    const [stats, setStats] = useState<Stats>(INIT_STATS);
    const [coinPopup, setCoinPopup] = useState(0);

    useEffect(() => {
        try { setStats({ ...INIT_STATS, ...JSON.parse(localStorage.getItem(LS_STATS) ?? "{}") }); } catch {/**/ }
    }, []);

    const saveStats = useCallback((s: Stats) => {
        setStats(s); localStorage.setItem(LS_STATS, JSON.stringify(s));
    }, []);

    function showCoinPopup(amount: number) {
        setCoinPopup(amount);
        setTimeout(() => setCoinPopup(0), 1000);
    }

    const endGame = useCallback((newBoard: Board) => {
        const w = getWinner(newBoard);
        const d = isDraw(newBoard);
        if (!w && !d) return false;

        const s = { ...stats, played: stats.played + 1 };
        if (w) {
            setStatus("won"); setWinner(w);
            setWinLine(getWinLine(newBoard));
            if (gameMode === "local" || w === "X") {
                addCoins(COIN_WIN); showCoinPopup(COIN_WIN); s.wins++;
            } else { s.losses++; }
        } else {
            setStatus("draw"); addCoins(COIN_DRAW); showCoinPopup(COIN_DRAW); s.draws++;
        }
        saveStats(s);
        return true;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stats, gameMode, addCoins, saveStats]);

    function handleSquareClick(i: number) {
        if (status !== "playing" || board[i] || botThinking) return;
        if (gameMode === "bot" && turn === "O") return;
        const next = [...board] as Board; next[i] = turn;
        setBoard(next);
        if (!endGame(next)) setTurn(t => t === "X" ? "O" : "X");
    }

    useEffect(() => {
        if (status !== "playing" || gameMode !== "bot" || turn !== "O") return;
        setBotThinking(true);
        const t = setTimeout(() => {
            const move = getBotMove([...board], difficulty);
            if (move !== -1) {
                const next = [...board] as Board; next[move] = "O";
                setBoard(next);
                if (!endGame(next)) setTurn("X");
            }
            setBotThinking(false);
        }, 500);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [turn, status]);

    function startOrRestart() {
        setBoard(emptyBoard()); setTurn("X"); setStatus("playing");
        setWinner(null); setWinLine(null); setBotThinking(false);
    }

    // Auto-start when mode changes
    function handleModeChange(m: GameMode) { setGameMode(m); }
    function handleDifficultyChange(d: Difficulty) { setDifficulty(d); }

    const isGameOver = status === "won" || status === "draw";

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white px-3 py-6">
            {/* Dot grid */}
            <div className="fixed inset-0 pointer-events-none"
                style={{ backgroundImage: "radial-gradient(rgba(99,102,241,0.04) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />

            <div className="relative max-w-4xl mx-auto">

                {/* Top bar */}
                <div className="flex items-center justify-between mb-6">
                    <Link href="/games" className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors">
                        <ChevronLeft size={16} /> Games
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-lg">⭕</span>
                        <h1 className="text-lg font-bold text-white/90">Tic Tac Toe</h1>
                    </div>
                    {/* Coins badge */}
                    <div className="relative">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                            <Coins size={14} className="text-amber-400" />
                            <span className="text-amber-300 font-bold text-sm">{coins}</span>
                        </div>
                        {coinPopup > 0 && <CoinPopup amount={coinPopup} />}
                    </div>
                </div>

                {/* 3-column layout */}
                <div className="flex flex-col lg:flex-row gap-4 items-start justify-center">

                    {/* Left panel */}
                    <div className="w-full lg:w-60 xl:w-64 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl order-2 lg:order-1 flex flex-col gap-5">
                        <ModeSelector
                            gameMode={gameMode} difficulty={difficulty}
                            onModeChange={handleModeChange}
                            onDifficultyChange={handleDifficultyChange}
                        />
                        {/* Coin rules */}
                        <div className="text-[10px] text-amber-300/60 bg-amber-500/8 border border-amber-500/15 rounded-xl px-3 py-2 leading-relaxed">
                            🏆 Win → <span className="text-amber-300 font-bold">+{COIN_WIN}</span> coins
                            &nbsp;·&nbsp;
                            🤝 Draw → <span className="text-amber-300 font-bold">+{COIN_DRAW}</span> coins
                        </div>
                        <button onClick={startOrRestart}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:brightness-110 active:scale-95 transition-all duration-200">
                            {status === "idle" ? "✦ Start Game" : "✦ New Game"}
                        </button>
                    </div>

                    {/* Center: board */}
                    <div className="flex flex-col items-center gap-4 order-1 lg:order-2">
                        {/* Status badge */}
                        <StatusBadge
                            status={status} winner={winner} turn={turn}
                            mode={gameMode} botThinking={botThinking}
                        />

                        {/* Board (or start prompt) */}
                        {status === "idle" ? (
                            <div className="flex items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/3 text-white/20 text-sm"
                                style={{ width: "min(90vw,340px)", height: "min(90vw,340px)" }}>
                                Select a mode and start!
                            </div>
                        ) : (
                            <TicTacToeBoard
                                squares={board} winLine={winLine}
                                disabled={isGameOver || botThinking || (gameMode === "bot" && turn === "O")}
                                onSquareClick={handleSquareClick}
                            />
                        )}

                        {/* Controls */}
                        {status !== "idle" && (
                            <Controls
                                onRestart={startOrRestart}
                                onChangeMode={() => { setStatus("idle"); setBoard(emptyBoard()); setTurn("X"); setWinLine(null); setWinner(null); }}
                                onResetStats={() => saveStats(INIT_STATS)}
                            />
                        )}

                        {/* Play Again button after game over */}
                        {isGameOver && (
                            <button onClick={startOrRestart}
                                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-bold text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all duration-200">
                                Play Again
                            </button>
                        )}
                    </div>

                    {/* Right panel: Stats */}
                    <div className="w-full lg:w-60 xl:w-64 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl order-3">
                        <StatsPanel stats={stats} />
                    </div>
                </div>
            </div>
        </div>
    );
}
