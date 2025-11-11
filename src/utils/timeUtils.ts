export function calcWorked(entryIso: string, nowIso?: string) {
  const entry = new Date(entryIso);
  const now = nowIso ? new Date(nowIso) : new Date();
  const diffMs = now.getTime() - entry.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const totalHours = Number((hours + minutes / 60).toFixed(2));
  return {
    hours,
    minutes,
    display: `${hours}h ${minutes}m`,
    totalHours,
  };
}

export default calcWorked;
