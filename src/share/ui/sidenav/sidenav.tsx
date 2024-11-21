'use client';

import { FC } from 'react';
import { Menu, MenuItem, SubMenu, Sidebar } from 'react-pro-sidebar';

export const SideNav: FC<{}> = () => {
  return (
    <Sidebar className="h-screen absolute left-0">
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
