import { useState, useEffect } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

export const FocusWidget = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  // Total time for progress calculation
  const totalTime = mode === 'focus' ? 25 * 60 : 5 * 60;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Optional: Play sound or notification here
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };
  
  const switchMode = (newMode: 'focus' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <GlassCard className="flex flex-col h-full !p-6 relative overflow-hidden">
        {/* Mode Switcher - Top */}
        <div className="flex justify-center mb-6">
             <div className="flex gap-1 p-1 bg-black/20 rounded-full border border-white/5">
                <button 
                    onClick={() => switchMode('focus')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${mode === 'focus' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'text-white/40 hover:text-white'}`}
                >
                    <Brain size={12} />
                    <span>专注</span>
                </button>
                <button 
                    onClick={() => switchMode('break')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${mode === 'break' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-white/40 hover:text-white'}`}
                >
                    <Coffee size={12} />
                    <span>休息</span>
                </button>
            </div>
        </div>

        {/* Timer Display - Center */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
            {/* Circular Progress Background */}
            <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform">
                    {/* Track */}
                    <circle
                        cx="80"
                        cy="80"
                        r="70"
                        className="stroke-white/5 fill-none"
                        strokeWidth="4"
                    />
                    {/* Progress */}
                    <motion.circle
                        cx="80"
                        cy="80"
                        r="70"
                        className={`fill-none ${mode === 'focus' ? 'stroke-indigo-500' : 'stroke-emerald-500'}`}
                        strokeWidth="4"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 - (timeLeft / totalTime) }}
                        transition={{ duration: 1, ease: "linear" }}
                        style={{
                             strokeDasharray: "440",
                             strokeDashoffset: 440 * (timeLeft / totalTime)
                        }}
                    />
                </svg>
                
                {/* Time Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div 
                        key={timeLeft}
                        initial={{ opacity: 0.5, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-4xl font-bold text-white tracking-wider font-mono tabular-nums"
                    >
                        {formatTime(timeLeft)}
                    </motion.div>
                    <div className="text-[10px] text-white/40 font-medium tracking-widest uppercase mt-1">
                        {isActive ? '进行中' : '已暂停'}
                    </div>
                </div>
            </div>
        </div>

        {/* Controls - Bottom */}
        <div className="flex justify-center gap-4 mt-6">
            <button 
                onClick={toggleTimer}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-lg border border-white/10 group ${isActive ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200' : 'bg-white/10 hover:bg-white/20'}`}
            >
                {isActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
            </button>
            
            <button 
                onClick={resetTimer}
                className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all hover:scale-105 active:scale-95 border border-white/5 group"
            >
                <RotateCcw size={18} className="group-hover:-rotate-180 transition-transform duration-500" />
            </button>
        </div>
    </GlassCard>
  );
};
