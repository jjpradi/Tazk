import React, { Suspense } from 'react';
import {
  Grid, List, MenuItem, ListItemText, Typography,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import AppsContainer from '@crema/core/AppsContainer';
import { titleURL } from 'http-common';
import { BiUser } from 'react-icons/bi';
import { AiOutlineLock } from 'react-icons/ai';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import { IoShareSocialOutline } from 'react-icons/io5';
import TuneIcon from '@mui/icons-material/Tune';

const PersonalInfo = React.lazy(() => import('./PersonalInfo'));
const ChangePassword = React.lazy(() => import('./ChangePassword'));
const Information = React.lazy(() => import('./Information'));
const Social = React.lazy(() => import('./Social'));
const Preferences = React.lazy(() => import('./Preferences'));

const tabs = [
  { key: 'personal_info', icon: <BiUser />, name: 'Personal Info' },
  { key: 'change_password', icon: <AiOutlineLock />, name: 'Change Password' },
  { key: 'information', icon: <IoMdInformationCircleOutline />, name: 'Information' },
  { key: 'social', icon: <IoShareSocialOutline />, name: 'Social' },
  { key: 'preferences', icon: <TuneIcon sx={{ fontSize: 20 }} />, name: 'Preferences' },
];

const componentMap = {
  personal_info: () => <PersonalInfo />,
  change_password: () => <ChangePassword />,
  information: () => <Information />,
  social: () => <Social social={[]} />,
  preferences: () => <Preferences />,
};

const Account = () => {
  const [selectedKey, setSelectedKey] = React.useState(tabs[0].key);

  const onGetMainComponent = () => {
    const renderFn = componentMap[selectedKey];
    return renderFn ? (
      <Suspense fallback={<div>Loading...</div>}>
        {renderFn()}
      </Suspense>
    ) : null;
  };

  return (
    <Grid>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{titleURL} | My Account</title>
      </Helmet>
      <AppsContainer
        title="My Account"
        sxStyle={{ height: '100%' }}
        cardStyle={{ height: 'calc(100vh - 80px)', width: '100%' }}
        sidebarStyle={{ height: 'calc(100vh - 80px)' }}
        sidebarContent={
          <Grid sx={{ marginTop: '40px', maxHeight: '80vh', overflow: 'auto' }}>
            <List>
              {tabs.map((tab) => (
                <MenuItem
                  key={tab.key}
                  onClick={() => setSelectedKey(tab.key)}
                  sx={{
                    height: '40px',
                    backgroundColor: selectedKey === tab.key ? '#E6F4FB' : 'transparent',
                  }}
                >
                  <ListItemText
                    sx={{ color: selectedKey === tab.key ? '#0A8FDC' : 'inherit' }}
                    primary={
                      <Typography
                        sx={{
                          fontWeight: selectedKey === tab.key ? '700' : '500',
                          fontSize: '13px',
                        }}
                      >
                        {tab.name}
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

export default Account;
