// AnkietaForm - glowny formularz wieloekranowy
import React, { useState, useCallback } from 'react';
import type { AnkietaFormProps } from '../types';
import { ProgressBar } from './ProgressBar';
import { EkranKarta } from './EkranKarta';
import { walidujEkran } from '../lib/walidacja';
import { nazwyEkranow } from '../lib/definicja-ankiety';

export function AnkietaForm({
  ankieta,
  onSubmit,
  onSave,
  poczatkoweOdpowiedzi = {},
  poczatkowyEkran = 1
}: AnkietaFormProps) {
  const [aktualnyEkran, setAktualnyEkran] = useState(poczatkowyEkran);
  const [odpowiedzi, setOdpowiedzi] = useState<Record<string, any>>(poczatkoweOdpowiedzi);
  const [bledy, setBledy] = useState<Record<string, string>>({});
  const [wysylanie, setWysylanie] = useState(false);
  const [wyslano, setWyslano] = useState(false);

  const ekran = ankieta.ekrany[aktualnyEkran - 1];
  const ostatniEkran = aktualnyEkran === ankieta.ekrany.length;

  const handleChange = useCallback((pytanieId: string, wartosc: any) => {
    setOdpowiedzi(prev => ({
      ...prev,
      [pytanieId]: wartosc
    }));
    // Usun blad dla tego pytania
    setBledy(prev => {
      const nowe = { ...prev };
      delete nowe[pytanieId];
      return nowe;
    });
  }, []);

  const handleDalej = () => {
    // Waliduj aktualny ekran
    const wynik = walidujEkran(ekran, odpowiedzi);

    if (!wynik.valid) {
      setBledy(wynik.bledy);
      // Scroll do pierwszego bledu
      const pierwszyBlad = Object.keys(wynik.bledy)[0];
      document.getElementById(pierwszyBlad)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setBledy({});

    // Zapisz postep
    if (onSave) {
      onSave(odpowiedzi, aktualnyEkran);
    }

    // Przejdz do nastepnego ekranu
    if (!ostatniEkran) {
      setAktualnyEkran(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleWstecz = () => {
    if (aktualnyEkran > 1) {
      setAktualnyEkran(prev => prev - 1);
      setBledy({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigate = (numer: number) => {
    if (numer < aktualnyEkran) {
      setAktualnyEkran(numer);
      setBledy({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleWyslij = async () => {
    // Waliduj ostatni ekran
    const wynik = walidujEkran(ekran, odpowiedzi);

    if (!wynik.valid) {
      setBledy(wynik.bledy);
      return;
    }

    setWysylanie(true);

    try {
      await onSubmit(odpowiedzi);
      setWyslano(true);
    } catch (error) {
      console.error('[ANKIETA] Blad wysylania:', error);
      alert('Wystapil blad podczas wysylania ankiety. Sprobuj ponownie.');
    } finally {
      setWysylanie(false);
    }
  };

  // Ekran sukcesu
  if (wyslano) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
            Dziekujemy!
          </h2>
          <p className="text-green-700 dark:text-green-300">
            Twoja ankieta zostala wyslana. Skontaktujemy sie z Toba wkrotce.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Tytul ankiety */}
      <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
        {ankieta.nazwa}
      </h1>

      {/* Progress bar */}
      <ProgressBar
        aktualnyEkran={aktualnyEkran}
        liczbaEkranow={ankieta.ekrany.length}
        nazwyEkranow={nazwyEkranow}
        onNavigate={handleNavigate}
      />

      {/* Karta ekranu */}
      <EkranKarta
        ekran={ekran}
        odpowiedzi={odpowiedzi}
        onChange={handleChange}
        bledy={bledy}
      />

      {/* Przyciski nawigacji */}
      <div className="flex justify-between mt-6">
        <button
          onClick={handleWstecz}
          disabled={aktualnyEkran === 1}
          className={`
            px-6 py-3 rounded-lg font-medium
            ${aktualnyEkran === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }
            transition-colors
          `}
        >
          ← Wstecz
        </button>

        {ostatniEkran ? (
          <button
            onClick={handleWyslij}
            disabled={wysylanie}
            className={`
              px-8 py-3 rounded-lg font-medium
              ${wysylanie
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
              }
              transition-colors
            `}
          >
            {wysylanie ? 'Wysylanie...' : 'Wyslij ankiete ✓'}
          </button>
        ) : (
          <button
            onClick={handleDalej}
            className="px-6 py-3 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Dalej →
          </button>
        )}
      </div>

      {/* Info o wymaganych polach */}
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
        * Pola oznaczone gwiazdka sa wymagane
      </p>
    </div>
  );
}

export default AnkietaForm;
