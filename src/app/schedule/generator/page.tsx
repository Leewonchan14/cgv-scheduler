import { GeneratorProvider } from '@/app/schedule/generator/GeneratorContext';
import ScheduleGeneratorForm from '@/app/schedule/generator/ScheduleGeneratorForm';
import { NextPage } from 'next';

interface Props {}

const ScheduleGeneratorPage: NextPage<Props> = ({}) => {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">근무표 수정 및 자동 채우기</h1>
      <GeneratorProvider>
        <ScheduleGeneratorForm />
      </GeneratorProvider>
    </div>
  );
};

export default ScheduleGeneratorPage;
