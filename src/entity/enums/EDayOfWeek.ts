// enums/DayOfWeek.ts
export enum EDayOfWeek {
  일 = '일',
  월 = '월',
  화 = '화',
  수 = '수',
  목 = '목',
  금 = '금',
  토 = '토',
}

export function getSliceFromDayOfWeekReverse(
  dayOfWeek: EDayOfWeek,
): EDayOfWeek[] {
  const index = EDAY_OF_WEEKS.indexOf(dayOfWeek);
  return EDAY_OF_WEEKS.slice(index + 1);
}

export const EDAY_OF_WEEKS = [
  EDayOfWeek.목,
  EDayOfWeek.금,
  EDayOfWeek.토,
  EDayOfWeek.일,
  EDayOfWeek.월,
  EDayOfWeek.화,
  EDayOfWeek.수,
] as const;

export const EDAY_OF_WEEKS_CORRECT = [
  EDayOfWeek.일,
  EDayOfWeek.월,
  EDayOfWeek.화,
  EDayOfWeek.수,
  EDayOfWeek.목,
  EDayOfWeek.금,
  EDayOfWeek.토,
] as const;
