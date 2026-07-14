import React, { useMemo } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { useSelector } from 'react-redux';

import FrontDeskIcon from '../../../assets/dashboardIcons/frontdesk.png';
import { PinDropIcon } from 'pages/routesIcons';
import StoreIcon from '@mui/icons-material/Store';
import PersonIcon from '@mui/icons-material/Person';
import { findMenuByKey } from 'utils/menuTreeUtils';
import { singlePageScrollHostSx } from 'utils/pageScrollLayout';
import { infoComponentMap } from 'utils/menuComponentRegistry';

const infoIconMap = {
  info__general: <PersonIcon />,
  info__departments: <StoreIcon style={{ color: 'black' }} />,
  info__locations: <PinDropIcon style={{ color: 'black' }} />,
  info__dept_head: <StoreIcon style={{ color: 'black' }} />,
  info__lov: <StoreIcon style={{ color: 'black' }} />,
  info__front_desk: <img src={FrontDeskIcon} style={{ width: 24, height: 24 }} />,
};

function Information() {
  const navigationMenus = useSelector((state) => state.NavigationReducer.menus);
  const [value, setValue] = React.useState(0);

  const companyInfoMenu = useMemo(
    () => findMenuByKey(navigationMenus, 'settings__company_info'),
    [navigationMenus]
  );

  // Children arrive pre-sorted by sort_order from the bootstrap API
  const tabList = useMemo(() => {
    if (!companyInfoMenu?.children?.length) return [];
    return companyInfoMenu.children.filter((child) => infoComponentMap[child.id]);
  }, [companyInfoMenu]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const renderInfoPage = (component) => (
    <Box sx={{ ...singlePageScrollHostSx, width: '100%' }}>
      {component}
    </Box>
  );

  const activeTab = tabList[value];
  const ActiveComponent = activeTab ? infoComponentMap[activeTab.id] : null;

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Tabs value={value} onChange={handleChange} aria-label="tabs example" sx={{ flexShrink: 0 }}>
        {tabList.map((tab) => (
          <Tab
            key={tab.id}
            icon={infoIconMap[tab.id] || <StoreIcon style={{ color: 'black' }} />}
            label={tab.messageId}
          />
        ))}
      </Tabs>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {ActiveComponent && renderInfoPage(<ActiveComponent />)}
      </Box>
    </Box>
  );
}

export default Information;
