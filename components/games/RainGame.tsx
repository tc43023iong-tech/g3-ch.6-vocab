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
    size: 'small' | 'medium' | 'large';
}

export const RainGame: React.FC<Props> = ({ onComplete, onBack }) => {
  const shuffledVocab = useMemo(() => [...vocabList].sort(() => Math.random() - 0.5), []);
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [drops, setDrops] = useState<RainDrop[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [splashes, setSplashes] = useState<{id: number, x: number, y: number}[]>([]);

  const currentTarget = shuffledVocab[level];
  const dropIdCounter = useRef(0);
  const splashIdCounter = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
      if (isFinished) return;
      
      const spawnRate = 800; 
      timerRef.current = window.setInterval(() => {
          spawnDrop();
      }, spawnRate);

      return () => {
          if (timerRef.current) clearInterval(timerRef.current);
      };
  }, [level, isFinished]);

  const spawnDrop = () => {
      const isCorrectSpawn = Math.random() < 0.35;
      const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
      
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
          left: Math.random() * 80 + 10, 
          duration: Math.random() * 2 + 4, // 4 to 6 seconds
          size: sizes[Math.floor(Math.random() * sizes.length)]
      };

      setDrops(prev => [...prev, newDrop]);
  };

  const createSplash = (x: number, y: number) => {
      const id = splashIdCounter.current++;
      setSplashes(prev => [...prev, { id, x, y }]);
      setTimeout(() => {
          setSplashes(prev => prev.filter(s => s.id !== id));
      }, 600);
  };

  const handleDropClick = (drop: RainDrop, e: React.MouseEvent) => {
      createSplash(e.clientX, e.clientY);

      if (drop.isCorrect) {
          confetti({ 
            particleCount: 40, 
            spread: 60, 
            origin: { x: drop.left / 100, y: e.clientY / window.innerHeight }, 
            colors: ['#60a5fa', '#ffffff', '#93c5fd'] 
          });
          setScore(s => s + 1);
          setDrops([]); 
          
          setTimeout(() => {
              if (level < shuffledVocab.length - 1) { 
                  setLevel(l => l + 1);
              } else {
                  setIsFinished(true);
              }
          }, 600);
      } else {
          setDrops(prev => prev.filter(d => d.id !== drop.id));
      }
  };

  const onDropAnimationEnd = (id: number) => {
      setDrops(prev => prev.filter(d => d.id !== id));
  };

  if (isFinished) {
      return (
        <div className="min-h-screen bg-blue-100 flex flex-col items-center justify-center p-4">
             <div className="bg-white p-10 rounded-[3rem] shadow-2xl text-center max-w-md w-full relative border-8 border-blue-200">
                 <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-40 h-40">
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/186.png" alt="Politoed" className="w-full h-full object-contain animate-bounce" />
                 </div>
                 <div className="mt-12">
                     <h2 className="text-4xl font-black text-blue-600 mb-2 italic">Rainy Hero!</h2>
                     <p className="text-gray-500 mb-8 font-bold text-xl uppercase tracking-widest">You caught {score} drops!</p>
                     <button onClick={onComplete} className="w-full py-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-3xl font-black text-2xl shadow-xl hover:scale-105 transition-transform active:scale-95 border-b-8 border-blue-800">
                        GET PRIZE! 🎁
                     </button>
                 </div>
             </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-950 relative overflow-hidden flex flex-col items-center font-sans">
        
        {/* Layered Background Rain Streaks for Depth */}
        <div className="absolute inset-0 pointer-events-none">
             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] animate-rain-fast"></div>
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] animate-rain-slow scale-150"></div>
        </div>
        
        {/* Weather Clouds Decor */}
        <div className="absolute top-0 w-full flex justify-around opacity-30 pointer-events-none">
            <span className="text-8xl animate-float">☁️</span>
            <span className="text-9xl animate-float-delayed">☁️</span>
            <span className="text-7xl animate-float">☁️</span>
        </div>

        {/* Top Header UI */}
        <div className="z-50 w-full max-w-2xl flex justify-between items-center p-6 text-white">
            <button onClick={onBack} className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full font-black backdrop-blur-md border-2 border-white/20 transition-all flex items-center gap-2 group">
                <span className="group-hover:-translate-x-1 transition-transform">🔙</span> Exit
            </button>
            <div className="flex items-center gap-3 bg-blue-500/30 px-6 py-2 rounded-full backdrop-blur-xl border-2 border-blue-300/40 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                <span className="text-3xl animate-pulse">💧</span>
                <span className="text-2xl font-black tabular-nums">{score} / 20</span>
            </div>
        </div>

        {/* Cloud-styled Target Board */}
        <div className="z-40 mt-2 mb-4">
            <div className="relative group">
                {/* Cloud Shape using multiple circles logic in tailwind/css */}
                <div className="bg-white/95 backdrop-blur-xl px-12 py-8 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-center relative z-10 border-4 border-blue-100">
                    <h2 className="text-blue-400 font-black text-sm uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                       <span className="animate-ping">●</span> Catch this word:
                    </h2>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-800 drop-shadow-sm tracking-tight">
                        {currentTarget.cn}
                    </h1>
                </div>
                {/* Decorative cloud "bumps" */}
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-white rounded-full"></div>
                <div className="absolute -top-6 right-10 w-20 h-20 bg-white rounded-full"></div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full"></div>
            </div>
        </div>

        {/* Game Area - Interactive Rain Drops */}
        <div className="flex-1 w-full relative">
            {drops.map(drop => (
                <div
                    key={drop.id}
                    onClick={(e) => handleDropClick(drop, e)}
                    onAnimationEnd={() => onDropAnimationEnd(drop.id)}
                    className="absolute cursor-pointer flex flex-col items-center justify-center hover:scale-110 active:scale-90 transition-transform select-none touch-none z-30"
                    style={{
                        left: `${drop.left}%`,
                        top: '-150px',
                        animation: `fall ${drop.duration}s linear forwards`
                    }}
                >
                    <div className="relative drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                        {/* Realistic Teardrop Shape */}
                        <div className={`
                            ${drop.size === 'small' ? 'w-16 h-16' : drop.size === 'medium' ? 'w-20 h-20' : 'w-24 h-24'}
                            rounded-full rounded-tl-none -rotate-45 border-4 flex items-center justify-center
                            bg-gradient-to-br from-blue-300 via-blue-500 to-indigo-700 border-blue-200/40
                            group
                        `}>
                            <div className="rotate-45 w-full h-full flex items-center justify-center p-3">
                                <span className={`
                                    font-black text-white drop-shadow-md text-center leading-tight break-words
                                    ${drop.size === 'small' ? 'text-xs' : 'text-sm md:text-base'}
                                `}>
                                    {drop.word}
                                </span>
                            </div>
                        </div>
                        {/* Shine Effect */}
                        <div className="absolute top-2 left-3 w-1/4 h-1/4 bg-white/40 rounded-full blur-[1px]"></div>
                        <div className="absolute bottom-4 right-5 w-1 h-1 bg-white/30 rounded-full"></div>
                    </div>
                </div>
            ))}

            {/* Splashes Layer */}
            {splashes.map(splash => (
                <div 
                    key={splash.id}
                    className="fixed pointer-events-none z-50 flex items-center justify-center"
                    style={{ left: splash.x, top: splash.y, transform: 'translate(-50%, -50%)' }}
                >
                    <div className="w-12 h-12 border-4 border-blue-300 rounded-full animate-splash-circle opacity-0"></div>
                    <div className="absolute text-2xl animate-splash-drops">💦</div>
                </div>
            ))}
        </div>

        {/* Bottom Puddle Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blue-400/20 to-transparent pointer-events-none border-t border-blue-400/10">
            <div className="absolute bottom-4 left-1/4 text-4xl opacity-20 animate-ripple">⭕</div>
            <div className="absolute bottom-8 right-1/3 text-2xl opacity-10 animate-ripple-delayed">⭕</div>
        </div>

        <style>{`
            @keyframes fall {
                0% { transform: translateY(0); }
                100% { transform: translateY(120vh); }
            }
            @keyframes rain-fast {
                0% { background-position: 0 0; }
                100% { background-position: 100px 200px; }
            }
            @keyframes rain-slow {
                0% { background-position: 0 0; }
                100% { background-position: 50px 100px; }
            }
            @keyframes float {
                0%, 100% { transform: translateY(0) translateX(0); }
                50% { transform: translateY(-20px) translateX(10px); }
            }
            @keyframes ripple {
                0% { transform: scale(0.5); opacity: 0.5; }
                100% { transform: scale(2); opacity: 0; }
            }
            @keyframes splash-circle {
                0% { transform: scale(0.5); opacity: 1; border-width: 4px; }
                100% { transform: scale(2.5); opacity: 0; border-width: 1px; }
            }
            @keyframes splash-drops {
                0% { transform: translateY(0) scale(1); opacity: 1; }
                100% { transform: translateY(-40px) scale(0); opacity: 0; }
            }
            .animate-rain-fast { animation: rain-fast 0.6s linear infinite; }
            .animate-rain-slow { animation: rain-slow 1.5s linear infinite; }
            .animate-float { animation: float 6s ease-in-out infinite; }
            .animate-float-delayed { animation: float 8s ease-in-out infinite 1s; }
            .animate-ripple { animation: ripple 3s ease-out infinite; }
            .animate-ripple-delayed { animation: ripple 3s ease-out infinite 1.5s; }
            .animate-splash-circle { animation: splash-circle 0.5s ease-out forwards; }
            .animate-splash-drops { animation: splash-drops 0.4s ease-out forwards; }
            .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        `}</style>
    </div>
  );
};
