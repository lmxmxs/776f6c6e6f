// Modul Ankieta - eksporty
// Wersja 1.0.0

// Komponenty
export { AnkietaForm } from './components/AnkietaForm';
export { EkranKarta } from './components/EkranKarta';
export { PytanieRenderer } from './components/PytanieRenderer';
export { ProgressBar } from './components/ProgressBar';
export { WynikiWykres } from './components/WynikiWykres';

// Definicja ankiety
export { definicjaAnkiety, wszystkieOpcje, nazwyEkranow } from './lib/definicja-ankiety';

// Walidacja
export { walidujPytanie, walidujEkran, walidujCrossCheck, walidujRodo, walidujAnkiete } from './lib/walidacja';

// Obliczenia i statystyki
export { obliczStatystyki, topOpcje, daneDlaWykresuKolowego, daneDlaWykresuSlupkowego, podsumowanieOdpowiedzi } from './lib/obliczanie';

// Storage (server-side only)
// Te funkcje sa dostepne tylko w API endpoints
// export { zapiszOdpowiedz, pobierzOdpowiedzi, pobierzOdpowiedzPoId, aktualizujOdpowiedz, usunOdpowiedz, eksportujDoCsv } from './lib/storage';

// Typy
export type {
  TypPytania,
  Opcja,
  Walidacja,
  Pytanie,
  Ekran,
  DefinicjaAnkiety,
  OdpowiedzAnkiety,
  FlagaWeryfikacji,
  StatystykiAnkiety,
  RozkladOpcji,
  AnkietaFormProps,
  EkranKartaProps,
  PytanieRendererProps,
  ProgressBarProps,
  WynikiWykresProps
} from './types';
