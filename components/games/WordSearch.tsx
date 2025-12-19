import React, { useState, useEffect, useMemo } from 'react';
import { vocabList } from '../../types';
import confetti from 'canvas-confetti';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

const GRID_SIZE = 10;

export const WordSearch: React.FC<Props> = ({ onComplete, onBack }) => {
  const shuffledFullVocab = useMemo(() => [...vocabList].sort(() => Math.random() - 0.5), []);
  const [round, setRound] = useState(0);
  const [grid, setGrid] = useState<string[][]>([]);
  const [wordsToFind, setWordsToFind] = useState<{word: string, found: boolean}[]>([]);
  const [selectedCells, setSelectedCells] = useState<{r: number, c: number}[]>([]);
  const [foundCells, setFoundCells] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    startRound(0);
  }, []);

  const startRound = (roundIdx: number) => {
    const startIdx = roundIdx * 5;
    const targets = shuffledFullVocab.slice(startIdx, startIdx + 5);

    const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
    const placedWords: {word: string, found: boolean}[] = [];

    targets.forEach(item => {
        const word = item.en.toLowerCase().replace(/[^a-z]/g, '');
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 100) {
            const dir = Math.random() > 0.5 ? 'H' : 'V';
            const r = Math.floor(Math.random() * GRID_SIZE);
            const c = Math.floor(Math.random() * GRID_SIZE);

            if (canPlace(newGrid, word, r, c, dir)) {
                place(newGrid, word, r, c, dir);
                placedWords.push({ word: item.en.toLowerCase(), found: false });
                placed = true;
            }
            attempts++;
        }
    });

    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    for(let i=0; i<GRID_SIZE; i++) {
        for(let j=0; j<GRID_SIZE; j++) {
            if(newGrid[i][j] === '') {
                newGrid[i][j] = alphabet[Math.floor(Math.random() * alphabet.length)];
            }
        }
    }

    setGrid(newGrid);
    setWordsToFind(placedWords);
    setFoundCells([]);
    setSelectedCells([]);
  };

  const canPlace = (g: string[][], w: string, r: number, c: number, dir: string) => {
      if (dir === 'H') {
          if (c + w.length > GRID_SIZE) return false;
          for (let i = 0; i < w.length; i++) {
              if (g[r][c + i] !== '' && g[r][c + i] !== w[i]) return false;
          }
      } else {
          if (r + w.length > GRID_SIZE) return false;
          for (let i = 0; i < w.length; i++) {
              if (g[r + i][c] !== '' && g[r + i][c] !== w[i]) return false;
          }
      }
      return true;
  };

  const place = (g: string[][], w: string, r: number, c: number, dir: string) => {
      if (dir === 'H') {
          for (let i = 0; i < w.length; i++) g[r][c + i] = w[i];
      } else {
          for (let i = 0; i < w.length; i++) g[r + i][c] = w[i];
      }
  };

  const handleCellClick = (r: number, c: number) => {
    if (selectedCells.length === 0) {
        setSelectedCells([{r, c}]);
    } else if (selectedCells.length === 1) {
        const start = selectedCells[0];
        const path = getPath(start.r, start.c, r, c);
        
        if (path) {
            checkWord(path);
        } else {
            setSelectedCells([{r, c}]); 
        }
    } else {
        setSelectedCells([{r, c}]); 
    }
  };

  const getPath = (r1: number, c1: number, r2: number, c2: number) => {
      const path = [];
      if (r1 === r2) {
          const start = Math.min(c1, c2);
          const end = Math.max(c1, c2);
          for(let i=start; i<=end; i++) path.push({r: r1, c: i});
      } else if (c1 === c2) {
          const start = Math.min(r1, r2);
          const end = Math.max(r1, r2);
          for(let i=start; i<=end; i++) path.push({r: i, c: c1});
      } else {
          return null; 
      }
      return path;
  };

  const checkWord = (path: {r: number, c: number}[]) => {
      const selectedString = path.map(p => grid[p.r][p.c]).join('');
      const reverseString = selectedString.split('').reverse().join('');
      
      const foundIndex = wordsToFind.findIndex(wf => {
          const cleanTarget = wf.word.replace(/[^a-z]/g, '');
          return !wf.found && (cleanTarget === selectedString || cleanTarget === reverseString);
      });

      if (foundIndex >= 0) {
          const newWords = [...wordsToFind];
          newWords[foundIndex].found = true;
          setWordsToFind(newWords);
          
          const newFound = [...foundCells];
          path.forEach(p => newFound.push(`${p.r}-${p.c}`));
          setFoundCells(newFound);
          
          confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });

          if (newWords.every(w => w.found)) {
              setTimeout(() => {
                  if (round < 3) {
                      const nextRound = round + 1;
                      setRound(nextRound);
                      startRound(nextRound);
                  } else {
                      setIsFinished(true);
                  }
              }, 1000);
          }
      }
      setSelectedCells([]);
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-emerald-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full relative">
          <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-32 h-32">
             <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/43.png" alt="Oddish" className="w-full h-full object-contain" />
          </div>
          <div className="mt-8">
              <h2 className="text-3xl font-bold text-emerald-600 mb-4">You found all 20!</h2>
              <button 
                onClick={onComplete}
                className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-emerald-600 transition"
              >
                Collect Reward! 🌳
              </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 p-4 flex flex-col items-center">
      <div className="w-full max-w-lg flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-xl bg-white px-4 py-2 rounded-full shadow-md font-bold text-emerald-600">🔙 Back</button>
        <h1 className="text-2xl font-black text-emerald-600 flex items-center gap-2">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/43.png" alt="Oddish" className="w-10 h-10" />
            Round {round + 1}/4
        </h1>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-xl w-full max-w-md mb-6 border-b-4 border-emerald-200">
          <div className="flex flex-wrap gap-2 justify-center">
              {wordsToFind.map((w, i) => (
                  <div key={i} className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${w.found ? 'bg-emerald-100 border-emerald-400 text-emerald-700 line-through opacity-50' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                      {w.word}
                  </div>
              ))}
          </div>
      </div>

      <div className="bg-white p-2 rounded-xl shadow-lg border-4 border-emerald-400 select-none touch-manipulation">
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
              {grid.map((row, r) => (
                  row.map((cell, c) => {
                      const isSelected = selectedCells.some(sc => sc.r === r && sc.c === c);
                      const isFound = foundCells.includes(`${r}-${c}`);
                      return (
                          <div 
                            key={`${r}-${c}`}
                            onClick={() => handleCellClick(r, c)}
                            className={`
                                w-8 h-8 md:w-9 md:h-9 flex items-center justify-center font-bold text-lg rounded-md cursor-pointer transition-colors lowercase
                                ${isSelected ? 'bg-orange-400 text-white transform scale-110' : ''}
                                ${isFound ? 'bg-emerald-400 text-white' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'}
                            `}
                          >
                              {cell}
                          </div>
                      )
                  })
              ))}
          </div>
      </div>
    </div>
  );
};