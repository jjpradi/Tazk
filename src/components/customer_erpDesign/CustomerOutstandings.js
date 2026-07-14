import { Alert, Autocomplete, Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Menu, MenuItem, Snackbar, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment as DateAdapter } from '@mui/x-date-pickers/AdapterMoment';
import toMomentOrNull from '../../utils/DateFixer';
import jsPDF from "jspdf";
import moment from "moment";
import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOutstandingBasedOnCustomerAction } from "redux/actions/customer_actions";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CloseIcon from '@mui/icons-material/Close';
import CommonFilter from "components/pos/payment_section/CommonFilter";
import ShareIcon from '@mui/icons-material/Share';
import { saveAs } from "file-saver";
import * as XLSX from "xlsx-js-style";
import { useCustomFetch } from "utils/useCustomFetch";
import Invoice from '../../../src/pages/sales/sales/Invoice'
import InvoiceDialog from '../../pages/sales/sales/InvoiceDialog';
import { getSupplierDetailsByIdreceivings_itemsAction, setInvoiceTempAction } from "redux/actions/vendor_actions";
import CommonInvoiceTemplate from "pages/sales/CommonInvoiceTemp/CommonInvoiceTemplate";
import context from '../../context/CreateNewButtonContext';
import apiCalls from "utils/apiCalls";
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { RESET_OUTSTANDING_BY_CUSTOMER } from "../../redux/actionTypes";
import { ManualSalesPurchase } from "redux/actions/manualNotes_actions";
import { outstandingShareAction, shareOutstandingReportAction } from "../../redux/actions/customer_actions";
import ReceiptTempDialog from 'pages/sales/Receipt/ReceiptTemp'
import { clearInvoiceTempAction } from "../../redux/actions/vendor_actions";
import API_URLS from "../../utils/customFetchApiUrls";
import { useLocation } from 'react-router-dom';
import { getsessionStorage } from "pages/common/login/cookies";

function CustomerOutstandings(props) {

    const dispatch = useDispatch()
    const customFetch = useCustomFetch();
    const { pathname } = useLocation()
    const storage = getsessionStorage()
   
    const {
        customerReducer: { outstandingByCustomer, customerDetailById ,outstandingReportTemp},
        erpDetailsReducer: { customer_erp_details },
         vendorReducer : { po_temp },
    } = useSelector(state => state)

    const {
            setModalTypeHandler,
            setLoaderStatusHandler,
            commoncookie,
            headerLocationId,
        } = useContext(CreateNewButtonContext);

    const [filterOpen, setFilterOpen] = useState(false)
    const [termsAndConditions, setTermsAndConditions] = useState([]);
    const [type, setType] = useState('');
    const [invoicePopup, setinvoicePopup] = useState(false);
    const [invoiceData, setinvoiceData] = useState({});
    const [appConfigData, setAppConfigData] = useState({});
    const [filter, setFilter] = useState({
        from: "null",
        to: "null"
    })
    const [anchorEl, setAnchorEl] = useState(null)
    const [error, setError] = useState(false);
    const openMenu = Boolean(anchorEl);
    const [ menuType, setMenuType ] = useState(null);
    const openShare = Boolean(anchorEl)
    const [ dialogOpen, setDialogOpen ] = useState(false)
    const [ fromDate, setFromDate ] = useState(null);
    const [ toDate, setToDate ] = useState(null);
    const [ rangeOption, setRangeOption ] = useState(null);
    const rangeOptions = ['Today', 'Yesterday', 'This Week', 'Last Week', 'Last 7 Days', 'This Month', 'Last Month', 'This Quater', 'Last Quater', 'Current Fiscal Year', 'Previous Fiscal Year', 'Last 365 days'];
    const [ shareOutstanding, setShareOutstanding ] = useState()
    const [billInvoice, setBillInvoice] = useState(false)
    const [ shareColumns, setShareColumns ] = ([
        { name: "Date", key: "Date" },
        { name: "Salesman Name", key: "salesman_name" },
        { name: "Count", key: "entry_count" },
        { name: "Collection Amount", key: "collection_amount" },
        { name: "Invoice Amount", key: "invoice_amount" },
        { name: "Mode of Payment", key: "paymentName" } ])

    const typeParams = pathname === '/apps/CustomerOutstanding' || props.type === 'Customer' ? 'Customer' : 'Vendor'

    useEffect(() => { (async () => {

        let payload = {}
        const targetId = (pathname === '/apps/CustomerOutstanding') ? storage.customer_id  : props.customer_id;

        if(props.customerVendorLinked){
            if(typeParams === 'Vendor'){
                payload = {
                    type: 'CustomerVendorLinked',
                    from: "null",
                    to: "null",
                    supplier_id: props.customer_id,
                    customer_id: props.customerVendorLinked,
                    detailType: 'Vendor'
                }
            }
            else{
                payload = {
                    type: 'CustomerVendorLinked',
                    from: "null",
                    to: "null",
                    supplier_id: props.customerVendorLinked,
                    customer_id: props.customer_id,
                    detailType: 'Customer'
                }  
            }
        }
        else{
            payload = {
                type: typeParams,
                from: "null",
                to: "null",
            }
        }

        await apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(getOutstandingBasedOnCustomerAction(targetId, headerLocationId, payload)),
            // dispatch(setInvoiceTempAction(response))
        );
    })();
}, [props.customer_id, headerLocationId])

  
    
    const ApplyButton = async() => {
          if (!fromDate || !toDate) {
                setError(true);
                return;
            }
          setFilter({ from: fromDate, to: toDate });

        let payload = {}

        if(props.customerVendorLinked){
            if(typeParams === 'Vendor'){
                payload = {
                    type: 'CustomerVendorLinked',
                    from: moment(fromDate).format('YYYY/MM/DD'),
                    to: moment(toDate).format('YYYY/MM/DD'),
                    supplier_id: props.supplier_id,
                    customer_id: props.customerVendorLinked
                }
            }
            else{
                payload = {
                    type: 'CustomerVendorLinked',
                    from: moment(fromDate).format('YYYY/MM/DD'),
                    to: moment(toDate).format('YYYY/MM/DD'),
                    supplier_id: props.customerVendorLinked,
                    customer_id: props.customer_id
                }  
            }
        }
        else{
            payload = {
                type: typeParams,
                from: moment(fromDate).format('YYYY/MM/DD'),
                to: moment(toDate).format('YYYY/MM/DD'),
            }
        }
        await apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(getOutstandingBasedOnCustomerAction(props.customer_id, headerLocationId, payload))
        );

        setFilterOpen(false)
        setError(false);
    }
    
    const clearButton = async() => {
        setFromDate(null);
        setToDate(null);
        setRangeOption(null);
        setError(false);
        setFilter({from: "null", to: "null"})
        let payload = {}

        if(props.customerVendorLinked){
            if(typeParams === 'Vendor'){
                payload = {
                    type: 'CustomerVendorLinked',
                    from: "null",
                    to: "null",
                    supplier_id: props.supplier_id,
                    customer_id: props.customerVendorLinked
                }
            }
            else{
                payload = {
                    type: 'CustomerVendorLinked',
                    from: "null",
                    to: "null",
                    supplier_id: props.customerVendorLinked,
                    customer_id: props.customer_id
                }  
            }
        }
        else{
            payload = {
                type: typeParams,
                from: "null",
                to: "null",
            }
        }
        await apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(getOutstandingBasedOnCustomerAction(props.customer_id, headerLocationId, payload))
        );
        setFilterOpen(false)
    }

    const handleChange = async(data) => {
        var date_val = data.target.value._d;
        if(data.target.name === 'from'){
            await setFilter((prev) => ({ ...prev, from: date_val }))
        }else{
            await setFilter((prev) => ({ ...prev, to: date_val }))
        }
    }

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget)
        setMenuType('action');
    }

    const handleShareClick = (event) => {
        setAnchorEl(event.currentTarget);
        setMenuType('share');
    };

    const handleClose = () => {
        setAnchorEl(null)
        setMenuType(null);
    }

    const handleWpClose = () => {
        setAnchorEl(null);
    }

    const handleInvoiceData = async (id, rowData, type) => {
       console.log(type, rowData,'typecewdcew');

      let getData;
      if (rowData.mn_id === '') {
        // if (type === 'VENDOR') {

            if(rowData.receipt_id  && rowData.receipt_id !== ''){
                     const receiptId = rowData.receipt_id 
                const type= rowData.supplier_id !== '' && rowData.supplier_id !== undefined ? 'Payments' : 'Receipts'
                const { data } = await customFetch(
                      API_URLS.GET_RECEIPTS_BY_ID(receiptId, type),
                      'GET'
                    );
                await apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(setInvoiceTempAction(data))
                )
                setinvoicePopup(true)
            }

            if(rowData.receiving_id  && rowData.receiving_id !== ''){
                const payload = {
                    receiving_id: rowData.receiving_id
                }

                await apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(getSupplierDetailsByIdreceivings_itemsAction(rowData.supplier_id, payload))
                )
                setinvoicePopup(true)
            }
        //   } else {
              if (rowData.sale_id !== '') {


                  const type = 'sales'
                  const poptype = 'invoice'
                  const { data } = await customFetch(
                      API_URLS.GET_SALES_INVOICE_DETAILS(rowData.sale_id, type, poptype),
                      'POST'
                  );
                  console.log(data, 'fhgjhg');

                  await apiCalls(
                      setModalTypeHandler,
                      setLoaderStatusHandler, dispatch(setInvoiceTempAction(data)))
                  const termsConditions = await customFetch(
                      API_URLS.TERMS_CONDITIONS,
                      'POST',
                      { searchString: "" }
                  );
                  console.log(data, termsConditions.data, "saleData");
                  const termsAndConditions = termsConditions.data?.filter(e => e.invoice_types === 'Sales')
                  setTermsAndConditions(termsAndConditions)
                  getData = data?.[0]
                  // setBillInvoice(false)
              }
            //   else{
            //       const receiptId = rowData.receipt_id 
            //     const type='Receipts'
            //     const { data } = await customFetch(
            //           API_URLS.GET_RECEIPTS_BY_ID(receiptId, type),
            //           'GET'
            //         );
            //     await apiCalls(
            //         setModalTypeHandler,
            //         setLoaderStatusHandler,
            //         dispatch(setInvoiceTempAction(data))
            //     )
            //     setinvoicePopup(true)
            //   }
              // console.log(getData,"vngfmdata");

              setType(type);

              // getAppConfigData()

              rowData?.invoice_number !== "Advance" && setinvoicePopup(true);
              setinvoiceData(getData);

        //   } 
    }
      else if (rowData.dc_id) {
        if (type === 'VENDOR') {
            const { data } = await customFetch(
                API_URLS.GET_PURCHASE_INVOICE_BY_ID(id),
                'GET'
            );
          getData = data.data[0];
        } else {
            const type =  'deliveryChallan' 
            const poptype = 'invoice'
            const { data } = await customFetch(
                API_URLS.GET_SALES_INVOICE_DETAILS(id, type,poptype),
                'POST'
            );
            console.log(data,'fhgjhg');
            
            await apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,dispatch(setInvoiceTempAction(data)))
            const termsConditions = await customFetch(
                API_URLS.TERMS_CONDITIONS,
                'POST',
                { searchString: "" }
            );
            console.log(data, termsConditions.data, "saleData");
            const termsAndConditions = termsConditions.data?.filter(e => e.invoice_types === 'Sales')
            setTermsAndConditions(termsAndConditions)
            getData = data?.[0]
        }
        // console.log(getData,"vngfmdata");

        setType(type);

        // getAppConfigData()
        
        rowData?.invoice_number !== "Advance" && setinvoicePopup(true);
        setinvoiceData(getData);
      } 
      else {
        const dataCN = {
                id: rowData.return_id ? rowData.return_id : '',
                type: 'C',
                status: '4',
                mn_id: rowData.mn_id
        };

        const dataDN = {
                id: rowData.return_id ? rowData.return_id : '',
                type: 'D',
                status: null,
                mc_id: rowData.mn_id,
                sequence : rowData?.credit_note || null
        };

        const data = rowData.creditDebitSide === 'Dr.' ? dataDN : dataCN

        setType(type);
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(
              ManualSalesPurchase(data, (response) => {
                if (response) {
                  dispatch(setInvoiceTempAction(response))
                  rowData?.invoice_number !== "Advance" && setinvoicePopup(true); 
                }
              })
            )    
        )
      }
    };

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        const margin = 10;
        let yPosition = margin + 5;
        const customerName = customer_erp_details.length > 0 && props.type === 'Supplier' && customer_erp_details[0].payment_child.length > 0
                            ? customer_erp_details[0].payment_child[0].vendorName
            : customerDetailById?.[0]?.company_name || customerDetailById?.[0]?.first_name || ''

        const customer = customerDetailById?.[0] || {};
        const customerInfoFields = [
            customer.address,
            customer.area,
            customer.city,
            customer.state,
            customer.country,
            customer.zip,
            customer.company_gst,
            customer.phone_number,
            customer.email,
        ];

        const pageWidth = doc.internal.pageSize.getWidth();

        const creditTotalForOpeningAmount = outstandingByCustomer?.invoiceOutstanding
            .filter(item => item.creditDebitSide === 'Cr.')
            .reduce((sum, item) => sum + parseFloat(item.total), 0)

        const debitTotalForOpeningAmount = outstandingByCustomer?.invoiceOutstanding
            .filter(item => item.creditDebitSide === 'Dr.')
            .reduce((sum, item) => sum + parseFloat(item.total), 0)

            
        const balanceForOpeningAmount = Math.abs(creditTotalForOpeningAmount - debitTotalForOpeningAmount).toFixed(2)
        const labelForOpeningAmount = creditTotalForOpeningAmount > debitTotalForOpeningAmount ? 'Cr.' : 'Dr.'
        const totalOpeningAmount = `${balanceForOpeningAmount} ${labelForOpeningAmount}`
            
        const creditTotalForOpeningAmountDC = outstandingByCustomer?.dcOutstanding
            .filter(item => item.creditDebitSide === 'Cr.')
            .reduce((sum, item) => sum + parseFloat(item.total), 0)

        const debitTotalForOpeningAmountDC = outstandingByCustomer?.dcOutstanding
            .filter(item => item.creditDebitSide === 'Dr.')
            .reduce((sum, item) => sum + parseFloat(item.total), 0)

        const balanceForOpeningAmountDC = Math.abs(creditTotalForOpeningAmountDC - debitTotalForOpeningAmountDC).toFixed(2)
        const labelForOpeningAmountDC = creditTotalForOpeningAmountDC > debitTotalForOpeningAmountDC ? 'Cr.' : 'Dr.'
        const totalOpeningAmountDC = `${balanceForOpeningAmountDC} ${labelForOpeningAmountDC}`

        const creditTotalForPendingAmount = outstandingByCustomer?.invoiceOutstanding
            .filter(item => item.creditDebitSide === 'Cr.')
            .reduce((sum, item) => sum + parseFloat(item.pending_amount), 0)

        const debitTotalForPendingAmount = outstandingByCustomer?.invoiceOutstanding
            .filter(item => item.creditDebitSide === 'Dr.')
            .reduce((sum, item) => sum + parseFloat(item.pending_amount), 0)

        const balanceForPendingAmount = Math.abs(creditTotalForPendingAmount - debitTotalForPendingAmount).toFixed(2)
        const labelForPendingAmount = creditTotalForPendingAmount > debitTotalForPendingAmount ? 'Cr.' : 'Dr.'
        const totalPendingAmount = `${balanceForPendingAmount} ${labelForPendingAmount}`

        const creditTotalForPendingAmountDC = outstandingByCustomer?.dcOutstanding
            .filter(item => item.creditDebitSide === 'Cr.')
            .reduce((sum, item) => sum + parseFloat(item.pending_amount), 0)

        const debitTotalForPendingAmountDC = outstandingByCustomer?.dcOutstanding
            .filter(item => item.creditDebitSide === 'Dr.')
            .reduce((sum, item) => sum + parseFloat(item.pending_amount), 0)

        const balanceForPendingAmountDC = Math.abs(creditTotalForPendingAmountDC - debitTotalForPendingAmountDC).toFixed(2)
        const labelForPendingAmountDC = creditTotalForPendingAmountDC > debitTotalForPendingAmountDC ? 'Cr.' : 'Dr.'
        const totalPendingAmountDC = `${balanceForPendingAmountDC} ${labelForPendingAmountDC}`
    
        const startOfMonth = moment().startOf('month').format('DD-MMM-YY')
        const currentDate = moment().format('DD-MMM-YY')
        const reportDateRange = `${startOfMonth} to ${currentDate}`
        const line1Fields = [
            customer.address,
            customer.area,
            customer.city,
            customer.state,
            customer.country,
            customer.zip,
        ];

        const line2Fields = [
            customer.company_gst,
            customer.phone_number,
            customer.email
        ];
                const maxLineWidth = pageWidth - margin * 2;
        const line1Text = doc.splitTextToSize(line1Fields.filter(Boolean).join(', '), maxLineWidth);
        const line2Text = doc.splitTextToSize(line2Fields.filter(Boolean).join(', '), maxLineWidth);


        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13)
        doc.text(`Outstanding Report`, margin, yPosition);


        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const generatedDate = moment().format('DD-MMM-YYYY');
        doc.text(generatedDate, pageWidth - margin, yPosition, { align: 'right' });
        yPosition += 7;

        doc.setFont('helvetica','normal');
        doc.setFontSize(10)
        doc.text(customerName, margin, yPosition);
        yPosition += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        line1Text.forEach(line => {
            doc.text(line, margin, yPosition);
            yPosition += 5;
        });
        line2Text.forEach(line => {
            doc.text(line, margin, yPosition);
            yPosition += 5;
        });


                // Add "Bill-wise Details"
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(11)
        // doc.text('Bill-wise Details', pageWidth - margin, yPosition, { align: 'right' });
        yPosition += 6;
    
        // Add Date Range (if available)
        // if (reportDateRange) {
        //   doc.setFontSize(10);
        //   doc.text(reportDateRange, margin, yPosition);
        //   yPosition += 10;
        // } else {
        //   yPosition += 10; // Add some spacing even if no date range
        // }
    
        // Define table columns
        const columns = [
          { header: 'Date', dataKey: 'invoice_date' },
          { header: 'Cheque Bounce', dataKey: 'cheque_bounce'},
          { header: 'Ref No.', dataKey: 'invoice_number' },
        //   { header: 'Created Against', dataKey: 'created_against' },
          { header: 'Opening Amount', dataKey: 'total' },
          { header: 'Due Amount', dataKey: 'pending_amount' },
          { header: 'Due On', dataKey: 'due_date' },
          { header: 'Due Days', dataKey: 'overdue_days' },
        ];

        const columnsDC = [
          { header: 'Date', dataKey: 'dc_date' },
          { header: 'Ref No.', dataKey: 'dc_number' },
        //   { header: 'Created Against', dataKey: 'created_against' },
          { header: 'Opening Amount', dataKey: 'total' },
          { header: 'Closing Amount', dataKey: 'pending_amount' },
        ];
    
        // Format the data for the table
        const data = outstandingByCustomer?.invoiceOutstanding.map((item) => ({
          invoice_date: moment(item.invoice_date).format('DD/MM/YYYY'),
          cheque_bounce: `B${item?.cheque_bounce_count}`,
          invoice_number: item.credit_note !== ""  ? item.credit_note  : item.invoice_number || item.dc_number,
        //   created_against: item.credit_note ? item.invoice_number || '' : '',
          total: `${item.total} ${item.creditDebitSide}`,
          pending_amount: `${item.pending_amount} ${item.creditDebitSide}`,
          due_date: item.due_date ? moment(item.due_date).format('DD/MM/YYYY') : '-',
          overdue_days: item?.overdue_days || '-',
        }));

        const dataDC = outstandingByCustomer?.dcOutstanding.map((item) => ({
          dc_date: moment(item.dc_date).format('DD/MM/YYYY'),
          dc_number: item.dc_number,
          total: `${item.total} ${item.creditDebitSide}`,
          pending_amount: `${item.pending_amount} ${item.creditDebitSide}`
        }));
        
        data.push({
            invoice_date: '',
            cheque_bounce:'',
            invoice_number: '',
            created_against: '',
            total: totalOpeningAmount,
            pending_amount: totalPendingAmount,
            due_date: '',
            overdue_days: '',
        })

        dataDC.push({
            dc_date: '',
            dc_number: '',
            total: totalOpeningAmountDC,
            pending_amount: totalPendingAmountDC,
        })
    
        // Add the main table
        doc.autoTable({
          columns,
          body: data,
          startY: yPosition,
          margin: { left: margin, right: margin },
          headStyles: { fillColor: [200, 200, 200] },
            columnStyles: {
                total: { halign: 'right' },
                pending_amount: { halign: 'right' },
            }
        })

        yPosition += (12 * data.length)

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text("Delivery Challan", margin, yPosition);
        yPosition += 6;

        doc.autoTable({
            columns : columnsDC,
            body : dataDC,
            startY: yPosition,
            margin: { left: margin, right: margin },
            headStyles: { fillColor: [200, 200, 200] },
            columnStyles: {
                total: { halign: 'right' },
                pending_amount: { halign: 'right' },
            }
        })

        doc.save(`${customerName} Outstanding Report.pdf`)
    } 

    const handleInvoiceClose = () => {
        setinvoicePopup(false)
        dispatch(clearInvoiceTempAction([]))
     }

    const handleExcelDownload = () => {
        const customerName = customer_erp_details.length > 0 && props.type === 'Supplier' && customer_erp_details[0].payment_child.length > 0
                            ? customer_erp_details[0].payment_child[0].vendorName
                            : customerDetailById?.[0]?.company_name || customerDetailById?.[0]?.first_name || ''
                            
        const creditTotalForOpeningAmount = outstandingByCustomer?.invoiceOutstanding
            .filter(item => item.creditDebitSide === 'Cr.')
            .reduce((sum, item) => sum + parseFloat(item.total), 0)

        const debitTotalForOpeningAmount = outstandingByCustomer?.invoiceOutstanding
            .filter(item => item.creditDebitSide === 'Dr.')
            .reduce((sum, item) => sum + parseFloat(item.total), 0)

        const balanceForOpeningAmount = Math.abs(creditTotalForOpeningAmount - debitTotalForOpeningAmount).toFixed(2)
        const labelForOpeningAmount = creditTotalForOpeningAmount > debitTotalForOpeningAmount ? 'Cr.' : 'Dr.'
        const totalOpeningAmount = `${balanceForOpeningAmount} ${labelForOpeningAmount}`

        const creditTotalForPendingAmount = outstandingByCustomer?.invoiceOutstanding
            .filter(item => item.creditDebitSide === 'Cr.')
            .reduce((sum, item) => sum + parseFloat(item.pending_amount), 0)

        const debitTotalForPendingAmount = outstandingByCustomer?.invoiceOutstanding
            .filter(item => item.creditDebitSide === 'Dr.')
            .reduce((sum, item) => sum + parseFloat(item.pending_amount), 0)

        const balanceForPendingAmount = Math.abs(creditTotalForPendingAmount - debitTotalForPendingAmount).toFixed(2)
        const labelForPendingAmount = creditTotalForPendingAmount > debitTotalForPendingAmount ? 'Cr.' : 'Dr.'
        const totalPendingAmount = `${balanceForPendingAmount} ${labelForPendingAmount}`

        const creditTotalForOpeningAmountDC = outstandingByCustomer?.dcOutstanding
            .filter(item => item.creditDebitSide === 'Cr.')
            .reduce((sum, item) => sum + parseFloat(item.total), 0)

        const debitTotalForOpeningAmountDC = outstandingByCustomer?.dcOutstanding
            .filter(item => item.creditDebitSide === 'Dr.')
            .reduce((sum, item) => sum + parseFloat(item.total), 0)

        const balanceForOpeningAmountDC = Math.abs(creditTotalForOpeningAmountDC - debitTotalForOpeningAmountDC).toFixed(2)
        const labelForOpeningAmountDC = creditTotalForOpeningAmountDC > debitTotalForOpeningAmountDC ? 'Cr.' : 'Dr.'
        const totalOpeningAmountDC = `${balanceForOpeningAmountDC} ${labelForOpeningAmountDC}`

        const creditTotalForPendingAmountDC = outstandingByCustomer?.dcOutstanding
            .filter(item => item.creditDebitSide === 'Cr.')
            .reduce((sum, item) => sum + parseFloat(item.pending_amount), 0)

        const debitTotalForPendingAmountDC = outstandingByCustomer?.dcOutstanding
            .filter(item => item.creditDebitSide === 'Dr.')
            .reduce((sum, item) => sum + parseFloat(item.pending_amount), 0)

        const balanceForPendingAmountDC = Math.abs(creditTotalForPendingAmountDC - debitTotalForPendingAmountDC).toFixed(2)
        const labelForPendingAmountDC = creditTotalForPendingAmountDC > debitTotalForPendingAmountDC ? 'Cr.' : 'Dr.'
        const totalPendingAmountDC = `${balanceForPendingAmountDC} ${labelForPendingAmountDC}`

        const customer = customerDetailById?.[0] || {};
        const address = [customer.address, customer.area, customer.city, customer.state, customer.zip].filter(Boolean).join(', ')
        const name = customer.last_name ? customer.first_name + ' ' + customer.last_name : customer.first_name
        const phoneNumber = customer.phone_number
        const final = [name, phoneNumber].filter(Boolean).join(', ')

        const customerInfoRows = [
            [customerName, ""],
            [address || '', ""],
            [final || '', ""],
            []
        ]

        const tableHeader = [["Date","Cheque Bounce",  "Ref No.", "Opening Amount", "Due Amount", "Due On", "Due Days"]]
        const tableRows = outstandingByCustomer?.invoiceOutstanding.map(outstanding => ([
            moment(outstanding.invoice_date).format('DD/MM/YYYY'),
            outstanding.credit_note !== "" ? outstanding.credit_note : outstanding.invoice_number || outstanding.dc_number,
            outstanding.cheque_bounce_count === '0' || outstanding.cheque_bounce_count === '' || outstanding.cheque_bounce_count === undefined  ? '-' : `B${outstanding.cheque_bounce_count}`,
            // outstanding.credit_note ? outstanding.invoice_number || '' : '',
            `${outstanding.total} ${outstanding.creditDebitSide}`,
            `${outstanding.pending_amount} ${outstanding.creditDebitSide}`,
            outstanding.due_date ? moment(outstanding.due_date).format('DD/MM/YYYY') : '-',
            outstanding?.overdue_days || '-'
        ]))

        const tableHeaderDC = [["Date", "Ref No.", "Opening Amount", "Closing Amount"]]
        const tableRowsDC = outstandingByCustomer?.dcOutstanding.map(outstanding => ([
            moment(outstanding.invoice_date).format('DD/MM/YYYY'),
            outstanding.dc_number,
            `${outstanding.total} ${outstanding.creditDebitSide}`,
            `${outstanding.pending_amount} ${outstanding.creditDebitSide}`
        ]))

        tableRows.push([
            '',
            '',
            totalOpeningAmount,
            totalPendingAmount,
            '',
            ''
        ])

        tableRowsDC.push([
            '',
            '',
            totalOpeningAmountDC,
            totalPendingAmountDC,
            '',
            ''
        ])

        const finalSheetData = [
            ...customerInfoRows,
            ...tableHeader,
            ...tableRows,
            [''],
            ['Delivery Challan'],
            ...tableHeaderDC,
            ...tableRowsDC
        ]

        const worksheet = XLSX.utils.aoa_to_sheet(finalSheetData)
        const workbook = XLSX.utils.book_new()
        const sheetName = (customerName || 'Sheet1')
            .replace(/[\[\]\*\/\\\:\?]/g, '')
            .substring(0, 31);

        const fileName = `${customerName}.xlsx`; 
        XLSX.utils.book_append_sheet(workbook, worksheet,sheetName)

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
        const file = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        })
        saveAs(file, fileName)
    }

    const handleDownloadExcel = async () => {

        try {
            const locationId = headerLocationId ?? "null";
            const { data: blob, error } = await customFetch(
                API_URLS.GET_OUTSTANDING_SHARE_EXCEL(props.customer_id, locationId),
                'POST',
                {
                    type: typeParams,
                    from: filter.from === 'null' ? 'null' : moment(filter.from).format('YYYY/MM/DD'),
                    to: filter.to === 'null' ? 'null' : moment(filter.to).format('YYYY/MM/DD')
                },
                {
                    responseType: 'blob',
                    headers: {
                        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    },
                }
            );

            if (error) {
                console.error('Download error:', error);
                throw new Error('Download failed');
            }

            if (!blob) {
                console.error('No blob received');
                throw new Error('No data received');
            }

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `Outstanding_${new Date().toISOString().split("T")[ 0 ]}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Excel download error:", err);
            alert("Could not download Excel");
        }

    };


    const handleClickOpen = () => {
        // setDialogOpen(true)
        setAnchorEl(event.currentTarget);
    }

    const handleClickClose = () => {
        setDialogOpen(false)
    }

    const handleSend = () => {
        const invoiceOutstanding = outstandingByCustomer?.invoiceOutstanding || [];
        const dcOutstanding = outstandingByCustomer?.dcOutstanding || [];
        const customerDetails = outstandingByCustomer?.customerdetails?.[ 0 ] || {};

        const fromDate = moment().startOf('month').format("DD/MM/YYYY");
        const toDate = moment().endOf('month').format("DD/MM/YYYY"); 

        // Format Invoice Outstanding rows
        const invoiceData = invoiceOutstanding.map(row => ({
            invoice_date: moment(row.invoice_date).format("DD/MM/YYYY"),
            credit_note: row.credit_note || row.invoice_number || row.dc_number || "-",
            total: `${parseFloat(row.total || 0).toFixed(2)} ${row.creditDebitSide || ""}`,
            pending_amount: `${parseFloat(row.pending_amount || 0).toFixed(2)} ${row.creditDebitSide || ""}`,
            due_date: row.due_date ? moment(row.due_date).format("DD/MM/YYYY") : "-",
            overdue_days: row.overdue_days || "-"
        }));

        // Format Delivery Challan rows using same keys as columns
        const dcData = dcOutstanding.map(row => ({
            dc_date: moment(row.dc_date).format("DD/MM/YYYY"),
            dc_number: row.dc_number || "-",
            total: `${parseFloat(row.total || 0).toFixed(2)} ${row.creditDebitSide || ""}`,
            pending_amount: `${parseFloat(row.pending_amount || 0).toFixed(2)} ${row.creditDebitSide || ""}`,
            due_date: "-",
            overdue_days: "-"
        }));

        // Define shared columns
        const columns = [
            { name: "Date", key: "invoice_date" },
            { name: "Cheque Bounce", key: "cheque_bounce" },
            { name: "Ref No.", key: "credit_note" },
            { name: "Opening Amount", key: "total" },
            { name: "Due Amount", key: "pending_amount" },
            { name: "Due On", key: "due_date" },
            { name: "Due Days", key: "overdue_days" }
        ];

        const dccolumns = [
            { name: "Date", key: "dc_date" },
            { name: "Ref No.", key: "dc_number" },
            { name: "Opening Amount", key: "total" },
            { name: "Closing Amount", key: "pending_amount" }
        ];

        // Extract customer data
        const customerData = {
            company_name: customerDetails.company_name || "-",
            phone_number: customerDetails.phone_number || "-",
            address: [ customerDetails.address, customerDetails.area, customerDetails.city, customerDetails.state, customerDetails.zip ]
                .filter(Boolean)
                .join(", ") || "-"
        };

        // Calculate Invoice totals
        const invoiceCreditTotal = invoiceOutstanding
            .filter(item => item.creditDebitSide === 'Cr.')
            .reduce((sum, item) => sum + parseFloat(item.total || 0), 0);

        const invoiceDebitTotal = invoiceOutstanding
            .filter(item => item.creditDebitSide === 'Dr.')
            .reduce((sum, item) => sum + parseFloat(item.total || 0), 0);

        const invoiceOpeningBalance = Math.abs(invoiceCreditTotal - invoiceDebitTotal).toFixed(2);
        const invoiceOpeningLabel = invoiceCreditTotal > invoiceDebitTotal ? 'Cr.' : 'Dr.';

        const invoiceCreditPending = invoiceOutstanding
            .filter(item => item.creditDebitSide === 'Cr.')
            .reduce((sum, item) => sum + parseFloat(item.pending_amount || 0), 0);

        const invoiceDebitPending = invoiceOutstanding
            .filter(item => item.creditDebitSide === 'Dr.')
            .reduce((sum, item) => sum + parseFloat(item.pending_amount || 0), 0);

        const invoicePendingBalance = Math.abs(invoiceCreditPending - invoiceDebitPending).toFixed(2);
        const invoicePendingLabel = invoiceCreditPending > invoiceDebitPending ? 'Cr.' : 'Dr.';

        // Calculate DC totals (only if contactType !== 'Supplier')
        let dcOpeningBalance = "0.00", dcOpeningLabel = "Dr.";
        let dcPendingBalance = "0.00", dcPendingLabel = "Dr.";

        if (props.contactType !== 'Supplier') {
            const dcCreditTotal = dcOutstanding
                .filter(item => item.creditDebitSide === 'Cr.')
                .reduce((sum, item) => sum + parseFloat(item.total || 0), 0);

            const dcDebitTotal = dcOutstanding
                .filter(item => item.creditDebitSide === 'Dr.')
                .reduce((sum, item) => sum + parseFloat(item.total || 0), 0);

            dcOpeningBalance = Math.abs(dcCreditTotal - dcDebitTotal).toFixed(2);
            dcOpeningLabel = dcCreditTotal > dcDebitTotal ? 'Cr.' : 'Dr.';

            const dcCreditPending = dcOutstanding
                .filter(item => item.creditDebitSide === 'Cr.')
                .reduce((sum, item) => sum + parseFloat(item.pending_amount || 0), 0);

            const dcDebitPending = dcOutstanding
                .filter(item => item.creditDebitSide === 'Dr.')
                .reduce((sum, item) => sum + parseFloat(item.pending_amount || 0), 0);

            dcPendingBalance = Math.abs(dcCreditPending - dcDebitPending).toFixed(2);
            dcPendingLabel = dcCreditPending > dcDebitPending ? 'Cr.' : 'Dr.';
        }

        const typeParam = props.contactType === 'Customer' ? 'Customer' : 'Supplier';

        // Final payload
        const payload = {
            fromDate,
            toDate,
            reportName: customerDetails.company_name,
            customer: customerData,
            type:typeParam,
            sections: [
                {
                    title: "Invoice Outstanding",
                    columns,
                    data: invoiceData,
                    totals: {
                        opening: `${invoiceOpeningBalance} ${invoiceOpeningLabel}`,
                        pending: `${invoicePendingBalance} ${invoicePendingLabel}`
                    }
                },
                ...(props.contactType !== 'Supplier' ? [
                    {
                        title: "Delivery Challan",
                        columns: dccolumns,
                        data: dcData,
                        totals: {
                            opening: `${dcOpeningBalance} ${dcOpeningLabel}`,
                            pending: `${dcPendingBalance} ${dcPendingLabel}`
                        }
                }
                ] : [] )
            ],
            users: [
                {
                    phone: JSON.stringify([ { phone: customerDetails.phone_number} ])
                }
            ]
        };
   apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(shareOutstandingReportAction(payload)));
        setDialogOpen(false);
    };

    const reviveLayout = (obj) => {
        if (Array.isArray(obj)) {
            return obj.map(reviveLayout)
        }

        if (obj !== null && typeof obj === 'object') {
            return Object.fromEntries(
                Object.entries(obj).map(([ key, value ]) => {
                    return [ key, reviveLayout(value) ]
                })
            );
        }

        if (typeof obj === 'string' && /^\s*\(.*\)\s*=>/.test(obj)) {
            try {
                return eval(obj);
            } catch (e) {
                console.warn("Function eval failed:", obj);
                return obj;
            }
        }

        return obj
    }

    const handleDownload = async () => {
        try {
            const datas = {
                from: filter.from === 'null' ? 'null' : moment(filter.from).format('YYYY/MM/DD'),
                to: filter.to === 'null' ? 'null' : moment(filter.to).format('YYYY/MM/DD'),
                type: typeParams
            }
            const response = await customFetch(
            API_URLS.GET_OUTSTANDING_SHARE(props.customer_id, headerLocationId),
            'POST',
            datas
            );


             await apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(setInvoiceTempAction(response))
            )
            
            const base64 = response?.data?.pdfBase64
            const byteCharacters = atob(base64)
            const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i))
            const byteArray = new Uint8Array(byteNumbers)
            const blob = new Blob([ byteArray ], { type: 'application/pdf' })

            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${'Download'}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        }
        catch (err) {
            console.error('Download error:', err)
        }
    }

    const customer = [customerDetailById[0]?.address, customerDetailById[0]?.area, customerDetailById[0]?.city, customerDetailById[0]?.state, customerDetailById[0]?.country, customerDetailById[0]?.zip].filter(Boolean).join(', ') || ' '
    const vendor = [outstandingByCustomer?.customerdetails?.[0]?.address, outstandingByCustomer?.customerdetails?.[0]?.area, outstandingByCustomer?.customerdetails?.[0]?.city, outstandingByCustomer?.customerdetails?.[0]?.state, outstandingByCustomer?.customerdetails?.[0]?.country, outstandingByCustomer?.customerdetails?.[0]?.zip].filter(Boolean).join(', ') || ' '
    
    const customerPhoneAndEmail = [customerDetailById[0]?.phone_number, customerDetailById[0]?.email].filter(Boolean).join(', ') || ' '
    const vendorrPhoneAndEmail = [outstandingByCustomer?.customerdetails?.[0]?.phone_number, outstandingByCustomer?.customerdetails?.[0]?.email].filter(Boolean).join(', ') || ' '

    console.log(outstandingByCustomer,'checkbouncecount')

    return (
        <>
            <Card
                sx={{
                    width: '210mm',
                    minHeight: '297mm',
                    margin: 'auto',
                    padding: '10mm',
                    boxSizing: 'border-box',
                    backgroundColor: '#fff',
                    boxShadow: 'none !important',
                    display: 'flex',
                    flexDirection: 'column',
                    '@media print': {
                        margin: 0,
                        boxShadow: 'none',
                        pageBreakInside: 'avoid',
                    },
                }}
            >
                <Snackbar
                    open={error}
                    autoHideDuration={3000}
                    onClose={() => setError(false)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert
                        onClose={() => setError(false)}
                        severity="error"
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        Fill in both From and To dates.
                    </Alert>
                </Snackbar>
                    
    {/* <Dialog
                      fullWidth
                      maxWidth='xl'
                      open={invoicePopup}
                      aria-labelledby='alert-dialog-title'
                      aria-describedby='alert-dialog-description'
                    >
                      <DialogContent
                        // ref={(el) => (this.componentRef = el)}
                        style={{
                          display: "block",
                        }}
                        // className='tab_screen2'
                      >
                    

                      </DialogContent>
                      <DialogActions sx={{ mr: '50px', ml: '35px' }}>
                        <Button
                          variant='outlined'
                          onClick={(e) => {
                            setinvoicePopup(false)
                          }}
                        >
                          Close
                        </Button>
                      </DialogActions>
                    </Dialog> */}
                    { type === "CUSTOMER" && 
                    <InvoiceDialog
                    // appConfigData={appConfigData}
                    // custType={'CUSTOMER'}
                    // custData={invoiceData}
                    // invoice={invoiceData.invoice_number}
                    // soDate={invoiceData.soDate}
                    // shipTo={invoiceData.shipping_details}
                    // shipping_details={invoiceData.shipping_details}
                    // soNumber={invoiceData.so_number}
                    // sales_items={invoiceData.sales_items || []}
                    open={invoicePopup}
                    tableHandleClose={() => {}}
                    // posSale={true}
                    // note={invoiceData.note}
                    // handle_Einvoice={invoiceData.E_invoice}
                    // termsAndConditionsList={termsAndConditions}
                    // tcs={invoiceData?.tcs}
                    // tds={invoiceData?.tds}
                    // tcspercent={invoiceData?.tcspercent}
                    // tdspercent={invoiceData?.tdspercent}
                    // isRoundedOffNegative={invoiceData?.isRoundedOffNegative || 0}
                    // rounded_off={invoiceData?.rounded_off || 0}
                    // dc_number={invoiceData?.dc_number}
                    // E_invoice={invoiceData.E_invoice}
                     handleClose={handleInvoiceClose}
                    // pageType = {"TRANSACTIONS"}
                />
                //<CommonInvoiceTemplate/>
    }

                    <Grid container spacing={3}>
                        <Grid size={12}>
                        <Grid container spacing={1} direction="column">
                            <Grid>
                             <Grid container justifyContent="space-between" alignItems="center">
                                    <Grid>
                                        <Typography variant='h3' textAlign='left'>
                                            Outstanding Report
                                            {/* {customer_erp_details.length > 0 &&
                                                props.type === 'Supplier' &&
                                                customer_erp_details[0].payment_child.length > 0
                                                ? customer_erp_details[0].payment_child[0].vendorName
                                                : customerDetailById?.[0]?.company_name ||
                                                customerDetailById?.[0]?.first_name ||
                                                ''} */}
                                        </Typography>
                                    </Grid>
                                    <Grid display="flex" alignItems="center" gap={1}>
                                        <IconButton onClick={() => setFilterOpen(true)}>
                                            <FilterAltIcon />
                                        </IconButton>

                                        <Dialog
                                            open={filterOpen}
                                            onClose={() => setFilterOpen(false)}
                                            maxWidth='sm'
                                            fullWidth
                                        >
                                            <DialogContent>
                                                <Grid container spacing={3} justifyContent='center' sx={{ padding: 2 }}>
                                                    <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
                                                        <Autocomplete
                                                            options={rangeOptions}
                                                            value={rangeOption}
                                                            onChange={(event, newValue) => {
                                                                setRangeOption(newValue);
                                                                let startDate = null;
                                                                let endDate = null;
                                                                switch (newValue) {
                                                                    case 'Today':
                                                                        startDate = endDate = moment().startOf('day');
                                                                        break;
                                                                    case 'Yesterday':
                                                                        startDate = endDate = moment().subtract(1, 'day').startOf('day');
                                                                        break;
                                                                    case 'This Week':
                                                                        startDate = moment().startOf('week');
                                                                        endDate = moment().endOf('week');
                                                                        break;
                                                                    case 'Last Week':
                                                                        startDate = moment().subtract(1, 'week').startOf('week');
                                                                        endDate = moment().subtract(1, 'week').endOf('week');
                                                                        break;
                                                                    case 'Last 7 Days':
                                                                        startDate = moment().subtract(6, 'days').startOf('day');
                                                                        endDate = moment().endOf('day');
                                                                        break;
                                                                    case 'This Month':
                                                                        startDate = moment().startOf('month');
                                                                        endDate = moment().endOf('month');
                                                                        break;
                                                                    case 'Last Month':
                                                                        startDate = moment().subtract(1, 'month').startOf('month');
                                                                        endDate = moment().subtract(1, 'month').endOf('month');
                                                                        break;
                                                                    case 'This Quater':
                                                                        startDate = moment().startOf('quarter');
                                                                        endDate = moment().endOf('quarter');
                                                                        break;
                                                                    case 'Last Quater':
                                                                        startDate = moment().subtract(1, 'quarter').startOf('quarter');
                                                                        endDate = moment().subtract(1, 'quarter').endOf('quarter');
                                                                        break;
                                                                    case 'Current Fiscal Year':
                                                                        startDate = moment().month() >= 3
                                                                            ? moment().month(3).startOf('month')
                                                                            : moment().subtract(1, 'year').month(3).startOf('month');
                                                                        endDate = startDate.clone().add(1, 'year').subtract(1, 'day');
                                                                        break;
                                                                    case 'Previous Fiscal Year':
                                                                        startDate = moment().month() >= 3
                                                                            ? moment().subtract(1, 'year').month(3).startOf('month')
                                                                            : moment().subtract(2, 'year').month(3).startOf('month');
                                                                        endDate = startDate.clone().add(1, 'year').subtract(1, 'day');
                                                                        break;
                                                                    case 'Last 365 days':
                                                                        startDate = moment().subtract(364, 'days').startOf('day');
                                                                        endDate = moment().endOf('day');
                                                                        break;
                                                                    default:
                                                                        return;
                                                                }
                                                                setFromDate(startDate);
                                                                setToDate(endDate);
                                                            }}
                                                            renderInput={(params) => (
                                                                <TextField {...params} label="Select Range" fullWidth variant="outlined" />
                                                            )}
                                                        />
                                                    </Grid>
                                                    <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
                                                        <LocalizationProvider dateAdapter={DateAdapter}>
                                                            <DatePicker
                                                                label='From Date'
                                                                format='DD/MM/YYYY'
                                                                slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                                                                value={toMomentOrNull(fromDate)}
                                                                onChange={(date) => setFromDate(date)}
                                                            />
                                                        </LocalizationProvider>
                                                    </Grid>
                                                    <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
                                                        <LocalizationProvider dateAdapter={DateAdapter}>
                                                            <DatePicker
                                                                label='To Date'
                                                                format='DD/MM/YYYY'
                                                                slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                                                                value={toMomentOrNull(toDate)}
                                                                onChange={(date) => setToDate(date)}
                                                            />
                                                        </LocalizationProvider>
                                                    </Grid>
                                                    {error && (
                                                        <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
                                                            <Alert severity="error">Please select From Date and To Date</Alert>
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            </DialogContent>
                                            <DialogActions sx={{ justifyContent: 'flex-end', paddingBottom: 2 }}>
                                                <Button variant='contained' color='error' onClick={clearButton}>Clear</Button>
                                                <Button variant='contained' color='primary' onClick={ApplyButton}>Apply</Button>
                                            </DialogActions>
                                        </Dialog>

                                        <>
                                            <IconButton onClick={handleClick}>
                                                <FileDownloadIcon />
                                            </IconButton>
                                            
                                            <Menu
                                                anchorEl={anchorEl}
                                                open={openMenu && menuType === 'action'}
                                                onClose={handleClose}
                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                            >
                                                <MenuItem onClick={() => { handleDownload(), handleClose(); }}>
                                                    Export as PDF
                                                </MenuItem>
                                                <MenuItem onClick={() => { handleDownloadExcel(), handleClose(); }}>
                                                    Export as Excel
                                                </MenuItem>
                                            </Menu>

                                            <IconButton onClick={handleShareClick}>
                                                <ShareIcon />
                                            </IconButton>
                                            <Menu
                                                anchorEl={anchorEl}
                                                open={openMenu && menuType === 'share'}
                                                onClose={handleClose}
                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                            >
                                                <MenuItem onClick={() => { handleSend(); handleClose(); }}>
                                                    Whatsapp
                                                </MenuItem>
                                            </Menu>
                                        </>
                                    </Grid>
                                </Grid>
                            </Grid>
                            {/* <Grid>
                                <Typography sx={{ fontSize: '13px', fontWeight: '600' }}>
                                    {customer_erp_details.length > 0 &&
                                        props.type === 'Supplier' &&
                                        customer_erp_details[0].payment_child.length > 0
                                        ? customer_erp_details[0].payment_child[0].vendorName
                                        : customerDetailById?.[0]?.company_name ||
                                        customerDetailById?.[0]?.first_name ||
                                        ''}
                                </Typography>

                                <Typography>
                                    Bill-wise Details
                                </Typography>

                                <Typography>
                                    {filter.from === "null" ? "" : `${moment(filter.from).format('DD-MMM-YY')} to ${moment(filter.to).format('DD-MMM-YY')}`}
                                </Typography>
                            </Grid> */}

                   <Grid sx={{ textAlign: 'left' }}>
                                <Typography color='blue'>
                                    {props.type === 'Customer' ? customerDetailById[0]?.company_name : outstandingByCustomer?.customerdetails?.[0]?.company_name}
                                </Typography>
                                <Typography>
                                    {props.type === 'Customer' ? customer : vendor}
                                </Typography>

                                <Typography>
                                    {props.type === 'Customer' ? customerDetailById[0]?.company_gst || ' ' : outstandingByCustomer?.customerdetails?.[0]?.tax_id}
                                </Typography>

                                <Typography>
                                    {props.type === 'Customer' ? customerPhoneAndEmail : vendorrPhoneAndEmail}
                                </Typography>
                            </Grid>

                        </Grid>
                    </Grid>

                        <Grid size={12}>
                            <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', width: '15%' }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', width: '20%' }}>Ref No.</TableCell>
                                    {/* <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', width: '12%' }}>Created Against</TableCell> */}
                                    <TableCell align="right" sx={{ fontWeight: 600, whiteSpace: 'nowrap', width: '20%' }}>
                                        <Box sx={{ textAlign : 'right',whiteSpace: 'nowrap'}}>
                                                        Opening Amount
                                            </Box>
                                        </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600, whiteSpace: 'nowrap', width: '20%' }}>
                                        <Box sx={{ textAlign : 'right',whiteSpace: 'nowrap'}}>
                                                        Due Amount
                                            </Box>
                                        </TableCell>
                                    {/* <TableCell align="center" sx={{ fontWeight: 600, whiteSpace: 'nowrap', width: '20%' }}>
                                        <Box sx={{ textAlign : 'center',whiteSpace: 'nowrap'}}>
                                                        Due On
                                            </Box>
                                            </TableCell> */}
                                    <TableCell align="center" sx={{ fontWeight: 600, whiteSpace: 'nowrap', width: '15%' }}>Due Days</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {outstandingByCustomer?.invoiceOutstanding?.length > 0 ? (
                                    <>
                                        {outstandingByCustomer?.invoiceOutstanding?.map((outstanding) => {
                                              const isAdvance = outstanding.invoice_number === "Advance";
                                              const isopeningbalance = outstanding.invoice_number === 'OPENING BALANCE'
                                              return (
                                            <TableRow key={outstanding.sale_id} >
                                                <TableCell >
                                                    <Box sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                        {moment(outstanding.invoice_date).format('DD/MM/YYYY')}
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                    <span
                                                        style={{
                                                            textDecoration: 'none',
                                                            cursor: 'pointer',
                                                            color: '#03adfc',
                                                            display: 'inline-block',
                                                            padding: '5px',
                                                        }}
                                                        onClick={(e) => {
                                                            if (isAdvance) return;
                                                            if (isopeningbalance) return;
                                                            e.stopPropagation();
                                                            handleInvoiceData(outstanding.sale_id || outstanding.advance_id,outstanding, props.type === 'Customer' ? "CUSTOMER" : 'VENDOR');
                                                        }}
                                                    >
                                                        {outstanding.credit_note !== "" ? outstanding.credit_note : outstanding.invoice_number || outstanding.dc_number}
                                                    </span>
                                                    {outstanding.cheque_bounce_count === '0' || outstanding.cheque_bounce_count === '' || outstanding.cheque_bounce_count === null || outstanding.cheque_bounce_count === undefined
                                                    ? ''
                                                    : ` B${outstanding.cheque_bounce_count}`}
                                                </TableCell>
                                                {/* <TableCell align="right">
                                                    <Box sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                        {outstanding.credit_note ? outstanding.invoice_number || '' : ''}
                                                    </Box>
                                                </TableCell> */}
                                                <TableCell align="right">
                                                    <Box sx={{ textAlign : 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                        {outstanding.total} {outstanding.creditDebitSide}
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Box sx={{  textAlign : 'right',fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                        {outstanding.pending_amount} {outstanding.creditDebitSide}
                                                    </Box>
                                                </TableCell>
                                                {/* <TableCell>
                                                    <Box sx={{ textAlign : 'center', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                        {outstanding.due_date ? moment(outstanding.due_date).format('DD/MM/YYYY') : '-'}
                                                    </Box>
                                                </TableCell> */}
                                                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                    <Box sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                        {outstanding.overdue_days || '-'}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                            )
                                        })}
                                        <TableRow>
                                            <TableCell colSpan={2}></TableCell>
                                            <TableCell align="right">
                                                <Box sx={{  textAlign : 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                    {(() => {
                                                        const creditTotal = outstandingByCustomer?.invoiceOutstanding
                                                            .filter(item => item.creditDebitSide === 'Cr.')
                                                            .reduce((sum, item) => sum + parseFloat(item.total), 0);

                                                        const debitTotal = outstandingByCustomer?.invoiceOutstanding
                                                            .filter(item => item.creditDebitSide === 'Dr.')
                                                            .reduce((sum, item) => sum + parseFloat(item.total), 0);

                                                        const balance = Math.abs(creditTotal - debitTotal).toFixed(2);
                                                        const label = creditTotal > debitTotal ? 'Cr.' : 'Dr.';

                                                        return `${balance} ${label}`;
                                                    })()}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ textAlign : 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                    {(() => {
                                                        const creditTotal = outstandingByCustomer?.invoiceOutstanding
                                                            .filter(item => item.creditDebitSide === 'Cr.')
                                                            .reduce((sum, item) => sum + parseFloat(item.pending_amount), 0);

                                                        const debitTotal = outstandingByCustomer?.invoiceOutstanding
                                                            .filter(item => item.creditDebitSide === 'Dr.')
                                                            .reduce((sum, item) => sum + parseFloat(item.pending_amount), 0);

                                                        const balance = Math.abs(creditTotal - debitTotal).toFixed(2);
                                                        const label = creditTotal > debitTotal ? 'Cr.' : 'Dr.';

                                                        return `${balance} ${label}`;
                                                    })()}
                                                </Box>
                                            </TableCell>
                                            <TableCell colSpan={2}></TableCell>
                                        </TableRow>
                                    </>
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} sx={{ fontWeight: 600 }}>No Records</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>


                        </Grid>
                        
                        {
                            outstandingByCustomer?.dcOutstanding?.length > 0 && (
                                <>
                        <Grid size={12}>
                            <Typography variant="h6">Delivery Challan</Typography>
                        </Grid>

                        <Grid size={12}>
                            <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                                        <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', width: '15%' }}>
                                            Date
                                        </TableCell>
                                        {/* <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', width: '15%' }}>
                                            Cheque Bounce
                                        </TableCell> */}

                                        <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', width: '20%' }}>
                                            Ref No.
                                        </TableCell>

                                        <TableCell align="right" sx={{ fontWeight: 600, whiteSpace: 'nowrap', width: '20%' }}>
                                            <Box sx={{ textAlign : 'right',whiteSpace: 'nowrap'}}>
                                                Opening Amount
                                            </Box>
                                        </TableCell>

                                        <TableCell align="right" sx={{ fontWeight: 600, whiteSpace: 'nowrap', width: '20%' }}>
                                            <Box sx={{ textAlign : 'right',whiteSpace: 'nowrap'}}>
                                                {''}
                                            </Box>
                                        </TableCell>

                                        <TableCell align="center" sx={{ fontWeight: 600, whiteSpace: 'nowrap', width: '15%' }}>
                                            <Box sx={{ textAlign : 'center',whiteSpace: 'nowrap'}}>
                                                {''}
                                            </Box>
                                        </TableCell>
                                        
                                        <TableCell align="center" sx={{ fontWeight: 600, whiteSpace: 'nowrap', width: '20%' }}>
                                            Closing Amount
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {
                                        outstandingByCustomer?.dcOutstanding?.length > 0 ? (
                                            <>
                                                {
                                                    outstandingByCustomer?.dcOutstanding?.map((outstanding) => (
                                                        <TableRow key={outstanding.dc_id}>
                                                            <TableCell>
                                                                <Box sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                                    {moment(outstanding.dc_date).format('DD/MM/YYYY')}
                                                                </Box>
                                                            </TableCell>

                                                            <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                                <span
                                                                    style={{
                                                                        textDecoration: 'none',
                                                                        cursor: 'pointer',
                                                                        color: '#03adfc',
                                                                        display: 'inline-block',
                                                                        padding: '5px',
                                                                    }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleInvoiceData(outstanding.dc_id, outstanding, "CUSTOMER");
                                                                    }}
                                                                >
                                                                    {outstanding.dc_number}
                                                                </span>
                                                            </TableCell>

                                                            <TableCell align="right">
                                                                <Box sx={{ textAlign : 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                                    {outstanding.total} {outstanding.creditDebitSide}
                                                                </Box>
                                                            </TableCell>

                                                            <TableCell align="right">
                                                                <Box sx={{ textAlign : 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                                    {''}
                                                                </Box>
                                                            </TableCell>

                                                            <TableCell>
                                                                <Box sx={{ textAlign : 'center', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                                    {''}
                                                                </Box>
                                                            </TableCell>

                                                            <TableCell align="right" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                                <Box sx={{ fontWeight: 600, whiteSpace: 'nowrap', textAlign : 'right' }}>
                                                                    {outstanding.pending_amount} {outstanding.creditDebitSide}
                                                                </Box>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                }

                                                <TableRow>
                                                    <TableCell colSpan={2}></TableCell>
                                                    <TableCell align="right">
                                                        <Box sx={{  textAlign : 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                            {(() => {
                                                                const creditTotal = outstandingByCustomer?.dcOutstanding
                                                                    .filter(item => item.creditDebitSide === 'Cr.')
                                                                    .reduce((sum, item) => sum + parseFloat(item.total), 0);

                                                                const debitTotal = outstandingByCustomer?.dcOutstanding
                                                                    .filter(item => item.creditDebitSide === 'Dr.')
                                                                    .reduce((sum, item) => sum + parseFloat(item.total), 0);

                                                                const balance = Math.abs(creditTotal - debitTotal).toFixed(2);
                                                                const label = creditTotal > debitTotal ? 'Cr.' : 'Dr.';

                                                                return `${balance} ${label}`;
                                                            })()}
                                                        </Box>
                                                    </TableCell>
                                                    
                                                    <TableCell colSpan={2}></TableCell>

                                                    <TableCell align="right">
                                                        <Box sx={{  textAlign : 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                            {(() => {
                                                                const creditTotal = outstandingByCustomer?.dcOutstanding
                                                                    .filter(item => item.creditDebitSide === 'Cr.')
                                                                    .reduce((sum, item) => sum + parseFloat(item.pending_amount), 0);

                                                                const debitTotal = outstandingByCustomer?.dcOutstanding
                                                                    .filter(item => item.creditDebitSide === 'Dr.')
                                                                    .reduce((sum, item) => sum + parseFloat(item.pending_amount), 0);

                                                                const balance = Math.abs(creditTotal - debitTotal).toFixed(2);
                                                                const label = creditTotal > debitTotal ? 'Cr.' : 'Dr.';

                                                                return `${balance} ${label}`;
                                                            })()}
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            </>
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} sx={{ fontWeight: 600 }}>No Records</TableCell>
                                            </TableRow>
                                        )
                                    }
                                </TableBody>
                            </Table>
                        </Grid>
                        </>
                            )
                        }

                        {
                            outstandingByCustomer?.chequeBounce?.length > 0 && (
                                <>
                                    <Grid size={12}>
                                        <Typography variant='h6'>Cheque Bounces</Typography>
                                    </Grid>

                                    <Grid size={12}>
                                        <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', width: '15%' }}>Bounce Date</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', width: '15%' }}>Invoice #</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', width: '10%' }}>Amount</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', width: '20%' }}>Cheque No. & Bank</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', width: '15%' }}>Receipt Date</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', width: '15%' }}>Reason</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', width: '15%' }}>Bank Charges</TableCell>
                                                </TableRow>
                                            </TableHead>

                                            <TableBody>
                                                {
                                                    outstandingByCustomer?.chequeBounce?.length > 0 ? (
                                                        <>
                                                            {
                                                                outstandingByCustomer?.chequeBounce?.map(bounce => (
                                                                    <TableRow key={bounce.bounce_history_id}>
                                                                        <TableCell>
                                                                            <Box sx={{ fontWeight: 600, whiteSpace: 'nowrap'}}>
                                                                                {bounce.bounce_date ? moment(bounce.bounce_date).format('DD/MM/YYYY') : ''}
                                                                            </Box>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                              <Box sx={{ fontWeight: 600, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                                                                {bounce.invoice_number}
                                                                            </Box>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Box sx={{ fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'right'}}>
                                                                                {bounce.amount}
                                                                            </Box>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Box sx={{ fontWeight: 600, whiteSpace: 'nowrap'}}>
                                                                                {`${bounce?.chequeNumber ?? ''} ${bounce?.bankName ?? ''}`}
                                                                            </Box>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Box sx={{ fontWeight: 600, whiteSpace: 'nowrap'}}>
                                                                                {moment(bounce.receipt_date).format('DD/MM/YYYY')}
                                                                            </Box>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Box sx={{ fontWeight: 600, whiteSpace: 'nowrap'}}>
                                                                                {bounce?.bounce_reason ?? ''}
                                                                            </Box>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Box sx={{ fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'right'}}>
                                                                                {bounce?.bounce_charges ?? ''}
                                                                            </Box>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))
                                                            }
                                                        </>
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={7} sx={{ fontWeight: 600 }}>No Records</TableCell>
                                                        </TableRow>
                                                    )
                                                }
                                            </TableBody>
                                        </Table>
                                    </Grid>
                                </>
                            )
                        }
                    </Grid>
                             <Box
                                    sx={{
                                        height: '1px',
                                        backgroundColor: '#ccc',
                                        width: '100%',
                                        marginTop: 'auto',
                                    }}
                                />
                </Card>
            <ReceiptTempDialog 
                open={invoicePopup}
                handleClose={handleInvoiceClose}
                type='Bills'
                onClick={handleDownload}
            />
        </>
    );
}

CustomerOutstandings.propTypes = {
    customer_id: PropTypes.number,
    type: PropTypes.string
};

export default CustomerOutstandings;