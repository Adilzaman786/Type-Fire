import { PracticeParagraph } from '../types/typing';

export const PRACTICE_PARAGRAPHS: PracticeParagraph[] = [
  // Technology
  {
    id: 'tech-1',
    title: 'The Architecture of Modern Web',
    category: 'technology',
    difficulty: 'medium',
    authorOrSource: 'Software Engineering Journal',
    text: 'Modern web applications thrive on asynchronous execution, distributed micro-services, and responsive client architectures. When data streams seamlessly across network sockets, users experience software as an effortless extension of thought, where latency diminishes to imperceptible micro-intervals.'
  },
  {
    id: 'tech-2',
    title: 'Silicon and Thought',
    category: 'technology',
    difficulty: 'hard',
    authorOrSource: 'AI & Computation Review',
    text: 'Artificial intelligence transforms raw computational throughput into emergent patterns of reasoning. Neural networks synthesize petabytes of human knowledge, identifying subtleties in language, music, and molecular dynamics that human intuition alone could never isolate across a single lifetime.'
  },
  {
    id: 'tech-3',
    title: 'Cybersecurity & Encryption',
    category: 'technology',
    difficulty: 'medium',
    authorOrSource: 'Digital Defense Brief',
    text: 'Cryptography forms the invisible foundation of the digital civilization. Prime numbers multiplied across vast mathematical spaces create one-way trapdoors that shield sensitive human exchanges from unauthorized observation across global glass-fiber networks.'
  },

  // Science
  {
    id: 'sci-1',
    title: 'Starlight and Deep Time',
    category: 'science',
    difficulty: 'medium',
    authorOrSource: 'Cosmology Notes',
    text: 'Every photon striking our eyes from the Andromeda galaxy embarked on its solitary journey two and a half million years ago, before humans shaped tools from stone. Looking outward into the celestial void is an act of looking backward through ancient cosmic history.'
  },
  {
    id: 'sci-2',
    title: 'Quantum Entanglement',
    category: 'science',
    difficulty: 'hard',
    authorOrSource: 'Theoretical Physics',
    text: 'In the microscopic realm of quantum mechanics, twin particles can become intimately intertwined such that the measurement of one instantly determines the state of the other, defying our ordinary intuitions about spatial locality and cosmic boundaries.'
  },

  // Philosophy & Wisdom
  {
    id: 'phil-1',
    title: 'The Stoic Mind',
    category: 'philosophy',
    difficulty: 'easy',
    authorOrSource: 'Marcus Aurelius (Meditations)',
    text: 'You have power over your mind, not outside events. Realize this, and you will find immense strength. Waste no more time arguing what a good person should be; be one. The happiness of your life depends upon the quality of your thoughts.'
  },
  {
    id: 'phil-2',
    title: 'Focus and Deep Work',
    category: 'philosophy',
    difficulty: 'medium',
    authorOrSource: 'Productivity Philosophy',
    text: 'Clarity about what matters provides clarity about what does not. The ability to perform deep work without distraction is becoming increasingly rare at exactly the same time it is becoming increasingly valuable in our frantic economy.'
  },

  // Roman Urdu (Requested specifically for bilingual practice!)
  {
    id: 'urdu-1',
    title: 'Rozana Ki Mehnat Aur Lagan',
    category: 'roman-urdu',
    difficulty: 'medium',
    authorOrSource: 'Pakistani Wisdom & Motivation',
    text: 'Kisi bhi mushkil kam ko asan banane ke liye mustaqil mizaji sab se barhi taqat hai. Rozana adha ghanta typing ki practice karne se aap ki unglian keyboard par bila jhijhak harkat karna shuru kar deti hain aur aap baghair dekhe tez typing seekh jate hain.'
  },
  {
    id: 'urdu-2',
    title: 'Waqt Ki Ahmiyat',
    category: 'roman-urdu',
    difficulty: 'easy',
    authorOrSource: 'Fikr-o-Danish',
    text: 'Waqt dunya ki sab se qeemti daulat hai jo guzar jaye to wapis nahi aati. Apne waqt ko nayi maharat aur ilm seekhne mein lagana insan ko dunya ke muqablay mein aagay le jata hai. Mehnat kabhi zaya nahi hoti.'
  },
  {
    id: 'urdu-3',
    title: 'Technology Aur Naujawan',
    category: 'roman-urdu',
    difficulty: 'hard',
    authorOrSource: 'Jadeed Daur',
    text: 'Aaj ka daur technology aur computer skills ka hai. Chahe aap software developer hon, content writer hon ya student, tez typing speed aap ke ghanton ka kaam lamhon mein mukammal kar sakti hai aur aap ki karkardagi behtar banati hai.'
  },

  // Common Words Sprint
  {
    id: 'common-1',
    title: 'Top 100 Speed Sprint',
    category: 'common-words',
    difficulty: 'easy',
    authorOrSource: 'Frequency Dictionary',
    text: 'the be to of and a in that have I it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people'
  },
  {
    id: 'common-2',
    title: 'Action Verbs and Cadence',
    category: 'common-words',
    difficulty: 'medium',
    authorOrSource: 'Word Flow',
    text: 'run leap climb build create design deliver inspect measure observe imagine launch accelerate transcend navigate inspire empower challenge adapt thrive discover conquer refine illuminate elevate connect'
  },

  // Developer & Code
  {
    id: 'code-1',
    title: 'TypeScript React Component',
    category: 'code',
    difficulty: 'hard',
    authorOrSource: 'TypeScript Best Practices',
    text: 'export const SpeedMeter = ({ wpm, accuracy }: Props) => { const isMaster = wpm >= 90 && accuracy > 98; return <div className={`meter ${isMaster ? "glow" : ""}`}><span>{wpm} WPM</span></div>; };'
  }
];

// Helper to get daily challenge paragraph based on current date
export function getDailyChallengeParagraph(dateStr?: string): PracticeParagraph {
  const today = dateStr || new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash << 5) - hash + today.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PRACTICE_PARAGRAPHS.length;
  const original = PRACTICE_PARAGRAPHS[index];
  return {
    ...original,
    id: `daily-${today}`,
    title: `Daily Challenge: ${original.title}`,
    category: 'daily',
  };
}
