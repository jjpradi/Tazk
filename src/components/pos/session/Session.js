import React, {useEffect, useState, useContext, useRef} from 'react';
import {
  CardContent,
  Grid,
  Button,
  Card,
  Typography,
  Box,
  Popper,
  Fade,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {
  listPosSessionAction,
  UpdataPosSessionAction,
  PosLastSyncUpdate,
  PosGetByIdAction,
  setFrequentlyFilteredAction,
} from '../../../redux/actions/pos_session';
import DB from '../../../db';
import {listUserCreationAction} from '../../../redux/actions/userCreation_actions';
import {createSalesPaymentAction} from '../../../redux/actions/sales_actions';
import {listCashBoxAction} from '../../../redux/actions/cash_box_actions';
import {createPosCreationAction, deletePosCreationAction, listPosCreationAction, updatePosCreationAction} from '../../../redux/actions/pos_creations_actions';
import {listCustomerAction} from '../../../redux/actions/customer_actions';
import {ClearState} from '../../../redux/actions/pos_product_list';
import Summary from './SummaryDialog';
import context from '../../../context/CreateNewButtonContext';
import ResumePopup from './ResumePopup';
import Badge from '@mui/material/Badge';
import SyncIcon from '@mui/icons-material/Sync';
import {listChartOfAccountsdataAction} from '../../../redux/actions/chartOfAccounts';
import {getDateTimeFormat} from '../../../utils/getTimeFormat';
import {sendNtfy} from '../../../firebase/firebase.service';
import {
  getLoginRoleAction,
  getLoginTokenAction,
} from '../../../redux/actions/userRole_actions';
import Cookies from 'universal-cookie';
import notificationType from '../../../firebase/notify_type';
import NoRecordFound from '../../../components/Layout/NoRecordFound';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ViewReport from './viewReport';
import PosContext from '../../../context/PosContext';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {CreateNotificationAction,listNotificationAction} from '../../../redux/actions/notification_actions'
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { getsessionStorage } from 'pages/common/login/cookies';
import { font14_500 } from 'utils/pageSize';
import CommonToolTip from 'components/ToolTip';
import { titleURL } from 'http-common';
import { roleType } from 'utils/roleType';
import AddCardIcon from '@mui/icons-material/AddCard';
import NewPosCreation from 'components/NewPosCreation';
import { handleGetSearchCreditdebit } from 'redux/sagas/handlers/searchHandlers';
import AlertDialog from 'pages/common/Dialog';
import { restrictNewCreationBasedOnPlanAction } from 'redux/actions/subscription_action';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import { listPaymentMethodAction } from 'redux/actions/payment_method_actions';
import { pageSize } from 'utils/pageSize'
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

function Content(props) {
  var db = new DB('pos_session');
  const dispatch = useDispatch();
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    allData,
    headerLocationId,
    commoncookie,
    setModalStatusHandler
  } = useContext(context);
  const {setActivePosLocationIdHandler, setActivePosSessionIdHandler} =
    useContext(PosContext);
  const history = useNavigate();
  const tempdis = useRef(null);
  const tempdisp = useRef(null);
  const tempinitsform = useRef(null);
  const tempinitsformVal = useRef(null);
  const {
    posSessionReducer: {pos_session},
    posCreationReducer: {pos_creation},
    UserCreationReducer: {all_user_location},
    stockPosReducer: {stock_pos_list},
    SubscriptionReducer: {restrictUserLocationCreation},
    productReducer: {frequentlyFiltered},rbacReducer: { menuAccess }
  } = useSelector((state) => state);
  // const [values, setValues] = useState({ status: 'progress' })
  const [open, setOpen] = useState({open: false, posId: null, s_id: null});
  const [poscreationopen, setPoscreationopen] = useState(false);
  const [poscreationdelete, setPoscreationdelete] = useState(false);
  const [posdelId, setposdelId] = useState()
  const [edit_id_data, setEdit_id_data] = useState([])
  const [offlineData, setofflineData] = useState({});
  const [remarks, setRemarks] = useState(false);
  const [hide, setHide] = useState(false);
  const [syncTime, setsyncTime] = useState('');
  const [openClick, setOpenClick] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [moreClick, setMoreClick] = React.useState(false);
  const [moreAnchorEl, setMoreAnchorEl] = React.useState(null);
  const [currentTargetKey, setCurrentTaregetKey] = useState(0);
  const [viewReport, setViewReport] = useState(false);
  const [isApiFinished, setIsApiFinished] = useState(false);
  const [index, setIndex] = useState();
  const [page, setPage] = useState(0)
  // const cookies = new Cookies();
  let storage = getsessionStorage()

  const emp = storage?.employee_id || 0;
  let role_name = storage?.role_name || '';
  let company_type = storage?.company_type || ''

  
  const selectedRole = storage.role_name
    useEffect(() => {
      if (!selectedRole) return;
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler, dispatch(getMenuAccessAction(selectedRole)));
    }, [selectedRole, dispatch]);

  const posCreate = UserRightsAuthorization(menuAccess[selectedRole], 'point_of_sale__sales_counter', 'can_create')
  const posEdit = UserRightsAuthorization(menuAccess[selectedRole], 'point_of_sale__sales_counter', 'can_edit') 
  const posDelete =  UserRightsAuthorization(menuAccess[selectedRole], 'point_of_sale__sales_counter', 'can_delete') 

  const handleClick = (date, openPopup, posId, s_id, syncTime) => {
    if (
      date?.slice(0, 10) ===
        new Date().toISOString().slice(0, 10).split('-').reverse().join('-') ||
      date === null
    ) {
      const posPreOrder = pos_session.filter((f) => f.posId === posId);
      setActivePosLocationIdHandler(posPreOrder[0]?.location_id || null);
      history('/pointofsale', {state:{
        posId,
        s_id,
        preOrder: posPreOrder[0].preorder,
        cashBox: posPreOrder[0].cashBox,
        location_id: posPreOrder[0].stockLocation
      }});
      lastSyncUpdate(posId, s_id);
      setsyncTime(syncTime);
    } else {
      openPopup();
    }
  };

  const newSessionApprove = (posId, s_id) => {
    const newData = {
      employeeId: emp,
      status: 'progress',
      openingDate: getDateTimeFormat(new Date()),
      posId,
      lastSync: new Date().toTimeString().slice(0, 8),
    };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        UpdataPosSessionAction(
          s_id,
          newData,
          commoncookie,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      )
    );
    const posPreOrder = pos_session.filter((f) => f.posId === posId);
    history('/pointofsale', {state:{
      posId,
      s_id,
      preOrder: posPreOrder[0].preorder,
      location_id: posPreOrder[0].stockLocation
    }});
    // const cookies = new Cookies();
    let storage = getsessionStorage()
    let emp_id = storage?.employee_id || '';
    dispatch(
      getLoginRoleAction(emp_id, (role_name, token, content) => {
        if (roleType.includes(role_name)) {
          let notify_type = notificationType('session started');
          let notify_content = content?.filter(
            (m) => m.notification_type === notify_type,
          );
          if (notify_content.length) {
            let userData =
              all_user_location.find((d) => d.employee_id === emp) || {};
            let content_body = ` ${userData.username} \n${userData.location_name}`;
            sendNtfy(token, notify_content[0]?.title, content_body);
            dispatch(CreateNotificationAction({content_body:content_body,title:notify_content[0]?.title,time:getDateTimeFormat(new Date()),"active":"1"}))
            let data = {
              pageCount: page,
              numPerPage: pageSize,
              searchString: '',
              employeeId : storage.employee_id
            }
            dispatch(listNotificationAction(data))
          }
        }
      }),
    );
  };
  const checkSessionStatus = (posId, s_id, res) => {
    // if(res){
    //     // setOpenClick(false)
    //     const newData = {employeeId:emp,status: 'progress', openingDate:new Date() ,posId, lastSync: new Date().toTimeString().slice(0,8) }
    //     dispatch(UpdataPosSessionAction(s_id, newData, setModalTypeHandler, setLoaderStatusHandler))
    //     history('/pointofsale', {posId, s_id});
    // }
    // else{
    //     setOpenClick(true)
    // }
    res ? newSessionApprove(posId, s_id) : setOpenClick(true);
  };

  const newSessionClick = (e, posId, s_id, location_id) => {
    setActivePosLocationIdHandler(location_id);
    setAnchorEl(e.currentTarget);
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(PosGetByIdAction(posId, s_id, checkSessionStatus))
    );
  };

  const dbSync = (e) => {
    const {posId, s_id} = open;
    const res = offlineData[`offline_${posId}`]?.data;
    if (res) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          createSalesPaymentAction(
            res,
            setModalTypeHandler,
            setLoaderStatusHandler,
            posId,
            [],
          ),
        )
      );
    }
    validate(posId, e, s_id);
  };

  const handleClose = (posId, Date, s_id, active) => {
    const res = offlineData[`offline_${posId}`]?.data;
    if (res && res.length) {
      setRemarks(false);
      setOpen({open: true, posId, Date, s_id, active});
    } else {
      setRemarks(active === 'A' ? true : false);
      setOpen({open: true, posId, Date, s_id, active});

      // validate(posId)
    }
  };

  const resStatus = (value) => {
    if (value === 200) {
      // const cookies = new Cookies();
      let storage = getsessionStorage()
      let emp_id = storage?.employee_id || '';
      dispatch(
        getLoginRoleAction(emp_id, (role_name, token, content) => {
          if (roleType.includes(role_name)) {
            let notify_type = notificationType('session closed');
            let notify_content = content?.filter(
              (m) => m.notification_type === notify_type,
            );
            if (notify_content.length) {
              // const locationData = pos_session.find(f => f.posId === open.posId) || {}
              // let userData = all_user_location.find(d => d.employee_id === locationData.employeeId) || {}
              // let locationName = locationData.location_name
              let userData =
                all_user_location.find((d) => d.employee_id === emp) || {};
              let content_body = `${userData.username} \n${userData.location_name}  `;
              sendNtfy(token, notify_content[0]?.title, content_body);
              dispatch(CreateNotificationAction({content_body:content_body,title:notify_content[0]?.title,time:getDateTimeFormat(new Date()),"active":"1"}))
            }
          }
        }),
      );
    }
  };

  const validate = (id = open.posId, reason, s_id) => {
    const cashBox = pos_creation.filter((f) => f.posId === id);
    const cashBoxId = cashBox.length > 0 ? cashBox[0].cashBox : null;
    // setValues({ status: 'closed' })
    const newData = {
      closingDate: getDateTimeFormat(new Date()),
      status: 'closed',
      reason,
      cash_box_id: cashBoxId,
      posId: id,
      lastSync: new Date().toTimeString().slice(0, 8),
    };

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        UpdataPosSessionAction(
          s_id,
          newData,
          commoncookie,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
          resStatus,
        ),
      )
    );
    dispatch(ClearState(id));
    clearLocalState(id);
  };

  const lastSyncUpdate = (id, s_id) => {
    const newData = {lastSync: new Date().toTimeString().slice(0, 8)};
    const res = offlineData[`offline_${id}`]?.data;
    if (res && window.navigator.onLine) {
      const newRes = res.filter((d) => !d.sync);
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          createSalesPaymentAction(
            newRes,
            setModalTypeHandler,
            setLoaderStatusHandler,
            id,
            newRes,
            (isVal) => {
              if (isVal) {
                apiCalls(
                  setModalTypeHandler,
                  setLoaderStatusHandler,
                  dispatch(
                    PosLastSyncUpdate(
                      s_id,
                      newData,
                      commoncookie,
                      headerLocationId,
                      setModalTypeHandler,
                      setLoaderStatusHandler,
                      //     (isVal, data)=>{
                      //     if(isVal){
                      //         const obj = {...offlineData}
                      //         const getSalesData = data.find(d=>d.posId === id) || {}
                      //         obj[`offline_${id}`].data = getSalesData.sales_data || []
                      //         setofflineData(obj)
                      //         db.deleteOfflineApi(id, getSalesData.sales_data || [])
                      //     }
                      // }
                    ),
                  )
                );
              }
            },
          ),
        )
        
      );
    }
  };

  const clearLocalState = (posId) => {
    const obj = {...offlineData};
    obj[`offline_${posId}`].data = [];
    obj[`offline_${posId}`].balance = 0;

    setofflineData(obj);
  };

  const dis = () => {
    console.log("first comes here");
    
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        listPosSessionAction(
          commoncookie,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      ),
      dispatch(listStockLocationAction(commoncookie, headerLocationId)),
      dispatch(listPaymentMethodAction()),
      dispatch(listCashBoxAction(headerLocationId,setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(
        listPosCreationAction(setModalTypeHandler, setLoaderStatusHandler),
      ),
      dispatch(restrictNewCreationBasedOnPlanAction()),
      // dispatch(listCustomerAction(true, setLoaderStatusHandler)),
      // dispatch(listChartOfAccountsdataAction())

    ).finally(() => setIsApiFinished(true));
  };
  tempdis.current = dis;
  // useEffect(() => {
  //     // if(!pos_session.length)
  //     tempdis.current();
  // }, [])

  useEffect(() => {
    tempdis.current();
  }, [headerLocationId]);

  // const disp = () => {
  //     dispatch(listPosSessionAction(1, setModalTypeHandler, setLoaderStatusHandler))
  //     dispatch(listCashBoxAction(setModalTypeHandler, setLoaderStatusHandler))
  //     dispatch( listPosCreationAction(setModalTypeHandler, setLoaderStatusHandler))
  //     dispatch(listCustomerAction(true, setLoaderStatusHandler));
  // }
  // tempdisp.current = disp
  // useEffect(() => {
  //     // if(!pos_session.length)
  //     tempdisp.current();
  // }, [pos_session])

  // useEffect(() => {
  //     const obj = {}

  //     const recurs = async (index) => {
  //         let posId = pos_session[index]?.posId
  //         let res = await db.getAllOfflineApi(posId) || [];
  //         const balance = res.reduce((acc, obj) => acc + +obj.amount, 0);
  //         obj[`offline_${posId}`] = { balance, data: res }

  //         if (index < pos_session.length - 1) {
  //             recurs(index + 1)
  //         } else {
  //             setofflineData(obj)
  //         }
  //     }

  //     if (pos_session.length) {
  //         recurs(0)
  //     }

  // }, [pos_session.length])

  const initsform = () => {
    const obj = {};

    if (window.navigator.onLine) {
      pos_session.forEach((d) => {
        const sales_data = d.sales_data || [];
        const balance = sales_data?.reduce((acc, obj) => acc + +obj.amount, 0);
        obj[`offline_${d.posId}`] = {balance, data: sales_data};
      });
      setofflineData(obj);

      // let ActiveSesionId = pos_session.filter(f => f.posId === posId && f.active === "A")
      // if(ActiveSesionId.length>0){
      //     setActivePosSessionIdHandler(ActiveSesionId[0]?.id)
      // }
    } else {
      const recurs = async (index) => {
        let posId = pos_session[index]?.posId;
        let res = (await db.getAllOfflineApi(posId)) || [];
        const balance = res.reduce((acc, obj) => acc + +obj.amount, 0);
        obj[`offline_${posId}`] = {balance, data: res};

        if (index < pos_session.length - 1) {
          recurs(index + 1);
        } else {
          setofflineData(obj);
        }
      };

      if (pos_session.length) {
        recurs(0);
      }
    }
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();

    let sessionData = {}
    pos_session.map((session) => {
      sessionData[session.posId] = frequentlyFiltered?.[session.posId] || []
    })
    dispatch(setFrequentlyFilteredAction(sessionData))
  }, [pos_session]);

  const checkOfflines = (posId) => {
    let valid = false;
    offlineData[`offline_${posId}`]?.data.forEach((d) => {
      if (!d.sync) {
        valid = true;
      }
    });
    return valid;
  };

  // useEffect(() => {
  //     const interval = setInterval(function () {
  //         // method to be executed;
  //         pos_session.forEach((d,ind)=>{
  //             lastSyncUpdate(d.posId, d.id)
  //         })
  //     }, 1800000);//1800000

  //     return () => {
  //         clearInterval(interval);
  //     }
  // }, [pos_session])

  const initsformVal = () => {
    const interval = setInterval(function () {
      // method to be executed;
      pos_session.forEach((d, ind) => {
        lastSyncUpdate(d.posId, d.id);
      });
    }, +syncTime || 1800000); //1800000

    return () => {
      clearInterval(interval);
    };
  };
  tempinitsformVal.current = initsformVal;
  useEffect(() => {
    tempinitsformVal.current();
  }, [syncTime]);



  const handleSummaryOpen = (key) => async (e) => {
    setMoreAnchorEl(e.currentTarget);
    setMoreClick((preState) => currentTargetKey !== key || !preState);
    setCurrentTaregetKey(key);
    setIndex(key);
  };

  // const handleClickOpen = (event) => {
  //     setAnchorEl(anchorEl ? null : event.currentTarget);
  // };

  //   const openClicked = Boolean(anchorEl);
  //   const id = openClicked ? 'transition-popper' : undefined;

  // const testStr = 'pb.adambakkam'

  const poshandleClose = () => {
    setPoscreationopen(false)
    setMoreClick(false);
    setEdit_id_data([])
    setPoscreationdelete(false)
  }
  const posaddclick = () => {
    setPoscreationopen(true);
    setEdit_id_data([])
  }

  const handleEdit = async(id) =>{
     const edit_value = pos_creation.filter((d)=> d.posId == id);
     setEdit_id_data(edit_value[0]);
  }
  const handledialog = (id) => {
    setPoscreationdelete(true);
    setMoreClick(false);
    setposdelId(id)
  };

  const handleDelete = async (id) => {
   console.log('deleteid', id)
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      dispatch(deletePosCreationAction(
        id,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ))
	  ).then(res => {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          listPosSessionAction(
            commoncookie,
            headerLocationId,
            setModalTypeHandler,
            setLoaderStatusHandler,
          ),
        ),
        dispatch(listCashBoxAction(headerLocationId, setModalTypeHandler, setLoaderStatusHandler)),
        dispatch(
          listPosCreationAction(setModalTypeHandler, setLoaderStatusHandler),
        ),
        // dispatch(listCustomerAction(true, setLoaderStatusHandler)),
        // dispatch(listChartOfAccountsdataAction())

      );
    });
    setMoreClick(false);
    setPoscreationdelete(false)
  };
  
 useEffect(() => {
  if (Object.keys(edit_id_data || {}).length > 0) {
    setPoscreationopen(true);
  }
}, [edit_id_data]);


  const handleSubmit = async (data) => {

    if (data.posId) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(updatePosCreationAction(
          data.posId,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ))
      ).then(res => {
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(
            listPosSessionAction(
              commoncookie,
              headerLocationId,
              setModalTypeHandler,
              setLoaderStatusHandler,
            ),
          ),
          dispatch(listCashBoxAction(headerLocationId, setModalTypeHandler, setLoaderStatusHandler)),
          dispatch(
            listPosCreationAction(setModalTypeHandler, setLoaderStatusHandler),
          ),
          // dispatch(listCustomerAction(true, setLoaderStatusHandler)),
          // dispatch(listChartOfAccountsdataAction())

        );
      });
      setPoscreationopen(false)
    } else {
      console.log('xreatae')
      const id = stock_pos_list[0]?.sequence_id;
      const current_seq = stock_pos_list[0]?.current_seq;

      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
       await dispatch(createPosCreationAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          id,
          { current_seq },
        ))
      ).then(res => {
        console.log('apires')
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(
            listPosSessionAction(
              commoncookie,
              headerLocationId,
              setModalTypeHandler,
              setLoaderStatusHandler,
            ),
          ),
          dispatch(listCashBoxAction(headerLocationId, setModalTypeHandler, setLoaderStatusHandler)),
          dispatch(
            listPosCreationAction(setModalTypeHandler, setLoaderStatusHandler),
          ),
          dispatch(restrictNewCreationBasedOnPlanAction()),
          // dispatch(listCustomerAction(true, setLoaderStatusHandler)),
          // dispatch(listChartOfAccountsdataAction())

        ).finally(() => setIsApiFinished(true));
      });

      await setPoscreationopen(false)
    }
  };
  const sample = async (value) => {

    setPoscreationopen(value);
  };

  return (
    <>
      {!poscreationopen && <>
       { company_type == 7 ? ( pos_session.length <2 && posCreate) &&
       <div style={{display: 'flex', width: '100%', paddingLeft : '90%'}}>
        <Button variant="outlined" endIcon={<AddCardIcon />}  onClick = {()=> posaddclick()}>
        NEW
       </Button>
       {/* < AddCardIcon onClick = {()=> posaddclick()} sx={{cursor: 'pointer'}}/> */}
       </div> 
       : posCreate &&  
       <div style={{display: 'flex', width: '100%', paddingLeft : '90%'}}>
       {/* < AddCardIcon onClick = {()=> posaddclick()} sx={{cursor: 'pointer'}}/> */}
       <Button variant="outlined" endIcon={<AddCardIcon />}  onClick = {()=> posaddclick()}>
        NEW
       </Button>
       </div>
        }
       {!pos_session.length && (<Grid>
         {isApiFinished ? <NoRecordFound /> : ""}
       </Grid>)}
      <Helmet>
                 <meta charSet="utf-8" />
                 <title> {titleURL} | SalesCounter</title>
       </Helmet>
       <Summary
         s_id={open.s_id}
         checkOfflines={checkOfflines}
         lastSyncUpdate={lastSyncUpdate}
         open={open.open}
         posId={open.posId}
         Data={offlineData}
         handleClose={() => {
           setOpen({...open, open: false});
           initsform();
         }}
         validate={(e) => {
           dbSync(e);
         }}
         remarks={remarks}
         date={open.Date}
         pos_session={pos_session}
         status={'close'}
         setMoreClick={setMoreClick}
         viewSummary={moreClick ? moreClick : viewReport}
         active={open.active}
         hide={hide}
       />
       <Grid>
       <CreateNewButtonContext.Consumer>
         {({loaderStatus}) => (
           <div>
             {viewReport && (
               <ViewReport
                 pos_session={pos_session}
                 index={index}
                 setViewReport={setViewReport}
                 handleClose={handleClose}
                 setofflineData={setofflineData}
                 offlineData={offlineData}
                 setMoreClick={setMoreClick}
               />
             )}

             <div style={{width: '100%', background: ''}}>
               <Grid container direction='row' >
                 {!pos_session.length && loaderStatus === true}
                 {viewReport === false &&
                   pos_session.map((d, i) => (
                     <Grid
                       key={i}
                       style={{padding: 10}}
                       size={{
                         lg: 6,
                         md: 6,
                         sm: 6,
                         xs: 12
                       }}>
                       <Card sx={{ height : '100%' }}>
                         <CardContent style={{padding: '10px 10px 0 10px'}}>
                           <div>
                             <div
                               style={{
                                 display: 'flex',
                                 flexDirection: 'row',
                                 justifyContent: 'space-between',
                                 alignItems: 'center',
                               }}
                             >
                               <div>
                                 <Typography
                                   className='p'
                                   variant='h9'
                                 >
                                   {d.location_name}
                                 </Typography>
                               </div>
                               <div>
                                 <Typography>
                                   {d.lastSync
                                     ? `Last Synced: ${d.lastSync}`
                                     : ''}
                                   &nbsp;
                                   <Badge
                                     variant={
                                       checkOfflines(d.posId)
                                         ? 'dot'
                                         : 'standard'
                                     }
                                     color='primary'
                                   >
                                     <SyncIcon
                                       onClick={() =>
                                         lastSyncUpdate(d.posId, d.id)
                                       }
                                       sx={{cursor: 'pointer'}}
                                       color='action'
                                     />
                                   </Badge>
                                 </Typography>
                               </div>
                               <div>
                                 <CommonToolTip title = 'More'>
                                 <Button onClick={handleSummaryOpen(i)}>
                                   <MoreVertIcon />
                                 </Button>
                                 </CommonToolTip>
                               </div>
                             </div>

                             {d.status === 'closed' ? (
                               <Typography
                                 variant='h9'
                                 style={{
                                   color: 'white',
                                   padding: '5px 10px',
                                   backgroundColor: '#f50057',
                                   borderRadius: 4,
                                   width: 'fit-content',
                                   marginTop: 5,
                                   
                                 }}
                               >
                                 Closed
                               </Typography>
                             ) : (
                               ''
                             )}
                             {d.status === 'progress' ? (
                               <Typography
                                 color={'sucess'}
                                 variant='h9'
                                 style={{
                                   color: 'white',
                                   backgroundColor: '#00C853',
                                   padding: '5px 10px',
                                   borderRadius: 4,
                                   width: 'fit-content',
                                   marginTop: 5,
                                 }}
                               >
                                 InProgress
                               </Typography>
                             ) : (
                               ''
                             )}
                             {d.status === 'new' ? (
                               <p
                               
                                 style={{
                                   color: 'white',
                                   padding: '5px 10px',
                                   backgroundColor: '#2962FF',
                                   borderRadius: 4,
                                   width: 'fit-content',
                                   margin: '5px 0 0 0',
                                   fontSize:font14_500.fontSize
                                 }}
                               >
                                 New
                               </p>
                             ) : (
                               ''
                             )}
                           </div>

                           {/* <MoreHorizIcon /> */}

                           <Popper
                             open={moreClick}
                             anchorEl={moreAnchorEl}
                             placement={'bottom'}
                             transition 
                           >
                             {({TransitionProps}) => (
                               <Fade {...TransitionProps} timeout={350}>
                                 <Paper>
                                   <List>
                                     <ListItem disablePadding>
                                       <ListItemButton
                                         onClick={() => {
                                           setHide(true);
                                           setTimeout(() => {
                                             handleClose(
                                               pos_session[currentTargetKey]
                                                 .posId,
                                               pos_session[currentTargetKey]
                                                 .closingDate,
                                               pos_session[currentTargetKey].id,
                                               pos_session[currentTargetKey]
                                                 .active,
                                             );
                                           }, 1000);
                                         }}
                                       >
                                         <ListItemText primary='View Summary' />
                                       </ListItemButton>
                                     </ListItem>
                                     <ListItemButton
                                       onClick={() => setViewReport(true)}
                                     >
                                       <ListItemText primary='View Report' />
                                     </ListItemButton>
                                     {
                                       posEdit && <ListItemButton
                                         onClick={() => handleEdit(pos_session[currentTargetKey]
                                           .posId)}
                                       >
                                         <ListItemText primary='Edit' />
                                       </ListItemButton>
                                     }


                                     {
                                       posDelete && <ListItemButton
                                         onClick={() => handledialog(pos_session[currentTargetKey]
                                           .posId)}
                                       >
                                         <ListItemText primary='Delete' />
                                       </ListItemButton>
                                     }
                                   </List>
                                 </Paper>
                               </Fade>
                             )}
                           </Popper>

                           <Typography
                             style={{margin: '20px 0px'}}>
                             {d.posName}
                           </Typography>

                           <Grid container>
                             <Grid
                               style={{margin: 'auto 0 10px 0'}}
                               size={{
                                 lg: 6,
                                 md: 6,
                                 sm: 6,
                                 xs: 12
                               }}>
                               {d.status === 'progress' ? (
                                 <div style={{display: 'flex'}}>
                                   {d.employeeId === emp ? (
                                     <>
                                       <ResumePopup
                                         date={d.closingDate}
                                         s_id={d.id}
                                         posId={d.posId}
                                         onclick={handleClick}
                                         syncTime={d.syncTime}
                                         location_id={d.stockLocation}
                                       />

                                       <Button
                                         onClick={() => {
                                           setHide(false);
                                           setTimeout(() => {
                                             handleClose(
                                               d.posId,
                                               d.closingDate,
                                               d.id,
                                               d.active,
                                             );
                                           }, 1000);
                                         }}
                                         size='small'
                                         variant='contained'
                                         color='secondary'
                                         text='button'
                                       >
                                         <Typography variant='h9'>Close</Typography>
                                       </Button>
                                     </>
                                   ) 
                                   :                                   
                                   d.username.length <= 8 ?
                                     (
                                       <span style={{marginBottom: '23px'}}> </span>
                                     )
                                   :
                                     (
                                       <span> </span>
                                     )
                                 }
                                 </div>
                               ) : (
                                 <>
                                   <Button
                                     style={{marginRight: 10}}
                                     onClick={(e) =>
                                       newSessionClick(
                                         e,
                                         d.posId,
                                         d.id,
                                         d.location_id,
                                       )
                                     }
                                     size='small'
                                     variant='contained'
                                     color='primary'
                                     text='button'
                                   >
                             <Typography variant='h9'>New Session</Typography>
                                   </Button>
                                   <Popper
                                     open={openClick}
                                     anchorEl={anchorEl}
                                     placement='bottom-start'
                                     transition
                                   >
                                     {({TransitionProps}) => (
                                       <Fade {...TransitionProps} timeout={350}>
                                         <Paper elevation={3}>
                                           {/* <div style={{ padding: '10px' }}>

                                                                 <Typography variant="subtitle1" color='red' component="div">
                                                                     The session already in use..! please reload your page..
                                                                 </Typography>

                                                             </div> */}
                                         </Paper>
                                       </Fade>
                                     )}
                                   </Popper>
                                 </>
                               )}
                             </Grid>
                             <Grid
                               style={{marginBottom: '5px'}}
                               size={{
                                 lg: 6,
                                 md: 6,
                                 sm: 6,
                                 xs: 12
                               }}>
                               <Grid container>
                                 <Grid size={5}>
                                 <Typography variant='h9'>Opening Date</Typography>
                                 </Grid>
                                 <Grid size={7}>
                                   <Typography variant='h9'>
                                     : {d.openingDate}
                                   </Typography>
                                 </Grid>
                               </Grid>
                               <Grid container>
                                 <Grid size={5}>
                                 <Typography variant='h9'>Balance</Typography>
                                 </Grid>
                                 <Grid size={7}>
                                   <Typography variant='h9'>
                                   :{' '}
                                   {d.current_balance !== null
                                     ? d.current_balance
                                     : 0}{' '}
                                   ₹
                                   </Typography>
                                 </Grid>
                               </Grid>
                               <Grid container>
                                 <Grid size={5}>
                                 <Typography variant='h9'>Sale Amount</Typography>
                                 </Grid>
                                 <Grid size={7}>
                                   <Typography variant='h9'>
                                   :{' '}
                                   {d.sessionSalesAmount !== null
                                     ? d.sessionSalesAmount
                                     : 0}{' '}
                                   ₹
                                   </Typography>
                                 </Grid>
                               </Grid>
                             </Grid>
                           </Grid>
                         </CardContent>
                    
                       </Card>
                     </Grid>
                   ))}
               </Grid>
             </div>
           </div>
         )}
       </CreateNewButtonContext.Consumer>
       </Grid>
       </>
       }
      {poscreationopen && (
                <NewPosCreation
                  edit_id_data={edit_id_data}
                  handleClose={poshandleClose}
                  handle_Submit={handleSubmit}
                  matches={[]}
                  setModalStatusHandler={setModalStatusHandler}
                  setModalTypeHandler={setModalTypeHandler}
                  sample = {sample}
                  setMoreAnchorEl = {setMoreAnchorEl}
                  setMoreClick = {setMoreClick}
                  setCurrentTaregetKey = {setCurrentTaregetKey}
                />
              )}
      <AlertDialog
                delete={poscreationdelete}
                handleClose={poshandleClose}
                handleDelete={handleDelete}
                id={posdelId}
      />
    </>
  );
}
export default Content;
