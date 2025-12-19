import React, { useState, useEffect, useRef, useMemo } from 'react';
import { vocabList } from '../../types';
import confetti from 'canvas-confetti';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

interface RainDrop {
    id: number;
    word: string;
    isCorrect: boolean;
    left: number; // 0-90%
    duration: number; // seconds
}

export const RainGame: React.FC<Props> = ({ onComplete, onBack }) => {
  const shuffledVocab = useMemo(() => [...vocabList].sort(() => Math.random() - 0.5), []);
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [drops, setDrops] = useState<RainDrop[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentTarget = shuffledVocab[level];
  const dropIdCounter = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
      if (isFinished) return;
      
      // Faster spawn rate: every 700ms instead of 1200ms
      const spawnRate = 700; 
      timerRef.current = window.setInterval(() => {
          spawnDrop();
      }, spawnRate);

      return () => {
          if (timerRef.current) clearInterval(timerRef.current);
      };
  }, [level, isFinished]);

  const spawnDrop = () => {
      // 35% chance for the correct word to appear amidst the distractors
      const isCorrectSpawn = Math.random() < 0.35;
      
      let wordObj;
      if (isCorrectSpawn) {
          wordObj = currentTarget;
      } else {
          const distractors = vocabList.filter(v => v.en !== currentTarget.en);
          wordObj = distractors[Math.floor(Math.random() * distractors.length)];
      }

      const newDrop: RainDrop = {
          id: dropIdCounter.current++,
          word: wordObj.en,
          isCorrect: wordObj.en === currentTarget.en,
          left: Math.random() * 85 + 2.5, // Slightly more horizontal variety
          duration: Math.random() * 3 + 3.5 // 3.5 to 6.5 seconds fall time
      };

      setDrops(prev => [...prev, newDrop]);
  };

  // Cleanup old drops periodically to prevent DOM bloat
  useEffect(() => {
      const cleanup = setInterval(() => {
          // Keep up to 30 drops on screen for a dense "rain" feel
          setDrops(prev => prev.slice(-30));
      }, 3000);
      return () => clearInterval(cleanup);
  }, []);

  const handleDropClick = (drop: RainDrop) => {
      if (drop.isCorrect) {
          // Correct!
          confetti({ 
            particleCount: 40, 
            spread: 60, 
            origin: { x: drop.left / 100, y: 0.8 }, 
            colors: ['#60a5fa', '#93c5fd', '#ffffff'] 
          });
          setScore(s => s + 1);
          setDrops([]); // Clear current screen on success
          
          setTimeout(() => {
              if (level < shuffledVocab.length - 1) { 
                  setLevel(l => l + 1);
              } else {
                  setIsFinished(true);
              }
          }, 500);
      } else {
          // Wrong word - remove just that drop with a small "miss" effect
          setDrops(prev => prev.filter(d => d.id !== drop.id));
      }
  };

  const onDropAnimationEnd = (id: number) => {
      setDrops(prev => prev.filter(d => d.id !== id));
  };

  if (isFinished) {
      return (
        <div className="min-h-screen bg-blue-200 flex flex-col items-center justify-center p-4">
             <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full relative">
                 <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-32 h-32">
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/186.png" alt="Politoed" className="w-full h-full object-contain" />
                 </div>
                 <div className="mt-8">
                     <h2 className="text-3xl font-bold text-blue-600 mb-2">Rain Master!</h2>
                     <p className="text-gray-500 mb-6 font-bold text-xl">You caught all 20 words! 🏆</p>
                     <button onClick={onComplete} className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-blue-600 transition">Collect Reward! 🌳</button>
                 </div>
             </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden flex flex-col items-center font-sans">
        {/* Dynamic Background Rain Texture */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] animate-rain"></div>
        </div>
        
        {/* Top Header UI */}
        <div className="z-20 w-full max-w-lg flex justify-between items-center p-4 text-white">
            <button onClick={onBack} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full font-bold backdrop-blur-sm border border-white/10 transition-colors">Exit</button>
            <div className="flex items-center gap-2 bg-blue-900/60 px-5 py-2 rounded-full backdrop-blur-md border border-blue-400/40 shadow-lg">
                <span className="text-2xl animate-pulse">☔</span>
                <span className="text-xl font-black">{score} / 20</span>
            </div>
        </div>

        {/* Target Board */}
        <div className="z-20 mt-4 mb-2 animate-bounce-slow">
            <div className="bg-white/95 backdrop-blur-md border-4 border-blue-400 px-10 py-6 rounded-3xl shadow-[0_0_40px_rgba(59,130,246,0.4)] text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-blue-400"></div>
                <h2 className="text-blue-400 font-black text-xs uppercase tracking-widest mb-1">Target Word</h2>
                <h1 className="text-4xl md:text-5xl font-black text-slate-800">{currentTarget.cn}</h1>
                <div className="absolute bottom-0 right-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/186.png" className="w-24 h-24" alt="Politoed" />
                </div>
            </div>
        </div>

        {/* Game Area - Interactive Rain Drops */}
        <div className="flex-1 w-full relative overflow-hidden">
            {drops.map(drop => (
                <div
                    key={drop.id}
                    onClick={() => handleDropClick(drop)}
                    onAnimationEnd={() => onDropAnimationEnd(drop.id)}
                    className="absolute cursor-pointer flex flex-col items-center justify-center hover:scale-110 active:scale-90 transition-transform select-none touch-none"
                    style={{
                        left: `${drop.left}%`,
                        top: '-120px',
                        animation: `fall ${drop.duration}s linear forwards`
                    }}
                >
                    <div className="relative">
                        <div className={`
                            w-20 h-20 md:w-24 md:h-24 rounded-full rounded-tl-none -rotate-45 border-4 shadow-xl flex items-center justify-center
                            bg-gradient-to-br from-blue-300 via-blue-500 to-blue-700 border-blue-200/50
                        `}>
                            <div className="rotate-45 w-full h-full flex items-center justify-center p-2">
                                <span className="font-black text-white text-base md:text-lg drop-shadow-md text-center leading-tight break-words">
                                    {drop.word}
                                </span>
                            </div>
                        </div>
                        {/* Realistic Glossy Shine */}
                        <div className="absolute top-2 left-2 w-5 h-5 bg-white/40 rounded-full blur-[2px]"></div>
                        <div className="absolute bottom-4 right-4 w-2 h-2 bg-white/20 rounded-full"></div>
                    </div>
                </div>
            ))}
        </div>

        {/* Background Decoration */}
        <div className="absolute bottom-[-20px] left-0 right-0 h-24 bg-gradient-to-t from-blue-900/40 to-transparent pointer-events-none"></div>

        <style>{`
            @keyframes fall {
                0% { transform: translateY(0); }
                100% { transform: translateY(115vh); }
            }
            @keyframes rain {
                0% { background-position: 0 0; }
                100% { background-position: 30px 60px; }
            }
            @keyframes bounce-slow {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
            }
            .animate-rain {
                animation: rain 1.5s linear infinite;
            }
            .animate-bounce-slow {
                animation: bounce-slow 3s ease-in-out infinite;
            }
        `}</style>
    </div>
  );
};