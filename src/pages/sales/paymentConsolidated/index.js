import React, {useEffect, useState, useContext, useRef} from 'react';
import {styled} from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, {tableCellClasses} from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {useDispatch, useSelector} from 'react-redux';
import {
  getSearchConsolidatedAction,
  listoutstanding,
  listSalesDateAction,
  setSearchConsolidatedAction,
} from '../../../redux/actions/sales_actions';
import context from '../../../context/CreateNewButtonContext';
import SearchIcon from '@mui/icons-material/Search';
import {TextField, Grid, Autocomplete, Tooltip} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import CloseIcon from '@mui/icons-material/Close';
import {Typography} from '@mui/material';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Box from '@mui/material/Box';
import moment from 'moment';
import {connect} from 'react-redux';
import {commonDateFormat, getDateTime} from '../../../utils/getTimeFormat';
import CommonFilter from '../../../components/pos/payment_section/CommonFilter';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import {result} from 'lodash';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import NoRecordFound from 'components/Layout/NoRecordFound';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500 } from 'utils/pageSize';
import ClearIcon from '@mui/icons-material/Clear';
import CommonSearch from 'utils/commonSearch';
import { titleURL } from 'http-common';


const StyledTableCell = styled(TableCell)(({theme}) => ({
  [`&.${tableCellClasses.head}`]: {
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: font14_500.fontSize,
  },
}));

const StyledTableRow = styled(TableRow)(({theme}) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 2,
  },
}));


function Row(props) {
  const {row} = props;
}

// const rows = [
//   createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
//   createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
//   createData('Eclair', 262, 16.0, 24, 6.0),
//   createData('Cupcake', 305, 3.7, 67, 4.3),
//   createData('Gingerbread', 356, 16.0, 49, 3.9),
// ];

function Outstanding(props) {
  const dispatch = useDispatch();

  const {filter_date} = props;

  const {
    salesReducer: {sales},
    salesReducer: {list_outstanding,searchConsolitData},
  } = useSelector((state) => state);
  const [PayData, setPayData] = React.useState({
    list_outstanding: [],
  });
  const [search, setSearch] = useState('');
  const [allData, setAllData] = useState([]);
  const [isFilter, setIsFilter] = useState(false);
  const [filtereddata, setFiltereddata] = useState([]);
  const [filterOpen, handleFilter] = useState(false);
  
  const {
    setLoaderStatusHandler,
    setModalStatusHandler,
    setselectData,
    setModalTypeHandler,
    commoncookie,
    headerLocationId,
  } = useContext(context);
  const [party, setparty] = useState('');
  const [company, setcompany] = useState('');
  const [date, setdate] = React.useState(moment());
  const [count, setCount] = useState(0);
  const [newValue, setNewValue] = useState('');
  // var day = ("0" + date.getDate()).slice(-2);
  // var month = ("0" + (date.getMonth() + 1)).slice(-2);
  // var today = date.getFullYear() + "-" + month + "-" + day;
  // var today = new Date();
  const [datevalue, setdatevalue] = useState(null);
  const [dateexist, setdateexist] = useState(false);
  const tempinitsform = useRef(null);
  const tempinit = useRef(null);
  const [searchVal, setSearchVal] = useState('')
  const [isApiFinished, setIsApiFinished] = useState(false)

  const handleChange = async (month) => {
    if (month !== '' && typeof month !== 'undefined') {
      const result = allData.filter(
        (f) => f.sale_time.slice(0, 10) === month.toISOString().slice(0, 10),
      );
      // this.setState({ inventory_data: Filtering })
      setFiltereddata();
    } else {
      setFiltereddata(allData);
    }
  };


  function getDifferenceInDays(date1, date2) {
    let Fist = new Date(date1);
    let second = new Date();
    const diffInMs = Math.abs(Fist - second);
    const diff = diffInMs / (1000 * 60 * 60 * 24);
    return Math.round(diff) - 1;
  }

  const datewisedifference = () => {};

  const initsform = () => {
    
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        listoutstanding(
          setModalTypeHandler,
          setLoaderStatusHandler,
          commoncookie,
          headerLocationId,
        ),
      ).finally(() => setIsApiFinished(true))
    );
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    dispatch(setSearchConsolidatedAction({ data: [] }));
    tempinitsform.current();
  }, []);

  const filteredvalue = () => {
    setFiltereddata(filter_date);
    setAllData(filter_date);
  };
  tempinit.current = filteredvalue;
  useEffect(() => {
    // // setAllData(list_outstanding);
    // setFiltereddata(filter_date);
    // // if(isFilter){
    //   setAllData(filter_date);
    //   // setIsFilter(false)

    // // }
    tempinit.current();
    if (!company.length > 0) {
      setFiltereddata(filter_date);
    }
    // setAllData(list_outstanding);

    if (isFilter) {
      setAllData(filter_date);
      // setIsFilter(false)
    }
  }, [filter_date]);

  useEffect(() => {
    const dateVal = date;
    setdate(dateVal);
    let convertedDate = moment(dateVal, 'year', 'month', 'day').format(
      'yyyy-MM-DD',
    );
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
        props.listSalesDateAction(
          convertedDate,
          commoncookie,
          headerLocationId,
          (res) => {
            if (res.status === 200) {
              setFiltereddata(res.data)
            }
          },
          newValue === '' ? "null" : newValue
        )
    );
  }, [headerLocationId]);

  const handleSearch = (event) => {
    let value = event.target.value.toLowerCase();
    if (value !== '') {
      const result = allData.filter((data) => {
        return (
          (data.first_name && data.first_name.toLowerCase().includes(value)) ||
          (data.invoice_number &&
            data.invoice_number.toLowerCase().includes(value)) ||
            (data.payment_data.some((p)=>p.payment_type.toLowerCase().includes(value))) ||
            (data.Date && data.Date.toLowerCase().includes(value))
        );
      });

      setFiltereddata(result);
    } else {
      setFiltereddata(allData);
    }
  };

  function Row(props) {
    const {f} = props;
    const [open, setOpen] = React.useState(false);

    return (
      <React.Fragment>
        
        {/* {filter_date.map((f) => ( */}
        <TableRow sx={{'& > *': {borderBottom: 'unset'}}}>
          <TableCell>
            <IconButton
              aria-label='expand row'
              size='small'
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell component='th' scope='row'>
            {f.first_name}
          </TableCell>
          {/* <TableCell>{f.payment_type}</TableCell> */}
          <TableCell style={{textAlign:"right", paddingRight:"20px"}}>{SeperateAmount(f, 'Cash (INR)')}</TableCell>
          <TableCell style={{textAlign:"right", paddingRight:"20px"}}>{SeperateAmount(f, 'Card (INR)')}</TableCell>
          <TableCell style={{textAlign:"right", paddingRight:"20px"}}>{SeperateAmount(f, 'NEFT (INR)')}</TableCell>
          <TableCell style={{textAlign:"right", paddingRight:"20px"}}>{SeperateAmount(f, 'UPI (INR)')}</TableCell>
          <TableCell style={{textAlign:"right", paddingRight:"20px"}}>{TotalAmount(f)}</TableCell>
        </TableRow>
        {/* ))} */}
        <TableRow>
          <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
            <Collapse in={open} timeout='auto' unmountOnExit>
              <Box sx={{margin: 1}}>
                <Table size='small' aria-label='purchases'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Shop Name</TableCell>
                      <TableCell>Invoice-No</TableCell>
                      <TableCell>Cheque_No</TableCell>
                      <TableCell>Cheque_Date</TableCell>
                      <TableCell>Pymnt_Type</TableCell>
                      <TableCell>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {f.payment_data.map((t,i) => (
                      <TableRow key={i}>
                        <TableCell component='th' scope='row'>
                          {f.company_name}
                        </TableCell>
                        <TableCell>{f.invoice_number}</TableCell>
                        <TableCell>456</TableCell>

                        <TableCell>{t.payment_time}</TableCell>
                        <TableCell>{t.payment_type}</TableCell>
                        <TableCell style={{textAlign:'right'}} >{t.payment_amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }

  const handleDateChange = async (date) => {
    const dateVal = date;
    setdate(dateVal);
    let convertedDate = moment(dateVal, 'year', 'month', 'day').format(
      'yyyy-MM-DD',
    );
    // await props.listSalesDateAction(convertedDate);
    setIsFilter(true);
  };

  // const clearButton = () => {
    
  //   const currentDate = new Date();
  //   setdate(currentDate);
  //   // setFiltereddata([])
  //   // setAllData('')
    

  // };
const clearButton = () => {
  setdate(new Date())
}
  const ApplyButton = async (value1, value2,newValue, event) => {
    const dateVal = date;
    setdate(dateVal);
    let convertedDate = moment(dateVal, 'year', 'month', 'day').format(
      'yyyy-MM-DD',
    );
    setSearchVal('');
    dispatch(setSearchConsolidatedAction({ data: [] }))
    apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        props.listSalesDateAction(
          convertedDate,
          commoncookie,
          headerLocationId,
        
          (res) => {
            if (res) {
              const badgeCount = [convertedDate];
              let count = 0;
              badgeCount.forEach((d) => {
                if (d) count += 1;
              });
              setCount(count);

              setIsFilter(true);
            }
            setcompany(newValue ? newValue : '');
            let value = newValue;
            if (value) {
              const result = allData.filter((data) => {
                if (data.first_name !== null) return data.first_name.includes(value);
              });
              //  setCompanyValue
              //setFiltereddata(result);
            } else {
              setFiltereddata(allData);
            }
            if (res.status === 200) {
              setFiltereddata(res.data)
            }
        // const badgeCount = [dateVal,newValue]
        // let count=0
        // badgeCount.forEach(d=> {
        //   if(d) count +=1
        // } )
        // setCount(count)
        handleFilter();

          },newValue ? newValue : "null"
        )
    );

    // if(this.setFiltereddata()){
    //   this.setCount(count +1)
    //   }

    setIsFilter(true);

  };

  const companySearch = (event) => {

    // setcompany(event ? event: "");
    // let value = event;
    // if (value) {
    //   const result = allData.filter((data) => {
    //     if (data.first_name !== null) return data.first_name.includes(value);
    //   });

    //   setFiltereddata(result);
    // } else {
    //   setFiltereddata(allData);
    // }
  };
  const GetTotal = (type) => {
    let total = 0;
    filter_date.forEach((data) => {
      if (data.payment_data) {
        data.payment_data.forEach((val) => {
          if (val.payment_type === type) total += val.payment_amount;
        });
      }
    });
    return total;
  };

  const SeperateAmount = (data, type) => {
    let total = 0;
    // filter_date.forEach(data => {
    if (data.payment_data) {
      data.payment_data.forEach((val) => {
        if (val.payment_type === type) total += val.payment_amount;
      });
    }
    // })
    return total;
  };

  const TotalAmount = (data) => {
    let total = 0;
    // filter_date.forEach(data => {
    if (data.payment_data) {
      data.payment_data.forEach((val) => {
        // if(val.payment_type === type)
        total += val.payment_amount;
      });
    }
    // })
    return total;
  };

  const requestSearch = (e) => {
    let val = e.target.value;
    const dateVal = date;
    let convertedDate = moment(dateVal, 'year', 'month', 'day').format(
      'yyyy-MM-DD'
    );
    setSearchVal(val);
    // if (val.trim() !== '') {
      dispatch(setSearchConsolidatedAction({ data: [] }))
    // }
    const body = {
      searchString: val,
      name:"null",
      date:convertedDate,
      employeeId: commoncookie,
      locationId: headerLocationId
    }
    dispatch(getSearchConsolidatedAction(
      body,
      setModalStatusHandler,
      setLoaderStatusHandler
    ))
  };

  const cancelSearch = (e) => {
    setSearchVal('');
    dispatch(setSearchConsolidatedAction({ data: [] }))
  };

  const table_data = searchConsolitData.length > 0 || searchVal ? searchConsolitData : filtereddata

  return (
    <>
      <Helmet>
                 <meta charSet="utf-8" />
                 <title> {titleURL} | Payment Consolidated </title>
       </Helmet>
      {/* <h3
        align='center'
        style={{
          margin: '-7px',
          marginBottom: '10px',
          height: '45px',
          fontSize: '30px',
          fontWeight: '400',
        }}
      >
        PAYMENT PAGE
      </h3> */}
      <CreateNewButtonContext.Consumer>
        {({loaderStatus}) => (
          <div>
            
            <Grid
              container
              display='flex'
              justifyContent='flex-end'
              alignItems='center'
              spacing={3}
            >
              {/* <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack spacing={3}>
              <DesktopDatePicker
                variant="outlined"
                label="Filter Date"
                inputFormat="MM/dd/yyyy"
                value={datevalue}
                onChange={(e) => handleDateChange(e._d)}
                // onChange={(e) => {
                //   // setdatevalue(e);
                //   handleDateChange(e._d);
                // }}
                renderInput={(params) => <TextField {...params} />}
              />
            </Stack>
          </LocalizationProvider> */}
              {/* <LocalizationProvider dateAdapter={DateAdapter}>
            <DatePicker
              label="Filter by date"
              // format="yyyy/MM/DD"
              inputFormat="DD/MM/yyyy"
              value={date}
              inputVariant="contained"
              onChange={(e, v) => {
                handleDateChange(e._d);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider> */}

              {/* <Grid size={{ xs: 3, sm: 3, md: 4, lg: 4 }}>
          <Autocomplete
            disablePortal
            fullWidth
            id="index-combo-525"
            // options={allData.filter((val,id,array) => array.indexOf(val) == id)}
            // options={Array.from(
            //   new Set(allData.map((a) => a.companyName))
            // ).map((name) => {
            //   return allData.find((a) => a.companyName === name );
            // })}
            options={filter_date.map((f) => f.first_name)}
            // getOptionLabel={(option) => option.first_name}
            onChange={(e, newvalue) => companySearch(newvalue)}
            // value={{ companyName: party || '' }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="All "
                style={{ backgroundColor: "white", borderRadius: "5px" }}
              />
            )}
          />
        </Grid> */}



        <Grid
          size={{
            lg: 8.5,
            md: 8.5,
            sm: 8.5,
            xs: 12
          }}>
          <Typography variant= 'h6'
            align='left'
              style={{ }}
        >
        PAYMENT PAGE
          </Typography>
        </Grid>

              <Grid
                display='flex'
                justifyContent='flex-end'
                size={{
                  lg: 3,
                  md: 3,
                  sm: 3,
                  xs: 10
                }}>
                <CommonSearch
                  searchVal={searchVal}
                  cancelSearch={cancelSearch}
                  requestSearch={requestSearch}
                  type="border"
                />
              {/* <TextField
                            autoFocus={searchConsolitData ? true : false}
                            fullWidth
                            sx={{
                              borderRadius: '8px',
                              '& .MuiOutlinedInput-root': {
                                height: '42px',
                              },
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position='start'>
                                  <SearchIcon />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position='end'>
                                  <ClearIcon
                                    onClick={cancelSearch}
                                    sx={{ cursor: 'pointer' }}
                                  />
                                </InputAdornment>
                              ),
                            }}
                            placeholder='Search'
                            value={searchVal}
                            onChange={requestSearch}
                          /> */}
              </Grid>
              <Grid
                display='flex'
                justifyContent='flex-end'
                size={{
                  lg: 0.5,
                  md: 0.5,
                  sm: 0.5,
                  xs: 2
                }}>
                <Tooltip title='Filter'>
                  <IconButton>
                    <CommonFilter
                      Datefilter={true}
                      Allfil={true}
                      filter_date={filter_date}
                      count={count}
                      handleDateChange={handleDateChange}
                      newValue={newValue}
                      value={date}
                      handleClose={handleFilter}
                      setNewValue={setNewValue}
                      companySearch={companySearch}
                      open={filterOpen}
                      ApplyButton={ApplyButton}
                      setDate={setdate}
                      clearButton={clearButton}
                      shouldFetchData={false}
                    />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
            <br />
            {/* {filter_date.map((f) => (f.first_name === null && <Typography style={{ color: 'red', textAlign: 'center' }}> Not Data Found</Typography>))} */}

            {/* {filter_date.map((f) =>(
        f.first_name !== null &&  */}
            <Grid container spacing={3}>
              <Grid
                size={{
                  lg: 9,
                  md: 9,
                  sm: 9,
                  xs: 12
                }}>
                <h3
                  align='left'
                  style={{
                    margin: '0px',
                    marginBottom: '1px',
                    color: 'green',
                    fontSize:headerStyle.fontSize,
                    fontWeight:headerStyle.fontWeight,
                  }}
                >
                  COLLECTIONS REPORT
                </h3>
              </Grid>
              <Grid
                size={{
                  lg: 3,
                  md: 3,
                  sm: 3,
                  xs: 12
                }}>
                <h3
                  align='left'
                  style={{
                    margin: '-7px',
                    marginBottom: '1px',
                    paddingLeft: '0px'
                  }}
                >
                  <span style={{fontSize:font14_500.fontSize , fontWeight :font14_500.fontWeight}}>Date :{' '}</span>
                  <span style={{fontSize:font14_500.fontSize , fontWeight :font14_500.fontWeight}}>
                    {commonDateFormat(date)}
                  </span>
                </h3>
              </Grid>
              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Grid container>
                  <Grid
                    size={{
                      lg: 3,
                      md: 3,
                      sm: 3,
                      xs: 12
                    }}>
                    <span style={{fontSize:font14_500.fontSize , fontWeight :font14_500.fontWeight}}>TOTAL - CASH :{' '}</span>
                    <span style={{fontSize:font14_500.fontSize , fontWeight :font14_500.fontWeight}}>
                      {GetTotal('Cash (INR)')}
                    </span>
                  </Grid>
                  <Grid
                    size={{
                      lg: 3,
                      md: 3,
                      sm: 3,
                      xs: 12
                    }}>
                  <span style={{fontSize:font14_500.fontSize , fontWeight :font14_500.fontWeight}}>TOTAL - CARD :{' '}</span>
                    <span style={{fontSize:font14_500.fontSize , fontWeight :font14_500.fontWeight}}>
                      {GetTotal('Card (INR)')}
                    </span>
                  </Grid>
                  <Grid
                    size={{
                      lg: 3,
                      md: 3,
                      sm: 3,
                      xs: 12
                    }}>
                  <span style={{fontSize:font14_500.fontSize , fontWeight :font14_500.fontWeight}}>TOTAL - NEFT :{' '}</span>
                    <span style={{fontSize:font14_500.fontSize , fontWeight :font14_500.fontWeight}}>
                      {GetTotal('NEFT (INR)')}
                    </span>
                  </Grid>
                  <Grid
                    size={{
                      lg: 3,
                      md: 3,
                      sm: 3,
                      xs: 12
                    }}>
                  <span style={{fontSize:font14_500.fontSize , fontWeight :font14_500.fontWeight}}>TOTAL - UPI :{' '}</span>
                    <span style={{fontSize:font14_500.fontSize , fontWeight :font14_500.fontWeight}}>
                      {GetTotal('UPI (INR)')}
                    </span>
                  </Grid>
                </Grid>
              </Grid>
              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <TableContainer component={Paper}>
                  <Table aria-label='collapsible table'>
                    <TableHead>
                      <TableRow>
                        <TableCell />
                        <TableCell style={{fontSize:headerStyle.fontSize,fontWeight:headerStyle.fontWeight}}>User</TableCell>
                        <TableCell style={{fontSize:headerStyle.fontSize,fontWeight:headerStyle.fontWeight}}>Cash</TableCell>
                        <TableCell style={{fontSize:headerStyle.fontSize,fontWeight:headerStyle.fontWeight}}>Card</TableCell>
                        <TableCell style={{fontSize:headerStyle.fontSize,fontWeight:headerStyle.fontWeight}}>NEFT</TableCell>
                        <TableCell style={{fontSize:headerStyle.fontSize,fontWeight:headerStyle.fontWeight}}>UPI</TableCell>
                        <TableCell style={{fontSize:headerStyle.fontSize,fontWeight:headerStyle.fontWeight}}>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody style={{fontSize:cellStyle.fontSize,fontWeight:cellStyle.fontWeight}}>
                      {table_data.map((f,i) => {
                        return <Row f={f} key={i}/>;
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                {!filtereddata?.length && loaderStatus === false && (
                  (isApiFinished ? <NoRecordFound/> : '')
                  // <Typography
                  //   style={{color: 'red', textAlign: 'center', width: '100%'}}
                  // >
                  //   {' '}
                  //   No Data Found
                  // </Typography>
                )}
              </Grid>
            </Grid>
            {/* ))}  */}
          </div>
        )}
      </CreateNewButtonContext.Consumer>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    filter_date: state.salesReducer.list_sale_filter_date || [],
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listSalesDateAction: (date, employee_id, headerLocationId, res,name) => {
      return dispatch(listSalesDateAction(date, employee_id, headerLocationId, res,name));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Outstanding);
