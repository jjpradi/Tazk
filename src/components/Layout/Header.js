import React, {useEffect, useState, useRef} from 'react';
import {styled} from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreIcon from '@mui/icons-material/MoreVert';
import {App_title} from '../../utils/content';
import {useNavigate} from 'react-router-dom';
import Cookies from 'universal-cookie';
import {Select, InputLabel, FormControl, FormHelperText} from '@mui/material';
import {useDispatch, useSelector} from 'react-redux';
// import {listPosSessionAction} from '../../redux/actions/pos_session'
import {IconButton, TextField, Autocomplete} from '@mui/material';
import Content from '../pos/session/Session';
import _ from 'lodash';
import {listUserlocationsAction} from '../../redux/actions/userCreation_actions';
import { getsessionStorage, getAccessToken } from 'pages/common/login/cookies';
import socketManager from '../../utils/socketManager';
import login_services from '../../services/login_services';

const drawerWidth = 255;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({theme, open}) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

export default function PrimarySearchAppBar(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  // const dispatch = useDispatch()
  const tempinitsform = useRef(null);
  // const cookies = new Cookies();
  const storage = getsessionStorage()
  const [locate, setLocate] = useState('');
  // const [allData, setAllData] = useState([]);
  // const [filtereddata, setFiltereddata] = useState([]);
  const {allData, setHeaderLocationId, headerLocationId} = props;
  const dispatch = useDispatch();

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const history = useNavigate();
  const initsform = () => {
    let modules = '';
    if (storage) {
      modules = storage?.employee_id || '';
    }
    //  let module = JSON.parse( localStorage.getItem('moduless'))?.employee_id
    dispatch(listUserlocationsAction(modules));
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
  }, []);
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const logout = async () => {
    try {
      const user = getsessionStorage();
      let token = getAccessToken();
      let browser_id = localStorage.getItem('tazk_browser_id');
      if (browser_id) browser_id = JSON.parse(browser_id);
      await login_services.logout({access_token: token, employee_id: user?.employee_id, browserId: browser_id?.id});
    } catch (e) {
      // Continue with client cleanup even if server call fails
    }
    sessionStorage.removeItem('login');
    sessionStorage.removeItem('routesConfig');
    socketManager.disconnectAll();
    history('/');
  };

  // const locationSearch = (event) => {
  //   setLocate(event ? event.location_name : '')
  //   let value = event?.location_name;
  //   if (value) {
  //     const result = allData.filter(data => {
  //       return data.location_name.includes(value)
  //     });
  //     setFiltereddata(result);
  //   }
  //   else {
  //     setFiltereddata(allData);
  //   }
  // };
  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={logout}>Logout</MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton size='large' aria-label='show 4 new mails' color='inherit'>
          <Badge badgeContent={4} color='error'>
            <MailIcon />
          </Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem>
        <IconButton
          size='large'
          aria-label='show 17 new notifications'
          color='inherit'
        >
          <Badge badgeContent={17} color='error'>
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size='large'
          aria-label='account of current user'
          aria-controls='primary-search-account-menu'
          aria-haspopup='true'
          color='inherit'
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{flexGrow: 1}}>
      {/* <Content filtereddata ={filtereddata} allData={allData} setFiltereddata={setFiltereddata} /> */}
      <AppBar
        position='fixed'
        color='primary'
        sx={{zIndex: props.open ? 9 : 999, boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.12)'}}
      >
        <Toolbar>
          {props.open !== true ? (
            <>
              <IconButton
                size='large'
                edge='start'
                color='inherit'
                aria-label='open drawer'
                sx={{mr: 2}}
                onClick={props.handleDrawerOpen}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant='h6'
                noWrap
                component='div'
                sx={{display: {xs: 'none', sm: 'block'}}}
              >
                {App_title}
              </Typography>
            </>
          ) : (
            ' '
          )}
          <Box sx={{flexGrow: 1}} />
          <Box sx={{minWidth: 120}}>
            <Autocomplete
              disablePortal
              fullWidth
              id='combo-box-demo'
              // options={allData.filter((val,id,array) => array.indexOf(val) == id)}
              // options={Array.from(
              //   new Set(allData?.map((a) => a.location_name))
              // ).map((name) => {
              //   return allData?.find((a) => a.location_name === name);
              // })}
              // defaultValue={{location_name:"All Location"}}
              options={_.unionBy(
                [
                  ...allData,
                  {location_name: 'All-Location', location_id: 'null'},
                ],
                'location_name',
              )}
              getOptionLabel={(option) => option.location_name}
              onChange={(e, newvalue) =>
                setHeaderLocationId(
                  newvalue !== null ? newvalue.location_id : 'null',
                )
              }
              value={
                [
                  ...allData,
                  {location_name: 'All-Location', location_id: 'null'},
                ].filter((f) => f.location_id === headerLocationId)[0] || {}
              }
              // getOptionSelected={(option, value) => {
              //       return option?.category.toLowerCase() === value?.category.toLowerCase()
              //   }
              // }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant='filled'
                  label='Location'
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    width: 250,
                  }}
                />
              )}
            />
            {/* <FormControl fullWidth style={{color:'white'}} >
            <InputLabel id="header-select-label-273" style={{color:'white'}}>
              Location
            </InputLabel>
            <Select 
              name="Location"
              labelId="demo-simple-select-label"
              label = "Location"
              id="header-select-280"
              required={true}
             // value={formValues.destination_location_id}
             // onChange={handleChange}
             // onBlur={handleChange}
            >
              {
                user_base_locations.map(d => <MenuItem value={d.location_id} key={d.location_id}>{d.location_name}</MenuItem>)
              }
            </Select>
          </FormControl> */}
          </Box>
          <Box sx={{display: {xs: 'none', md: 'flex'}}}>
            <IconButton
              size='large'
              aria-label='show 4 new mails'
              color='inherit'
            >
              <Badge badgeContent={4} color='error'>
                <MailIcon />
              </Badge>
            </IconButton>
            <IconButton
              size='large'
              aria-label='show 17 new notifications'
              color='inherit'
            >
              <Badge badgeContent={17} color='error'>
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton
              size='large'
              edge='end'
              aria-label='account of current user'
              aria-controls={menuId}
              aria-haspopup='true'
              onClick={handleProfileMenuOpen}
              color='inherit'
            >
              <AccountCircle />
            </IconButton>
          </Box>
          <Box sx={{display: {xs: 'flex', md: 'none'}}}>
            <IconButton
              size='large'
              aria-label='show more'
              aria-controls={mobileMenuId}
              aria-haspopup='true'
              onClick={handleMobileMenuOpen}
              color='inherit'
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
    </Box>
  );
}
