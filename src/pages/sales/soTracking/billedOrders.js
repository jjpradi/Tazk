import React, {useEffect, useState, useRef, useContext} from 'react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
// import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import {TextField, Grid, Divider, Typography, Box, Card} from '@mui/material';
// import moment from 'moment';
import {useDispatch} from 'react-redux';
import {
  getInvoiceDateFilterAction,
  setStatusInTransitAction,
  updateStatusAction,
} from '../../../redux/actions/soTracking_actions';
import EnhancedTable from './selectableTable';
import Autocomplete from '@mui/material/Autocomplete';
import _, { head } from 'lodash';
import {getDateFormat} from '../../../utils/getTimeFormat';
import moment from 'moment';
import apiCalls from 'utils/apiCalls';
import { Fonts } from 'shared/constants/AppEnums';
import { maxBodyHeight } from 'utils/pageSize';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';

const BilledOrders = (props) => {
  const { headerLocationId } = useContext(CreateNewButtonContext);
  const [formValues, setFormValues] = useState({ expense: null, ledger_id: null, reason: null, amount: null,payment_id : null,customer_id :'',cashboxId: null, activeChip: null,cash_type : null, date: getDateFormat(new Date()), location_id : null });
  let todayDate = new Date();
  let firstDay = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
  let lastDay = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0);
  const dispatch = useDispatch();
  const [date, setDate] = useState({from: firstDay, to: lastDay});
  const [customerFilter, setCustomerFilter] = useState('');
  const [filterData, setFilterData] = useState([]);
  const tempinitsform = useRef(null);
  const tempinitsformVal = useRef(null);
  const [filterOpen, handleFilter] = useState(false);
  const [page, setPage] = React.useState(0);
console.log("filterData",filterData)
// console.log("formValues",formValues)
  useEffect(() => setFilterData(props.billedOrders), [props.billedOrders]);

  const handleChange = (e) => {
    const {value, name} = e.target;
    setDate({...date, [name]: value});
  };

  useEffect(() => {
    const fromDate = props.from ? new Date(props.from) : firstDay;
    const toDate = props.to ? new Date(props.to) : lastDay;

    setDate({ from: fromDate, to: toDate });
  }, [props.from, props.to]);

  // useEffect(()=>{
  //     if(date.from !== null&&date.to !== null){
  //         dispatch(getInvoiceDateFilterAction(date.from,date.to,props.setModalTypeHandler,props.setLoaderStatusHandler))
  //     }
  // },[date])
  useEffect(()=>{
    props.refreshFunc();
  },[headerLocationId])
  const initsform = () => {
    let cust_id = props.cust_id || "null"
      const data1 = {page : props.page,rowsPerPage : props.rowsPerPage, location_id : headerLocationId || null}
    if (date.from !== null && date.to !== null) {
      apiCalls(
        props.setModalTypeHandler,
        props.setLoaderStatusHandler,
        dispatch(
          getInvoiceDateFilterAction(
            moment(date.from, 'year', 'month', 'day').format('yyyy-MM-DD'),
            moment(date.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
            cust_id,
            data1,
            props.setModalTypeHandler,
            props.setLoaderStatusHandler,
          ),
        )
      );
    }
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
  }, []);

  // useEffect(()=>{
  //   if(customerFilter !==''){
  //       const filterData = props.billedOrders.filter(f=>f.customer_id === customerFilter)
  //       setFilterData(filterData)
  //   }else if(customerFilter ===''){
  //     setFilterData(props.billedOrders)
  //   }
  // },[customerFilter])

  const initsformVal = () => {
    if (customerFilter !== '') {
      const filterData = props.billedOrders.filter(
        (f) => f.customer_id === customerFilter,
      );
      setFilterData(filterData);
    } else if (customerFilter === '') {
      setFilterData(props.billedOrders);
    }
  };
  tempinitsformVal.current = initsformVal;
  useEffect(() => {
    tempinitsformVal.current();
  }, [customerFilter]);

  const handleStatusChange = (data) => { 
    const fromDate = moment(date.from).format('YYYY-MM-DD');
    const toDate = moment(date.to).format('YYYY-MM-DD');
  
    const finalData = {
      ...data,
      fromDate,
      toDate,
    };
  
    if (data?.type === "pickup") {
      apiCalls(
        props.setModalTypeHandler,
        props.setLoaderStatusHandler,
        dispatch(
          setStatusInTransitAction(
            finalData,
            props.setModalTypeHandler,
            props.setLoaderStatusHandler,
            (response) => {
              if (response) {
                initsform();
              }
            },
          ),
        ),
      );
      // initsform()
    } else {
      apiCalls(
        props.setModalTypeHandler,
        props.setLoaderStatusHandler,
        dispatch(
          updateStatusAction(
            finalData,
            props.setModalTypeHandler,
            props.setLoaderStatusHandler,
            (response) => {
              if(response){
                initsform()
              }
            }
          )
        )
      );
      // initsform()
    }
  };

  // console.log(filterData,props.billedOrders,'sfwerfw7f9w87esfdys')
  
  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
              <Card
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                  '-ms-overflow-style': 'none',
                  'scrollbar-width': 'none',
                }}
              >
          <Grid container spacing={2} sx={{ padding: 2 }}>
            <Grid size={12}>
              <EnhancedTable
                billedOrders={filterData}
                handleStatusChange={handleStatusChange}
                handleChangePage = {props.handleChangePage}
                handleChangeRowsPerPage = {props.handleChangeRowsPerPage}
                page={props.page}
                rowsPerPage ={props.rowsPerPage}
                billedOrdersFilterCount = {props.billedOrdersFilterCount}
              />
            </Grid>
          </Grid>
        </Card>
      </Box>
    </>
  );
};
export default BilledOrders;

