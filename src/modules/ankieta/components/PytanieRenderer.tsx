// PytanieRenderer - renderuje pytanie w zaleznosci od typu
import React from 'react';
import type { PytanieRendererProps } from '../types';

export function PytanieRenderer({
  pytanie,
  wartosc,
  onChange,
  blad
}: PytanieRendererProps) {
  const baseInputClass = `
    w-full px-4 py-3 rounded-lg border
    ${blad
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
    }
    bg-white dark:bg-gray-800
    text-gray-900 dark:text-gray-100
    focus:outline-none focus:ring-2
    transition-colors
  `;

  const renderInput = () => {
    switch (pytanie.typ) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <input
            type={pytanie.typ}
            value={wartosc || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={pytanie.placeholder}
            className={baseInputClass}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={wartosc || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={pytanie.placeholder}
            rows={4}
            className={baseInputClass + ' resize-none'}
          />
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {pytanie.opcje?.map((opcja) => (
              <label
                key={opcja.id}
                className={`
                  flex items-center p-3 rounded-lg border cursor-pointer
                  ${wartosc === opcja.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }
                  transition-colors
                `}
              >
                <input
                  type="radio"
                  name={pytanie.id}
                  value={opcja.value}
                  checked={wartosc === opcja.value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 text-gray-700 dark:text-gray-300">
                  {opcja.label}
                </span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        const selectedValues = Array.isArray(wartosc) ? wartosc : [];
        const maxWybor = pytanie.walidacja?.maxWybor;

        return (
          <div className="space-y-2">
            {maxWybor && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Wybrano: {selectedValues.length}/{maxWybor}
                {selectedValues.length >= maxWybor && (
                  <span className="text-orange-500 ml-2">(maksimum)</span>
                )}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {pytanie.opcje?.map((opcja) => {
                const isChecked = selectedValues.includes(opcja.value);
                const isDisabled = maxWybor && selectedValues.length >= maxWybor && !isChecked;

                return (
                  <label
                    key={opcja.id}
                    className={`
                      flex items-center p-3 rounded-lg border cursor-pointer
                      ${isChecked
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                      transition-colors
                    `}
                  >
                    <input
                      type="checkbox"
                      value={opcja.value}
                      checked={isChecked}
                      disabled={isDisabled}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onChange([...selectedValues, opcja.value]);
                        } else {
                          onChange(selectedValues.filter(v => v !== opcja.value));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="ml-3 text-gray-700 dark:text-gray-300 text-sm">
                      {opcja.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        );

      case 'file':
        return (
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Dla teraz zapisujemy tylko nazwe pliku
                  // Upload bedzie obslugiwany przez API
                  onChange(file.name);
                }
              }}
              className={`
                block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                dark:file:bg-blue-900 dark:file:text-blue-300
                hover:file:bg-blue-100
                cursor-pointer
              `}
            />
            {pytanie.opis && (
              <p className="text-xs text-gray-500">{pytanie.opis}</p>
            )}
            {wartosc && (
              <p className="text-sm text-green-600">Wybrano: {wartosc}</p>
            )}
          </div>
        );

      default:
        return <p>Nieobslugiwany typ pytania: {pytanie.typ}</p>;
    }
  };

  return (
    <div className="mb-6">
      <label className="block mb-2">
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          {pytanie.numer}. {pytanie.tekst}
          {pytanie.wymagane && <span className="text-red-500 ml-1">*</span>}
        </span>
      </label>

      {pytanie.opis && pytanie.typ !== 'file' && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {pytanie.opis}
        </p>
      )}

      {renderInput()}

      {blad && (
        <p className="mt-1 text-sm text-red-500">{blad}</p>
      )}
    </div>
  );
}

export default PytanieRenderer;
