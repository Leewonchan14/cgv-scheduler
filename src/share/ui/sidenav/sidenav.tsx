'use client';

import { FC } from 'react';
import { Menu, MenuItem, Sidebar, SubMenu } from 'react-pro-sidebar';

export const SideNav: FC<{}> = () => {
  return (
    <Sidebar width='18rem' rootStyles={{ height: '100vh', position: 'fixed' }}>
      <Menu>
        <SubMenu label="Charts">
          <MenuItem> Pie charts </MenuItem>
          <MenuItem> Line charts </MenuItem>
        </SubMenu>
        <MenuItem> Documentation </MenuItem>
        <MenuItem> Calendar </MenuItem>
      </Menu>
    </Sidebar>
  );
};
