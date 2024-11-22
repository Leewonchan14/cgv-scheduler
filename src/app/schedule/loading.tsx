import LoadingAnimation from '@/app/ui/loading/loading-animation';
import { NextPage } from 'next';

interface Props {}

const ScheduleLoading: NextPage<Props> = ({}) => {
  return <LoadingAnimation text={'근무표를 가져오는 중'} />;
};

export default ScheduleLoading;
