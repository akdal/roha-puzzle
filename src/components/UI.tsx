import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';

export const UI = () => {
    const {
        gameStatus,
        startTime,
        moveCount,
        scramble,
        resetGame,
        isSolving,
        leaderboard,
        theme,
        setTheme,
        invertControls,
        toggleInvertControls,
        orbitLocked,
        toggleOrbitLock,
        cubeLocked,
        toggleCubeLock,
        requestViewReset
    } = useStore();

    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (!isSolving || !startTime) return;
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 50);
        return () => clearInterval(interval);
    }, [isSolving, startTime]);

    const timeDisplay = (gameStatus === 'IDLE' || !startTime)
        ? "0.00"
        : ((now - startTime) / 1000).toFixed(2);

    if (gameStatus === 'SOLVED') {
        return (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-2xl shadow-2xl text-center animate-bounce-in max-w-sm w-full">
                    <h1 className="text-4xl font-bold text-green-600 mb-4">SOLVED!</h1>
                    <div className="text-2xl mb-2">Time: <span className="font-mono">{timeDisplay}</span>s</div>
                    <div className="text-xl mb-6">Moves: {moveCount}</div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => scramble(20)}
                            className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition"
                        >
                            Play Again
                        </button>
                        <button
                            onClick={() => setShowLeaderboard(true)}
                            className="text-gray-500 underline hover:text-gray-800"
                        >
                            View Leaderboard
                        </button>
                    </div>
                </div>
                {showLeaderboard && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                        <div className="bg-white p-6 rounded-xl w-80 relative">
                            <button onClick={() => setShowLeaderboard(false)} className="absolute top-2 right-2 text-xl font-bold">×</button>
                            <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
                            {leaderboard.length === 0 ? (
                                <p className="text-gray-500">No records yet.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {leaderboard.map((entry, i) => (
                                        <li key={i} className="flex justify-between border-b pb-1">
                                            <span>{i + 1}. {new Date(entry.date).toLocaleDateString()}</span>
                                            <span className="font-mono font-bold">{entry.time.toFixed(2)}s</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-6 z-20">
            {/* Top Bar */}
            <div className="flex justify-between items-start gap-2 pointer-events-auto">
                {/* Left Panel - Controls */}
                <div className="bg-black/60 rounded-xl text-white backdrop-blur-md border border-white/10 overflow-hidden">
                    {/* Header with toggle */}
                    <div className="flex items-center justify-between p-2.5 sm:p-3">
                        <h1 className="text-sm sm:text-lg font-bold">Rubik's 3D</h1>
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="text-lg sm:text-xl px-1"
                        >
                            {showSettings ? '✕' : '⚙️'}
                        </button>
                    </div>

                    {/* Quick Lock Buttons - Always visible */}
                    <div className="flex border-t border-white/10">
                        <button
                            onClick={toggleOrbitLock}
                            className={`flex-1 py-2.5 text-center transition border-r border-white/10 ${
                                orbitLocked
                                    ? 'bg-red-600/80 text-white'
                                    : 'text-gray-300 active:bg-white/10'
                            }`}
                        >
                            <span className="text-lg">{orbitLocked ? '🔒' : '🌐'}</span>
                        </button>
                        <button
                            onClick={toggleCubeLock}
                            className={`flex-1 py-2.5 text-center transition border-r border-white/10 ${
                                cubeLocked
                                    ? 'bg-red-600/80 text-white'
                                    : 'text-gray-300 active:bg-white/10'
                            }`}
                        >
                            <span className="text-lg">{cubeLocked ? '🔒' : '🎲'}</span>
                        </button>
                        <button
                            onClick={requestViewReset}
                            className="flex-1 py-2.5 text-center text-gray-300 active:bg-white/10 transition"
                        >
                            <span className="text-lg">↺</span>
                        </button>
                    </div>

                    {/* Expandable Settings */}
                    {showSettings && (
                        <div className="p-2.5 sm:p-3 border-t border-white/10 space-y-2">
                            <button
                                onClick={() => { setShowLeaderboard(!showLeaderboard); setShowSettings(false); }}
                                className="w-full text-left text-xs text-blue-300 active:text-blue-100"
                            >
                                📊 Leaderboard
                            </button>

                            <select
                                value={theme}
                                onChange={(e) => setTheme(e.target.value as 'dark' | 'light' | 'blue')}
                                className="block w-full bg-gray-800 text-xs p-2 rounded border border-gray-600"
                            >
                                <option value="dark">🌙 Dark</option>
                                <option value="light">☀️ Light</option>
                                <option value="blue">🌊 Blue</option>
                            </select>

                            <button
                                onClick={toggleInvertControls}
                                className={`w-full text-xs p-2 rounded border transition ${
                                    invertControls
                                        ? 'bg-blue-600 border-blue-500 text-white'
                                        : 'bg-gray-800 border-gray-600 text-gray-300'
                                }`}
                            >
                                {invertControls ? '↔ Inverted' : '↔ Natural'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Panel - Stats */}
                <div className="flex gap-1.5 sm:gap-2">
                    <div className="bg-black/60 px-3 py-2 sm:p-3 rounded-xl text-white backdrop-blur-md border border-white/10">
                        <div className="text-[10px] sm:text-xs text-gray-400 uppercase">Time</div>
                        <div className="text-lg sm:text-2xl font-mono font-bold text-yellow-400">{timeDisplay}</div>
                    </div>
                    <div className="bg-black/60 px-3 py-2 sm:p-3 rounded-xl text-white backdrop-blur-md border border-white/10">
                        <div className="text-[10px] sm:text-xs text-gray-400 uppercase">Moves</div>
                        <div className="text-lg sm:text-xl font-mono font-bold">{moveCount}</div>
                    </div>
                </div>
            </div>

            {showLeaderboard && (
                <div className="absolute top-20 left-6 pointer-events-auto bg-white p-4 rounded-xl w-64 shadow-xl z-50">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-black">Leaderboard</h2>
                        <button
                            onClick={() => setShowLeaderboard(false)}
                            className="text-gray-500 hover:text-black text-xl font-bold leading-none"
                        >
                            ×
                        </button>
                    </div>
                    {leaderboard.length === 0 ? (
                        <p className="text-gray-500 text-sm">No records.</p>
                    ) : (
                        <ul className="space-y-1">
                            {leaderboard.map((entry, i) => (
                                <li key={i} className="flex justify-between border-b border-gray-200 pb-1 text-sm text-black">
                                    <span>{i + 1}. {entry.time.toFixed(2)}s</span>
                                    <span className="text-gray-500 text-xs">{new Date(entry.date).toLocaleDateString()}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Bottom Bar */}
            <div className="flex justify-center gap-4 pointer-events-auto mb-8">
                <button
                    onClick={() => scramble(20)}
                    className="px-8 py-4 bg-yellow-500 text-black font-bold rounded-2xl shadow-lg hover:bg-yellow-400 transition transform hover:scale-105"
                >
                    SCRAMBLE
                </button>
                <button
                    onClick={resetGame}
                    className="px-6 py-4 bg-gray-700 text-white font-bold rounded-2xl shadow-lg hover:bg-gray-600 transition"
                >
                    RESET
                </button>
            </div>

            <div className="absolute bottom-4 left-6 text-white/50 text-sm">
                Drag faces to rotate • Background to orbit
            </div>
        </div>
    );
};
