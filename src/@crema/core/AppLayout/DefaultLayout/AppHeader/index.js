import React, { useCallback } from 'react';
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
import {Alert, Button, TextField} from '@mui/material';
import AppLocationSwitcher from '@crema/core/AppLocations';
import { getsessionStorage } from 'pages/common/login/cookies';
import { useNavigate } from 'react-router-dom';
import FavouriteMenu from '@crema/core/FavouriteMenu';


const AppHeader = (props) => {
  const storage = getsessionStorage();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubscribe = () => {
    navigate('/common/settings');
  };
  
  return (
    <AppBar
      position='sticky'
      color='inherit'
      sx={{
        boxShadow: 'none !important',
        borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
        backgroundColor: 'background.paper',
        top: 0,
        zIndex: 1100,
        width: {
          xs: '100%',
        },
      }}
      className='app-bar'
    >
      <Toolbar
        sx={{
          boxSizing: 'border-box',
          minHeight: {xs: 60},
          maxHeight: {xs: 60},
          paddingLeft: {xs: 5},
          paddingRight: {xs: 5, md: 7.5, xl: 12.5},
        }}
      >
        <Box sx={{ display: { lg: 'none' } }}>
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
        <AppLogo />
        {/* <AppSearchBar iconPosition='right' placeholder='Search…' />  */}

        <Box
          sx={{
            flexGrow: 1,
          }}
        />
        <Box
          sx={{
            px: 1.85,
          }}
        >
          {props.hidden === false ? (
            ''
          ) : (
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
          )}
        </Box>

         {storage.isTrial === 1 && window.location.pathname !== '/common/subscriptions' && (
          <Box
            sx={{
              alignSelf: 'flex-end',
              ml: 4,
            }}
          >
            <Alert severity='warning'>
             {storage.subscriptionRemainingDays === 0 ? `Your free trial has ended` : `Your free trial ends in ${storage.subscriptionRemainingDays} days.`}
              <Button
                variant='contained'
                color='secondary'
                size='small'
                onClick={handleSubscribe}
                sx={{ml: 2}}
              >
                Subscribe Now
              </Button>
            </Alert>
          </Box>
        )}

        {/* <AppLngSwitcher iconOnly={true} tooltipPosition='bottom' /> */}
        <Box sx={{ml: 4}}>
          <Box
              sx={{
                position: 'relative',
                display: { xs: 'none', md: 'flex' },
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
                position: 'relative',
                display: { xs: 'flex', sm: 'none' },
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
            {/* <MenuItem>
              <AppMessages isMenu />
            </MenuItem>
            <MenuItem>Setting</MenuItem> */}
          </Menu>
        </Box>

       
      </Toolbar>
    </AppBar>
  );
};
export default AppHeader;
