import Sidenav from '@/app/ui/sidenav/sidenav';
import { NextPage } from 'next';

interface Props {
  children: React.ReactNode;
}

const SideNavLayout: NextPage<Props> = ({ children }) => {
  return (
    <div>
      <Sidenav />
      <div className="md:ml-sidenav-width">{children}</div>
    </div>
  );
};

export default SideNavLayout;
