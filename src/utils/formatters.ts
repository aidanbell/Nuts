// Number formatting utility from your original game
export const formatNumber = (num: number): string => {
  const base = Math.floor(num).toString();

  if (base.length < 4) return `${base}`;
  if (base.length < 7) return `${(num / Math.pow(10, 3)).toFixed(2)}k`;
  if (base.length < 10) return `${(num / Math.pow(10, 6)).toFixed(2)}m`;
  if (base.length < 13) return `${(num / Math.pow(10, 9)).toFixed(2)}b`;
  if (base.length < 16) return `${(num / Math.pow(10, 12)).toFixed(2)}t`;
  if (base.length < 19) return `${(num / Math.pow(10, 15)).toFixed(2)}q`;

  // For very large numbers
  return `${(num / Math.pow(10, 18)).toFixed(2)}Q`;
};

export const formatTime = (m: number, s: number, ms: number): string => {
  const mStr = m <= 9 ? `0${m}` : `${m}`;
  const sStr = s <= 9 ? `0${s}` : `${s}`;
  const msStr = ms <= 9 ? `0${ms}` : `${ms}`;

  return `${mStr}:${sStr}:${msStr}`;
};

export const formatProductionRate = (rate: number): string => {
  if (rate === 0) return "0 🥜/sec";
  if (rate < 0.01) return "<0.01 🥜/sec";
  if (rate < 1) return `${rate.toFixed(2)} 🥜/sec`;
  return `${rate.toFixed(2)} 🥜/sec`;
};
