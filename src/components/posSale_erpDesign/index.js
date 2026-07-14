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
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import OptionButton from './actionButton';
import PosSaleTopCards from './posSaleTopCards';
import PosSaleDenomination from './posSale_denomination';
import PosSaleCustomerInfo from './posSale_Customer_Info';
import PosSaleDenominationChange from './posSale_denomination_change';
import PosSaleProductInfo from './posSale_ProductInfo';
import PosSalePaymentMode from './posSale_PaymentMode';
import {getCustomerErpDetails} from '../../redux/actions/erpDetails_actions';
import CancelPosSalePage from '../../components/posSale_erpDesign/cancelPosSale';
// import BillsRow from './billsRow';
// import LastBills from './lastBills';
import SalesGraph from '../purchaseDetails/salesGraph';
// import PaymentReceipt from './paymentReceipt';
import {base_url} from '../../http-common';
// import PrimaryContact from './primaryContact';
import Divider from '@mui/material/Divider';
import CreateNewButtonContext from '../../context/CreateNewButtonContext';
import useMediaQuery from '@mui/material/useMediaQuery';
// import TimeLine from './timeLine';
// import StatementOfAccounts from './statementOfAccounts';
import {useCustomFetch} from 'utils/useCustomFetch';
import API_URLS from '../../utils/customFetchApiUrls';

export default function App({
  
  statementOfAccount,
  rowIndex,
  open,
  IndexData,
  cancelPosSale,
  type,
  handleEdit,
  handleDelete,
  rowPopupClose,
  handleCancelPosSale,
  cancelPosSaleBackBtn
}) {
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const {setLoaderStatusHandler} = useContext(CreateNewButtonContext);
  const dispatch = useDispatch();
  const {
    posSaleReducer: {customer_filter, searchPosSaleData},
    erpDetailsReducer: {customer_erp_details},
    cashBoxReducer: {cash_box_denomination}
  } = useSelector((state) => state);

  let posSale = searchPosSaleData;
  const [posSaleData, setPosSale] = useState([]);
  const [posSalePaymentData, setPosSalePaymentData] = useState([]);
  const [sale_id, setSale_id] = useState('');
  const [index, setIndex] = useState('');
  const [pdfOpen, setPdfOpen] = useState(false);
  const matches = useMediaQuery('(min-width:600px)');
  const customFetch = useCustomFetch();
  const [cash_denomination_details, set_cash_denomination_details] = useState({
    tendered : [],
    change : []
  });



  const [contactType, setContactType] = useState('');

  const func1 = () => {
    if (index !== '') {
      const sale_id = posSale[index]?.sale_id
      //   ? posSale[index]?.customer_id
      //   : posSale[index]?.supplier_id;
      // const type = posSale[index]?.customer_id ? 'Customer' : 'Supplier';
      // setContactType(type);
      // dispatch(
      //   getCustomerErpDetails(customer_id, type, setLoaderStatusHandler),
      // );
      setSale_id(sale_id);
      setPosSale(posSale[index]);
      setPosSalePaymentData(posSale[index]?.pos_sales_payments)
      IndexData(index)

    }
  };

  useEffect(() => { (async () => {
    if (index !== '') {
      setPosSale(posSale[index]);
      setPosSalePaymentData(posSale[index].pos_sales_payments)

    }

    (async()=>{
      if(index !== '' && posSale.length && cash_box_denomination){
        const {
          data: cash_denomination_transacted,
          loading,
          error,
        } = await customFetch(
          API_URLS.GET_DENOMINATION_TRANSACTED,
          'POST',
          { id: posSale[index].sale_id }
        );

        const temp_details = {
          tendered: [],
          change: []
        }

        cash_denomination_transacted.forEach(i => {
          const d =  cash_box_denomination.find(j => j.id === i.denomination_dtl_id)
          const temp = {
            denomination :d?.denomination || '',
            count : Math.abs(i.current_balance_count),
            type : d?.denomination_type || ''
          }
          if(i.current_balance_count >= 0){
            temp_details.tendered.push(temp)
          }else{
            temp_details.change.push(temp)
          }
        })
        set_cash_denomination_details(temp_details)
      }
    })()

  })();
}, [posSale,posSale.length, cash_box_denomination]);
  

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

  const handleCustomerChange = (option) => {
    const indexData = posSale[index];
    if (option === 0) {
      handleEdit(indexData, index);
    } else if (option === 1) {
      handleDelete(indexData.sale_id);
    } else if (option === 2) {
      setPdfOpen(true);
    }
  };

  const rowIndexData = (value) => {
  }

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const checkIsValid = (val) => {
    if (typeof val === 'undefined') return '';
    if (val === null || val === 'null') return '';
    return val;
  };

  return (
    <div>
      {open && <CancelPosSalePage 
        rowIndex={index}
        pos_sale_by_pagination={searchPosSaleData} 
        cancelPosSaleBackBtn={cancelPosSaleBackBtn}
        indexValue={index}  
        handleCancelPosSale={handleCancelPosSale} 
        rowIndexData={rowIndexData}
        // rowPopupClose={this.rowPopupClose}
        // setModalStatusHandler={setModalStatusHandler}
        // setModalTypeHandler={setModalTypeHandler}
      />}
      {open === false && (
        <>
          <Grid container display='flex' flexDirection='row' alignItems='center' spacing={3} pb='10px'>
          <Grid
            display='flex'
            justifyContent= 'flex-start'
            size={{
              xs: 12,
              lg: 6,
              sm: 6,
              md: 6
            }}>
            <Typography variant='h6'>
              Pos Sale
            </Typography>
          </Grid>
          <Grid
            display='flex'
            // mb='10px'
            justifyContent='flex-end'
            size={{
              xs: 12,
              lg: 6,
              sm: 6,
              md: 6
            }}>
            <div style={{marginLeft: 'auto'}}>
              <Grid container spacing={2}>
                <Grid>
                  <Button
                    variant='contained'
                    onClick={() => {
                      setLoaderStatusHandler(true);
                      rowPopupClose();
                      setLoaderStatusHandler(false);
                    }}
                    sx={{}}
                    color='inherit'
                  >
                    Back
                  </Button>
                </Grid>

                <Grid>
                  <OptionButton
                    handleCustomerChange={handleCustomerChange}
                    type={type}
                    cancelPosSale={cancelPosSale}
                    rowIndexData={rowIndexData}
                    rowIndex={index}
                  />
                </Grid>
                <Grid>
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
                      disabled={posSale.length - 1 === index}
                      component='span'
                      onClick={() => setIndex(index + 1)}
                    >
                      <ArrowForwardIosIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            </div>

            {/* <div style={{ marginLeft: 'auto' }}>
            <OptionButton handleCustomerChange={handleCustomerChange} type={type} />

            <Tooltip title="Previous">
              <IconButton color="primary" disabled={index === 0} component="span" onClick={() => setIndex(index - 1)}>
                <ArrowBackIosIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Next">
              <IconButton color="primary" disabled={customer.length - 1 === index} component="span" onClick={() => setIndex(index + 1)}>
                <ArrowForwardIosIcon />
              </IconButton>
            </Tooltip>
          </div> */}
            </Grid>
        </Grid>
          
          <Card variant='outlined' style={{width: '100%'}}>
            {/* <div style={{padding: '5px 5px 5px 5px'}}>
              
            </div> */}
            
            <Grid container display='flex' flexDirection='row' p='10px' >
              {/* <Grid size={{ md: 12, lg: 12 }}> */}
              <Grid
                pb='10px'
                size={{
                  md: 12,
                  lg: 12,
                  sm: 12,
                  xs: 12
                }}>
                <PosSaleTopCards posSaleData={posSaleData}/>
              </Grid>
              <Grid
                pb='10px'
                size={{
                  md: 12,
                  lg: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Divider variant="middle"/>
              </Grid>
              <Grid
                pb='10px'
                style={{
                  // borderRight: matches && '1px #d9dadc solid',
                  // padding: '6px',
                }}
                size={{
                  md: 12,
                  lg: 5.9,
                  sm: 12,
                  xs: 12
                }}>
                <PosSaleCustomerInfo posSaleData={posSaleData}/>
              </Grid>
              <Grid
                display='flex'
                justifyContent='center'
                size={{
                  md: 12,
                  lg: 0.2,
                  sm: 12,
                  xs: 12
                }}>
                <Divider orientation="vertical" variant="middle" flexItem  />
              </Grid>
              <Grid
                pb='10px'
                style={{}}
                size={{
                  md: 12,
                  lg: 5.9,
                  xs: 12,
                  sm: 12
                }}>
                <Grid container display='flex' flexDirection='row' spacing={2}>
                  <Grid
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                    }}>
                    <Card variant='outlined' sx={{padding: '10px', minHeight: '30px'}}>
                      
                      <Typography variant='body1'>
                        Amount To Paid :{' '}
                        <span style={{fontWeight: '500'}}>{posSaleData?.received_amount || ''}</span>
                      </Typography>
                      </Card>
                  </Grid>
                  <Grid
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                    }}>
                    <PosSalePaymentMode posSaleData={posSaleData?.pos_sales_payments}/>
                  </Grid>
                  <Grid
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                    }}>
                    <PosSaleDenomination posSaleData={posSaleData?.paidAmount} cash_denomination_details={cash_denomination_details}/>
                  </Grid>
                  <Grid
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                    }}>
                    <PosSaleDenominationChange posSaleData={posSaleData?.changeAmount} cash_denomination_details={cash_denomination_details}/>
                  </Grid>
                  
                </Grid>
                
              </Grid>
              <Grid
                pb='10px'
                size={{
                  md: 12,
                  lg: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Divider variant="middle"/>
              </Grid>
            {/* <hr style={{width:'95%', color: 'gray'}}/> */}
            <Grid
              pb='10px'
              size={{
                md: 12,
                lg: 12,
                sm: 12,
                xs: 12
              }}>
                <PosSaleProductInfo posSaleData={posSaleData?.product_info} posSalesItems={posSaleData?.sales_items} />
              </Grid>
              <Grid
                pb='10px'
                size={{
                  md: 12,
                  lg: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Divider variant="middle"/>
              </Grid>
            {/* <hr style={{width:'95%', color: 'gray'}}/> */}
              <Grid container display='flex' flexDirection='row' p='10px 0px'>
              <Grid
                display='flex'
                alignItems='center'
                style={{
                  // borderRight: matches && '1px #d9dadc solid',
                  // padding: '6px',
                }}
                size={{
                  md: 12,
                  lg: 5.9,
                  sm: 12,
                  xs: 12
                }}>
                    <Typography variant='body1'>
                      Note :{' '}
                      <span style={{fontWeight: '500'}}>{posSaleData?.note || ''}</span>
                    </Typography>
                </Grid>
                <Grid
                  display='flex'
                  justifyContent='center'
                  size={{
                    md: 12,
                    lg: 0.2,
                    sm: 12,
                    xs: 12
                  }}>
                <Divider orientation="vertical" />
              </Grid>
                  <Grid
                    display='flex'
                    alignItems='center'
                    size={{
                      md: 12,
                      lg: 5.9,
                      sm: 12,
                      xs: 12
                    }}>
                    <Typography variant='body1' style={{paddingLeft: 10}}>
                          Payment Remarks :{' '}
                          <span style={{fontWeight: '500'}}></span>
                        </Typography>
                  </Grid>
</Grid>
            </Grid>
            {/* <div style={{padding: '5px 5px 5px 5px'}}>
            </div> */}
            {/* <div style={{ padding: '15px 15px 15px 15px'}}> */}
              {/* <Card variant='outlined' sx={{padding: '10px', minHeight: '30px'}}> */}

              {/* </Card> */}
            {/* </div> */}
          </Card>
          {/* </Grid> */}
        </>
      )}
    </div>
  );
}
