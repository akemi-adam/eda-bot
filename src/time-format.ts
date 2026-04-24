export type PrettyDiff =
  | { kind: "hms"; value: string } // horas:minutos:segundos
  | { kind: "dh"; value: string } // dias:horas
  | { kind: "wd"; value: string } // semanas:dias
  | { kind: "msd"; value: string } // mes:semanas:dias
  | { kind: "ym"; value: string }; // anos:meses

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Regras:
 * - < 24h => HH:MM:SS
 * - >= 24h e < 7d => D:HH
 * - >= 7d e < 30d => W:D
 * - >= 30d e < 365d => M:W:D (mês = 30 dias; semana = 7 dias)
 * - >= 365d => Y:M (ano = 365 dias; mês = 30 dias)
 */
export function formatSince(lastUpdate: Date, now = new Date()): PrettyDiff {
  let diffMs = now.getTime() - lastUpdate.getTime();
  if (diffMs < 0) diffMs = 0;

  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (hr < 24) {
    const hours = hr;
    const minutes = min % 60;
    const seconds = sec % 60;
    return {
      kind: "hms",
      value: `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`,
    };
  }

  if (day < 7) {
    const days = day;
    const hours = hr % 24;
    return { kind: "dh", value: `${days}:${pad2(hours)}` };
  }

  if (day < 30) {
    const weeks = Math.floor(day / 7);
    const daysR = day % 7;
    return { kind: "wd", value: `${weeks}:${daysR}` };
  }

  if (day < 365) {
    const months = Math.floor(day / 30);
    const remDaysAfterMonths = day % 30;
    const weeks = Math.floor(remDaysAfterMonths / 7);
    const daysR = remDaysAfterMonths % 7;
    return { kind: "msd", value: `${months}:${weeks}:${daysR}` };
  }

  const years = Math.floor(day / 365);
  const remDaysAfterYears = day % 365;
  const months = Math.floor(remDaysAfterYears / 30);
  return { kind: "ym", value: `${years}:${months}` };
}
