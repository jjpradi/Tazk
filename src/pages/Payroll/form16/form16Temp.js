import moment from 'moment/moment';
import CorporateFareIcon from '../../../assets/dashboardIcons/office-building.png';
import { getsessionStorage } from 'pages/common/login/cookies';

export const Form16Details = (data) => {
  console.log(data, 'data')
  const curDate = new Date()
  const storage = getsessionStorage()
  const adminAdress = storage?.address
  const frst_name = storage?.first_name
  const last_name = storage?.last_name
  
  return `
    <!DOCTYPE html>
    <html>
    <meta charset="utf-8">
    <title>Pay slip</title>
    <style type="text/css">
      .myContainer {
  margin: 15px;
}
table{
  width: 100%;
  td,th{
    height:35px;
    border:1px solid black;
  }
  .no-border{
    border:none;
  }
  .no-br{
    border-right:0px solid white;
  }
  
}
.table2{
  border-collapse: collapse; 
   td{
    border:1px solid black;;
    padding:5px 10px
  }
}
.first-half {
    float: left;
    width: 50%;
}
.second-half {
    float: right;
    width: 50%;
}
.tac{
  text-align:center
}
.tar{
  text-align:right
}
.tat{
      vertical-align: top;
}
.tal{
  text-align:left
}
.border-td{
  border-top :1px solid black; 
  border-bottom:1px solid black;
}
.border{
  border :1px solid black; 
}
    </style>

<div class="form16">
   <p style="text-align: center;"><strong>FORM NO. 16</strong><br />[See rule 31(1)(a)]<br />
     <strong>PART A
     </strong>
   </p>
   <table class="myTable" cellspacing="0">
     <tr>
       <th class="tac" colspan="6">
         Certificate under section 203 of the Income-tax Act, 1961 for tax deducted at source on salary
       </th>
     </tr>
     <tr>
       <th colspan="3">
         Certificate No.
       </th>
       <th colspan="3">
         Last updated on
       </th>
     </tr>
     <tr>
       <th colspan="3">
         XXXXXXXXXXX
       </th>
       <td colspan="3" class="tac">
         <b>&nbsp;${data?.updatedAt || '-'}</b>
       </td>
     </tr>
     <tr>
       <th colspan="3">
         Name and address of the Deductor
       </th>
       <th colspan="3">
         Name and address of the Deductee
       </th>
     </tr>
     <tr>
       <th colspan="3">
         ${frst_name} ${last_name} ${adminAdress || '-'}
       </th>
       <th colspan="3">
        ${data?.fullName} ${data?.address ?? '-'}
       </th>
     </tr>
     <tr>
       <th>
         PAN of the Deductor
       </th>
       <th colspan="2">
         TAN of the Deductor
       </th>
       <th>
         PAN of the Employee
       </th>
       <th colspan="2">
         Employee Reference No.
         provided by the Employer
         (If available)
       </th>
     </tr>
     <tr>
       <th>
         ?
       </th>
       <th colspan="2">
         ?
       </th>
       <th>
         ?
       </th>
       <th colspan="2">
         ?
       </th>
     </tr>
     <tr>
       <th colspan="3">
         CIT (TDS)
       </th>
       <th colspan="1">
         Assessment Year
       </th>
       <th colspan="2">
         Period
       </th>
     </tr>
     <tr>
       <td colspan="3" style='border-bottom:none;'>
        <b>Address:&nbsp; <u>${data?.address || '-'}</u></b>
       </td>
       <td colspan="1" style='border-bottom:none;'>
       </td>
       <th colspan="1" style='border-bottom:none;'>
         From
       </th>
       <th colspan="1" style='border-bottom:none;'>
         To
       </th>
     </tr>
     <tr>
       <td colspan="3" style='border-bottom:none;border-top:none;'></td>
       <td rowspan="2" style='border-top:none';>
         <p style="text-align: center;"><b>${curDate?.getFullYear()}-${curDate?.getFullYear() + 1}</b></p>
       </td>
       <td rowspan="2">
        <p style="text-align: center;"><b>${curDate?.getFullYear() - 1}</b></p>
       </td>
       <td rowspan="2">
       <p style="text-align: center;"><b>${curDate?.getFullYear()}</b></p>
       </td>
     </tr>
     <tr>
       <td colspan="3" style='border-top:none;'>
        <b> City:&nbsp; <u>${data?.place || '-'}</u> Phone:&nbsp;<u> ${data?.phone_number}</u> Pin:&nbsp;<u> ${data?.zip}</u> </b>
       </td>
     </tr>
     <tr>
       <th class="tac" colspan="6">
         Summary of amount paid/credited and tax deducted at source thereon in respect of the employee
       </th>
     </tr>
     <tr>
       <th>
         Quarter(s)
       </th>
       <th>
         Receipt Numbers of
         original quarterly
         statements of TDS
         under sub-section (3) of
         section 200
       </th>
       <th>
         Amount
         paid/credited
       </th>
       <th colspan="2">
         Amount of tax
         deducted
         (Rs. )
       </th>
       <th>
         Amount of tax
         deposited/remitted
         (Rs. )
       </th>
     </tr>
     <tr>
       <th>Q1
       </th>
       <th> XXXXXXX
       </th>
       <th>${data?.Quarter}
       </th>
       <th colspan="2">
       ${data?.QuarterTax}
       </th>
       <th>
       ${data?.QuarterTax}
       </th>
     </tr>
      <tr>
       <th>Q2
       </th>
       <th> XXXXXXX
       </th>
       <th>${data?.Quarter}
       </th>
       <th colspan="2">
       ${data?.QuarterTax}
       </th>
       <th>
       ${data?.QuarterTax}
       </th>
     </tr>
     <tr>
       <th>Q3
       </th>
       <th> XXXXXXX
       </th>
       <th>${data?.Quarter}
       </th>
       <th colspan="2">
       ${data?.QuarterTax}
       </th>
       <th>
       ${data?.QuarterTax}
       </th>
     </tr>
      <tr>
       <th>Q4
       </th>
       <th> XXXXXXX
       </th>
       <th>${data?.Quarter}
       </th>
       <th colspan="2">
       ${data?.QuarterTax}
       </th>
       <th>
       ${data?.QuarterTax}
       </th>
     </tr>
     <tr>
       <th>
         Total (Rs.)
       </th>
       <th>
           XXXXX
       </th>
       <th>
           ${data?.ctc}
       </th>
       <th colspan="2">
        ${data?.QuarterTaxTotal}
       </th>
       <th>
          ${data?.QuarterTaxTotal}
       </th>
     </tr>
     <tr>
       <th class="tal" colspan="6">
         Summary of tax deducted at source in respect of Deductee
       </th>
     </tr>
 
     <tr>
       <th colspan="6">
         <p>
           I. DETAILS OF TAX DEDUCTED AND DEPOSITED IN<br />
           THE CENTRAL GOVERNMENT ACCOUNT THROUGH BOOK ADJUSTMENT<br />
           (The deductor to provide payment wise details of tax deducted
           and deposited with respect to the deductee)
         </p>
       </th>
     </tr>
     <tr>
       <th rowspan='2'>
         Sl. No.
       </th>
       <th rowspan='2'>
         Tax deposited
         in respect of the
         deductee (Rs.)
       </th>
       <th colspan='4'>
         Book Identification Number (BIN)
       </th>
     </tr>
     <tr>
       <th>
         Receipt numbers of
         Form No. 24G
       </th>
       <th>
         DDO serial
         number in Form
         No. 24G
 
       </th>
       <th>
         Date of Transfer
         voucher
         (dd/mm/yyyy)
       </th>
       <th>
         Status of
         Matching with
         Form No.24G
       </th>
     </tr>
     <tr>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
     </tr>
     <tr>
       <th>
         Total(Rs)
       </th>
       <td>
       </td>
       <td colspan='4'>
       </td>
     </tr>
 
     <tr>
       <th colspan="6">
         <p>
           I. DETAILS OF TAX DEDUCTED AND DEPOSITED IN<br />
           THE CENTRAL GOVERNMENT ACCOUNT THROUGH CHALLAN <br />
           (The deductor to provide payment wise details of tax deducted
           and deposited with respect to the deductee)
         </p>
       </th>
     </tr>
     <tr>
       <th rowspan='2'>
         Sl. No.
       </th>
       <th rowspan='2'>
         Tax deposited
         in respect of the
         deductee (Rs.)
       </th>
       <th colspan='4'>
         Challan Identification Number (CIN)
       </th>
     </tr>
     <tr>
       <th>
         BSR Code of the
         Bank Branch
       </th>
       <th>
         Date on which tax
         deposited (dd/mm/yyyy)
       </th>
       <th>
         Challan Serial
         Number
 
       </th>
       <th>
         Status of
         matching with OLTAS
       </th>
     </tr>
     <tr class="tac">
       <td>
       &nbsp;   1.
       </td>
       <td>
       <b>${data?.AnnualTax}</b>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
     </tr>
       <tr class="tac">
       <td>
       &nbsp;   2.
       </td>
       <td>
       <b>${data?.AnnualTax}</b>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
     </tr>
       <tr class="tac">
       <td>
       &nbsp;   3.
       </td>
       <td>
              <b>${data?.AnnualTax}</b>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
     </tr>
       <tr class="tac">
       <td>
       &nbsp;   4.
       </td>
       <td>
              <b>${data?.AnnualTax}</b>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
     </tr>
       <tr class="tac">
       <td>
      &nbsp;   5.
       </td>
       <td>
              <b>${data?.AnnualTax}</b>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
     </tr>
       <tr class="tac">
       <td>
       &nbsp;   6.
       </td>
       <td>
             <b> ${data?.AnnualTax}</b>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
     </tr>
       <tr class="tac">
       <td>
       &nbsp;   7.
       </td>
       <td>
              <b>${data?.AnnualTax}</b>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
     </tr>
       <tr class="tac">
       <td>
      &nbsp;   8.
       </td>
       <td>
              <b>${data?.AnnualTax}</b>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
     </tr>
       <tr class="tac">
       <td>
       &nbsp;   9.
       </td>
       <td>
              <b>${data?.AnnualTax}</b>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
     </tr>
       <tr class="tac">
       <td>
       &nbsp;   10.
       </td>
       <td>
             <b> ${data?.AnnualTax}</b>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
     </tr>
       <tr class="tac">
       <td>
       &nbsp;   11.
       </td>
       <td >
             <b> ${data?.AnnualTax}</b>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
     </tr>
       <tr class="tac">
       <td>
       &nbsp;   12.
       </td>
       <td>
              <b>${data?.AnnualTax}</b>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
       <td>
       </td>
     <tr class="tac">
       <th>
         Total(Rs)
       </th>
       <td>
       <b>${data?.QuarterTaxTotal}</b>
       </td>
       <td colspan='4'>
       </td>
     </tr>
     <tr>
       <th colspan='6'>
         Verification
       </th>
     </tr>
     <tr>
       <td colspan='6'>
         I,<b><u>${data?.fullName}</u></b>, son/daughter of …………. working in the capacity of <b><u>${data?.designation}</u> </b> (designation) do hereby certify that a
         sum of Rs. ………….. [Rs. ………. (in words)] has been deducted and deposited to the credit of the Central
         Government. I further certify that the information given above is true, complete and correct and is based on the
         books of account, documents, TDS statements, TDS deposited and other available records.
       </td>
     </tr>
     <tr class="tac">
       <th>
         Place
       </th>
       <td colspan="2">
          <b>${data?.place || '-'}</b>
       </td>
       <th colspan="3">
         (Signature of person responsible for deduction of tax)
       </th>
     </tr>
     <tr class="tac">
       <th>
         Date
       </th>
       <td colspan="2">
       <b><p>${curDate.toISOString().split('T')[0]}</p></b>
       </td>
       <th colspan="3">
 
       </th>
     </tr>
     <tr class="tac">
       <td colspan="3">
         <b>Designation: </b>&nbsp;<b>${data?.designation} </b>
       </td>
       <td colspan="3">
         <b>Full Name: </b>&nbsp;  <b>${data?.fullName}</b>
       </td>
     </tr>
   </table>
   <br />
   <hr style='width:30%;float:left' />
   <br />
   <p>
     1. Omitted by Income-tax (3rd Amendment) Rules, 2019, w.e.f. 12-5-2019. Prior to its omissionfollowing notes read as
     under :
   </p>
   <p><strong>Notes:</strong><br />1. Government deductors to fill information in item I if tax is paid without
     production of an income-tax challan and in item II if tax is paid accompanied by an income-tax challan.<br />2.
     Non-Government deductors to fill information in item II.<br />3. The deductor shall furnish the address of the
     Commissioner of Income-tax (TDS) having jurisdiction as regards TDS statements of the assessee.<br />4. If an
     assessee is employed under one employer only during the year, certificate in Form No.16 issued for the quarter
     ending on 31st March of the financial year shall contain the detailsof tax deducted and deposited for all the
     quarters of the financial year.</br>
     5. If an assessee is employed under more than one employer during the year, each of the employers shall issue Part A
     of the certificate in Form No. 16 pertaining to the period for which such assessee was employed with each of the
     employers. Part B (Annexure) of the certificate in Form No.16 may be issued by each of the employers or the last
     employer at the option of the assessee.<br />6. In items I and II, in column for tax deposited in respect of
     deductee, furnish total amount of TDS, surcharge (if applicable) and education cess (if applicable).&rdquo;;</p>
   <br />
 <p style="text-align: center;">
     <strong>PART B  (Annexure)
     </strong>
   </p>
   <table class="table2" border="1" cellspacing="0"
     cellpadding="0">
     <tbody>
       <tr>
         <td colspan='3'><strong> Details of Salary Paid and any other income and tax deducted</strong></td>
         <td><b>Gross Amount</b></td>
         <td><b>Deductible Amount</b> </td>
       </tr>
       <tr>
         <td style="width: 9.86972%; ">(1)</td>
         <td style="width: 55.0218%;" colspan='4'>Gross Salary</td>
       </tr>
       <tr>
         <td style="width: 9.86972%; ">(a)</td>
         <td style="width: 55.0218%;">Salary as per provisions contained in section 17(1)</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  "><b> ${data?.ctc}</b></td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">(b)</td>
         <td style="width: 55.0218%;  ">Value of perquisites under section 17(2) (as per Form No. 12BA,
           wherever applicable)</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">(c)</td>
         <td style="width: 55.0218%;  ">Profits in lieu of salary under section 17(3) (as per Form No. 12BA,
           wherever applicable)</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">(d)</td>
         <td style="width: 55.0218%;  ">Total</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">(e)</td>
         <td style="width: 55.0218%;  ">Reported total amount of salary received from other employer(s)</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">2.</td>
         <td style="width: 55.0218%;  ">Less: Allowances to the extent exempt under section 10</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">(a)</td>
         <td style="width: 55.0218%;  ">Travel concession or assistance under section 10(5)</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  "><b>${data?.lta_amount}</b></td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">(b)</td>
         <td style="width: 55.0218%;  ">Death-cum-retirement gratuity under section 10(10)</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">(c)</td>
         <td style="width: 55.0218%;  ">Commuted value of pension under section 10(10A)</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">(d)</td>
         <td style="width: 55.0218%;  ">Cash equivalent of leave salary encashment under section 10(10AA)
         </td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">(e)</td>
         <td style="width: 55.0218%;  ">House rent allowance under section 10(13A)</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  "><b>${data?.hra_exemption}</b></td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">(f)</td>
         <td style="width: 55.0218%;  ">Amount of any other exemption under section 10</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">&nbsp;</td>
         <td style="width: 55.0218%;  ">clause &hellip;</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">&nbsp;</td>
         <td style="width: 55.0218%;  ">clause &hellip;</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">&nbsp;</td>
         <td style="width: 55.0218%;  ">clause &hellip;</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">&nbsp;</td>
         <td style="width: 55.0218%;  ">clause &hellip;</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">&nbsp;</td>
         <td style="width: 55.0218%;  ">clause &hellip;</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">&nbsp;</td>
         <td style="width: 55.0218%;  ">...</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">(g)</td>
         <td style="width: 55.0218%;  ">Total amount of any other exemption under section 10</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">(h)</td>
         <td style="width: 55.0218%;  ">Total amount of exemption claimed under section 10
           [2(a)+2(b)+2(c)+2(d)+2(e)+2(g)]</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">3.</td>
         <td style="width: 55.0218%;  ">Total amount of salary received from current employer [1(d)-2(h)]
         </td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  "><b>${data?.ctc - data?.lta_amount - data?.hra_exemption}</b></td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">4.</td>
         <td style="width: 55.0218%;  ">Less: Deductions under section 16</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr >
         <td style="width: 9.86972%; ">(a)</td>
         <td style="width: 55.0218%; ">Standard deduction under section 16(ia)</td>
         <td style="width: 10.4485%; ">&nbsp;</td>
         <td style="width: 14.6455%; "><b>50,000</b></td>
         <td style="width: 10.0145%; ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">(b)&nbsp;</td>
         <td style="width: 55.0218%;  ">Entertainment allowance under section 16(ii)</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">(c)</td>
         <td style="width: 55.0218%;  ">Tax on employment under section 16(iii)</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">5.</td>
         <td style="width: 55.0218%;  ">Total amount of deductions under section 16 [4(a)+4(b)+4(c)]</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  "><b>50,000</b></td>
       </tr>
       <tr>
         <td style="width: 9.86972%;">6.</td>
         <td style="width: 55.0218%;">Income chargeable under the head "Salaries" [(3+1(e)-5]</td>
         <td style="width: 10.4485%;">&nbsp;</td>
         <td style="width: 14.6455%;">&nbsp;</td>
         <td style="width: 10.0145%;"><b>${data?.taxable_gross}</b></td>
       </tr>
       <tr>
         <td style="width: 9.86972%;">7.</td>
         <td style="width: 55.0218%;">Add: Any other income reported by the employee under as per section 192 (2B)</td>
         <td style="width: 10.4485%;">&nbsp;</td>
         <td style="width: 14.6455%;">&nbsp;</td>
         <td style="width: 10.0145%;">&nbsp;</td>
       </tr>
       <tr>
         <td style="width: 9.86972%;">(a)</td>
         <td style="width: 55.0218%;">Income (or admissible loss) from house property reported by employee offered for
           TDS</td>
         <td style="width: 10.4485%;">&nbsp;</td>
         <td style="width: 14.6455%;"><b>0.00</b></td>
         <td style="width: 10.0145%;">&nbsp;</td>
       </tr>
       <tr>
         <td style="width: 9.86972%;">(b)</td>
         <td style="width: 55.0218%;">Income under the head Other Sources offered for TDS</td>
         <td style="width: 10.4485%;">&nbsp;</td>
         <td style="width: 14.6455%;"><b>0.00</b></td>
         <td style="width: 10.0145%;">&nbsp;</td>
       </tr>
       <tr>
         <td style="width: 9.86972%;">8.</td>
         <td style="width: 55.0218%;">Total amount of other income reported by the employee [7(a)+7(b)]</td>
         <td style="width: 10.4485%;">&nbsp;</td>
         <td style="width: 14.6455%;">&nbsp;</td>
         <td style="width: 10.0145%;"><b>0.00</b></td>
       </tr>
       <tr>
         <td style="width: 9.86972%;">9.</td>
         <td style="width: 55.0218%;">Gross total income (6+8)</td>
         <td style="width: 10.4485%;">&nbsp;</td>
         <td style="width: 14.6455%;">&nbsp;</td>
         <td style="width: 10.0145%;"><b>${data?.taxable_gross}</b></td>
       </tr>
       <tr>
         <td style="width: 9.86972%;">10.</td>
         <td style="width: 55.0218%;">Deductions under Chapter VI-A</td>
         <td style="width: 10.4485%;">&nbsp;</td>
         <td style="width: 14.6455%;">&nbsp;</td>
         <td style="width: 10.0145%;">&nbsp;</td>
       </tr>
     </tbody>
   </table>
 <br/>
 <table style="border-collapse: collapse; " border="1"  
     cellpadding="0">
     <tbody>
      
       <tr>
         <td style="width: 9.86972%; ">(a)</td>
         <td style="width: 55.0218%;" >Deduction in respect of life insurance premia,
 contributions to provident fund etc. under section 80C </td>
            <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  "><b>${data?.deduction?.filter(v => v.deduction_type == "80C").map(v => v.amount).join(", ")}</b></td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr>
         <td style="width: 9.86972%; ">(b)</td>
         <td style="width: 55.0218%;">Deduction in respect of contribution to certain pension
 funds under section 80CCC </td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  "><b> ${data?.deduction?.filter(v => v.deduction_type == "80CCC").map(v => v.amount).join(", ")}</b></td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">(c)</td>
         <td style="width: 55.0218%;  ">Deduction in respect of contribution by taxpayer to
 pension scheme under section 80CCD (1)  </td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  "><b>${data?.deduction?.filter(v => v.deduction_type == "80CCD").map(v => v.amount).join(", ")}</b></td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">(d)</td>
         <td style="width: 55.0218%;  ">Total deduction under section 80C, 80CCC and
 80CCD(1) </td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">
          <b>
    ${(data?.deduction?.filter(v => v.deduction_type == "80C").reduce((sum, v) => sum + (v.amount || 0), 0)) +
    (data?.deduction?.filter(v => v.deduction_type == "80CCC").reduce((sum, v) => sum + (v.amount || 0), 0)) +
    (data?.deduction?.filter(v => v.deduction_type == "80CCD").reduce((sum, v) => sum + (v.amount || 0), 0))
    }
          </b></td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">(e)</td>
         <td style="width: 55.0218%;  ">Deductions in respect of amount paid/deposited to
 notified pension scheme under section 80CCD (1B) </td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  "><b>${data?.deduction?.filter(v => v.deduction_type == "80CCD(1B)").map(v => v.amount).join(", ")}</b></td>
         <td style="width: 10.0145%;  "><b>0.00</b></td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">(f)</td>
         <td style="width: 55.0218%;  ">Deduction in respect of contribution by Employer to
 pension scheme under section 80CCD (2) </td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  "><b>${data?.deduction?.filter(v => v.deduction_type == "80CCD(2)").map(v => v.amount).join(", ")}</b></td>
         <td style="width: 10.0145%;  "><b>0.00</b></td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">(g)</td>
         <td style="width: 55.0218%;  ">Deduction in respect of health insurance premia under
 section 80D </td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  "><b>${data?.deduction?.filter(v => v.deduction_type == "80D").map(v => v.amount).join(", ")}</b></td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">(h)</td>
         <td style="width: 55.0218%;  ">Deduction in respect of interest on loan taken for
 higher education under section 80E </td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  "><b>${data?.deduction?.filter(v => v.deduction_type == "80E").map(v => v.amount).join(", ")}</b></td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>

       <tr style=" ">
         <td style="width: 9.86972%;  ">(i)</td>
         <td style="width: 55.0218%;  ">Total Deduction in respect of donations to certain
 funds, charitable institutions, etc. under section 80G</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  "><b>${data?.deduction?.filter(v => v.deduction_type == "80G").map(v => v.amount).join(", ")}</b></td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">(j)</td>
         <td style="width: 55.0218%;  ">Deduction in respect of interest on deposits in savings
 account under section 80TTA </td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  "><b>${data?.deduction?.filter(v => v.deduction_type == "80TTA").map(v => v.amount).join(", ")}</b></td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">(k)</td>
         <td style="width: 55.0218%;  ">Amount deductible under any other provision(s) of Chapter VI-A
         </td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">&nbsp;</td>
         <td style="width: 55.0218%;  ">section &hellip;</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">&nbsp;</td>
         <td style="width: 55.0218%;  ">section &hellip;</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">&nbsp;</td>
         <td style="width: 55.0218%;  ">section &hellip;</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">&nbsp;</td>
         <td style="width: 55.0218%;  ">section &hellip;</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">&nbsp;</td>
         <td style="width: 55.0218%;  ">section &hellip;</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">&nbsp;</td>
         <td style="width: 55.0218%;  ">...</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  ">&nbsp;</td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">(l)</td>
         <td style="width: 55.0218%;  ">Total of amount deductible under any other
 provision(s) of Chapter VI-A </td>
         <td style="width: 10.4485%;  "><b>0.00</b></td>
         <td style="width: 14.6455%;  "><b>0.00</b></td>
         <td style="width: 10.0145%;  "><b>0.00</b></td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">11</td>
         <td style="width: 55.0218%;  ">Aggregate of deductible amount under Chapter VI-A
 [10(a)+10(b)+10(c)+10(d)+10(e)+10(f)+10(g)+
 10(h)+10(i) 10(j)+10(l)]</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  "><b>${data?.total_deductions}</b></td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">12</td>
         <td style="width: 55.0218%;  ">Total taxable income (9-11)
         </td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  "><b>${data?.taxable_gross}</b></td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">13</td>
         <td style="width: 55.0218%;  ">Tax on total income</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  "><b>${data?.tax_on_total_income}</b></td>
       </tr>
       <tr >
         <td style="width: 9.86972%; ">14</td>
         <td style="width: 55.0218%; ">Rebate under section 87A, if applicable</td>
         <td style="width: 10.4485%; ">&nbsp;</td>
         <td style="width: 14.6455%; ">&nbsp;</td>
         <td style="width: 10.0145%; "><b>${data?.rebate || 0.00}</b></td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">15</td>
         <td style="width: 55.0218%;  ">Surcharge, wherever applicable</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  "><b>0.00</b></td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">16</td>
         <td style="width: 55.0218%;  ">Health and education cess</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  "><b>${data?.cess}</b></td>
       </tr>
       <tr style=" ">
         <td style="width: 9.86972%;  ">17</td>
         <td style="width: 55.0218%;  ">Tax payable (13+15+16-14)</td>
         <td style="width: 10.4485%;  ">&nbsp;</td>
         <td style="width: 14.6455%;  ">&nbsp;</td>
         <td style="width: 10.0145%;  "><b>${data?.tax_on_total_income + data?.cess_amount}</b></td>
       </tr>
       <tr>
         <td style="width: 9.86972%;">18</td>
         <td style="width: 55.0218%;">Less: Relief under section 89 (attach details)</td>
         <td style="width: 10.4485%;">&nbsp;</td>
         <td style="width: 14.6455%;">&nbsp;</td>
         <td style="width: 10.0145%;"><b>0.00</b></td>
       </tr>
       <tr>
         <td style="width: 9.86972%;">19</td>
         <td style="width: 55.0218%;">Net tax payable (17-18)</td>
         <td style="width: 10.4485%;">&nbsp;</td>
         <td style="width: 14.6455%;">&nbsp;</td>
         <td style="width: 10.0145%;"><b>${data?.tax_on_total_income + data?.cess_amount}</b></td>
       </tr>
       <tr>
         <th style="width: 9.86972%;" colspan="5">Verification</th>
       </tr>
        <tr>
         <td  colspan="5">
          I, <b><u>${data?.fullName}</u></b>, son/daughter of ……………………………………….working in the
 capacity of <b><u>${data?.designation}</u> </b>(designation) do hereby certify that the information given
 above is true, complete and correct and is based on the books of account, documents, TDS
 statements, and other available records.
          </td>
       </tr>
       <tr>
         <td style="width: 9.86972%;" colspan="2">Place: <b>${data?.place || '-'}</b></td>
         <td colspan="3">(Signature of person responsible
 for deduction of tax) </td>
       </tr>
       <tr>
         <td style="width: 9.86972%;" colspan="2">Date: <b><u>${curDate.toISOString().split('T')[0]}</u></b></td>
         <td colspan="3">Full Name :<b><u>${data?.fullName}</u></b> </td>
       </tr>
     </tbody>
   </table>
 <br/>
 <p><strong>Notes:</strong><br/>
  1. Government deductors to fill information in item I of Part A if tax is paid without production
 of an income-tax challan and in item II of Part A if tax is paid accompanied by an income-tax
 challan.<br/>
  2. Non-Government deductors to fill information in item II of Part A.<br/>
  
 3. The deductor shall furnish the address of the Commissioner of Income-tax (TDS) having
 jurisdiction as regards TDS statements of the assessee.<br/>
 4. If an assessee is employed under one employer only during the year, certificate in Form No.
 16 issued for the quarter ending on 31st March of the financial year shall contain the details
 of tax deducted and deposited for all the quarters of the financial year.<br/>
 5. (i) If an assessee is employed under more than one employer during the year, each of the
 employers shall issue Part A of the certificate in Form No. 16 pertaining to the period for
 which such assessee was employed with each of the employers.
 (ii) Part B (Annexure) of the certificate in Form No.16 may be issued by each of the employers
 or the last employer at the option of the assessee.<br/>
 6. In Part A, in items I and II, in the column for tax deposited in respect of deductee, furnish total<br/>
 amount of tax, surcharge and health and education cess.
 7. Deductor shall duly fill details, where available, in item numbers 2(f) and 10(k) before
 furnishing of Part B (Annexure) to the employee.]<br/></p>
 <br/>
 
 </div>

</html>
    `;

};
