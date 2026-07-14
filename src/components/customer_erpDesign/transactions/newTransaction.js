import { Accordion, AccordionDetails, Button, Card, Chip, Dialog, DialogActions, DialogContent, Grid, IconButton, Link, ListItem, ListItemText, Tab, Tabs, Typography } from "@mui/material";
import { useEffect, useState, useContext, useRef } from "react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from "@mui/material/styles";
import MuiAccordionSummary, {
  accordionSummaryClasses,
} from '@mui/material/AccordionSummary';
import { useDispatch, useSelector } from "react-redux";
import { getQuotationByCustomerAction } from "redux/actions/quotation_actions";
import { getExpensesByVendorAction } from "redux/actions/expense_actions";
import { getReceiptsByIdAction, getSaleOrderDeliveryChallanByCustomerAction, salesGetById, sendMail } from "redux/actions/sales_actions";
import { getPurchaseOrderByVendorAction, listPurchasesPaginateAction } from "redux/actions/purchase_actions";
import TransactionsTable from "./TransactionsTable";
import moment from "moment";
import { cellStyle, maxBodyHeight, maxHeight } from "utils/pageSize";
import { ManualSalesPurchase, recentCreditDebitNotesAction } from "redux/actions/manualNotes_actions";
import CreditDebitNoteTemplate from "pages/sales/manualNotes/creditDebitNoteTemplate";
import { customerSalesDetailAction, getbyidCustomerAction, listCustomerAction } from "redux/actions/customer_actions";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import apiCalls from 'utils/apiCalls';
import InvoiceDialog from '../../../pages/sales/sales/InvoiceDialog';
import { ListTermsAndConditionsAction } from "redux/actions/termsConditions_actions";
import { getAppConfigDataBasedOnTypeAction } from "redux/actions/app_config_actions";
import { useCustomFetch } from 'utils/useCustomFetch';
import { listStockLocationSequenceAction } from "redux/actions/stock_Location_actions";
import { getByIdMailConfigurationAction, getByIdSmsConfigurationAction } from "redux/actions/configuration_actions";
import Invoice from '../../../../src/pages/sales/sales/Invoice'
import QuotationTemp from "components/QuotationTemp";
import { useLocation, useNavigate } from "react-router-dom";
import CnDialog from '../../../../src/pages/sales/sales/cn_invoice/index';
import InfoOutlineIcon from '@mui/icons-material/InfoOutlined';
import CommonInvoiceTemplate from "pages/sales/CommonInvoiceTemp/CommonInvoiceTemplate";
import { getbyidVendorAction, getSupplierDetailsByIdreceivings_itemsAction, setInvoiceTempAction } from "redux/actions/vendor_actions";
import MailIcon from '@mui/icons-material/Mail';
import ProductTopCards from "components/erpDesign/SO/productTopOrder";
import PurchaseCard from "components/erpDesign/SO/billsRow";
import Status from "components/erpDesign/SO/status";
import PurchaseTable from "components/erpDesign/SO/purchaseTable";
import TimeLine from "components/erpDesign/SO/timeLine";
import CloseIcon from '@mui/icons-material/Close';
import ReceiptTempDialog from "pages/sales/Receipt/ReceiptTemp";
import dayjs from 'dayjs';
import TopOrder from '../../../components/erpDesign/PO/index';
import ProductTopCard from '../../../components/erpDesign/PO/productTopOrder';
import StatusCard from '../../../components/erpDesign/PO/status';
import PurchaseTablePO from '../../../components/erpDesign/PO/purchaseTable';
import TimeLinePO from '../../../components/erpDesign/PO/timeline'
import ReceiptsLanding from "pages/sales/Receipt/ReceiptsLanding";
import CreditNotesDetails from "pages/sales/manualNotes/CreditNotesDetails";
import BillsRow from "../../../components/erpDesign/PO/billsRow";
import DebitNotesDetails from "pages/sales/manualNotes/DebitNotesDetails";
import ExpensesDetails from "pages/accounts/Expenses/ExpensesDetails";
import QuotationDetailsPage from '../../../../src/pages/crm/Quotation/quotationDetailPage'
import API_URLS from "../../../utils/customFetchApiUrls";
import { individualPaymentDetails, individualPaymentDetailsAction } from "../../../redux/actions/sales_actions";

function NewTransactions(props) {

  const {
    setLoaderStatusHandler,
    setModalStatusHandler,
    setselectData,
    setModalTypeHandler,
    commoncookie,
    headerLocationId, } = useContext(CreateNewButtonContext);

  const AccordionSummary = styled((props) => (
    <MuiAccordionSummary
      expandIcon={<ExpandMoreIcon sx={{ fontSize: '0.9rem' }} />}
      {...props}
    />
  ))(({ theme }) => ({
    flexDirection: 'row-reverse',
    [`& .${accordionSummaryClasses.expandIconWrapper}`]:
    {
      transform: 'rotate(270deg)',
    },
    [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]:
    {
      transform: 'rotate(0deg)',
    },
    [`& .${accordionSummaryClasses.content}`]: {
      marginLeft: theme.spacing(1),
    },
  }));

  const poStatus = {
    New: '#1976d2',              // primary blue
    Open: '#9c27b0',             // secondary purple
    'Pending Payment': 'red', // warning orange
    'Pending Goods': 'red',
    Completed: '#2e7d32',        // success green
    'PO Created': '#3b81b3',
    'Billed': '#285c1c'
  };


  const dispatch = useDispatch()
  const navigate = useNavigate()
  const {
    quotationReducer: { quotationByCustomer },
    ExpenseReducer: { expensesByVendor, expensesCount },
    salesReducer: { saleOrderByCustomer, deliveryChallanByCustomer, customerPayments, receiptEntryData, searchSalesData, salesByPagination, salesInvoiceByCustomer, totalCount,individualPaymentDetails },
    purchasesReducer: { purchaseOrderByVendor, vendorPayments, purchaseBills, vendorTotalCount, purchasesByPagination },
    manualNoteReducer: { recentCreditDebitNotes, manualsalespurchase },
    customerReducer: { customer, customer_id_data },
    productReducer: { product },
    vendorReducer: { vendor_id_data, po_temp },
    appConfigReducer: { app_config_data_based_on_type, app_config_data },
    stockLocationReducer: { stocklocation },
    TermsConditionsReducers: { termsAndConditionsList },
    UserCreationReducer: { createUser },
    ConfigurationReducer: { mail_configuration },
    PriceListReducer: {price_list},
  } = useSelector(state => state)
  console.log(purchaseOrderByVendor, vendorPayments, purchaseBills, purchasesByPagination, "purchaseOrderByVendor")


  const [open, setOpen] = useState({
    invoices: false,
    customerPayments: false,
    quotes: false,
    salesOrders: false,
    deliveryChallans: false,
    creditNote: false,
    debitNote: false,
    expenses: false,
    purchaseOrder: false,
    purchaseBills: false,
    vendorPayments: false,
    receiptEntry: false
  })
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templateData, setTemplateData] = useState({});
  const [appConfigData, setAppConfigData] = useState({});
  const [onrowclick, setOnrowclick] = useState(true);
  const [pageSize, setPageSize] = useState(20)
  const [page, setPage] = useState(0)
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [openSale, setOpenSale] = useState(false);
  const [openDc, setOpenDc] = useState(false);
  const [openCn, setOpenCn] = useState(false);
  const [openDn, setOpenDn] = useState(false);
  const [OpenExp, setOpenExp] = useState(false);
  const [openPo, setOpenPo] = useState(false);
  const [openQuotation,setOpenQuotation] = useState(false);
  const [popUpdata, setPopupdata] = useState({
    invoice: '',
    custData: {},
    soDate: '',
    sales_items: [],
    Dopen: false,
    customer_id: '',
    sale_id: '',
    note: '',
    sales_payments: [],
    Einvoice:[]
  }); // invoice
  const ref1 = useRef(null);
  const [searchVal, setSearchVal] = useState('')
  const [invoicePopup, setinvoicePopup] = useState(false);
  const [invoiceData, setinvoiceData] = useState({});
  const [type, setType] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState([]);
  const [quotationData, setQuotationData] = useState([]);
  const [quotationOpen, setQuotationOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [receiptTempOpen, setReceiptTempOpen] = useState(false);
  const [billsOpen, setBillsOpen] = useState(false);
  const [index, setIndex] = useState('');
  const [recevingData, setRecevingData] = useState({});

  const display_data =
    purchasesByPagination?.length > 0
      ? purchasesByPagination.filter(
        (item) => item.supplier_id === props.customerData?.supplier_id
      )
      : [];

  const func1 = () => {
    if (display_data && display_data.length > 0) {
      setRecevingData(display_data[index]);
    }
  };

  ref1.current = func1;

  useEffect(() => {
    if (ref1.current) {
      ref1.current();
    }
  }, [purchasesByPagination, index]);

  useEffect(() => { (async () => {
    let type = 'sales'
    if (props.customer_id !== null && props.customer_id !== undefined && props.customer_id !== '') {
      if (props.customerType === 1 || props.customerType === 0) {
        const data = {
          customer_id: props.contactType === 'Customer' ? props.customer_id : null,
          supplier_id: props.contactType === 'Supplier' ? props.customer_id : null,
          pageCount: page || 0,
          numPerPage: pageSize || 0,
          searchString: ''
        };

        const payload = {
          customerId: props.customer_id,
          type: selectedTab,
          searchString: "",
          pageCount: page || 0,
          numPerPage: pageSize || 0
        }
        await apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(getAppConfigDataBasedOnTypeAction(type)),
          // dispatch(getbyidCustomerAction(props.customer)),
          // dispatch(ManualSalesPurchase()),
          // dispatch(listCustomerAction()),
          // dispatch(customerSalesDetailAction(props.customer_id, props.customerData?.employee_id)),
          // dispatch(getQuotationByCustomerAction(props.customer_id, page, pageSize))
          dispatch(getSaleOrderDeliveryChallanByCustomerAction(payload)),
           dispatch(individualPaymentDetailsAction())
          // dispatch(recentCreditDebitNotesAction(data))
        )
      }

      if (props.customerType === 2 && (selectedTab == 'vendorPayments' || selectedTab == 'purchaseOrder' || selectedTab == 'bills')) {
        await apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(getAppConfigDataBasedOnTypeAction(type)),
          // dispatch(getbyidCustomerAction()),
          // dispatch(getExpensesByVendorAction(props.customer_id)),
          dispatch(getPurchaseOrderByVendorAction({ vendorId: props.customer_id, type: selectedTab, pageCount: page || 0, numPerPage: pageSize || 0, searchString: '' })))
      }

      // if(props.customerType === 0 && selectedTab == 'paymentDetails'){
      //   console.log("akhskjanhs")
      //   await apiCalls(
      //     setModalTypeHandler,
      //     setLoaderStatusHandler,
      //     dispatch(individualPaymentDetails())
      //   )
      // }
    }
    getAppConfigData()
  })();
}, [props.customer_id, props.customerType])

  //   useEffect(() => {
  //     let openObj = {};
  // Array.isArray(salesInvoiceByCustomer)
  //     ? salesInvoiceByCustomer.filter(sale => sale.invoice_number !== null)
  //     : []
  //     openObj.invoices = props.customerType === 2 ? purchaseOrderByVendor?.length > 0 : Array.isArray(salesInvoiceByCustomer) && salesInvoiceByCustomer?.filter(sale => sale.invoice_number !== null)?.length > 0
  //     openObj.quotes = quotationByCustomer.data?.length > 0;
  //     openObj.expenses = expensesByVendor?.length > 0;
  //     openObj.salesOrders = saleOrderByCustomer?.length > 0;
  //     openObj.deliveryChallans = deliveryChallanByCustomer?.length > 0;
  //     openObj.purchaseOrder = purchaseOrderByVendor?.length > 0;
  //     openObj.customerPayments = customerPayments?.length > 0;
  //     openObj.vendorPayments = vendorPayments?.length > 0;
  //     openObj.creditNote = salesInvoiceByCustomer?.length > 0;
  //     openObj.debitNote = purchaseOrderByVendor?.length > 0;
  //     openObj.receiptEntry = receiptEntryData?.length > 0;

  //     setOpen((prev) => ({ ...prev, ...openObj }));
  //   }, [quotationByCustomer, expensesByVendor, saleOrderByCustomer, deliveryChallanByCustomer, purchaseOrderByVendor, customerPayments, vendorPayments, recentCreditDebitNotes, receiptEntryData,salesInvoiceByCustomer]);

  const handleToggle = (panel) => (event, isExpanded) => {
    setOpen((prev) => ({ ...prev, [panel]: isExpanded }))
  }
  const customFetch = useCustomFetch();

  const handleInvoiceData = async (id, type) => {
    console.log(type, 'saledata1')
    let getData;
    if (type === "VENDOR") {
      // const { data } = await customFetch(`/purchase/getPurchaseInvoiceById/${id}`, 'GET');
      // getData = data?.data[0]

      let receiving_id = {
        receiving_id: id
      }
      let po_id = {
        po_id: id
      }

      const purchaseId = selectedTab === 'bills' ? receiving_id : po_id
      await apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getSupplierDetailsByIdreceivings_itemsAction(props?.customer_id, purchaseId)))
    } else {
      const searchType = type === 'CUSTOMER' ? 'sales' : 'saleOrder'
      const invoiceType = type === 'CUSTOMER DC' ? 'deliveryChallan' : searchType
      const poptype = 'invoice'
      const { data } = await customFetch(
                API_URLS.GET_SALES_INVOICE_DETAILS(id, invoiceType,poptype),
                'POST'
            );
      console.log(data, 'datatype');
      await apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(setInvoiceTempAction(data)))
        const termsConditions = await customFetch(
                API_URLS.TERMS_CONDITIONS,
                'POST',
                { searchString: "" }
            );
      if (Array.isArray(termsConditions?.data)) {
        const termsAndConditions = termsConditions.data.filter(e => e.invoice_types === 'Sales')[0]?.terms_conditions || [];
        setTermsAndConditions(termsAndConditions);
      }

      if (Array.isArray(data) && data.length > 0) {
        getData = data[0];
      } else {
        getData = {};
      }

    }
    let receiving_id = id
    // dispatch(getSupplierDetailsByIdreceivings_itemsAction(id, { receiving_id }))
    setType(type === 'CUSTOMER SALEORDER' || type === 'CUSTOMER DC' ? 'CUSTOMER' : type)

    setinvoiceData(getData)

    setinvoicePopup(true);

  }

  const handlePosData = async (id, type) => {
    // console.log(type, 'saledata1')
    let getData;
      const invoiceType = 'PointOfSale'
      const poptype = 'invoice'
      const { data } = await customFetch(
                API_URLS.GET_SALES_INVOICE_DETAILS(id, invoiceType,poptype),
                'POST'
            );
      console.log(data, 'datatype');

      if(data.length){
        let finalData = data[0]
        const sales_items = await finalData.sales_items.map((d) => {
          return d;
        });

        const custData = {
          company_name: finalData.company_name,
          first_name: finalData.customer_name,
          city: finalData.city,
          email: finalData.email,
          state: finalData.state,
          area: finalData.area,
          phone_number: finalData.phone_number,
          tax_id: finalData.GST
        }
        getAppConfigData();
        await setPopupdata({
          invoice: finalData.invoice_number,
          custData: custData|| null,
          soDate: finalData.sale_time || null,
          sales_items: sales_items,
          Dopen: true,
          customer_id: finalData.customer_id,
          sale_id: finalData.sale_id,
          note: finalData?.note  || "",
          sales_payments: finalData?.sales_payments  || [],
        });

      }
  }



  const handleQuotationsData = async (data) => {
    const response = await customFetch(
      API_URLS.GET_QUOTATION_TEMPLATE(data.quotation_id),
      'GET'
    );

    await apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(setInvoiceTempAction(response.data))
    )
    setQuotationData(data)
    setQuotationOpen(true);
  }

  const invoiceFunction = async (data, saleDetailFromProps) => {
    console.log("data", data, saleDetailFromProps)
    console.log(saleDetailFromProps.customer_id, "qwerty")
    console.log(customer, "reducer")
    const custData = await customer.filter(
      (d) => saleDetailFromProps.customer_id === d.customer_id,
    );
    console.log(custData, "printttt")
    let sales_items;

    const salesResponse = await new Promise((resolve) => {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          salesGetById(saleDetailFromProps.sale_id, (response) => {
            console.log(response, "res")
            resolve(response);
          })
        )
      );
    });

    if (salesResponse.length) {
      sales_items = salesResponse[0]?.sales_items?.map((d) => {
        const taxes =
          product?.filter((t) => t.item_id === d.item_id)[0]?.taxes || [];
        d.taxes = taxes;
        return d;
      });
    }

    await setPopupdata({
      invoice: data.invoice_number,
      custData: custData[0] || null,
      soDate: data.sale_time || null,
      sales_items: sales_items,
      Dopen: true,
      customer_id: data.customer_id,
      sale_id: data.sale_id,
      note: saleDetailFromProps?.note || data.note || "",
      sales_payments: saleDetailFromProps?.sales_payments || data.sales_payments || [],
    });
  };

  const handleSmsMailConfiguration = async () => {
    const roleIdData = createUser.filter(f => f.employee_id === commoncookie)
    if (roleIdData.length > 0) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        await dispatch(getByIdMailConfigurationAction('Pos Sale', roleIdData[0]?.role_id)),
        await dispatch(getByIdSmsConfigurationAction('Pos Sale', roleIdData[0]?.role_id))
      );
    }
  }

  const createMail = () => {
    console.log(popUpdata, "popUpdata")
    const data = {
      custData: popUpdata.custData,
      invoice_number: popUpdata.invoice,
      sales_items: popUpdata.sales_items,
      email: popUpdata.custData.email,
      appConfigData: app_config_data_based_on_type,
    };
    dispatch(
      sendMail(data, () => { }, setModalTypeHandler, setLoaderStatusHandler),
    );
    setPopupdata({ ...popUpdata, Dopen: false });
  };

  const handleReceiptTempOpen = async (rowData, type) => {
    const id = rowData.receipt_id
    const { data } = await customFetch(
      API_URLS.GET_RECEIPTS_BY_ID(id, type),
      'GET'
    );
    await apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(setInvoiceTempAction(data))
    )
    setReceiptTempOpen(true)
  }

  const invoiceColumns = [
    {
      title: 'Invoice Number',
      field: 'invoice_number',
      render: (rowData) => (
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
            if(rowData.pos_session_id !== null){
               handlePosData(rowData.sale_id, "CUSTOMER");
               handleSmsMailConfiguration();
            }else{
              handleInvoiceData(rowData.sale_id, "CUSTOMER");
            }
           
          }}>
          {rowData.invoice_number}
        </span>
      ),
    },
    {
      title: 'Invoice Date',
      field: 'invoice_date',
    },
    {
      title: 'Billed Amount',
      field: 'total',
      render: (rowData) => (
        <div
          style={{
            textAlign: 'right',
            minWidth: '60px',
            maxWidth: '100px',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {rowData.total.toFixed(2)}
        </div>
      )
    },
    {
      title: 'Due Amount',
      field: 'due_amount',
      render: (rowData) => (
        <div
          style={{
            textAlign: 'right',
            minWidth: '60px',
            maxWidth: '100px',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {rowData.due_amount.toFixed(2)}
        </div>
      )
    },
    {
      title: 'Status',
      field: 'updated_label',
      render: (rowData) => (
        <div
          style={{
            color: rowData.updated_color || '#87CEFA',
            fontWeight: cellStyle?.fontWeight,
            fontSize: cellStyle?.fontSize,
          }}
        >
          {rowData.updated_label|| 'Delivered'}
        </div>
      ),
    },
    // {
    //   title: 'Delivery Status',
    //   field: 'delivery_label',
    //   render: (rowData) => (
    //     <div
    //       style={{
    //         color: rowData.delivery_color || '#87CEFA',
    //         fontWeight: cellStyle?.fontWeight,
    //         fontSize: cellStyle?.fontSize,
    //       }}
    //     >
    //       {rowData.delivery_label}
    //     </div>
    //   ),
    // },
    {
      title: 'Payment Status',
      field: 'payment_label',
      render: (rowData) => (
        <div
          style={{
            color: rowData.payment_color || '#87CEFA',
            fontWeight: cellStyle?.fontWeight,
            fontSize: cellStyle?.fontSize,
          }}
        >
          {rowData.payment_label}
        </div>
      ),
    }
    //     {
    //       title: 'Payment Status',
    //       field: 'status_label',
    //       render: (rowData) => {
    //   const customerType = props?.customer_type ?? null;

    //   if (customerType === 2) {
    //     return rowData.status;
    //   } else {
    //     return (
    //       <Chip
    //         color={rowData.status_color === 'default' ? 'primary' : rowData.status_color}
    //         label={rowData.status_label}
    //         style={rowData.status_color === 'default' ? { backgroundColor: 'grey', color: 'white' } : {}}
    //       />
    //     );
    //   }
    // }
    //       // render: (rowData) => {
    //       //   const customerType = props?.customer_type ?? null;

    //       //   if (customerType === 2) {
    //       //     return rowData.status;
    //       //   } else {
    //       //     if (rowData.status !== 7) {
    //       //       if (Math.round(+rowData.received_amount) >= Math.round(+rowData.total)) {
    //       //         return <Chip color='success' label='Completed' />;
    //       //       } else if (rowData.status >= 2) {
    //       //         return <Chip color='warning' label='Pending' />;
    //       //       } else {
    //       //         return <Chip color='warning' label='Pending' />;
    //       //       }
    //       //     } else {
    //       //       return (
    //       //         <Chip
    //       //           color='primary'
    //       //           style={{ backgroundColor: rowData.status === 7 ? 'grey' : '#11C15B' }}
    //       //           label={rowData.status_name}
    //       //         />
    //       //       );
    //       //     }
    //       //   }
    //       // }
    //     }

  ]

  const ReceiptColumns = [
    {
      title: 'Receipt Number',
      field: 'receipt_number'
    },
    {
      title: 'Receipt Date',
      field: 'receipt_date'
    },
    {
      title: 'Location',
      field: 'location_name'
    },
    {
      title: 'Amount',
      field: 'paid_amount'
    },

  ]

  const customerPaymentColumns = [
    {
      title: 'Receipt Date',
      field: 'receipt_date'
    },
    {
      title: 'Transaction Date',
      field: 'transactionDate',
    },
    {
      title: 'Receipt Number',
      field: 'receipt_number',
      render: (rowData) => (
        <div
          style={{
            textDecoration: 'none',
            cursor: 'pointer',
            color: '#03adfc',
            display: 'inline-block',
            padding: '5px'
          }}
          onClick={(e) => { e.stopPropagation(); handleReceiptTempOpen(rowData, 'Receipts') }}
        >
          {rowData.receipt_number}
        </div>
      )
    }, {
      title: 'Invoice Adjusted',
      field: 'invoice_adjusted'
    },
    {
      title: 'Amount',
      field: 'paid_amount',
      render: (rowData) => (
        <div
          style={{
            textAlign: 'right',
            minWidth: '60px',
            maxWidth: '80px',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {rowData.paid_amount}
        </div>
      )
    },
    {
      title: 'Reference',
      field: 'reference'
    },
    {
      title: 'Note',
      field: 'note'
    },
    {
      title: 'Location',
      field: 'location_name'
    }
  ]

  const individualPaymentDetailsColumn = [
    {
      title: 'Payment Date',
      field: 'invoice_date'
    },
    {
      title: 'Receipt Number',
      field: 'invoice_number'
    },
    {
      title: 'Product',
      field: 'product'
    },
    {
      title: 'Billed Amount',
      field: 'amount'
    },
    {
      title: 'Payment Mode',
      field: 'payment_mode'
    }
  ]

  const vendorPaymentColumns = [
    {
      title: 'Payment Date',
      field: 'receipt_date'
    },
    {
      title: 'Transaction Date',
      field: 'transactionDate'
    },
    {
      title: 'Receipt Number',
      field: 'receipt_number',
      render: (rowData) => (
        <div
          style={{
            textDecoration: 'none',
            cursor: 'pointer',
            color: '#03adfc',
            display: 'inline-block',
            padding: '5px'
          }}
          onClick={(e) =>{e.stopPropagation(); handleReceiptTempOpen(rowData, 'Payments')}}
        >
          {rowData.receipt_number}
        </div>
      )
    },
    {
      title: 'Amount',
      field: 'paid_amount',
      render: (rowData) => (
        <div
          style={{
            textAlign: 'right',
            minWidth: '60px',
            maxWidth: '80px',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {rowData.paid_amount}
        </div>
      )
    },
    {
      title: 'Reference',
      field: 'reference'
    },
    {
      title: 'Note',
      field: 'note'
    }
  ]

  const quotationColumns = [
    {
      title: 'Quotation Number',
      field: 'quotation_number',
      flex: 1,
      render: (rowData) => (
        <div
          style={{
            textDecoration: 'none',
            cursor: 'pointer',
            color: '#03adfc',
            display: 'inline-block',
            padding: '5px',
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleQuotationsData(rowData);
          }}
        >
          {rowData.quotation_number}
        </div>
      ),
    },
    {
      title: 'Quotation Date',
      field: 'quotation_date',
      render: (rowData) => {
        return moment(rowData.quotation_date).format('DD/MM/YYYY')
      },
      flex: 1,
    },
    {
      title: 'Contact Person',
      field: 'contactPersonFullName',
      flex: 1,
    },
    {
      title: 'Expiry',
      field: 'expiry',
      flex: 1,
    },
    {
      title: 'Total',
      field: 'total',
      // flex: 1,
      render: (rowData) => (
        <div
          style={{
            textAlign: 'right',
            minWidth: '60px',
            maxWidth: '80px',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {rowData.total.toFixed(2)}
        </div>
      )
    },
    {
      title: 'Status',
      field: 'status',
      flex: 1,
      render: (rowData) => {

        let color

        if (rowData.status === 'Approved') {
          color = 'green'
        }
        else if (rowData.status === 'Rejected') {
          color = 'red'
        }
        else {
          color = 'orange'
        }

        return (
          <Chip
            label={rowData.status}
            style={{ backgroundColor: color }}
          />
        )
      }
    }
  ]

  const saleOrderColumns = [
    {
      title: 'SO Date',
      field: 'so_date',
    },
    {
      title: 'SO Number',
      field: 'so_number',
      render: (rowData) => (
        <div
          style={{
            textDecoration: 'none',
            cursor: 'pointer',
            color: '#03adfc',
            display: 'inline-block',
            padding: '5px',
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleInvoiceData(rowData.order_id, "CUSTOMER SALEORDER");
          }}
        >
          {rowData.so_number}
        </div>
      ),
    },
    {
      title: 'Amount',
      field: 'total',
      render: (rowData) => (
        <div
          style={{
            textAlign: 'right',
            minWidth: '60px',
            maxWidth: '80px',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {rowData.total?.toFixed(2)}
        </div>
      )
    },
    {
      title: 'Status',
      field: 'sale_status',
      render: (rowData) => {
        const status = rowData.sale_status;
        const creditReturn = rowData?.creditReturn || 0;
        const converted = rowData?.updated_status === 15;
        const statusName = rowData?.sale_status_name;
        const approvalStatus = rowData?.status;

        // Determine display text
        let displayText = '';
        if (converted) {
          displayText = 'Invoiced';
        } else if (creditReturn > 0) {
          displayText = statusName;
        } else if (statusName === 'Send SO') {
          displayText = approvalStatus === 'Waiting Approval' ? 'Waiting Approval'
            : approvalStatus === 'Approved' ? 'Approved'
              : 'SO Created';
        } else if (statusName === 'Direct Challan') {
          displayText = 'Delivery Challan';
        } else {
          displayText = statusName;
        }

        // Determine color
        let textColor = '';
        if (converted) {
          textColor = '#285c1c';
        }
        else if (status === 7) {
          textColor = 'grey';
        }
        else if (status === 8) {
          textColor = '#87CEFA';
        } else if (creditReturn > 0) {
          textColor = '#d6c60f';
        } else if (status === 1) {
          textColor = approvalStatus === 'Waiting Approval' ? 'red'
            : approvalStatus === 'Approved' ? '#285c1c'
              : '#3b81b3';
        } else if (status === 5) {
          textColor = '#378c89';
        } else {
          textColor = '#285c1c';
        }

        return (
          <div
            style={{
              color: textColor,
              fontWeight: cellStyle.fontWeight,
              fontSize: cellStyle.fontSize,
            }}
          >
            {displayText}
          </div>
        );
      },
    }
    //     {
    //   title: 'Status',
    //   field: 'sale_status',
    //   render: (rowData) => {
    //     const status = rowData.sale_status;
    //     const creditReturn = rowData?.creditReturn || 0;
    //     const converted = rowData?.updated_status === 15;
    //     const statusName = rowData?.sale_status_name;
    //     const approvalStatus = rowData?.status;

    //     // Determine display text
    //     let displayText = '';
    //     if (converted) {
    //       displayText = 'Invoiced';
    //     } else if (creditReturn > 0) {
    //       displayText = statusName;
    //     } else if (statusName === 'Send SO') {
    //       displayText = approvalStatus === 'Waiting Approval' ? 'Waiting Approval'
    //         : approvalStatus === 'Approved' ? 'Approved'
    //         : 'SO Created';
    //     } else if (statusName === 'Direct Challan') {
    //       displayText = 'Delivery Challan';
    //     } else {
    //       displayText = statusName;
    //     }

    //     // Determine color
    //     let textColor = '';
    //     if (converted) {
    //       textColor = '#285c1c';
    //     } else if (status === 7) {
    //       textColor = 'grey';
    //     } else if (status === 8) {
    //       textColor = '#87CEFA';
    //     } else if (creditReturn > 0) {
    //       textColor = '#d6c60f';
    //     } else if (status === 1) {
    //       textColor = approvalStatus === 'Waiting Approval' ? 'red'
    //         : approvalStatus === 'Approved' ? '#285c1c'
    //         : '#3b81b3';
    //     } else if (status === 5) {
    //       textColor = '#378c89';
    //     } else {
    //       textColor = '#285c1c';
    //     }

    //     return (
    //       <div
    //         style={{
    //           color: textColor,
    //           fontWeight: 600,
    //           fontSize: '14px',
    //           fontFamily: 'Arial, sans-serif'
    //         }}
    //       >
    //         {displayText}
    //       </div>
    //     );
    //   },
    // }

  ]

  const purchaseBillsColumns = [
    {
      title: 'Bill Number',
      field: 'bill_number',
      render: (rowData) => (
        <div
          style={{
            textDecoration: 'none',
            cursor: 'pointer',
            color: '#03adfc',
            display: 'inline-block',
            padding: '5px'
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleInvoiceData(rowData.receiving_id, "VENDOR");
          }}
        >
          {rowData.bill_number}
        </div>
      ),
    },
    {
      title: 'Invoice Number',
      field: 'invoice_number'
    },
    {
      title: 'Bill Amount',
      field: 'total'
    },
    {
      title: 'Due Amount',
      field: 'due_amount'
    },
    {
      title: 'PO Date',
      field: 'invoice_date',
    },
    // {
    //   title: 'Payment Term',
    //   field: 'payment_type'
    // },
    {
      title: 'Location',
      field: 'location_name'
    },
    {
      title: 'Status',
      field: 'status',
      render: (rowData) => (
        <div
          style={{
            color: poStatus[rowData.status],
            fontWeight: cellStyle?.fontWeight,
            fontSize: cellStyle?.fontSize,
          }}
        >
          {rowData.status}
        </div>
      )
    }
  ]

  const purchaseOrderColumns = [
    {
      title: 'PO Number',
      field: 'po_number',
      render: (rowData) => (
        <div
          style={{
            textDecoration: 'none',
            cursor: 'pointer',
            color: '#03adfc',
            display: 'inline-block',
            padding: '5px'
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleInvoiceData(rowData.po_id, "VENDOR");
          }}
        >
          {rowData.po_number}
        </div>
      ),
    },
    {
      title: 'PO Date',
      field: 'po_date',
    },
    {
      title: 'Amount',
      field: 'total',
      render: (rowData) => (
        <div
          style={{
            textAlign: 'right',
            minWidth: '60px',
            maxWidth: '80px',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {rowData.total}
        </div>
      )
    },
    {
      title: 'Location',
      field: 'location_name'
    },
    {
      title: 'Status',
      field: 'status',
      render: (rowData) => (
        <div
          style={{
            color: poStatus[rowData.status],
            fontWeight: cellStyle?.fontWeight,
            fontSize: cellStyle?.fontSize,
          }}
        >
          {rowData.status}
        </div>
      )
    }




  ]

  const deliveryChallanColumns = [
    {
      title: 'DC Number',
      field: 'dc_number',
      render: (rowData) => (
        <div
          style={{
            textDecoration: 'none',
            cursor: 'pointer',
            color: '#03adfc',
            display: 'inline-block',
            padding: '5px'
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleInvoiceData(rowData.dc_id, "CUSTOMER DC");
          }}
        >
          {rowData.dc_number}
        </div>
      ),
    },
    {
      title: 'DC Date',
      field: 'invoice_date',
      render: rowData => {
        const date = rowData.invoice_date;
        return date ? dayjs(date).format('DD/MM/YYYY hh:mm A') : '';
      }
    },
    {
      title: 'Amount',
      field: 'total',
      render: (rowData) => (
        <div
          style={{
            textAlign: 'right',
            minWidth: '60px',
            maxWidth: '80px',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {rowData.total.toFixed(2)}
        </div>
      )
    },
    {
      title: 'Status',
      field: 'status_text',
      render: (rowData) => (
        <div
          style={{
            color: rowData.status_color || '#87CEFA',
            fontWeight: cellStyle?.fontWeight,
            fontSize: cellStyle?.fontSize,
          }}
        >
          {rowData.status_text}
        </div>
      ),
    },
    // {
    //   title: 'Delivery Status',
    //   field: 'delivery_label',
    //   render: (rowData) => (
    //     <div
    //       style={{
    //         color: rowData.delivery_color || '#87CEFA',
    //         fontWeight: cellStyle?.fontWeight,
    //         fontSize: cellStyle?.fontSize,
    //       }}
    //     >
    //       {rowData.delivery_label}
    //     </div>
    //   ),
    // }
    // {
    //   title: 'Payment Status',
    //   field: 'sale_status',
    //   render: (rowData) => rowData.sale_status !== 7 ?
    //     Math.round(+rowData.received_amount) >= Math.round(+rowData.total) ?
    //       <Chip color='success' label='Completed' />
    //       : rowData.sale_status >= 2 ?
    //         <Chip color='warning' label='Pending' />
    //         : <Chip color='warning' label='Pending' />
    //     : <Chip color='primary' style={{ backgroundColor: `${rowData.sale_status === 7 ? 'grey' : '#11C15B'}` }} label={rowData.status} />
    // }
  ]

  const debitCreditNotesColumns = [
    {
      title: 'Date',
      field: 'created_at'
    },
    {
      title: 'CN/DN No.',
      field: 'sequence_number',
      render: (rowData) => (
        <Link>
          <ListItem>
            <ListItemText
              onClick={(event) => {
                let dataCN = {
                  id: rowData.return_id,
                  type: rowData.type || '',
                  status: rowData.sale_status || null,
                  mn_id: rowData?.id || '',
                }
                let dataDN = {
                  id: rowData.return_id,
                  type: rowData.type || '',
                  status: rowData.sale_status || null,
                  mc_id: rowData?.id || '',
                  sequence: rowData?.sequence_number || null
                }

                const data = rowData.type === 'C' ? dataCN : dataDN

                apiCalls(
                  setModalTypeHandler,
                  setLoaderStatusHandler,
                  !customer_id_data?.length && dispatch(getbyidCustomerAction(rowData.customer_id)),
                  dispatch(ManualSalesPurchase(data, (response) => {
                    if (response) {
                      dispatch(setInvoiceTempAction(response))
                      setTemplateOpen(true);
                    }
                  })));
                setTemplateData(rowData);
                event.stopPropagation();
              }}
              style={{
                textDecoration: 'none',
                cursor: 'pointer',
                color: '#03adfc',
                display: 'inline-block',
                padding: '5px',
              }}
            >
              {rowData.sequence_number}
            </ListItemText>
          </ListItem>
        </Link>
      ),
    },
    {
      title: 'Description',
      field: 'description'
    },
    {
      title: 'Type',
      field: 'type',
      render: (rowData) => (rowData.invoice_number !== '' && rowData.invoice_number !== null ? rowData.type === 'C' ? 'Sales Return' : 'Purchase Return' : rowData.type === 'C' ? 'Manual Credit Note' : 'Manual Debit Note'),
    },
    {
      title: 'Opening Balance',
      field: 'amount',
      cellStyle: {
        textAlign: 'right',
        paddingRight: '150px',
        fontSize: cellStyle.fontSize,
      },
      render: (rowData) => (
        <div
          style={{
            textAlign: 'right',
            minWidth: '60px',
            maxWidth: '80px',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {rowData.amount != null ? rowData.amount.toFixed(2) : '0.00'}
        </div>
      )
    },
    {
      title: 'Closing Balance',
      field: 'balance_amount',
      cellStyle: {
        textAlign: 'right',
        paddingRight: '150px',
        fontSize: cellStyle.fontSize,
      },
      render: (rowData) => (
        <div
          style={{
            textAlign: 'right',
            minWidth: '60px',
            maxWidth: '80px',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {rowData.balance_amount != null ? rowData.balance_amount.toFixed(2) : '0.00'}
        </div>
      )
    },
    {
      title: 'Amount',
      field: 'amount',
      cellStyle: {
        textAlign: 'right',
        paddingRight: '150px',
        fontSize: cellStyle.fontSize,
      },
      render: (rowData) => (
        <div
          style={{
            textAlign: 'right',
            minWidth: '60px',
            maxWidth: '80px',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {rowData.amount?.toFixed(2)}
        </div>
      )
    },
  ]

  const expenseColumns = [
    {
      title: 'Date',
      field: 'date',
      render: (rowData) => moment(rowData.date).format("DD/MM/yyyy")
    },
    { title: 'Invoice Number', field: 'invoice_number' },
    { title: 'Type', field: 'type' },
    {
      title: 'Input Gst',
      field: 'gst_amount',
      render: (rowData) => (
        <div
          style={{
            textAlign: 'right',
            minWidth: '60px',
            maxWidth: '80px',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {parseFloat(rowData.gst_amount).toFixed(2)}
        </div>
      )
    },
    {
      title: 'Amount',
      field: 'amount',
      // cellStyle: { textAlign: 'right', paddingRight: '70px', fontSize: cellStyle.fontSize },
      render: (rowData) => (
        <div
          style={{
            textAlign: 'right',
            minWidth: '60px',
            maxWidth: '80px',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {parseFloat(rowData.amount).toFixed(2)}
        </div>
      )
    },
    {
      title: 'Total Amount',
      field: 'total_amount',
      // cellStyle: { textAlign: 'right', paddingRight: '60px', fontSize: cellStyle.fontSize },
      render: (rowData) => (
        <div
          style={{
            textAlign: 'right',
            minWidth: '60px',
            maxWidth: '80px',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {parseFloat(rowData.total_amount).toFixed(2)}
        </div>
      )
    },
    {
      title: 'Payment Status',
      field: 'status',
      cellStyle: { fontSize: cellStyle.fontSize },
      render: (rowData) =>
        rowData.status === 'Completed' ?
          (
            <Chip color='success' label={<Typography variant='h1'>Completed</Typography>} />
          ) : (
            <Chip
              sx={{ width: 88.43 }}
              label={<Typography variant='h1'>Pending</Typography>}
              color='warning'
            />
          )
    }
  ]

  const getAppConfigData = () => {
    const appConfigData = app_config_data_based_on_type;
    const companyName = appConfigData.filter((f) => f.key_name == 'company.name');
    const fullAddress = appConfigData.filter(
      (f) => f.key_name == 'address.fulladdress',
    );
    const emailData = appConfigData.filter((f) => f.key_name == 'company.email');
    const gstinData = appConfigData.filter(
      (f) => f.key_name == 'company.gstin/uin',
    );
    const companyMobile = appConfigData.filter(
      (f) => f.key_name == 'company.mobile',
    );
    const state = appConfigData.filter((f) => f.key_name == 'address.state');
    setAppConfigData({
      companyName: companyName.length > 0 ? companyName[0].value : '',
      companyAddress: fullAddress.length > 0 ? fullAddress[0].value : '',
      companyEmail: emailData.length > 0 ? emailData[0].value : '',
      gstin: gstinData.length > 0 ? gstinData[0].value : '',
      companyMobile: companyMobile.length > 0 ? companyMobile[0].value : '',
      state: state.length > 0 ? state[0].value : '',
    })
  };

  const handleInvoiceClose = () => {
    setinvoicePopup(false)
  }
  const reviveLayout = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(reviveLayout);
    }
    if (obj !== null && typeof obj === 'object') {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => {
          return [key, reviveLayout(value)];
        })
      );
    }
    if (typeof obj === 'string' && obj.trim().startsWith('(') && obj.includes('=>')) {
      return eval(`(${obj})`);
    }
    return obj;
  }
  const handlePrint = () => {
    try {
      const base64 = po_temp.pdfBase64

      const byteChars = atob(base64)
      const byteNumbers = new Array(byteChars.length)

      for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i)
      }

      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })

      const blobUrl = URL.createObjectURL(blob)

      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = blobUrl
      document.body.appendChild(iframe)

      iframe.onload = () => {
        iframe.contentWindow.focus()
        iframe.contentWindow.print()
      }
    }
    catch (err) {
      console.error('Print error:', err)
    }
    // try {
    //   pdfMake.fonts = {
    //     Poppins: {
    //       normal: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Regular.ttf',
    //       bold: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Bold.ttf',
    //       italics: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Italic.ttf',
    //       bolditalics: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-BoldItalic.ttf'
    //     }
    //   }
    //   let data = reviveLayout(po_temp)
    //   pdfMake.createPdf(data).getBase64((base64Pdf) => {
    //     function base64ToBlob(base64, mimeType) {
    //       const byteChars = atob(base64);
    //       const byteNumbers = new Array(byteChars.length);
    //       for (let i = 0; i < byteChars.length; i++) {
    //         byteNumbers[i] = byteChars.charCodeAt(i);
    //       }
    //       const byteArray = new Uint8Array(byteNumbers);
    //       return new Blob([byteArray], { type: mimeType });
    //     }

    //     const pdfBlob = base64ToBlob(base64Pdf, 'application/pdf');
    //     const blobUrl = URL.createObjectURL(pdfBlob);

    //     const iframe = document.createElement('iframe');
    //     iframe.style.display = 'none';
    //     iframe.src = blobUrl;
    //     document.body.appendChild(iframe);

    //     iframe.onload = () => {
    //       iframe.contentWindow.focus();
    //       iframe.contentWindow.print();
    //     };
    //   });
    // } catch (err) {
    //   return err
    // }
  }
  const handleDownload = () => {
    try {
      const base64 = po_temp.pdfBase64

      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i))
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })

      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-')

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Invoice${timestamp}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
    catch (err) {
      console.error('Download error:', err)
    }
    // try {
    //   pdfMake.fonts = {
    //     Poppins: {
    //       normal: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Regular.ttf',
    //       bold: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Bold.ttf',
    //       italics: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Italic.ttf',
    //       bolditalics: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-BoldItalic.ttf'
    //     }
    //   }
    //   let data = reviveLayout(po_temp)
    //   const now = new Date();
    //   const timestamp = now.toISOString().replace(/[:.]/g, '-'); // Format: 2025-05-20T12-30-15-123Z
    //   const fileName = `PO-${timestamp}.pdf`;
    //   pdfMake.createPdf(data).download(fileName)
    // } catch (err) {
    //   return err
    // }
  }
  const tabData = {
    invoice: invoiceColumns,
    receipt: ReceiptColumns,
    customerPayment: customerPaymentColumns,
    vendorPayments: vendorPaymentColumns,
    quotation: quotationColumns,
    saleOrder: saleOrderColumns,
    purchaseOrder: purchaseOrderColumns,
    purchaseBills: purchaseBillsColumns,
    deliveryChallan: deliveryChallanColumns,
    CreditNotes: debitCreditNotesColumns,
    paymentDetails:individualPaymentDetailsColumn
  };
  const tabHeadings = props.customerType === 1 || props.customerType === 0 ?
    [(props.customerType === 1 || props.customerType === 0) && 'invoice', (props.customerType === 1 && 'saleOrder'), props.customerType === 1 && 'deliveryChallan', ((props.customerType === 1 ) && 'customerReceipts'), ((props.customerType === 0 ) && 'paymentDetails'), (props.customerType === 1) && 'CreditNotes', props.customerType === 1 && 'quotation'].filter(Boolean) :
    [(props.customerType === 2 && 'vendorPayments'), (props.customerType === 2 && 'purchaseOrder'), (props.customerType === 2 && 'bills'), props.customerType === 2 && 'debitNote', props.customerType === 2 && 'expenses'].filter(Boolean);

  const getColumns = (data) =>
    data?.length > 0
      ? Object.keys(data[0]).map((key) => ({
        field: key,
        headerName: key.toUpperCase(),
        flex: 1,
      }))
      : [];
  const [selectedTab, setSelectedTab] = useState(tabHeadings[0]);
  const currentTab = tabHeadings[selectedTab];
  const rows = tabData[currentTab];
  const columns = getColumns(rows);
  const searchDebounceRef = useRef(null);

  useEffect(() => {
    if (selectedTab === 'purchaseOrder' || selectedTab === 'bills') {
      const data = {
        brand: '',
        category: '',
        location_id: headerLocationId,
        statusfilter: '',
        max_price: '',
        min_price: '',
        product_name: '',
        from: null,
        to: null,
        user_id: commoncookie,
        supplier_id: [props.customerData?.supplier_id],
        pageCount: 0,
        numPerPage: 20,
        purchase_status: selectedTab === 'purchaseOrder' ? 'New' : 'All',
        searchString: ''
      };
      dispatch(listPurchasesPaginateAction(data, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
    }
  }, [selectedTab])

  const handleDialogOpen = async (rowData) => {
    console.log('handlepopoupopenm', tabData, tabHeadings, transactionsConfig, selectedTab)
    if (selectedTab === 'saleOrder' || selectedTab === 'deliveryChallan') {
      let type = selectedTab === 'saleOrder' ? 'salesOrders' : 'deliveryChallan'
      let id = selectedTab === 'saleOrder' ? rowData?.order_id : rowData?.dc_id
      const { data } = await customFetch(
        API_URLS.GET_SALES_CHILD_PAGE_DETAILS(id, type),
        'POST',
        {}
      );
      if (data?.length > 0) {
        const result = data[0];
        setSelectedRowData(result);
        setOpenSale(true);
      }
    } else if (selectedTab === 'customerReceipts' || selectedTab === 'vendorPayments') {
      setSelectedRowData(rowData);
      setOpenDc(true);
      let id = rowData?.receipt_id
      let type = selectedTab === 'customerReceipts' ? 'Receipts' : 'Payments'
      await apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getReceiptsByIdAction(id, type)),
      )
    } else if (selectedTab === 'CreditNotes') {
      setSelectedRowData(rowData);
      setOpenCn(true);
    } else if (selectedTab === 'debitNote') {
      setSelectedRowData(rowData);
      setOpenDn(true);
    } else if (selectedTab === 'expenses') {
      setSelectedRowData(rowData);
      setOpenExp(true);
    } else if (selectedTab === 'purchaseOrder') {
      const matchedData = purchasesByPagination.find((po) => po.po_number === rowData.po_number);
      if (matchedData) {
        setSelectedRowData(matchedData)
      } else {
        setSelectedRowData(rowData)
      }
      setOpenPo(true)
    } else if(selectedTab === 'quotation') {
      setSelectedRowData(rowData);
      setOpenQuotation(true);
    }else {
      let type = 'sales'
      const { data } = await customFetch(
        API_URLS.GET_SALES_CHILD_PAGE_DETAILS(rowData?.sale_id, type),
        'POST',
        {}
      );
    
      if (data?.length > 0) {
        const result = data[0];
        setSelectedRowData(result);
        setOpenSale(true);
      }
    }
    console.log(rowData, selectedRowData, 'transactiondata');
    console.log('nesonalaye', openSale, selectedRowData)
  }
  const transactionsConfig =
    props.customerType === 1 || props.customerType === 0 ? [
      (props.customerType === 1 || props.customerType === 0) && {
        key: 'invoice',
        title: 'Invoices',
        condition: true,
        columns: invoiceColumns,
        tableData:
          props.customerType === 2
            ? purchaseOrderByVendor
            : Array.isArray(salesInvoiceByCustomer)
              ? salesInvoiceByCustomer.filter(sale => sale.invoice_number !== null) : [],
        onRowClick: (rowData) => {
          handleDialogOpen(rowData)
          // navigate('/sales/invoices', {
          //   state: {
          //     triggeredByTransaction: true,
          //     rowData,
          //   },
          // });
        },
      },
      (props.customerType === 1 || props.customerType === 0) && {
        key: 'customerReceipts',
        title: 'Customer Receipts',
        condition: true,
        columns: customerPaymentColumns,
        tableData: customerPayments,
        onRowClick: (rowData) => {
          handleDialogOpen(rowData)
        },
      },
      (props.customerType === 0) && {
        key: 'paymentDetails',
        title: 'Payment Details',
        condition: true,
        columns: individualPaymentDetailsColumn,
        tableData: individualPaymentDetails,
        // onRowClick: (rowData) => {
        //   handleDialogOpen(rowData)
        // },
      },
      props.customerType === 1 && {
        key: 'quotation',
        title: 'Quotes',
        condition: true,
        columns: quotationColumns,
        tableData: quotationByCustomer.data,
        onRowClick: (rowData) => {handleDialogOpen(rowData)},
      },
      props.customerType === 1 && {
        key: 'saleOrder',
        title: 'Sale Orders',
        condition: true,
        columns: saleOrderColumns,
        tableData: saleOrderByCustomer,
        onRowClick: (rowData) => {
          handleDialogOpen(rowData)
        },
      },
      props.customerType === 1 && {
        key: 'deliveryChallan',
        title: 'Delivery Challan',
        condition: true,
        columns: deliveryChallanColumns,
        tableData: deliveryChallanByCustomer,
        onRowClick: (rowData) => {
          handleDialogOpen(rowData)
        },
      },
      (props.customerType === 1 || props.customerType === 0) && {
        key: 'CreditNotes',
        title: 'Credit Note',
        condition: true,
        columns: debitCreditNotesColumns,
        tableData: recentCreditDebitNotes?.data,
        onRowClick: (rowData) => {
          handleDialogOpen(rowData)
        },
      },
      (props.customerType === 1 || props.customerType === 0) && {
        key: 'Quotation',
        title: 'Quotation',
        condition: true,
        columns: quotationColumns,
        tableData: quotationByCustomer?.data,
        onRowClick: (rowData) => {
          handleDialogOpen(rowData)
        },
      },
    ] : [
      props.customerType === 2 && {
        key: 'vendorPayments',
        title: 'Vendor Payments',
        condition: true,
        columns: vendorPaymentColumns,
        tableData: vendorPayments,
        onRowClick: (rowData) => {
          handleDialogOpen(rowData)
        },
      },
      props.customerType === 2 && {
        key: 'purchaseOrder',
        title: 'Purchase Order',
        condition: true,
        columns: purchaseOrderColumns,
        tableData: purchaseOrderByVendor,
        onRowClick: (rowData) => {
          handleDialogOpen(rowData)
        },
      }, props.customerType === 2 && {
        key: 'bills',
        title: 'Bills',
        condition: true,
        columns: purchaseBillsColumns,
        tableData: purchaseBills,
        onRowClick: (rowData) => {
          setBillsOpen(true);
          setIndex(rowData?.tableData?.index)
        },
      },
      props.customerType === 2 && {
        key: 'debitNote',
        title: 'Debit Note',
        condition: true,
        columns: debitCreditNotesColumns,
        tableData: recentCreditDebitNotes?.data,
        onRowClick: (rowData) => {
          handleDialogOpen(rowData)
        },
      },

      props.customerType === 2 && {
        key: 'expenses',
        title: 'Expenses',
        condition: true,
        columns: expenseColumns,
        tableData: expensesByVendor,
        onRowClick: (rowData) => {
          handleDialogOpen(rowData)
        },
      },
    ];
  console.log(vendorPaymentColumns, "vendorPaymentColumns")
  useEffect(() => {
    if (tabHeadings.length > 0) {
      setSelectedTab(tabHeadings[0]);
    }
  }, [props.customerType]);

  const selectedConfig = transactionsConfig.find(config => config?.key === selectedTab);
  console.log(selectedConfig, transactionsConfig, selectedConfig.tableData,'selectedreduce')
  const keyToCountMap = {
    invoice: 'invoice',
    deliveryChallan: 'deliveryChallan',
    saleOrder: 'saleOrder',
    customerReceipts: 'customerReceipts',
    vendorPayments: 'vendorPayments',
    purchaseOrder: 'purchaseOrder',
    bills: 'bills'
  };
  let count = props.customerType === 2 ? vendorTotalCount : totalCount
  const countKey = keyToCountMap[selectedConfig?.key];
  const totalCounts = selectedConfig?.key === 'CreditNotes' ? recentCreditDebitNotes?.numRows : selectedConfig?.key === 'expenses' ? expensesCount : selectedConfig?.key === 'debitNote' ? recentCreditDebitNotes?.numRows : selectedConfig?.key === 'quotation' ? quotationByCustomer?.numRows : count?.[countKey] || 0;

  const handleTabChange = (e, newValue) => {
    setPage(0);
    setSelectedTab(newValue);
    setOpenSale(false);
    setOpenDc(false)
    setOpenCn(false)
    setOpenDn(false)
    setOpenPo(false)
    setBillsOpen(false)
    setOpenExp(false)
    setOpenQuotation(false)
  };

  useEffect(() => { (async () => {
    const fetchData = async () => {
      if (page !== 0) return;

      if (selectedTab === 'CreditNotes' || selectedTab === 'debitNote') {
        const data = {
          customer_id: props.contactType === 'Customer' ? props.customer_id : null,
          supplier_id: props.contactType === 'Supplier' ? props.customer_id : null,
          pageCount: 0,
          numPerPage: pageSize || 0,
          searchString: ''
        };
        await apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(recentCreditDebitNotesAction(data))
        );
      } else if (['invoice', 'customerReceipts', 'saleOrder', 'deliveryChallan'].includes(selectedTab)) {
        await apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(getSaleOrderDeliveryChallanByCustomerAction({
            customerId: props.customer_id,
            type: selectedTab,
            searchString: '',
            pageCount: 0,
            numPerPage: pageSize || 0
          }))
        );
      } else if (['vendorPayments', 'purchaseOrder', 'bills'].includes(selectedTab)) {
        await apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(getPurchaseOrderByVendorAction({
            vendorId: props.customer_id,
            type: selectedTab,
            pageCount: 0,
            numPerPage: pageSize || 0,
            searchString: '',
            location_id: headerLocationId
          }))
        );
      } else if (selectedTab === 'quotation') {
        await apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(getQuotationByCustomerAction(props.customer_id, 0, pageSize, ""))
        );
      } else if (selectedTab === 'expenses') {
        await apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(getExpensesByVendorAction(props.customer_id, 0, pageSize, ''))
        );
      }
    };

    fetchData();
  })();
}, [selectedTab, page, headerLocationId]);


  useEffect(() => {
    setPage(0);
  }, [selectedTab]);



  useEffect(() => {
    setSearchVal('');
    return () => {
      if (searchDebounceRef.current) {
        searchDebounceRef.current.cancel();
      }
    };
  }, [selectedTab]);



  const fetchPaginatedData = async (page, pageSize) => {
    console.log(page, 'fetxhpagination')
    const validKeys = ['invoice', 'customerReceipts', 'saleOrder', 'deliveryChallan'];
    const vendorKeys = ['vendorPayments', 'purchaseOrder', 'bills'];
    if (selectedTab === 'bills' || selectedTab === 'purchaseOrder') {
      await apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(listPurchasesPaginateAction(
          {
            brand: '',
            category: '',
            location_id: headerLocationId,
            statusfilter: '',
            max_price: '',
            min_price: '',
            product_name: '',
            from: null,
            to: null,
            user_id: commoncookie,
            supplier_id: [props.customerData?.supplier_id],
            pageCount: page,
            numPerPage: pageSize,
            purchase_status: selectedTab === 'purchaseOrder' ? 'New' : 'All',
            // pageType: pathname,
            searchString: ''
          },
          commoncookie,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler
        ))
      );
    }

    if (validKeys.includes(selectedTab)) {
      await apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getSaleOrderDeliveryChallanByCustomerAction({
          ...filters,
          customerId: props.customer_id,
          type: selectedTab,
          pageCount: page,
          numPerPage: pageSize,
          searchString: '',
        })));
    }
    if (vendorKeys.includes(selectedTab)) {
      await apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getPurchaseOrderByVendorAction({
          ...filters,
          vendorId: props.customer_id,
          type: selectedTab,
          pageCount: page,
          numPerPage: pageSize,
          searchString: ''
        })));
    }
    if (selectedTab == 'CreditNotes' || selectedTab == 'debitNote') {
      const data = {
        ...filters,
        customer_id: props.contactType === 'Customer' && props.customer_id,
        supplier_id: props.contactType === 'Supplier' && props.customer_id,
        pageCount: page,
        numPerPage: pageSize,
        searchString: ''
      };
      await apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler, dispatch(recentCreditDebitNotesAction(data)))
    }
    if (selectedTab == 'quotation') {
      await apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler, dispatch(getQuotationByCustomerAction(...filters, props.customer_id, page, pageSize, "")))
    }
    if (selectedTab == 'expenses') {
      await apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler, dispatch(getExpensesByVendorAction(props.customer_id, page, pageSize, '', filters)))
    }
  };

  const handlePageChange = async (newPage) => {
    setPage(newPage);
    fetchPaginatedData(newPage, pageSize)
  };

  const handlePageSizeChange = async (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0);
    fetchPaginatedData(0, newPageSize)
  };
  console.log(selectedTab, 'selectedTabselectedTab')

    const setAppConfigDataFunc = (data) => {
    setAppConfigData({...appConfigData, ...data})
  }
  return (
    <>
      <Grid container spacing={3}>
        <Grid
          paddingTop='12px'
          paddingLeft='10px'
          size={{
            lg: 2,
            md: 2,
            sm: 2,
            xs: 6
          }}>
          <Card sx={{ maxHeight: `calc(${maxHeight} - 50px)`, minHeight: `calc(${maxHeight} - 50px)` }}>
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={selectedTab}
              onChange={(event, newValue) => {
                setPage(0);
                handleTabChange(event, newValue);
              }}
              sx={{ borderRight: 1, borderColor: 'divider' }}
            >
              {tabHeadings.map((label) => {
                const formattedLabel = label
                  .replace(/([a-z])([A-Z])/g, '$1 $2')
                  .replace(/^./, str => str.toUpperCase());

                const isSelected = selectedTab === label;

                return (
                  <Tab
                    key={label}
                    value={label}
                    label={formattedLabel}
                    style={{
                      display: 'flex', alignItems: 'start', textTransform: 'capitalize', backgroundColor: isSelected ? 'rgba(10, 143, 220, 0.1)' : 'transparent',
                      color: isSelected ? '#0A8FDC' : 'rgb(107, 114, 128)',
                      fontWeight: isSelected ? 'bold' : 'normal',
                      borderRadius: '4px 0 0 4px',
                      justifyContent: 'flex-start',
                      px: 2
                    }}
                  />
                );
              })}
            </Tabs>
          </Card>
        </Grid>

        <Grid
          size={{
            lg: 10,
            md: 10,
            sm: 10,
            xs: 12
          }}>
          {openSale ? (
            <Card
              variant="outlined"
              sx={{
                padding: '20px',
                maxHeight: `calc(${maxHeight} - 50px)`,
                minHeight: `calc(${maxHeight} - 50px)`,
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'end' }}>
                <IconButton aria-label="close" onClick={() => setOpenSale(false)}>
                  <CloseIcon />
                </IconButton>
              </div>

              <ProductTopCards salesData={selectedRowData} />

              <div style={{ marginTop: 10 }}>
                <PurchaseCard salesData={selectedRowData} />
              </div>

              <div style={{ marginTop: 10 }}>
                <Status saleStatus={selectedRowData?.sale_status_name} />
              </div>

              <div style={{ marginTop: 10 }}>
                <PurchaseTable
                  sales_data={selectedRowData}
                  sales_items={selectedRowData?.sales_items}
                  location_name={selectedRowData?.location_name}
                  total={selectedRowData?.total}
                  shipping_address={selectedRowData?.shipping_address}
                  company_name={selectedRowData?.company_name}
                  user_name={selectedRowData?.username}
                  statusType={selectedRowData?.sale_status}
                  pageType={'detail'}
                />
              </div>

              <div style={{ minHeight: 200, marginTop: 10 }}>
                <TimeLine salesData={selectedRowData} />
              </div>
            </Card>
          ) : openDc ? (
            <Card
              variant="outlined"
              sx={{
                padding: '20px',
                maxHeight: `calc(${maxHeight} - 50px)`,
                minHeight: `calc(${maxHeight} - 50px)`,
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'end' }}>
                <IconButton aria-label="close" onClick={() => setOpenDc(false)}>
                  <CloseIcon />
                </IconButton>
              </div>
              <ReceiptsLanding
                pageType='transaction'
                type= {props.contactType === 'Customer' ? 'Receipts' : 'Payments'}
                rowData={selectedRowData}
              />
            </Card>
          ) : openQuotation ? (
            <Card
              variant="outlined"
              sx={{
                padding: '20px',
                maxHeight: `calc(${maxHeight} - 50px)`,
                minHeight: `calc(${maxHeight} - 50px)`,
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'end' }}>
                <IconButton aria-label="close" onClick={() => setOpenQuotation(false)}>
                  <CloseIcon />
                </IconButton>
              </div>
                  <QuotationDetailsPage
                    data={selectedRowData}
                    detailstype='quotationdetails'
                    appConfigData={appConfigData}
                    setAppConfigData={setAppConfigDataFunc}
                    product={product}
                    stocklocation={stocklocation}
                    app_config_data={app_config_data}
                    customer={customer}
                    status='convertSO'
                    type='customer'
                    setModalTypeHandler={setModalTypeHandler}
                    setModalStatusHandler={setModalStatusHandler}
                    setselectData={setselectData}
                    returnState={false}
                    listStockLocationSequenceAction={(data, setLoaderStatusHandler, employee_id, headerLocationId) => dispatch(listStockLocationSequenceAction({ sequence_type: ["SO", "DC"] }, setLoaderStatusHandler, employee_id, headerLocationId))}
                  />
            </Card>
          ): openPo ? (
            <Card
              variant="outlined"
              sx={{
                padding: '20px',
                maxHeight: `calc(${maxHeight} - 50px)`,
                minHeight: `calc(${maxHeight} - 50px)`,
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'end' }}>
                <IconButton aria-label="close" onClick={() => setOpenPo(false)}>
                  <CloseIcon />
                </IconButton>
              </div>
              <Card variant='outlined' sx={{ padding: '20px' }}>
                <ProductTopCard recevingData={selectedRowData} />

                <div style={{ marginTop: 10 }}>
                  <BillsRow recevingData={selectedRowData} />
                </div>
                <div style={{ marginTop: 10 }}>
                  <StatusCard recevingData={selectedRowData} />
                </div>

                <div style={{ marginTop: 10 }}>
                  <PurchaseTablePO
                    company_name={selectedRowData?.company_name}
                    location_name={selectedRowData?.location_name}
                    receivings_items={selectedRowData?.receivings_items}
                    invoiceNumber={selectedRowData?.invoice_number}
                    total={selectedRowData?.total}
                    shipping_address={selectedRowData?.shipping_address}
                  />
                </div>

                <div style={{ minHeight: 200, marginTop: 10 }}>
                  <TimeLinePO recevingData={selectedRowData} />
                </div>
              </Card>
            </Card>
          ) : openCn ? (
            <Card
              variant="outlined"
              sx={{
                padding: '20px',
                maxHeight: `calc(${maxHeight} - 50px)`,
                minHeight: `calc(${maxHeight} - 50px)`,
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'end' }}>
                <IconButton aria-label="close" onClick={() => setOpenCn(false)}>
                  <CloseIcon />
                </IconButton>
              </div>
              <CreditNotesDetails
                data={selectedRowData}
                pageType='transaction'
              />
            </Card>
          ) : openDn ? (
            <Card
              variant="outlined"
              sx={{
                padding: '20px',
                maxHeight: `calc(${maxHeight} - 50px)`,
                minHeight: `calc(${maxHeight} - 50px)`,
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'end' }}>
                <IconButton aria-label="close" onClick={() => setOpenDn(false)}>
                  <CloseIcon />
                </IconButton>
              </div>
              <DebitNotesDetails
                data={selectedRowData}
                pageType='transaction'
              />
            </Card>
          ) : OpenExp ? (
            <Card
              variant="outlined"
              sx={{
                padding: '20px',
                maxHeight: `calc(${maxHeight} - 50px)`,
                minHeight: `calc(${maxHeight} - 50px)`,
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'end' }}>
                <IconButton aria-label="close" onClick={() => setOpenExp(false)}>
                  <CloseIcon />
                </IconButton>
              </div>
              <ExpensesDetails
                data={selectedRowData}
                pageType='transaction'
              />
            </Card>
          ) : billsOpen ? (
            <Card variant="outlined"
              sx={{
                padding: '20px',
                maxHeight: `calc(${maxHeight} - 50px)`,
                minHeight: `calc(${maxHeight} - 50px)`,
                overflowY: 'auto',
              }}>
              <div style={{ display: 'flex', justifyContent: 'end' }}>
                <IconButton aria-label="close" onClick={() => setBillsOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </div>

              <ProductTopCard recevingData={recevingData} />

              <div style={{ marginTop: 10 }}>
                <BillsRow recevingData={recevingData} />
              </div>

              <div style={{ marginTop: 10 }}>
                <StatusCard recevingData={recevingData} />
              </div>

              <div style={{ marginTop: 10 }}>
                <PurchaseTablePO
                  company_name={recevingData?.company_name}
                  location_name={recevingData?.location_name}
                  receivings_items={recevingData?.receivings_items}
                  invoiceNumber={recevingData?.invoice_number}
                  total={recevingData?.total}
                  shipping_address={recevingData?.shipping_address}
                />
              </div>

              <div style={{ minHeight: 200, marginTop: 10 }}>
                <TimeLinePO recevingData={recevingData} />
              </div>
            </Card>
          ) : (
            selectedConfig?.condition && (
              <TransactionsTable
                tableName={selectedConfig.title}
                columns={selectedConfig.columns}
                tableData={selectedConfig.tableData}
                saleData={props.customerSalesDetailById}
                onRowClick={selectedConfig.onRowClick}
                handlePageSizeChange={handlePageSizeChange}
                handlePageChange={handlePageChange}
                page={page}
                pageSize={pageSize}
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
                customer_id={props.customer_id}
                filters={filters}
                setFilters={setFilters}
                contactType={props.contactType}
                totalCount={totalCounts || 0}
                searchVal={searchVal}
              />
            )
          )}
        </Grid>

      </Grid>
      {
       popUpdata.Dopen && (
        <InvoiceDialog
                        sales_payments={popUpdata.sales_payments}
                        appConfigData={appConfigData}
                        note={popUpdata.note}
                        createMail={createMail}
                        custType={'CUSTOMER'}
                        posSale={true}
                        custData={popUpdata.custData}
                        invoice={popUpdata.invoice}
                        soDate={popUpdata.soDate}
                        sales_items={popUpdata.sales_items}
                        open={popUpdata.Dopen}
                        handleClose={() => setPopupdata({...popUpdata,Dopen:false})}
                        invoicepos={true}
                        mail_configuration={mail_configuration}
                        Einvoice = {popUpdata.Einvoice}
                        pageType = { "TRANSACTIONS"}
                      />
       )
      }
      {templateOpen && (
        <CnDialog
          open={templateOpen}
          appConfigData={appConfigData}
          custType={type === "VENDOR" ? 'VENDOR' : 'CUSTOMER'}
          custData={type === "VENDOR" ? vendor_id_data : customer_id_data}
          invoice={templateData?.sequence_number}
          soDate={templateData?.created_at}
          sales_items={manualsalespurchase}
          handleClose={() => setTemplateOpen(false)}
          manualnote={templateData}
        />)}
      {(type === "VENDOR" || type === "CUSTOMER") &&
        <Dialog
  fullWidth
  maxWidth="md"
  open={invoicePopup}
  scroll="paper"  
  aria-labelledby="alert-dialog-title"
  aria-describedby="alert-dialog-description"
  PaperProps={{
    style: {
      backgroundColor: 'white',
      maxHeight: '100vh', 
    },
  }}
>
  <DialogContent
    dividers 
    sx={{
      overflowY: 'hidden',
      maxHeight: '100vh', 
      backgroundColor: 'white',
    }}
  >
    <CommonInvoiceTemplate />
  </DialogContent>

  <DialogActions sx={{ mr: '50px', ml: '35px', mb: '10px' }}>
    <Button variant="outlined" onClick={() => setinvoicePopup(false)}>
      Close
    </Button>
    <Button variant="contained" onClick={createMail}>
      <MailIcon sx={{ mr: 1 }} fontSize="small" /> SEND INVOICE
    </Button>
    <Button variant="contained" onClick={handleDownload}>
      Download
    </Button>
    <Button variant="contained" onClick={handlePrint}>
      Print
    </Button>
  </DialogActions>
</Dialog>

      }
      <Dialog
        fullWidth
        maxWidth='md'
        open={quotationOpen}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        PaperProps={{
          style: {
            backgroundColor: 'white',
          },
        }}
      >
        <DialogContent
          style={{
            display: "block",
            overflow: 'hidden',
            backgroundColor: 'white'
          }}
        >
          <CommonInvoiceTemplate />
        </DialogContent>
        <DialogActions sx={{ mr: '50px', ml: '35px' }}>
          <Button
            variant='outlined'
            onClick={(e) => {
              setQuotationOpen(false)
            }}
          >
            Close
          </Button>
          <Button
            variant='contained'
            onClick={createMail}
          >
            <MailIcon sx={{ mr: 1 }} fontSize='small' /> SEND Mail
          </Button>
          <Button variant='contained' onClick={handlePrint}>
            Print
          </Button>
        </DialogActions>
      </Dialog>
      <ReceiptTempDialog
        open={receiptTempOpen}
        handleClose={() => setReceiptTempOpen(false)}
      />
    </>
  );
}

export default NewTransactions