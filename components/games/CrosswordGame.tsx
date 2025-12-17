import React, { useState, useEffect } from 'react';
import { vocabList } from '../../types';
import confetti from 'canvas-confetti';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

interface Slot {
    id: string; // word key
    word: string; // clean lowercase word
    hint: string;
    r: number;
    c: number;
    dir: 'H' | 'V';
}

const GRID_SIZE = 12;

export const CrosswordGame: React.FC<Props> = ({ onComplete, onBack }) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [grid, setGrid] = useState<string[][]>([]); // User filled grid
  const [solution, setSolution] = useState<string[][]>([]); // Solution grid
  const [selectedWordIndex, setSelectedWordIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
      startNewGame();
  }, []);

  const startNewGame = () => {
      // Try to generate a valid layout
      let attempts = 0;
      let validLayout: { slots: Slot[], solGrid: string[][] } | null = null;

      while(attempts < 50 && !validLayout) {
          const selection = [...vocabList].sort(() => Math.random() - 0.5).slice(0, 4);
          validLayout = generateLayout(selection);
          attempts++;
      }

      if (validLayout) {
          setSlots(validLayout.slots);
          setSolution(validLayout.solGrid);
          
          // Initialize user grid with '?' where words are, '' elsewhere
          const usrGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
          validLayout.slots.forEach(s => {
              for(let i=0; i<s.word.length; i++) {
                  const r = s.dir === 'H' ? s.r : s.r + i;
                  const c = s.dir === 'H' ? s.c + i : s.c;
                  usrGrid[r][c] = '?';
              }
          });
          setGrid(usrGrid);
          setSelectedWordIndex(0);
          setIsFinished(false);
      } else {
          // Fallback if generation fails (rare given simple words)
          startNewGame();
      }
  };

  const generateLayout = (words: typeof vocabList) => {
      const g = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
      const placed: Slot[] = [];

      // Sort by length desc to place longest first
      const sorted = [...words].sort((a, b) => b.en.length - a.en.length);
      
      // Place first word in center-ish
      const first = sorted[0];
      const cleanFirst = first.en.toLowerCase().replace(/[^a-z]/g, '');
      const startR = Math.floor(GRID_SIZE / 2);
      const startC = Math.floor((GRID_SIZE - cleanFirst.length) / 2);
      
      placeWord(g, cleanFirst, startR, startC, 'H');
      placed.push({ id: first.en, word: cleanFirst, hint: first.cn, r: startR, c: startC, dir: 'H' });

      // Try placing others
      for (let i = 1; i < sorted.length; i++) {
          const current = sorted[i];
          const clean = current.en.toLowerCase().replace(/[^a-z]/g, '');
          let isPlaced = false;

          // Try to intersect with any existing placed word
          for (const p of placed) {
              if (isPlaced) break;
              
              // Find common letter
              for (let j = 0; j < clean.length; j++) {
                 if (isPlaced) break;
                 const char = clean[j];
                 
                 for (let k = 0; k < p.word.length; k++) {
                     if (p.word[k] === char) {
                         // Potential intersection
                         // p is placed at p.r, p.c. Intersection is at...
                         const intersectR = p.dir === 'H' ? p.r : p.r + k;
                         const intersectC = p.dir === 'H' ? p.c + k : p.c;
                         
                         // Try placing current perpendicular
                         const newDir = p.dir === 'H' ? 'V' : 'H';
                         const newR = newDir === 'V' ? intersectR - j : intersectR;
                         const newC = newDir === 'H' ? intersectC - j : intersectC;

                         if (canPlace(g, clean, newR, newC, newDir)) {
                             placeWord(g, clean, newR, newC, newDir);
                             placed.push({ id: current.en, word: clean, hint: current.cn, r: newR, c: newC, dir: newDir });
                             isPlaced = true;
                         }
                     }
                 }
              }
          }
      }

      // We want all 4 to be placed. If not, this attempt failed (or we just allow <4 but it looks bad)
      if (placed.length === 4) {
          return { slots: placed, solGrid: g };
      }
      return null;
  };

  const canPlace = (g: string[][], w: string, r: number, c: number, dir: string) => {
      if (r < 0 || c < 0) return false;
      if (dir === 'H') {
          if (c + w.length > GRID_SIZE) return false;
          // Check surroundings (touching rule: words shouldn't touch parallel)
          // Simplified: just check if cells are empty or match
          for (let i = 0; i < w.length; i++) {
              if (g[r][c + i] !== '' && g[r][c + i] !== w[i]) return false;
              // Strict Check: Check neighbors to ensure we aren't creating accidental words
              // But for G3 app, simple intersection check is usually enough
          }
      } else {
          if (r + w.length > GRID_SIZE) return false;
          for (let i = 0; i < w.length; i++) {
              if (g[r + i][c] !== '' && g[r + i][c] !== w[i]) return false;
          }
      }
      return true;
  };

  const placeWord = (g: string[][], w: string, r: number, c: number, dir: string) => {
      for (let i = 0; i < w.length; i++) {
          if (dir === 'H') g[r][c + i] = w[i];
          else g[r + i][c] = w[i];
      }
  };

  const handleLetter = (char: string) => {
      const slot = slots[selectedWordIndex];
      const newGrid = [...grid.map(r => [...r])];
      let filled = false;
      
      // Auto-fill next empty spot in the active word
      for (let i = 0; i < slot.word.length; i++) {
          const r = slot.dir === 'H' ? slot.r : slot.r + i;
          const c = slot.dir === 'H' ? slot.c + i : slot.c;
          
          if (newGrid[r][c] === '?' || newGrid[r][c] === '') {
             newGrid[r][c] = char;
             filled = true;
             break;
          }
      }
      
      if (filled) {
        setGrid(newGrid);
        checkWin(newGrid);
      }
  };

  const checkWin = (g: string[][]) => {
      let complete = true;
      for(let r=0; r<GRID_SIZE; r++) {
          for(let c=0; c<GRID_SIZE; c++) {
              if (solution[r][c] !== '' && g[r][c] !== solution[r][c]) {
                  complete = false;
              }
          }
      }
      
      if (complete) {
          confetti({ particleCount: 50, spread: 70 });
          setTimeout(() => setIsFinished(true), 1000);
      }
  };

  const handleBackspace = () => {
      const slot = slots[selectedWordIndex];
      const newGrid = [...grid.map(r => [...r])];
      
      // Find last filled char in word and delete
      for (let i = slot.word.length - 1; i >= 0; i--) {
          const r = slot.dir === 'H' ? slot.r : slot.r + i;
          const c = slot.dir === 'H' ? slot.c + i : slot.c;
          
          if (newGrid[r][c] !== '?' && newGrid[r][c] !== '') {
              newGrid[r][c] = '?'; 
              break;
          }
      }
      setGrid(newGrid);
  };

  if (isFinished) {
      return (
        <div className="min-h-screen bg-orange-100 flex flex-col items-center justify-center p-4">
             <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full relative">
                 <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-32 h-32">
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png" alt="Psyduck" className="w-full h-full object-contain" />
                 </div>
                 <div className="mt-8">
                     <h2 className="text-3xl font-bold text-orange-600 mb-2">Solved!</h2>
                     <button onClick={onComplete} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-orange-600 transition">Collect Reward! 🌳</button>
                 </div>
             </div>
        </div>
      );
  }

  // Current Hint Logic
  const activeSlot = slots[selectedWordIndex];
  const hint = activeSlot ? activeSlot.hint : "";

  return (
    <div className="min-h-screen bg-orange-50 p-4 flex flex-col items-center">
        <div className="w-full max-w-lg flex justify-between items-center mb-4">
            <button onClick={onBack} className="bg-white px-4 py-2 rounded-full shadow text-orange-600 font-bold">Back</button>
            <h1 className="text-2xl font-black text-orange-600">Crossword</h1>
            <button onClick={startNewGame} className="bg-orange-200 px-3 py-1 rounded-full text-xs font-bold text-orange-800">New</button>
        </div>

        {/* Hint Area */}
        <div className="bg-white p-4 rounded-2xl shadow-md mb-4 w-full max-w-md text-center border-b-4 border-orange-200">
            <p className="text-gray-400 text-xs font-bold uppercase mb-1">Current Word Hint</p>
            <p className="text-2xl font-bold text-gray-800 animate-pulse">{hint}</p>
        </div>
        
        {/* Toggle Words */}
        <div className="flex gap-2 mb-4 overflow-x-auto w-full justify-center pb-2">
            {slots.map((s, i) => (
                <button 
                    key={i} 
                    onClick={() => setSelectedWordIndex(i)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg font-bold transition-colors ${selectedWordIndex === i ? 'bg-orange-500 text-white shadow-lg scale-105' : 'bg-white text-gray-500'}`}
                >
                    Word {i+1}
                </button>
            ))}
        </div>

        {/* Grid */}
        <div className="bg-white p-2 rounded-xl shadow-lg border-2 border-orange-200 mb-4 relative max-w-full overflow-x-auto">
            <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`, minWidth: '280px' }}>
                {grid.map((row, r) => (
                    row.map((cell, c) => {
                        const isSlot = cell !== ''; // '?' or char means slot
                        const isActiveWordCell = () => {
                            if (!activeSlot) return false;
                            const s = activeSlot;
                            if (s.dir === 'H') {
                                return r === s.r && c >= s.c && c < s.c + s.word.length;
                            } else {
                                return c === s.c && r >= s.r && r < s.r + s.word.length;
                            }
                        };
                        const active = isActiveWordCell();

                        return (
                            <div key={`${r}-${c}`} className={`
                                w-7 h-7 md:w-8 md:h-8 flex items-center justify-center font-bold text-lg rounded-sm
                                ${!isSlot ? 'bg-transparent' : 'bg-orange-50 border border-orange-200'}
                                ${active ? 'bg-yellow-100 border-yellow-400' : ''}
                            `}>
                                {cell !== '?' && cell !== '' ? cell : ''}
                            </div>
                        )
                    })
                ))}
            </div>
        </div>

        {/* Keyboard */}
        <div className="w-full max-w-lg select-none">
            <div className="flex flex-wrap justify-center gap-1">
                {['q','w','e','r','t','y','u','i','o','p'].map(k => (
                    <button key={k} onClick={() => handleLetter(k)} className="w-8 h-10 md:w-9 md:h-11 rounded bg-white font-bold text-lg text-gray-700 shadow-sm hover:bg-orange-100 active:bg-orange-200">{k}</button>
                ))}
            </div>
            <div className="flex flex-wrap justify-center gap-1 mt-1">
                <div className="w-2"></div>
                {['a','s','d','f','g','h','j','k','l'].map(k => (
                    <button key={k} onClick={() => handleLetter(k)} className="w-8 h-10 md:w-9 md:h-11 rounded bg-white font-bold text-lg text-gray-700 shadow-sm hover:bg-orange-100 active:bg-orange-200">{k}</button>
                ))}
            </div>
            <div className="flex flex-wrap justify-center gap-1 mt-1">
                <div className="w-4"></div>
                {['z','x','c','v','b','n','m'].map(k => (
                    <button key={k} onClick={() => handleLetter(k)} className="w-8 h-10 md:w-9 md:h-11 rounded bg-white font-bold text-lg text-gray-700 shadow-sm hover:bg-orange-100 active:bg-orange-200">{k}</button>
                ))}
                <button onClick={handleBackspace} className="w-12 h-10 md:w-14 md:h-11 rounded bg-red-400 text-white font-bold shadow-sm active:translate-y-1">Del</button>
            </div>
        </div>
    </div>
  );
};