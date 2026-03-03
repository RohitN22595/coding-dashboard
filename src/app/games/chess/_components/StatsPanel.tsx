import React from "react";
import { Trophy, TrendingUp, Minus, Flame, Coins } from "lucide-react";

export interface ChessStats {
    wins: number; losses: number; draws: number;
    winsEasy: number; winsMedium: number; winsHard: number;
    winsLocal: number; currentStreak: number; bestStreak: number;
    fastestWin: number | null;
}

interface StatsPanelProps {
    stats: ChessStats;
    coins: number;
    elapsed: number;
}

function fmt(s: number) {
    return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

function StatRow({ icon, label, value, highlight }: {
    icon: React.ReactNode; label: string; value: string | number; highlight?: string;
}) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0">{icon}</div>
                <span className="text-xs text-white/50">{label}</span>
            </div>
            <span className={`text-sm font-bold ${highlight ?? "text-white/80"}`}>{value}</span>
        </div>
    );
}

export default function StatsPanel({ stats, coins, elapsed }: StatsPanelProps) {
    const total = stats.wins + stats.losses + stats.draws;
    const winRate = total > 0 ? Math.round((stats.wins / total) * 100) : 0;

    return (
        <div className="flex flex-col gap-4 w-full">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest">Stats</h2>

            {/* Coins */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Coins size={20} className="text-amber-400" />
                <div>
                    <p className="text-xs text-amber-300/60">Global Coins</p>
                    <p className="text-xl font-extrabold text-amber-300">{coins}</p>
                </div>
            </div>

            {/* Win rate ring visual */}
            <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/5 border border-white/8">
                <div className="relative w-14 h-14 flex-shrink-0">
                    <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                        <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                        <circle cx="28" cy="28" r="22" fill="none"
                            stroke={winRate >= 50 ? "#818cf8" : "#f87171"}
                            strokeWidth="6"
                            strokeDasharray={`${(winRate / 100) * 138.2} 138.2`}
                            strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-white/80">{winRate}%</span>
                    </div>
                </div>
                <div>
                    <p className="text-xs text-white/40 mb-1">Win Rate</p>
                    <p className="text-sm text-white/70">{total} games played</p>
                </div>
            </div>

            {/* Detailed stats */}
            <div className="bg-white/5 border border-white/8 rounded-xl px-3 py-1">
                <StatRow icon={<Trophy size={13} className="text-yellow-400" />} label="Wins" value={stats.wins} highlight="text-green-400" />
                <StatRow icon={<Minus size={13} className="text-red-400" />} label="Losses" value={stats.losses} highlight="text-red-400" />
                <StatRow icon={<Minus size={13} className="text-gray-400" />} label="Draws" value={stats.draws} />
                <StatRow icon={<Flame size={13} className="text-orange-400" />} label="Streak" value={stats.currentStreak} highlight={stats.currentStreak > 0 ? "text-orange-400" : undefined} />
                <StatRow icon={<TrendingUp size={13} className="text-indigo-400" />} label="Best Streak" value={stats.bestStreak} />
                {stats.fastestWin && (
                    <StatRow icon={<Trophy size={13} className="text-purple-400" />} label="Fastest Win" value={fmt(stats.fastestWin)} highlight="text-purple-400" />
                )}
            </div>

            {/* Per-difficulty wins */}
            <div>
                <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-2">Bot Wins by Difficulty</h2>
                <div className="grid grid-cols-3 gap-1.5">
                    {[
                        { label: "Easy", val: stats.winsEasy, color: "text-green-400", bg: "bg-green-500/10" },
                        { label: "Medium", val: stats.winsMedium, color: "text-yellow-400", bg: "bg-yellow-500/10" },
                        { label: "Hard", val: stats.winsHard, color: "text-red-400", bg: "bg-red-500/10" },
                    ].map(({ label, val, color, bg }) => (
                        <div key={label} className={`${bg} rounded-xl p-2.5 text-center border border-white/5`}>
                            <p className={`text-base font-bold ${color}`}>{val}</p>
                            <p className="text-[10px] text-white/30">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Timer */}
            {elapsed > 0 && (
                <div className="text-center">
                    <p className="text-xs text-white/30">Game time</p>
                    <p className="font-mono text-lg font-bold text-white/60">{fmt(elapsed)}</p>
                </div>
            )}
        </div>
    );
}
