// Kontener logiczny dla ankiety - obsluguje localStorage i API
import React, { useEffect, useState } from 'react';
import { AnkietaForm } from './AnkietaForm';
import { definicjaAnkiety } from '../lib/definicja-ankiety';

export function AnkietaContainer() {
  const [initialData, setInitialData] = useState<{
    odpowiedzi: Record<string, any>;
    ekran: number;
  } | null>(null);

  // Wczytaj draft przy starcie
  useEffect(() => {
    try {
      const draft = localStorage.getItem('ankieta_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        // Sprawdz czy draft nie jest starszy niz 24h
        const timestamp = new Date(parsed.timestamp);
        const teraz = new Date();
        const roznica = teraz.getTime() - timestamp.getTime();
        
        if (roznica < 24 * 60 * 60 * 1000) {
          setInitialData({
            odpowiedzi: parsed.odpowiedzi || {},
            ekran: parsed.ekran || 1
          });
          console.log('[ANKIETA] Wczytano draft z ekranu:', parsed.ekran);
        } else {
          localStorage.removeItem('ankieta_draft');
          setInitialData({ odpowiedzi: {}, ekran: 1 });
        }
      } else {
        setInitialData({ odpowiedzi: {}, ekran: 1 });
      }
    } catch (e) {
      console.error('[ANKIETA] Blad wczytywania draftu:', e);
      setInitialData({ odpowiedzi: {}, ekran: 1 });
    }
  }, []);

  const handleSubmit = async (odpowiedzi: Record<string, any>) => {
    const response = await fetch('/api/ankieta/zapisz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        odpowiedzi,
        zakonczono: true
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Blad zapisywania');
    }

    // Wyczysc draft po sukcesie
    localStorage.removeItem('ankieta_draft');
    console.log('[ANKIETA] Zapisano:', result.id);
  };

  const handleSave = (odpowiedzi: Record<string, any>, ekran: number) => {
    localStorage.setItem('ankieta_draft', JSON.stringify({
      odpowiedzi,
      ekran,
      timestamp: new Date().toISOString()
    }));
    console.log('[ANKIETA] Draft zapisany, ekran:', ekran);
  };

  // Nie renderuj dopóki nie sprawdzimy localStorage (zeby uniknac migania)
  if (!initialData) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AnkietaForm
      ankieta={definicjaAnkiety}
      onSubmit={handleSubmit}
      onSave={handleSave}
      poczatkoweOdpowiedzi={initialData.odpowiedzi}
      poczatkowyEkran={initialData.ekran}
    />
  );
}
