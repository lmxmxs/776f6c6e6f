// WynikiWykres - wykresy statystyk ankiety
import React from 'react';
import type { WynikiWykresProps, RozkladOpcji } from '../types';

// Prosta implementacja wykresow bez zewnetrznych bibliotek
// Mozna pozniej zamienic na Recharts

interface WykresSlupkowyProps {
  dane: RozkladOpcji[];
  tytul: string;
  kolor?: string;
}

function WykresSlupkowy({ dane, tytul, kolor = 'bg-blue-500' }: WykresSlupkowyProps) {
  const maxWartosc = Math.max(...dane.map(d => d.liczba), 1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        {tytul}
      </h3>
      <div className="space-y-3">
        {dane.slice(0, 10).map((item, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400 truncate max-w-[70%]">
                {item.opcja}
              </span>
              <span className="text-gray-800 dark:text-gray-200 font-medium">
                {item.liczba} ({item.procent}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`${kolor} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${(item.liczba / maxWartosc) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface WykresKolowyProps {
  dane: RozkladOpcji[];
  tytul: string;
}

function WykresKolowy({ dane, tytul }: WykresKolowyProps) {
  const kolory = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
    'bg-orange-500', 'bg-cyan-500'
  ];

  const daneZKolorem = dane.slice(0, 10).map((item, index) => ({
    ...item,
    kolor: kolory[index % kolory.length]
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        {tytul}
      </h3>

      {/* Legenda */}
      <div className="grid grid-cols-2 gap-2">
        {daneZKolorem.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-4 h-4 rounded ${item.kolor} mr-2`} />
            <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {item.opcja} ({item.procent}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface KartaStatystykProps {
  tytul: string;
  wartosc: number | string;
  opis?: string;
  ikona?: string;
}

function KartaStatystyk({ tytul, wartosc, opis, ikona }: KartaStatystykProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{tytul}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{wartosc}</p>
          {opis && <p className="text-xs text-gray-400">{opis}</p>}
        </div>
        {ikona && <span className="text-3xl">{ikona}</span>}
      </div>
    </div>
  );
}

export function WynikiWykres({ statystyki, typ = 'wszystko' }: WynikiWykresProps) {
  const {
    liczbaOdpowiedzi,
    liczbaZakonczonych,
    sredniaEkranow,
    rozkladBranzy,
    rozkladLokalizacji,
    rozkladWielkosci,
    rozkladPotrzeb,
    rozkladMozliwosci,
    rozkladUczestnictwa
  } = statystyki;

  const procentZakonczonych = liczbaOdpowiedzi > 0
    ? Math.round((liczbaZakonczonych / liczbaOdpowiedzi) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Karty podsumowania */}
      {(typ === 'wszystko') && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KartaStatystyk
            tytul="Wszystkie odpowiedzi"
            wartosc={liczbaOdpowiedzi}
            ikona="📋"
          />
          <KartaStatystyk
            tytul="Zakonczone"
            wartosc={liczbaZakonczonych}
            opis={`${procentZakonczonych}% ukonczonych`}
            ikona="✓"
          />
          <KartaStatystyk
            tytul="Srednia ekranow"
            wartosc={sredniaEkranow.toFixed(1)}
            opis="z 8 ekranow"
            ikona="📊"
          />
          <KartaStatystyk
            tytul="Procent ukonczenia"
            wartosc={`${procentZakonczonych}%`}
            ikona="🎯"
          />
        </div>
      )}

      {/* Wykresy */}
      <div className="grid md:grid-cols-2 gap-6">
        {(typ === 'branza' || typ === 'wszystko') && (
          <WykresSlupkowy
            dane={rozkladBranzy.filter(r => r.liczba > 0)}
            tytul="Rozklad branz"
            kolor="bg-blue-500"
          />
        )}

        {(typ === 'lokalizacja' || typ === 'wszystko') && (
          <WykresSlupkowy
            dane={rozkladLokalizacji.filter(r => r.liczba > 0)}
            tytul="Rozklad lokalizacji"
            kolor="bg-green-500"
          />
        )}

        {(typ === 'wielkosc' || typ === 'wszystko') && (
          <WykresKolowy
            dane={rozkladWielkosci.filter(r => r.liczba > 0)}
            tytul="Wielkosc firm"
          />
        )}

        {(typ === 'potrzeby' || typ === 'wszystko') && (
          <WykresSlupkowy
            dane={rozkladPotrzeb.filter(r => r.liczba > 0)}
            tytul="Najpopularniejsze potrzeby"
            kolor="bg-orange-500"
          />
        )}

        {(typ === 'mozliwosci' || typ === 'wszystko') && (
          <WykresSlupkowy
            dane={rozkladMozliwosci.filter(r => r.liczba > 0)}
            tytul="Co firmy moga dac"
            kolor="bg-purple-500"
          />
        )}

        {typ === 'wszystko' && (
          <WykresSlupkowy
            dane={rozkladUczestnictwa.filter(r => r.liczba > 0)}
            tytul="Zainteresowanie uczestnictwem"
            kolor="bg-teal-500"
          />
        )}
      </div>
    </div>
  );
}

export default WynikiWykres;
