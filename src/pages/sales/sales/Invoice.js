import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import './styles.css';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import { Box, Typography } from '@mui/material';
import QRCode from 'react-qr-code';
import moment from 'moment';
import { getsessionStorage } from 'pages/common/login/cookies';


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
  status,
  total,
  due_amount,
  E_invoice,
  shipTo,
  soNumber,
  termsAndConditionsList,
  tcs,
  tds, tcspercent, tdspercent,shipping_details,sale_status,dc_number,
  isRoundedOffNegative,
  rounded_off,
}) {
  // const dispatch = useDispatch();
  // console.log('tcsvaluesss', tcs,tds, typeof(tcspercent), tdspercent )
//   let hasMatch;
//   useEffect(()=>{
//     const matchval = ['IN']
//      hasMatch = matchval.some(val => invoice?.includes(val));
//     console.log("shipping_details",hasMatch)
//   },[invoice])
// console.log(invoice?.includes('IN'),'gone');


  const {
    appConfigReducer: { app_config_data ,app_config_data_based_on_type},
  } = useSelector((state) => state);

  // console.log("app_config_data_based_on_type",app_config_data_based_on_type)
  const [uniqueData, setuniqueData] = useState([]);
  const [tcstaxvisible, setTcstaxvisible] = useState(false);
  //  const [companyName,setCompanyName] = useState('')
  //  const [fullAddress,setFullAddress] = useState('')
  //  const [companyEmail,setEmail] = useState ('')
  const storage = getsessionStorage();
  const [multipleTaxes, setMultipleTaxes] = useState(false)
  const [hsnGroupedData, setHsnGroupedData] = useState([])
  const { companyAddress, companyEmail, gstin, companyMobile } =
    appConfigData || {};
    
  //  const { setLoaderStatusHandler } = useContext(CreateNewButtonContext)
  const getGst = () => {
    const getState =
    app_config_data_based_on_type?.find((d) => d.key_name === 'address.state') || {};
    if (custData?.state?.toLowerCase() === getState.value?.toLowerCase()) {
      return true;
    }
    return false;
  };
  // console.log(moment(soDate).format("DD/MM/YYYY hh:mm A"),"soDa2222te",soDate)
  let arr = [];
// console.log("Rgbrgbrg",sales_items[0]?.return_quantity);

  useEffect(() => {
    if (custData?.tcs === 1) {
      setTcstaxvisible(true)
    } else {
      setTcstaxvisible(false)
    }
  })

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
      const qty = data.return_quantity && data.quantity ? data.quantity + data.return_quantity : data.return_quantity || data.quantity
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
        const prc =
          custType === 'CUSTOMER' ? data.item_unit_price : data.item_cost_price;
        const qty = data.quantity || 1;
        const tax = getTcs(data);
        total += ((prc * qty) / 100) * tax;
      }
      return total ? total : 0;
    }
  };
  const totalCost = () => {
    let total = 0;
    sales_items?.forEach((d) => {
      const qty = d.return_quantity && d.quantity ? d.quantity + d.return_quantity : d.return_quantity || d.quantity;

      const prc =
        custType === 'CUSTOMER' ? d.item_unit_price : d.item_cost_price;
      total += (qty) * prc;
    });
    return total;
  };
  const totalValueCost = () => {
    let total = 0;
    sales_items?.forEach((d) => {
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

  const totaltaxOnly = (cost, tax) => {
    // const val = (qty || 1) * cost;
    const taxval = (cost / 100) * tax;
    return taxval;
  };

  const totalQuantity = () => {
    let total = 0;
    sales_items?.forEach((d) => {
      total += d.return_quantity && d.quantity ? d.quantity + d.return_quantity : +d.quantity;
    });
    return total;
  };
  const lookup = (sales_items || []).reduce((acc, d) => {
    const value = withoutTax(
      d.quantity,
      custType === 'CUSTOMER' ? d.item_unit_price : d.item_cost_price
    );
    acc[d.hsn_code] = (acc[d.hsn_code] || 0) + value;
  
    return acc;
  }, {});

    // console.log("erfrf",lookup);

    if (lookup && Object.keys(lookup).length > 0) {
      const arr = Object.keys(lookup).map(i => {
        const a = sales_items.find(j => j.hsn_code === i);
        return { ...a, totalVal: lookup[i] };
      });
    
      // console.log("Final Array:", arr);
    }

  function inWords(num) {
    const getNum = num.split('.')[0];
    const getNum1 = num.split('.')[1];

    if (getNum.length > 9) return 'overflow';

    function price_in_words(price) {
      const sglDigit = [
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

      let str = '',
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

if (!getStr) getStr = 'Zero';

    if (getNum1) {
      getStr += newStr ? 'and ' + newStr + 'paise Only' : ' Only';
    } else {
      getStr += ' Only';
    }

    return getStr;
  }
     const companyName = app_config_data_based_on_type.filter(f=>f.key_name =='company.name')[0]?.value;
     const fullAddress = app_config_data_based_on_type.filter(f=>f.key_name =='address.fulladdress')[0]?.value;
     const emailData = app_config_data_based_on_type.filter(f=>f.key_name =='company.email')[0]?.value;
     const city = app_config_data_based_on_type.filter(f=>f.key_name =='address.city')[0]?.value;
     const pincode = app_config_data_based_on_type.filter(f=>f.key_name =='address.pincode')[0]?.value;
     const state = app_config_data_based_on_type.filter(f=>f.key_name =='address.state')[0]?.value;
     const mobilenum = app_config_data_based_on_type.filter(f=>f.key_name =='company.mobile')[0]?.value;
     const fullname = storage?.first_name + (storage?.last_name ? storage.last_name !== null ? ' ' + storage.last_name : '' : '')
  const groupTaxes = (tax_rate, tax_category) => {
    let total = 0;
    for (let data of sales_items) {
      // let arr = [];
        if (data?.taxes?.length > 0 && data.taxes[0]?.tax_category === tax_category) {
        // for (let d in data) {
        //   if (["item_unit_price", "quantity"].includes(d)) {
        //     arr.push(Number(data[d]));
        //   }
        // }
        const prc =
          custType === 'CUSTOMER' ? data.item_unit_price : data.item_cost_price;
        const qty = data.return_quantity && data.quantity ? data.quantity + data.return_quantity : data.return_quantity || data.quantity
        total += ((prc * qty) / 100) * tax_rate;
      }
    }
    return total ? total.toFixed(2) : 0;
  };

  const addAllTaxes = (taxType) => {
    let total = 0

    for(const data of sales_items){
      const prc = custType === 'CUSTOMER' ? data.item_unit_price : data.item_cost_price
      const qty = data.quantity || 1
      total += ((prc * qty) / 100) * (taxType === 'IGST' ? getIgst(data) : getIgst(data) / 2)
    }
    
    return total ? total.toFixed(2) : 0
  }

  const addAllTaxes1 = (taxType) => {
    let total = 0;
  // console.log("co,gh");
  
    for (const data of sales_items) {
      const prc = custType === 'CUSTOMER' ? data.item_unit_price : data.item_cost_price;
      const qty = data.quantity || 1;
  
      const matchingTax = uniqueData.find(
        (tax) => tax.tax_category_id === data.tax_category_id && tax.tax_group === taxType
      );
  
      const taxRate = matchingTax ? matchingTax.tax_rate : 0;
      // console.log(taxRate,"taxRateds");
      
  
      total += ((prc * qty) / 100) * taxRate;
    }
  
    // console.log(total, "totalmq");
  
    return total ? total.toFixed(2) : 0;
  };
  

  useEffect(() => {
    const taxPresence = {};
    const hsnGroupedData = {};
  
    sales_items?.forEach((item) => {
      // --- Tax presence detection ---
      item.taxes?.forEach((tax) => {
        const category = tax.tax_category;
        if (category) {
          taxPresence[category] = true;
        }
      });
  
      // --- HSN group calculation ---
      const hsnCode = item.hsn_code || "UNKNOWN";
      const quantity = item.return_quantity && item.quantity ? item.quantity + item.return_quantity : item.return_quantity || item.quantity;
      const price = custType === 'CUSTOMER' ? item.item_unit_price : item.item_cost_price;
      const untaxedAmount = price * quantity;
  
      const totalTaxRate = getIgst(item);
      const taxedAmount = (untaxedAmount / 100) * totalTaxRate;
  
      if (!hsnGroupedData[hsnCode]) {
        hsnGroupedData[hsnCode] = {
          hsn_code: hsnCode,
          untaxed_amount: 0,
          taxed_amount: 0,
          total_quantity: 0,
          tax_rate: totalTaxRate,
        }
      }
  
      hsnGroupedData[hsnCode].untaxed_amount += untaxedAmount
      hsnGroupedData[hsnCode].taxed_amount += taxedAmount
      hsnGroupedData[hsnCode].total_quantity += quantity
    });

  
    // State updates
    
    setMultipleTaxes(Object.keys(taxPresence).length > 1 ? true : false)
    // const getData = sales_items?.map((d) => d.taxes || [])
    // const flattenedTaxes = getData.flat();
    // const uniqueAddresses = _.uniqBy(flattenedTaxes, 'tax_category')
    // console.log(uniqueAddresses,flattenedTaxes,getData,"uniqueAddresses");

    const isIntraState = getGst();

const getData = sales_items?.map((d) => d.taxes || []);
const flattenedTaxes = getData.flat();

const filteredTaxes = flattenedTaxes.filter((tax) => {
  if (isIntraState) {
    return tax.tax_group === 'SGST' || tax.tax_group === 'CGST';
  } else {
    return tax.tax_group === 'IGST';
  }
});

const uniqueAddresses = _.uniqBy(filteredTaxes, 'tax_category');
    
    setuniqueData(uniqueAddresses)
    setHsnGroupedData(Object.values(hsnGroupedData))
  
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

  // const getIgst = (data) => {
  //   let tax = '';
  //   console.log(data,"hhdata");
    
  //   if (data.taxes) {
  //     data.taxes.forEach((t) => {
  //       if (t.tax_group === 'IGST') {
  //         tax = t.tax_rate;
  //       }
  //     });
  //   }
  //   return tax;
  // };

  const getIgst = (data) => {
    let tax = 0;
    const taxes = Array.isArray(data.taxes) ? data.taxes : [data.taxes];
  
    taxes.forEach((t) => {
      if (t?.tax_group === 'IGST') {
        tax = t.tax_rate;
      }
    });
  
    return tax;
  };

  function formatNumber(value) {
    // Ensure it's a number
    if(value === null || value === undefined) {
      return ''
    }
    let num = parseFloat(value);
    // If it's an integer, remove decimals; otherwise, show as-is
    let val = Number.isInteger(num) ? num.toFixed(0) : num.toString()
    return val === '0' ? '' : Number.isInteger(num) ? num.toFixed(0) : num.toString();
  }

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
  // console.log('tcsperce', formatNumber(tcs))

  // function formatDateTime(date) {
  //   const d = new Date(moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD'));
  //   const day = String(d.getDate()).padStart(2, '0'); // Ensure 2-digit day
  //   const month = String(d.getMonth() + 1).padStart(2, '0'); // Ensure 2-digit month
  //   const year = d.getFullYear();
  
  //   // console.log('d.hoursss', d.getHours)
  //   // let hours = d.getHours();
  //   // const minutes = String(d.getMinutes()).padStart(2, '0'); // Ensure 2-digit minutes
  //   // const ampm = hours >= 12 ? 'PM' : 'AM';
    
  //   // hours = hours % 12 || 12; // Convert to 12-hour format
  
  //   return `${day}/${month}/${year}`;
  // }
  function formatDateTime(dateStr) {
    //if (!dateStr || dateStr === "00/00/0000" || dateStr === "0000-00-00 00:00:00") return formatDateTime(new Date()); 
    if (!dateStr) return "Invalid Date";

    if (dateStr instanceof Date) {
      dateStr = dateStr.toISOString().split("T")[0];
    } else if (typeof dateStr !== "string") {
      return "Invalid Date";
    }

  let day, month, year;
  
    if (dateStr?.includes("/")) {
      [day, month, year] = dateStr.split("/");
    } else if (dateStr.includes("-")) {

      const datePart = dateStr.split(" ")[0]; 
      [year, month, day] = datePart.split("-");
    } else {
      return "Invalid Date";
    }
    if (!year || !month || !day || isNaN(new Date(`${year}-${month}-${day}`).getTime())) {
      return "Invalid Date";
    }
  
    return `${day}/${month}/${year}`;
  }
  
   const validSoDate = soDate && soDate !== "00/00/0000" && soDate !='Invalid date'   ? soDate : new Date().toISOString().split("T")[0];

  // console.log(taxes(),'tasdddd')
  // console.log(tcspercent,'tcspercentsssss',tdspercent,tcs,tds)

  // console.log(sales_items,'sales_items')
  
  const getItemTax = (item) => {
    const prc = custType === 'CUSTOMER' ? item.item_unit_price : item.item_cost_price;
    const qty = item.quantity || 1;
    const tax = getIgst(item); // This should return the IGST % (like 18)
    return ((prc * qty) / 100) * tax;
  };
  // console.log(uniqueData,multipleTaxes,sales_items,"uniqueDatafd");
  return (
    <>
      <div style={{ 
        width: "100%", 
        display: "flex", 
        flexDirection: "column", 
        lineHeight: 1,
        fontSize: '15px',
        fontFamily: 'Poppins, sans-serif'
      }}>
            <p style={{ marginTop: 0 }} className='t_center p'>
              {
              // posSale === true
              //   ? 'Tax Invoice'
              //   :
              custType === 'CUSTOMER'
              ? (E_invoice !== undefined && E_invoice.length > 0 || invoice?.includes('IN') == true)
                ? 'Tax-Invoice'
                : dc_number ? 'Delivery Challan' : 'Sales Order'
              : 'Purchase Order'}
            </p>
            {custType === 'CUSTOMER' &&  E_invoice !== undefined && E_invoice.length ? 
               <Grid container spacing={1} style={{paddingTop:0 ,fontSize:'15px'}}>
               {/* Header Section */}
               <Grid
                 container
                 justifyContent="space-between"
                 alignItems="center"
                 style={{paddingTop:0}}
                 size={12}>
                <Grid style={{paddingTop:"90px"}} size={10}>
               <Typography variant="body2"  className='waybill'>IRN: <strong><b>{E_invoice[0]?.invoice[0]?.Irn}</b></strong></Typography>
                 <Typography variant="body2" className='waybill'>Ack No.: <strong>{ E_invoice[0]?.invoice[0]?.AckNo}</strong></Typography>
                 <Typography variant="body2" className='waybill'>Ack Date:<strong>{new Date(E_invoice[0]?.invoice[0]?.AckDt).toLocaleDateString()}</strong> </Typography>
                 </Grid>
                 <Grid size={2}>
                 <Box textAlign="center">
                   <Typography variant="caption"><strong>e-Invoice</strong></Typography>
                   <QRCode value={E_invoice[0]?.invoice[0]?.SignedQRCode} size={140} />
                 </Box>
                 </Grid>
               </Grid>
               </Grid> : ''
            }
            <div style={{ display: 'flex' ,lineHeight:1,border:'1px solid black'}}>

                <Grid container>
                  <Grid style={{ marginBottom: 5 }} size={7}>
                    {custType === 'CUSTOMER' ? (
                      // {/* {posSale != true ?  */++}
                      (<>
                        <div style={{ paddingLeft: 3, minHeight: 60,marginTop: 1,paddingTop:'3px' }}>
                          <p className='p' style={{fontSize:'15px'}}><strong>{companyName}</strong></p>
                          <p className='p'>{fullAddress}</p>
                          <p className='p'>{`City : ${city}, State : ${state}, Pincode - ${pincode}`}</p>
                          <p className='p'>{`Contact : ${fullname}, Phone : ${mobilenum}`}</p>
                          {/* <p className='p'>
                            {companyMobile ? `Contact No. : ${companyMobile}` : ''}{' '}
                          </p> */}
                          <p className='p'>{gstin ? `GSTIN/UIN : ${gstin}` : ''} </p>
                        </div>
                        <div className='hr_1' />
                        {/* {console.log(custData,"custDatafdsd")} */}
                        <div style={{ paddingLeft: 3, minHeight: 60,paddingTop:'3px' }}>
                          {custData ? (
                            <>
                              <p className='p'>
                                {posSale === true ? 'Bill To' : 'Consignee'}
                              </p>
                              <p className='p' style={{fontSize:'15px'}}><strong>{`${custData.company_name || custData.first_name
                                }`}</strong></p>
                              <p className='p'>{`${custData.address ? custData.address + ',' : ''
                                } ${custData.area ? custData.area + ',' : ''} ${custData.city || ''
                                }`}{` ,${custData.state ? custData.state + ',' : ''
                                } ${custData.zip || ''}`}</p>
                              {/* <p className='p'>{`${custData.state ? custData.state + ',' : ''
                                } ${custData.zip || ''}`}</p> */}
                              <p className='p'>{`Phone: ${custData.phone_number || ''}`}</p> 
                              <p className='p'>{`E-Mail: ${custData.email || ''}`}</p>
                              <p className='p'>{`GSTIN/UIN : ${custData.tax_id || ''
                                }`}</p>
                            </>
                          ) : (
                            ''
                          )}
                        </div>
                        <div className='hr_1' />
                        <div style={{ paddingLeft: 3, minHeight: 60 ,paddingTop:'3px'}}>
                          {posSale && custData ? (
                           <>
                           <p className='p'>{'Ship To'}</p>
                           {shipping_details?.length > 0 ? (
                             <>
                               <p className='p' style={{fontSize:'15px'}}><strong>{shipping_details[0]?.legal_name|| '-'}</strong></p>
                               <p className='p'>
                                 {`${shipping_details[0]?.address ? shipping_details[0].address + ',' : ''}`}
                               </p>
                               <p className='p'>
                               {`${shipping_details[0]?.location || ''}, ${shipping_details[0]?.zip || ''}`}
                               </p>
                               <p className='p'>
                                 {`Gstin:${shipping_details[0]?.gstin ? shipping_details[0].gstin  : ''}`}
                               </p>
                             </>
                           ) : (
                             <p className='p'>No shipping details available.</p>
                           )}
                         </>
                         
                          ) : (
                            ''
                          )}
                        </div>
                        {/* {posSale === true && (
                          <>
                            <div className='hr_1' />
                            <div style={{ paddingLeft: 3, minHeight: 80 }}>
                              <p className='p'>Other Info:</p>
                              <p className='p mlr'>{note || ''}</p>
                            </div>
                          </>
                        )} */}
                      </>)
                    ) : (
                      <>
                        <div style={{ paddingLeft: 3, minHeight: 120,paddingTop:'3px' }}>
                          {custData ? (
                            <>
                              <p className='p' style={{fontSize:'15px'}}><strong>{`${custData.company_name || custData.first_name
                                }`}</strong></p>
                              <p className='p'>{`${custData.address ? custData.address + ',' : ''
                                } ${custData.area ? custData.area + ',' : ''} ${custData.city || ''
                                }`}</p>
                              <p className='p'>{`${custData.state ? custData.state + ',' : ''
                                } ${custData.zip || ''}`}</p>
                              {/* <p className='p'>{`E-Mail: ${custData.email || ''}`}</p> */}
                              <p className='p'>{`GSTIN/UIN : ${custData.tax_id || ''
                                }`}</p>
                            </>
                          ) : (
                            ''
                          )}
                        </div>
                        <div className='hr_1' />
                        <div style={{ paddingLeft: 3, minHeight: 120,paddingTop:'3px' }}>
                          <p className='p'>Consignee</p>
                          <p className='p' style={{fontSize:'15px'}}><strong>{companyName}</strong></p>
                          <p className='p'>{companyAddress}</p>
                          <p className='p'>{`City: ${city} State: ${state} Pincode: ${pincode}`}</p>
                          <p className='p'>{`E-Mail: ${companyEmail}`}</p>
                          <p className='p'>
                            {companyMobile ? `Contact No. : ${companyMobile}` : ''}{' '}
                          </p>
                          <p className='p'>{gstin ? `GSTIN/UIN : ${gstin}` : ''} </p>
                        </div>
                      </>
                    )}
                  </Grid>
                  <Grid style={{ borderLeft: '1px solid black' }} size={5}>
                    <Grid container>
                      {posSale === true ? (
                        <>
                          <Grid size={6}>
                            <div className='invoice' style={{ borderRight: '1px solid black',paddingTop:'3px' }}>
                              <p className='p'>
                                {dc_number ? 'Delivery Challan No' : custType === 'CUSTOMER'
                                  ? posSale === true
                                    ? 'Invoice No.'
                                    : 'SO No.'
                                  : 'PO No.'}
                              </p>
                              <p
                                className='p'
                                style={{ visibility: invoice || dc_number ? 'visible' : 'hidden' }}
                              >
                                <strong>{dc_number ? dc_number : invoice || '-'}</strong>
                              </p>
                            </div>
                            {/* <div className='invoice'>
                              <p className='p'>Delivery status</p>
                              <p className='p' style={{ textAlign: 'center', width: '280px' }}>
                                {sales_items[0]?.status === 1 ? "Yet to Invoice..." : sales_items[0]?.status === 2 ? 'Pending Payment' : sales_items[0]?.status === 7 ? 'Cancelled' : sales_items[0]?.status === 3 ? 'On hold' : sales_items[0]?.status === 4 ? 'Ready to Ship' : sales_items[0]?.status === 5 ? 'In Transit' : 'Ready to Ship'}
                              </p>
                            </div> */}
                            {/* <div className='invoice'>
                              <p className='p'>Delivery Note</p>
                              <p className='p' style={{visibility: 'hidden'}}>
                                -
                              </p>
                            </div> */}
                            <div className='invoice' style={{ borderRight: '1px solid black', maxHeight: '50px', minHeight: '35px',paddingTop:'3px'  }}>
                              <p className='p'>{"Buyer's Order No."}</p>
                              <p className="p"><strong>{soNumber}</strong></p>
                            </div>
                            <div className='invoice' style={{ borderRight: '1px solid black', maxHeight: '40px', minHeight: '40px',paddingTop:'3px'  }}>
                              <p className='p' >Dispatched through</p>
                              <p className='p' style={{ visibility: 'hidden' }}>
                                -
                              </p>
                            </div>
                            
                          </Grid>

                          <Grid size={6}>
                            <div className='invoice' style={{paddingTop:'3px' }}>
                              <p className='p'>Date</p>
                              <p className='p'>
                              <strong>{formatDateTime(validSoDate)}</strong>
                              </p>
                            </div>
                            <div className='invoice' style={{maxHeight: '35px', minHeight: '35px',paddingTop:'3px' }}>
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
                            <div className='invoice' style={{maxHeight: '40px', minHeight: '40px',paddingTop:'3px' }}>
                              <p className='p'>Dispatch Document No.</p>
                              <p className='p' style={{ visibility: 'hidden' }}>
                                -
                              </p>
                            </div>
                          </Grid>

                          <Grid size={12}>
                            <div className='invoice_1' >
                              <p className='p'>Terms of Delivery</p>
                              
                                {
                                  termsAndConditionsList?.length > 0 &&
                                  <ul className='p' style={{ listStyleType: 'none'}}>
                                    {
                                      termsAndConditionsList.map((term, ind) => (
                                        <li key={ind} style={{}}>{term}</li>
                                      ))
                                    }
                                  </ul>
                                  }
                              
                            </div>
                          </Grid>
                          {/* <Grid size={12}>
                        
                        </Grid> */}
                        </>
                      ) : (
                        <>
                          <Grid size={6}>
                            <div className='invoice' style={{ borderRight: '1px solid black' }}>
                              <p className='p'>
                                {dc_number ? 'Delivery Challan No' : custType === 'CUSTOMER'
                                  ? posSale === true
                                    ? 'Invoice No.'
                                    : 'SO No.'
                                  : 'PO No.'}
                              </p>
                              <p
                                className='p'
                                style={{ visibility: invoice || dc_number ? 'visible' : 'hidden' }}
                              >
                                <strong>{dc_number ? dc_number : invoice || '-'}</strong>
                              </p>
                            </div>
                            <div className='invoice'>
                              <p className='p'>Delivery status</p>
                              <p className='p' style={{ height: 37, textAlign: 'center', width: '300px' }}>
                                {due_amount === "paid" && status === 'Completed' && "Completed..."}
                                {status === 'create' && "Received still payment pending..."}
                                {status === 'Pending Payment' && sales_items[0]?.ordered_quantity === sales_items[0]?.received_quantity && "Received still payment pending..."}
                                {status !== 'New' && sales_items[0]?.ordered_quantity !== sales_items[0]?.received_quantity && "Yet to receive"}
                                {status === 'New' && "Newly Created..."}
                              </p>
                            </div>
                            <div className='invoice' style={{ borderRight: '1px solid black' }}>
                              <p className='p'>{"Supplier's Ref."}</p>
                              <p className='p' style={{ visibility: 'hidden' }}>
                                -
                              </p>
                            </div>
                            <div className='invoice' style={{ borderRight: '1px solid black' }}>
                              <p className='p'>{"Buyer's Order No."}</p>
                              <p className='p' style={{ visibility: 'hidden' }}>
                                -
                                <br />
                                <br />
                              </p>
                            </div>
                            <div className='invoice' style={{ borderRight: '1px solid black' }}>
                              <p className='p'>Dispatch Document No.</p>
                              <p className='p' style={{ visibility: 'hidden' }}>
                                -
                                <br />
                                <br />
                              </p>
                            </div>
                            <div style={{ paddingLeft: '3px', borderRight: '1px solid black' }}>
                              <p className='p'>Dispatched through</p>
                              <p className='p' style={{ visibility: 'hidden' }}>
                                -
                                <br />
                                <br />
                              </p>
                            </div>
                          </Grid>

                          <Grid size={6}>
                            <div className='invoice'>
                              <p className='p'>Date</p>
                              <p className='p'>
                              {/* { moment(soDate).format("DD/MM/YYYY hh:mm A") ||  moment(new Date()).format("DD/MM/YYYY hh:mm A")} */}
                              <strong>{ 
                                moment(soDate).isValid()
                                  ? moment(soDate).format("DD/MM/YYYY hh:mm A")
                                  : moment(new Date()).format("DD/MM/YYYY hh:mm A")
                              }</strong>
                              </p>
                            </div>
                            <div className='invoice'>
                              <p className='p' style={{ height: 37, textAlign: 'center' }}></p>
                              <p className='p' style={{ visibility: 'hidden' }}>
                                -
                              </p>
                            </div>
                            <div className='invoice' style={{ marginTop: 10 }}>
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
                            <div className='invoice' style={{ marginTop: 10 }}>
                              <p className='p'>Other Reference(s)</p>
                              <p className='p' style={{ visibility: 'hidden', marginTop: 10 }}>
                                -
                              </p>
                            </div>
                            {/*<div className='invoice'>
                              <p className='p'>Date</p>
                              <p className='p' style={{visibility: 'hidden'}}>
                                -
                              </p>
                            </div>
                            <div className='invoice'>
                              <p className='p'>Delivery Note Date</p>
                              <p className='p' style={{visibility: 'hidden'}}>
                                -
                              </p>
                            </div>
                            <div style={{paddingLeft: '3px'}}>
                              <p className='p'>Destination</p>
                              <p className='p' style={{visibility: 'hidden'}}>
                                -
                              </p>
                            </div> */}
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Grid>

                  <Grid className='b_top' size={7}>
                    <div style={{ display: 'flex', height: 37 }} className='b_bottom'>
                      <div className='b_right' style={{alignContent: 'center'}}>
                        <p className='p' style={{ width: 24 }}>No.</p>
                      </div>
                      <p style={{ margin: '0 auto', alignContent: 'center' }} className='p'>
                        Description of Goods
                      </p>
                    </div>
                  </Grid>

                  <Grid className='b_top ' size={5}>
                    <Grid container>
                      <Grid className='b_right b_left' size={3}>
                        <p
                          style={{ height: 37, textAlign: 'center', alignContent: 'center', wordWrap: 'break-word' }}
                          className=' b_bottom p'
                        >
                          HSN/SAC
                        </p>
                      </Grid>
                      <Grid className='b_right' size={2}>
                        <p
                          style={{ height: 37, textAlign: 'center', wordWrap: 'break-word', alignContent: 'center' }}
                          className=' b_bottom p'
                        >
                          Qty
                        </p>
                      </Grid>
                      <Grid className='b_right' style={{ textAlign: 'end' }} size={3}>
                        <p
                          style={{ height: 37, textAlign: 'center', wordWrap: 'break-word', alignContent: 'center' }}
                          className=' b_bottom p'
                        >
                          Rate
                        </p>
                      </Grid>
                      {/* <Grid size={1} className='b_right'>
                        <p
                          style={{ height: 37, textAlign: 'center', wordWrap: 'break-word', alignContent: 'center' }}
                          className=' b_bottom p'
                        >
                          per
                        </p>
                      </Grid> */}
                      <Grid style={{ textAlign: 'right', wordWrap: 'break-word' }} size={4}>
                        <p
                          style={{ height: 37, textAlign: 'center', alignContent: 'center' }}
                          className='b_bottom p'
                        >
                          Amount
                        </p>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid size={12}>
                    <Grid container sx={{minHeight: '400px', alignContent: 'stretch'}}>
                      {sales_items?.map((d, ind) => (
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
          <div style={{ marginTop: 8 }} className="mlr">
            <p className="p" style={{ fontSize: '16px', fontWeight: 'bold' }}>{d.name}</p>

            {custType === 'CUSTOMER' ? (
              d.is_serialized === 1 && (d.soldLots?.length > 0 || d.lots?.length > 0 || d.returnLots?.length > 0) && (
                <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: 4, flexWrap: 'wrap' }}>
                  <p className="p" style={{ fontSize: '12px', marginRight: '5px' }}>Serial Number:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', maxWidth: '600px', fontWeight: 'bold', fontSize: '12px' }}>
                    {(d.soldLots?.length > 0 && d.returnLots?.length > 0 ? [...d.returnLots, ...d.soldLots] :  d.soldLots?.length > 0 ? d.soldLots : d.returnLots?.length > 0 ?  d.returnLots : d.lots)?.map((f, idx) => (
                      <p key={idx} className="p" style={{ marginRight: '10px' }}>
                        {String(f.lot_number).split(',').join('  ')}
                      </p>
                    ))}
                  </div>
                </div>
              )
            ) : (
              d.is_serialized === 1 && d.lots?.length > 0 && (
                <p className="p" style={{ fontSize: '12px', marginTop: 4, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                  <strong>Serial Number:</strong>{' '}
                  {d.lots.map((f, i) => (
                    <React.Fragment key={i}>
                      {f.lot_number}
                      {i !== d.lots.length - 1 && ', '}
                      {(i + 1) % 5 === 0 && <br />} 
                    </React.Fragment>
                  ))}
                </p>
              )
            )}
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
                                size={3}>
                                <p
                                  className='p'
                                  style={{ marginTop: 8, textAlign: 'center' }}
                                >
                                  {d.hsn_code || ''}
                                </p>
                              </Grid>
                              <Grid className='b_right' size={2}>
                                <div
                                  className='mlr'
                                  style={{ textAlign: 'center', marginTop: 8 }}
                                >
                                  <p className='p'>{`${d.return_quantity && d.quantity ? d.quantity + d.return_quantity : d.return_quantity || d.quantity }`}</p>
                                  {/* <p style={{ fontSize: ".8rem" }} className='p'>{`${d.quantity} NOS`}</p> */}
                                </div>
                              </Grid>
                              <Grid className='b_right' style={{ textAlign: 'end' }} size={3}>
                                <p className='mlr p' style={{ marginTop: 8 }}>
                                {
        dc_number == null ? (
          (
            withoutTax(
              1,
              custType === 'CUSTOMER' ? d.item_unit_price : d.item_cost_price
            )
          ).toFixed(1)
        ) : (
          (
            withoutTax(
              1,
              custType === 'CUSTOMER' ? d.item_unit_price : d.item_cost_price
            ) + getItemTax(d)
          ).toFixed(1)
        )
      }

                                </p>
                              </Grid>
                              {/* <Grid size={1} className='b_right'>
                                <p
                                  style={{ textAlign: 'center', marginTop: 8, wordWrap: 'break-word' }}
                                  className='small p'
                                >
                                  NOS
                                </p> 
                              </Grid> */}
                              <Grid style={{ textAlign: 'right' }} size={4}>
                                <p style={{ marginTop: 8 ,fontWeight:'bold'}} className='mlr p'>
                                {
        dc_number == null ? (
          (
            withoutTax(
              d.quantity,
              custType === 'CUSTOMER' ? d.item_unit_price : d.item_cost_price
            )
          ).toFixed(1)
        ) : (
          (
            withoutTax(
              d.quantity,
              custType === 'CUSTOMER' ? d.item_unit_price : d.item_cost_price
            ) + getItemTax(d)
          ).toFixed(1)
        )
      }

                                </p>
                              </Grid>
                            </Grid>
                          </Grid>
                        </>
                      ))}
                    </Grid>
                  </Grid>

                  <Grid size={7}>
                    <div style={{ display: 'flex' }}>
                      <div className='b_right'>
                        <p
                          className='p'
                          style={{
                            width: 24,
                          }}
                        ></p>
                      </div>
                      <div style={{ marginTop: 15 }}>
                        <p className='p mlr'></p>
                      </div>
                    </div>
                  </Grid>
                  <Grid style={{ display: 'flex' }} size={5}>
                    <Grid container>
                      <Grid className='b_right b_left' size={3}></Grid>
                      <Grid className='b_right' size={2}></Grid>
                      <Grid className='b_right' size={3}></Grid>
                      {/* <Grid size={1} className='b_right'></Grid> */}
                      <Grid size={4}></Grid>
                    </Grid>
                  </Grid>
      {/* {console.log(getGst(),uniqueData,"fsdvxcvc")} */}
                  {uniqueData.map((d) =>
                    getGst() ? (
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
                         {dc_number === null ? (<div
                                style={{
                                  marginLeft: 'auto',
                                  textAlign: 'end',
                                  marginBottom: 10,
                                  fontWeight:'bold'
                                }}
                              >
                                {/* {console.log(d,"bghjklkk")} */}
                                    <div className='mlr'>
                                  {/* <p className='p'>{multipleTaxes ? 'CGST' : `CGST ${getIgst({ taxes: d }) / 2
                                    }%`}</p> */}
                                    <p className='p'>{`CGST ${d.tax_rate}%`}</p>
                                  {/* <p className='p'>{multipleTaxes ? 'SGST' : `SGST ${getIgst({ taxes: d }) / 2
                                    }%`}</p>  */}
                                    <p className='p'>{`SGST ${d.tax_rate}%`}</p>
                                    {(formatNumber(tcspercent) !== '' && tcspercent !== ''  )&&
                                    <p className='p'>{`TCS ${formatNumber(tcspercent)}%`}</p>
                                  }
                                   {(formatNumber(tdspercent) !== '' && tdspercent !== '' )&&
                                    <p className='p'>{`TDS ${formatNumber(tdspercent)}%`}</p>
                                  }
                                </div>
                              </div>):(
                                 <div
                                 style={{
                                   marginLeft: 'auto',
                                   textAlign: 'end',
                                   marginBottom: 10,
                                   fontWeight:'bold'
                                 }}
                               >
                                 {console.log(d,"bghjklkk")}
                                     <div className='mlr'>
                                   {/* <p className='p'>{multipleTaxes ? 'CGST' : `CGST ${getIgst({ taxes: d }) / 2
                                     }%`}</p> */}
                                    <p className='p'>{`CGST ${d.tax_rate}%`}</p>

                                   {/* <p className='p'>{multipleTaxes ? 'SGST' : `SGST ${getIgst({ taxes: d }) / 2
                                     }%`}</p>  */}
                                    <p className='p'>{`SGST ${d.tax_rate}%`}</p>

                                     {(formatNumber(tcspercent) !== '' && tcspercent !== ''  )&&
                                     <p className='p'>{`TCS ${formatNumber(tcspercent)}%`}</p>
                                   }
                                    {(formatNumber(tdspercent) !== '' && tdspercent !== '' )&&
                                     <p className='p'>{`TDS ${formatNumber(tdspercent)}%`}</p>
                                   }
                                 </div>
                               </div>
                              )}
                            </div>
                          </div>
                        </Grid>
                        
                        <Grid style={{ display: 'flex' }} size={5}>
                          <Grid container>
                            <Grid className='b_right b_left' size={3}></Grid>
                            <Grid className='b_right' size={2}></Grid>
                            <Grid className='b_right' style={{ textAlign: 'end' }} size={3}>
                              <div className='mlr'>
                                {/* <p className='p'>{getIgst({ taxes: d }) / 2}</p>
                                <p className='p'>{getIgst({ taxes: d }) / 2}</p>
                                {tcstaxvisible === true &&
                                  <p className='p'>{getTcs({ taxes: d })}</p>} */}
                              </div>
                            </Grid>
                            {/* <Grid size={1} className='b_right'>
                              <div className='mlr'>
                                <p className='p'>%</p>
                                <p className='p'>%</p>
                              </div>
                            </Grid> */}
                            <Grid style={{ textAlign: 'right',fontWeight:'bold' }} size={4}>
                            {dc_number == null && (<div className='mlr'>
                              {/* {console.log(groupTaxes(
                                    d.tax_rate,
                                    d?.tax_category,
                                  ),d,"addAllTaxes('CGST')")} */}
                               <p className='p'>
                                  {groupTaxes(
                                    d.tax_rate,
                                    d?.tax_category,
                                  )}
                                </p>
                                <p className='p'>
                                  {groupTaxes(
                                    d.tax_rate,
                                    d?.tax_category,
                                  )}
                                </p>
                                {((tcs != 0 ) && (formatNumber(tcs) !=='')  ) &&
                                    <p className='p'>{formatNumber(tcs)}</p>
                                  }
                                  {( (tds != 0 ) && (formatNumber(tds) !=='') ) &&
                                    <p className='p'>{formatNumber(tds)}</p>
                                  }
                              </div>)}
                            </Grid>
                          </Grid>
                        </Grid>
                      </>
                    ) : (
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
                                  fontWeight:'bold'
                                }}
                              >
                                <div className='mlr'>
                                  <p className='p'>{multipleTaxes ? `IGST ${getIgst({
                                    taxes: d,
                                  })}%` : `IGST ${getIgst({
                                    taxes: d,
                                  })}%`}</p>
                                  {(formatNumber(tcspercent) !== '' && tcspercent !== '')&&
                                    <p className='p'>{`TCS ${formatNumber(tcspercent)}%`}</p>
                                  }
                                   {(formatNumber(tdspercent) !== '' && tdspercent !== '')&&
                                    <p className='p'>{`TDS ${formatNumber(tdspercent)}%`}</p>
                                  }
                                  {/* <p className='p'>{`SGST ${getIgst({taxes: d})/2}%`}</p> */}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Grid>

                        <Grid style={{ display: 'flex' }} size={5}>
                          <Grid container>
                            <Grid className='b_right b_left' size={3}></Grid>
                            <Grid className='b_right' size={2}></Grid>
                            <Grid className='b_right' style={{ textAlign: 'end' }} size={3}>
                              <div className='mlr'>
                                <p className='p'>{}</p>
                                {tcstaxvisible === true &&
                                  <p className='p'>{}</p>}
                                {/* <p className='p'>{getIgst({taxes: d})/2}</p> */}
                              </div>
                            </Grid>
                            {/* <Grid size={1} className='b_right'>
                              <div className='mlr'>
                                <p className='p'>%</p>
                                <p className='p'>%</p>
                              </div>
                              <div className='mlr'>
                                {
                                      tcstaxvisible === true && <p className='p'></p>
                                }
                              
                                <p className='p'>%</p>
                              </div>
                            </Grid> */}
                            <Grid style={{ textAlign: 'right',fontWeight:'bold' }} size={4}>
                              <div className='mlr'>
                                <p className='p'>
                                  {multipleTaxes ? addAllTaxes1('IGST') : groupTaxes(
                                    getIgst({ taxes: d }),
                                    d?.tax_category,
                                  )}
                                </p>
                                {tcs ? (
                                    tcspercent !== '0' && tcspercent !== '0%' ? (
                                      <p className='p'>{formatNumber(tcs)}</p>
                                    ) : (
                                      <p className='p'> </p>
                                    )
                                  ) : (
                                    <p className='p'> </p>
                                  )}
                                  {tds ? (tdspercent !== '0' && tdspercent !== '0%' ? (
                                      <p className='p'>{formatNumber(tds)}</p>
                                      ) : (
                                        <p className='p'> </p>
                                      )
                                    ) : (
                                      <p className='p'> </p>
                                    )}
                               
                              
                                {/* <p className='p'>{groupTaxes(getIgst({taxes: d})/2,d[0]?.tax_category)}</p> */}
                              </div>
                            </Grid>
                          </Grid>
                        </Grid>
                      </>
                    ),
                  )}

                  {
                    custType === 'CUSTOMER' &&
                    <Grid size={7}>
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
                              fontWeight:'bold'
                            }}
                          >
                            {dc_number == null &&<div className='mlr'>
                            <p className='p'>{'Rounded Off'}</p>
                            {/* <p className='p'>{`SGST ${getIgst({taxes: d})/2}%`}</p> */}
                          </div>}
                          </div>
                        </div>
                      </div>
                    </Grid>
                  }
                  {
                    custType === 'CUSTOMER' &&
                    <Grid style={{ display: 'flex' }} size={5}>
                      <Grid container>
                        <Grid className='b_right b_left' size={3}></Grid>
                        <Grid className='b_right' size={2}></Grid>
                        <Grid className='b_right' style={{ textAlign: 'end' }} size={3}>
                          <div className='mlr'>
                            <p className='p'>{}</p>
                            
                            {/* <p className='p'>{getIgst({taxes: d})/2}</p> */}
                          </div>
                        </Grid>
                        {/* <Grid size={1} className='b_right'>
                          <div className='mlr'>
                            <p className='p'>%</p>
                            <p className='p'>%</p>
                          </div>
                          <div className='mlr'>
                            {
                                  tcstaxvisible === true && <p className='p'></p>
                            }
                          
                            <p className='p'>%</p>
                          </div>
                        </Grid> */}
                        <Grid style={{ textAlign: 'right',fontWeight:'bold' }} size={4}>
                        {dc_number == null &&<div className='mlr'>
                            <p className='p'>{`${rounded_off}`}</p>
                            {/* <p className='p'>{`SGST ${getIgst({taxes: d})/2}%`}</p> */}
                          </div>}
                        </Grid>
                      </Grid>
                    </Grid>
                  }

                  
                  <Grid style={{pageBreakInside:'avoid'}} size={7}>
                    <div className='b_top b_bottom' style={{ display: 'flex' }}>
                      <p className='b_right p' style={{ width: 25 }}></p>
                      <p style={{ marginLeft: 'auto',fontWeight:'bold',paddingTop:'3px' }} className='mlr p'>
                        Total
                      </p>
                    </div>
                  </Grid>
                  <Grid style={{pageBreakInside:'avoid'}} size={5}>
                    <Grid
                      container
                      className='b_top b_bottom'
                      style={{ textAlign: 'right',fontWeight:'bold' }}
                    >
                      <Grid className='b_right b_left' size={3}>
                        <p style={{ width: 67.59  }} className='p'></p>
                      </Grid>
                      <Grid className=' b_right' size={2}>
                        <p className='mlr p' >{`${totalQuantity() == 0 ? sales_items[0]?.return_quantity : totalQuantity() }`}</p>
                      </Grid>
                      <Grid className='b_right ' size={3}></Grid>
                      {/* <Grid size={1} className='b_right'></Grid> */}
                      <Grid size={4}>
                        <p className='mlr p' style={{paddingTop:'3px'}}>
                        {`₹ ${((totalCost() + taxes() + Number(tcs ?? 0)) - Number(tds ?? 0) + Number(rounded_off || 0)).toFixed(2)}`}
                          {/* {`₹ ${(totalCost() + taxes() + tcstaxes()).toFixed(1)}`} */}
                        </p>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid className='b_bottom' style={{pageBreakInside:'avoid'}} size={12}>
                    <div style={{ display: 'flex',paddingTop:'3px' }}>
                      <p className='p plr'>Amount in Words</p>
                      {/* <p style={{ marginLeft: 'auto' }} className='p plr'>
                        E. & O.E
                      </p> */}
                    </div>
                    <b><p className='p plr' >{`INR ${inWords(
                      Math.abs((totalCost() + taxes() + Number(tcs ?? 0) )- Number(tds ?? 0) + Number(rounded_off || 0)).toFixed(1),
                    )}`}</p></b>
                  </Grid>

                  <Grid style={{pageBreakInside:'avoid'}} size={12}>
                    <Grid container className='' >
                      <Grid className='b_right' size={dc_number == null ? 2 : 10}>
                        <p className='b_bottom t_center p' style={{ height: '100%'}}>
                          HSN/SAC
                        </p>
                      </Grid>
                      <Grid size={dc_number == null ? 10 : 2}>
                        <Grid container size={12}>
                          <Grid className='b_right' size={2}>
                            <div
                              className='b_bottom'
                              style={{ textAlign: 'center', height: '100%' }}
                            >
                              <p className='p' >Taxable</p>
                              <p className='p' >Value</p>
                            </div>
                          </Grid>
                          {getGst() && dc_number == null ? (
                            <>
                              <Grid className='b_right t_center' size={2}>
                                <p className='p'>Central Tax</p>
                                <Grid container className='b_top'>
                                  <Grid className='b_right' size={5}>
                                    <p className='p b_bottom' >Rate</p>
                                  </Grid>
                                  <Grid size={7}>
                                    <p className='p b_bottom' >Amount</p>
                                  </Grid>
                                </Grid>
                              </Grid>
                              <Grid className='b_right t_center' size={2}>
                                <p className='p'>State Tax</p>
                                <Grid container className='b_top'>
                                  <Grid className='b_right' size={5}>
                                    <p className='b_bottom p' >Rate</p>
                                  </Grid>
                                  <Grid size={7}>
                                    <p className='b_bottom p' >Amount</p>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </>
                          ) : (
                            dc_number == null && <Grid className='b_right t_center' size={2}>
                              <p className='p'>Integrated Tax</p>
                             <Grid container className='b_top'>
                                <Grid className='b_right' size={5}>
                                  <p className='b_bottom p' >Rate</p>
                                </Grid>
                                <Grid size={7}>
                                  <p className='b_bottom p' >Amount</p>
                                </Grid>
                              </Grid>
                            </Grid>
                          )}
                          {dc_number == null && (<Grid className='b_right t_center' size={2}>
                            <p className='p'>TCS</p>
                            <Grid container className='b_top'>
                              <Grid className='b_right' size={5}>
                                <p className='b_bottom p' >Rate</p>
                              </Grid>
                              <Grid size={7}>
                                <p className='b_bottom p' >Amount</p>
                              </Grid>
                            </Grid>
                          </Grid>)}

                          {dc_number == null && (<Grid className='b_right t_center' size={2}>
                            <p className='p'>TDS</p>
                            <Grid container className='b_top'>
                              <Grid className='b_right' size={5}>
                                <p className='b_bottom p' >Rate</p>
                              </Grid>
                              <Grid size={7}>
                                <p className='b_bottom p' >Amount</p>
                              </Grid>
                            </Grid>
                          </Grid>)}

                          {dc_number == null && (<Grid size={2}>
                            <div
                              className='b_bottom'
                              style={{ height: '100%', textAlign: 'center' }}
                            >
                              <p className='p'>Total</p>
                              <p className='p'>Tax Amount</p>
                            </div>
                          </Grid>)}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>

                  {arr?.map((d) => (
                    <>
                      <Grid key={d} size={12}>
                        <Grid container className=''>
                          <Grid className='b_right' size={dc_number == null ? 2 : 10}>
                            <p className='b_bottom plr p' style={{padding:'5px' }}>{d.hsn_code || 'no hsn'}</p>
                          </Grid>
                          <Grid size={dc_number == null ? 10 : 2}>
                            <Grid container size={12}>
                            {dc_number == null && (<Grid className='b_right' size={2}>
                                <p className='b_bottom t_right plr p' style={{fontWeight:'bold',padding:'5px' }} >
                                  {(d.totalVal || 0).toFixed(1)}
                                </p>
                              </Grid>)}
      {/* {console.log(getGst(),dc_number,"comesghere")} */}
                              {getGst() && dc_number == null ? (
                                <>
                                  <Grid style={{fontWeight:'bold' }} className='b_right t_center' size={2}>
                                    <Grid container className='' size={2}>
                                      <Grid className='b_right' style={{fontWeight:'bold',padding:'5px' }} size={5}>
                                        <p className='p b_bottom t_right plr' >{`${getIgst(d) / 2
                                          }%`}</p>
                                      </Grid>
                                      <Grid size={7}>
                                        <p className='p b_bottom t_right plr' style={{fontWeight:'bold',padding:'5px' }}>
                                          {totaltaxOnly(
                                            d.totalVal,
                                            getIgst(d) / 2,
                                          ).toFixed(1)}
                                          {/* {taxOnly(
                                            d.quantity,
                                            custType === 'CUSTOMER'
                                              ? d.item_unit_price
                                              : d.item_cost_price,
                                            getIgst(d) / 2,
                                          ).toFixed(1)} */}
                                        </p>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                  <Grid style={{ fontWeight:'bold' }} className='b_right t_center' size={2}>
                                    <Grid container >
                                      <Grid className='b_right' style={{fontWeight:'bold',padding:'5px' }}>
                                        <p className='b_bottom t_right plr p' >{`${getIgst(d) / 2
                                          }%`}</p>
                                      </Grid>
                                      <Grid>
                                        <p className='b_bottom t_right plr p' style={{fontWeight:'bold',padding:'5px' }} >
                                          {totaltaxOnly(
                                            d.totalVal,
                                            getIgst(d) / 2,
                                          ).toFixed(1)}
                                          {/* {taxOnly(
                                            d.quantity,
                                            custType === 'CUSTOMER'
                                              ? d.item_unit_price
                                              : d.item_cost_price,
                                            getIgst(d) / 2,
                                          ).toFixed(1)} */}
                                        </p>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </>
                              ) : (
                                dc_number == null && <Grid style={{ fontWeight:'bold'}} className='b_right t_center' size={2}>
                                  <Grid container >
                                    <Grid className='b_right'>
                                      <p className='b_bottom t_right plr p'  style={{fontWeight:'bold',padding:'5px' }}>{`${getIgst(
                                        d,
                                      )}%`}</p>
                                    </Grid>
                                    <Grid>
                                      <p className='b_bottom t_right plr p' style={{fontWeight:'bold',padding:'5px' }} >
                                        {totaltaxOnly(
                                          d.totalVal,
                                          getIgst(d),
                                        ).toFixed(1)}
                                      </p>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              )}
                               {dc_number == null && (<Grid style={{ fontWeight:'bold' }} className='b_right t_center' size={2}>
                                <Grid container >
                                  <Grid className='b_right'>
                                    <p className='b_bottom t_right plr p'style={{fontWeight:'bold',padding:'5px' }} >{`${tcspercent}%`}</p>
                                  </Grid>
                                  <Grid>
                                    <p className='b_bottom t_right plr p'  style={{fontWeight:'bold',padding:'5px' }}>
                                      {totaltaxOnly(
                                        d.totalVal,
                                        getTcs(d),
                                      ).toFixed(1)}
                                     
                                    </p>
                                  </Grid>
                                </Grid>
                              </Grid>)}

                              <Grid size={2}>
                                <p className='b_bottom t_right plr p' style={{fontWeight:'bold',padding:'5px',textAlign:'center' }}>
                                  {(totaltaxOnly(
                                    d.totalVal,
                                    getIgst(d),
                                  ) + totaltaxOnly(d.totalVal, getTcs(d))).toFixed(1)}
                                  {/* {taxOnly(
                                    d.quantity,
                                    custType === 'CUSTOMER'
                                      ? d.item_unit_price
                                      : d.item_cost_price,
                                    getIgst(d),
                                  ).toFixed(1)} */}
                                </p>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </>
                  ))}
                  
                  {
                    hsnGroupedData.map((data) => (
                      <Grid key={data.hsn_code} style={{pageBreakInside:'avoid'}} size={12}>
                        <Grid container className='b_bottom'>
                          <Grid className='b_right' size={dc_number == null ? 2 : 10}>
                            <p className='t_left mlr p' style={{fontWeight:'bold',padding:'5px' }}> {data?.hsn_code}</p>
                          </Grid>
                          <Grid size={dc_number == null ? 10 : 2}>
                            <Grid container size={12}>
                            {dc_number == null && (<Grid className='b_right' size={2}>
                                <p className='t_right plr p' style={{fontWeight:'bold',padding:'5px' }}>{data.untaxed_amount.toFixed(1)}</p>
                              </Grid>)}
      {/* {console.log(getGst(),dc_number,data,"mcbvffdf")} */}
                              {getGst() && dc_number == null  ? (
                                <>
                                  <Grid style={{fontWeight:'bold'}} className='b_right t_center' size={2}>
                                    {/* {console.log(data,"nbvh")} */}
                                    <Grid container  className=''>
                                      <Grid className='b_right' size={5}>
                                        <p className='p' style={{fontWeight:'bold' ,padding:'5px'}}>{data.tax_rate / 2}%</p>
                                      </Grid>
                                      <Grid size={7}>
                                        <p className='p t_right plr' style={{fontWeight:'bold' ,padding:'5px'}}>
                                          {(data.taxed_amount / 2).toFixed(1)}
                                        </p>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                  <Grid style={{ fontWeight:'bold'}} className='b_right t_center' size={2}>
                                    <Grid container>
                                      <Grid className='b_right' size={5}>
                                        <p className='p' style={{fontWeight:'bold' ,padding:'5px'}}>{data.tax_rate / 2}%</p>
                                      </Grid>
                                      <Grid size={7}>
                                        <p className='t_right plr p' style={{fontWeight:'bold' ,padding:'5px'}} >
                                          {(data.taxed_amount / 2).toFixed(1)}
                                        </p>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </>
                              ) : (
                                dc_number == null && <Grid style={{ fontWeight:'bold'}} className='b_right t_center' size={2}>
                                  <Grid container>
                                    <Grid className='b_right' size={5}>
                                      <p className='p' style={{fontWeight:'bold' ,padding:'5px'}} >{data.tax_rate}%</p>
                                    </Grid>
                                    <Grid size={7}>
                                      <p className='t_right plr p' style={{fontWeight:'bold' ,padding:'5px'}}>
                                        {data.taxed_amount.toFixed(1)}
                                      </p>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              )}
                               {dc_number == null && (<Grid style={{ fontWeight:'bold' }} className='b_right t_center' size={2}>
                                <Grid container>
                                    <Grid className='b_right' size={5}>
                                      <p className='p' style={{fontWeight:'bold' ,padding:'5px'}}>
                                        {(tcspercent !== '' && tcspercent !== undefined && !isNaN(tcspercent))
                                          ? `${formatNumber(tcspercent)}%`
                                          : ''}
                                      </p>
                                    </Grid>
                                  <Grid size={7}>
                                    <p className='t_right plr p' style={{fontWeight:'bold' ,padding:'5px'}}>
                                      {tcs}
                                    </p>
                                  </Grid>
                                </Grid>
                              </Grid>)}
                              {dc_number == null && (<Grid style={{ fontWeight:'bold' }} className='b_right t_center' size={2}>
                                <Grid container>
                                    <Grid className='b_right' size={5}>
                                      <p className='p' style={{fontWeight:'bold' ,padding:'5px'}}>
                                        {(tdspercent !== '' && tdspercent !== undefined && !isNaN(tdspercent))
                                          ? `${formatNumber(tdspercent)}%`
                                          : ''}
                                      </p>
                                    </Grid>
                                  <Grid size={7}>
                                    <p className='t_right plr p' style={{fontWeight:'bold' ,padding:'5px'}}>
                                      {tds}
                                    </p>
                                  </Grid>
                                </Grid>
                              </Grid>)}
                              <Grid size={2}>
                                {/* <p className='t_right plr p' style={{fontWeight:'bold',padding:'5px',textAlign:'center' }}> {`₹ ${((data.untaxed_amount + data.taxed_amount + Number(tcs ?? 0)) - Number(tds ?? 0)).toFixed(1)}`}</p> */}
                                <p className='t_right plr p' style={{fontWeight:'bold',padding:'5px',textAlign:'center' }}> {`₹ ${(data.taxed_amount - Number(tds ?? 0)).toFixed(1)}`}</p>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    ))
                  }

                  <Grid style={{pageBreakInside:'avoid'}} size={12}>
                    <p className='mlr p' >
                      {`Amount Chargeable (in words) : INR ${inWords(Math.abs((Number(tds ?? 0) - (taxes() + Number(tcs ?? 0)))).toFixed(1))}`}

                    </p>
                    <Grid container style={{ marginTop: 10, minHeight: '100px',pageBreakInside:'avoid' }}>
                      <Grid size={6}></Grid>
                      <Grid size={6}>
                       
                      </Grid>
                      <Grid size={6}>
                        <p className='mlr p'>
                          <span className='b_bottom'>Declaration</span>
                        </p>
                        <p style={{ height: 80,marginTop:5 }} className='mlr p'>
                          We confirm that this invoice represents the actual price of the specified goods and that all information provided is accurate and correct.
                        </p>
                      </Grid>
                     
                      <Grid
                        className='b_left b_top t_right'
                        style={{ display: 'flex',fontWeight:'bold' }}
                        size={6}>
                        <p className='mlr p'>for {companyName}</p>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
            </div>
          </div>
      <p className="t_center p">
          <i>*This invoice is system-generated</i>
        </p>
    </>
  );
}
