import React from "react";
import { RotateCcw, Settings, Trash2 } from "lucide-react";

interface ControlsProps {
    onRestart: () => void;
    onChangeMode: () => void;
    onResetStats: () => void;
}

export default function Controls({ onRestart, onChangeMode, onResetStats }: ControlsProps) {
    const btns = [
        { icon: <RotateCcw size={13} />, label: "Restart", onClick: onRestart, cls: "bg-indigo-500/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30" },
        { icon: <Settings size={13} />, label: "Change Mode", onClick: onChangeMode, cls: "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70" },
        { icon: <Trash2 size={13} />, label: "Reset Stats", onClick: onResetStats, cls: "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20" },
    ];
    return (
        <div className="flex flex-wrap gap-2 justify-center">
            {btns.map(({ icon, label, onClick, cls }) => (
                <button key={label} onClick={onClick}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all duration-200 active:scale-95 hover:scale-[1.03] ${cls}`}>
                    {icon}{label}
                </button>
            ))}
        </div>
    );
}
