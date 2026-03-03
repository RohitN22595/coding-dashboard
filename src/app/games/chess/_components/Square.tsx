import React from "react";
import type { Piece } from "@/lib/chessEngine";

const PIECE_SYM: Record<string, string> = {
    wK: "♔", wQ: "♕", wR: "♖", wB: "♗", wN: "♘", wP: "♙",
    bK: "♚", bQ: "♛", bR: "♜", bB: "♝", bN: "♞", bP: "♟",
};

interface SquareProps {
    row: number; col: number;
    piece: Piece | null;
    isLight: boolean;
    isSelected: boolean;
    isLegalTarget: boolean;
    isLastMove: boolean;
    isCheckSquare: boolean;
    isHovered: boolean;
    rankLabel?: string;
    fileLabel?: string;
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

export default function Square({
    piece, isLight, isSelected, isLegalTarget, isLastMove,
    isCheckSquare, isHovered, rankLabel, fileLabel, onClick, onMouseEnter, onMouseLeave,
}: SquareProps) {
    const isWhitePiece = piece ? piece[0] === "w" : false;

    let bg = isLight
        ? "bg-[#e8d5b0]"
        : "bg-[#9c6f3e]";

    if (isSelected) bg = "bg-yellow-400/80";
    if (isLastMove) bg = isLight ? "bg-yellow-200/70" : "bg-yellow-600/50";
    if (isCheckSquare) bg = "bg-red-500/70";

    return (
        <div
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`relative flex items-center justify-center cursor-pointer transition-all duration-100 ${bg} ${isHovered && !isSelected ? "brightness-110" : ""
                }`}
            style={{ aspectRatio: "1" }}
        >
            {/* Rank label (left edge) */}
            {rankLabel && (
                <span className="absolute top-0.5 left-1 text-[9px] font-bold leading-none select-none"
                    style={{ color: isLight ? "#9c6f3e" : "#e8d5b0", opacity: 0.8 }}>
                    {rankLabel}
                </span>
            )}
            {/* File label (bottom edge) */}
            {fileLabel && (
                <span className="absolute bottom-0.5 right-1 text-[9px] font-bold leading-none select-none"
                    style={{ color: isLight ? "#9c6f3e" : "#e8d5b0", opacity: 0.8 }}>
                    {fileLabel}
                </span>
            )}

            {/* Legal move indicator */}
            {isLegalTarget && !piece && (
                <div className="w-[30%] h-[30%] rounded-full bg-indigo-500/60 shadow-lg shadow-indigo-500/40 pointer-events-none" />
            )}
            {isLegalTarget && piece && (
                <div className="absolute inset-0 rounded-sm ring-4 ring-inset ring-indigo-400/70 pointer-events-none" />
            )}

            {/* Piece */}
            {piece && (
                <span
                    className="leading-none select-none pointer-events-none transition-transform duration-100"
                    style={{
                        fontSize: "min(5.5vw, 42px)",
                        color: isWhitePiece ? "#fffbe6" : "#1a1006",
                        textShadow: isWhitePiece
                            ? "0 1px 3px #000, 0 0 8px rgba(0,0,0,0.7)"
                            : "0 1px 2px rgba(255,255,255,0.4)",
                        filter: isCheckSquare ? "drop-shadow(0 0 8px #ef4444)" : undefined,
                    }}>
                    {PIECE_SYM[piece] ?? ""}
                </span>
            )}
        </div>
    );
}
