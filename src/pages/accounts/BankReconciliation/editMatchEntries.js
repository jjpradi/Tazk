import React, {useContext, useEffect, useState} from 'react';
import {TextField, Button, Grid} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import {connect, useDispatch, useSelector} from 'react-redux';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {
  getMatchedReconciliationAction,
  addBankReconciliationTableAction,
} from 'redux/actions/bankCreation_actions';
import MaterialTable from 'utils/SafeMaterialTable';
import * as XLSX from 'xlsx-js-style';
import {getConvertedDate} from 'components/common';
import moment from 'moment';
import _ from 'lodash';
import apiCalls from 'utils/apiCalls';
import { maxBodyHeight } from 'utils/pageSize';

export default function EditMatchEntries(props) {
  const [colDefs, setColDefs] = useState();
  const [data, setData] = useState();
  const [color, setColor] = useState(false);
  const [manualEntry, setManualEntry] = useState(true);
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
  const [bankId, setBankId] = useState(2);
  const [computedBankReconciliation, setComputedBankReconciliation] = useState(
    [],
  );

  useEffect(() => {
  }, [manualEntryRow]);


  const dispatch = useDispatch();
  const {
    bankCreationReducer: {matched_reconciliation_entry},
  } = useSelector((state) => state);
  const {setModalTypeHandler, setLoaderStatusHandler} = useContext(
    CreateNewButtonContext,
  );


  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        getMatchedReconciliationAction(
          props.editData.id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      )
    );
  }, []);

  useEffect(() => {
    setComputedBankReconciliation(
      matched_reconciliation_entry.posReconciliationData,
    );
    setManualEntryData(matched_reconciliation_entry.manualReconciliationData);
  }, [matched_reconciliation_entry]);

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
      dispatch(
        addBankReconciliationTableAction(
          tempObj,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      )
    );
  };

  const matchImportActionButton = (rowData) => {
    let rowDeposit = rowData.Deposit;
    let selectedrowAmount = selectedRow.amount;
    let rowDataDate = rowData.Date;
    let selectedRowDate = selectedRow.transactionDate.slice(0, 10);

  };

  const matchManualEntryAction = (rowData) => {
    let manualEntryDeposit =
      parseInt(rowData.deposit) || parseInt(rowData.withdrawal);
    let selectedRowAmount = parseInt(selectedRow.amount);
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


  const handleEdit = (previousData, updatedData, newRow) => {
    // Checks whether the values(withdrawal / deposit amount) has been modified or not. 
    // If modified it returns the modified row data.
    const result1 = previousData.filter(({ withdrawal: id1 }) => !updatedData.some(({ withdrawal: id2 }) => id2 === id1));
    const result2 = previousData.filter(({ deposit: id1 }) => !updatedData.some(({ deposit: id2 }) => id2 === id1));
    
    const final = result1.length > 0 ? result1 :  result2;
    
    const temp = computedBankReconciliation.map((item) => {
        if (item.id === final[0].accounttransactionId) {
          return {...item, isMatched:0};
        } else {
          return item;
        }
      });
    setComputedBankReconciliation(temp);


    const temp1 = manualEntryData.map((item, i) => {
        if (item.accounttransactionId === final[0].accounttransactionId) {
          return {...newRow, isMatched: 0};
        } else {
          return item;
        }
      });
    setManualEntryData(temp1);


  };

  return (
    <>
      <Grid
        container
        // display='flex'
        // flexDirection='row'
        // justifyContent='center'
        // spacing={3}
        paddingBottom='20px'
      >
        <Grid
          size={{
            lg: 6,
            md: 6,
            sm: 12,
            xs: 12
          }}>
          <Typography variant='h6'>Update Matched Entries</Typography>
        </Grid>
        {/* <Grid size={{ xs: 12, sm: 2, md: 2, lg: 2 }}
          item
          display='flex'
          justifyContent='flex-end'
        >
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
              dispatch(
                listBankReconciliation(
                  data.bankAccountId,
                  setModalTypeHandler,
                  setLoaderStatusHandler,
                ),
              );
            }}
            fullWidth
            getOptionLabel={(option) => option.bankName}
            renderInput={(params) => (
              <TextField
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: '42px',
                  },
                }}
                onChange={({target}) => setBankId(target.value)}
                {...params}
                placeholder='Bank'
              />
            )}
          />
        </Grid> */}

        {/* <Grid size={{ xs: 12, sm: 2, md: 2, lg: 2 }}
          item
          display='flex'
          justifyContent='flex-end'
        >
          <Button
            variant='contained'
            fullWidth
            sx={{height: '42px'}}
            onClick={handleManualEntry}
          >
            <Typography>Manual Entry</Typography>
          </Button>
        </Grid> */}
      </Grid>
      <Grid container spacing={3}>
        <Grid
          xx={12}
          size={{
            lg: 6,
            md: 6,
            sm: 12
          }}>
          <MaterialTable
            actions={[
              {
                icon: () => (
                  <div style={{display: 'flex'}}>
                    <Button variant='outlined'>Select</Button>
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
                backgroundColor: rowData.isMatched === 1 ? '#CDFFCD' : '',
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
            title={'Transactions'}
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
            <MaterialTable
              actions={[
                {
                  icon: () => (
                    <div style={{display: 'flex'}}>
                      <Button variant='outlined'>Match</Button>
                    </div>
                  ),
                  onClick: (event, rowData) => {
                    matchImportActionButton(rowData);
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
              }}
              columns={colDefs}
              title={'Import Table'}
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
            <MaterialTable
              actions={[
                {
                  icon: () => (
                    <div style={{display: 'flex'}}>
                      <Button variant='outlined'>Match</Button>
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
                onRowUpdate: (newRow, oldRow) =>
                  new Promise((resolve, reject) => {
                    const previousData = [...manualEntryData];
                    const updatedData = [...manualEntryData];
                    updatedData[oldRow.tableData.id] = newRow;
                    setTimeout(() => resolve(), 500);
                    handleEdit(previousData, updatedData, newRow);
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
                  backgroundColor: rowData.isMatched === 1 ? '#CDFFCD' : '',
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
                  field: 'reference',
                  validate: (rowData) => {
                    if (
                      rowData.reference === undefined ||
                      rowData.reference === ''
                    ) {
                      return 'Required';
                    } else {
                      if (rowData.reference.length === 0) {
                        return 'Required';
                      }
                      return true;
                    }
                  },
                },
                {title: 'Withdrawal', field: 'withdrawal', type: 'numeric'},
                {title: 'Deposit', field: 'deposit', type: 'numeric'},
              ]}
              title={'Manual Entry'}
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
          <Button
            variant='outlined'
            onClick={() => {
              props.setEditTableOpen(false);
            }}
          >
            Close
          </Button>
          <Button
            variant='contained'
            // disabled={
            //   !computedBankReconciliation.every((item) => item.isMatched === 1)
            // }
            onClick={() => {
              handleSave();
            }}
          >
            Save
          </Button>
        </Grid>
      </Grid>
    </>
  );
}

