import React, { useState, useEffect, useRef } from 'react';
import { vocabList, WordItem } from '../../types';
import confetti from 'canvas-confetti';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

export const Parkour: React.FC<Props> = ({ onComplete, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [lane, setLane] = useState<0 | 1>(0); // 0 = Top, 1 = Bottom
  const [obstacles, setObstacles] = useState<{id: number, word: string, lane: 0 | 1, isCorrect: boolean, left: number}[]>([]);
  const [targetWord, setTargetWord] = useState<WordItem>(vocabList[0]);
  const [gameOver, setGameOver] = useState(false);
  
  const requestRef = useRef<number>();
  const speedRef = useRef(0.8); // Speed of movement
  const lastSpawnRef = useRef(0);
  const scoreRef = useRef(0);

  const GAME_WIDTH = 100; // Percent

  const startGame = () => {
      setIsPlaying(true);
      setGameOver(false);
      setScore(0);
      setObstacles([]);
      pickNewTarget();
      speedRef.current = 0.8;
      scoreRef.current = 0;
      lastSpawnRef.current = 0;
  };

  const pickNewTarget = () => {
      const random = vocabList[Math.floor(Math.random() * vocabList.length)];
      setTargetWord(random);
  };

  const spawnObstacle = () => {
      const correctLane = Math.random() > 0.5 ? 0 : 1;
      
      // Correct Word
      const newObsCorrect = {
          id: Math.random(),
          word: targetWord.en,
          lane: correctLane as 0 | 1,
          isCorrect: true,
          left: 100
      };

      // Wrong Word (Distractor)
      const distractor = vocabList.find(v => v.en !== targetWord.en) || vocabList[0];
      const newObsWrong = {
        id: Math.random(),
        word: distractor.en,
        lane: (correctLane === 0 ? 1 : 0) as 0 | 1,
        isCorrect: false,
        left: 100
      };

      setObstacles(prev => [...prev, newObsCorrect, newObsWrong]);
  };

  const update = () => {
      if (!isPlaying || gameOver) return;

      setObstacles(prev => {
          const next = prev.map(obs => ({...obs, left: obs.left - speedRef.current}));
          
          // Collision Detection (Player is roughly at 10% to 20% left)
          // Hitbox: Player Left 10, Right 20. Obs Left obs.left, Right obs.left + 15 (approx width)
          
          const collided = next.find(obs => 
             obs.left < 20 && 
             obs.left > 5 && 
             obs.lane === lane &&
             !obs.isCorrect // We only care if we hit wrong ones, or maybe we collect correct ones?
             // Let's logic: Collect Correct -> Points. Hit Wrong -> Game Over.
          );

          // Check for collection of correct
          const collectedIndex = next.findIndex(obs => 
            obs.left < 20 && 
            obs.left > 5 && 
            obs.lane === lane &&
            obs.isCorrect
         );

         if (collectedIndex !== -1) {
             // Got it!
             confetti({ particleCount: 20, spread: 30, origin: { x: 0.2, y: 0.5 }, colors: ['#fbbf24'] });
             scoreRef.current += 1;
             setScore(scoreRef.current);
             if (scoreRef.current >= 5) {
                // Win Condition
                setGameOver(true);
             } else {
                 pickNewTarget();
             }
             // Remove just the pair (complex to track pair, just remove this one and let other pass)
             return next.filter((_, i) => i !== collectedIndex);
         }

         if (collided) {
            // Hit wrong word
            setGameOver(true);
            return next;
         }

          // Cleanup
          return next.filter(obs => obs.left > -30);
      });

      // Spawning
      lastSpawnRef.current += 1;
      if (lastSpawnRef.current > 150) { // Frequency
          spawnObstacle();
          lastSpawnRef.current = 0;
      }

      requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
      if (isPlaying && !gameOver) {
          requestRef.current = requestAnimationFrame(update);
      }
      return () => cancelAnimationFrame(requestRef.current!);
  }, [isPlaying, gameOver, lane, targetWord]); // dependencies need care

  const toggleLane = () => {
      setLane(prev => prev === 0 ? 1 : 0);
  };

  if (gameOver && score >= 5) {
      return (
        <div className="min-h-screen bg-orange-100 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full relative">
            <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-32 h-32">
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/813.png" alt="Scorbunny" className="w-full h-full object-contain" />
            </div>
            <div className="mt-8">
                <h2 className="text-3xl font-bold text-orange-600 mb-4">Champion Runner!</h2>
                <button 
                    onClick={onComplete}
                    className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-orange-600 transition"
                >
                    Collect Reward! 🌳
                </button>
            </div>
            </div>
        </div>
      );
  }

  if (gameOver && score < 5) {
    return (
        <div className="min-h-screen bg-red-100 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full">
                <h2 className="text-3xl font-bold text-red-600 mb-4">Ouch!</h2>
                <p className="mb-6">Watch out for the wrong words!</p>
                <button 
                    onClick={startGame}
                    className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-red-600 transition"
                >
                    Try Again 🏃
                </button>
                <button onClick={onBack} className="mt-4 text-gray-400 font-bold">Quit</button>
            </div>
        </div>
    );
  }

  if (!isPlaying) {
      return (
        <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4">
             <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full relative">
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/813.png" alt="Scorbunny" className="w-32 h-32 mx-auto mb-4" />
                <h1 className="text-3xl font-black text-orange-600 mb-4">Pokemon Run!</h1>
                <p className="mb-6 text-gray-600">
                    Switch lanes to collect the English word for:
                    <br/><br/>
                    <span className="font-bold text-2xl text-black">Target Chinese Word</span>
                </p>
                <button 
                    onClick={startGame}
                    className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-orange-600 transition animate-bounce"
                >
                    Start Running!
                </button>
                <button onClick={onBack} className="mt-6 text-gray-400 font-bold">Back</button>
             </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-sky-200 overflow-hidden relative flex flex-col" onClick={toggleLane}>
       
       {/* HUD */}
       <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center bg-white/80 p-3 rounded-xl backdrop-blur-md">
           <div className="text-xl font-black text-orange-600">Target: <span className="text-2xl text-black">{targetWord.cn}</span></div>
           <div className="text-xl font-bold">Score: {score}/5</div>
       </div>

       {/* Game World */}
       <div className="flex-1 relative flex flex-col justify-center gap-4">
           
           {/* Lane 0 (Top) */}
           <div className="h-32 bg-green-300 border-y-4 border-green-500 relative flex items-center">
               <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,transparent,transparent_50px,#000_50px,#000_52px)]"></div>
               {lane === 0 && (
                   <img 
                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/813.png" 
                    className="w-24 h-24 absolute left-10 z-20 drop-shadow-lg transition-all duration-200"
                    alt="Player"
                   />
               )}
           </div>

           {/* Lane 1 (Bottom) */}
           <div className="h-32 bg-green-300 border-y-4 border-green-500 relative flex items-center">
               <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,transparent,transparent_50px,#000_50px,#000_52px)]"></div>
               {lane === 1 && (
                   <img 
                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/813.png" 
                    className="w-24 h-24 absolute left-10 z-20 drop-shadow-lg transition-all duration-200"
                    alt="Player"
                   />
               )}
           </div>
           
           {/* Obstacles Overlay */}
           {obstacles.map(obs => (
               <div 
                 key={obs.id}
                 className="absolute px-4 py-2 bg-white rounded-xl shadow-lg border-2 font-bold text-lg whitespace-nowrap z-10 transition-transform"
                 style={{
                     left: `${obs.left}%`,
                     top: obs.lane === 0 ? 'calc(50% - 80px)' : 'calc(50% + 64px)', // rough positioning
                     borderColor: obs.isCorrect ? '#22c55e' : '#ef4444'
                 }}
               >
                   {obs.word}
               </div>
           ))}

       </div>

       <div className="absolute bottom-10 w-full text-center text-white font-bold text-xl animate-pulse pointer-events-none">
           TAP SCREEN TO SWITCH LANES
       </div>
    </div>
  );
};