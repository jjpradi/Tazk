import {
  Grid,
  Typography,
  Autocomplete,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import React, { useEffect, useState, useContext } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { connect, useDispatch, useSelector } from 'react-redux';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {
  createFuelPriceAction,
  getTravelDetailsAction,
  getFuelPriceListAction,
  getSalesManListAction,
  deleteFuelPriceListAction,
  getAllowanceListAction,
  updateFuelPriceAction,
} from 'redux/actions/fuelAllowance_actions';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { getSalesManVisitsAction } from 'redux/actions/salesMan_action';
import OpenStreetMapHistory from './googleMap';
import moment from 'moment';
import apiCalls from 'utils/apiCalls';
import { OpenStreetMap } from './SalesManLiveLocation';
import { Helmet } from "react-helmet-async";
import { titleURL } from 'http-common';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import TransactionFilter from 'components/customer_erpDesign/transactions/transactionFilter';
import SalesManVisitsFilter from '../../sales/salesman/SalesManVisitsFilter'
import { maxHeight } from 'utils/pageSize';
import CommonSearch from 'utils/commonSearch';

function SalesExecutiveVisitHistory() {
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(
    CreateNewButtonContext,
  );
  const dispatch = useDispatch();
  const {
    fuelAllowanceReducer: { salesManList },
    salesManReducer: { getSalesManVisits }
  } = useSelector((state) => state);
  console.log(getSalesManVisits, 'getSalesManVisits')
  useEffect(() => {
    let data = {searchString: searchVal}
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        getSalesManListAction(data, setModalTypeHandler, setLoaderStatusHandler),
      )
    );
  }, []);

  const [employeeId, setEmployeeId] = useState('');
  const [openFilter, setOpenFilter] = useState(false);
  const [date, setDate] = useState(null);
  const [selectedDaysAgo, setSelectedDaysAgo] = useState(0);
  const [searchVal, setSearchVal] = useState('');
  console.log(date, 'consoledate')

  useEffect(() => {
    let data = { employee_id: employeeId, date };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        getSalesManVisitsAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      )
    );
  }, [date, employeeId]);

  useEffect(() => {
    if (salesManList && salesManList.length > 0 && !employeeId) {
      setEmployeeId(salesManList[0].empId);
      setDate(moment().format('YYYY-MM-DD'));
    }
  }, [salesManList]);
  console.log('salesManList', salesManList)

  const quickDates = [
    { label: 'Today', daysAgo: 0 },
    { label: 'Yesterday', daysAgo: 1 },
    { label: moment().subtract(2, 'days').format('DD MMM'), daysAgo: 2 },
    { label: moment().subtract(3, 'days').format('DD MMM'), daysAgo: 3 },
    { label: moment().subtract(4, 'days').format('DD MMM'), daysAgo: 4 },
    { label: moment().subtract(5, 'days').format('DD MMM'), daysAgo: 5 },
  ];

  const handleQuickDate = (daysAgo) => {
    const selectedDate = moment().subtract(daysAgo, 'days').format('YYYY-MM-DD');
    setDate(selectedDate);
    console.log(selectedDate, 'selectedDAtee')
    setSelectedDaysAgo(daysAgo);
  };

  const handleApply = (selectedDate) => {
    setDate(selectedDate);
    const matched = quickDates.find(({ daysAgo }) =>
      moment().subtract(daysAgo, 'days').format('YYYY-MM-DD') === selectedDate
    );
    if (matched) {
      setSelectedDaysAgo(matched.daysAgo);
    } else {
      setSelectedDaysAgo(null);
    }
     setOpenFilter(false);
  }

  const requestSearch = (e) => {
  const val = e?.target?.value || '';
  setSearchVal(val);

  const payload = {
    searchString: val
  };

  apiCalls(
    setModalTypeHandler,
    setLoaderStatusHandler,
    dispatch(
      getSalesManListAction(payload, setModalTypeHandler, setLoaderStatusHandler),
    )
  );
};

  const cancelSearch = () => {
  setSearchVal('');

  const payload = {
    searchString: ''
  };

  apiCalls(
    setModalTypeHandler,
    setLoaderStatusHandler,
    dispatch(
      getSalesManListAction(payload, setModalTypeHandler, setLoaderStatusHandler),
    )
  );
};


  return (
    <>
      <Card sx={{ height: 'calc(100vh - 80px)' }}>
        <Helmet>
          <meta charSet="utf-8" />
          <title>{titleURL} | SalesExecutive Visits</title>
        </Helmet>

        <Grid container sx={{ height: '100%' }}>
          <Grid
            sx={{ borderRight: '1px solid #e0e0e0', backgroundColor: '#fff', p: 2 }}
            size={{
              lg: 3,
              md: 3,
              sm: 12,
              xs: 12
            }}>
            <Grid container>
              <Grid
                marginBottom='20px'
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  Salesman List
                </Typography>
              </Grid>
            </Grid>

            <div>
              <CommonSearch
              searchVal={searchVal}
              cancelSearch={cancelSearch}
              requestSearch={requestSearch}
              />
            </div>

            <Box
              sx={{
                height: 'calc(100vh - 220px)', 
                overflowY: 'auto',
                pr: 1
              }}
            >
              <Stack spacing={1} mt={2}>
                {salesManList?.map((item) => {
                  const isActive = employeeId === item.empId;
                  return (
                    <Box
                      key={item.empId}
                      onClick={() => setEmployeeId(item.empId)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#0288d1' : '#000',
                        backgroundColor: isActive ? '#e3f2fd' : 'transparent',
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                        },
                      }}
                    >
                      <Box>
                        <Typography fontSize={14} textTransform="capitalize">
                          {item.first_name} {item.last_name || ''}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Bike: {item.bike_name || '-'} | Mileage: {item.mileage || '-'}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </Box>

          </Grid>

          <Grid
            sx={{ p: 3, height: '100%', overflowY: 'auto' }}
            size={{
              lg: 9,
              md: 9,
              sm: 12
            }}>
            <Grid container spacing={2}>
              <Grid
                display='flex'
                alignContent='center'
                size={{
                  lg: 3.5,
                  md: 3.5,
                  sm: 3.5,
                  xs: 12
                }}>
                <Typography variant="h6">Sales Executive - Visit History</Typography>
              </Grid>

              <Grid
                display='flex'
                justifyContent='end'
                size={{
                  lg: 8,
                  md: 8,
                  sm: 8,
                  xs: 12
                }}>
                <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                  {quickDates.map(({ label, daysAgo }) => {
                    const isSelected = selectedDaysAgo !== null && selectedDaysAgo === daysAgo;
                    return (
                      <Button
                        key={label}
                        variant={isSelected ? "contained" : "outlined"}
                        size="small"
                        onClick={() => handleQuickDate(daysAgo)}
                        sx={{
                          borderRadius: '20px',
                          textTransform: 'none',
                          fontWeight: 500,
                          px: 2,
                          color: isSelected ? '#fff' : '#0288d1',
                          backgroundColor: isSelected ? '#0288d1' : 'transparent',
                          borderColor: '#0288d1',
                          '&:hover': {
                            backgroundColor: isSelected ? '#0288d1' : '#e1f5fe',
                            color: isSelected ? '#fff' : '#0288d1',
                          },
                        }}
                      >
                        {label}
                      </Button>
                    );
                  })}
                </Box>
              </Grid>

              <Grid
                display='flex'
                justifyContent='end'
                size={{
                  lg: 0.5,
                  md: 0.5,
                  sm: 0.5,
                  xs: 12
                }}>
                <IconButton onClick={() => setOpenFilter(true)} size="large">
                  <FilterAltIcon />
                </IconButton>
              </Grid>

              <Grid size={12}>
                <OpenStreetMapHistory getSalesManVisits={getSalesManVisits} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>
      <SalesManVisitsFilter
        open={openFilter}
        onClose={() => {
        const today = moment().format('YYYY-MM-DD');
        setDate(today);
        setOpenFilter(false);
        setSelectedDaysAgo(0); 
         }}
        onApply={handleApply}
        date={date}
        setDate={setDate}
      />
    </>
  );


}

export default SalesExecutiveVisitHistory;
