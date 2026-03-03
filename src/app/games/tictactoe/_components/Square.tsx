import React from "react";
import type { Cell } from "@/lib/tictactoeAI";

interface SquareProps {
    value: Cell;
    isWinning: boolean;
    isDisabled: boolean;
    onClick: () => void;
}

export default function Square({ value, isWinning, isDisabled, onClick }: SquareProps) {
    const isEmpty = !value;

    const baseCls =
        "relative flex items-center justify-center rounded-2xl border cursor-pointer " +
        "select-none transition-all duration-200 aspect-square";

    const stateCls = isWinning
        ? "bg-yellow-400/15 border-yellow-400/50 shadow-[0_0_24px_rgba(250,204,21,0.25)]"
        : value
            ? "bg-white/8 border-white/12"
            : isDisabled
                ? "bg-white/3 border-white/6 cursor-not-allowed"
                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-400/30 hover:shadow-[0_0_16px_rgba(99,102,241,0.2)] hover:scale-[1.04]";

    return (
        <button onClick={onClick} disabled={!!value || isDisabled}
            className={`${baseCls} ${stateCls}`}>
            {value === "X" && (
                <svg viewBox="0 0 40 40" className="w-[55%] h-[55%]"
                    style={{ filter: isWinning ? "drop-shadow(0 0 10px #818cf8)" : "drop-shadow(0 0 4px rgba(129,140,248,0.5))" }}>
                    <line x1="4" y1="4" x2="36" y2="36" stroke="#818cf8" strokeWidth="5" strokeLinecap="round"
                        style={{
                            strokeDasharray: 46, strokeDashoffset: 0,
                            animation: "draw-line 0.2s ease-out forwards"
                        }} />
                    <line x1="36" y1="4" x2="4" y2="36" stroke="#818cf8" strokeWidth="5" strokeLinecap="round"
                        style={{
                            strokeDasharray: 46, strokeDashoffset: 0,
                            animation: "draw-line 0.2s ease-out 0.1s forwards"
                        }} />
                </svg>
            )}
            {value === "O" && (
                <svg viewBox="0 0 40 40" className="w-[55%] h-[55%]"
                    style={{ filter: isWinning ? "drop-shadow(0 0 10px #fb7185)" : "drop-shadow(0 0 4px rgba(251,113,133,0.5))" }}>
                    <circle cx="20" cy="20" r="14" fill="none" stroke="#fb7185" strokeWidth="5" strokeLinecap="round"
                        style={{
                            strokeDasharray: 88, strokeDashoffset: 0,
                            animation: "draw-circle 0.3s ease-out forwards"
                        }} />
                </svg>
            )}

            {/* Hover glow for empty cells */}
            {isEmpty && !isDisabled && (
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200
                    bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none"/>
            )}
        </button>
    );
}
