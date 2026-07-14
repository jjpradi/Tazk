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
import { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { customerDetailByIdAction, listCustomerStatementAction } from 'redux/actions/customer_actions';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
// import { DatePicker } from '@mui/x-date-pickers';
// import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
// import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker,TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getAppConfigDataAction, getAppConfigDataBasedOnTypeAction } from 'redux/actions/app_config_actions';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getCompanyLogo } from 'redux/actions/company_actions';
import apiCalls from 'utils/apiCalls';
import { signal } from '@preact/signals-react';
import { ManualSalesPurchase } from 'redux/actions/manualNotes_actions'
import { clearInvoiceTempAction, getSupplierDetailsByIdreceivings_itemsAction, setInvoiceTempAction } from 'redux/actions/vendor_actions'
import ReceiptTempDialog from 'pages/sales/Receipt/ReceiptTemp'
import { useCustomFetch } from 'utils/useCustomFetch';
import API_URLS from '../../../utils/customFetchApiUrls';
import toMomentOrNull from '../../../utils/DateFixer';
import { useLocation } from 'react-router-dom';
import { getCustomerErpDetails } from 'redux/actions/erpDetails_actions';

const StatementOfAccount = (props) => {
    const dispatch = useDispatch();
    const customFetch = useCustomFetch()
    const { pathname } = useLocation()
    const storage = getsessionStorage();

    const {
        customerReducer: { Get_customer_statement, customerDetailById },
        erpDetailsReducer: { customer_erp_details },
        CompanyReducers: { company_logo },
        appConfigReducer: { app_config_data,app ,app_config_data_based_on_type}
    } = useSelector((state) => state);

    const [filter, setFilter] = useState(false);

    // const [fromDate, setFromDate] = useState(
    //   moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD'),
    // );
    // const [toDate, setToDate] = useState(
    //   moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD'),
    // );

    const currentDate = moment()
    const currentMonthStartDate = currentDate.clone().startOf('month').format('YYYY-MM-DD')
    const currentMonthEndDate = currentDate.clone().endOf('month').format('YYYY-MM-DD')

    let financialYearStartDate 
    let financialYearEndDate
    if(currentDate.month() >= 3){
        financialYearStartDate = currentDate.clone().month(3).startOf('month').format('YYYY-MM-DD')
        financialYearEndDate = currentDate.clone().add(1, 'year').month(2).endOf('month').format('YYYY-MM-DD')
    }
    else{
        financialYearStartDate = currentDate.clone().subtract(1, 'year').month(3).startOf('month').format('YYYY-MM-DD')
        financialYearEndDate = currentDate.clone().month(2).endOf('month').format('YYYY-MM-DD')
    }

    const initialFromDate = moment().startOf('month').format('YYYY-MM-DD');
    const initialToDate = moment().endOf('month').format('YYYY-MM-DD');

    const [fromDate, setFromDate] = useState(moment(financialYearStartDate, 'YYYY-MM-DD'));
    const [toDate, setToDate] = useState(moment(financialYearEndDate, 'YYYY-MM-DD'));

    // const statementFromDate = useMemo(() => signal(fromDate), []);
    // const statementToDate = useMemo(() => signal(toDate), []);
    
    // console.log(statementFromDate.value,statementToDate.value, "statementFromDate" )

    const [rangeOption, setRangeOption] = useState(null);
    const [invoiceOpen, setInvoiceOpen] = useState(false)

    // Define your options
    const rangeOptions = ['Today', 'Yesterday', 'This Week', 'Last Week', 'Last 7 Days', 'This Month', 'Last Month', 'This Quater', 'Last Quater', 'Current Fiscal Year', 'Previous Fiscal Year', 'Last 365 days']

    console.log(props.customer_id, 'datess666',props.type,'sdfsd',customer_erp_details)

    const handleSubmit = async () => {

        const formattedStart = moment(fromDate).format("YYYY-MM-DD");
        const formattedEnd = moment(toDate).format("YYYY-MM-DD");

        // statementFromDate.value = formattedStart;
        // statementToDate.value = formattedEnd;

        let payload = {}

        if(props.customerVendorLinked){
            if(props.type === 'Supplier'){
                payload = {
                    type: 'CustomerVendorLinked',
                    from: formattedStart,
                    to: formattedEnd,
                    supplier_id: props.supplier_id,
                    customer_id: props.customerVendorLinked,
                    location_id: headerLocationId || null
                }
            }
            else{
                payload = {
                    type: 'CustomerVendorLinked',
                    from: formattedStart,
                    to: formattedEnd,
                    supplier_id: props.customerVendorLinked,
                    customer_id: props.customer_id,
                    location_id: headerLocationId || null
                }
            }
        }
        else{
            payload = {
                type: props.type,
                from: formattedStart,
                to: formattedEnd,
                location_id: headerLocationId || null
            }
        }

        if (props.type === 'Supplier') {
            await apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(listCustomerStatementAction(props.supplier_id, payload)));
        } else {
            await apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(listCustomerStatementAction(props.customer_id, payload)));
        }
        setFilter(false);
    };

    const handleClear = async () => {

        const initialFromDate = moment().startOf('month').format('YYYY-MM-DD');
        const initialToDate = moment().endOf('month').format('YYYY-MM-DD');

        setFromDate(moment(financialYearStartDate, 'YYYY-MM-DD'));
        setToDate(moment(financialYearEndDate, 'YYYY-MM-DD'));

        // statementFromDate.value = initialFromDate;
        // statementToDate.value = initialToDate;
        setRangeOption(null)
        const fromDate = moment()
            .startOf('month')
            .format('YYYY-MM-DD');
        const toDate = moment()
            .endOf('month')
            .format('YYYY-MM-DD');

        let payload = {}

        if(props.customerVendorLinked){
            if(props.type === 'Supplier'){
                payload = {
                    type: 'CustomerVendorLinked',
                    from: financialYearStartDate,
                    to: financialYearEndDate,
                    supplier_id: props.supplier_id,
                    customer_id: props.customerVendorLinked,
                    location_id: headerLocationId || null
                }
            }
            else{
                payload = {
                    type: 'CustomerVendorLinked',
                    from: financialYearStartDate,
                    to: financialYearEndDate,
                    supplier_id: props.customerVendorLinked,
                    customer_id: props.customer_id,
                    location_id: headerLocationId || null
                }
            }
        }
        else{
            payload = {
                type: props.type,
                from: financialYearStartDate,
                to: financialYearEndDate,
                location_id: headerLocationId || null
            }
        }

        if (props.type === 'Supplier') {
            await apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(listCustomerStatementAction(props.supplier_id, payload)));
        } else {
            await apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(listCustomerStatementAction(props.customer_id, payload)));
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

    const configMap = app_config_data_based_on_type?.reduce((acc, item) => {
        acc[item.key_name] = item.value;
        return acc;
    }, {});

    const addressLine = [
        configMap?.["company.name"]
    ].filter(Boolean).join(", ");

    const addressLine1 = [
        configMap?.["address.fulladdress"],
        configMap?.["address.street"],
        configMap?.["address.city"],
        configMap?.["address.state"],
        configMap?.["address.pincode"],
        configMap?.["address.country"],
    ].filter(Boolean).join(", ");

    const addressLine2 = [
        configMap?.["company.mobile"],
        configMap?.["company.email"]
    ].filter(Boolean).join(", ");

    const addressLine3 = [
        configMap?.["company.gstin/uin"]
    ].filter(Boolean).join(", ");

    const handleExport = async () => {
        const formatAmount = (amount) =>
            `Rs. ${parseFloat(amount || 0).toFixed(2).padStart(10, " ")}`;
        const textMaxWidth = 120;

        const printWrapped = (text) => {
            if (!text) return;
            const wrapped = doc.splitTextToSize(text, textMaxWidth);
            doc.text(wrapped, margin, y);
            y += wrapped.length * 5;
        };
        const doc = new jsPDF("p", "mm", "a4");
        console.log(moment(fromDate).format('DD/MM/YYYY') + ' To ' + moment(toDate).format('DD/MM/YYYY'),'exportdoic')
        const margin = 10;
        const pageWidth = doc.internal.pageSize.getWidth();
        const usableWidth = pageWidth - margin * 2;
        const rightAlignX = pageWidth - margin;
        let y = 15;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        const isSupplier = props.type === 'Supplier';
        const statementFor = isSupplier ? "Vendor Statement for" : "Customer Statement for";
        const companyName = customerDetailById?.[0]?.company_name || customer_erp_details?.[0]?.companyDetailsDetails?.[0]?.vendorName || '';

        doc.text(`${statementFor} ${companyName}`, margin, y);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const generatedDate = moment().format('DD-MMM-YYYY');
        doc.text(generatedDate, rightAlignX, y, { align: "right" });
        y += 8;
        doc.setFont("helvetica", "bold");
        // doc.text("Sales-Creation", 160, 15);
        doc.setFont("helvetica", "normal");

        printWrapped(addressLine);
        printWrapped(addressLine1);
        printWrapped(addressLine2);
        printWrapped(addressLine3);
        y += 5;

        doc.setFont("helvetica", "bold");
        doc.text("To", margin, y); y += 5;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 255);

        const customer = isSupplier ? customer_erp_details[0].companyDetailsDetails[0] : (customerDetailById?.[0] || {});

        // Line 1: Name (Vendor or Company)
        const customerName = isSupplier
            ? customer.vendorName
            : customer.company_name || customer.first_name || '';

        doc.text(customerName, margin, y); y += 5;

        doc.setTextColor(0, 0, 0);

        const toAddressLine1 = [
            isSupplier ? customer.state : customer.address,
            isSupplier ? customer.area : customer.area,
            !isSupplier && customer.state
        ].filter(Boolean).join(', ');

        // Line 3: Country + ZIP/Pin
        const toAddressLine2 = [
            customer.country,
            !isSupplier && customer.zip
        ].filter(Boolean).join(', ');

        printWrapped(toAddressLine1);
        printWrapped(toAddressLine2);

        doc.setFont("helvetica", "bold");
        doc.text("Statement of Accounts",  rightAlignX, y - 10, { align: "right" });
        doc.setFont("helvetica", "normal");
        const dateRangeText = `${moment(fromDate).format('DD/MM/YYYY')} To ${moment(toDate).format('DD/MM/YYYY')}`;
        doc.text(dateRangeText, rightAlignX, y - 5, { align: "right" });

        y += 8;

        doc.setFillColor(200, 200, 200);
        const summaryX = margin + usableWidth * 0.5;
        doc.rect(summaryX, y, usableWidth * 0.5, 7, "F");
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("Account Summary", summaryX + 2, y + 5);

        y += 13;
        doc.setFont("helvetica", "normal");
        doc.text(`Opening Balance`, summaryX + 2, y);
        doc.text(formatAmount(Get_customer_statement?.openingBalance?.[0]?.openingBalance), rightAlignX, y, { align: "right" });
        y += 5;


        doc.text(`Total Debit`, summaryX + 2, y);
        doc.text(formatAmount(Get_customer_statement?.data?.reduce((a, b) => a + b.debit, 0) || "0.00"), rightAlignX, y, { align: "right" });
        y += 5;

        doc.text(`Total Credit`, summaryX + 2, y);
        doc.text(formatAmount(Get_customer_statement?.data?.reduce((a, b) => a + b.credit, 0) || "0.00"), rightAlignX, y, { align: "right" });
        y += 5;

        doc.text(`Closing Balance`, summaryX + 2, y);
        doc.text(formatAmount(Get_customer_statement?.closingBalance?.[0]
            ?.closingBalance || "0.00"), rightAlignX, y, { align: "right" });

        autoTable(doc, {
            startY: y + 10,
            margin: { left: margin, right: margin },
            head: [["Date", "Transaction", "Details", "Debit", "Credit"]],
            body: Get_customer_statement?.data?.length
                ? Get_customer_statement?.data.map((row) => [
                    // moment(row.date).format("DD/MM/YYYY"),
                    moment(row.date).format("DD/MM/YYYY") || " ",
                    // row.name || "-",
                    row.vch_type || " ",
                    // row.id || "-",
                     row.detail ? row.detail : " ",
                    row.debit ? formatAmount(row.debit) : " ",
                    row.credit ? formatAmount(row.credit) : " ",
                ])
                : [["No data available", "", "", "", "", ""]],
            theme: "grid",
            headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], },
            styles: { fontSize: 10 },
            columnStyles: {
                2: { cellWidth: 50 },
                3: { halign: 'right' },
                4: { halign: 'right' },
            },
        });

        const finalY = doc.lastAutoTable.finalY || y + 20;
        doc.setFont("helvetica");
        doc.text("Closing Balance", summaryX + 27, finalY + 10);
        doc.setFont("helvetica", "normal");
        doc.text(formatAmount(Get_customer_statement?.closingBalance?.[0]?.closingBalance || "0.00"), rightAlignX, finalY + 10, { align: "right" });
        const statementType = props.type === 'Supplier' ? 'Vendor_Statement' : 'Customer_Statement';
        doc.save(statementType);
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

    // console.log(props.type, 'customerReducer');



    useEffect(() => { (async () => {
        const date = new Date();
        let firstDay =
            date.getMonth() <= 2
                ? new Date(date.getFullYear() - 1, 3, 1)
                : new Date(date.getFullYear(), 3, 1);
        var lastDay = new Date();

        let payload = {}

        const formattedFrom = moment(fromDate).format('YYYY-MM-DD');
        const formattedTo = moment(toDate).format('YYYY-MM-DD');
        const custId = pathname === '/apps/CustomerStatements' ? storage.customer_id : props.type ? props.customer_id : '';
        const typeParams = pathname === '/apps/CustomerStatements' ? 'Customer' : props.type

        if(props.customerVendorLinked){
            if(props.type === 'Supplier'){
                payload = {
                    type: 'CustomerVendorLinked',
                    from: formattedFrom,
                    to: formattedTo,
                    supplier_id: props.supplier_id,
                    customer_id: props.customerVendorLinked,
                    location_id: headerLocationId || null
                }
            }
            else{
                payload = {
                    type: 'CustomerVendorLinked',
                    from: formattedFrom,
                    to: formattedTo,
                    supplier_id: props.customerVendorLinked,
                    customer_id: props.customer_id,
                    location_id: headerLocationId || null
                }
            }
        }
        else{
            payload = {
                type: typeParams,
                from: formattedFrom,
                to: formattedTo,
                location_id: headerLocationId || null
            }
        }

        if (props.type === 'Supplier') {
            await apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(listCustomerStatementAction(props.supplier_id, payload)));
        } else {
            await apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler, dispatch(listCustomerStatementAction(custId, payload)));
        }
    })();
}, [props.customer_id, props.supplier_id, headerLocationId]);

    useEffect(() => { (async () => {
        let type='sales'
        await apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(getCompanyLogo()))
            dispatch(getAppConfigDataBasedOnTypeAction(type));
    })();
}, []);

    useEffect(()=>{
    if(pathname === '/apps/CustomerStatements'){
        dispatch(getCustomerErpDetails(storage.customer_id,'Customer'))
    }
    },[])

    const particulars = (data) => {

        const obj = {
            ['Sales'](data) {
                if (data.vch_type === 'Sales Return') {
                    return data.paymentAgainst
                }
                return data.allTransactionParticular.filter(i => i.parentAccName === 'Sundry Debtors')[0]?.description || data.name
            },
            ['Credit Notes'](data) {

                if (data.vch_type === 'Sales Return') {
                    return data.paymentAgainst
                }
                return data.allTransactionParticular.filter(i => i.parentAccName === 'Sundry Debtors')[0]?.description || data.name

            },
            ['SGST Payable'](data) {
                if (['Purchase Return', 'Sales Return', 'POS Invoice'].includes(data.vch_type)) {
                    return data.paymentAgainst
                }
                return data.allTransactionParticular.filter(i => i.parentAccName === 'Sundry Debtors')[0]?.description || data.name
            },
            ['CGST Payable'](data) {
                if (['Purchase Return', 'Sales Return', 'POS Invoice'].includes(data.vch_type)) {
                    return data.paymentAgainst
                }
                return data.allTransactionParticular.filter(i => i.parentAccName === 'Sundry Debtors')[0]?.description || data.name
            },
            ['TCS Payable'](data) {
                if (['POS Invoice'].includes(data.vch_type)) {
                    return data.paymentAgainst
                }
                return data.allTransactionParticular.filter(i => i.parentAccName === 'Sundry Debtors')[0]?.description || data.name
            },
            ['IGST Payable'](data) {
                if (['Purchase Return', 'Sales Return', 'POS Invoice'].includes(data.vch_type)) {
                    return data.paymentAgainst
                }
                return data.allTransactionParticular.filter(i => i.parentAccName === 'Sundry Debtors')[0]?.description || data.name
            },
            ['Sundry Debtors'](data) {
                return data.allTransactionParticular.filter(i => ['Bank', 'Cash-in-hand'].includes(i.parentAccName))[0]?.accountName || data.name
            },
            ['Sundry Creditors'](data) {
                return data.vch_type === 'Purchase Invoice' ? 'Purchase' : 'Expense'
            },
            ['SGST Receivable'](data) {
                return data.allTransactionParticular.filter(i => i.parentAccName === 'Sundry Creditors')[0]?.accountName || data.name
            },
            ['CGST Receivable'](data) {
                return data.allTransactionParticular.filter(i => i.parentAccName === 'Sundry Creditors')[0]?.accountName || data.name
            },
            ['TCS Receivable'](data) {
                return data.allTransactionParticular.filter(i => i.parentAccName === 'Sundry Creditors')[0]?.accountName || data.name
            },
            ['IGST Receivable'](data) {
                return data.allTransactionParticular.filter(i => i.parentAccName === 'Sundry Creditors')[0]?.accountName || data.name
            },
            ['Cost of Goods Sold'](data) {
                return data.allTransactionParticular.filter(i => i.parentAccName === 'Sundry Debtors')[0]?.accountName || data.name
            },
            ['Bank'](data) {
                if (['POS Invoice'].includes(data.vch_type)) {
                    return data.paymentAgainst
                }
                return data.allTransactionParticular.filter(i => ['Sundry Debtors', 'Sundry Creditors'].includes(i.parentAccName))[0]?.accountName || data.name
            },
            ['Cash-in-hand'](data) {
                if (['Sales Payment', 'POS Invoice'].includes(data.vch_type)) {
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
            ['Stock'](data) {
                if (['Purchase Return', 'Sales Return', 'POS Invoice'].includes(data.vch_type)) {
                    return data.paymentAgainst
                }
                return data.allTransactionParticular.filter(i => ['Sundry Debtors', 'Sundry Creditors'].includes(i.parentAccName))[0]?.accountName || data.name
            },
            ['NEFT/UPI - Axis'](data) {
                if (['POS Invoice'].includes(data.vch_type)) {
                    return data.paymentAgainst
                }
                return data.allTransactionParticular.filter(i => ['Sales'].includes(i.parentAccName))[0]?.accountName || data.name
            },
            ['POS Sales'](data) {
                if (['POS Invoice'].includes(data.vch_type)) {
                    return data.paymentAgainst
                }
                return data.allTransactionParticular.filter(i => ['Sales'].includes(i.parentAccName))[0]?.accountName || data.name
            },
            ['Loans & Advances (Asset)'](data) {
                return data.allTransactionParticular.filter(i => ['Loans & Advances (Asset)'].includes(i.parentAccName))[0]?.accountName || data.name
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

        if (obj[data.name] !== undefined) {
            return obj[data.name](data)
        } else {
            if (data.allTransactionParticular.length === 2) return data.allTransactionParticular.filter(i => i.name !== data.name)[0]?.accountName || data.name
            if (data.vch_type === 'Pay(IN/OUT) Entry') return obj['Pay(IN/OUT) Entry'](data)
            if (data.ledgerType === 'Sundry Debtors') return obj['Sundry Debtors'](data)
            if (data.ledgerType === 'Sundry Creditors') return obj['Sundry Creditors'](data)
            if (data.ledgerType === 'Bank') return obj['Bank'](data)
            if (data.ledgerType === 'Cash-in-hand') return obj['Cash-in-hand'](data)
            if (data.ledgerType === 'Sales') return obj['POS Sales'](data)
            if (data.ledgerType === 'Loans & Advances (Asset)') return obj['Loans & Advances (Asset)'](data)
            return data.name;
        }

    };


    const vch_type = (val) => {
        const type = {
            'POS Invoice': 'Receipt',
            'Purchase Invoice': 'Purchase'
        }

        if (val.vch_type === 'Pay(IN/OUT) Entry') {
            if (val.debit === 0) {
                return 'PayOUT'
            } else {
                return 'PayIN'
            }
        }


        return type[val.vch_type] ? type[val.vch_type] : val.vch_type === 'Sales Payment' ? val.ledgerType === 'Advance Received' ? 'Advance Used' : 'Sales Receipt' : val.vch_type
    }

    const handleInvoiceData = async (rowData, type, specialNumber) => {
        const id = rowData.specialNumber
        const specialNumbers = rowData.specialNumber?.split(',') || []
        // const specialNumber = specialNumbers[index]?.trim()

        if(props.customerVendorLinked !== null) {
            if(rowData.vch_type === 'Credit Notes' || rowData.vch_type === 'Sales Return') {
                const return_id = rowData.vch_type === 'Sales Return' ? id : null
                const manual_id = rowData.vch_type === 'Sales Return' ? rowData.manualnote_id : id
                const creditNote = {
                    id: return_id,
                    type: 'C',
                    status: '4',
                    mn_id: manual_id
                }
                await dispatch(
                    ManualSalesPurchase(creditNote, (response) => {
                        if(response) {
                            dispatch(setInvoiceTempAction(response))
                        }
                    })
                )
                setInvoiceOpen(true)
            }
            else if(rowData.vch_type === 'Debit Notes' || rowData.vch_type === 'Purchase Return') {
                const return_id = rowData.vch_type === 'Purchase Return' ? id : null
                const manual_id = rowData.vch_type === 'Purchase Return' ? rowData.manualnote_id : id
                const debitNote = {
                    id: return_id,
                    type: 'D',
                    status: '4',
                    mc_id: manual_id,
                    sequence : rowData?.detail || null
                }

                await dispatch(
                    ManualSalesPurchase(debitNote, (response) => {
                        if(response) {
                            dispatch(setInvoiceTempAction(response))
                        }
                    })
                )
                setInvoiceOpen(true)
            }
            else if(rowData.vch_type === 'Advance Received' || rowData.vch_type === 'Sales Payment' || rowData.vch_type === 'Customer Advance Refund') {
                const receiptId = rowData.receipt_id 
                const type='Receipts'
                const { data } = await customFetch(
                        API_URLS.GET_RECEIPTS_BY_ID(receiptId, type),
                        'GET'
                    );
                await apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(setInvoiceTempAction(data))
                )
                setInvoiceOpen(true)
            }
            else if(rowData.vch_type === 'Advance Paid' || rowData.vch_type === 'Purchase Payment' || rowData.vch_type === 'Vendor Advance Refund') {
                const receiptId = rowData.receipt_id 
                const type = 'Payments'
                const { data } = await customFetch(
                      API_URLS.GET_RECEIPTS_BY_ID(receiptId, type),
                      'GET'
                    );
                await apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(setInvoiceTempAction(data))
                )
                setInvoiceOpen(true)
            }
            else if(rowData.vch_type === 'Purchase Invoice') {
                const bills = {
                    receiving_id: specialNumber
                }

                await apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(getSupplierDetailsByIdreceivings_itemsAction(type === 'Customer' ? props.customerVendorLinked : props.supplier_id, bills))
                )
                setInvoiceOpen(true)
            }
            else {
                const types = 'sales' 
                const poptype = 'invoice'
                const { data } = await customFetch(
                    API_URLS.GET_SALES_INVOICE_DETAILS(specialNumber, types, poptype), 'POST'
                )
                await apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(setInvoiceTempAction(data))
                )
                setInvoiceOpen(true)
            }
        }
        else if(type === 'Customer' && props.customerVendorLinked === null) {
            if(rowData.vch_type === 'Credit Notes' || rowData.vch_type === 'Sales Return') {
                const return_id = rowData.vch_type === 'Sales Return' ? id : null
                const manual_id = rowData.vch_type === 'Sales Return' ? rowData.manualnote_id : id
                const creditNote = {
                    id: return_id,
                    type: 'C',
                    status: '4',
                    mn_id: manual_id
                }

                await dispatch(
                    ManualSalesPurchase(creditNote, (response) => {
                        if(response) {
                            dispatch(setInvoiceTempAction(response))
                        }
                    })
                )
                setInvoiceOpen(true)
            }
            else if(rowData.vch_type === 'Sales Invoice') {
                const types = 'sales' 
                const poptype = 'invoice'
               const { data } = await customFetch(
                    API_URLS.GET_SALES_INVOICE_DETAILS(specialNumber, types, poptype), 'POST'
                );
             
                await apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(setInvoiceTempAction(data))
                )
                setInvoiceOpen(true)
            }
            else {
                const receiptId = rowData.receipt_id 
                const type='Receipts'
                const { data } = await customFetch(
                      API_URLS.GET_RECEIPTS_BY_ID(receiptId, type),
                      'GET'
                    );
                await apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(setInvoiceTempAction(data))
                )
                setInvoiceOpen(true)
            }
        }
        else {
            if(rowData.vch_type === 'Debit Notes' || rowData.vch_type === 'Purchase Return') {
                const return_id = rowData.vch_type === 'Purchase Return' ? id : null
                const manual_id = rowData.vch_type === 'Purchase Return' ? rowData.manualnote_id : id
                const debitNote = {
                    id: return_id,
                    type: 'D',
                    status: '4',
                    mc_id: manual_id,
                    sequence : rowData?.detail || null
                }

                await dispatch(
                    ManualSalesPurchase(debitNote, (response) => {
                        if(response) {
                            dispatch(setInvoiceTempAction(response))
                        }
                    })
                )
                setInvoiceOpen(true)
            }
            else if(rowData.vch_type === 'Purchase Invoice'){
                const bills = {
                    receiving_id: specialNumber
                }

                await apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(getSupplierDetailsByIdreceivings_itemsAction(props.supplier_id, bills))
                )
                setInvoiceOpen(true)
            }
            else {
                const receiptId = rowData.receipt_id 
                const type = 'Payments'
                const { data } = await customFetch(
                      API_URLS.GET_RECEIPTS_BY_ID(receiptId, type),
                      'GET'
                    );
                await apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(setInvoiceTempAction(data))
                )
                setInvoiceOpen(true)
            }
        }
    }

    const handleClose = () => {
        dispatch(clearInvoiceTempAction([]))
        setInvoiceOpen(false)
    }


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
                <Dialog
                    open={filter}
                    onClose={() => setFilter(false)}
                    maxWidth='sm'
                    fullWidth
                >
                    <DialogContent>
                        <Grid container spacing={3} justifyContent='center' sx={{ padding: 2 }}>

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
                                                startDate = moment().subtract(6, 'days').startOf('day'); // inclusive of today
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
                                                // Adjust fiscal year as needed (example: Apr 1 - Mar 31)
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

                                        setFromDate(startDate)
                                        setToDate(endDate)

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
                                        format='DD/MM/YYYY'
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                variant: 'outlined',
                                            },
                                        }}
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

                    <DialogActions sx={{ justifyContent: 'flex-end', paddingBottom: 2 }}>
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
                    sx={{ margin: 3, position: 'relative' }}
                >
                    <Grid display='flex' flexDirection='column' size="grow">
                        <Typography variant='h3' textAlign='left'>
                             {props.type === 'Supplier' ? 'Vendor Statement for ' : 'Customer Statement for '}
                            {customer_erp_details.length > 0 &&
                                props.type === 'Supplier'
                                ? customer_erp_details[0].companyDetailsDetails[0].vendorName
                                : customerDetailById?.[0]?.company_name || 
                                customerDetailById?.[0]?.first_name || customer_erp_details[0]?.companyDetailsDetails?.[0]?.company_name ||
                                ''}
                        </Typography>
                        {/* <Typography variant='body2'>
                            From {moment(fromDate, 'YYYY-MM-DD').format('DD/MM/YYYY')} To {moment(toDate, 'YYYY-MM-DD').format('DD/MM/YYYY')}
                        </Typography> */}
                    </Grid>

                    <Grid display={'flex'} sx={{ position: 'absolute', right: 50 }}>
                        <IconButton onClick={() => setFilter(true)} sx={{ mb: 1 }}>
                            <FilterAltIcon />
                        </IconButton>

                        <Tooltip
                            title='Export'
                            TransitionComponent={Fade}
                            TransitionProps={{ timeout: 600 }}
                            placement='top'
                        >
                            <IconButton onClick={() => handleExport()}>
                                <FileDownloadIcon />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>

                <Card sx={{ padding: 3, margin: '10px', boxShadow: 'none !important' }}>
                    <Grid container direction='column' spacing={2} paddingTop={4} justifyContent="flex-end">
                        <Grid>
                            <Grid container spacing={2} alignItems="flex-start">
                                {/* {company_logo[0]?.image ?
                                    <Grid sx={{ textAlign: 'left', paddingBottom: 2 }}>
                                        <label htmlFor="icon-button-file">
                                            <img
                                                style={{
                                                    width: '150px',
                                                    height: '100px',
                                                    objectFit: 'scale-down',
                                                }}
                                                src={company_logo ? company_logo[0]?.image : ''}
                                                alt="Company Logo"
                                            />
                                        </label>
                                    </Grid>
                                    : ''} */}

                                <Grid sx={{ textAlign: 'left' }}>
                                    <Typography variant='body1' fontWeight='bold'>
                                        {addressLine || " "}
                                    </Typography>
                                    <Typography>{addressLine1 || " "}</Typography>
                                    <Typography>{addressLine2 || " "}</Typography>
                                    <Typography>{addressLine3 || " "}</Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid container justifyContent="space-between" alignItems="flex-start" sx={{ marginTop: 10 }}>

                        <Grid>
                            <Typography variant='body1' fontWeight='bold'>
                                To
                            </Typography>
                            <Typography color='blue'>
                                {customer_erp_details.length > 0 &&
                                    props.type === 'Supplier' &&
                                    customer_erp_details[0].companyDetailsDetails.length > 0
                                    ? customer_erp_details[0].companyDetailsDetails[0].vendorName
                                    : customer_erp_details[0]?.companyDetailsDetails?.[0]?.vendorName ||
                                    customer_erp_details[0]?.companyDetailsDetails?.[0]?.company_name ||
                                    ''}
                            </Typography>
                            <Typography>
                                {[
                                    customer_erp_details.length > 0 &&
                                        props.type === 'Supplier' &&
                                        customer_erp_details[0].companyDetailsDetails.length > 0
                                        ? customer_erp_details[0].companyDetailsDetails[0].address
                                        : customer_erp_details[0]?.companyDetailsDetails?.[0]?.address,
                                    customer_erp_details.length > 0 &&
                                        props.type === 'Supplier' &&
                                        customer_erp_details[0].companyDetailsDetails.length > 0
                                        ? customer_erp_details[0].companyDetailsDetails[0].area
                                        : customer_erp_details[0]?.companyDetailsDetails?.[0]?.area,
                                    customer_erp_details.length > 0 &&
                                        props.type === 'Supplier' &&
                                        customer_erp_details[0].companyDetailsDetails.length > 0
                                        ? customer_erp_details[0].companyDetailsDetails[0].state
                                        : customer_erp_details[0]?.companyDetailsDetails?.[0]?.state
                                ]
                                    .filter(Boolean)
                                    .join(', ') || '-'}
                            </Typography>
                            <Typography>
                                {[
                                    customer_erp_details.length > 0 &&
                                        props.type === 'Supplier' &&
                                        customer_erp_details[0].companyDetailsDetails.length > 0
                                        ? customer_erp_details[0].companyDetailsDetails[0].country
                                        : customer_erp_details[0]?.companyDetailsDetails?.[0]?.country,
                                    customer_erp_details.length > 0 &&
                                        props.type === 'Supplier' &&
                                        customer_erp_details[0].companyDetailsDetails.length > 0
                                        ? customer_erp_details[0].companyDetailsDetails[0].zip
                                        : customer_erp_details[0]?.companyDetailsDetails?.[0]?.zip
                                ]
                                    .filter(Boolean)
                                    .join(', ') || '-'}
                            </Typography>
                        </Grid>
                        <Grid textAlign="right">
                            <Typography variant='h5' fontWeight='bold'>
                                Statement of Accounts
                            </Typography>
                            <Grid sx={{ width: 'fit-content' }}>
                                <hr style={{ width: '160px' }} />
                            </Grid>
                            <Typography variant='body2'>
                                {moment(fromDate).format('DD/MM/YYYY')} To {moment(toDate).format('DD/MM/YYYY')}
                            </Typography>
                            <Grid sx={{ width: 'fit-content' }}>
                                <hr style={{ width: '160px' }} />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid container justifyContent='flex-end'>
                        <TableContainer sx={{ marginTop: 2, maxWidth: '350px' }}>
                            <Table>
                                <TableBody>
                                    <TableRow sx={{ backgroundColor: '#d0d0d0', fontWeight: 'bold' }}>
                                        <TableCell colSpan={2}>
                                            <Typography
                                                sx={{
                                                    fontWeight: 'bold',
                                                    fontSize: '0.70rem',
                                                    color: '#000',
                                                }}
                                            >
                                                Account Summary
                                            </Typography>
                                        </TableCell>
                                        <TableCell
                                            sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                                        ></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Opening Balance</TableCell>
                                        <TableCell align='right'>
                                            <Box sx={{ textAlign: 'right' }}>
                                                ₹
                                                {
                                                    Get_customer_statement?.openingBalance?.[0]
                                                        ?.openingBalance.toFixed(2) || '0.00'
                                                }
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Total Debit</TableCell>
                                        <TableCell align='right'>
                                            <Box sx={{ textAlign: 'right' }}>
                                                {' '}
                                                {`${Get_customer_statement?.data?.length > 0
                                                    ? `₹ ${Get_customer_statement?.data?.reduce((a, b) => a + b.debit, 0).toFixed(2)}`
                                                    : '₹ 0.00'
                                                    }`}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Total Credit</TableCell>
                                        <TableCell align='right'>
                                            <Box sx={{ textAlign: 'right' }}>
                                                {' '}
                                                {`${Get_customer_statement?.data?.length > 0
                                                    ? `₹ ${Get_customer_statement?.data?.reduce((a, b) => a + b.credit, 0).toFixed(2)}`
                                                    : '₹ 0.00'
                                                    }`}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Closing Balance</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align='right'>
                                            <Box sx={{ textAlign: 'right' }}>
                                                ₹ {Get_customer_statement?.closingBalance?.length > 0 ? Get_customer_statement?.closingBalance[0]?.closingBalance.toFixed(2) : '₹ 0.00' || '₹ 0.00'}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>

                    <Grid container>
                        <TableContainer sx={{ marginTop: '20px' }}>
                            <Table>
                                <TableHead sx={{ backgroundColor: '#e0e0e0' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Transaction</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Details</TableCell>
                                        {/* <TableCell sx={{ fontWeight: 'bold' }}>Vch No</TableCell> */}
                                        {/* <TableCell sx={{ fontWeight: 'bold' }}>Receipt Number</TableCell> */}
                                        <TableCell sx={{ fontWeight: 'bold' }}>
                                            <Box sx={{ textAlign: 'right', width: '100%' }}>Debit</Box></TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>
                                            <Box sx={{ textAlign: 'right', width: '100%' }}>Credit</Box></TableCell>
                                    </TableRow>
                                </TableHead>
                                    <TableBody>
                                        {Get_customer_statement?.data?.length > 0 ? (
                                            Get_customer_statement.data.map((row, index) => {
                                                const details = row.detail?.split(',').map(d => d.trim()) || []
                                                let specialNumbers = row.specialNumber?.split(',').map(s => s.trim()) || []

                                                //Auto detect if specialNumbers need reversing ---
                                                if (details.length > 1 && specialNumbers.length > 1) {
                                                    const firstDetailNum = details[0].match(/\d+$/)?.[0] // extract trailing digits
                                                    const firstSpecial = specialNumbers[0]
                                                    const lastSpecial = specialNumbers[specialNumbers.length - 1]

                                                    if (
                                                        firstDetailNum &&
                                                        Math.abs(firstDetailNum - lastSpecial) < Math.abs(firstDetailNum - firstSpecial)
                                                    ) {
                                                        specialNumbers = specialNumbers.reverse()
                                                    }
                                                }

                                                return (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            {props.type === 'Supplier'
                                                                ? moment(row.date).format('DD/MM/YYYY')
                                                                : moment(row.date).format('DD/MM/YYYY')}
                                                        </TableCell>
                                                        <TableCell>{vch_type(row)}</TableCell>

                                                        <TableCell>
                                                            {details.map((detail, i) => {
                                                                const specialNumber = specialNumbers[i] || null

                                                                return (
                                                                    <span
                                                                        key={i}
                                                                        style={{
                                                                            textDecoration: 'none',
                                                                            cursor: vch_type(row) === 'Expenses Entry' ? 'default' : 'pointer',
                                                                            color: vch_type(row) === 'Expenses Entry' ? 'gray' : '#03adfc',
                                                                            display: 'inline-block',
                                                                            padding: '5px',
                                                                        }}
                                                                        onClick={(e) => {
                                                                            if (vch_type(row) === 'Expenses Entry') return
                                                                            e.stopPropagation()
                                                                            handleInvoiceData(row, props.type, specialNumber)
                                                                        }}
                                                                    >
                                                                        {detail}
                                                                        {i < details.length - 1 ? ',' : ''}
                                                                    </span>
                                                                )
                                                            })}
                                                        </TableCell>
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
                                                )
                                            })
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
                        <Box width="100%" mt={2} sx={{ textAlign: 'right' }}>
                            <Typography sx={{
                                // fontWeight: 'bold',
                                fontSize: '0.75rem',
                                color: '#000',
                            }} >
                                <Box component="span" paddingRight={5}>
                                    Closing Balance
                                </Box>{' '}
                                ₹
                                {Get_customer_statement?.closingBalance?.length > 0
                                    ? Number(Get_customer_statement.closingBalance[0]?.closingBalance || 0).toFixed(2)
                                    : '0.00'}
                            </Typography>
                        </Box>

                        {/* <Box width="100%" mt={10} sx={{ textAlign: 'right' }}>
                            <Tooltip
                                title="Export"
                                TransitionComponent={Fade}
                                TransitionProps={{ timeout: 600 }}
                                placement="top"
                            >
                                <Button
                                    onClick={handleExport}
                                    startIcon={<FileDownloadIcon />}
                                    variant="contained"
                                >
                                    Download
                                </Button>
                            </Tooltip>
                        </Box> */}

                    </Grid>
                </Card>
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
                open={invoiceOpen}
                handleClose={handleClose}
                type='Statement'
            />
        </>
    );
};

export default StatementOfAccount;
