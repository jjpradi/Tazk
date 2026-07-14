import React, {useContext, useEffect, useState} from 'react';
import {
  TextField,
  Button,
  Grid,
  Box,
  Snackbar,
  Stack,
  IconButton,
  SnackbarContent,
  DialogContent,
  DialogActions,
  DialogTitle,
  Select,
  InputLabel,
  MenuItem,
  Dialog,
  FormControl,
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
} from 'redux/actions/bankCreation_actions';
import {createChequeBounceAction} from 'redux/actions/salesMan_action';
import MaterialTable from 'utils/SafeMaterialTable';
import * as XLSX from 'xlsx-js-style';
import {getConvertedDate} from 'components/common';
import moment from 'moment';
import _ from 'lodash';
import apiCalls from 'utils/apiCalls';
import { maxBodyHeight } from 'utils/pageSize';

import getData from './extractExcelTrans';

const EXTENSIONS = ['xlsx', 'xls', 'csv'];

export default function MatchEntries(props) {
  const [colDefs, setColDefs] = useState();
  const [data, setData] = useState();
  const [chequeBounceTransaction, setChequeBounceTransaction] = useState([]);
  const [color, setColor] = useState(false);
  const [manualEntry, setManualEntry] = useState(true);
  const [openDateDialog, setOpenDateDialog] = useState(false);
  const [importBankName, setImportBankName] = useState('');
  const [importBankColumn, setImportBankColumn] = useState([]);
  const [toastDetails, setToastDetails] = useState({
    open: false,
    message: '',
    color: '',
  });
  const [manualEntryData, setManualEntryData] = useState([
    // {
    //   date: '2022-07-18T00:00:00.000Z',
    //   description: 'aa',
    //   withdrawal: 400,
    //   isMatched: 0,
    // },
    // {
    //   date: '2022-08-04T00:00:00.000Z',
    //   description: 'bb',
    //   deposit: 2000,
    //   isMatched: 0,
    // },
    // {
    //   date: '2022-08-04T00:00:00.000Z',
    //   description: 'bb',
    //   deposit: 200,
    //   isMatched: 0,
    // },
  ]);
  const [matchedRows, setMatchedRows] = useState([]);
  // const [match, setMatch] = useState(false);
  const [selectedRow, setSelecedRow] = useState();
  const [manualEntryRow, setManualEntryRow] = useState([]);
  const [bankId, setBankId] = useState(1);
  const [computedBankReconciliation, setComputedBankReconciliation] = useState(
    [],
  );

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

  useEffect(() => {
  }, [manualEntryRow]);


  const importExcel = (e) => {
    setManualEntry(false);
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = (event) => {
      //parse data
      const bstr = event.target.result;
      const workBook = XLSX.read(bstr, {type: 'binary'});

      //get first sheet
      const workSheetName = workBook.SheetNames[0];
      const workSheet = workBook.Sheets[workSheetName];

      // const fileData = XLSX.utils.sheet_to_json(workSheet, {header: 1, raw: false});

      // const headers = fileData[0];
      // const heads = headers.map((head) => ({title: head, field: head}));
      // setColDefs(heads);

      //removing header//
      // fileData.splice(0, 1);

      // setData(convertToJson(headers, fileData));

      let tempData = getData(workSheet, importBankColumn);
      if (tempData === 'Invalid file') {
        setToastDetails({
          open: true,
          color: '#ff474e',
          message: 'Invalid File',
        });
        setData([]);
        setOpenDateDialog(false);
      } else if (tempData.length === 0) {
        setToastDetails({
          open: true,
          color: '#f5bf42',
          message: 'No transaction found',
        });
        setData([]);
        setOpenDateDialog(false);
      } else {
        setToastDetails({
          open: true,
          color: '#2ec754',
          message: 'Imported Successfully',
        });
        setOpenDateDialog(false);
        setData(tempData);
        setChequeBounceTransaction(
          tempData.filter((item) => item.reference === 'CHEQUE BOUNCE'),
        );
      }
    };

    if (file) {
      if (getExtension(file)) {
        reader.readAsBinaryString(file);
      } else {
        alert('Invalid file input , Select Excel or CSV file');
      }
    } else {
      setData([]);
      setColDefs([]);
    }
  };

  const dispatch = useDispatch();
  const {
    bankCreationReducer: {
      bank_accounts,
      bank_reconciliation,
      bankStatementColumn,
    },
  } = useSelector((state) => state);
  const {setModalTypeHandler, setLoaderStatusHandler,commoncookie,
    headerLocationId} = useContext(
    CreateNewButtonContext,
  );


  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(listBankAccounts(setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(
        getBankStatementColumnNameAction(
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      ),
      dispatch(
        listBankReconciliation(
          bankId,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      )
      
    );
  }, []);

  useEffect(() => {
    setComputedBankReconciliation(bank_reconciliation);
  }, [bank_reconciliation]);


  let navigate = useNavigate();

  function handleClick() {
    navigate('/accounts/bankReconciliation');
  }

  const handleManualEntry = () => {
    setManualEntry(true);
  };

  const handleSave = () => {
    let tempArray = [];
    let tempObj = {
      bankReconciliation: {},
      matchedRows,
    };
    matchedRows.map((item) => {
      tempArray.push(new Date(item.date));
    });
    tempObj.bankReconciliation.fromDate = moment(
      new Date(Math.min.apply(null, tempArray)),
    ).format('yyyy-MM-DD');
    tempObj.bankReconciliation.toDate = moment(
      new Date(Math.max.apply(null, tempArray)),
    ).format('yyyy-MM-DD');
    tempObj.bankReconciliation.reconciliateDate = moment(new Date()).format(
      'yyyy-MM-DD',
    );
    tempObj.bankReconciliation.bankId = bankId;
    tempObj.bankReconciliation.noOfEntries = matchedRows.length;
    tempObj.bankReconciliation.isActive = '';
    tempObj.bankReconciliation.isDeleted = 0;
    tempObj.bankReconciliation.createdAt = moment(new Date()).format(
      'yyyy-MM-DD',
    );
    tempObj.bankReconciliation.modifiedAt = '';
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      headerLocationId,
      dispatch(
        addBankReconciliationTableAction(
          tempObj,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      ),
      // Saving cheque bounce transaction to DB
      dispatch(
        createChequeBounceAction(
          commoncookie,
          headerLocationId,
          chequeBounceTransaction,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      )

    );


    // redirect to bankreconciliation home table
    handleClick();
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
        reference: rowData.description,
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
  }, [matchedRows]);


  const handleTableChange = (e) => {
    const value = e.target.value;
    value === 'manualEntryTable' ? setManualEntry(true) : setManualEntry(false);
  };

  return (
    <>
      <Grid
        container
        display='flex'
        flexDirection='row'
        justifyContent='flex-end'
        
        paddingBottom='20px'
      >
        <Grid container justifyContent='flex-start'>
          <Typography sx={{fontSize: '25px'}} paddingBottom={10}>
            Match Entries
          </Typography>
        </Grid>
        <Dialog
          disableEscapeKeyDown
          open={openDateDialog}
          onClose={() => {
            setOpenDateDialog(false);
          }}
        >
          <DialogTitle variant='h2'>
            Import Transaction in excel format
          </DialogTitle>
          <DialogContent>
            <Box
              component='form'
              sx={{display: 'flex', gap: '30px', marginTop: '20px'}}
            >
              <FormControl sx={{minWidth: '150px'}}>
                <InputLabel id='demo-select-small' sx={{fontSize: '15px'}}>
                  Bank Name
                </InputLabel>
                <Select
                  value={importBankName}
                  label='Bank Name'
                  onChange={(e) => {
                    let tempArr = bankStatementColumn.find(
                      (item) => item.bank_name === e.target.value,
                    );
                    setImportBankName(tempArr.bank_name);
                    setImportBankColumn(tempArr.statement_column);
                  }}
                >
                  {bankStatementColumn.map((item) => (
                    <MenuItem
                      key={item.id}
                      value={item.bank_name}
                      data-id={item.id}
                    >
                      {item.bank_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant='outlined'
                fullWidth
                component='label'
                sx={{minWidth: '150px'}}
                disabled={importBankColumn.length === 0}
              >
                <input type='file' hidden onChange={importExcel} />
                <Typography style={{fontSize: '15px'}}>Select File</Typography>
              </Button>
            </Box>
          </DialogContent>
          <DialogActions
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '10px',
            }}
          >
            <Button
              variant='contained'
              onClick={() => {
                setOpenDateDialog(false);
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* buttons */}

        <Grid
          container
          justifyContent='space-between'
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid>
            <Autocomplete
              disablePortal
              disableClearable
              value={
                bank_accounts.length > 0
                  ? _.find(bank_accounts, ['bankAccountId', bankId])
                  : {bankName: ''}
              }
              id='combo-box-demo'
              options={bank_accounts}
              onChange={(e, data) => {
                setBankId(data.bankAccountId);
                apiCalls(
                  setModalTypeHandler,
                  setLoaderStatusHandler,
                  dispatch(
                    listBankReconciliation(
                      data.bankAccountId,
                      setModalTypeHandler,
                      setLoaderStatusHandler,
                    ),
                  )
                );
              }}
              fullWidth
              sx={{ width: 150 }}
              getOptionLabel={(option) => option.bankName}
              renderInput={(params) => (
                <TextField
                  fullWidth
                  label='Choose Bank'
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      // height: '42px',
                    },
                  }}
                  onChange={({target}) => setBankId(target.value)}
                  {...params}
                  placeholder='Bank'
                />
              )}
            />
          </Grid>
          <Grid 
          sx={{gap:'10px', display: {md: 'flex', lg: 'flex',sm:'flex', xl: "block"}}}>
            <Grid alignItems='flex-end'>
              <Button
                // sx={{marginLeft: 'auto'}}
                variant='contained'
                fullWidth
                component='label'
                sx={{height: '100%'}}
                onClick={() => {
                  setOpenDateDialog(true);
                }}
              >
                <Typography >Import Statement</Typography>
              </Button>
            </Grid>
            <Grid>
              {/* <Button
            variant='contained'
            fullWidth
            sx={{height: '42px'}}
            onClick={handleManualEntry}
          >
            <Typography>Manual Entry</Typography>
          </Button> */}

              <FormControl fullWidth sx={{minWidth: 150, height: '42px'}}>
                <InputLabel>Choose Table</InputLabel>
                <Select
                  value={
                    manualEntry ? 'manualEntryTable' : 'importStatementTable'
                  }
                  label='Choose Table'
                  onChange={handleTableChange}
                >
                  <MenuItem value={'manualEntryTable'}>
                    Manual Entry Table
                  </MenuItem>
                  <MenuItem value={'importStatementTable'}>
                    Import Statement Table
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid
          size={{
            lg: 6,
            md: 6,
            sm: 12,
            xs: 12
          }}>
          <MaterialTable
            actions={[
              {
                icon: (rowData) => (
                  <div style={{display: 'flex'}}>
                    <Button
                      variant='outlined'
                      disabled={rowData.isMatched === 1}
                    >
                      Select
                    </Button>
                  </div>
                ),
                onClick: (event, rowData) => {
                  setSelecedRow(rowData);
                },
                tooltip: 'Match',
                isFreeAction: false,
              },
            ]}
            // onSelectionChange={(clickedRow) => {
            //   if (clickedRow.length === 0) setMatch(false);
            //   setSelecedRow(clickedRow);
            // }}
            options={{
              search: false,
              exportButton: true,
              // selection: (rowData) => {
              //   if (rowData.id === selectedRow.id) return false;
              //   return false;
              // },
              // showSelectAllCheckbox: false,
              filtering: false,
              actionsColumnIndex: -1,
              maxBodyHeight: maxBodyHeight,
              pageSizeOptions: [20, 50, 100],
              rowStyle: (rowData) => ({
                backgroundColor: rowData.isMatched === 1 ? '#A0D995' : '',
                boxShadow:
                  rowData?.id === selectedRow?.id
                    ? '0 0 14px rgba(0, 133, 242)'
                    : '',
              }),
            }}
            columns={[
              {
                title: 'Date',
                field: 'transactionDate',
                type: 'date',
                dateSetting: {locale: 'en-GB', format: 'DD/MM/yyyy'},
              },
              {title: 'Detail', field: 'description'},
              {title: 'Mode', field: 'sale_time'},
              {title: 'Amount', field: 'amount'},
            ]}
            title={<Typography variant='h6'>Transactions</Typography>}
            data={computedBankReconciliation}
          />
        </Grid>

        {!manualEntry ? (
          <Grid
            xx={12}
            size={{
              lg: 6,
              md: 6,
              sm: 12
            }}>
            <div>
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
                    fontSize: '20px',
                  }}
                  message={
                    <span id='client-snackbar'>{toastDetails.message}</span>
                  }
                />
              </Snackbar>
            </div>

            {/* Import Table */}
            <MaterialTable
              actions={[
                {
                  icon: () => (
                    <div style={{display: 'flex'}}>
                      <Button
                        variant='outlined'
                        disabled={selectedRow === undefined}
                      >
                        Match
                      </Button>
                    </div>
                  ),
                  onClick: (event, rowData) => {
                    matchImportActionButton(event, rowData);
                  },
                  tooltip: 'Match',
                  isFreeAction: false,
                },
              ]}
              options={{
                search: false,
                exportButton: true,
                filtering: false,
                actionsColumnIndex: -1,
                maxBodyHeight: maxBodyHeight,
                pageSizeOptions: [20, 50, 100],
                rowStyle: (rowData) => ({
                  backgroundColor: rowData.isMatched === 1 ? '#A0D995' : '',
                }),
              }}
              columns={[
                {
                  title: 'Date',
                  field: 'date',
                },
                {
                  title: 'Reference',
                  field: 'reference',
                },
                {
                  title: 'Deposit',
                  field: 'deposit',
                },
                {
                  title: 'Withdrawal',
                  field: 'withdrawal',
                },
              ]}
              title={<Typography variant='h6'>Import Table</Typography>}
              data={data}
            />
          </Grid>
        ) : (
          <Grid
            xx={12}
            size={{
              lg: 6,
              md: 6,
              sm: 12
            }}>
            {/* Manual Entry Table */}
            <MaterialTable
              actions={[
                {
                  icon: () => (
                    <div style={{display: 'flex'}}>
                      <Button
                        variant='outlined'
                        disabled={selectedRow === undefined}
                      >
                        Match
                      </Button>
                    </div>
                  ),
                  onClick: (event, rowData) => {
                    setManualEntryRow(rowData);
                    matchManualEntryAction(rowData);
                  },
                  tooltip: 'Match',
                  isFreeAction: false,
                },
              ]}
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
                maxBodyHeight: maxBodyHeight,
                pageSizeOptions: [20, 50, 100],
                rowStyle: (rowData) => ({
                  backgroundColor: rowData.isMatched === 1 ? '#A0D995' : '',
                }),
              }}
              columns={[
                {
                  title: 'Date',
                  field: 'date',
                  type: 'date',
                  dateSetting: {locale: 'en-GB', format: 'DD/MM/yyyy'},
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
                {title: 'Withdrawal', field: 'withdrawal', type: 'numeric'},
                {title: 'Deposit', field: 'deposit', type: 'numeric'},
              ]}
              title={<Typography variant='h6'>Manual Entry</Typography>}
              data={manualEntryData}
            />
          </Grid>
        )}

        <Grid
          display='flex'
          justifyContent='flex-start'
          size={{
            lg: 6,
            md: 6,
            sm: 6,
            xs: 6
          }}>
          {/* {match === true ? (
            <Typography>Matched</Typography>
          ) : (
            <Typography>Unmatched</Typography>
          )} */}
          <Typography> </Typography>
        </Grid>
        <Grid
          display='flex'
          justifyContent='flex-end'
          gap={5}
          size={{
            lg: 6,
            md: 6,
            sm: 6,
            xs: 6
          }}>
          {/* <Button variant='outlined' onClick={handleChequeBounce}>
           cheque Bounces
          </Button> */}
          <Button variant='outlined' onClick={handleClick}>
            Close
          </Button>
          {computedBankReconciliation.length > 0 &&
          computedBankReconciliation.every((item) => item.isMatched === 1) ? (
            <Button
              variant='contained'
              onClick={() => {
                handleSave();
              }}
            >
              Save
            </Button>
          ) : (
            <Button variant='contained' disabled>
              Save
            </Button>
          )}
        </Grid>

        {/* <Grid container display='flex' flexDirection='row' spacing={3}>
        <Grid size={{ lg: 6 }}>
          <TableContainer component={Paper}>
            <Table aria-label='collapsible table'>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Date</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>Mode</TableCell>
                  <TableCell>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody></TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid size={{ lg: 6 }}>
          <TableContainer component={Paper}>
            <Table aria-label='collapsible table'>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Date</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Withdrawal</TableCell>
                  <TableCell>Deposit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody></TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid> */}
      </Grid>
    </>
  );
}

