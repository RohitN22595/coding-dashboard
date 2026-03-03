"use client";

import { useState } from "react";
import { Play, Loader2, Terminal, ChevronRight, Circle, X, Minus } from "lucide-react";

// ─── Judge0 config — all logic preserved from original ─────────────────────
const LANGUAGES = [
    { label: "C++", id: 54 as const, ext: "cpp", placeholder: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}' },
    { label: "Python", id: 71 as const, ext: "py", placeholder: 'print("Hello, World!")' },
    { label: "Java", id: 62 as const, ext: "java", placeholder: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
    { label: "JavaScript", id: 63 as const, ext: "js", placeholder: 'console.log("Hello, World!");' },
] as const;

type LangId = (typeof LANGUAGES)[number]["id"];
const ACCEPTED_ID = 3;

type Judge0Result = {
    status?: { id: number; description: string };
    stdout?: string; stderr?: string; compile_output?: string; message?: string; token?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
export default function CompilerPage() {
    const [langId, setLangId] = useState<LangId>(71);
    const [code, setCode] = useState(LANGUAGES[1].placeholder);
    const [stdin, setStdin] = useState("");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [ran, setRan] = useState(false);

    const activeLang = LANGUAGES.find(l => l.id === langId)!;

    const handleLangChange = (id: LangId) => {
        setLangId(id);
        setCode(LANGUAGES.find(l => l.id === id)!.placeholder);
        setOutput(""); setError(""); setRan(false);
    };

    const displayResult = (result: Judge0Result) => {
        setRan(true);
        if (result.status?.id === ACCEPTED_ID) {
            setOutput(result.stdout || "(no output)"); setError("");
        } else if (result.compile_output) {
            setError(`Compilation Error:\n${result.compile_output}`); setOutput("");
        } else if (result.stderr) {
            setError(`Runtime Error:\n${result.stderr}`); setOutput("");
        } else {
            setError(`${result.status?.description || "Unknown error"}\n${result.message || ""}`); setOutput("");
        }
    };

    const pollResult = async (token: string) => {
        for (let i = 0; i < 10; i++) {
            await new Promise(r => setTimeout(r, 1500));
            const res = await fetch(`https://ce.judge0.com/submissions/${token}?base64_encoded=false`);
            const result: Judge0Result = await res.json();
            if ((result.status?.id ?? 0) > 2) { displayResult(result); return; }
        }
        setError("Compilation timed out. Please try again.");
    };

    const runWithPublicAPI = async () => {
        try {
            const res = await fetch("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ language_id: langId, source_code: code, stdin }),
            });
            if (!res.ok) { const sub: Judge0Result = await res.json(); if (sub.token) { await pollResult(sub.token); return; } throw new Error(`HTTP ${res.status}`); }
            const result: Judge0Result = await res.json();
            if ((result.status?.id ?? 0) <= 2 && result.token) await pollResult(result.token);
            else displayResult(result);
        } catch (err) { setError(`Failed to connect to compiler API.\n\nError: ${err}`); setRan(true); }
    };

    const runCode = async () => {
        setLoading(true); setOutput(""); setError(""); setRan(false);
        try {
            const res = await fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-RapidAPI-Key": "f0a0b0c0d0e0f0a0b0c0d0e0f0a0b0c0d0e0f0a0b0c0d0e0f0", "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com" },
                body: JSON.stringify({ language_id: langId, source_code: code, stdin }),
            });
            if (!res.ok) { await runWithPublicAPI(); return; }
            const result: Judge0Result = await res.json(); displayResult(result);
        } catch { await runWithPublicAPI(); }
        finally { setLoading(false); }
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-[calc(100vh-64px)] flex flex-col bg-gray-100 dark:bg-gray-950 p-3 sm:p-4 gap-3">

            {/* ── Top toolbar ─────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                        <Terminal size={15} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-none">Online Compiler</h1>
                        <p className="text-[11px] text-gray-500 dark:text-gray-500 mt-0.5">Powered by Judge0 CE</p>
                    </div>
                </div>

                {/* Language tabs */}
                <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
                    {LANGUAGES.map(lang => (
                        <button key={lang.id} onClick={() => handleLangChange(lang.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${langId === lang.id
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                                }`}>
                            {lang.label}
                        </button>
                    ))}
                </div>

                {/* Run button */}
                <button onClick={runCode} disabled={loading}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold transition-all duration-200 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-[1.02]">
                    {loading
                        ? <><Loader2 size={15} className="animate-spin" /> Running…</>
                        : <><Play size={14} fill="white" /> Run Code</>}
                </button>
            </div>

            {/* ── Main editor grid ─────────────────────────────────────────── */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-3 min-h-0">

                {/* ── Code editor pane ──────────────────────────────────────── */}
                <div className="flex flex-col rounded-2xl overflow-hidden border border-gray-800 shadow-xl min-h-[400px]">
                    {/* Editor titlebar — always dark */}
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1e1e2e] border-b border-gray-700/60 shrink-0">
                        <div className="flex gap-1.5">
                            <Circle size={10} fill="#ef4444" className="text-transparent" />
                            <Circle size={10} fill="#f59e0b" className="text-transparent" />
                            <Circle size={10} fill="#22c55e" className="text-transparent" />
                        </div>
                        <div className="flex items-center gap-1.5 ml-3 px-3 py-0.5 bg-[#2a2a3e] rounded-md border border-gray-700/40">
                            <span className="text-[11px] text-gray-400 font-mono">main.{activeLang.ext}</span>
                        </div>
                    </div>

                    {/* Editor body */}
                    <div className="flex flex-1 bg-[#1e1e2e] relative">
                        {/* Line numbers */}
                        <div className="select-none text-right pr-3 pl-3 pt-4 text-[12px] font-mono leading-6 text-gray-600 bg-[#1e1e2e] shrink-0 w-12 hidden sm:block"
                            style={{ minHeight: "100%" }}>
                            {code.split("\n").map((_, i) => (
                                <div key={i}>{i + 1}</div>
                            ))}
                        </div>
                        <div className="w-px bg-gray-700/40 shrink-0 hidden sm:block" />
                        <textarea
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            spellCheck={false}
                            className="flex-1 w-full min-h-[400px] font-mono text-[13px] leading-6 p-4 bg-transparent text-[#cdd6f4] focus:outline-none resize-none caret-white"
                            style={{ tabSize: 4 }}
                            onKeyDown={e => {
                                if (e.key === "Tab") {
                                    e.preventDefault();
                                    const s = e.currentTarget.selectionStart, en = e.currentTarget.selectionEnd;
                                    setCode(code.substring(0, s) + "    " + code.substring(en));
                                    setTimeout(() => { e.currentTarget.selectionStart = e.currentTarget.selectionEnd = s + 4; }, 0);
                                }
                            }}
                        />
                    </div>
                </div>

                {/* ── Right column: Input + Output ─────────────────────────── */}
                <div className="flex flex-col gap-3 min-h-0">

                    {/* Stdin pane */}
                    <div className="flex flex-col rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-md">
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <ChevronRight size={13} className="text-gray-400" />
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">stdin</span>
                        </div>
                        <textarea
                            value={stdin}
                            onChange={e => setStdin(e.target.value)}
                            placeholder="Enter program input here…"
                            className="flex-1 p-3 font-mono text-sm bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none resize-none min-h-[100px]"
                        />
                    </div>

                    {/* Output pane */}
                    <div className="flex flex-col rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md flex-1 min-h-[180px]">
                        {/* Output titlebar */}
                        <div className={`flex items-center gap-2 px-4 py-2.5 border-b shrink-0 ${ran && error
                                ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800"
                                : ran && output
                                    ? "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800"
                                    : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                            }`}>
                            <Terminal size={13} className={ran && error ? "text-red-400" : ran ? "text-green-500" : "text-gray-400"} />
                            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">output</span>
                            {loading && (
                                <span className="flex items-center gap-1.5 ml-auto text-xs text-indigo-500">
                                    <Loader2 size={11} className="animate-spin" /> Compiling…
                                </span>
                            )}
                            {ran && !loading && (
                                <span className={`ml-auto text-xs font-semibold ${error ? "text-red-500" : "text-green-500"}`}>
                                    {error ? "Error" : "Accepted ✓"}
                                </span>
                            )}
                        </div>

                        {/* Output body — always dark terminal look */}
                        <div className="flex-1 bg-[#1e1e2e] p-4 font-mono text-[12px] leading-5 overflow-auto">
                            {!ran && !loading && (
                                <span className="text-gray-600">▶ Run your code to see output here…</span>
                            )}
                            {ran && error && (
                                <pre className="text-red-400 whitespace-pre-wrap break-words">{error}</pre>
                            )}
                            {ran && !error && (
                                <pre className="text-green-300 whitespace-pre-wrap break-words">{output}</pre>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
