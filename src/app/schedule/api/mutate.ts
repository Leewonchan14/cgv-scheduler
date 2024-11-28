import { ISchedule } from '@/entity/interface/ISchedule';
import { APIUserInputConditionSchema } from '@/entity/types';
import axios from 'axios';
import { z } from 'zod';

export const scheduleMutateApi = {
  generate: {
    mutationKey: ['schedules'],
    mutationFn: async ({
      employeeConditions,
      maxWorkComboDayCount,
      startIDateDayEntity,
      maxSchedule,
      workConditionOfWeek,
    }: z.infer<typeof APIUserInputConditionSchema>) => {
      const { data } = await axios.post('/api/schedules', {
        employeeConditions,
        maxWorkComboDayCount,
        startIDateDayEntity,
        maxSchedule,
        workConditionOfWeek,
      });

      return data.data as ISchedule[];
    },
  },
};
