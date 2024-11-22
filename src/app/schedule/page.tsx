import { ERole } from '@/entity/enums/ERole';
import { withAuth } from '@/feature/auth';
import { NextPage } from 'next';

interface Props {}

const SchedulePage: NextPage<Props> = async ({}) => {
  await withAuth([ERole.EMPLOYEE, ERole.ADMIN]);

  return <div>스케쥴 페이지</div>;
};

export default SchedulePage;
