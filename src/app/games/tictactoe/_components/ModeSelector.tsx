import React from "react";
import { Bot, Users, Globe, Star } from "lucide-react";
import type { Difficulty } from "@/lib/tictactoeAI";

type GameMode = "bot" | "local";

interface ModeSelectorProps {
    gameMode: GameMode;
    difficulty: Difficulty;
    onModeChange: (m: GameMode) => void;
    onDifficultyChange: (d: Difficulty) => void;
}

const DIFF = {
    easy: { stars: 1, color: "text-green-400", ring: "ring-green-500/60", bg: "bg-green-500/15" },
    medium: { stars: 2, color: "text-yellow-400", ring: "ring-yellow-500/60", bg: "bg-yellow-500/15" },
    hard: { stars: 3, color: "text-red-400", ring: "ring-red-500/60", bg: "bg-red-500/15" },
};

export default function ModeSelector({ gameMode, difficulty, onModeChange, onDifficultyChange }: ModeSelectorProps) {
    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Mode toggle tabs */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-2xl border border-white/10">
                {([
                    { id: "bot" as GameMode, icon: Bot, label: "vs Bot" },
                    { id: "local" as GameMode, icon: Users, label: "2 Player" },
                ] as { id: GameMode; icon: React.ElementType; label: string }[]).map(({ id, icon: Icon, label }) => (
                    <button key={id} onClick={() => onModeChange(id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${gameMode === id
                                ? "bg-indigo-500/80 text-white shadow-lg shadow-indigo-500/30"
                                : "text-white/40 hover:text-white/60 hover:bg-white/5"
                            }`}>
                        <Icon size={13} /> {label}
                    </button>
                ))}
                {/* Online – disabled */}
                <button disabled
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold text-white/20 cursor-not-allowed relative">
                    <Globe size={12} /> Online
                    <span className="absolute -top-1.5 -right-0.5 px-1 py-0.5 bg-white/10 text-white/30 text-[8px] rounded-full leading-none">Soon</span>
                </button>
            </div>

            {/* Difficulty pills (bot only) */}
            {gameMode === "bot" && (
                <div>
                    <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">Difficulty</p>
                    <div className="grid grid-cols-3 gap-1.5">
                        {(["easy", "medium", "hard"] as Difficulty[]).map(d => {
                            const m = DIFF[d];
                            return (
                                <button key={d} onClick={() => onDifficultyChange(d)}
                                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-center transition-all duration-200 capitalize ${difficulty === d
                                            ? `${m.bg} ring-1 ${m.ring} border-transparent`
                                            : "bg-white/5 border-white/8 hover:bg-white/10"
                                        }`}>
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <Star key={i} size={9}
                                                className={i < m.stars ? m.color : "text-white/15"}
                                                fill={i < m.stars ? "currentColor" : "none"} />
                                        ))}
                                    </div>
                                    <span className={`text-[11px] font-semibold ${difficulty === d ? m.color : "text-white/40"}`}>{d}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
