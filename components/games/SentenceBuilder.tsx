import React, { useState, useEffect } from 'react';
import { vocabList } from '../../types';
import confetti from 'canvas-confetti';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

export const SentenceBuilder: React.FC<Props> = ({ onComplete, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambledWords, setScrambledWords] = useState<{id: number, text: string}[]>([]);
  const [userSentence, setUserSentence] = useState<{id: number, text: string}[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const currentItem = vocabList[currentIndex];
  // Simple check: remove punctuation for comparison if needed, but for now exact match
  const targetSentence = currentItem.sentence;

  useEffect(() => {
      // Split sentence into words
      // Remove punctuation for scrambling logic slightly to avoid "clothes." being stuck together
      // For simplicity in G3, we split by space.
      const words = targetSentence.split(' ');
      const mapped = words.map((w, i) => ({ id: i, text: w }));
      setScrambledWords([...mapped].sort(() => Math.random() - 0.5));
      setUserSentence([]);
      setIsCorrect(null);
  }, [currentIndex, targetSentence]);

  const handleWordClick = (word: {id: number, text: string}, from: 'pool' | 'user') => {
      if (from === 'pool') {
          setUserSentence([...userSentence, word]);
          setScrambledWords(scrambledWords.filter(w => w.id !== word.id));
      } else {
          setScrambledWords([...scrambledWords, word]);
          setUserSentence(userSentence.filter(w => w.id !== word.id));
      }
      setIsCorrect(null);
  };

  const checkSentence = () => {
      const currentString = userSentence.map(w => w.text).join(' ');
      if (currentString === targetSentence) {
          setIsCorrect(true);
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
          
          setTimeout(() => {
            if (currentIndex < vocabList.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                setIsFinished(true);
            }
          }, 1500);
      } else {
          setIsCorrect(false);
          // Shake effect could go here
      }
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-sky-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full relative">
          <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-32 h-32">
             <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/816.png" alt="Sobble" className="w-full h-full object-contain" />
          </div>
          <div className="mt-8">
              <h2 className="text-3xl font-bold text-sky-600 mb-4">Sentence Master!</h2>
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
    <div className="min-h-screen bg-sky-50 p-4 flex flex-col items-center">
      <div className="w-full max-w-2xl flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-xl bg-white px-4 py-2 rounded-full shadow-md font-bold text-sky-600">🔙 Back</button>
        <div className="flex items-center gap-2">
            <span className="text-3xl">{currentItem.emoji}</span>
            <span className="font-bold text-sky-700">Sentences: {currentIndex + 1}/{vocabList.length}</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-lg w-full max-w-2xl mb-8 border-b-8 border-sky-100 min-h-[200px] flex flex-col justify-between">
          <div className="text-center mb-6">
              <h2 className="text-xl text-gray-500 font-bold mb-2">Translate this:</h2>
              <p className="text-2xl md:text-3xl font-black text-gray-800">{currentItem.cn}</p>
          </div>

          {/* User Input Area */}
          <div className={`
            bg-sky-50 rounded-2xl p-4 min-h-[80px] flex flex-wrap gap-2 items-center justify-center border-2 transition-colors
            ${isCorrect === true ? 'border-green-400 bg-green-50' : ''}
            ${isCorrect === false ? 'border-red-400 bg-red-50' : 'border-sky-200'}
          `}>
              {userSentence.length === 0 && <span className="text-gray-400 italic">Tap words below...</span>}
              {userSentence.map(word => (
                  <button
                    key={word.id}
                    onClick={() => handleWordClick(word, 'user')}
                    className="bg-sky-500 text-white px-3 py-2 rounded-lg font-bold shadow-md hover:bg-red-400 transition"
                  >
                      {word.text}
                  </button>
              ))}
          </div>
      </div>

      {/* Word Pool */}
      <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
          {scrambledWords.map(word => (
              <button
                key={word.id}
                onClick={() => handleWordClick(word, 'pool')}
                className="bg-white text-sky-700 border-2 border-sky-200 px-4 py-3 rounded-xl font-bold shadow-sm hover:scale-105 hover:bg-sky-50 transition"
              >
                  {word.text}
              </button>
          ))}
      </div>

      <div className="flex-1"></div>

      <button
        onClick={checkSentence}
        disabled={scrambledWords.length > 0}
        className={`w-full max-w-sm py-4 rounded-2xl font-bold text-xl shadow-lg transition mb-8
            ${scrambledWords.length === 0 ? 'bg-green-500 text-white hover:bg-green-600 transform hover:scale-105' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
        `}
      >
          Check Sentence ✨
      </button>

    </div>
  );
};