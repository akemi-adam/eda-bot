type Unit = "ano" | "mes" | "semana" | "dia" | "hora" | "minuto" | "segundo";

function pluralize(unit: Unit, value: number): string {
  const map: Record<Unit, { s: string; p: string }> = {
    ano: { s: "ano", p: "anos" },
    mes: { s: "mês", p: "meses" },
    semana: { s: "semana", p: "semanas" },
    dia: { s: "dia", p: "dias" },
    hora: { s: "hora", p: "horas" },
    minuto: { s: "minuto", p: "minutos" },
    segundo: { s: "segundo", p: "segundos" },
  };
  return value === 1 ? map[unit].s : map[unit].p;
}

function joinPt(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? "";
  if (parts.length === 2) return `${parts[0]} e ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")} e ${parts.at(-1)}`;
}

export function formatSinceHuman(lastUpdate: Date, now = new Date()): string {
  let diffMs = now.getTime() - lastUpdate.getTime();
  if (diffMs < 0) diffMs = 0;

  let totalSeconds = Math.floor(diffMs / 1000);

  const SEC = 1;
  const MIN = 60 * SEC;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  const MONTH = 30 * DAY;
  const YEAR = 365 * DAY;

  const years = Math.floor(totalSeconds / YEAR);
  totalSeconds %= YEAR;
  const months = Math.floor(totalSeconds / MONTH);
  totalSeconds %= MONTH;
  const weeks = Math.floor(totalSeconds / WEEK);
  totalSeconds %= WEEK;
  const days = Math.floor(totalSeconds / DAY);
  totalSeconds %= DAY;
  const hours = Math.floor(totalSeconds / HOUR);
  totalSeconds %= HOUR;
  const minutes = Math.floor(totalSeconds / MIN);
  totalSeconds %= MIN;
  const seconds = totalSeconds;

  // < 24h => horas/minutos/segundos
  // < 7d => dias/horas
  // < 30d => semanas/dias
  // < 365d => meses/semanas/dias
  // >= 365d => anos/meses
  const totalDays = Math.floor(diffMs / 1000 / DAY);

  let parts: string[] = [];

  if (totalDays < 1) {
    if (hours) parts.push(`${hours} ${pluralize("hora", hours)}`);
    if (minutes) parts.push(`${minutes} ${pluralize("minuto", minutes)}`);
    parts.push(`${seconds} ${pluralize("segundo", seconds)}`);
    return joinPt(parts);
  }

  if (totalDays < 7) {
    if (days) parts.push(`${days} ${pluralize("dia", days)}`);
    parts.push(`${hours} ${pluralize("hora", hours)}`);
    return joinPt(parts);
  }

  if (totalDays < 30) {
    if (weeks) parts.push(`${weeks} ${pluralize("semana", weeks)}`);
    parts.push(`${days} ${pluralize("dia", days)}`);
    return joinPt(parts);
  }

  if (totalDays < 365) {
    if (months) parts.push(`${months} ${pluralize("mes", months)}`);
    if (weeks) parts.push(`${weeks} ${pluralize("semana", weeks)}`);
    parts.push(`${days} ${pluralize("dia", days)}`);
    return joinPt(parts);
  }

  parts.push(`${years} ${pluralize("ano", years)}`);
  parts.push(`${months} ${pluralize("mes", months)}`);
  return joinPt(parts);
}
