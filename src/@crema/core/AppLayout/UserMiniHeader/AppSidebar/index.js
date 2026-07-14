import React, {useState, useEffect} from 'react';
import {toggleNavCollapsed} from '../../../../../redux/actions';
import {useDispatch, useSelector} from 'react-redux';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import AppScrollbar from '../../../AppScrollbar';
import MainSidebar from '../../components/MainSidebar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import VerticalNav from '../../components/VerticalNav';
import UserMiniHeaderSidebarWrapper from './UserMiniHeaderSidebarWrapper';
import {useLayoutContext} from '../../../../utility/AppContextProvider/LayoutContextProvider';
import SearchIcon from '@mui/icons-material/Search';
import SidebarMenuSearch from '../../../../../components/Layout/MenuSearch';

const SearchBar = ({onClick}) => (
  <Box sx={{px: 1.5, py: 1}}>
    <Divider sx={{mb: 1}} />
    <Box
      onClick={onClick}
      className='sidebar-search-bar'
      sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        px: 1.5, py: 0.7,
        borderRadius: '8px', cursor: 'pointer',
        border: '1px solid', borderColor: 'divider',
        bgcolor: 'grey.50',
        '&:hover': {bgcolor: 'grey.100', borderColor: 'grey.400'},
        transition: 'all 0.15s',
      }}
    >
      <SearchIcon sx={{fontSize: 18, color: 'text.disabled'}} />
      <Typography className='nav-item-content' sx={{flex: 1, fontSize: '12px', color: 'text.disabled'}}>Search...</Typography>
      <Typography className='nav-item-content' sx={{
        fontSize: '10px', color: 'text.disabled',
        border: '1px solid', borderColor: 'divider',
        borderRadius: '4px', px: 0.7, py: 0.1, lineHeight: 1.4,
      }}>
        {navigator.platform?.includes('Mac') ? '⌘ K' : 'Ctrl K'}
      </Typography>
    </Box>
  </Box>
);

const SearchIconCollapsed = ({onClick}) => (
  <Box className='sidebar-search-icon' sx={{display: 'flex', justifyContent: 'center', py: 1}}>
    <Tooltip title="Search menus (⌘K)" placement="right">
      <IconButton onClick={onClick} size="small" sx={{color: 'text.disabled'}}>
        <SearchIcon sx={{fontSize: 20}} />
      </IconButton>
    </Tooltip>
  </Box>
);

const AppSidebar = (props) => {
  const dispatch = useDispatch();
  const navCollapsed = useSelector(({settings}) => settings.navCollapsed);
  const {footer, footerType} = useLayoutContext();
  const [searchOpen, setSearchOpen] = useState(false);

  const {NavigationReducer: {menus: navigationMenus}} = useSelector(state => state);

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
      <Box sx={{display: {lg: 'none'}}}>
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
          <UserMiniHeaderSidebarWrapper className='user-mini-header-sidebar'>
            <MainSidebar>
              <AppScrollbar
                className={clsx({
                  'has-footer-fixed': footer && footerType === 'fixed',
                })}
                sx={{
                  py: 2,
                  height: 'calc(100vh - 50px) !important',
                  '&.has-footer-fixed': {
                    height: 'calc(100vh - 117px) !important',
                  },
                }}
                scrollToTop={false}
              >
                <VerticalNav />
              </AppScrollbar>
              <SearchBar onClick={() => setSearchOpen(true)} />
            </MainSidebar>
          </UserMiniHeaderSidebarWrapper>
        </Drawer>
      </Box>
      <Box sx={{display: {xs: 'none', lg: 'block'}}}>
        <UserMiniHeaderSidebarWrapper className='user-mini-header-sidebar'>
          <MainSidebar>
            <AppScrollbar
              className={clsx({
                'has-footer-fixed': footer && footerType === 'fixed',
              })}
              sx={{
                py: 2,
                height: 'calc(100vh - 121px) !important',
                '&.has-footer-fixed': {
                  height: {
                    xs: 'calc(100vh - 169px) !important',
                    xl: 'calc(100vh - 181px) !important',
                  },
                },
              }}
              scrollToTop={false}
            >
              <VerticalNav />
            </AppScrollbar>
            <SearchBar onClick={() => setSearchOpen(true)} />
            <SearchIconCollapsed onClick={() => setSearchOpen(true)} />
          </MainSidebar>
        </UserMiniHeaderSidebarWrapper>
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
