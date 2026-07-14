import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import AppLngSwitcher from '@crema/core/AppLngSwitcher';
import Box from '@mui/material/Box';
import AppSearchBar from '@crema/core/AppSearchBar';
import IconButton from '@mui/material/IconButton';
import {toggleNavCollapsed} from '../../../../../redux/actions';
import MenuIcon from '@mui/icons-material/Menu';
import {useDispatch} from 'react-redux';
import AppMessages from '../../../AppMessages';
import AppNotifications from '../../../AppNotifications';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AppTooltip from '../../../AppTooltip';
import {alpha} from '@mui/material/styles';
import AppLogo from '../../components/AppLogo';
import UserInfo from '../../components/UserInfo';
import AppLocationSwitcher from '@crema/core/AppLocations';
import FavouriteMenu from '@crema/core/FavouriteMenu';
import { getsessionStorage } from 'pages/common/login/cookies';
import { Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AppHeader = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const storage = getsessionStorage()
  

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubscribe = () => {
    navigate('/common/settings', { state: { selectedKey: 'settings__subscriptions' } });
  };

  return (
    <AppBar
      position='sticky'
      color='inherit'
      sx={{
        boxShadow: 'none',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        backgroundColor: 'background.paper',
        transition: 'width 0.5s ease',
        width: '100%',
        height:'60px',
        top: 0,
        zIndex: 1100,
      }}
      className='app-bar'
    >
      <Toolbar
        sx={{
          boxSizing: 'border-box',
          minHeight: {xs: 56, sm: 70},
          paddingLeft: {xs: 2.5, md: 5},
          paddingRight: {xs: 2.5, md: 5},
        }}
      >
        <Box sx={{display: {lg: 'none'}}}>
          <IconButton
            sx={{color: 'text.secondary'}}
            edge='start'
            className='menu-btn'
            color='inherit'
            aria-label='open drawer'
            onClick={() => dispatch(toggleNavCollapsed())}
            size='large'
          >
            <MenuIcon
              sx={{
                width: 35,
                height: 35,
              }}
            />
          </IconButton>
        </Box>
        <Box
          sx={{
            '& .logo-text': {
              display: {xs: 'none', sm: 'block'},
            },
          }}
        >
          <AppLogo />
        </Box>
        <Box
          sx={{
            flexGrow: 1,
          }}
        />
        {Number(storage.isTrial) === 1 && window.location.pathname !== '/common/subscriptions' && (
          <Box sx={{ alignSelf: 'center', ml: 4 }}>
            <Alert severity='warning' sx={{ py: 0, alignItems: 'center' }}>
              {Number(storage.subscriptionRemainingDays) === 0
                ? `Your free trial has ended`
                : `Your free trial ends in ${storage.subscriptionRemainingDays} days.`}
              <Button
                variant='contained'
                color='secondary'
                size='small'
                onClick={handleSubscribe}
                sx={{ ml: 2 }}
              >
                Subscribe Now
              </Button>
            </Alert>
          </Box>
        )}
        <Box
          sx={{
            minHeight: 40,
            position: 'relative',
            display: {xs: 'none', sm: 'block'},
            '& .searchRoot': {
              position: {xs: 'absolute', sm: 'relative'},
              right: {xs: 0, sm: 'auto'},
              top: {xs: 0, sm: 'auto'},
            },
          }}
        >
          {/* <AppSearchBar iconPosition='right' placeholder='Search…' /> */}
        </Box>

        {/* <Box sx={{ml: 4}}>
          <AppLngSwitcher iconOnly={true} tooltipPosition='bottom' />
        </Box> */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <AppLocationSwitcher iconOnly={true} tooltipPosition="bottom" />

        {(storage.company_type === 2 || storage.company_type === 3) && (
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              marginLeft: -2,
              marginRight: -2,
            }}
          >
            <FavouriteMenu />
          </Box>
        )}
      </Box>

        <Box
          sx={{
            ml: 4,
            display: 'flex',
            alignItems: 'center',
          }}
        >
            <Box
              sx={{
                position: 'relative',
                display: {xs: 'none', md: 'flex'},
                alignItems: 'center',
                marginLeft: -2,
                marginRight: -2,
              }}
            >
              <Box
                sx={{
                  px: 1.85,
                }}
              >
                <AppNotifications />
              </Box>
              <Box
                sx={{
                  px: 1.85,
                }}
              >
                <AppMessages />
              </Box>
            </Box>

          <Box
            sx={{
              ml: {sm: 4},
              mr: {xs: 4, sm: 0},
              minWidth: {md: 220},
              '& .user-info-view': {
                p: 0,
              },
              '& .user-info': {
                display: {xs: 'none', md: 'block'},
              },
            }}
          >
            <UserInfo />
          </Box>

            <Box
              sx={{
                position: 'relative',
                display: {xs: 'flex', sm: 'none'},
                alignItems: 'center',
                marginLeft: -2,
                marginRight: -2,
              }}
            >
              <Box
                sx={{
                  px: 1.85,
                }}
              >
                <AppTooltip title='More'>
                  <IconButton
                    sx={{
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      color: (theme) => theme.palette.text.secondary,
                      backgroundColor: (theme) =>
                        theme.palette.background.default,
                      border: 1,
                      borderColor: 'transparent',
                      '&:hover, &:focus': {
                        color: (theme) => theme.palette.text.primary,
                        backgroundColor: (theme) =>
                          alpha(theme.palette.background.default, 0.9),
                        borderColor: (theme) =>
                          alpha(theme.palette.text.secondary, 0.25),
                      },
                    }}
                    onClick={handleClick}
                    size='large'
                  >
                    <MoreVertIcon />
                  </IconButton>
                </AppTooltip>
              </Box>
            </Box>
          <Menu
            id='simple-menu'
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem>
              <AppNotifications isMenu />
            </MenuItem>
            <MenuItem>
              <AppMessages isMenu />
            </MenuItem>
            <MenuItem>Setting</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
export default AppHeader;
