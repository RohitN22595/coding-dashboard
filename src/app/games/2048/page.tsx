"use client";

import { useState, useEffect, useCallback } from "react";
import { RotateCcw, Trophy, Coins, AlertTriangle, Star } from "lucide-react";
import { useCoins } from "@/lib/useCoins";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
type Board = number[][];

const SIZE = 4;
const LS_BEST = "game2048_best";

/** Milestones: tile value → coins awarded */
const MILESTONES: Record<number, number> = { 512: 5, 1024: 10, 2048: 25 };
const WIN_BONUS = 20;

// ─────────────────────────────────────────────────────────────────────────────
// PURE GAME LOGIC
// ─────────────────────────────────────────────────────────────────────────────
function emptyBoard(): Board {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function addRandom(board: Board): Board {
    const empty: [number, number][] = [];
    for (let r = 0; r < SIZE; r++)
        for (let c = 0; c < SIZE; c++)
            if (board[r][c] === 0) empty.push([r, c]);
    if (empty.length === 0) return board;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    const next = board.map(row => [...row]);
    next[r][c] = Math.random() < 0.9 ? 2 : 4;
    return next;
}

function rotateLeft(board: Board): Board {
    return board[0].map((_, c) => board.map(row => row[c]).reverse());
}

function rotateRight(board: Board): Board {
    return board[0].map((_, c) => board.map(row => row[row.length - 1 - c]));
}

/** Slide and merge a single row LEFT. Returns { row, score }. */
function slideRow(row: number[]): { row: number[]; score: number } {
    const filtered = row.filter(v => v !== 0);
    let score = 0;
    const merged: number[] = [];
    let i = 0;
    while (i < filtered.length) {
        if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
            const val = filtered[i] * 2;
            merged.push(val);
            score += val;
            i += 2;
        } else {
            merged.push(filtered[i]);
            i++;
        }
    }
    while (merged.length < SIZE) merged.push(0);
    return { row: merged, score };
}

type Direction = "left" | "right" | "up" | "down";

function move(board: Board, dir: Direction): { board: Board; score: number; moved: boolean } {
    let b = board.map(row => [...row]);
    let totalScore = 0;
    let moved = false;

    // Rotate so we always slide LEFT
    if (dir === "right") b = b.map(row => [...row].reverse());
    if (dir === "up") b = rotateRight(b);
    if (dir === "down") b = rotateLeft(b);

    b = b.map(row => {
        const { row: newRow, score } = slideRow(row);
        if (newRow.join() !== row.join()) moved = true;
        totalScore += score;
        return newRow;
    });

    // Rotate back
    if (dir === "right") b = b.map(row => [...row].reverse());
    if (dir === "up") b = rotateLeft(b);
    if (dir === "down") b = rotateRight(b);

    return { board: b, score: totalScore, moved };
}

function isGameOver(board: Board): boolean {
    for (let r = 0; r < SIZE; r++)
        for (let c = 0; c < SIZE; c++) {
            if (board[r][c] === 0) return false;
            if (c + 1 < SIZE && board[r][c] === board[r][c + 1]) return false;
            if (r + 1 < SIZE && board[r][c] === board[r + 1][c]) return false;
        }
    return true;
}

function maxTile(board: Board): number {
    return Math.max(...board.flat());
}

// ─────────────────────────────────────────────────────────────────────────────
// TILE STYLING
// ─────────────────────────────────────────────────────────────────────────────
const TILE_STYLES: Record<number, string> = {
    0: "bg-gray-100 dark:bg-gray-800",
    2: "bg-slate-200 dark:bg-slate-700 text-gray-800 dark:text-gray-100",
    4: "bg-stone-300 dark:bg-stone-600 text-gray-800 dark:text-gray-100",
    8: "bg-orange-300 dark:bg-orange-700 text-white",
    16: "bg-orange-400 dark:bg-orange-600 text-white",
    32: "bg-orange-500 text-white",
    64: "bg-red-500 text-white",
    128: "bg-yellow-400 dark:bg-yellow-600 text-white font-extrabold",
    256: "bg-yellow-500 text-white font-extrabold",
    512: "bg-lime-500 text-white font-extrabold",
    1024: "bg-emerald-500 text-white font-extrabold",
    2048: "bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-extrabold shadow-lg",
};

function tileStyle(val: number): string {
    return TILE_STYLES[val] ?? "bg-purple-500 text-white font-extrabold";
}

function tileFontSize(val: number): string {
    if (val >= 1024) return "text-lg sm:text-xl";
    if (val >= 128) return "text-xl sm:text-2xl";
    return "text-2xl sm:text-3xl";
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function Game2048Page() {
    const { coins, addCoins, spendCoins } = useCoins();

    const [board, setBoard] = useState<Board>(emptyBoard);
    const [score, setScore] = useState(0);
    const [best, setBest] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);
    const [continued, setContinued] = useState(false); // after reaching 2048

    /** Track which milestone tiles have already been rewarded this game */
    const [awardedMilestones, setAwardedMilestones] = useState<Set<number>>(new Set());

    // Toast notifications
    const [toast, setToast] = useState<string | null>(null);

    function showToast(msg: string) {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    }

    // ── Load best score on mount ──────────────────────────────────────────────
    useEffect(() => {
        const v = parseInt(localStorage.getItem(LS_BEST) ?? "0", 10);
        setBest(isNaN(v) ? 0 : v);
        startGame();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Start / restart ───────────────────────────────────────────────────────
    const startGame = useCallback(() => {
        let b = emptyBoard();
        b = addRandom(b);
        b = addRandom(b);
        setBoard(b);
        setScore(0);
        setGameOver(false);
        setWon(false);
        setContinued(false);
        setAwardedMilestones(new Set());
    }, []);

    // ── Check milestones & win ────────────────────────────────────────────────
    function checkMilestones(newBoard: Board, newScore: number, newAwardedSet: Set<number>) {
        let awarded = new Set(newAwardedSet);
        let extra = 0;
        const msgs: string[] = [];

        const max = maxTile(newBoard);
        for (const [tile, reward] of Object.entries(MILESTONES)) {
            const t = Number(tile);
            if (max >= t && !awarded.has(t)) {
                awarded.add(t);
                extra += reward;
                msgs.push(`${t} tile! +${reward} coins`);
            }
        }

        // Win check
        if (max >= 2048 && !won && !continued) {
            extra += WIN_BONUS;
            msgs.push(`You won! +${WIN_BONUS} coins`);
            setWon(true);
        }

        if (extra > 0) {
            addCoins(extra);
            showToast(msgs.join(" · "));
        }
        setAwardedMilestones(awarded);

        // Best score
        if (newScore > best) {
            setBest(newScore);
            localStorage.setItem(LS_BEST, String(newScore));
        }

        // Game over
        if (isGameOver(newBoard)) setGameOver(true);
    }

    // ── Handle a direction move ───────────────────────────────────────────────
    const handleMove = useCallback((dir: Direction) => {
        if (gameOver) return;
        if (won && !continued) return; // must click "Continue" first

        setBoard(prev => {
            const { board: newBoard, score: gained, moved } = move(prev, dir);
            if (!moved) return prev;

            const withNew = addRandom(newBoard);

            setScore(prevScore => {
                const newScore = prevScore + gained;
                setAwardedMilestones(prevAwarded => {
                    checkMilestones(withNew, newScore, prevAwarded);
                    return prevAwarded; // actual set is updated inside checkMilestones
                });
                return newScore;
            });

            return withNew;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameOver, won, continued, best, addCoins]);

    // ── Keyboard ─────────────────────────────────────────────────────────────
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const map: Record<string, Direction> = {
                ArrowLeft: "left", ArrowRight: "right",
                ArrowUp: "up", ArrowDown: "down",
            };
            const dir = map[e.key];
            if (dir) { e.preventDefault(); handleMove(dir); }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [handleMove]);

    // ── Touch swipe support ───────────────────────────────────────────────────
    useEffect(() => {
        let startX = 0, startY = 0;
        const onTouchStart = (e: TouchEvent) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        };
        const onTouchEnd = (e: TouchEvent) => {
            const dx = e.changedTouches[0].clientX - startX;
            const dy = e.changedTouches[0].clientY - startY;
            const absDx = Math.abs(dx), absDy = Math.abs(dy);
            if (Math.max(absDx, absDy) < 20) return;
            if (absDx > absDy) handleMove(dx > 0 ? "right" : "left");
            else handleMove(dy > 0 ? "down" : "up");
        };
        window.addEventListener("touchstart", onTouchStart, { passive: true });
        window.addEventListener("touchend", onTouchEnd, { passive: true });
        return () => {
            window.removeEventListener("touchstart", onTouchStart);
            window.removeEventListener("touchend", onTouchEnd);
        };
    }, [handleMove]);

    function handleContinue() {
        if (!spendCoins(10)) {
            showToast("Not enough coins to continue!");
            return;
        }
        setContinued(true);
        setWon(false);
        showToast("Continuing... –10 coins");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/40 to-rose-50/20 dark:from-gray-950 dark:via-orange-950/10 dark:to-gray-950 px-4 py-6 flex flex-col items-center">

            {/* Toast */}
            {toast && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-semibold rounded-2xl shadow-xl animate-bounce">
                    {toast}
                </div>
            )}

            <div className="w-full max-w-sm">

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">2048</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Swipe or use arrow keys</p>
                    </div>
                    <button onClick={startGame}
                        className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition shadow-sm">
                        <RotateCcw size={14} /> New Game
                    </button>
                </div>

                {/* Score row */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                        { label: "Score", value: score.toLocaleString(), icon: <Star size={13} />, color: "text-orange-500" },
                        { label: "Best", value: Math.max(score, best).toLocaleString(), icon: <Trophy size={13} />, color: "text-amber-500" },
                        { label: "Coins", value: coins.toString(), icon: <Coins size={13} />, color: "text-yellow-500" },
                    ].map(({ label, value, icon, color }) => (
                        <div key={label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-center shadow-sm">
                            <div className={`flex items-center justify-center gap-1 ${color} mb-1`}>{icon}</div>
                            <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">{value}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Milestone guide */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {Object.entries(MILESTONES).map(([tile, reward]) => (
                        <span key={tile}
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold border transition ${awardedMilestones.has(Number(tile))
                                    ? "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300"
                                    : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                                }`}>
                            {tile} → +{reward}¢
                        </span>
                    ))}
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold border border-orange-200 dark:border-orange-700 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                        Win → +{WIN_BONUS}¢
                    </span>
                </div>

                {/* ── Grid ── */}
                <div className="relative bg-gray-200 dark:bg-gray-700 p-2 rounded-2xl shadow-lg">
                    <div className="grid grid-cols-4 gap-2">
                        {board.map((row, r) =>
                            row.map((val, c) => (
                                <div key={`${r}-${c}`}
                                    className={`aspect-square rounded-xl flex items-center justify-center transition-all duration-100 ${tileStyle(val)} ${val !== 0 ? tileFontSize(val) : ""}`}>
                                    {val !== 0 ? val : ""}
                                </div>
                            )),
                        )}
                    </div>

                    {/* Game Over overlay */}
                    {gameOver && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
                            <AlertTriangle size={36} className="text-red-400 mb-2" />
                            <p className="text-white font-bold text-xl mb-1">Game Over!</p>
                            <p className="text-gray-300 text-sm mb-4">Score: {score.toLocaleString()}</p>
                            <button onClick={startGame}
                                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition">
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Win overlay */}
                    {won && !continued && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-3 shadow-lg">
                                <Star size={28} className="text-white" fill="white" />
                            </div>
                            <p className="text-white font-extrabold text-2xl mb-1">You Win!</p>
                            <p className="text-amber-300 text-sm mb-4">+{WIN_BONUS} coins awarded!</p>
                            <div className="flex gap-2">
                                <button onClick={startGame}
                                    className="px-4 py-2 bg-white/90 hover:bg-white text-gray-900 rounded-xl text-sm font-bold transition">
                                    New Game
                                </button>
                                <button onClick={handleContinue}
                                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition">
                                    Continue (–10¢)
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Direction buttons (mobile fallback) */}
                <div className="mt-5 grid grid-cols-3 gap-2 max-w-[180px] mx-auto">
                    {[
                        { dir: "up" as Direction, label: "↑", col: "col-start-2" },
                        { dir: "left" as Direction, label: "←", col: "col-start-1" },
                        { dir: "down" as Direction, label: "↓", col: "col-start-2" },
                        { dir: "right" as Direction, label: "→", col: "col-start-3" },
                    ].map(({ dir, label, col }) => (
                        <button key={dir} onClick={() => handleMove(dir)}
                            className={`${col} w-12 h-12 mx-auto flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-lg font-bold text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 transition shadow-sm`}>
                            {label}
                        </button>
                    ))}
                </div>

                <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-4">
                    Arrow keys or swipe to play
                </p>
            </div>
        </div>
    );
}
