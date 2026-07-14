import React, {useContext, useEffect, useState} from 'react';
import {
  Button,
  Grid,
  Autocomplete,
  Stack,
  Box,
  Card
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import {useNavigate} from 'react-router-dom';
import Typography from '@mui/material/Typography';
import {connect, useDispatch, useSelector} from 'react-redux';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {
  listBankAccounts,
  listBankReconciliation,
  addBankReconciliationTableAction,
  getBankStatementColumnNameAction,
  selectedTransaction,
  getRecordsAction,
} from 'redux/actions/bankCreation_actions';
import {createChequeBounceAction} from 'redux/actions/salesMan_action';
import MaterialTable from 'utils/SafeMaterialTable';
import * as XLSX from 'xlsx-js-style';
import moment from 'moment';
import _ from 'lodash';
import apiCalls from 'utils/apiCalls';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle } from 'utils/pageSize';
import { DataGrid } from '@mui/x-data-grid';
import CommonSearch from 'utils/commonSearch';
import PopUpDialog from './popUp';
import { ErrormsgAlert } from 'redux/actions/load';

import getData from './extractExcelTrans';

const EXTENSIONS = ['xlsx', 'xls', 'csv'];

export default function BankDetails(props) {
  const dispatch = useDispatch();
  const {
    bankCreationReducer: {
      bank_accounts,
      bank_reconciliation,
      bankStatementColumn,
      bank_id
    },
  } = useSelector((state) => state);
  const {setModalTypeHandler, setLoaderStatusHandler,commoncookie,
    headerLocationId} = useContext(
    CreateNewButtonContext,
  );
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
  const [manualEntryData, setManualEntryData] = useState([]);
  const [matchedRows, setMatchedRows] = useState([]);
  // const [match, setMatch] = useState(false);
  const [selectedRow, setSelecedRow] = useState();
  const [manualEntryRow, setManualEntryRow] = useState([]);
  const [bankId, setBankId] = useState(1);
  const [computedBankReconciliation, setComputedBankReconciliation] = useState(
    [],
  );
  const [matchedData,setMatchedData] = useState(
    [],
  );
  const [unMatchedData,setUnMatchedData] = useState(
    [],
  );
  




  const [isApiFinished, setIsApiFinished] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchVal, setSearchVal] = useState('');
  const [searchData, setSearchData] = useState([]);

// console.log("selectedRows",selectedRows)

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
            overAllRecord:computedBankReconciliation,
            excelData:ExcelData
          }
         
          apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(
              getRecordsAction(
                data,
                    (res) => {
                      // console.log("res",res)
                      setMatchedData(res.matched);
                      setUnMatchedData(res.unmatched);
                      if (res.matched && res.matched.length > 0) {
                     
                        navigate('/matchedRecordPage', {
                          state: {
                            matchedRowData: res.matched,
                            unmatchedRowData: res.unmatched,
                  
                          },
                        });
                      } else {
                        navigate('/unMatchedRecordPage', {
                          state: {
                            matchedRowData: res.matched,
                            unmatchedRowData: res.unmatched,
                        
                          },
                        });
                        ErrormsgAlert(dispatch, "No matched data found!");
                      }
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
  };


  // const importExcel = (e) => {
  //   console.log("event",e)
  //   setManualEntry(false);
  //   const file = e.target.files[0];

  //   if (!file) {
  //     setToastDetails({
  //       open: true,
  //       color: '#ff474e',
  //       message: 'No file selected',
  //     });
  //     return;
  //   }

  //   const validExtensions = ['xls', 'xlsx', 'csv'];
  //   const fileExtension = file.name.split('.').pop().toLowerCase();
  
  //   if (!validExtensions.includes(fileExtension)) {
  //     setToastDetails({
  //       open: true,
  //       color: '#ff474e',
  //       message: 'Invalid File Format. Please upload an Excel or CSV file.',
  //     });
  //     return;
  //   }



  //   const reader = new FileReader();
  //   reader.onload = (event) => {
  //     //parse data
  //     const bstr = event.target.result;
  //     const workBook = XLSX.read(bstr, {type: 'binary'});

  //     //get first sheet
  //     const workSheetName = workBook.SheetNames[0];
  //     const workSheet = workBook.Sheets[workSheetName];
  //      console.log("workSheet",workSheet)
  //     // const fileData = XLSX.utils.sheet_to_json(workSheet, {header: 1, raw: false});

  //     // const headers = fileData[0];
  //     // const heads = headers.map((head) => ({title: head, field: head}));
  //     // setColDefs(heads);

  //     //removing header//
  //     // fileData.splice(0, 1);

  //     // setData(convertToJson(headers, fileData));

  //     let tempData = getData(workSheet, importBankColumn);
  //     if (tempData === 'Invalid file') {
  //       setToastDetails({
  //         open: true,
  //         color: '#ff474e',
  //         message: 'Invalid File',
  //       });
  //       setData([]);
  //       setOpenDateDialog(false);
  //     } else if (tempData.length === 0) {
  //       setToastDetails({
  //         open: true,
  //         color: '#f5bf42',
  //         message: 'No transaction found',
  //       });
  //       setData([]);
  //       setOpenDateDialog(false);
  //     } else {
  //       setToastDetails({
  //         open: true,
  //         color: '#2ec754',
  //         message: 'Imported Successfully',
  //       });
  //       setOpenDateDialog(false);
  //       setData(tempData);
  //       setChequeBounceTransaction(
  //         tempData.filter((item) => item.reference === 'CHEQUE BOUNCE'),
  //       );
  //     }
  //   };

  //  if (file) {
  //     reader.readAsArrayBuffer(file); 
  //   }
  // };

  useEffect(() => {
    // apiCalls(
    //   setModalTypeHandler,
    //   setLoaderStatusHandler,
    //   dispatch(listBankAccounts(setModalTypeHandler, setLoaderStatusHandler)),
      // dispatch(
      //   getBankStatementColumnNameAction(
      //     setModalTypeHandler,
      //     setLoaderStatusHandler,
      //   ),
      // ),
    //   dispatch(
    //     listBankReconciliation(
    //       bankId,
    //       setModalTypeHandler,
    //       setLoaderStatusHandler,
    //     ),
    //   ),
    // );

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        listBankReconciliation(
          bank_id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      ),
    ).finally(() => setIsApiFinished(true));
    
  }, []);

  useEffect(() => {
    setComputedBankReconciliation(bank_reconciliation);
  }, [bank_reconciliation]);


  let navigate = useNavigate();

  function handleClick() {
    navigate('/accounts/bankReconciliation');
  }
  
  function handleNextClick() {
    dispatch(selectedTransaction(selectedRows))
    navigate('/autoMatch');
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
  }, [matchedRows]);


  const handleTableChange = (e) => {
    const value = e.target.value;
    value === 'manualEntryTable' ? setManualEntry(true) : setManualEntry(false);
  };

  const rowData = [
    {
      headerName: 'Date',
      field: 'date',
      flex: 1,
      minWidth: 100,
    },
    {
      headerName: 'Detail',
      field: 'transactionNote',
      flex: 1,
      minWidth: 200,
    },
    {
      headerName: 'Mode',
      field: 'payment_type',
      flex: 1,
      minWidth: 100,
    },
    {
      headerName: 'Withdrawal',
      field: 'withdrawal',
      flex: 1,
      minWidth: 100,
      align:'right'
    },
    {
      headerName: 'Deposit',
      field: 'deposit',
      flex: 1,
      minWidth: 100,
      align:'right'
    },
    {
      headerName: 'Reference Number',
      field: 'reference',
      flex: 1,
      minWidth: 200,
    }
  ]

  const handleSelection = (selected) => {
    let filter = computedBankReconciliation.filter((item) =>
    selected.includes(item.id)
    )
    setSelectedRows(filter)
  }

  const requestSearch = (e) => {
    let val = e.target.value
    setSearchVal(val)
    let searchKeywords = val 

    const searchSplit = searchKeywords.trim().split(/\s+/);

    const matchedRecords = computedBankReconciliation.filter((record) => {
      const recordValues = flattenObjectValues(record).join(" ").toLowerCase();
  
      // Check if all search keywords are present in the record values
      const allKeywordsPresent = searchSplit.every((keyword) =>
        recordValues.includes(keyword.toLowerCase())
      );
  
      return allKeywordsPresent;
    });

    setSearchData(matchedRecords)
  };

  const flattenObjectValues = (obj) => {
    const values = [];
  
    function flatten(value) {
      if (typeof value === "object" && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(flatten);
        } else {
          Object.values(value).forEach(flatten);
        }
      } else if (value !== null && value !== undefined) {
        let val = value.toString();
        values.push(val);
      }
    }
  
    flatten(obj);
    return values;
  };

  const cancelSearch = (e) => {
    setSearchVal('')
    setSearchData([])
  };

  let totalAmount = computedBankReconciliation.map((d) => d.amount).reduce((accumulator, currentValue) => {
    return accumulator + currentValue
  },0);

  return (
    <>
      <Grid
        container
        display='flex'
        flexDirection='row'
        alignItems='center'
        spacing={5}
        pb='20px'
      >
        <Grid
          size={{
            lg: 6,
            md: 6,
            sm: 6,
            xs: 6
          }}>
          <Typography variant='h6'>Bank Details</Typography>
        </Grid>

        {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
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
              sx={{fontSize:headerStyle.fontSize 
              }}
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
                  variant='filled'
                />
              )}
            />
          </Grid> */}

        {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
          <MaterialTable
            // actions={[
            //   {
            //     icon: (rowData) => (
            //       <div style={{display: 'flex'}}>
            //         <Button
            //           variant='outlined'
            //           disabled={rowData.isMatched === 1}
            //         >
            //           Select
            //         </Button>
            //       </div>
            //     ),
            //     onClick: (event, rowData) => {
            //       setSelecedRow(rowData);
            //     },
            //     tooltip: 'Match',
            //     isFreeAction: false,
            //   },
            // ]}
            // onSelectionChange={(clickedRow) => {
            //   if (clickedRow.length === 0) setMatch(false);
            //   setSelecedRow(clickedRow);
            // }}
            options={{
              headerStyle,
              cellStyle,
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
                field: 'date',
                type: 'date',
                dateSetting: {locale: 'en-GB', format: 'DD/MM/yyyy'},
              },
              {title: 'Detail', field: 'description'},
              {title: 'Mode', field: 'payment_type'},
              {title: 'Amount', field: 'amount'},
              {title:'Reference Number', field:'reference'},
              {title:'Cheque Date', field:'chequeDate'},
              {title:'Cheque Number', field:'chequeNumber'},


            ]}
            title={<Typography variant='h6'>Transactions</Typography>}
            data={computedBankReconciliation}
          />
        </Grid> */}

        {/* <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
          <Grid
            spacing={7}
            container
            direction='row'
            display='flex'
            justifyContent='flex-end'
            paddingTop='25px'
          >
            <Grid>
              <Button
                onClick={() => handleClick()}
                name='back'
                variant='outlined'
                color='secondary'
                size='medium'
                text='button'
                fullWidth={false}
                type='back'
              >
                Back
              </Button>
            </Grid>

            <Grid>
              <Button
                onClick={() => handleNextClick()}
                name='Next'
                variant='outlined'
                color='primary'
                size='medium'
                text='button'
                fullWidth={false}
                type='next'
                disabled={!selectedRows.length && true}
              >
                Next
              </Button>
            </Grid>
          </Grid>
        </Grid> */}
      </Grid>
      <Card sx={{ p: '20px', width: '100%', height: '100vh' }}>
        <Grid
          container
          display="flex"
          flexDirection="row"
          alignItems="center"
          pb="15px"
        >
        
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 4
            }}>
            <Typography variant="h6" align="left" p="0px">
              {'Unreconcilated Transactions'}
            </Typography>
          </Grid>

         
          <Grid
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            gap={2}
            size={{
              xs: 12,
              sm: 6,
              md: 8
            }}>
            
            <Button
              variant="outlined"
              // disabled={selectedRows.length === 0}
              onClick={() => {
                setOpenDateDialog(true);
              }}
              sx={{ minWidth: '200px' }} 
            >
              <Typography>{'Import Statement'}</Typography>
            </Button>

            {/* Search Bar */}
            <CommonSearch
              searchVal={searchVal}
              cancelSearch={cancelSearch}
              requestSearch={requestSearch}
            />
          </Grid>
        </Grid>



        <Grid>
          <div style={{ padding: '0px 10px' }}>
            <Typography
              variant='h6'
              align='right'
              color='black'
              style={{ marginRight: 35 }}
            >
              {' '}
              Total Amount to be reconciled : {totalAmount}
            </Typography>
          </div>
        </Grid>

        <Box
          p='20px'
          sx={{
            backgroundColor: '#F4F7FE',
            width: '100%',
            height: '80%',
          }}
        >
          <DataGrid
            rows={searchVal ? searchData : computedBankReconciliation}
            columns={rowData}
            density='compact'
            // checkboxSelection
            // selectionModel={selectedRow}
            // onSelectionModelChange={handleSelection}
            slots={{
              noRowsOverlay: () => (
                <Stack
                  height='100%'
                  alignItems='center'
                  justifyContent='center'
                  mt='25%'
                >
                  {isApiFinished ? 'No rows' : ''}
                </Stack>
              ),
            }}
            initialState={{
              pagination: {
                paginationModel: {
                  page: 0,
                  pageSize: 10000,
                },
              },
            }}
            sx={{
              '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': { width: 0 },
              '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb': {
                backgroundColor: '#B2B2B2',
                borderRadius: 2,
                border: '2px solid white',
              },
              '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb:hover': {
                background: '#999',
              },
            }}
          />
        </Box>
       
        <Box
          display="flex"
          justifyContent="flex-end"
          sx={{
            marginTop: '7px', 
          }}
        >
          <Button
            variant="outlined"
            color='error'
            onClick={() => {
              navigate('/accounts/bankReconciliation')

            }}
          >
            Close
          </Button>
        </Box>
      </Card>
      { openDateDialog && 
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
      }
    </>
  );
}

