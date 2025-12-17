import React, { useState, useEffect } from 'react';
import { vocabList } from '../../types';
import confetti from 'canvas-confetti';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

export const HangmanGame: React.FC<Props> = ({ onComplete, onBack }) => {
  const [wordItem, setWordItem] = useState(vocabList[0]);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [gameResult, setGameResult] = useState<'playing' | 'won' | 'lost'>('playing');

  const MAX_WRONG = 6;

  useEffect(() => {
    // Pick random word
    setWordItem(vocabList[Math.floor(Math.random() * vocabList.length)]);
    setGuessedLetters(new Set());
    setWrongCount(0);
    setGameResult('playing');
  }, []);

  const handleGuess = (char: string) => {
    if (gameResult !== 'playing' || guessedLetters.has(char)) return;

    const newGuessed = new Set(guessedLetters).add(char);
    setGuessedLetters(newGuessed);

    // Check if letter in word
    const lowerWord = wordItem.en.toLowerCase();
    if (!lowerWord.includes(char.toLowerCase())) {
        const newWrong = wrongCount + 1;
        setWrongCount(newWrong);
        if (newWrong >= MAX_WRONG) {
            setGameResult('lost');
        }
    } else {
        // Check win
        const cleanWord = lowerWord.replace(/[^a-z]/g, '');
        const allGuessed = cleanWord.split('').every(c => newGuessed.has(c.toUpperCase()));
        if (allGuessed) {
            setGameResult('won');
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        }
    }
  };

  // The alphabet
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

  if (gameResult !== 'playing') {
      return (
        <div className="min-h-screen bg-rose-100 flex flex-col items-center justify-center p-4">
             <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full relative">
                <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-32 h-32">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${gameResult === 'won' ? 3 : 4}.png`} alt="Pokemon" className="w-full h-full object-contain" />
                </div>
                <div className="mt-8">
                    <h2 className="text-3xl font-bold text-rose-600 mb-2">{gameResult === 'won' ? 'You Saved It!' : 'Oh no!'}</h2>
                    <p className="text-gray-600 mb-2">The phrase was:</p>
                    <p className="text-xl font-black text-rose-500 mb-6">{wordItem.en}</p>
                    {gameResult === 'won' ? (
                        <button onClick={onComplete} className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-rose-600 transition">Collect Reward! 🌳</button>
                    ) : (
                        <button onClick={onBack} className="w-full py-4 bg-gray-400 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-gray-500 transition">Back to Home</button>
                    )}
                </div>
             </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-rose-50 flex flex-col items-center p-4">
        {/* Header */}
        <div className="w-full max-w-lg flex justify-between items-center mb-6">
            <button onClick={onBack} className="bg-white px-4 py-2 rounded-full shadow text-rose-600 font-bold">Back</button>
            <h1 className="text-2xl font-black text-rose-600">Petal Rescue</h1>
            <div className="w-16 text-right font-bold text-rose-400">{MAX_WRONG - wrongCount} ❤️</div>
        </div>

        {/* Visual: Flower */}
        <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
             <div className="w-16 h-16 bg-yellow-400 rounded-full border-4 border-yellow-500 relative z-20 flex items-center justify-center text-3xl">😊</div>
             {/* Petals that disappear */}
             {[...Array(6)].map((_, i) => (
                 <div key={i} 
                      className={`absolute w-12 h-12 bg-pink-400 rounded-full border-2 border-pink-500 transition-opacity duration-500 ${i < (MAX_WRONG - wrongCount) ? 'opacity-100' : 'opacity-0 scale-50'}`}
                      style={{
                          transform: `rotate(${i * 60}deg) translate(50px)`,
                          zIndex: 10
                      }}
                 ></div>
             ))}
             {/* Stem */}
             <div className="absolute top-[80px] w-4 h-20 bg-green-500 rounded-full -z-10"></div>
        </div>

        {/* Word Display */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 text-center w-full max-w-lg">
             <p className="text-gray-400 font-bold mb-2 uppercase tracking-widest text-xs">Category: {wordItem.cn}</p>
             <div className="flex flex-wrap justify-center gap-2">
                 {wordItem.en.split('').map((char, idx) => {
                     const isSpace = char === ' ';
                     const isGuessed = guessedLetters.has(char.toUpperCase());
                     return (
                         <div key={idx} className={`
                            w-8 h-10 border-b-4 flex items-end justify-center text-2xl font-bold
                            ${isSpace ? 'border-transparent w-4' : 'border-rose-300'}
                         `}>
                             {isSpace ? '' : (isGuessed ? char : '')}
                         </div>
                     );
                 })}
             </div>
        </div>

        {/* Keyboard */}
        <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
            {alphabet.map(letter => {
                const isGuessed = guessedLetters.has(letter);
                return (
                    <button
                        key={letter}
                        onClick={() => handleGuess(letter)}
                        disabled={isGuessed}
                        className={`w-10 h-12 rounded-lg font-bold text-lg shadow-sm transition-all
                             ${isGuessed ? 'bg-gray-200 text-gray-400 opacity-50' : 'bg-white text-rose-600 hover:bg-rose-100 border-b-4 border-rose-200 hover:border-rose-300 active:border-b-0 active:translate-y-1'}
                        `}
                    >
                        {letter}
                    </button>
                )
            })}
        </div>
    </div>
  );
};