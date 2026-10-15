export function getMonthsRange(monthsBack: number): { month: number; year: number; date: Date }[] {
  const now = new Date();
  const arr = [];

  for (let i = 0; i < monthsBack; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    arr.push({
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      date: d
    });
  }

  return arr.reverse();
}
