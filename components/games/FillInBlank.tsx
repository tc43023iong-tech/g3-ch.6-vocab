import React, { useState, useMemo } from 'react';
import { vocabList, WordItem } from '../../types';
import confetti from 'canvas-confetti';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

export const FillInBlank: React.FC<Props> = ({ onComplete, onBack }) => {
  const shuffledVocab = useMemo(() => [...vocabList].sort(() => Math.random() - 0.5), []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const currentWord = shuffledVocab[currentIndex];

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
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#3b82f6'] });
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

  const getSentenceWithBlank = (item: WordItem) => {
      const regex = new RegExp(item.en, 'gi');
      return item.sentence.replace(regex, '_________');
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-cyan-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full relative">
          <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-32 h-32">
             <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/235.png" alt="Smeargle" className="w-full h-full object-contain" />
          </div>
          <div className="mt-8">
              <h2 className="text-3xl font-bold text-cyan-600 mb-4">Great Job!</h2>
              <p className="mb-6">Finished all {shuffledVocab.length} sentences.</p>
              <button 
                onClick={onComplete}
                className="w-full py-4 bg-cyan-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-cyan-600 transition"
              >
                Collect Reward! 🌳
              </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyan-50 p-4 flex flex-col items-center">
       <div className="w-full max-w-6xl flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-2xl bg-white p-2 rounded-full shadow-md">🔙</button>
        <div className="flex items-center gap-3">
             <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/235.png" alt="Smeargle" className="w-16 h-16 object-contain" />
             <div className="text-xl font-bold text-cyan-600">Question {currentIndex + 1}/{shuffledVocab.length}</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-6xl w-full">
        <div className="bg-white p-10 rounded-3xl shadow-xl mb-8 w-full text-center border-l-8 border-cyan-400">
           <p className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-4">Complete the sentence</p>
           
           <h2 className="text-3xl md:text-5xl font-black text-gray-800 mb-6 leading-relaxed">
             {getSentenceWithBlank(currentWord)}
           </h2>
           
           <div className="flex justify-center items-center gap-4">
               <span className="text-5xl">{currentWord.emoji}</span>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {currentOptions.map((opt, idx) => {
            let btnClass = "bg-white text-gray-700 hover:bg-cyan-50 border-2 border-transparent";
            
            if (selectedOption === opt.en) {
              btnClass = isCorrect 
                ? "bg-green-500 text-white border-green-600" 
                : "bg-red-500 text-white border-red-600";
            } else if (selectedOption && opt.en === currentWord.en) {
                btnClass = "bg-green-100 text-green-700 border-green-300";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(opt.en)}
                className={`w-full p-6 rounded-2xl font-bold text-2xl shadow-sm transition-all text-left flex justify-between items-center ${btnClass}`}
                disabled={selectedOption !== null}
              >
                <span>{opt.en}</span>
                {selectedOption === opt.en && isCorrect && <span>✅</span>}
                {selectedOption === opt.en && !isCorrect && <span>❌</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};