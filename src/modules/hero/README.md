# HeroSection Module

Uniwersalny moduł sekcji Hero z okrągłym obrazem i tekstem.

## Charakterystyka

- ✅ Konfigurowalna treść (tytuł, podtytuł, opis)
- ✅ CircularImage z pełną konfiguracją
- ✅ Przycisk CTA z animacjami
- ✅ Odwracalny układ (obraz po lewej/prawej)
- ✅ Gradient text dla tytułu
- ✅ Responsive design
- ✅ Dark mode compatible
- ✅ Slot dla dodatkowych elementów

## Instalacja

1. Upewnij się, że masz moduł `circular-image/`
2. Skopiuj katalog `hero/` do `src/modules/`
3. Zaimportuj komponent:

```astro
---
import HeroSection from '@/modules/hero/components/HeroSection.astro';
---
```

## Użycie

### Podstawowe użycie

```astro
<HeroSection
  title="Witaj w PolecamySie!"
  subtitle="Platforma współpracy biznesowej"
  description="Znajdź idealnych partnerów biznesowych dzięki testowi osobowości 16Q"
  buttonText="Poznaj nas"
  buttonHref="/o-nas"
  imageSrc="/images/hero-image.jpg"
  imageAlt="PolecamySie"
  imageColor="#3B82F6"
/>
```

### Z odwróconym układem

```astro
<HeroSection
  title="Twoja firma w sieci kontaktów"
  subtitle="Networking dla biznesu"
  buttonText="Zacznij teraz"
  buttonHref="/rejestracja"
  imageSrc="/images/business.jpg"
  imageColor="#10B981"
  reverseLayout={true}
/>
```

### Z pulsującym obrazem

```astro
<HeroSection
  title="Innowacyjne rozwiązania"
  subtitle="Dla nowoczesnych firm"
  imageSrc="/images/innovation.jpg"
  imageColor="#8B5CF6"
  imageSize="xl"
  pulse={true}
/>
```

### Z dodatkowym contentem (slot)

```astro
<HeroSection
  title="Dołącz do nas"
  subtitle="Ponad 1000 firm już nam zaufało"
  imageSrc="/images/team.jpg"
>
  <!-- Dodatkowe elementy przez slot -->
  <div class="flex gap-4 mt-6 justify-center md:justify-start">
    <div class="stat">
      <span class="text-3xl font-bold text-primary-400">1000+</span>
      <span class="text-sm text-gray-600 dark:text-gray-400">Firm</span>
    </div>
    <div class="stat">
      <span class="text-3xl font-bold text-primary-400">50+</span>
      <span class="text-sm text-gray-600 dark:text-gray-400">Branż</span>
    </div>
    <div class="stat">
      <span class="text-3xl font-bold text-primary-400">5000+</span>
      <span class="text-sm text-gray-600 dark:text-gray-400">Kontaktów</span>
    </div>
  </div>
</HeroSection>
```

## Parametry

| Parametr | Typ | Wymagany | Domyślnie | Opis |
|----------|-----|----------|-----------|------|
| `title` | string | ✅ | - | Główny tytuł |
| `subtitle` | string | ❌ | - | Podtytuł |
| `description` | string | ❌ | - | Opis |
| `buttonText` | string | ❌ | 'Dowiedz się więcej' | Tekst przycisku |
| `buttonHref` | string | ❌ | '#' | Link przycisku |
| `imageSrc` | string | ❌ | - | Ścieżka do obrazu |
| `imageAlt` | string | ❌ | '' | Alt text obrazu |
| `imageColor` | string (HEX) | ❌ | '#3B82F6' | Kolor obramowania |
| `imageSize` | 'sm' \| 'md' \| 'lg' \| 'xl' | ❌ | 'xl' | Rozmiar obrazu |
| `pulse` | boolean | ❌ | false | Efekt pulsowania |
| `reverseLayout` | boolean | ❌ | false | Odwrócony układ |
| `class` | string | ❌ | '' | Dodatkowe klasy CSS |

## Przykłady dla różnych stron

### PolecamySie

```astro
<HeroSection
  title="Znajdź idealnych partnerów biznesowych"
  subtitle="Platforma networkingowa z testem osobowości 16Q"
  buttonText="Załóż konto"
  buttonHref="/rejestracja"
  imageSrc="/images/networking.jpg"
  imageColor="#3B82F6"
  pulse={true}
/>
```

### qp (Sklep)

```astro
<HeroSection
  title="Designerskie meble na wymiar"
  subtitle="Twoje wnętrze zasługuje na wyjątkowość"
  buttonText="Zobacz produkty"
  buttonHref="/sklep"
  imageSrc="/images/furniture.jpg"
  imageColor="#F97316"
  imageSize="xl"
/>
```

### Slimaczyzm

```astro
<HeroSection
  title="Credo Ślimaczyzmu"
  subtitle="Filozofia życia w zgodzie z naturą"
  buttonText="Poznaj manifest"
  buttonHref="/manifest"
  imageSrc="/images/slimak.jpg"
  imageColor="#10B981"
  reverseLayout={true}
/>
```

### 112358 (Portfolio)

```astro
<HeroSection
  title="Barnaba - Artysta Wizualny"
  subtitle="Sztuka, fotografia, design"
  buttonText="Zobacz portfolio"
  buttonHref="/portfolio"
  imageSrc="/images/barnaba-profile.jpg"
  imageColor="#8B5CF6"
  pulse={true}
/>
```

## Customizacja kolorów

Moduł używa zmiennych CSS, które można nadpisać:

```css
:root {
  --primary-400: #3B82F6;
  --primary-600: #2563EB;
  --text-primary: #1F2937;
  --text-secondary: #4B5563;
}

.dark {
  --text-primary-dark: #F9FAFB;
  --text-secondary-dark: #D1D5DB;
}
```

## Responsive breakpoints

- Mobile: < 768px (kolumna, wyśrodkowany tekst)
- Tablet/Desktop: ≥ 768px (wiersz, tekst po lewej)

## Kompatybilność

Moduł jest kompatybilny z:
- ✅ Astro 5.x
- ✅ CircularImage module
- ✅ TailwindCSS (opcjonalnie)
- ✅ Dark mode
- ✅ Wszystkie nowoczesne przeglądarki

## Wzorowany na

Ten moduł jest wzorowany na sekcji Hero z projektu Barnabaai, z rozszerzeniami dostosowanymi do potrzeb całego ekosystemu WWW v2.0.
