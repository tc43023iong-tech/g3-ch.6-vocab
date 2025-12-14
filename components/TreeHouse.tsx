import React from 'react';
import { furnitureList } from '../types';

interface TreeHouseProps {
  furnitureCount: number;
  onBack: () => void;
}

export const TreeHouse: React.FC<TreeHouseProps> = ({ furnitureCount, onBack }) => {
  const earnedFurniture = furnitureList.slice(0, furnitureCount);

  return (
    <div className="min-h-screen bg-green-100 p-4 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl p-6 border-4 border-yellow-400">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-pink-400 hover:bg-pink-500 text-white rounded-full font-bold shadow-md transition-all"
          >
            ⬅️ Back
          </button>
          <h1 className="text-3xl font-extrabold text-green-700 tracking-wider">
            🏡 My Tree House
          </h1>
          <div className="w-20"></div> {/* Spacer */}
        </div>

        <div className="relative bg-sky-200 rounded-3xl h-96 w-full border-b-8 border-green-600 overflow-hidden flex flex-col justify-end items-center shadow-inner">
          {/* Tree Trunk */}
          <div className="w-32 h-48 bg-amber-800 absolute bottom-0 z-0"></div>
          
          {/* Tree Top / House Base */}
          <div className="w-full h-64 bg-green-500 rounded-full absolute bottom-32 z-10 flex items-center justify-center">
             <div className="absolute top-10 text-white font-bold text-xl opacity-80">
                {earnedFurniture.length === 0 ? "Play games to get furniture!" : ""}
             </div>
          </div>

          {/* Furniture Grid Overlay on the Tree */}
          <div className="absolute inset-0 z-20 p-8 flex flex-wrap content-end justify-center gap-4 pointer-events-none">
            {earnedFurniture.map((item, index) => (
              <div key={index} className="text-4xl animate-bounce" style={{ animationDuration: `${2 + index % 3}s` }}>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
            <p className="text-gray-600 font-bold">You have collected {furnitureCount} items!</p>
            <div className="flex justify-center gap-2 mt-2 flex-wrap opacity-50">
               {furnitureList.map((f, i) => (
                   <span key={i} className={`grayscale ${i < furnitureCount ? 'hidden' : 'block'}`}>{f}</span>
               ))}
            </div>
        </div>
      </div>
    </div>
  );
};
