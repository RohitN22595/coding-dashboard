"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    Clock, AlertTriangle, Lightbulb, Coins, Trophy, RefreshCw,
    Star, Calendar, Eye, RotateCcw, Grid3X3, ChevronDown, X,
    CheckCircle2, Zap, Award,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type Difficulty = "easy" | "medium" | "hard";
type Grid = number[][];

interface LeaderboardEntry {
    time: number;
    coins: number;
    date: string;
    mistakes: number;
}

interface Leaderboard {
    easy?: LeaderboardEntry;
    medium?: LeaderboardEntry;
    hard?: LeaderboardEntry;
    daily?: LeaderboardEntry & { day: string };
}

interface SavedState {
    grid: Grid;
    solution: Grid;
    fixed: boolean[][];
    difficulty: Difficulty;
    timerSecs: number;
    mistakes: number;
    hintsUsed: number;
    isDailyChallenge: boolean;
    wrongCells: [number, number][];
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const DIFFICULTY_CONFIG = {
    easy: { label: "Easy", clues: [36, 40], coins: 10, targetTime: 600 },
    medium: { label: "Medium", clues: [30, 35], coins: 20, targetTime: 900 },
    hard: { label: "Hard", clues: [25, 29], coins: 40, targetTime: 1500 },
};

const MAX_MISTAKES = 5;
const FREE_HINTS = 3;
const MAX_HINTS = 5;
const HINT_COST = 10;
const SOLUTION_COST = 30;
const DAILY_BONUS = 20;

const LS_COINS = "sudoku_coins";
const LS_LEADERBOARD = "sudoku_leaderboard";
const LS_SAVE = "sudoku_save";

// ─────────────────────────────────────────────────────────────────────────────
// PURE LOGIC HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function cloneGrid(g: Grid): Grid {
    return g.map((r) => [...r]);
}

function isValidPlacement(g: Grid, row: number, col: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
        if (g[row][i] === num) return false;
        if (g[i][col] === num) return false;
    }
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++)
        for (let c = bc; c < bc + 3; c++)
            if (g[r][c] === num) return false;
    return true;
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function generateSolvedGrid(): Grid {
    const g: Grid = Array.from({ length: 9 }, () => Array(9).fill(0));

    function fill(pos: number): boolean {
        if (pos === 81) return true;
        const row = Math.floor(pos / 9);
        const col = pos % 9;
        if (g[row][col] !== 0) return fill(pos + 1);
        for (const num of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
            if (isValidPlacement(g, row, col, num)) {
                g[row][col] = num;
                if (fill(pos + 1)) return true;
                g[row][col] = 0;
            }
        }
        return false;
    }

    fill(0);
    return g;
}

/** Returns number of solutions up to `limit` */
function countSolutions(grid: Grid, limit = 2): number {
    const g = cloneGrid(grid);
    let count = 0;

    function solve(pos: number): void {
        if (count >= limit) return;
        if (pos === 81) { count++; return; }
        const row = Math.floor(pos / 9);
        const col = pos % 9;
        if (g[row][col] !== 0) { solve(pos + 1); return; }
        for (let num = 1; num <= 9; num++) {
            if (isValidPlacement(g, row, col, num)) {
                g[row][col] = num;
                solve(pos + 1);
                g[row][col] = 0;
            }
        }
    }

    solve(0);
    return count;
}

function createPuzzle(difficulty: Difficulty): { puzzle: Grid; solution: Grid } {
    const solution = generateSolvedGrid();
    const puzzle = cloneGrid(solution);
    const [minClues, maxClues] = DIFFICULTY_CONFIG[difficulty].clues;
    const targetClues = minClues + Math.floor(Math.random() * (maxClues - minClues + 1));

    const positions = shuffle(
        Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9] as [number, number]),
    );

    let cluesLeft = 81;

    for (const [r, c] of positions) {
        if (cluesLeft <= targetClues) break;
        const backup = puzzle[r][c];
        puzzle[r][c] = 0;
        if (countSolutions(puzzle) !== 1) {
            puzzle[r][c] = backup; // restore — removing this cell breaks uniqueness
        } else {
            cluesLeft--;
        }
    }

    return { puzzle, solution };
}

// ─── Seeded LCG PRNG for daily challenge ──────────────────────────────────
function seededRandom(seed: number) {
    let s = seed;
    return () => {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return ((s >>> 0) / 0xffffffff);
    };
}

function getTodayKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getDailyPuzzle(): { puzzle: Grid; solution: Grid } {
    const dateStr = getTodayKey();
    let seed = 0;
    for (let i = 0; i < dateStr.length; i++) seed = (seed * 31 + dateStr.charCodeAt(i)) | 0;

    const rand = seededRandom(Math.abs(seed));

    // Build solved grid deterministically
    const g: Grid = Array.from({ length: 9 }, () => Array(9).fill(0));

    function fillDeterministic(pos: number): boolean {
        if (pos === 81) return true;
        const row = Math.floor(pos / 9);
        const col = pos % 9;
        if (g[row][col] !== 0) return fillDeterministic(pos + 1);
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => rand() - 0.5);
        for (const num of nums) {
            if (isValidPlacement(g, row, col, num)) {
                g[row][col] = num;
                if (fillDeterministic(pos + 1)) return true;
                g[row][col] = 0;
            }
        }
        return false;
    }

    fillDeterministic(0);
    const solution = cloneGrid(g);

    // Remove cells — target medium (30–35 clues) for daily
    const puzzle = cloneGrid(solution);
    const positions: [number, number][] = [];
    for (let r = 0; r < 9; r++)
        for (let c = 0; c < 9; c++)
            positions.push([r, c]);
    positions.sort(() => rand() - 0.5);

    let cluesLeft = 81;
    const targetClues = 30 + Math.floor(rand() * 6);

    for (const [r, c] of positions) {
        if (cluesLeft <= targetClues) break;
        const backup = puzzle[r][c];
        puzzle[r][c] = 0;
        if (countSolutions(puzzle) !== 1) {
            puzzle[r][c] = backup;
        } else {
            cluesLeft--;
        }
    }

    return { puzzle, solution };
}

function formatTime(secs: number): string {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

function emptyGrid(): Grid {
    return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function emptyFixed(): boolean[][] {
    return Array.from({ length: 9 }, () => Array(9).fill(false));
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function SudokuPage() {
    // ── Core state ────────────────────────────────────────────────────────────
    const [grid, setGrid] = useState<Grid>(emptyGrid);
    const [solution, setSolution] = useState<Grid>(emptyGrid);
    const [fixed, setFixed] = useState<boolean[][]>(emptyFixed);
    const [difficulty, setDifficulty] = useState<Difficulty>("medium");
    const [isDailyChallenge, setIsDailyChallenge] = useState(false);

    // ── Timer ─────────────────────────────────────────────────────────────────
    const [timerSecs, setTimerSecs] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);
    const [timerStarted, setTimerStarted] = useState(false);

    // ── Game state ────────────────────────────────────────────────────────────
    const [mistakes, setMistakes] = useState(0);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [coins, setCoins] = useState(0);
    const [selected, setSelected] = useState<[number, number] | null>(null);
    const [wrongCells, setWrongCells] = useState<Set<string>>(new Set());
    const [gameOver, setGameOver] = useState(false);
    const [solved, setSolved] = useState(false);

    // ── Modals ────────────────────────────────────────────────────────────────
    const [showWinModal, setShowWinModal] = useState(false);
    const [showDiffModal, setShowDiffModal] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [earnedCoins, setEarnedCoins] = useState(0);
    const [coinBreakdown, setCoinBreakdown] = useState<string[]>([]);

    // ── Leaderboard ───────────────────────────────────────────────────────────
    const [leaderboard, setLeaderboard] = useState<Leaderboard>({});

    // ── Refs ──────────────────────────────────────────────────────────────────
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const initialized = useRef(false);

    // ─────────────────────────────────────────────────────────────────────────
    // INIT: load localStorage on mount
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        // Coins
        const storedCoins = parseInt(localStorage.getItem(LS_COINS) || "0", 10);
        setCoins(isNaN(storedCoins) ? 0 : storedCoins);

        // Leaderboard
        try {
            const lb = JSON.parse(localStorage.getItem(LS_LEADERBOARD) || "{}");
            setLeaderboard(lb);
        } catch { /* ignore */ }

        // Saved progress
        try {
            const raw = localStorage.getItem(LS_SAVE);
            if (raw) {
                const s: SavedState = JSON.parse(raw);
                setGrid(s.grid);
                setSolution(s.solution);
                setFixed(s.fixed);
                setDifficulty(s.difficulty);
                setTimerSecs(s.timerSecs);
                setMistakes(s.mistakes);
                setHintsUsed(s.hintsUsed);
                setIsDailyChallenge(s.isDailyChallenge);
                setWrongCells(new Set((s.wrongCells || []).map(([r, c]) => `${r}-${c}`)));
                setTimerStarted(true); // was in progress
                return;
            }
        } catch { /* ignore */ }

        // No save — start fresh
        startNewGame("medium", false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // TIMER
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (timerRunning && !gameOver && !solved) {
            timerRef.current = setInterval(() => setTimerSecs((t) => t + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [timerRunning, gameOver, solved]);

    // ─────────────────────────────────────────────────────────────────────────
    // AUTO-SAVE
    // ─────────────────────────────────────────────────────────────────────────
    const saveProgress = useCallback((
        g: Grid, sol: Grid, fx: boolean[][], diff: Difficulty,
        secs: number, mis: number, hints: number, daily: boolean,
        wrong: Set<string>,
    ) => {
        const state: SavedState = {
            grid: g, solution: sol, fixed: fx, difficulty: diff,
            timerSecs: secs, mistakes: mis, hintsUsed: hints,
            isDailyChallenge: daily,
            wrongCells: Array.from(wrong).map((k) => k.split("-").map(Number) as [number, number]),
        };
        localStorage.setItem(LS_SAVE, JSON.stringify(state));
    }, []);

    // Debounced save on meaningful state changes
    const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (!timerStarted) return;
        if (saveRef.current) clearTimeout(saveRef.current);
        saveRef.current = setTimeout(() => {
            saveProgress(grid, solution, fixed, difficulty, timerSecs, mistakes, hintsUsed, isDailyChallenge, wrongCells);
        }, 500);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [grid, timerSecs, mistakes, hintsUsed, wrongCells]);

    // ─────────────────────────────────────────────────────────────────────────
    // PERSIST COINS
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (initialized.current) localStorage.setItem(LS_COINS, String(coins));
    }, [coins]);

    // ─────────────────────────────────────────────────────────────────────────
    // GAME ACTIONS
    // ─────────────────────────────────────────────────────────────────────────
    function startNewGame(diff: Difficulty, daily: boolean) {
        setTimerRunning(false);
        setTimerStarted(false);
        setTimerSecs(0);
        setMistakes(0);
        setHintsUsed(0);
        setSelected(null);
        setWrongCells(new Set());
        setGameOver(false);
        setSolved(false);
        setShowWinModal(false);
        setShowDiffModal(false);
        setIsDailyChallenge(daily);
        setDifficulty(diff);
        localStorage.removeItem(LS_SAVE);

        const { puzzle, solution: sol } = daily ? getDailyPuzzle() : createPuzzle(diff);

        const fx = puzzle.map((row) => row.map((v) => v !== 0));
        setGrid(cloneGrid(puzzle));
        setSolution(sol);
        setFixed(fx);
    }

    function handleCellClick(r: number, c: number) {
        if (gameOver || solved) return;
        setSelected([r, c]);
    }

    function startTimerIfNeeded() {
        if (!timerStarted) {
            setTimerStarted(true);
            setTimerRunning(true);
        }
    }

    function checkWin(newGrid: Grid): boolean {
        for (let r = 0; r < 9; r++)
            for (let c = 0; c < 9; c++)
                if (newGrid[r][c] !== solution[r][c]) return false;
        return true;
    }

    function handleDigitInput(digit: number) {
        if (!selected || gameOver || solved) return;
        const [r, c] = selected;
        if (fixed[r][c]) return;
        startTimerIfNeeded();

        const newGrid = cloneGrid(grid);

        if (digit === 0) {
            // Erase
            newGrid[r][c] = 0;
            setGrid(newGrid);
            const newWrong = new Set(wrongCells);
            newWrong.delete(`${r}-${c}`);
            setWrongCells(newWrong);
            return;
        }

        newGrid[r][c] = digit;

        if (digit !== solution[r][c]) {
            // Wrong move
            const newWrong = new Set(wrongCells);
            newWrong.add(`${r}-${c}`);
            setWrongCells(newWrong);

            const newMistakes = mistakes + 1;
            setMistakes(newMistakes);
            setGrid(newGrid);

            if (newMistakes >= MAX_MISTAKES) {
                setTimerRunning(false);
                setGameOver(true);
            }

            // Auto-clear wrong highlight after 700 ms
            setTimeout(() => {
                setWrongCells((prev) => {
                    const s = new Set(prev);
                    s.delete(`${r}-${c}`);
                    return s;
                });
                // Revert cell
                setGrid((prev) => {
                    const g = cloneGrid(prev);
                    g[r][c] = 0;
                    return g;
                });
            }, 700);
            return;
        }

        // Correct move
        const newWrong = new Set(wrongCells);
        newWrong.delete(`${r}-${c}`);
        setWrongCells(newWrong);
        setGrid(newGrid);

        if (checkWin(newGrid)) {
            handleWin(newGrid, false);
        }
    }

    function handleWin(finalGrid: Grid, revealedByShow: boolean) {
        setTimerRunning(false);
        setSolved(true);
        localStorage.removeItem(LS_SAVE);

        if (revealedByShow) return; // no coins for reveal

        const cfg = DIFFICULTY_CONFIG[difficulty];
        const breakdown: string[] = [];
        let earned = cfg.coins;
        breakdown.push(`Solved (${cfg.label}): +${cfg.coins} coins`);

        if (mistakes === 0) {
            earned += 5;
            breakdown.push("Zero mistakes bonus: +5 coins");
        }
        if (timerSecs < cfg.targetTime) {
            earned += 5;
            breakdown.push("Speed bonus: +5 coins");
        }
        if (isDailyChallenge) {
            earned += DAILY_BONUS;
            breakdown.push(`Daily challenge bonus: +${DAILY_BONUS} coins`);
        }

        const newCoins = coins + earned;
        setCoins(newCoins);
        setEarnedCoins(earned);
        setCoinBreakdown(breakdown);

        // Leaderboard
        const entry: LeaderboardEntry = {
            time: timerSecs,
            coins: earned,
            date: getTodayKey(),
            mistakes,
        };
        setLeaderboard((prev) => {
            const next = { ...prev };
            if (!next[difficulty] || timerSecs < next[difficulty]!.time) {
                next[difficulty] = entry;
            }
            if (isDailyChallenge) {
                const today = getTodayKey();
                if (!next.daily || next.daily.day !== today || timerSecs < next.daily.time) {
                    next.daily = { ...entry, day: today };
                }
            }
            localStorage.setItem(LS_LEADERBOARD, JSON.stringify(next));
            return next;
        });

        setShowWinModal(true);
    }

    function handleHint() {
        if (gameOver || solved) return;
        if (hintsUsed >= MAX_HINTS) return;
        startTimerIfNeeded();

        // Check cost
        if (hintsUsed >= FREE_HINTS) {
            if (coins < HINT_COST) return;
            setCoins((c) => c - HINT_COST);
        }

        // Find empty cells
        const empty: [number, number][] = [];
        for (let r = 0; r < 9; r++)
            for (let c = 0; c < 9; c++)
                if (grid[r][c] === 0) empty.push([r, c]);

        if (empty.length === 0) return;

        const [r, c] = empty[Math.floor(Math.random() * empty.length)];
        const newGrid = cloneGrid(grid);
        newGrid[r][c] = solution[r][c];
        const newFixed = fixed.map((row) => [...row]);
        newFixed[r][c] = true;
        setGrid(newGrid);
        setFixed(newFixed);
        setHintsUsed((h) => h + 1);

        if (checkWin(newGrid)) handleWin(newGrid, false);
    }

    function handleShowSolution() {
        if (gameOver || solved) return;
        if (coins < SOLUTION_COST) return;
        setCoins((c) => c - SOLUTION_COST);
        setGrid(cloneGrid(solution));
        setTimerRunning(false);
        setSolved(true);
        localStorage.removeItem(LS_SAVE);
    }

    function handleReset() {
        // Keep givens, reset user inputs
        const newGrid = grid.map((row, r) =>
            row.map((v, c) => (fixed[r][c] ? v : 0)),
        );
        setGrid(newGrid);
        setWrongCells(new Set());
        setTimerSecs(0);
        setTimerRunning(false);
        setTimerStarted(false);
        setMistakes(0);
        setHintsUsed(0);
        setGameOver(false);
        setSolved(false);
        localStorage.removeItem(LS_SAVE);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // KEYBOARD
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key >= "1" && e.key <= "9") {
                handleDigitInput(parseInt(e.key, 10));
            } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
                handleDigitInput(0);
            } else if (e.key === "ArrowUp" && selected) {
                setSelected((prev) => { if (!prev) return prev; return [Math.max(0, prev[0] - 1), prev[1]] as [number, number]; });
            } else if (e.key === "ArrowDown" && selected) {
                setSelected((prev) => { if (!prev) return prev; return [Math.min(8, prev[0] + 1), prev[1]] as [number, number]; });
            } else if (e.key === "ArrowLeft" && selected) {
                setSelected((prev) => { if (!prev) return prev; return [prev[0], Math.max(0, prev[1] - 1)] as [number, number]; });
            } else if (e.key === "ArrowRight" && selected) {
                setSelected((prev) => { if (!prev) return prev; return [prev[0], Math.min(8, prev[1] + 1)] as [number, number]; });
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected, grid, fixed, gameOver, solved, timerStarted, mistakes, coins, hintsUsed, isDailyChallenge, solution]);

    // ─────────────────────────────────────────────────────────────────────────
    // CELL STYLING HELPERS
    // ─────────────────────────────────────────────────────────────────────────
    function getCellClasses(r: number, c: number): string {
        const isSelected = selected?.[0] === r && selected?.[1] === c;
        const isHighlight = selected && (selected[0] === r || selected[1] === c ||
            (Math.floor(selected[0] / 3) === Math.floor(r / 3) && Math.floor(selected[1] / 3) === Math.floor(c / 3)));
        const isWrong = wrongCells.has(`${r}-${c}`);
        const isFixed = fixed[r][c];
        const isSame = selected && !isSelected && grid[r][c] !== 0 && grid[r][c] === grid[selected[0]][selected[1]];

        let base = "flex items-center justify-center text-base sm:text-lg font-semibold select-none transition-colors duration-150 cursor-pointer ";

        // Border sizing for 3x3 boxes
        const borderR = c === 2 || c === 5 ? "border-r-2 border-r-indigo-400 dark:border-r-indigo-500" : "border-r border-r-gray-200 dark:border-r-gray-700";
        const borderB = r === 2 || r === 5 ? "border-b-2 border-b-indigo-400 dark:border-b-indigo-500" : "border-b border-b-gray-200 dark:border-b-gray-700";

        base += `${borderR} ${borderB} `;

        if (isWrong) {
            base += "bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300 ";
        } else if (isSelected) {
            base += "bg-indigo-500 dark:bg-indigo-600 text-white ";
        } else if (isSame) {
            base += "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 ";
        } else if (isHighlight) {
            base += "bg-indigo-50 dark:bg-indigo-950/50 ";
            base += isFixed ? "text-gray-800 dark:text-gray-200 " : "text-indigo-600 dark:text-indigo-400 ";
        } else {
            base += isFixed
                ? "text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900 "
                : "text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 ";
        }

        if (isFixed) base += "font-bold ";
        if (!isFixed && !gameOver && !solved) base += "hover:bg-indigo-50 dark:hover:bg-indigo-950/40 ";

        return base;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DERIVED
    // ─────────────────────────────────────────────────────────────────────────
    const hintsRemaining = Math.max(0, FREE_HINTS - hintsUsed);
    const canHint = !gameOver && !solved && hintsUsed < MAX_HINTS && (hintsUsed < FREE_HINTS || coins >= HINT_COST);
    const canReveal = !gameOver && !solved && coins >= SOLUTION_COST;

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-gray-950 dark:via-indigo-950/20 dark:to-purple-950/10 px-4 py-6">
            <div className="max-w-5xl mx-auto">

                {/* ── Page Header ── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <Grid3X3 className="text-indigo-500" size={26} />
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sudoku</h1>
                            {isDailyChallenge && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                                    <Calendar size={11} /> Daily
                                </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${difficulty === "easy" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" :
                                difficulty === "medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" :
                                    "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                }`}>
                                {DIFFICULTY_CONFIG[difficulty].label}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Fill the 9×9 grid so every row, column, and 3×3 box contains 1–9</p>
                    </div>

                    {/* Coin balance */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
                        <Coins size={16} className="text-amber-500" />
                        <span className="font-bold text-amber-700 dark:text-amber-300">{coins}</span>
                        <span className="text-xs text-amber-600 dark:text-amber-400">coins</span>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">

                    {/* ── Left: Grid + Numpad ── */}
                    <div className="flex flex-col items-center gap-4">

                        {/* Status bar */}
                        <div className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            {/* Timer */}
                            <div className="flex items-center gap-1.5">
                                <Clock size={15} className={timerRunning ? "text-indigo-500" : "text-gray-400"} />
                                <span className={`font-mono font-semibold text-sm ${timerRunning ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500"}`}>
                                    {formatTime(timerSecs)}
                                </span>
                            </div>
                            {/* Mistakes */}
                            <div className="flex items-center gap-1.5">
                                <AlertTriangle size={15} className={mistakes > 0 ? "text-red-500" : "text-gray-400"} />
                                <span className={`text-sm font-semibold ${mistakes > 0 ? "text-red-600 dark:text-red-400" : "text-gray-500"}`}>
                                    {mistakes}/{MAX_MISTAKES}
                                </span>
                                <span className="text-xs text-gray-400">mistakes</span>
                            </div>
                            {/* Hints */}
                            <div className="flex items-center gap-1.5">
                                <Lightbulb size={15} className={hintsRemaining > 0 ? "text-yellow-500" : "text-gray-400"} />
                                <span className={`text-sm font-semibold ${hintsRemaining > 0 ? "text-yellow-600 dark:text-yellow-400" : "text-gray-500"}`}>
                                    {hintsRemaining} free
                                </span>
                                {hintsUsed > FREE_HINTS - 1 && hintsUsed < MAX_HINTS && (
                                    <span className="text-xs text-gray-400">({MAX_HINTS - hintsUsed} left)</span>
                                )}
                            </div>
                        </div>

                        {/* ── Sudoku Grid ── */}
                        <div className="relative">
                            <div className="grid grid-cols-9 border-2 border-indigo-500 dark:border-indigo-400 rounded-xl overflow-hidden shadow-lg"
                                style={{ width: "min(100vw - 2rem, 432px)", height: "min(100vw - 2rem, 432px)" }}>
                                {grid.map((row, r) =>
                                    row.map((val, c) => (
                                        <div key={`${r}-${c}`}
                                            className={getCellClasses(r, c)}
                                            style={{ aspectRatio: "1" }}
                                            onClick={() => handleCellClick(r, c)}
                                        >
                                            {val !== 0 ? val : ""}
                                        </div>
                                    )),
                                )}
                            </div>

                            {/* Game Over overlay */}
                            {gameOver && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl">
                                    <AlertTriangle size={40} className="text-red-400 mb-2" />
                                    <p className="text-white font-bold text-xl">Game Over</p>
                                    <p className="text-gray-300 text-sm mb-4">Too many mistakes!</p>
                                    <button onClick={() => startNewGame(difficulty, false)}
                                        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition">
                                        New Game
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ── Number pad ── */}
                        <div className="grid grid-cols-5 gap-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                                <button key={n} onClick={() => handleDigitInput(n)}
                                    disabled={gameOver || solved}
                                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-base font-bold text-gray-800 dark:text-gray-100 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-600 disabled:opacity-40 transition shadow-sm">
                                    {n}
                                </button>
                            ))}
                            <button onClick={() => handleDigitInput(0)}
                                disabled={gameOver || solved}
                                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 disabled:opacity-40 transition shadow-sm">
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* ── Right: Controls + Leaderboard ── */}
                    <div className="flex flex-col gap-4 min-w-[220px] flex-1">

                        {/* Action buttons */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 flex flex-col gap-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Actions</p>

                            <button onClick={() => setShowDiffModal(true)}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition w-full">
                                <Zap size={15} /> New Game <ChevronDown size={13} className="ml-auto" />
                            </button>

                            <button onClick={() => startNewGame(getTodayKey() === getTodayKey() ? difficulty : difficulty, true)}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition w-full">
                                <Calendar size={15} /> Daily Challenge
                                {leaderboard.daily?.day === getTodayKey() && <CheckCircle2 size={13} className="ml-auto text-amber-200" />}
                            </button>

                            <button onClick={handleHint} disabled={!canHint}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 disabled:opacity-40 text-white text-sm font-semibold transition w-full">
                                <Lightbulb size={15} />
                                {hintsUsed < FREE_HINTS ? `Hint (${FREE_HINTS - hintsUsed} free)` : `Hint (${HINT_COST} coins)`}
                            </button>

                            <button onClick={handleShowSolution} disabled={!canReveal}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 disabled:opacity-40 text-white text-sm font-semibold transition w-full">
                                <Eye size={15} /> Show Solution <span className="ml-auto text-xs opacity-75">{SOLUTION_COST}¢</span>
                            </button>

                            <button onClick={handleReset}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-semibold transition w-full">
                                <RotateCcw size={15} /> Reset Puzzle
                            </button>

                            <button onClick={() => setShowLeaderboard((v) => !v)}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-semibold transition w-full">
                                <Trophy size={15} /> {showLeaderboard ? "Hide" : "Show"} Leaderboard
                            </button>
                        </div>

                        {/* Coin info */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Coin Guide</p>
                            <table className="text-xs w-full text-gray-600 dark:text-gray-400">
                                <tbody>
                                    {[
                                        ["Solve Easy", "+10"],
                                        ["Solve Medium", "+20"],
                                        ["Solve Hard", "+40"],
                                        ["Zero-mistake bonus", "+5"],
                                        ["Speed bonus", "+5"],
                                        ["Daily challenge", "+20"],
                                        ["Extra hint", "–10"],
                                        ["Show solution", "–30"],
                                    ].map(([label, val]) => (
                                        <tr key={label}>
                                            <td className="py-0.5">{label}</td>
                                            <td className={`py-0.5 text-right font-semibold ${val.startsWith("+") ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>{val}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Leaderboard panel */}
                        {showLeaderboard && (
                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Trophy size={15} className="text-amber-500" />
                                    <p className="text-sm font-bold text-gray-800 dark:text-white">Best Times</p>
                                </div>
                                {(["easy", "medium", "hard"] as Difficulty[]).map((d) => {
                                    const entry = leaderboard[d];
                                    return (
                                        <div key={d} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                            <span className={`text-xs font-semibold capitalize ${d === "easy" ? "text-green-600 dark:text-green-400" :
                                                d === "medium" ? "text-yellow-600 dark:text-yellow-400" :
                                                    "text-red-600 dark:text-red-400"
                                                }`}>{d}</span>
                                            {entry ? (
                                                <div className="text-right">
                                                    <div className="text-xs font-bold text-gray-800 dark:text-white">{formatTime(entry.time)}</div>
                                                    <div className="text-xs text-gray-400">{entry.coins} coins · {entry.date}</div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">Not yet solved</span>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Daily */}
                                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1"><Calendar size={11} /> Daily</span>
                                    {leaderboard.daily ? (
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-gray-800 dark:text-white">{formatTime(leaderboard.daily.time)}</div>
                                            <div className="text-xs text-gray-400">{leaderboard.daily.day}</div>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400">Not yet completed</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Difficulty Modal ── */}
            {showDiffModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Choose Difficulty</h2>
                            <button onClick={() => setShowDiffModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-3">
                            {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                                <button key={d} onClick={() => { startNewGame(d, false); }}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition ${difficulty === d && !isDailyChallenge
                                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                                        : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                                        }`}>
                                    <div>
                                        <p className={`font-semibold capitalize ${d === "easy" ? "text-green-600 dark:text-green-400" :
                                            d === "medium" ? "text-yellow-600 dark:text-yellow-400" :
                                                "text-red-600 dark:text-red-400"
                                            }`}>{d}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{DIFFICULTY_CONFIG[d].clues[0]}–{DIFFICULTY_CONFIG[d].clues[1]} clues</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-amber-600 dark:text-amber-400">+{DIFFICULTY_CONFIG[d].coins} coins</p>
                                        <p className="text-xs text-gray-500">target: {formatTime(DIFFICULTY_CONFIG[d].targetTime)}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Win Modal ── */}
            {showWinModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm p-6 text-center">
                        {/* Confetti-like decoration */}
                        <div className="flex justify-center mb-3">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                                <Star size={32} className="text-white" fill="white" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Puzzle Solved!</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Fantastic work!</p>

                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3">
                                <div className="flex items-center justify-center gap-1 text-indigo-500 mb-1"><Clock size={14} /></div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatTime(timerSecs)}</p>
                                <p className="text-xs text-gray-500">Time</p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
                                <div className="flex items-center justify-center gap-1 text-red-500 mb-1"><AlertTriangle size={14} /></div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{mistakes}</p>
                                <p className="text-xs text-gray-500">Mistakes</p>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                                <div className="flex items-center justify-center gap-1 text-amber-500 mb-1"><Coins size={14} /></div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">+{earnedCoins}</p>
                                <p className="text-xs text-gray-500">Coins</p>
                            </div>
                        </div>

                        {/* Breakdown */}
                        <div className="text-left bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-4">
                            {coinBreakdown.map((line) => (
                                <p key={line} className="text-xs flex items-center gap-1 text-gray-600 dark:text-gray-300 py-0.5">
                                    <Award size={11} className="text-amber-500 shrink-0" /> {line}
                                </p>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => { setShowWinModal(false); setShowDiffModal(true); }}
                                className="flex-1 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition">
                                New Game
                            </button>
                            <button onClick={() => setShowWinModal(false)}
                                className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-semibold transition">
                                Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
