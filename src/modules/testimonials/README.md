# TestimonialsSection Module

Uniwersalny moduł sekcji opinii klientów (testimonials) z obsługą grid i slider.

## Charakterystyka

- ✅ Dwa układy: grid i slider
- ✅ Ocena gwiazdkowa (1-5 stars)
- ✅ Avatary lub inicjały
- ✅ Automatyczne przewijanie slidera
- ✅ Responsive design
- ✅ Dark mode compatible
- ✅ Smooth animations
- ✅ Slot dla dodatkowych elementów

## Instalacja

1. Skopiuj katalog `testimonials/` do `src/modules/`
2. Zaimportuj komponent:

```astro
---
import TestimonialsSection from '@/modules/testimonials/components/TestimonialsSection.astro';
---
```

## Użycie

### Podstawowe użycie (Grid)

```astro
---
const testimonials = [
  {
    name: 'Anna Kowalska',
    company: 'Pizzeria Napoli',
    role: 'Właścicielka',
    rating: 5,
    text: 'Dzięki PolecamySie.com znalazłam dostawców produktów, z którymi naprawdę się rozumiem. Test 16Q to genialne narzędzie!'
  },
  {
    name: 'Jan Nowak',
    company: 'Warstat Turbo',
    role: 'Mechanik',
    avatar: '/images/jan.jpg',
    rating: 5,
    text: 'Platforma pomogła mi nawiązać kontakty z lokalnymi firmami. Polecam każdemu przedsiębiorcy!'
  }
];
---

<TestimonialsSection items={testimonials} />
```

### Układ Slider

```astro
<TestimonialsSection
  items={testimonials}
  layout="slider"
  title="Opinie naszych klientów"
  subtitle="Zobacz, co mówią o nas przedsiębiorcy"
/>
```

### Bez avatara (z inicjałami)

```astro
---
const testimonials = [
  {
    name: 'Maria Wiśniewska',
    company: 'Studio Jogi Harmonia',
    role: 'Instruktorka',
    rating: 5,
    text: 'Świetna platforma do networkingu!'
    // Brak avatar - wyświetli się inicjał 'M'
  }
];
---

<TestimonialsSection items={testimonials} />
```

## Parametry

| Parametr | Typ | Wymagany | Domyślnie | Opis |
|----------|-----|----------|-----------|------|
| `title` | string | ❌ | 'Co mówią nasi klienci' | Tytuł sekcji |
| `subtitle` | string | ❌ | - | Podtytuł sekcji |
| `items` | Testimonial[] | ✅ | [] | Tablica opinii |
| `layout` | 'grid' \| 'slider' | ❌ | 'grid' | Układ sekcji |
| `class` | string | ❌ | '' | Dodatkowe klasy CSS |

### Testimonial Interface

```typescript
interface Testimonial {
  name: string;         // Imię i nazwisko (wymagane)
  company?: string;     // Nazwa firmy (opcjonalne)
  role?: string;        // Stanowisko (opcjonalne)
  avatar?: string;      // URL do zdjęcia (opcjonalne)
  rating?: number;      // Ocena 1-5 (opcjonalne)
  text: string;         // Treść opinii (wymagane)
}
```

## Przykłady dla różnych stron

### PolecamySie

```astro
---
const businessTestimonials = [
  {
    name: 'Tomasz Kowalski',
    company: 'Księgowość Expert',
    role: 'Księgowy',
    avatar: '/images/tomasz.jpg',
    rating: 5,
    text: 'Test 16Q pomógł mi znaleźć klientów, którzy cenią dokładność i terminowość. Współpraca układa się świetnie!'
  },
  {
    name: 'Agnieszka Nowak',
    company: 'Salon Fryzjerski Styl',
    role: 'Fryzjerka',
    rating: 5,
    text: 'Platforma pozwoliła mi nawiązać kontakty z dostawcami kosmetyków i lokalną społecznością. Bardzo polecam!'
  }
];
---

<TestimonialsSection
  items={businessTestimonials}
  layout="grid"
/>
```

### qp (Sklep)

```astro
---
const shopTestimonials = [
  {
    name: 'Katarzyna M.',
    role: 'Kolekcjonerka',
    rating: 5,
    text: 'Pufa Sphere to absolutne dzieło sztuki! Jakość wykonania na najwyższym poziomie.'
  },
  {
    name: 'Piotr S.',
    role: 'Architekt wnętrz',
    rating: 5,
    text: 'Meble z QP dodają niepowtarzalnego charakteru każdemu wnętrzu. Polecam!'
  }
];
---

<TestimonialsSection
  title="Co mówią nasi klienci"
  items={shopTestimonials}
  layout="slider"
/>
```

### Slimaczyzm

```astro
---
const slimaczTestimonials = [
  {
    name: 'Barnaba',
    role: 'Założyciel Ślimaczyzmu',
    rating: 5,
    text: 'Ślimaczyzm zmienił moje życie! Wolność, natura i samowystarczalność - wszystko wolno!'
  }
];
---

<TestimonialsSection
  title="Głosy Ślimaczystów"
  items={slimaczTestimonials}
/>
```

## Layouty

### Grid Layout
- Responsive grid (1-3 kolumny w zależności od rozmiaru ekranu)
- Idealny dla 3-9 opinii
- Wszystkie widoczne naraz

### Slider Layout
- Auto-scroll co 5 sekund
- Przyciski prev/next
- Dots navigation
- Idealny dla 5+ opinii

## Rating (Gwiazdki)

```astro
<!-- 5 gwiazdek -->
{ rating: 5, ... }

<!-- 4 gwiazdki -->
{ rating: 4, ... }

<!-- Bez oceny -->
{ /* nie podawaj rating */ }
```

## Avatary

### Z avatarem
```astro
{
  avatar: '/images/profile.jpg',
  name: 'Jan Kowalski',
  ...
}
```

### Bez avatara (inicjały)
```astro
{
  // Brak avatar
  name: 'Jan Kowalski', // Wyświetli 'J'
  ...
}
```

## Customizacja

### Kolory

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

```astro
<TestimonialsSection
  items={testimonials}
  class="my-custom-testimonials"
/>
```

## Funkcje slidera

- ✅ Auto-scroll (5s interval)
- ✅ Przyciski prev/next
- ✅ Dots navigation (click)
- ✅ Responsive (1-3 kolumny)
- ✅ Smooth scroll
- ✅ Infinite loop

## Kompatybilność

Moduł jest kompatybilny z:
- ✅ Astro 5.x
- ✅ React Islands (opcjonalnie)
- ✅ TailwindCSS (nie wymagane)
- ✅ Dark mode
- ✅ Wszystkie nowoczesne przeglądarki

## Best Practices

1. **Liczba opinii**:
   - Grid: 3-6 opinii
   - Slider: 5+ opinii

2. **Długość tekstu**:
   - Optymalna: 100-200 znaków
   - Maksymalna: 300 znaków

3. **Avatary**:
   - Format: JPG, PNG, WebP
   - Rozmiar: min 100x100px
   - Optymalizuj dla web

4. **Oceny**:
   - Pokazuj tylko 4-5 gwiazdek
   - Niższe oceny możesz pominąć

## Wzorowany na

Popularny wzorzec testimonials/reviews z dodatkowymi funkcjami dla ekosystemu WWW v2.0.
