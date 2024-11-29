import { ISchedule } from '@/entity/types';
import { queryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';

export const scheduleQueryApi = {
  findWeek: (selectedWeek: Date) => {
    const form = format(selectedWeek, 'yyyy-MM-dd');
    return queryOptions({
      queryKey: ['schedules', form],
      queryFn: async () => {
        const { data } = await axios.get('/api/schedules', {
          params: { selectedWeek: form },
        });
        return data.data as ISchedule;
      },
      staleTime: 1000 * 30,
    });
  },
};
