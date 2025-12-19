import React, { useState } from 'react';
import { Screen } from './types';
import { WordList } from './components/WordList';
import { TreeHouse } from './components/TreeHouse';
import { EmojiDetective } from './components/games/EmojiDetective';
import { MatchMatch } from './components/games/MatchMatch';
import { SpellingBee } from './components/games/SpellingBee';
import { FillInBlank } from './components/games/FillInBlank';
import { BubblePop } from './components/games/BubblePop';
import { WordSearch } from './components/games/WordSearch';
import { RainGame } from './components/games/RainGame';
import { MemoryGame } from './components/games/MemoryGame';

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [furnitureCount, setFurnitureCount] = useState(0);

  const handleGameComplete = () => {
    setFurnitureCount(prev => prev + 2);
    setScreen('treehouse');
  };

  const MenuButton = ({ onClick, label, pokemonId, color, emoji }: { onClick: () => void, label: string, pokemonId: number, color: string, emoji?: string }) => (
    <button 
      onClick={onClick}
      className={`${color} w-full py-3 md:py-4 rounded-3xl shadow-lg transform transition hover:scale-105 hover:shadow-xl flex flex-col items-center justify-center gap-2 border-b-4 border-black/10 h-full min-h-[140px] relative overflow-hidden`}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-white/10 rounded-3xl transform rotate-12 scale-150 origin-top-left pointer-events-none"></div>
      
      <div className="w-16 h-16 flex-shrink-0 bg-white/20 rounded-full flex items-center justify-center p-1 z-10">
        <img 
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`} 
            alt="icon" 
            className="w-full h-full object-contain drop-shadow-md" 
        />
      </div>
      <div className="text-center z-10 px-2">
         <span className="text-lg md:text-xl font-black text-white block leading-tight">{label}</span>
         {emoji && <span className="text-white/80 text-sm font-bold">{emoji}</span>}
      </div>
    </button>
  );

  const renderScreen = () => {
    switch(screen) {
      case 'learn':
        return <WordList onBack={() => setScreen('home')} />;
      case 'treehouse':
        return <TreeHouse furnitureCount={furnitureCount} onBack={() => setScreen('home')} />;
      case 'game1':
        return <EmojiDetective onComplete={handleGameComplete} onBack={() => setScreen('home')} />;
      case 'game2':
        return <MatchMatch onComplete={handleGameComplete} onBack={() => setScreen('home')} />;
      case 'game3':
        return <SpellingBee onComplete={handleGameComplete} onBack={() => setScreen('home')} />;
      case 'game4':
        return <FillInBlank onComplete={handleGameComplete} onBack={() => setScreen('home')} />;
      case 'game5':
        return <BubblePop onComplete={handleGameComplete} onBack={() => setScreen('home')} />;
      case 'game6':
        return <WordSearch onComplete={handleGameComplete} onBack={() => setScreen('home')} />;
      case 'game7':
        return <RainGame onComplete={handleGameComplete} onBack={() => setScreen('home')} />;
      case 'game8':
        return <MemoryGame onComplete={handleGameComplete} onBack={() => setScreen('home')} />;
      default:
        return (
          <div className="min-h-screen bg-yellow-50 p-4 flex flex-col items-center">
            <header className="mb-6 text-center mt-4 relative flex flex-col items-center">
              <div className="relative mb-4">
                 <img 
                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png" 
                    alt="Eevee" 
                    className="w-40 h-40 md:w-56 md:h-56 object-contain animate-bounce z-10 relative" 
                    style={{ animationDuration: '3s' }} 
                 />
                 <div className="absolute -top-2 -right-2 md:-right-8 bg-white px-4 py-3 rounded-3xl rounded-bl-none shadow-xl border-4 border-indigo-100 animate-pulse z-20 max-w-[180px]">
                    <p className="text-base md:text-lg font-black text-indigo-600 leading-tight">
                       Let's learn <br/> 
                       <span className="text-yellow-500">g3 ch.6 vocab!</span>
                    </p>
                 </div>
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-indigo-600 mb-1 tracking-tight">
                Emoji English
                <span className="block text-yellow-500 text-xl md:text-3xl">Adventure</span>
              </h1>
            </header>

            <div className="w-full max-w-lg space-y-4 relative z-20 pb-10">
              <button 
                onClick={() => setScreen('learn')}
                className="bg-indigo-500 w-full py-3 rounded-3xl shadow-lg flex items-center justify-center gap-3 border-b-4 border-indigo-700 text-white transform transition hover:scale-105"
              >
                  <span className="text-3xl">📖</span>
                  <span className="text-2xl font-bold">Word List</span>
              </button>
              
              <div className="h-2"></div>
              
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <MenuButton onClick={() => setScreen('game1')} label="1. Detective" pokemonId={25} color="bg-blue-400" emoji="🔍" />
                  <MenuButton onClick={() => setScreen('game2')} label="2. Match" pokemonId={132} color="bg-purple-400" emoji="🃏" />
                  <MenuButton onClick={() => setScreen('game3')} label="3. Spelling" pokemonId={415} color="bg-yellow-400" emoji="🐝" />
                  <MenuButton onClick={() => setScreen('game4')} label="4. Blanks" pokemonId={235} color="bg-cyan-400" emoji="✍️" />
                  <MenuButton onClick={() => setScreen('game5')} label="5. Pop!" pokemonId={7} color="bg-pink-400" emoji="🫧" />
                  <MenuButton onClick={() => setScreen('game6')} label="6. Search" pokemonId={43} color="bg-emerald-400" emoji="🔎" />
                  <MenuButton onClick={() => setScreen('game7')} label="7. Rain Drops" pokemonId={186} color="bg-blue-500" emoji="☔" />
                  <MenuButton onClick={() => setScreen('game8')} label="8. Memory" pokemonId={151} color="bg-fuchsia-400" emoji="🧠" />
              </div>

              <div className="h-2"></div>

              <button 
                 onClick={() => setScreen('treehouse')}
                 className="w-full bg-green-500 hover:bg-green-600 py-4 rounded-3xl shadow-xl flex items-center px-4 gap-4 text-white border-b-8 border-green-700 active:border-b-0 active:translate-y-2 transition-all group"
              >
                  <div className="w-16 h-16 -my-2 flex-shrink-0 bg-white/20 rounded-full flex items-center justify-center p-1 group-hover:scale-110 transition-transform">
                      <img 
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/722.png`} 
                          alt="Rowlet" 
                          className="w-full h-full object-contain drop-shadow-md" 
                      />
                  </div>
                  <div className="flex flex-col items-start flex-1">
                    <span className="text-xl md:text-2xl font-black">My Tree House</span>
                    <span className="text-xs md:text-sm opacity-90">{furnitureCount} Items Collected</span>
                  </div>
                  <span className="text-2xl">🏡</span>
              </button>
            </div>
            
            <footer className="mt-4 text-gray-400 text-xs">
              Grade 3 Vocabulary • Chapter 6
            </footer>
          </div>
        );
    }
  };

  return renderScreen();
}

export default App;
