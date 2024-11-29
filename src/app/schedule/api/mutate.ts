import { scheduleQueryApi } from '@/app/schedule/api/queryoption';
import {
  APIScheduleSchema,
  APIUserInputConditionSchema,
  ISchedule,
} from '@/entity/types';
import { getQueryClient } from '@/share/libs/tasntack-query/get-query-client';
import axios from 'axios';
import { z } from 'zod';

export const scheduleMutateApi = {
  generate: {
    mutationKey: ['schedules', 'generate'],
    mutationFn: async ({
      employeeConditions,
      maxWorkComboDayCount,
      startDate,
      maxSchedule,
      workConditionOfWeek,
    }: z.infer<typeof APIUserInputConditionSchema>) => {
      const { data } = await axios.post('/api/schedules/generate', {
        employeeConditions,
        maxWorkComboDayCount,
        startDate,
        maxSchedule,
        workConditionOfWeek,
      });

      return data.data as ISchedule[];
    },
  },

  save: {
    mutationKey: ['schedules'],
    mutationFn: async (
      workConditionOfWeek: z.infer<typeof APIScheduleSchema>,
    ) => {
      await axios.request({
        url: '/api/schedules',
        method: 'POST',
        data: workConditionOfWeek,
      });
      return;
    },
    onSuccess: () => {
      getQueryClient().invalidateQueries({
        queryKey: [scheduleQueryApi.findWeek(new Date()).queryKey[0]],
      });
    },
  },
};
