import React from "react";
import { Trophy, Minus, Hash, TrendingDown } from "lucide-react";

interface Stats { played: number; wins: number; draws: number; losses: number }

export default function StatsPanel({ stats }: { stats: Stats }) {
    const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

    const rows = [
        { icon: <Hash size={13} className="text-white/40" />, label: "Played", val: stats.played, color: "text-white/70" },
        { icon: <Trophy size={13} className="text-yellow-400" />, label: "Wins", val: stats.wins, color: "text-green-400" },
        { icon: <Minus size={13} className="text-gray-400" />, label: "Draws", val: stats.draws, color: "text-yellow-400" },
        { icon: <TrendingDown size={13} className="text-red-400" />, label: "Losses", val: stats.losses, color: "text-red-400" },
    ];

    return (
        <div className="flex flex-col gap-3 w-full">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">Your Stats</p>

            {/* Win-rate ring */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/8">
                <div className="relative w-12 h-12 flex-shrink-0">
                    <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
                        <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
                        <circle cx="24" cy="24" r="18" fill="none"
                            stroke={winRate >= 50 ? "#818cf8" : "#f87171"}
                            strokeWidth="5"
                            strokeDasharray={`${(winRate / 100) * 113} 113`}
                            strokeLinecap="round"
                            style={{ transition: "stroke-dasharray 0.5s ease" }} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white/70">{winRate}%</span>
                    </div>
                </div>
                <div>
                    <p className="text-xs text-white/40">Win rate</p>
                    <p className="text-sm font-semibold text-white/60">{stats.played} games</p>
                </div>
            </div>

            {/* Stat rows */}
            <div className="bg-white/5 border border-white/8 rounded-xl px-3 py-1 divide-y divide-white/5">
                {rows.map(({ icon, label, val, color }) => (
                    <div key={label} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">{icon}</div>
                            <span className="text-xs text-white/45">{label}</span>
                        </div>
                        <span className={`text-sm font-bold ${color}`}>{val}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
