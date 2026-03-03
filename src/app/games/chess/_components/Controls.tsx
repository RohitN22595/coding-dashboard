import React from "react";
import { RotateCcw, FlipHorizontal2, Undo2, Settings, BarChart2, Trash2 } from "lucide-react";

interface ControlsProps {
    onRestart: () => void;
    onChangeMode: () => void;
    onFlipBoard: () => void;
    onResetStats: () => void;
    onUndo: () => void;
    canUndo: boolean;
    undoCost: number;
    coins: number;
    gameStarted: boolean;
}

type BtnVariant = "primary" | "ghost" | "danger";

function Btn({ icon, label, onClick, disabled, variant = "ghost" }: {
    icon: React.ReactNode; label: string; onClick: () => void;
    disabled?: boolean; variant?: BtnVariant;
}) {
    const base = "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed";
    const styles: Record<BtnVariant, string> = {
        primary: "bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30 hover:border-indigo-400/60",
        ghost: "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80",
        danger: "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20",
    };
    return (
        <button onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]}`}>
            {icon}{label}
        </button>
    );
}

export default function Controls({
    onRestart, onChangeMode, onFlipBoard, onResetStats, onUndo, canUndo, undoCost, coins, gameStarted,
}: ControlsProps) {
    return (
        <div className="flex flex-wrap items-center justify-center gap-2">
            <Btn icon={<RotateCcw size={13} />} label="Restart" onClick={onRestart} variant="primary" />
            <Btn icon={<Settings size={13} />} label="Change Mode" onClick={onChangeMode} />
            <Btn icon={<FlipHorizontal2 size={13} />} label="Flip Board" onClick={onFlipBoard} />
            {gameStarted && canUndo && (
                <Btn
                    icon={<Undo2 size={13} />}
                    label={`Undo (–${undoCost}¢)`}
                    onClick={onUndo}
                    disabled={coins < undoCost}
                />
            )}
            <Btn icon={<Trash2 size={13} />} label="Reset Stats" onClick={onResetStats} variant="danger" />
        </div>
    );
}
