import React from 'react';
import { vocabList } from '../types';

interface WordListProps {
  onBack: () => void;
}

export const WordList: React.FC<WordListProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 sticky top-0 bg-pink-50/95 p-4 z-10">
          <button 
            onClick={onBack}
            className="px-6 py-2 bg-indigo-500 text-white rounded-full font-bold shadow-lg hover:bg-indigo-600 transition"
          >
            🏠 Home
          </button>
          
          <div className="flex items-center gap-4">
             <h1 className="text-3xl md:text-4xl font-black text-indigo-600">
                Word List
             </h1>
             <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png" alt="Bulbasaur" className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {vocabList.map((item, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-3xl shadow-xl border-b-4 border-pink-300 hover:scale-105 transition-transform cursor-pointer group"
            >
              <div className="text-6xl mb-4 text-center group-hover:animate-bounce">{item.emoji}</div>
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">{item.en}</h2>
              <p className="text-center text-gray-400 text-sm font-mono mb-2">{item.ipa}</p>
              <div className="bg-yellow-100 text-yellow-800 text-center py-2 rounded-xl font-bold text-lg">
                {item.cn}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};