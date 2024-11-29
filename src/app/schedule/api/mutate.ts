import { APIUserInputConditionSchema, ISchedule } from '@/entity/types';
import axios from 'axios';
import { z } from 'zod';

export const scheduleMutateApi = {
  generate: {
    mutationKey: ['schedules'],
    mutationFn: async ({
      employeeConditions,
      maxWorkComboDayCount,
      startDate,
      maxSchedule,
      workConditionOfWeek,
    }: z.infer<typeof APIUserInputConditionSchema>) => {
      const { data } = await axios.post('/api/schedules', {
        employeeConditions,
        maxWorkComboDayCount,
        startDate,
        maxSchedule,
        workConditionOfWeek,
      });

      return data.data as ISchedule[];
    },
  },
};
