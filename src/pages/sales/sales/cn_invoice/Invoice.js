import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import '../styles.css';
import { useSelector } from 'react-redux';
import { BorderTop } from '@mui/icons-material';
// import { getAppConfigDataAction } from '../../redux/actions/app_config_actions';
// import { set } from 'lodash';
// import CreateNewButtonContext from '../../context/CreateNewButtonContext';

export default function App({
  custData,
  invoice,
  soDate,
  sales_items,
  custType,
  note,
  appConfigData,
  posSale,
  sales_payments,
  manualnote
}) {
  console.log("soDate",soDate)
  // const dispatch = useDispatch();
  const {
    appConfigReducer: { app_config_data },
  } = useSelector((state) => state);
  const [uniqueData, setuniqueData] = useState([]);
  const [tcstaxvisible, setTcstaxvisible] = useState(false)
  //  const [companyName,setCompanyName] = useState('')
  //  const [fullAddress,setFullAddress] = useState('')
  //  const [companyEmail,setEmail] = useState ('')

  const { companyName, companyAddress, companyEmail, gstin, companyMobile } =
    appConfigData || {};
  //  const { setLoaderStatusHandler } = useContext(CreateNewButtonContext)

  useEffect(() => {
    if (custData?.tcs === 1) {
      setTcstaxvisible(true)
    } else {
      setTcstaxvisible(false)
    }
  })
console.log(manualnote,"manualnote")
  const taxes = () => {
    let total = 0;
    for (let data of sales_items) {
      // let arr = [];
      // if(data.item_unit_price){
      //     arr.push(data.item_unit_price)
      // }
      // if(data.quantity){
      //     arr.push(data.quantity)
      // }else{
      //   arr.push(1)
      // }
      // if (data.taxes) {
      //   data.taxes.forEach((t) => {
      //     if (t.tax_group === "IGST") {
      //       arr.push(t.tax_rate);
      //     }
      //   });
      // }
      const prc =
        custType === 'CUSTOMER' ? data.item_unit_price : data.item_cost_price;
      const qty =  manualnote === undefined ?`${data.quantity}` : `${data.return_quantity}` || 1;
      const tax = getIgst(data);
      total += ((prc * qty) / 100) * tax;
    }
    return total ? total : 0;
  };
  const tcstaxes = () => {
    let total = 0;
    if (tcstaxvisible === false) {
      return total;
    } else {
      for (let data of sales_items) {
        // let arr = [];
        // if(data.item_unit_price){
        //     arr.push(data.item_unit_price)
        // }
        // if(data.quantity){
        //     arr.push(data.quantity)
        // }else{
        //   arr.push(1)
        // }
        // if (data.taxes) {
        //   data.taxes.forEach((t) => {
        //     if (t.tax_group === "IGST") {
        //       arr.push(t.tax_rate);
        //     }
        //   });
        // }
        const prc =
          custType === 'CUSTOMER' ? data.item_unit_price : data.item_cost_price;
        const qty =  manualnote === undefined ? data.quantity  : data.return_quantity|| 1;
        const tax = getTcs(data);
        total += ((prc * qty) / 100) * tax;
      }
      return total ? total : 0;
    }
  };

  const totalCost = () => {
    let total = 0;
    if(sales_items.length > 0){
    sales_items.forEach((d) => {
      const prc =
        custType === 'CUSTOMER' ? d.item_unit_price : d.item_cost_price;
      total += (manualnote === undefined ? d.quantity  : d.return_quantity || 1) * prc;
    });
    return total;
   }
  if(sales_items.length === 0 && manualnote !== undefined){
    let  total =  manualnote.amount || 0
    return total;
  }
  };

  const withoutTax = (qty, cost) => {
    const val = (qty || 1) * cost;
    return val;
  };

  const taxOnly = (qty, cost, tax) => {
    const val = (qty || 1) * cost;
    const taxval = (val / 100) * tax;
    return taxval;
  };
  const totalQuantity = () => {
    let total = 0;
    sales_items.forEach((d) => {
      manualnote === undefined ?
      total += +d.quantity : total += +d.return_quantity  ;
    });
    return total;
  };

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

  const groupTaxes = (tax_rate, tax_category) => {
    let total = 0;
    for (let data of sales_items) {
      // let arr = [];
      if (data.taxes[0]?.tax_category === tax_category) {
        // for (let d in data) {
        //   if (["item_unit_price", "quantity"].includes(d)) {
        //     arr.push(Number(data[d]));
        //   }
        // }
        const prc =
          custType === 'CUSTOMER' ? data.item_unit_price : data.item_cost_price;
        const qty = manualnote === undefined ? data.quantity  : data.return_quantity|| 1;
        total += ((prc * qty) / 100) * tax_rate;
      }
    }
    return total ? total.toFixed(2) : 0;
  };

  useEffect(() => {
    const getData = sales_items.map((d) => d.taxes || []);
    const uniqueAddresses = Array.from(
      new Set(getData.map((a) => a[0]?.tax_category)),
    ).map((name) => {
      return getData.find((a) => a[0]?.tax_category === name);
    });
    setuniqueData(uniqueAddresses);
  }, [sales_items]);

  // useEffect(()=>dispatch(getAppConfigDataAction(setLoaderStatusHandler)),[])

  //   useEffect(()=>{
  //   const companyName = app_config_data.filter(f=>f.key_name =='company.name')
  //   const fullAddress = app_config_data.filter(f=>f.key_name =='address.fulladdress')
  //   const emailData = app_config_data.filter(f=>f.key_name =='company.email')

  //   setCompanyName(companyName.length>0?companyName[0].value:'')
  //   setFullAddress(fullAddress.length>0?fullAddress[0].value:'')
  //   setEmail(emailData.length>0?emailData[0].value:'')
  //   },[app_config_data])

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
  const getTcs = (data) => {
    let tax = '';
    if (data.taxes) {
      data.taxes.forEach((t) => {
        if (t.tax_group === 'TCS') {
          tax = t.tax_rate;
        }
      });
    }
    return tax;
  };

  console.log('sales_items', sales_items)

  return (
    <>
      <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", lineHeight:2,fontSize:'15px',fontFamily: 'Poppins, sans-serif'}}>
      <p style={{ marginTop: 0 }} className='t_center p'>
              {posSale === true
                ? 'Tax Invoice'
                : custType === 'CUSTOMER'
                  ? 'Credit Note'
                  : 'Debit Note'}
            </p>
            <div style={{ display: 'flex' }}>
              <div
              className='tab_screen3'
                style={{
                  border: '1px solid black',
                  width: '100%',
                  height: '100%',
                  
                  lineHeight: 1.2,
                  fontSize:'12px'
                }}
              >
                <Grid container>
                  <Grid style={{ marginBottom: 5 }} size={7}>
                    {custType === 'CUSTOMER' ? (
                      // {/* {posSale != true ?  */}
                      (<>
                        <div style={{ paddingLeft: 3}}>
                          <p className='p' style={{fontSize:'16px'}}><strong>{companyName}</strong></p>
                          <p className='p'>{companyAddress}</p>
                          <p className='p'>{`E-Mail: ${companyEmail}`}</p>
                          <p className='p'>
                            {companyMobile ? `Contact No. : ${companyMobile}` : ''}{' '}
                          </p>
                          <p className='p'>{gstin ? `GSTIN/UIN : ${gstin}` : ''} </p>
                        </div>
                        <div className='hr_1' />
                        <div style={{ paddingLeft: 3 }}>
                          {custData ? (
                            <>
                              <p className='p'>
                                {posSale === true ? 'To,' : 'Consignee'}
                              </p>
                              <p className='p' style={{fontSize:'16px'}}><strong>{`${custData.company_name || custData.first_name
                                }`}</strong></p>
                              <p className='p'>{`${custData.address ? custData.address + ',' : ''
                                } ${custData.area ? custData.area + ',' : ''} ${custData.city || ''
                                }`}</p>
                              <p className='p'>{`${custData.state ? custData.state + ',' : ''
                                } ${custData.zip || ''}`}</p>
                              <p className='p'>{`E-Mail: ${custData.email || ''}`}</p>
                              <p className='p'>{`GSTIN/UIN : ${custData.tax_id || ''
                                }`}</p>
                            </>
                          ) : (
                            ''
                          )}
                        </div>
                        {posSale === true && (
                          <>
                            <div className='hr_1' />
                            <div style={{ paddingLeft: 3, minHeight: 85 }}>
                              <p className='p'>Other Info:</p>
                              <p className='p mlr'>{note || ''}</p>
                            </div>
                          </>
                        )}
                      </>)
                    ) : (
                      <>
                        <div style={{ paddingLeft: 3 }}>
                          {custData ? (
                            <>
                              <p className='p' style={{fontSize:'16px'}}><strong>{`${custData.company_name || custData.first_name
                                }`}</strong></p>
                              <p className='p'>{`${custData.address ? custData.address + ',' : ''
                                } ${custData.area ? custData.area + ',' : ''} ${custData.city || ''
                                }`}</p>
                              <p className='p'>{`${custData.state ? custData.state + ',' : ''
                                } ${custData.zip || ''}`}</p>
                              <p className='p'>{`E-Mail: ${custData.email || ''}`}</p>
                              <p className='p'>{`GSTIN/UIN : ${custData.tax_id || ''
                                }`}</p>
                            </>
                          ) : (
                            ''
                          )}
                        </div>
                        <div className='hr_1' />
                        <div style={{ paddingLeft: 3}}>
                          <p className='p'>Consignee</p>
                          <p className='p' style={{fontSize:'16px'}}><strong>{companyName}</strong></p>
                          <p className='p'>{companyAddress}</p>
                          <p className='p'>{`E-Mail: ${companyEmail}`}</p>
                          <p className='p'>
                            {companyMobile ? `Contact No. : ${companyMobile}` : ''}{' '}
                          </p>
                          <p className='p'>{gstin ? `GSTIN/UIN : ${gstin}` : ''} </p>
                        </div>
                      </>
                      
                    )}
                    <>
                        <div className='hr_1' />
                        <div style={{ paddingLeft: 3 }}>
                          <p className='p'>Billto</p>
                          <>
                              <p className='p' style={{fontSize:'16px'}}><strong>{`${custData.company_name || custData.first_name
                                }`}</strong></p>
                              <p className='p'>{`${custData.address ? custData.address + ',' : ''
                                } ${custData.area ? custData.area + ',' : ''} ${custData.city || ''
                                }`}</p>
                              <p className='p'>{`${custData.state ? custData.state + ',' : ''
                                } ${custData.zip || ''}`}</p>
                              <p className='p'>{`E-Mail: ${custData.email || ''}`}</p>
                              <p className='p'>{`GSTIN/UIN : ${custData.tax_id || ''
                                }`}</p>
                            </>
                        </div>
                      </>
                  </Grid>
                  <Grid style={{ borderLeft: '1px solid black' }} size={5}>
                    <Grid container>
                      {posSale === true ? (
                        <>
                          <Grid style={{ borderRight: '1px solid black' }} size={6}>
                            <div className='invoice'>
                              <p className='p'>
                                {custType === 'CUSTOMER' ? 'CN No.' : 'DB No.'}
                              </p>
                              <p
                                className='p'
                                style={{ visibility: invoice ? 'visible' : 'hidden',fontSize:'16px' }}
                              >
                                <strong>{invoice || '-'}</strong>
                              </p>
                            </div>
                            <div className='invoice'>
                              <p className='p'></p>
                              <p className='p' style={{ visibility: 'hidden' }}>
                                -
                              </p>
                            </div>
                            <div className='invoice'>
                              <p className='p'>Dispatch Document No.</p>
                              <p className='p' style={{ visibility: 'hidden' }}>
                                -
                              </p>
                            </div>
                            <div className='invoice'>
                              <p className='p'>Dispatched through</p>
                              <p className='p' style={{ visibility: 'hidden' }}>
                                -
                              </p>
                            </div>
                          </Grid>
                          <Grid size={6}>
                            <div className='invoice'>
                              <p className='p'>Date</p>
                              <p className='p' style={{fontSize:'16px'}}>
                              <strong>{soDate || new Date().toDateString()}</strong>
                              </p>
                            </div>
                            <div className='invoice'>
                              <p className='p'>Mode/Terms of Payment</p>
                              <p
                                className='p'
                                style={{
                                  visibility: sales_payments ? 'visible' : 'hidden',
                                }}
                              >
                                <strong>{sales_payments ? sales_payments : '-'}</strong>
                              </p>
                            </div>
                            <div className='invoice'>
                              <p className='p'>Delivery Note Date</p>
                              <p className='p' style={{ visibility: 'hidden' }}>
                                -
                              </p>
                            </div>
                            <div className='invoice'>
                              <p className='p'>Destination</p>
                              <p className='p' style={{ visibility: 'hidden' }}>
                                -
                              </p>
                            </div>
                          </Grid>
                          <Grid style={{marginTop:'3px'}} size={12}>
                            <div className='invoice_1' style={{borderTop:'1px solid black'}}>
                              <p className='p'>Terms of Delivery</p>
                              <ul className='p'>
                                <li>Subject to Chennai Jurisdiction.</li>
                                <li>Payment Terms : 100% against Delivery.</li>
                                <li>Warranty subject to company norms only.</li>
                              </ul>
                            </div>
                          </Grid>
                        </>
                      ) : (
                        <>
                          <Grid style={{ borderRight: '1px solid black' }} size={6}>
                            <div className='invoice'>
                              <p className='p'>
                                {custType === 'CUSTOMER' ? 'CN No.' : 'DB No.'}
                              </p>
                              <p
                                className='p'
                                style={{ visibility: invoice ? 'visible' : 'hidden',fontSize:'16px' }}
                              >
                                <strong>{invoice || '-'}</strong>
                              </p>
                            </div>
                            <div className='invoice'>
                              <p className='p'></p>
                              <p className='p' style={{ visibility: 'hidden' }}>
                                -
                              </p>
                            </div>
                            <div className='invoice'>
                              <p className='p'>Original Invoice No. & Date</p>
                              <p className='p' style={{ visibility: 'hidden' }}>
                                -
                              </p>
                            </div>
                            <div className='invoice'>
                              <p className='p'>Buyer's Order No.</p>
                              <p className='p' style={{ visibility: 'hidden' }}>
                                -
                              </p>
                            </div>
                            <div className='invoice'>
                              <p className='p'>Dispatch Document No.</p>
                              <p className='p' style={{ visibility: 'hidden' }}>
                                -
                              </p>
                            </div>
                            <div style={{ paddingLeft: '3px' }}>
                              <p className='p'>Dispatched through</p>
                              <p className='p' style={{ visibility: 'hidden' }}>
                                -
                              </p>
                            </div>
                          </Grid>
                          <Grid size={6}>
                            <div className='invoice'>
                              <p className='p'>Date</p>
                              <p className='p' style={{fontSize:'16px'}}>
                              <strong>{soDate || new Date().toDateString()}</strong>
                              </p>
                            </div>
                            <div className='invoice'>
                              <p className='p'>Mode/Terms of Payment</p>
                              <p
                                className='p'
                                style={{
                                  visibility: sales_payments ? 'visible' : 'hidden',
                                }}
                              >
                                {sales_payments ? sales_payments : '-'}
                              </p>
                            </div>
                            <div className='invoice'>
                              <p className='p'>Other Reference(s)</p>
                              <p className='p' style={{ visibility: 'hidden' }}>
                                -
                              </p>
                            </div>
                            <div className='invoice'>
                              <p className='p'>Date</p>
                              <p className='p' style={{ visibility: 'hidden' }}>
                                -
                              </p>
                            </div>
                            <div className='invoice'>
                              <p className='p'></p>
                              <p className='p' style={{ visibility: 'hidden' }}>
                                -
                              </p>
                            </div>
                            <div style={{ paddingLeft: '3px' }}>
                              <p className='p'>Destination</p>
                              <p className='p' style={{ visibility: 'hidden' }}>
                                -
                              </p>
                            </div>
                          </Grid>
                          <Grid mt='3px' style={{borderTop:'1px solid black'}} size={12}>
                            <div className='invoice_1' >
                              <p className='p'>Terms of Delivery</p>
                              <ul className='p'>
                                <li>Subject to Chennai Jurisdiction.</li>
                                <li>Payment Terms : 100% against Delivery.</li>
                                <li>Warranty subject to company norms only.</li>
                              </ul>
                            </div>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Grid>

                  <Grid className='b_top' size={7}>
                    <div style={{ display: 'flex', height: 37 }} className='b_bottom'>
                      <div className='b_right'>
                        <p className='p' style={{ width: 24 }}>
                          Sl
                        </p>
                        <p className='p'>No.</p>
                      </div>
                      <p style={{ margin: '0 auto' }} className='p'>
                       Particulars
                      </p>
                    </div>
                  </Grid>

                  <Grid className='b_top ' size={5}>
                    <Grid container>
                      <Grid className='b_right b_left' size="grow">
                        <p
                          style={{ height: 37, textAlign: 'center' }}
                          className=' b_bottom p'
                        >
                          HSN/SAC
                        </p>
                      </Grid>
                      <Grid className='b_right' size="grow">
                        <p
                          style={{ height: 37, textAlign: 'center' }}
                          className=' b_bottom p'
                        >
                          Quantity
                        </p>
                      </Grid>
                      <Grid className='b_right' style={{ textAlign: 'end' }} size="grow">
                        <p
                          style={{ height: 37, textAlign: 'center' }}
                          className=' b_bottom p'
                        >
                          Rate
                        </p>
                      </Grid>
                      <Grid className='b_right' size={1}>
                        <p
                          style={{ height: 37, textAlign: 'center' }}
                          className=' b_bottom p'
                        >
                          per
                        </p>
                      </Grid>
                      <Grid style={{ textAlign: 'right' }} size={3}>
                        <p
                          style={{ height: 37, textAlign: 'center' }}
                          className='b_bottom p'
                        >
                          Amount
                        </p>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid size={12}>
                    <Grid container>
                      
                      {sales_items.length > 0 ? sales_items.map((d, ind) => (
                        <>
                          <Grid style={{ display: 'flex' }} key={d} size={7}>
                            <Grid container>
                              <Grid
                                className='b_right'
                                style={{
                                  width: 25,
                                  textAlign: 'center',
                                }}>
                                <div style={{ marginTop: 8 }}>
                                  <p className='p'>{ind + 1}</p>
                                </div>
                              </Grid>
                              <Grid size="grow">
                                <div style={{ display: 'flex' }}>
                                  <div style={{ marginTop: 8 }} className='mlr'>
                                    <p className='p' style={{fontSize:'16px'}}><strong>{d.name}</strong></p>
                                    {d.is_serialized === 1 ? (
                                  <p className='product'><strong>
                                    IMEI/Serial Number: {d?.lots?.map((d)=> d.lot_number).join(' ')}
                                    </strong></p>
                                ) : (
                                  ''
                                )}
                                    {/* <p className='p'>Batch : 3355590463199447</p> */}
                                  </div>
                                </div>
                              </Grid>
                            </Grid>
                          </Grid>

                          <Grid style={{ display: 'flex' }} size={5}>
                            <Grid container>
                              <Grid
                                sx={{ overflow: 'hidden', wordWrap: 'break-word' }}
                                className='b_right b_left'
                                size="grow">
                                <p
                                  className='p'
                                  style={{ marginTop: 8, textAlign: 'center' }}
                                >
                                  {d.hsn_code || ''}
                                </p>
                              </Grid>
                              <Grid className='b_right' size="grow">
                                <div
                                  className='mlr'
                                  style={{ textAlign: 'end', marginTop: 8 }}
                                >
                                  <p className='p'><strong>{manualnote === undefined ?`${d.quantity} NOS` : `${d.return_quantity} NOS`}</strong></p>
                                  {/* <p style={{ fontSize: ".8rem" }} className='p'>{`${d.quantity} NOS`}</p> */}
                                </div>
                              </Grid>
                              <Grid className='b_right' style={{ textAlign: 'end' }} size="grow">
                                <p className='mlr p' style={{ marginTop: 8 }}><strong>
                                  {withoutTax(
                                    1,
                                    custType === 'CUSTOMER'
                                      ? d.item_unit_price
                                      : d.item_cost_price,
                                  ).toFixed(2)}</strong>
                                </p>
                              </Grid>
                              <Grid className='b_right' size={1}>
                                <p
                                  style={{ textAlign: 'center', marginTop: 8 }}
                                  className='small p'
                                >
                                  NOS
                                </p>
                              </Grid>
                              <Grid style={{ textAlign: 'right' }} size={3}>
                                <p style={{ marginTop: 8 }} className='mlr p'><strong>
                                  { withoutTax(
                                    manualnote === undefined ?`${d.quantity}` : `${d.return_quantity}`,
                                    custType === 'CUSTOMER'
                                      ? d.item_unit_price
                                      : d.item_cost_price,
                                  ).toFixed(2)}</strong>
                                </p>
                              </Grid>
                            </Grid>
                          </Grid>
                        </>
                      )) : sales_items.length === 0 && manualnote !==undefined &&  <>
                      <Grid style={{ display: 'flex' }} size={7}>
                        <Grid container>
                          <Grid
                            className='b_right'
                            style={{
                              width: 25,
                              textAlign: 'center',
                            }}>
                            <div style={{ marginTop: 8 }}>
                              <p className='p'>{1}</p>
                            </div>
                          </Grid>
                          <Grid size="grow">
                            <div style={{ display: 'flex' }}>
                              <div style={{ marginTop: 8 }} className='mlr'>
                                <p className='p'>{''}</p>
                                <p className='p'> <strong>{manualnote?.name}{manualnote?.lot_number}</strong></p>
                               
                                {/* <p className='p'>Batch : 3355590463199447</p> */}
                              </div>
                            </div>
                          </Grid>
                        </Grid>
                      </Grid>

                      <Grid style={{ display: 'flex' }} size={5}>
                        <Grid container>
                          <Grid
                            sx={{ overflow: 'hidden', wordWrap: 'break-word' }}
                            className='b_right b_left'
                            size="grow">
                            <p
                              className='p'
                              style={{ marginTop: 8, textAlign: 'center' }}
                            >
                              <strong>{manualnote.hsn_code}</strong>
                            </p>
                          </Grid>
                          <Grid className='b_right' size="grow">
                            <div
                              className='mlr'
                              style={{ textAlign: 'end', marginTop: 8 }}
                            >
                              <p className='p'>{''}</p>
                              {/* <p style={{ fontSize: ".8rem" }} className='p'>{`${d.quantity} NOS`}</p> */}
                            </div>
                          </Grid>
                          <Grid className='b_right' style={{ textAlign: 'end' }} size="grow">
                            <p className='mlr p' style={{ marginTop: 8 }}>
                             {''}
                            </p>
                          </Grid>
                          <Grid className='b_right' size={1}>
                            <p
                              style={{ textAlign: 'center', marginTop: 8 }}
                              className='small p'
                            >
                              {''}
                            </p>
                          </Grid>
                          <Grid style={{ textAlign: 'right' }} size={3}>
                            <p style={{ marginTop: 8 }} className='mlr p'>
                            <strong>{manualnote.amount.toFixed(2)}</strong>
                            </p>
                          </Grid>
                        </Grid>
                      </Grid>
                    </> }
                    </Grid>
                  </Grid>

                  <Grid sx={{minHeight:'320px'}} size={7}>
                    <div style={{ display: 'flex' }}>
                      <div className='b_right' style={{minHeight:'320px'}}>
                        <p
                          className='p'
                          style={{
                            width: 24,
                          }}
                        ></p>
                      </div>
                      <div style={{ marginTop: 37 }}>
                        <p className='p mlr'></p>
                      </div>
                    </div>
                  </Grid>
                  <Grid style={{ display: 'flex' }} size={5}>
                    <Grid container>
                      <Grid className='b_right b_left' size="grow"></Grid>
                      <Grid className='b_right' size="grow"></Grid>
                      <Grid className='b_right' size="grow"></Grid>
                      <Grid className='b_right' size={1}></Grid>
                      <Grid size={3}></Grid>
                    </Grid>
                  </Grid>

                  {uniqueData.map((d) => (
                    <>
                      <Grid key={d} size={7}>
                        <div style={{ display: 'flex' }}>
                          <div className='b_right'>
                            <p
                              className='p'
                              style={{
                                width: 24,
                              }}
                            ></p>
                          </div>
                          <div style={{ display: 'flex', width: '100%' }}>
                            <div
                              style={{
                                marginLeft: 'auto',
                                textAlign: 'end',
                                marginBottom: 10,
                              }}
                            >
                              <div className='mlr' style={{fontWeight:'bold'}}>
                                <p className='p'>{`CGST ${getIgst({ taxes: d }) / 2
                                  }%`}</p>
                                <p className='p'>{`SGST ${getIgst({ taxes: d }) / 2
                                  }%`}</p>
                                <p className='p'>{`TCS ${getTcs({ taxes: d }) 
                                  }%`}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Grid>
                      <Grid style={{ display: 'flex' }} size={5}>
                        <Grid container>
                          <Grid className='b_right b_left' size="grow"></Grid>
                          <Grid className='b_right' size="grow"></Grid>
                          <Grid
                            className='b_right'
                            style={{ textAlign: 'end',fontWeight:'bold' }}
                            size="grow">
                            <div className='mlr'>
                              <p className='p'>{getIgst({ taxes: d }) / 2}</p>
                              <p className='p'>{getIgst({ taxes: d }) / 2}</p>
                              <p className='p'>{getTcs({ taxes: d }) / 2}</p>
                            </div>
                          </Grid>
                          <Grid className='b_right' size={1}>
                            <div className='mlr' style={{fontWeight:'bold'}}>
                              <p className='p'>%</p>
                              <p className='p'>%</p>
                              <p className='p'>%</p>
                            </div>
                          </Grid>
                          <Grid style={{ textAlign: 'right',fontWeight:'bold' }} size={3}>
                            <div className='mlr'>
                              <p className='p'>
                                {groupTaxes(
                                  getIgst({ taxes: d }) / 2,
                                  d[0]?.tax_category,
                                )}
                              </p>
                              <p className='p'>
                                {groupTaxes(
                                  getIgst({ taxes: d }) / 2,
                                  d[0]?.tax_category,
                                )}
                              </p>
                              <p className='p'>
                                {groupTaxes(
                                  getTcs({ taxes: d }),
                                  d[3]?.tax_category,
                                )}
                              </p>
                            </div>
                          </Grid>
                        </Grid>
                      </Grid>
                    </>
                  ))}

                  {/* <Grid size={7}>
                    <div style={{ display: 'flex' }}>
                      <div className='b_right'>
                        <p
                          className='p'
                          style={{
                            width: 24,
                          }}
                        ></p>
                      </div>
                      <div style={{ display: 'flex', width: '100%' }}>
                        <p style={{ marginTop: 'auto' }} className='mlr p'>
                          Less :
                        </p>
                        <div style={{ marginLeft: 'auto', textAlign: 'end' }}>
                          <div className='mlr '>
                            <p className='p'>Round Off</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Grid>
                  <Grid size={5}>
                    <Grid container>
                      <Grid size={true} className='b_right b_left'></Grid>
                      <Grid size={true} className='b_right'></Grid>
                      <Grid size={true} className='b_right'></Grid>
                      <Grid size={1} className='b_right'></Grid>
                      <Grid size={3} style={{ textAlign: 'right' }}>
                        <div className='mlr'>
                          <p className='p'>(-)0.01</p>
                        </div>
                      </Grid>
                    </Grid>
                  </Grid> */}

                  <Grid size={7}>
                    <div className='b_top b_bottom' style={{ display: 'flex' }}>
                      <p className='b_right p' style={{ width: 25, height: 24 }}></p>
                      <p style={{ marginLeft: 'auto',fontWeight:'bold' }} className='mlr p'>
                        Total
                      </p>
                    </div>
                  </Grid>
                  <Grid size={5}>
                    <Grid
                      container
                      className='b_top b_bottom'
                      style={{ textAlign: 'right' }}
                    >
                      <Grid className='b_right b_left' size="grow">
                        <p style={{ width: 67.59 }} className='p'></p>
                      </Grid>
                      <Grid className=' b_right' size="grow">
                        <p className='mlr p'><strong>{`${totalQuantity()} NOS`}</strong></p>
                      </Grid>
                      <Grid className='b_right ' size="grow"></Grid>
                      <Grid className='b_right' size={1}></Grid>
                      <Grid size={3}>
                        <p style={{ height: 24 }} className='mlr p'>
                        <strong>{`₹ ${(totalCost() + taxes()+ tcstaxes()).toFixed(2)}`}</strong>
                        </p>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid className='b_bottom' size={12}>
                    <div style={{ display: 'flex' }}>
                      <p className='p plr'>Amount Chargeable (in words)</p>
                      <p style={{ marginLeft: 'auto' }} className='p plr'>
                        E. & O.E
                      </p>
                    </div>
                    <p className='p plr'><strong>{`INR ${inWords(
                      (totalCost() + taxes() + tcstaxes()).toFixed(2),
                    )}`}</strong></p>
                  </Grid>

                  <Grid size={12}>
                    <Grid container className=''>
                      <Grid className='b_right' size={3}>
                        <p className='b_bottom t_center p' style={{ height: '100%' }}>
                          HSN/SAC
                        </p>
                      </Grid>
                      <Grid size={9}>
                        <Grid container>
                          <Grid className='b_right' size="grow">
                            <div
                              className='b_bottom'
                              style={{ textAlign: 'center', height: '100%' }}
                            >
                              <p className='p'>Taxable</p>
                              <p className='p'>Value</p>
                            </div>
                          </Grid>
                          <Grid style={{ width: 115 }} className='b_right t_center'>
                            <p className='p'>Central Tax</p>
                            <Grid container className='b_top'>
                              <Grid className='b_right' size={5}>
                                <p className='p b_bottom'>Rate</p>
                              </Grid>
                              <Grid size={7}>
                                <p className='p b_bottom'>Amount</p>
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid style={{ width: 115 }} className='b_right t_center'>
                            <p className='p'>State Tax</p>
                            <Grid container className='b_top'>
                              <Grid className='b_right' size={5}>
                                <p className='b_bottom p'>Rate</p>
                              </Grid>
                              <Grid size={7}>
                                <p className='b_bottom p'>Amount</p>
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid style={{ width: 115 }} className='b_right t_center'>
                            <p className='p'>Tcs Tax</p>
                            <Grid container className='b_top'>
                              <Grid className='b_right' size={5}>
                                <p className='p b_bottom'>Rate</p>
                              </Grid>
                              <Grid size={7}>
                                <p className='p b_bottom'>Amount</p>
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid size="grow">
                            <div
                              className='b_bottom'
                              style={{ height: '100%', textAlign: 'center' }}
                            >
                              <p className='p'>Total</p>
                              <p className='p'>Tax Amount</p>
                            </div>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>

                  {sales_items.map((d) => (
                    <>
                      <Grid key={d} size={12}>
                        <Grid container className=''>
                          <Grid className='b_right' size={3}>
                            <p className='b_bottom plr p'>{d.hsn_code || 'no hsn'}</p>
                          </Grid>
                          <Grid size={9}>
                            <Grid container>
                              <Grid className='b_right' size="grow">
                                <p className='b_bottom t_right plr p'>
                                <strong>{withoutTax(
                                     manualnote === undefined ?`${d.quantity}` : `${d.return_quantity}`,
                                    custType === 'CUSTOMER'
                                      ? d.item_unit_price
                                      : d.item_cost_price,
                                  ).toFixed(2)}</strong>
                                </p>
                              </Grid>
                              <Grid style={{ width: 115 }} className='b_right t_center'>
                                <Grid container className=''>
                                  <Grid className='b_right' size={5}>
                                    <p className='p b_bottom t_right plr'><strong>{`${getIgst(d) / 2
                                      }%`}</strong></p>
                                  </Grid>
                                  <Grid size={7}>
                                    <p className='p b_bottom t_right plr'>
                                    <strong>{taxOnly(
                                        manualnote === undefined ?`${d.quantity}` : `${d.return_quantity}`,
                                        custType === 'CUSTOMER'
                                          ? d.item_unit_price
                                          : d.item_cost_price,
                                        getIgst(d) / 2,
                                      ).toFixed(2)}</strong>
                                    </p>
                                  </Grid>
                                </Grid>
                              </Grid>
                              <Grid style={{ width: 115 }} className='b_right t_center'>
                                <Grid container>
                                  <Grid className='b_right' size={5}>
                                    <p className='b_bottom t_right plr p'><strong>{`${getIgst(d) / 2
                                      }%`}</strong></p>
                                  </Grid>
                                  <Grid size={7}>
                                    <p className='b_bottom t_right plr p'>
                                    <strong>{taxOnly(
                                         manualnote === undefined ?`${d.quantity}` : `${d.return_quantity}`,
                                        custType === 'CUSTOMER'
                                          ? d.item_unit_price
                                          : d.item_cost_price,
                                        getIgst(d) / 2,
                                      ).toFixed(2)}</strong>
                                    </p>
                                  </Grid>
                                </Grid>
                              </Grid>
                              <Grid style={{ width: 115 }} className='b_right t_center'>
                                <Grid container>
                                  <Grid className='b_right' size={5}>
                                    <p className='b_bottom t_right plr p'><strong>{`${getTcs(d)
                                      }%`}</strong></p>
                                  </Grid>
                                  <Grid size={7}>
                                    <p className='b_bottom t_right plr p'>
                                    <strong>{taxOnly(
                                       manualnote === undefined ?`${d.quantity}` : `${d.return_quantity}`,
                                        custType === 'CUSTOMER'
                                          ? d.item_unit_price
                                          : d.item_cost_price,
                                        getTcs(d),
                                      ).toFixed(2)}</strong>
                                    </p>
                                  </Grid>
                                </Grid>
                              </Grid>
                              
                              <Grid size="grow">
                                <p className='b_bottom t_right plr p'>
                                <strong>{(taxOnly(
                                    manualnote === undefined ?`${d.quantity}` : `${d.return_quantity}`,
                                    custType === 'CUSTOMER'
                                      ? d.item_unit_price
                                      : d.item_cost_price,
                                    getIgst(d),
                                  )+ taxOnly(
                                    manualnote === undefined ?`${d.quantity}` : `${d.return_quantity}`,
                                    custType === 'CUSTOMER'
                                      ? d.item_unit_price
                                      : d.item_cost_price,
                                    getTcs(d),
                                  )).toFixed(2)}</strong>
                                </p>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </>
                  ))}

      {manualnote ? (
        <Grid size={12}>
        <Grid container className='b_bottom'>
          <Grid className='b_right' size={3}>
            <p className='t_right mlr p'>Total</p>
          </Grid>
          <Grid size={9}>
            <Grid container>
              <Grid className='b_right' size="grow">
                <p className='t_right plr p'><strong>{totalCost()?.toFixed(2)}</strong></p>
              </Grid>
              <Grid style={{ width: 115 }} className='b_right t_center'>
                <Grid container className=''>
                  <Grid className='b_right' size={5}>
                    <p className='p'>{manualnote.gst_id / 2}%</p>
                  </Grid>
                  <Grid size={7}>
                    <p className='p t_right plr'>
                    <strong>{manualnote.gst_amount / 2}</strong>
                    </p>
                  </Grid>
                </Grid>
              </Grid>
              <Grid style={{ width: 115 }} className='b_right t_center'>
                <Grid container>
                  <Grid className='b_right' size={5}>
                    <p className='p'>{manualnote.gst_id / 2}%</p>
                  </Grid>
                  <Grid size={7}>
                    <p className='t_right plr p'>
                    <strong>{manualnote.gst_amount / 2}</strong>
                    </p>
                  </Grid>
                </Grid>
              </Grid>
              <Grid style={{ width: 115 }} className='b_right t_center'>
                <Grid container>
                  <Grid className='b_right' size={5}>
                    <p className='p'>{manualnote.tds_id}%</p>
                  </Grid>
                  <Grid size={7}>
                    <p className='t_right plr p'>
                    <strong>{manualnote.tds_amount}</strong>
                    </p>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size="grow">
                <p className='t_right plr p'><strong>{(manualnote.gst_amount + manualnote.tds_amount).toFixed(2)}</strong></p>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      ) : (
        <Grid size={12}>
        <Grid container className='b_bottom'>
          <Grid className='b_right' size={3}>
            <p className='t_right mlr p'>Total</p>
          </Grid>
          <Grid size={9}>
            <Grid container>
              <Grid className='b_right' size="grow">
                <p className='t_right plr p'><strong>{totalCost()?.toFixed(2)}</strong></p>
              </Grid>
              <Grid style={{ width: 115 }} className='b_right t_center'>
                <Grid container className=''>
                  <Grid className='b_right' size={5}>
                    <p className='p'>5443</p>
                  </Grid>
                  <Grid size={7}>
                    <p className='p t_right plr'>
                    <strong>{(taxes() / 2).toFixed(2)}</strong>
                    </p>
                  </Grid>
                </Grid>
              </Grid>
              <Grid style={{ width: 115 }} className='b_right t_center'>
                <Grid container>
                  <Grid className='b_right' size={5}>
                    <p className='p'></p>
                  </Grid>
                  <Grid size={7}>
                    <p className='t_right plr p'>
                    <strong>{(taxes() / 2).toFixed(2)}</strong>
                    </p>
                  </Grid>
                </Grid>
              </Grid>
              <Grid style={{ width: 115 }} className='b_right t_center'>
                <Grid container>
                  <Grid className='b_right' size={5}>
                    <p className='p'></p>
                  </Grid>
                  <Grid size={7}>
                    <p className='t_right plr p'>
                    <strong>{(tcstaxes() ).toFixed(2)}</strong>
                    </p>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size="grow">
                <p className='t_right plr p'><strong>{(taxes()+ tcstaxes()).toFixed(2)}</strong></p>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      )
      }
                 

                  <Grid size={12}>
                    {/* <p className='mlr p'>
                      {`Tax Amount (in words) : INR ${inWords((totalCost() + taxes() + tcstaxes()).toFixed(2))}`}
                    </p> */}
                    <Grid container style={{ marginTop: 25 }}>
                      <Grid size={6}></Grid>
                      <Grid size={6}>
                        {/* <p className='p'>Company's Bank Details</p>
                        <div style={{ display: "flex" }}>
                          <p style={{ width: 135 }} className='p'>Bank Name</p>
                          <p className='p'>: Indusind Bank</p>
                        </div>
                        <div style={{ display: "flex" }}>
                          <p style={{ width: 135 }} className='p'>A/c No.</p>
                          <p className='p'>: 201000040519</p>
                        </div>
                        <div style={{ display: "flex" }}>
                          <p style={{ width: 135 }} className='p'>Branch & IFS Code</p>
                          <p className='p'>: Velachery & INDB0000606</p>
                        </div> */}
                      </Grid>
                      <Grid size={6}>
                        <p className='mlr p'>
                          <span className='b_bottom'>Declaration</span>
                        </p>
                        <p style={{ height: 60 }} className='mlr p'>
                          We declare that this invoice shows the actual price of the
                          goods described and that all particulars are true and
                          correct.
                        </p>
                      </Grid>
                      <Grid
                        className='b_left b_top t_right'
                        style={{ display: 'flex', flexDirection: 'column' }}
                        size={6}>
                        <p className='mlr p'><strong>for {companyName}</strong></p>
                        <p style={{ marginTop: 'auto' }} className='mlr p'>
                          Authorized Signatory
                        </p>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </div>
            </div>
            <p style={{ width: "21cm" }} className="t_center p">
            <small>This is a System Generated Document</small>
            </p>
          </div>
    </>
  );
}
