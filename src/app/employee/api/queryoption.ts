import { IEmployee } from '@/entity/employee.entity';
import axios from 'axios';

export const employeeQueryApi = {
  findByIds: {
    queryKey: ['employees'],
    queryFn: async () => {
      const { data } = await axios.get('/api/employees');
      return data.data as IEmployee[];
    },
  },
};
