# Modul Ankieta

**Wersja:** 1.0.0
**Status:** production
**Autor:** Barnabaai

## Opis

Uniwersalny modul ankietowy dla stron Astro. Obsluguje wieloekranowe formularze
z walidacja, pytaniami weryfikujacymi (cross-check), wykresami i statystykami.

## Instalacja

```bash
# Skopiuj modul do projektu
cp -r /WWW/shared/modules/ankieta src/modules/

# Zainstaluj zaleznosci (jesli uzywasz Recharts)
npm install recharts
```

## Uzycie

### Formularz ankiety

```tsx
import { AnkietaForm, definicjaAnkiety } from '@/modules/ankieta';

function StronaAnkiety() {
  const handleSubmit = async (odpowiedzi: Record<string, any>) => {
    await fetch('/api/ankieta/zapisz', {
      method: 'POST',
      body: JSON.stringify(odpowiedzi)
    });
  };

  return (
    <AnkietaForm
      ankieta={definicjaAnkiety}
      onSubmit={handleSubmit}
    />
  );
}
```

### Wykresy statystyk

```tsx
import { WynikiWykres, obliczStatystyki } from '@/modules/ankieta';

function StronaWynikow({ odpowiedzi }) {
  const statystyki = obliczStatystyki(odpowiedzi);

  return <WynikiWykres statystyki={statystyki} />;
}
```

## Eksporty

### Komponenty

| Komponent | Opis |
|-----------|------|
| `AnkietaForm` | Glowny formularz 8-ekranowy |
| `EkranKarta` | Karta pojedynczego ekranu |
| `PytanieRenderer` | Renderer pytania (wg typu) |
| `ProgressBar` | Pasek postepu 8 ekranow |
| `WynikiWykres` | Wykresy statystyk |

### Funkcje

| Funkcja | Opis |
|---------|------|
| `walidujEkran(ekran, odpowiedzi)` | Walidacja ekranu |
| `walidujCrossCheck(odpowiedzi)` | Pytania weryfikujace |
| `obliczStatystyki(odpowiedzi)` | Agregacja statystyk |
| `topOpcje(rozklad, n)` | Top N opcji z rozkladu |

### Definicje

| Eksport | Opis |
|---------|------|
| `definicjaAnkiety` | Pelna definicja 19 pytan w 8 ekranach |
| `wszystkieOpcje` | Wszystkie opcje dla statystyk |
| `nazwyEkranow` | Nazwy 8 ekranow dla progress bar |

## Struktura ankiety

Ankieta "Prezentacja biznesowa" zawiera:

- **8 ekranow** z progress barem
- **19 pytan** roznych typow
- **Cross-check** pytan weryfikujacych
- **Max 3 opcje** w pytaniu o potrzeby
- **3 zgody RODO** wymagane

### Ekrany

1. Dane osobowe (3 pytania)
2. Opis dzialalnosci (1 pytanie)
3. Branza (26 opcji)
4. Lokalizacja (14 miejscowosci + wielkosc)
5. Oferta i klient (3 pytania)
6. Potrzeby (max 3 z 13 opcji)
7. Mozliwosci (13 + 10 opcji)
8. Kontakt i zgody (6 pytan)

## API Endpoints

```
POST /api/ankieta/zapisz      - Zapisz odpowiedz
GET  /api/ankieta/wyniki/:id  - Pobierz odpowiedz
GET  /api/ankieta/statystyki  - Agregacje
```

## Konfiguracja

| Zmienna | Wymagana | Opis |
|---------|----------|------|
| ANKIETA_STORAGE_PATH | Nie | Sciezka do pliku JSON |

## Walidacja

- Pola wymagane blokuja przejscie do nastepnego ekranu
- Max 3 opcje dla pytania o potrzeby
- Format telefonu: +48 lub 9 cyfr
- Cross-check: opis vs branza, oferta vs klient

## Pliki

```
ankieta/
├── module.json              # Manifest
├── .module-version          # 1.0.0
├── index.ts                 # Eksporty
├── README.md                # Ten plik
├── components/
│   ├── AnkietaForm.tsx
│   ├── EkranKarta.tsx
│   ├── PytanieRenderer.tsx
│   ├── ProgressBar.tsx
│   └── WynikiWykres.tsx
├── lib/
│   ├── definicja-ankiety.ts
│   ├── walidacja.ts
│   ├── obliczanie.ts
│   └── storage.ts
└── types/
    └── index.ts
```

---

*Barnabaai - 2026-01-14*
