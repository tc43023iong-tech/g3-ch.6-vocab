import React, { useState, useEffect, useRef } from 'react';
import { vocabList } from '../../types';
import confetti from 'canvas-confetti';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

interface Item {
    id: number;
    word: string;
    isCorrect: boolean;
    x: number; // Percentage 0-100
    y: number; // Percentage 20-90
    size: number; // radius in px approx
    visible: boolean;
    rotation: number;
}

export const GoldMinerGame: React.FC<Props> = ({ onComplete, onBack }) => {
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'win'>('intro');
  const [items, setItems] = useState<Item[]>([]);
  
  // Game Loop Refs
  const hookRef = useRef({ 
      angle: 0, 
      length: 10, 
      status: 'swing' as 'swing' | 'shoot' | 'return',
      speed: 1,
      direction: 1, // 1 or -1 for swing
      caughtItemId: -1 as number
  });
  const requestRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Constants
  const MIN_ANGLE = -70;
  const MAX_ANGLE = 70;
  const SWING_SPEED = 0.8;
  const SHOOT_SPEED = 1.5;
  const RETURN_SPEED_FAST = 2.0;
  const RETURN_SPEED_SLOW = 0.5;
  const MAX_LENGTH = 100; // Percent

  const currentTarget = vocabList[level];

  // Initialize Level
  useEffect(() => {
      if (gameState === 'playing') {
          setupLevel();
          requestRef.current = requestAnimationFrame(gameLoop);
      }
      return () => cancelAnimationFrame(requestRef.current!);
  }, [gameState, level]);

  const setupLevel = () => {
      const newItems: Item[] = [];
      const distractors = vocabList.filter(v => v.en !== currentTarget.en)
                                   .sort(() => Math.random() - 0.5)
                                   .slice(0, 4);
      
      const pool = [
          { word: currentTarget.en, isCorrect: true },
          ...distractors.map(d => ({ word: d.en, isCorrect: false }))
      ].sort(() => Math.random() - 0.5);

      pool.forEach((obj, idx) => {
          // Simple grid-ish placement to avoid overlap
          // 2 rows, 3 cols logic-ish
          const row = Math.floor(idx / 3);
          const col = idx % 3;
          
          const x = 15 + (col * 30) + (Math.random() * 10 - 5);
          const y = 35 + (row * 25) + (Math.random() * 10 - 5);

          newItems.push({
              id: idx,
              word: obj.word,
              isCorrect: obj.isCorrect,
              x,
              y,
              size: obj.isCorrect ? 35 : 30, // Visual size
              visible: true,
              rotation: Math.random() * 20 - 10
          });
      });

      setItems(newItems);
      hookRef.current = { 
          angle: 0, 
          length: 10, 
          status: 'swing', 
          speed: SWING_SPEED, 
          direction: 1,
          caughtItemId: -1
      };
  };

  const gameLoop = () => {
      const hook = hookRef.current;

      if (hook.status === 'swing') {
          hook.angle += hook.speed * hook.direction;
          if (hook.angle > MAX_ANGLE) {
              hook.angle = MAX_ANGLE;
              hook.direction = -1;
          } else if (hook.angle < MIN_ANGLE) {
              hook.angle = MIN_ANGLE;
              hook.direction = 1;
          }
      } else if (hook.status === 'shoot') {
          hook.length += SHOOT_SPEED;
          
          // Check collision
          // Hook tip coordinates in percentage (approx)
          // Origin is 50% X, 15% Y (adjusted for CSS top)
          const radian = (hook.angle * Math.PI) / 180;
          const tipX = 50 + Math.sin(radian) * hook.length * 0.7; // 0.7 aspect ratio adjustment roughly
          const tipY = 15 + Math.cos(radian) * hook.length;

          // Check against items
          // We need to access the current items state. 
          // Since we are in a ref loop, we can't easily see state updates unless we use a ref for items too.
          // For simplicity in this structure, we will do a trick: pass itemsSetter to loop or check DOM?
          // Let's use the functional update pattern logic inside the loop? No.
          // Let's rely on the fact that `items` doesn't change position, only visibility.
          // We can use a Ref for items to track them in the loop.
      } else if (hook.status === 'return') {
          // Logic handled below with setItemsRef logic
      }
      
      // Since we need collision with stateful items, let's move the update logic to a function 
      // that we can call with current state if we used `useRef` for items, 
      // OR we just forceUpdate/render frame.
      // Better: Move items to Ref for physics, sync to State for render.
      
      updatePhysics();
      requestRef.current = requestAnimationFrame(gameLoop);
  };
  
  // We need a ref to hold items for the animation loop to access latest positions without re-binding
  const itemsRef = useRef<Item[]>([]);
  useEffect(() => { itemsRef.current = items; }, [items]);

  const updatePhysics = () => {
      const hook = hookRef.current;
      const items = itemsRef.current;

      if (hook.status === 'shoot') {
          // Boundary check
          if (hook.length > MAX_LENGTH) {
              hook.status = 'return';
          } else {
              // Collision Check
              const radian = (hook.angle * Math.PI) / 180;
              // Conversion factor: simplified since we work in percentages.
              // Hook origin (50, 15). 
              // Length is % of height approx.
              // We need to be careful with aspect ratios. 
              // Let's use simple logic: if distance < threshold.
              // We assume a square-ish aspect for calculation or adjust X.
              
              const tipX = 50 + Math.sin(radian) * hook.length; // Raw % 
              const tipY = 15 + Math.cos(radian) * hook.length; // Raw %

              for (let i = 0; i < items.length; i++) {
                  const item = items[i];
                  if (!item.visible) continue;

                  // Distance Check
                  // Adjust X difference by roughly 0.6 to account for screen width > height usually on mobile landscape
                  // On portrait it's different.
                  // Let's just allow a generous hitbox.
                  const dx = Math.abs(tipX - item.x);
                  const dy = Math.abs(tipY - item.y);
                  
                  if (dx < 6 && dy < 6) { // Hit!
                      hook.status = 'return';
                      hook.caughtItemId = item.id;
                      // Don't hide item yet, drag it back
                      break;
                  }
              }
          }
      } else if (hook.status === 'return') {
          let speed = RETURN_SPEED_FAST;
          if (hook.caughtItemId !== -1) {
              const caught = items.find(i => i.id === hook.caughtItemId);
              if (caught && !caught.isCorrect) speed = RETURN_SPEED_SLOW;
          }

          hook.length -= speed;
          
          if (hook.length <= 10) {
              hook.length = 10;
              hook.status = 'swing';
              
              // Process Catch
              if (hook.caughtItemId !== -1) {
                  const caught = items.find(i => i.id === hook.caughtItemId);
                  if (caught) {
                      // Remove item
                      setItems(prev => prev.map(i => i.id === hook.caughtItemId ? {...i, visible: false} : i));
                      
                      if (caught.isCorrect) {
                          handleCorrect();
                      } else {
                          // Wrong item
                      }
                  }
                  hook.caughtItemId = -1;
              }
          }
      }

      // Force re-render of hook (we can optimize by only updating style via ref, but this is React)
      // To avoid full React render every frame (60fps), let's update DOM directly.
      if (containerRef.current) {
          const hookEl = document.getElementById('hook-line');
          if (hookEl) {
             hookEl.style.transform = `rotate(${hook.angle}deg)`;
             hookEl.style.height = `${hook.length}%`;
          }
          
          const caughtEl = document.getElementById('caught-item');
          if (hook.caughtItemId !== -1 && caughtEl) {
              caughtEl.style.display = 'flex';
              // Update caught item content
              const item = items.find(i => i.id === hook.caughtItemId);
              if(item) {
                  caughtEl.innerText = item.word;
                  caughtEl.className = `absolute bottom-0 -translate-x-1/2 translate-y-full w-20 h-16 rounded-xl border-2 flex items-center justify-center text-xs font-bold shadow-lg ${item.isCorrect ? 'bg-yellow-400 border-yellow-600 text-yellow-900' : 'bg-gray-400 border-gray-600 text-gray-800'}`;
              }
          } else if (caughtEl) {
              caughtEl.style.display = 'none';
          }
      }
  };

  const handleCorrect = () => {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.2 } });
      setScore(s => s + 1);
      setTimeout(() => {
          if (level < vocabList.length - 1) {
              setLevel(l => l + 1);
          } else {
              setGameState('win');
          }
      }, 1000);
  };

  const handleTouch = () => {
      if (hookRef.current.status === 'swing') {
          hookRef.current.status = 'shoot';
      }
  };

  if (gameState === 'intro') {
      return (
        <div className="min-h-screen bg-amber-100 flex flex-col items-center justify-center p-4">
             <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full relative">
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png" alt="Meowth" className="w-32 h-32 mx-auto mb-4 animate-bounce" />
                <h1 className="text-3xl font-black text-amber-600 mb-4">Gold Miner</h1>
                <p className="mb-6 text-gray-600">
                    Tap to launch the hook!<br/>
                    Catch the <b>correct English word</b> for the gold mine.
                </p>
                <button 
                    onClick={() => setGameState('playing')}
                    className="w-full py-4 bg-amber-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-amber-600 transition"
                >
                    Start Mining! ⛏️
                </button>
                <button onClick={onBack} className="mt-4 text-gray-400 font-bold">Back</button>
             </div>
        </div>
      );
  }

  if (gameState === 'win') {
    return (
      <div className="min-h-screen bg-yellow-200 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full relative">
          <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-32 h-32">
             <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png" alt="Meowth" className="w-full h-full object-contain" />
          </div>
          <div className="mt-8">
              <h2 className="text-3xl font-bold text-amber-600 mb-4">Rich!!</h2>
              <p className="text-xl mb-6">You collected all the words!</p>
              <button 
                onClick={onComplete}
                className="w-full py-4 bg-amber-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-amber-600 transition"
              >
                Collect Reward! 🌳
              </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-800 relative overflow-hidden flex flex-col items-center" ref={containerRef} onClick={handleTouch}>
        {/* Header HUD */}
        <div className="absolute top-0 w-full z-20 flex justify-between p-4 pointer-events-none">
            <button onClick={onBack} className="bg-white/20 px-3 py-1 rounded-full text-white font-bold pointer-events-auto backdrop-blur-sm">Exit</button>
            <div className="flex gap-2 text-amber-400 font-bold text-xl bg-black/30 px-4 py-1 rounded-full backdrop-blur-sm">
                <span>💰 {score}</span>
            </div>
        </div>

        {/* Target Display */}
        <div className="absolute top-16 z-20 animate-pulse pointer-events-none">
            <div className="bg-white border-4 border-amber-500 px-8 py-3 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                <span className="text-3xl font-black text-gray-800">{currentTarget.cn}</span>
            </div>
        </div>

        {/* Miner Character */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 w-20 h-20">
             <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png" alt="Meowth" className="w-full h-full object-contain" />
        </div>

        {/* The Hook Machine */}
        <div className="absolute top-14 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-gray-600 rounded-full border-4 border-gray-400 z-10 flex justify-center">
            <div className="w-1 h-full bg-black"></div>
        </div>

        {/* The Swinging Line & Hook */}
        <div 
            id="hook-line"
            className="absolute top-16 left-1/2 w-1 bg-black origin-top z-10"
            style={{ 
                height: '10%', // Initial
                transform: 'rotate(0deg)'
            }}
        >
            {/* The Hook Graphic at the end */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full text-3xl leading-none filter drop-shadow-md">
                🪝
            </div>
            
            {/* Container for caught item moving with hook */}
            <div id="caught-item" className="hidden"></div>
        </div>

        {/* Items Layer */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
            {items.map(item => (
                item.visible && item.id !== hookRef.current.caughtItemId && (
                    <div 
                        key={item.id}
                        className={`absolute flex flex-col items-center justify-center text-center p-2 rounded-xl shadow-lg border-b-4 transition-transform
                            ${item.isCorrect 
                                ? 'bg-yellow-400 border-yellow-600 text-yellow-900' 
                                : 'bg-gray-500 border-gray-700 text-gray-200'}
                        `}
                        style={{
                            left: `${item.x}%`,
                            top: `${item.y}%`,
                            width: '80px',
                            height: '60px',
                            transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                        }}
                    >
                        <span className="font-bold text-sm leading-tight break-words">{item.word}</span>
                        <span className="absolute -bottom-6 text-xl">{item.isCorrect ? '💰' : '🪨'}</span>
                    </div>
                )
            ))}
        </div>
        
        {/* Dirt Background Texture */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
    </div>
  );
};