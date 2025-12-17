
export interface WordItem {
  en: string;
  cn: string;
  ipa: string;
  emoji: string;
  category?: string;
  sentence: string;
}

export const vocabList: WordItem[] = [
  { en: "shopping centre", cn: "購物中心", ipa: "/ˈʃɒpɪŋ ˈsentə/", emoji: "🏬", sentence: "Let's go to the shopping centre to buy clothes." },
  { en: "cafe", cn: "咖啡店", ipa: "/ˈkæ feɪ/", emoji: "☕", sentence: "Dad drinks coffee at the cafe." },
  { en: "have afternoon tea", cn: "吃下午茶", ipa: "/həv ɑːftəˈnuːn ti:/", emoji: "🍰", sentence: "We have afternoon tea with cake on Sunday." },
  { en: "restaurant", cn: "酒樓", ipa: "/ˈrestərɒnt/", emoji: "🥢", sentence: "We eat dinner at a Chinese restaurant." },
  { en: "eat dim sum", cn: "吃點心", ipa: "/iːt dɪm sʌm/", emoji: "🥟", sentence: "I like to eat dim sum with my family." },
  { en: "hotel", cn: "酒店", ipa: "/həʊˈtel/", emoji: "🏨", sentence: "We stay in a hotel when we travel." },
  { en: "have a buffet lunch", cn: "吃自助午餐", ipa: "/həv ə ˈbʊfeɪ lʌntʃ/", emoji: "🍽️", sentence: "We have a buffet lunch and eat lots of food." },
  { en: "cinema", cn: "戲院", ipa: "/ˈsɪnəmə/", emoji: "🎬", sentence: "We watch a new movie at the cinema." },
  { en: "watch a film", cn: "看電影", ipa: "/wɒtʃ ə fɪlm/", emoji: "🍿", sentence: "Let's watch a film this weekend." },
  { en: "book shop", cn: "書店", ipa: "/bʊk ʃɒp/", emoji: "📚", sentence: "I buy a storybook at the book shop." },
  { en: "buy a comic", cn: "買漫畫書", ipa: "/baɪ ə ˈkɒmɪk/", emoji: "🗯️", sentence: "I go to the shop to buy a comic about heroes." },
  { en: "sweet shop", cn: "糖果店", ipa: "/swiːt ʃɒp/", emoji: "🍬", sentence: "The sweet shop sells yummy candy." },
  { en: "buy sweets and chocolate", cn: "買糖果和朱古力", ipa: "/baɪ swiːts.../", emoji: "🍫", sentence: "I want to buy sweets and chocolate for my friends." },
  { en: "gift shop", cn: "禮品店", ipa: "/ɡɪft ʃɒp/", emoji: "🎁", sentence: "We buy a present at the gift shop." },
  { en: "buy a card", cn: "買賀咭", ipa: "/baɪ ə kɑːd/", emoji: "💌", sentence: "I buy a card for my mom's birthday." },
  { en: "sportswear shop", cn: "運動服裝店", ipa: "/ˈspɔːtsweə ʃɒp/", emoji: "🎽", sentence: "The sportswear shop sells t-shirts and shorts." },
  { en: "buy trainers", cn: "買運動鞋", ipa: "/baɪ ˈtreɪnəz/", emoji: "👟", sentence: "I need to buy trainers for running." },
  { en: "clothes shop", cn: "服裝店", ipa: "/kləʊðz ʃɒp/", emoji: "👗", sentence: "Mom buys a dress at the clothes shop." },
  { en: "buy jeans", cn: "買牛仔褲", ipa: "/baɪ dʒiːnz/", emoji: "👖", sentence: "I want to buy jeans to wear." },
  { en: "worry", cn: "擔心", ipa: "/ˈwʌri/", emoji: "😟", sentence: "Don't worry, be happy!" }
];

export const furnitureList = [
  "🪑", "🛋️", "🛏️", "🖼️", "🪴", "📺", "🧸", "📚", "🕰️", "💡", 
  "🛁", "🚽", "🧶", "🎸", "🔭", "🧺", "🕯️", "📦", "🚪", "🎏"
];

// Pokemon IDs corresponding to cute/popular pokemon
export const pokemonList = [
  1,   // Bulbasaur
  4,   // Charmander
  7,   // Squirtle
  25,  // Pikachu
  39,  // Jigglypuff
  52,  // Meowth
  54,  // Psyduck
  60,  // Poliwag
  133, // Eevee
  143, // Snorlax
  151, // Mew
  175, // Togepi
  252, // Treecko
  255, // Torchic
  258, // Mudkip
  300, // Skitty
  393, // Piplup
  417, // Pachirisu
  448, // Lucario
  722  // Rowlet
];

export type Screen = 'home' | 'learn' | 'game1' | 'game2' | 'game3' | 'game4' | 'game5' | 'game6' | 'treehouse';
