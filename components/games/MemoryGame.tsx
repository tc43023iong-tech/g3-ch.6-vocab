import React, { useState, useEffect, useMemo } from 'react';
import { vocabList, WordItem } from '../../types';
import confetti from 'canvas-confetti';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

type Phase = 'memo' | 'guess' | 'result';

export const MemoryGame: React.FC<Props> = ({ onComplete, onBack }) => {
  // Shuffle all 20 words to determine the order of target words for 20 levels
  const shuffledVocabOrder = useMemo(() => [...vocabList].sort(() => Math.random() - 0.5), []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('memo');
  const [timeLeft, setTimeLeft] = useState(10); // Increased to 10 seconds
  const [displayWords, setDisplayWords] = useState<WordItem[]>([]);
  const [optionWords, setOptionWords] = useState<WordItem[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const currentTarget = shuffledVocabOrder[currentIndex];

  useEffect(() => {
    if (currentIndex >= shuffledVocabOrder.length) return;
    
    // 1. Pick 9 distractors from the rest of the 19 words to show in the 10-word grid
    const restOfVocab = vocabList.filter(w => w.en !== currentTarget.en);
    const gridDistractors = [...restOfVocab].sort(() => Math.random() - 0.5).slice(0, 9);
    const gridSet = [...gridDistractors, currentTarget].sort(() => Math.random() - 0.5);
    
    // 2. Pick 3 "Selection Distractors" ONLY from words that are NOT in the current 10-word grid
    // This ensures that none of the still-visible words appear in the options list.
    const wordsNotInGrid = vocabList.filter(w => !gridSet.some(gw => gw.en === w.en));
    const selectionDistractors = [...wordsNotInGrid].sort(() => Math.random() - 0.5).slice(0, 3);
    const finalOptions = [...selectionDistractors, currentTarget].sort(() => Math.random() - 0.5);
    
    setDisplayWords(gridSet);
    setOptionWords(finalOptions);
    setPhase('memo');
    setTimeLeft(10); // Reset timer to 10s each level
    setSelectedWord(null);
  }, [currentIndex, currentTarget]);

  // Countdown timer logic
  useEffect(() => {
    let timer: number;
    if (phase === 'memo' && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (phase === 'memo' && timeLeft === 0) {
      setPhase('guess');
    }
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const handleGuess = (wordEn: string) => {
    if (phase !== 'guess') return;
    
    setSelectedWord(wordEn);
    setPhase('result');

    if (wordEn === currentTarget.en) {
      confetti({ 
        particleCount: 60, 
        spread: 80, 
        origin: { y: 0.6 }, 
        colors: ['#f0abfc', '#d946ef', '#ffffff'] 
      });
    }

    setTimeout(() => {
      if (currentIndex < shuffledVocabOrder.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 1800);
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-fuchsia-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full relative border-t-8 border-fuchsia-400">
          <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-32 h-32">
             <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png" alt="Mew" className="w-full h-full object-contain drop-shadow-lg" />
          </div>
          <div className="mt-8">
              <h2 className="text-4xl font-black text-fuchsia-600 mb-4">Memory Legend!</h2>
              <p className="text-xl mb-8 text-gray-600">Your memory is legendary! You found every single hidden word! 🧠✨</p>
              <button 
                onClick={onComplete}
                className="w-full py-4 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white rounded-2xl font-black text-xl shadow-lg hover:from-fuchsia-600 hover:to-pink-600 transition transform hover:scale-105"
              >
                Collect Reward! 🌳
              </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fuchsia-50 p-4 flex flex-col items-center font-sans overflow-x-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-10 left-10 text-4xl opacity-10 animate-pulse">✨</div>
      <div className="absolute bottom-20 right-10 text-4xl opacity-10 animate-bounce">🔮</div>
      
      {/* Header UI */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-6 z-10">
        <button onClick={onBack} className="text-xl bg-white/80 backdrop-blur-sm px-5 py-2 rounded-full shadow-md hover:bg-fuchsia-100 transition font-bold text-fuchsia-500 border border-fuchsia-100">
          🔙 Exit
        </button>
        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full border-2 border-fuchsia-200 shadow-sm">
             <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png" alt="Mew" className="w-10 h-10 object-contain" />
             <div className="text-xl font-black text-fuchsia-600">Level {currentIndex + 1} / 20</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl z-10">
        {/* Instruction Board */}
        <div className="text-center mb-8 w-full">
          {phase === 'memo' ? (
            <div className="inline-block bg-white/90 backdrop-blur-md px-8 py-4 rounded-3xl shadow-xl border-4 border-fuchsia-300">
              <h2 className="text-3xl md:text-4xl font-black text-fuchsia-600 mb-3 flex items-center justify-center gap-3">
                <span>🧐</span> Memorize these 10 words!
              </h2>
              <div className="flex justify-center items-center gap-3">
                 <div className="w-72 h-4 bg-gray-100 rounded-full overflow-hidden border-2 border-fuchsia-100">
                    <div 
                      className="h-full bg-gradient-to-r from-fuchsia-400 to-pink-500 transition-all duration-1000 ease-linear shadow-inner"
                      style={{ width: `${(timeLeft / 10) * 100}%` }}
                    />
                 </div>
                 <span className="font-black text-2xl text-fuchsia-500 tabular-nums">{timeLeft}s</span>
              </div>
            </div>
          ) : (
            <div className="animate-bounce">
              <h2 className="text-4xl md:text-5xl font-black text-fuchsia-600 drop-shadow-sm flex items-center justify-center gap-3">
                <span className="text-5xl">❓</span> Which one is missing?
              </h2>
              <p className="text-fuchsia-400 font-bold mt-2">I hid one from the grid... can you remember?</p>
            </div>
          )}
        </div>

        {/* Word Grid (2x5) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-5 mb-10 w-full">
          {displayWords.map((word, idx) => {
            const isMissingSpot = word.en === currentTarget.en;
            const isGuessing = phase === 'guess';
            const isResult = phase === 'result';
            
            return (
              <div 
                key={idx}
                className={`
                  aspect-[4/5] bg-white rounded-[2rem] shadow-lg flex flex-col items-center justify-center p-4 border-b-8 transition-all duration-500 transform
                  ${isGuessing && isMissingSpot ? 'bg-fuchsia-100 border-fuchsia-400 scale-110 shadow-[0_0_20px_rgba(217,70,239,0.3)] animate-pulse' : 'border-gray-100'}
                  ${isResult && isMissingSpot ? 'bg-green-50 border-green-500 scale-105 ring-4 ring-green-200' : ''}
                  ${isGuessing && !isMissingSpot ? 'opacity-90 grayscale-[0.2]' : ''}
                `}
              >
                {isGuessing && isMissingSpot ? (
                  <span className="text-8xl font-black text-fuchsia-500 drop-shadow-md">?</span>
                ) : (
                  <>
                    <div className={`text-6xl md:text-7xl mb-3 transition-transform ${phase === 'memo' ? 'scale-100' : 'scale-90 opacity-60'}`}>
                        {word.emoji}
                    </div>
                    <div className={`text-center font-black leading-tight break-words px-1 ${phase === 'memo' ? 'text-gray-700 text-lg md:text-xl' : 'text-gray-400 text-sm'}`}>
                        {word.en}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Choice Area (Don't show words that are still on the grid) */}
        {phase !== 'memo' && (
          <div className="w-full max-w-4xl bg-white/60 backdrop-blur-md p-8 rounded-[3rem] border-4 border-dashed border-fuchsia-300 shadow-inner">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {optionWords.map((word, idx) => {
                  const isCorrect = word.en === currentTarget.en;
                  const isWrongSelection = selectedWord === word.en && !isCorrect;
                  const isCorrectSelection = selectedWord === word.en && isCorrect;
                  
                  let btnStyle = "bg-white text-fuchsia-600 border-fuchsia-200 hover:border-fuchsia-400 hover:bg-fuchsia-50";
                  
                  if (phase === 'result') {
                      if (isCorrect) btnStyle = "bg-green-500 text-white border-green-700 scale-110 shadow-xl z-10";
                      else if (isWrongSelection) btnStyle = "bg-red-500 text-white border-red-700 opacity-50";
                      else btnStyle = "bg-gray-100 text-gray-400 border-gray-200 opacity-30";
                  }

                  return (
                    <button
                      key={`opt-${idx}`}
                      onClick={() => handleGuess(word.en)}
                      disabled={phase === 'result'}
                      className={`
                        relative group py-5 px-3 rounded-2xl font-black text-xl md:text-2xl shadow-md border-b-4 transition-all active:translate-y-1 active:border-b-0
                        ${btnStyle}
                        flex flex-col items-center justify-center gap-1
                      `}
                    >
                      <span className="text-sm opacity-60 mb-1 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Guess</span>
                      <span className="truncate w-full text-center">{word.en}</span>
                      
                      {isCorrectSelection && (
                          <span className="absolute -top-3 -right-3 bg-green-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl shadow-lg animate-bounce">
                              ✨
                          </span>
                      )}
                    </button>
                  );
                })}
             </div>
             <p className="text-center mt-6 text-fuchsia-500 font-black italic">
                 ✨ Hint: None of these 4 words are currently visible on the grid! ✨
             </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};
