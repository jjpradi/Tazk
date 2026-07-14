import moment from 'moment';
import {getsessionStorage} from 'pages/common/login/cookies';

export const ReceiptTemp = (data) => {
  console.log(data, 'data');
  const storage = getsessionStorage();
  const adminAdress = storage?.address;
function inWords(num) {
    if (num.length > 9) return 'overflow';
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
    let getStr = price_in_words(+num);   
      getStr += ' Only';   
    return getStr;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt</title>
  <style>
    body {
      font-family: Poppins, sans-serif;
      margin: 0;
      padding: 0;
      background:rgb(255, 255, 255);
    }
    .container {
      padding: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      background:rgb(255, 255, 255);

    }
    .line {
    display: inline-block;
    border-bottom: 1px solid #c3bebe;
    padding-bottom: 1px; 
  }
    .header {
      text-align: left;
    }
    .header h4 {
      margin-bottom: 5px;
    }
    .subHeading {
    text-align: center;
    }
    .info, .payment-details, .footer {
      margin-top: 20px;
    }
    .info td, .payment-details td {
      padding: 8px;
    }
        .info-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    font-size: 12px;
    
  }

  .info {
    font-family: Poppins, sans-serif;
    font-size: 14px;
  }
    .highlight-box {
      background: #4CAF50;
      color: white;
      padding: 10px;
      text-align: center;
      font-size: 18px;
      border-radius: 1px;
      margin-top: 10px;
      height:160px;
      display: flex;
    }
    .over-payment {
      color: #007BFF;
      font-weight: bold;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    .table th, .table td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
      color: rgb(0, 0, 0);
    }
    .table th {
      background-color: #f2f2f2;
    }
    td, div {
      color: rgb(0, 0, 0);
    }
    .footer {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
    }
    @media (max-width: 600px) {
      .footer {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h3>${data?.company_name}</h3>
      <p>chennai, Tamil Nadu, India<br>
        GSTIN 33AADCV3489N1ZR<br>
        veeteecommunications@gmail.com</p>
    </div>

    <hr>

    <h3 class="subHeading">RECEIPT</h3>
<div class="info-wrapper">
  <!-- Left: Table -->
  <table class="info">
    <tr>
       <td>Payment Date:</td>
       <td style="border-bottom: 1px solid #c3bebe;"><strong>${(data?.receipt_date)}</strong></td>
    </tr>
    <tr>
      <td>Reference Number:</td>
      <td style="border-bottom: 1px solid #c3bebe;"></td>
    </tr>
    <tr>
      <td>Payment Mode:</td>
      <td style="border-bottom: 1px solid #c3bebe;"><strong>Cash</strong></td>
    </tr>
    <tr>
      <td>Amount Received In Words:</td>
      <td style="border-bottom: 1px solid #c3bebe;"><strong>Indian Rupee ${inWords(data?.paid_amount)}</strong></td>
    </tr>
  </table>

  <!-- Right: Div Content -->
  <div class="highlight-box" style="rgb(255, 255, 255)">
      <div style="display: flex; align-items: center; color: rgb(255, 255, 255)">Amount Received </br>
       ₹${data?.paid_amount}
       </div>
    </div>
</div>

  

    <div class="info">
      <p><strong>Received From </br>
      </strong> ${data?.company_name} </p>
    </div>

    <div class="footer">
      <div></div>
      <div><strong>Authorized Signature</strong></div>
    </div>
     <hr >
    <div>
     <strong> Over payment </strong>
      </br>
      ₹${data?.total}
    </div>
    <hr >
    <table class="table">
      <thead>
        <tr>
          <th>Invoice Number</th>
          <th>Invoice Date</th>
          <th style="text-align:right">Invoice Amount</th>
          <th style="text-align:right">Payment Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td> <p style="color: #1b8fbf;">${data?.invoice_number}</p></td>
          <td>${data?.invoice_date}</td>
          <td style="text-align:right">${data?.total}</td>
          <td style="text-align:right">${data?.paid_amount}</td>
        </tr>
      </tbody>
    </table>
  </div>
</body>
</html>`;
};
