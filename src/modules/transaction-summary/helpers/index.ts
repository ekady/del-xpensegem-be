import { eachDayOfInterval, isSameDay } from 'date-fns';

export function calculatePercentageChange(
  current: number | string,
  previous: number | string,
) {
  if (+previous === 0) {
    return previous === current ? 0 : 100;
  }
  return ((+current - +previous) / +previous) * 100;
}

export function fillMissingDays(
  activeDays: {
    date: Date;
    income: number;
    expenses: number;
  }[],
  startDate: Date,
  endDate: Date,
) {
  if (activeDays.length === 0) return [];
  const allDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const transactionsByDay = allDays.map((day) => {
    const found = activeDays.find((d) => isSameDay(d.date, day));
    if (found) {
      return found;
    } else {
      return {
        date: day,
        income: 0,
        expenses: 0,
      };
    }
  });
  return transactionsByDay;
}
