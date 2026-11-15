// Language names: English, and the name in the language itself where the runtime knows it.
// Static reference facts (Unicode CLDR through Intl), not export data. A Wikipedia language code
// that is not a standard tag gets its name from the short list below, or falls back to the code.
const SPECIAL: Record<string, string> = {
  bat_smg: "Samogitian",
  be_x_old: "Belarusian (Taraškievica)",
  cbk_zam: "Chavacano",
  fiu_vro: "Võro",
  map_bms: "Banyumasan",
  nds_nl: "Low Saxon (Netherlands)",
  roa_rup: "Aromanian",
  roa_tara: "Tarantino",
  simple: "Simple English",
  zh_classical: "Classical Chinese",
  zh_min_nan: "Min Nan",
  zh_yue: "Cantonese",
};
const RTL_SCRIPTS = new Set(["Arab", "Hebr", "Syrc", "Thaa", "Nkoo", "Adlm", "Rohg"]);
const tag = (code: string) => code.replace(/_/g, "-");
const en = new Intl.DisplayNames(["en"], { type: "language" });

function display(names: Intl.DisplayNames, code: string): string | null {
  try {
    const n = names.of(tag(code));
    return n && n !== tag(code) ? n : null;
  } catch {
    return null;
  }
}

export function english(code: string): string {
  return SPECIAL[code] ?? display(en, code) ?? code;
}

// The name of the language in the language itself; the English name when the runtime has none.
export function native(code: string): string {
  if (SPECIAL[code]) return SPECIAL[code];
  try {
    const own = new Intl.DisplayNames([tag(code)], { type: "language", fallback: "none" });
    const supported = Intl.DisplayNames.supportedLocalesOf([tag(code)]).length > 0;
    return (supported && own.of(tag(code))) || english(code);
  } catch {
    return english(code);
  }
}

export function isRtl(code: string): boolean {
  try {
    return RTL_SCRIPTS.has(new Intl.Locale(tag(code)).maximize().script ?? "");
  } catch {
    return false;
  }
}

// HTML lang attribute for a Wikipedia language code.
// Set only for tags the runtime has locale data for: retired or unusual codes (for example "eml")
// are not valid lang values, and a wrong lang is worse for a screen reader than none.
export function langTag(code: string): string | undefined {
  if (SPECIAL[code]) return undefined;
  try {
    return Intl.DisplayNames.supportedLocalesOf([tag(code)]).length > 0 ? tag(code) : undefined;
  } catch {
    return undefined;
  }
}
