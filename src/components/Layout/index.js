import React, {useState, useEffect, useRef, useCallback} from 'react';
import {styled, useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Header from './Header';
import MenuList from '../../utils/menu_list';
import {useNavigate, Link} from 'react-router-dom';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Cookies from 'universal-cookie';
import _ from 'lodash';
import {Collapse, Grid} from '@mui/material';
import {useSelector} from 'react-redux';
import {App_title} from '../../utils/content';
import CreateNewButtonContext from '../../context/CreateNewButtonContext';
import AlertDialog from '../../modal';
import {drawer_menu} from '../../redux/actions/drawerMenu_actions';
import {useDispatch, connect} from 'react-redux';
import {PosGetByIdAction} from '../../redux/actions/pos_session';
import {listUserlocationsAction} from '../../redux/actions/userCreation_actions';
import PosContext from '../../context/PosContext';
import { getsessionStorage } from 'pages/common/login/cookies';
import SearchIcon from '@mui/icons-material/Search';
import MenuSearch from './MenuSearch';
const drawerWidth = 255;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({theme}) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

// const AppBar = styled(MuiAppBar, {
//   shouldForwardProp: (prop) => prop !== 'open',
// })(({ theme, open }) => ({
//   zIndex: theme.zIndex.drawer + 1,
//   transition: theme.transitions.create(['width', 'margin'], {
//     easing: theme.transitions.easing.sharp,
//     duration: theme.transitions.duration.leavingScreen,
//   }),
//   ...(open && {
//     marginLeft: drawerWidth,
//     width: `calc(100% - ${drawerWidth}px)`,
//     transition: theme.transitions.create(['width', 'margin'], {
//       easing: theme.transitions.easing.sharp,
//       duration: theme.transitions.duration.enteringScreen,
//     }),
//   }),
// }));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({theme, open}) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}));

function Layout(props) {
  const dispatch = useDispatch();
  const {menu_status, all_user_location} = props;
  let history = useNavigate();
  const {
    location: {pathname},
  } = history;
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  // const [anchorEl, setAnchorEl] = React.useState(null);
  // const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  // const [nest, setNested] = useState(false)
  // const [nestTrans, setNestTrans] = useState(false)
  const [modalStatus, setModalStatus] = useState(false);
  const [loaderStatus, setLoaderStatus] = useState(false);
  const [modalType, setModalType] = useState('');
  const [isDrawerTouch, setIsDrawerTouch] = React.useState(false);
  const [creatNewData, setCreatNewData] = useState([]);
  // const [headOpen, setHeadOpen] = useState({});
  const [selectData, setData] = useState({
    vendor: false,
    product: false,
    taxcategory: false,
    taxcodes: false,
    taxjurisdiction: false,
    stocklocation: false,
    cash_box_list: false,
    paymentMethod: false,
    barCodeError: false,
    preOrderConvertData: false,
    outOfStock: false,
  });
  const [soDialogOpenStatus, setSoDialogOpenHandler] = useState(false);
  const [filterlocation, setFilterLocation] = useState([]);
  const [allData, setAllData] = useState([]);
  const [headerLocationId, setLocationsId] = useState('null');
  const tempinitsform = useRef(null);
  // const cookies = new Cookies();
  const storage = getsessionStorage()
  const [locationId, setLocationId] = useState('');
  const [commoncookie, setCommoncookie] = useState(
    storage?.employee_id,
  );
  const [activePosLocationId, setActivePosLocationId] = useState(null);
  const [usertype, setusertype] = useState(storage?.role_name);
  const [activePosSessionId, setActivePosSessionId] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);

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

  let except_path_name = [
    '/',
    '/pointofsale',
    '/pointofsale/payment',
    '/pointofsale/payment/posInvoice',
  ];
  const {pos_session} = useSelector((state) => state.posSessionReducer);
  const { NavigationReducer: { menus: navigationMenus } = {} } = useSelector(state => state);

  // const isMenuOpen = Boolean(anchorEl);
  // const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  // const handleProfileMenuOpen = (event) => {
  //   setAnchorEl(event.currentTarget);
  // };

  // const handleMobileMenuClose = () => {
  //   setMobileMoreAnchorEl(null);
  // };

  // const handleMenuClose = () => {
  //   setAnchorEl(null);
  //   handleMobileMenuClose();
  // };

  // const handleMobileMenuOpen = (event) => {
  //   setMobileMoreAnchorEl(event.currentTarget);
  // };

  // const logout=()=>{
  //   const cookies = new Cookies();
  //   cookies.remove('login')
  //   history('/');

  // }
  const initsform = () => {
    let modules = '';
    if (storage) {
      modules = storage?.employee_id || '';
    }
    //  let module = JSON.parse( localStorage.getItem('moduless'))?.employee_id
    // dispatch(listUserlocationsAction(modules))
  };
  tempinitsform.current = initsform;

  useEffect(() => {
    tempinitsform.current();
  }, []);
  useEffect(() => {
    setAllData(all_user_location?.filter((d)=> d.location_type !== 'Scrap'));
    // setHeaderLocationId(all_user_location);
    setCommoncookie(storage?.employee_id);
    setusertype(storage?.role_name);
  }, [all_user_location]);

  useEffect(() => {
  }, []);

  const setModalStatusHandler = (status) => {
    setModalStatus(status);
  };

  const setLoaderStatusHandler = (status) => {
    setLoaderStatus(status);
  };

  const setModalTypeHandler = (type) => {
    setModalType(type);
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const setcreatNewDataHandler = (res) => {
    setCreatNewData(res);
  };

  const setselectData = (data, type) => {
    setData({...selectData, [data]: type});
  };
  // const nestedList = (item_label) => {
  //   setNested(p => ({ ...p, [item_label]: !p[item_label] }));
  // };

  const nestedList = (item_label, headerId) => {
    // setNested(p => ({ ...p, [item_label]: !p[item_label] }));
    dispatch(
      drawer_menu({...menu_status, [item_label]: !menu_status[item_label]}),
    );
  };
  const ListFilterData = (data) => {};
  const setHeaderLocationIdHandeler = (id) => {
    setLocationsId(id);
  };

  // const nesttransList = () => {
  //   setNestTrans(!nestTrans);
  // };

  const modulesname = () => {
    let modules = [];
    // if(storage?.modules){
    //    modules = JSON.parse(storage?.modules)
    // }

    if (storage) {
      modules = storage?.modules || [];
    }

    return modules;
  };

  const setActivePosLocationIdHandler = useCallback(
    (data) => {
      setActivePosLocationId(data);
    },
    [activePosLocationId],
  );
  const setActivePosSessionIdHandler = useCallback(
    (data) => {
      setActivePosSessionId(data);
    },
    [activePosSessionId],
  );
  return (
    <Box sx={{display: 'flex'}}>
      <CreateNewButtonContext.Provider
        value={{
          modalStatus: modalStatus,
          selectData,
          setModalStatusHandler: setModalStatusHandler,
          setModalTypeHandler: setModalTypeHandler,
          setselectData,
          setcreatNewDataHandler: setcreatNewDataHandler,
          setLoaderStatusHandler: setLoaderStatusHandler,
          loaderStatus: loaderStatus,
          allData: allData,
          commoncookie: commoncookie,
          usertype: usertype,
          headerLocationId,
          setHeaderLocationIdHandeler,
          creatNewData,
          drawerOpen: open,
          soDialogOpenStatus,
          setSoDialogOpenHandler,
          locationId,
        }}
      >
        <PosContext.Provider
          value={{
            activePosLocationId,
            setActivePosLocationIdHandler,
            activePosSessionId,
            setActivePosSessionIdHandler,
          }}
        >
          <CssBaseline />
          {_.includes(except_path_name, history.location.pathname) ===
            false && (
            <>
              <Header
                open={open}
                handleDrawerOpen={handleDrawerOpen}
                handleDrawerClose={handleDrawerClose}
                allData={allData}
                headerLocationId={headerLocationId}
                setHeaderLocationId={setHeaderLocationIdHandeler}
              />
              <Drawer variant='permanent' open={open} sx={{zIndex: 99, '& .MuiDrawer-paper': { display: 'flex', flexDirection: 'column' }}}>
                <DrawerHeader sx={{backgroundColor: 'primary.main'}}>
                  {theme.direction === 'rtl' ? (
                    <>
                      <IconButton onClick={handleDrawerClose}>
                        <ChevronRightIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <Grid container direction='row'>
                        <Grid
                          size={{
                            lg: 10,
                            sm: 10,
                            md: 10,
                            xs: 10
                          }}>
                          <Typography
                            style={{
                              color: 'white',
                              marginLeft: '5px',
                            }}
                            variant='h6'
                            noWrap
                          >
                            {App_title}
                          </Typography>
                        </Grid>
                        <Grid
                          size={{
                            lg: 2,
                            sm: 2,
                            md: 2,
                            xs: 2
                          }}>
                          <IconButton onClick={handleDrawerClose}>
                            <ChevronLeftIcon style={{color: 'white'}} />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </>
                  )}
                </DrawerHeader>
                <Divider />
                <List
                  style={{
                    overflowY: isDrawerTouch ? 'auto' : 'hidden',
                    overflowX: 'hidden',
                    scrollbarWidth: 'thin',
                  }}
                  onMouseEnter={() => setIsDrawerTouch(true)}
                  onMouseLeave={() => setIsDrawerTouch(false)}
                >
                  {MenuList.filter(
                    (r) =>
                      modulesname().some(
                        (m) => r.item_label === m.module_name,
                      ) || r.item_label === 'Dashboard',
                  ).map((menu, i) => {
                    if (menu.nested) {
                      return (
                        <>
                          <ListItem
                            key={i}
                            button
                            onClick={() => nestedList(menu.item_label, menu.id)}
                          >
                            <ListItemIcon>{menu.icon}</ListItemIcon>
                            <ListItemText
                              style={{color: 'black'}}
                              primary={menu.item_label}
                            />
                            <ListItemText />
                            {menu_status[menu.item_label] ? (
                              <ExpandLess />
                            ) : (
                              <ExpandMore />
                            )}
                          </ListItem>

                          <Collapse
                            in={menu_status[menu.item_label]}
                            timeout='auto'
                            unmountOnExit
                          >
                            <List component='div' disablePadding>
                              {menu.nested.map((d) =>
                                !d.nested ? (
                                  <ListItem
                                    sx={{marginLeft: '15px'}}
                                    button
                                    selected={pathname === d.route_path}
                                    component={Link}
                                    to={d.route_path}
                                  >
                                    <ListItemIcon>
                                      {d.icon}
                                      <ListItemText
                                        style={{
                                          color: 'black',
                                          marginLeft: '20px',
                                        }}
                                        primary={d.item_label}
                                      />
                                    </ListItemIcon>
                                  </ListItem>
                                ) : (
                                  <>
                                    <ListItem
                                      button
                                      onClick={() =>
                                        nestedList(d.item_label, d.id)
                                      }
                                    >
                                      <ListItemIcon
                                        style={{marginLeft: '15px'}}
                                      >
                                        {d.icon}
                                      </ListItemIcon>
                                      {d.item_label.length > 10 ? (
                                        <Tooltip title={d.item_label}>
                                          <ListItemText
                                            style={{
                                              color: 'black',
                                              marginLeft: '-12px',
                                              textOverflow: 'ellipsis',
                                              width: '155px',
                                              overflow: 'hidden',
                                            }}
                                            primary={d.item_label}
                                          />
                                        </Tooltip>
                                      ) : (
                                        <ListItemText
                                          style={{wordWrap: 'break-word'}}
                                          primary={d.item_label}
                                        />
                                      )}

                                      {menu_status[d.item_label] ? (
                                        <ExpandLess />
                                      ) : (
                                        <ExpandMore />
                                      )}
                                    </ListItem>

                                    <Collapse
                                      in={menu_status[d.item_label]}
                                      timeout='auto'
                                      unmountOnExit
                                    >
                                      <List component='div' disablePadding>
                                        {d.nested.map((n) => (
                                          <>
                                            {
                                              <ListItem
                                                sx={{marginLeft: '20px'}}
                                                button
                                                component={Link}
                                                to={n.route_path}
                                              >
                                                <ListItemIcon
                                                  style={{marginLeft: '10px'}}
                                                >
                                                  {n.icon}
                                                  <ListItemText
                                                    style={{
                                                      color: 'black',
                                                      marginLeft: '15px',
                                                    }}
                                                    primary={n.item_label}
                                                  />
                                                </ListItemIcon>
                                              </ListItem>
                                            }
                                            {/* {n.id ==='payment_transaction' &&
                        <>
                         <ListItem button onClick={() => nestedList(n.item_label, n.id)} >
                      <ListItemIcon style={{marginLeft:'30px'}}>
                        {n.icon}
                      </ListItemIcon>
                      { n.item_label.length>10 ?
                        <Tooltip title={n.item_label}><ListItemText style={{color:'black', marginLeft: '-18px',textOverflow:'ellipsis',width : '150px',overflow: 'hidden'}} primary={n.item_label.slice(0,isDrawerTouch?12:14).concat('...')} /></Tooltip>
                        :
                        <ListItemText style={{ wordWrap: 'break-word' }} primary={n.item_label}/>
                      }
                      
                      {menu_status[n.item_label] ? <ExpandLess /> : <ExpandMore />}
                      
                    </ListItem>
                    <Collapse in={menu_status[n.item_label]} timeout="auto" unmountOnExit>
                      <List component="div"disablePadding>
                        {n.nested.map(n =>
                      <ListItem sx={{marginLeft:'20px'}} button  component={Link} to={n.route_path}>
                      <ListItemIcon style={{marginLeft: '30px'}} >
                            {n.icon}                           
                            <ListItemText style={{color:'black',marginLeft:'10px'}} primary={n.item_label} />
                          </ListItemIcon>
                          
                        </ListItem>
                        )}
                      </List>
                    </Collapse>
                      </>
                      } */}
                                          </>
                                        ))}
                                      </List>
                                    </Collapse>
                                  </>
                                ),
                              )}
                            </List>
                          </Collapse>
                        </>
                      );
                    } else {
                      return (
                        <ListItem
                          button
                          key={menu.item_label}
                          selected={pathname === menu.route_path}
                          component={Link}
                          to={menu.route_path}
                        >
                          <ListItemIcon>{menu.icon}</ListItemIcon>
                          <ListItemText
                            style={{color: 'black'}}
                            primary={menu.item_label}
                          />
                        </ListItem>
                      );
                    }
                  })}
                </List>
                <Box sx={{ mt: 'auto' }}>
                  <Divider />
                  {open ? (
                    <Box
                      onClick={() => setSearchOpen(true)}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1,
                        mx: 1.5, my: 1, px: 1.5, py: 0.7,
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
                        borderRadius: '4px', px: 0.7, py: 0.1,
                        lineHeight: 1.4,
                      }}>
                        Ctrl K
                      </Typography>
                    </Box>
                  ) : (
                    <Tooltip title="Search menus (Ctrl+K)" placement="right">
                      <IconButton onClick={() => setSearchOpen(true)} sx={{ display: 'flex', mx: 'auto', my: 1 }}>
                        <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Drawer>
              <Box
                component='main'
                sx={{
                  flexGrow: 1,
                  height: '100vh',
                  width: '100%',
                  padding: '35px',
                  overflow: 'hidden',
                }}
              >
                <DrawerHeader />
                <AlertDialog
                  type={modalType}
                  selectData={selectData}
                  setselectData={setselectData}
                  modalStatus={modalStatus}
                  setModalStatusHandler={setModalStatusHandler}
                  loaderStatus={loaderStatus}
                  setLoaderStatusHandler={setLoaderStatusHandler}
                  sx={{zIndex: 9999}}
                />
                {props.children}
              </Box>
              <MenuSearch
                open={searchOpen}
                onClose={() => setSearchOpen(false)}
                navigationMenus={navigationMenus}
              />
            </>
          )}

          {_.includes(except_path_name, history.location.pathname) && (
            <Box style={{width: '100%'}}>
              <AlertDialog
                type={modalType}
                setselectData={setselectData}
                modalStatus={modalStatus}
                setModalStatusHandler={setModalStatusHandler}
                loaderStatus={loaderStatus}
                setLoaderStatusHandler={setLoaderStatusHandler}
                sx={{zIndex: 9999}}
              />
              {props.children}
            </Box>
          )}
        </PosContext.Provider>
      </CreateNewButtonContext.Provider>
    </Box>
  );
}
const mapStateToProps = (state) => {
  return {
    menu_status: state.DrawerMenuReducer.drawer_menu_status,
    all_user_location: state.UserCreationReducer.all_user_location,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    drawer_menu: (data) => {
      dispatch(drawer_menu(data));
    },
    // PosGetByIdAction:(s_id)=>{
    //   dispatch(PosGetByIdAction(s_id))
    // }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
