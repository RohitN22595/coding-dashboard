"use client";

import Link from "next/link";
import { Coins, Grid3X3, LayoutGrid } from "lucide-react";
import { useCoins } from "@/lib/useCoins";

// ─── Stat helpers (client-side only) ─────────────────────────────────────────
function getSudokuBest(): string | null {
    if (typeof window === "undefined") return null;
    try {
        const lb = JSON.parse(localStorage.getItem("sudoku_leaderboard") ?? "{}");
        const times = ["easy", "medium", "hard"].map((d) => lb[d]?.time).filter((t): t is number => typeof t === "number");
        if (!times.length) return null;
        const best = Math.min(...times);
        return `${Math.floor(best / 60).toString().padStart(2, "0")}:${(best % 60).toString().padStart(2, "0")}`;
    } catch { return null; }
}

function get2048Best(): number | null {
    if (typeof window === "undefined") return null;
    const v = parseInt(localStorage.getItem("game2048_best") ?? "0", 10);
    return v > 0 ? v : null;
}

function getChessStats(): { wins: number; bestDiff: string | null } {
    if (typeof window === "undefined") return { wins: 0, bestDiff: null };
    try {
        const s = JSON.parse(localStorage.getItem("chess_stats") ?? "{}");
        const wins = s.wins ?? 0;
        const bestDiff = s.winsHard > 0 ? "Hard" : s.winsMedium > 0 ? "Medium" : s.winsEasy > 0 ? "Easy" : null;
        return { wins, bestDiff };
    } catch { return { wins: 0, bestDiff: null }; }
}

function getTTTStats(): { wins: number; played: number } {
    if (typeof window === "undefined") return { wins: 0, played: 0 };
    try {
        const s = JSON.parse(localStorage.getItem("ttt_stats") ?? "{}");
        return { wins: s.wins ?? 0, played: s.played ?? 0 };
    } catch { return { wins: 0, played: 0 }; }
}


export default function GamesPage() {
    const { coins } = useCoins();
    const sudokuBest = typeof window !== "undefined" ? getSudokuBest() : null;
    const best2048 = typeof window !== "undefined" ? get2048Best() : null;
    const chessStats = typeof window !== "undefined" ? getChessStats() : { wins: 0, bestDiff: null };
    const tttStats = typeof window !== "undefined" ? getTTTStats() : { wins: 0, played: 0 };

    const games = [
        {
            href: "/games/sudoku",
            label: "Sudoku",
            icon: Grid3X3,
            emoji: "🔢",
            description: "Fill the 9×9 grid. Every row, column & 3×3 box must contain 1–9.",
            accent: "from-indigo-500 to-purple-600",
            textAccent: "text-indigo-500 dark:text-indigo-400",
            bgAccent: "bg-indigo-50 dark:bg-indigo-900/20",
            bestLabel: sudokuBest ? `Best time: ${sudokuBest}` : "Not yet played",
            badge: "3 Difficulties",
            badgeBg: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300",
        },
        {
            href: "/games/2048",
            label: "2048",
            icon: LayoutGrid,
            emoji: "🎮",
            description: "Slide tiles to combine them. Reach the 2048 tile to win!",
            accent: "from-orange-400 to-rose-500",
            textAccent: "text-orange-500 dark:text-orange-400",
            bgAccent: "bg-orange-50 dark:bg-orange-900/20",
            bestLabel: best2048 ? `Best score: ${best2048.toLocaleString()}` : "Not yet played",
            badge: "Earn Coins",
            badgeBg: "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300",
        },
        {
            href: "/games/chess",
            label: "Chess",
            icon: null,
            emoji: "♟",
            description: "Classic chess vs AI or a friend. Easy / Medium / Hard bot included.",
            accent: "from-emerald-500 to-teal-600",
            textAccent: "text-emerald-600 dark:text-emerald-400",
            bgAccent: "bg-emerald-50 dark:bg-emerald-900/20",
            bestLabel: chessStats.wins > 0
                ? `${chessStats.wins} win${chessStats.wins !== 1 ? "s" : ""}${chessStats.bestDiff ? ` · Best: ${chessStats.bestDiff}` : ""}`
                : "Not yet played",
            badge: "vs Bot / 2P",
            badgeBg: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300",
        },
        {
            href: "/games/tictactoe",
            label: "Tic Tac Toe",
            icon: null,
            emoji: "⭕",
            description: "Classic X vs O. Beat the unbeatable minimax bot or challenge a friend.",
            accent: "from-violet-500 to-fuchsia-600",
            textAccent: "text-violet-600 dark:text-violet-400",
            bgAccent: "bg-violet-50 dark:bg-violet-900/20",
            bestLabel: tttStats.played > 0
                ? `${tttStats.wins} win${tttStats.wins !== 1 ? "s" : ""} · ${tttStats.played} played`
                : "Not yet played",
            badge: "vs Bot / 2P",
            badgeBg: "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-gray-950 dark:via-indigo-950/20 dark:to-purple-950/10 px-4 py-8">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Games</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Play games, earn coins, climb the leaderboard.</p>
                    </div>
                    <div className="flex items-center gap-2.5 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl shadow-sm">
                        <Coins size={20} className="text-amber-500" />
                        <span className="text-xl font-bold text-amber-700 dark:text-amber-300">{coins}</span>
                        <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">coins</span>
                    </div>
                </div>

                {/* Coin guide */}
                <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">How to earn coins</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                        {[
                            { label: "Solve Sudoku", value: "10–40" },
                            { label: "2048 → 2048", value: "+45" },
                            { label: "Beat Chess Bot", value: "10–40" },
                            { label: "Local 2P Win", value: "+5" },
                        ].map(({ label, value }) => (
                            <div key={label} className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl p-2">
                                <p className="font-bold text-amber-600 dark:text-amber-400 text-sm">{value}</p>
                                <p className="text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Game cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {games.map(({ href, label, icon: Icon, emoji, description, accent, textAccent, bgAccent, bestLabel, badge, badgeBg }) => (
                        <Link key={href} href={href}
                            className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
                            <div className={`h-1.5 w-full bg-gradient-to-r ${accent}`} />
                            <div className="p-5 flex flex-col gap-3 flex-1">
                                <div className="flex items-start justify-between">
                                    <div className={`w-12 h-12 rounded-xl ${bgAccent} flex items-center justify-center`}>
                                        {Icon ? <Icon size={24} className={textAccent} /> : <span className="text-2xl">{emoji}</span>}
                                    </div>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeBg}`}>{badge}</span>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{label}</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{description}</p>
                                </div>
                                <p className={`text-xs font-semibold ${textAccent}`}>{bestLabel}</p>
                                <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <span className={`text-sm font-semibold ${textAccent} group-hover:underline`}>Play Now →</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
