/**
 * Standard Phonetic Urdu Keyboard Mapping (CRULP / Pak Urdu Installer standard)
 * Allows typing Urdu seamlessly on standard QWERTY keyboards or with native Urdu IME.
 */

export const PHONETIC_URDU_MAP: Record<string, string> = {
  // Lowercase keys
  'a': 'ا',
  'b': 'ب',
  'c': 'چ',
  'd': 'د',
  'e': 'ع',
  'f': 'ف',
  'g': 'گ',
  'h': 'ھ',
  'i': 'ی',
  'j': 'ج',
  'k': 'ک',
  'l': 'ل',
  'm': 'م',
  'n': 'ن',
  'o': 'ہ',
  'p': 'پ',
  'q': 'ق',
  'r': 'ر',
  's': 'س',
  't': 'ت',
  'u': 'ء',
  'v': 'ط',
  'w': 'و',
  'x': 'ش',
  'y': 'ے',
  'z': 'ز',

  // Uppercase / Shift keys
  'A': 'آ',
  'B': 'ؓ',
  'C': 'ث',
  'D': 'ڈ',
  'E': 'غ',
  'F': 'ف',
  'G': 'غ',
  'H': 'ح',
  'I': 'ٰ',
  'J': 'ض',
  'K': 'خ',
  'L': 'ؒ',
  'M': 'ؐ',
  'N': 'ں',
  'O': 'ۃ',
  'P': 'ُ',
  'Q': 'ْ',
  'R': 'ڑ',
  'S': 'ص',
  'T': 'ٹ',
  'U': 'ئ',
  'V': 'ظ',
  'W': 'ّ',
  'X': 'ژ',
  'Y': 'ے',
  'Z': 'ذ',

  // Numbers (Urdu numerals)
  '0': '۰',
  '1': '۱',
  '2': '۲',
  '3': '۳',
  '4': '۴',
  '5': '۵',
  '6': '۶',
  '7': '۷',
  '8': '۸',
  '9': '۹',

  // Punctuation
  ',': '،',
  '.': '۔',
  ';': '؛',
  '?': '؟',
  ' ': ' ',
  '\n': '\n'
};

// Reverse map: Given an Urdu character, find the physical key and if Shift is required
export const URDU_TO_KEY_MAP: Record<string, { key: string; shift: boolean; displayKey: string }> = {};

Object.entries(PHONETIC_URDU_MAP).forEach(([engChar, urduChar]) => {
  const isUpper = engChar >= 'A' && engChar <= 'Z';
  const baseKey = engChar.toLowerCase();
  // Don't overwrite basic lowercase mapping if already set
  if (!URDU_TO_KEY_MAP[urduChar]) {
    URDU_TO_KEY_MAP[urduChar] = {
      key: baseKey,
      shift: isUpper,
      displayKey: engChar,
    };
  }
});

// Explicit key mapping for common Urdu characters that might have variations
URDU_TO_KEY_MAP['آ'] = { key: 'a', shift: true, displayKey: 'A' };
URDU_TO_KEY_MAP['ٹ'] = { key: 't', shift: true, displayKey: 'T' };
URDU_TO_KEY_MAP['ڈ'] = { key: 'd', shift: true, displayKey: 'D' };
URDU_TO_KEY_MAP['ڑ'] = { key: 'r', shift: true, displayKey: 'R' };
URDU_TO_KEY_MAP['ث'] = { key: 'c', shift: true, displayKey: 'C' };
URDU_TO_KEY_MAP['ح'] = { key: 'h', shift: true, displayKey: 'H' };
URDU_TO_KEY_MAP['خ'] = { key: 'k', shift: true, displayKey: 'K' };
URDU_TO_KEY_MAP['ذ'] = { key: 'z', shift: true, displayKey: 'Z' };
URDU_TO_KEY_MAP['ص'] = { key: 's', shift: true, displayKey: 'S' };
URDU_TO_KEY_MAP['ض'] = { key: 'j', shift: true, displayKey: 'J' };
URDU_TO_KEY_MAP['ظ'] = { key: 'v', shift: true, displayKey: 'V' };
URDU_TO_KEY_MAP['غ'] = { key: 'e', shift: true, displayKey: 'E' };
URDU_TO_KEY_MAP['ں'] = { key: 'n', shift: true, displayKey: 'N' };
URDU_TO_KEY_MAP['ھ'] = { key: 'h', shift: false, displayKey: 'h' };
URDU_TO_KEY_MAP['ہ'] = { key: 'o', shift: false, displayKey: 'o' };
URDU_TO_KEY_MAP['ے'] = { key: 'y', shift: false, displayKey: 'y' };
URDU_TO_KEY_MAP['ی'] = { key: 'i', shift: false, displayKey: 'i' };
URDU_TO_KEY_MAP['،'] = { key: ',', shift: false, displayKey: ',' };
URDU_TO_KEY_MAP['۔'] = { key: '.', shift: false, displayKey: '.' };
URDU_TO_KEY_MAP['؛'] = { key: ';', shift: false, displayKey: ';' };
URDU_TO_KEY_MAP['؟'] = { key: '?', shift: true, displayKey: '?' };
URDU_TO_KEY_MAP[' '] = { key: ' ', shift: false, displayKey: 'Space' };

/**
 * Checks if a string contains Urdu / Arabic characters
 */
export const isUrduText = (str: string): boolean => {
  if (!str) return false;
  // Unicode range for Arabic & Urdu script (\u0600 - \u06FF, plus extended \u0750-\u077F)
  return /[\u0600-\u06FF\u0750-\u077F]/.test(str);
};

/**
 * Maps input keystroke to Urdu character when phonetic mode is active
 */
export const mapKeyToUrdu = (key: string, isShift: boolean): string => {
  // If already an Urdu character (typed with OS Urdu keyboard), return as is
  if (isUrduText(key)) return key;

  if (isShift) {
    const upper = key.toUpperCase();
    return PHONETIC_URDU_MAP[upper] || key;
  }
  return PHONETIC_URDU_MAP[key] || key;
};

/**
 * Virtual Keyboard Urdu Key Representation
 */
export interface UrduKeyVisual {
  primary: string; // Urdu character on normal press
  shift?: string;   // Urdu character with Shift
  eng: string;      // English physical key
}

export const URDU_KEYBOARD_LAYOUT: Record<string, { urdu: string; urduShift?: string }> = {
  // Top QWERTY row
  'q': { urdu: 'ق', urduShift: 'ْ' },
  'w': { urdu: 'و', urduShift: 'ّ' },
  'e': { urdu: 'ع', urduShift: 'غ' },
  'r': { urdu: 'ر', urduShift: 'ڑ' },
  't': { urdu: 'ت', urduShift: 'ٹ' },
  'y': { urdu: 'ے', urduShift: 'ۓ' },
  'u': { urdu: 'ء', urduShift: 'ئ' },
  'i': { urdu: 'ی', urduShift: 'ٰ' },
  'o': { urdu: 'ہ', urduShift: 'ۃ' },
  'p': { urdu: 'پ', urduShift: 'ُ' },
  '[': { urdu: ']', urduShift: '}' },
  ']': { urdu: '[', urduShift: '{' },

  // Home row
  'a': { urdu: 'ا', urduShift: 'آ' },
  's': { urdu: 'س', urduShift: 'ص' },
  'd': { urdu: 'د', urduShift: 'ڈ' },
  'f': { urdu: 'ف', urduShift: 'ٖ' },
  'g': { urdu: 'گ', urduShift: 'غ' },
  'h': { urdu: 'ھ', urduShift: 'ح' },
  'j': { urdu: 'ج', urduShift: 'ض' },
  'k': { urdu: 'ک', urduShift: 'خ' },
  'l': { urdu: 'ل', urduShift: 'ؒ' },
  ';': { urdu: '؛', urduShift: ':' },
  "'": { urdu: '’', urduShift: '”' },

  // Bottom row
  'z': { urdu: 'ز', urduShift: 'ذ' },
  'x': { urdu: 'ش', urduShift: 'ژ' },
  'c': { urdu: 'چ', urduShift: 'ث' },
  'v': { urdu: 'ط', urduShift: 'ظ' },
  'b': { urdu: 'ب', urduShift: 'ؓ' },
  'n': { urdu: 'ن', urduShift: 'ں' },
  'm': { urdu: 'م', urduShift: 'ؐ' },
  ',': { urdu: '،', urduShift: '<' },
  '.': { urdu: '۔', urduShift: '>' },
  '/': { urdu: '/', urduShift: '؟' },
};
