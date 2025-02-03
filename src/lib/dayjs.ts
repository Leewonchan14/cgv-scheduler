import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { z } from 'zod';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale('ko');
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);

const TimeZone = 'Asia/Seoul';

export const day_js = (date?: dayjs.ConfigType) => {
  // Z로 끝나는 문자열은 UTC로 처리
  if (typeof date === 'string' && date.endsWith('Z')) {
    return dayjs.utc(date).tz(TimeZone);
  }

  // 문자열이면서 Z로 끝나지 않는 경우는 (2025-01-15) Asia/Seoul로 처리
  if (typeof date === 'string') {
    return dayjs.tz(date, TimeZone);
  }

  // 그 외의 경우는 그냥 처리
  return dayjs(date).tz(TimeZone);
};

export type Dayjs = ReturnType<typeof day_js>;

export const dayjsZod = () => {
  return z.coerce.date().transform((date) => day_js(date));
};

export const getStartEndOfMonth = (date: Dayjs) => {
  const startOfMonth = date.startOf('month').startOf('week');
  const endOfMonth = date.endOf('month').endOf('week');

  return { startOfMonth, endOfMonth };
};

export const SELECTED_DATE_KEY = 'selectedDate';
