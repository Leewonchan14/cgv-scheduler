import ScheduleGeneratorForm from '@/app/schedule/generator/ScheduleGeneratorForm';
import { NextPage } from 'next';

interface Props {}

const ScheduleGeneratorPage: NextPage<Props> = ({}) => {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">근무표 수정</h1>
      <ScheduleGeneratorForm />
    </div>
  );
};

export default ScheduleGeneratorPage;
