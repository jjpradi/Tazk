import React, {useEffect, useState, useRef} from 'react';
// import Grid from "@mui/material/Grid";
import {Grid, Typography} from '@mui/material';
import {useSelector} from 'react-redux';
import {
  taxes,
  withoutTax,
  totalCost,
  getIgst,
  taxForCommonDiscount,
  splitTax,
  individualUnitPrice,
  calculateRoundOffforPOS,
} from '../../../components/pos/checkout_products/commonTax';

export default function App({state}) {
  const [custs, setcust] = useState({});
  const [gst, setgst] = useState({});

  const {
    customerReducer: {customer},
    productListReducer: {product_lists, tab_count, pre_order_status, pre_order_list},
    posSessionReducer: {pos_session},
    appConfigReducer: {app_config_data},
  } = useSelector((state) => state);

  const list = pre_order_status ? pre_order_list['pre_order'].productData : product_lists[tab_count].productData;
  const discount = pre_order_status ? pre_order_list['pre_order'].discount || [] : product_lists[tab_count].discount;
  const roundOffAppConfig = app_config_data.filter(f => f.key_name === 'company.applyRoundOff')
  const roundedOffEnabled = roundOffAppConfig.length > 0 ? roundOffAppConfig[0].value : 'false'

  const tempstate = useRef(null);
  const getDate = () => {
    return new Date().toLocaleDateString();
  };

  const getTime = () => {
    const d = new Date();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; 
    const curTime = `${hours}:${minutes}  ${ampm}`;
    return curTime;
  };

  const states = () => {
    if (state?.id) {
      let custarray = customer?.length > 0 ? customer : customer?.data
      const cust = custarray?.find((d) => d.customer_id === state.id);
      setcust(cust || {});
      const gst = pos_session.find((d) => d.posId === state.posId) || {};
      setgst(gst);
    }
  };
  tempstate.current = states;
  useEffect(() => {
    tempstate.current();
  }, [state]);

  const GetGstType = () => {
    const getState =
      app_config_data.find((d) => d.key_name === 'address.state') || {};
    if (custs?.state?.toLowerCase() === getState?.value?.toLowerCase()) {
      return true;
    }
    return false;
  };

  const ledgerTaxSplit = splitTax(taxForCommonDiscount(list, discount, state.taxtype));

  return (
    <div style={{width: '88mm'}}>
      <Grid container>
        <Grid sx={{textAlign: 'center'}} size={12}>
          <Typography style={{margin: '15px 0 5px 0'}}>
            {gst.taxInvoiceHeader}
          </Typography>
        </Grid>
        <Grid sx={{textAlign: 'center'}} size={12}>
          <Typography gutterBottom='1'>{`${getDate()} ${getTime()} Order 01074-002-0001`}</Typography>
        </Grid>
        <Grid size={12}>
          {Object.keys(custs).length ? (
            <>
              <Typography className='p'>{custs.company_name || ''}</Typography>
              <Typography className='p'>{`Phone : ${
                custs.phone_number || ''
              }`}</Typography>
              <Typography className='p'>{`User : ${custs.first_name || ''} ${
                custs.last_name || ''
              }`}</Typography>
            </>
          ) : (
            ''
          )}
        </Grid>

        <Grid style={{marginTop: 20}} size={12}>
          {list.map((d) => (
            <Grid container key={d}>
              <Grid size={5}>
                <Typography className='p'>{d.name}</Typography>
              </Grid>
              <Grid style={{textAlign: 'right'}} size={7}>
                <Grid container>
                  <Grid size={6}>
                    {/* {(typeof d.selling_price !== 'undefined'
                      ? (d.selling_price / (getIgst(d) + 100)) * 100
                      : d.unit_price
                    ).toFixed(2)} */}
                  </Grid>
                  <Grid size={6}>
                    {`${roundedOffEnabled === 'true' ? Math.round(
                      individualUnitPrice(list, d, discount, state.taxType)
                    ) : individualUnitPrice(list, d, discount, state.taxType)} ₹`}

                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>

        <Grid style={{marginTop: 20}} size={12}>
          <Grid container>
            <Grid size={6}>
              Subtotal :
            </Grid>
            <Grid className='t_right' size={6}>
              {`${roundedOffEnabled === 'true' ? Math.round(totalCost(list, 'noDiscount', null, state.taxtype) - taxForCommonDiscount(list, discount, state.taxtype)) : (totalCost(list, 'noDiscount', null, state.taxtype) - taxForCommonDiscount(list, discount, state.taxtype)).toFixed(2)} ₹`}
            </Grid>


            {
              discount.amount > 0 &&
              <>
                <Grid size={6}>
                  Discount :
                </Grid>
                <Grid className='t_right' size={6}>
                  {`${discount.amount.toFixed(2)} ₹`}
                </Grid>
              </>
            }

            {state.taxtype ? (
              <>
                <Grid size={6}>
                  SGST :
                </Grid>
                <Grid className='t_right' size={6}>
                {`${ledgerTaxSplit.cgst.toFixed(2)} ₹`}
                </Grid>
                <Grid size={6}>
                  CGST :
                </Grid>
                <Grid className='t_right' size={6}>
                 {`${ledgerTaxSplit.sgst.toFixed(2)} ₹`}
                </Grid>
              </>
            ) : (
              <>
                <Grid size={6}>
                  IGST :
                </Grid>
                <Grid className='t_right' size={6}>
                  {`${discount !== undefined && discount?.amount !== 0 ? taxForCommonDiscount(list, discount, state.taxtype).toFixed(2) : taxes(list).toFixed(2)} ₹`}
                </Grid>
              </>
            )}

            {
              roundedOffEnabled === 'true' &&
              <>
              <Grid size={6}>
                  Round Off :
                </Grid>
                <Grid className='t_right' size={6}>
                  {`${calculateRoundOffforPOS(roundedOffEnabled, Number((totalCost(list, 'noDiscount', discount, state.taxtype)).toFixed(2)), Number(splitTax(taxForCommonDiscount(list, discount, state.taxtype)).cgst.toFixed(2)))} ₹`}
                </Grid>
              
              </>
            }

            <Grid sx={{fontSize: '1.3rem'}} size={6}>
              Total :
            </Grid>
            <Grid sx={{fontSize: '1.3rem'}} className='t_right' size={6}>
              {`₹${discount === undefined || discount?.amount === 0 || totalCost(list, null, null, state.taxtype) === 0
                  ? roundedOffEnabled === 'true' ? Math.round(totalCost(list, 'noDiscount', null, state.taxtype)) : totalCost(list, 'noDiscount', null, state.taxtype).toFixed(2)
                  : roundedOffEnabled === 'true' ? Math.round(totalCost(list, 'noDiscount', discount, state.taxtype) + taxForCommonDiscount(list, discount, state.taxtype)) : (totalCost(list, 'noDiscount', discount, state.taxtype) + taxForCommonDiscount(list, discount, state.taxtype)).toFixed(2)
                }`}

            </Grid>
            {state.Tdata && state.Tdata.map((t) => {
              return (
                <>
                  <Grid sx={{mt: 2}} size={6}>
                    {t.payment_type}
                  </Grid>
                  <Grid sx={{mt: 2}} className='t_right' size={6}>
                    {`${roundedOffEnabled === 'true' ? Math.round(t.payment_amount) : t.payment_amount} ₹`}
                  </Grid>
                </>
              );
            })}
            {/* <Grid size={6} sx={{ mt: 2 }}>
              Cash (INR)
            </Grid>
            <Grid size={6} sx={{ mt: 2 }} className="t_right">
              {`${state.received_amount} ₹`}
            </Grid> */}
            <Grid sx={{mt: 2}} size={6}>
              Change :
            </Grid>
            <Grid sx={{mt: 2}} className='t_right' size={6}>
              {`${state.change_amount} ₹`}
            </Grid>
          </Grid>
        </Grid>

        <Grid sx={{textAlign: 'center'}} size={12}>
          <Typography style={{margin: '10px 0 0 0'}}>
            {gst.taxInvoiceFooter}
          </Typography>
        </Grid>
      </Grid>
    </div>
  );
}
