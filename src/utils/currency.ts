export function formatDollars(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`;
}

export function parseDollarInput(input: string): number {
  const cleaned = input.replace(/[^0-9]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}
