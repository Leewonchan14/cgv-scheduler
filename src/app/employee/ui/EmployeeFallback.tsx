import TableMargin from '@/app/employee/ui/TableMargin';
import { EDAY_OF_WEEKS } from '@/entity/enums/EDayOfWeek';
import { NextPage } from 'next';
import React from 'react';

interface Props {}

const EmployeeFallback: NextPage<Props> = ({}) => {
  return [...EDAY_OF_WEEKS].map((_, index) => (
    <React.Fragment key={index}>
      <tr className="bg-gray-100">
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td></td>
      </tr>
      <TableMargin margin={'h-4'} />
    </React.Fragment>
  ));
};

export default EmployeeFallback;
