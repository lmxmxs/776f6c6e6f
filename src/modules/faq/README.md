# FAQSection Module

Uniwersalny moduł sekcji FAQ (Często Zadawane Pytania) z animowanym rozwijaniem/zwijaniem.

## Charakterystyka

- ✅ Animowane rozwijanie/zwijanie odpowiedzi
- ✅ Accessibility (ARIA attributes, keyboard navigation)
- ✅ Konfigurowalna treść (tytuł, podtytuł, pytania)
- ✅ Wsparcie dla HTML w odpowiedziach
- ✅ Responsive design
- ✅ Dark mode compatible
- ✅ Smooth animations
- ✅ Slot dla dodatkowych elementów

## Instalacja

1. Skopiuj katalog `faq/` do `src/modules/`
2. Zaimportuj komponent:

```astro
---
import FAQSection from '@/modules/faq/components/FAQSection.astro';
---
```

## Użycie

### Podstawowe użycie

```astro
---
const faqItems = [
  {
    question: 'Jak mogę założyć konto?',
    answer: 'Kliknij przycisk "Załóż konto" w górnym menu i wypełnij formularz rejestracyjny.'
  },
  {
    question: 'Czy mogę zmienić swoje dane?',
    answer: 'Tak, możesz edytować swoje dane w panelu użytkownika.'
  },
  {
    question: 'Jak skontaktować się z supportem?',
    answer: 'Wyślij email na adres <a href="mailto:support@example.com">support@example.com</a>'
  }
];
---

<FAQSection items={faqItems} />
```

### Z niestandardowym tytułem

```astro
<FAQSection
  title="Pytania i odpowiedzi"
  subtitle="Znajdź odpowiedzi na najczęściej zadawane pytania"
  items={faqItems}
/>
```

### Z dodatkowym contentem (slot)

```astro
<FAQSection items={faqItems}>
  <div class="text-center mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
    <h3 class="text-xl font-bold mb-2">Nie znalazłeś odpowiedzi?</h3>
    <p class="text-gray-600 dark:text-gray-400 mb-4">
      Skontaktuj się z nami, chętnie pomożemy!
    </p>
    <a
      href="/kontakt"
      class="inline-block bg-primary-400 text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-500 transition"
    >
      Kontakt
    </a>
  </div>
</FAQSection>
```

## Parametry

| Parametr | Typ | Wymagany | Domyślnie | Opis |
|----------|-----|----------|-----------|------|
| `title` | string | ❌ | 'Często zadawane pytania' | Tytuł sekcji |
| `subtitle` | string | ❌ | - | Podtytuł sekcji |
| `items` | FAQItem[] | ✅ | [] | Tablica pytań i odpowiedzi |
| `class` | string | ❌ | '' | Dodatkowe klasy CSS |

### FAQItem Interface

```typescript
interface FAQItem {
  question: string; // Pytanie
  answer: string;   // Odpowiedź (wspiera HTML)
}
```

## Przykłady dla różnych stron

### PolecamySie

```astro
---
const faqItems = [
  {
    question: 'Czym jest test osobowości 16Q?',
    answer: 'Test 16Q to narzędzie do oceny osobowości biznesowej, które pomaga znaleźć kompatybilnych partnerów do współpracy.'
  },
  {
    question: 'Jak mogę dodać swoją firmę?',
    answer: 'Załóż konto, wypełnij test 16Q, a następnie uzupełnij profil swojej firmy w panelu użytkownika.'
  },
  {
    question: 'Czy korzystanie z platformy jest bezpłatne?',
    answer: 'Tak! Podstawowe funkcje platformy są całkowicie darmowe.'
  }
];
---

<FAQSection
  title="Najczęściej zadawane pytania"
  subtitle="Dowiedz się więcej o PolecamySie.com"
  items={faqItems}
/>
```

### qp (Sklep)

```astro
---
const shopFAQ = [
  {
    question: 'Jak złożyć zamówienie?',
    answer: 'Wybierz produkt, dodaj do koszyka i przejdź do finalizacji zamówienia.'
  },
  {
    question: 'Jakie formy płatności akceptujecie?',
    answer: 'Akceptujemy przelewy bankowe, karty płatnicze oraz BLIK.'
  },
  {
    question: 'Ile trwa realizacja zamówienia?',
    answer: 'Standardowy czas realizacji to 2-4 tygodnie, ponieważ każdy mebel jest tworzony na zamówienie.'
  }
];
---

<FAQSection items={shopFAQ} />
```

### Slimaczyzm

```astro
---
const slimaczFAQ = [
  {
    question: 'Co to jest Ślimaczyzm?',
    answer: 'Ślimaczyzm to filozofia życia w zgodzie z naturą i zasadą "Wszystko wolno!"'
  },
  {
    question: 'Jak mogę zostać Ślimaczystą?',
    answer: 'Wystarczy zaakceptować nasze Credo i żyć zgodnie z zasadami wolności i samowystarczalności.'
  }
];
---

<FAQSection
  title="Pytania o Ślimaczyzm"
  items={slimaczFAQ}
/>
```

## HTML w odpowiedziach

Odpowiedzi wspierają HTML, co pozwala na dodawanie:
- **Linków**: `<a href="/kontakt">Skontaktuj się</a>`
- **Pogrubień**: `<strong>Ważne</strong>`
- **List**: `<ul><li>Punkt 1</li></ul>`
- **Innych elementów HTML**

## Accessibility

Moduł jest w pełni dostępny:
- ✅ ARIA attributes (`aria-expanded`, `aria-controls`)
- ✅ Keyboard navigation (Enter/Space do rozwijania)
- ✅ Semantic HTML (`<button>` dla pytań)
- ✅ Focus indicators

## Customizacja

### Kolory

Moduł używa zmiennych CSS:

```css
:root {
  --text-primary: #1F2937;
  --text-secondary: #6B7280;
  --border-color: #E5E7EB;
  --primary-400: #3B82F6;
  --primary-600: #2563EB;
}

.dark {
  --text-primary-dark: #F9FAFB;
  --text-secondary-dark: #D1D5DB;
  --border-dark: #374151;
  --bg-secondary-dark: #1F2937;
}
```

### Style

Możesz nadpisać style przez parametr `class`:

```astro
<FAQSection
  items={faqItems}
  class="my-custom-faq"
/>
```

## Animacje

- Smooth expand/collapse (max-height transition)
- Icon rotation (180deg)
- Hover effects
- Duration: 0.3s ease

## Kompatybilność

Moduł jest kompatybilny z:
- ✅ Astro 5.x
- ✅ React Islands (opcjonalnie)
- ✅ TailwindCSS (nie wymagane)
- ✅ Dark mode
- ✅ Wszystkie nowoczesne przeglądarki

## Wzorowany na

Popularny wzorzec FAQ (accordion) z dodatkowymi ulepszeniami dla ekosystemu WWW v2.0.
