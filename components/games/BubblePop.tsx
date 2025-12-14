import React, { useState, useEffect, useMemo } from 'react';
import { vocabList, WordItem } from '../../types';
import confetti from 'canvas-confetti';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

export const BubblePop: React.FC<Props> = ({ onComplete, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [bubbles, setBubbles] = useState<WordItem[]>([]);
  const [popped, setPopped] = useState<Set<string>>(new Set());
  
  // Force animation reset on new round
  const [roundKey, setRoundKey] = useState(0); 

  const currentWord = vocabList[currentIndex];

  const shuffle = <T,>(array: T[]): T[] => array.sort(() => Math.random() - 0.5);

  useEffect(() => {
    // Generate bubbles
    const others = vocabList.filter(w => w.en !== currentWord.en);
    const distractors = shuffle(others).slice(0, 5); // 5 distractors + 1 correct = 6 bubbles
    const roundBubbles = shuffle([currentWord, ...distractors]);
    setBubbles(roundBubbles);
    setPopped(new Set());
    setRoundKey(prev => prev + 1); 
  }, [currentIndex, currentWord]);

  // Generate static sea creatures (Pokemon) for the background to avoid re-render jumps
  const seaCreatures = useMemo(() => {
      // Water Type Pokemon IDs from PokeAPI
      // 7: Squirtle, 54: Psyduck, 60: Poliwag, 79: Slowpoke, 86: Seel, 90: Shellder, 
      // 98: Krabby, 116: Horsea, 118: Goldeen, 120: Staryu, 129: Magikarp, 
      // 131: Lapras, 134: Vaporeon, 158: Totodile
      const pokemonIds = [7, 54, 60, 79, 86, 90, 98, 116, 118, 120, 129, 131, 134, 158];
      
      return Array.from({ length: 10 }).map((_, i) => ({
          id: pokemonIds[Math.floor(Math.random() * pokemonIds.length)],
          top: Math.random() * 80 + 10, // 10% to 90% top
          duration: Math.random() * 20 + 20, // 20-40s duration (slower is better for background)
          delay: Math.random() * 10,
          direction: Math.random() > 0.5 ? 'left' : 'right'
      }));
  }, []);

  const handleBubbleClick = (word: WordItem) => {
    if (popped.has(word.en)) return;

    if (word.en === currentWord.en) {
        // Correct
        confetti({ particleCount: 50, spread: 70, origin: { x: 0.5, y: 0.5 } });
        
        setTimeout(() => {
            if (currentIndex < vocabList.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                setIsFinished(true);
            }
        }, 1000);
    } else {
        // Incorrect - pop it (add to popped set)
        setPopped(prev => new Set(prev).add(word.en));
    }
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-sky-200 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full">
          <div className="text-8xl mb-4">🫧</div>
          <h2 className="text-3xl font-bold text-sky-600 mb-4">Pop-tastic!</h2>
          <button 
            onClick={onComplete}
            className="w-full py-4 bg-sky-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-sky-600 transition"
          >
            Collect Reward! 🌳
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-cyan-400 via-blue-500 to-indigo-900 overflow-hidden relative">
      
      {/* Background Layer: Rising small bubbles & Swimming Pokemon */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Small rising bubbles */}
          {[...Array(20)].map((_, i) => (
              <div key={`bg-bubble-${i}`} 
                   className="absolute bg-white/10 rounded-full animate-rise"
                   style={{
                       left: `${Math.random() * 100}%`,
                       width: `${Math.random() * 20 + 5}px`,
                       height: `${Math.random() * 20 + 5}px`,
                       animationDuration: `${Math.random() * 10 + 10}s`,
                       animationDelay: `-${Math.random() * 10}s`,
                       bottom: '-50px'
                   }}
              />
          ))}
          
          {/* Swimming Pokemon */}
          {seaCreatures.map((creature, i) => (
               <img
                    key={`animal-${i}`} 
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${creature.id}.png`}
                    alt="Pokemon"
                    className={`absolute opacity-40`} // Keep low opacity for background
                    style={{
                        top: `${creature.top}%`,
                        width: '120px',
                        height: 'auto',
                        left: creature.direction === 'left' ? '110vw' : '-20vw',
                        // Assumes most Pokemon art faces Left/Front-Left. 
                        // swimRight flips it to look like it's moving right.
                        animation: `${creature.direction === 'left' ? 'swimLeft' : 'swimRight'} ${creature.duration}s linear infinite`,
                        animationDelay: `-${creature.delay}s`,
                    }}
               />
          ))}
      </div>

      {/* Header */}
      <div className="relative z-50 flex justify-between items-center p-6 w-full max-w-7xl mx-auto">
        <button onClick={onBack} className="text-2xl bg-white/20 p-3 rounded-full hover:bg-white/40 backdrop-blur-md transition text-white shadow-lg">🔙</button>
        <div className="text-white/80 font-bold text-xl tracking-wider">
            Level {currentIndex + 1} / {vocabList.length}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-40 flex flex-col items-center justify-center min-h-[80vh] w-full max-w-7xl mx-auto">
          
          {/* Question Banner */}
          <div className="mb-12 text-center animate-bounce-slow">
              <div className="inline-block bg-blue-900/40 backdrop-blur-md px-12 py-6 rounded-full border-2 border-cyan-300/50 shadow-[0_0_40px_rgba(0,255,255,0.2)]">
                 <h2 className="text-5xl md:text-6xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] mb-2">
                     {currentWord.cn}
                 </h2>
                 <p className="text-cyan-200 font-bold text-lg uppercase tracking-[0.2em]">Pop the correct bubble!</p>
              </div>
          </div>

          {/* Bubbles Grid - 6 Bubbles Floating */}
          <div key={roundKey} className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16 w-full max-w-5xl px-4">
             {bubbles.map((b, idx) => {
                 const isPopped = popped.has(b.en);
                 // Generate deterministic randoms for this render based on index
                 const delay = (idx * 0.5) % 2; 
                 const duration = 3 + (idx % 3);
                 
                 return (
                     <div key={b.en} className="flex items-center justify-center h-48 md:h-56">
                        {!isPopped ? (
                            <button
                                onClick={() => handleBubbleClick(b)}
                                className="relative group cursor-pointer transition-transform active:scale-90"
                                style={{
                                    animation: `bob ${duration}s ease-in-out infinite alternate ${delay}s`
                                }}
                            >
                                {/* Bubble Sphere */}
                                <div className="w-40 h-40 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-white/30 to-blue-500/30 backdrop-blur-sm border-2 border-white/50 shadow-[0_0_30px_rgba(255,255,255,0.2)] flex flex-col items-center justify-center relative overflow-hidden group-hover:bg-blue-400/30 transition-colors">
                                    
                                    {/* Shine effect */}
                                    <div className="absolute top-4 right-6 w-10 h-6 bg-white/60 rounded-full rotate-[-45deg] blur-[2px]"></div>
                                    <div className="absolute bottom-6 left-8 w-4 h-4 bg-white/40 rounded-full blur-[1px]"></div>

                                    {/* Content */}
                                    <div className="relative z-10 text-center transform group-hover:scale-110 transition-transform duration-300 px-2">
                                        <div className="text-6xl md:text-7xl mb-1 filter drop-shadow-lg">{b.emoji}</div>
                                        <div className="text-lg md:text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none break-words max-w-[180px]">
                                            {b.en}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ) : (
                            // Placeholder to keep grid stable, optionally show a 'pop' effect here
                            <div className="w-40 h-40 md:w-56 md:h-56 flex items-center justify-center opacity-0 transition-opacity duration-500">
                                💥
                            </div>
                        )}
                     </div>
                 )
             })}
          </div>
      </div>

      <style>{`
        @keyframes rise {
            0% { transform: translateY(110vh); opacity: 0; }
            50% { opacity: 0.5; }
            100% { transform: translateY(-10vh); opacity: 0; }
        }
        @keyframes swimRight {
            from { transform: translateX(-20vw) scaleX(-1); }
            to { transform: translateX(120vw) scaleX(-1); }
        }
        @keyframes swimLeft {
            from { transform: translateX(120vw) scaleX(1); }
            to { transform: translateX(-20vw) scaleX(1); }
        }
        @keyframes bob {
            0% { transform: translateY(0) rotate(-2deg); }
            100% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};
