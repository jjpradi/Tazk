
import React, {useState, useEffect, useRef} from 'react';
import {Grid, Typography, Box} from '@mui/material';
import './styles.css';
import {useDispatch, useSelector} from 'react-redux';
import _ from 'lodash';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import {base_url} from '../../../http-common';
import { getCompanyLogo } from 'redux/actions/company_actions';
import QRCode from 'react-qr-code';


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
  E_invoice
}) {
  const {
    appConfigReducer: {app_config_data},
  } = useSelector((state) => state);

  console.log('posinvoiceee', E_invoice)
  const dispatch = useDispatch();
  const {
    CompanyReducers: { company_logo },
  } = useSelector((state) => state);

  const [uniqueData, setuniqueData] = useState([]);
  //  const [companyName,setCompanyName] = useState('')
  //  const [fullAddress,setFullAddress] = useState('')
  //  const [companyEmail,setEmail] = useState ('')

  const {companyName, companyAddress, companyEmail, gstin, companyMobile, web, invoice_logo} =
    appConfigData || {};
  //  const { setLoaderStatusHandler } = useContext(CreateNewButtonContext)
  useEffect(() => {
    dispatch(getCompanyLogo())

  },[])
  const getGst = () => {
    const getState =
      app_config_data.find((d) => d.key_name === 'address.state') || {};
    if (custData?.state?.toLowerCase() === getState?.value?.toLowerCase()) { 
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
        custType === 'CUSTOMER' ? (data.discount > 0 ? data.stock_type === 0 ? ((data.item_unit_price - data.discount) / (1 + (data.tax_rate / 100))) : (data.item_unit_price - data.discount)  : data.item_unit_price) : data.item_cost_price;
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
        custType === 'CUSTOMER' ? d.discount > 0 ? d.stock_type === 0 ? ((d.item_unit_price - d.discount) / (1 + (d.tax_rate / 100))) : (d.item_unit_price - d.discount)  : d.item_unit_price : d.item_cost_price;
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
          > {E_invoice !== undefined && E_invoice.length > 0 &&
            <>
            <p style={{ width: '21cm', marginTop: 0 }} className='t_center p'>
              {  'E-Invoice'}
            </p>
            <Grid container spacing={2}>
              <Grid container justifyContent="space-between" alignItems="center" size={12}>
                <Grid style={{ paddingTop: "95px" }} size={10}>
                  <Typography variant="body2" className='waybill'><strong>IRN:</strong> {E_invoice[0]?.Irn}</Typography>
                  <Typography variant="body2" className='waybill'><strong>Ack No.:</strong> {E_invoice[0]?.AckNo}</Typography>
                  <Typography variant="body2" className='waybill'><strong>Ack Date:</strong> {new Date(E_invoice[0]?.AckDt).toLocaleDateString()}</Typography>
                </Grid>
                <Grid size={2}>
                  <Box textAlign="center">
                    <Typography variant="caption"><strong>e-Invoice</strong></Typography>
                    <QRCode value={E_invoice[0]?.SignedQRCode} size={130} />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            </>}
            <Grid size={12}>
              <Grid container> 
                <Grid
                  size={{
                    lg: 6,
                    sm: 6,
                    xs: 6,
                    md: 6
                  }}>
                  {company_logo && company_logo.length > 0 && company_logo[0]?.image && (
                    <img
                      src={company_logo[0].image}
                      alt=""
                      style={{ width: '250px', height: '100px', objectFit: 'contain' }}
                    />
                  )}
                </Grid>

                <Grid
                  style={{}}
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
            <hr style={{margin: '2px 0'}}/>
            <Grid size={12}>
              <Grid container>
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
                    <p className='p'>{note || ''}</p>
                  </div>
                </Grid>
              </Grid>
            </Grid>
            {/* <hr className='hrcolor'></hr> */}
            <div className='b_color_top' style={{width: '100%'}}>
              {(() => {
                const colWidth = getGst() ? '10%' : '12%';
                const descWidth = getGst() ? '30%' : '40%';
                const colStyle = {width: colWidth};
                const cols = (
                  <colgroup>
                    <col style={{width: descWidth}} />
                    <col style={colStyle} />
                    <col style={colStyle} />
                    <col style={colStyle} />
                    {getGst() && <><col style={colStyle} /><col style={colStyle} /></>}
                    {!getGst() && <col style={colStyle} />}
                    <col style={colStyle} />
                  </colgroup>
                );
                const thStyle = {textAlign: 'right', padding: '4px 4px'};
                return (<>
              <table style={{width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed'}}>
                {cols}
                <thead>
                  <tr>
                    <th style={{textAlign: 'left', padding: '4px 2px'}} className='p'>Description</th>
                    <th style={thStyle} className='p'>Quantity</th>
                    <th style={thStyle} className='p'>Price</th>
                    <th style={thStyle} className='p'>Tax</th>
                    {getGst() ? (
                      <><th style={thStyle} className='p'>CGST</th><th style={thStyle} className='p'>SGST</th></>
                    ) : (
                      <th style={thStyle} className='p'>IGST</th>
                    )}
                    <th style={thStyle} className='p'>Total</th>
                  </tr>
                </thead>
              </table>
              <div className='b_color_bottom'>
              <table style={{width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed'}}>
                {cols}
                <tbody>
                  {sales_items?.map((d, ind) => {
                    const tdStyle = {textAlign: 'right', padding: '4px 4px'};
                    return (
                    <tr key={ind} className='b_dotted' style={{verticalAlign: 'top'}}>
                      <td style={{padding: '4px 2px'}}>
                        <p className='p' style={{fontWeight: 'bold', margin: 0}}>{d.name}</p>
                        <p className='p' style={{margin: 0, paddingLeft: 0}}>HSN/SAC: {d.hsn_code || 'No HSN'}{d.is_serialized === 1 ? ` | IMEI/Serial: ${d.soldLots?.map((s)=> s.lot_number).join(', ')}` : ''}</p>
                      </td>
                      <td style={tdStyle} className='p'>{`${d.quantity || 1} NOS`}</td>
                      <td style={tdStyle} className='p'>
                        {d.discount > 0 ? (d.item_unit_price - d.discount) : d.item_unit_price}
                      </td>
                      <td style={tdStyle} className='p'>{`${getIgst(d)}%`}</td>
                      {getGst() ? (
                        <>
                          <td style={tdStyle} className='p'>
                            {taxOnly(d.quantity, custType === 'CUSTOMER' ? d.discount > 0 ? d.stock_type === 0 ? ((d.item_unit_price - d.discount) / (1 + (d.tax_rate / 100))) : (d.item_unit_price - d.discount) : d.item_unit_price : d.item_cost_price, getIgst(d) / 2).toFixed(2)}
                          </td>
                          <td style={tdStyle} className='p'>
                            {taxOnly(d.quantity, custType === 'CUSTOMER' ? d.discount > 0 ? d.stock_type === 0 ? ((d.item_unit_price - d.discount) / (1 + (d.tax_rate / 100))) : (d.item_unit_price - d.discount) : d.item_unit_price : d.item_cost_price, getIgst(d) / 2).toFixed(2)}
                          </td>
                        </>
                      ) : (
                        <td style={tdStyle} className='p'>
                          {taxOnly(d.quantity, custType === 'CUSTOMER' ? d.discount > 0 ? d.stock_type === 0 ? ((d.item_unit_price - d.discount) / (1 + (d.tax_rate / 100))) : (d.item_unit_price - d.discount) : d.item_unit_price : d.item_cost_price, getIgst(d)).toFixed(2)}
                        </td>
                      )}
                      <td style={tdStyle} className='p'>
                        {withoutTax(d.quantity, custType === 'CUSTOMER' ? d.discount > 0 ? (d.item_unit_price - d.discount) : d.item_unit_price : d.item_cost_price).toFixed(2)}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{height: '30px'}} />
              </div>
              </>);
              })()}
            </div>
            <Grid className={papersize === '0' ? 'terms' : 'a4terms'} size={12}>
              {/* <div class="html2pdf__page-break"></div> */}
              <Grid
                container
                style={{minHeight: 'auto'}}
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
                      {(parseFloat((taxes() / 2).toFixed(2)) + parseFloat((taxes() / 2).toFixed(2))).toFixed(2) }
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
                    xs: 12,
                    sm: 12,
                    md: 12
                  }}>
                  <div style={{display: 'flex', flexWrap: 'wrap'}}>
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
            <Grid justifyContent='flex-end' mb={'0px'} size={12} style={{marginTop: '10px'}}>
              <div style={{height: '50px'}} />
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
