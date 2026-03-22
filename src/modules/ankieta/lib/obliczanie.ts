// Obliczanie statystyk i agregacji odpowiedzi ankiety

import type { OdpowiedzAnkiety, StatystykiAnkiety, RozkladOpcji } from '../types';
import { wszystkieOpcje } from './definicja-ankiety';

// Oblicz rozklad dla opcji checkbox/radio
function obliczRozklad(
  odpowiedzi: OdpowiedzAnkiety[],
  pytanieId: string,
  dostepneOpcje: { id: string; label: string; value: string }[]
): RozkladOpcji[] {
  const licznik: Record<string, number> = {};

  // Inicjalizuj licznik
  for (const opcja of dostepneOpcje) {
    licznik[opcja.value] = 0;
  }

  // Zliczaj odpowiedzi
  for (const odp of odpowiedzi) {
    const wartosc = odp.odpowiedzi[pytanieId];
    if (!wartosc) continue;

    if (Array.isArray(wartosc)) {
      for (const v of wartosc) {
        if (licznik[v] !== undefined) {
          licznik[v]++;
        }
      }
    } else {
      if (licznik[wartosc] !== undefined) {
        licznik[wartosc]++;
      }
    }
  }

  // Oblicz procenty
  const total = odpowiedzi.length;
  const rozklad: RozkladOpcji[] = [];

  for (const opcja of dostepneOpcje) {
    const liczba = licznik[opcja.value];
    rozklad.push({
      opcja: opcja.label,
      liczba,
      procent: total > 0 ? Math.round((liczba / total) * 100) : 0
    });
  }

  // Sortuj malejaco po liczbie
  rozklad.sort((a, b) => b.liczba - a.liczba);

  return rozklad;
}

// Oblicz srednia ukonczonych ekranow
function obliczSredniaEkranow(odpowiedzi: OdpowiedzAnkiety[]): number {
  if (odpowiedzi.length === 0) return 0;

  const suma = odpowiedzi.reduce((acc, odp) => {
    return acc + (odp.zakonczono ? 8 : odp.ekranAktualny);
  }, 0);

  return Math.round((suma / odpowiedzi.length) * 10) / 10;
}

// Glowna funkcja obliczania statystyk
export function obliczStatystyki(odpowiedzi: OdpowiedzAnkiety[]): StatystykiAnkiety {
  const zakonczone = odpowiedzi.filter(o => o.zakonczono);

  return {
    liczbaOdpowiedzi: odpowiedzi.length,
    liczbaZakonczonych: zakonczone.length,
    sredniaEkranow: obliczSredniaEkranow(odpowiedzi),
    rozkladBranzy: obliczRozklad(zakonczone, 'p5_branza', wszystkieOpcje.branze),
    rozkladLokalizacji: obliczRozklad(zakonczone, 'p6_lokalizacja', wszystkieOpcje.lokalizacje),
    rozkladWielkosci: obliczRozklad(zakonczone, 'p7_wielkosc', wszystkieOpcje.wielkosc),
    rozkladPotrzeb: obliczRozklad(zakonczone, 'p11_potrzeby', wszystkieOpcje.potrzeby),
    rozkladMozliwosci: obliczRozklad(zakonczone, 'p12_mozliwosci', wszystkieOpcje.mozliwosci),
    rozkladUczestnictwa: obliczRozklad(zakonczone, 'p13_uczestnictwo', wszystkieOpcje.uczestnictwo)
  };
}

// Pobierz top N opcji z rozkladu
export function topOpcje(rozklad: RozkladOpcji[], n: number = 5): RozkladOpcji[] {
  return rozklad.slice(0, n);
}

// Dane dla wykresow (format dla Recharts)
export function daneDlaWykresuKolowego(rozklad: RozkladOpcji[]): { name: string; value: number }[] {
  return rozklad
    .filter(r => r.liczba > 0)
    .map(r => ({
      name: r.opcja,
      value: r.liczba
    }));
}

export function daneDlaWykresuSlupkowego(rozklad: RozkladOpcji[]): { name: string; wartosc: number; procent: number }[] {
  return rozklad
    .filter(r => r.liczba > 0)
    .map(r => ({
      name: r.opcja.length > 15 ? r.opcja.substring(0, 15) + '...' : r.opcja,
      wartosc: r.liczba,
      procent: r.procent
    }));
}

// Podsumowanie odpowiedzi dla panelu admina
export function podsumowanieOdpowiedzi(odpowiedz: OdpowiedzAnkiety): Record<string, any> {
  const odp = odpowiedz.odpowiedzi;
  return {
    imie: odp['p1_imie'] || '-',
    firma: odp['p3_firma'] || '-',
    branze: Array.isArray(odp['p5_branza']) ? odp['p5_branza'].join(', ') : '-',
    lokalizacje: Array.isArray(odp['p6_lokalizacja']) ? odp['p6_lokalizacja'].join(', ') : '-',
    wielkosc: odp['p7_wielkosc'] || '-',
    telefon: odp['p17_telefon'] || '-',
    zakonczono: odpowiedz.zakonczono,
    data: odpowiedz.utworzono
  };
}
