import React from 'react';
import PrintIcon from '@mui/icons-material/Print';
import {Button, Card, Grid} from '@mui/material';
import Receipt from './Receipt';
import ReactToPrint from 'react-to-print';
import {useNavigate, useLocation} from 'react-router-dom';
import {
  SetNextOrder,
  SetNextPreOrder,
} from '../../../redux/actions/pos_product_list';
import {useDispatch} from 'react-redux';
import NewInvoice from '../../../components/invoice/invoice.js';

export default function Index() {
  const {state} = useLocation();

  const history = useNavigate();
  const dispatch = useDispatch();
  let componentRef;

  const changeToNewOrder = () => {
    if (state.pre_order_status === false) {
      dispatch(SetNextOrder(false, state.posId));
    } else {
      dispatch(SetNextPreOrder(false, state.posId));
    }
  };


  return (
    // <>
    //     <Grid container>
    //         <Grid size={5} ></Grid>
    //         <Grid size={3} className="t_right">
    //             <div style={{ display: 'flex' }}>
    //                 <ReactToPrint
    //                     trigger={() => <Button color='inherit' sx={{ m: 1, border: '1px solid rgba(0, 0, 0, 0.23)' }} fullWidth variant="outlined"><PrintIcon sx={{ mr: 1 }} />Print Invoice</Button>}
    //                     content={() => componentRef}
    //                 />
    //             </div>
    //         </Grid>
    //         <Grid size={3} style={{ textAlign: 'right' }}>
    //             <Button color='success' sx={{ m: 1 }} onClick={() => { changeToNewOrder(); history('/pointofsale', { posId: state?.posId, rerender: true, s_id: state?.s_id, preOrder: state?.preOrder }); }} variant="contained">Next Order</Button>
    //         </Grid>
    //     </Grid>
    //     <Card style={{ width: '60%', margin: 'auto', minHeight: 'calc(100vh - 40px)', padding: '20px' }}>
    //         <Grid container>
    //             <Grid size={12}>
    //             <div ref={el => (componentRef = el)} style={{ color: 'black', padding: '5px'}} >
    //                 <NewInvoice state={state} />
    //                 </div>
    //             </Grid>
    //         </Grid>
    //     </Card>

    // </>
    <div style={{display: 'flex', margin: '20px 0', width: '100%'}}>
      <Card
        style={{width: '60%', margin: 'auto', minHeight: 'calc(100vh - 40px)'}}
      >
        <Grid container>
          <Grid size={3}></Grid>
          <Grid
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            size={6}>
            <h3>{`change: ${state?.change_amount || 0}`}</h3>
          </Grid>
          <Grid style={{textAlign: 'right'}} size={3}>
            <Button
              color='success'
              sx={{m: 1}}
              onClick={() => {
                changeToNewOrder();
                history('/pointofsale', {state:{
                  posId: state?.posId,
                  rerender: true,
                  s_id: state?.s_id,
                  preOrder: state?.preOrder,
                  location_id: state?.location_id
                }});
              }}
              variant='contained'
            >
              Next Order
            </Button>
          </Grid>

          <Grid size={3}></Grid>
          <Grid size={6}>
            <div style={{display: 'flex'}}>
              <ReactToPrint
                trigger={() => (
                  <Button
                    color='inherit'
                    sx={{m: 1, border: '1px solid rgba(0, 0, 0, 0.23)'}}
                    fullWidth
                    variant='outlined'
                  >
                    <PrintIcon sx={{mr: 1}} />
                    Print Receipt
                  </Button>
                )}
                content={() => componentRef}
              />
            </div>

            <div style={{display: 'flex', justifyContent: 'center'}}>
              <Card style={{marginTop: 10}}>
                <div
                  ref={(el) => (componentRef = el)}
                  style={{
                    color: 'black',
                    padding: '0 16px 16px',
                    display: 'flex',
                  }}
                >
                  <Receipt state={state} />
                </div>
              </Card>
            </div>
          </Grid>
          <Grid size={3}></Grid>
        </Grid>
      </Card>
    </div>
  );
}
