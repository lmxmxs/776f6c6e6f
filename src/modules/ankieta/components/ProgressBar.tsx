// ProgressBar - pasek postepu 8 ekranow
import React from 'react';
import type { ProgressBarProps } from '../types';

export function ProgressBar({
  aktualnyEkran,
  liczbaEkranow,
  nazwyEkranow,
  onNavigate
}: ProgressBarProps) {
  const procent = Math.round((aktualnyEkran / liczbaEkranow) * 100);

  return (
    <div className="w-full mb-8">
      {/* Pasek postepu */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Ekran {aktualnyEkran}/{liczbaEkranow}
        </span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {procent}%
        </span>
      </div>

      {/* Pasek graficzny */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
          style={{ width: `${procent}%` }}
        />
      </div>

      {/* Nazwy ekranow */}
      <div className="hidden md:flex justify-between">
        {nazwyEkranow.map((nazwa, index) => {
          const numer = index + 1;
          const aktywny = numer === aktualnyEkran;
          const ukonczony = numer < aktualnyEkran;

          return (
            <button
              key={numer}
              onClick={() => onNavigate && numer < aktualnyEkran && onNavigate(numer)}
              disabled={numer >= aktualnyEkran}
              className={`
                flex flex-col items-center text-xs
                ${aktywny ? 'text-blue-600 font-bold' : ''}
                ${ukonczony ? 'text-green-600 cursor-pointer hover:text-green-700' : ''}
                ${numer > aktualnyEkran ? 'text-gray-400' : ''}
                transition-colors
              `}
            >
              <span
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center mb-1
                  ${aktywny ? 'bg-blue-600 text-white' : ''}
                  ${ukonczony ? 'bg-green-500 text-white' : ''}
                  ${numer > aktualnyEkran ? 'bg-gray-300 dark:bg-gray-600 text-gray-500' : ''}
                `}
              >
                {ukonczony ? '✓' : numer}
              </span>
              <span className="max-w-[60px] text-center truncate">{nazwa}</span>
            </button>
          );
        })}
      </div>

      {/* Wersja mobilna - tylko aktualny ekran */}
      <div className="md:hidden text-center">
        <span className="text-sm font-medium text-blue-600">
          {nazwyEkranow[aktualnyEkran - 1]}
        </span>
      </div>
    </div>
  );
}

export default ProgressBar;
