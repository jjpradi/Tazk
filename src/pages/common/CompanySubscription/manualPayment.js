import React, { useState } from "react";
import {
  Card,
  Grid,
  Typography,
  TextField,
  Button,
  MenuItem,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Slide,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { getDateTimeFormat } from "utils/getTimeFormat";
import { useNavigate } from "react-router-dom";
import { insertManualPaymentDetailsAction } from "redux/actions/superAdmin_action";

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

const ManualPayment = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    paymentType: "",
    referenceNo: "",
    amount: "",
  });
  const [openAlert, setOpenAlert] = useState(false);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log("Form Submitted:", formData);
    const data = {
      plan_type_id: props.plan_type_id, 
      referenceNo: formData.referenceNo,
      transaction_amount: formData.amount,
      company_name: props.data.company_name,
      type: props.type,
      company_id: props.data.company_id,
      date: getDateTimeFormat(new Date()),
      transaction_id:props.transaction_Id,
      monthlyYearlyType: props.monthlyYearlyType
    }
    dispatch(insertManualPaymentDetailsAction(data))
//       ,(response) => {
//       console.log("response:",response.status === 200,response);
      
//       if(response.status === 200){
        setOpenAlert(true);
        setTimeout(() => {
          // navigate('/home')
          console.log("props.initialClose",props.handleBack);
          props.handleBack
          // props.initialClose
        }, 1000);
    
//   }
// }))
    
  };
  // console.log("datasds",props);
  

  return (
    <Card
      sx={{
        padding: 2,
        // maxWidth: 600,
        // margin: "20px auto",
        boxShadow: 5,
        borderRadius: 4,
      }}
    >
      {openAlert && (
    <Snackbar
    open={open}
    autoHideDuration={2000}
    onClose={props.onClose}
    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
  >
    <Alert
      onClose={props.onClose}
      severity='success'
      variant="filled"
      sx={{ width: '100%' }}
      TransitionComponent={SlideTransition}
    >
      {'Payment was updated successfully'}
    </Alert>
  </Snackbar>
    )}
      {/* <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Payment Details
      </Typography> */}
      <form >
        <Grid container spacing={4}>
          <Grid size={12}>
            <TextField
              select
              label="Payment Type"
              name="paymentType"
              value={formData.paymentType}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            >
              <MenuItem value="" disabled>
                Select Payment Type
              </MenuItem>
              <MenuItem value="CreditCard">Credit Card</MenuItem>
              <MenuItem value="BankTransfer">Bank Transfer</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
              <MenuItem value="Cash">Cash</MenuItem>
            </TextField>
          </Grid>

          <Grid size={12}>
            <TextField
              label="Reference No"
              name="referenceNo"
              value={formData.referenceNo}
              onChange={handleChange}
              placeholder="Enter transaction/reference number"
              fullWidth
              variant="outlined"
            />
          </Grid>

          <Grid size={12}>
            <TextField
              label="Amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <Typography sx={{ paddingRight: 1 }}>₹</Typography>
                ),
              }}
            />
          </Grid>

          <Grid size={6}>
            <Button
              type="button"
              variant="contained"
              color="secondary"
              fullWidth
              sx={{ padding: 1.5 }}
          onClick={props.onClose}
            >
              Cancel
            </Button>
          </Grid>
          <Grid size={6}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ padding: 1.5 }}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </Card>
  );
};

export default ManualPayment;
