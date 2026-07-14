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
import {useLocation, Link} from 'react-router-dom';
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
import { clientwebsocket, initWebSocket } from 'http-common';
import usePageVisibility from '../../utils/usePageVisibility';
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
  let history = useLocation();

  const {
    pathname,
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
  let storage = getsessionStorage()
  const [locationId, setLocationId] = useState('');
  const [commoncookie, setCommoncookie] = useState(
    storage?.employee_id,
  );
  const [activePosLocationId, setActivePosLocationId] = useState(null);
  const [usertype, setusertype] = useState(storage?.role_name);
  const [activePosSessionId, setActivePosSessionId] = useState(null);
  const [editProduct, setEditProduct] = useState({})
  const [editCustomer, setEditCustomer] = useState({})


  const visibilityStatus = usePageVisibility()



  let except_path_name = [
    '/',
    '/pointofsale',
    '/pointofsale/payment',
    '/pointofsale/payment/posInvoice',
  ];
  const {pos_session} = useSelector((state) => state.posSessionReducer);
  // const { posSessionReducer: { pos_session } } = useSelector(state => state)

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

      if(!clientwebsocket?.socket){
        initWebSocket(storage.employee_id, storage.accessToken)
      }
      dispatch(listUserlocationsAction(modules))
    }
    //  let module = JSON.parse( localStorage.getItem('moduless'))?.employee_id
    
  };
  tempinitsform.current = initsform;

  useEffect(() => {
    tempinitsform.current();
  }, []);
  useEffect(() => {
    setAllData(all_user_location);
    // setHeaderLocationId(all_user_location);
    setCommoncookie(storage?.employee_id);
    setusertype(storage?.role_name);
  }, [all_user_location]);




  useEffect(() => {
    let timerId;

    function sendOnlineStatus() {
      timerId = setTimeout(() => {
      if (clientwebsocket.socket.readyState === WebSocket.OPEN) {
        clientwebsocket.socket.send(
          JSON.stringify({
            event: 'online_status_send',
            content: {status: 'online', user_id: storage?.employee_id},
          }),
        );
      }

      sendOnlineStatus();
      }, 10000);
    }

    if (visibilityStatus && clientwebsocket?.socket?.readyState === 1 && timerId === undefined && storage.employee_id) {
      sendOnlineStatus();
    } else {
      clearTimeout(timerId);
    }

    return () => {
      clearTimeout(timerId)
    };
  }, [clientwebsocket?.socket?.readyState, storage.employee_id, visibilityStatus]);


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
    // if(cookies.get('login')?.modules){
    //    modules = JSON.parse(cookies.get('login')?.modules)
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
  const setEditProductDataHandler = (edit) => {
    setEditProduct(edit)
  }
  const setEditCustomerHandler = (edit) => {
    setEditCustomer(edit)
  }
  
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
          setEditProductDataHandler : setEditProductDataHandler,
          setEditCustomerHandler: setEditCustomerHandler
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
          <AlertDialog
                type={modalType}
                setselectData={setselectData}
                modalStatus={modalStatus}
                setModalStatusHandler={setModalStatusHandler}
                loaderStatus={loaderStatus}
                setLoaderStatusHandler={setLoaderStatusHandler}
                sx={{zIndex: 9999}}
                editProduct = {editProduct}
                editCustomer = {editCustomer}
                setEditProductDataHandler = {setEditProductDataHandler}
                setEditCustomerHandler = {setEditCustomerHandler}
              />
          {props.children}
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
