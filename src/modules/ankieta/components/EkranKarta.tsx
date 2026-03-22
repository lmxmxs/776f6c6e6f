// EkranKarta - kontener pojedynczego ekranu ankiety
import React from 'react';
import type { EkranKartaProps } from '../types';
import { PytanieRenderer } from './PytanieRenderer';

export function EkranKarta({
  ekran,
  odpowiedzi,
  onChange,
  bledy = {}
}: EkranKartaProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
      {/* Naglowek ekranu */}
      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {ekran.tytul}
        </h2>
        {ekran.opis && (
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {ekran.opis}
          </p>
        )}
      </div>

      {/* Pytania */}
      <div className="space-y-6">
        {ekran.pytania.map((pytanie) => (
          <PytanieRenderer
            key={pytanie.id}
            pytanie={pytanie}
            wartosc={odpowiedzi[pytanie.id]}
            onChange={(wartosc) => onChange(pytanie.id, wartosc)}
            blad={bledy[pytanie.id]}
          />
        ))}
      </div>
    </div>
  );
}

export default EkranKarta;
