import React, { useEffect, useState, useContext, useRef } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useDispatch, useSelector } from 'react-redux';
import context from '../../../context/CreateNewButtonContext';
import { listAttendanceAction } from '../../../redux/actions/attendance_actions';
import { Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, List, ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import MapContainer from './googleMap';
import moment from 'moment';
import AttendanceMap from './attendanceMap';
import apiCalls from 'utils/apiCalls';
import { Helmet } from "react-helmet-async";
import RouteMap from './RouteMap';
import { titleURL } from 'http-common';
import { maxBodyHeight, maxHeight, Width } from 'utils/pageSize';
import AppsContainer from '@crema/core/AppsContainer';
import { getSalesManListAction } from 'redux/actions/fuelAllowance_actions';
import dayjs from 'dayjs';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CommonSearch from 'utils/commonSearch';
import { getsearchSalesManListAction, searchSalesManListAction, setsearchSalesManListAction } from '../../../redux/actions/fuelAllowance_actions';
import SalesManVisitsFilter from '../../sales/salesman/SalesManVisitsFilter';


function Row(props) {
  const { row, setCoordinates, onCellClick } = props;
  const [open, setOpen] = React.useState(false);
  console.log(row, "row")
  return (


    <TableRow>
      <TableCell>{dayjs(row.visit_time).format('hh:mm A')}</TableCell>
      <TableCell>{row.company_name}</TableCell>
      <TableCell>{row.purpose}</TableCell>
      <TableCell>{row.area || '-'}</TableCell>
      <TableCell>{row.zip || '-'}</TableCell>
    </TableRow>

  );
}

export default function Attendance() {
  const dispatch = useDispatch();
  const {
    fuelAllowanceReducer: { searchSalesManList },
    attendanceReducer: { attendance }
  } = useSelector((state) => state);
  const {
    setModalStatusHandler,
    setModalTypeHandler,
    selectData,
    setselectData,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(context);

  const [selectedSalesmanId, setSelectedSalesmanId] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [last7Dates, setLast7Dates] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterDate, setFilterDate] = useState(dayjs());
  const [searchVal, setSearchval] = useState('')

  useEffect(() => {
    const data = { searchString: '' }
    dispatch(searchSalesManListAction(data));
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


  const fetchAttendance = (empId, date) => {
    if (!empId || !date) return;

    dispatch(
      listAttendanceAction(
        moment(date).format('YYYY-MM-DD'),
        setModalTypeHandler,
        setLoaderStatusHandler,
        empId,
        (response) => {
          if (response?.data) {
            setAttendanceData(response.data);
          }
        }
      )
    );
  };

  const handleChipClick = (date) => {
    setSelectedDate(date);
    fetchAttendance(selectedSalesmanId, date);
  };


  const handleSalesmanClick = (empId) => {
    console.log(empId, "fonndknwski")
    setSelectedSalesmanId(empId);
    fetchAttendance(empId, selectedDate);
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

  const handleApply = (dateStr) => {
    setSelectedDate(dateStr);                           
    setFilterOpen(false);
    fetchAttendance(selectedSalesmanId, selectedDate);
  };

  console.log(filterDate, "filterDate")

  return (
    <>
      <Card sx={{ height: 'calc(100vh - 80px)' }}>
        <Helmet>
          <meta charSet="utf-8" />
          <title>{titleURL} | Visits</title>
        </Helmet>

        <Grid container sx={{ height: '100vh' }}>
          <Grid
            sx={{ borderRight: '1px solid #e0e0e0', backgroundColor: '#fff', p: 2, overflowY: 'auto', height: '100%' }}
            size={{
              lg: 3,
              md: 3,
              sm: 12,
              xs: 12
            }}>
            <Grid container>
              <Grid
                size={{
                  lg: 6,
                  md: 6,
                  sm: 12,
                  xs: 12
                }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  Salesman List
                </Typography>
              </Grid>
            </Grid>
            <Grid style={{ marginTop: '40px', overflow: 'auto' }}>
              <Box px={1} pb={1}>
                <CommonSearch
                  searchVal={searchVal}
                  cancelSearch={cancelSearch}
                  requestSearch={requestSearch}
                />
              </Box>
              <List>
                {searchSalesManList?.map(salesman => (
                  <MenuItem
                    key={salesman.empId}
                    onClick={() => handleSalesmanClick(salesman.empId)}
                    sx={{
                      height: '40px',
                      bgcolor: selectedSalesmanId === salesman.empId ? '#E3F2FD' : 'transparent',
                      borderRadius: '4px',
                      mx: 1,
                      mb: 0.5,
                      '&:hover': {
                        bgcolor: '#E3F2FD',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography
                          sx={{
                            fontWeight: selectedSalesmanId === salesman.empId ? '700' : '500',
                            fontSize: '13px',
                            color: selectedSalesmanId === salesman.empId ? '#0A8FDC' : 'text.primary',
                          }}
                        >
                          {salesman.first_name}
                        </Typography>
                      }
                    />
                  </MenuItem>

                ))}
              </List>

            </Grid>

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
                  sm: 12,
                  xs: 12
                }}>
                <Typography variant="h6">Visits</Typography>
              </Grid>

              <Grid
                display='flex'
                justifyContent='end'
                size={{
                  lg: 8,
                  md: 8,
                  sm: 12,
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

              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Visit Time</TableCell>
                    <TableCell>Shop Name</TableCell>
                    <TableCell>Purpose</TableCell>
                    <TableCell>Area</TableCell>
                    <TableCell>Pincode</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendance?.length > 0 && (
                    attendance.map((row) => (
                      <Row
                        key={row.attendance_id || row.id}
                        row={row}
                      />
                    ))
                  )}
                </TableBody>
              </Table>


              <SalesManVisitsFilter
                open={filterOpen}
                onClose={() => {
                  const today = dayjs().format('YYYY-MM-DD');
                  setSelectedDate(today);
                  setFilterOpen(false)
                  fetchAttendance(selectedSalesmanId, selectedDate);
              }}
                onApply={handleApply}
                date={selectedDate}
                setDate={setSelectedDate}
              />
            </Grid>
          </Grid>
        </Grid>
      </Card>
    </>
  );
}
