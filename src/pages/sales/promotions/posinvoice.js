
import React, {useState, useEffect, useRef} from 'react';
import {Grid, Typography} from '@mui/material';
import './styles.css';
import {useSelector} from 'react-redux';
import _ from 'lodash';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import {base_url} from '../../../http-common';

export default function Invoice({
  custData,
  invoice,
  soDate,
  sales_items,
  custType,
  note,
  appConfigData,
  posSale,
  sales_payments,
  headerview,
  papersize,
}) {
  const {
    appConfigReducer: {app_config_data},
  } = useSelector((state) => state);


  const [uniqueData, setuniqueData] = useState([]);
  //  const [companyName,setCompanyName] = useState('')
  //  const [fullAddress,setFullAddress] = useState('')
  //  const [companyEmail,setEmail] = useState ('')

  const {companyName, companyAddress, companyEmail, gstin, companyMobile, web, invoice_logo} =
    appConfigData || {};
  //  const { setLoaderStatusHandler } = useContext(CreateNewButtonContext)
  const getGst = () => {
    const getState =
      app_config_data.find((d) => d.key_name === 'address.state') || {};
    if (custData?.state === getState.value) {
      return true;
    }
    return false;
  };
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
      const qty = data.quantity || 1;
      const tax = getIgst(data);
      total += ((prc * qty) / 100) * tax;
    }
    return total ? total : 0;
  };
  const totalCost = () => {
    let total = 0;
    sales_items.forEach((d) => {
      const prc =
        custType === 'CUSTOMER' ? d.item_unit_price : d.item_cost_price;
      total += (d.quantity || 1) * prc;
    });
    return total;
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
      total += +d.quantity;
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
        const qty = data.quantity || 1;
        total += ((prc * qty) / 100) * tax_rate;
      }
    }
    return total ? total.toFixed(2) : 0;
  };

  useEffect(() => {
    const getData = sales_items.map((d) => d.taxes || []);
    // const uniqueAddresses = Array.from(new Set(getData.map((a) => a[0]?.tax_category))).map(
    //   (name) => {
    //     return getData.find((a) => a[0]?.tax_category === name);
    //   }
    // );
    const uniqueAddresses = _.uniqBy(getData, 'tax_category');
    setuniqueData(uniqueAddresses);
  }, [sales_items]);

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

  const checkIndexFunc = (index) => {
    if (index > 0) {
      let check = index / 4;
      if (check % 1 === 0) {
        return true;
      } else {
        return false;
      }
    }
  };


  return (
    <>
      {/* <p style={{ width: "21cm", marginTop: 0 }} className="t_center">
                Tax Invoice
            </p> */}
      <div className={papersize === '0' ? 'totalwidth' : 'a4width'}>
        <div
          style={{
            width: '100%',
            height: '100%',
            margin: 'auto',
          }}
        >
          <Grid
            container
            direction='column'
            height='100%'
            position='relative'
            display='flex'
            // bottom='50px'
            // className='totalbottom'
          >
            <Grid size={12}>
              <Grid container> 
                <Grid
                  size={{
                    lg: 6,
                    sm: 6,
                    xs: 6,
                    md: 6
                  }}>
                
                    <img
                      src={invoice_logo}
                      alt=''
                      style={{paddingTop: '30px',  width: invoice_logo === '/phonebuy.png'? '300px' : '100px'}}
                    />
                  

                  {/* <Typography fontSize='4rem' fontWeight='500'  color='#18181b'>Phonebuy</Typography> */}
                </Grid>
                <Grid
                  style={{height: '190px'}}
                  size={{
                    lg: 6,
                    sm: 6,
                    xs: 6,
                    md: 6
                  }}>
                  <p className='p' style={{fontWeight:'bold'}}>
                    {companyName}
                  </p>
                  <p className='p'>{companyAddress}</p>
                  <p className='p'>Email: {companyEmail}</p>

                  <p className='p' style={{marginTop: '5px'}}>
                    GSTIN/UIN : {gstin ? ` ${gstin}` : ''}
                  </p>
                  <p className='p'>
                    Phone :{companyMobile ? ` ${companyMobile}` : ''}
                  </p>

                  {custData ? (
                    <>
                      <p
                        className='p'
                        style={{marginTop: '15px', fontWeight: 'bold'}}
                      >
                        {' '}
                        {`Bill To: ${
                          custData.company_name || custData.first_name
                        }`}
                      </p>
                      <p className='p'>
                        {' '}
                        {` ${custData.address ? custData.address + ',' : ''} ${
                          custData.area ? custData.area + ',' : ''
                        } ${custData.city || ''}`}
                      </p>
                      <p className='p' style={{marginTop: '3px'}}>
                        {' '}
                        {` ${custData.state ? custData.state + '' : ''} ${
                          custData.zip || ''
                        }`}
                      </p>
                      {/* <p className="p"> {`Email: ${custData.email || ''}`}</p> */}
                      {/* <p className="p"> {`Phone: ${custData.phone_number || ''}`}</p> */}
                      <p
                        className='p'
                        style={{marginTop: '7px'}}
                      >GSTIN/UIN : {custData.tax_id ?? ''}</p>
                      <p className='p' style={{}}>{`Phone : ${
                        custData.phone_number || ''
                      }`}</p>
                    </>
                  ) : (
                    ''
                  )}
                  {/* </p> */}
                </Grid>
              </Grid>
            </Grid>
            <Grid pt='15px' size={12}>
              <Grid container style={{height: '80px'}}>
                <Grid
                  style={{alignSelf: 'flex-end'}}
                  size={{
                    lg: 6,
                    xs: "grow"
                  }}>
                  <Typography
                    style={{
                      color: '#36b4ff',
                      fontWeight: 'normal',
                      fontSize: '1.4rem',
                      fontFamily: 'sans-serif',
                    }}
                  >
                    TAX INVOICE {invoice || '-'}
                  </Typography>
                  <p className='p' style={{fontWeight: 'normal'}}>
                    Invoice Date: {soDate ?soDate : ''}
                  </p>
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
                      marginTop: '10px',
                      marginBottom: '1px',
                    }}
                  >
                    <p className='p' style={{fontWeight: 'bold'}}>
                     Note:
                    </p>
                    <p className='p mlr'>{note || ''}</p>
                  </div>
                </Grid>
              </Grid>
            </Grid>
            {/* <hr className='hrcolor'></hr> */}
            <Grid className='b_color_top' size={12}>
              <Grid container style={{marginTop: '2px'}}>
                <Grid size={6}>
                  <p
                    style={{margin: '0 auto', textAlign: 'left'}}
                    className='p'
                  >
                    Description
                  </p>
                </Grid>

                <Grid size={6}>
                  <Grid container>
                    <Grid size="grow">
                      <p style={{height: 37, textAlign: 'right'}} className='p'>
                        Quantity
                      </p>
                    </Grid>
                    <Grid size="grow">
                      <p style={{height: 37, textAlign: 'right'}} className='p'>
                        Price
                      </p>
                    </Grid>
                    <Grid style={{textAlign: 'right'}} size="grow">
                      <p style={{height: 37, textAlign: 'right'}} className='p'>
                        Total
                      </p>
                    </Grid>
                    <Grid size="grow">
                      <p style={{height: 37, textAlign: 'right'}} className='p'>
                        Taxes
                      </p>
                    </Grid>
                    {getGst() ? (
                      <>
                        <Grid style={{textAlign: 'right'}} size="grow">
                          <p
                            style={{height: 37, textAlign: 'right'}}
                            className='p'
                          >
                            CGST
                          </p>
                        </Grid>
                        <Grid size="grow">
                          <p
                            style={{height: 37, textAlign: 'right'}}
                            className='p'
                          >
                            SGST
                          </p>
                        </Grid>
                      </>
                    ) : (
                      <Grid size="grow">
                        <p
                          style={{height: 37, textAlign: 'right'}}
                          className='p'
                        >
                          IGST
                        </p>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Grid>

              <Grid
                className='b_color_bottom'
                style={{minHeight: papersize === '0' ? '400px' : '800px'}}
                size={12}>
                <Grid container>
                  {sales_items?.map((d, ind) => (
                    <>
                      {/* {checkIndexFunc(ind)&&<div class="html2pdf__page-break"></div>} */}

                      <Grid container className='b_dotted'>
                        <Grid style={{display: 'flex'}} size={6}>
                          <Grid container>
                            <Grid size="grow">
                              {/* <div style={{ display: 'flex' }}>
                                                <div style={{ marginTop: 8 }} className="mlr"> */}
                              <p className='p' style={{fontSize: '1rem'}}>
                                {d.name}
                              </p> 
                              <p className='product'>
                                {' '}
                                HSN/SAC: {d.hsn_code || 'No HSN'}
                              </p>
                              {d.is_serialized === 1 ? (
                                <p className='product'>
                                  IMEI/Serial Number:{' '}
                                  {/* {d.soldLots?.lot_number} */}
                                  {d.soldLots?.map((d)=> d.lot_number).join(', ')}
                                  
                                  {/* {123455} */}
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
                                style={{marginTop: 8, textAlign: 'right'}}
                              >
                                {`${d.quantity || 1} NOS`}
                              </p>
                            </Grid>
                            <Grid size="grow">
                              <div
                                className='mlr'
                                style={{textAlign: 'left', marginTop: 8}}
                              >
                                <p className='p' style={{textAlign: 'right'}}>
                                  {' '}
                                  {d.item_unit_price}
                                </p>
                                {/* <p className='p'>{`${d.quantity} NOS`}</p> */}
                                {/* <p style={{ fontSize: ".8rem" }} className='p'>{`${d.quantity} NOS`}</p> */}
                              </div>
                            </Grid>
                            <Grid style={{textAlign: 'left'}} size="grow">
                              <p
                                className='mlr p'
                                style={{marginTop: 8, textAlign: 'right'}}
                              >
                                {withoutTax(
                                  d.quantity,
                                  custType === 'CUSTOMER'
                                    ? d.item_unit_price
                                    : d.item_cost_price,
                                ).toFixed(2)}
                              </p>
                            </Grid>
                            <Grid size="grow">
                              <p
                                style={{textAlign: 'right', marginTop: 8}}
                                className='small p'
                              >
                                {`${getIgst(d)}%`}
                              </p>
                            </Grid>
                            {getGst() ? (
                              <>
                                <Grid size="grow">
                                  <p
                                    style={{textAlign: 'right', marginTop: 8}}
                                    className='small p'
                                  >
                                    {taxOnly(
                                      d.quantity,
                                      custType === 'CUSTOMER'
                                        ? d.item_unit_price
                                        : d.item_cost_price,
                                      getIgst(d) / 2,
                                    ).toFixed(2)}
                                  </p>
                                </Grid>
                                <Grid size="grow">
                                  <p
                                    style={{textAlign: 'right', marginTop: 8}}
                                    className='small p'
                                  >
                                    {taxOnly(
                                      d.quantity,
                                      custType === 'CUSTOMER'
                                        ? d.item_unit_price
                                        : d.item_cost_price,
                                      getIgst(d) / 2,
                                    ).toFixed(2)}
                                  </p>
                                </Grid>
                              </>
                            ) : (
                              <Grid size="grow">
                                <p
                                  style={{textAlign: 'right', marginTop: 8}}
                                  className='small p'
                                >
                                  {taxOnly(
                                    d.quantity,
                                    custType === 'CUSTOMER'
                                      ? d.item_unit_price
                                      : d.item_cost_price,
                                    getIgst(d),
                                  ).toFixed(2)}
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
            <Grid className={papersize === '0' ? 'terms' : 'a4terms'} size={12}>
              {/* <div class="html2pdf__page-break"></div> */}
              <Grid
                container
                style={{height: papersize === '0' ? '250px' : '350px'}}
              >
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
                {/* {sales_items.map(d=><> */}
                <Grid
                  marginTop={2}
                  size={{
                    lg: 6,
                    xs: 6,
                    sm: 6,
                    md: 6
                  }}>
                  <div style={{display: 'flex'}} className='p_bold b_dotted'>
                    <p className='p_bold'>Subtotal </p>
                    <p style={{marginLeft: 'auto'}} className='p_bold'>
                      {`${totalCost().toFixed(2)}`}
                    </p>
                  </div>
                  {getGst() ? (
                    <>
                      <div
                        style={{display: 'flex'}}
                        className='p_bold b_dotted'
                      >
                        <p className='p_bold '>
                          CGST on {`${totalCost().toFixed(2)}`}
                        </p>
                        <p style={{marginLeft: 'auto'}} className='p_bold'>
                          {/* {`${(taxes(list) / 2)} `} */}
                          {(taxes() / 2).toFixed(2)}
                        </p>
                      </div>
                      <div
                        style={{display: 'flex'}}
                        className='p_bold b_dotted'
                      >
                        <p className='p_bold '>
                          SGST on {`${totalCost().toFixed(2)}`}
                        </p>
                        <p style={{marginLeft: 'auto'}} className='p_bold'>
                          {(taxes() / 2).toFixed(2)}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div style={{display: 'flex'}} className='p_bold b_dotted'>
                      <p className='p_bold '>
                        IGST on {`${totalCost().toFixed(2)}`}
                      </p>
                      <p style={{marginLeft: 'auto'}} className='p_bold'>
                        {(taxes() / 2).toFixed(2)}
                      </p>
                    </div>
                  )}
                  <div style={{display: 'flex'}} className='b_color_bottom'>
                    <p className='p_bold '>Total</p>
                    <p style={{marginLeft: 'auto'}} className='p_bold'>
                      {`${(taxes() + totalCost()).toFixed(2)} `}
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
                      {`INR ${inWords((totalCost() + taxes()).toFixed(2))}`}
                    </p>
                  </div>
                </Grid>
                {/* </>)} */}
              </Grid>
            </Grid>
            {/* <Grid size={12}>
                   
                </Grid> */}
            {/* <hr /> */}
            <br />
            {/* <br /> <br />
            <br />
            <br />
            <br /> */}
            <Grid justifyContent='flex-end' mb={'0px'} size={12}>
              <Grid container direction='row' className='b_bottom '>
                <Grid
                  size={{
                    lg: 5,
                    xs: 6,
                    sm: 6,
                    md: 6
                  }}>
                  <p
                    className='p'
                    style={{fontWeight: 'bold', textAlign: 'left'}}
                  >
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
                  <p
                    className='p'
                    style={{fontWeight: 'bold', textAlign: 'right'}}
                  >
                    {companyName}
                  </p>
                </Grid>
              </Grid>

              <Grid
                container
                direction='row'
                display='flex'
                justifyContent='space-between'
                alignItems='center'
                flexWrap='wrap'
              >
                <Grid display='flex' flexDirection='row' alignItems='center' margin='5px 0px'>
                  <PhoneAndroidIcon fontSize='small' color="primary" />
                  &nbsp;<p className='p'>{companyMobile}</p>
                </Grid>
                <Grid display='flex' flexDirection='row' alignItems='center' margin='5px 0px'>
                  <EmailIcon fontSize='small' color="primary" />
                  &nbsp;<p className='p'>{companyEmail}</p>
                </Grid>
                <Grid display='flex' flexDirection='row' alignItems='center' margin='5px 0px'>
                  <LanguageIcon fontSize='small' color="primary" />
                  &nbsp;<p className='p'>{web}</p>
                </Grid>
                <Grid display='flex' flexDirection='row' alignItems='center' margin='5px 0px'>
                  <p className='p'>
                    <span style={{fontWeight: '900'}}>GSTIN : </span>
                    {gstin}
                  </p>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </div>
    </>
  );
}
