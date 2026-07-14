import React, { useContext, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  FormHelperText,
  IconButton,
  Box,
  Typography,
  TextField,
  Autocomplete,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import { useDispatch, useSelector } from "react-redux";
import { listCustomerAction } from "redux/actions/customer_actions";

const today = dayjs();

const statusList = [
  { value: "open", label: "Open", color: "#ff69b4" },
  { value: "assigned", label: "Assigned", color: "#c0b000" },
  { value: "wip", label: "Work In Progress", color: "#2196f3" },
  { value: "waiting", label: "Waiting for Parts", color: "#9c27b0" },
  { value: "repair_done", label: "Repair Done", color: "#4caf50" },
  { value: "delivered", label: "Delivered", color: "#03a9f4" },
  { value: "closed", label: "Closed", color: "#9e9e9e" }
];

const ServiceFilter = ({ open, onClose, onApply }) => {
  const dispatch = useDispatch();
  const {
    customerReducer: { customer },
  } = useSelector((state) => state);
  console.log('filtercusto', customer)
  const [formValues, setFormValues] = useState({
    fromDate: null,
    toDate: null,
    customer: null,
    status: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const { setLoaderStatusHandler, setModalTypeHandler } =
    useContext(CreateNewButtonContext);

    useEffect(() => {
        dispatch(listCustomerAction())
      }, [])

  const handleClear = () => {
    setFormValues({
      fromDate: null,
      toDate: null,
      customer: null,
      status: "",
    });
    setFormErrors({});
  };

  const handleApply = () => {
    const { fromDate, toDate, customer, status } = formValues;
    const errors = {};
    console.log('hasdfghhnb',fromDate, toDate, customer, status)
    // if (!fromDate) {
    //   errors.fromDate = "From Date is required";
    // }
    // if (!toDate) {
    //   errors.toDate = "To Date is required";
    // } else if (fromDate && toDate.isBefore(fromDate)) {
    //   errors.toDate = "To Date cannot be before From Date";
    // }

    // if (Object.keys(errors).length > 0) {
    //   setFormErrors(errors);
    //   return;
    // }

    setFormErrors({});

    if (onApply) {
      console.log('hasdfghhnb1',fromDate ? fromDate.format("YYYY-MM-DD") : null, toDate ? toDate.format("YYYY-MM-DD") : null, customer, status)
      onApply({
        fromDate: fromDate ? fromDate.format("YYYY-MM-DD") : null,
        toDate: toDate ? toDate.format("YYYY-MM-DD") : null,
        customer,
        status,
      });
    }

    onClose();
    handleClear();
  };

  const handleOnClose = () => {
    onClose();
    handleClear();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} maxWidth="xs" fullWidth>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          px={2}
          pt={2}
        >
          <Typography variant="h6"></Typography>
          <IconButton aria-label="close" onClick={handleOnClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent>
          <Grid container spacing={2}>
            {/* From Date */}
            {/* <Grid size={12}>
              <DatePicker
                label="From Date"
                value={formValues.fromDate}
                maxDate={today}
                format="DD/MM/YYYY"
                onChange={(newValue) => {
                  setFormValues((prev) => ({ ...prev, fromDate: newValue }));
                  if (newValue && dayjs(newValue).isValid()) {
                    setFormErrors((prev) => ({ ...prev, fromDate: "" }));
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!formErrors.fromDate,
                    helperText: formErrors.fromDate,
                    size: "small",
                  },
                }}
              />
            </Grid>

            <Grid size={12}>
              <DatePicker
                label="To Date"
                value={formValues.toDate}
                maxDate={today}
                format="DD/MM/YYYY"
                onChange={(newValue) => {
                  setFormValues((prev) => ({ ...prev, toDate: newValue }));
                  if (newValue && dayjs(newValue).isValid()) {
                    setFormErrors((prev) => ({ ...prev, toDate: "" }));
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!formErrors.toDate,
                    helperText: formErrors.toDate,
                    size: "small",
                  },
                }}
              />
            </Grid> */}

            {/* Customer */}
            <Grid size={12}>
              <Autocomplete
                id="customer-autocomplete"
                value={formValues.customer}
                onChange={(event, newValue) =>
                  setFormValues((prev) => ({ ...prev, customer: newValue }))
                }
                options={customer?.filter(
                  (c) =>
                    c.customer_id &&
                    (c.customer_type === "1" || c.customer_type === "0")
                )}
                getOptionLabel={(option) => option?.first_name || ""}
                isOptionEqualToValue={(option, value) =>
                  option.customer_id === value?.customer_id
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Customer"
                    placeholder="Select Customer"
                    fullWidth
                    variant="outlined"
                  />
                )}
              />
            </Grid>

            {/* Status */}
            {/* <Grid size={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formValues.status}
                  label="Status"
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                >
                  {statusList.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid> */}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button variant="contained" color="secondary" onClick={handleClear}>
            Clear
          </Button>
          <Button variant="contained" onClick={handleApply}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ServiceFilter;
