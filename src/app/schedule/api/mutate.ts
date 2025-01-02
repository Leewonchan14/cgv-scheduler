import { scheduleQueryApi } from '@/app/schedule/api/queryoption';
import { DateDay } from '@/entity/interface/DateDay';
import {
  APIPossibleEmployeeType,
  APIScheduleSchema,
  APIUserInputConditionSchema,
  ISchedule,
} from '@/entity/types';
import { FilteredEmployees } from '@/feature/employee/with-schedule/filter-employee-condition';
import { ScheduleErrorCounter } from '@/feature/schedule/schedule-error-counter';
import { getQueryClient } from '@/share/libs/tasntack-query/get-query-client';
import axios from 'axios';
import { z } from 'zod';

export const scheduleMutateApi = {
  generate: {
    mutationKey: ['schedules', 'generate'],
    mutationFn: async (
      userInput: z.infer<typeof APIUserInputConditionSchema>,
    ) => {
      const { data } = await axios.post('/api/schedules/generate', userInput);

      return {
        data: data.data as ISchedule[],
        counter: data.counter as ScheduleErrorCounter['counter'],
      };
    },
  },

  save: {
    mutationKey: ['schedules'],
    mutationFn: async ({
      selectedWeek,
      workConditionOfWeek,
    }: {
      workConditionOfWeek: z.infer<typeof APIScheduleSchema>;
      selectedWeek: Date;
    }) => {
      await axios.request({
        url: '/api/schedules',
        method: 'POST',
        data: workConditionOfWeek,
        params: {
          selectedWeek: new DateDay(selectedWeek, 0).format('YYYY-MM-DD'),
        },
      });
      return;
    },
    onSuccess: () => {
      getQueryClient().invalidateQueries({
        queryKey: [scheduleQueryApi.findWeek(new Date()).queryKey[0]],
      });
    },
  },

  possibleEmployee: (body: APIPossibleEmployeeType) => {
    return {
      mutationKey: ['schedules', 'possibleEmployee'],
      mutationFn: async () => {
        const { data } = await axios.post('/api/schedules/employee', body);
        return data.data as FilteredEmployees;
      },
    };
  },
};
