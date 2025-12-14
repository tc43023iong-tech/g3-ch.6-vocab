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

  const MenuButton = ({ onClick, label, emoji, color }: { onClick: () => void, label: string, emoji: string, color: string }) => (
    <button 
      onClick={onClick}
      className={`${color} w-full py-4 rounded-3xl shadow-lg transform transition hover:scale-105 hover:shadow-xl flex items-center px-6 gap-4 border-b-4 border-black/10`}
    >
      <span className="text-4xl filter drop-shadow-sm">{emoji}</span>
      <span className="text-xl md:text-2xl font-bold text-white text-left">{label}</span>
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
            <header className="mb-8 text-center mt-8">
              <h1 className="text-4xl md:text-6xl font-black text-indigo-600 mb-2 tracking-tight">
                g3 ch.6 
                <span className="block text-yellow-500 mt-2">vocab</span>
              </h1>
              <p className="text-gray-500 font-medium">Grade 3 Vocabulary Games</p>
            </header>

            <div className="w-full max-w-md space-y-4">
              <MenuButton 
                onClick={() => setScreen('learn')} 
                label="Word List" 
                emoji="📖" 
                color="bg-indigo-500" 
              />
              
              <div className="h-4"></div>
              
              <MenuButton onClick={() => setScreen('game1')} label="1. Emoji Detective" emoji="🕵️‍♂️" color="bg-blue-400" />
              <MenuButton onClick={() => setScreen('game2')} label="2. Match Match" emoji="🧩" color="bg-purple-400" />
              <MenuButton onClick={() => setScreen('game3')} label="3. Spelling Bee" emoji="🐝" color="bg-yellow-400" />
              <MenuButton onClick={() => setScreen('game4')} label="4. Fill in Blanks" emoji="📝" color="bg-cyan-400" />
              <MenuButton onClick={() => setScreen('game5')} label="5. Bubble Pop" emoji="🫧" color="bg-pink-400" />

              <div className="h-4"></div>

              <button 
                 onClick={() => setScreen('treehouse')}
                 className="w-full bg-green-500 hover:bg-green-600 py-6 rounded-3xl shadow-xl flex flex-col items-center justify-center text-white border-b-8 border-green-700 active:border-b-0 active:translate-y-2 transition-all"
              >
                  <span className="text-5xl mb-2">🏡</span>
                  <span className="text-2xl font-black">My Tree House</span>
                  <span className="text-sm opacity-90 mt-1">{furnitureCount} Items Collected</span>
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