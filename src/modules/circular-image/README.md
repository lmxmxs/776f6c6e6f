# CircularImage Module

Uniwersalny moduł do tworzenia okrągłych obrazów z konfigurowalnymi efektami.

## Charakterystyka

- ✅ Konfigurowalne rozmiary (sm, md, lg, xl)
- ✅ Konfigurowalne kolory obramowania i glow
- ✅ Konfigurowalna grubość obramowania
- ✅ Efekt świecenia (glow)
- ✅ Efekt pulsowania
- ✅ Interaktywny efekt podążania za kursorem
- ✅ Wsparcie dla linków
- ✅ Etykiety pod obrazem
- ✅ Responsive design
- ✅ Dark mode compatible

## Instalacja

1. Skopiuj katalog `circular-image/` do `src/modules/`
2. Zaimportuj komponent:

```astro
---
import CircularImage from '@/modules/circular-image/components/CircularImage.astro';
---
```

## Użycie

### Podstawowe użycie

```astro
<CircularImage
  src="/images/example.jpg"
  alt="Opis obrazu"
  size="md"
/>
```

### Z niestandardowymi kolorami i obramowaniem

```astro
<CircularImage
  src="/images/profile.jpg"
  alt="Zdjęcie profilowe"
  size="lg"
  borderColor="#FF4B4B"
  borderWidth={4}
  glow={true}
  pulse={true}
/>
```

### Z linkiem i etykietą

```astro
<CircularImage
  src="/images/category.jpg"
  alt="Kategoria"
  size="xl"
  borderColor="#3B82F6"
  href="/kategoria"
  label="Kategoria"
  labelColor="#3B82F6"
  type="interactive"
/>
```

### Typ minimalny (bez efektów)

```astro
<CircularImage
  src="/images/simple.jpg"
  alt="Prosty obraz"
  size="sm"
  type="minimal"
  glow={false}
  pulse={false}
/>
```

### Grid kategorii (jak w Barnabaai)

```astro
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
  {categories.map(category => (
    <CircularImage
      src={category.image}
      alt={category.title}
      borderColor={category.color}
      size="lg"
      type="interactive"
      href={category.href}
      label={category.title}
      pulse={true}
    />
  ))}
</div>
```

## Parametry

| Parametr | Typ | Domyślnie | Opis |
|----------|-----|-----------|------|
| `src` | string | - | Ścieżka do obrazu |
| `alt` | string | '' | Alternatywny tekst |
| `size` | 'sm' \| 'md' \| 'lg' \| 'xl' | 'md' | Rozmiar obrazu |
| `borderColor` | string (HEX) | '#3B82F6' | Kolor obramowania i glow |
| `borderWidth` | number | 2 | Grubość obramowania w px |
| `pulse` | boolean | false | Efekt pulsowania |
| `glow` | boolean | true | Efekt świecenia |
| `type` | 'minimal' \| 'standard' \| 'interactive' | 'standard' | Typ efektów |
| `class` | string | '' | Dodatkowe klasy CSS |
| `id` | string | auto | ID elementu |
| `href` | string | - | Link (opcjonalny) |
| `label` | string | - | Etykieta pod obrazem |
| `labelColor` | string (HEX) | borderColor | Kolor etykiety |

## Rozmiary

- **sm**: 110px
- **md**: 165px
- **lg**: 264px
- **xl**: 352px

## Typy

- **minimal**: Tylko obramowanie, bez efektów
- **standard**: Glow + hover effects
- **interactive**: Standard + efekt podążania za kursorem

## Przykłady kolorów

```astro
<!-- Niebieski -->
<CircularImage borderColor="#3B82F6" ... />

<!-- Czerwony -->
<CircularImage borderColor="#EF4444" ... />

<!-- Zielony -->
<CircularImage borderColor="#10B981" ... />

<!-- Fioletowy -->
<CircularImage borderColor="#8B5CF6" ... />

<!-- Pomarańczowy -->
<CircularImage borderColor="#F97316" ... />

<!-- Różowy -->
<CircularImage borderColor="#EC4899" ... />
```

## Konfiguracja w panelu admina

W przyszłości moduł będzie wspierał konfigurację przez panel admina:

```ts
// config/circular-image.json
{
  "defaultSize": "md",
  "defaultBorderColor": "#3B82F6",
  "defaultBorderWidth": 2,
  "defaultGlow": true,
  "defaultPulse": false
}
```

## Kompatybilność

Moduł jest kompatybilny z:
- ✅ Astro 5.x
- ✅ React Islands
- ✅ TailwindCSS
- ✅ Dark mode
- ✅ Wszystkie przeglądarki (ES6+)

## Wzorowany na

Ten moduł jest wzorowany na komponencie `CircleImage.astro` z projektu Barnabaai, z dodatkowymi opcjami konfiguracji dostosowanymi do potrzeb całego ekosystemu WWW v2.0.
