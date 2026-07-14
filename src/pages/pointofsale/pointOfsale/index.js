import React, {useRef, useEffect, useState, useContext, useMemo} from 'react';
import {Grid, Paper, useMediaQuery} from '@mui/material';
import ProductGrid from '../../../components/pos/product_section/ProductGrid/ProductGrid';
import CheckoutProducts from '../../../components/pos/checkout_products';
import KeyPad from '../../common/keyBoardStructure/index';
import DynamicTabs from '../../../components/pos/DynamicTabs';
import {useDispatch, useSelector} from 'react-redux';
import PaymentPage from '../../../components/pos/payment_section';
import DB from '../../../db';
import {
  StateReplace,
  ClearState,
  PreOrderOutOFStock,
  SelectIndex,
  enablePreOrder,
} from '../../../redux/actions/pos_product_list';
import {useLocation, Navigate} from 'react-router-dom';
import {
  PosLastSyncUpdate,
  ListPaymentModesAction,
  listPosSessionAction,
} from '../../../redux/actions/pos_session';
import {createSalesPaymentAction} from '../../../redux/actions/sales_actions';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import PosContext from '../../../context/PosContext';
import {listUserCreationAction} from '../../../redux/actions/userCreation_actions';
import {getByIdMailConfigurationAction, getByIdSmsConfigurationAction} from '../../../redux/actions/configuration_actions';
import apiCalls  from 'utils/apiCalls';
import { useTheme } from '@mui/material/styles';
import PreOrderList from './pre_orders_list';

export default function Index(props) {
  const dispatch = useDispatch();
  const theme = useTheme()
  const tempcheck = useRef(null);
  const tempinitsform = useRef(null);
  const tempinitsformVal = useRef(null);
  const tempinitsformValue = useRef(null);
  const convertDataRef = useRef(null);
  const outSideClickRef = useRef(null);
  const isTabSize = useMediaQuery(theme.breakpoints.between('sm', 'lg'))
  var db = new DB('pos_session');
  const {state} = useLocation();
  const {
    setLoaderStatusHandler,
    setModalTypeHandler,
    setModalStatusHandler,
    selectData,
    setselectData,
    commoncookie,
    headerLocationId,
  } = useContext(CreateNewButtonContext);
  const {setActivePosLocationIdHandler, setActivePosSessionIdHandler} =
    useContext(PosContext);
  const {
    tab_lists,
    tab_count,
    product_lists,
    pre_order_status,
    pre_order_list,
  } = useSelector((state) => state.productListReducer);
  const {pos_session} = useSelector((state) => state.posSessionReducer);
  const {createUser} = useSelector((state) => state.UserCreationReducer);
  const {mail_configuration, sms_configuration} = useSelector((state) => state.ConfigurationReducer);
  const {product} = useSelector((s) => s.productReducer);
  const {cashOutIn_denomination} = useSelector((state) => state.CashOutInReducer);
  const [offlineData, setofflineData] = useState({});
  //  const { paymentRedirect } = product_lists[tab_count] || {}
  const {pre_order: pre_order_tab} = product_lists[tab_count] || {};
  const [lastSync, setlastSync] = useState('');
  const [syncTime, setsyncTime] = useState('');
  const [convertData, setConvertData] = useState({});
  const [outSideClick, setOutSideClick] = useState(false);
  const [newTabStatus, setNewTabStatus] = useState(false);
  const [preOrderListOpen, setPreOrderListOpen] = useState(false)
  const [preOrderConvertData, setPreOrderConvertData] = useState(null)
  const paymentRedirect = useMemo(
    () =>
      pre_order_status === false
        ? product_lists[tab_count].paymentRedirect
        : pre_order_list['pre_order'].preOrderPaymentRedirect,
    [product_lists, tab_count, pre_order_list],
  );
  const {activePosLocationId} = useContext(PosContext);

  const check = () => {
    if (!state?.rerender) {
      let allCheckouts = db.getAllCheckouts(state?.posId);
      allCheckouts.then((res) => {
        if (res) {
          dispatch(StateReplace(res, state?.posId));
        } else {
          dispatch(ClearState(state?.posId));
        }
      });
    }

    // apiCalls(
    //   setModalTypeHandler,
    //   setLoaderStatusHandler,
      dispatch(
        listPosSessionAction(
          commoncookie,
          headerLocationId,
          // setModalTypeHandler,
          // setLoaderStatusHandler,
        )
      )
      !createUser.length && dispatch(listUserCreationAction(setModalTypeHandler, setLoaderStatusHandler))
    // );

  };
  tempcheck.current = check;

  useEffect(() => {
    tempcheck.current();
  }, []);

  const PreOrderListOpen = async(val) => {
    // setModalTypeHandler('PreOrderList');
    // setModalStatusHandler(true);
    setPreOrderListOpen(val)
    
  };

  const preOrderConvertDataFunc = async () => {

    if (preOrderConvertData !== null && typeof preOrderConvertData === 'object') {
      if (preOrderConvertData.order_items.length > 0) {
        let qtyRes = await preOrderConvertData.order_items.filter(
          (of) => 
            product.filter(
              (p) =>
                of.item_id === p.item_id && (p.stock_type === 1 ? of.quantity <= p.received_quantity : true)
            )
        );
        if (
          preOrderConvertData.order_items.length === qtyRes.length
        ) {
          setPreOrderListOpen(false)
          await setConvertData(preOrderConvertData);
        } else if (
          preOrderConvertData.order_status === 'Converted'
        ) {
          let outOfStock = await product.filter((of) =>
            preOrderConvertData.order_items.filter(
              (p) => of.item_id === p.item_id,
            ),
          );
          setPreOrderListOpen(false)
          await dispatch(
            PreOrderOutOFStock({
              orderItems: preOrderConvertData.order_items,
              productItems: outOfStock,
            }),
          );
          await setModalTypeHandler('outOfStock');
          await setModalStatusHandler(true);
          //  await setselectData('outOfStock',{orderItems:selectData.preOrderConvertData.order_items,productItems:outOfStock})
        } else if (preOrderConvertData.order_status === 'Canceled') {
          setPreOrderListOpen(false)
          await setConvertData(preOrderConvertData);
        }
      }

      // setselectData('preOrderConvertData', false);
    }
  };
  convertDataRef.current = preOrderConvertDataFunc;
  useEffect(() => {
    convertDataRef.current();
  }, [preOrderConvertData]);

  const setNewTabStatusForPreOrder = (status) => {
    setNewTabStatus(status);
  };

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
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
    return () => {
      setofflineData({});
    };
  }, [pos_session.length]);

  // useEffect(()=>{
  // const get = pos_session.find(d=> d.id === state?.s_id)
  // setlastSync(get?.lastSync)
  // },[pos_session])

  const initsformVal = () => {
    const get = pos_session.find((d) => d.posId === state?.posId) || {};
    setlastSync(get?.lastSync);
    setsyncTime(get?.syncTime);
    setActivePosLocationIdHandler(get?.location_id || 'null');
    setActivePosSessionIdHandler(get?.id || 0);
  };
  tempinitsformVal.current = initsformVal;
  useEffect(() => {
    tempinitsformVal.current();
    return () => {
      setlastSync({});
      setsyncTime({});
    };
  }, [pos_session]);

  const lastSyncUpdate = (id, s_id) => {
    const newData = {lastSync: new Date().toTimeString().slice(0, 8)};
    const res = offlineData[`offline_${id}`]?.data;
    if (res && window.navigator.onLine) {
      const newRes = res.filter((d) => !d.sync);
      // apiCalls(
      //   setModalTypeHandler,
      //   setLoaderStatusHandler,
        dispatch(
          createSalesPaymentAction(
            newRes,
            null,
            null,
            id,
            newRes,
            (isVal) => {
              if (isVal) {
                // apiCalls(
                  // setModalTypeHandler,
                  // setLoaderStatusHandler,
                  dispatch(
                    PosLastSyncUpdate(
                      s_id,
                      newData,
                      commoncookie,
                      headerLocationId,
                      // setModalTypeHandler,
                      // setLoaderStatusHandler,
                      //     (isVal, data) => {
                      //     if (isVal) {
                      //         const obj = { ...offlineData }
                      //         const getSalesData = data.find(d=>d.posId === id) || {}
                      //         obj[`offline_${id}`].data = getSalesData.sales_data || []
                      //         setofflineData(obj)
                      //         db.deleteOfflineApi(id, getSalesData.sales_data || [])
                      //     }
                      // }
                    ),
                  )
                // );
              }
            },
          ),
        )
      // );
    }
  };

  const handleSmsMailConfiguration = async () => {
    const roleIdData = createUser.filter(f => f.employee_id === commoncookie)
    if(roleIdData.length > 0){
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        // dispatch(getByIdMailConfigurationAction('POS', roleIdData[0]?.role_id)),
        // dispatch(getByIdSmsConfigurationAction('POS', roleIdData[0]?.role_id))
        
      );
    }
  }


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

  useEffect(() => {
    const interval = setInterval(function () {
      // method to be executed;
      pos_session.forEach((d, ind) => {
        lastSyncUpdate(d.posId, d.id);
      });
    }, +syncTime || 1800000);
    return () => {
      clearInterval(interval);
    };
  }, [syncTime]);
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (
        outSideClickRef.current &&
        !outSideClickRef.current.contains(event.target)
      ) {
        setOutSideClick(true);
        dispatch(SelectIndex(''));
      } else {
        setOutSideClick(false);
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [outSideClickRef]);

  if (!state) {
    return <Navigate to='/pointofsale/session' />;
  }

  return (
    <div>
      <Grid container style={{borderRadius: 0}}>
        <Grid
          style={{ borderRadius: 0}}
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Paper style={{height: 50, borderRadius: 0, borderBottom: '1px solid lightgrey'}}>
            <DynamicTabs
              lastSyncUpdate={lastSyncUpdate}
              pre_order_tab={pre_order_tab}
              paymentRedirect={paymentRedirect}
              pos_session={pos_session}
              setofflineData={setofflineData}
              offlineData={offlineData}
              posId={state?.posId}
              lastSync={lastSync}
              s_id={state?.s_id}
              dispatch={dispatch}
              tab_lists={tab_lists}
              tab_count={tab_count}
              pre_order_list={pre_order_list}
              pre_order_status={pre_order_status}
              PreOrderListOpen={PreOrderListOpen}
              PreOrderConvertData={convertData}
              setNewTabStatusForPreOrder={setNewTabStatusForPreOrder}
              preOrderButtonEnable={state?.preOrder}
              preOrderListOpen={preOrderListOpen}
              isTabSize={isTabSize}
            />
          </Paper>
        </Grid>

        <Grid
          style={{display: 'flex'}}
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          {paymentRedirect ? (
            <div style={{height: 'calc(100vh - 50px)', width: '100%'}}>
              <PaymentPage
                posId={state?.posId}
                s_id={state?.s_id}
                setConvertData={setConvertData}
                preOrder={state?.preOrder}
                mail_configuration={mail_configuration}
                sms_configuration={sms_configuration}
                handleSmsMailConfiguration={handleSmsMailConfiguration}
                cashOutIn_denomination={cashOutIn_denomination}
                responseType={'cashIn'}
                location_id={state?.location_id}
              />
            </div>
          ) : preOrderListOpen ? (
            <PreOrderList 
              handleClose = {() => setPreOrderListOpen(false)}
              setPreOrderConvertData = {setPreOrderConvertData}
            />
          ): (
            <>
              <div
                ref={outSideClickRef}
                style={{
                  height: 'calc(100vh - 50px)',
                  borderRight: '1px solid lightgrey',
                }}
              >
                <div
                  style={{
                    height: 'calc(100% - 100px)',
                    background: 'white',
                    color: 'black',
                  }}
                >
                  <CheckoutProducts posId={state?.posId} pre_order_status={pre_order_status} />
                </div>

                <div
                  style={{
                    height: '100px',
                    width: isTabSize ? 350 : 500,
                    // background: 'lightgrey',
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                  }}
                >
                  <KeyPad posId={state?.posId} outSideClick={outSideClick} handleSmsMailConfiguration={handleSmsMailConfiguration}/>
                </div>
              </div>

              <Paper
                style={{
                  height: 'calc(100vh - 50px)',
                  background: '#f4f7fe',
                  overflowX: 'hidden',
                  width: '100%',
                }}
              >
                <div className='container'>
                  <ProductGrid
                    posId={state?.posId}
                    PreOrderConvertData={convertData}
                    setNewTabStatusForPreOrder={setNewTabStatusForPreOrder}
                    PreOrderTabStatus={newTabStatus}
                    location_id={state?.location_id}
                  />
                </div>
              </Paper>
            </>
          )}
        </Grid>
      </Grid>
    </div>
  );
}
