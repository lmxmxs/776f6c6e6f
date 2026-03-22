// Zapis i odczyt odpowiedzi ankiety
// Server-side only (Astro API endpoints)

import type { OdpowiedzAnkiety, FlagaWeryfikacji } from '../types';
import { readFile, writeFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Sciezka do pliku z odpowiedziami
const DATA_DIR = join(process.cwd(), 'data');
const ODPOWIEDZI_FILE = join(DATA_DIR, 'wyniki-ankiet.json');

// Upewnij sie ze katalog data istnieje
function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Wczytaj wszystkie odpowiedzi
export async function pobierzOdpowiedzi(): Promise<OdpowiedzAnkiety[]> {
  ensureDataDir();

  try {
    if (!existsSync(ODPOWIEDZI_FILE)) {
      return [];
    }
    const data = await readFile(ODPOWIEDZI_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('[ANKIETA] Blad odczytu odpowiedzi:', error);
    return [];
  }
}

// Pobierz pojedyncza odpowiedz po ID
export async function pobierzOdpowiedzPoId(id: string): Promise<OdpowiedzAnkiety | null> {
  const odpowiedzi = await pobierzOdpowiedzi();
  return odpowiedzi.find(o => o.id === id) || null;
}

// Generuj unikalne ID
function generujId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ank_${timestamp}_${random}`;
}

// Zapisz nowa odpowiedz
export async function zapiszOdpowiedz(
  odpowiedzi: Record<string, any>,
  ankietaId: string,
  ekranAktualny: number = 1,
  zakonczono: boolean = false,
  flagi: FlagaWeryfikacji[] = []
): Promise<OdpowiedzAnkiety> {
  ensureDataDir();

  const nowaOdpowiedz: OdpowiedzAnkiety = {
    id: generujId(),
    ankietaId,
    odpowiedzi,
    ekranAktualny,
    zakonczono,
    utworzono: new Date().toISOString(),
    zaktualizowano: new Date().toISOString(),
    flagi
  };

  const wszystkie = await pobierzOdpowiedzi();
  wszystkie.push(nowaOdpowiedz);

  await writeFile(ODPOWIEDZI_FILE, JSON.stringify(wszystkie, null, 2), 'utf-8');
  console.log(`[ANKIETA] Zapisano odpowiedz ${nowaOdpowiedz.id}`);

  return nowaOdpowiedz;
}

// Aktualizuj istniejaca odpowiedz
export async function aktualizujOdpowiedz(
  id: string,
  aktualizacja: Partial<OdpowiedzAnkiety>
): Promise<OdpowiedzAnkiety | null> {
  ensureDataDir();

  const wszystkie = await pobierzOdpowiedzi();
  const index = wszystkie.findIndex(o => o.id === id);

  if (index === -1) {
    return null;
  }

  wszystkie[index] = {
    ...wszystkie[index],
    ...aktualizacja,
    zaktualizowano: new Date().toISOString()
  };

  await writeFile(ODPOWIEDZI_FILE, JSON.stringify(wszystkie, null, 2), 'utf-8');
  console.log(`[ANKIETA] Zaktualizowano odpowiedz ${id}`);

  return wszystkie[index];
}

// Usun odpowiedz
export async function usunOdpowiedz(id: string): Promise<boolean> {
  ensureDataDir();

  const wszystkie = await pobierzOdpowiedzi();
  const nowe = wszystkie.filter(o => o.id !== id);

  if (nowe.length === wszystkie.length) {
    return false; // nie znaleziono
  }

  await writeFile(ODPOWIEDZI_FILE, JSON.stringify(nowe, null, 2), 'utf-8');
  console.log(`[ANKIETA] Usunieto odpowiedz ${id}`);

  return true;
}

// Pobierz odpowiedzi z flagami weryfikacji
export async function pobierzOdpowiedziZFlagami(): Promise<OdpowiedzAnkiety[]> {
  const wszystkie = await pobierzOdpowiedzi();
  return wszystkie.filter(o => o.flagi && o.flagi.length > 0);
}

// Eksportuj odpowiedzi do CSV
export async function eksportujDoCsv(): Promise<string> {
  const odpowiedzi = await pobierzOdpowiedzi();

  if (odpowiedzi.length === 0) {
    return 'Brak danych';
  }

  // Naglowki
  const naglowki = [
    'ID', 'Data', 'Imie', 'Firma', 'Etap biznesu', 'Opis', 'Branze',
    'Lokalizacje', 'Wielkosc', 'Oferta', 'Klient', 'Wspolpraca',
    'Potrzeby', 'Mozliwosci', 'Uczestnictwo', 'Telefon', 'Social', 'Zakonczono'
  ];

  const wiersze = odpowiedzi.map(o => {
    const odp = o.odpowiedzi;
    return [
      o.id,
      o.utworzono,
      odp['p1_imie'] || '',
      odp['p3_firma'] || '',
      odp['p2_etap'] || '',
      (odp['p4_opis'] || '').replace(/"/g, '""'),
      Array.isArray(odp['p5_branza']) ? odp['p5_branza'].join('; ') : '',
      Array.isArray(odp['p6_lokalizacja']) ? odp['p6_lokalizacja'].join('; ') : '',
      odp['p7_wielkosc'] || '',
      (odp['p8_oferta'] || '').replace(/"/g, '""'),
      (odp['p9_klient'] || '').replace(/"/g, '""'),
      (odp['p10_wspolpraca'] || '').replace(/"/g, '""'),
      Array.isArray(odp['p11_potrzeby']) ? odp['p11_potrzeby'].join('; ') : '',
      Array.isArray(odp['p12_mozliwosci']) ? odp['p12_mozliwosci'].join('; ') : '',
      Array.isArray(odp['p13_uczestnictwo']) ? odp['p13_uczestnictwo'].join('; ') : '',
      odp['p17_telefon'] || '',
      odp['p18_social'] || '',
      o.zakonczono ? 'TAK' : 'NIE'
    ].map(v => `"${v}"`).join(',');
  });

  return [naglowki.join(','), ...wiersze].join('\n');
}
