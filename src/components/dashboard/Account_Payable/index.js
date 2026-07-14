import React, {useEffect, useState, useRef, useContext} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {
  Grid,
  IconButton,
  Tooltip,
  Card,
  Button,
  Typography,
  Box,
} from '@mui/material';
import Payables from './payables';
import Agewise from './agewisepayable';
import Receivables from './receivables';
import Averagepay from './averagepay';
import PaidInvoice from './paidinvoice';
import Blocked from './blocked';
import Discount from './discount_analytics';
import PayableCurrency from './paycurrency';
import GoodsReceived from './goods_received';
import ParDiscount from './par_discount';
import AgeCategory from './agecategory';
import UnReconciled from './unreconciled';
import {consolidatedPayables, listPurchaseCompareAction, listReceivableCompareAction} from '../../../redux/actions/purchase_actions';
import {getpayable_dueAction,getpayable_outstanding} from '../../../redux/actions/totAcc_actions'
import context from '../../../context/CreateNewButtonContext'
import apiCalls from 'utils/apiCalls';

const style = {
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
};

export default function Account() {
  const dispatch = useDispatch();
  // const { consolidated } = useSelector(state => state.purchases_reducers)
  const {
    purchasesReducer: {consolidated_data , comparepurchase, purchasereceivable},TotAccReducer:{payable_due_days,payable_Outstand}
  } = useSelector((state) => state);

  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);

  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(consolidatedPayables(headerLocationId)),
      dispatch(listPurchaseCompareAction()),
      dispatch(getpayable_dueAction()),
      dispatch(getpayable_outstanding()),
      dispatch(listReceivableCompareAction()),
    );
  }, []);
  return (
    <div>
      <Grid container spacing={2}>
        <Grid
          display='flex'
          mb='10px'
          size={{
            xs: 6,
            lg: 2,
            sm: 12,
            md: 12
          }}>
          <Payables style={style} consolidated_data={consolidated_data} />
        </Grid>
        <Grid
          display='flex'
          mb='10px'
          size={{
            xs: 6,
            lg: 6,
            sm: 12,
            md: 12
          }}>
          <Agewise style={style} data={payable_due_days} payable ={payable_Outstand} />
        </Grid>
        <Grid
          display='flex'
          mb='10px'
          size={{
            xs: 6,
            lg: 4,
            sm: 12,
            md: 12
          }}>
          <Receivables comparepurchase={comparepurchase} purchasereceivable={purchasereceivable} />
        </Grid>
        <Grid
          display='flex'
          mb='10px'
          size={{
            xs: 6,
            lg: 4,
            sm: 12,
            md: 12
          }}>
          <Averagepay />
        </Grid>
        <Grid
          display='flex'
          mb='10px'
          size={{
            xs: 6,
            lg: 4,
            sm: 12,
            md: 12
          }}>
          <PaidInvoice />
        </Grid>
        <Grid
          display='flex'
          mb='10px'
          size={{
            xs: 6,
            lg: 4,
            sm: 12,
            md: 12
          }}>
          <Blocked />
        </Grid>
        <Grid
          display='flex'
          mb='10px'
          size={{
            xs: 6,
            lg: 4,
            sm: 12,
            md: 12
          }}>
          <Discount />
        </Grid>
        <Grid
          display='flex'
          mb='10px'
          size={{
            xs: 6,
            lg: 4,
            sm: 12,
            md: 12
          }}>
          <PayableCurrency />
        </Grid>
        <Grid
          display='flex'
          mb='10px'
          size={{
            xs: 6,
            lg: 4,
            sm: 12,
            md: 12
          }}>
          <GoodsReceived />
        </Grid>
        <Grid
          display='flex'
          mb='10px'
          size={{
            xs: 6,
            lg: 4,
            sm: 12,
            md: 12
          }}>
          <ParDiscount />
        </Grid>
        <Grid
          display='flex'
          mb='10px'
          size={{
            xs: 6,
            lg: 4,
            sm: 12,
            md: 12
          }}>
          <AgeCategory />
        </Grid>
        <Grid
          display='flex'
          mb='10px'
          size={{
            xs: 6,
            lg: 4,
            sm: 12,
            md: 12
          }}>
          <UnReconciled />
        </Grid>
      </Grid>
    </div>
  );
}
// const mapStateToProps = state => {
//   return {
//       consolidated: state.posSessionReducer.pos_session
//     }
//   }
//   const mapDispatchToProps = (dispatch) => {
//   return {
//       drawer_menu: (data) => {
//       dispatch(drawer_menu(data))
//       },
//       PosGetByIdAction:(s_id)=>{
//         dispatch(PosGetByIdAction(s_id))
//       }
//     }
//   }
