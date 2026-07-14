import React, {useContext, useEffect, useRef, useState} from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { IconButton, Tooltip } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import {blue} from '@mui/material/colors';
import ReturnDialog from './returnDialog';
import PaymentDialog from '../../../pages/sales/paymentSalesPurchase/Dialog';
import {listVendorAction, getSupplierDetailsByIdAction, getSupplierDetailsByIdreceivings_itemsAction} from '../../../redux/actions/vendor_actions';
import {useDispatch, useSelector} from 'react-redux';
import {
  payablesPaymentEntry,
  listPurchasesFilterAction,
  paymentEntry,
} from '../../../redux/actions/purchase_actions';
import {
  paymentview,
  createPurchasesAction,
  updatePurchasesAction,
  receivingsPayments,
  consolidatedPayables,
  getPayablesBySupplierIdAction,
  listPurchasesPaginateAction
} from '../../../redux/actions/purchase_actions';
import {sendNtfy} from '../../../firebase/firebase.service';
import {
  getLoginRoleAction,
  getLoginTokenAction,
} from '../../../redux/actions/userRole_actions';
import Cookies from 'universal-cookie';
import notificationType from '../../../firebase/notify_type';
import context from '../../../context/CreateNewButtonContext';
import { CreateNotificationAction } from 'redux/actions/notification_actions';
import { getDateTimeFormat } from 'utils/getTimeFormat';
import {createTransactionAction} from '../../../redux/actions/transaction_actions';
import {listChartOfAccountsAction, chartOfAccountsIdNameAction} from '../../../redux/actions/chartOfAccounts';
import apiCalls from 'utils/apiCalls';
import { getsessionStorage } from 'pages/common/login/cookies';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import { roleType } from 'utils/roleType';
import { getManualNoteSchemesByIdAction } from 'redux/actions/manualNotes_actions';
import ReceiptPayments from 'components/ReceiptPayments/ReceiptPayments';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

 
export default function OptionButton(props) {
  const {recevingData,pathType} = props;
  console.log(pathType,recevingData,"pathType")
  const dispatch = useDispatch();
  const {
    purchasesReducer: {purchase_outstanding, purchases, purchasesByPagination, consolidated_data, searchPurchaseData},
    vendorReducer: {vendor},
    ChartOfAccountsReducer: {chartOfAccounts},
    stockLocationReducer: {stockLocation},
      rbacReducer: {menuAccess}
  } = useSelector((state) => state);
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [PayData, setPayData] = React.useState({
    paymentOpen: false,
    itemsData: [],
    Tdata: [],
    getVendor: {},
    paid_amount: 0,
  });
  const [status, setstatus] = React.useState('');
  const [selectionModel, setSelectionModel] = React.useState([]);
  const [getPay, setgetPay] = React.useState([]);
  const [openAlert, setOpenAlert] = useState(false);
  const [manualNotes, setManualNotes] = useState([]);
  const [openPaymentDialog, setopenPaymentDialog] = useState(false);
  const tempinitsform = useRef(null);
  const {paymentOpen, itemsData, Tdata, getVendor, paid_amount, receiving_id} =
    PayData;
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(context);

  const setpaymentOpen = (data) => {
    setPayData({...PayData, paymentOpen: data, Tdata: []});
  };

  const setTdata = (data) => {
    setPayData({...PayData, Tdata: data});
  };

  const initsform = () => {
    // dispatch(paymentview())
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      // !vendor.length && dispatch(listVendorAction()),
      // !chartOfAccounts.length && dispatch(listChartOfAccountsAction())
    );
    // if (!vendor.length) dispatch(listVendorAction());
    // if(!chartOfAccounts.length){
    //   dispatch(listChartOfAccountsAction())
    // }
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    if (headerLocationId !== '') {

      const {brand, category, location_id, max_price, min_price, name} =
        props.filtedValue;

      // const data ={brand, category, location_id: location_id, max_price, min_price, product_name: name,from: props.from,to: props.to,user_id: commoncookie}
    }
    tempinitsform.current();
    // dispatch(getAppConfigDataAction())
    // dispatch(consolidatedPayables())
  }, []);

  useEffect(() => {
    console.log(recevingData,'recevingData');
    if(recevingData?.supplier_id){
      const idCheck = recevingData.receive_goods === "pending" ? "receiving_id" : "po_id"
      const id = recevingData.receive_goods === "pending" ? recevingData?.receiving_id : recevingData?.po_id
      dispatch(
        getSupplierDetailsByIdreceivings_itemsAction(recevingData.supplier_id,{receiving_id: recevingData?.receiving_id, po_id: recevingData?.po_id}, (supplierDetails) => {
          console.log(supplierDetails,'supplierDetails');
          setPayData({
            ...PayData,
            getVendor : supplierDetails || {}
          })
        })
      )
    }
  }, [recevingData]);


  const handleMenuItemClick = (event, index) => {
    props.handleChange(index);
    setOpen(true);
  };

  const pendingPayment = async (data) => {
    if(headerLocationId === 'null'){
      setOpenAlert(true)
      return
    }

    const {
      supplier_id,
      receivings_items: itemsData = [],
      paid_amount,
      receiving_id,
      status: oldStatus,
      receive_goods,
      total,
    } = data;
    // const getVendor = vendor.filter((d) => supplier_id === d.supplier_id)[0];
    
    let getVendor;

    await dispatch(
      getSupplierDetailsByIdAction(supplier_id, (supplierDetails) => {
        getVendor = supplierDetails && supplierDetails || {};
      })
    )
    
    await dispatch(
      getPayablesBySupplierIdAction(commoncookie, headerLocationId,supplier_id, (paybleData) => {
        setgetPay(paybleData[0]?.childRow);
      }),
    );

    await dispatch(getManualNoteSchemesByIdAction('supplier', supplier_id, (response) => {
      setManualNotes(response.map(i => ({ ...i, selected: false })))
    }))

    // const getPay = purchase_outstanding.filter(
    //   (d) => d.supplier_id === supplier_id,
    // )[0]?.childRow;

    setPayData({
      ...PayData,
      itemsData,
      getVendor,
      paymentOpen: true,
      paid_amount: +paid_amount,
      receiving_id,
      oldStatus,
      receive_goods,
      total: +total,
    });
    setopenPaymentDialog(true)
    setstatus('edit');
    // setgetPay(getPay);
  };
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };
  const ledgerPaymentApi = async (amount,ledgerData) => {
    const data = {
      // "code": "234",
      // "entity": "324",
      location_id:headerLocationId,
      specialNumber: '00',
      note: 'Purchase Payment',
      voucherTypeId: 1,
    };
    const accountTransaction = [];

    let tempId = [];
    ledgerData.forEach( i => {
      if(i.paymentLedgerId) tempId.push(i.paymentLedgerId)
      if(i.cashboxLedgerId) tempId.push(i.cashboxLedgerId)
    });
    const body = { 
      id:tempId,
      name: null
    }
    await dispatch(
        chartOfAccountsIdNameAction(body, (list) => {
          list.forEach((d) => {
            const {id, creditSign, debitSign} = d;
            const dd = {accountId: id, description: ''};
      
            if (ledgerData.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id ).length) {
              let payables = ledgerData.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id )?.[0] || {}
      
              dd.amount = creditSign * amount || 0
              accountTransaction.push(dd);
            }else if(ledgerData.filter(f => f.ledger_id === id).length){
              dd.amount = debitSign * amount || 0
              accountTransaction.push(dd);
            }
          });
          data.accountTransaction = accountTransaction;
          dispatch(createTransactionAction(data,true,setLoaderStatusHandler))
      })
    )



    //  chartOfAccounts.forEach((d) => {
    //   const {id, creditSign, debitSign} = d;
    //   const dd = {accountId: id, description: ""};
    //   if (ledgerData.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id ).length) {
    //     let payables = ledgerData.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id )?.[0] || {}

    //     dd.amount = creditSign * payables?.payment_amount || 0
    //     accountTransaction.push(dd);
    //   }else if(ledgerData.filter(f => f.ledger_id === id).length){
    //     dd.amount = debitSign * amount || 0
    //     accountTransaction.push(dd);
    //   }
    // });
    // data.accountTransaction = accountTransaction;
    // dispatch(createTransactionAction(data,true,setLoaderStatusHandler))
  };

  const paymentValidate = async(type, receiptDate, addAdvanceAmount) => {
    const paid_amount = Tdata.reduce(function (acc, obj) {
      return acc + +obj.payment_amount;
    }, 0);

    const payment_type = Tdata.filter((d) => d.payment_type)
      .map((d) => d.payment_type.split(' ')[0])
      .join(', ');

    let indiviTotal = paid_amount;
    // console.log(Tdata,selectionModel,"lksggtwe");
    
    const payables = selectionModel.filter(d => d.type === 'Invoice').map((d) => {
      const newObj = {};
      const sub = indiviTotal - (+d.originalRow.total - +d.originalRow.paid_amount);

      if (Math.sign(sub) === 1 || Math.sign(sub) === 0) {
        newObj.paid_amount = indiviTotal;
        newObj.payment_type = payment_type;

        let inventory = false;
        let status = d.originalRow.status ? d.originalRow.status : 'New';

        if (d.originalRow.receive_goods === 'received') {
          // inventory = true
          status = 'Completed';
        }
        newObj.inventory = inventory;
        newObj.status = status;
        indiviTotal = sub;
      } else {
        newObj.paid_amount = indiviTotal;
        newObj.payment_type = payment_type;
        indiviTotal = 0;
      }
      newObj.receiving_id = d.originalRow.receiving_id;
      newObj.receivings_items = d.originalRow.receivings_items;
      return newObj;
    });

    const data = {
      payables,
      updateDebitNote: {
        supplier_id: getVendor.supplier_id,
        amount: getVendor.debitNote_balance
      },
    };
    let ledgerData = Tdata;
    console.log(recevingData, 'payments')
    const ledger = {
      // "code": "234",
      // "entity": "324",
      location_id:headerLocationId,
      specialNumber: '',
      note: 'Purchase Payment',
      voucherTypeId: 1,
      receipt_data : Tdata,
      referenceNumber: Tdata.filter(i => 'paymentLedgerId' in i && 'ledger_id' in i),
      receiving_id: recevingData.id
    };
    const accountTransaction = [];

    const receiptDataEntry = {
      purchase_id: recevingData.id,
      payment_amount: Number(ledger.referenceNumber[0].payment_amount),
      vendor_id: getVendor.supplier_id,
      receiptDate: receiptDate
    }

    const newPayload = {
      ledger: ledger,
      payables,
      receiptDataEntry,
      updateDebitNote: {
        supplier_id: getVendor.supplier_id,
        amount: getVendor.debitNote_balance,
        manualNoteSchemes: [],
        company_name: recevingData.company_name,
        advanceledger: [],
        supplier_ledger_id: recevingData.vendorLedgerId
      },
      addAdvanceAmount: addAdvanceAmount.amount > 0 ? { ...addAdvanceAmount, location_id: headerLocationId } : null
    }

    let tempId = [];
    ledgerData.forEach( i => {
      if(i.paymentLedgerId) tempId.push(i.paymentLedgerId)
      if(i.cashboxLedgerId) tempId.push(i.cashboxLedgerId)
    });
    const body = { 
      id:tempId,
      name: null
    }

    await dispatch(paymentEntry(
      newPayload,
      { pageCount: 0, numPerPage: 10 },
      commoncookie,
      headerLocationId,
      setLoaderStatusHandler,
      (response) => {
        const storage = getsessionStorage()
        let emp_id = storage?.employee_id || ''
        if(response === 200){
          dispatch(getLoginRoleAction(emp_id, (role_name, token, content) => {
            if(!roleType.includes(role_name)){
              let notify_type = notificationType('purchase payment')
              let notify_content = content?.filter(m => m.notification_type === notify_type)
              if(notify_content.length){
                const purchaseData = searchPurchaseData.length > 0 ? searchPurchaseData : purchasesByPagination
                let vendorName = purchaseData[0].company_name || ''
                let amountValue = purchaseData[0].paid_amount || ''
                let locationName = stockLocation.find(m => m.location_id === purchaseData[0].location_id)
                let content_body = `${vendorName} \n${amountValue} \n${locationName.location_name}`
                sendNtfy(token, notify_content[0]?.title, content_body)
                dispatch(CreateNotificationAction({content_body: content_body, title: notify_content[0]?.title, time:getDateTimeFormat(new Date()),"active":"1"}))
              }
            }
          }))
        }
      }
    ))
    // await dispatch(
    //     chartOfAccountsIdNameAction(body, (list) => {
    //       list.forEach((d) => {
    //         const {id, creditSign, debitSign} = d;
    //         const dd = {accountId: id, description: ''};
      
    //         if (ledgerData.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id ).length) {
    //           let payables = ledgerData.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id )?.[0] || {}
      
    //           dd.amount = creditSign * paid_amount || 0
    //           accountTransaction.push(dd);
    //         }else if(ledgerData.filter(f => f.ledger_id === id).length){
    //           dd.amount = debitSign * paid_amount || 0
    //           accountTransaction.push(dd);
    //         }
    //       });
    //       ledger.accountTransaction = accountTransaction;
    //       // dispatch(receivingsPayments(receiving_id, newPayload));
    //      // dispatch(createTransactionAction(data,true,setLoaderStatusHandler))
    //   })
    // )

    // dispatch(
    //   payablesPaymentEntry(newPayload, null, (response) => {
    //     if (response === false) {
    //       // const cookies = new Cookies();
    //       let storage = getsessionStorage()
    //       let emp_id = storage?.employee_id || '';
    //       dispatch(
    //         getLoginRoleAction(emp_id, (role_name, token, content) => {
    //           if (!roleType.includes(role_name)) {
    //             let notify_type = notificationType('purchase payment');
    //             let notify_content = content?.filter(
    //               (m) => m.notification_type === notify_type,
    //             );
    //             if (notify_content.length) {
    //               const paymentData =
    //               purchasesByPagination.find(
    //                   (m) => m.receiving_id === data.payables[0].receiving_id,
    //                 ) || {};
    //               let paymentRefid = paymentData.user_id || '';
    //               let vendorName = paymentData.company_name || '';
    //               let amount_value = data.payables[0].paid_amount || '';
    //               let locationName = paymentData.location_name || '';
    //               let content_body = `${paymentRefid} \n${vendorName} \n₹${amount_value} \n${locationName} `;
    //               sendNtfy(token, notify_content[0]?.title, content_body);
    //               dispatch(CreateNotificationAction({content_body:content_body,title:notify_content[0]?.title,time:getDateTimeFormat(new Date()),"active":"1"}))
    //             }
    //           }
    //         }),
    //       );
          
    //     }
    //   }),
    // );
    // const tempData = {...props.exportValue(), ...{pageCount: props.page || 0, numPerPage:  props.pageSize}, };
    // dispatch(listPurchasesPaginateAction(
    //   tempData,
    //   commoncookie, 
    //   headerLocationId
    // ));
    // // dispatch(receivingsPayments(receiving_id, ledger));
    // // ledgerPaymentApi(paid_amount,Tdata)
    setPayData({...PayData, paymentOpen: false, Tdata: []});
    setopenPaymentDialog(false)
    props.handleClose()
  };
    let storage = getsessionStorage()
    const selectedRole = storage.role_name 
    const purchaseOrderDelete = UserRightsAuthorization(menuAccess[selectedRole], 'purchases__purchase_orders', 'can_delete')
    const purchaseOrderConvertToBills = UserRightsAuthorization(menuAccess[selectedRole], 'purchases__bills', 'can_create')
    const payableCreate = UserRightsAuthorization(menuAccess[selectedRole], 'purchases__payments', 'can_create')
    const billsDelete = UserRightsAuthorization(menuAccess[selectedRole], 'purchases__bills', 'can_delete')
    const isPO = pathType.includes('/sales/purchasesOrders');
   const isBills = pathType.includes('/sales/bills');

  let options = [];

  if (
    (isPO && purchaseOrderDelete) ||
    (isBills && billsDelete)
  ) {
    options.push('DELETE');
  }

  if (
    isPO &&
    purchaseOrderConvertToBills &&
    recevingData?.status !== 'Billed'
  ) {
    options.push('CONVERT TO BILLS');
  }

  return (
    <React.Fragment>
      <Tooltip title="Actions">
        <IconButton
          size='small'
          ref={anchorRef}
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup='menu'
          onClick={handleToggle}
        >
          <MoreVertIcon fontSize='small' />
        </IconButton>
      </Tooltip>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({TransitionProps, placement}) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id='split-button-menu'>
                  {recevingData.status !== 'Completed' && options.map((option, index) =>{
                    if (
                      recevingData?.due_amount == 0 &&
                      recevingData.status === 'Return' || recevingData.status === 'Partial Return' &&
                      option === 'DELETE'
                    ) {
                      return null;
                    }
 
                    return (
                    <MenuItem
                      key={option}
                      disabled={ 
                        (option === 'EDIT') &&
                        (recevingData?.status === 'Billed')
                      }
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                    >
                      {option}
                    </MenuItem>
                    )
                    })}
                  {recevingData?.due_amount === 'paid' || recevingData.status === 'Completed' ? (
                    ''
                  ) : ( payableCreate &&
                    <MenuItem
                      value={1}
                      disabled = {recevingData.invoice_number === ""}
                      onClick={(event) => pendingPayment(recevingData)}
                    >
                      Payment
                    </MenuItem>
                  )}
                  {/* <ReturnDialog cnhandleOpen={props.cnhandleOpen} ledgerReturnApi={props.ledgerReturnApi} receivings_items={props.receivings_items} /> */}
                  {pathType !== '/sales/purchasesOrders' && (<MenuItem
                    value={1}
                    onClick={(event) => handleMenuItemClick(event, 2)}
                    disabled={
                      recevingData.receiving_ordered_qty ===
                      recevingData.receivings_items.reduce(
                        (total, item) => total + item.return_quantity,
                        0
                      )
                      || (recevingData.send_id !== null && recevingData.send_id !== undefined)
                    }
                  >
                    Return
                  </MenuItem>)}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
      {/* <PaymentDialog
        getPay={getPay}
        setgetPay={setgetPay}
        status={status}
        setSelectionModel={setSelectionModel}
        selectionModel={selectionModel}
        received_amount={paid_amount}
        handleSubmit={paymentValidate}
        custType={'VENDOR'}
        Tdata={Tdata}
        setTdata={setTdata}
        custData={getVendor}
        sales_items={itemsData}
        paymentOpen={openPaymentDialog}
        setpaymentOpen={setopenPaymentDialog}
        responseType={'cashOut'}
        manualNoteSchemes={manualNotes}
        setManualNoteSchemes={(data) => setManualNotes(data)}
        pageType={"PURCHASE"}
        type={1}
      /> */}
      {
        openPaymentDialog &&
        <ReceiptPayments
          paymentOpen={openPaymentDialog}
          custType = 'VENDOR'
          handleClose={setopenPaymentDialog}
          editData={{}}
          responseType={'cashOut'}
          sales_items={itemsData}
          selectedInvoice={recevingData?.receiving_id}
          selectedCustomer={getVendor}
        />
      }
      <LocationAlert open={openAlert} onClose={ ()=> setOpenAlert(false) }/>
    </React.Fragment>
  );
}
