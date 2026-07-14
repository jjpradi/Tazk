import React, {useEffect, useState, useRef, useContext} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import OptionButton from './actionButton';
import {Grid, IconButton, Tooltip} from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ProductTopCards from './productTopOrder';
import CustomerTopCards from '../customer_erpDesign/customerTopOrders';
import CreateNewButtonContext from '../../context/CreateNewButtonContext';
import {
  getProductErpDetails,
  getCustomerErpDetails,
} from '../../redux/actions/erpDetails_actions';
import apiCalls from 'utils/apiCalls';

export default function TopOrder({rowIndex, type, handleEdit, handleDelete}) {
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const dispatch = useDispatch();
  const {
    productReducer: {product},
    erpDetailsReducer: {product_erp_details, customer_erp_details},
    customerReducer: {customer},
  } = useSelector((state) => state);

  const {setModalTypeHandler, setLoaderStatusHandler} = useContext(
    CreateNewButtonContext,
  );

  const [index, setIndex] = useState('');

  const func1 = () => {
    if (index !== '' && type === 'product') {
      const item_id = product[index].item_id;
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getProductErpDetails(item_id))
      );
    } else if (index !== '' && type === 'customer') {
      const customer_id = customer[index].customer_id;
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getCustomerErpDetails(customer_id))
      );
      
    }
  };
  ref1.current = func1;
  useEffect(() => {
    if (index !== '') {
      ref1.current();
    }
  }, [index]);
  const func2 = () => {
    setIndex(rowIndex);
  };
  ref2.current = func2;
  useEffect(() => { (async () => {
    await ref2.current();
  })();
}, [rowIndex]);

  const handleProductChange = (option) => {
    const indexData = product[index];
    if (option === 0) {
      handleEdit(indexData.item_id);
    } else if (option === 1) {
      handleDelete(indexData.item_id);
    }
  };

  const handleCustomerChange = (option) => {
    const indexData = customer[index];
    if (option === 0) {
      handleEdit(indexData);
    } else if (option === 1) {
      handleDelete(indexData.customer_id, indexData.supplier_id);
    }
  };
  return (
    <div>
      <Grid container spacing={0} direction='row-reverse'>
        <Grid
          size={{
            sm: 2,
            md: 2,
            lg: 1
          }}>
          <Tooltip title='Previous'>
            <IconButton
              color='primary'
              disabled={index === 0}
              component='span'
              onClick={() => setIndex(index - 1)}
            >
              <ArrowBackIosIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title='Next'>
            <IconButton
              color='primary'
              disabled={
                type === 'product'
                  ? product.length - 1 === index
                  : customer.length - 1 === index
              }
              component='span'
              onClick={() => setIndex(index + 1)}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          </Tooltip>
        </Grid>
        <Grid
          size={{
            sm: 2,
            md: 2,
            lg: 1
          }}>
          <OptionButton
            handleProductChange={handleProductChange}
            handleCustomerChange={handleCustomerChange}
            type={type}
          />
        </Grid>
        {type === 'product' && (
          <Grid
            size={{
              xs: 6,
              sm: 12,
              md: 12,
              lg: 12
            }}>
            <ProductTopCards product_erp_details={product_erp_details} />
          </Grid>
        )}

        {type === 'customer' && (
          <Grid
            size={{
              xs: 6,
              sm: 12,
              md: 12,
              lg: 12
            }}>
            <CustomerTopCards customer_erp_details={customer_erp_details} />
          </Grid>
        )}
      </Grid>
    </div>
  );
}
