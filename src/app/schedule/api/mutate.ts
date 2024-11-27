import { ISchedule } from '@/entity/interface/ISchedule';
import axios from 'axios';

export const scheduleMutateApi = {
  generate: {
    mutationKey: ['schedules'],
    mutationFn: async ({
      ids,
      maxSchedule,
    }: {
      ids: number[];
      maxSchedule: number;
    }) => {
      const { data } = await axios.post('/api/schedules', { ids, maxSchedule });

      return data.data as ISchedule[];
    },
  },
};
