import React from "react";
import type { Board } from "@/lib/tictactoeAI";
import Square from "./Square";

interface BoardProps {
    squares: Board;
    winLine: number[] | null;
    disabled: boolean;
    onSquareClick: (i: number) => void;
}

export default function TicTacToeBoard({ squares, winLine, disabled, onSquareClick }: BoardProps) {
    const winSet = new Set(winLine ?? []);
    const hasWinner = (winLine?.length ?? 0) > 0;

    return (
        <div
            className={`p-3 rounded-2xl border transition-all duration-500 ${hasWinner
                    ? "border-yellow-400/30 shadow-[0_0_40px_rgba(250,204,21,0.12)]"
                    : "border-white/8 shadow-[0_0_40px_rgba(99,102,241,0.07)]"
                } bg-white/5 backdrop-blur-sm`}
            style={{ width: "min(90vw, 340px)" }}>
            <div className="grid grid-cols-3 gap-2.5">
                {squares.map((cell, i) => (
                    <Square
                        key={i}
                        value={cell}
                        isWinning={winSet.has(i)}
                        isDisabled={disabled}
                        onClick={() => !disabled && !cell && onSquareClick(i)}
                    />
                ))}
            </div>
        </div>
    );
}
