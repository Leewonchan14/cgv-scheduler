import { getOwn } from '@/app/employee/action';
import { IEmployee } from '@/entity/employee.entity';
import { queryOptions } from '@tanstack/react-query';
import axios from 'axios';

export const employeeQueryApi = {
  findAll: queryOptions({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data } = await axios.get('/api/employees');
      return data.data as IEmployee[];
    },
    staleTime: 1000 * 30,
  }),

  getOwn: queryOptions({
    queryKey: ['own'],
    queryFn: async () => {
      return await getOwn();
    },
    staleTime: 1000 * 30,
  }),
};
