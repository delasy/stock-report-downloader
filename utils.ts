import packageJson from './package.json'

export function getUserAgent (): string {
  return `DelasyBot/${packageJson.version}`
}

export function isLongQuarter (longQuarter: string): boolean {
  return ['First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter'].includes(longQuarter)
}

export function toNumQuarter (longQuarter: string): number {
  return longQuarter === 'Fourth Quarter'
    ? 4
    : longQuarter === 'Third Quarter'
      ? 3
      : longQuarter === 'Second Quarter'
        ? 2
        : 1
}

export function yearQuarter (year: string | number, quarter: string | number): string {
  return `${year.toString()}-Q${quarter.toString()}`
}
