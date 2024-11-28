import ScheduleGeneratorForm from '@/app/schedule/ui/generator/ScheduleGeneratorForm';

const SchedulePage: React.FC = async () => {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">근무표 관리</h1>
      <ScheduleGeneratorForm />
    </div>
  );
};

export default SchedulePage;
