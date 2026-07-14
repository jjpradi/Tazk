import React, { useContext, useEffect, useState } from 'react'
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Tooltip, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import CommonSearch from 'utils/commonSearch';
import { useDispatch, useSelector } from 'react-redux';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { getSearchManualMatchAction, ListManualMatchRecordsAction, setSearchManualMatchAction } from 'redux/actions/bankCreation_actions';
import ManualMatchReceipt from './ManualMatchRecipt';

const ManualMatch = (props) => {

    const dispatch = useDispatch()

    const { headerLocationId, setModalTypeHandler, setLoaderStatusHandler } = useContext(
        CreateNewButtonContext
    )

    const {
        bankCreationReducer: { getManualMatchRecords, manualMatchRecordsCount }
    } = useSelector((state) => state)

    const [paginateData, setPaginateData] = useState({
        searchString: '',
        pageCount: 0,
        pageSize: 20
    })

    const [selectedRows, setSelectedRows] = useState([])
    const [receiptDialog, setReceiptDialog] = useState(false)
    const [sales_items, setSalesItems] = useState([])
    const [editData, setEditData] = useState({})
    const [newlyCreatedRecord, setNewlyCreatedRecord] = useState(null)

    const selectedType = props?.selectedRow?.Credit && props?.selectedRow?.Credit !== '-' && props?.selectedRow?.Credit !== '' ? 'Receipts' : 'Payments'

    const unmatchedAmount = selectedType === 'Receipts' ? props?.selectedRow?.Credit || '' : props?.selectedRow?.Debit || ''

    const selectedAmount = selectedRows.reduce((total, row) => total + Number(row.amount || 0), 0)

    const diffeAmount = unmatchedAmount - selectedAmount

    const idOf = (r) => Number(r?.payment_transaction_id ?? r?.id ?? -1)

    const selectedOnPageCount = getManualMatchRecords?.filter(r => selectedRows.some(s => idOf(s) === idOf(r)))

    const bankId = props?.selectBank ? props?.selectBank.id : ''

    useEffect(() => {
        if(props.open) {
            const payload = {
                searchString: paginateData.searchString,
                pageCount: paginateData.pageCount,
                numPerPage: paginateData.pageSize,
                type: selectedType,
                location_id: headerLocationId,
                bankId: bankId
            }
            dispatch(ListManualMatchRecordsAction(payload))
        }
    }, [paginateData.pageCount, paginateData.pageSize, props.open, headerLocationId])

    const handlePageChange = (page) => {
        setPaginateData({...paginateData, pageCount: page})
    }

    const handlePageSizeChange = (size) => {
        setPaginateData({...paginateData, pageSize: size})
    }

    const requestSearch = (e) => {
        const val = e.target.value
        setPaginateData({...paginateData, searchString: val, pageCount: 0})
        dispatch(setSearchManualMatchAction({ data: [], numRows: 0 }))

        const payload = {
            searchString: val,
            pageCount: 0,
            numPerPage: paginateData.pageSize,
            type: selectedType,
            location_id: headerLocationId,
            bankId: bankId
        }
        dispatch(getSearchManualMatchAction(payload, setModalTypeHandler, setLoaderStatusHandler))
    }

    const cancelSearch = () => {
        setPaginateData({...paginateData, searchString: '', pageCount: 0})
        dispatch(setSearchManualMatchAction({ data: [], numRows: 0 }))

        const payload = {
            searchString: '',
            pageCount: paginateData.pageCount,
            numPerPage: paginateData.pageSize,
            type: selectedType,
            location_id: headerLocationId,
            bankId: bankId
        }
        dispatch(getSearchManualMatchAction(payload, setModalTypeHandler, setLoaderStatusHandler))
    }

    const handleCancel = () => {
        setSelectedRows([])
        setNewlyCreatedRecord(null)
        setPaginateData({...paginateData, pageCount: 0, pageSize: 20, searchString: ''})
        dispatch(setSearchManualMatchAction({ data: [], numRows: 0 }))
        props.handleClose()
    }

    const handleSubmit = () => {
        // const accId = selectedRows.map((d) => d.accountTransactionId)
        const paymentTransactionId = selectedRows.map((d) => d.payment_transaction_id)
        const bankAccId = selectedRows.map((d) => d.bankAccountId)
        const amount = selectedRows.map((d) => d.amount)
        const data = {
            date: selectedRows[0].receipt_date,
            // transactionEntryId: accId,
            bankAccountId: bankAccId,
            amount: amount,
            paymentTransactionId: paymentTransactionId
        }
        props.handleAddUnmatchedRecord(null, null, 'ManualMatch', null, data)
        handleCancel()
    }

    const convertExcelDateToString = (excelDate) => {
        if (!excelDate) return '-';
        const excelEpoch = new Date((excelDate - 25569) * 86400 * 1000);
        return excelEpoch.toLocaleDateString('en-GB') === 'Invalid Date' ? excelDate : excelEpoch.toLocaleDateString('en-GB');
    }

    const handleToggleSelectAllOnPage = (checked) => {
        setSelectedRows((prev) => {
            const pageIds = getManualMatchRecords.map(r => idOf(r))
            if(checked) {
                const toAdd = getManualMatchRecords.filter(r => !prev.some(p => idOf(p) === idOf(r)))
                return [...prev, ...toAdd]
            }
            else {
                return prev.filter(p => !pageIds.includes(idOf(p)))
            }
        })
    }

    const handleToggleRow = (row, checked) => {
        setSelectedRows((prev) => {
            if(checked) {
                if (!prev.some(p => idOf(p) === idOf(row))) {
                    return [...prev, row]
                }
                return prev
            }
            else {
                return prev.filter(p => idOf(p) !== idOf(row))
            }
        })
    }

    useEffect(() => {
        if (newlyCreatedRecord && getManualMatchRecords?.length > 0) {
            const found = getManualMatchRecords.find(
                r => idOf(r) === idOf(newlyCreatedRecord)
            )
            if (found) {
                setSelectedRows(prev => {
                    if (!prev.some(p => idOf(p) === idOf(found))) {
                        return [...prev, found]
                    }
                    return prev
                })
            }
        }
    }, [getManualMatchRecords, newlyCreatedRecord])


    const handleReceiptSubmitClose = (newRecord) => {
        const payload = {
            searchString: paginateData.searchString,
            pageCount: paginateData.pageCount,
            numPerPage: paginateData.pageSize,
            type: selectedType,
            location_id: headerLocationId,
            bankId: bankId
        }
        dispatch(ListManualMatchRecordsAction(payload))

        if (newRecord) {
            setNewlyCreatedRecord({ payment_transaction_id: Number(newRecord) })
        }
        setReceiptDialog(false)
    }

    const columns = [
        {
            title: (
                <Checkbox 
                    indeterminate={
                        getManualMatchRecords?.length > 0 &&
                        selectedOnPageCount > 0 && selectedOnPageCount < getManualMatchRecords.length
                    }
                    checked={getManualMatchRecords?.length > 0 && selectedOnPageCount === getManualMatchRecords.length}
                    onChange={(e) => handleToggleSelectAllOnPage(e.target.checked)}
                    inputProps={{ 'aria-label': 'select all on page' }}
                />
            ),
            field: 'select',
            width: '5%',
            sorting: false,
            render: (rowData) => (
                <Checkbox 
                    checked={selectedRows.some(s => idOf(s) === idOf(rowData))}
                    onChange={(e) => handleToggleRow(rowData, e.target.checked)}
                    inputProps={{ 'aria-label': `select-row-${idOf(rowData)}` }}
                />
            )
        },
        {
            field: 'receipt_date',
            title: 'Receipt Date',
            width: '15%'
        },
        {
            field: 'receipt_number',
            title: 'Receipt #',
            width: '15%'
        },
        {
            field: 'referenceNumber',
            title: 'Reference #',
            width: '25%'
        },
        {
            field: 'company_name',
            title: 'Particular',
            width: '20%'
        },
        {
            field: 'creationDate',
            title: 'Entry Date',
            width: '15%'
        },
        {
            field: 'amount',
            title: 'Amount',
            width: '10%'
        },
    ]

  return (
      <>
          <Dialog open={props.open} maxWidth='lg' fullWidth>
              <DialogTitle>
                  <Grid container spacing={3}>
                      <Grid size={6}>
                          <Typography variant='h6'>
                              {`Manual Match - ${selectedType === 'Receipts' ? 'Receipt Entry' : 'Payment Entry'}`}
                          </Typography>
                      </Grid>

                      <Grid display='flex' justifyContent='flex-end' size={6}>
                          <Tooltip title='Close'>
                              <IconButton onClick={handleCancel}>
                                  <CloseIcon />
                              </IconButton>
                          </Tooltip>
                      </Grid>
                  </Grid>
              </DialogTitle>

              <DialogContent>
                  <Grid container spacing={3}>
                      <Grid size={12}>
                          <Grid container spacing={3} display='flex' justifyContent='space-between'>
                              <Grid
                                  size={{
                                      lg: 2,
                                      md: 2
                                  }}>
                                  <Box>
                                      <Typography variant='h6'>{`Date : ${props?.selectedRow?.Date ? convertExcelDateToString(props?.selectedRow?.Date || '') : props?.selectedRow?.date || ''}`}</Typography>
                                  </Box>
                              </Grid>
                              <Grid
                                  size={{
                                      lg: 6,
                                      md: 6
                                  }}>
                                  <Box>
                                      <Typography variant='h6'>{`Reference # : ${props?.selectedRow?.Description || ''}`}</Typography>
                                  </Box>
                              </Grid>
                              <Grid
                                  size={{
                                      lg: 2,
                                      md: 2
                                  }}>
                                  <Box>
                                      <Typography variant='h6'>{`Amount : ${selectedType === 'Receipts' ? props?.selectedRow?.Credit || '' : props?.selectedRow?.Debit || ''}`}</Typography>
                                  </Box>
                              </Grid>

                              <Grid
                                  size={{
                                      lg: 2,
                                      md: 2
                                  }}>
                                  <Box>
                                      <Typography variant='h6'>{`Bank Name : ${props?.selectBank ? props?.selectBank.bankName : ''}`}</Typography>
                                  </Box>
                              </Grid>
                          </Grid>
                      </Grid>

                      <Grid size={12}>
                          <MaterialTable 
                              title={''}
                              totalCount={manualMatchRecordsCount}
                              data={getManualMatchRecords}
                              columns={columns}
                              page={paginateData.pageCount}
                              onPageChange={(page) => handlePageChange(page)}
                              onRowsPerPageChange={(size) => handlePageSizeChange(size)}
                              options={{
                                  filtering: false,
                                  actionsColumnIndex: -1,
                                  paging: true,
                                  pageSize: paginateData.pageSize,
                                  pageSizeOptions: [20, 50, 100],
                                  search: false,
                              }}
                              components={{
                                  Toolbar: (props) => (
                                      <div>
                                          <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                                              <div style={{ width: '100%' }}>
                                                  <MTableToolbar {...props} />
                                              </div>

                                              <div>
                                                  <CommonSearch 
                                                      searchVal={paginateData.searchString}
                                                      requestSearch={requestSearch}
                                                      cancelSearch={cancelSearch}
                                                  />
                                              </div>
                                          </div>
                                      </div>
                                  )
                              }}
                          />
                      </Grid>
                  </Grid>
              </DialogContent>

              <DialogActions>
                  <Grid container justifyContent='space-between' spacing={3}>
                      <Grid sx={{ marginLeft: '20px' }}>
                          <Typography fontSize={13} fontWeight={600} sx={{ color: 'grey !important' }}>
                              Note : Unmatched amount and Selected amount should be same allow the submit.
                          </Typography>
                      </Grid>

                      <Grid>
                          <Grid container spacing={3} justifyContent='flex-end'>
                              <Grid>
                                  <Button
                                      variant='contained'
                                      color='primary'
                                      onClick={() => setReceiptDialog(true)}
                                      disabled={diffeAmount < 0 || diffeAmount === 0}
                                  >
                                      {`Difference Amount : ${diffeAmount}`}
                                  </Button>
                              </Grid>

                              <Grid>
                                  <Button
                                      variant='contained'
                                      color='error'
                                      onClick={handleCancel}
                                  >
                                      Cancel
                                  </Button>
                              </Grid>
                              <Grid>
                                  <Button
                                      variant='contained'
                                      color='primary'
                                      onClick={handleSubmit}
                                      disabled={unmatchedAmount !== selectedAmount}
                                  >
                                      Submit
                                  </Button>
                              </Grid>
                          </Grid>
                      </Grid>
                  </Grid>
              </DialogActions>
          </Dialog>
          {
              receiptDialog && 
          <ManualMatchReceipt
              paymentOpen={receiptDialog}
              custType={selectedType === 'Receipts' ? 'CUSTOMER' : 'VENDOR'}
              handleClose={(newRecord) => handleReceiptSubmitClose(newRecord)}
              editData={editData}
              responseType={'cashIn'}
              entryType = {'new'}
              sales_items={sales_items}
              selectedInvoice={null}
              bankId={bankId}
              manualMatch='ManualMatch'
              selectedCustomer={selectedType === 'Receipts' ? selectedRows?.length === 1 && selectedRows[0]?.customer_id !== null ? selectedRows?.[0] : {} : selectedRows?.length === 1 && selectedRows[0]?.supplier_id !== null ? selectedRows?.[0] : {}}
           />
          }
      </>
  );
}

export default ManualMatch
