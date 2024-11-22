import { NextPage } from 'next';

interface Props {
  children: React.ReactNode;
}

const EmployeeUpdateLayout: NextPage<Props> = ({ children }) => {
  return (
    <div className="flex flex-col items-start gap-8">
      <h1 className="block text-3xl font-bold">근무자 수정</h1>
      {children}
    </div>
  );
};

export default EmployeeUpdateLayout;
