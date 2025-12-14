import React, { useState, useEffect } from 'react';
import { vocabList } from '../../types';
import confetti from 'canvas-confetti';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

export const SpellingBee: React.FC<Props> = ({ onComplete, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState<string[]>([]);
  const [scrambledLetters, setScrambledLetters] = useState<{char: string, id: number}[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  
  const currentWordObj = vocabList[currentIndex];
  // Remove spaces for easier checking, but keep them in display logic if needed. 
  const targetClean = currentWordObj.en.replace(/[^a-zA-Z]/g, '').toLowerCase();

  useEffect(() => {
    // Setup scrambled letters (this effect is kept for logical structure but we use pool state below)
    const letters = targetClean.split('').map((char, index) => ({ char, id: index }));
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    setScrambledLetters(shuffled);
    setUserInput([]);
  }, [currentIndex, targetClean]);

  // New State approach for drag/drop feel without drag/drop
  const [pool, setPool] = useState<{char: string, id: number}[]>([]);
  const [inputLine, setInputLine] = useState<{char: string, id: number}[]>([]);

  useEffect(() => {
      const letters = targetClean.split('').map((char, idx) => ({ char, id: Math.random() })); // Random ID to allow duplicates distinctness
      setPool([...letters].sort(() => Math.random() - 0.5));
      setInputLine([]);
  }, [currentIndex, targetClean]);

  const addToInput = (item: {char: string, id: number}) => {
      setInputLine([...inputLine, item]);
      setPool(pool.filter(i => i.id !== item.id));
  };

  const removeFromInput = (item: {char: string, id: number}) => {
      setInputLine(inputLine.filter(i => i.id !== item.id));
      setPool([...pool, item]);
  };

  useEffect(() => {
      // Check win condition
      const currentString = inputLine.map(i => i.char).join('');
      if (currentString === targetClean) {
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 }, colors: ['#fbbf24'] });
          setTimeout(() => {
              if (currentIndex < vocabList.length - 1) {
                  setCurrentIndex(prev => prev + 1);
              } else {
                  setIsFinished(true);
              }
          }, 1500);
      }
  }, [inputLine, targetClean, currentIndex]);

  if (isFinished) {
      return (
        <div className="min-h-screen bg-yellow-100 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full relative">
            <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-32 h-32">
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/415.png" alt="Combee" className="w-full h-full object-contain" />
            </div>
            <div className="mt-8">
                <h2 className="text-3xl font-bold text-yellow-600 mb-4">You are a Spelling Bee!</h2>
                <button 
                    onClick={onComplete}
                    className="w-full py-4 bg-yellow-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-yellow-600 transition"
                >
                    Collect Reward! 🌳
                </button>
            </div>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-yellow-50 p-4 flex flex-col items-center">
       <div className="w-full flex justify-between items-center mb-8 max-w-6xl">
        <button onClick={onBack} className="text-2xl bg-white p-2 rounded-full shadow-md">🔙</button>
        <div className="flex items-center gap-3">
             <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/415.png" alt="Combee" className="w-16 h-16 object-contain" />
             <div className="text-xl font-bold text-yellow-600">Word {currentIndex + 1}/{vocabList.length}</div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-5xl flex flex-col items-center min-h-[500px] justify-center relative border-b-8 border-yellow-200">
          <div className="text-9xl mb-6 animate-bounce">{currentWordObj.emoji}</div>
          <div className="text-3xl text-gray-500 font-bold mb-10">{currentWordObj.cn}</div>

          {/* Input Area */}
          <div className="flex flex-wrap gap-3 justify-center mb-10 min-h-[5rem] border-4 border-dashed border-yellow-300 w-full p-6 bg-yellow-50 rounded-2xl">
             {inputLine.map((item) => (
                 <button 
                    key={item.id}
                    onClick={() => removeFromInput(item)}
                    className="w-14 h-14 md:w-20 md:h-20 bg-yellow-400 text-white rounded-2xl text-3xl font-black shadow-md hover:bg-red-400 transition-colors flex items-center justify-center lowercase"
                 >
                     {item.char}
                 </button>
             ))}
             {inputLine.length === 0 && <span className="text-gray-400 italic mt-4 text-xl">Tap letters below to spell...</span>}
          </div>

          {/* Letter Pool */}
          <div className="flex flex-wrap gap-4 justify-center">
             {pool.map((item) => (
                 <button 
                    key={item.id}
                    onClick={() => addToInput(item)}
                    className="w-14 h-14 md:w-20 md:h-20 bg-white border-4 border-yellow-300 text-yellow-600 rounded-2xl text-3xl font-bold shadow-sm hover:scale-110 hover:bg-yellow-50 transition-all flex items-center justify-center lowercase"
                 >
                     {item.char}
                 </button>
             ))}
          </div>
      </div>
    </div>
  );
};