import moment from "moment";
import { maxHeight } from "utils/pageSize";

import { TableCell, Chip, TableRow, TableBody, TableContainer, TableHead, Table, Paper, Typography, Grid } from "@mui/material";
  
  function PaymentHistoryTable(props) {
    const paymentHistoryData = props.paymentHistoryDetails
    return (
      // <>
      //   </>
      <TableContainer
        component={Paper}
        sx={{
          mt: 2,
          minHeight: `calc(${maxHeight} - 390px)`,
          maxHeight: `calc(${maxHeight} - 389px)`,
          overflowY: 'auto',
          boxShadow: 'none',
          border: 'none',
        }}
      >
        <Grid container alignItems="center" sx={{ mb: 2 }}>
        <Grid p={"15px"} size={6}>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
        {"Payment History"}
        </Typography>
        </Grid>
        </Grid>
        <Table>
          <TableHead>
            <TableRow>
            <TableCell>Transaction ID</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Mode</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Reference No</TableCell>
              <TableCell>Bank Name</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paymentHistoryData.map((payment, index) => (
              <TableRow key={index}>
                <TableCell>{payment.transaction_id}</TableCell>
                <TableCell>{moment(payment.date).format('DD-MM-YYYY hh:mm A')}</TableCell>
                <TableCell>{payment.paymentMode}</TableCell>
                <TableCell>₹{payment.amount}</TableCell>
                <TableCell>{payment.reference_no}</TableCell>
                <TableCell>{payment.bankName}</TableCell>
                <TableCell>
                  <Chip
                    label={payment.status === 'success' ? 'Success' : 'Failed'}
                    color={payment.status === 'success' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  export default PaymentHistoryTable;
