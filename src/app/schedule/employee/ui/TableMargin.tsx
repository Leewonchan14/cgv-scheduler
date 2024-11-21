import { FC } from 'react';

const TableMargin: FC<{ margin: string }> = ({ margin }) => {
  return <tr className={margin} />;
};

export default TableMargin;
