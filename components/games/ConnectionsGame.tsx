import React, { useState, useEffect } from 'react';
import { vocabList } from '../../types';
import confetti from 'canvas-confetti';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

interface Card {
    id: string;
    text: string;
    category: string;
    selected: boolean;
    solved: boolean;
}

export const ConnectionsGame: React.FC<Props> = ({ onComplete, onBack }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Manually define groups from vocabList
    const places = ["shopping centre", "cafe", "restaurant", "hotel", "cinema"];
    const actions = ["worry", "watch a film", "eat dim sum", "have afternoon tea", "have a buffet lunch"];
    const buying = ["buy a comic", "buy sweets and chocolate", "buy a card", "buy trainers", "buy jeans"];
    
    // Pick 2 categories randomly for a simple 4x2 grid (8 cards)
    const allGroups = [
        { name: "Places", items: places },
        { name: "Actions", items: actions },
        { name: "Shopping", items: buying }
    ];
    
    const shuffledGroups = [...allGroups].sort(() => Math.random() - 0.5).slice(0, 2);
    
    // Pick 4 items from each group
    let gameCards: Card[] = [];
    shuffledGroups.forEach(g => {
        const items = [...g.items].sort(() => Math.random() - 0.5).slice(0, 4);
        items.forEach(item => {
            gameCards.push({
                id: item,
                text: item,
                category: g.name,
                selected: false,
                solved: false
            });
        });
    });

    setCards([...gameCards].sort(() => Math.random() - 0.5));
    setMistakes(0);
  }, []);

  const handleSelect = (id: string) => {
      if (isFinished) return;
      
      const newCards = cards.map(c => {
          if (c.id === id && !c.solved) {
              return { ...c, selected: !c.selected };
          }
          return c;
      });
      
      const selected = newCards.filter(c => c.selected);
      
      if (selected.length === 4) {
          // Check if match
          const firstCat = selected[0].category;
          const allMatch = selected.every(c => c.category === firstCat);
          
          if (allMatch) {
              // Solved!
              const solvedCards = newCards.map(c => c.selected ? { ...c, solved: true, selected: false } : c);
              setCards(solvedCards);
              confetti({ particleCount: 30, spread: 50 });
              
              if (solvedCards.every(c => c.solved)) {
                  setTimeout(() => setIsFinished(true), 1000);
              }
          } else {
              // Wrong
              setMistakes(prev => prev + 1);
              // Shake effect ideally, but here just reset selection after delay
              setCards(newCards); // Show selection briefly
              setTimeout(() => {
                  setCards(cards.map(c => ({...c, selected: false})));
              }, 800);
              return; // skip setting state below
          }
      }
      
      setCards(newCards);
  };

  if (isFinished) {
      return (
        <div className="min-h-screen bg-violet-100 flex flex-col items-center justify-center p-4">
             <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full relative">
                 <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-32 h-32">
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/65.png" alt="Alakazam" className="w-full h-full object-contain" />
                 </div>
                 <div className="mt-8">
                     <h2 className="text-3xl font-bold text-violet-600 mb-2">Connected!</h2>
                     <p className="text-gray-500 mb-6">You found the links.</p>
                     <button onClick={onComplete} className="w-full py-4 bg-violet-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-violet-600 transition">Collect Reward! 🌳</button>
                 </div>
             </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-violet-50 p-4 flex flex-col items-center">
        <div className="w-full max-w-2xl flex justify-between items-center mb-6">
            <button onClick={onBack} className="bg-white px-4 py-2 rounded-full shadow text-violet-600 font-bold">Back</button>
            <h1 className="text-2xl font-black text-violet-600">Word Links</h1>
            <div className="text-violet-400 font-bold">Mistakes: {mistakes}</div>
        </div>

        <p className="mb-6 text-gray-500 text-center">Create 2 groups of 4 words!</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl">
            {cards.map(card => {
                let bg = 'bg-white hover:bg-violet-50';
                if (card.selected) bg = 'bg-violet-600 text-white transform scale-105';
                if (card.solved) bg = 'bg-green-200 text-green-800 opacity-50 pointer-events-none';

                return (
                    <button 
                        key={card.id}
                        onClick={() => handleSelect(card.id)}
                        className={`
                            h-24 md:h-32 rounded-xl shadow-md border-b-4 border-black/10 p-2 font-bold text-sm md:text-lg flex items-center justify-center text-center transition-all duration-200
                            ${bg}
                        `}
                    >
                        {card.text}
                    </button>
                )
            })}
        </div>
    </div>
  );
};