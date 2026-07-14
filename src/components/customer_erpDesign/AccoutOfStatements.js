import {
  Card,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  TableHead,
  IconButton,
  Dialog,
  TextField,
  Button,
  DialogActions,
  DialogContent,
  Fade,
  Tooltip,
  Autocomplete,
  Box,
} from '@mui/material';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import moment from 'moment';
import {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {listCustomerStatementAction} from 'redux/actions/customer_actions';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { DatePicker } from '@mui/x-date-pickers';
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import {getsessionStorage} from 'pages/common/login/cookies';
import {getAppConfigDataAction} from 'redux/actions/app_config_actions';
import jsPDF from "jspdf";
import "jspdf-autotable";
import apiCalls from 'utils/apiCalls';
import toMomentOrNull from 'utils/DateFixer';

const AccountsOfStatements = (props) => {
  const dispatch = useDispatch();

  const storage = getsessionStorage();

  const {
    customerReducer: {Get_customer_statement, customerDetailById},
    erpDetailsReducer: {customer_erp_details},
  } = useSelector((state) => state);

  const [filter, setFilter] = useState(false);

  // const [fromDate, setFromDate] = useState(
  //   moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD'),
  // );
  // const [toDate, setToDate] = useState(
  //   moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD'),
  // );


  const [fromDate, setFromDate] = useState(
    moment().startOf('month')
  );
  const [toDate, setToDate] = useState(
    moment().endOf('month')
  );


  const [rangeOption, setRangeOption] = useState(null);

// Define your options
  const rangeOptions = ['This Week', 'This Year'];

  console.log(fromDate,toDate,'datess666')

  const handleSubmit = async () => {
    const payload = {
      type: props.type,
      from: moment(fromDate).format("YYYY-MM-DD"),
      to: moment(toDate).format("YYYY-MM-DD"),
    };

    if (props.type === 'Supplier') {
       apiCalls(
                  setModalTypeHandler,
                  setLoaderStatusHandler,
      dispatch(listCustomerStatementAction(props.supplier_id, payload)));
    } else {
       apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,dispatch(listCustomerStatementAction(props.customer_id, payload)));
    }
    setFilter(false);
  };

  const handleClear = async () => {
    setFromDate(
      moment().startOf('month'),
    );
    setToDate(
      moment().endOf('month'),
    );
    setRangeOption(null)
    const fromDate = moment()
      .startOf('month')
      .format('YYYY-MM-DD');
    const toDate = moment()
      .endOf('month')
      .format('YYYY-MM-DD');

    const payload = {
      type: props.type,
      from: fromDate,
      to: toDate,
    };

    if (props.type === 'Supplier') {
       apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
      dispatch(listCustomerStatementAction(props.supplier_id, payload)));
    } else {
       apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,dispatch(listCustomerStatementAction(props.customer_id, payload)));
    }

    setFilter(false);
  };

  const columns = [
    {
      field: 'date',
      title: 'Date',
    },
    {
      field: 'name',
      title: 'Details',
    },
    {
      field: 'vch_type',
      title: 'Vch Type',
    },
    {
      field: 'id',
      title: 'Vch No',
    },
     {
      field: 'receipt_number',
      title: 'Receipt Number',
    },
    {
      field: 'debit',
      title: 'Debit',
    },
    {
      field: 'credit',
      title: 'Credit',
    },
  ];

  // const handleExport = async () => {
  //   const doc = new jsPDF();
  
  //   doc.text("Statement Of Accounts", 14, 15);
  
  //   const columnHeaders = columns.map((column) => column.title);
  //   const rows = Get_customer_statement?.data?.map((row) =>
  //     columns.map((column) => row[column.field] ?? "")
  //   );
  
  //   doc.autoTable({
  //     head: [columnHeaders],
  //     body: rows,
  //     startY: 20,
  //   });
  //   doc.save("Statement_Of_Accounts.pdf");
  // };

  // console.log(Get_customer_statement,'Get_customer_statement',props.type)

  const handleExport = async () => {
    const formatAmount = (amount) =>
      `Rs. ${parseFloat(amount || 0).toFixed(2).padStart(10, " ")}`;
    
    const doc = new jsPDF("p", "mm", "a4");
  
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`Customer Statement for ${customerDetailById?.[0]?.company_name || "Customer"}`, 14, 15);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`From ${moment(fromDate, "YYYY-MM-DD").format("DD/MM/YYYY")} To ${moment(toDate, "YYYY-MM-DD").format("DD/MM/YYYY")}`, 14, 22);
  
    doc.setFont("helvetica", "bold");
    doc.text("Sales-Creation", 160, 15);
    doc.setFont("helvetica", "normal");
    doc.text(storage.company_name || "-", 160, 22);
    doc.text(storage.city || "-", 160, 27);
    doc.text(storage.phone_number || "-", 160, 32);
    doc.text(storage.company_email || "-", 160, 37);
  
    doc.setFont("helvetica", "bold");
    doc.text("To", 14, 40);
    doc.setTextColor(0, 0, 255);
    doc.text(customer_erp_details.length > 0 &&
      props.type === 'Supplier' &&
      customer_erp_details[0].payment_child.length > 0
        ? customer_erp_details[0].payment_child[0].vendorName
        : customerDetailById?.[0]?.company_name ||
          customerDetailById?.[0]?.first_name ||
          '', 14, 45);
    doc.setTextColor(0, 0, 0);
    doc.text(customer_erp_details.length > 0 &&
      props.type === 'Supplier' &&
      customer_erp_details[0].payment_child.length > 0
        ? customer_erp_details[0].payment_child[0].state
        : customerDetailById.length > 0
        ? customerDetailById[0].state
        : '-', 14, 50);
    doc.text(customer_erp_details.length > 0 &&
      props.type === 'Supplier' &&
      customer_erp_details[0].payment_child.length > 0
        ? customer_erp_details[0].payment_child[0].country
        : customerDetailById.length > 0
        ? customerDetailById[0].country
        : '-', 14, 55);
  
    doc.setFont("helvetica", "bold");
    doc.text("Statement of Accounts", 160, 50);
    doc.setFont("helvetica", "normal");
    doc.text(`${moment(fromDate, "YYYY-MM-DD").format("DD/MM/YYYY")} To ${moment(toDate, "YYYY-MM-DD").format("DD/MM/YYYY")}`, 160, 55);
  
    doc.setFillColor(200, 200, 200);
    doc.rect(14, 65, 180, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Account Summary", 16, 70);
  
    doc.setFont("helvetica", "normal");
    doc.text(`Opening Balance`, 16, 78);
    doc.text(formatAmount(Get_customer_statement?.openingBalance?.[0]?.openingBalance), 170, 78, { align: "right" });
  
    doc.text(`Total Debit`, 16, 83);
    doc.text(formatAmount(Get_customer_statement?.data?.reduce((a, b) => a + b.debit, 0) || "0.00"), 170, 83, { align: "right" });
  
    doc.text(`Total Credit`, 16, 88);
    doc.text(formatAmount(Get_customer_statement?.data?.reduce((a, b) => a + b.credit, 0) || "0.00"), 170, 88, { align: "right" });
  
    doc.text(`Closing Balance`, 16, 93);
    doc.text(formatAmount(Get_customer_statement?.closingBalance?.[0]
      ?.closingBalance || "0.00"), 170, 93, { align: "right" });
  
    doc.autoTable({
      startY: 100,
      head: [["Date", "Details", "Vch Type", "Vch No","Receipt Number", "Debit", "Credit"]],
      body: Get_customer_statement?.data?.length
        ? Get_customer_statement?.data.map((row) => [
            // moment(row.date).format("DD/MM/YYYY"),
            row.date || "-",
            row.name || "-",
            row.vch_type || "-",
            row.id || "-",
            row.receipt_number === null ? '' : row.receipt_number,
            row.debit ? formatAmount(row.debit) : "-",
            row.credit ? formatAmount(row.credit) : "-",
          ])
        : [["No data available", "", "", "", "", ""]],
      theme: "grid",
      headStyles: { fillColor: [200, 200, 200] },
      styles: { fontSize: 10 },
    });
  
    doc.save("Customer_Statement.pdf");
  };
  

  // const handleExport = async () => {
  //   const columnHeaders = columns.map((column) => column.title);
  //   const rows = Get_customer_statement?.data?.map((row) =>
  //     columns.map((column) => row[column.field]),
  //   );

  //   let csvContent = 'data:text/csv;charset=utf-8,';
  //   csvContent += columnHeaders.join(',') + '\n';
  //   csvContent += rows.map((row) => row.join(',')).join('\n');

  //   const encodedUri = encodeURI(csvContent);
  //   const link = document.createElement('a');
  //   link.setAttribute('href', encodedUri);
  //   link.setAttribute('download', 'Statement Of Accounts' + '.csv');
  //   document.body.appendChild(link);
  //   link.click();
  // };

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(CreateNewButtonContext);

  console.log(Get_customer_statement, 'customerReducer', customerDetailById);
  useEffect(() => {
    const date = new Date();
    let firstDay =
      date.getMonth() <= 2
        ? new Date(date.getFullYear() - 1, 3, 1)
        : new Date(date.getFullYear(), 3, 1);
    var lastDay = new Date();

    const payload = {
      type: props.type,
      from: moment(fromDate).format('YYYY-MM-DD'),
      to: moment(toDate).format('YYYY-MM-DD'),
    };

    if (props.type === 'Supplier') {
       apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
      dispatch(listCustomerStatementAction(props.supplier_id, payload)));
    } else {
       apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
      dispatch(listCustomerStatementAction(props.customer_id, payload)));
    }
  }, [props.customer_id,props.supplier_id]);

  
  const particulars = (data) => {
  
    const obj = {
      ['Sales'](data){
        if(data.vch_type === 'Sales Return'){
          return data.paymentAgainst
        } 
        return data.allTransactionParticular.filter(i => i.parentAccName === 'Sundry Debtors')[0]?.description || data.name
      },
      ['Credit Notes'](data){
       
        if(data.vch_type === 'Sales Return'){
          return data.paymentAgainst
        } 
        return data.allTransactionParticular.filter(i => i.parentAccName === 'Sundry Debtors')[0]?.description || data.name
       
      },
      ['SGST Payable'](data) {
        if(['Purchase Return', 'Sales Return', 'POS Invoice'].includes(data.vch_type)){
          return data.paymentAgainst
        } 
        return data.allTransactionParticular.filter(i => i.parentAccName === 'Sundry Debtors')[0]?.description || data.name
      },
      ['CGST Payable'](data) {
        if(['Purchase Return', 'Sales Return', 'POS Invoice'].includes(data.vch_type)){
          return data.paymentAgainst
        } 
        return data.allTransactionParticular.filter(i => i.parentAccName === 'Sundry Debtors')[0]?.description || data.name
      },
      ['TCS Payable'](data){
        if(['POS Invoice'].includes(data.vch_type)){
          return data.paymentAgainst
        }
        return data.allTransactionParticular.filter(i => i.parentAccName === 'Sundry Debtors')[0]?.description || data.name
      },
      ['IGST Payable'](data){
        if(['Purchase Return', 'Sales Return', 'POS Invoice'].includes(data.vch_type)){
          return data.paymentAgainst
        } 
        return data.allTransactionParticular.filter(i => i.parentAccName === 'Sundry Debtors')[0]?.description || data.name
      },
      ['Sundry Debtors'](data){
        return data.allTransactionParticular.filter(i => ['Bank', 'Cash-in-hand'].includes(i.parentAccName))[0]?.accountName || data.name
      },
      ['Sundry Creditors'](data){
        return data.vch_type === 'Purchase Invoice' ? 'Purchase' : 'Expense'
      },
      ['SGST Receivable'](data){
        return data.allTransactionParticular.filter(i => i.parentAccName === 'Sundry Creditors')[0]?.accountName || data.name
      },
      ['CGST Receivable'](data){
        return data.allTransactionParticular.filter(i => i.parentAccName === 'Sundry Creditors')[0]?.accountName || data.name
      },
      ['TCS Receivable'](data){
        return data.allTransactionParticular.filter(i => i.parentAccName === 'Sundry Creditors')[0]?.accountName || data.name
      },
      ['IGST Receivable'](data){
        return data.allTransactionParticular.filter(i => i.parentAccName === 'Sundry Creditors')[0]?.accountName || data.name
      },
      ['Cost of Goods Sold'](data){
        return data.allTransactionParticular.filter(i => i.parentAccName === 'Sundry Debtors')[0]?.accountName || data.name
      },
      ['Bank'](data) {
        if(['POS Invoice'].includes(data.vch_type)){
          return data.paymentAgainst
        }
        return data.allTransactionParticular.filter(i =>['Sundry Debtors', 'Sundry Creditors'].includes(i.parentAccName))[0]?.accountName || data.name
      },
      ['Cash-in-hand'](data){
        if( ['Sales Payment', 'POS Invoice'].includes(data.vch_type) ){
          return data.paymentAgainst || data.name
        }
        if (data.credit > 0) {
          return data.allTransactionParticular.filter(i => i.transactionEntryDebit === data.credit && i.parentAccName !== 'Cash-in-hand')[0]?.accountName || data.name
        }
        if (data.debit > 0) {
          return data.allTransactionParticular.filter(i => i.transactionEntryCredit === data.debit && i.parentAccName !== 'Cash-in-hand')[0]?.accountName || data.name
        }
        // return data.allTransactionParticular.filter(i =>['Sundry Debtors', 'Sundry Creditors'].includes(i.parentAccName))[0]?.accountName || data.name
      },
      ['Stock'](data){
        if(['Purchase Return', 'Sales Return', 'POS Invoice'].includes(data.vch_type)){
          return data.paymentAgainst
        }
        return data.allTransactionParticular.filter(i =>['Sundry Debtors', 'Sundry Creditors'].includes(i.parentAccName))[0]?.accountName || data.name
      },
      ['NEFT/UPI - Axis'](data){
        if(['POS Invoice'].includes(data.vch_type)){
          return data.paymentAgainst
        }
        return data.allTransactionParticular.filter(i =>['Sales'].includes(i.parentAccName))[0]?.accountName || data.name
      },
      ['POS Sales'](data){
        if(['POS Invoice'].includes(data.vch_type)){
          return data.paymentAgainst
        }
        return data.allTransactionParticular.filter(i =>['Sales'].includes(i.parentAccName))[0]?.accountName || data.name
      },
      ['Loans & Advances (Asset)'](data){
        return data.allTransactionParticular.filter(i =>['Loans & Advances (Asset)'].includes(i.parentAccName))[0]?.accountName || data.name
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

    if(obj[data.name] !== undefined){
      return obj[data.name](data)
    }else{
      if(data.allTransactionParticular.length === 2) return data.allTransactionParticular.filter(i => i.name !== data.name)[0]?.accountName || data.name
      if(data.vch_type === 'Pay(IN/OUT) Entry') return obj['Pay(IN/OUT) Entry'](data)
      if(data.ledgerType === 'Sundry Debtors') return obj['Sundry Debtors'](data)
      if(data.ledgerType === 'Sundry Creditors') return obj['Sundry Creditors'](data)     
      if(data.ledgerType === 'Bank') return obj['Bank'](data)       
      if(data.ledgerType === 'Cash-in-hand') return obj['Cash-in-hand'](data)
      if(data.ledgerType === 'Sales') return obj['POS Sales'](data)
      if(data.ledgerType === 'Loans & Advances (Asset)') return obj['Loans & Advances (Asset)'](data)
      return data.name;
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


  return (
    <Card>
      <Dialog
        open={filter}
        onClose={() => setFilter(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogContent>
          <Grid container spacing={3} justifyContent='center' sx={{padding: 2}}>

          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
      <Autocomplete
        options={rangeOptions}
        value={rangeOption}
        onChange={(event, newValue) => {
          setRangeOption(newValue);
          // Set fromDate and toDate based on selected option
          if (newValue === 'This Week') {
            setFromDate(moment().startOf('week'));
            setToDate(moment().endOf('week'));
          } else if (newValue === 'This Year') {
            setFromDate(moment().startOf('year'));
            setToDate(moment().endOf('year'));
          }
        }}
        renderInput={(params) => (
          <TextField {...params} label="Select Range" fullWidth variant="outlined" />
        )}
      />
    </Grid>

            <Grid
              size={{
                lg: 6,
                md: 6,
                sm: 12,
                xs: 12
              }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  label='From Date'
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                    },
                  }}
                  format='DD/MM/YYYY'
           
                  value={toMomentOrNull(fromDate)}
                  onChange={(date) =>
                    setFromDate(date)
                  }
                />
              </LocalizationProvider>
            </Grid>

            <Grid
              size={{
                lg: 6,
                md: 6,
                sm: 12,
                xs: 12
              }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  label='To Date'
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                    },
                  }}
                  format='DD/MM/YYYY'
                  value={toMomentOrNull(toDate)}
                  onChange={(date) =>
                    setToDate(date)
                  }
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{justifyContent: 'flex-end', paddingBottom: 2}}>
          <Button variant='contained' color='error' onClick={handleClear}>
            Clear
          </Button>
          <Button variant='contained' color='primary' onClick={handleSubmit}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
      <Grid
        container
        alignItems='center'
        spacing={2}
        sx={{margin: 3, position: 'relative'}}
      >
        <Grid display='flex' flexDirection='column' alignItems='center' size="grow">
          <Typography variant='h3' textAlign='center'>
            Customer Statement for{' '}
            {customer_erp_details.length > 0 &&
            props.type === 'Supplier' &&
            customer_erp_details[0].payment_child.length > 0
              ? customer_erp_details[0].payment_child[0].vendorName
              : customerDetailById?.[0]?.company_name ||
                customerDetailById?.[0]?.first_name ||
                ''}
          </Typography>
          <Typography variant='body1'>
            From {moment(fromDate,'YYYY-MM-DD').format('DD/MM/YYYY')} To {moment(toDate,'YYYY-MM-DD').format('DD/MM/YYYY')}
          </Typography>
        </Grid>

        <Grid display={'flex'} sx={{position: 'absolute', right: 50}}>
          <IconButton onClick={() => setFilter(true)} sx={{ mb: 1 }}>
            <FilterAltIcon />
          </IconButton>

          <Tooltip
            title='Export'
            TransitionComponent={Fade}
            TransitionProps={{timeout: 600}}
            placement='top'
          >
            <IconButton onClick={() => handleExport()}>
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
      <Card sx={{padding: 3, margin: '10px',boxShadow:'none !important'}}>
        <Grid container direction='column' spacing={2}>
          <Grid sx={{textAlign: 'right', alignItems: 'flex-end'}}>
            <Typography variant='body1' fontWeight='bold'>
              {storage.company_name ? storage.company_name : '-'}
            </Typography>
            <Typography>{storage.city ? storage.city : '-'}</Typography>
            <Typography>{storage.country ? storage.country : '-'}</Typography>
            <Typography>
              {storage.company_gst ? storage.company_gst : '-'}
            </Typography>
            <Typography>
              {storage.phone_number ? storage.phone_number : '-'}
            </Typography>
            <Typography>
              {storage.company_email ? storage.company_email : '-'}
            </Typography>
          </Grid>

          <Grid>
            <Typography variant='body1' fontWeight='bold'>
              To
            </Typography>
            <Typography color='blue'>
              {customer_erp_details.length > 0 &&
              props.type === 'Supplier' &&
              customer_erp_details[0].payment_child.length > 0
                ? customer_erp_details[0].payment_child[0].vendorName
                : customerDetailById?.[0]?.company_name ||
                  customerDetailById?.[0]?.first_name ||
                  ''}
            </Typography>
            <Typography>
              {customer_erp_details.length > 0 &&
              props.type === 'Supplier' &&
              customer_erp_details[0].payment_child.length > 0
                ? customer_erp_details[0].payment_child[0].state
                : customerDetailById.length > 0 
                ? customerDetailById[0].state
                : '-'}
            </Typography>
            <Typography>
              {customer_erp_details.length > 0 &&
              props.type === 'Supplier' &&
              customer_erp_details[0].payment_child.length > 0
                ? customer_erp_details[0].payment_child[0].country
                : customerDetailById.length > 0
                ? customerDetailById[0].country
                : '-'}
            </Typography>
          </Grid>
        </Grid>

        <Grid
          container
          direction='column'
          alignItems='flex-end'
          sx={{marginTop: 3}}
        >
          <Typography variant='h5' fontWeight='bold'>
            Statement of Accounts
          </Typography>
          <Grid sx={{width: 'fit-content'}}>
            <hr style={{width: '160px'}} />
          </Grid>
          <Typography variant='body2'>
            {moment(fromDate,'YYYY-MM-DD').format('DD/MM/YYYY')} To {moment(toDate,'YYYY-MM-DD').format('DD/MM/YYYY')}
          </Typography>
          <Grid sx={{width: 'fit-content'}}>
            <hr style={{width: '160px'}} />
          </Grid>
        </Grid>

        <Grid container justifyContent='flex-end'>
          <TableContainer sx={{marginTop: 2, maxWidth: '400px'}}>
            <Table>
              <TableBody>
                <TableRow sx={{backgroundColor: '#d0d0d0', fontWeight: 'bold'}}>
                  <TableCell
                    sx={{fontWeight: 'bold', fontSize: '1rem', padding: '12px'}}
                  >
                    Account Summary
                  </TableCell>
                  <TableCell
                    sx={{fontWeight: 'bold', fontSize: '1rem'}}
                  ></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Opening Balance</TableCell>
                  <TableCell align='right'>
                    ₹
                    {
                      Get_customer_statement?.openingBalance?.[0]
                        ?.openingBalance.toFixed(2) || '0.00'
                    }
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Total Debit</TableCell>
                  <TableCell align='right'>
                    {' '}
                    {`${
                      Get_customer_statement?.data?.length > 0
                        ? `₹ ${Get_customer_statement?.data?.reduce((a, b) => a + b.debit, 0).toFixed(2)}`
                        : '₹ 0.00'
                    }`}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Total Credit</TableCell>
                  <TableCell align='right'>
                    {' '}
                    {`${
                      Get_customer_statement?.data?.length > 0
                        ? `₹ ${Get_customer_statement?.data?.reduce((a, b) => a + b.credit, 0).toFixed(2)}`
                        : '₹ 0.00'
                    }`}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{fontWeight: 'bold'}}>Closing Balance</TableCell>
                  <TableCell sx={{fontWeight: 'bold'}} align='right'>
                   {Get_customer_statement?.closingBalance?.length > 0 ?Get_customer_statement?.closingBalance[0]?.closingBalance : '₹ 0.00' || '₹ 0.00'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid container>
          <TableContainer sx={{marginTop: '20px'}}>
            <Table>
              <TableHead sx={{backgroundColor: '#e0e0e0'}}>
                <TableRow>
                  <TableCell sx={{fontWeight: 'bold'}}>Date</TableCell>
                  <TableCell sx={{fontWeight: 'bold'}}>Particulars</TableCell>
                  <TableCell sx={{fontWeight: 'bold'}}>Vch Type</TableCell>
                  <TableCell sx={{fontWeight: 'bold'}}>Vch No</TableCell>
                  <TableCell sx={{fontWeight: 'bold'}}>Receipt Number</TableCell>
                  <TableCell sx={{fontWeight: 'bold'}}>
                     <Box sx={{ textAlign: 'right', width: '100%' }}>Debit</Box></TableCell>
                  <TableCell sx={{fontWeight: 'bold'}}>
                     <Box sx={{ textAlign: 'right', width: '100%' }}>Credit</Box></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Get_customer_statement?.data?.length > 0 ? (
                  Get_customer_statement.data.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{props.type === 'Supplier' ? moment(row.date).format('DD/MM/YYYY') : moment(row.date).format('DD/MM/YYYY')}</TableCell>
                      <TableCell>{particulars(row)}</TableCell>
                      <TableCell> {vch_type(row)}</TableCell>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.receipt_number === null ?'' : row.receipt_number}</TableCell>
                      <TableCell align='right'>
                         <Box sx={{ textAlign: 'right', width: '100%' }}>
                        {row.debit === 0 ? '' : `₹${row.debit}`}
                        </Box>
                      </TableCell>
                      <TableCell align='right'>
                         <Box sx={{ textAlign: 'right', width: '100%' }}>
                        {row.credit === 0 ? '' : `₹${row.credit}`}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align='center'>
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Card>
    </Card>
  );
};

export default AccountsOfStatements;
