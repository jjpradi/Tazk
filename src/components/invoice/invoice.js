import React, {useState, useEffect, useRef} from 'react';
import {Grid, Typography} from '@mui/material';
import './styles.css';
import {useSelector} from 'react-redux';
import {taxes, withoutTax, totalCost} from '../pos/checkout_products/commonTax';

export default function Invoice({state}) {
  const [custs, setcust] = useState({});
  const [gst, setgst] = useState({});
  const [invoice, setinvoice] = useState('');
  const [appconfig, setappconfig] = useState('');

  const {
    customerReducer: {customer},
    productListReducer: {product_lists, tab_count},
    posSessionReducer: {pos_session},
    posCreationReducer: {pos_creation},
    appConfigReducer: {app_config_data},
  } = useSelector((state) => state);

  const list = product_lists[tab_count].productData;

  const tempstate = useRef(null);
  const getDate = () => {
    return new Date().toLocaleDateString();
  };

  const getTime = () => {
    var d = new Date();
    const curTime = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
    return curTime;
  };

  const states = () => {
    if (state?.id) {
      const cust = customer.filter((d) => d.customer_id === state.id)[0];
      setcust(cust || {});
      const gst = pos_session.find((d) => d.posId === state.posId) || {};
      setgst(gst);
      const posFilter = pos_creation.filter((f) => f.posId === state.posId);
      const invoicePattern =
        posFilter.length > 0 ? posFilter[0].invoice_pattern : '';
      setinvoice(invoicePattern);
      const companyName = app_config_data.filter(
        (f) => f.key_name == 'company.name',
      );
      const fullAddress = app_config_data.filter(
        (f) => f.key_name == 'address.fulladdress',
      );
      const emailData = app_config_data.filter((f) => f.key_name == 'company.email');
      const gstinData = app_config_data.filter(
        (f) => f.key_name == 'company.gstin/uin',
      );
      const companyMobile = app_config_data.filter(
        (f) => f.key_name == 'company.mobile',
      );
      const web = app_config_data.filter((f) => f.key_name == 'web.base.url');
      setappconfig({
        companyName: companyName.length > 0 ? companyName[0].value : '',
        companyAddress: fullAddress.length > 0 ? fullAddress[0].value : '',
        email: emailData.length > 0 ? emailData[0].value : '',
        Gst: gstinData.length > 0 ? gstinData[0].value : '',
        mobile: companyMobile.length > 0 ? companyMobile[0].value : '',
        web: web.length > 0 ? web[0].value : '',
      });
    }
  };
  tempstate.current = states;
  useEffect(() => {
    tempstate.current();
  }, [state]);

  function inWords(num) {
    const getNum = num.split('.')[0];
    const getNum1 = num.split('.')[1];

    if (getNum.length > 9) return 'overflow';

    function price_in_words(price) {
      var sglDigit = [
          'Zero',
          'One',
          'Two',
          'Three',
          'Four',
          'Five',
          'Six',
          'Seven',
          'Eight',
          'Nine',
        ],
        dblDigit = [
          'Ten',
          'Eleven',
          'Twelve',
          'Thirteen',
          'Fourteen',
          'Fifteen',
          'Sixteen',
          'Seventeen',
          'Eighteen',
          'Nineteen',
        ],
        tensPlace = [
          '',
          'Ten',
          'Twenty',
          'Thirty',
          'Forty',
          'Fifty',
          'Sixty',
          'Seventy',
          'Eighty',
          'Ninety',
        ],
        handle_tens = function (dgt, prevDgt) {
          return 0 === dgt
            ? ''
            : ' ' + (1 === dgt ? dblDigit[prevDgt] : tensPlace[dgt]);
        },
        handle_utlc = function (dgt, nxtDgt, denom) {
          return (
            (0 !== dgt && 1 !== nxtDgt ? ' ' + sglDigit[dgt] : '') +
            (0 !== nxtDgt || dgt > 0 ? ' ' + denom : '')
          );
        };

      var str = '',
        digitIdx = 0,
        digit = 0,
        nxtDigit = 0,
        words = [];
      if (((price += ''), isNaN(parseInt(price)))) str = '';
      else if (parseInt(price) > 0 && price.length <= 10) {
        for (digitIdx = price.length - 1; digitIdx >= 0; digitIdx--)
          switch (
            ((digit = price[digitIdx] - 0),
            (nxtDigit = digitIdx > 0 ? price[digitIdx - 1] - 0 : 0),
            price.length - digitIdx - 1)
          ) {
            case 0:
              words.push(handle_utlc(digit, nxtDigit, ''));
              break;
            case 1:
              words.push(handle_tens(digit, price[digitIdx + 1]));
              break;
            case 2:
              words.push(
                0 !== digit
                  ? ' ' +
                      sglDigit[digit] +
                      ' Hundred' +
                      (0 !== price[digitIdx + 1] && 0 !== price[digitIdx + 2]
                        ? ' and'
                        : '')
                  : '',
              );
              break;
            case 3:
              words.push(handle_utlc(digit, nxtDigit, 'Thousand'));
              break;
            case 4:
              words.push(handle_tens(digit, price[digitIdx + 1]));
              break;
            case 5:
              words.push(handle_utlc(digit, nxtDigit, 'Lakh'));
              break;
            case 6:
              words.push(handle_tens(digit, price[digitIdx + 1]));
              break;
            case 7:
              words.push(handle_utlc(digit, nxtDigit, 'Crore'));
              break;
            case 8:
              words.push(handle_tens(digit, price[digitIdx + 1]));
              break;
            case 9:
              words.push(
                0 !== digit
                  ? ' ' +
                      sglDigit[digit] +
                      ' Hundred' +
                      (0 !== price[digitIdx + 1] || 0 !== price[digitIdx + 2]
                        ? ' and'
                        : ' Crore')
                  : '',
              );
              break;

            default:
              break;
          }
        str = words.reverse().join('');
      } else str = '';
      return str;
    }

    let getStr = price_in_words(+getNum);
    let newStr = price_in_words(+getNum1);

    if (getNum1) {
      getStr += newStr ? 'and ' + newStr + 'paise Only' : 'Only';
    } else {
      getStr += ' Only';
    }

    return getStr;
  }
  const getGst = () => {
    const getState =
      app_config_data.find((d) => d.key_name === 'address.state') || {};
    if (custs.state === getState.value) {
      return true;
    }
    return false;
  };
  const getIgst = (data) => {
    let tax = '';
    if (data.taxes) {
      data.taxes.forEach((t) => {
        if (t.tax_group === 'IGST') {
          tax = t.tax_rate;
        }
      });
    }
    return tax;
  };

  return (
    <>
      <Grid
        container
        height='100%'
        position='relative'
        display='flex'
        // bottom='50px'
        className='totalbottom'
      >
        <Grid size={12}>
          <Grid container>
            <Grid
              style={{marginTop: 10}}
              size={{
                lg: 6,
                sm: 6,
                xs: 6,
                md: 6
              }}>
              <img src={'/SP1.png'} alt='' />
            </Grid>
            <Grid
              style={{height: '230px'}}
              size={{
                lg: 6,
                sm: 6,
                xs: 6,
                md: 6
              }}>
              <p className='p' style={{fontWeight: 'bold'}}>
                {appconfig.companyName}
              </p>
              <p className='p'>{appconfig.companyAddress}</p>
              <p className='p'>Email: {appconfig.email}</p>

              <p className='p' style={{marginTop: '5px'}}>
                GSTIN: {appconfig.Gst}
              </p>
              <p className='p'>Phone: {appconfig.mobile}</p>

              {Object.keys(custs).length ? (
                <>
                  <p
                    className='p'
                    style={{marginTop: '15px', fontWeight: 'bold'}}
                  >
                    {' '}
                    {`Bill To: ${custs.company_name || custs.first_name}`}
                  </p>
                  <p className='p'>
                    {' '}
                    {` ${custs.address ? custs.address + ',' : ''} ${
                      custs.area ? custs.area + ',' : ''
                    } ${custs.city || ''}`}
                  </p>
                  <p className='p' style={{marginTop: '3px'}}>
                    {' '}
                    {` ${custs.state ? custs.state + '' : ''} ${
                      custs.zip || ''
                    }`}
                  </p>
                  <p className='p'> {`Phone: ${custs.phone_number || ''}`}</p>
                  {/* <p className="p"> {`User: ${custs.first_name || ''} ${custs.last_name || ''}`}</p> */}
                  <p className='p' style={{marginTop: '7px'}}>
                    GSTIN: {custs.tax_id || ''}
                  </p>
                </>
              ) : (
                ''
              )}
              {/* </p> */}
            </Grid>
          </Grid>
        </Grid>
        {/* <Grid size={12}>
                    <Grid container style={{ marginTop: 5 }}>
                        


                    </Grid>
                </Grid> */}
        <Grid size={12}>
          <Grid container style={{marginTop: 5}} className='b_color'>
            <Grid
              style={{alignSelf: 'flex-end'}}
              size={{
                lg: 6,
                xs: "grow"
              }}>
              <Typography
                style={{
                  color: '#36b4ff',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  fontFamily: 'sans-serif',
                }}
              >
                 {invoice || '-'}
              </Typography>
              <p className='p'>Invoice Date: {`${getDate()} ${getTime()}`} </p>
            </Grid>

            <Grid
              style={{alignSelf: 'flex-end'}}
              size={{
                lg: 6,
                sm: 6,
                xs: 6,
                md: 6
              }}>
              <div
                style={{
                  paddingLeft: 3,
                  minHeight: '40px',
                  marginTop: '10px',
                  marginBottom: '10px',
                }}
              >
                <p className='p' style={{fontWeight: 'bold'}}>
                  Note:
                </p>
                <p className='p mlr'>{state.note || ''}</p>
              </div>
            </Grid>
          </Grid>
        </Grid>
        {/* <hr className='hrcolor'></hr> */}
        <Grid size={12}>
          <Grid container>
            <Grid size={6}>
              <p style={{margin: '0 auto', textAlign: 'left'}} className='p'>
                Description
              </p>
              {/* </div> */}
            </Grid>

            <Grid size={6}>
              <Grid container>
                <Grid size="grow">
                  <p style={{height: 37, textAlign: 'left'}} className='p'>
                    Quantity
                  </p>
                </Grid>
                <Grid size="grow">
                  <p style={{height: 37, textAlign: 'left'}} className='p'>
                    UnitPrice
                  </p>
                </Grid>
                <Grid style={{textAlign: 'left'}} size="grow">
                  <p style={{height: 37, textAlign: 'left'}} className='p'>
                    Amount
                  </p>
                </Grid>
                <Grid size="grow">
                  <p style={{height: 37, textAlign: 'left'}} className='p'>
                    Taxes
                  </p>
                </Grid>
                {getGst() ? (
                  <>
                    <Grid style={{textAlign: 'right'}} size="grow">
                      <p style={{height: 37, textAlign: 'left'}} className='p'>
                        CGST
                      </p>
                    </Grid>
                    <Grid size="grow">
                      <p style={{height: 37, textAlign: 'right'}} className='p'>
                        SGST
                      </p>
                    </Grid>
                  </>
                ) : (
                  <Grid size="grow">
                    <p style={{height: 37, textAlign: 'right'}} className='p'>
                      IGST
                    </p>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>

          <Grid style={{minHeight: '350px'}} size={12}>
            <Grid container>
              {list.map((d, ind) => (
                <>
                  <Grid container className='b_dotted'>
                    <Grid style={{display: 'flex'}} size={6}>
                      <Grid container>
                        <Grid size="grow">
                          {/* <div style={{ display: 'flex' }}>
                                                <div style={{ marginTop: 8 }} className="mlr"> */}
                          <p className='p'>[{d.name}]</p>
                          <p className='product'>
                            {' '}
                            HSN/SAC: {d.hsn_code || 'No HSN'}
                          </p>
                          {d.is_serialized === 1 ? (
                            <p className='product'>
                              IMEI/Serial Number: {d.lot_number}
                            </p>
                          ) : (
                            ''
                          )}
                          {/* </div>
                                            </div> */}
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid style={{display: 'flex'}} size={6}>
                      <Grid container>
                        <Grid sx={{overflow: 'hidden', wordWrap: 'break-word'}} size="grow">
                          <p
                            className='p'
                            style={{marginTop: 8, textAlign: 'left'}}
                          >
                            {`${d.quantity || 1} NOS`}
                          </p>
                        </Grid>
                        <Grid size="grow">
                          <div
                            className='mlr'
                            style={{textAlign: 'left', marginTop: 8}}
                          >
                            <p className='p'> {d.unit_price}</p>
                            {/* <p className='p'>{`${d.quantity} NOS`}</p> */}
                            {/* <p style={{ fontSize: ".8rem" }} className='p'>{`${d.quantity} NOS`}</p> */}
                          </div>
                        </Grid>
                        <Grid style={{textAlign: 'left'}} size="grow">
                          <p className='mlr p' style={{marginTop: 8}}>
                            {`${withoutTax(d.quantity, d.unit_price).toFixed(
                              2,
                            )} ₹`}
                          </p>
                        </Grid>
                        <Grid size="grow">
                          <p
                            style={{textAlign: 'left', marginTop: 8}}
                            className='small p'
                          >
                            {`${getIgst(d)}%`}
                          </p>
                        </Grid>
                        {getGst() ? (
                          <>
                            <Grid size="grow">
                              <p
                                style={{textAlign: 'left', marginTop: 8}}
                                className='small p'
                              >
                                {`${(taxes(list) / 2).toFixed(2)} ₹`}
                              </p>
                            </Grid>
                            <Grid size="grow">
                              <p
                                style={{textAlign: 'right', marginTop: 8}}
                                className='small p'
                              >
                                {`${(taxes(list) / 2).toFixed(2)} ₹`}
                              </p>
                            </Grid>
                          </>
                        ) : (
                          <Grid size="grow">
                            <p
                              style={{textAlign: 'right', marginTop: 8}}
                              className='small p'
                            >
                              {`${taxes(list).toFixed(2)} ₹`}
                            </p>
                          </Grid>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                  {/* <hr></hr> */}
                </>
              ))}
            </Grid>
          </Grid>
        </Grid>
        <br />

        {/* <hr className='hrcolor' style={{ marginTop: 50 }}></hr> */}
        <Grid style={{height: '220px', paddingBottom: '30px'}} size={12}>
          <Grid container className='b_color_top'>
            <Grid
              size={{
                lg: 6,
                xs: 6,
                sm: 6,
                md: 6
              }}>
              <p>Terms of Delivery: </p>
              <ul className='p' style={{paddingLeft: '16px'}}>
                <li>Subject to Chennai Jurisdiction.</li>
                <li>Payment Terms : 100% against Delivery.</li>
                <li>Warranty subject to company norms only.</li>
              </ul>
            </Grid>
            <Grid
              size={{
                lg: 6,
                xs: 6,
                sm: 6,
                md: 6
              }}>
              <div
                style={{display: 'flex', marginTop: '5px'}}
                className='p_bold b_dotted'
              >
                <p className='p_bold'>Subtotal </p>
                <p style={{marginLeft: 'auto'}} className='p_bold'>
                  {`${totalCost(list).toFixed(2)} ₹`}
                </p>
              </div>
              {getGst() ? (
                <>
                  <div style={{display: 'flex'}} className='p_bold b_dotted'>
                    <p className='p_bold '>
                      CGST on {`${totalCost(list).toFixed(2)} ₹`}{' '}
                    </p>
                    <p style={{marginLeft: 'auto'}} className='p_bold'>
                      {`${(taxes(list) / 2).toFixed(2)} ₹`}
                    </p>
                  </div>
                  <div style={{display: 'flex'}} className='p_bold b_dotted'>
                    <p className='p_bold '>
                      SGST on {`${totalCost(list).toFixed(2)} ₹`}
                    </p>
                    <p style={{marginLeft: 'auto'}} className='p_bold'>
                      {`${(taxes(list) / 2).toFixed(2)} ₹`}
                    </p>
                  </div>
                </>
              ) : (
                <div style={{display: 'flex'}} className='p_bold b_dotted'>
                  <p className='p_bold '>
                    IGST on {`${totalCost(list).toFixed(2)} ₹`}
                  </p>
                  <p style={{marginLeft: 'auto'}} className='p_bold'>
                    {`${taxes(list).toFixed(2)} ₹`}
                  </p>
                </div>
              )}
              <div style={{display: 'flex'}} className='p_bold b_dotted'>
                <p className='p_bold '>Total</p>
                <p style={{marginLeft: 'auto'}} className='p_bold'>
                  {`${(taxes(list) + totalCost(list)).toFixed(2)} ₹`}
                </p>
              </div>

              {/* <p className='p'>Total in words {`INR ${inWords((totalCost()+taxes()).toFixed(2))}`}</p> */}
            </Grid>
            <Grid
              style={{marginTop: 20}}
              size={{
                lg: 12,
                xs: "grow"
              }}>
              <div style={{display: 'flex'}}>
                <p className='p' style={{color: '#36b4ff'}}>
                  Total (in words):
                </p>
                <p className='p plr'>
                  {' '}
                  {`INR ${inWords((totalCost(list) + taxes(list)).toFixed(2))}`}
                </p>
              </div>
            </Grid>
          </Grid>
        </Grid>
        {/* <Grid size={12}>
                   
                </Grid> */}
        {/* <hr /> */}
        <br />
        <br />
        <Grid sx={{marginTop: 'auto'}} className='footer' size={12}>
          <Grid
            container
            direction='row'
            justifyContent='flex-end'
            alignItems='flex-end'
            marginTop={5}
            className='b_bottom'
          >
            <Grid
              size={{
                lg: 5,
                xs: 6,
                sm: 6,
                md: 6
              }}>
              <p className='p' style={{fontWeight: 'bold', textAlign: 'left'}}>
                Customer Signature
              </p>
            </Grid>
            <Grid
              size={{
                lg: 7,
                xs: 6,
                sm: 6,
                md: 6
              }}>
              <p className='p' style={{fontWeight: 'bold', textAlign: 'right'}}>
                {appconfig.companyName}
              </p>
            </Grid>
          </Grid>
          <Grid
            container
            direction='row'
            justifyContent='flex-start'
            alignItems='flex-end'
          >
            <Grid size="grow">
              <p className='p'>Phone:{appconfig.mobile}</p>
            </Grid>
            <Grid size="grow">
              <p className='p'>Email:{appconfig.email}</p>
            </Grid>
            <Grid size="grow">
              <p className='p'>Web:{appconfig.web}</p>
            </Grid>
            <Grid size="grow">
              <p className='p'>GSTIN:{appconfig.Gst}</p>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
