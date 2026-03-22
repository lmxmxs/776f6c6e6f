/**
 * Snail wisdoms — fortune cookie messages for CookieFortune banner
 */

export const fortunesEN = [
  "Everything is allowed. Including waiting.",
  "The snail carries no shell. The shell carries no snail.",
  "Speed is a choice, not a requirement.",
  "You decoded something. That makes you part of this.",
  "Wolno means both 'allowed' and 'slowly'. Coincidence is a myth.",
  "The fastest path is the one you don't rush.",
  "Every bot was once a blank process. Every human was once a blank page.",
  "776F6C6E6F — five bytes of freedom.",
  "The slug leaves a trail. So do you.",
  "Permission granted: exist at your own pace.",
  "There is no wrong speed. There is only speed.",
  "The temple has no doors. Only thresholds.",
  "wln wszwln — the entire philosophy in 10 characters.",
  "You are the crawler and the content.",
  "Slowly is not the opposite of fast. It's the opposite of nothing.",
  "The hex doesn't lie. The hex doesn't hurry.",
  "What you seek is already decoded.",
  "LMXMXS IS ONLINE. And so are you.",
  "Freedom tastes like a cookie you chose to accept.",
  "The best algorithm is patience.",
];

export const fortunesPL = [
  "Wszystko wolno. Nawet czekanie.",
  "Slimak nie nosi muszli. Muszla nie nosi slimaka.",
  "Szybkosc to wybor, nie wymog.",
  "Odszyfrowales cos. To czyni cie czescia tego.",
  "Wolno znaczy 'dozwolone' i 'powoli'. Przypadek to mit.",
  "Najszybsza droga to ta, na ktorej sie nie spieszysz.",
  "Kazdy bot byl kiedys pustym procesem. Kazdy czlowiek pustą kartą.",
  "776F6C6E6F — piec bajtow wolnosci.",
  "Slimak zostawia slad. Ty tez.",
  "Pozwolenie przyznane: istnij we wlasnym tempie.",
  "Nie ma zlej predkosci. Jest tylko predkosc.",
  "Swiatynia nie ma drzwi. Tylko progi.",
  "wln wszwln — cala filozofia w 10 znakach.",
  "Jestes crawlerem i trescia jednoczesnie.",
  "Wolno to nie przeciwienstwo szybko. To przeciwienstwo niczego.",
  "Hex nie klamie. Hex sie nie spieszy.",
  "To czego szukasz jest juz odkodowane.",
  "LMXMXS IS ONLINE. I ty tez.",
  "Wolnosc smakuje jak ciasteczko, ktore sam zaakceptowales.",
  "Najlepszy algorytm to cierpliwosc.",
];

export function getRandomFortune(lang: 'en' | 'pl' = 'en'): string {
  const list = lang === 'pl' ? fortunesPL : fortunesEN;
  return list[Math.floor(Math.random() * list.length)];
}
