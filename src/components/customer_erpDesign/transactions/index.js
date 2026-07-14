import { Accordion, AccordionDetails, Button, Chip, Dialog, DialogActions, DialogContent, Grid, Link, ListItem, ListItemText, Typography } from "@mui/material";
import { useEffect, useState,useContext } from "react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from "@mui/material/styles";
import MuiAccordionSummary, {
    accordionSummaryClasses,
  } from '@mui/material/AccordionSummary';
import { useDispatch, useSelector } from "react-redux";
import { getQuotationByCustomerAction } from "redux/actions/quotation_actions";
import { getExpensesByVendorAction } from "redux/actions/expense_actions";
import { getSaleOrderDeliveryChallanByCustomerAction, salesGetById, sendMail } from "redux/actions/sales_actions";
import { getPurchaseOrderByVendorAction } from "redux/actions/purchase_actions";
import TransactionsTable from "./TransactionsTable";
import moment from "moment";
import { cellStyle } from "utils/pageSize";
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
import { getByIdMailConfigurationAction } from "redux/actions/configuration_actions";
import Invoice from '../../../../src/pages/sales/sales/Invoice'
import QuotationTemp from "components/QuotationTemp";
import { useNavigate } from "react-router-dom";
import CnDialog from '../../../../src/pages/sales/sales/cn_invoice/index';
import InfoOutlineIcon from '@mui/icons-material/InfoOutlined';
import CommonInvoiceTemplate from "pages/sales/CommonInvoiceTemp/CommonInvoiceTemplate";
import { getSupplierDetailsByIdreceivings_itemsAction } from "redux/actions/vendor_actions";
import MailIcon from '@mui/icons-material/Mail';
import API_URLS from "../../../utils/customFetchApiUrls";

function Transactions(props){

          const {
        setLoaderStatusHandler,
        setModalStatusHandler,
        setselectData,
        setModalTypeHandler,
        commoncookie,
        headerLocationId,} = useContext(CreateNewButtonContext);

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
        New: 'primary',
        Open: 'secondary',
        'Pending Payment': 'warning',
        'Pending Goods': 'warning',
        Completed: 'success',
    };

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const {
        quotationReducer: { quotationByCustomer },
        ExpenseReducer: { expensesByVendor },
        salesReducer: { saleOrderByCustomer, deliveryChallanByCustomer, customerPayments, receiptEntryData,searchSalesData ,salesByPagination ,salesInvoiceByCustomer},
        purchasesReducer: { purchaseOrderByVendor, vendorPayments },
        manualNoteReducer: {recentCreditDebitNotes,manualsalespurchase},
        customerReducer: { customer ,customer_id_data},
        productReducer: { product },
        vendorReducer:{vendor_id_data,po_temp},
        appConfigReducer:{app_config_data_based_on_type,app_config_data},
        stockLocationReducer:{stocklocation},
        TermsConditionsReducers:{termsAndConditionsList},
          UserCreationReducer: { createUser },
          ConfigurationReducer: { mail_configuration }
    } = useSelector(state => state)

    // console.log("salesInvoiceByCustomer",salesInvoiceByCustomer,saleOrderByCustomer)

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
        vendorPayments: false,
        receiptEntry: false
    })
    const [templateOpen, setTemplateOpen] = useState(false);
    const [templateData, setTemplateData] = useState({});
    const [appConfigData, setAppConfigData] = useState({});
    const [onrowclick, setOnrowclick] = useState(true);
    const [popUpdata, setPopupdata] = useState({
              invoice: '',
              custData: {},
              soDate: '',
              sales_items: [],
              Dopen: false,
              customer_id: '',
              sale_id: '',
            }); // invoice
    const [popupData,setPopupData] = useState({
         invoice: '',
        custData: {},
        soDate: '',
        sales_items: [],
        Dopen: false,
        customer_id: '',
        sale_id: '',
        note: '',
        sales_payments: [],
        openAlert: false,
        isRoundedOffNegative: 0,
        rounded_off: 0,
        dc_number	: ''
    })
    const [searchVal,setSearchVal] = useState()
    const [invoicePopup, setinvoicePopup] = useState(false);
    const [invoiceData, setinvoiceData] = useState({});
    const [type, setType] = useState('');
    const [termsAndConditions, setTermsAndConditions] = useState([]);
    const [quotationData, setQuotationData] = useState([]);
    const [quotationOpen, setQuotationOpen] = useState(false);

    
    useEffect(() => { (async () => {
        let type='sales'
        if(props.customer_id !== null && props.customer_id !== undefined && props.customer_id !== ''){
            if(props.customerType === 1 || props.customerType === 0){
                  const data = {
                    customer_id: props.contactType === 'Customer' ? props.customer_id : null,
                    supplier_id: props.contactType === 'Supplier' ? props.customer_id : null,
                    limit: 10,
                    searchString: ''
                };
                await apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                dispatch(getAppConfigDataBasedOnTypeAction(type)),
                // dispatch(getbyidCustomerAction()),
                dispatch(ManualSalesPurchase()),
                // dispatch(listCustomerAction()),
                // dispatch(listStockLocationSequenceAction())//employee_id , location_id , data
                dispatch(customerSalesDetailAction(props.customer_id,props.customerData?.employee_id)),
                dispatch(getQuotationByCustomerAction(props.customer_id)),
                dispatch(getSaleOrderDeliveryChallanByCustomerAction({ customerId: props.customer_id })),
                dispatch(recentCreditDebitNotesAction(data))
            )
            }

            if(props.customerType === 2){

                const data = {
                    customer_id: props.contactType === 'Customer' ? props.customer_id : null,
                    supplier_id: props.contactType === 'Supplier' ? props.customer_id : null,
                    limit: 10,
                    searchString: ''
                };
                 await apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                dispatch(getAppConfigDataBasedOnTypeAction(type)),
                // dispatch(getbyidCustomerAction()),
                // dispatch(listStockLocationSequenceAction())//employee_id , location_id , data
                //  dispatch(customerSalesDetailAction(props.customer_id,props.customerData?.employee_id))
                dispatch(getExpensesByVendorAction(props.customer_id)),
                dispatch(getPurchaseOrderByVendorAction({ vendorId: props.customer_id })),
                dispatch(recentCreditDebitNotesAction(data))
                 )
            }
        }
        

        //!vendor_id_data?.length && dispatch(getbyidVendorAction(rowdata.supplier_id))
        getAppConfigData()
    })();
}, [props.customer_id, props.customerType ])

    useEffect(() => {
        let openObj = {};
    
        openObj.invoices = props.customerType === 2 ? purchaseOrderByVendor.length > 0 : salesInvoiceByCustomer.filter(sale => sale.invoice_number !== null).length > 0
        openObj.quotes = quotationByCustomer.data.length > 0;
        openObj.expenses = expensesByVendor.length > 0;
        openObj.salesOrders = saleOrderByCustomer.length > 0;
        openObj.deliveryChallans = deliveryChallanByCustomer.length > 0;
        openObj.purchaseOrder = purchaseOrderByVendor.length > 0;
        openObj.customerPayments = customerPayments.length > 0;
        openObj.vendorPayments = vendorPayments.length > 0;
        openObj.creditNote = salesInvoiceByCustomer.length > 0; 
        openObj.debitNote = purchaseOrderByVendor.length > 0;
        openObj.receiptEntry = receiptEntryData?.length > 0;
    
        setOpen((prev) => ({ ...prev, ...openObj }));
    }, [quotationByCustomer, expensesByVendor, saleOrderByCustomer, deliveryChallanByCustomer, purchaseOrderByVendor, customerPayments, vendorPayments, recentCreditDebitNotes, receiptEntryData,salesInvoiceByCustomer]);
    
    const handleToggle = (panel) => (event, isExpanded) => {
        setOpen((prev) => ({ ...prev, [panel]: isExpanded }))
    }
 const customFetch = useCustomFetch();
  
    const handleInvoiceData = async (id, type) =>{
        let getData;
        if (type === "VENDOR") {
            const { data } = await customFetch(
                API_URLS.GET_PURCHASE_INVOICE_BY_ID(id),
                'GET'
            );
            getData = data?.data[0]
        } else {
            const type =  'sales' 
            const poptype = 'invoice'
            const { data } = await customFetch(
                API_URLS.GET_SALES_INVOICE_DETAILS(id, type,poptype),
                'POST'
            );
           const termsConditions = await customFetch(
                API_URLS.TERMS_CONDITIONS,
                'POST',
                { searchString: "" }
              );
        //    console.log(data,termsConditions.data,"saleData");
           const termsAndConditions = termsConditions.length ? termsConditions.data?.filter(e => e.invoice_types === 'Sales')[0].terms_conditions : []
           
           setTermsAndConditions(termsAndConditions)
            getData = data[0]
        }
        // console.log(getData,"vngfmdata");
        let receiving_id = id
        dispatch(getSupplierDetailsByIdreceivings_itemsAction(props?.customerData?.supplier_id,{receiving_id}))
        setType(type)

// getAppConfigData()
setinvoiceData(getData)

setinvoicePopup(true);

    }

    const handleQuotationsData = async (data) => {
        setQuotationData(data)
        setQuotationOpen(true);
    }

        const invoiceFunction = async (data,saleDetailFromProps) => {
            console.log("data",data,saleDetailFromProps)
            console.log(saleDetailFromProps.customer_id,"qwerty")
            console.log(customer,"reducer")
          const custData = await customer.filter(
            (d) => saleDetailFromProps.customer_id === d.customer_id,
          );
        console.log(custData,"printttt")
          let sales_items;
        
          const salesResponse = await new Promise((resolve) => {
           apiCalls(
              setModalTypeHandler,
              setLoaderStatusHandler,
              dispatch(
                salesGetById(saleDetailFromProps.sale_id, (response) => {
                    console.log(response,"res")
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

          const handleMailConfiguration = async () => {
            const roleIdData = createUser.filter(f => f.employee_id === commoncookie)
            if (roleIdData.length > 0) {
              await apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                await dispatch(getByIdMailConfigurationAction('Sale Order', roleIdData[0]?.role_id))
              );
            }
          }

            const createMail = async() => {
                console.log(popUpdata,"popUpdata")
              const data = {
                custData: popUpdata.custData,
                invoice_number: popUpdata.invoice,
                sales_items: popUpdata.sales_items,
                email: popUpdata.custData.email,
                appConfigData: app_config_data,
              };
               await apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
              dispatch(
                sendMail(data, () => { }, setModalTypeHandler, setLoaderStatusHandler),
              ));
              setPopupdata({ ...popUpdata, Dopen: false });
            };

    const invoiceColumns = [
        {
            title: 'Invoice Number',
            field: 'invoice_number',
            // render: (data) => {
            //     const matchingSaleDetail = props.customerSalesDetailById?.find(
            //         (sale) => sale.invoice_number === data.invoice_number
            //     );
            //     // console.log(matchingSaleDetail, "matchingSaleDetail")
            //     return (
            //         <div
            //             style={{ cursor: 'pointer', textDecoration: 'underline' }} 
            //             onClick={() => {invoiceFunction(data, matchingSaleDetail); handleMailConfiguration();}}
            //         >
            //             {data.invoice_number}
            //         </div>
            //     );
            // }
            render: (rowData) => (
                <span
                  style={{cursor: 'pointer', textDecoration: 'underline'}}
                  onClick={(e) => {
                    e.stopPropagation(); handleInvoiceData(rowData.sale_id,"CUSTOMER");
                  }}>
                  {rowData.invoice_number}
                </span>
              ),
        },
        {
            title: 'Invoice Date',
            field: 'invoice_date'
        },
        {
            title: 'Amount',
            field: 'total',
            render: (rowData) => rowData.total.toFixed(2)
        },
        {
            title: 'Due Amount',
            field: 'due_amount',
            render: (rowData) => rowData.due_amount.toFixed(2)
        },
        {
            title: 'Status',
            field: 'status',
            render: (rowData) => {
                const customerType = props?.customer_type ?? null;

                if (customerType === 2) {
                    return rowData.status;
                } else {
                    if (rowData.status !== 7) {
                        if (Math.round(+rowData.received_amount) >= Math.round(+rowData.total)) {
                            return <Chip color='success' label='Completed' />;
                        } else if (rowData.status >= 2) {
                            return <Chip color='warning' label='Pending' />;
                        } else {
                            return <Chip color='warning' label='Pending' />;
                        }
                    } else {
                        return (
                            <Chip
                                color='primary'
                                style={{ backgroundColor: rowData.status === 7 ? 'grey' : '#11C15B' }}
                                label={rowData.status_name}
                            />
                        );
                    }
                }
            }
        }

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
            title: 'Customer Name',
            field: 'company_name'
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
            title: 'Payment Date',
            field: 'payment_date'
        },
        {
            title: 'Invoice Number',
            field: 'invoice_number',
            render: (rowData) => (
                <span
                  style={{cursor: 'pointer', textDecoration: 'underline'}}
                  onClick={(e) => {
                    e.stopPropagation(); handleInvoiceData(rowData.sale_id,"CUSTOMER");
                  }}
                  >
                  {rowData.invoice_number}
                </span>
              ),
        },
        {
            title: 'Amount',
            field: 'payment_amount'
        },
        {
            title: 'Mode of Payment',
            field: 'payment_type'
        },
        {
            title: 'Reference Number',
            field: 'reference_code'
        }
    ]

    const vendorPaymentColumns = [
        {
            title: 'Payment Date',
            field: 'payment_time'
        },
        {
            title: 'Invoice Number',
            field: 'invoice_number'
        },
        {
            title: 'Amount',
            field: 'payment_amount'
        },
        {
            title: 'Mode of Payment',
            field: 'payment_type'
        },
        {
            title: 'Reference Number',
            field: 'reference_code'
        }
    ]

    const quotationColumns = [
        {
            title: 'Quotation Number',
            field: 'quotation_number',
            flex: 1,
            render: (rowData) => (
                <div
                  style={{cursor: 'pointer', textDecoration: 'underline'}}
                  onClick={() => {
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
            render : (rowData)=>{
                return moment(rowData.quotation_date).format('DD/MM/YYYY')
            },
            flex: 1,
        },
        {
            title: 'Customer',
            field: 'customerFullName',
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
            flex: 1,
        },
        {
            title: 'Status',
            field: 'status',
            flex: 1,
            render: (rowData) => {
        
                let color
        
                if(rowData.status === 'Approved'){
                color = 'green'
                }
                else if(rowData.status === 'Rejected'){
                color = 'red'
                }
                else {
                color = 'orange'
                }
        
                return (
                <Chip
                    label = {rowData.status}
                    style = {{backgroundColor: color}}
                />
                )
            }
        }
    ]

    const saleOrderColumns = [
        {
            title: 'SO Number',
            field: 'so_number',
            render: (rowData) => (
                <div
                  style={{cursor: 'pointer', textDecoration: 'underline'}}
                  onClick={() => {
                    handleInvoiceData(rowData.sale_id,"CUSTOMER");
                  }}
                >
                  {rowData.so_number}
                </div>
              ),
        },
        {
          title: 'Amount',
          field: 'total',
          render: (rowData) => rowData.total.toFixed(2)  
        },
        {
            title: 'Status',
            field: 'status_name',
            render: (rowData) => (
                <Chip
                    style = {{backgroundColor:`${rowData.status === 7 ? '#bac6cf': rowData.status === 8 ? '#c585ed' : rowData?.creditReturn > 0  ? "#d6c60f" : rowData.status  === 1 ? '#3b81b3' : rowData.status  === 5 ? '#378c89' :'#285c1c' }`}}
                    label = {rowData.status}
                />
            )
        },
        // {
        //     title: 'Payment Status',
        //     field: 'status',
        //     render: (rowData) => rowData.status !== 7 ?
        //                             Math.round(+rowData.received_amount) >= Math.round(+rowData.total) ?
        //                                 <Chip color = 'success' label = 'Completed' />
        //                             : rowData.status >= 2 ?
        //                                 <Chip color = 'warning' label = 'Pending' />
        //                             : <Chip color = 'warning' label = 'Pending' />
        //                         : <Chip color = 'primary' style = {{backgroundColor:`${rowData.status === 7 ? 'grey': '#11C15B'}`}} label = {rowData.status_name} />
        // }
    ]
    
    const purchaseOrderColumns = [
        {
            title: 'PO Number', 
            field: 'po_number',
            render: (rowData) => (
                <div
                  style={{cursor: 'pointer', textDecoration: 'underline'}}
                  onClick={() => {
                    handleInvoiceData(rowData.receiving_id, "VENDOR");
                  }}
                >
                  {rowData.po_number}
                </div>
              ),
        },
        {
            title: 'Invoice Number',
            field: 'invoice_number'
        },
        {
            title: 'PO Date',
            field: 'invoice_date',
        },
        {
            title: 'Payment Term',
            field: 'payment_type'
        },
        {
            title: 'Location',
            field: 'location_name'
        },
        {
            title: 'Status',
            field: 'status',
            render: (rowData) => (
                <Chip
                    size='small'
                    label={rowData.status}
                    color={poStatus[rowData.status]}
                />
            )
        }
    ]

    const deliveryChallanColumns = [
        {
            title: 'DC Number',
            field: 'dc_number'
        },
        {
            title: 'Invoice Number',
            field: 'dc_invoice'
        },
        {
          title: 'Amount',
          field: 'total',
          render: (rowData) => rowData.total.toFixed(2)  
        },
        {
            title: 'Status',
            field: 'status',
            render: (rowData) => (
                <Chip
                    style = {{backgroundColor:`${rowData.sale_status === 7 ? '#bac6cf': rowData.sale_status === 8 ? '#c585ed' : rowData?.creditReturn > 0  ? "#d6c60f" : rowData.sale_status  === 1 ? '#3b81b3' : rowData.sale_status  === 5 ? '#378c89' :'#285c1c' }`}}
                    label = {rowData.status}
                />
            )
        },
        {
            title: 'Payment Status',
            field: 'sale_status',
            render: (rowData) => rowData.sale_status !== 7 ?
                                    Math.round(+rowData.received_amount) >= Math.round(+rowData.total) ?
                                        <Chip color = 'success' label = 'Completed' />
                                    : rowData.sale_status >= 2 ?
                                        <Chip color = 'warning' label = 'Pending' />
                                    : <Chip color = 'warning' label = 'Pending' />
                                : <Chip color = 'primary' style = {{backgroundColor:`${rowData.sale_status === 7 ? 'grey': '#11C15B'}`}} label = {rowData.status} />
        }
    ]

    const debitCreditNotesColumns = [
        {
            title: 'Date', 
            field: 'created_at'
        },
        {
            title: 'Name',
            field: 'name',
            render: (rowData) => (
                <div
                style={{
                    cursor: rowData.sale_id ? 'pointer' : '',
                    textDecoration: rowData.sale_id ? 'underline' : '',
                }}
                onClick={(event) => {
                    // getSalesDataById(rowData);
                    event.stopPropagation();
                }}
                >
                {rowData.name}
                </div>
            ),
        },
        {
            title: 'CN/DN No.',
            field: 'sequence_number',
            render: (rowData) => (
                <Link>
                    <ListItem>
                        <ListItemText
                        onClick={async(event) => {
                            // const templateData = {
                            // sequence_number: rowData.sequence_number,
                            // type: rowData.type,
                            // date: rowData.created_at,
                            // customer_id: rowData.customer_id,
                            // supplier_id: rowData.supplier_id,
                            // amount: rowData.amount
                            // }
                            !customer_id_data?.length && 
                          (await apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                     dispatch(getbyidCustomerAction(rowData.customer_id)) ))
                            setTemplateOpen(true);
                            setTemplateData(rowData);
                            event.stopPropagation();
                        }}
                        style={{
                            textDecoration: 'underline',
                            cursor: 'pointer',
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
            render: (rowData) => (rowData.type === 'C' ? 'CN' : 'DN'),
        },
        {
            title: 'Opening Balance',
            field: 'amount',
            cellStyle: {
                textAlign: 'right',
                paddingRight: '150px',
                fontSize: cellStyle.fontSize,
            },
            render: (rowData) => (rowData?.amount || 0).toFixed(2),
        },
        {
            title: 'Closing Balance',
            field: 'adjusted_amount',
            cellStyle: {
                textAlign: 'right',
                paddingRight: '150px',
                fontSize: cellStyle.fontSize,
            },
            render: (rowData) => (rowData?.adjusted_amount || 0).toFixed(2),
        },
        {
            title: 'Amount',
            field: 'amount',
            cellStyle: {
                textAlign: 'right',
                paddingRight: '150px',
                fontSize: cellStyle.fontSize,
            },
            render: (rowData) => (rowData?.amount || 0).toFixed(2),
        },
      ]

    const expenseColumns = [
        {
            title: 'Date',
            field: 'date',
            render: (rowData) => moment(rowData.date).format("DD/MM/yyyy")
        },
        { title: 'Invoice Number', field: 'invoice_number' },
        { title: 'Vendor Name', field: 'company_name' },
        { title: 'Type', field: 'type' },
        {
            title: 'Input Gst',
            field: 'gst_amount',
            render: (rowData) => parseFloat(rowData.gst_amount).toFixed(2),
        },
        {
            title: 'Amount',
            field: 'amount',
            cellStyle: { textAlign: 'right', paddingRight: '70px', fontSize: cellStyle.fontSize },
            render: (rowData) => parseFloat(rowData.amount).toFixed(2),
        },
        {
            title: 'Total Amount',
            field: 'total_amount',
            cellStyle: { textAlign: 'right', paddingRight: '60px', fontSize: cellStyle.fontSize },
            render: (rowData) => parseFloat(rowData.total_amount).toFixed(2),
        },
        {
            title: 'Payment Status',
            field: 'status',
            cellStyle: {  fontSize: cellStyle.fontSize },
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
        const {appConfigData} = props;
        //const locationData = this.props.stocklocation.filter(f => f.location_id === data.location_id)
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
//   const createMail = (custData, invoice_number, sales_items, email, soDate) => {
//     const context = this.context;
//     // const data = {
//     //   custData,
//     //   invoice_number,
//     //   sales_items,
//     //   email,
//     //   appConfigData:this.state.appConfigData,
//     //   soDate
//     // }
//     const data = {
//       appConfigData: this.state.appConfigData,
//       custData,
//       invoice_number: invoice_number,
//       sales_items: sales_items,
//       email: email,
//       no_sms: true,
//       posSale: true,
//       sales_payments: [],
//       soDate: soDate,
//       sale_id: this.state.cnPopupData.sale_id,
//     };
//     this.props.sendMail(data, context.setLoaderStatusHandler);
//     this.setState({
//       cnPopupData: {...this.state.cnPopupData, Dopen: false}
//     })
//   };
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
   const handlePrint = () =>{
    try{
      pdfMake.fonts = {
        Poppins: {
          normal:   'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Regular.ttf',
          bold:     'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Bold.ttf',
          italics:  'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Italic.ttf',
          bolditalics: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-BoldItalic.ttf'
        }
      }
      let data = reviveLayout(po_temp)
      pdfMake.createPdf(data).getBase64((base64Pdf) => {
        function base64ToBlob(base64, mimeType) {
         const byteChars = atob(base64);
         const byteNumbers = new Array(byteChars.length);
         for (let i = 0; i < byteChars.length; i++) {
           byteNumbers[i] = byteChars.charCodeAt(i);
         }
         const byteArray = new Uint8Array(byteNumbers);
         return new Blob([byteArray], { type: mimeType });
       }
       
       // 2. Generate Blob and object URL
       const pdfBlob = base64ToBlob(base64Pdf, 'application/pdf');
       const blobUrl = URL.createObjectURL(pdfBlob); 
       
       // 3. Create hidden iframe and print
       const iframe = document.createElement('iframe');
       iframe.style.display = 'none';
       iframe.src = blobUrl; // blob URL same origin
       document.body.appendChild(iframe);
       
       iframe.onload = () => {
         iframe.contentWindow.focus();
         iframe.contentWindow.print(); 
       };
       });
    }catch(err){
     return err
    }
  }
  const handleDownload = () =>{
    try{
      pdfMake.fonts = {
        Poppins: {
          normal:   'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Regular.ttf',
          bold:     'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Bold.ttf',
          italics:  'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Italic.ttf',
          bolditalics: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-BoldItalic.ttf'
        }
      }
      let data = reviveLayout(po_temp)
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-'); // Format: 2025-05-20T12-30-15-123Z
      const fileName = `PO-${timestamp}.pdf`;
      pdfMake.createPdf(data).download(fileName)
    }catch(err){
     return err
    }
  }
    return (
        <>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: 'red', mb: 1 }}>
                <InfoOutlineIcon sx={{ mr: 0.5 }} fontSize="small" />
                <span> Data shown is for the current month only.</span>
            </Typography>
            <Grid container spacing = {3}>
            {
                    (props.customerType === 1 || props.customerType === 0) &&
                <Grid size={12}>
                    <Accordion expanded = {open.invoices} onChange = {handleToggle('invoices')}>
                        <AccordionSummary
                            expandIcon = {<ExpandMoreIcon />}
                            aria-controls="panel1-content"
                            id="panel1-content"
                        >
                            <Typography>Invoices</Typography>
                        </AccordionSummary>

                        <AccordionDetails>
                            <TransactionsTable
                                columns = {invoiceColumns}
                                tableData = {props.customerType === 2 ? purchaseOrderByVendor : salesInvoiceByCustomer.filter(sale => sale.invoice_number !== null)}
                                saleData = {props.customerSalesDetailById}
                                onRowClick={(rowData) => {
                                    console.log("Row clicked:", rowData)
                                    navigate('/sales/invoices', {
                                        state: {
                                            triggeredByTransaction: true,
                                            rowData,
                                            // onRowClick: true, // sending this state value
                                        }
                                    });
                                }}
                            />
                        </AccordionDetails>
                    </Accordion>
                </Grid>
}
                {
                    (props.customerType === 1 || props.customerType === 0) &&
                    <Grid size={12}>
                        <Accordion expanded = {open.customerPayments} onChange = {handleToggle('customerPayments')}>
                            <AccordionSummary
                                expandIcon = {<ExpandMoreIcon />}
                                aria-controls="panel1-content"
                                id="panel1-content-2"
                            >
                                <Typography>Customer Receipts</Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                                <TransactionsTable
                                    columns = {customerPaymentColumns}
                                    tableData = {customerPayments}
                                    saleData = {props.customerSalesDetailById}
                                />
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                }

                {
                    props.customerType === 2 &&
                    <Grid size={12}>
                        <Accordion expanded = {open.vendorPayments} onChange = {handleToggle('vendorPayments')}>
                            <AccordionSummary
                                expandIcon = {<ExpandMoreIcon />}
                                aria-controls="panel1-content"
                                id="panel1-content-3"
                            >
                                <Typography>Vendor Payments</Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                                <TransactionsTable
                                    columns = {vendorPaymentColumns}
                                    tableData = {vendorPayments}
                                    saleData = {props.customerSalesDetailById}
                                />
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                }

                {
                    props.customerType === 1 &&
                    <Grid size={12}>
                        <Accordion expanded = {open.quotes} onChange = {handleToggle('quotes')}>
                            <AccordionSummary
                                expandIcon = {<ExpandMoreIcon />}
                                aria-controls="panel1-content"
                                id="panel1-content-4"
                            >
                                <Typography>Quotes</Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                                <TransactionsTable
                                    columns = {quotationColumns}
                                    tableData = {quotationByCustomer.data}
                                    saleData = {props.customerSalesDetailById}
                                />
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                }

                {
                    props.customerType === 1 &&
                    <Grid size={12}>
                        <Accordion expanded = {open.salesOrders} onChange = {handleToggle('salesOrders')}>
                            <AccordionSummary
                                expandIcon = {<ExpandMoreIcon />}
                                aria-controls="panel1-content"
                                id="panel1-content-5"
                            >
                                <Typography>Sale Orders</Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                                <TransactionsTable
                                    columns = {saleOrderColumns}
                                    tableData = {saleOrderByCustomer}
                                    saleData = {props.customerSalesDetailById}
                                />
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                }
                
                {
                    props.customerType === 2 &&
                    <Grid size={12}>
                        <Accordion expanded = {open.purchaseOrder} onChange = {handleToggle('purchaseOrder')}>
                            <AccordionSummary
                                expandIcon = {<ExpandMoreIcon />}
                                aria-controls="panel1-content"
                                id="panel1-content-6"
                            >
                                <Typography>Purchase Order</Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                                <TransactionsTable
                                    columns = {purchaseOrderColumns}
                                    tableData = {purchaseOrderByVendor}
                                    saleData = {props.customerSalesDetailById}
                                />
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                }

                {
                    props.customerType === 1 &&
                    <Grid size={12}>
                        <Accordion expanded = {open.deliveryChallans} onChange = {handleToggle('deliveryChallans')}>
                            <AccordionSummary
                                expandIcon = {<ExpandMoreIcon />}
                                aria-controls="panel1-content"
                                id="panel1-content-7"
                            >
                                <Typography>Delivery Challan</Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                                <TransactionsTable
                                    columns = {deliveryChallanColumns}
                                    tableData = {deliveryChallanByCustomer}
                                    saleData = {props.customerSalesDetailById}
                                />
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                }

                {
                (props.customerType === 1 || props.customerType === 0) &&
                    <Grid size={12}>
                        <Accordion expanded = {open.creditNote} onChange = {handleToggle('creditNote')}>
                            <AccordionSummary
                                expandIcon = {<ExpandMoreIcon />}
                                aria-controls="panel1-content"
                                id="panel1-content-8"
                            >
                                <Typography>Credit Note</Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                                <TransactionsTable
                                    columns = {debitCreditNotesColumns}
                                    tableData = {recentCreditDebitNotes}
                                    saleData = {props.customerSalesDetailById}
                                />
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                }

                {/* <Grid size={12}>
                    <Accordion expanded = {open.receiptEntry} onChange = {handleToggle('receiptEntry')}>
                        <AccordionSummary
                            expandIcon = {<ExpandMoreIcon />}
                            aria-controls="panel1-content"
                            id="panel1-content-9"
                        >
                            <Typography>Receipt Entry</Typography>
                        </AccordionSummary>

                        <AccordionDetails>
                            <TransactionsTable
                                columns = {ReceiptColumns}
                                tableData = {receiptEntryData}
                            />
                        </AccordionDetails>
                    </Accordion>
                </Grid> */}

                {
                    props.customerType === 2 &&
                    <Grid size={12}>
                        <Accordion expanded = {open.debitNote} onChange = {handleToggle('debitNote')}>
                            <AccordionSummary
                                expandIcon = {<ExpandMoreIcon />}
                                aria-controls="panel1-content"
                                id="panel1-content-10"
                            >
                                <Typography>Debit Note</Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                                <TransactionsTable
                                    columns = {debitCreditNotesColumns}
                                    tableData = {recentCreditDebitNotes}
                                    saleData = {props.customerSalesDetailById}
                                />
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                }

                {
                    props.customerType === 2 &&
                    <Grid size={12}>
                        <Accordion expanded = {open.expenses} onChange = {handleToggle('expenses')}>
                            <AccordionSummary
                                expandIcon = {<ExpandMoreIcon />}
                                aria-controls="panel1-content"
                                id="panel1-content-11"
                            >
                                <Typography>Expenses</Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                                <TransactionsTable
                                    columns = {expenseColumns}
                                    tableData = {expensesByVendor}
                                    saleData = {props.customerSalesDetailById}
                                />
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                }

            </Grid>
            {/* {templateOpen && (
                <CreditDebitNoteTemplate
                    open={templateOpen}
                    handleClose={() => setTemplateOpen(false)}
                    templateData={templateData}
                />
            )} */}
            {templateOpen && (
                             <CnDialog
                             open={templateOpen}
                              appConfigData={appConfigData}
                              //createMail={this.createMail}
                              custType={type === "VENDOR" ?  'VENDOR' : 'CUSTOMER'}
                              custData={ type === "VENDOR" ? vendor_id_data : customer_id_data }
                              invoice={templateData?.sequence_number}
                              soDate={templateData?.created_at}
                              sales_items={manualsalespurchase}
                              handleClose={() => setTemplateOpen(false)}
                              manualnote = {templateData}
                           />)}
            {type === "VENDOR" &&
                            <Dialog
                              fullWidth
                              maxWidth='md'
                              open={invoicePopup}
                              aria-labelledby='alert-dialog-title'
                              aria-describedby='alert-dialog-description'
                              PaperProps={{
                                style: {
                                  backgroundColor: 'white',
                                },
                              }}
                              
                            >
                              <DialogContent
                                // ref={(el) => (this.componentRef = el)}
                                style={{
                                 display: "block",
                                  overflow:'hidden',
                                  backgroundColor: 'white'
                                }}
                                // className='tab_screen2'
                              >
                                        {/* <Invoice
                                            appConfigData={appConfigData}
                                            note={''}
                                            custType={type}
                                            custData={invoiceData}
                                            invoice={invoiceData?.po_number}
                                            soDate={invoiceData?.po_date}
                                            sales_items={invoiceData?.receivings_items}
                                            status={invoiceData?.status}
                                            total={invoiceData?.total}
                                            due_amount={invoiceData?.due_amount}
                                            open={invoicePopup}
                                            tcs={invoiceData?.tcs}
                                            tds={invoiceData?.tds}
                                            tcspercent={invoiceData?.tcs_percent}
                                            tdspercent={invoiceData?.tds_percent}
                                            dc_number={null}
                                            pageType = {"TRANSACTIONS"}
                                            handleClose={handleInvoiceClose}

                                        /> */}
                                        <CommonInvoiceTemplate/>
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
                                <Button
                                    variant='contained'
                                    onClick={createMail}
                                    >
                                      <MailIcon sx={{ mr: 1 }} fontSize='small' /> SEND PO
                                    </Button>
                                <Button variant='contained' onClick={handleDownload}>
                                       Download
                                    </Button>
                                <Button variant='contained' onClick={handlePrint}>
                                       Print
                                    </Button>
                                </DialogActions>
                            </Dialog>
            }
            <Dialog
              fullWidth
              maxWidth='xl'
              open={quotationOpen}
              aria-labelledby='alert-dialog-title'
              aria-describedby='alert-dialog-description'
            >
              <DialogContent
                style={{
                  display: "block",
                }}
              >
                <QuotationTemp  
                data = {quotationData} 
                company = {quotationByCustomer.companyDetails} 
                />

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
              </DialogActions>
            </Dialog>
            { type === "CUSTOMER" && <InvoiceDialog
              appConfigData={appConfigData}
              custType={'CUSTOMER'}
              custData={invoiceData}
              invoice={invoiceData.invoice_number}
              soDate={invoiceData.soDate}
              shipTo={invoiceData.shipping_details}
              shipping_details={invoiceData.shipping_details}
              soNumber={invoiceData.so_number}
              sales_items={invoiceData.sales_items || []}
              open={invoicePopup}
              posSale={true}
              note={invoiceData.note}
              handle_Einvoice={invoiceData.E_invoice}
              termsAndConditionsList={termsAndConditions}
              tcs={invoiceData?.tcs}
              tds={invoiceData?.tds}
              tcspercent={invoiceData?.tcspercent}
              tdspercent={invoiceData?.tdspercent}
              isRoundedOffNegative={invoiceData?.isRoundedOffNegative || 0}
              rounded_off={invoiceData?.rounded_off || 0}
              dc_number={invoiceData?.dc_number}
              E_invoice={invoiceData.E_invoice}
              handleClose={handleInvoiceClose}
              pageType = {"TRANSACTIONS"}
          />
}
        </>
    );
}

export default Transactions