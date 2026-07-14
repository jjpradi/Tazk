import React, { useEffect, useState, useRef, useContext } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Grid, IconButton, Tooltip, Card, Button, Typography, Box } from '@mui/material'
import { consolidatedPayables } from '../../../redux/actions/purchase_actions'
import { listInventoryAction, listlocateproductAction } from '../../../redux/actions/inventory_actions'
import AvailStock from './AvailStock';
import StockSummary from './StockSummary'
import LocateStock from './LocateStock';
import NonmoveCategory from './NonmoveCategory';
import context from '../../../context/CreateNewButtonContext';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {clientwebsocket } from '../../../http-common'
import {useInView} from 'react-intersection-observer';
import apiCalls from 'utils/apiCalls';
import socketManager from 'utils/socketManager'


const style = {
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
};


export default function Index() {

  const {ref, inView, entry} = useInView({
    threshold: 0,
    triggerOnce: true,
  });


  const dispatch = useDispatch()
  // const { consolidated } = useSelector(state => state.purchases_reducers)
  const { inventoryReducer: { inventory, getlocateproduct } } = useSelector(state => state)
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(context);

  useEffect(() => {
    const rootSocket = socketManager.getSocket("/");

    if (!rootSocket) {
      return;
    }

    const handleInventory = (content) => {
      try {
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(listInventoryAction(commoncookie, headerLocationId, setModalTypeHandler)),
          dispatch(listlocateproductAction(commoncookie, headerLocationId, setModalTypeHandler))
        );
      } catch (e) {
        console.log("e", e)
      }
    };
    rootSocket.on("purchases", handleInventory);

    return () => {
      rootSocket.off("purchases", handleInventory);
    };
  }, []);
  
  useEffect(() => {
    
    if(inView){
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(listInventoryAction(commoncookie,headerLocationId, setModalTypeHandler, setLoaderStatusHandler)),
        dispatch(listlocateproductAction(commoncookie, headerLocationId, setModalTypeHandler,setLoaderStatusHandler))
      );
    }
    // clientwebsocket.socket.onmessage = async (message) => {
    //   let { event } = JSON.parse(message.data)
    //   if (event === 'purchases') {
    //     apiCalls(
    //       setModalTypeHandler,
    //       setLoaderStatusHandler,
    //       dispatch(listInventoryAction(commoncookie, headerLocationId, setModalTypeHandler)),
    //       dispatch(listlocateproductAction(commoncookie, headerLocationId, setModalTypeHandler))
    //     );
    //   }
    // }
  }, [headerLocationId, inView])

  return (
    <Grid container spacing={5} ref={ref}>
      <Grid
        display='flex'
        size={{
          xs: 12,
          lg: 6,
          sm: 6,
          md: 6
        }}>
        <StockSummary style={style} inView={inView}/>
      </Grid>
      <Grid
        display='flex'
        size={{
          xs: 12,
          lg: 6,
          sm: 6,
          md: 6
        }}>
        <LocateStock getlocateproduct={getlocateproduct} inView={inView} />
      </Grid>
      <Grid
        display='flex'
        size={{
          xs: 12,
          lg: 12,
          sm: 12,
          md: 12
        }}>
        <NonmoveCategory inView={inView}/>
      </Grid>
    </Grid>
  );
}

