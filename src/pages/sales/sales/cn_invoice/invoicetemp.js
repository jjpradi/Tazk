import React, {useState, useEffect} from 'react';
import Grid from '@mui/material/Grid';
import '../styles.css';
import {useSelector} from 'react-redux';

export default function invoicetemp({
  sales_payments,
  appConfigData,
  note,
  custType,
  custData,
  invoice,
  soDate,
  sales_items,
  posSale,
  manualnote,
  tcstaxvisible,
}) {
  const {companyName, companyAddress, companyEmail, gstin, companyMobile} =
    appConfigData || {};

  const taxes = () => {
    let total = 0;
    for (let data of sales_items) {
      const prc =
        custType === 'CUSTOMER' ? data.item_unit_price : data.item_cost_price;
      const qty =
        manualnote === undefined
          ? `${data.quantity}`
          : `${data.return_quantity}` || 1;
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
        const qty =
          manualnote === undefined ? data.quantity : data.return_quantity || 1;
        const tax = getTcs(data);
        total += ((prc * qty) / 100) * tax;
      }
      return total ? total : 0;
    }
  };

  const totalCost = () => {
    let total = 0;
    if (sales_items.length > 0) {
      sales_items.forEach((d) => {
        const prc =
          custType === 'CUSTOMER' ? d.item_unit_price : d.item_cost_price;
        total +=
          (manualnote === undefined ? d.quantity : d.return_quantity || 1) *
          prc;
      });
      return total;
    }
    if (sales_items.length === 0 && manualnote !== undefined) {
      let total = manualnote.amount || 0;
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
      manualnote === undefined
        ? (total += +d.quantity)
        : (total += +d.return_quantity);
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
      if (data.taxes[0]?.tax_category === tax_category) {
        const prc =
          custType === 'CUSTOMER' ? data.item_unit_price : data.item_cost_price;
        const qty =
          manualnote === undefined ? data.quantity : data.return_quantity || 1;
        total += ((prc * qty) / 100) * tax_rate;
      }
    }
    return total ? total.toFixed(2) : 0;
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

  console.log('sales_items',manualnote, sales_items);

  return `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <title>Credit Note</title>
       <style>
    @page {
        size: A4;
        margin: 5mm; /* Small margin all sides */
    }

    body {
        font-family: Poppins,sans-serif;
        font
        margin: 0;
        padding: 0;
        line-height: 1;
    }

    .container {
        width: 100%;
        padding: 0;
        box-sizing: border-box;
    }

   
    .header,.footer {
        display: flex;
        justify-content: center;
        font-size: 12px;
    }



    table {
        width: 100%;
        border-collapse: collapse; /* Cleaner table */
    }

    th, td {
        border: 1px solid black; /* consistent border */
        padding: 3px; /* neat padding */
        font-size: 10px;
        text-align: left;
        vertical-align: top;
        text-align: initial;

    }

    .cellheight {
        min-height: 10px;
        max-height: 10px;
    }



    @media print {
        body {
            margin: 0;
        }
    }
</style>
    </head>
    
    <body>
        <div class="container">
        <div></div>
            <table>
                <thead>
                <tr>
                <th colspan="8" style="border-bottom: none;border-top: none; border-right: none; border-left:none; text-align: center;font-size: 12px;">
                Credit Note
                </th>
                </tr>

                    <tr>
                      <td rowspan="2" colspan="4" style="width: 60%; font-size: 10px; line-height: 1.2; text-transform: uppercase;">
                      <strong style="font-weight: 900;font-size: 13px;">${companyName}</strong><br>
                      ${companyAddress ? companyAddress : ''}<br>
                      ${companyEmail ? `E-Mail: ${companyEmail}` : ''}<br>
                      ${
                        companyMobile ? `Contact No. : ${companyMobile}` : ''
                      }<br>
                      ${gstin ? `GSTIN/UIN : ${gstin}` : ''}<br>
                    </td>

                        <td colSpan="2" style="height: 25px">
                  Credit Note No.:<br />
                  <strong style="font-size: 12px;">${invoice || '-'}</strong>
                  </td>
                 <td colSpan="2">
                     Dated:<br />
                  <strong style="font-size: 12px;">${
                    soDate || new Date().toDateString()
                  }</strong>
                     </td>
                    </tr>
                    <tr width="40%">
                        <td colspan="2" style={{height:'10px'}}><strong></strong> </td>
                        <td colspan="2"> Mode/Terms of Payment </br>${
                          sales_payments ? sales_payments : '-'
                        }</td>
                    </tr>
                    <tr>
                   <td rowspan="2" colspan="4" style="font-size: 10px; line-height: 1.2;">
                     <span>Consignee (Ship to)<br></span>
                     <strong style="text-transform: uppercase; font-size: 13px;">
                       ${custData.company_name || custData.first_name}<br>
                     </strong>
                     ${custData.address ? `${custData.address}<br>` : ''}
                     ${custData.area ? `${custData.area}, ` : ''}
                    ${custData.city ? `${custData.city}, ` : ''}
                     ${custData.state ? `${custData.state}, ` : ''}
                     ${custData.zip ? `${custData.zip}<br>` : ''}
                     ${custData.email ? `E-Mail: ${custData.email}<br>` : ''}
                     ${
                       custData.tax_id
                         ? `GSTIN/UIN: ${custData.tax_id}<br>`
                         : ''
                     }
                    </td>
               <td colspan="2">Original Invoice No. & Date.</td>
               <td colspan="2">Other Reference</td>
                   </tr>

                    <tr>
                        <td colspan="2">Buyer’s Order No.</td>
                        <td colspan="2">Dated</td>
                    </tr>
                        <tr>
                        <td rowspan="3" colspan="4" style="font-size: 10px; line-height: 1.2;">
                       <span>Buyer (Bill to)<br></span>
                       <strong style="text-transform: uppercase; font-size:13px;">
                         ${custData.company_name || custData.first_name}
                       </strong><br>
                       ${custData.address ? `${custData.address}<br>` : ''}
                       ${custData.area ? `${custData.area}, ` : ''}
                       ${custData.city ? `${custData.city}, ` : ''}
                       ${custData.state ? `${custData.state}, ` : ''}
                       ${custData.zip ? `${custData.zip}<br>` : ''}
                       ${custData.email ? `E-Mail: ${custData.email}<br>` : ''}
                         ${
                           custData.tax_id
                             ? `GSTIN/UIN: ${custData.tax_id}<br>`
                             : ''
                         }
                       </td>

                                <td colspan="2" style="height: 30px">Dispatch Doc No.</td>
                                <td colspan="2" style="height: 30px"></td>
                          </tr>
                        <tr>
                            <td colspan="2" style="height: 30px">Dispatched through</td>
                            <td colspan="2" style="height: 30px">Destination</td>
                        </tr>
                        <tr style="height: 80px">
                            <td colspan="4">Terms of Delivery</td>
                            
                        </tr>
                        
                    <tr>
                        <td style="max-width:10px,min-width:10px">Sl No.</td>
                        <td style="text-align: center;min-width: 120px">Particulars</td>
                        <td >HSN/SAC</td>
                        <td >Quantity</td>
                        <td >Rate</td>
                        <td style="max-width:15px,min-width:15px">per</td>
                        <td style="max-width:20px,min-width:20px">Disc. %</td>
                        <td style="text-align: center;max-width:30px,min-width:30px">Amount</td>
                    </tr>
                </thead>
                <tbody>
                ${

                  manualnote !== undefined && manualnote.items && Array.isArray(manualnote.items) && manualnote.items.length > 0
                  ? manualnote.items.map((item, idx) => `<tr>
                        <td style="border-bottom: none;">${idx + 1}</td>
                        <th style="border-bottom: none; font-size:14px;">
                            ${item.name || item.ledgerName || ''}
                            ${item.description ? `<br><span style="font-weight:normal; font-size:11px; color:#555;">${item.description}</span>` : ''}
                        </th>
                        <td style="border-bottom: none;">${item.hsn_code || '-'}</td>
                        <td style="border-bottom: none;"></td>
                        <td style="border-bottom: none;"></td>
                        <td style="border-bottom: none;"></td>
                        <td style="border-bottom: none;"></td>
                        <th style="border-bottom: none; text-align: right;font-size:14px;">
                            ${(item.amount || 0).toFixed(2)}
                        </th>
                    </tr>`).join('')
                  : manualnote !== undefined &&
                  `<tr>
                        <td style="border-bottom: none;">${1}</td>
                        <th style="border-bottom: none; font-size:14px;">
                            ${manualnote?.name}
                            ${manualnote?.description ? `<br><span style="font-weight:normal; font-size:11px; color:#555;">${manualnote.description}</span>` : ''}
                        </th>
                        <td style="border-bottom: none;">${manualnote?.hsn_code || '-'}</td>
                        <td style="border-bottom: none;"></td>
                        <td style="border-bottom: none;"></td>
                        <td style="border-bottom: none;"></td>
                        <td style="border-bottom: none;"></td>
                        <th style="border-bottom: none; text-align: right;font-size:14px;">
                            ${(manualnote.amount || 0).toFixed(2)}<br>
                             ${
                               manualnote.tds_amount
                                 ? `(-)${(manualnote.tds_amount || 0).toFixed(2)}`
                                 : manualnote.gst_amount
                                 ? `(+)${(manualnote.gst_amount || 0).toFixed(2)}`
                                 : ''
                             }

                        </th>
                    </tr>
                    
                    <tr style="height:400px">
                        <td style="border-top: none;border-bottom: none;"></td>
                        <td style="border-top: none;border-bottom: none;"></td>
                        <td style="border-top: none;border-bottom: none;"></td>
                        <td style="border-top: none;border-bottom: none;"></td>
                        <td style="border-top: none;border-bottom: none;"></td>
                        <td style="border-top: none;border-bottom: none;"></td>
                        <td style="border-top: none;border-bottom: none;"></td>
                        <td style="border-top: none;border-bottom: none;"></td>
                    </tr>
                 
                    <tr>
                        <td></td>
                        <td style="text-align: right;"> Total</td>
                        <td></td>
                        <td>${totalQuantity()} NOS</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <th style="font-size:14px; text-align: right;">IN₹ ${
                          manualnote.tds_amount
                            ? (
                                manualnote.amount - manualnote.tds_amount
                              ).toFixed(2)
                            : manualnote.gst_amount
                            ? (
                                manualnote.amount + manualnote.gst_amount
                              ).toFixed(2)
                            : manualnote.amount.toFixed(2)
                        }</th>
                    </tr>
                    <tr>
                        <td colspan="6" style=" border-right:none;">
                            Amount Chargeable (in words) </br>
                            <strong style="text-transform: uppercase;">INR ${inWords(
                              manualnote.tds_amount
                                ? (
                                    manualnote.amount - manualnote.tds_amount
                                  ).toFixed(2)
                                : manualnote.gst_amount
                                ? (
                                    manualnote.amount + manualnote.gst_amount
                                  ).toFixed(2)
                                : manualnote.amount.toFixed(2),
                            )}</strong>
                        </td>
                        <td colspan="2" style="text-align: right; border-left:none;">
                        E. & O.E 
                        </td>
                    </tr>
                    <tr>
                        <td colspan="7" style="text-align: center;">
                            HSN/SAC
                        </td>
                        <td colspan="1" style="text-align: center;">
                            Taxable</br>
                            Value
                        </td>
                    </tr>
                    <tr>
                        <th colspan="7" style="text-align: start;">
                            -
                        </th>
                        <td colSpan="1" style="text-align: center;">
                    ${
                      manualnote.tds_amount
                        ? (manualnote.amount - manualnote.tds_amount).toFixed(2)
                        : manualnote.gst_amount
                        ? (manualnote.amount + manualnote.gst_amount).toFixed(2)
                        : manualnote.amount.toFixed(2)
                    }
                      </td>

                    </tr>
                    <tr>
                        <td colspan="7" style="text-align: end;">
                            Total
                        </td>
                        <td colspan="1" style="text-align: center;">
                           ${
                             manualnote.tds_amount
                               ? (
                                   manualnote.amount - manualnote.tds_amount
                                 ).toFixed(2)
                               : manualnote.gst_amount
                               ? (
                                   manualnote.amount + manualnote.gst_amount
                                 ).toFixed(2)
                               : manualnote.amount.toFixed(2)
                           }
                        </td>
                    </tr>
                    <tr>
                        <td colspan="8" style="text-align: start; "font-size:13px;>
                            Tax Amount (in words) : INR <span style="text-transform: uppercase;">${inWords(
                              manualnote.tds_amount
                                ? (
                                    manualnote.amount - manualnote.tds_amount
                                  ).toFixed(2)
                                : manualnote.gst_amount
                                ? (
                                    manualnote.amount + manualnote.gst_amount
                                  ).toFixed(2)
                                : manualnote.amount.toFixed(2),
                            )}</span>
                        </td>
                    </tr>
                    <tr>
                        <th colspan="8" style="text-align: end;border-bottom: none; text-transform: uppercase; font-size:12px; ">
                            for ${companyName}
                        </th>
                        <tr>
                        <td colspan="8" style="border-bottom: none;border-top: none;">
                            
                        </td>
                    </tr>
                    <tr>
                        <td colspan="8" style="text-align: end;border-top: none;">
                            Authorised Signatory
                        </td>
                    </tr>
                       <tr>
                        <td colspan="8" style="border-bottom: none;border-top: none; border-right: none; border-left:none; text-align: center;">
                            <small>This is a Computer Generated Document</small>
                        </td>
                    </tr>
                    </tr>`
                }
                </tbody>
            </table>
        </div>
    </body>
    
    </html>`;
}
