import React, { useEffect, useRef, useState  } from "react";
import { useDispatch, useSelector } from "react-redux";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { paymentReportBasedEmpAction, paymentReportBasedEmpVerifyAction } from "redux/actions/sales_actions";
import { Button, Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid } from "@mui/material";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";

export default function PaymentCollection({rowData}) {
  console.log(rowData,'rowdata')
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const {
    salesReducer: { collectionReport,paymentReportBasedEmpVerify },
  } = useSelector((state) => state);
  
  const printRef = useRef(null);
  const date = new Date()
  const currentDate = moment(date).format('DD-MM-YYYY')
  
  const handlePrint = () => {
    const printContent = printRef.current;
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write(printContent.outerHTML);
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  };

  const [openDialog, setOpenDialog] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify =()=>{
    setOpenDialog(true);
  }

  const handleConfirmVerify = async () =>{
    setOpenDialog(false);
     try {
      const payload ={
        id : collectionReport.map((a)=>a.id)
      }
    const response = await dispatch(paymentReportBasedEmpVerifyAction(payload));

    if (response === "API_FINISHED_SUCCESS") {
      alert("Verification successful!");
      setIsVerified(true);
    } else {
      throw new Error("Verification failed");
    }
  } catch (error) {
    console.error("Verification failed:", error);
    alert("Failed to update verification."); 
  }
  }

  const tableHeaderStyle = {
    fontSize: "12px",
    fontWeight: 600,
    color: "rgba(0, 0, 0, 0.7)",
    textAlign: "center",
    padding: "8px",
    border: "1px solid #000",
  };

  const tableCellStyle = {
    fontSize: "11px",
    fontWeight: 400,
    textAlign: "center",
    padding: "8px",
    border: "1px solid #000",
  };

// const handleDownload = () => {
//   const doc = new jsPDF();
  
//   doc.text("Payment Collections Report", 14, 10);

//   const table = document.getElementById("payment-report-table");
//   const data = [];
//   const headers = [];
  
//   const headerCells = table.querySelectorAll("thead th");
//   console.log(headerCells,"headerCells");
  
//   headerCells.forEach((header) => headers.push(header.textContent));

//   const rows = table.querySelectorAll("tbody tr");
//   rows.forEach((row) => {
//     const rowData = [];
//     row.querySelectorAll("td").forEach((cell) => rowData.push(cell.textContent));
//     data.push(rowData);
//   });
// console.log(headers,"headersheaders");

//   doc.autoTable({
//     head: [headers],
//     body: data,
//     startY: 20,
//     styles: {
//       fontSize: 8,
//     },
//     theme: "striped",
//     margin: { top: 20 },
//   });

//   doc.save("payment_report.pdf");
// };

const handleDownload = () => {
  const table = document.getElementById("payment-report-table");

  if (!table) return;

  const clonedTable = table.cloneNode(true);
  const headers = clonedTable.querySelectorAll("thead th");
  // console.log(headers,"headersheaders");
  
  headers.forEach((th) => {
    th.style.backgroundColor = "#1976D2";
    th.style.color = "#ffffff";
  });

  const tempDiv = document.createElement("div");
  tempDiv.appendChild(clonedTable);
  document.body.appendChild(tempDiv);
  tempDiv.style.padding = "20px 10px";

  html2canvas(tempDiv, { scale: 2 }).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.text("Payment Collections Report", 14, 10);

    const imgWidth = 190; 
    const imgHeight = (canvas.height * imgWidth) / canvas.width; 

    pdf.addImage(imgData, "PNG", 10, 20, imgWidth, imgHeight);
    pdf.save("payment_report.pdf");

    document.body.removeChild(tempDiv);
  });
}

// Calculate totals
const totalInvoiceAmount = collectionReport.reduce(
  (sum, report) => sum + (report.total_amount || 0),
  0
);
const totalReceived = collectionReport.reduce(
  (sum, report) => sum + (report.amount || 0),
  0
);
const totalDue = totalInvoiceAmount - totalReceived;

// Calculate payment type totals
const totalCash = collectionReport.reduce(
  (sum, report) => (report.payment_type === "Cash" ? sum + report.amount : sum),
  0
);
const totalCheque = collectionReport.reduce(
  (sum, report) =>
    report.payment_type === "Cheque" ? sum + report.amount : sum,
  0
);
const totalNEFT = collectionReport.reduce(
  (sum, report) =>
    report.payment_type === "NEFT / RTGS / IMPS (INR)"
      ? sum + report.amount
      : sum,
  0
);

const handleBack = () => {
  navigate("/PaymentCollection")
}


  return (
    <Card style={{minHeight: '100%'}}>
    <div style={{ fontFamily: "Poppins, sans-serif", margin: "20px" }}>
      {/* <Grid container>
      <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}> */}
      <div ref={printRef}>
      <header
        className="header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div className="logo" style={{ display: "flex", alignItems: "center" }}>
          {/* <img
            src="logo-placeholder.png"
            alt="Logo"
            style={{ height: "50px", marginRight: "10px" }}
          />
          <div
            className="company-name"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            VEETEE TRADING PVT LTD
          </div> */}
        </div>
        <div
          className="report-date"
          style={{ fontSize: "13px", fontWeight: 600 }}
        >
          Date: {currentDate}
        </div>
      </header>

      <h3
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: "rgba(0, 0, 0, 0.7)",
        }}
      >
        Fos: {collectionReport[0]?.name}
      </h3>
      <h2
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: "rgba(0, 0, 0, 0.7)",
        }}
      >
        COLLECTIONS REPORT
      </h2>

      
      <table id="payment-report-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", color: "rgba(0, 0, 0, 0.7)", fontWeight: 400 }}>
        <thead>
          <tr>
            <th rowSpan="2" style={tableHeaderStyle}>
              Store Name
            </th>
            <th rowSpan="2" style={tableHeaderStyle}>
              Inv No
            </th>
            <th rowSpan="2" style={tableHeaderStyle}>
              Inv Amt
            </th>
            <th rowSpan="2" style={tableHeaderStyle}>
              Received
            </th>
            <th rowSpan="2" style={tableHeaderStyle}>
              Due
            </th>
            <th rowSpan="2" style={tableHeaderStyle}>
              Status
            </th>
            <th colSpan="6" style={tableHeaderStyle}>
              Mode of Payment
            </th>
            <th rowSpan="2" style={tableHeaderStyle}>
              Resp
            </th>
          </tr>
          <tr>
            <th style={tableHeaderStyle}>Cash</th>
            <th style={tableHeaderStyle}>Cheque</th>
            <th style={tableHeaderStyle}>Date</th>
            <th style={tableHeaderStyle}>Number</th>
            <th style={tableHeaderStyle}>NEFT</th>
            <th style={tableHeaderStyle}>Ref</th>
          </tr>
        </thead>
        <tbody>
          {collectionReport?.length > 0 ? (
            collectionReport.map((report, index) => (
              <tr key={index}>
                <td style={tableCellStyle}>{report.company_name}</td>
                <td style={tableCellStyle}>{report.invoice_number}</td>
                <td style={tableCellStyle}>{report.total_amount}</td>
                <td style={tableCellStyle}>
                  {report.amount}
                </td>
                <td style={tableCellStyle}>
                  {report.total_amount -
                    report.amount}
                </td>
                <td
                  style={{
                    ...tableCellStyle,
                    color:
                      report.status ===
                      'Partial'
                        ? "red"
                        : "green",
                  }}
                >
                  {report.status}
                </td>
                <td style={tableCellStyle}>
          {report.payment_type === "Cash" ? report.amount : "-"}
        </td>
        <td style={tableCellStyle}>
          {report.payment_type === "Cheque" ? report.amount : "-"}
        </td>
        <td style={tableCellStyle}>
          {report.payment_type === "Cheque" ? report.createdAt : "-"}
        </td>
        <td style={tableCellStyle}>
          {report.payment_type === "Cheque" ? report.ref_number : "-"}
        </td>
        <td style={tableCellStyle}>
          {report.payment_type === "NEFT / RTGS / IMPS (INR)"
            ? report.amount
            : "-"}
        </td>
        <td style={tableCellStyle}>
          {report.payment_type === "NEFT / RTGS / IMPS (INR)"
            ? report.ref_number
            : "-"}
        </td>
                <td style={tableCellStyle}>Approved</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="13" style={tableCellStyle}>
                No Data Available
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
  <tr>
    <td style={tableCellStyle}>Total</td>
    <td style={tableCellStyle}></td>
    <td style={tableCellStyle}>{totalInvoiceAmount}</td>
    <td style={tableCellStyle}>{totalReceived || "-"}</td>
    <td style={tableCellStyle}>{totalDue || "-"}</td>
    <td style={tableCellStyle}></td>
    <td style={tableCellStyle}>{totalCash || "-"}</td>
    <td style={tableCellStyle}>{totalCheque || "-"}</td>
    <td style={tableCellStyle}></td> {/* Date */}
    <td style={tableCellStyle}></td> {/* Cheque Number */}
    <td style={tableCellStyle}>{totalNEFT || "-"}</td>
    <td style={tableCellStyle}></td> {/* Reference */}
    <td style={tableCellStyle}></td> {/* Resp */}
  </tr>
</tfoot>

      </table>
      <div style={{ marginTop: "20px" }}>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginTop: "50px",
      fontSize: "12px",
      fontWeight: "bold",
    }}
  >
    <div style={{ textAlign: "center" }}>
      Fos Signature
      <div style={{ marginTop: "40px", width: "150px", margin: "0 auto" }} />
    </div>
    <div style={{ textAlign: "center" }}>
      Checked By
      <div style={{ marginTop: "40px", width: "150px", margin: "0 auto" }} />
    </div>
  </div>
</div>
</div>
      <div style={{ position: "fixed", bottom: 5, left: 0, width: "100%", padding: "10px 0" }}>
  <div style={{ display: "flex", justifyContent: "end", marginRight: '20px' }}>
    <button onClick={handleVerify} style={buttonStyle} disabled={isVerified}>Verify</button>
    <button onClick={handlePrint} style={buttonStyle}>Print</button>
    <button onClick={handleDownload} style={buttonStyle}>Download</button>
    <Button onClick={handleBack} variant="contained" color="secondary">Back</Button>
  </div>
  <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
      <DialogTitle>Confirm Verification</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Once verified, this action cannot be reverted. Do you want to proceed?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenDialog(false)} color="secondary">Cancel</Button>
        <Button onClick={handleConfirmVerify} color="primary">Confirm</Button>
      </DialogActions>
    </Dialog>
</div>

      {/* </Grid>
      <Grid>
        <Button variant='contained' color='secondary' >Back </Button>
      </Grid>
      </Grid> */}
    </div>
    </Card>
  );
}

const tableHeaderStyle = {
  fontSize: "12px",
  fontWeight: 600,
  color: "rgba(0, 0, 0, 0.7)",
  textAlign: "center",
  padding: "8px",
  border: "1px solid #000",
};

const tableCellStyle = {
  fontSize: "11px",
  fontWeight: 400,
  textAlign: "center",
  padding: "8px",
  border: "1px solid #000",
};

const buttonStyle = {
  backgroundColor: "#4CAF50",
  color: "white",
  padding: "10px 20px",
  fontSize: "13px",
  border: "none",
  borderRadius: "5px",
  margin: "0 8px",
  cursor: "pointer",
};
