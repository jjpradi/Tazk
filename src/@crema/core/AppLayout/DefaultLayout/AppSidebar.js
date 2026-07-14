import React, { useState, useEffect } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import clsx from 'clsx';
import {toggleNavCollapsed} from '../../../../redux/actions';
import {useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import AppScrollbar from '../../AppScrollbar';
import VerticalNav from '../components/VerticalNav';
import MainSidebar from '../components/MainSidebar';
import {useLayoutContext} from '../../../utility/AppContextProvider/LayoutContextProvider';
import UserInfo from '../components/UserInfo';
import {useSidebarContext} from '../../../utility/AppContextProvider/SidebarContextProvider';
import SearchIcon from '@mui/icons-material/Search';
import SidebarMenuSearch from '../../../../components/Layout/MenuSearch';

const SearchBar = ({ onClick }) => (
  <Box sx={{ px: 1.5, py: 1 }}>
    <Divider sx={{ mb: 1 }} />
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        px: 1.5, py: 0.7,
        borderRadius: '8px', cursor: 'pointer',
        border: '1px solid', borderColor: 'divider',
        bgcolor: 'grey.50',
        '&:hover': { bgcolor: 'grey.100', borderColor: 'grey.400' },
        transition: 'all 0.15s',
      }}
    >
      <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
      <Typography sx={{ flex: 1, fontSize: '12px', color: 'text.disabled' }}>Search...</Typography>
      <Typography sx={{
        fontSize: '10px', color: 'text.disabled',
        border: '1px solid', borderColor: 'divider',
        borderRadius: '4px', px: 0.7, py: 0.1, lineHeight: 1.4,
      }}>
        Ctrl K
      </Typography>
    </Box>
  </Box>
);

const AppSidebar = (props) => {
  const dispatch = useDispatch();
  const navCollapsed = useSelector(({settings}) => settings?.navCollapsed);
  const {footer, footerType} = useLayoutContext();
  const {sidebarTextColor} = useSidebarContext();
  const [searchOpen, setSearchOpen] = useState(false);

  const { NavigationReducer: { menus: navigationMenus } } = useSelector(state => state);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleDrawer = () => {
    dispatch(toggleNavCollapsed());
  };
  return (
    <>
      <Box sx={{ display: { lg: 'none' } }}>
        <Drawer
          anchor={props.position}
          open={navCollapsed}
          onClose={() => handleToggleDrawer()}
          classes={{
            root: clsx(props.variant),
            paper: clsx(props.variant),
          }}
          style={{position: 'absolute'}}
        >
          <MainSidebar>
            <UserInfo color={sidebarTextColor} />
            <AppScrollbar
              sx={{
                py: 2,
                height: 'calc(100vh - 110px) !important',
                borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
                mt: 0.5,
              }}
            >
              <VerticalNav />
            </AppScrollbar>
            <SearchBar onClick={() => setSearchOpen(true)} />
          </MainSidebar>
        </Drawer>
      </Box>
      <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
        <MainSidebar>
          <UserInfo color={sidebarTextColor} />
          <AppScrollbar
            className={clsx({
              'has-footer-fixed': footer && footerType === 'fixed',
            })}
            sx={{
              py: 2,
              height: 'calc(100vh - 110px) !important',
              borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
              mt: 0.5,
              '&.has-footer-fixed': {
                height: {
                  xs: 'calc(100vh - 157px) !important',
                  xl: 'calc(100vh - 167px) !important',
                },
              },
            }}
          >
            <VerticalNav />
          </AppScrollbar>
          <SearchBar onClick={() => setSearchOpen(true)} />
        </MainSidebar>
      </Box>
      <SidebarMenuSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        navigationMenus={navigationMenus}
      />
    </>
  );
};

export default AppSidebar;

AppSidebar.propTypes = {
  position: PropTypes.string,
  variant: PropTypes.string,
};
