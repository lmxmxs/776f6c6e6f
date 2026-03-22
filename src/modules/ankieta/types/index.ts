// Typy dla modulu ankieta
// Wersja 1.0.0

export type TypPytania = 'text' | 'textarea' | 'radio' | 'checkbox' | 'file' | 'email' | 'tel';

export interface Opcja {
  id: string;
  label: string;
  value: string;
}

export interface Walidacja {
  min?: number;
  max?: number;
  pattern?: string;
  maxWybor?: number; // dla checkbox - max liczba wyborow
  minWybor?: number; // minimalna liczba wyborow
}

export interface Pytanie {
  id: string;
  numer: number;        // numer pytania 1-19
  ekran: number;        // numer ekranu 1-8
  tekst: string;
  typ: TypPytania;
  wymagane: boolean;
  opcje?: Opcja[];
  placeholder?: string;
  walidacja?: Walidacja;
  weryfikujace?: string[]; // ID pytan weryfikujacych (cross-check)
  opis?: string;           // dodatkowy opis/instrukcja
}

export interface Ekran {
  id: number;           // 1-8
  tytul: string;        // "Dane osobowe", "Branza", etc.
  opis?: string;
  pytania: Pytanie[];
}

export interface DefinicjaAnkiety {
  id: string;
  nazwa: string;
  wersja: string;
  ekrany: Ekran[];      // 8 ekranow
  liczbaPytan: number;  // 19
  opis?: string;
}

export interface OdpowiedzAnkiety {
  id: string;
  ankietaId: string;
  odpowiedzi: Record<string, any>;
  ekranAktualny: number;  // 1-8
  zakonczono: boolean;
  utworzono: string;      // ISO date
  zaktualizowano: string; // ISO date
  flagi?: FlagaWeryfikacji[];
}

export interface FlagaWeryfikacji {
  typ: 'niespojnosc' | 'ostrzezenie' | 'info';
  pytanieA: string;
  pytanieB: string;
  opis: string;
}

export interface StatystykiAnkiety {
  liczbaOdpowiedzi: number;
  liczbaZakonczonych: number;
  sredniaEkranow: number;
  rozkladBranzy: RozkladOpcji[];
  rozkladLokalizacji: RozkladOpcji[];
  rozkladWielkosci: RozkladOpcji[];
  rozkladPotrzeb: RozkladOpcji[];
  rozkladMozliwosci: RozkladOpcji[];
  rozkladUczestnictwa: RozkladOpcji[];
}

export interface RozkladOpcji {
  opcja: string;
  liczba: number;
  procent: number;
}

// Props dla komponentow

export interface AnkietaFormProps {
  ankieta: DefinicjaAnkiety;
  onSubmit: (odpowiedzi: Record<string, any>) => Promise<void>;
  onSave?: (odpowiedzi: Record<string, any>, ekran: number) => void;
  poczatkoweOdpowiedzi?: Record<string, any>;
  poczatkowyEkran?: number;
}

export interface EkranKartaProps {
  ekran: Ekran;
  odpowiedzi: Record<string, any>;
  onChange: (pytanieId: string, wartosc: any) => void;
  bledy?: Record<string, string>;
}

export interface PytanieRendererProps {
  pytanie: Pytanie;
  wartosc: any;
  onChange: (wartosc: any) => void;
  blad?: string;
}

export interface ProgressBarProps {
  aktualnyEkran: number;
  liczbaEkranow: number;
  nazwyEkranow: string[];
  onNavigate?: (ekran: number) => void;
}

export interface WynikiWykresProps {
  statystyki: StatystykiAnkiety;
  typ?: 'branza' | 'lokalizacja' | 'wielkosc' | 'potrzeby' | 'mozliwosci' | 'wszystko';
}
