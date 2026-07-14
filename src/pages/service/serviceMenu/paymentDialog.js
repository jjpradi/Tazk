import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import PaymentPage from '../../../components/pos/payment_section/NewPayment';
import { Button, Card, Divider, Grid, Typography } from '@mui/material';
import {makeStyles} from 'tss-react/mui';
import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDenominationValidationByIdAction } from 'redux/actions/cashOutIn_actions';
import context from '../../../context/CreateNewButtonContext';
import PaymentMethodservice from 'services/payment_method_services';
import { useEffect } from 'react';
import apiCalls from 'utils/apiCalls';
import { Remarks } from 'components/pos/payment_section/Types/Remarks';
import { useCustomFetch } from 'utils/useCustomFetch';
import API_URLS from '../../../utils/customFetchApiUrls';

export default function PaymentDialog({
  paymentOpen,
  setPaymentOpen,
  selectedPayment
}) {
  const dispatch = useDispatch()
  const [setpayment] = React.useState('card');
  const [invoiceselect, setinvoiceselect] = useState(false);
  const [allPaymentModes, setAllPaymentModes] = useState([]);
  const [Tdata, setTdata] = useState([]);
  const [index, setIndex] = useState(0);
  const [isEntered, setEntered] = useState(false);
  const [allPayment, setAllPayment] = useState([])
  console.log(allPayment, 'allPayment',Tdata)
  const { CashOutInReducer: { cashOutIn_denomination } } = useSelector((state) => state);
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = React.useContext(context);
  const [advanceConfirmDialogOpen, setAdvanceConfirmDialogOpen] = useState(false)
  const PaymentDenominationvalidation = (value) => {
    if (value) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getDenominationValidationByIdAction(value))
      );
    }
  }
  const customFetch = useCustomFetch();
  useEffect(() => {
    getPayment()
  }, [paymentOpen])

  const getPayment = async () => {
    await PaymentMethodservice.getAllPaymentModeForPaymentPage()
      .then((res) => {
        setAllPaymentModes(res.data);
      })
      .catch((err) => { })
  }
console.log("rfvewvcsvf")
  const handleClose = () => {
    setPaymentOpen(false);
  };

  let list = []
  if (selectedPayment?.service_id) {
    list = [{
      id: Date.now(),
      service_id: selectedPayment?.service_id,
      advance_amount: selectedPayment?.advance_amount
    }]
  }
  const total = list.reduce((sum, item) => sum + (item?.advance_amount || 0), 0);
  function calculateExcessAmount(){
    const changeAmountTotal = Tdata?.reduce(function (acc, obj) {
      if(obj.payment_type === "Cash (INR)"){
        return acc + +obj.cash_adjustment;
      }else{
        return acc
      }
    }, 0);
    return {
      isExcess : changeAmountTotal > 0,
      excessAmount : changeAmountTotal
    }
  }

  const handleSubmit =async()=>{
    const service_id = selectedPayment?.service_id
    const { data: resData, loading, error } = await customFetch(
      API_URLS.CREATE_TRANSACTION_PROMISE,
      'POST',
      { Tdata, headerLocationId, service_id }
    );
  }
  
  return (
    <div>
      <Dialog
        open={paymentOpen}
        // onClose={handleClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        // maxWidth='sm'
        sx={{
          "& .MuiDialog-container": {
            "& .MuiPaper-root": {
              width: "100%",
              maxWidth: "1700px",
            },
          },
        }}      >
        <Grid style={{ display: 'flex' }}>
          <Card sx={{ padding: '0px 50px 0px 50px' }}>
            <Grid container display='flex'>
              <Grid size={12}>
                <h2
                  style={{
                    margin: '10px 0 25px 0',
                    color: 'rgba(0,0,0,0.6)',
                    textAlign: 'center',
                  }}
                >
                  PAYMENT ENTRY
                </h2>
              </Grid>
              <Grid
                style={{ textAlign: 'start', padding: '0 40px' }}
                size={{
                  sm: 12,
                  md: 12,
                  lg: 6
                }}>
                <div>
                  <div style={{ display: 'flex', marginTop: 4 }}>
                    <h3 style={{ margin: 'auto 5px 5px', color: 'rgba(0,0,0,0.6)' }}>
                      {`CUSTOMER DETAILS`}
                    </h3>
                  </div>
                  <Divider style={{ height: '2px', marginBottom: 10 }} />
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-evenly',
                    height: 'calc(100% - 50px)',
                  }}
                >
                  <div style={{ display: 'flex', marginLeft: '10px' }}>
                    <div style={{ width: '50%' }}>
                      <Typography style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                        {selectedPayment?.first_name}
                      </Typography>
                      <Typography style={{ margin: 0, lineHeight: 1.6 }}>{selectedPayment?.service_id}</Typography>
                      <Typography style={{ margin: '0 0 10px 0' }}>{selectedPayment?.phone_number}</Typography>
                    </div>

                    <Typography style={{ marginLeft: 'auto' }}>
                      {selectedPayment?.email}
                    </Typography>
                  </div>

                  <div className='payment_top_media'>
                    <>
                      <div style={{ display: 'flex', marginTop: 10 }}>
                        <h3
                          style={{
                            margin: 'auto 5px 5px',
                            color: 'rgba(0,0,0,0.6)',
                          }}
                        >
                          SERVICE DETAILS
                        </h3>
                      </div>
                      <Divider style={{ height: '2px' }} />
                      <DataGrid
                        rows={list}
                        rowHeight={40}
                        columns={[
                          {
                            field: 'service_id',
                            headerName: 'SERVICE ID',
                            flex: 1,
                          },
                          {
                            field: 'advance_amount',
                            headerName: 'Total',
                            flex: 1,
                          },
                        ]}
                        disableColumnMenu
                        checkboxSelection
                        pageSizeOptions={[]}
                        
                        autoHeight
                        sortModel={[
                          {
                            field: 'id',
                            sort: 'asc',
                          },
                        ]} initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }}
                      // onSelectionModelChange={handleSelectionModelChange}
                      />
                    </>
                  </div>
                </div>
              </Grid>
              <Grid
                style={{ textAlign: 'start', padding: '0 40px' }}
                className='payment_top_media'
                size={{
                  sm: 12,
                  md: 12,
                  lg: 6
                }}>
                <div style={{ display: 'flex', marginTop: 5 }}>
                  <h3 style={{ margin: 'auto 5px 5px', color: 'rgba(0,0,0,0.6)' }}>
                    PAYMENT DETAILS
                  </h3>
                </div>
                <Divider style={{ height: '2px' }} />
                <div style={{ padding: '16px 0' }}>
                  <PaymentPage
                    pageType={'salePurchasePage'}
                    getPay={allPayment}
                    pModes={allPaymentModes}
                    isEntered={isEntered}
                    setEntered={setEntered}
                    index={index}
                    setIndex={setIndex}
                    setpayment={setpayment}
                    Tdata={Tdata}
                    setTdata={setTdata}
                    invoiceselect={invoiceselect}
                    status={'New'}
                    total={total}
                    cashOutIn_denomination={cashOutIn_denomination}
                    PaymentDenominationvalidation={PaymentDenominationvalidation}
                    responseType={'cashIn'}
                  />
                </div>
                {/* </div> */}
              </Grid>
            </Grid>
            <Grid container marginBottom='10px'>
              <Grid
                style={{ display: 'flex', padding: '0 40px' }}
                className='payment_top_media'
                size={{
                  sm: 12,
                  md: 6,
                  lg: 6
                }}>
                <Button variant='contained'
                  sx={{ height: 40 }}
                  onClick={handleClose}
                  color='secondary'> Close </Button>
              </Grid>
              <Grid
                style={{ display: 'flex', padding: '0 40px' }}
                className='payment_top_media'
                size={{
                  sm: 12,
                  md: 6,
                  lg: 6
                }}>
                <Remarks />
                <div style={{ display: 'flex', height: 40, marginTop: 'auto' }}>
                  <Button
                    style={{ marginLeft: 20 }}
                      onClick={handleSubmit}
                    variant='contained'
                    color='primary'
                  >
                    Validate
                  </Button>
                </div>
              </Grid>
            </Grid>
          </Card>
        </Grid>

      </Dialog>
    </div>
  );
}
