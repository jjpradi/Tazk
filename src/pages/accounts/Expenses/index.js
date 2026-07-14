import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import {TextField, Typography,Chip, Grid, TablePagination, useTheme, useMediaQuery, IconButton, Button} from '@mui/material';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import apiCalls from 'utils/apiCalls';
import NewExpense from './NewExpense';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {
  getExpenseAction,
  getExpenseLedgersAction,
  deleteExpenseAction,
  PaymentExpenseAction,
  UpdateExpenseAction,
  expenseSearchAction,
  get_expenseSearchAction,
  set_expenseSearchAction,
  getExpensesByIdAction,
  setExpensesByIdAction
} from '../../../redux/actions/expense_actions';
import {listVendorIdAndNameAction} from '../../../redux/actions/vendor_actions';
import {listTaxCategoryAction} from '../../../redux/actions/tax_Category_actions';
import {useDispatch, useSelector} from 'react-redux';
import AlertDialog from '../../common/Dialog';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import {getSupplierDetailsByIdAction} from '../../../redux/actions/vendor_actions';
import PaymentDialog from '../../sales/paymentSalesPurchase/Dialog';
import {chartOfAccountsIdNameAction} from '../../../redux/actions/chartOfAccounts';
import {createTransactionAction} from '../../../redux/actions/transaction_actions';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle } from 'utils/pageSize';
import CommonSearch from 'utils/commonSearch';
import moment from 'moment';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import ReceiptPayments from 'components/ReceiptPayments/ReceiptPayments';
import ExpensesDetails from 'pages/accounts/Expenses/ExpensesDetails'
import { getReceiptsByIdAction, setReceiptsByIdAction } from 'redux/actions/sales_actions';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {
    getStickyTableOptions,
    stickyTableComponents,
  } from '../../../utils/stickyTableLayout';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getsessionStorage } from 'pages/common/login/cookies';

export default function Expenses(props) {
  const {setModalTypeHandler, setLoaderStatusHandler,headerLocationId} = useContext(
    CreateNewButtonContext,
  );
  const storage = getsessionStorage();
  const dispatch = useDispatch();
  const theme = useTheme()
  const isLargerScreen = useMediaQuery(theme.breakpoints.up('lg'))

  const [openNewExpense, setOpenNewExpense] = useState(props.openNewExpense || false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(-1);
  const [paymentData , setPaymentData] = useState({
    itemsData : [],
    getVendor :[],
    paymentOpen: false,
    paid_amount: 0,
    receiving_id : '',
    oldStatus : '',
    receive_goods : '',
    total: 0,
    status: 'edit',
    getPay : [],
  })
  const [expensesDetailOpen, setExpensesDetailOpen] = useState(false);
  const [edit_data,setEditData] = useState({})
  const [selectionModel,setSelectionModel] = useState([]);
  const [Tdata,setTdata] = useState([]);
  const [formStatus, setFormStatus] = useState('New')
  const [searchConfig, setSearchConfig] = useState({
    searchVal: '',
    page: 0,
    pageSize: pageSize
  })
  const [isApiFinished, setIsApiFinished] = useState(false);
  const[rowData, setRowData] = useState();
  const[rowDataIndex, setRowDataIndex] = useState(null);
  const [expenseDetailOpenForSmallerScreen, setExpenseDetailOpenForSmallerScreen] = useState(false)
  const [click, setClick] = useState(false)
  const {
    ExpenseReducer: {expenses, expense_count},rbacReducer: { menuAccess } 
  } = useSelector((state) => state);
  const {itemsData ,
    getVendor ,
    paymentOpen,
    paid_amount,
    receiving_id,
    oldStatus ,
    receive_goods,
    total,
    status,
    getPay} = paymentData;

    // console.log("openNewExpense",openNewExpense)

  const handleDelete = async (id) => {
    const data = {
      id,
      numPerPage: searchConfig.pageSize,
      pageCount : searchConfig.page
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      await dispatch(deleteExpenseAction(data)),
    );
    setDeleteDialog(false);
    setClick(false)
    setExpenseDetailOpenForSmallerScreen(false)
    handleCloses()
  };

  const handleDialog = (del_data) => {
    setDeleteDialog(true);
    setDeleteId(del_data.id);
  };
   
  const pendingPayment = async (rowData) =>{
    if(headerLocationId === 'null'){
      alert("Select one location");
      return
    }


   const {vendor_id,invoice_number,total_amount,po_number} = rowData

   console.log(po_number,'pos_knskandknas')

    let getVendor;
    if (rowData.status !== 'Completed') {

      await dispatch(getSupplierDetailsByIdAction(vendor_id, (supplierDetails) => {

        getVendor = supplierDetails || {};
        setEditData({ ...rowData, supplierLedgerId: supplierDetails?.ledger_id })
        setPaymentData({
          ...paymentData,
          itemsData: [],
          getVendor,
          paymentOpen: true,
          paid_amount: 0,
          receiving_id: '',
          oldStatus: '',
          receive_goods: '',
          total: +total_amount,
          status: 'edit',
          getPay: [{ invoice_number, total: total_amount, po_number: '', id: 1, paid_amount: 0, ledger_id: supplierDetails?.ledger_id || 0 }],

        });
      }))
    }

  }
  
  const handlePaymentSubmit = async () =>{

    const total_amount = await Tdata.reduce((acc,curr) => acc + +curr.payment_amount,0)
    let ledgerUpdateData = {
      ...edit_data,
      total_amount,
      payments: Tdata.filter(i => 'paymentLedgerId' in i && 'ledger_id' in i),
      pageCount: searchConfig.page,
      numPerPage : searchConfig.pageSize,
    }
    if(total_amount === edit_data.total_amount){
      ledgerUpdateData.status = 'Completed'
    }
    const ledgerEntryId = await Tdata.map((t,i) => typeof t.cashboxLedgerId === 'undefined' ?  t.paymentLedgerId : t.cashboxLedgerId)
    const body = { 
      id:[...ledgerEntryId,edit_data.supplierLedgerId],
      name: null
    }
    const ledgerData = {
      // "code": "00",
      // "entity": "00",
      location_id: headerLocationId,
      specialNumber: '00',
      note: 'Expenses Entry',
      voucherTypeId: 1,
    };

    const accountTransaction = [];

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(chartOfAccountsIdNameAction(body, (list) => {
          list.forEach((d) => {
            const {id, creditSign, debitSign} = d;
            const dd = {accountId: id, description: 'Expenses Entry'};
          
            if (edit_data.supplierLedgerId === id) {
        
              dd.amount = debitSign * total_amount || 0
              accountTransaction.push(dd);
            }else if(ledgerEntryId.includes(id)){
              let {payment_amount} = Tdata.find(
                (l) => (l.cashboxLedgerId === id || l.paymentLedgerId === id),
              )
              dd.amount = creditSign * +payment_amount || 0
              accountTransaction.push(dd);
            }
          });
          ledgerData.accountTransaction = accountTransaction;

          // dispatch(createTransactionAction(ledgerData,true,setLoaderStatusHandler)),

          ledgerUpdateData.transactionPayload = ledgerData
          dispatch(PaymentExpenseAction(edit_data.id,ledgerUpdateData))

          // dispatch(getExpenseAction())
        })
      )
    ).finally((res) => setIsApiFinished(true))
    setpaymentOpen(false)
  }
  const setpaymentOpen = (data) => {
    setPaymentData({...paymentData, paymentOpen: data});
    setTdata([]);
  };

  const setEmptyToEditData = useCallback(()=>{
    setFormStatus('New')
    setEditData({})
  }, [edit_data])
  
  useEffect(() => {
    const data = {
      pageCount: searchConfig.page,
      numPerPage: searchConfig.pageSize,
      searchString : searchConfig.searchVal,
    };

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(expenseSearchAction(data)),
    ).finally((res) => setIsApiFinished(true))
  }, [searchConfig.pageSize, searchConfig.page])

   const selectedRole = storage.role_name
    useEffect(() => {
      if (!selectedRole) return;
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler, dispatch(getMenuAccessAction(selectedRole)));
    }, [selectedRole, dispatch]);
  
  

  const handlePageSizeChange = async (size) => {
    setSearchConfig({
      ...searchConfig,
      pageSize:size,
    })
  };
  const handlePageChange = async (page) => {
    setSearchConfig({
      ...searchConfig,
      page,
    })
  };

  const cancelSearch = (e) => {

    setIsApiFinished(false)

    setSearchConfig({
      ...searchConfig,
      page: 0,
      searchVal: ''
    });

    const data = {
      pageCount: 0,
      numPerPage: searchConfig.pageSize,
      searchString : '',
    }

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(expenseSearchAction(data)),
    ).finally(() => setIsApiFinished(true))
  };

  const requestSearch = (e) => {
    setIsApiFinished(false)

    let val = e.target.value;
    setSearchConfig({
      ...searchConfig,
      searchVal: val,
      page: 0
    });

    dispatch(set_expenseSearchAction({data:[], numRows:0}))

    const body = {
      pageCount: 0,
      numPerPage: searchConfig.pageSize,
      searchString: val,
    }

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(get_expenseSearchAction(
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    ))
).finally(() => setIsApiFinished(true))
    
  };
// console.log(selectionModel,"selectionModeltrett");
  const handleDetailClick = async (rowData, internalCall, initialCall) => {
    setRowData(rowData)
    if(click){
      setExpenseDetailOpenForSmallerScreen(true)
    }
    // if(isLargerScreen || internalCall){
      const id = rowData.id
        await apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(getExpensesByIdAction(id))
      )
      if(!initialCall && !click){
        setExpenseDetailOpenForSmallerScreen(true)
      }
    // }
    // else{
      const index = expenses.findIndex(item => item.id === rowData.id)
      setRowDataIndex(index)
    // }
  }
  
   const handleEdit = async () => {
    console.log(rowData, 'efdgyeyghh')
      await setFormStatus('Edit')
      await setEditData(rowData)
      await setOpenNewExpense(true)
      await setIsApiFinished(false)
   }

  useEffect(() => {
    dispatch(setExpensesByIdAction({}))
    if(expenses && expenses?.length > 0) {
      handleDetailClick(expenses[0], !isLargerScreen, true)
    }
  }, [expenses])

  useEffect(() => {
    if(rowDataIndex !== null){
      const indexedRowData = expenses[rowDataIndex]
      handleDetailClick(indexedRowData, true)
    }
  }, [rowDataIndex])

 const handleCloses = () => {
    const data = {
      pageCount: searchConfig.page,
      numPerPage: searchConfig.pageSize,
      searchString: searchConfig.searchVal,
    };
    setOpenNewExpense(false);
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(expenseSearchAction(data)),
    )

    if (props.handleClose) {
      props.handleClose();

    }
  }

   const expenseCreate = UserRightsAuthorization(menuAccess[selectedRole], 'payments__expenses', 'can_create') 
   const expenseEdit = UserRightsAuthorization(menuAccess[selectedRole], 'payments__expenses', 'can_edit') 
   const expenseDelete = UserRightsAuthorization(menuAccess[selectedRole], 'payments__expenses', 'can_delete') 
   const expensePayment = UserRightsAuthorization(menuAccess[selectedRole], 'purchases__payments', 'can_create') 


  return (
    <>
      <Helmet>
                 <meta charSet="utf-8" />
                 <title> {titleURL} | Expenses </title>
       </Helmet>
      <Grid container spacing={2} style={{padding: '10px'}}>
      {openNewExpense === true ? (
        <Grid size={12}>
        <NewExpense
          handleClose={handleCloses}
          openNewExpense={openNewExpense}
          status = {formStatus}
          EditData = {edit_data}
          setEmptyToEditData={setEmptyToEditData}
          searchConfig={searchConfig}
          setSearchConfig={setSearchConfig}
          setIsApiFinished={setIsApiFinished}
        />
        </Grid>
      ) : expenseDetailOpenForSmallerScreen === true && click ? (
        <Grid container spacing={3}>
          <Grid size={12}>
            <Grid container spacing={3} justifyContent='flex-end'>
              <Grid>
                <Button variant='contained' onClick={() => {setExpenseDetailOpenForSmallerScreen(false); setClick(false);}}>Back</Button>
              </Grid>

              <Grid>
                <IconButton onClick={() => setRowDataIndex(rowDataIndex - 1)} disabled={rowDataIndex === 0}>
                  <ArrowBackIosIcon />
                </IconButton>
              </Grid>

              <Grid>
                <IconButton onClick={() => setRowDataIndex(rowDataIndex + 1)} disabled={rowDataIndex === expenses.length - 1}>
                  <ArrowForwardIosIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={12}>
            <ExpensesDetails
              handleDelete={() => handleDialog(rowData)}
              handleEdit={handleEdit}
              handlePayment={() => pendingPayment(rowData)}
              rowData = {rowData}
              expenseDelete={expenseDelete}
              expenseEdit={expenseEdit}
              expensePayment={expensePayment}
            />
          </Grid>
        </Grid>
      ) : (
        <Grid size={12}>
          {/* <style>
            {`
              ::-webkit-scrollbar {
                width: 6px !important;
                height: 6px !important;
              }

              ::-webkit-scrollbar-thumb {
                background-color: rgba(100, 100, 100, 0.7) !important;
                border-radius: 6px !important;
              }

              ::-webkit-scrollbar-track {
                background: transparent !important;
              }
            `}
          </style> */}
          <MaterialTable
            style={{height: 'calc(100vh - 90px)',overflow:'hidden'}}
            totalCount={expense_count}
          components={{
            ...stickyTableComponents,
            Toolbar: (props) => (
              <>
                <div
                  style={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                  }}
                >
                  <div style={{width: '100%'}}>
                    <MTableToolbar {...props} />
                  </div>
                <CommonSearch
                  searchVal={searchConfig.searchVal}
                  cancelSearch={cancelSearch}
                  requestSearch={requestSearch}
                />
                </div>
              </>
            ),
            Pagination: (props) => (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  borderTop: 'none',
                  boxShadow: 'none',
                  padding: '8px 16px',
                  borderBottom: 'none',
                }}
              >
                <TablePagination
                  {...props}
                  style={{
                    borderTop: 'none',
                    borderBottom: 'none',
                    boxShadow: 'none',
                    width: 'auto',
                  }}
                />
              </div>
            ),
          }}
          actions={[
           expenseCreate ? {
              icon: 'add',
              tooltip: 'add',
              isFreeAction: true,
              onClick: (event, rowData) => {
                setOpenNewExpense(true);
                setIsApiFinished(false)
              },
            } : null,
            // (rowData) => ({
            //   icon: () =>
            //     rowData.status === 'Completed' ? (
            //       <AssignmentTurnedInIcon disable = {true} color='disabled' />
            //     ) : (
            //       <AssignmentLateIcon color='warning' />
            //     ),
            //   tooltip: 'Make Payment',
            //   onClick: (event, rowData) => pendingPayment(rowData),
              
            // }),
            // (rowData) => ({
            //   icon: 'edit',
            //   tooltip: 'edit',
            //   disabled:
            //     rowData.status === 'Completed' ? true : false,
            //   onClick: async (event, rowData) =>{
            //     await setFormStatus('Edit')
            //     await setEditData(rowData)
            //     await setOpenNewExpense(true);
            //     await setIsApiFinished(false)
            //   },
            // }),
            // (rowData) => ({
            //   icon: 'delete',
            //   tooltip: 'Delete',
            //   disabled:
            //     rowData.status === 'Completed' ? true : false,
            //   onClick: (event, rowData) => handleDialog(rowData),
            // }),
          ]}
            onRowClick={(event, rowData) =>{setClick(true); handleDetailClick(rowData)}}
            page={searchConfig.page}
            onPageChange={(page) => handlePageChange(page)}
            onRowsPerPageChange={(size) => handlePageSizeChange(size)}
            options={getStickyTableOptions({
              bodyOffset: 200,
              headerStyle,
              cellStyle,
              options:{
                 showEmptyDataSourceMessage: isApiFinished,             
              search: false,
              exportButton: true,
              filtering: false,
              pagination: true,
               tableLayout: "fixed",
                toolbar: true,
              // maxBodyHeight: maxBodyHeight,
              // minBodyHeight: maxBodyHeight,
              pageSize: pageSize,
              pageSizeOptions: [20, 50, 100],
              actionsColumnIndex: -1,
              },
            })}
            columns={[
              {
                title: 'Date',
                field: 'date',
                render: (rowData) => moment(rowData.date).format("DD/MM/yyyy")
              },
              { title: 'Invoice#', field: 'invoice_number' },
              { title: 'Vendor', field: 'company_name' },
              { title: 'Type', field: 'type' },
              {
                title: 'Gst',
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
              // {
              //   title: 'Amount',
              //   field: 'amount',
              //   align: 'right', 
              //   cellStyle: { textAlign: 'right', paddingRight: '10px', fontSize: cellStyle.fontSize },
              //   render: (rowData) => parseFloat(rowData.amount).toFixed(2),
              // },
              {
                title: 'Amount',
                field: 'total_amount',
                // align: 'right', 
                // cellStyle: { textAlign: 'right', paddingRight: '10px', fontSize: cellStyle.fontSize },
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
                cellStyle: {  fontSize: cellStyle.fontSize },
                render: (rowData) =>
                  rowData.status === 'Completed' ?
                    (
                      <Chip color='success' label={<Typography variant='h7'>Completed</Typography>} />
                    ) : (
                      <Chip
                        sx={{ width: 88.43 }}
                        label={<Typography variant='h7'>Pending</Typography>}
                        color='warning'
                      />
                    )
              }
            ]}
          data={expenses}
          title={
            <Typography
              variant='h6'
              align='left'
              style={{paddingTop: '10px', paddingBottom: '10px'}}
            >
              Expenses
            </Typography>
          }
        />
      </Grid>
      )
      }
      <AlertDialog
        delete={deleteDialog}
        handleClose={() => setDeleteDialog(false)}
        handleDelete={handleDelete}
        id={deleteId}
      />
 {/* <PaymentDialog
            setSelectionModel={setSelectionModel}
            selectionModel={selectionModel}
            getPay={getPay}
            entryvalue = {0}
            handleEntry = {()=>{}}
            status={status}
            received_amount={paid_amount}
            handleSubmit={handlePaymentSubmit}
            custType={'VENDOR'}
            Tdata={Tdata}
            setTdata={setTdata}
            custData={getVendor}
            sales_items={[{}]}
            paymentOpen={paymentOpen}
            setpaymentOpen={setpaymentOpen}
            responseType={'cashOut'}
            poNum = 'disabled'
            pageType={"EXPENSE"}
            type={1}
            manualNoteSchemes={[]}
            setManualNoteSchemes={[]}
          />  */}
       {/* {
            openNewExpense === false && isLargerScreen  && 
            <Grid size={5}>
                <ExpensesDetails
                  handleDelete={() => handleDialog(rowData)}
                  handleEdit={handleEdit}
                  handlePayment={() => pendingPayment(rowData)}
                />
            </Grid>
          } */}
      </Grid>
      {
        paymentOpen &&
        <ReceiptPayments
          paymentOpen={paymentOpen}
          custType = 'VENDOR'
          handleClose={setpaymentOpen}
          editData={edit_data}
          responseType={'cashOut'}
          sales_items={[{}]}
          selectedInvoice={edit_data.id}
          selectedCustomer={getVendor}
          pageType = 'EXPENSE'
        />
      }
    </>
  );
}

