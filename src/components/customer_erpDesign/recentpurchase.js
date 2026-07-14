import React, {useEffect, useState, useRef, useContext} from 'react';
import {Table, Button, Typography, IconButton} from '@mui/material';
import {useDispatch, useSelector} from 'react-redux';
import {
  listSalesOutstandingAction,
  sendMail,
} from '../../redux/actions/sales_actions';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {listSalesAction, receiptEntry} from '../../redux/actions/sales_actions';
import { GetCustomerErpSales } from '../../redux/actions/pos_sale_actions';
import {listCustomerAction} from '../../redux/actions/customer_actions';
import {listProductAction} from '../../redux/actions/product_actions';
import PaymentDialog from '../../pages/sales/paymentSalesPurchase/Dialog';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import NoRecordFound from '../Layout/NoRecordFound';
import {getAppConfigDataAction} from '../../redux/actions/app_config_actions';
import InvoiceDialog from '../../pages/sales/sales/InvoiceDialog';
import {Grid} from '@mui/material';
import CreateNewButtonContext from '../../context/CreateNewButtonContext';
import MaterialTable from 'utils/SafeMaterialTable';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import {sendNtfy} from '../../firebase/firebase.service';
import {getLoginRoleAction} from '../../redux/actions/userRole_actions';
import Cookies from 'universal-cookie';
import notificationType from '../../firebase/notify_type';
import { CreateNotificationAction } from 'redux/actions/notification_actions';
import { getDateTimeFormat } from 'utils/getTimeFormat';
import apiCalls from 'utils/apiCalls';
import { getsessionStorage } from 'pages/common/login/cookies';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle } from 'utils/pageSize';



function Row(props) {
  const {customer_erp_details,invoiceFunction, contactType} = props;
  const dispatch = useDispatch();

  let cust_child = customer_erp_details[0] ? customer_erp_details[0] : {};
  let cust_items = customer_erp_details[0] ? customer_erp_details[0] : {};

  return (
    <React.Fragment>
      <CreateNewButtonContext.Consumer>
        {({setModalStatusHandler, setModalTypeHandler, drawerOpen, setLoaderStatusHandler, commoncookie}) => (
          <div>
              <MaterialTable
                actions={
                  [
                    // {
                    //   icon: 'delete',
                    //   tooltip: 'Delete',
                    //   onClick: (event, rowData) => this.handledialog(rowData.customer_id,rowData.supplier_id)
                    // },
                  ]
                }
                options={{
                  headerStyle,
                  cellStyle,
                  exportButton: false,
                  search: false,
                  filtering: false,
                  maxBodyHeight: 'calc(100vh - 250px)',
                  pageSize: 10,
                  paging: false,
                  // pageSizeOptions: [20, 50, 100],
                  actionsColumnIndex: -1,
                  tableLayout: 'auto',
                  tableWidth: 'full',
                  // exportMenu: [
                  //   {
                  //     label: 'Export PDF',
                  //     exportFunc: (cols, datas) =>
                  //       ExportPdf(cols, datas, 'RecentBillsData'),
                  //   },
                  //   {
                  //     label: 'Export CSV',
                  //     exportFunc: (cols, datas) =>
                  //       ExportCsv(cols, datas, 'RecentBillsData'),
                  //   },
                  // ],
                }}
                columns={[
                  {
                    field: 'invoice_date',
                    title: 'Invoice Date',
                  },
                  {
                    field: 'invoice_number',
                    title: 'Invoice',
                  },
                //   {
                //     field: 'delivered_date',
                //     title: 'Delivered Date',
                //   },
                  {
                    field: 'product_name',
                    title: 'Products',
                    // render: rowData => <div >{cust_child.item_names?.filter(f => rowData.sale_id === f.sale_id).map(n => n.name).join(', ')} </div>
                  },
                //   {
                //     field: 'delivered_qty',
                //     title: 'Delivered qty',
                //   },
                  {
                    field: 'total',
                    title: 'Value',
                  },
                  {
                    
                    title: 'Download',
                    render: (rowData) => (
                      <div>
                        <IconButton
                            onClick={(event) =>{
                              // const data = { 
                              //   brand: null,
                              //   category: null,
                              //   employee_id: commoncookie,
                              //   location_id: null,
                              //   payment_type: null,
                              //   pageCount: 0,
                              //   numPerPage:  2,
                              //   sale_id:rowData.sale_id
                              // };
                              // dispatch(GetCustomerErpSales( 
                              //   setModalTypeHandler,
                              //   setLoaderStatusHandler,
                              //   data,
                              //   ))
                                
                                invoiceFunction(rowData);
                              // event.stopPropagation();
                              //handleSmsMailConfiguration();
                            }
                            }
                          >
                            <VisibilityIcon color='success' />
                          </IconButton>
                        {/* {rowData.total !== rowData.received_amount &&
                        rowData.total > rowData.received_amount ? (
                          <Button
                            onClick={() =>
                              props.pendingPayment(
                                props.getSalesDetails(rowData.sale_id),
                                cust_child.last_bill_child,
                              )
                            }
                            startIcon={<VisibilityIcon color='warning' />}
                          >
                            Pending
                          </Button>
                        ) : (
                          <Button
                            startIcon={
                              <AssignmentTurnedInIcon color='success' />
                            }
                          >
                            Paid
                          </Button>
                        )} */}
                      </div>
                    ),
                  },
                //   {
                //     field: 'due_days',
                //     title: 'Due Days',
                //   },
                ]}
                data={cust_child.individual_bill || []}
                title={<Typography variant='h6'>Recent Purchase</Typography>}
              />
          </div>
        )}
      </CreateNewButtonContext.Consumer>
    </React.Fragment>
  );
}

export default function RecentPurchase(props) {
  const dispatch = useDispatch();
  const {
    // salesReducer: {sale_outstanding},
    // customerReducer: {customer},
    // productReducer: {product},
    // salesReducer: {sales},
    // appConfigReducer: {app_config_data},
    posSaleReducer : {customer_individual_sales},
  } = useSelector((state) => state);
  const {customer_erp_details, contactType} = props;
  const tempinitsform = useRef(null);

  const [Tdata, setTdata] = useState([]);
  const [received_amount, setReceived_amount] = useState(0);
  const [paymentOpen, setPaymentOpen] = useState(false);
  // const [sale_id,setSale_id] = useState("")
  const [sales_items, setSalesItems] = useState([]);
  const [getCustomer, setGetCustomer] = useState([]);
  const [selectionModel, setSelectionModel] = useState([]);
  const [getPay, setgetPay] = useState([]);
  const [appConfigData, setAppConfigData] = useState({});
  const [invoicecall, Setinvoicecall] = useState(false)
  const [manualNoteSchemes, setManualNoteSchemes] = useState([]);

  const [popUpdata, setPopupData] = useState({
    invoice: '',
    custData: {},
    soDate: '',
    sales_items: [],
    Dopen: false,
    customer_id: '',
    sale_id: '',
  });
  const tempinitsformVal = useRef(null);
  const {
    setModalStatusHandler,
    setModalTypeHandler,
    selectData,
    setselectData,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(CreateNewButtonContext);


  const initsform = () => {
    
    // apiCalls(
    //     setModalTypeHandler,
    //     setLoaderStatusHandler,
    //     dispatch(listSalesOutstandingAction(commoncookie, headerLocationId)),
    //     dispatch(listSalesAction(
    //         commoncookie,
    //         headerLocationId,
    //         setModalTypeHandler,
    //         setLoaderStatusHandler,
    //       ),
    //     ),
    //     // dispatch(
    //     //   listProductAction(
    //     //     () => {},
    //     //     () => {},
    //     //   ),
    //     // ),
    //     dispatch(
    //       listCustomerAction(
    //         () => {},
    //         () => {},
    //       ),
    //     ),
    //     // dispatch(getAppConfigDataAction())
    // );
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
  }, []);

  const getAppConfigData = async (data) => {
    const companyName = props.app_config_data.filter((f) => f.key_name == 'company.name');
    // const fullAddress = app_config_data.filter(f=>f.key_name =='address.area');
    // const city = app_config_data.filter(f=>f.key_name =='address.city');
    // const emailData = app_config_data.filter(f=>f.key_name =='address.email');
    const fullAddress = data?.LocationAddress  || '';
    const city = data?.LocationCity || '';
    const emailData = data?.LocationEmail || '';
    const gstinData = props.app_config_data.filter(
      (f) => f.key_name == 'company.gstin/uin',
    );
     const companyMobile = data?.LocationPhonenumber || '';
    // const companyMobile = app_config_data.filter(f=>f.key_name =='company.mobile');
      const state =    data?.LocationState || '';
    // const state = app_config_data.filter(f=>f.key_name =='address.state')
    // const state =
    //   data?.state.concat(',', data?.zip === null ? '' : data?.zip) || '';
    const web = props.app_config_data.filter((f) => f.key_name == 'web.base.url');

    setAppConfigData ({
        companyName:
          companyName.length > 0 && typeof companyName === 'object'
            ? companyName[0].value
            : companyName,
        companyAddress:
          fullAddress.length > 0 && typeof fullAddress === 'object'
            ? fullAddress[0].value
            : fullAddress,
        companyEmail:
          emailData.length > 0 && typeof emailData === 'object'
            ? emailData[0].value
            : emailData,
        gstin: gstinData.length > 0 ? gstinData[0].value : '',
        companyMobile:
          companyMobile.length > 0 && typeof companyMobile === 'object'
            ? companyMobile[0].value
            : companyMobile,
        city:
          city.length > 0 && typeof city === 'object' ? city[0].value : city,
        state:
          state.length > 0 && typeof state === 'object'
            ? state[0].value
            : state,
        web: web.length > 0 ? web[0].value : '',
      
    });
  };
  // const getAppConfigData = () => {
  //   const companyName = app_config_data.filter((f) => f.key_name == 'company.name');
  //   const fullAddress = app_config_data.filter(
  //     (f) => f.key_name == 'address.fulladdress',
  //   );
  //   const emailData = app_config_data.filter((f) => f.key_name == 'company.email');
  //   const gstinData = app_config_data.filter(
  //     (f) => f.key_name == 'company.gstin/uin',
  //   );
  //   const companyMobile = app_config_data.filter(
  //     (f) => f.key_name == 'company.mobile',
  //   );
  //   const state = app_config_data.filter((f) => f.key_name == 'address.state');

  //   setAppConfigData({
  //     companyName: companyName.length > 0 ? companyName[0].value : '',
  //     companyAddress: fullAddress.length > 0 ? fullAddress[0].value : '',
  //     companyEmail: emailData.length > 0 ? emailData[0].value : '',
  //     gstin: gstinData.length > 0 ? gstinData[0].value : '',
  //     companyMobile: companyMobile.length > 0 ? companyMobile[0].value : '',
  //     state: state.length > 0 ? state[0].value : '',
  //   });
  // };

  const initsformVal = () => {
    getAppConfigData();
  };
  tempinitsformVal.current = initsformVal;
  useEffect(() => {
    tempinitsformVal.current();
  }, [props.app_config_data]);

  const setpaymentOpen = (data) => {
    setPaymentOpen(data);
    setTdata([]);
  };

  const paymentValidate = (type, receiptDate) => {
    const receivedAmount =
      Tdata.reduce(function (acc, obj) {
        return acc + +obj.payment_amount;
      }, getCustomer.creditNote_balance) + received_amount;
    let indiviTotal = receivedAmount;
    const receivables = selectionModel.map((d) => {
      const newObj = {};
      const sub = indiviTotal - (+d.total - +d.paid_amount);



      if (Math.sign(sub) === 1 || Math.sign(sub) === 0) {
        newObj.received_amount = +d.total;
        newObj.sales_payment = Tdata.map((payment) => ({
          ...payment,
          ...(!Tdata.length && {
            employee_id: commoncookie,
            payment_type: 'Credit Note',
            reference_code: '',
            cash_refund:0
          })
        }));
        indiviTotal = sub;
      } else {
        newObj.received_amount = +d.paid_amount + indiviTotal;
        newObj.sales_payment = Tdata.map((payment) => ({
          ...payment,
          ...(!Tdata.length && {
            employee_id: commoncookie,
            payment_type: 'Credit Note',
            reference_code: '',
            cash_refund:0
          })
        }));
        indiviTotal = 0;
      }
      newObj.sale_id = d.id;
      newObj.location_id = headerLocationId !== 'null' ? headerLocationId : d.location_id;

      return newObj;
    });
    const data = {
      saleUpdate: receivables,
      updateCreditNote: {
        manualNoteSchemes : manualNoteSchemes.filter(i => i.selected && i.advance_id === undefined),
        advanceledger : manualNoteSchemes.filter(i => i.selected && i.advance_id !== undefined),
        customer_id: getCustomer.customer_id,
        customer_ledger_id: getCustomer.ledger_id,
        company_name : getCustomer.company_name || `${getCustomer.first_name} ${getCustomer.last_name}`
      },
      userConfig: { user_id: commoncookie, location_id: headerLocationId },
      receiptDataEntry: {
        sale_id: receivables[0].sale_id,
        customer_id: getCustomer.customer_id,
        payment_amount: receivables[0].received_amount,
        receiptDate: receiptDate
      },
      location_id: headerLocationId,
      specialNumber: receivables.map((d) => d.sale_id).join(','),
      note: 'Sales Payment',
      referenceNumber: Tdata,
      voucherTypeId: 1,
    };

    // const accountTransaction = [];
    // receivables.map(sD => {
    //   const { received_amount, sales_payment } = sD
    //   chartOfAccounts.forEach((d) => {
    //     const { id, creditSign, debitSign } = d;
    //     const dd = { accountId: id, description: "salesPayment Entry" };
    //     if (sales_payment.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id).length) {
    //       let Recevable = sales_payment.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id)?.[0] || {}

    //       dd.amount = debitSign * Recevable?.payment_amount || 0
    //       accountTransaction.push(dd);
    //     } else if (sales_payment.filter(f => f.ledger_id === id).length) {
    //       let Recevable = sales_payment.filter(f => f.ledger_id === id)?.[0] || {}
    //       dd.amount = creditSign * Recevable?.payment_amount || 0
    //       accountTransaction.push(dd);
    //     }
    //   });
    // })
    // data.accountTransaction = accountTransaction;
    setReceData(receivables);
    
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        receiptEntry(
          data,
          () => { },
          setModalTypeHandler,
          setLoaderStatusHandler,
          (response, resdata) => {
            if (response === 200) {
              //  setResdata(resdata)
              setpaymentOpen(false);
              setTdata([]);
              dispatch(
                consolidatedReceivings(
                  setModalTypeHandler,
                  setLoaderStatusHandler,
                ),
              );
              notifyFunction(resdata.data);
              //ledgerApi(data.saleUpdate);
            }
          },
        ),
      )
    );
    //this.setState({paymentOpen: false, Tdata: []})
  };
  // const paymentValidate = () => {
  //   const receivedAmount =
  //     Tdata.reduce(function (acc, obj) {
  //       return acc + +obj.payment_amount;
  //     }, 0) + received_amount;

  //   const data = {
  //     received_amount: receivedAmount,
  //     sales_payment: Tdata,
  //     userConfig: {user_id: commoncookie, location_id: headerLocationId},
  //   };


  //   apiCalls(
  //     setModalTypeHandler,
  //     setLoaderStatusHandler,
  //     dispatch(
  //       receiptEntry(
  //           [0].id,
  //         data,
  //         () => {},
  //         () => {},
  //         () => {},
  //         (response) => {
  //           // const cookies = new Cookies();
  //           let storage = getsessionStorage()
  //           let emp_id = storage?.employee_id || '';
  //           if (response === 200) {
  //             dispatch(
  //               getLoginRoleAction(emp_id, (role_name, token, content) => {
  //                 if (role_name !== 'Administrator') {
  //                   let notify_type = notificationType('sales payment');
  //                   let notify_content = content?.filter(
  //                     (m) => m.notification_type === notify_type,
  //                   );
  //                   if (notify_content.length) {
  //                     sendNtfy(
  //                       token,
  //                       notify_content[0]?.title,
  //                       notify_content[0]?.body_msg,
  //                     );
  //                     dispatch(CreateNotificationAction({content_body: "", title: notify_content[0]?.title, time: getDateTimeFormat(new Date()), "active": "1"}))
  
  //                   }
  //                 }
  //               }),
  //             );
  //           }
  //         },
  //       ),
  //     )
	//   );
  //   setpaymentOpen(false);
  // };

  const getSalesDetails = (id) => {
    if (id !== '' && typeof id !== 'undefined') {
      let salesDetail = props.sales.filter((s) => s.sale_id === id);
      return salesDetail.length > 0 ? salesDetail[0] : {};
    } else {
      return {};
    }
  };

  const pendingPayment = (data, childRow) => {
    const {
      customer_id,
      sales_items: old_sales,
      received_amount,
      sale_id,
    } = data;
    const getCustomer = props.customer.filter(
      (d) => customer_id === d.customer_id,
    )[0];
    const sales_items = old_sales.map((d) => {
      const taxes =
      props.product.filter((t) => t.item_id === d.item_id)[0].taxes || [];
      d.taxes = taxes;
      return d;
    });
    let payData = [];
    childRow.map((c) => {
      return payData.push({
        id: c.sale_id,
        po_number: c.invoice_number,
        paid_amount: c.received_amount,
        total: c.total,
      });
    });
    setgetPay(payData);

    setReceived_amount(received_amount);
    setGetCustomer(getCustomer);
    setSalesItems(sales_items);
    setPaymentOpen(true);
  };
  // const invoiceFunction = async (data) => {

  //   const custData = await customer.filter(
  //     (d) => data.customer_id === d.customer_id,
  //   );
  //   const sales_items = await sales
  //     .filter((f) => f.sale_id === data.sale_id)[0]
  //     .sales_items.map((d) => {
  //       const taxes =
  //         product.filter((t) => t.item_id === d.item_id)[0]?.taxes || [];
  //       d.taxes = taxes;
  //       return d;
  //     });
  //   await setPopupData({
  //     invoice: data.invoice_number,
  //     custData: custData[0],
  //     soDate: data.sale_time,
  //     sales_items: sales_items,
  //     Dopen: true,
  //     customer_id: data.customer_id,
  //     sale_id: data.sale_id,
  //     note: data.note,
  //     sales_payments: data.sales_payments,
  //   });
  // };
  useEffect(()=>{ (async () => {
  if(customer_individual_sales.length > 0){
    const custData = await props.customer.filter(
      (d) => customer_individual_sales[0]?.customer_id === d.customer_id,
    );
    const sales_items = await customer_individual_sales[0]?.sales_items.map((d) => {
      const taxes =
      props.product.filter((t) => t.item_id === d.item_id)[0]?.taxes ||
        [];
      d.taxes = taxes;
      return d;
    });
   await getAppConfigData(customer_individual_sales?.[0] || {});
   await  setPopupData({
      invoice: customer_individual_sales?.[0].invoice_number,
      custData: custData[0],
      soDate: customer_individual_sales[0]?.sale_time,
      sales_items: sales_items,
      Dopen: true,
      customer_id: customer_individual_sales[0]?.customer_id,
      sale_id: customer_individual_sales[0]?.sale_id,
      note: customer_individual_sales[0]?.note,
      sales_payments: customer_individual_sales[0]?.sales_payments,
      invoicefile: customer_individual_sales[0]?.invoice_file,
    });
  }
  
  })();
},[customer_individual_sales])
  const invoiceFunction = async (data) => {
    const datas = { 
      sale_id: data.sale_id,
      brand: "null",
      category: "null",
      employee_id: commoncookie,
      location_id: "null",
      payment_type: "null",
      pageCount: 0,
      numPerPage:  20
      
    };
    try {
      await apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler, dispatch(GetCustomerErpSales( 
        setModalTypeHandler,
        setLoaderStatusHandler,
        datas,
        ))
       )
       await Setinvoicecall(true)

    }
    catch (err) {
      // 
    }
    
  };
  const createMail = () => {
    const data = {
      custData: popUpdata.custData,
      invoice_number: popUpdata.invoice,
      sales_items: popUpdata.sales_items,
      email: popUpdata.custData.email,
      appConfigData: props.app_config_data,
    };
    dispatch(sendMail(data, () => {}));
    setPopupData({...popUpdata, Dopen: false});
  };

  return (
    <>
      
      {/* <InvoiceDialog
        appConfigData={appConfigData}
        createMail={createMail}
        custType={'CUSTOMER'}
        custData={popUpdata.custData}
        invoice={popUpdata.invoice}
        soDate={popUpdata.soDate}
        sales_items={popUpdata.sales_items}
        open={popUpdata.Dopen}
        handleClose={() => setPopupData({...popUpdata, Dopen: false})}
        posSale={true}
        mail_configuration={props.mail_configuration}
      /> */}
      <InvoiceDialog
              sales_payments={popUpdata.sales_payments}
              appConfigData={appConfigData}
              note={popUpdata.note}
              addNote={popUpdata.addNote}
              createMail={createMail}
              custType={'CUSTOMER'}
              posSale={true}
              custData={popUpdata.custData}
              invoice={popUpdata.invoice}
              soDate={popUpdata.soDate}
              sales_items={popUpdata.sales_items}
              open={popUpdata.Dopen}
              handleSubmit={()=>{}}
              handleClose={() => setPopupData({...popUpdata, Dopen: false})}
              invoicepos={true}
              stockaddress={[]}
              mail_configuration={props.mail_configuration}
            />
      {/* <h3>Recent Bills</h3> */}
      <Row
        customer_erp_details={customer_erp_details}
        getSalesDetails={getSalesDetails}
        pendingPayment={pendingPayment}
        invoiceFunction={invoiceFunction}
        contactType={contactType}
      />

      <PaymentDialog
        getPay={getPay}
        status={'edit'}
        activeINV={'INV'}
        selectionModel={selectionModel}
        setSelectionModel={setSelectionModel}
        received_amount={received_amount}
        handleSubmit={paymentValidate}
        custType={'CUSTOMER'}
        Tdata={Tdata}
        setTdata={setTdata}
        custData={getCustomer}
        sales_items={sales_items}
        paymentOpen={paymentOpen}
        setpaymentOpen={setpaymentOpen}
        manualNoteSchemes={manualNoteSchemes}
        setManualNoteSchemes={setManualNoteSchemes}
      />
    </>
  );
}

