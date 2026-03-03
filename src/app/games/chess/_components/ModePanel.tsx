import React from "react";
import { Bot, Users, Globe, Star, ChevronRight } from "lucide-react";
import type { Color, Difficulty } from "@/lib/chessEngine";

type GameMode = "bot" | "local";

interface ModePanelProps {
    gameMode: GameMode;
    difficulty: Difficulty;
    playerColor: Color;
    onModeChange: (m: GameMode) => void;
    onDifficultyChange: (d: Difficulty) => void;
    onColorChange: (c: Color) => void;
    onStart: () => void;
}

const DIFF_META = {
    easy: { label: "Easy", stars: 1, color: "text-green-400", ring: "ring-green-500", bg: "bg-green-500/10" },
    medium: { label: "Medium", stars: 2, color: "text-yellow-400", ring: "ring-yellow-500", bg: "bg-yellow-500/10" },
    hard: { label: "Hard", stars: 3, color: "text-red-400", ring: "ring-red-500", bg: "bg-red-500/10" },
};

export default function ModePanel({
    gameMode, difficulty, playerColor, onModeChange, onDifficultyChange, onColorChange, onStart,
}: ModePanelProps) {
    const modes = [
        { id: "bot" as GameMode, icon: Bot, label: "vs AI Bot", sub: "Challenge the computer", enabled: true },
        { id: "local" as GameMode, icon: Users, label: "2 Player Local", sub: "Same device, two players", enabled: true },
        { id: "online", icon: Globe, label: "Online", sub: "Coming soon", enabled: false },
    ];

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Title */}
            <div className="mb-1">
                <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest">Game Mode</h2>
            </div>

            {/* Mode cards */}
            <div className="flex flex-col gap-2">
                {modes.map(({ id, icon: Icon, label, sub, enabled }) => {
                    const active = enabled && (gameMode === id);
                    return (
                        <button key={id}
                            disabled={!enabled}
                            onClick={() => enabled && onModeChange(id as GameMode)}
                            className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200 group ${active
                                    ? "bg-indigo-500/20 border-indigo-500/60 shadow-lg shadow-indigo-500/10"
                                    : enabled
                                        ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                        : "bg-white/3 border-white/5 opacity-40 cursor-not-allowed"
                                }`}>
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? "bg-indigo-500/30" : "bg-white/10"
                                }`}>
                                <Icon size={16} className={active ? "text-indigo-300" : "text-white/50"} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold truncate ${active ? "text-white" : "text-white/70"}`}>{label}</p>
                                <p className="text-xs text-white/35 truncate">{sub}</p>
                            </div>
                            {!enabled && (
                                <span className="px-2 py-0.5 bg-white/10 text-white/40 text-[10px] font-medium rounded-full flex-shrink-0">Soon</span>
                            )}
                            {active && <ChevronRight size={14} className="text-indigo-400 flex-shrink-0" />}
                        </button>
                    );
                })}
            </div>

            {/* Difficulty (bot only) */}
            {gameMode === "bot" && (
                <div>
                    <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-2.5">Difficulty</h2>
                    <div className="grid grid-cols-3 gap-1.5">
                        {(["easy", "medium", "hard"] as Difficulty[]).map((d) => {
                            const meta = DIFF_META[d];
                            const active = difficulty === d;
                            return (
                                <button key={d}
                                    onClick={() => onDifficultyChange(d)}
                                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-center transition-all duration-200 ${active
                                            ? `${meta.bg} ${meta.ring} ring-1 shadow-md`
                                            : "bg-white/5 border-white/10 hover:bg-white/10"
                                        }`}>
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <Star key={i} size={10}
                                                className={i < meta.stars ? meta.color : "text-white/15"}
                                                fill={i < meta.stars ? "currentColor" : "none"} />
                                        ))}
                                    </div>
                                    <span className={`text-xs font-semibold ${active ? meta.color : "text-white/50"}`}>{meta.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Color picker (bot only) */}
            {gameMode === "bot" && (
                <div>
                    <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-2.5">Play as</h2>
                    <div className="grid grid-cols-2 gap-2">
                        {(["w", "b"] as Color[]).map(c => (
                            <button key={c}
                                onClick={() => onColorChange(c)}
                                className={`py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${playerColor === c
                                        ? "bg-white/15 border-white/40 text-white"
                                        : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                                    }`}>
                                {c === "w" ? "♔ White" : "♚ Black"}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Start button */}
            <button onClick={onStart}
                className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:brightness-110 active:scale-95 transition-all duration-200 mt-1">
                ✦ Start Game
            </button>
        </div>
    );
}
