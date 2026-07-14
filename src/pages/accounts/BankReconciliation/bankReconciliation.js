import {
  Autocomplete,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {DataGrid} from '@mui/x-data-grid';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import React, {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import {
  GetAllBankReconciliationAction,
  SetAllBankReconciliationAction,
  addBankReconciliationTableAction,
  deleteBankReconciliationTableAction,
  getReconciliationCountAndTotalAction,
  getRecordsAction,
  getUnreconciledAndReconciledAction,
  get_searchBankReconciliationAction,
  individualReconciliationAction,
  listBankReconciliation,
  listBankReconciliationTableAction,
  setBankId,
  set_searchBankReconciliationAction,
} from 'redux/actions/bankCreation_actions';
import apiCalls from 'utils/apiCalls';
import CommonSearch from 'utils/commonSearch';
import ArticleIcon from '@mui/icons-material/Article';
import UnmatchEntries from './unmatchviews';
import {headerStyle, maxBodyHeight} from 'utils/pageSize';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import CommonToolTip from 'components/ToolTip';
import BankReconciliationCountValueCard from './BankReconciliationCountValueCard';
import BankDetails from './bankdetails';
import { FileUpload, FilterAlt } from '@mui/icons-material';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import moment from 'moment';
import PopUpDialog from './popUp';
import * as XLSX from 'xlsx-js-style';
import { ErrormsgAlert } from 'redux/actions/load';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PayInOutDialog from './payInOutDialog';
import ReceiptPayments from 'components/ReceiptPayments/ReceiptPayments';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { getsessionStorage } from 'pages/common/login/cookies';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import LocationAlert from "pages/assets/alert/LocationAlert";
import { updateChequeStatusAction } from 'redux/actions/salesMan_action';
import ManualMatch from '../BankReconciliation/ManualMatch'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { GetAllBankAccsAction, setBankReconciliationApiCall } from '../../../redux/actions/bankCreation_actions';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close'
import _ from 'lodash';
import { OpenalertActions } from 'redux/actions/alert_actions';
import toMomentOrNull from 'utils/DateFixer';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

function BR() {
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const storage = getsessionStorage()
  const selectedRole = storage.role_name
  
  const today = moment();
  const fiscalYearStart = today.month() >= 3 ? today.year() : today.year() - 1
  
  const [open, setOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState();
  const [isApiFinished, setIsApiFinished] = useState(false);
  const [selectedCard, setSelectedCard] = useState('Unreconciled')
  const [importStatementOpen, setImportStatementOpen] = useState(false)
  const [importBankName, setImportBankName] = useState('')
  const [importBankColumn, setImportBankColumn] = useState([])
  const [computedBankReconciliation, setComputedBankReconciliation] = useState([])
  const [page, setPage] = useState('bankReconciliation')
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedRow, setSelectedRow] = useState(null)
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [openAlert, setOpenAlert] = useState(false)
  const [bounceSuccess, setBounceSuccess] = useState(false);
  const [filterDetails, setFilterDetails] = useState({
    rangeOption: 'Current Fiscal Year',
    fromDate:  moment(`${fiscalYearStart}-04-01`).format('YYYY-MM-DD'),
    toDate: moment(`${fiscalYearStart + 1}-03-31`).format('YYYY-MM-DD')
  })
  const [adjustmentOpen, setAdjustmentOpen] = useState({
    receiptEntry: false,
    payIn: false,
    paymentEntry: false,
    expenses: false,
    payOut: false,
    contra: false,
    chequeBounced: false,
    manualMatch: false
  })

const [pageSizeForExcel, setPageSizeForExcel] = useState(0)
const [rowsPerPage, setRowsPerPage] = useState(20)
const [rowData, setRowData] = useState(null)
const [dialogOpen, setDialogOpen] = useState(false)
const [reconcileDate, setReconcileDate] = useState(today.format('YYYY-MM-DD'))
const [selectedIndex, setSelectedIndex] = useState([])
const [selectionType, setSelectionType] = useState('individual')
const [submitDisable, setSubmitDisable] = useState(false)

const handleChangePage = (event, newPage) => {
  setPageSizeForExcel(newPage)
}

const handleChangeRowsPerPage = (event) => {
  setRowsPerPage(parseInt(event.target.value, 10) || 20)
  setPageSizeForExcel(0)
}

useEffect(() => {
  setPageSizeForExcel(0)
}, [computedBankReconciliation])

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [selectedDate, setSelectedDate] = useState(null)
  const [bounceReason, setBounceReason] = useState(null)
  const [bounceBankCharges, setBounceBankCharges] = useState(null)
  const [remarks, setRemarks] = useState(null)
  const [chequeBounceConfirm, setChequeBounceConfirm] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [editTableOpen, setEditTableOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [viewOpen, setViewOpen] = useState(false);
  const [rowPopup, setRowPopup] = useState(false);
  const [b_details, setB_details] = useState(false);
  const [b_open, setB_open] = useState(false);
  const [anchorElDrop, setAnchorElDrop] = useState(null);
  const [selectBank, setSelectBank] = useState('');
  const [searchData, setSearchData] = useState({
    page: 0,
    pageSize: 20,
    searchVal: '',
  });
  const [viewId, setViewId] = useState();
  const [selectedAllIndex, setSelectedAllIndex] = useState([])
  const [apiCalled, setApiCalled] = useState(false)
  const [count, setCount] = useState(1)

  const bouncedReasons = ['Insufficient Balance', 'Signature Mismatch', 'Others']

  const {
    bankCreationReducer: {
      bank_reconciliation_table,
      bank_reconciliation,
      searchBankCreationData,
      searchBankCreationCount,
      bank_reconciliation_table_count,
      overAllCountValue,
      unreconciledAndReconciled,
      bankStatementColumn,
      bank_id,
      getAllBankAccs,
      getAllBankReconciliation,
      bankReconciliationApiCall
    },
    rbacReducer: { menuAccess }
  } = useSelector((state) => state);

  const {
    headerLocationId,
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
  } = useContext(CreateNewButtonContext);

  useEffect(() => {
    const fiscalYearStart = today.month() >= 3 ? today.year() : today.year() - 1
    if(!bankReconciliationApiCall){
      const payload = {
        fromDate:  moment(filterDetails.fromDate).format('YYYY-MM-DD'),
        toDate: moment(filterDetails.toDate).format('YYYY-MM-DD'),
        location_id:headerLocationId
      }
      dispatch(getReconciliationCountAndTotalAction(payload))
    }
  }, [headerLocationId])

  useEffect(() => {
    setCount((prev) => prev + 1)
    setTimeout(() => {
      setSelectedIndex([]);
    }, 0)
    if(!bankReconciliationApiCall){
      dispatch(setBankReconciliationApiCall(true))
      const payload = {
        page: searchData.page,
        pageSize: searchData.pageSize,
        searchString: searchData.searchVal,
        type: selectedCard,
        fromDate:  moment(filterDetails.fromDate).format('YYYY-MM-DD'),
        toDate: moment(filterDetails.toDate).format('YYYY-MM-DD'),
        location_id:headerLocationId
      }
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getUnreconciledAndReconciledAction(payload)),
        dispatch(GetAllBankAccsAction()),
        dispatch(getMenuAccessAction(selectedRole))
      )
    }
  }, [searchData.page, searchData.pageSize, selectedCard,headerLocationId])

  // useEffect(() => {
  //   setTimeout(() => {
  //     setSelectedIndex([]);
  //     setSelectedAllIndex([])
  //     dispatch(SetAllBankReconciliationAction({ data: [], numRows: 0 }))
  //   }, 0)
  // }, [selectedCard])

  const handleDelete = () => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        deleteBankReconciliationTableAction(
          deleteRow,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      ),
    );

    handleClose();
  };

  function handleClick(id) {
    setB_details(true);
    if (!b_details && !b_open) {
      dispatch(setBankId(id));
      navigate('/bankdetails');
    }
  }

  function reconciliateView(bankId) {
    setViewId(bankId);
    setViewOpen(true);
  }

  const requestSearch = (e) => {
    setTimeout(() => {
      setSelectedIndex([]);
    }, 0)
    const val = e.target.value;
    setSearchData({...searchData, searchVal: val, page: 0});
    
    const payload = {
      page: searchData.page,
      pageSize: searchData.pageSize,
      searchString: val,
      type: selectedCard,
      location_id : headerLocationId,
      fromDate:  moment(filterDetails.fromDate).format('YYYY-MM-DD'),
      toDate: moment(filterDetails.toDate).format('YYYY-MM-DD')
    }
    if(val.length >= 3 || val.length === 0) {
      dispatch(set_searchBankReconciliationAction({data: [], numRows: 0}))
    }
    
    dispatch(get_searchBankReconciliationAction(payload, setModalTypeHandler, setLoaderStatusHandler))
  };

  const cancelSearch = (e) => {
    setTimeout(() => {
      setSelectedIndex([]);
    }, 0)
    setSearchData({...searchData, page: 0, searchVal: ''});

    const payload = {
      page: searchData.page,
      pageSize: searchData.pageSize,
      searchString: '',
      type: selectedCard,
      location_id : headerLocationId,
      fromDate:  moment(filterDetails.fromDate).format('YYYY-MM-DD'),
      toDate: moment(filterDetails.toDate).format('YYYY-MM-DD')
    }

    dispatch(set_searchBankReconciliationAction({data: [], numRows: 0}))

    dispatch(get_searchBankReconciliationAction(payload, setModalTypeHandler, setLoaderStatusHandler))
  };

  const handlePageChange = async (page) => {
    setSearchData((prev) => ({...prev, page: page}));
  };

  const handlePageSizeChange = async (size) => {
    setSearchData((prev) => ({...prev, pageSize: size,page:0}));
  };

  const importExcel = (file) => {
     new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
  
        fileReader.onload = (e) => {
          try {
            const bufferArray = e.target.result;
            const wb = XLSX.read(bufferArray, { type: "buffer" });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const ExcelData = XLSX.utils.sheet_to_json(ws);
            let data={
              bank_id: selectBank.id,
              overAllRecord:unreconciledAndReconciled.data,
              excelData:ExcelData.sort((a, b) => new Date(a.Date) - new Date(b.Date)).map((data) => {
                const excelEpoch = new Date((data.Date - 25569) * 86400 * 1000)
                return {
                  ...data,
                  // Date: excelEpoch.toLocaleDateString('en-GB')
                }

              })
            }
           
            apiCalls(
              setModalTypeHandler,
              setLoaderStatusHandler,
              dispatch(
                getRecordsAction(
                  data,
                      (res) => {
                        setComputedBankReconciliation([
                          ...(res.unmatched.map((f, i) => ({ ...f, id: i + 1, status: 'Unmatched' }))),
                          ...(res.matched.map((f, i) => ({ ...f, id: res.unmatched.length + i + 1, status: 'Matched' })))
                        ])
                        setImportStatementOpen(false)
                        setPage('excelImport')
                      }
                  ),
              ),
          );
          } catch (error) {
            ErrormsgAlert(dispatch, "Error processing the file. Please check the format.");
          }
        };
        fileReader.onerror = (error) => {
          reject(error);
        };
      });
    }

  
  const convertExcelDateToString = (excelDate) => {
    if (!excelDate) return '-';
    const excelEpoch = new Date((excelDate - 25569) * 86400 * 1000);
    return excelEpoch.toLocaleDateString('en-GB') === 'Invalid Date' ? excelDate : excelEpoch.toLocaleDateString('en-GB');
  }

  const handleRowClick = (event, item) => {
      setAnchorEl(event.currentTarget)
      setSelectedRow(item)
  }

  function splitRecord(record) {
    const arrayKeys = Object.keys(record).filter(k => Array.isArray(record[k]))
    if (arrayKeys.length === 0) return [record]

    const length = Math.max(...arrayKeys.map(k => record[k].length), 1)

    return Array.from({ length }, (_, i) => {
      const obj = { ...record }
      arrayKeys.forEach(key => {
        obj[key] = record[key][i] !== undefined ? record[key][i] : record[key][0]
      })
      return obj
    })
  }

  const handleReconciliation = async() => {
    setConfirmationDialogOpen(false)
    setSubmitDisable(true)
    const tempArray = []
    const matchedData = computedBankReconciliation.filter(d => d.status === 'Matched' && d.matchedType !== 'chequeBounced')

    matchedData.map(item => {
      tempArray.push(moment(item.date).format('YYYY-MM-DD'))
    })

    const timestamps = tempArray.map(date => new Date(date).getTime())
    const bankAccountId = [
      ...new Set(
        matchedData.flatMap(entry =>
          Array.isArray(entry.bankAccountId)
            ? entry.bankAccountId
            : [entry.bankAccountId]
        ).filter(id => id !== null && id !== undefined)
      )
    ]

    const bankReconciliation = bankAccountId.map(id => ({
        fromDate: moment(Math.min(...timestamps)).format('YYYY-MM-DD'),
        toDate: moment(Math.max(...timestamps)).format('YYYY-MM-DD'),
        company_id: storage.company_id,
        reconciliateDate: moment().format('YYYY-MM-DD'),
        bankId: id,
        noOfEntries: matchedData.filter(d => Array.isArray(d.bankAccountId) ? d.bankAccountId.includes(id) : d.bankAccountId === id).length,
        isActive: '',
        isDeleted: 0,
        createdAt: moment().format('YYYY-MM-DD'),
        modifiedAt: ''
      }))

    const tempObj = {
      bankReconciliation: bankReconciliation,
      matchedLeft: matchedData.flatMap(splitRecord)
    }

    const countAndValuesPayload = {
      fromDate: moment(`${fiscalYearStart}-04-01`).format('YYYY-MM-DD'),
      toDate: moment(`${fiscalYearStart + 1}-03-31`).format('YYYY-MM-DD'),
      location_id:headerLocationId
    }

    const listPayload = {
      page: 0,
      pageSize: searchData.pageSize,
      searchString: searchData.searchVal,
      type: selectedCard,
      fromDate:  moment(`${fiscalYearStart}-04-01`).format('YYYY-MM-DD'),
      toDate: moment(`${fiscalYearStart + 1}-03-31`).format('YYYY-MM-DD'),
      location_id:headerLocationId
    }

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      await dispatch(addBankReconciliationTableAction(tempObj, countAndValuesPayload, listPayload, setModalTypeHandler, setLoaderStatusHandler))
    )
    setPage('bankReconciliation')
  }

  const handleFilterClear = () => {
    setTimeout(() => {
      setSelectedIndex([]);
    }, 0)
    setFilterDetails((prev) => ({
      ...prev,
      rangeOption: 'Current Fiscal Year',
      fromDate: moment(`${fiscalYearStart}-04-01`).format('YYYY-MM-DD'),
      toDate: moment(`${fiscalYearStart + 1}-03-31`).format('YYYY-MM-DD')
    }))

    const countAndValuesPayload = {
      fromDate: moment(`${fiscalYearStart}-04-01`).format('YYYY-MM-DD'),
      toDate: moment(`${fiscalYearStart + 1}-03-31`).format('YYYY-MM-DD'),
      location_id:headerLocationId
    }
    dispatch(getReconciliationCountAndTotalAction(countAndValuesPayload))

    const payload = {
      page: 0,
      pageSize: searchData.pageSize,
      searchString: searchData.searchVal,
      type: selectedCard,
      fromDate:  moment(`${fiscalYearStart}-04-01`).format('YYYY-MM-DD'),
      toDate: moment(`${fiscalYearStart + 1}-03-31`).format('YYYY-MM-DD'),
      location_id:headerLocationId
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getUnreconciledAndReconciledAction(payload))
    )

    setFilterOpen(false)
  }

  const handleFilterApply = () => {
    setTimeout(() => {
      setSelectedIndex([]);
    }, 0)
    const countAndValuesPayload = {
      fromDate:  moment(filterDetails.fromDate).format('YYYY-MM-DD'),
      toDate: moment(filterDetails.toDate).format('YYYY-MM-DD'),
      location_id:headerLocationId
    }
    dispatch(getReconciliationCountAndTotalAction(countAndValuesPayload))

    const payload = {
      page: 0,
      pageSize: searchData.pageSize,
      searchString: searchData.searchVal,
      type: selectedCard,
      fromDate:  moment(filterDetails.fromDate).format('YYYY-MM-DD'),
      toDate: moment(filterDetails.toDate).format('YYYY-MM-DD'),
      location_id:headerLocationId
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getUnreconciledAndReconciledAction(payload))
    )

    setFilterOpen(false)
  }

  const getPaymentTransactionId = (response, isAdvance, data) => {
    if(adjustmentOpen.paymentEntry){
      return isAdvance ? response.data.payment_transaction.insertId : response.transaction.payment_transaction.insertId
    }
    else if(adjustmentOpen.receiptEntry){
      return isAdvance ? response.data.payment_transaction.insertId : response.ReceiptStatus.paymenTransactions.insertId
    }
    else if(adjustmentOpen.expenses){
      return response.data.insertRes.payment_transaction.insertId
    }
    else if(adjustmentOpen.payOut || adjustmentOpen.payIn){
      return response.payment_transaction.insertId
    }
    else if(adjustmentOpen.contra){
      return response.payment_transaction.find(d => d.bank_id === selectBank.id).insertId
    }
    else if(adjustmentOpen.manualMatch){
      return data.paymentTransactionId
    }
    else {
      return ''
    }
  }

  const handleAddUnmatchedRecord = (response, transaction, type, paymentMode, data, isAdvance) => {
    setAnchorEl(null)
    setAdjustmentOpen((prev) => ({ ...prev, payIn: false, payOut: false, contra: false, receiptEntry: false, paymentEntry: false, expenses: false }))
    const bankAccountId = type === 'ManualMatch' ? data.bankAccountId : type === 'payInOutContra' ? transaction[0]?.activeChip || transaction[0]?.bankAccountId : type === 'chequeBounced' ? null : paymentMode.bankAccountId
    const newMatched = {
      date: type === 'ManualMatch' ? data.date : moment().format("DD/MM/YYYY"),
      entity: null,
      transactionNote:  selectedRow.Credit && selectedRow.Credit !== '-' && selectedRow.Credit !== '' ? "Sales Payment" : "Purchase Payment",
      transactionEntryId: type === 'ManualMatch' ? data.transactionEntryId : type === 'chequeBounced' ? null : type === 'payInOutContra' ? response.accountTransaction_status[0].insertId : response.transaction?.accountTransaction_status[0]?.insertId ?? null,
      description: type === 'chequeBounced' ? null : type === 'payInOutContra' ? transaction[0].reference : "Payment Mode",
      withdrawal: selectedRow.Debit && selectedRow.Debit !== '-' && selectedRow.Debit !== '' ? type === 'ManualMatch' ? data.amount : Number(selectedRow.Debit) : 0,
      deposit: selectedRow.Credit && selectedRow.Credit !== '-' && selectedRow.Credit !== '' ? type === 'ManualMatch' ? data.amount : Number(selectedRow.Credit) : 0,
      amount: selectedRow.Credit && selectedRow.Credit !== '-' && selectedRow.Credit !== '' ? type === 'ManualMatch' ? data.amount : Number(selectedRow.Credit) : Number(selectedRow.Debit),
      referenceNumber: selectedRow.Description ?? response?.referenceNumber ?? '',
      chequeDate: type === 'chequeBounced' || type === 'ManualMatch' ? null : type === 'payInOutContra' ? null : transaction[0].chequeDate,
      chequeNumber: type === 'chequeBounced' || type === 'ManualMatch' ? null : type === 'payInOutContra' ? transaction[0].reference : transaction[0].chequeNumber,
      bankName: type === 'chequeBounced' || type === 'ManualMatch' ? null : type === 'payInOutContra' ? null : transaction[0].bankName,
      payment_type: type === 'chequeBounced' || type === 'ManualMatch' ? null : type === 'payInOutContra' ? transaction[0].cash_type : transaction[0].payment_type,
      bankAccountId: bankAccountId,
      reference: selectedRow.Description ?? response?.referenceNumber ?? '',
      status: 'Matched',
      matchedType: type === 'chequeBounced' ? 'chequeBounced' : null,
      payment_transaction_id: getPaymentTransactionId(response, isAdvance, data)
    }

    const updatedComputedBankReconciliation = computedBankReconciliation.map((d) => {
      if(d.id === selectedRow.id){
        return newMatched
      }
      else {
        return d
      }
    })
    setComputedBankReconciliation(updatedComputedBankReconciliation)
  }

  const handleMenuClick = (name, value) => {
    if(headerLocationId === 'null'){
      setOpenAlert(true)
      return
    }
    else{
      setAdjustmentOpen((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleDateChange = (date) => {
    setSelectedDate(moment(date).format('YYYY-MM-DD'))
  }

  const handleBounceCancel = () => {
    setAdjustmentOpen((prev) => ({ ...prev, chequeBounced: false }))
    setSelectedDate(null)
    setBounceReason(null)
    setBounceBankCharges(null)
    setRemarks(null)
    setChequeBounceConfirm(false)
  }

  const handleBounceConfirm = async () => {
    const data = {
      cheque_status: 4,
      remarks: remarks,
      bounced_date:  selectedDate,
      bounced_reason: bounceReason,
      bounce_charges: bounceBankCharges
    }

    const result = await apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      await dispatch(updateChequeStatusAction(selectedRow.chequeId, headerLocationId, data))
    )

     const response = Array.isArray(result) ? result[0]?.value : result;



    if (response?.data?.updatecheque?.chequedata?.affectedRows === 1) {
    setBounceSuccess(true);   // Cancel button will now disable
  }


    setAdjustmentOpen((prev) => ({ ...prev, chequeBounced: false }))
    setSelectedDate(null)
    setBounceReason(null)
    setBounceBankCharges(null)
    setRemarks(null)
    setChequeBounceConfirm(false)

    handleAddUnmatchedRecord([], [], 'chequeBounced')
  }

  useEffect(() => {
    let timer
    if(chequeBounceConfirm) {
      setCountdown(5)
      timer = setInterval(() => {
        setCountdown((prev) => {
          if(prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [chequeBounceConfirm])

  const handleMatchedAndUnmatchedClose = () => {
    const payload = {
      page: searchData.page,
      pageSize: searchData.pageSize,
      searchString: searchData.searchVal,
      type: selectedCard,
      fromDate:  moment(filterDetails.fromDate).format('YYYY-MM-DD'),
      toDate: moment(filterDetails.toDate).format('YYYY-MM-DD'),
      location_id:headerLocationId
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getUnreconciledAndReconciledAction(payload)),
    )
    setPage('bankReconciliation')
    setTimeout(() => {
      setSelectedIndex([]);
    }, 0)
  }

  const handleBankReconcilationRowClick = (event, row, type) => {
    event.stopPropagation()
    setRowData(row)
    setSelectionType(type)
    setDialogOpen(true)
  }

  const columnData = [
    {
      headerName: 'Date',
      field: 'date',
      flex: 1,
      minWidth: 200,
    },
    {
      headerName: 'Particular',
      field: 'company_name',
      flex: 1,
      minWidth: 200,
    },
    {
      headerName: 'Detail',
      field: 'transactionNote',
      flex: 1,
      minWidth: 200,
    },
    {
      headerName: 'Reference Number',
      field: 'reference',
      flex: 1,
      minWidth: 200,
      renderCell: (rowData) => {
        if (rowData.row.payment_type === 'Cheque (INR)' || (rowData.row.payment_type === 'OUT' && rowData.row.chequeNumber !== null) || rowData.row.payment_type === 'IN' && rowData.row.chequeNumber !== null) {
          return [
            rowData.row.chequeNumber || '',
            rowData.row.bankName || '',
            rowData.row.chequeDate || rowData.row.date || ''
          ]
            .filter(Boolean)
            .join(' - ');

        }
        else{
          return rowData.row.reference || ''
        }
      }
    },
    {
      headerName: 'Withdrawal',
      field: 'withdrawal',
      flex: 1,
      minWidth: 100,
      align:'right',
      headerAlign: 'right',

    },
    {
      headerName: 'Deposit',
      field: 'deposit',
      flex: 1,
      minWidth: 100,
      align:'right',
      headerAlign: 'right',
    },
    {
      field: 'action',
      title: 'Action',
      minWidth: 100,
      renderCell: (rowData) => {
        if(selectedIndex.length > 0){
          if(selectedIndex.sort((a,b) => a - b)[0] === rowData.id){
            return(
              <Tooltip title={selectedCard === 'Unreconciled' ? 'Reconcile' : 'Unreconcile'}>
                <IconButton color='primary' onClick={(event) => handleBankReconcilationRowClick(event, null, 'bulk')}>
                  <MenuIcon />
                </IconButton>
              </Tooltip>
            )
          }
          else{
            return null
          }
        }
        else{
          return(
            <Tooltip title={selectedCard === 'Unreconciled' ? 'Reconcile' : 'Unreconcile'}>
              <IconButton color='primary' onClick={(event) => handleBankReconcilationRowClick(event, rowData.row, 'invididual')}>
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )
        }
      }
    }
  ]

  const rangeOptions = ['Today', 'Yesterday', 'This Week', 'Last Week', 'Last 7 Days', 'This Month', 'Last Month', 'This Quarter', 'Last Quarter', 'Current Fiscal Year', 'Previous Fiscal Year', 'Last 365 days']  

  const openDrop = Boolean(anchorElDrop)

  const handleMenuOpen = (event) => {
    if(!getAllBankAccs.length) {
      dispatch(OpenalertActions({ msg: 'Please check the Bank Accounts!', severity: 'warning' }))
      return
    }
    else {
      setAnchorElDrop(event.currentTarget)
    }
  }

  const handleMenuClose = () => {
    setAnchorElDrop(null)
  }

  const handleSelectBank = (bank) => {
    setSelectBank({
      id: bank.bankAccountId,
      bankName: bank.bankName
    })
    setAnchorElDrop(null)
    setImportStatementOpen(true)
  }

  const handleDialogClose = () => {
    setRowData(null)
    setDialogOpen(false)
  }

  const handleDialogSubmit = () => {
    let payload = []
    if(selectionType === 'bulk'){
      payload = unreconciledAndReconciled.data.filter((_, index) =>
        selectedIndex.includes(index)
      )
    }
    else{
      payload = [rowData]
    }
    if(selectedCard === 'Unreconciled'){
      dispatch(individualReconciliationAction({ data: payload, reconcileDate: reconcileDate }, 'Unreconciled', async(response) => {
        if(response.status === 200){
          handleDialogClose()
          setTimeout(() => {
            setSelectedIndex([]);
          }, 0)
          const totalPayload = {
            fromDate:  moment(filterDetails.fromDate).format('YYYY-MM-DD'),
            toDate: moment(filterDetails.toDate).format('YYYY-MM-DD'),
            location_id:headerLocationId
          }
          dispatch(getReconciliationCountAndTotalAction(totalPayload))
          const getPayload = {
            page: searchData.page,
            pageSize: searchData.pageSize,
            searchString: searchData.searchVal,
            type: selectedCard,
            fromDate: moment(filterDetails.fromDate).format('YYYY-MM-DD'),
            toDate: moment(filterDetails.toDate).format('YYYY-MM-DD'),
            location_id:headerLocationId
          }
          apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(getUnreconciledAndReconciledAction(getPayload)),
            dispatch(GetAllBankAccsAction())
          )
        }
      }))
    }
    else if(selectedCard === 'Reconciled'){
      dispatch(individualReconciliationAction({ data: payload }, 'Reconciled', async(response) => {
        if(response.status === 200){
          handleDialogClose()
          setTimeout(() => {
            setSelectedIndex([]);
          }, 0)
          const totalPayload = {
            fromDate:  moment(filterDetails.fromDate).format('YYYY-MM-DD'),
            toDate: moment(filterDetails.toDate).format('YYYY-MM-DD'),
            location_id:headerLocationId
          }
          dispatch(getReconciliationCountAndTotalAction(totalPayload))
          const getPayload = {
            page: searchData.page,
            pageSize: searchData.pageSize,
            searchString: searchData.searchVal,
            type: selectedCard,
            fromDate:  moment(filterDetails.fromDate).format('YYYY-MM-DD'),
            toDate: moment(filterDetails.toDate).format('YYYY-MM-DD'),
            location_id:headerLocationId
          }
          apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(getUnreconciledAndReconciledAction(getPayload)),
            dispatch(GetAllBankAccsAction())
          )
        }
      }))
    }
  }

  const handleCheckAll = () => {
    const payload = {
      searchString: searchData.searchVal,
      type: selectedCard,
      fromDate:  moment(filterDetails.fromDate).format('YYYY-MM-DD'),
      toDate: moment(filterDetails.toDate).format('YYYY-MM-DD'),
      location_id:headerLocationId
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(GetAllBankReconciliationAction(payload, (response) => {
        if(response.data.length) {
          const index = response.data.map((d, i) => i)
          setSelectedAllIndex(index)
        }
      }))
    )
  }

  const receiptCreate = UserRightsAuthorization(menuAccess[selectedRole], 'sales__receipts', 'can_create')
  const payinPayoutCreate = UserRightsAuthorization(menuAccess[selectedRole], 'payments__pay_in_pay_out', 'can_create')
  const expensesCreate = UserRightsAuthorization(menuAccess[selectedRole], 'payments__expenses', 'can_create')
  const paymentCreate = UserRightsAuthorization(menuAccess[selectedRole], 'purchases__payments', 'can_create')

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title> {titleURL} | Bank Reconciliation </title>
      </Helmet>
      {
       page === 'bankReconciliation' &&
       <>
         <Card sx={{ p: 3, height: 'calc(100vh - 80px)' }}>
           <Grid container spacing={3}>
             <Grid size={12}>
               <Grid container display='flex' justifyContent='space-between' alignItems='center'>
                 <Grid>
                   <Typography variant='h6'>Bank Reconciliation</Typography>
                 </Grid>

                 <Grid>
                   <Grid container spacing={3} display='flex' alignItems='center'>
                     {
                       selectedCard !== 'Reconciled' &&
                       <Grid>
                         <div
                           style={{
                               display: 'inline-block',
                               cursor: 'pointer',
                               borderRadius: '16px',
                               boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
                           }}
                         >
                           <Card
                             sx={{
                               p: 2,
                               height: '50px',
                               position: 'relative',
                               overflow: 'visible',
                               backgroundColor: 'rgb(255,255,255)',
                               color: 'white',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center'
                             }}
                           >
                             <Grid container spacing={1} >
                                 <Grid size={12}>
                                   <Grid container spacing={1} alignItems='center' justifyContent='center'>
                                     <Grid>
                                         <Typography textAlign="center" sx={{ color: 'Black', fontSize: '12px', fontWeight: 600 }}>
                                           {'Import Statement'}
                                         </Typography>
                                     </Grid>

                                     {/* <Grid>
                                       <Tooltip title='Upload'>
                                         <IconButton>
                                           <UploadFileOutlinedIcon  />
                                         </IconButton>
                                       </Tooltip>
                                     </Grid> */}

                                     <Grid>
                                       <IconButton onClick={handleMenuOpen}>
                                         <ArrowDropDownIcon />
                                       </IconButton>

                                       <Menu anchorEl={anchorElDrop} open={openDrop} onClose={handleMenuClose}>
                                         {
                                           getAllBankAccs?.map((bank) => (
                                             <MenuItem key={bank.bankAccountId} onClick={() => handleSelectBank(bank)}>
                                               {bank.bankName}
                                             </MenuItem>
                                           ))
                                         }
                                       </Menu>
                                     </Grid>

                                   </Grid>
                                 </Grid>
                             </Grid>
                           </Card>
                         </div>
                       </Grid>
                     }

                     <Grid>
                       <BankReconciliationCountValueCard
                         title='Unreconciled'
                         count={overAllCountValue?.unreconciledCountAndTotal?.[0]?.unreconciledCount || 0}
                         value={(overAllCountValue?.unreconciledCountAndTotal?.[0]?.unreconciledTotal || 0).toFixed(2)}
                         handleClick={(selected) => {setSelectedCard(selected); setSearchData((prev) => ({ ...prev, page: 0 }))}}
                         selectedCard={selectedCard}
                       />
                     </Grid>

                     <Grid>
                       <BankReconciliationCountValueCard
                         title='Reconciled'
                         count={overAllCountValue?.reconciledCountAndTotal?.[0]?.reconciledCount || 0}
                         value={(overAllCountValue?.reconciledCountAndTotal?.[0]?.reconciledAmount || 0).toFixed(2)}
                         handleClick={(selected) => {setSelectedCard(selected); setSearchData((prev) => ({ ...prev, page: 0 }))}}
                         selectedCard={selectedCard}
                       />
                     </Grid>
                     
                     <Grid>
                       {/* {
                         selectedCard !== 'Reconciled' &&
                         <Tooltip title='Import Statement'>
                           <IconButton onClick={() => setImportStatementOpen(true)}>
                             <UploadFileOutlinedIcon />
                           </IconButton>
                         </Tooltip>
                       } */}

                       <Tooltip title='Filter'>
                         <IconButton onClick={() => setFilterOpen(true)}>
                           <FilterAlt />
                         </IconButton>
                       </Tooltip>
                     </Grid>

                     <Grid>
                       <CommonSearch
                         searchVal={searchData.searchVal}
                         cancelSearch={cancelSearch}
                         requestSearch={requestSearch}
                       />
                     </Grid>
                   </Grid>
                 </Grid>
               </Grid>
             </Grid>

             <Grid size={12}>
               <Grid container spacing={3}>
                 <Grid size={12}>
                   <Typography variant='h6'>
                     {selectedCard === 'Unreconciled' ? 'Unreconciled Transactions' : 'Reconciled Transactions'}
                   </Typography>
                 </Grid>

                 <Grid size={12}>
                   <DataGrid
                     rows={unreconciledAndReconciled.data.map(((d, i) => ({ ...d, id: i })))}
                     rowCount={unreconciledAndReconciled.numRows}
                     columns={columnData}
                     hideScrollBar={true}
                     pageSizeOptions={[20, 50 ,100]}
                     
                     
                     
                     
                     paginationMode='server'
                     sx={{
                       minHeight : maxBodyHeight,
                       maxHeight : maxBodyHeight,
                       overflowY: 'visible',
                       '& .MuiDataGrid-root': {
                         overflowY: 'visible'
                       },
                       '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb:hover': {
                         background: '#999',
                       },
                     }}
                     checkboxSelection
                     onRowSelectionModelChange={(selection) => {
                       setSelectedIndex(selection)
                     }}
                     rowSelectionModel={selectedIndex} 
                     paginationModel={{ page: searchData.page, pageSize: searchData.pageSize }} 
                     onPaginationModelChange={(model) => { if (model.page !== searchData.page) { ((page) => handlePageChange(page))(model.page); } if (model.pageSize !== searchData.pageSize) { ((size) => handlePageSizeChange(size))(model.pageSize); } }}
                   />
                 </Grid>
               </Grid>
             </Grid>
           </Grid>
         </Card>
       
         <Dialog open={dialogOpen} maxWidth='sm' fullWidth>
           <DialogTitle>
             <Stack display='flex' justifyContent='space-between' alignItems='center' flexDirection='row'>
               <Typography variant='h6'>
                 {
                   selectedCard === 'Unreconciled' ? 'Reconcile Confirmation' : 'Unreconcile Confirmation'
                 }
               </Typography>
               
               <IconButton onClick={() => handleDialogClose()}>
                 <CloseIcon />
               </IconButton>
             </Stack>
           </DialogTitle>

           <DialogContent>
             {
               selectedCard === 'Unreconciled' ?
                 <LocalizationProvider dateAdapter={DateAdapter}>
                   <DatePicker
                     disableFuture
                     name='reconcileDate'
                     label='Reconcile Date'
                     inputVariant='outlined'
                     format='DD/MM/YYYY'
                     value={toMomentOrNull(reconcileDate)}
                     onChange={(date) =>
                       setReconcileDate(moment(date).format('YYYY-MM-DD'))
                     }
                     fullWidth={true}
                     slotProps={{
                       textField: {
                         fullWidth: true,
                         variant: 'filled',
                         onKeyDown: (e) => e.preventDefault(),
                       },
                     }}
                   />
                 </LocalizationProvider>
               :
                 <Typography variant='h6'>
                   Are you sure you want to unreconcile this record?
                 </Typography>
             }
           </DialogContent>

           <DialogActions>
             <Grid container display='flex' justifyContent='flex-end' alignItems='center' spacing={3}>
               <Grid>
                 <Button variant='contained' color='error' onClick={() => handleDialogClose()}>Cancel</Button>
               </Grid>

               <Grid>
                 <Button variant='contained' onClick={() => handleDialogSubmit()}>
                   {
                     selectedCard === 'Unreconciled' ? 'Reconcile' : 'Unreconcile'
                   }
                 </Button>
               </Grid>
             </Grid>
           </DialogActions>
         </Dialog>
       </>
      }
      {
        page === 'excelImport' &&
        <Card sx={{ p: 3, height: 'calc(100vh - 80px)' }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Typography variant='h6'>Matched and Unmatched Records</Typography>
            </Grid>

            <Grid size={12}>
              <TableContainer sx={{height:'calc(100vh - 230px)', overflow: 'auto' }}>
                <Table stickyHeader >
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Withdrawal</TableCell>
                      <TableCell>Deposit</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {
                      computedBankReconciliation
                        .slice(pageSizeForExcel * rowsPerPage, pageSizeForExcel * rowsPerPage + rowsPerPage)
                        .map((item, index) => (
                          <TableRow key={index} sx={{ height: '50px !important' }}>
                            <TableCell>{item.Date ? convertExcelDateToString(item?.Date) : item.date}</TableCell>
                            <TableCell>
                              {
                                item.status === 'Unmatched'
                                  ? item.Description
                                  : item.payment_type === 'Cheque (INR)'
                                    ? `${item?.payment_type || ''} - ${item.chequeNumber} ${item.bankName ? `- ${item.bankName}` : ''} ${item.chequeDate ? `- ${item.chequeDate}` : ''} `
                                    : `${item.payment_type ? `${item.payment_type} -` : ''}  ${item.reference}`
                              }

                            </TableCell>
                            <TableCell>{item.withdrawal ? Array.isArray(item.withdrawal) ? item?.withdrawal?.reduce((sum, list) => sum + Number(list || 0), 0) ?? 0 : item.withdrawal : item.Debit || '-'}</TableCell>
                            <TableCell>{item.deposit ? Array.isArray(item.deposit) ? item?.deposit?.reduce((sum, list) => sum + Number(list || 0), 0) ?? 0 : item.deposit : item.Credit || '-'}</TableCell>
                            <TableCell>
                              <Typography sx={{ color: item.status === 'Matched' ? 'rgba(17,193,91,1) !important' : 'rgba(255,82,82,1) !important', fontWeight: 500, fontSize: '12px' }}>
                                {item.status}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {
                                item.status === 'Unmatched' &&
                                <IconButton onClick={e => handleRowClick(e, item)}>
                                  <ReceiptLongIcon />
                                </IconButton>
                              }
                            </TableCell>
                          </TableRow>
                        ))
                    }
                  </TableBody>
                </Table>
              </TableContainer>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => {
                  setAnchorEl(null)
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                {
                  (selectedRow?.Credit && selectedRow?.Credit !== '-' && selectedRow?.Credit !== '') &&
                  <>
                    {
                      selectedRow?.chequeBounceType === 'Cheque Bounced' ? (
                        <MenuItem onClick={() => handleMenuClick('chequeBounced', true)}>Cheque Bounced</MenuItem>
                      ) : (
                        <>
                          {receiptCreate && <MenuItem onClick={() => handleMenuClick('receiptEntry', true)}>Receipt Entry</MenuItem>}
                          {payinPayoutCreate && <MenuItem onClick={() => handleMenuClick('payIn', true)}>Pay In</MenuItem>}
                          {receiptCreate && <MenuItem onClick={() => handleMenuClick('manualMatch', true)}>Manual Match</MenuItem>}
                        </>
                      )
                    }
                  </>
                }
                {
                  (selectedRow?.Debit && selectedRow?.Debit !== '-' && selectedRow?.Debit !== '') &&
                  <>
                    {
                      selectedRow?.chequeBounceType === 'Cheque Bounced' ? (
                        <MenuItem onClick={() => handleMenuClick('chequeBounced', true)}>Cheque Bounced</MenuItem>
                      ) : (
                        <>
                          {paymentCreate && <MenuItem onClick={() => handleMenuClick('paymentEntry', true)}>Payment Entry</MenuItem>}
                          {expensesCreate && <MenuItem onClick={() => handleMenuClick('expenses', true)}>Expenses</MenuItem>}
                          {payinPayoutCreate && <MenuItem onClick={() => handleMenuClick('payOut', true)}>Pay Out</MenuItem>}
                          {payinPayoutCreate && <MenuItem onClick={() => handleMenuClick('contra', true)}>Contra</MenuItem>}
                          {paymentCreate && <MenuItem onClick={() => handleMenuClick('manualMatch', true)}>Manual Match</MenuItem>}
                        </>
                      )
                    }
                  </>
                }
              </Menu>
              {/* Pagination Component */}
              <TablePagination
                component="div"
                count={computedBankReconciliation.length}
                page={pageSizeForExcel}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[20, 50, 100]}
              />
            </Grid>

            <Grid size={12}>
              <Grid container spacing={3} display='flex' justifyContent='flex-end'>
                <Grid>
                  <Button variant='contained' color='error' onClick={handleMatchedAndUnmatchedClose} disabled={bounceSuccess} >Cancel</Button>
                </Grid>

                <Grid>
                  <Button variant='contained' onClick={() => setConfirmationDialogOpen(true)} disabled={!computedBankReconciliation.filter(s => s.status === 'Matched').length > 0}>Submit</Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {
            (adjustmentOpen.payIn || adjustmentOpen.payOut || adjustmentOpen.contra) &&
            <PayInOutDialog
              open={adjustmentOpen.payIn || adjustmentOpen.payOut || adjustmentOpen.contra}
              handleClose={() => setAdjustmentOpen((prev) => ({ ...prev, payIn: false, payOut: false, contra: false }))}
              type='BANKRECONCILIATION'
              requestMode={adjustmentOpen.payOut ? '0' : adjustmentOpen.payIn ? '1' : '2'}
              reconciliateData={selectedRow}
              handleReconciliate={(response, transaction) => handleAddUnmatchedRecord(response, transaction, 'payInOutContra')}
              bankId={selectBank.id}
            />
          }

          {
            (adjustmentOpen.receiptEntry || adjustmentOpen.paymentEntry || adjustmentOpen.expenses) &&
            <ReceiptPayments
              paymentOpen={adjustmentOpen.receiptEntry || adjustmentOpen.paymentEntry || adjustmentOpen.expenses}
              handleClose={() => setAdjustmentOpen((prev) => ({ ...prev, receiptEntry: false, paymentEntry: false, expenses: false }))}
              editData={{}}
              type='BANK_RECONCILIATION'
              pageType={adjustmentOpen.expenses ? 'EXPENSE' : ''}
              custType={selectedRow.Credit && selectedRow.Credit !== '-' && selectedRow.Credit !== '' ? 'CUSTOMER' : 'VENDOR'}
              responseType={selectedRow.Debit && selectedRow.Debit !== '-' && selectedRow.Debit !== '' ? 'cashIn' : 'cashOut'}
              entryType='new'
              sales_items={[]}
              selectedInvoice={null}
              selectedCustomer={{}}
              reconciliateData={selectedRow}
              handleReconciliate = {(response, transaction, paymentMode, isAdvance) => handleAddUnmatchedRecord(response, transaction, 'receiptPaymentExpense', paymentMode, null, isAdvance)}
              bankId={selectBank.id}
            />
          }
        </Card>
      }
      <PopUpDialog
        open={importStatementOpen}
        handleClose={setImportStatementOpen}
        bankStatementColumn={bankStatementColumn}
        importBankName={importBankName}
        setImportBankName={setImportBankName}
        importBankColumn={importBankColumn}
        setImportBankColumn={setImportBankColumn}
        importExcel={importExcel}
      />
      <LocationAlert
          open = {openAlert}
          onClose = {() => setOpenAlert(false)}
      />
      <Dialog open={confirmationDialogOpen}>
        <DialogTitle>
          <Typography variant='h6'>Reconciliate Confirmation</Typography>
        </DialogTitle>

        <DialogContent>
          <Typography>Are you sure you want to submit the matched records for bank reconciliation?</Typography>
        </DialogContent>

        <DialogActions>
          <Grid container spacing={3} display='flex' justifyContent='flex-end'>
            <Grid>
              <Button variant='contained' color='error' 
                onClick={() => {
                  setConfirmationDialogOpen(false);
                  setSubmitDisable(false)
                }} 
                disabled={bounceSuccess}>
                  Cancel
                </Button>
            </Grid>

            <Grid>
              <Button variant='contained' onClick={handleReconciliation}>OK</Button>
              </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
      <Dialog open={filterOpen}>
        <DialogTitle>
          <Typography variant='h6'>Filter</Typography>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={3}>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Autocomplete
                options={rangeOptions}
                value={filterDetails.rangeOption}
                onChange={(event, newValue) => {
                  setFilterDetails((prev) => ({ ...prev, rangeOption: newValue }));
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
                  setFilterDetails((prev) => ({ ...prev, fromDate: startDate, toDate: endDate }));
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Select Range" fullWidth variant="filled" />
                )}
              />
            </Grid>

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  name='from'
                  label='From Date'
                  inputVariant='outlined'
                  format='DD/MM/YYYY'
                  value={toMomentOrNull(filterDetails.fromDate)}
                  onChange={(date) =>
                    setFilterDetails((prev) => ({ ...prev, fromDate: moment(date).format('YYYY-MM-DD') }))
                  }
                  views={['year', 'month', 'day']}
                  fullWidth={true}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'filled',
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  name='to'
                  label='To Date'
                  inputVariant='outlined'
                  format='DD/MM/YYYY'
                  value={toMomentOrNull(filterDetails.toDate)}
                  onChange={(date) =>
                    setFilterDetails((prev) => ({ ...prev, toDate: moment(date).format('YYYY-MM-DD') }))
                  }
                  views={['year', 'month', 'day']}
                  fullWidth={true}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'filled',
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Grid container spacing={3} display='flex' justifyContent='flex-end'>
            <Grid>
              <Button variant='contained' color='error' onClick={handleFilterClear}>Clear</Button>
            </Grid>

            <Grid>
              <Button variant='contained' onClick={handleFilterApply}>Apply</Button>
              </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
      <Dialog 
        open={adjustmentOpen.chequeBounced} 
        onClose={handleBounceCancel}
      >
        <DialogTitle>
          Confirm Status Change
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Typography variant='h6'>
                Are you sure you want to change the status to Bounced ?
              </Typography>
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  label='Bounced Date'
                  value={toMomentOrNull(selectedDate)}
                  onChange={(date) => handleDateChange(date)}
                  disableFuture
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'filled',
                      onKeyDown: (e) => e.preventDefault(),
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <Autocomplete
                value={bounceReason}
                options={bouncedReasons}
                onChange={(event, newValue) => setBounceReason(newValue)}
                renderInput={(params) => (
                  <TextField 
                    {...params}
                    label='Bounce Reason'
                    variant='filled'
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
                value={bounceBankCharges}
                variant='filled'
                label='Bank Charges'
                fullWidth
                onChange={(event) => setBounceBankCharges(event.target.value)}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
                value={remarks}
                variant='filled'
                label='Remarks'
                multiline
                fullWidth
                onChange={(event) => setRemarks(event.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            variant='contained'
            color='error'
            onClick={handleBounceCancel}
          >
            Cancel
          </Button>

          <Button
            variant='contained'
            color='primary'
            onClick={() => setChequeBounceConfirm(true)}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={chequeBounceConfirm} onClose={handleBounceCancel}>
        <DialogTitle>
          Cheque Bounce Confirmation
        </DialogTitle>
        
        <DialogContent>
          <Typography variant='h6'>
            Are you sure you want to mark this cheque as bounced?
          </Typography>
          <Typography variant='h6'>
            This action will revert the associated receipt/payment entries and cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleBounceCancel}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => handleBounceConfirm()} 
            disabled={countdown > 0}
          >
            OK {countdown > 0 && `(${countdown})`}
          </Button>
        </DialogActions>
      </Dialog>
      <ManualMatch
        open={adjustmentOpen.manualMatch}
        handleClose={() => setAdjustmentOpen((prev) => ({ ...prev, manualMatch: false }))}
        selectedRow={selectedRow}
        handleAddUnmatchedRecord={handleAddUnmatchedRecord}
        selectBank={selectBank}
      />
    </>
  );
}

export default BR;
