// Language names: English and the name in the language itself. Static reference facts, not export data.
const NAMES: Record<string, [string, string]> = {
  am: ["Amharic", "አማርኛ"], bn: ["Bengali", "বাংলা"], cy: ["Welsh", "Cymraeg"], el: ["Greek", "Ελληνικά"],
  eo: ["Esperanto", "Esperanto"], ha: ["Hausa", "Hausa"], hi: ["Hindi", "हिन्दी"], ig: ["Igbo", "Igbo"],
  mr: ["Marathi", "मराठी"], ms: ["Malay", "Melayu"], ne: ["Nepali", "नेपाली"], pa: ["Punjabi", "ਪੰਜਾਬੀ"],
  so: ["Somali", "Soomaali"], sw: ["Swahili", "Kiswahili"], ta: ["Tamil", "தமிழ்"], te: ["Telugu", "తెలుగు"],
  tl: ["Tagalog", "Tagalog"], ur: ["Urdu", "اردو"], yo: ["Yoruba", "Yorùbá"], zu: ["Zulu", "isiZulu"],
};
const RTL = new Set(["ur", "ar", "fa", "he"]);

export const english = (code: string) => NAMES[code]?.[0] ?? code;
export const native = (code: string) => NAMES[code]?.[1] ?? code;
export const isRtl = (code: string) => RTL.has(code);
