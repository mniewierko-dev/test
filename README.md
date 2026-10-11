# Planer budżetu marketingowego

Aplikacja webowa w języku polskim: roczny budżet w PLN, procentowy podział między social media, WWW, telewizję i radio oraz oczekiwany ROI. Plan zapisuje się lokalnie w przeglądarce; nie wymaga konta ani serwera danych. Prognoza jest oparta na założeniach użytkownika, nie na danych rynkowych.

## Uruchomienie

Wymagany Node.js 20.19+ lub 22.12+.

```sh
npm ci
npm run dev
```

## Weryfikacja i wersja produkcyjna

```sh
npm test
npm run build
npm run preview
```

Pliki produkcyjne znajdują się w `dist/` i mogą być opublikowane na hostingu statycznym. Czcionki Google Fonts są opcjonalne; aplikacja ma czcionki zastępcze.
