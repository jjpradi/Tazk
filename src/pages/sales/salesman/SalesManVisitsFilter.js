import React, { useContext, useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogActions,
  Button, MenuItem, Select, InputLabel, FormControl, Grid,
  FormHelperText, IconButton, Box, Typography,
  TextField
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { useDispatch } from 'react-redux';

const today = dayjs();

const buildDateRanges = () => {
  const base = dayjs();

  return [
    { label: 'Today', value: 'TODAY' },
    { label: 'Yesterday', value: 'YESTERDAY' },

    ...[2, 3].map((d) => {
      const date = base.subtract(d, 'day');
      return {
        label: date.format('DD MMM'),
        value: date.format('YYYY-MM-DD'),
      };
    }),

    { label: 'Select Date', value: 'CUSTOM' },
  ];
};

const dateRanges = buildDateRanges();




const getDateFromRange = (rangeValue, selectedDate) => {
  const base = dayjs();

  switch (rangeValue) {
    case 'TODAY':
      return base;

    case 'YESTERDAY':
      return base.subtract(1, 'day');

    case 'CUSTOM':
      return selectedDate;

    default:
      return dayjs(rangeValue);
  }
};



const SalesManVisitsFilter = ({ open, onClose, onApply ,date }) => {
  const dispatch = useDispatch();

  const [formValues, setFormValues] = useState({
    selectedRange: '',
    selectedDate: null,
  });

  const [formErrors, setFormErrors] = useState({
    selectedRange: '',
    selectedDate: '',
  });

  const {
    setLoaderStatusHandler,
    setModalTypeHandler,
  } = useContext(CreateNewButtonContext);

  useEffect(() => {
  if (open && date) {
    const today = dayjs().format('YYYY-MM-DD');
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

    let selectedRange = 'CUSTOM';
    let selectedDate = dayjs(date);

    if (date === today) {
      selectedRange = 'TODAY';
      selectedDate = null;
    } else if (date === yesterday) {
      selectedRange = 'YESTERDAY';
      selectedDate = null;
    }

    setFormValues({
      selectedRange,
      selectedDate,
    });
  }
}, [open, date]);


  const handleClear = () => {
    setFormValues({
      selectedRange: '',
      selectedDate: null,
    });
    setFormErrors({
      selectedRange: '',
      selectedDate: '',
    });
    onClose();
  };

  const handleApply = () => {
    const { selectedRange, selectedDate } = formValues;

    if (!selectedRange) {
      setFormErrors({ selectedRange: 'Select Date is required' });
      return;
    }

    if (selectedRange === 'CUSTOM' && !selectedDate) {
      setFormErrors({ selectedDate: 'Date is required' });
      return;
    }

    const date = getDateFromRange(selectedRange, selectedDate);

    onApply(date.format('YYYY-MM-DD'));
  };



  const handleOnClose = () => {
    onClose();
    handleClear();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} maxWidth="xs" fullWidth>
        <Box display="flex" alignItems="center" justifyContent="space-between" px={2} pt={2}>
          <Typography variant="h6"></Typography>
          <IconButton aria-label="close" onClick={handleOnClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={12}>
              <FormControl fullWidth error={!!formErrors.selectedRange}>
                <InputLabel>Select Range</InputLabel>

                <Select
                  label="Select Range"
                  value={formValues.selectedRange}
                  onChange={(e) => {
                    setFormValues({
                      selectedRange: e.target.value,
                      selectedDate: null,
                    });
                    setFormErrors({ ...formErrors, selectedRange: '' });
                  }}
                >
                  {dateRanges.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </Select>

                <FormHelperText>{formErrors.selectedRange}</FormHelperText>
              </FormControl>

            </Grid>

            {formValues.selectedRange === 'CUSTOM' && (
              <Grid size={12}>
                <DatePicker
                  label="Select Date"
                  value={formValues.selectedDate ? dayjs(formValues.selectedDate) : null}
                  disableFuture
                  format="DD/MM/YYYY"
                  onChange={(newValue) => {
                    setFormValues((prev) => ({
                      ...prev,
                      selectedDate: newValue,
                    }));

                    if (newValue && dayjs(newValue).isValid()) {
                      setFormErrors((prev) => ({ ...prev, selectedDate: '' }));
                    }
                  }}
                  views={['year', 'month', 'day']}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!formErrors.selectedDate,
                      helperText: formErrors.selectedDate,
                      size: 'small',
                    },
                  }}
                />

              </Grid>
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

export default SalesManVisitsFilter;
