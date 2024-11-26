import { NextPage } from 'next';

interface Props {
  children: React.ReactNode;
}

const EmployeeUpdateLayout: NextPage<Props> = ({ children }) => {
  return <div className="flex flex-col items-start gap-8">{children}</div>;
};

export default EmployeeUpdateLayout;
