import { SideNav } from '@/share/ui/sidenav/sidenav';
import { NextPage } from 'next';

interface Props {
  children: React.ReactNode;
}

const ScheduleLayout: NextPage<Props> = ({ children }) => {
  return (
    <div className="flex">
      <SideNav />
      <div className="pl-sidenav-width">{children}</div>
    </div>
  );
};

export default ScheduleLayout;
