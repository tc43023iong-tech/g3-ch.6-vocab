import React, { useState, useEffect, useRef } from 'react';
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
  const [roundKey, setRoundKey] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentWord = vocabList[currentIndex];

  // Assign a random water pokemon to each question number (0 to vocabList.length-1)
  const [rewardPokemon] = useState(() => {
     const waterPokemonIds = [7, 54, 60, 79, 86, 90, 98, 116, 118, 120, 129, 131, 134, 158];
     return vocabList.map(() => waterPokemonIds[Math.floor(Math.random() * waterPokemonIds.length)]);
  });

  // Auto-scroll removed as requested

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
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full relative">
          <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-32 h-32">
             <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png" alt="Squirtle" className="w-full h-full object-contain" />
          </div>
          <div className="mt-8">
              <h2 className="text-3xl font-bold text-sky-600 mb-4">Pop-tastic!</h2>
              <button 
                onClick={onComplete}
                className="w-full py-4 bg-sky-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-sky-600 transition"
              >
                Collect Reward! 🌳
              </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-cyan-400 via-blue-500 to-indigo-900 overflow-hidden flex flex-col">
      
      {/* Background Layer: Rising bubbles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
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
      </div>

      {/* Header with Pokemon Collection Bar */}
      <div className="relative z-50 p-4 bg-white/10 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <button onClick={onBack} className="bg-white/20 px-4 py-2 rounded-full hover:bg-white/40 transition text-white font-bold">
                    🔙 Home
                </button>
                <div className="flex items-center gap-2 text-white font-bold">
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png" alt="Squirtle" className="w-8 h-8 object-contain" />
                    <span>Level {currentIndex + 1}/{vocabList.length}</span>
                </div>
            </div>

            {/* Progress Bar (Bubbles instead of Shells) */}
            <div 
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto pb-4 pt-2 scrollbar-hide px-2 items-center"
            >
                {vocabList.map((_, idx) => (
                    <div key={idx} className="relative flex-shrink-0 w-16 h-16 flex items-center justify-center">
                        
                        {/* The Bubble Container */}
                        <div className={`
                            w-14 h-14 rounded-full border-2 border-white/40 shadow-inner flex items-center justify-center transition-all duration-500 relative
                            ${idx < currentIndex ? 'bg-blue-300/40' : 'bg-blue-900/30'}
                            ${idx === currentIndex ? 'scale-110 border-yellow-300 border-4 shadow-[0_0_15px_rgba(253,224,71,0.6)]' : ''}
                        `}>
                            {/* Shine effect */}
                            <div className="absolute top-2 right-3 w-3 h-2 bg-white/50 rounded-full rotate-[-45deg] blur-[1px]"></div>
                        </div>

                        {/* The Pokemon Reward (Appears if question answered) */}
                        {idx < currentIndex && (
                            <div className="absolute inset-0 animate-bounce p-1">
                                <img 
                                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${rewardPokemon[idx]}.png`} 
                                    alt="Reward"
                                    className="w-full h-full object-contain drop-shadow-md"
                                />
                            </div>
                        )}
                        
                        {/* Current Indicator (Question Mark) */}
                        {idx === currentIndex && (
                             <div className="absolute text-white/80 font-black text-2xl drop-shadow-md animate-pulse">?</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 relative z-40 flex flex-col items-center justify-center p-4">
          
          {/* Question Banner */}
          <div key={`q-${currentIndex}`} className="mb-8 text-center animate-bounce-slow">
              <div className="inline-block bg-blue-900/40 backdrop-blur-md px-10 py-5 rounded-3xl border border-cyan-300/30 shadow-[0_0_40px_rgba(0,255,255,0.2)]">
                 <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg mb-2">
                     {currentWord.cn}
                 </h2>
                 <p className="text-cyan-200 font-bold text-sm md:text-lg uppercase tracking-widest">Find the bubble!</p>
              </div>
          </div>

          {/* Bubbles Grid */}
          <div key={roundKey} className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12 w-full max-w-4xl">
             {bubbles.map((b, idx) => {
                 const isPopped = popped.has(b.en);
                 const delay = (idx * 0.5) % 2; 
                 const duration = 3 + (idx % 3);
                 
                 return (
                     <div key={b.en} className="flex items-center justify-center h-40 md:h-48">
                        {!isPopped ? (
                            <button
                                onClick={() => handleBubbleClick(b)}
                                className="relative group cursor-pointer transition-transform active:scale-95 touch-manipulation"
                                style={{
                                    animation: `bob ${duration}s ease-in-out infinite alternate ${delay}s`
                                }}
                            >
                                {/* Bubble Sphere */}
                                <div className="w-36 h-36 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-white/30 to-blue-500/30 backdrop-blur-sm border-2 border-white/50 shadow-lg flex flex-col items-center justify-center relative overflow-hidden group-hover:bg-blue-400/30 transition-colors">
                                    <div className="absolute top-4 right-6 w-8 h-5 bg-white/60 rounded-full rotate-[-45deg] blur-[2px]"></div>
                                    <div className="relative z-10 text-center px-2">
                                        <div className="text-2xl md:text-3xl font-black text-white drop-shadow-md leading-tight break-words max-w-[140px]">
                                            {b.en}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ) : (
                            <div className="w-36 h-36 flex items-center justify-center text-4xl animate-ping opacity-0">
                                💦
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
        @keyframes bob {
            0% { transform: translateY(0) rotate(-2deg); }
            100% { transform: translateY(-15px) rotate(2deg); }
        }
        @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};