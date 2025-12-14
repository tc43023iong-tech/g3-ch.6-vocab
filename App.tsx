import React, { useState } from 'react';
import { Screen } from './types';
import { WordList } from './components/WordList';
import { TreeHouse } from './components/TreeHouse';
import { EmojiDetective } from './components/games/EmojiDetective';
import { MatchMatch } from './components/games/MatchMatch';
import { SpellingBee } from './components/games/SpellingBee';
import { FillInBlank } from './components/games/FillInBlank';
import { BubblePop } from './components/games/BubblePop';

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [furnitureCount, setFurnitureCount] = useState(0);

  const handleGameComplete = () => {
    setFurnitureCount(prev => prev + 2);
    setScreen('treehouse');
  };

  const MenuButton = ({ onClick, label, pokemonId, color }: { onClick: () => void, label: string, pokemonId: number, color: string }) => (
    <button 
      onClick={onClick}
      className={`${color} w-full py-4 rounded-3xl shadow-lg transform transition hover:scale-105 hover:shadow-xl flex items-center px-6 gap-4 border-b-4 border-black/10`}
    >
      <div className="w-16 h-16 flex-shrink-0 bg-white/20 rounded-full flex items-center justify-center p-1">
        <img 
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`} 
            alt="icon" 
            className="w-full h-full object-contain drop-shadow-md" 
        />
      </div>
      <span className="text-xl md:text-2xl font-bold text-white text-left flex-1">{label}</span>
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
      default:
        return (
          <div className="min-h-screen bg-yellow-50 p-6 flex flex-col items-center">
            <header className="mb-8 text-center mt-8 relative flex flex-col items-center">
              {/* Eevee Container */}
              <div className="relative mb-6">
                 <img 
                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png" 
                    alt="Eevee" 
                    className="w-48 h-48 md:w-64 md:h-64 object-contain animate-bounce z-10 relative" 
                    style={{ animationDuration: '3s' }} 
                 />
                 
                 {/* Speech Bubble */}
                 <div className="absolute -top-4 -right-2 md:-right-12 bg-white px-6 py-4 rounded-3xl rounded-bl-none shadow-xl border-4 border-indigo-100 animate-pulse z-20 max-w-[200px]">
                    <p className="text-lg md:text-xl font-black text-indigo-600 leading-tight">
                       Let's learn <br/> 
                       <span className="text-yellow-500">g3 ch.6 vocab!</span>
                    </p>
                 </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-indigo-600 mb-2 tracking-tight">
                Emoji English
                <span className="block text-yellow-500 mt-2 text-2xl md:text-4xl">Adventure</span>
              </h1>
              <p className="text-gray-400 font-bold mt-2 bg-white px-4 py-1 rounded-full shadow-sm">Grade 3 Vocabulary Games</p>
            </header>

            <div className="w-full max-w-md space-y-4 relative z-20">
              <MenuButton 
                onClick={() => setScreen('learn')} 
                label="Word List" 
                pokemonId={1} 
                color="bg-indigo-500" 
              />
              
              <div className="h-4"></div>
              
              <MenuButton onClick={() => setScreen('game1')} label="1. Emoji Detective" pokemonId={25} color="bg-blue-400" />
              <MenuButton onClick={() => setScreen('game2')} label="2. Match Match" pokemonId={132} color="bg-purple-400" />
              <MenuButton onClick={() => setScreen('game3')} label="3. Spelling Bee" pokemonId={415} color="bg-yellow-400" />
              <MenuButton onClick={() => setScreen('game4')} label="4. Fill in Blanks" pokemonId={235} color="bg-cyan-400" />
              <MenuButton onClick={() => setScreen('game5')} label="5. Bubble Pop" pokemonId={7} color="bg-pink-400" />

              <div className="h-4"></div>

              <button 
                 onClick={() => setScreen('treehouse')}
                 className="w-full bg-green-500 hover:bg-green-600 py-6 rounded-3xl shadow-xl flex items-center px-6 gap-4 text-white border-b-8 border-green-700 active:border-b-0 active:translate-y-2 transition-all group"
              >
                  <div className="w-20 h-20 -my-4 flex-shrink-0 bg-white/20 rounded-full flex items-center justify-center p-1 group-hover:scale-110 transition-transform">
                      <img 
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/722.png`} 
                          alt="Rowlet" 
                          className="w-full h-full object-contain drop-shadow-md" 
                      />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-2xl font-black">My Tree House</span>
                    <span className="text-sm opacity-90">{furnitureCount} Items Collected</span>
                  </div>
              </button>
            </div>
            
            <footer className="mt-12 text-gray-400 text-sm">
              Keep playing to decorate your tree house!
            </footer>
          </div>
        );
    }
  };

  return renderScreen();
}

export default App;