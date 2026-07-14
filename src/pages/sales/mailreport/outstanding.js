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
import {getSearchOutstandReportAction, listoutstanding, setSearchOutstandReportAction} from '../../../redux/actions/sales_actions';
import context from '../../../context/CreateNewButtonContext';
import SearchIcon from '@mui/icons-material/Search';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import {
  TextField,
  Grid,
  Autocomplete,
  IconButton,
  Tooltip,
} from '@mui/material';
// import { useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import CloseIcon from '@mui/icons-material/Close';
// import { Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import {AdapterDateFns as AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {LocalizationProvider} from '@mui/x-date-pickers';
import {DesktopDatePicker} from '@mui/x-date-pickers/DesktopDatePicker';
// import InputLabel from '@mui/material/InputLabel';
// import MenuItem from '@mui/material/MenuItem';
// import FormControl from '@mui/material/FormControl';
// import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import CommonFilter from '../../../components/pos/payment_section/CommonFilter';
// import { CompressOutlined } from '@mui/icons-material';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import NoRecordFound from 'components/Layout/NoRecordFound';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500 ,Width} from 'utils/pageSize';
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

// const useStyles = makeStyles(() => ({
//   root: {
//     flexGrow: 1,
//   },
//   menuButton: {
//     marginRight: useTheme().spacing(2),
//   },
//   title: {
//     flexGrow: 1,
//     display: 'none',
//     [useTheme().breakpoints.up('sm')]: {
//       display: 'block',
//     },
//   },
//   search: {
//     position: 'relative',
//     // marginTop:'-7px',
//     borderRadius: useTheme().shape.borderRadius,
//     backgroundColor: 'white',
//     height: '53px'
//     // marginLeft: 0,
//     // width: '100%',
//     // [useTheme().breakpoints.up('sm')]: {
//     // marginLeft: useTheme().spacing(1),
//     // width: 'auto',
//     // },
//   },
//   searchIcon: {
//     padding: useTheme().spacing(0, 1),
//     height: '100%',
//     position: 'absolute',
//     pointerEvents: 'none',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     // paddingTop: '3px'
//   },
//   inputRoot: {
//     color: 'inherit',
//   },

//   inputInput: {
//     padding: useTheme().spacing(1, 1, 1, 0),
//     marginTop: '7px',
//     // vertical padding + font size from searchIcon
//     paddingLeft: `calc(1em + ${useTheme().spacing(4)}px)`,
//     transition: useTheme().transitions.create('width'),
//     width: '100%',
//     [useTheme().breakpoints.up('sm')]: {
//       width: '12ch',
//       '&:focus': {
//         width: '20ch',
//       },
//     },
//   },
// }));

// function Row(props) {
//   const { row } = props;
// }

// const rows = [
//   createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
//   createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
//   createData('Eclair', 262, 16.0, 24, 6.0),
//   createData('Cupcake', 305, 3.7, 67, 4.3),
//   createData('Gingerbread', 356, 16.0, 49, 3.9),
// ];

export default function Outstanding() {
  const dispatch = useDispatch();

  const {
    salesReducer: {list_outstanding,searchOutstandData},
  } = useSelector((state) => state); // salesReducer: { sales },
  // const [PayData, setPayData] = React.useState({
  //   list_outstanding: [],
  // })
  const tempinitsform = useRef(null);
  const [search, setSearch] = useState('');
  const [allData, setAllData] = useState([]);
  const [filtereddata, setFiltereddata] = useState([]);
  
  const {
    setLoaderStatusHandler,
    setModalStatusHandler,
    setselectData,
    setModalTypeHandler,
    commoncookie,
    headerLocationId,
  } = useContext(context); //, setModalStatusHandler, setselectData
  const [party, setparty] = useState('');
  const [company, setcompany] = useState('');
  const [date] = React.useState(new Date()); //, setdate
  var day = ('0' + date.getDate()).slice(-2);
  var month = ('0' + (date.getMonth() + 1)).slice(-2);
  var today = date.getFullYear() + '-' + month + '-' + day;
  // var today = new Date();
  const [datevalue, setdatevalue] = useState(null);
  // const [dateexist, setdateexist] = useState(false)
  const [credit] = useState([]); //,setcredit
  const [Fos] = useState(''); //, setFos
  const [filterOpen, handleFilter] = useState(false);
  const [count, setCount] = useState(1);
  const [datewisefilter, setDatewisefilter] = useState();
  const [creditdatewisefilter, setCreditdatewisefilter] =
    useState('Credit Days');
  const [searchVal, setSearchVal] = useState('')
  const [isApiFinished, setIsApiFinished] = useState(false)

  const handleChange = async (month) => {
    if (month !== '' && typeof month !== 'undefined') {
      const result = allData.filter(
        (f) => f.invoice_date.slice(0, 10) === month.toISOString().slice(0, 10),
      );
      // this.setState({ inventory_data: Filtering })
      setFiltereddata(result);
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

  // const datewisedifference = () =>{

  // }

  // useEffect(() => {
  //   dispatch(listoutstanding(setModalTypeHandler, setLoaderStatusHandler))
  // }, [])

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
    dispatch(setSearchOutstandReportAction({ data: [] }));
    //tempinitsform.current();
  }, []);

  useEffect(() => {
    setAllData(list_outstanding);
    setFiltereddata(list_outstanding);
  }, [list_outstanding]);
  useEffect(() => {
    tempinitsform.current();
  }, [headerLocationId]);

  const handleSearch = (event) => {
    let value = event.target.value.toLowerCase();
    if (value !== '') {
      const result = allData.filter((data) => {
        return (
          (data.companyName &&
            data.companyName.toLowerCase().includes(value)) ||
          (data.invoice_number &&
            data.invoice_number.toLowerCase().includes(value)) ||
            (data.invoice_date_converted &&
              data.invoice_date_converted.toLowerCase().includes(value)) ||
              (data.location_name &&
                data.location_name.toLowerCase().includes(value))
        );
      });

      setFiltereddata(result);
    } else {
      setFiltereddata(allData);
    }
  };

  const clearButton = () => {
    setparty('');
    setcompany('');
    setDatewisefilter(null);
    setCreditdatewisefilter('');
    setdatevalue(null);
  };


  const ApplyButton = () => {
    let creditdays = false;
    if (datewisefilter) {
      let value = datewisefilter;
      if (value) {
        if (value === '7 Days') {
          creditdays = 7;
        }
        if (value === '15 Days') {
          creditdays = 15;
        }
        if (value === '30 Days') {
          creditdays = 30;
        }
        if (value === '45 Days') {
          creditdays = 45;
        }
        // jam += jam.length ?  " && creditdays ? getDifferenceInDays(f.invoice_date) > creditdays : true" : " creditdays ? getDifferenceInDays(f.invoice_date) > creditdays : true"
      }
    }

    const result = allData.filter((f) => {
      const partyfil = !party ? true : f.customerName?.includes(party);
      const companyfil = !company ? true : f.companyName?.includes(company);
      const duedayfil = !datewisefilter
        ? true
        : creditdays
        ? getDifferenceInDays(f.invoice_date) > creditdays
        : true;
      let creditdayfil = true;
      if (creditdatewisefilter === 'Credit Days') {
        creditdayfil = !creditdatewisefilter
          ? true
          : getDifferenceInDays(f.invoice_date) > f.creditdays;
      }
      if (creditdatewisefilter === 'Credit values') {
        creditdayfil = !creditdatewisefilter
          ? true
          : f.total - f.received_amount > f.creditvalue;
      }
      const datavaluefil = !datevalue
        ? true
        : f.invoice_date.slice(0, 10) === datevalue.toISOString().slice(0, 10);
      if (partyfil && companyfil && duedayfil && creditdayfil && datavaluefil) {
        return true;
      }
      return false;
    });

    const badgeCount = [
      party,
      company,
      datewisefilter,
      creditdatewisefilter,
      datevalue,
    ];
    let count = 0;
    badgeCount.forEach((d) => {
      if (d) count += 1;
    });
    setCount(count);

    setFiltereddata(result);

    handleFilter();
  };

  const partySearch = (event) => {
    setparty(event ? event.customerName : '');
    // let value = event?.customerName;
    // if (value) {
    //   const result = allData.filter(data => {
    //     if(data.customerName !==null)
    //     return data.customerName.includes(value)
    //   });

    //   setFiltereddata(result);

    // }
    // else {
    //   setFiltereddata(allData);
    // }
  };
  const companySearch = (event) => {
    setcompany(event ? event.companyName : '');
    // let value = event?.companyName;
    // if (value) {
    //   const result = allData.filter(data => {
    //     if(data.companyName !==null)
    //     return data.companyName.includes(value)
    //   });

    //   setFiltereddata(result);

    // }
    // else {
    //   setFiltereddata(allData);
    // }
  };
  const datewise = (event) => {
    setDatewisefilter(event);
    // let value = event;
    // if (value) {
    //   let creditdays = false
    //   if(value === '7 Days'){
    //     creditdays = 7
    //   }
    //   if(value === '15 Days'){
    //     creditdays = 15
    //   }
    //   if(value === '30 Days'){
    //     creditdays = 30
    //   }
    //   if(value === '45 Days'){
    //     creditdays = 45
    //   }
    //   const result = allData.filter(d => creditdays ? getDifferenceInDays(d.invoice_date) > creditdays : true);

    //   setFiltereddata(result);

    // }
    // else {
    //   setFiltereddata(allData);
    // }
  };
  const creditdatewise = (event) => {
    setCreditdatewisefilter(event);
    //  let value = event;
    //  let result;
    // //  let credit =false
    //  if (value) {
    //   if(value === 'Credit Days'){
    //      result = allData.filter(d => getDifferenceInDays(d.invoice_date) > d.creditdays);
    //   }
    //    if(value === 'Credit values'){
    //     result = allData.filter(d => (d.total - d.received_amount) > d.creditvalue);
    //    }

    //   // const result = allData.filter(d => credit ? getDifferenceInDays(d.invoice_date) > creditdays : true);
    //     //  result = allData.sort((el1,el2) => el1.creditvalue.localeCompare(el2.creditvalue, undefined, {numeric: true}));
    //    //  result = allData.sort((a,b) => credit ?  parseFloat(a.creditvalue) - parseFloat(b.creditvalue) : false );
    //       setFiltereddata(result);
    //   }
    //  else {
    //    setFiltereddata(allData);
    //  }
  };

  //   return data.creditdays
  // }) )

  const requestSearch = (e) => {
    let val = e.target.value;
    setSearchVal(val);

    // if (val.trim() !== '') {
      dispatch(setSearchOutstandReportAction({ data: [] }))
    // }
    const body = {
      searchString: val,
      employeeId: commoncookie,
      locationId: headerLocationId
    }
    dispatch(getSearchOutstandReportAction(
      body,
      setModalStatusHandler,
      setLoaderStatusHandler
    ))
  };

  const cancelSearch = (e) => {
    setSearchVal('');
    dispatch(setSearchOutstandReportAction({ data: [] }))
  };

   const table_data = searchOutstandData.length > 0 || searchVal ? searchOutstandData : filtereddata

  return (
    <>
      <Helmet>
                 <meta charSet="utf-8" />
                 <title> {titleURL} | Outstanding Report </title>
       </Helmet>
      <div>
        <Grid
          container
          display='flex'
          // justifyContent='flex-end'
          alignItems='center'
          spacing={3}
        >
          {/* <Grid size={{ xs: 12, sm: 6, md: 6, lg: 2 }}> */}
          {/* <Autocomplete
            disablePortal
            fullWidth
            id="outstanding-combo-455"
            // options={allData.filter((val,id,array) => array.indexOf(val) == id)}
            options={Array.from(
              new Set(allData.map((a) => a.customerName))
            ).map((name) => {
              return allData.find((a) => a.customerName === name);
            })}
          
            // options={allData.filter((d)=> d.customerName)}
            getOptionLabel={(option) => option.customerName}
            onChange={(e, newvalue) => partySearch(newvalue)}
             value={{ customerName : party}}
            renderInput={(params) => (
              <TextField
                {...params}
                variant='outlined'
                label="User"
                style={{ backgroundColor: "white", borderRadius: "5px" }}
              />
            )}
          /> */}
          {/* </Grid> */}
          {/* <Grid size={{ xs: 12, sm: 6, md: 6, lg: 2 }}> */}
          {/* <Autocomplete
            disablePortal
            fullWidth
            id="user-combo"
           // options={allData.filter((val,id,array) => array.indexOf(val) == id)}
            options={Array.from(
              new Set(allData.map((a) => a.companyName))
            ).map((name) => {
              return allData.find((a) => a.companyName === name );
            })}
          //  options={allData.filter((d) =>d.companyName)}
            getOptionLabel={(option) => option.companyName}
            onChange={(e, newvalue) => companySearch(newvalue)}
             value={{ companyName: company }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant='outlined'
                label="Party"
                style={{ backgroundColor: "white", borderRadius: "5px" }}
              />
            )}
          /> */}
          {/* </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 2 }}>
        <Autocomplete
            disablePortal
            fullWidth
            id="party-combo"
            options={['All','7 Days', '15 Days', '30 Days', '45 Days']}
            //getOptionLabel={(option) => option.companyName}
            onChange={(e, newvalue) => datewise(newvalue)}
            value={datewisefilter}
            renderInput={(params) => (
              <TextField
                {...params}
                variant='outlined'
                label="Due Days"
                style={{ backgroundColor: "white", borderRadius: "5px" }}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 2 }}>
        <Autocomplete
            disablePortal
            fullWidth
            id="due-days-combo"
            options={['Credit Days', 'Credit values']}
            //getOptionLabel={(option) => option.companyName}
            defaultValue = {'Credit Days'}
            onChange={(e, newvalue) => creditdatewise(newvalue)}
            value={creditdatewisefilter}
            renderInput={(params) => (  
              <TextField
                {...params}
                variant='outlined'
                label="Credit Days"
                style={{ backgroundColor: "white", borderRadius: "5px" }}
              />
            )}
          /> */}
          {/* <FormControl fullWidth>
        <InputLabel id="age-select-label">Age</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="credit-days-select"
          value={credit}
          label="Age"
          onChange={handleChange}
        >
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </FormControl> */}
          {/* </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack spacing={3}>
              <DesktopDatePicker
               variant='outlined'
                label="Filter Date"
                // inputFormat="MM/dd/yyyy"
                // inputFormat="dd/MM/yyyy"
                value={datevalue}
                // onChange={handleChange}
                onChange={(e, v) => {
                  setdatevalue(e)
                  handleChange(e)
                }}
                renderInput={(params) => <TextField {...params} />}
              />
            </Stack>
          </LocalizationProvider>
        </Grid> */}
        <Grid
          size={{
            lg: 8.5,
            md: 8,
            sm: 8.5,
            xs: 12
          }}>
          <Typography variant= 'h6' align='left' style={{margin: '0px'}}>
            Outstanding Page
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
                            autoFocus={searchOutstandData ? true : false}
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
              md: 1,
              sm: 0.5,
              xs: 2
            }}>
            <Tooltip title='Filter'>
              <IconButton>
                <CommonFilter
                  Outstand={true}
                  handleChange={handleChange}
                  company={company}
                  party={party}
                  count={count}
                  datewisefilter={datewisefilter}
                  creditdatewisefilter={creditdatewisefilter}
                  allData={allData}
                  setdatevalue={setdatevalue}
                  datewise={datewise}
                  creditdatewise={creditdatewise}
                  handleSearch={handleSearch}
                  value={datevalue}
                  partySearch={partySearch}
                  companySearch={companySearch}
                  handleClose={handleFilter}
                  open={filterOpen}
                  ApplyButton={ApplyButton}
                  clearButton={clearButton}
                  shouldFetchData={false}
                />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </div>
      <br />
      {/* {filtereddata && filtereddata.map((row, i) => {
        return ( */}
      <CreateNewButtonContext.Consumer>
        {({loaderStatus}) => (
          <div>
            <Grid container display='flex' flexDirection='row' spacing={3}>
              <Grid
                size={{
                  lg: 6,
                  md: 6,
                  sm: 12,
                  xs: 12
                }}>
                <h3
                  align='center'
                  style={{fontSize:headerStyle.fontSize,fontWeight:headerStyle.fontWeight }}
                >
                  DUE DATE EXCEEDED
                </h3>
                <TableContainer style={{height: '400px'}} component={Paper}>
                  <Table aria-label='customized table'>
                    <TableHead>
                      <TableRow>
                        <StyledTableCell align='left'>Date</StyledTableCell>
                        <StyledTableCell align='left'>Party </StyledTableCell>
                        <StyledTableCell align='left'>Ref.No. </StyledTableCell>
                        <StyledTableCell align='left'>
                          Location{' '}
                        </StyledTableCell>
                        <StyledTableCell style={{ textAlign: 'center' }} align='center'>Paid </StyledTableCell>
                        <StyledTableCell style={{ textAlign: 'right' }} align='left'>Pending </StyledTableCell>
                        <StyledTableCell style={{ textAlign: 'right' }} align='left'>Total</StyledTableCell>
                        <StyledTableCell  style={{ textAlign: 'right'}} align='left'>Overdue </StyledTableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {!filtereddata.filter(
                        (d) =>
                          getDifferenceInDays(d.invoice_date) > d.creditdays,
                      ).length &&
                        loaderStatus === true && isApiFinished &&(
                          (<NoRecordFound/>)
                          // <Typography
                          //   style={{color: 'red', textAlign: 'center'}}
                          // >
                          //   {' '}
                          //   Not Found
                          // </Typography>
                        )}

                      {table_data
                        ?.filter(
                          (d) =>
                            getDifferenceInDays(d.invoice_date) >
                              d.creditdays ||
                            d.total - d.received_amount > d.creditvalue,
                        )
                        .map((row) => (
                          <StyledTableRow key={row.invoice_date}>
                            <StyledTableCell
                              component='th'
                              scope='row'
                              align='left'
                              style={{fontSize:cellStyle.fontSize,fontWeight:cellStyle.fontWeight }}
                            >
                              {row.invoice_date_converted}
                            </StyledTableCell>
                            <StyledTableCell align='left' style={{fontSize:cellStyle.fontSize,width : Width('date'),fontWeight:cellStyle.fontWeight }}>
                              {row.companyName}
                            </StyledTableCell>
                            <StyledTableCell align='left' style={{fontSize:cellStyle.fontSize,fontWeight:cellStyle.fontWeight }}>
                              {row.invoice_number}
                            </StyledTableCell>
                            <StyledTableCell align='left' style={{fontSize:cellStyle.fontSize,fontWeight:cellStyle.fontWeight }}>
                              {row.location_name}
                            </StyledTableCell>
                            <StyledTableCell align='right' style={{fontSize:cellStyle.fontSize,fontWeight:cellStyle.fontWeight,textAlign:'center' }}>
                              {row.received_amount}
                            </StyledTableCell>
                            <StyledTableCell
                              align='right'
                              style={{color: 'red',fontSize:cellStyle.fontSize,fontWeight:cellStyle.fontWeight,textAlign:'center' }}
                            >
                              {row.total - row.received_amount}
                            </StyledTableCell>
                            <StyledTableCell align='right' style={{fontSize:cellStyle.fontSize,fontWeight:cellStyle.fontWeight,textAlign:'right' }}>
                              {row.total}
                            </StyledTableCell>
                            <StyledTableCell align='right' style={{fontSize:cellStyle.fontSize,fontWeight:cellStyle.fontWeight }}>
                              {getDifferenceInDays(row.invoice_date, today)}
                            </StyledTableCell>
                          </StyledTableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid
                size={{
                  lg: 6,
                  md: 6,
                  sm: 12,
                  xs: 12
                }}>
                <h3
                  align='center'
                  style={{fontSize:headerStyle.fontSize,fontWeight:headerStyle.fontWeight}}
                >
                  WITHIN DUE DATE
                </h3>

                <TableContainer style={{height: '400px'}} component={Paper}>
                  <Table aria-label='customized table'>
                    <TableHead>
                      <TableRow>
                        <StyledTableCell  align='left'>Date</StyledTableCell>
                        <StyledTableCell  align='left'>Party </StyledTableCell>
                        <StyledTableCell  align='left'>Ref.No. </StyledTableCell>
                        <StyledTableCell  align='left'>
                          Location{' '}
                        </StyledTableCell>
                        <StyledTableCell style={{textAlign:'right'}} align='left'>Paid </StyledTableCell>
                        <StyledTableCell style={{textAlign:'right'}} align='left'>Pending </StyledTableCell>
                        <StyledTableCell style={{textAlign:'right'}} align='left'>Total</StyledTableCell>
                        <StyledTableCell style={{textAlign:'right'}} align='left'>Overdue </StyledTableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {/* {!filtereddata.length && <Typography style={{ color: 'red', textAlign: 'center', }}> Not Found</Typography>}
                {filtereddata?.map((row) => ( */}
                      {!filtereddata?.filter(
                        (d) =>
                          getDifferenceInDays(d.invoice_date) < d.creditdays,
                      ).length &&
                        loaderStatus === true && isApiFinished &&(
                          
                          (<NoRecordFound/>)
                          // <Typography
                          //   style={{color: 'red', textAlign: 'center'}}
                          // >
                          //   {' '}
                          //   Not Found
                          // </Typography>
                        )}

                      {table_data
                        ?.filter(
                          (d) =>
                            getDifferenceInDays(d.invoice_date) < d.creditdays,
                        )
                        .map((row) => (
                          <StyledTableRow key={row.invoice_date}>
                            <StyledTableCell
                              component='th'
                              scope='row'
                              align='left'
                            >
                              {row.invoice_date_converted}
                            </StyledTableCell>
                            <StyledTableCell align='left' style={{fontSize:cellStyle.fontSize,fontWeight:cellStyle.fontWeight }}>
                              {row.companyName}
                            </StyledTableCell>
                            <StyledTableCell align='left' style={{fontSize:cellStyle.fontSize,fontWeight:cellStyle.fontWeight }}>
                              {row.invoice_number}
                            </StyledTableCell>
                            <StyledTableCell align='left' style={{fontSize:cellStyle.fontSize,fontWeight:cellStyle.fontWeight }}>
                              {row.location_name}
                            </StyledTableCell>
                            <StyledTableCell align='right' style={{fontSize:cellStyle.fontSize,fontWeight:cellStyle.fontWeight ,textAlign:'right' }}>
                              {row.received_amount}
                            </StyledTableCell>
                            <StyledTableCell
                              align='right'
                              style={{color: 'red' ,fontSize:cellStyle.fontSize,fontWeight:cellStyle.fontWeight,textAlign:'right' }}
                            >
                              {row.total - row.received_amount}
                            </StyledTableCell>
                            <StyledTableCell align='right'style={{fontSize:cellStyle.fontSize,fontWeight:cellStyle.fontWeight ,textAlign:'right'}}>
                              {row.total}
                            </StyledTableCell>
                            <StyledTableCell align='right' style={{fontSize:cellStyle.fontSize,fontWeight:cellStyle.fontWeight }}>
                              {getDifferenceInDays(row.invoice_date, today)}
                            </StyledTableCell>
                          </StyledTableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </div>
        )}
      </CreateNewButtonContext.Consumer>
      {/* )
      })}  */}
    </>
  );
}
