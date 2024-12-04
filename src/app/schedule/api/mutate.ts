import { scheduleQueryApi } from '@/app/schedule/api/queryoption';
import {
  APIPossibleEmployeeType,
  APIScheduleSchema,
  APIUserInputConditionSchema,
  ISchedule,
} from '@/entity/types';
import { FilteredEmployees } from '@/feature/employee/with-schedule/filter-employee-condition';
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
