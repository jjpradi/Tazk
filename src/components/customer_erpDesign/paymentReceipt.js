import React, {useEffect, useState, useRef, useContext} from 'react';
import {Table, Button, Typography, Card, Tooltip} from '@mui/material';
import {useDispatch, useSelector} from 'react-redux';
import {
  listSalesOutstandingAction,
  sendMail,
} from '../../redux/actions/sales_actions';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import {listSalesAction, receiptEntry} from '../../redux/actions/sales_actions';
import {listCustomerAction} from '../../redux/actions/customer_actions';
import {listProductAction} from '../../redux/actions/product_actions';
import PaymentDialog from '../../pages/sales/paymentSalesPurchase/Dialog';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import NoRecordFound from '../Layout/NoRecordFound';
import {getAppConfigDataAction} from '../../redux/actions/app_config_actions';
import InvoiceDialog from '../../pages/sales/sales/InvoiceDialog';
import MaterialTable from 'utils/SafeMaterialTable';
import CreateNewButtonContext from '../../context/CreateNewButtonContext';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import {sendNtfy} from '../../firebase/firebase.service';
import {getLoginRoleAction} from '../../redux/actions/userRole_actions';
import Cookies from 'universal-cookie';
import notificationType from '../../firebase/notify_type';
import { CreateNotificationAction } from 'redux/actions/notification_actions';
import { getDateTimeFormat } from 'utils/getTimeFormat';
import apiCalls from 'utils/apiCalls';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500 } from 'utils/pageSize';
import { getsessionStorage } from 'pages/common/login/cookies';
import CommonToolTip from 'components/ToolTip';
import { roleType } from 'utils/roleType';

function PaymentRow(props) {
  const {customer_erp_details, invoiceFunction, contactType} = props;

  let cust_child = customer_erp_details[0]
    ? customer_erp_details[0]?.payment_child?.map((e) => e)
    : [];
  let cust_parent = customer_erp_details[0]
    ? customer_erp_details[0]?.payment_parent
    : [];

  return (
    <React.Fragment>
      <CreateNewButtonContext.Consumer>
        {({drawerOpen}) => (
          <div>
            <Card  
            sx={{
              height: 'auto',
              // overflow: 'auto',
              // "&::-webkit-scrollbar": {
              //   width: 10,
              // },
              // "&::-webkit-scrollbar-track": {
              //   // boxShadow: "inset 0 0 5px black",
              //   borderRadius: 2,
              //   marginTop: '20px',
              //   marginBottom: '20px',
              // },
              // "&::-webkit-scrollbar-thumb": {
              //   background: "#B2B2B2",
              //   borderRadius: 2,
              // },
              // "&::-webkit-scrollbar-thumb:hover": {
              //   background: "#999",
              // }
            }}
            >
            {contactType === 'Customer' ? (
              <MaterialTable
                style={{height: '450px',overflow: 'auto'}}
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
                  search: false,
                  filtering: false,
                  maxBodyHeight: maxBodyHeight,
                  // minBodyHeight: '770px',
                  pageSize: 10,
                  actionsColumnIndex: -1,
                  paging: false,
                }}
                columns={[
                  {
                    field: 'invoice_date',
                    title: 'Invoice Date',
                    render: (r) => (
                      r.invoice_date?.slice(0,11)
                    )
                  },
                  {
                    field: 'invoice_number',
                    title: 'Invoice',
                  },
                  {
                    field: 'payment_time',
                    title: 'Payment Date',
                    render: (r) => (
                      r.payment_time.slice(0,11)
                    )
                  },
                  {
                    field: 'payment_type',
                    title: 'Mode of Payment',
                  },
                  {
                    field: 'total',
                    title: 'Total',
                  },
                  {
                    field: 'area',
                    title: 'Status',
                    render: (rowData) => (
                      <div>
                        {rowData.total !== rowData.received_amount &&
                        rowData.total > rowData.received_amount ? (
                          <Button
                            onClick={() =>
                              props.pendingPayment(
                                props.getSalesDetails(rowData.sale_id),
                                cust_child,
                              )
                            }
                            startIcon={<AssignmentLateIcon color='warning' />}
                          >
                            <Typography variant='h1'> Pending</Typography>
                          </Button>
                        ) : (
                          <Tooltip title = 'Payment done'>
                          <Button
                            startIcon={
                              <AssignmentTurnedInIcon color='success' />
                            }
                          >
                           
                          </Button>
                          </Tooltip>
                        )}
                      </div>
                    ),
                  },
                  {
                    field: 'due',
                    title: 'Due',
                    render: (rowData) => (
                      <div>{rowData.due > 0 ? rowData.due : 0} </div>
                    ),
                  },
                ]}
                data={cust_child?.map((r) => {
                  return r;
                })}
                title={<Typography variant='h6'>Recent Payments</Typography>}
              />
            ) : (
              // <MaterialTable
              //   actions={
              //     [
              //       // {
              //       //   icon: 'delete',
              //       //   tooltip: 'Delete',
              //       //   onClick: (event, rowData) => this.handledialog(rowData.customer_id,rowData.supplier_id)
              //       // },
              //     ]
              //   }
              //   options={{
              //     headerStyle,
              //     cellStyle,    
              //     maxBodyHeight: maxBodyHeight,
              //     minBodyHeight: 'auto',
              //     pageSize: 10,
              //     actionsColumnIndex: -1,
              //     tableLayout: 'auto',
              //     tableWidth: 'full',
              //     paging: false,
              //   }}
              //   columns={[
              //     {
              //       field: 'po_number',
              //       title: ' PO Number',
              //     },
              //     {
              //       field: 'receiving_time',
              //       title: 'PO date',
              //     },
              //     {
              //       field: 'invoice_date',
              //       title: 'Received Date',
              //     },
              //     {
              //       field: 'location_name',
              //       title: 'Location',
              //     },
              //     {
              //       field: 'status',
              //       title: 'Payment',
              //     },
              //     {
              //       field: 'total',
              //       title: 'Total',
              //     },
              //     {
              //       field: 'due_days',
              //       title: 'Due days',
              //     },
              //   ]}
              //   data={cust_child?.map((r) => {
              //     return r;
              //   })}
              //   title={<Typography variant='h6'>Recent Payments</Typography>}
              // />
              (<></>)
            )}
              
           </Card>
          </div>
        )}
      </CreateNewButtonContext.Consumer>
    </React.Fragment>
  );
}

export default function PaymentBills(props) {
  const dispatch = useDispatch();
  // const {
  //   // salesReducer: {sale_outstanding},
  //   // customerReducer: {customer},
  //   // productReducer: {product},
  //   // stockLocationReducer: {stocklocation},
  //   // salesReducer: {sales},
  //   // appConfigReducer: {app_config_data},
  // } = useSelector((state) => state);
  const {customer_erp_details, contactType} = props;
  const tempinitsform = useRef(null);

  const [Tdata, setTdata] = useState([]);
  const [received_amount, setReceived_amount] = useState(0);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [sales_items, setSalesItems] = useState([]);
  const [getCustomer, setGetCustomer] = useState([]);
  const [selectionModel, setSelectionModel] = useState([]);
  const [getPay, setgetPay] = useState([]);
  const [appConfigData, setAppConfigData] = useState({});
  
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

  const {
      productReducer: {product},
      appConfigReducer: {app_config_data},
    } = useSelector((state) => state);
  

   const storage = getsessionStorage()
    useEffect(()=>{ (async () => {
      await apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        storage?.company_type !== 5 && !product.length && dispatch(listProductAction(
          setModalTypeHandler, setLoaderStatusHandler
          )),   
        
        !app_config_data.length && dispatch(getAppConfigDataAction()),
    );
  
    })();
},[]);

  const initsform = () => {
    
    // apiCalls(
    //     setModalTypeHandler,
    //     setLoaderStatusHandler,
    //     dispatch(listSalesOutstandingAction(commoncookie, headerLocationId)),
    //     dispatch(
    //       listSalesAction(
    //         commoncookie,
    //         headerLocationId,
    //         setModalTypeHandler,
    //         setLoaderStatusHandler,
    //       ),
    //     ),
    //     dispatch(listProductAction(
    //       setModalTypeHandler, setLoaderStatusHandler
    //       )),
    //     dispatch(listCustomerAction(
    //       setModalTypeHandler, setLoaderStatusHandler
    //       )),
    //     dispatch(getAppConfigDataAction())
    // );
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
  }, []);

  const getAppConfigData = () => {
    const companyName =app_config_data.filter((f) => f.key_name == 'company.name');
    const fullAddress =app_config_data.filter(
      (f) => f.key_name == 'address.fulladdress',
    );
    const emailData =app_config_data.filter((f) => f.key_name == 'company.email');
    const gstinData =app_config_data.filter(
      (f) => f.key_name == 'company.gstin/uin',
    );
    const companyMobile =app_config_data.filter(
      (f) => f.key_name == 'company.mobile',
    );
    const state =app_config_data.filter((f) => f.key_name == 'address.state');

    setAppConfigData({
      companyName: companyName.length > 0 ? companyName[0].value : '',
      companyAddress: fullAddress.length > 0 ? fullAddress[0].value : '',
      companyEmail: emailData.length > 0 ? emailData[0].value : '',
      gstin: gstinData.length > 0 ? gstinData[0].value : '',
      companyMobile: companyMobile.length > 0 ? companyMobile[0].value : '',
      state: state.length > 0 ? state[0].value : '',
    });
  };

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

  const paymentValidate = () => {
    const receivedAmount =
      Tdata.reduce(function (acc, obj) {
        return acc + +obj.payment_amount;
      }, 0) + received_amount;

    const data = {
      received_amount: receivedAmount,
      sales_payment: Tdata,
      userConfig: {user_id: commoncookie, location_id: headerLocationId},
    };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        receiptEntry(
          selectionModel[0].id,
          data,
          () => {},
          () => {},
          () => {},
          (response) => {
            // const cookies = new Cookies();
            let storage = getsessionStorage()
            let emp_id = storage?.employee_id || '';
            if (response === 200) {
              dispatch(
                getLoginRoleAction(emp_id, (role_name, token, content) => {
                  if (!roleType.includes(role_name)) {
                    let notify_type = notificationType('sales payment');
                    let notify_content = content?.filter(
                      (m) => m.notification_type === notify_type,
                    );
                    if (notify_content.length) {
                      let amount_value = data.total || '';
                      let invNum = data.invoice_number || '';
                      let locationName =
                        props.stocklocation.find(
                          (m) => m.location_id === data.location_id,
                        ) || {};
                      let productData =
                       product.find(
                          (m) => m.item_id === data.sales_items[0].item_id,
                        ) || {};
                      let content_body = ` \n${amount_value} \n${locationName.location_name} \n${productData.category} ${invNum}`;
                      sendNtfy(token, notify_content[0]?.title, content_body);
                      dispatch(CreateNotificationAction({content_body:content_body,title:notify_content[0]?.title,time:getDateTimeFormat(new Date()),"active":"1"}))
                    }
                  }
                }),
              );
            }
          },
        ),
      )
    );
    setpaymentOpen(false);
  };

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
       product.filter((t) => t.item_id === d.item_id)[0].taxes || [];
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
  const invoiceFunction = async (data) => {

    const custData = await props.customer.filter(
      (d) => data.customer_id === d.customer_id,
    );
    const sales_items = await props.sales
      .filter((f) => f.sale_id === data.sale_id)[0]
      .sales_items.map((d) => {
        const taxes =
         product.filter((t) => t.item_id === d.item_id)[0]?.taxes || [];
        d.taxes = taxes;
        return d;
      });
    await setPopupData({
      invoice: data.invoice_number,
      custData: custData[0],
      soDate: data.sale_time,
      sales_items: sales_items,
      Dopen: true,
      customer_id: data.customer_id,
      sale_id: data.sale_id,
      note: data.note,
      sales_payments: data.sales_payments,
    });
  };
  const createMail = () => {
    const data = {
      custData: popUpdata.custData,
      invoice_number: popUpdata.invoice,
      sales_items: popUpdata.sales_items,
      email: popUpdata.custData.email,
      appConfigData:app_config_data,
    };
    dispatch(sendMail(data, () => {}));
    setPopupData({...popUpdata, Dopen: false});
  };

  return (
    <>
      <InvoiceDialog
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
      />
      <h3></h3>

      <PaymentRow
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
      />
    </>
  );
}

