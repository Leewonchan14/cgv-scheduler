import { EDayOfWeek } from './EDayOfWeek';

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

export type HourMinute = {
  hour: number;
  minute: number;
};
