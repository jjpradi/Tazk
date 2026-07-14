import React, { useContext, useState } from 'react';
import {
  Modal, Card, Button, TextField, Autocomplete, Box, Badge, Grid, IconButton,
} from '@mui/material';
import { FilterAlt } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment as DateAdapter } from '@mui/x-date-pickers/AdapterMoment';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import context from '../../../context/CreateNewButtonContext';
import moment from 'moment';
import toMomentOrNull from '../../../utils/DateFixer';
import _ from 'lodash';

const style = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 370, bgcolor: 'background.paper', boxShadow: 25, p: 3, borderRadius: 4,
};

const rangeOptions = [
  'Today', 'Yesterday', 'This Week', 'Last Week', 'Last 7 Days',
  'This Month', 'Last Month', 'This Quarter', 'Last Quarter',
  'Current Fiscal Year', 'Previous Fiscal Year', 'Last 365 Days'
];

function computeDateRange(option) {
  let s, e;
  switch (option) {
    case 'Today': s = e = moment().startOf('day'); break;
    case 'Yesterday': s = e = moment().subtract(1, 'day').startOf('day'); break;
    case 'This Week': s = moment().startOf('week'); e = moment().endOf('week'); break;
    case 'Last Week': s = moment().subtract(1, 'week').startOf('week'); e = moment().subtract(1, 'week').endOf('week'); break;
    case 'Last 7 Days': s = moment().subtract(6, 'days').startOf('day'); e = moment().endOf('day'); break;
    case 'This Month': s = moment().startOf('month'); e = moment().endOf('month'); break;
    case 'Last Month': s = moment().subtract(1, 'month').startOf('month'); e = moment().subtract(1, 'month').endOf('month'); break;
    case 'This Quarter': s = moment().startOf('quarter'); e = moment().endOf('quarter'); break;
    case 'Last Quarter': s = moment().subtract(1, 'quarter').startOf('quarter'); e = moment().subtract(1, 'quarter').endOf('quarter'); break;
    case 'Current Fiscal Year':
      s = moment().month() >= 3 ? moment().month(3).startOf('month') : moment().subtract(1, 'year').month(3).startOf('month');
      e = s.clone().add(1, 'year').subtract(1, 'day'); break;
    case 'Previous Fiscal Year':
      s = moment().month() >= 3 ? moment().subtract(1, 'year').month(3).startOf('month') : moment().subtract(2, 'year').month(3).startOf('month');
      e = s.clone().add(1, 'year').subtract(1, 'day'); break;
    case 'Last 365 Days': s = moment().subtract(364, 'days').startOf('day'); e = moment().endOf('day'); break;
    default: return null;
  }
  return { start: s, end: e };
}

export default function FilterCreditNotes({ open, handleClose, from, to, locationFilter, onApply, onClear, count, children }) {
  const dispatch = useDispatch();
  const { stockLocationReducer: { stocklocation } } = useSelector((state) => state);
  const { setLoaderStatusHandler, setModalTypeHandler, commoncookie, headerLocationId } = useContext(context);

  const [localFrom, setLocalFrom] = useState(from);
  const [localTo, setLocalTo] = useState(to);
  const [localLocation, setLocalLocation] = useState(locationFilter || []);
  const [dateRange, setDateRange] = useState(null);

  const handleOpen = () => {
    setLocalFrom(from);
    setLocalTo(to);
    setLocalLocation(locationFilter || []);
    if (!stocklocation?.length) {
      dispatch(listStockLocationAction(commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler));
    }
    handleClose(true);
  };

  return (
    <>
      <Badge color="secondary" badgeContent={count || 0} sx={{ cursor: 'pointer' }}>
        <FilterAlt onClick={handleOpen} sx={{ fontSize: 22, color: '#555' }} />
      </Badge>
      <Modal open={open} onClose={() => handleClose(false)}>
        <Card sx={style}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box sx={{ fontWeight: 600, fontSize: 15 }}>Filter</Box>
            <IconButton size="small" onClick={() => handleClose(false)}><CloseIcon fontSize="small" /></IconButton>
          </Box>
          <LocalizationProvider dateAdapter={DateAdapter}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Autocomplete
                  options={rangeOptions}
                  value={dateRange}
                  onChange={(e, val) => {
                    setDateRange(val);
                    const range = computeDateRange(val);
                    if (range) { setLocalFrom(range.start); setLocalTo(range.end); }
                  }}
                  renderInput={(params) => <TextField {...params} label="Select Range" variant="filled" size="small" />}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <DatePicker label="From" value={toMomentOrNull(localFrom)} format="DD/MM/YYYY"
                  onChange={(d) => { setLocalFrom(d); setDateRange(null); }}
                  slotProps={{ textField: { fullWidth: true, size: 'small', variant: 'filled' } }} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <DatePicker label="To" value={toMomentOrNull(localTo)} format="DD/MM/YYYY"
                  onChange={(d) => { setLocalTo(d); setDateRange(null); }}
                  slotProps={{ textField: { fullWidth: true, size: 'small', variant: 'filled' } }} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Autocomplete
                  multiple size="small"
                  options={Array.isArray(stocklocation) ? _.uniqBy(stocklocation, 'location_name') : []}
                  getOptionLabel={(o) => o.location_name || ''}
                  value={localLocation}
                  onChange={(e, val) => setLocalLocation(val)}
                  renderInput={(params) => <TextField {...params} label="Location" variant="filled" />}
                />
              </Grid>
              {children && <Grid size={{ xs: 12 }}>{children}</Grid>}
              <Grid size={{ xs: 6 }}>
                <Button fullWidth variant="outlined" onClick={() => {
                  setLocalFrom(moment().startOf('month'));
                  setLocalTo(moment());
                  setLocalLocation([]);
                  setDateRange(null);
                  onClear();
                  handleClose(false);
                }}>Clear</Button>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Button fullWidth variant="contained" onClick={() => {
                  onApply({
                    from: localFrom ? moment(localFrom).format('YYYY-MM-DD') : null,
                    to: localTo ? moment(localTo).format('YYYY-MM-DD') : null,
                    locations: localLocation || [],
                  });
                  handleClose(false);
                }}>Apply</Button>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Card>
      </Modal>
    </>
  );
}
