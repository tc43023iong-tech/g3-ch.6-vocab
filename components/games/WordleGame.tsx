import React, { useState, useEffect } from 'react';
import { vocabList } from '../../types';
import confetti from 'canvas-confetti';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

export const WordleGame: React.FC<Props> = ({ onComplete, onBack }) => {
  const [targetWord, setTargetWord] = useState('');
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

  // Helper to find extract simple words from the vocab list (since some are phrases)
  const getPlayableWords = () => {
     const words: string[] = [];
     vocabList.forEach(item => {
        // Break phrases into potential words, filter for length 4-6
        const parts = item.en.toLowerCase().split(/[\s-]+/);
        parts.forEach(p => {
            const clean = p.replace(/[^a-z]/g, '');
            if (clean.length >= 4 && clean.length <= 6) {
                words.push(clean.toUpperCase());
            }
        });
     });
     // Remove duplicates
     return [...new Set(words)];
  };

  useEffect(() => {
    const words = getPlayableWords();
    const random = words[Math.floor(Math.random() * words.length)];
    setTargetWord(random);
  }, []);

  const handleKey = (key: string) => {
      if (gameState !== 'playing') return;

      if (key === 'ENTER') {
          if (currentGuess.length !== targetWord.length) return; // Must be full length
          const newGuesses = [...guesses, currentGuess];
          setGuesses(newGuesses);
          
          if (currentGuess === targetWord) {
              setGameState('won');
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          } else if (newGuesses.length >= 6) {
              setGameState('lost');
          }
          setCurrentGuess('');
      } else if (key === 'BACK') {
          setCurrentGuess(prev => prev.slice(0, -1));
      } else {
          if (currentGuess.length < targetWord.length) {
              setCurrentGuess(prev => prev + key);
          }
      }
  };

  const getLetterStatus = (letter: string, index: number, word: string) => {
      const correctChar = targetWord[index];
      if (letter === correctChar) return 'bg-green-500 text-white border-green-600';
      if (targetWord.includes(letter)) return 'bg-yellow-400 text-white border-yellow-500';
      return 'bg-gray-400 text-white border-gray-500';
  };
  
  // Keyboard logic
  const getKeyStatus = (key: string) => {
      let status = 'bg-white text-gray-700';
      for (const guess of guesses) {
          for (let i = 0; i < guess.length; i++) {
              if (guess[i] === key) {
                  if (targetWord[i] === key) return 'bg-green-500 text-white';
                  if (targetWord.includes(key) && status !== 'bg-green-500 text-white') status = 'bg-yellow-400 text-white';
                  if (!targetWord.includes(key) && status === 'bg-white text-gray-700') status = 'bg-gray-300 text-gray-500';
              }
          }
      }
      return status;
  };

  if (gameState !== 'playing') {
      return (
        <div className="min-h-screen bg-lime-100 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full relative">
                <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-32 h-32">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${gameState === 'won' ? 154 : 54}.png`} alt="Pokemon" className="w-full h-full object-contain" />
                </div>
                <div className="mt-8">
                    <h2 className="text-3xl font-bold text-lime-600 mb-2">{gameState === 'won' ? 'Fantastic!' : 'Nice Try!'}</h2>
                    <p className="text-gray-500 mb-6 text-lg">The word was: <span className="font-black text-black">{targetWord}</span></p>
                    
                    {gameState === 'won' ? (
                        <button onClick={onComplete} className="w-full py-4 bg-lime-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-lime-600 transition">Collect Reward! 🌳</button>
                    ) : (
                        <button onClick={onBack} className="w-full py-4 bg-gray-400 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-gray-500 transition">Back to Home</button>
                    )}
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-lime-50 flex flex-col items-center p-2">
        <div className="w-full max-w-md flex justify-between items-center mb-4 mt-2">
            <button onClick={onBack} className="bg-white px-3 py-1 rounded-full shadow text-sm font-bold">Back</button>
            <h1 className="text-xl font-black text-lime-700">Word Guess</h1>
            <div className="w-10"></div>
        </div>

        {/* Grid */}
        <div className="flex-1 flex flex-col justify-center gap-2 mb-4">
            {[...Array(6)].map((_, rIndex) => {
                const guess = guesses[rIndex] || (rIndex === guesses.length ? currentGuess : '');
                return (
                    <div key={rIndex} className="flex gap-2 justify-center">
                        {[...Array(targetWord.length || 5)].map((_, cIndex) => {
                            const char = guess[cIndex] || '';
                            let style = 'bg-white border-2 border-lime-200 text-black';
                            if (guesses[rIndex]) {
                                style = getLetterStatus(char, cIndex, guess);
                            } else if (char) {
                                style = 'bg-white border-2 border-gray-400 text-black animate-bounce';
                            }
                            return (
                                <div key={cIndex} className={`w-10 h-10 md:w-14 md:h-14 rounded-lg flex items-center justify-center text-2xl font-bold uppercase shadow-sm ${style}`}>
                                    {char}
                                </div>
                            )
                        })}
                    </div>
                )
            })}
        </div>

        {/* Keyboard */}
        <div className="w-full max-w-lg mb-4">
            <div className="flex flex-wrap justify-center gap-1">
                {['Q','W','E','R','T','Y','U','I','O','P'].map(k => (
                    <button key={k} onClick={() => handleKey(k)} className={`w-8 h-10 md:w-10 md:h-12 rounded font-bold text-sm shadow-sm ${getKeyStatus(k)}`}>{k}</button>
                ))}
            </div>
            <div className="flex flex-wrap justify-center gap-1 mt-1">
                {['A','S','D','F','G','H','J','K','L'].map(k => (
                    <button key={k} onClick={() => handleKey(k)} className={`w-8 h-10 md:w-10 md:h-12 rounded font-bold text-sm shadow-sm ${getKeyStatus(k)}`}>{k}</button>
                ))}
            </div>
            <div className="flex flex-wrap justify-center gap-1 mt-1">
                <button onClick={() => handleKey('ENTER')} className="w-14 h-10 md:w-16 md:h-12 rounded bg-lime-500 text-white font-bold text-xs shadow-sm">ENTER</button>
                {['Z','X','C','V','B','N','M'].map(k => (
                    <button key={k} onClick={() => handleKey(k)} className={`w-8 h-10 md:w-10 md:h-12 rounded font-bold text-sm shadow-sm ${getKeyStatus(k)}`}>{k}</button>
                ))}
                <button onClick={() => handleKey('BACK')} className="w-10 h-10 md:w-12 md:h-12 rounded bg-red-400 text-white font-bold text-xs shadow-sm">⌫</button>
            </div>
        </div>
    </div>
  );
};