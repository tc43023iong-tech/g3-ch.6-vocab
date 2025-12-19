import React, { useState, useMemo } from 'react';
import { vocabList, WordItem } from '../../types';
import confetti from 'canvas-confetti';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

export const EmojiDetective: React.FC<Props> = ({ onComplete, onBack }) => {
  // Shuffle all words at start
  const shuffledVocab = useMemo(() => [...vocabList].sort(() => Math.random() - 0.5), []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const currentWord = shuffledVocab[currentIndex];

  // Generate options for the current word
  const currentOptions = useMemo(() => {
    const others = vocabList.filter(w => w.en !== currentWord.en);
    const distractors = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
    return [...distractors, currentWord].sort(() => Math.random() - 0.5);
  }, [currentIndex, currentWord]);

  const handleOptionClick = (word: string) => {
    if (selectedOption) return;

    setSelectedOption(word);
    const correct = word === currentWord.en;
    setIsCorrect(correct);

    if (correct) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      setScore(s => s + 1);
    }

    setTimeout(() => {
      if (currentIndex < shuffledVocab.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setIsFinished(true);
      }
    }, 1200);
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-blue-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full relative">
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-32 h-32">
             <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" alt="Pikachu" className="w-full h-full object-contain" />
          </div>
          <div className="mt-8">
              <h2 className="text-3xl font-bold text-blue-600 mb-4">Case Closed!</h2>
              <p className="text-xl mb-8">You mastered all {shuffledVocab.length} words!</p>
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

  return (
    <div className="min-h-screen bg-blue-50 p-4 flex flex-col items-center">
       <div className="w-full max-w-6xl flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-2xl bg-white p-2 rounded-full shadow-md">🔙</button>
        <div className="flex items-center gap-3">
             <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" alt="Pikachu" className="w-16 h-16 object-contain" />
             <div className="text-xl font-bold text-blue-400">Question {currentIndex + 1}/{shuffledVocab.length}</div>
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
               btnClass = "bg-green-100 text-green-700 ring-4 ring-green-200";
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