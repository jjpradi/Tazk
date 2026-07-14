import moment from 'moment/moment';
import CorporateFareIcon from '../../assets/dashboardIcons/office-building.png';

export const PaySlipTemp = (data,ytd) => {
  console.log(data,ytd, 'dataqqq');

  // Loans Table
  let loansTable = `
    <tr>
        <td colspan="2" class="th text-left">Loan Number</td>
        <td colspan="2" class="th text-left">Loan Amount</td>
        <td colspan="1" class="th text-left">Payment Type</td>
        <td colspan="3" class="th text-left">Date</td>
        <td colspan="2" class="th text-left">Paid Amount</td>
        <td colspan="2" class="th text-left">Due</td>
    </tr>`;

  if (data?.loans?.length) {
    data?.loans?.forEach((l) => {
      let loanPaymentDates = ``;

      for (let d = 0; d < l.transactions.length; d++) {
        if (d !== 0) loanPaymentDates += `</br>`;
        loanPaymentDates += `${new Date(
          l.transactions[d].transactionDate,
        ).toLocaleDateString('en-GB')}`;
      }

      const tempLoan = `
            <tr>
                <td colspan="2" class="th text-left">${l.loan_number}</td>
                <td colspan="2" class="th text-left">${
                  l.Required_Amount || 0
                }</td>
                <td colspan="1" class="th text-left">${
                  l.Repayment_method === 'AUTO_DEDUCTION_FROM_SALARY'
                    ? 'Auto'
                    : 'Manual'
                }</td>
                <td colspan="3" class="th text-left">${
                  loanPaymentDates === '' ? '-' : loanPaymentDates
                }</td>
                <td colspan="2" class="th text-left">${l.paid_amount || 0}</td>
                <td colspan="2" class="th text-left">${l.outStanding || 0}</td>
            </tr>`;
      loansTable += tempLoan;
    });
  }
  const generateLoanRows = () => {
    if (!data?.loans?.length) return `<tr></tr>`;

    return data.loans
      .map((loan) => {
        const loanPaymentDates = loan.transactions
          .map((tx) => new Date(tx.transactionDate).toLocaleDateString('en-GB'))
          .join('<br/>');

        return `
                <tr>
                    <td class="th text-left" style="border-left:1.5px solid black;">Advance</td>
                    <td class="th text-left">${loan.Required_Amount || 0}</td>
                    <td class="th text-left">${loan?.amount_per_month || '-'}</td>
                    <td style="text-align: right;  padding-right: 8px;">${loan.outStanding || 0}</td>
                    <td style="text-align: right;  padding-right: 8px;">${loan.paid_amount || 0}</td>
                    
                </tr>
            `;
      })
      .join('');
  };

  // Allowance and Deduction Table

  const date = new Date();
  let currentDate = moment(date).format('DD-MM-YYYY');

  const originalAllowances = data?.original_allowance_json || [];
  const earnedAllowances = data?.allowance_json || [];
  const deductions = data?.deduction_json || [];

  const originalAllowanceData = originalAllowances
    ?.filter((i) => +i.allowance_amount > 0)
    .map((allowance) => ({
      name: allowance?.allowance_code,
      amount: allowance?.allowance_amount,
    }));

  const earnedAllowanceData = earnedAllowances
    ?.filter((i) => +i.allowance_amount > 0)
    .map((allowance) => ({
      name: allowance?.allowance_code,
      amount: allowance?.allowance_amount,
    }));

  const deductionData = deductions
    ?.filter((i) => +i.deduction_amount > 0)
    .map((deduction) => ({
      name: deduction.deduction_name,
      amount: deduction.deduction_amount,
    }));

  let allowance_deduction = '';
  let maxLen = Math.max(
    originalAllowanceData.length,
    earnedAllowanceData.length,
    deductionData.length,
  );
  if (maxLen < 10) {
    maxLen = 10;
  }

  for (let i = 0; i < maxLen; i++) {
    let temp_all_ded = `<tr>`;
    temp_all_ded += `
                        <td colspan="2" class="text-left borderY-0">${
                          originalAllowanceData[i]
                            ? originalAllowanceData[i].name
                            : ''
                        }</td>
                        <td colspan="2" class="borderY-0 text-right">${
                          originalAllowanceData[i]
                            ? originalAllowanceData[i].amount
                            : ''
                        }</td>
                        <td colspan="2" class="borderY-0 text-right">${
                          earnedAllowanceData[i]
                            ? earnedAllowanceData[i].amount
                            : ''
                        }</td>

                        <td colspan="2" class="text-left borderY-0">${
                          deductionData[i] ? deductionData[i].name : ''
                        }</td>
                        <td colspan="4" class="borderY-0 text-right">${
                          deductionData[i] ? deductionData[i].amount : ''
                        }</td>
                        `;

    allowance_deduction += temp_all_ded + `</tr>`;
  }

  function numberToWords(number) {
    const units = [
      '',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
    ];
    const teens = [
      '',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ];
    const tens = [
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
    ];

    if (number === 0) return 'Zero';

    function convert(num) {
      if (num < 10) return units[num];
      else if (num < 20) return teens[num - 10];
      else if (num < 100)
        return tens[Math.floor(num / 10)] + ' ' + convert(num % 10);
      else if (num < 1000)
        return units[Math.floor(num / 100)] + ' Hundred ' + convert(num % 100);
      else if (num < 1000000)
        return (
          convert(Math.floor(num / 1000)) + ' Thousand ' + convert(num % 1000)
        );
      else if (num < 1000000000)
        return (
          convert(Math.floor(num / 1000000)) +
          ' Million ' +
          convert(num % 1000000)
        );
      else if (num < 1000000000000)
        return (
          convert(Math.floor(num / 1000000000)) +
          ' Billion ' +
          convert(num % 1000000000)
        );
    }

    return convert(number);
  }
  const generateTableRows = (data, ytd) => {
    const rows = [];
     
    const allowances = data?.allowance_json || [];
    const deductions = data?.deduction_json || [];
    
    const maxRows = Math.max(allowances.length, deductions.length);

    const totalRows = Math.max(maxRows, 5);
  
    for (let i = 0; i < totalRows; i++) {
      const allowance = allowances[i] || {};
      const deduction = deductions[i] || {};
  
      const allowanceName = allowance.allowance_name || '-';
      const allowanceAmount = allowance.allowance_amount || '-';
      const ytdAllowance = ytd[data?.employee_id]?.[allowance.allowance_code] || '-';
    
      const deductionName = deduction.deduction_name || '-';
      const deductionAmount = deduction.deduction_amount || '-';
      const ytdDeduction = ytd[data?.employee_id]?.[deduction.deduction_code] || '-';
  
      rows.push(`
        <tr>
          <td colspan="1" class="tal-1">${allowanceName}</td>
          <td colspan="1" class="tar" style="border-left: 1.5px solid black;">${allowanceAmount}</td>
          <td colspan="1" class="tac" style="border-left: 1.5px solid black;">${ytdAllowance}</td>
          <td colspan="1" class="tal-1" style="border-left: 1.5px solid black;">${deductionName}</td>
          <td colspan="1" class="tar" style="border-left: 1.5px solid black;">${deductionAmount}</td>
          <td colspan="1" class="tac" style="border-left: 1.5px solid black;border-right: 1.5px solid black;">${ytdDeduction}</td>
        </tr>
      `);
    }
  
    return rows.join('');
  };
  
  
  
  return `<!DOCTYPE html>
    <html>
    <meta charset="utf-8">
    <title>Pay slip</title>
    <style type="text/css">

     @page {
  size: A4;
  margin: 0 20mm 0 20mm;
}

body {
  margin: 0;
  padding: 0;
  height: 100%;
}

.myContainer {
  margin: 5px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
  height: 180px;
}

.header .company-info {
  text-align: left;
  margin-left: 5px;
  height: 150px;
}

.header .logo {
  text-align: right;
  margin-right: 10px;
}

.header .logo img {
  max-width: 100px;
  max-height: 100px; 
  margin-right: 50px;
}

.header img {
  margin-bottom: 0; 
}


.table {
  width: 100%;
}

.table td,
.table th {
  height: 23px;
  border-top: 1.5px solid black;
  font-family: Poppins, sans-serif;
  font-size: 16px;
  border-right: 1.5px solid black;
  padding-left:8px;
}

.table2 {
  width: 100%;
}

.table2 td,
.table2 th {
  height: 23px;
  font-family: Poppins, sans-serif;
  font-size: 18px;
  padding-left:8px;
}

.tac {
  text-align: center;
  width: 80px;
}

.tar {
  text-align: right;
  width: 110px;
  padding-right:8px;
}

.tat {
  vertical-align: top;
}

.tal-1 {
  text-align: start;
 width: 250px; 
 word-wrap: break-word;
 margin-left:2px
}

.talH {
  text-align: left;
  border-right: 1.5px solid black;
  border-top: 1.5px solid black;
  border-bottom: 1.5px solid black;
}

.tacH {
  text-align: center;
   border-right: 1.5px solid black;
  border-top: 1.5px solid black;
  border-bottom: 1.5px solid black;
}

.tal1 {
  text-align: left;
  padding-left: 10px;
}

.border-td {
  border-top: 1.5px solid black;
  border-bottom: 1.5px solid black;
}

.border {
  border: 1.5px solid black;
}

.footer {
margin-top:730px;
font-size:16px;
}
  .footer p {
    margin: 2px 0; 
  }
  </style>
<div>
   <table class="table" cellspacing="0" style="width: 100%;">
  <tr>
    <td colspan="6" style="text-align: left; border-left: 1.5px solid black;">
      <div class="header">
        <div class="company-info">
          <h2 style=" margin: 0;">${data?.company_name.toUpperCase() || 'Company Name'}</h2>
          <p style="font-size: 14px; width: 400px; word-wrap: break-word; margin-top:0px; margin-bottom:0px">${data.companyAddress || 'Company Address'}</p>
          <p style="font-size: 14px;  margin-top:0px; margin-bottom:0px">${data.companyCity} - ${data?.companyPincode} </p>
          <p style="font-size: 14px;  margin-top:0px;">${data.companyState} ,  ${data.companyCountry} </p>
          <h4 style=" margin-top: 40px;">PAYSLIP FOR THE MONTH OF ${data?.monthName.toUpperCase()} ${data?.salary_year}</h4>
        </div>
        <div class="logo">
          <img src="${data.companyLogo ?? CorporateFareIcon}" alt="Logo">
        </div>
      </div>
    </td>
  </tr>
     <tr>
       <th colspan="1" class="tal-1" style="text-align:left; border-left:1.5px solid black;">
         Employee Code
       </th>
       <td colspan="1" class="tal-1" >
         ${data?.employee_code || "-"}
       </td>
       <th colspan="1" class="tal-1" style="text-align:left" >
         Employee Name
       </th>
       <td colspan="3" class="tal-1">
        ${data?.full_name || "-"}
       </td>
     </tr>
     <tr>
       <th colspan="1" class="tal-1"  style="text-align:left; border-left:1.5px solid black;">
         Designation 
       </th>
       <td colspan="1" class="tal-1">
         ${data?.designation || "-"}
       </td>
       <th colspan="1" class="tal-1" style="text-align:left">
         Department 
       </th>
       <td colspan="1" class="tal-1">
         ${data?.department || "-"}
       </td>
      <th colspan="1" class="tal-1"  style="text-align:left; ">
         PAN
       </th>
       <td colspan="1" class="tal-1">
       CEZPK0972F
       </td>
     </tr>
     
    <tr>
       <th colspan="1" class="tal-1"  style="text-align:left; border-left:1.5px solid black;">
         Location  
       </th>
       <td colspan="1"  class="tal-1">
       ${data?.companyAddress || ''}
       </td>
       <th colspan="1"  class="tal-1" style="text-align:left">
         Gender 
       </th>
       <td colspan="1"  class="tal-1">
         ${data?.Gender || "-"}
       </td>
       <th colspan="1" class="tal-1" style="text-align:left">
         UAN 
       </th>
       <td colspan="1" class="tal-1">
       ${data?.epf || "-"}
       </td>
     </tr>
     <tr>
      <th colspan="1"  class="tal-1" style="text-align:left; border-left:1.5px solid black;">
         Date of Birth
       </th>
       <td colspan="1"  class="tal-1">
       ${moment(data?.dob).format('DD/MM/YYYY') || "-"}
       </td>
       <th colspan="1" class="tal-1"  style="text-align:left; ">
         Date of Joining 
       </th>
       <td colspan="1" class="tal-1">
       ${moment(data?.dateOfJoining).format('DD/MM/YYYY') || "-"}
       </td>
       <th colspan="1" class="tal-1" style="text-align:left">
         ESI No
       </th>
       <td colspan="1" class="tal-1">
       ${data?.esic || "-"}
       </td>
     </tr>
     <tr>
      
       <th colspan="1" class="tal-1" style="text-align:left; border-left:1.5px solid black;">
         Bank Name 
       </th>
       <td colspan="1" class="tal-1">
       ${data?.bank_name || "-"}
       </td>
       <th colspan="1" class="tal-1" style="text-align:left">
         IFSC Code
       </th>
       <td colspan="1" class="tal-1">
         ${data?.ifsc_code || "-"}
       </td>
        <th colspan="1" class="tal-1" style="text-align:left">
         Bank A/c No
       </th>
       <td colspan="1" class="tal-1">
         ${data?.beneficiary_account_no || "-"}
       </td>
     </tr>
      <tr>
       <th colspan="6" style="border-right:1.5px solid black; border-left:1.5px solid black;">
       </th>
     </tr>
     </table>
  <table class="table2" cellspacing="0" style="border-left:1.5px solid black;width: 100%;">
  <tr>
    <th class="talH">Earnings</th>
    <th class="tacH">Amount</th>
    <th class="tacH">YTD</th>
    <th class="talH">Deductions</th>
    <th class="tacH">Amount</th>
    <th class="tacH">YTD</th>
  </tr>
  ${generateTableRows(data, ytd)}
  <tr>
       <th colspan="1" class="tal-1"  style="border-bottom:1.5px solid black;border-top:1.5px solid black;">
      Total Earnings
       </th>
       <td colspan="1" class="tar"  style="border-left:1.5px solid black;border-bottom:1.5px solid black;border-top:1.5px solid black;">
       ${data?.total_earnings}
       </td>
       <td colspan="1" class="tac" style="border-left:1.5px solid black;border-bottom:1.5px solid black;border-top:1.5px solid black;">
       ${
        (ytd[data?.employee_id]?.COMP || 0) +
        (ytd[data?.employee_id]?.CONV || 0) +
        (ytd[data?.employee_id]?.DA || 0) +
        (ytd[data?.employee_id]?.HRA || 0) +
        (ytd[data?.employee_id]?.BASIC || 0)
      }
      
       </td>
       <th colspan="1" class="tal-1" style="border-left:1.5px solid black;border-bottom:1.5px solid black;border-top:1.5px solid black;">
       Total Deductions
       </th>
       <td colspan="1" class="tar"  style="border-left:1.5px solid black;border-bottom:1.5px solid black;border-top:1.5px solid black;">
       ${data?.total_deductions}
       </td>
       <td colspan="1" class="tac"  style="border: 1.5px solid black;">
       ${(ytd[data?.employee_id]?.EPF || 0) + (ytd[data?.employee_id]?.ESI || 0) + (ytd[data?.employee_id]?.LOAN || 0) + (ytd[data?.employee_id]?.TDS || 0)}
       </td>
     </tr>
     <tr>
       <th colspan="6" style="border-right:1.5px solid black;">    
       </th>
     </tr>
     <tr>
  <tr>
    <th colspan="6" style="border-right:1.5px solid black;border-top: 1.5px solid black;"></th>
  </tr>
  <tr>
    <th colspan="6" class="tal1" style="border-right:1.5px solid black;border-bottom:1.5px solid black;border-top:1.5px solid black;"> 
      Net Pay: Rs. ${data?.total_earnings - data?.total_deductions || '-'}   
    </th>
  </tr>
  <tr>
    <th colspan="6" class="tal1" style="border-right:1.5px solid black;border-bottom:1.5px solid black;">   
      In Words: ${data?.AmountInWords} 
    </th>
  </tr>
  <tr>
    <td colspan="6" style="border-right:1.5px solid black; border-bottom:1.5px solid black;"></td>
  </tr>
</table>

<div style="margin-top: 20px;">
<table class="table" cellspacing="0">
<tr>
  ${
    !data?.loans?.length
      ? ''
      : `
    <tr>
      <th style="border-left:1.5px solid black;" class="tal-1">Loan Type</th> 
      <th class="tal-1">Loan Amount</th> 
      <th class="tal-1">EMI</th> 
      <th class="tal-1">Deducted till date</th> 
      <th class="tal-1">Balance For the Month</th>
    </tr>
    ${generateLoanRows()}
    <tr>
    <td colspan="6" style="border-top:1.5px solid black;border-left:1.5px solid black;border-bottom:1.5px solid black;">
    </td>
    </tr>
    `
  }
</tr>
</table>
</div>
<div style="margin-top: 20px;">
<table class="table" cellspacing="0">
      <tr>
          <th style=" border-left:1.5px solid black;">Days In Month</th>
          <th>Arrear Days</th>
          <th>LOPR Days</th>
          <th>LOP Days</th>
          <th>Net Days Worked</th>
      </tr>
      <tr>
        <td class="tac" style="text-align:right;border-left:1.5px solid black;padding-right: 8px;">${data?.working_days}</td>
        <td class="tac" style="text-align:right"> - </td>
        <td class="tac" style="text-align:right"> - </td>
        <td class="tac" style="text-align:right;padding-right: 8px;">${data?.no_of_leaves}</td>
        <td class="tac" style="text-align:right;padding-right: 8px;">${
          data?.net_payable_days
        }</td>              
      </tr>
      <tr>
      <td colspan="5" style="border-top:1.5px solid black;border-left:1.5px solid black;border-bottom:1.5px solid black;">
      </td>
      </tr>

</table>
</div>

<div style="margin-top: 40px">
                <p>This document contains confidential information. If you are not the intended recipient, you are not authorized to use or disclose it in any form.</p> 
                <p>If you received this in error, please destroy it along with any copies and notify the sender immediately.</p>
                <p>This is a system-generated payslip on ${data?.updated_at?.slice(0,10)}</p>
</div>
</div>
</html>`;
};
