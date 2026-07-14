export const LoanTemp = (data) => {


    return `
    <!DOCTYPE html>
    <html>
    <meta charset="utf-8">
    <title>Claims</title>
    <style type="text/css">
        body {
            font-family: sans-serif;
            font-size: 9pt;
            line-height: 1.5;
        }

        .invoice {
            width: 100%;
        }

        .invoice td {
            padding: 5px;
        }

        .d-block {
            display: block;
            padding: 5px;
            font-family: "Times New Roman";
            text-transform: capitalize;
        }

        .table-bordered {
            border-collapse: collapse;
        }

        .table-bordered td {
            border: solid 1px #000;
        }

        .thick-border {
            border: solid 2px #000 !important;
        }
      .claim-slip-title {
            font-size: 20pt;
            font-weight: bold;
        }
        .borderX-0 {
            border-left: none !important;
            border-right: none !important;
        }

        .borderY-0 {
            border-top: none !important;
            border-bottom: none !important;
        }

        .borderL-0 {
            border-left: none !important;
        }

        .borderR-0 {
            border-right: none !important;
        }

        .borderT-0 {
            border-top: none !important;
        }

        .th {
            font-weight: bold;
            text-align: left;
            padding: 5px;
            font-family: "Times New Roman";
            font-size: 15pt;
        }

        .h1 {
            font-size: 12pt;
        }

        .h2 {
            font-size: 10pt;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .text-left {
            text-align: left;
            font-family: 'Times New Roman';
            font-size: 10pt;
        }

        .w-100 {
            width: 100%;
        }

        .h-100 {
            height: 100%;
        }

        .d-flex {
            display: flex;
        }

        .align-items-end {
            align-items: end;
        }

        .justify-content-end {
            justify-content: end;
        }
    </style>

    <div>
        <h1 style="font-size: 14pt !important; font-weight: bold"">Loan Slip  -  ${data.company_name || ""}</h1>
    
        </br>
        <table class="invoice table-bordered">
            <colgroup>
                <col span="1" style="width:22.57%;">
                <col span="1" style="width:9.46%;">
                <col span="1" style="width:2.72%;">
                <col span="1" style="width:13%;">
                <col span="1" style="width:9.69%;">
                <col span="1" style="width:0.86%;">
                <col span="1" style="width:17.14%;">
                <col span="1" style="width:6.15%;">
                <col span="1" style="width:12.42%;">
                <col span="1" style="width:1%;">
                <col span="1" style="width:4.97%;">
            </colgroup>
            <tbody>
                <tr>
                    <td colspan="1" class="th text-left">Employee ID</td>
                    <td colspan="3" class="td text-left">${data.empcode || "-"}</td>
                    <td colspan="3" class="th text-left">Employee Name</td>
                    <td colspan="5" class="td text-left">${data.full_name || "-"}</td>
                </tr>
                <tr>
                    <td colspan="1" class="th text-left">Designation</td>
                    <td colspan="3" class="td text-left">${data.designation || "-"}</td>
                    <td colspan="3" class="th text-left">Department</td>
                    <td colspan="5" class="td text-left">${data.department || "-"}</td>
                </tr>
                <tr>
                    <td colspan="1" class="th text-left">Location Name</td>
                    <td colspan="3" class="td text-left">${data.location_name || "-"}</td>
                    <td colspan="3" class="th text-left">Requested Amount</td>
                    <td colspan="5" class="td text-left">${data.outStanding || "-"}</td>
                </tr>
                <tr>
                    <td colspan="1" class="th text-left">Reason</td>
                    <td colspan="3" class="td text-left">${data.Reason || "-"}</td>
                    <td colspan="3" class="th text-left">Repayment Method</td>
                    <td colspan="5" class="td text-left">${data.Repayment_method || "-"}</td>
                </tr>
                <tr>
                    <td colspan="1" class="th text-left">Tenure Period</td>
                    <td colspan="3" class="td text-left">${data.tenure || "-"}</td>
                    <td colspan="3" class="th text-left">Loan Number</td>
                    <td colspan="5" class="td text-left">${data.loan_number || "-"}</td>
                </tr>
               <tr>
                   
                    <td colspan="1" class="th text-left">Approved By</td>
                    <td colspan="11" class="td text-left">${data.approvedBy || "-"}</td>
                </tr>
            </tbody>
        </table>
        <script type="text/javascript">
            window.onload = function () {
                window.print();
            }
        </script>
    </div>
    </html>
    `
};
