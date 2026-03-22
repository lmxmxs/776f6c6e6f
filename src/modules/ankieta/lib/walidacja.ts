// Walidacja formularza ankiety + pytania weryfikujace (cross-check)

import type { Ekran, Pytanie, FlagaWeryfikacji } from '../types';

// Slowniki kluczowych slow do cross-check
const slownikiCrossCheck: Record<string, string[]> = {
  instalacje: ['hydraulik', 'elektryka', 'elektryczny', 'gaz', 'co', 'ogrzewanie', 'woda', 'rury', 'instalator'],
  budownictwo: ['budowa', 'remont', 'murarz', 'budowlane', 'wykonczenia', 'malowanie', 'tynki'],
  it: ['programista', 'strona', 'www', 'internet', 'komputer', 'software', 'aplikacja'],
  marketing: ['reklama', 'social', 'media', 'facebook', 'instagram', 'promocja'],
  gastronomia: ['jedzenie', 'kuchnia', 'catering', 'restauracja', 'gotowanie'],
  transport: ['przewoz', 'dostawa', 'przeprowadzki', 'kurier', 'logistyka'],
  fotografia: ['zdjecia', 'fotograf', 'video', 'film', 'nagrywanie'],
  edukacja: ['szkolenie', 'kurs', 'nauka', 'korepetycje', 'nauczyciel'],
  zdrowie: ['masaz', 'kosmetyka', 'fryzjer', 'uroda', 'fizjoterapeuta', 'zdrowie'],
  ksiegowosc: ['faktura', 'podatki', 'rozliczenia', 'vat', 'pit', 'rachunki']
};

export interface WynikWalidacji {
  valid: boolean;
  bledy: Record<string, string>;
  ostrzezenia?: string[];
}

// Walidacja pojedynczego pytania
export function walidujPytanie(pytanie: Pytanie, wartosc: any): string | null {
  // Sprawdz czy wymagane
  if (pytanie.wymagane) {
    if (wartosc === undefined || wartosc === null || wartosc === '') {
      return 'To pole jest wymagane';
    }
    if (Array.isArray(wartosc) && wartosc.length === 0) {
      return 'Wybierz przynajmniej jedna opcje';
    }
  }

  // Sprawdz walidacje specyficzna
  if (pytanie.walidacja && wartosc) {
    const { min, max, pattern, maxWybor, minWybor } = pytanie.walidacja;

    // Dla tekstu - dlugosc
    if (typeof wartosc === 'string') {
      if (min && wartosc.length < min) {
        return `Minimalna dlugosc to ${min} znakow`;
      }
      if (max && wartosc.length > max) {
        return `Maksymalna dlugosc to ${max} znakow`;
      }
      if (pattern) {
        const regex = new RegExp(pattern);
        if (!regex.test(wartosc)) {
          if (pytanie.typ === 'tel') {
            return 'Niepoprawny format numeru telefonu (np. +48 123 456 789)';
          }
          return 'Niepoprawny format';
        }
      }
    }

    // Dla checkbox - liczba wyborow
    if (Array.isArray(wartosc)) {
      if (minWybor && wartosc.length < minWybor) {
        return `Wybierz przynajmniej ${minWybor} opcje`;
      }
      if (maxWybor && wartosc.length > maxWybor) {
        return `Mozesz wybrac maksymalnie ${maxWybor} opcje`;
      }
    }
  }

  return null;
}

// Walidacja calego ekranu
export function walidujEkran(ekran: Ekran, odpowiedzi: Record<string, any>): WynikWalidacji {
  const bledy: Record<string, string> = {};

  for (const pytanie of ekran.pytania) {
    const wartosc = odpowiedzi[pytanie.id];
    const blad = walidujPytanie(pytanie, wartosc);
    if (blad) {
      bledy[pytanie.id] = blad;
    }
  }

  return {
    valid: Object.keys(bledy).length === 0,
    bledy
  };
}

// Cross-check pytan weryfikujacych
export function walidujCrossCheck(
  odpowiedzi: Record<string, any>
): FlagaWeryfikacji[] {
  const flagi: FlagaWeryfikacji[] = [];

  // Cross-check: opis dzialalnosci vs branza
  const opis = odpowiedzi['p4_opis']?.toLowerCase() || '';
  const branze = odpowiedzi['p5_branza'] || [];

  if (opis && branze.length > 0) {
    // Sprawdz czy opis pasuje do wybranych branz
    for (const [branzaKey, slowa] of Object.entries(slownikiCrossCheck)) {
      const zawieraSlowo = slowa.some(slowo => opis.includes(slowo));
      const wybranabranza = branze.includes(branzaKey);

      if (zawieraSlowo && !wybranabranza) {
        flagi.push({
          typ: 'ostrzezenie',
          pytanieA: 'p4_opis',
          pytanieB: 'p5_branza',
          opis: `Opis sugeruje branze "${branzaKey}" ale nie zostala wybrana`
        });
      }
    }
  }

  // Cross-check: oferta vs idealny klient
  const oferta = odpowiedzi['p8_oferta']?.toLowerCase() || '';
  const klient = odpowiedzi['p9_klient']?.toLowerCase() || '';

  if (oferta && klient) {
    // Prosta heurystyka - czy oferta dla firm a klient to osoby prywatne
    const ofertaDlaFirm = oferta.includes('firm') || oferta.includes('b2b') || oferta.includes('biznes');
    const klientPrywatny = klient.includes('prywat') || klient.includes('osob') || klient.includes('dom');

    if (ofertaDlaFirm && klientPrywatny) {
      flagi.push({
        typ: 'info',
        pytanieA: 'p8_oferta',
        pytanieB: 'p9_klient',
        opis: 'Oferta sugeruje B2B, ale klient to osoby prywatne - sprawdz spójność'
      });
    }
  }

  return flagi;
}

// Sprawdz czy wszystkie zgody RODO sa zaznaczone
export function walidujRodo(odpowiedzi: Record<string, any>): boolean {
  const rodo = odpowiedzi['p19_rodo'] || [];
  return rodo.length === 3 &&
    rodo.includes('zgoda_dane') &&
    rodo.includes('zgoda_kontakt') &&
    rodo.includes('zgoda_wizytowka');
}

// Waliduj cala ankiete przed wyslaniem
export function walidujAnkiete(
  odpowiedzi: Record<string, any>,
  ekrany: Ekran[]
): { valid: boolean; bledy: Record<string, string>; flagi: FlagaWeryfikacji[] } {
  const bledy: Record<string, string> = {};

  for (const ekran of ekrany) {
    const wynik = walidujEkran(ekran, odpowiedzi);
    Object.assign(bledy, wynik.bledy);
  }

  const flagi = walidujCrossCheck(odpowiedzi);

  return {
    valid: Object.keys(bledy).length === 0,
    bledy,
    flagi
  };
}
