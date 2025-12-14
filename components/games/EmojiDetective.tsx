import React, { useState } from 'react';
import { vocabList, WordItem } from '../../types';
import confetti from 'canvas-confetti';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

export const EmojiDetective: React.FC<Props> = ({ onComplete, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Shuffle array utility
  const shuffle = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const currentWord = vocabList[currentIndex];

  // Generate 4 options including the correct one
  const [options] = useState(() => {
    // We need to generate options for ALL words at start to avoid re-gen on render
    return vocabList.map(target => {
        const others = vocabList.filter(w => w.en !== target.en);
        const distractors = shuffle(others).slice(0, 3);
        return shuffle([target, ...distractors]);
    });
  });

  const handleOptionClick = (word: string) => {
    if (selectedOption) return; // Prevent double click

    setSelectedOption(word);
    const correct = word === currentWord.en;
    setIsCorrect(correct);

    if (correct) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      setScore(s => s + 1);
    }

    setTimeout(() => {
      if (currentIndex < vocabList.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setIsFinished(true);
      }
    }, 1500);
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-blue-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full relative overflow-visible">
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-32 h-32">
             <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" alt="Pikachu" className="w-full h-full object-contain" />
          </div>
          <div className="mt-8">
              <h2 className="text-3xl font-bold text-blue-600 mb-4">Case Closed!</h2>
              <p className="text-xl mb-8">Score: {score} / {vocabList.length}</p>
              <button 
                onClick={onComplete}
                className="w-full py-4 bg-green-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-green-600 transition"
              >
                Collect Reward! 🌳
              </button>
          </div>
        </div>
      </div>
    );
  }

  const currentOptions = options[currentIndex];

  return (
    <div className="min-h-screen bg-blue-50 p-4 flex flex-col items-center">
       <div className="w-full max-w-6xl flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-2xl bg-white p-2 rounded-full shadow-md">🔙</button>
        <div className="flex items-center gap-3">
             <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" alt="Pikachu" className="w-16 h-16 object-contain" />
             <div className="text-xl font-bold text-blue-400">Question {currentIndex + 1}/{vocabList.length}</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-6xl w-full">
        <div className="bg-white p-12 rounded-full shadow-xl mb-8 w-48 h-48 flex items-center justify-center border-4 border-blue-200">
          <span className="text-8xl animate-pulse">{currentWord.emoji}</span>
        </div>
        
        <div className="bg-blue-100 px-8 py-3 rounded-full mb-10 text-blue-800 font-bold text-2xl shadow-sm border border-blue-200">
            Hint: {currentWord.cn}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {currentOptions.map((opt, idx) => {
            let btnClass = "bg-white text-gray-700 hover:bg-blue-50";
            if (selectedOption === opt.en) {
              btnClass = isCorrect ? "bg-green-500 text-white ring-4 ring-green-200" : "bg-red-500 text-white ring-4 ring-red-200";
            } else if (selectedOption && opt.en === currentWord.en) {
               btnClass = "bg-green-100 text-green-700 ring-4 ring-green-200"; // Show correct answer if wrong
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(opt.en)}
                className={`p-8 rounded-3xl font-bold text-2xl shadow-md transition-all transform hover:-translate-y-1 ${btnClass}`}
                disabled={selectedOption !== null}
              >
                {opt.en}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};