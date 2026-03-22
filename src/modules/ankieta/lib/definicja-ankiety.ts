// Definicja ankiety "Prezentacja biznesowa" - 19 pytan w 8 ekranach
// Zrodlo: Google Forms https://forms.gle/heqpfVdLVDotNEPt6

import type { DefinicjaAnkiety, Ekran, Pytanie, Opcja } from '../types';

// Opcje dla pytania 2 - Etap biznesu
const opcjeEtapBiznesu: Opcja[] = [
  { id: 'etap_2lata_plus', label: 'Dziadam ponad 2 lata', value: 'dzialamy_2lata_plus' },
  { id: 'etap_do_2lat', label: 'Dziadam do 2 lat', value: 'dzialamy_do_2lat' },
  { id: 'etap_5lat_plus', label: 'Dziadam ponad 5 lat', value: 'dzialamy_5lat_plus' },
  { id: 'etap_10lat_plus', label: 'Dziadam ponad 10 lat', value: 'dzialamy_10lat_plus' },
  { id: 'etap_zakladam', label: 'Wlasnie zakladam dzialalnosc', value: 'zakladam' },
  { id: 'etap_planuje', label: 'Planuje zalozyc w najblizszych miesiacach', value: 'planuje' },
  { id: 'etap_etat', label: 'Pracuje na etacie, ale mysle o swoim', value: 'etat_mysle' },
  { id: 'etap_emeryt', label: 'Emeryt/rencista z biznesowym zacieciem', value: 'emeryt' },
  { id: 'etap_inne', label: 'Inne', value: 'inne' }
];

// Opcje dla pytania 5 - Branze (26 opcji)
const opcjeBranze: Opcja[] = [
  { id: 'branza_budownictwo', label: 'Budownictwo i remonty', value: 'budownictwo' },
  { id: 'branza_instalacje', label: 'Instalacje (hydraulika, elektryka, gaz, CO)', value: 'instalacje' },
  { id: 'branza_projektowanie', label: 'Projektowanie wnetrz', value: 'projektowanie' },
  { id: 'branza_handel', label: 'Handel i sklepy', value: 'handel' },
  { id: 'branza_transport', label: 'Transport i przeprowadzki', value: 'transport' },
  { id: 'branza_gastronomia', label: 'Gastronomia i catering', value: 'gastronomia' },
  { id: 'branza_zywnosc', label: 'Produkcja zywnosci i przetworstwo', value: 'zywnosc' },
  { id: 'branza_it', label: 'IT, strony internetowe, komputery', value: 'it' },
  { id: 'branza_marketing', label: 'Marketing, reklama, social media', value: 'marketing' },
  { id: 'branza_ksiegowosc', label: 'Ksiegowosc i biuro rachunkowe', value: 'ksiegowosc' },
  { id: 'branza_prawo', label: 'Prawo i doradztwo', value: 'prawo' },
  { id: 'branza_zdrowie', label: 'Zdrowie i uroda', value: 'zdrowie' },
  { id: 'branza_sztuka', label: 'Sztuka, rzemioslo artystyczne', value: 'sztuka' },
  { id: 'branza_wikliniarstwo', label: 'Wikliniarstwo i wyroby z wikliny', value: 'wikliniarstwo' },
  { id: 'branza_fotografia', label: 'Fotografia i video', value: 'fotografia' },
  { id: 'branza_edukacja', label: 'Edukacja, szkolenia, korepetycje', value: 'edukacja' },
  { id: 'branza_warsztaty', label: 'Warsztaty samochodowe', value: 'warsztaty' },
  { id: 'branza_produkcja', label: 'Produkcja i przemysl', value: 'produkcja' },
  { id: 'branza_agroturystyka', label: 'Agroturystyka', value: 'agroturystyka' },
  { id: 'branza_eventy', label: 'Eventy', value: 'eventy' },
  { id: 'branza_sprzatanie', label: 'Sprzatanie i utrzymanie czystosci', value: 'sprzatanie' },
  { id: 'branza_ochrona', label: 'Ochrona i monitoring', value: 'ochrona' },
  { id: 'branza_sport', label: 'Sport i rekreacja', value: 'sport' },
  { id: 'branza_uslugi_firmy', label: 'Uslugi dla firm - inne', value: 'uslugi_firmy' },
  { id: 'branza_uslugi_dom', label: 'Uslugi dla domu i ogrodu', value: 'uslugi_dom' },
  { id: 'branza_nie_wiem', label: 'Jeszcze nie wiem', value: 'nie_wiem' },
  { id: 'branza_inne', label: 'Inne', value: 'inne' }
];

// Opcje dla pytania 6 - Lokalizacje (14 miejscowosci)
const opcjeLokalizacje: Opcja[] = [
  { id: 'lok_wolowice', label: 'Wolowice', value: 'wolowice' },
  { id: 'lok_rybna', label: 'Rybna', value: 'rybna' },
  { id: 'lok_przeginia', label: 'Przeginia', value: 'przeginia' },
  { id: 'lok_cholerzyn', label: 'Cholerzyn', value: 'cholerzyn' },
  { id: 'lok_aleksandrowice', label: 'Aleksandrowice', value: 'aleksandrowice' },
  { id: 'lok_czernichow', label: 'Czernichow', value: 'czernichow' },
  { id: 'lok_kamien', label: 'Kamien', value: 'kamien' },
  { id: 'lok_rusocice', label: 'Rusocice', value: 'rusocice' },
  { id: 'lok_nowa_wies', label: 'Nowa Wies Szlachecka', value: 'nowa_wies' },
  { id: 'lok_dabrowa', label: 'Dabrowa Szlachecka', value: 'dabrowa' },
  { id: 'lok_klokoczyn', label: 'Klokoczyn', value: 'klokoczyn' },
  { id: 'lok_wolowice_dwor', label: 'Wolowice Dwor', value: 'wolowice_dwor' },
  { id: 'lok_krzeszowice', label: 'Krzeszowice', value: 'krzeszowice' },
  { id: 'lok_inna', label: 'Inna miejscowosc', value: 'inna' }
];

// Opcje dla pytania 7 - Wielkosc firmy
const opcjeWielkosc: Opcja[] = [
  { id: 'wiel_1', label: 'Tylko ja (jednoosobowa)', value: '1' },
  { id: 'wiel_2_5', label: '2-5 osob', value: '2-5' },
  { id: 'wiel_6_10', label: '6-10 osob', value: '6-10' },
  { id: 'wiel_11_25', label: '11-25 osob', value: '11-25' },
  { id: 'wiel_26_50', label: '26-50 osob', value: '26-50' },
  { id: 'wiel_50_plus', label: 'Powyzej 50 osob', value: '50+' },
  { id: 'wiel_inne', label: 'Inne', value: 'inne' }
];

// Opcje dla pytania 11 - Potrzeby (max 3)
const opcjePotrzeby: Opcja[] = [
  { id: 'pot_pierwszych_klientow', label: 'Pierwszych klientow', value: 'pierwszych_klientow' },
  { id: 'pot_wiecej_klientow', label: 'Wiecej klientow', value: 'wiecej_klientow' },
  { id: 'pot_fachowcow', label: 'Fachowcow do wspolpracy', value: 'fachowcow' },
  { id: 'pot_partnera', label: 'Partnera biznesowego', value: 'partnera' },
  { id: 'pot_ksiegowej', label: 'Dobrej ksiegowej', value: 'ksiegowej' },
  { id: 'pot_internet', label: 'Pomocy z internetem/FB/strona', value: 'internet' },
  { id: 'pot_kasa', label: 'Kasy na start/rozwoj', value: 'kasa' },
  { id: 'pot_miejsce', label: 'Miejsca na warsztat/biuro/magazyn', value: 'miejsce' },
  { id: 'pot_pracownikow', label: 'Pracownikow', value: 'pracownikow' },
  { id: 'pot_transport', label: 'Transportu/dostaw', value: 'transport' },
  { id: 'pot_sprzet', label: 'Dostepu do maszyn/sprzetu', value: 'sprzet' },
  { id: 'pot_rozglos', label: 'Rozglosu w okolicy', value: 'rozglos' },
  { id: 'pot_inne', label: 'Inne', value: 'inne' }
];

// Opcje dla pytania 12 - Co mozesz dac innym
const opcjeMozliwosci: Opcja[] = [
  { id: 'moz_uslugi', label: 'Uslugi w swojej branzy', value: 'uslugi' },
  { id: 'moz_polecenia', label: 'Polecenia klientow', value: 'polecenia' },
  { id: 'moz_doswiadczenie', label: 'Doswiadczenie i porady', value: 'doswiadczenie' },
  { id: 'moz_kontakty', label: 'Kontakty biznesowe', value: 'kontakty' },
  { id: 'moz_miejsce', label: 'Miejsce na spotkania', value: 'miejsce' },
  { id: 'moz_transport', label: 'Transport/dostawy', value: 'transport' },
  { id: 'moz_narzedzia', label: 'Dostep do narzedzi/sprzetu', value: 'narzedzia' },
  { id: 'moz_promocja', label: 'Pomoc przy promocji', value: 'promocja' },
  { id: 'moz_szkolenia', label: 'Szkolenia/warsztaty', value: 'szkolenia' },
  { id: 'moz_projekty', label: 'Wspolne projekty', value: 'projekty' },
  { id: 'moz_zatrudnienie', label: 'Zatrudnienie/zlecenia', value: 'zatrudnienie' },
  { id: 'moz_mentoring', label: 'Mentoring', value: 'mentoring' },
  { id: 'moz_inne', label: 'Inne', value: 'inne' }
];

// Opcje dla pytania 13 - W czym chcesz uczestniczyc
const opcjeUczestnictwo: Opcja[] = [
  { id: 'ucz_networking', label: 'Spotkania networkingowe', value: 'networking' },
  { id: 'ucz_promocje', label: 'Wspolne akcje promocyjne', value: 'promocje' },
  { id: 'ucz_szkolenia', label: 'Szkolenia i warsztaty', value: 'szkolenia' },
  { id: 'ucz_barter', label: 'Wymiana uslug (barter)', value: 'barter' },
  { id: 'ucz_projekty', label: 'Wspolne projekty', value: 'projekty' },
  { id: 'ucz_targi', label: 'Targi i eventy lokalne', value: 'targi' },
  { id: 'ucz_wsparcie', label: 'Grupa wsparcia dla przedsiebiorcow', value: 'wsparcie' },
  { id: 'ucz_kluby', label: 'Kluby tematyczne', value: 'kluby' },
  { id: 'ucz_zakupy', label: 'Wspolne zakupy (lepsze ceny)', value: 'zakupy' },
  { id: 'ucz_inne', label: 'Inne', value: 'inne' }
];

// Opcje dla pytania 19 - Zgody RODO
const opcjeRodo: Opcja[] = [
  { id: 'rodo_dane', label: 'Wyrazam zgode na przetwarzanie moich danych osobowych', value: 'zgoda_dane' },
  { id: 'rodo_kontakt', label: 'Wyrazam zgode na kontakt w sprawach zwiazanych z siecia', value: 'zgoda_kontakt' },
  { id: 'rodo_wizytowka', label: 'Wyrazam zgode na publikacje mojej wizytowki w katalogu', value: 'zgoda_wizytowka' }
];

// Definicja 8 ekranow z 19 pytaniami

const ekran1: Ekran = {
  id: 1,
  tytul: 'Dane osobowe',
  opis: 'Podstawowe informacje o Tobie i Twojej firmie',
  pytania: [
    {
      id: 'p1_imie',
      numer: 1,
      ekran: 1,
      tekst: 'Jak masz na imie? (Podaj imie i nazwisko)',
      typ: 'text',
      wymagane: true,
      placeholder: 'np. Jan Kowalski'
    },
    {
      id: 'p2_etap',
      numer: 2,
      ekran: 1,
      tekst: 'Na jakim etapie jest Twoj biznes?',
      typ: 'radio',
      wymagane: true,
      opcje: opcjeEtapBiznesu
    },
    {
      id: 'p3_firma',
      numer: 3,
      ekran: 1,
      tekst: 'Jak nazywa sie Twoja firma? (lub bedzie)',
      typ: 'text',
      wymagane: true,
      placeholder: 'np. Uslogi Budowlane Kowalski'
    }
  ]
};

const ekran2: Ekran = {
  id: 2,
  tytul: 'Opis dzialalnosci',
  opis: 'Opowiedz nam czym sie zajmujesz',
  pytania: [
    {
      id: 'p4_opis',
      numer: 4,
      ekran: 2,
      tekst: 'Czym sie zajmujesz? Opisz w 2-3 zdaniach',
      typ: 'textarea',
      wymagane: true,
      placeholder: 'Opisz krotko czym sie zajmujesz, jakie uslugi oferujesz lub jakie produkty sprzedajesz...',
      walidacja: { min: 20, max: 500 },
      weryfikujace: ['p5_branza'] // cross-check z branza
    }
  ]
};

const ekran3: Ekran = {
  id: 3,
  tytul: 'Branza',
  opis: 'Wybierz branže w ktorych dzialasz',
  pytania: [
    {
      id: 'p5_branza',
      numer: 5,
      ekran: 3,
      tekst: 'W jakiej branzy dzialasz? (wybierz wszystkie pasujace)',
      typ: 'checkbox',
      wymagane: true,
      opcje: opcjeBranze,
      walidacja: { minWybor: 1 },
      weryfikujace: ['p4_opis'] // cross-check z opisem
    }
  ]
};

const ekran4: Ekran = {
  id: 4,
  tytul: 'Lokalizacja',
  opis: 'Gdzie mozemy Cie znalezc?',
  pytania: [
    {
      id: 'p6_lokalizacja',
      numer: 6,
      ekran: 4,
      tekst: 'Gdzie Cie znajdziemy? Skad jestes?',
      typ: 'checkbox',
      wymagane: true,
      opcje: opcjeLokalizacje,
      walidacja: { minWybor: 1 }
    },
    {
      id: 'p7_wielkosc',
      numer: 7,
      ekran: 4,
      tekst: 'Jak duza jest Twoja firma?',
      typ: 'radio',
      wymagane: true,
      opcje: opcjeWielkosc
    }
  ]
};

const ekran5: Ekran = {
  id: 5,
  tytul: 'Oferta i klient',
  opis: 'Opowiedz nam o swojej ofercie',
  pytania: [
    {
      id: 'p8_oferta',
      numer: 8,
      ekran: 5,
      tekst: 'Co konkretnie oferujesz?',
      typ: 'textarea',
      wymagane: true,
      placeholder: 'Opisz swoje uslugi lub produkty...',
      walidacja: { min: 20, max: 500 },
      weryfikujace: ['p9_klient'] // cross-check z idealnym klientem
    },
    {
      id: 'p9_klient',
      numer: 9,
      ekran: 5,
      tekst: 'Jaki jest Twoj idealny klient?',
      typ: 'textarea',
      wymagane: true,
      placeholder: 'Opisz do kogo kierujesz swoja oferte...',
      walidacja: { min: 10, max: 300 },
      weryfikujace: ['p8_oferta'] // cross-check z oferta
    },
    {
      id: 'p10_wspolpraca',
      numer: 10,
      ekran: 5,
      tekst: 'Kogo szukasz do wspolpracy?',
      typ: 'textarea',
      wymagane: true,
      placeholder: 'Jakich partnerow biznesowych szukasz...',
      walidacja: { min: 10, max: 300 }
    }
  ]
};

const ekran6: Ekran = {
  id: 6,
  tytul: 'Twoje potrzeby',
  opis: 'Czego najbardziej potrzebujesz?',
  pytania: [
    {
      id: 'p11_potrzeby',
      numer: 11,
      ekran: 6,
      tekst: 'Czego najbardziej potrzebujesz? (wybierz maksymalnie 3)',
      typ: 'checkbox',
      wymagane: true,
      opcje: opcjePotrzeby,
      walidacja: { minWybor: 1, maxWybor: 3 }
    }
  ]
};

const ekran7: Ekran = {
  id: 7,
  tytul: 'Co mozesz dac?',
  opis: 'Jak mozesz pomoc innym?',
  pytania: [
    {
      id: 'p12_mozliwosci',
      numer: 12,
      ekran: 7,
      tekst: 'Co mozesz dac innym lokalnym firmom?',
      typ: 'checkbox',
      wymagane: true,
      opcje: opcjeMozliwosci,
      walidacja: { minWybor: 1 }
    },
    {
      id: 'p13_uczestnictwo',
      numer: 13,
      ekran: 7,
      tekst: 'W czym chcesz uczestniczyc?',
      typ: 'checkbox',
      wymagane: true,
      opcje: opcjeUczestnictwo,
      walidacja: { minWybor: 1 }
    }
  ]
};

const ekran8: Ekran = {
  id: 8,
  tytul: 'Kontakt i zgody',
  opis: 'Ostatni krok - dane kontaktowe',
  pytania: [
    {
      id: 'p14_logo',
      numer: 14,
      ekran: 8,
      tekst: 'Zdjecie lub logo firmy (opcjonalne)',
      typ: 'file',
      wymagane: false,
      opis: 'Akceptowane formaty: JPG, PNG, GIF. Max 5MB.'
    },
    {
      id: 'p15_praca',
      numer: 15,
      ekran: 8,
      tekst: 'Zdjecie swojej pracy (opcjonalne)',
      typ: 'file',
      wymagane: false,
      opis: 'Pokaz przyklad swojej pracy lub produktu.'
    },
    {
      id: 'p16_oferta_specjalna',
      numer: 16,
      ekran: 8,
      tekst: 'Masz pytanie lub oferte specjalna? (opcjonalne)',
      typ: 'textarea',
      wymagane: false,
      placeholder: 'Wpisz swoje pytanie lub specjalna oferte dla czlonkow sieci...'
    },
    {
      id: 'p17_telefon',
      numer: 17,
      ekran: 8,
      tekst: 'Numer telefonu',
      typ: 'tel',
      wymagane: true,
      placeholder: '+48 123 456 789',
      walidacja: { pattern: '^(\\+48)?\\s?\\d{3}\\s?\\d{3}\\s?\\d{3}$' }
    },
    {
      id: 'p18_social',
      numer: 18,
      ekran: 8,
      tekst: 'Gdzie jeszcze Cie znajdziemy? (FB, IG, www)',
      typ: 'text',
      wymagane: false,
      placeholder: 'np. facebook.com/mojafirma, @mojafirma, www.mojafirma.pl'
    },
    {
      id: 'p19_rodo',
      numer: 19,
      ekran: 8,
      tekst: 'Zgody RODO (wszystkie wymagane)',
      typ: 'checkbox',
      wymagane: true,
      opcje: opcjeRodo,
      walidacja: { minWybor: 3 } // wszystkie 3 zgody wymagane
    }
  ]
};

// Pelna definicja ankiety
export const definicjaAnkiety: DefinicjaAnkiety = {
  id: 'prezentacja-biznesowa-wolowice',
  nazwa: 'Prezentacja biznesowa grupy "Rozwijamy biznes. Wolowice i okolice"',
  wersja: '1.0.0',
  opis: 'Ankieta dla przedsiebiorcow z regionu Wolowic i okolic. Pomaga nam poznac Twoja dzialalnosc i potrzeby.',
  liczbaPytan: 19,
  ekrany: [ekran1, ekran2, ekran3, ekran4, ekran5, ekran6, ekran7, ekran8]
};

// Export opcji dla statystyk
export const wszystkieOpcje = {
  etapBiznesu: opcjeEtapBiznesu,
  branze: opcjeBranze,
  lokalizacje: opcjeLokalizacje,
  wielkosc: opcjeWielkosc,
  potrzeby: opcjePotrzeby,
  mozliwosci: opcjeMozliwosci,
  uczestnictwo: opcjeUczestnictwo,
  rodo: opcjeRodo
};

// Nazwy ekranow dla progress bar
export const nazwyEkranow = [
  'Dane osobowe',
  'Opis',
  'Branza',
  'Lokalizacja',
  'Oferta',
  'Potrzeby',
  'Mozliwosci',
  'Kontakt'
];
