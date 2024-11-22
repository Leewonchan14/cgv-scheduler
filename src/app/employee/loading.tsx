import LoadingAnimation from '@/app/ui/loading/loading-animation';
import { NextPage } from 'next';

interface Props {}

const EmployeeLoading: NextPage<Props> = ({}) => {
  return <LoadingAnimation text={'근무자 정보를 가져오는 중'} />;
};

export default EmployeeLoading;
