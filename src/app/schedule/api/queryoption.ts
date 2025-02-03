import { ISchedule } from '@/entity/types';
import { day_js } from '@/lib/dayjs';
import { queryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { format, startOfMonth } from 'date-fns';

export const scheduleQueryApi = {
  findWeek: (selectedWeek?: Date) => {
    const form = day_js(selectedWeek).format('YYYY-MM-DD');
    return queryOptions({
      queryKey: ['schedules', form],
      queryFn: async () => {
        const { data } = await axios.get('/api/schedules', {
          params: { selectedWeek: form },
        });
        return data.data as ISchedule;
      },
      staleTime: 1000 * 30,
      enabled: !!selectedWeek,
    });
  },

  findByDate: (date: Date) => {
    const form = format(startOfMonth(date), 'yyyy-MM-dd');
    return queryOptions({
      queryKey: ['schedules', 'date', form],
      queryFn: async () => {
        const { data } = await axios.get('/api/schedules/preview', {
          params: { selectedWeek: form },
        });
        return data.data as number[];
      },
      staleTime: 1000 * 60,
    });
  },
};
