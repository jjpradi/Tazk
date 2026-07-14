import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Typography,
  Grid,
  List,
  ListItemText,
  MenuItem,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import AppsContainer from '@crema/core/AppsContainer';
import { titleURL } from 'http-common';
import { findMenuByKey } from 'utils/menuTreeUtils';
import { settingsComponentMap } from 'utils/menuComponentRegistry';

const SettingsIndex = () => {
  const navigationMenus = useSelector((state) => state.NavigationReducer.menus);
  const { appConfigReducer: { app_config_data } } = useSelector((state) => state);
  const pageType = useSelector((state) => state.commonReducer?.pageType);
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState(location.state?.selectedKey || null);

  const settingsMenu = useMemo(
    () => findMenuByKey(navigationMenus, 'settings'),
    [navigationMenus]
  );

  // Children arrive pre-sorted by sort_order from the bootstrap API
  const tabList = useMemo(() => {
    if (!settingsMenu?.children?.length) return [];
    return settingsMenu.children.filter((child) => settingsComponentMap[child.id]);
  }, [settingsMenu]);

  useEffect(() => {
    if (tabList.length > 0 && !selectedKey) {
      setSelectedKey(tabList[0].id);
    }
  }, [tabList, selectedKey]);

  const isAddAccEnable = app_config_data.find(item => item.key_name === "additional_acc")?.value || null;

  const filteredTabs = useMemo(() => {
    let tabs = tabList;
    if (isAddAccEnable == 1) {
      const allowedKeys = ['settings__cash_box', 'settings__company_info', 'settings__themes', 'settings__user_roles'];
      tabs = tabs.filter(item => allowedKeys.includes(item.id));
    }
    if (pageType === 'detailpage') {
      const detailKeys = ['settings__company_info'];
      tabs = tabs.filter(item => detailKeys.includes(item.id));
    }
    return tabs;
  }, [tabList, isAddAccEnable, pageType]);

  const onGetMainComponent = () => {
    const Component = settingsComponentMap[selectedKey];
    return Component ? (
      <Suspense fallback={<div>Loading...</div>}>
        <Component />
      </Suspense>
    ) : null;
  };

  return (
    <Grid>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{titleURL} | Settings </title>
      </Helmet>
      <AppsContainer
        title="AppConfig"
        sxStyle={{ height: '100%' }}
        cardStyle={{ height: 'calc(100vh - 80px)' }}
        sidebarStyle={{ height: 'calc(100vh - 80px)' }}
        sidebarContent={
          <Grid sx={{ marginTop: '40px', maxHeight: '80vh', overflow: 'auto' }}>
            <List>
              {filteredTabs.map((tab) => (
                <MenuItem
                  key={tab.id}
                  onClick={() => setSelectedKey(tab.id)}
                  style={{
                    height: '40px',
                    backgroundColor: selectedKey === tab.id ? '#E6F4FB' : '',
                  }}
                  value={tab.messageId}
                >
                  <ListItemText
                    sx={{ color: selectedKey === tab.id ? '#0A8FDC' : '' }}
                    primary={
                      <Typography
                        sx={{
                          fontWeight: selectedKey === tab.id ? '700' : '500',
                          fontSize: '13px',
                        }}
                      >
                        {tab.messageId}
                      </Typography>
                    }
                  />
                </MenuItem>
              ))}
            </List>
          </Grid>
        }
      >
        {onGetMainComponent()}
      </AppsContainer>
    </Grid>
  );
};

export default SettingsIndex;
