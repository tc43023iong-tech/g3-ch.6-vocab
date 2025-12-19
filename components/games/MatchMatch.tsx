import React, { useState, useEffect, useMemo } from 'react';
import { vocabList, WordItem } from '../../types';
import confetti from 'canvas-confetti';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

export const MatchMatch: React.FC<Props> = ({ onComplete, onBack }) => {
  const [round, setRound] = useState(0);
  const shuffledFullVocab = useMemo(() => [...vocabList].sort(() => Math.random() - 0.5), []);
  
  const [currentPairs, setCurrentPairs] = useState<WordItem[]>([]);
  const [shuffledEn, setShuffledEn] = useState<WordItem[]>([]);
  const [shuffledCn, setShuffledCn] = useState<WordItem[]>([]);
  
  const [selectedEn, setSelectedEn] = useState<string | null>(null);
  const [selectedCn, setSelectedCn] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);

  useEffect(() => {
    setupRound(0);
  }, []);

  const setupRound = (roundIdx: number) => {
    const start = roundIdx * 5;
    const items = shuffledFullVocab.slice(start, start + 5);
    
    setCurrentPairs(items);
    setShuffledEn([...items].sort(() => Math.random() - 0.5));
    setShuffledCn([...items].sort(() => Math.random() - 0.5));
    setMatchedIds([]);
    setSelectedEn(null);
    setSelectedCn(null);
  };

  const handleSelectEn = (en: string) => {
    if (matchedIds.includes(en)) return;
    setSelectedEn(en);
    checkMatch(en, selectedCn);
  };

  const handleSelectCn = (cn: string) => {
     const correspondingEn = currentPairs.find(p => p.cn === cn)?.en;
     if (!correspondingEn || matchedIds.includes(correspondingEn)) return;
     
     setSelectedCn(cn);
     checkMatch(selectedEn, cn);
  };

  const checkMatch = (en: string | null, cn: string | null) => {
    if (!en || !cn) return;

    const pair = currentPairs.find(p => p.en === en);
    if (pair && pair.cn === cn) {
      setMatchedIds(prev => [...prev, en]);
      setSelectedEn(null);
      setSelectedCn(null);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.5 }, colors: ['#a7f3d0', '#6ee7b7'] });
    } else {
      setTimeout(() => {
        setSelectedEn(null);
        setSelectedCn(null);
      }, 500);
    }
  };

  useEffect(() => {
    if (currentPairs.length > 0 && matchedIds.length === currentPairs.length) {
      setTimeout(() => {
        if (round < 3) { // 4 rounds of 5 = 20 words
           const nextRound = round + 1;
           setRound(nextRound);
           setupRound(nextRound);
        } else {
           // Win handled by round state in render
        }
      }, 1000);
    }
  }, [matchedIds]);

  if (round === 3 && matchedIds.length === 5) {
      return (
        <div className="min-h-screen bg-purple-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full relative">
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-32 h-32">
             <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/132.png" alt="Ditto" className="w-full h-full object-contain" />
          </div>
          <div className="mt-10">
              <h2 className="text-3xl font-bold text-purple-600 mb-4">Excellent!</h2>
              <p className="text-xl mb-8">You matched all 20 words!</p>
              <button 
                onClick={onComplete}
                className="w-full py-4 bg-purple-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-purple-600 transition"
              >
                Collect Reward! 🌳
              </button>
          </div>
        </div>
      </div>
      )
  }

  return (
    <div className="min-h-screen bg-purple-50 p-4">
      <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
        <button onClick={onBack} className="text-2xl bg-white p-2 rounded-full shadow-md">🔙</button>
        <div className="flex items-center gap-2">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/132.png" alt="Ditto" className="w-12 h-12 object-contain" />
            <div className="text-xl font-bold text-purple-500">Round {round + 1}/4</div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-2 gap-4 md:gap-10">
         <div className="space-y-4 md:space-y-6">
            <h3 className="text-center font-bold text-gray-400 mb-2 text-lg md:text-xl">Chinese</h3>
            {shuffledCn.map((item, idx) => {
                const isMatched = matchedIds.includes(item.en);
                const isSelected = selectedCn === item.cn;
                return (
                    <button
                        key={idx}
                        onClick={() => handleSelectCn(item.cn)}
                        disabled={isMatched}
                        className={`w-full p-4 md:p-6 rounded-2xl font-bold text-lg md:text-2xl shadow-sm border-2 transition-all
                            ${isMatched ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                            ${isSelected 
                                ? 'bg-purple-200 border-purple-400 text-purple-800 scale-105' 
                                : 'bg-white border-purple-100 text-gray-700 hover:bg-purple-50'}
                        `}
                    >
                        {item.cn}
                    </button>
                )
            })}
         </div>

         <div className="space-y-4 md:space-y-6">
            <h3 className="text-center font-bold text-gray-400 mb-2 text-lg md:text-xl">English</h3>
            {shuffledEn.map((item, idx) => {
                const isMatched = matchedIds.includes(item.en);
                const isSelected = selectedEn === item.en;
                return (
                    <button
                        key={idx}
                        onClick={() => handleSelectEn(item.en)}
                        disabled={isMatched}
                        className={`w-full p-4 md:p-6 rounded-2xl font-bold text-lg md:text-2xl shadow-sm border-2 transition-all flex items-center justify-between
                            ${isMatched ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                            ${isSelected 
                                ? 'bg-indigo-200 border-indigo-400 text-indigo-800 scale-105' 
                                : 'bg-white border-indigo-100 text-gray-700 hover:bg-indigo-50'}
                        `}
                    >
                        <span>{item.en}</span>
                        <span className="text-2xl md:text-3xl">{item.emoji}</span>
                    </button>
                )
            })}
         </div>
      </div>
    </div>
  );
};