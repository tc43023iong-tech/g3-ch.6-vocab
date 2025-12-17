import React, { useState, useEffect, useRef } from 'react';
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
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [drops, setDrops] = useState<RainDrop[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [bgKey, setBgKey] = useState(0); // Force re-render of BG effects if needed

  const currentTarget = vocabList[level];
  const dropIdCounter = useRef(0);
  const timerRef = useRef<number | null>(null);

  // Start spawning drops
  useEffect(() => {
      if (isFinished) return;
      
      const spawnRate = 1200; // spawn every 1.2s

      timerRef.current = window.setInterval(() => {
          spawnDrop();
      }, spawnRate);

      return () => {
          if (timerRef.current) clearInterval(timerRef.current);
      };
  }, [level, isFinished]);

  const spawnDrop = () => {
      // 50% chance to spawn the correct word, if not too cluttered?
      // Actually, let's just randomise: 40% correct, 60% random distractor
      const isCorrectSpawn = Math.random() < 0.4;
      
      let wordObj;
      if (isCorrectSpawn) {
          wordObj = currentTarget;
      } else {
          // Pick random distractor
          const distractors = vocabList.filter(v => v.en !== currentTarget.en);
          wordObj = distractors[Math.floor(Math.random() * distractors.length)];
      }

      const newDrop: RainDrop = {
          id: dropIdCounter.current++,
          word: wordObj.en,
          isCorrect: wordObj.en === currentTarget.en,
          left: Math.random() * 80 + 5, // 5% to 85%
          duration: Math.random() * 2 + 4 // 4 to 6 seconds fall time (slow enough for kids)
      };

      setDrops(prev => [...prev, newDrop]);
  };

  // Cleanup drops that have fallen (using animation events ideally, but logic cleanup is good too)
  // For simplicity in React, we just let them render and overflow hidden.
  // We can periodically clean up the array to prevent memory leak
  useEffect(() => {
      const cleanup = setInterval(() => {
          setDrops(prev => prev.filter(d => {
             // We can't easily check actual position without refs, 
             // but we can remove old IDs if array gets too big
             return true; 
          }).slice(-15)); // Keep last 15 items max
      }, 5000);
      return () => clearInterval(cleanup);
  }, []);

  const handleDropClick = (drop: RainDrop) => {
      if (drop.isCorrect) {
          // Correct!
          confetti({ particleCount: 30, spread: 50, origin: { x: drop.left / 100, y: 0.8 }, colors: ['#60a5fa', '#93c5fd'] });
          setScore(s => s + 1);
          setDrops([]); // Clear screen for next round
          
          setTimeout(() => {
              if (level < 9 && level < vocabList.length - 1) { // 10 rounds max
                  setLevel(l => l + 1);
              } else {
                  setIsFinished(true);
              }
          }, 500);
      } else {
          // Wrong
          // Shake effect or visual cue?
          // For now, just remove the drop so they can't click again
          setDrops(prev => prev.filter(d => d.id !== drop.id));
      }
  };

  const onDropAnimationEnd = (id: number) => {
      // Remove from state when animation finishes to keep DOM clean
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
                     <p className="text-gray-500 mb-6">You caught all the words!</p>
                     <button onClick={onComplete} className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-blue-600 transition">Collect Reward! 🌳</button>
                 </div>
             </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-800 relative overflow-hidden flex flex-col items-center font-sans">
        
        {/* Dynamic Background Rain */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
             {/* Simple CSS rain effect using background image or repeated elements */}
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] animate-rain"></div>
        </div>
        
        {/* Header HUD */}
        <div className="z-20 w-full max-w-lg flex justify-between items-center p-4 text-white">
            <button onClick={onBack} className="bg-white/20 px-4 py-2 rounded-full font-bold backdrop-blur-sm">Exit</button>
            <div className="flex items-center gap-2 bg-blue-900/50 px-4 py-2 rounded-full backdrop-blur-md border border-blue-400/30">
                <span className="text-2xl">☔</span>
                <span className="text-xl font-bold">{score} / 10</span>
            </div>
        </div>

        {/* Target Board */}
        <div className="z-20 mt-4 mb-2 animate-bounce-slow">
            <div className="bg-white/90 backdrop-blur-md border-4 border-blue-400 px-10 py-6 rounded-3xl shadow-[0_0_30px_rgba(59,130,246,0.6)] text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-blue-400"></div>
                <h2 className="text-gray-500 font-bold text-sm uppercase tracking-widest mb-1">Catch this word</h2>
                <h1 className="text-4xl md:text-5xl font-black text-slate-800">{currentTarget.cn}</h1>
                <div className="absolute bottom-0 right-0 opacity-20 transform translate-x-1/4 translate-y-1/4">
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/186.png" className="w-24 h-24" alt="Politoed" />
                </div>
            </div>
        </div>

        {/* Game Area */}
        <div className="flex-1 w-full relative overflow-hidden">
            {drops.map(drop => (
                <div
                    key={drop.id}
                    onClick={() => handleDropClick(drop)}
                    onAnimationEnd={() => onDropAnimationEnd(drop.id)}
                    className="absolute cursor-pointer flex flex-col items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                    style={{
                        left: `${drop.left}%`,
                        top: '-100px', // Start above screen
                        animation: `fall ${drop.duration}s linear forwards`
                    }}
                >
                    {/* Raindrop Shape */}
                    <div className="relative">
                        <div className={`
                            w-24 h-24 rounded-full rounded-tl-none -rotate-45 border-4 shadow-lg flex items-center justify-center
                            ${drop.isCorrect 
                                // Secretly correct ones look same? Or maybe slight hint? 
                                // Let's make them look the same to force reading, 
                                // maybe slight variation in blue shades randomly
                                ? 'bg-gradient-to-br from-blue-300 to-blue-600 border-blue-200' 
                                : 'bg-gradient-to-br from-cyan-300 to-cyan-600 border-cyan-200'}
                        `}>
                            <div className="rotate-45 w-full h-full flex items-center justify-center">
                                <span className="font-bold text-white text-lg drop-shadow-md text-center leading-tight px-2 break-words">
                                    {drop.word}
                                </span>
                            </div>
                        </div>
                        {/* Shine */}
                        <div className="absolute top-2 left-2 w-4 h-4 bg-white/60 rounded-full blur-[1px]"></div>
                    </div>
                </div>
            ))}
        </div>

        {/* Politoed Bottom Decoration */}
        <div className="absolute bottom-0 right-4 z-10 w-32 h-32 opacity-50 pointer-events-none">
             <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/186.png" alt="Politoed" className="w-full h-full object-contain" />
        </div>

        <style>{`
            @keyframes fall {
                0% { transform: translateY(0); }
                100% { transform: translateY(110vh); }
            }
            @keyframes rain {
                0% { background-position: 0 0; }
                100% { background-position: 20px 20px; }
            }
            @keyframes bounce-slow {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
            }
            .animate-rain {
                animation: rain 1s linear infinite;
            }
            .animate-bounce-slow {
                animation: bounce-slow 3s ease-in-out infinite;
            }
        `}</style>
    </div>
  );
};