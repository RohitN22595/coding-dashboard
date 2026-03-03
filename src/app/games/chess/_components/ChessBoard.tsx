import React, { useState } from "react";
import type { CS, CMove, Sq, Color } from "@/lib/chessEngine";
import { isInCheck, gc } from "@/lib/chessEngine";
import Square from "./Square";

interface ChessBoardProps {
    cs: CS;
    selected: Sq | null;
    legalMoves: CMove[];
    lastMove: CMove | null;
    flipped: boolean;
    botThinking: boolean;
    onCellClick: (r: number, c: number) => void;
}

export default function ChessBoard({
    cs, selected, legalMoves, lastMove, flipped, botThinking, onCellClick,
}: ChessBoardProps) {
    const [hovered, setHovered] = useState<string | null>(null);

    const inCheckColor: Color | null =
        isInCheck(cs, "w") ? "w" : isInCheck(cs, "b") ? "b" : null;

    const legalSet = new Set(legalMoves.map(m => `${m.to[0]}-${m.to[1]}`));
    const lastSet = new Set(
        lastMove ? [`${lastMove.from[0]}-${lastMove.from[1]}`, `${lastMove.to[0]}-${lastMove.to[1]}`] : [],
    );

    const rows = flipped ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
    const cols = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
    const files = flipped ? ["h", "g", "f", "e", "d", "c", "b", "a"] : ["a", "b", "c", "d", "e", "f", "g", "h"];
    const ranks = flipped ? ["1", "2", "3", "4", "5", "6", "7", "8"] : ["8", "7", "6", "5", "4", "3", "2", "1"];

    function getCheckSquare(): string | null {
        if (!inCheckColor) return null;
        for (let r = 0; r < 8; r++)
            for (let c = 0; c < 8; c++)
                if (cs.board[r][c] === `${inCheckColor}K`) return `${r}-${c}`;
        return null;
    }
    const checkSq = getCheckSquare();

    return (
        <div className="relative">
            {/* Board shadow wrapper */}
            <div
                className="rounded-lg overflow-hidden border border-white/10"
                style={{
                    boxShadow: "0 0 60px rgba(0,0,0,0.8), 0 0 120px rgba(0,0,0,0.5), 0 20px 40px rgba(0,0,0,0.6)",
                    width: "min(92vw, 480px)",
                    height: "min(92vw, 480px)",
                }}>
                {/* Rank + file border */}
                <div className="grid grid-cols-8 w-full h-full">
                    {rows.map((r, ri) =>
                        cols.map((c, ci) => {
                            const key = `${r}-${c}`;
                            const isLight = (r + c) % 2 === 0;
                            const piece = cs.board[r][c];
                            return (
                                <Square
                                    key={key}
                                    row={r} col={c}
                                    piece={piece}
                                    isLight={isLight}
                                    isSelected={!!(selected && selected[0] === r && selected[1] === c)}
                                    isLegalTarget={legalSet.has(key)}
                                    isLastMove={lastSet.has(key)}
                                    isCheckSquare={checkSq === key}
                                    isHovered={hovered === key}
                                    rankLabel={ci === 0 ? ranks[ri] : undefined}
                                    fileLabel={ri === 7 ? files[ci] : undefined}
                                    onClick={() => !botThinking && onCellClick(r, c)}
                                    onMouseEnter={() => setHovered(key)}
                                    onMouseLeave={() => setHovered(null)}
                                />
                            );
                        })
                    )}
                </div>
            </div>

            {/* Bot thinking overlay */}
            {botThinking && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/20 backdrop-blur-[2px]">
                    <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-xl px-5 py-3 flex items-center gap-3 shadow-xl">
                        <span className="flex gap-1">
                            {[0, 1, 2].map(i => (
                                <span key={i} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                                    style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                        </span>
                        <span className="text-white/80 text-sm font-medium">AI thinking…</span>
                    </div>
                </div>
            )}
        </div>
    );
}
