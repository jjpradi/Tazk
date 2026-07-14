import React, { useContext, useEffect, useState } from 'react'
import { Box, Button, Card, Divider, Grid, IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material'
import OptionButton from 'components/erpDesign/actionButton'
import { useDispatch, useSelector } from 'react-redux'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import CloseIcon from '@mui/icons-material/Close'
import { creditNotesTimelineAction, getAllCreditNotesAction, getCreditNotesReceiptsByIdAction, ManualcreditSalesReturnAction, ManualSalesPurchase, setCreditNotesReceiptsByIdAction } from 'redux/actions/manualNotes_actions'
import NewManualNotes from 'components/NewManualNotes'
import AlertDialog from '../../common/Dialog';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable'
import { getbyidCustomerAction } from 'redux/actions/customer_actions'
import moment from 'moment'
import {
  getStickyTableOptions,
  stickyTableComponents,
} from 'utils/stickyTableLayout';
import { useCustomFetch } from 'utils/useCustomFetch'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import apiCalls from 'utils/apiCalls'
import { setInvoiceTempAction } from 'redux/actions/vendor_actions'
import ReceiptTempDialog from 'pages/sales/Receipt/ReceiptTemp'
import { cellStyle, headerStyle } from 'utils/pageSize'
import OppositeContentTimeline from 'components/erpDesign/timeline_design'
import NewManualNotesForm from '../../../components/Sales/NewManualNotesForm'
import API_URLS from 'utils/customFetchApiUrls'

const StatCard = ({ label, value, color }) => {
    const theme = useTheme();
    const bgColor = color || theme.palette.primary.main;
    return (
        <Card
            variant='outlined'
            sx={{
                padding: '12px 10px', width: '100%', borderRadius: '6px', textAlign: 'center',
                bgcolor: `${bgColor}14`, borderColor: `${bgColor}40`, borderWidth: 1,
            }}
        >
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary', mb: 0.5 }}>{label}</Typography>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: bgColor }}>{value}</Typography>
        </Card>
    );
};

const CreditNotesDetails = (props) => {

    const dispatch = useDispatch()
    const customFetch = useCustomFetch()
    const theme = useTheme()

    const {
        setModalTypeHandler,
        setLoaderStatusHandler,
        setModalStatusHandler
    } = useContext(CreateNewButtonContext)

    const {
        manualNoteReducer : { getAllCreditNotes, manualSalesReturn, getCreditNotesReceiptsById,manualTimeline, manualNotes },
        customerReducer : { customer_id_data },
        rbacReducer: { menuAccess }
    } = useSelector(state => state)

    const [optionIndex, setOptionIndex] = useState(null)
    const [index, setIndex] = useState(null)
    const [rowData, setRowData] = useState({})
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [tempOpen, setTempOpen] = useState(false)

    useEffect(() => {
        dispatch(creditNotesTimelineAction(props.data.id))
    }, [])

    useEffect(() => {
        if (props.pageType === 'transaction') {
            setRowData(props.data)
        }
    }, [])

    useEffect(() => {
        if(manualNotes.length > 0) {
            const creditNotesIndex = manualNotes.findIndex((e) => e.id === props.data.id)
            setIndex(creditNotesIndex)
        }
    }, [manualNotes])

    useEffect(() => { (async () => {
        if(index !== null && manualNotes.length > 0 && index !== -1) {
            const creditNotesData = manualNotes[index]
            await setRowData(creditNotesData)
        }
    })();
}, [index, manualNotes])


    useEffect(() => {
        if(Object.keys(rowData).length > 0) {
            const data = {
                id : (rowData.sale_id && rowData.return_id) ? String(rowData.return_id)
                : rowData.sale_id === null ? rowData.receiving_id : rowData.sale_id,
                type : rowData.type,
                status : rowData.sale_status
            }
            dispatch(getbyidCustomerAction(rowData.customer_id))
            dispatch(ManualcreditSalesReturnAction(data))
            dispatch(getCreditNotesReceiptsByIdAction(rowData.id))
        }
    }, [rowData])

    const handleCreditNotesOptionsChange = (option) => {
        setOptionIndex(option)
        if(option === 1) {
            setDeleteDialogOpen(true)
        }
    }

    const handlePrev = () => {
        if(index >= 1) {
            setIndex(prevIndex => prevIndex - 1)
        }
    }

    const handleNext = () => {
        setIndex(prevIndex => prevIndex + 1)
    }

    const handleTempOpen = async(rowData) => {
        const id = rowData.receipt_id
        const type='Receipts'
        const { data } = await customFetch(
            API_URLS.GET_RECEIPTS_BY_ID(id, type),
            'GET'
        );

        await apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(setInvoiceTempAction(data))
        )
        setTempOpen(true)
    }

    const handleCreditNotePdfOpen = async (row) => {
        const sourceRow = row || rowData
        if (!sourceRow || !sourceRow.id) return
        const isCredit = sourceRow.type === 'C'
        const isReturn = isCredit
            ? Boolean(sourceRow.return_id)
            : Boolean(sourceRow.return_id || sourceRow.receiving_id)
        const returnLinkId = isCredit
            ? (sourceRow.return_id || null)
            : (sourceRow.return_id || sourceRow.receiving_id || null)
        const payload = isCredit
            ? { id: isReturn ? returnLinkId : null, type: 'C', status: sourceRow.sale_status || '4', mn_id: sourceRow.id }
            : { id: isReturn ? returnLinkId : null, type: 'D', status: sourceRow.sale_status || '4', mc_id: sourceRow.id, sequence: sourceRow.sequence_number || null }
        await dispatch(ManualSalesPurchase(payload, (response) => {
            if (response) {
                dispatch(setInvoiceTempAction(response))
            }
        }))
        setTempOpen(true)
    }

    const columnsProduct = [
        { field : 'name', title : 'Item' },
        {
            field : 'lot_number', title : 'Serial Number',
            render : (rowData) => rowData?.lots || '-'
        },
        { field : 'hsn_code', title : 'HSN Code' },
        { field : 'quantity', title : 'Quantity' },
        {
            field : 'item_unit_price', title : 'Selling Price', align: 'right',
            cellStyle: { textAlign: 'right', paddingRight: '10px', fontSize: cellStyle.fontSize, width: 50 },
            headerStyle: { textAlign: 'right', paddingRight: '10px' }
        },
        {
            field : 'sub_total', title : 'Sub Total', align: 'right',
            cellStyle: { textAlign: 'right', paddingRight: '10px', fontSize: cellStyle.fontSize, width: 50 },
            headerStyle: { textAlign: 'right', paddingRight: '10px' },
            render : (rowData) => ((rowData.item_unit_price * rowData.quantity) + ((rowData?.cgst_tax_amount || 0) + (rowData?.sgst_tax_amount || 0) + (rowData?.igst_tax_amount || 0))).toFixed(2)
        }
    ]

    const columnManualnotes = [
        { field : 'date', title : 'Date', render : (rowData) => moment(rowData.date).format('DD/MM/YYYY') },
        {
            field : 'sequence_number', title : 'CN',
            render : (row) => (
                <span role='link' style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => handleCreditNotePdfOpen(row)}>{row.sequence_number}</span>
            )
        },
        { field : 'ledger_name', title : 'Particulars' },
        { field : 'description', title : 'Description' },
        {
            field : 'amount', title : 'Opening Balance',
            render: (rowData) => (
                <div style={{ textAlign: 'right', minWidth: '60px', maxWidth: '100px', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {rowData.amount}
                </div>
            )
        },
        {
            field : 'balance_amount', title : 'Closing Balance',
            render: (rowData) => (
                <div style={{ textAlign: 'right', minWidth: '60px', maxWidth: '100px', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {rowData.balance_amount}
                </div>
            )
        }
    ]

    const columnsReceipts = [
        { field : 'receipt_date', title : 'Receipt Date' },
        { field: 'entry_date', title: 'Entry Date' },
        {
            field : 'receipt_number', title : 'Receipt Number',
            render : (rowData) => (
                <div style={{ textDecoration: 'none', cursor: 'pointer', color: '#03adfc', display: 'inline-block', padding: '5px' }}
                    onClick={() => handleTempOpen(rowData)}>{rowData.receipt_number}</div>
            )
        },
        { field : 'invoice_number', title : 'Invoice Number' },
        { field : 'Reference', title : 'Reference' },
        { field : 'location_name', title : 'Location' },
        {
            field : 'payment_amount', title : 'Amount',
            render: (rowData) => (
                <div style={{ textAlign: 'right', minWidth: '60px', maxWidth: '80px', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {rowData.payment_amount}
                </div>
            )
        },
        {
            field: 'received_by',
            title: 'Created By'
        }
    ]

    const address = [customer_id_data.address, customer_id_data.area, customer_id_data.city, customer_id_data.state, customer_id_data.zip].filter(Boolean).join(', ')

    const cnStatus = getCreditNotesReceiptsById?.length > 0 ? getCreditNotesReceiptsById[0]?.adjusted === 1 ? 'Adjusted' : 'Partial Adjusted' : 'Created'

  return (
      <>
          {
              optionIndex === null &&
              <Card sx={{ height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
                  {/* ---- Top Action Bar ---- */}
                  {props.pageType !== 'transaction' && (
                      <Box sx={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          px: 2.5, py: 1,
                          borderBottom: `2px solid ${theme.palette.primary.main}`,
                          bgcolor: `${theme.palette.primary.main}08`,
                          flexShrink: 0,
                      }}>
                          <Typography component="span" sx={{ fontWeight: 600, fontSize: 14, color: theme.palette.primary.main }}>
                              {rowData.sequence_number || ''}
                          </Typography>

                          <Stack direction="row" alignItems="center" spacing={0.5}>
                              <OptionButton
                                  checkType='CreditNotes'
                                  handleCreditNotesOptionsChange={handleCreditNotesOptionsChange}
                                  disableOption={rowData.returnFrom ? rowData.returnFrom : rowData.adjusted_amount !== 0 ? 'Adjusted' : ''}
                                  user_rights={menuAccess}
                              />

                              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                              <Tooltip title='Previous'>
                                  <span>
                                      <IconButton size="small" onClick={handlePrev} disabled={index === 0}>
                                          <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
                                      </IconButton>
                                  </span>
                              </Tooltip>
                              <Tooltip title='Next'>
                                  <span>
                                      <IconButton size="small" onClick={handleNext} disabled={manualNotes?.length === index + 1}>
                                          <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
                                      </IconButton>
                                  </span>
                              </Tooltip>

                              <Tooltip title="Close">
                                  <IconButton size="small" onClick={() => { props.handleClose(); dispatch(setCreditNotesReceiptsByIdAction([])) }}>
                                      <CloseIcon fontSize="small" />
                                  </IconButton>
                              </Tooltip>
                          </Stack>
                      </Box>
                  )}

                  {/* ---- Scrollable Content ---- */}
                  <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>

                      {/* ---- Stats Cards ---- */}
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid size={{ xs: 6, sm: 3 }}>
                              <StatCard label="Credit Type" value={rowData.returnFrom === null ? 'Manual' : 'Sales Return'} color={theme.palette.primary.main} />
                          </Grid>
                          <Grid size={{ xs: 6, sm: 3 }}>
                              <StatCard label="Opening Balance" value={rowData?.amount || 0} color={theme.palette.info.main} />
                          </Grid>
                          <Grid size={{ xs: 6, sm: 3 }}>
                              <StatCard label="Closing Balance" value={rowData?.balance_amount || 0} color={theme.palette.warning.main} />
                          </Grid>
                          <Grid size={{ xs: 6, sm: 3 }}>
                              <StatCard label="Status" value={cnStatus} color={theme.palette.success.main} />
                          </Grid>
                      </Grid>

                      {/* ---- Info Row ---- */}
                      <Card
                          variant='outlined'
                          sx={{
                              padding: '12px 10px', width: '100%', display: 'flex', alignItems: 'center',
                              justifyContent: 'space-evenly', borderRadius: '6px', mb: 2,
                              bgcolor: `${theme.palette.primary.main}0A`, borderColor: `${theme.palette.primary.main}30`,
                          }}
                      >
                          <Grid>
                              <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary' }} align='center'>Created By</Typography>
                              <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }} align='center'>{props.data.createdBy || '-'}</Typography>
                          </Grid>
                          <Divider orientation='vertical' flexItem />
                          <Grid>
                              <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary' }} align='center'>Created On</Typography>
                              <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }} align='center'>{rowData?.created_at || '-'}</Typography>
                          </Grid>
                          <Divider orientation='vertical' flexItem />
                          <Grid>
                              <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary' }} align='center'>Billed On</Typography>
                              <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }} align='center'>{getCreditNotesReceiptsById?.length > 0 ? getCreditNotesReceiptsById[0]?.receipt_date : '-'}</Typography>
                          </Grid>
                      </Card>

                      {/* ---- Items Table ---- */}
                      <div style={{ marginTop: 10 }}>
                          <MaterialTable
                              columns={rowData.returnFrom === 'Sales' ? columnsProduct : columnManualnotes}
                              data={rowData.returnFrom === 'Sales' ? manualSalesReturn : [rowData]}
                              options={getStickyTableOptions({
                                  options:{
                                      showTitle: false, search: false, tableLayout: "auto", toolbar: true,
                                      pageSizeOptions: [5, 10, 20],
                                      headerStyle: { ...headerStyle, backgroundColor: '#F4F7FE' },
                                  }
                              })}
                              components={{
                                  ...stickyTableComponents,
                                  Toolbar: (props) => (
                                      <div style={{ display: 'flex', width: '100%', padding: '20px 20px 10px 20px' }}>
                                          <div>
                                              <Typography sx={{ fontSize: 12 }}>Party Name: {customer_id_data?.company_name || '-'}</Typography>
                                          </div>
                                          <Typography sx={{ fontSize: 12 }} ml='auto'>
                                              Shipping Address : {address || '-'}
                                          </Typography>
                                          <MTableToolbar {...props} />
                                      </div>
                                  )
                              }}
                          />
                      </div>

                      {/* ---- Receipts Table ---- */}
                      <div style={{ marginTop: 10 }}>
                          <MaterialTable
                              title='Receipts'
                              columns={columnsReceipts}
                              data={getCreditNotesReceiptsById}
                              options={{
                                  search: false, pageSizeOptions: [5, 10, 20],
                                  headerStyle: { ...headerStyle, backgroundColor: '#F4F7FE' },
                                  cellStyle: cellStyle
                              }}
                          />
                      </div>

                      {/* ---- Timeline ---- */}
                      {manualTimeline?.length > 0 && (
                          <div style={{ minHeight: 200, marginTop: 10 }}>
                              <hr />
                              <h4 style={{ paddingLeft: 10, fontSize: headerStyle.fontSize, fontWeight: headerStyle.fontWeight }}>
                                  Timeline
                              </h4>
                              <Box sx={{
                                  '& .MuiTimeline-root': { padding: 0 },
                                  '& .MuiTimelineItem-root:before': { display: 'none' },
                                  '& .MuiTimelineOppositeContent-root': { flex: '0 0 160px', textAlign: 'left' },
                              }}>
                                  {manualTimeline.map((data) => (
                                      <OppositeContentTimeline
                                          key={data.id}
                                          m={{ ...data, updated_at: data.updated_at }}
                                          title={'Credit Note'}
                                          content={data.content}
                                      />
                                  ))}
                              </Box>
                          </div>
                      )}
                  </Box>
              </Card>
          }
          {
              optionIndex === 0 &&
              <NewManualNotesForm
                  status={"edit"}
                  edit_id_data={[rowData]}
                  handleClose={() => props.handleClose()}
                  handleSubmit={(data) => {props.handleSubmit(data); props.handleClose()}}
                  setModalStatusHandler={setModalStatusHandler}
                  type='cashBoxCreation'
                  setLoaderStatusHandler={setLoaderStatusHandler}
                  setModalTypeHandler={setModalTypeHandler}
                  from={'C'}
                  openType={'manual'}
              />
          }
          {
              deleteDialogOpen &&
              <AlertDialog
                  delete={deleteDialogOpen}
                  handleClose={() => props.handleClose()}
                  handleDelete={() => {props.handleDelete(rowData.id); props.handleClose()}}
                  id={rowData.id}
              />
          }
          <ReceiptTempDialog
              open={tempOpen}
              handleClose={() => setTempOpen(false)}
          />
      </>
  );
}

export default CreditNotesDetails
