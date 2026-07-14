import React, { useContext, useState } from 'react';
import {
  Dialog, DialogContent, DialogActions,
  Button, MenuItem, Select, InputLabel, FormControl, Grid,
  FormHelperText, IconButton, Box, Typography
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import apiCalls from 'utils/apiCalls';
import { recentCreditDebitNotesAction } from 'redux/actions/manualNotes_actions';
import { getSaleOrderDeliveryChallanByCustomerAction } from 'redux/actions/sales_actions';
import { getPurchaseOrderByVendorAction } from 'redux/actions/purchase_actions';
import { getQuotationByCustomerAction } from 'redux/actions/quotation_actions';
import { getExpensesByVendorAction } from 'redux/actions/expense_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { useDispatch } from 'react-redux';
import toMomentOrNull from 'utils/DateFixer';

dayjs.extend(isBetween);
dayjs.extend(quarterOfYear);
dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);
dayjs.extend(isLeapYear);

const dateRanges = [
  "Today", "Yesterday", "This Week", "Last Week", "Last 7 days",
  "This Month", "Last Month", "This Quarter", "Last Quarter",
  "Current Fiscal Year", "Previous Fiscal Year", "Last 365 days", "Date Range"
];

const getDateRange = (range, fromDate, toDate) => {
  const today = dayjs();
  const startOfWeek = today.startOf('week');
  const startOfMonth = today.startOf('month');
  const startOfQuarter = today.startOf('quarter');

  switch (range) {
    case 'Today':
      return { from: today, to: today };
    case 'Yesterday':
      return { from: today.subtract(1, 'day'), to: today.subtract(1, 'day') };
    case 'This Week':
      return { from: startOfWeek, to: today.endOf('week') };
    case 'Last Week':
      return { from: startOfWeek.subtract(7, 'day'), to: startOfWeek.subtract(1, 'day') };
    case 'Last 7 days':
      return { from: today.subtract(6, 'day'), to: today };
    case 'This Month':
      return { from: startOfMonth, to: startOfMonth.endOf('month') };
    case 'Last Month':
      const lastMonth = today.subtract(1, 'month');
      return { from: lastMonth.startOf('month'), to: lastMonth.endOf('month') };
    case 'This Quarter':
      return { from: startOfQuarter, to: startOfQuarter.endOf('quarter') };
    case 'Last Quarter':
      const lastQuarter = today.subtract(1, 'quarter');
      return { from: lastQuarter.startOf('quarter'), to: lastQuarter.endOf('quarter') };
    case 'Current Fiscal Year':
      return { from: dayjs(`${today.year()}-04-01`), to: dayjs(`${today.year() + 1}-03-31`) };
    case 'Previous Fiscal Year':
      return { from: dayjs(`${today.year() - 1}-04-01`), to: dayjs(`${today.year()}-03-31`) };
    case 'Last 365 days':
      return { from: today.subtract(364, 'day'), to: today };
    case 'Date Range':
      return { from: fromDate, to: toDate };
    default:
      return { from: null, to: null };
  }
};

const TransactionFilter = ({ open, onClose, onApply, selectedTab, setSelectedTab, customer_id, contactType, pageSize, page }) => {
  const dispatch = useDispatch()
  console.log('propsselectedtab', selectedTab)
  const [formValues, setFormValues] = useState({
    selectedRange: '',
    fromDate: null,
    toDate: null,
  });

  const [formErrors, setFormErrors] = useState({
    selectedRange: '',
    fromDate: '',
    toDate: '',
  });

  const {
      setLoaderStatusHandler,
      setModalTypeHandler,
    } = useContext(CreateNewButtonContext);

  const handleClear = () => {
    setFormValues({
      selectedRange: '',
      fromDate: null,
      toDate: null,
    });
    setFormErrors({
      selectedRange: '',
      fromDate: '',
      toDate: '',
    });
  };

  const handleApply = () => {
    const { selectedRange, fromDate, toDate } = formValues;
    const errors = {};

    if (!selectedRange) {
      errors.selectedRange = 'Date range is required';
    }

    if (selectedRange === 'Date Range') {
      if (!fromDate) {
        errors.fromDate = 'From Date is required';
      }
      if (!toDate) {
        errors.toDate = 'To Date is required';
      }
      if (fromDate && toDate && dayjs(fromDate).isAfter(dayjs(toDate))) {
        errors.toDate = 'To Date cannot be before From Date';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    const { from, to } = getDateRange(selectedRange, fromDate, toDate);

    onApply({
      selectedRange,
      fromDate: from ? dayjs(from).format('YYYY-MM-DD') : null,
      toDate: to ? dayjs(to).format('YYYY-MM-DD') : null,
    });

    onClose();
  };

   const handleOnClose = async () => {
    console.log(selectedTab, 'handletabchangedddcd')
    if (selectedTab == 'CreditNotes' || selectedTab === 'debitNote') {
          const data = {
            customer_id: contactType === 'Customer' ? customer_id : null,
            supplier_id: contactType === 'Supplier' ? customer_id : null,
            pageCount: page || 0,
            numPerPage: pageSize || 0,
            searchString: ''
          };
          await apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(recentCreditDebitNotesAction(data))
          )
        }
        if (['invoice', 'customerReceipts', 'saleOrder', 'deliveryChallan'].includes(selectedTab)) {
          await apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(getSaleOrderDeliveryChallanByCustomerAction({ customerId: customer_id, type: selectedTab, pageCount: page || 0, numPerPage: pageSize || 0, searchString: '' })))
        }
        if (['vendorPayments', 'purchaseOrder', 'bills'].includes(selectedTab)) {
          await apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(getPurchaseOrderByVendorAction({ vendorId: customer_id, type: selectedTab, pageCount: page || 0, numPerPage: pageSize || 0, searchString: ''  })))
        }
        if (selectedTab == 'quotation') {
          await apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(getQuotationByCustomerAction(customer_id, page, pageSize, "")))
        }
        if (selectedTab == 'expenses') {
          await apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(getExpensesByVendorAction(customer_id, page, pageSize, '')))
        }
  onClose();
  handleClear()
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} maxWidth="xs" fullWidth>
        <Box display="flex" alignItems="center" justifyContent="space-between" px={2} pt={2}>
          <Typography variant="h6"></Typography>
          <IconButton aria-label="close" onClick={() => handleOnClose()}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={12}>
              <FormControl fullWidth error={!!formErrors.selectedRange}>
                <InputLabel>Select Range</InputLabel>
                <Select
                  value={formValues.selectedRange}
                  label="Select Range"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormValues((prev) => ({ ...prev, selectedRange: value }));
                    if (value) {
                      setFormErrors((prev) => ({ ...prev, selectedRange: '' }));
                    }
                  }}
                  MenuProps={{
                    PaperProps: { style: { maxHeight: 250, overflowY: 'auto' } },
                    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                    transformOrigin: { vertical: 'top', horizontal: 'left' },
                  }}
                >
                  {dateRanges.map((range) => (
                    <MenuItem key={range} value={range}>
                      {range}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{formErrors.selectedRange}</FormHelperText>
              </FormControl>
            </Grid>

            {formValues.selectedRange === 'Date Range' && (
              <>
                <Grid size={12}>
                  <DatePicker
                    label="From Date"
                    value={toMomentOrNull(formValues.fromDate)}
                    onChange={(date) => {
                      setFormValues((prev) => ({ ...prev, fromDate: date }));
                      if (date) {
                        setFormErrors((prev) => ({ ...prev, fromDate: '' }));
                      }
                    }}
                    format="DD-MM-YYYY"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!formErrors.fromDate,
                        helperText: formErrors.fromDate,
                      },
                    }}
                  />
                </Grid>
                <Grid size={12}>
                  <DatePicker
                    label="To Date"
                    value={toMomentOrNull(formValues.toDate)}
                    onChange={(date) => {
                      setFormValues((prev) => ({ ...prev, toDate: date }));
                      if (date) {
                        setFormErrors((prev) => ({ ...prev, toDate: '' }));
                      }
                    }}
                    format="DD-MM-YYYY"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!formErrors.toDate,
                        helperText: formErrors.toDate,
                      },
                    }}
                  />
                </Grid>
              </>
            )}
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

export default TransactionFilter;
