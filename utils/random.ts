function randomDigits(length: number): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

export function randomThaiPhone(): string {
  const prefixes = ['06', '08', '09'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return prefix + randomDigits(8);
}

export function randomThaiIdCard(): string {
  const first = String(Math.floor(Math.random() * 3) + 1);
  const middle = randomDigits(11);
  const digits = (first + middle).split('').map(Number);

  const sum = digits.reduce((acc, d, i) => acc + d * (13 - i), 0);
  const checkDigit = (11 - (sum % 11)) % 10;

  return first + middle + checkDigit;
}
