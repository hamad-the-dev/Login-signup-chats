
interface ProfanityResult {
  hasProfanity: boolean;
  detectedWords: string[];
  cleanedText: string;
}

// Basic profanity word list (in a real app, this would be more comprehensive)
const profanityWords = [
  'damn', 'hell', 'stupid', 'idiot', 'hate', 'kill', 'die', 'ugly', 'fat',
  'loser', 'moron', 'dumb', 'trash', 'garbage', 'worthless'
];

export const checkProfanity = (text: string): ProfanityResult => {
  const lowerText = text.toLowerCase();
  const detectedWords: string[] = [];
  
  profanityWords.forEach(word => {
    if (lowerText.includes(word)) {
      detectedWords.push(word);
    }
  });
  
  const hasProfanity = detectedWords.length > 0;
  
  // Clean the text by replacing profanity with asterisks
  let cleanedText = text;
  detectedWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    cleanedText = cleanedText.replace(regex, '*'.repeat(word.length));
  });
  
  return {
    hasProfanity,
    detectedWords,
    cleanedText
  };
};

export const addProfanityWord = (word: string): void => {
  if (!profanityWords.includes(word.toLowerCase())) {
    profanityWords.push(word.toLowerCase());
  }
};

export const removeProfanityWord = (word: string): void => {
  const index = profanityWords.indexOf(word.toLowerCase());
  if (index > -1) {
    profanityWords.splice(index, 1);
  }
};
