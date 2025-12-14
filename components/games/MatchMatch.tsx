import React, { useState, useEffect } from 'react';
import { vocabList, WordItem } from '../../types';
import confetti from 'canvas-confetti';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

export const MatchMatch: React.FC<Props> = ({ onComplete, onBack }) => {
  const [round, setRound] = useState(0);
  
  const [currentPairs, setCurrentPairs] = useState<WordItem[]>([]);
  const [shuffledEn, setShuffledEn] = useState<WordItem[]>([]);
  const [shuffledCn, setShuffledCn] = useState<WordItem[]>([]);
  
  const [selectedEn, setSelectedEn] = useState<string | null>(null);
  const [selectedCn, setSelectedCn] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]); // Store english keys of matched pairs

  useEffect(() => {
    setupRound(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setupRound = (roundIdx: number) => {
    let items: WordItem[] = [];
    if (roundIdx < 4) {
        items = vocabList.slice(roundIdx * 5, (roundIdx + 1) * 5);
    } else {
        // Random 5 for last round
        items = [...vocabList].sort(() => Math.random() - 0.5).slice(0, 5);
    }
    
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
     // Find the corresponding english word for this CN to check logic
     const correspondingEn = currentPairs.find(p => p.cn === cn)?.en;
     if (!correspondingEn || matchedIds.includes(correspondingEn)) return;
     
     setSelectedCn(cn);
     checkMatch(selectedEn, cn);
  };

  const checkMatch = (en: string | null, cn: string | null) => {
    if (!en || !cn) return;

    const pair = currentPairs.find(p => p.en === en);
    if (pair && pair.cn === cn) {
      // Match!
      setMatchedIds(prev => [...prev, en]);
      setSelectedEn(null);
      setSelectedCn(null);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.5 }, colors: ['#a7f3d0', '#6ee7b7'] });
    } else {
      // No match, wait a bit then clear
      setTimeout(() => {
        setSelectedEn(null);
        setSelectedCn(null);
      }, 500);
    }
  };

  useEffect(() => {
    if (currentPairs.length > 0 && matchedIds.length === currentPairs.length) {
      setTimeout(() => {
        if (round < 4) {
           setRound(r => r + 1);
           setupRound(round + 1);
        } else {
           // All done
        }
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedIds]);

  if (round === 4 && matchedIds.length === 5) {
      return (
        <div className="min-h-screen bg-purple-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full">
          <div className="text-8xl mb-4">🧩</div>
          <h2 className="text-3xl font-bold text-purple-600 mb-4">Excellent!</h2>
          <p className="text-xl mb-8">You matched all pairs!</p>
          <button 
            onClick={onComplete}
            className="w-full py-4 bg-purple-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-purple-600 transition"
          >
            Collect Reward! 🌳
          </button>
        </div>
      </div>
      )
  }

  return (
    <div className="min-h-screen bg-purple-50 p-4">
      <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
        <button onClick={onBack} className="text-2xl">🔙</button>
        <div className="text-xl font-bold text-purple-500">Round {round + 1}/5</div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-2 gap-10">
         {/* Chinese Column */}
         <div className="space-y-6">
            <h3 className="text-center font-bold text-gray-400 mb-2 text-xl">Chinese</h3>
            {shuffledCn.map((item, idx) => {
                const isMatched = matchedIds.includes(item.en);
                const isSelected = selectedCn === item.cn;
                return (
                    <button
                        key={idx}
                        onClick={() => handleSelectCn(item.cn)}
                        disabled={isMatched}
                        className={`w-full p-6 rounded-2xl font-bold text-xl md:text-2xl shadow-sm border-2 transition-all
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

         {/* English Column */}
         <div className="space-y-6">
            <h3 className="text-center font-bold text-gray-400 mb-2 text-xl">English</h3>
            {shuffledEn.map((item, idx) => {
                const isMatched = matchedIds.includes(item.en);
                const isSelected = selectedEn === item.en;
                return (
                    <button
                        key={idx}
                        onClick={() => handleSelectEn(item.en)}
                        disabled={isMatched}
                        className={`w-full p-6 rounded-2xl font-bold text-xl md:text-2xl shadow-sm border-2 transition-all flex items-center justify-between
                            ${isMatched ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                            ${isSelected 
                                ? 'bg-indigo-200 border-indigo-400 text-indigo-800 scale-105' 
                                : 'bg-white border-indigo-100 text-gray-700 hover:bg-indigo-50'}
                        `}
                    >
                        <span>{item.en}</span>
                        <span className="text-3xl">{item.emoji}</span>
                    </button>
                )
            })}
         </div>
      </div>
    </div>
  );
};
