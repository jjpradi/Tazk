import React, {useContext, useEffect, useState} from 'react';
import {
  Button,
  Grid,
  Box,
  Snackbar,
  SnackbarContent,
  DialogContent,
  DialogActions,
  DialogTitle,
  Select,
  InputLabel,
  MenuItem,
  Dialog,
  FormControl,
  Stack,
  TextField,
  Alert,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import {useNavigate} from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import {connect, useDispatch, useSelector} from 'react-redux';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {
  listBankAccounts,
  listBankReconciliation,
  addBankReconciliationTableAction,
  getBankStatementColumnNameAction,
  addedPayInOutTransactions,
} from 'redux/actions/bankCreation_actions';
import {createChequeBounceAction} from 'redux/actions/salesMan_action';
import MaterialTable from 'utils/SafeMaterialTable';
import * as XLSX from 'xlsx-js-style';
import {getConvertedDate} from 'components/common';
import moment from 'moment';
import _, {concat} from 'lodash';
import {
  maxBodyHeight,
  maxHeight,
  pageSize,
  headerStyle,
  cellStyle,
  font14_500,
} from 'utils/pageSize';
import apiCalls from 'utils/apiCalls';
import CSVReader from 'react-csv-reader';
import PopUpDialog from './popUp';
import PayInOutDialog from './payInOutDialog';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';

import getData from './extractExcelTrans';
import toMomentOrNull from 'utils/DateFixer';

const EXTENSIONS = ['xlsx', 'xls', 'csv'];

const green = '#b8fcd5';
const red = '#f7f2f2';
const white = '#FFFFFF';

export default function AutoMatch(props) {
  const dispatch = useDispatch();
  let navigate = useNavigate();

  const {
    bankCreationReducer: {
      bank_accounts,
      bank_reconciliation,
      bankStatementColumn,
      selected_transaction,
      bank_id,
      setPayInOutCount,
    },
    CashOutInReducer: {cashOutInData},
  } = useSelector((state) => state);

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(CreateNewButtonContext);

  const [colDefs, setColDefs] = useState();
  const [data, setData] = useState([]);
  const [chequeBounceTransaction, setChequeBounceTransaction] = useState([]);
  const [color, setColor] = useState('#FFFFFF');
  const [manualEntry, setManualEntry] = useState(false);
  const [openDateDialog, setOpenDateDialog] = useState(false);
  const [importBankName, setImportBankName] = useState('');
  const [importBankColumn, setImportBankColumn] = useState([]);
  const [autoMatch, setAutoMatch] = useState(undefined);
  const [importMatch, setImportMatch] = useState(undefined);
  const [toastDetails, setToastDetails] = useState({
    open: false,
    message: '',
    color: '',
  });
  const [manualEntryData, setManualEntryData] = useState([]);
  const [matchedRows, setMatchedRows] = useState([]);
  const [autoMatchedEntry, setAutoMatchedEntry] = useState([]);
  // const [match, setMatch] = useState(false);
  const [selectedRow, setSelecedRow] = useState();
  const [manualEntryRow, setManualEntryRow] = useState([]);
  const [bankId, setBankId] = useState(1);
  const [computedBankReconciliation, setComputedBankReconciliation] = useState(
    [],
  );
  const [csvKey, setCSVKey] = useState(0);
  const [yes, setYes] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [matchedLeft, setMatchedLeft] = useState(undefined);
  const [matchedRight, setMatchedRight] = useState(undefined);
  const [isReconciliated, setIsReconciliated] = useState(false);
   const [warning, setWarning] = useState("");

  const prevData = data;

  const getExtension = (file) => {
    const parts = file.name.split('.');

    const extension = parts[parts.length - 1];

    return EXTENSIONS.includes(extension);
  };

  const convertToJson = (headers, data) => {
    const rows = [];
    data.forEach((row) => {
      let rowData = {};
      row.forEach((element, index) => {
        rowData[headers[index]] = element;
      });
      rows.push(rowData);
    });
    return rows;
  };

  // useEffect(() => {
  // }, [manualEntryRow]);

  const importExcel = (e) => {
    setIsReconciliated(true);
    const file = e.target.files[0];
  
    if (!file) {
      setToastDetails({
        open: true,
        color: '#ff474e',
        message: 'No file selected',
      });
      return;
    }
  
    const validExtensions = ['xls', 'xlsx', 'csv'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
  
    if (!validExtensions.includes(fileExtension)) {
      setToastDetails({
        open: true,
        color: '#ff474e',
        message: 'Invalid File Format. Please upload an Excel or CSV file.',
      });
      return;
    }
  
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const bstr = event.target.result;
        const workBook = XLSX.read(bstr, { type: 'array' }); // Changed to 'array'
  
        // Ensure at least one sheet exists
        if (!workBook.SheetNames.length) {
          throw new Error('No sheets found in the file.');
        }
  
        const workSheetName = workBook.SheetNames[0];
        const workSheet = workBook.Sheets[workSheetName];
  
        let tempData = getData(workSheet, importBankColumn, importBankName);
  
        if (!tempData || tempData === 'Invalid file') {
          throw new Error('Invalid File Structure.');
        } else if (tempData.length === 0) {
          setToastDetails({
            open: true,
            color: '#f5bf42',
            message: 'No transactions found in file.',
          });
          return;
        }
  
        setToastDetails({
          open: true,
          color: '#2ec754',
          message: 'File Imported Successfully!',
        });
  
        let mergedArray = data.length ? concat(tempData, data) : tempData;
        setData(mergedArray);
  
        setChequeBounceTransaction(
          mergedArray.filter((item) => item.reference === 'CHEQUE BOUNCE')
        );
  
        let uniqueResultOne = computedBankReconciliation.filter(
          (obj) =>
            !mergedArray.some(
              (obj2) =>
                obj.reference !== null &&
                obj2.reference === obj.reference &&
                obj.amount == obj2.amount.toString().split(' ')[0]
            )
        );
  
        let uniqueResultTwo = mergedArray.filter(
          (obj) =>
            !computedBankReconciliation.some(
              (obj2) =>
                obj.reference !== null &&
                obj.reference === obj2.reference &&
                obj.amount.toString().split(' ')[0] === obj2.amount
            )
        );
  
        if (isReconciliated) {
          setAutoMatch(uniqueResultOne);
          setImportMatch(uniqueResultTwo);
        } else {
          setAutoMatch(undefined);
          setImportMatch(undefined);
        }
  
        let matchedAuto = computedBankReconciliation.filter((itemB) =>
          mergedArray.some(
            (itemA) =>
              itemA.reference === itemB.reference &&
              itemA.amount.toString().split(' ')[0] ===
                itemB.amount.toString().split(' ')[0]
          )
        );
  
        let matchedImport = mergedArray.filter((itemB) =>
          computedBankReconciliation.some(
            (itemA) =>
              itemA.reference === itemB.reference &&
              itemA.amount.toString().split(' ')[0] ===
                itemB.amount.toString().split(' ')[0]
          )
        );
  
        setMatchedLeft(matchedAuto);
        setMatchedRight(matchedImport);
      } catch (error) {
        setToastDetails({
          open: true,
          color: '#ff474e',
          message: error.message || 'Error processing file',
        });
        setData([]);
      }
    };
  
    reader.onerror = () => {
      setToastDetails({
        open: true,
        color: '#ff474e',
        message: 'Error reading the file. Please try again.',
      });
    };
  
    if (file) {
      reader.readAsArrayBuffer(file); // Changed from `readAsBinaryString` to `readAsArrayBuffer`
    }
  };
  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      // dispatch(listBankAccounts(setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(
        getBankStatementColumnNameAction(
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      ),
      // dispatch(
      //   listBankReconciliation(
      //     bankId,
      //     setModalTypeHandler,
      //     setLoaderStatusHandler,
      //   ),
      // )
    );
  }, []);

  useEffect(() => {
    if (cashOutInData !== undefined) {
      let mergedArray = computedBankReconciliation.concat(cashOutInData);
      setComputedBankReconciliation(mergedArray);

      let result1 = mergedArray; //-----------------------------------------------selected column-------------------------------------------
      let result2 = data; //---------------------------------------------------------excel---------------------------------------------------

      var uniqueResultOne = result1.filter(function (obj) {
        return !result2.some(function (obj2) {
          let finalResult =
            obj.reference !== null &&
            obj2.reference == obj.reference &&
            obj.amount == obj2.amount.toString().split(' ')[0];
          return finalResult;
        });
      });

      //Find values that are in result2 but not in result1
      var uniqueResultTwo = result2.filter(function (obj) {
        return !result1.some(function (obj2) {
          let finalResult =
            obj.reference !== null &&
            obj.reference == obj2.reference &&
            obj.amount.toString().split(' ')[0] == obj2.amount;
          return finalResult;
        });
      });

      //Combine the two arrays of unique entries
      //  var result = uniqueResultOne.concat(uniqueResultTwo);

      if (isReconciliated) {
        setAutoMatch(uniqueResultOne);
        setImportMatch(uniqueResultTwo);
      } else {
        setAutoMatch(undefined);
        setImportMatch(undefined);
      }
      let unmatched = uniqueResultOne.map((d) => d.id);

      const elementsToKeep = _.filter(
        computedBankReconciliation,
        (v) => !_.includes(unmatched, v.id),
      );
      setAutoMatchedEntry(elementsToKeep);

      let matchedAuto = result1.filter((itemB) =>
        result2.some(
          (itemA) =>
            itemA.reference == itemB.reference &&
            itemA.amount.toString().split(' ')[0] ==
              itemB.amount.toString().split(' ')[0],
        ),
      );

      let matchedImport = result2.filter((itemB) =>
        result1.some(
          (itemA) =>
            itemA.reference == itemB.reference &&
            itemA.amount.toString().split(' ')[0] ==
              itemB.amount.toString().split(' ')[0],
        ),
      );

      setMatchedLeft(matchedAuto);
      setMatchedRight(matchedImport);
    }
  }, [cashOutInData !== undefined && cashOutInData.length > 0]);

  useEffect(() => {
    let result1 = computedBankReconciliation; //-----------------------------------------------selected column-------------------------------------------
    let result2 = data; //---------------------------------------------------------excel---------------------------------------------------

    var uniqueResultOne = result1.filter(function (obj) {
      return !result2.some(function (obj2) {
        let finalResult =
          obj.reference !== null &&
          obj2.reference == obj.reference &&
          obj.amount == obj2.amount.toString().split(' ')[0];
        return (
          (obj.date == obj2.date &&
            obj.amount == obj2.amount.toString().split(' ')[0]) ||
          finalResult
        );
      });
    });

    //Find values that are in result2 but not in result1
    var uniqueResultTwo = result2.filter(function (obj) {
      return !result1.some(function (obj2) {
        let finalResult =
          obj.reference !== null &&
          obj.reference == obj2.reference &&
          obj.amount.toString().split(' ')[0] == obj2.amount;
        return finalResult;
      });
    });

    //Combine the two arrays of unique entries
    //  var result = uniqueResultOne.concat(uniqueResultTwo);

    if (isReconciliated) {
      setAutoMatch(uniqueResultOne);
      setImportMatch(uniqueResultTwo);
    } else {
      setAutoMatch(undefined);
      setImportMatch(undefined);
    }
    let unmatched = uniqueResultOne.map((d) => d.id);

    const elementsToKeep = _.filter(
      computedBankReconciliation,
      (v) => !_.includes(unmatched, v.id),
    );
    setAutoMatchedEntry(elementsToKeep);

    let matchedAuto = result1.filter((itemB) =>
      result2.some(
        (itemA) =>
          itemA.reference == itemB.reference &&
          itemA.amount.toString().split(' ')[0] ==
            itemB.amount.toString().split(' ')[0],
      ),
    );

    let matchedImport = result2.filter((itemB) =>
      result1.some(
        (itemA) =>
          itemA.reference == itemB.reference &&
          itemA.amount.toString().split(' ')[0] ==
            itemB.amount.toString().split(' ')[0],
      ),
    );

    setMatchedLeft(matchedAuto);
    setMatchedRight(matchedImport);
  }, [prevData.length !== data.length]);

  useEffect(() => {
    setComputedBankReconciliation(selected_transaction);
  }, [selected_transaction]);

  function handleClick() {
    navigate('/accounts/bankReconciliation');
  }

  const handleManualEntry = () => {
    setManualEntry(true);
  };

  const handleSave = async () => {
    let tempArray = [];

    let tempObj = {
      bankReconciliation: {},
      matchedLeft,
    };

    matchedLeft.map((item) => {
      const dateParts = item.date.split('/');
      // Rearrange the elements to form "yyyy-mm-dd" format
      const rearrangedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      tempArray.push(new Date(rearrangedDate));
    });

    // Find the minimum and maximum dates
    tempObj.bankReconciliation.fromDate = moment(
      new Date(Math.min(...tempArray)),
    ).format('yyyy-MM-DD');
    tempObj.bankReconciliation.toDate = moment(
      new Date(Math.max(...tempArray)),
    ).format('yyyy-MM-DD');
    tempObj.bankReconciliation.reconciliateDate = moment(new Date()).format(
      'yyyy-MM-DD',
    );

    tempObj.bankReconciliation.bankId = bank_id;
    tempObj.bankReconciliation.noOfEntries = matchedLeft.length;
    tempObj.bankReconciliation.isActive = '';
    tempObj.bankReconciliation.isDeleted = 0;
    tempObj.bankReconciliation.createdAt = moment(new Date()).format(
      'yyyy-MM-DD',
    );
    tempObj.bankReconciliation.modifiedAt = '';

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        addBankReconciliationTableAction(
          tempObj,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      ),
    );

    //Saving cheque bounce transaction to DB
    if (chequeBounceTransaction.length) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          createChequeBounceAction(
            commoncookie,
            headerLocationId,
            chequeBounceTransaction,
          ),
        ),
      );
    }

    // redirect to bank reconciliation home table
    await handleClick();
  };

  const matchImportActionButton = (e, row) => {
    // change all object's key to lowercase
    const rowData = Object.fromEntries(
      Object.entries(row).map(([k, v]) => [k.toLowerCase(), v]),
    );

    let importEntryDeposit =
      parseInt(rowData.deposit) || parseInt(rowData.withdrawal);
    let selectedRowAmount = Math.abs(parseInt(selectedRow.amount));
    let rowDataDate = moment(rowData.date).format('yyyy-MM-DD');
    let selectedRowDate = selectedRow.transactionDate.slice(0, 10);

    if (
      importEntryDeposit === selectedRowAmount &&
      rowDataDate === selectedRowDate
    ) {
      let tempObj = {
        bankReconciliationId: '',
        accounttransactionId: selectedRow.id,
        date: selectedRow.transactionDate.slice(0, 10),
        reference: rowData.reference,
        withdrawal: rowData.withdrawal || '',
        deposit: rowData.deposit || '',
        createdAt: moment(new Date()).format('yyyy-MM-DD'),
        modifiedAt: '',
      };
      setMatchedRows((oldArray) => [...oldArray, tempObj]);

      const temp = computedBankReconciliation.map((item) => {
        if (item.id === selectedRow.id) {
          return {...item, isMatched: 1};
        } else {
          return item;
        }
      });

      setComputedBankReconciliation(temp);

      const temp1 = data.map((item, i) => {
        if (i === rowData.tabledata.index) {
          return {...item, isMatched: 1};
        } else {
          return item;
        }
      });

      setData(temp1);
    }

    // let rowDeposit = rowData.Deposit;
    // let selectedrowAmount = selectedRow.amount;
    // let rowDataDate = rowData.Date;
    // let selectedRowDate = selectedRow.transactionDate.slice(0, 10);
    // if (rowDeposit === selectedrowAmount && rowDataDate === selectedRowDate) {
    // } else {
    // }
  };

  const matchManualEntryAction = (rowData) => {
    let manualEntryDeposit =
      parseInt(rowData.deposit) || parseInt(rowData.withdrawal);
    let selectedRowAmount = Math.abs(parseInt(selectedRow.amount));
    // let rowDataDate = getConvertedDate(rowData.date);
    let rowDataDate = moment(rowData.date).format('yyyy-MM-DD');
    let selectedRowDate = selectedRow.transactionDate.slice(0, 10);

    if (
      manualEntryDeposit === selectedRowAmount &&
      rowDataDate === selectedRowDate
    ) {
      let tempObj = {
        bankReconciliationId: '',
        accounttransactionId: selectedRow.id,
        date: selectedRow.transactionDate.slice(0, 10),
        reference: rowData.transactionNote,
        withdrawal: rowData.withdrawal || '',
        deposit: rowData.deposit || '',
        createdAt: moment(new Date()).format('yyyy-MM-DD'),
        modifiedAt: '',
      };
      setMatchedRows((oldArray) => [...oldArray, tempObj]);

      const temp = computedBankReconciliation.map((item) => {
        if (item.id === selectedRow.id) {
          return {...item, isMatched: 1};
        } else {
          return item;
        }
      });

      setComputedBankReconciliation(temp);

      const temp1 = manualEntryData.map((item, i) => {
        if (i === rowData.tableData.index) {
          return {...item, isMatched: 1};
        } else {
          return item;
        }
      });

      setManualEntryData(temp1);
    }
  };

  useEffect(() => {
    handleRowAdd();
  }, [data]);

  const handleTableChange = (e) => {
    const value = e.target.value;
    value === 'manualEntryTable' ? setManualEntry(true) : setManualEntry(false);
  };

  const handleRowAdd = () => {
    let result1 = computedBankReconciliation;
    let result2 = data;

    var uniqueResultOne = result1.filter(function (obj) {
      return !result2.some(function (obj2) {
        let finalResult =
          obj.reference !== null &&
          obj2.reference == obj.reference &&
          obj.amount == obj2.amount.toString().split(' ')[0];
        return finalResult;
      });
    });

    //Find values that are in result2 but not in result1
    var uniqueResultTwo = result2.filter(function (obj) {
      return !result1.some(function (obj2) {
        let finalResult =
          obj.reference !== null &&
          obj.reference == obj2.reference &&
          obj.amount.toString().split(' ')[0] == obj2.amount;
        return finalResult;
      });
    });

    //Combine the two arrays of unique entries
    if (isReconciliated) {
      setAutoMatch(uniqueResultOne);
      setImportMatch(uniqueResultTwo);
    } else {
      setAutoMatch(undefined);
      setImportMatch(undefined);
    }
    let unmatched = uniqueResultOne.map((d) => d.id);
    const elementsToKeep = _.filter(
      computedBankReconciliation,
      (v) => !_.includes(unmatched, v.id),
    );
    setAutoMatchedEntry(elementsToKeep);

    let matchedAuto = result1.filter((itemB) =>
      result2.some(
        (itemA) =>
          itemA.reference == itemB.reference &&
          itemA.amount.toString().split(' ')[0] ==
            itemB.amount.toString().split(' ')[0],
      ),
    );

    let matchedImport = result2.filter((itemB) =>
      result1.some(
        (itemA) =>
          itemA.reference == itemB.reference &&
          itemA.amount.toString().split(' ')[0] ==
            itemB.amount.toString().split(' ')[0],
      ),
    );

    setMatchedLeft(matchedAuto);
    setMatchedRight(matchedImport);
  };

  function getRandomInt(max) {
    return Math.floor(Math.random() * max) + 1;
  }

  const showAlert = (message) => {
    setWarning(message);
    setTimeout(() => setWarning(""), 3000); // Remove alert after 3 seconds
  };


  return (
    <Grid
      container
      display='flex'
      flexDirection='row'
      alignItems='center'
      spacing={4}
      pt='7px'
    >
      <Snackbar
        open={toastDetails.open}
        autoHideDuration={4000}
        onClose={() => {
          setToastDetails({...toastDetails, open: false});
        }}
      >
        <SnackbarContent
          style={{
            backgroundColor: toastDetails.color,
            fontSize: '14px',
          }}
          message={<span id='client-snackbar'>{toastDetails.message}</span>}
        />
      </Snackbar>
      <Grid
        size={{
          lg: 8,
          md: 7,
          sm: 6,
          xs: 12
        }}>
        <Typography variant='h6'>{'Match Entries'}</Typography>
      </Grid>
      <Grid
        size={{
          lg: 4,
          md: 5,
          sm: 6,
          xs: 12
        }}>
        <Stack display='flex' direction='row' gap={2} alignItems='center'>
          <Button
            variant='outlined'
            fullWidth
            onClick={() => setPaymentOpen(true)}
          >
            <Typography> {'Pay In / Pay Out'} </Typography>
          </Button>

          <Button
            variant='outlined'
            fullWidth
            onClick={() => {
              setOpenDateDialog(true);
            }}
          >
            <Typography>{'Import Statement'}</Typography>
          </Button>
        </Stack>
      </Grid>
      {/*-----------------------------------------------------------------------------------transaction table-----------------------------------------------------------------------------------*/}
      <Grid
        size={{
          lg: 6,
          md: 6,
          sm: 12,
          xs: 12
        }}>
        <MaterialTable
          editable={{
            onRowDelete: (oldData) =>
              new Promise((resolve, reject) => {
                setTimeout(async () => {
                  // const index = oldData.tableData.id;
                  const id = oldData.tableData.id;

                  const deleteData = [...computedBankReconciliation];
                  // deleteData.splice(index, 1);

                  let finalData = deleteData.filter(item => item.id !== id)
                  await setComputedBankReconciliation(finalData);

                  const updatedMatchedLeft = [...matchedLeft];
                  let filteredArray = updatedMatchedLeft.filter(
                    (item) => item.id !== id,
                  );
                  await setMatchedLeft(filteredArray);

                  resolve();
                }, 1000);
              }),
          }}
          icons={{
            Add: () => <AddIcon />,
            Edit: () => (
              <EditOutlinedIcon sx={{color: '#0A8FDC'}} fontSize='small' />
            ),
            Delete: () => (
              <DeleteOutlineOutlinedIcon
                sx={{color: '#F1564E'}}
                fontSize='small'
              />
            ),
          }}
          options={{
            headerStyle,
            cellStyle,
            search: true,
            exportButton: false,
            filtering: false,
            // actionsColumnIndex: -1,
            maxBodyHeight: 'calc(100vh - 400px)',
            minBodyHeight: '500px',
            overflowY: 'auto',
            paging: true, // Enable pagination
            pageSize: 1000, // Set the number of rows per page
            pageSizeOptions: [], // Disable the page size options dropdown
            showFirstLastPageButtons: false, // Hide "First" and "Last" page buttons
            paginationType: 'stepped', // Use "stepped" pagination type
            rowStyle: (rowData) => {
              let backgroundColor = '';

              if (matchedLeft.length) {
                if (matchedLeft.some((d) => d.id === rowData.id)) {
                  backgroundColor = green;
                } else {
                  backgroundColor = red;
                }
              } else if (!matchedLeft.length && matchedRight.length) {
                backgroundColor = red;
              } else {
                backgroundColor = white;
              }

              // if (autoMatch === undefined) {
              //   backgroundColor = white
              // } else if (autoMatch !== undefined) {
              //   if (autoMatch.some((d) => d.id === rowData.id)) {
              //     backgroundColor = red; // Blue
              //   } else if (autoMatch.some((d) => d.id !== rowData.id)) {
              //     backgroundColor = green; // Green
              //   }
              // } else if (autoMatch.length === 0) {
              //   backgroundColor = green;
              // } else {
              //   backgroundColor = white
              // }

              // if (autoMatch !== undefined) {
              //   if (autoMatch.some((d) => d.id === rowData.id)) {
              //     backgroundColor = '#D7EAFA'; // Blue
              //   } else if (autoMatch.some((d) => d.id !== rowData.id)) {
              //     backgroundColor = '#b8fcd5'; // Green
              //   }
              // } else if (matchedLeft !== undefined) {
              //   if (matchedLeft.some((d) => d.id === rowData.id)) {
              //     backgroundColor = '#b8fcd5'; // Green
              //   } else if (matchedLeft.some((d) => d.id !== rowData.id)) {
              //     backgroundColor = '#D7EAFA'; // Blue
              //   }
              // }

              return {
                backgroundColor: backgroundColor,
              };
            },
          }}
          columns={[
            {
              title: 'Date2',
              field: 'date',
              type: 'date',
              dateSetting: {locale: 'en-GB', format: 'DD/MM/yyyy'},
            },
            {
              title: 'Reference',
              field: 'reference',
            },
            {title: 'Detail', field: 'transactionNote'},
            {title: 'Amount', field: 'amount'},
            {title: 'Mode', field: 'payment_type'},
            {title: 'Cheque Date', field: 'chequeDate'},
            {title: 'Cheque Num', field: 'chequeNumber'},
          ]}
          title={<Typography variant='h6'>{'Transactions'}</Typography>}
          data={computedBankReconciliation}
        />
      </Grid>
      {/*----------------------------------------------------------------------import table-------------------------------------------------------------------------*/}
      <Grid
        xx={12}
        size={{
          lg: 6,
          md: 6,
          sm: 12
        }}>
      {warning && (
        <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999 }}>
          <Alert severity="warning" variant="filled">
            {warning}
          </Alert>
        </div>
      )}

        <MaterialTable
          editable={{
            onRowAdd: async (newRow) => {
              await new Promise((resolve, reject) => {

                if (!newRow.date || !newRow.reference || !newRow.amount) {
                  showAlert("All fields (Date, Reference, Amount) are required!"); 
                  reject(); // Prevent row insertion
                  return;
                }

                newRow.ids = getRandomInt(10000);
                setData([...data, newRow]);
                setIsReconciliated(true);
                handleRowAdd();
                setTimeout(() => resolve(), 500);
              });
            },

            onRowUpdate: (newRow, oldRow) =>
              new Promise((resolve, reject) => {
                const updatedData = [...data];
                updatedData[oldRow.tableData.id] = newRow;
                setData(updatedData);
                handleRowAdd();
                setTimeout(() => resolve(), 500);
              }),

            onRowDelete: (oldData) =>
              new Promise((resolve, reject) => {
                setTimeout(async () => {
                  const dataDelete = [...data];
                  const id = oldData.tableData.ids;
                  //console.log('hi',dataDelete,id);
                  
                  // dataDelete.splice(index, 1);
                  let finalData = dataDelete.filter(item => item.id !== id)
                  await setData(finalData);
                  handleRowAdd();
                  resolve();
                }, 1000);
              }),
          }}
          icons={{
            Add: () => <AddIcon />,
            Edit: () => (
              <EditOutlinedIcon sx={{color: '#0A8FDC'}} fontSize='small' />
            ),
            Delete: () => (
              <DeleteOutlineOutlinedIcon
                sx={{color: '#F1564E'}}
                fontSize='small'
              />
            ),
          }}
          options={{
            headerStyle,
            cellStyle,
            search: true,
            exportButton: true,
            filtering: false,
            // actionsColumnIndex: -1,
            maxBodyHeight: 'calc(100vh - 400px)',
            minBodyHeight: '500px',
            overflowY: 'auto',
            // paging: false,
            paging: true, // Enable pagination
            pageSize: 1000, // Set the number of rows per page
            pageSizeOptions: [], // Disable the page size options dropdown
            showFirstLastPageButtons: false, // Hide "First" and "Last" page buttons
            paginationType: 'stepped', // Use "stepped" pagination type
            rowStyle: (rowData) => {
              let backgroundColor = '';

              if (matchedRight.length) {
                if (matchedRight.some((d) => d.ids === rowData.ids)) {
                  backgroundColor = green;
                } else {
                  backgroundColor = red;
                }
              } else if (!matchedRight.length && matchedLeft.length) {
                backgroundColor = red;
              } else {
                backgroundColor = white;
              }

              // if (importMatch === undefined) {
              //   backgroundColor = white
              // } else if (importMatch !== undefined) {
              //   if (importMatch.some((d) => d.id === rowData.id)) {
              //     backgroundColor = red; // Blue
              //   } else if (importMatch.some((d) => d.id !== rowData.id)) {
              //     backgroundColor = green; // Green
              //   }
              // } else if (importMatch.length === 0) {
              //   backgroundColor = green;
              // } else {
              //   backgroundColor = white
              // }

              // if (importMatch !== undefined) {
              //   if (importMatch.some((d) => d.ids === rowData.ids)) {
              //     backgroundColor = '#D7EAFA'; // Blue
              //   } else if (importMatch.some((d) => d.ids !== rowData.ids)) {
              //     backgroundColor = '#b8fcd5'; // Green
              //   }
              // } else if (matchedRight !== undefined) {
              //   if (matchedRight.some((d) => d.ids === rowData.ids)) {
              //     backgroundColor = '#b8fcd5'; // Green
              //   } else if (matchedRight.some((d) => d.ids !== rowData.ids)) {
              //     backgroundColor = '#D7EAFA'; // Blue
              //   }
              // }

              return {
                backgroundColor: backgroundColor,
              };
            },
          }}
          columns={[
            {
              title: (
                <Typography variant="body2" fontWeight="bold">
                  Date <span style={{ color: 'red' }}>*</span>
                </Typography>
              ),
              field: 'date',
              render: (rowData) =>
                rowData.date
                  ? new Date(rowData.date).toLocaleDateString("en-GB")
                  : "",
              editComponent: (props) => (
                // <TextField
                //   type="date"
                //   value={props.value || ''}
                //   onChange={(e) => props.onChange(e.target.value)}
                //   // variant="standard" 
                //   // sx={{ border: 'none', outline: 'none' }} 
                //   InputLabelProps={{ shrink: true }}
                // />
                (<LocalizationProvider dateAdapter={DateAdapter}>
                  <DatePicker
                    value={toMomentOrNull(props.value)}
                    format='DD/MM/YYYY'
                    onChange={(newValue) => props.onChange(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        onKeyDown: (e) => e.preventDefault(),
                        InputLabelProps: { shrink: true },
                      },
                    }}
                  />
                </LocalizationProvider>)
              ),
            },
            {
              title: (
                <Typography variant="body2" fontWeight="bold">
                  Reference <span style={{ color: 'red' }}>*</span>
                </Typography>
              ),
              field: 'reference',
              render: (rowData) =>
                (rowData.reference === '' ? null : rowData.reference),
              editComponent: (props) => (
                <TextField
                  value={props.value || ""}
                  onChange={(e) => props.onChange(e.target.value)}
                  variant="standard" 
                  sx={{ border: 'none', outline: 'none' }} 
                  
                />
              ),
            },
            {
              title: (
                <Typography variant="body2" fontWeight="bold">
                  Amount <span style={{ color: 'red' }}>*</span>
                </Typography>
              ),
              field: 'amount',
              editComponent: (props) => (
                <TextField
                 type="number"
                  value={props.value || ""}
                  onChange={(e) => props.onChange(e.target.value)}
                  variant="standard" 
                  sx={{ border: 'none', outline: 'none' }} 
                />
              ),
            },
          ]}
          title={<Typography variant='h6'>{'Import Table'}</Typography>}
          data={data}
        />
      </Grid>
      {/*----------------------------------------------------------------------manual entry table------------------------------------------------------------------*/}
      {/* {manualEntry && (
        <Grid size={{ lg: 6 }}>
          <MaterialTable
            editable={{
              onRowAdd: (newRow) =>
                new Promise((resolve, reject) => {
                  setManualEntryData([...manualEntryData, newRow]);
                  setTimeout(() => resolve(), 500);
                }),

              onRowUpdate: (newRow, oldRow) =>
                new Promise((resolve, reject) => {
                  const updatedData = [...manualEntryData];
                  updatedData[oldRow.tableData.id] = newRow;
                  setManualEntryData(updatedData);
                  setTimeout(() => resolve(), 500);
                }),
            }}
            options={{
              search: false,
              exportButton: true,
              filtering: false,
              actionsColumnIndex: -1,
              maxBodyHeight: 'calc(100vh - 250px)',
              pageSizeOptions: [20, 50, 100],
            }}
            columns={[
              {
                title: 'Date',
                field: 'date',
              },
              {
                title: 'Reference',
                field: 'description',
                validate: (rowData) => {
                  if (
                    rowData.description === undefined ||
                    rowData.description === ''
                  ) {
                    return 'Required';
                  } else {
                    if (rowData.description.length === 0) {
                      return 'Required';
                    }
                    return true;
                  }
                },
              },
              {title: 'Withdrawal', field: 'withdrawal', type: 'number'},
              {title: 'Deposit', field: 'deposit', type: 'number'},
            ]}
            title={'Manual Entry'}
            data={manualEntryData}
          />
        </Grid>
      )} */}
      {/*------------------------------------------------------------------------------------button--------------------------------------------------------------------------------------*/}
      <Grid
        display='flex'
        justifyContent='flex-end'
        gap={4}
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <Button variant='outlined' color='secondary' onClick={handleClick}>
          Close
        </Button>

        <Button
          variant='outlined'
          color='primary'
          disabled={matchedLeft !== undefined && !matchedLeft?.length}
          onClick={() => {
            handleSave();
          }}
        >
          {'Submit'}
        </Button>
      </Grid>
      {/* <div>
        {yes === true ? (
          <Typography>Matched</Typography>
        ) : (
          <Typography>Unmatched</Typography>
        )}
        <Typography> </Typography>
      </div> */}
      {/* --------------------------------------------------------------------------------------excel import---------------------------------------------------------------------------------- */}
      <PopUpDialog
        open={openDateDialog}
        handleClose={setOpenDateDialog}
        bankStatementColumn={bankStatementColumn}
        importBankName={importBankName}
        setImportBankName={setImportBankName}
        setImportBankColumn={setImportBankColumn}
        importBankColumn={importBankColumn}
        importExcel={importExcel}
      />
      {/* -----------------------------------------------------------------------------------pay in out----------------------------------------------------------------------------------- */}
      <PayInOutDialog
        open={paymentOpen}
        handleClose={() => setPaymentOpen(false)}
        type={'BANKRECONCILIATION'}
      />
    </Grid>
  );
}

