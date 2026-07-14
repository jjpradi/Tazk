import React, {useState, useEffect, useContext} from 'react';
import './styles.css';
import {useSelector,useDispatch} from 'react-redux';
import _ from 'lodash';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Grid,
  TableHead,
  TableRow,
  FormControl,
  Divider,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Card,
  Tooltip,
  Dialog,
  DialogContent,
  Box,
  Autocomplete,
  TextField,
  Chip,
  Stack,
  useTheme,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
// import { getAppConfigDataAction } from '../../redux/actions/app_config_actions';
// import { set } from 'lodash';
import context from '../../../context/CreateNewButtonContext';
import moment from 'moment';
import {getAppConfigDataAction} from '../../../redux/actions/app_config_actions';
import apiCalls from 'utils/apiCalls';
import { cellStyle, font14_500, maxHeight } from 'utils/pageSize';
import ShareIcon from '@mui/icons-material/Share';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { CSVLink } from 'react-csv';
import { monthlySummarySendMail } from 'redux/actions/generalLedger';
import SendMailDialog from './sendMailDialog';
import jsPDF from "jspdf";
import "jspdf-autotable";
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import CloseIcon from '@mui/icons-material/Close'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { listAllLedgerVouchersAction } from 'redux/actions/ledger_actions';
import { useCustomFetch } from 'utils/useCustomFetch';
import ReceiptTempDialog from 'pages/sales/Receipt/ReceiptTemp';
import { getSupplierDetailsByIdreceivings_itemsAction, setInvoiceTempAction } from 'redux/actions/vendor_actions';
import { ManualSalesPurchase } from 'redux/actions/manualNotes_actions';
import API_URLS from '../../../utils/customFetchApiUrls';
import autoTable from 'jspdf-autotable';


export default function App(props) {
  const customFetch = useCustomFetch()
  const [data, setData] = useState([]);
  const [closingBalance, setClosingBalance] = useState([]);
  const [openingBalance, setOpeningBalance] = useState([]);
  const [monthDate, setMonthDate] = useState('');
  const [companyName,setCompanyName] = useState('')
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(context);
  const [emailOpen, setEmailOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [rangeOption, setRangeOption] = useState(null)
  const [tempOpen, setTempOpen] = useState(false)
  const [linkedInfo, setLinkedInfo] = useState(null)
  let date = new Date();
  const [filterDetails, setFilterDetails] = useState({
  fromDate : new Date(date.getFullYear(), date.getMonth(), 1),
  toDate : new Date(),
  dateRange : null
})

const [errorFilterDetails, setErrFilterDetails] = useState({
  fromDate : null,
  toDate : null,
})

  const rangeOptions = [
    'Today',
    'Yesterday',
    'This Week',
    'Last Week',
    'Last 7 Days',
    'This Month',
    'Last Month',
    'This Quater',
    'Last Quater',
    'Current Fiscal Year',
    'Previous Fiscal Year',
    'Last 365 days'
  ]

  const dispatch = useDispatch(); 
  const {appConfigReducer:{app_config_data}} = useSelector(state => state);

const [anchorEl, setAnchorEl] = useState(null);
const open = Boolean(anchorEl);

  const getDefaultMonthRange = () => {
    const selectedMonth = props.month
      ? moment(props.month, 'MMMM', true)
      : moment();
    const baseMonth = selectedMonth.isValid() ? selectedMonth : moment();

    return {
      fromDate: baseMonth.clone().startOf('month'),
      toDate: baseMonth.clone().endOf('month'),
    };
  };

  useEffect(() => {
    if(props.month !== '') {
      const { fromDate, toDate } = getDefaultMonthRange();

      setFilterDetails((prev) => ({...prev, fromDate : fromDate, toDate : toDate}))
    }
  }, [props.month])

  useEffect(() => {
    const { fromDate, toDate } = filterDetails;

    const formattedFromDate = moment(fromDate).isValid() ? moment(fromDate).format('DD/MM/YYYY') : '';
    const formattedToDate = moment(toDate).isValid() ? moment(toDate).format('DD/MM/YYYY') : '';

    if (formattedFromDate && formattedToDate) {
      setMonthDate(`${formattedFromDate} to ${formattedToDate}`);
    } else {
      setMonthDate('');
    }

    setData(props.props.all_ledger_vouchers.data);
    setClosingBalance(props.props.all_ledger_vouchers.closingBalance);
    setOpeningBalance(props.props.all_ledger_vouchers.openingBalance);
    setLinkedInfo(props.props.all_ledger_vouchers.linked || null);
  }, [props.props.all_ledger_vouchers.data, props.props.all_ledger_vouchers.closingBalance, props.props.all_ledger_vouchers.openingBalance, props.props.all_ledger_vouchers.linked]);

  useEffect(() => {
      let date = new Date();
      let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      if(!app_config_data.length){
        
        apiCalls(
          setModalTypeHandler, 
          setLoaderStatusHandler,
          dispatch(getAppConfigDataAction())
        );
      }
  }, [])
  
  useEffect (()=>{
    if(app_config_data.length){
      let companyData = app_config_data.filter(f => f.key_name === 'company.name')
      setCompanyName(companyData[0]?.value)
    }
  },[app_config_data])

  const onItemClick = (event) => {
    //where 'id' =  whatever suffix you give the data-* li attribute
  };

  const particulars = (data) => {
  console.log(data,'dtattatta');
  
    const obj = {
      ['Sales'](data){
        if(data.vch_type === 'Sales Return'){
          return data.paymentAgainst
        } 
        return data.particulars
      },
      ['Credit Notes'](data){
       
        if(data.vch_type === 'Sales Return'){
          return data.paymentAgainst
        } 
        return data.particulars
       
      },
      ['SGST Payable'](data) {
        if(['Purchase Return', 'Sales Return', 'POS Invoice'].includes(data.vch_type)){
          return data.particulars
        } 
        return data.particulars
      },
      ['CGST Payable'](data) {
        if(['Purchase Return', 'Sales Return', 'POS Invoice'].includes(data.vch_type)){
          return data.particulars
        } 
        return data.particulars
      },
      ['TCS Payable'](data){
        if(['POS Invoice'].includes(data.vch_type)){
          return data.paymentAgainst
        }
        return data.particulars
      },
      ['IGST Payable'](data){
        if(['Purchase Return', 'Sales Return', 'POS Invoice'].includes(data.vch_type)){
          return data.particulars
        } 
        return data.particulars
      },
      ['Sundry Debtors'](data){
        return data.particulars
      },
      ['Sundry Creditors'](data){
        return data.particulars
      },
      ['SGST Receivable'](data){
        return data.particulars
      },
      ['CGST Receivable'](data){
        return data.particulars
      },
      ['TCS Receivable'](data){
        return data.particulars
      },
      ['IGST Receivable'](data){
        return data.particulars
      },
      ['Cost of Goods Sold'](data){
        return data.particulars
      },
      ['Bank'](data) {
        if(['POS Invoice'].includes(data.vch_type)){
          return data.paymentAgainst
        }
        return data.particulars
      },
      ['Cash-in-hand'](data){
        if( ['Sales Payment', 'POS Invoice'].includes(data.vch_type) ){
          return data.paymentAgainst || data.name
        }
        if (data.credit > 0) {
          return data.particulars
        }
        if (data.debit > 0) {
          return data.particulars
        }
        // return data.allTransactionParticular.filter(i =>['Sundry Debtors', 'Sundry Creditors'].includes(i.parentAccName))[0]?.accountName || data.name
      },
      ['Stock'](data){
        if(['Purchase Return', 'Sales Return', 'POS Invoice'].includes(data.vch_type)){
          return data.paymentAgainst
        }
        return data.particulars
      },
      ['NEFT/UPI - Axis'](data){
        if(['POS Invoice'].includes(data.vch_type)){
          return data.paymentAgainst
        }
        return data.particulars
      },
      ['POS Sales'](data){
        if(['POS Invoice'].includes(data.vch_type)){
          return data.paymentAgainst
        }
        return data.particulars
      },
      ['Loans & Advances (Asset)'](data){
        return data.particulars
      },
      ['Pay(IN/OUT) Entry'](data) {
        const nameToMatch = data.name; // Name to match in the filter condition
        const ledgerType = data.ledgerType; // Name to match in the filter condition

        const filteredItems = [];

        const allTransactionParticular = data.allTransactionParticular;
        
        for (let i = 0; i < allTransactionParticular.length; i++) {
          const currentItem = allTransactionParticular[i];
        
          if (currentItem.name === nameToMatch && currentItem.parentAccName === ledgerType) {
            filteredItems.push(allTransactionParticular[i - 1]);
          } else if (currentItem.name === nameToMatch) {
            filteredItems.push(allTransactionParticular[i + 1]);
          } else {
            null
          }
        }

        return filteredItems[0]?.accountName || data.name
      },
      
      
    };
// console.log("obj[data.name](data)",obj[data.name])
    if(obj[data.name] !== undefined){
      return obj[data.name](data)
    }else{
      if(data.allTransactionParticular.length === 2)  return data.particulars
      if(data.vch_type === 'Pay(IN/OUT) Entry') return obj['Pay(IN/OUT) Entry'](data)
      if(data.ledgerType === 'Sundry Debtors') return obj['Sundry Debtors'](data)
      if(data.ledgerType === 'Sundry Creditors') return obj['Sundry Creditors'](data)     
      if(data.ledgerType === 'Bank') return obj['Bank'](data)       
      if(data.ledgerType === 'Cash-in-hand') return obj['Cash-in-hand'](data)
      if(data.ledgerType === 'Sales') return obj['POS Sales'](data)
      if(data.ledgerType === 'Loans & Advances (Asset)') return obj['Loans & Advances (Asset)'](data)
      return data.particulars ? data.particulars : data.name;
    }

  };

  const vch_type = (val) => {
    const type = {
      'POS Invoice': 'Receipt',
      'Purchase Invoice' : 'Purchase'
    }

    if (val.vch_type === 'Pay(IN/OUT) Entry') {
      if (val.debit === 0) {
        return 'PayOUT'
      } else {
        return 'PayIN'
      }
    }


    return type[val.vch_type] ? type[val.vch_type] : val.vch_type === 'Sales Payment' ? 'Sales Receipt' : val.vch_type
  }

  const toAmount = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  const formatAmount = (value) => toAmount(value).toFixed(2);

  const totalDebit = data.reduce((sum, item) => sum + toAmount(item.debit), 0);
  const totalCredit = data.reduce((sum, item) => sum + toAmount(item.credit), 0);

  const fileName = `${props.props.ledgerName}_${monthDate.split('to')[0]?.toString().trim() || ''}_to_${monthDate.split('to')[1]?.toString().trim() || ''}`

  const downloadCsvData = () => {
    const title = [['Ledger : ', props.props.ledgerName, '', '',]]
    const date = [['From : ', monthDate.split('to')[0]?.toString().trim() || ''], ['To : ', monthDate.split('to')[1]?.toString().trim() || '']]
    const emptyRow = (n) => {
      return Array(n || 1).fill([]) 
    }

    const headers = [[
      'Date',
      'Vch Type',
      'Ref No',
      'Particulars',
      'Location',
      'Debit',
      'Credit'
    ]]
    
    
    const data_1 = data?.map((f) => (
      [
        moment(f.date).format('DD/MM/YYYY'),
        vch_type(f),
        f.reference_number,
        particulars(f),
        f.location_name,
        f.debit,
        f.credit
      ]
    ))
    
    const balance = [
      ['', '', '', '', 'Opening Balance : ', formatAmount(openingBalance[0]?.balance), ''],
      ['', '', '', '', 'Current Total : ', formatAmount(totalDebit), formatAmount(totalCredit)],
      ['', '', '', '', 'Closing Balance : ', formatAmount(closingBalance[0]?.closingBalance), ''],
    ]



    const finalData = [
      ...title,
      ...date,
      ...emptyRow(2),
      ...headers,
      ...data_1,
      ...balance,
    ]

    return finalData
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const title = `Ledger: ${props.props.ledgerName || ''}`;
    const fromDate = monthDate.split('to')[0]?.toString().trim() || '';
    const toDate = monthDate.split('to')[1]?.toString().trim() || '';

    doc.setFontSize(12);
    doc.text(title, 14, 15);
    doc.text(`From: ${fromDate}`, 14, 23);
    doc.text(`To: ${toDate}`, 14, 30);

    const headers = [['Date', 'Vch Type', 'Ref No', 'Particulars', 'Location', 'Debit', 'Credit']];
    const rows = data.map((f) => ([
      moment(f.date).format('DD/MM/YYYY'),
      vch_type(f),
      f.reference_number,
      particulars(f),
      f.location_name,
      f.debit,
      f.credit,
    ]));

    autoTable(doc,{
      startY: 36,
      head: headers,
      body: rows,
    });

    const startY = doc.lastAutoTable.finalY + 10;
    doc.text(`Opening Balance: ${formatAmount(openingBalance[0]?.balance)}`, 14, startY);
    doc.text(`Current Total: Debit ${formatAmount(totalDebit)} | Credit ${formatAmount(totalCredit)}`, 14, startY + 7);
    doc.text(`Closing Balance: ${formatAmount(closingBalance[0]?.closingBalance)}`, 14, startY + 14);

    doc.save(`${fileName}.pdf`);
    handleClose();
  };


  const handleSendEmail = (email) => {
    const data = {
      email,
      attachmentData: downloadCsvData(),
      fileName,
      subject : `${props.props.ledgerName} transaction from ${monthDate}`
    }

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(monthlySummarySendMail(data))
    ).then(res => {
      setEmailOpen(false);
    });

  }
  const toMomentOrNull = (v) => (v && moment(v).isValid() ? moment(v) : null);

  const handleChange = (event) => {
    const name = event.target.name;
    if (name === "dateRange") {
      const start = toMomentOrNull(event.target.value);
      const end = toMomentOrNull(event.target.value1);
      const rangeName = event.target.value2 || null;

      setFilterDetails({
        ...filterDetails,
        fromDate: start,
        toDate: end,
        dateRange: rangeName,
      });

      if (start && end && start.isSameOrBefore(end)) {
        setErrFilterDetails({ fromDate: "", toDate: "" });
      } else {
        setErrFilterDetails({
          fromDate: start ? "" : "From date is required",
          toDate: end ? "" : "To date is required",
        });
      }
      return;
    }
    const rawValue = event.target.value;
    const newMoment = toMomentOrNull(rawValue);

    const next = {
      ...filterDetails,
      [name]: newMoment,
    };

    setFilterDetails(next);
    const fromM = toMomentOrNull(next.fromDate);
    const toM = toMomentOrNull(next.toDate);

    if (!fromM) {
      setErrFilterDetails((prev) => ({ ...prev, fromDate: "From date is required" }));
    } else {
      setErrFilterDetails((prev) => ({ ...prev, fromDate: "" }));
    }

    if (!toM) {
      setErrFilterDetails((prev) => ({ ...prev, toDate: "To date is required" }));
    } else {
      setErrFilterDetails((prev) => ({ ...prev, toDate: "" }));
    }

    if (fromM && toM && fromM.isAfter(toM)) {
      setErrFilterDetails({ fromDate: "From must be <= To", toDate: "To must be >= From" });
    }
  };
const resolvedLedgerId = props?.ledger_id ?? props?.props?.ledger_id;

  const applyButton = async () => {
    const fromM = moment(filterDetails.fromDate);
    const toM = moment(filterDetails.toDate);

    const fromValid = fromM.isValid();
    const toValid = toM.isValid();

    if (!fromValid || !toValid) {
      setErrFilterDetails({
        fromDate: !fromValid ? "From date is required" : "",
        toDate: !toValid ? "To date is required" : "",
      });
      return;
    }

    if (fromM.isAfter(toM)) {
      setErrFilterDetails({
        fromDate: "From date must be before or equal To date",
        toDate: "To date must be after or equal From date",
      });
      return;
    }

    setErrFilterDetails({ fromDate: "", toDate: "" });

    const data = {
      ledger_id: resolvedLedgerId,
      monthStart: fromM.format('YYYY-MM-DD'),
      monthEnd: toM.format('YYYY-MM-DD'),
    };

    dispatch(listAllLedgerVouchersAction(data));
    setFilterOpen(false);
  }

  const handleClear = () => {
    const { fromDate, toDate } = getDefaultMonthRange();

    setFilterDetails((prev) => ({
      ...prev,
      fromDate,
      toDate,
      dateRange: null,
    }))
    setErrFilterDetails({ fromDate: "", toDate: "" });
    const data = {
      ledger_id: resolvedLedgerId,
      monthStart: fromDate.format('YYYY-MM-DD'),
      monthEnd: toDate.format('YYYY-MM-DD'),
    };

    dispatch(listAllLedgerVouchersAction(data));
    setFilterOpen(false)
  };

  const hanldeRefClick = async (rowData) => {
    let payload={
      ref: rowData.vch_type === 'Sales Invoice' || rowData.vch_type === 'Sales Payment' || rowData.vch_type === 'Sales Return' ? rowData.reference_number : rowData?.reference_number, 
      vch_type: rowData.vch_type, 
      specialNumber: rowData.specialNumber,
      type : rowData.vch_type === 'Sales Invoice' || rowData.vch_type === 'Sales Payment' || rowData.vch_type === 'Sales Return' ? 'Sales' : 'Purchase'
    }
    const res = await customFetch(
      API_URLS.GET_SALES_INVOICE_BY_SPECIAL_NUMBER,
      'POST',
      { payload }
    );
    const id = res?.data[0]?.sale_id
    const billId = res?.data[0]?.receiving_id
    
    if(rowData.vch_type === 'Sales Invoice' || rowData.vch_type === 'Sales Payment' || rowData.vch_type === 'Sales Return') {
      const type = 'sales'
      const poptype = 'invoice'
      const response = await customFetch(
        API_URLS.GET_SALES_INVOICE_DETAILS(id, type, poptype),
        'POST', {}
      );
      const getData = response.data || []
      dispatch(setInvoiceTempAction(getData))
      setTempOpen(true)
    }

    else if(rowData.vch_type === 'Purchase Invoice' || rowData.vch_type === 'Purchase Payment' || rowData.vch_type === 'Purchase Return') {
      const data = {
        receiving_id : billId
      }
      await apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getSupplierDetailsByIdreceivings_itemsAction(rowData.supplier_id, data))
      )
      setTempOpen(true)
    }
    
    else if(rowData.vch_type === 'Credit Notes' || rowData.vch_type === 'Debit Notes') {
      const data1 = {
        mn_id : rowData?.specialNumber,
        type : 'C',
        id : null,
        status : null
      }

      const data2 = {
        mc_id : rowData?.specialNumber,
        type : 'D',
        sequence : rowData.reference_number,
        id : null,
        status : null
      }

      const data = rowData.vch_type === 'Credit Notes' ? data1 : data2

      dispatch(ManualSalesPurchase(data, (response) => {
        if (response) {
          dispatch(setInvoiceTempAction(response))
          setTempOpen(true)
        }
      }))
    }
  }


  const theme = useTheme();

  return (
    <>
      <Card sx={{ height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
      {/* ---- Top Action Bar ---- */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2.5, py: 1,
        borderBottom: `2px solid ${theme.palette.primary.main}`,
        bgcolor: `${theme.palette.primary.main}08`,
        flexShrink: 0,
      }}>
        <Box>
          <Typography component="span" sx={{ fontWeight: 600, fontSize: 14, color: theme.palette.primary.main }}>
            {props.props.ledgerName}
          </Typography>
          {linkedInfo && <Chip icon={<LinkIcon sx={{ fontSize: 14 }} />} label={`Linked ${linkedInfo.type}`} size="small" sx={{ ml: 1, fontSize: 10, height: 20, bgcolor: '#F3E5F5', color: '#7B1FA2' }} />}
          <Typography sx={{ fontSize: 11, color: 'text.secondary', ml: 1 }} component="span">
            {monthDate}
          </Typography>
        </Box>

        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Tooltip title='Filter'>
            <IconButton size="small" onClick={() => setFilterOpen(true)}>
              <FilterAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {props.exportRights && (
            <Tooltip title='Export'>
              <IconButton size="small" aria-label='export-options' onClick={handleClick}>
                <SaveAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem onClick={handleExportPDF}>Export as PDF</MenuItem>
            <MenuItem>
              <CSVLink data={downloadCsvData()} filename={`${fileName}.csv`}
                style={{ textDecoration: 'none', color: 'inherit' }} onClick={handleClose}>
                Export as CSV
              </CSVLink>
            </MenuItem>
          </Menu>
          <Tooltip title='Share'>
            <IconButton size="small" onClick={() => setEmailOpen(true)}>
              <ShareIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tooltip title="Close">
            <IconButton size="small" onClick={() => props.backBtn()}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* ---- Scrollable Content ---- */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
      <Grid container direction={'row'}>
        <Grid
          style={{marginTop: 15}}
          size={{
            lg: 12,
            sm: 12,
            xs: 12,
            md: 12
          }}>
          <Table sx={{minWidth: 100}} size='small' aria-label='a dense table'>
            <TableHead style={{ backgroundColor: '#F4F7FE' }}>
              <TableRow>
                <TableCell>Date</TableCell>
                {linkedInfo && <TableCell>Source</TableCell>}
                <TableCell>Vch Type</TableCell>
                <TableCell>Ref No</TableCell>
                <TableCell>Particulars</TableCell>
                <TableCell>Location</TableCell>
                {/* <TableCell align='right'>Vch No.</TableCell> */}
                <TableCell style={{textAlign: 'left'}}>Debit</TableCell>
                <TableCell align='right'>Credit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((f) => (
                <TableRow
                  hover
                  key={f.month}
                  sx={{'&:last-child td, &:last-child th': {border: 0}}}
                >
                  <TableCell align='left' scope='row' style={{width: 160, fontSize:cellStyle.fontSize , fontWeight:cellStyle.fontWeight}}>
                  {moment(f.date).format('DD/MM/YYYY')}
                  </TableCell>
                  {linkedInfo && <TableCell style={{width: 80, fontSize:cellStyle.fontSize}}>
                    <Chip label={f.source === 'customer' ? 'Sale' : f.source === 'vendor' ? 'Purchase' : '-'} size="small"
                      sx={{ fontSize: 9, height: 16, bgcolor: f.source === 'customer' ? '#E8F5E9' : f.source === 'vendor' ? '#FFF3E0' : '#F5F5F5',
                        color: f.source === 'customer' ? '#2E7D32' : f.source === 'vendor' ? '#E65100' : '#999' }} />
                  </TableCell>}
                  <TableCell style={{width: 160, fontSize:cellStyle.fontSize , fontWeight:cellStyle.fontWeight}}>
                    {vch_type(f)}
                  </TableCell>
                  <TableCell style={{width: 250, fontSize:cellStyle.fontSize , fontWeight:cellStyle.fontWeight}} >
                          {(() => {
                               const refs = (f.reference_number || '')?.split(",") || [];
                               const specials = f.specialNumber?.split(",") || [];

                          return refs.map((num, idx) => (
                         <div
                         key={idx}
                       style={{
                       textDecoration: "none",
                       cursor: "pointer",
                       color: "#03adfc",
                       display: "inline-block",
                       padding: "5px",
                       }}
                         onClick={() => {
                            hanldeRefClick({
                            ...f,
                            reference_number: num.trim(),
                            specialNumber: specials[idx]?.trim() || "", 
                         });
                        }}
                     >
                     {num.trim()}
                   </div>
                          ));
                    })()}

                  </TableCell>
                  <TableCell style={{width: 160 , fontSize:cellStyle.fontSize , fontWeight:cellStyle.fontWeight}}>
                    {(() => {
                      const pName = particulars(f);
                      // Find the contra account ID from allTransactionParticular
                      const contraEntry = (f.allTransactionParticular || []).find(e => e.name === pName || e.accountName === pName);
                      const contraId = contraEntry?.accountId;
                      if (contraId && props.onLedgerClick) {
                        return <span style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'none' }}
                          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                          onClick={() => props.onLedgerClick(contraId, pName)}>{pName}</span>;
                      }
                      return pName;
                    })()}
                  </TableCell>
                  <TableCell style={{width: 160 , fontSize:cellStyle.fontSize , fontWeight:cellStyle.fontWeight}}>
                    {f.location_name}
                  </TableCell>
                  {/* <TableCell align='right' style={{width: 160, fontSize:cellStyle.fontSize , fontWeight:cellStyle.fontWeight}}>
                    {f.transactionId}
                  </TableCell> */}
                  <TableCell align='right' style={{width: 160, fontSize:cellStyle.fontSize , fontWeight:cellStyle.fontWeight}}>
                    {f.debit}
                  </TableCell>
                  <TableCell align='right' style={{width: 160, fontSize:cellStyle.fontSize , fontWeight:cellStyle.fontWeight}}>
                    {f.credit}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Grid>
        <Grid
          style={{marginTop: 20}}
          size={{
            lg: 12,
            sm: 12,
            xs: 12,
            md: 12
          }}>
        <Divider style={{marginBottom: 10}} />
          <Grid container style={{textAlign: 'right'}} direction={'column'}>
          <Grid
            size={{
              lg: 12,
              sm: 12,
              xs: 12,
              md: 12
            }}>
          <Grid
            style={{alignItems: 'center'}}
            size={{
              lg: 12,
              sm: 12,
              xs: 12,
              md: 12
            }}>
              <Grid container direction={'row'} >
                <Grid
                  size={{
                    lg: 8,
                    md: 8,
                    sm: 6.5,
                    xs: 8
                  }}>
                  <Typography variant='h9'>Opening Balance:</Typography>
                </Grid>
                <Grid
                  style={{textAlign: 'right', paddingRight: '40px'}}
                  size={{
                    lg: 2,
                    md: 2,
                    sm: 3,
                    xs: 2.5
                  }}>
                <Typography variant='h9'>{formatAmount(openingBalance[0]?.balance)}</Typography>
                </Grid>
              </Grid>
            </Grid>
              <Grid container direction={'row'} style={{textAlign: 'right'}}>
                <Grid
                  size={{
                    lg: 8,
                    md: 8,
                    sm: 6.5,
                    xs: 7
                  }}>
                <Typography style={{fontSize:font14_500.fontSize}}>Current Total:</Typography>
                </Grid>
                <Grid
                  style={{textAlign: 'right', paddingRight: '40px'}}
                  size={{
                    lg: 2,
                    md: 2,
                    sm: 3,
                    xs: 2.5
                  }}>
                <Typography style={{fontSize:font14_500.fontSize}}>{formatAmount(totalDebit)}</Typography>
                </Grid>
                <Grid
                  style={{textAlign: 'center',paddingRight: 40}}
                  size={{
                    lg: 2,
                    md: 1,
                    sm: 2.5,
                    xs: 2.5
                  }}>
                <Typography variant='h9'>{formatAmount(totalCredit)}</Typography>
                </Grid>
              </Grid>
            </Grid>
            
            
          </Grid>
          <Divider style={{marginBottom: 10}} />
          <Grid
            style={{}}
            size={{
              lg: 12,
              sm: 12,
              xs: 12,
              md: 12
            }}>
            <Grid
              container
              direction={'row'}
              style={{textAlign: 'right', fontWeight: 'bold'}}
            >
              <Grid
                size={{
                  lg: 8,
                  md: 8,
                  sm: 6.5,
                  xs: 8
                }}>
              <Typography variant='h9'>Closing Balance:</Typography>
              </Grid>
              <Grid
                style={{textAlign: 'center',paddingRight: 110}}
                size={{
                  lg: 4,
                  md: 3,
                  sm: 5.5,
                  xs: 4
                }}>
                {/* {data.reduce((a, b) => a + b.closingBalance, 0)} */}
                <Typography variant='h6'>{formatAmount(closingBalance[0]?.closingBalance)}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Divider style={{marginBottom: 10}} />
        </Grid>
      </Grid>
      </Box>
      </Card>
      <SendMailDialog
        emailOpen={emailOpen}
        setEmailOpen={setEmailOpen}
        handleSendEmail={handleSendEmail}
      />
      <Dialog open={filterOpen}>
        <DialogContent sx={{ p: 5, width: "400px" }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton onClick={() => setFilterOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Grid container spacing={2}>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Autocomplete
                options={rangeOptions}
                value={filterDetails.dateRange}
                onChange={(event, newValue) => {
                  let startDate = null;
                  let endDate = null;

                  switch (newValue) {
                    case "Today":
                      startDate = endDate = moment().startOf("day");
                      break;
                    case "Yesterday":
                      startDate = endDate = moment().subtract(1, "day").startOf("day");
                      break;
                    case "This Week":
                      startDate = moment().startOf("week");
                      endDate = moment().endOf("week");
                      break;
                    case "Last Week":
                      startDate = moment().subtract(1, "week").startOf("week");
                      endDate = moment().subtract(1, "week").endOf("week");
                      break;
                    case "Last 7 Days":
                      startDate = moment().subtract(6, "days").startOf("day");
                      endDate = moment().endOf("day");
                      break;
                    case "This Month":
                      startDate = moment().startOf("month");
                      endDate = moment().endOf("month");
                      break;
                    case "Last Month":
                      startDate = moment().subtract(1, "month").startOf("month");
                      endDate = moment().subtract(1, "month").endOf("month");
                      break;
                    case "This Quarter":
                      startDate = moment().startOf("quarter");
                      endDate = moment().endOf("quarter");
                      break;
                    case "Last Quarter":
                      startDate = moment().subtract(1, "quarter").startOf("quarter");
                      endDate = moment().subtract(1, "quarter").endOf("quarter");
                      break;
                    case "Current Fiscal Year":
                      startDate =
                        moment().month() >= 3
                          ? moment().month(3).startOf("month")
                          : moment().subtract(1, "year").month(3).startOf("month");
                      endDate = startDate.clone().add(1, "year").subtract(1, "day");
                      break;
                    case "Previous Fiscal Year":
                      startDate =
                        moment().month() >= 3
                          ? moment().subtract(1, "year").month(3).startOf("month")
                          : moment().subtract(2, "year").month(3).startOf("month");
                      endDate = startDate.clone().add(1, "year").subtract(1, "day");
                      break;
                    case "Last 365 days":
                      startDate = moment().subtract(364, "days").startOf("day");
                      endDate = moment().endOf("day");
                      break;
                    default:
                      break;
                  }

                  handleChange({
                    target: {
                      name: "dateRange",
                      value: startDate,
                      value1: endDate,
                      value2: newValue,
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField {...params} fullWidth label="Select Date Range" variant="filled" />
                )}
              />
            </Grid>

            <Grid size={12}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  label="From Date"
                  value={toMomentOrNull(filterDetails.fromDate)}
                  format='DD/MM/YYYY'
                  onChange={(date) =>
                    handleChange({ target: { name: "fromDate", value: date } })
                  }
                  slotProps={{ textField: { fullWidth: true, variant: "filled", error: Boolean(errorFilterDetails.fromDate), helperText: errorFilterDetails.fromDate } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid size={12}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  label="To Date"
                  value={toMomentOrNull(filterDetails.toDate)}
                  format='DD/MM/YYYY'
                  onChange={(date) =>
                    handleChange({ target: { name: "toDate", value: date } })
                  }
                  slotProps={{ textField: { fullWidth: true, variant: "filled", error: Boolean(errorFilterDetails.toDate), helperText: errorFilterDetails.toDate } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid size={12}>
              <Grid container spacing={5} justifyContent="center">
                <Grid>
                  <Button variant="contained" color="error" onClick={handleClear}>
                    Clear
                  </Button>
                </Grid>

                <Grid>
                  <Button variant="contained" onClick={applyButton}>
                    Apply
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
      <ReceiptTempDialog
        open={tempOpen}
        handleClose={() => setTempOpen(false)}
      />
    </>
  );
}

