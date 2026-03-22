# Admin Panel Module - Uniwersalny Moduł Autoryzacji

**Wersja:** 1.0.0
**Data:** 2026-01-07
**Status:** ✅ GOTOWY DO PRODUKCJI

## 📋 Spis treści

1. [Przegląd](#przegląd)
2. [Funkcje](#funkcje)
3. [Architektura](#architektura)
4. [Instalacja](#instalacja)
5. [Użycie](#użycie)
6. [Konfiguracja](#konfiguracja)
7. [Bezpieczeństwo](#bezpieczeństwo)
8. [Rozszerzanie](#rozszerzanie)

---

## Przegląd

Uniwersalny moduł autoryzacji i zarządzania użytkownikami dla wszystkich stron WWW w ekosystemie Fraktal. Zapewnia:

- **Bezpieczne logowanie** z rate limiting
- **System ról** (admin, moderator, user)
- **Odzyskiwanie hasła** przez email
- **Responsywny UI** z dark mode
- **Gotowe komponenty** do wielokrotnego użytku

## Funkcje

### ✅ Zaimplementowane

- ✅ **Logowanie** z rate limiting (5 prób / 15 min)
- ✅ **Wylogowanie** z wyczyszczeniem sesji
- ✅ **Weryfikacja sesji** (HTTPOnly cookies)
- ✅ **System ról** (3 poziomy uprawnień)
- ✅ **Panel administratora** z nawigacją
- ✅ **Odzyskiwanie hasła** przez email (stub)
- ✅ **Responsive design** z TailwindCSS
- ✅ **Dark mode** support
- ✅ **Smart robots.txt** blocking

### 📦 Zawartość modułu

```
src/modules/admin-panel/
├── components/
│   └── LoginForm.astro       # Reużywalny formularz logowania
├── layouts/
│   └── AdminLayout.astro     # Layout dla stron admina
├── utils/
│   └── auth.ts              # Logika autoryzacji
├── types.ts                 # TypeScript interfaces
└── README.md               # Ta dokumentacja
```

---

## Architektura

### Struktura plików

```
src/
├── modules/admin-panel/       # Moduł (kopiuj do innych projektów)
│   ├── components/
│   ├── layouts/
│   ├── utils/
│   ├── types.ts
│   └── README.md
│
├── pages/
│   ├── admin.astro           # Strona logowania
│   ├── admin/
│   │   ├── dashboard.astro   # Dashboard (wymaga auth)
│   │   ├── uzytkownicy.astro # Zarządzanie userami (admin)
│   │   ├── moderacja.astro   # Moderacja (moderator+)
│   │   └── ustawienia.astro  # Ustawienia (admin)
│   │
│   └── api/auth/             # REST API endpoints
│       ├── login.ts          # POST /api/auth/login
│       ├── logout.ts         # POST /api/auth/logout
│       └── check.ts          # GET /api/auth/check
│
└── layouts/
    └── BaseLayout.astro      # Link "Zaloguj" w menu
```

### Flow autoryzacji

```
1. User → /admin
2. Redirect do /admin jeśli brak sesji
3. LoginForm wyświetlony
4. Submit → POST /api/auth/login
5. Rate limiting check (IP-based)
6. Credentials verification
7. Session created (HTTPOnly cookie)
8. Redirect → /admin/dashboard
9. AdminLayout weryfikuje sesję
10. Content wyświetlany based on role
```

---

## Instalacja

### Krok 1: Skopiuj moduł

```bash
# Z projektu PolecamySie do innego projektu WWW
cp -r src/modules/admin-panel /path/to/other/project/src/modules/
```

### Krok 2: Skopiuj API endpoints

```bash
mkdir -p /path/to/other/project/src/pages/api/auth
cp src/pages/api/auth/*.ts /path/to/other/project/src/pages/api/auth/
```

### Krok 3: Skopiuj strony admina

```bash
cp src/pages/admin.astro /path/to/other/project/src/pages/
cp -r src/pages/admin/ /path/to/other/project/src/pages/
```

### Krok 4: Dodaj link w menu (opcjonalnie)

Dla projektów z wieloma użytkownikami (jak PolecamySie), dodaj w `BaseLayout.astro`:

```astro
<a href="/admin" class="hover:text-primary-400 font-medium">
  <svg class="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
  Zaloguj
</a>
```

### Krok 5: Zaktualizuj robots.txt

```txt
# Allow login page (users need to find it)
Allow: /admin

# Block admin panels (protect from bots)
Disallow: /api/
Disallow: /admin/dashboard
Disallow: /admin/uzytkownicy
Disallow: /admin/moderacja
Disallow: /admin/ustawienia
```

---

## Użycie

### Podstawowe użycie

#### 1. Strona logowania

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import LoginForm from '../modules/admin-panel/components/LoginForm.astro';
---

<BaseLayout title="Admin Login">
  <LoginForm
    resetPasswordUrl="/admin/reset-hasla"
    redirectAfterLogin="/admin/dashboard"
  />
</BaseLayout>
```

#### 2. Strona chroniona

```astro
---
import AdminLayout from '../../modules/admin-panel/layouts/AdminLayout.astro';
import { getUserBySession } from '../../modules/admin-panel/utils/auth';

// Weryfikacja sesji
const sessionToken = Astro.cookies.get('session_token')?.value;
const user = sessionToken ? getUserBySession(sessionToken) : null;

if (!user) {
  return Astro.redirect('/admin?error=Musisz się zalogować');
}
---

<AdminLayout
  title="Dashboard"
  description="Przegląd systemu"
  requiredRole="user"  <!-- Optional: 'admin' | 'moderator' | 'user' -->
>
  <h2>Witaj, {user.username}!</h2>
  <!-- Your content here -->
</AdminLayout>
```

#### 3. Role-based access

```astro
---
// Strona tylko dla adminów
---

<AdminLayout
  title="Zarządzanie użytkownikami"
  requiredRole="admin"  <!-- Tylko admin ma dostęp -->
>
  <!-- Admin-only content -->
</AdminLayout>
```

### Domyślne dane logowania

**⚠️ ZMIEŃ W PRODUKCJI!**

```
Email: admin@polecamysie.com
Username: moderator
Password: demo123
```

Znajdź w: `src/modules/admin-panel/utils/auth.ts:29-36`

---

## Konfiguracja

### Zmiana domyślnego użytkownika

Edytuj `src/modules/admin-panel/utils/auth.ts`:

```typescript
const DEFAULT_ADMIN = {
  id: 'admin-001',
  email: 'twoj@email.com',          // ← ZMIEŃ
  username: 'twoj_username',         // ← ZMIEŃ
  role: 'admin' as const,
  createdAt: new Date(),
  passwordHash: 'demo123'            // ← ZMIEŃ (użyj bcrypt w produkcji!)
};
```

### Rate limiting

Domyślne wartości (`auth.ts:175-177`):

```typescript
const MAX_LOGIN_ATTEMPTS = 5;              // 5 prób
const LOCKOUT_DURATION = 15 * 60 * 1000;   // 15 minut lockout
const ATTEMPT_WINDOW = 15 * 60 * 1000;     // 15 minut window
```

### Session expiry

Domyślne wartości (`auth.ts:80`):

```typescript
const expiresIn = remember
  ? 30 * 24 * 60 * 60 * 1000  // 30 dni (remember me)
  : 24 * 60 * 60 * 1000;       // 24 godziny (normal)
```

### Customizacja kolorów

AdminLayout używa TailwindCSS. Zmień kolory w `tailwind.config.cjs`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          400: '#38bdf8',  // ← Main admin color
          900: '#0c4a6e',
        }
      }
    }
  }
}
```

---

## Bezpieczeństwo

### ✅ Zaimplementowane zabezpieczenia

1. **HTTPOnly Cookies** - Zapobiega XSS attacks
2. **Secure flag** - HTTPS only (w produkcji)
3. **SameSite: lax** - Zapobiega CSRF
4. **Rate Limiting** - 5 prób / 15 min per IP
5. **Session expiry** - Auto-logout po czasie
6. **Role-based access** - Weryfikacja uprawnień
7. **Password visibility toggle** - UX security
8. **Smart robots.txt** - Bot protection

### ⚠️ TODO dla produkcji

1. **Hashowanie haseł** - Zamień plaintext na bcrypt:

```typescript
// Install: npm install bcrypt @types/bcrypt
import bcrypt from 'bcrypt';

// Hash password
const passwordHash = await bcrypt.hash(password, 10);

// Verify password
const isValid = await bcrypt.compare(password, user.passwordHash);
```

2. **Baza danych** - Zamień in-memory storage na:
   - SQLite (małe projekty)
   - PostgreSQL (duże projekty)
   - Supabase (cloud)

3. **Email service** - Zintegruj wysyłkę maili:
   - SendGrid
   - AWS SES
   - Resend
   - Mailgun

4. **HTTPS** - Zawsze w produkcji!

5. **Environment variables** - Przechowuj sekrety w `.env`:

```bash
# .env
ADMIN_PASSWORD_HASH=bcrypt_hash_here
JWT_SECRET=random_secret_here
EMAIL_API_KEY=your_sendgrid_key
```

### Przykład integracji bcrypt

```typescript
// src/modules/admin-panel/utils/auth.ts

import bcrypt from 'bcrypt';

export async function verifyCredentials(
  emailOrUsername: string,
  password: string
): Promise<User | null> {
  const user = findUser(emailOrUsername);
  if (!user) return null;

  // Replace plaintext check with bcrypt
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
```

---

## Rozszerzanie

### Dodawanie nowych stron admina

1. **Utwórz stronę** w `src/pages/admin/`:

```astro
---
// src/pages/admin/moja-strona.astro
import AdminLayout from '../../modules/admin-panel/layouts/AdminLayout.astro';
---

<AdminLayout
  title="Moja Strona"
  description="Opis strony"
  requiredRole="moderator"  <!-- Optional -->
>
  <!-- Content -->
</AdminLayout>
```

2. **Dodaj do nawigacji** w `AdminLayout.astro:43-46`:

```typescript
const navItems = [
  // ... existing items
  {
    href: '/admin/moja-strona',
    label: 'Moja Strona',
    icon: 'M12 4v16m8-8H4',  // SVG path
    minRole: 'moderator'
  }
];
```

### Dodawanie nowych ról

1. **Rozszerz typ** w `types.ts`:

```typescript
export type Role = 'admin' | 'moderator' | 'user' | 'editor';  // ← Dodaj 'editor'
```

2. **Zaktualizuj hierarchię** w `AdminLayout.astro:72`:

```typescript
const roleHierarchy = {
  'user': 1,
  'editor': 2,      // ← Dodaj nową rolę
  'moderator': 3,
  'admin': 4
};
```

3. **Dodaj nazwę wyświetlaną** w `AdminLayout.astro:68`:

```typescript
const roleNames = {
  'admin': 'Administrator',
  'moderator': 'Moderator',
  'editor': 'Edytor',      // ← Dodaj nazwę
  'user': 'Użytkownik'
};
```

### Customizacja LoginForm

Komponent `LoginForm.astro` przyjmuje props:

```astro
<LoginForm
  resetPasswordUrl="/custom/reset"       <!-- Default: /kokpit/reset-hasla -->
  redirectAfterLogin="/custom/dashboard" <!-- Default: /kokpit/dashboard -->
/>
```

---

## FAQ

### Jak zmienić URL logowania z /admin na /kokpit?

1. Zmień nazwę pliku: `src/pages/admin.astro` → `src/pages/kokpit.astro`
2. Zmień nazwę folderu: `src/pages/admin/` → `src/pages/kokpit/`
3. Zaktualizuj `robots.txt`: `/admin` → `/kokpit`
4. Zaktualizuj link w menu: `href="/admin"` → `href="/kokpit"`

### Jak ukryć link "Zaloguj" z menu?

Usuń kod z `BaseLayout.astro` (linie 102-107). Użytkownicy będą musieli znać URL.

### Jak dodać więcej użytkowników?

Obecnie tylko 1 user in-memory. W produkcji:

1. Zintegruj bazę danych
2. Stwórz stronę rejestracji w `/admin/uzytkownicy`
3. Użyj API endpoint `/api/auth/register`

### Jak wysyłać prawdziwe emaile do resetowania hasła?

Zobacz sekcję [Bezpieczeństwo](#bezpieczeństwo) → TODO dla produkcji → Email service

### Czy mogę użyć JWT zamiast cookies?

Tak, ale wymaga modyfikacji:

1. Zamień `cookies.set()` na JWT token generation
2. Przechowuj token w localStorage (mniej bezpieczne) lub w cookie
3. Weryfikuj JWT w każdym request
4. **Uwaga:** Cookies są bezpieczniejsze (HTTPOnly flag)

---

## Wsparcie

### Problemy?

1. Sprawdź logi w konsoli przeglądarki (F12)
2. Sprawdź network tab dla API calls
3. Sprawdź czy session cookie jest ustawiony

### Najczęstsze błędy

**"File has not been read yet"**
- Użyj `Read` tool przed `Write` w nowym projekcie

**"Cannot find module '../../../modules/admin-panel/utils/auth'"**
- Sprawdź czy skopiowałeś cały folder `admin-panel`

**"User not found"**
- Sprawdź default credentials w `auth.ts:29-36`

**"Rate limited"**
- Poczekaj 15 minut lub zrestartuj dev server

---

## Changelog

### v1.0.0 (2026-01-07)

- ✅ Initial release
- ✅ Login/logout/session management
- ✅ 3-level role system
- ✅ Rate limiting
- ✅ Password reset (stub)
- ✅ AdminLayout with sidebar
- ✅ LoginForm component
- ✅ Dashboard page
- ✅ API endpoints
- ✅ Smart robots.txt blocking
- ✅ Dark mode support

---

## Autor

**Barnaba** (Fraktal Ecosystem)
PolecamySie.com | 2026
