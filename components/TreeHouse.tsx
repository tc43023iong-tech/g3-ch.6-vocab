import React, { useState, useEffect } from 'react';
import { furnitureList, pokemonList } from '../types';

interface TreeHouseProps {
  furnitureCount: number;
  onBack: () => void;
}

type Tab = 'furniture' | 'pokemon';

interface PlacedItem {
    id: string; // "f-0" or "p-25"
    type: 'furniture' | 'pokemon';
    content: string | number; // emoji string or pokemon ID
    x: number;
    y: number;
    scale: number;
}

export const TreeHouse: React.FC<TreeHouseProps> = ({ furnitureCount, onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('furniture');
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);

  // Initialize with some random placement if empty, or just let user place them
  useEffect(() => {
     // Simple initialization: If we have unlocked items, place the first few automatically so it's not empty
     // Only run once on mount
     const initialItems: PlacedItem[] = [];
     
     // Add up to 3 unlocked furniture
     for(let i = 0; i < Math.min(furnitureCount, 3); i++) {
         initialItems.push({
             id: `f-${i}`,
             type: 'furniture',
             content: furnitureList[i],
             x: 20 + Math.random() * 60,
             y: 30 + Math.random() * 40,
             scale: 1
         });
     }

     // Add up to 2 unlocked pokemon
     for(let i = 0; i < Math.min(furnitureCount, 2); i++) {
        initialItems.push({
            id: `p-${pokemonList[i]}`,
            type: 'pokemon',
            content: pokemonList[i],
            x: 20 + Math.random() * 60,
            y: 30 + Math.random() * 40,
            scale: 1
        });
    }
    
    setPlacedItems(initialItems);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleItem = (type: 'furniture' | 'pokemon', index: number, content: string | number) => {
      const id = type === 'furniture' ? `f-${index}` : `p-${content}`;
      
      const exists = placedItems.find(p => p.id === id);
      
      if (exists) {
          // Remove
          setPlacedItems(prev => prev.filter(p => p.id !== id));
      } else {
          // Add with random position
          setPlacedItems(prev => [...prev, {
              id,
              type,
              content,
              x: 15 + Math.random() * 70, // Keep generally inside the treehouse area
              y: 20 + Math.random() * 50,
              scale: 0.8 + Math.random() * 0.4
          }]);
      }
  };

  const renderInventoryItem = (type: 'furniture' | 'pokemon', index: number, content: string | number) => {
      const isUnlocked = index < furnitureCount;
      const id = type === 'furniture' ? `f-${index}` : `p-${content}`;
      const isPlaced = placedItems.some(p => p.id === id);

      return (
          <button
            key={id}
            disabled={!isUnlocked}
            onClick={() => toggleItem(type, index, content)}
            className={`
                relative p-4 rounded-2xl flex items-center justify-center transition-all duration-300
                ${!isUnlocked ? 'bg-gray-100 opacity-50 cursor-not-allowed' : 'bg-white shadow-md hover:shadow-lg cursor-pointer hover:-translate-y-1'}
                ${isPlaced ? 'ring-4 ring-green-400 bg-green-50' : ''}
            `}
          >
              {type === 'furniture' ? (
                  <span className="text-4xl">{content}</span>
              ) : (
                  <img 
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${content}.png`} 
                    alt="Pokemon"
                    className="w-16 h-16 object-contain"
                  />
              )}

              {/* Status Indicators */}
              {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50 rounded-2xl">
                      <span className="text-2xl">🔒</span>
                  </div>
              )}
              {isPlaced && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      ✓
                  </div>
              )}
          </button>
      );
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col h-screen overflow-hidden">
      {/* Top Header */}
      <div className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-md shadow-sm z-50">
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-pink-500 text-white rounded-full font-bold shadow-md hover:bg-pink-600 transition"
          >
            🏠 Back
          </button>
          
          <div className="flex items-center gap-2">
             <h1 className="text-xl md:text-2xl font-black text-green-700">
                My Tree House
             </h1>
          </div>
          
          <div className="bg-yellow-100 px-4 py-1 rounded-full text-yellow-800 font-bold border-2 border-yellow-200">
             Level {furnitureCount}
          </div>
      </div>

      {/* Main Tree House Scene */}
      <div className="flex-1 relative bg-gradient-to-b from-sky-300 to-green-200 overflow-hidden flex justify-center items-end pb-8">
          
          {/* Clouds */}
          <div className="absolute top-10 left-10 text-6xl opacity-80 animate-pulse">☁️</div>
          <div className="absolute top-20 right-20 text-6xl opacity-60 animate-pulse" style={{ animationDelay: '1s'}}>☁️</div>

          {/* Tree Structure */}
          <div className="relative w-[90%] max-w-2xl aspect-[4/5] flex flex-col items-center">
               
               {/* Leaves/House Top */}
               <div className="w-[120%] h-[70%] bg-[#4ade80] rounded-[60px] relative shadow-2xl border-b-8 border-[#166534] z-10 flex flex-col items-center justify-center overflow-visible">
                   
                   {/* Wood planks pattern */}
                   <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
                   
                   {/* Placed Items Layer */}
                   {placedItems.map((item) => (
                       <div 
                         key={item.id}
                         className="absolute transition-all duration-500 ease-spring"
                         style={{
                             left: `${item.x}%`,
                             top: `${item.y}%`,
                             transform: `translate(-50%, -50%) scale(${item.scale})`,
                             zIndex: item.y > 50 ? 20 : 5 // Simple depth sorting
                         }}
                       >
                           {item.type === 'furniture' ? (
                               <span className="text-6xl drop-shadow-lg filter">{item.content}</span>
                           ) : (
                               <img 
                                 src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.content}.png`}
                                 alt="Pokemon"
                                 className="w-24 h-24 object-contain drop-shadow-xl animate-bounce"
                                 style={{ animationDuration: '3s' }}
                               />
                           )}
                       </div>
                   ))}

               </div>

               {/* Trunk */}
               <div className="w-[30%] h-[40%] bg-[#78350f] -mt-10 rounded-b-2xl relative shadow-inner z-0">
                   {/* Door */}
                   <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-24 bg-[#451a03] rounded-t-full border-4 border-[#92400e]"></div>
               </div>
          </div>
      </div>

      {/* Bottom Inventory Panel */}
      <div className="h-1/3 bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.1)] rounded-t-3xl flex flex-col z-50">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
              <button 
                onClick={() => setActiveTab('furniture')}
                className={`flex-1 py-4 font-black text-lg flex items-center justify-center gap-2 transition-colors ${activeTab === 'furniture' ? 'text-green-600 bg-green-50 border-b-4 border-green-500' : 'text-gray-400 hover:text-gray-600'}`}
              >
                  <span>🪑</span> Furniture
              </button>
              <button 
                onClick={() => setActiveTab('pokemon')}
                className={`flex-1 py-4 font-black text-lg flex items-center justify-center gap-2 transition-colors ${activeTab === 'pokemon' ? 'text-blue-600 bg-blue-50 border-b-4 border-blue-500' : 'text-gray-400 hover:text-gray-600'}`}
              >
                  <span>🐾</span> Pokemon
              </button>
          </div>

          {/* Grid Content */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {activeTab === 'furniture' ? (
                      furnitureList.map((item, idx) => renderInventoryItem('furniture', idx, item))
                  ) : (
                      pokemonList.map((id, idx) => renderInventoryItem('pokemon', idx, id))
                  )}
              </div>
              <div className="h-8"></div> {/* Bottom padding */}
          </div>
      </div>
      
      <style>{`
        .ease-spring {
            transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
};
