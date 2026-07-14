import React, { useEffect, useState, useContext } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { getSalesManVisitsAction } from 'redux/actions/salesMan_action';
import HistoryMap from './HistoryMap'
import { Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, FormControl, Grid, IconButton, InputLabel, List, ListItem, ListItemText, MenuItem, Select, Stack, Typography } from '@mui/material';
import { Helmet } from "react-helmet-async";
import { titleURL } from 'http-common';
import CommonSearch from 'utils/commonSearch';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import dayjs from 'dayjs';
import { getsearchSalesManListAction, searchSalesManListAction, setsearchSalesManListAction } from '../../../redux/actions/fuelAllowance_actions';
import SalesManVisitsFilter from './SalesManVisitsFilter';

export default function SalesmanTravelHistory() {

  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(
    CreateNewButtonContext,
  );
  const dispatch = useDispatch();
  const {
    fuelAllowanceReducer: { searchSalesManList },
    salesManReducer: { getSalesManVisits }
  } = useSelector((state) => state);

  const [markers, setMarkers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [selectedSalesmanId, setSelectedSalesmanId] = useState(null);
  const [last7Dates, setLast7Dates] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchVal, setSearchval] = useState('')

  useEffect(() => {
    const data = { searchString: '' }
    dispatch(
      searchSalesManListAction(data),
    )
  }, []);

  useEffect(() => {
    if (searchSalesManList && searchSalesManList.length > 0 && !selectedSalesmanId) {
      const firstSalesman = searchSalesManList[0];
      setSelectedSalesmanId(firstSalesman.empId);
      fetchAttendance(firstSalesman.empId, selectedDate);
    }
  }, [searchSalesManList, selectedDate]);

  useEffect(() => {
    const today = dayjs();
    const dates = [];

    for (let i = 0; i <= 5; i++) {
      dates.push(today.subtract(i, 'day').format('YYYY-MM-DD'));
    }

    setLast7Dates(dates);
  }, []);

  useEffect(() => {
    if (getSalesManVisits !== undefined && getSalesManVisits.length > 0) {
      let tempArr = [];
      getSalesManVisits.map((place) => {
        let tempObj1 = {
          name: place.company_name,
          position: { lat: place.start_lat, lng: place.start_long },
          entry_time: place.entry_time?.slice(10, 16)

        };

        let tempObj2 = {
          name: place.company_name,
          position: { lat: place.end_lat, lng: place.end_long },
          entry_time: place.entry_time?.slice(10, 16)
        };

        tempArr.push(tempObj1);
        tempArr.push(tempObj2);
      });

      setMarkers(tempArr);
    } else {
      setMarkers([]);
    }
  }, [getSalesManVisits]);

  const fetchAttendance = (empId, date) => {
    let data = { employee_id: empId, date };
    dispatch(
      getSalesManVisitsAction(
        data,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    )
  };

  const handleSalesmanClick = (empId) => {
    setSelectedSalesmanId(empId);
    fetchAttendance(empId, selectedDate);
  };

  const handleChipClick = (date) => {
    setSelectedDate(date);
    fetchAttendance(selectedSalesmanId, date);
  };

  const cancelSearch = () => {
    setSearchval('')
    let payLoad = {
      searchString: ""
    }
    dispatch(searchSalesManListAction(payLoad))
  };

  const requestSearch = (e) => {
    const val = e?.target?.value || '';
    setSearchval(val)
    dispatch(setsearchSalesManListAction());
    let payLoad = {
      searchString: val
    }
    dispatch(getsearchSalesManListAction(payLoad, setModalTypeHandler, setLoaderStatusHandler))
  };

  const handleApply = (appliedDate) => {
    if (selectedSalesmanId && appliedDate) {
      const formattedDate = dayjs(appliedDate).format('YYYY-MM-DD');
      setSelectedDate(formattedDate);
      fetchAttendance(selectedSalesmanId, formattedDate);
    }
    setFilterOpen(false);
  };

  console.log(searchSalesManList, "searchSalesManList")

  return (
    <>
      <Card sx={{ height: 'calc(100vh - 80px)' }}>
        <Helmet>
          <meta charSet="utf-8" />
          <title>{titleURL} | SalesMan - Travel History</title>
        </Helmet>

         <Grid container spacing={2}>
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
            <Stack spacing={1} marginTop='20px'>
                {searchSalesManList?.map(salesman => (
                  <MenuItem
                    key={salesman.empId}
                    onClick={() => handleSalesmanClick(salesman.empId)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: selectedSalesmanId === salesman.empId ? 600 : 400,
                      color: selectedSalesmanId === salesman.empId ? '#0288d1' : '#000',
                      backgroundColor: selectedSalesmanId === salesman.empId ? '#e3f2fd' : 'transparent',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                      marginTop: '5px'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box>
                          <Typography
                            sx={{
                              fontWeight: selectedSalesmanId === salesman.empId ? '700' : '500',
                              fontSize: '13px',
                              color: selectedSalesmanId === salesman.empId ? '#0A8FDC' : 'text.primary',
                              textTransform: "capitalize"
                            }}
                          >
                            {salesman.first_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Bike: {salesman.bike_name || '-'} | Mileage: {salesman.mileage || '-'}
                          </Typography>
                        </Box>
                      }
                    />
                  </MenuItem>
                ))}
              </Stack>
            </Box>
          
          </Grid>

           <Grid
             size={{
               lg: 9,
               md: 9,
               sm: 12,
               xs: 12
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
                <Typography variant="h6">SalesMan - Travel History</Typography>
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
                  {last7Dates.map((date) => {
                    const isToday = date === dayjs().format('YYYY-MM-DD');
                    const isYesterday = date === dayjs().subtract(1, 'day').format('YYYY-MM-DD');

                    return (
                      <Chip
                        key={date}
                        label={
                          isToday
                            ? 'Today'
                            : isYesterday
                              ? 'Yesterday'
                              : dayjs(date).format('DD MMM')
                        }
                        color="primary"
                        onClick={() => handleChipClick(date)}
                        sx={{ cursor: 'pointer', height: 38 }}
                        variant={selectedDate === date ? 'filled' : 'outlined'}
                      />
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
                <IconButton onClick={() => setFilterOpen(true)} size="large">
                  <FilterAltIcon />
                </IconButton>
              </Grid>
              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <HistoryMap getSalesManVisits={getSalesManVisits} markers={markers} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>
      <SalesManVisitsFilter
               open={filterOpen}
               onClose={() => {
                 const today = dayjs().format('YYYY-MM-DD');
                 setSelectedDate(today);
                 setFilterOpen(false)
                 fetchAttendance(selectedSalesmanId, selectedDate);

               }
               }
               onApply={handleApply}
               date={selectedDate}
               setDate={setSelectedDate}
             />
    </>
  );
}
