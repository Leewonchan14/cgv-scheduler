import { EDAY_OF_WEEKS, EDayOfWeek } from './EDayOfWeek';

export enum EWorkTime {
  오픈 = '오픈',
  마감 = '마감',
  선택 = '선택',
}

export const EWORK_TIMES = [
  EWorkTime.오픈,
  EWorkTime.마감,
  EWorkTime.선택,
] as const;

export const EWORK_TIME_WITHOUT_SELECT = [...EWORK_TIMES].filter(
  (t) => t !== EWorkTime.선택,
);

export type IAbleWorkTime = {
  [K in EDayOfWeek]?: EWorkTime[];
};

export const WORK_PERIODS: {
  [K in '오픈' | '마감']: { startTime: Date; endTime: Date };
} = {
  오픈: {
    startTime: new Date(0, 0, 0, 8, 30, 0, 0),
    endTime: new Date(0, 0, 0, 16, 30, 0, 0),
  },
  마감: {
    startTime: new Date(0, 0, 0, 16, 30, 0, 0),
    endTime: new Date(0, 0, 0, 24, 0, 0, 0),
  },
} as const;

export const ABLE_EVERY_DAY_WORK_TIME: IAbleWorkTime = Object.fromEntries(
  EDAY_OF_WEEKS.map((dayOfWeek) => [
    dayOfWeek,
    [EWorkTime.오픈, EWorkTime.마감],
  ]),
) as IAbleWorkTime;
