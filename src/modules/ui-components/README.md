# 🎨 Moduł UI Components Library

**Wersja:** 1.0.0
**Autor:** Barnabaai
**Standard:** WWW v2.0

## Opis

Biblioteka 14 komponentów UI w stylu futurystycznym/cyber - karty, przyciski, formularze, nawigacja, obrazy.

## Komponenty

### Karty
- **ArticleCard.astro** - Karta artykułu z obrazem i opisem
- **Card.astro** - Uniwersalna karta
- **TeaserCard.astro** - Karta teaser z efektami hover

### Przyciski i Interakcje
- **CyberButton.astro** - Futurystyczny przycisk
- **CyberPortal.astro** - Portal z animacją

### Theme i Settings
- **ThemeToggle.astro** - Przełącznik dark/light mode
- **CookieBanner.astro** - Banner cookies (GDPR)

### Nawigacja
- **Breadcrumbs.astro** - Okruszki nawigacji
- **TabSystem.astro** - System zakładek
- **SocialLink.astro** - Link do social media

### Formularze
- **FormField.astro** - Pole formularza (input/textarea)

### Obrazy
- **Picture.astro** - Responsywny obrazek z WebP
- **CircleImage.astro** - Obrazek w kole

### Ikony
- **RobotIcon.astro** - Ikona robota/AI

## Instalacja

```bash
cp -r /path/to/modules/ui-components/ ./src/modules/
```

## Użycie

```astro
---
import {
  ArticleCard,
  CyberButton,
  ThemeToggle
} from '@/modules/ui-components';
---

<ArticleCard
  title="Tytuł"
  description="Opis"
  href="/article"
  image="/image.jpg"
/>

<CyberButton href="/action">Kliknij</CyberButton>

<ThemeToggle />
```

## Wymagania

- Astro 5.x
- TailwindCSS 3.x (dla stylów)

## Licencja

MIT
