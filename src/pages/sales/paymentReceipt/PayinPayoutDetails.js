import { Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Stack, Table, TableBody, TableCell, TableRow, Tooltip, Typography, useTheme } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import CloseIcon from '@mui/icons-material/Close'
import { useDispatch, useSelector } from 'react-redux'
import OppositeContentTimeline from 'components/erpDesign/timeline_design'
import { headerStyle } from 'utils/pageSize'
import React, { useEffect, useState } from 'react'
import { UpdateUnreconciledAction } from '../../../redux/actions/bankCreation_actions'
import { getPayinPayoutByIdAction } from '../../../redux/actions/paymentReceipt_actions'


const PayinPayoutDetails = (props) => {

    const dispatch = useDispatch()
    const theme = useTheme()
    const [actionAnchor, setActionAnchor] = useState(null)

    const {
        paymentReceiptReducer : { getPayinPayout }
    } = useSelector(state => state)

    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
    const [countDown, setCountDown] = useState(5)

    const getPayInOut = getPayinPayout ? Object.keys(getPayinPayout).length : 0

    const val = getPayInOut > 0 ? getPayinPayout.val?.[0] : null
    const cashType = val?.cash_type
    const purpose = val?.purpose
    const isContra = purpose === 'contra'
    const isPayIn = cashType === 'IN'

    const paymentType = getPayInOut > 0 && val?.payment_type

    const manualMatchType = getPayInOut > 0 && getPayinPayout.reconciledType?.[0]?.type

    const numberToWords = (num) => {
        const a = [
            '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
            'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
            'Seventeen', 'Eighteen', 'Nineteen'
        ]
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

        const numToWords = (n) => {
            if (n < 20) return a[n]
            if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '')
            if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + numToWords(n % 100) : '')
            if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '')
            if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '')
            return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '')
        }

        if (!num || isNaN(num)) return ''
        return numToWords(Number(num)) + ' Only'
    }

    useEffect(() => {
        let timer
        if(confirmationDialogOpen) {
            setCountDown(5)
            timer = setInterval(() => {
                setCountDown((prev) => {
                    if(prev <= 1) {
                        clearInterval(timer)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }
        return () => clearInterval(timer)
    }, [confirmationDialogOpen])

    const handleConfirm = async() => {
        const banckReconciledId = getPayinPayout.reconciledType?.[0]?.id
        const reference = getPayinPayout.reconciledType?.[0]?.reference
        const payment_transaction_id = getPayinPayout.reconciledType?.[0]?.payment_transaction_id
        const id = val?.id

        const payload = {
            id: banckReconciledId,
            reference: reference,
            payment_transaction_id : payment_transaction_id
        }
        await dispatch(UpdateUnreconciledAction(payload))
        dispatch(getPayinPayoutByIdAction(id, 'PayinPayout'))
        setConfirmationDialogOpen(false)
    }

    const totalAmount = getPayInOut > 0
        ? getPayinPayout.val?.reduce((sum, list) => sum + Number(list?.amount || 0), 0) ?? 0
        : 0

    const partyLabel = isContra
        ? 'Transfer Account'
        : isPayIn
            ? 'Credit Ledger'
            : 'Debit Ledger'

    const amountLabel = isContra
        ? 'Transfer Amount'
        : isPayIn
            ? 'Amount Received'
            : 'Amount Paid'

    const headerTitle = isContra
        ? 'CONTRA'
        : isPayIn
            ? 'PAY-IN'
            : 'PAY-OUT'

    const handleActionMenuClick = (action) => {
        setActionAnchor(null)
        switch(action) {
            case 'edit': props.handleEdit(); break;
            case 'delete': props.handleDelete(); break;
        }
    }

    const detailRows = [
        { label: 'Payment Mode', value: getPayInOut > 0 ? val?.payment_type || 'Cash' : '' },
        { label: 'Transaction Type', value: getPayInOut > 0 ? (isPayIn ? 'Pay-IN' : 'Pay-OUT') : '' },
        { label: 'Reference', value: val?.reference || '', hide: !val?.reference },
        { label: 'Amount (In Words)', value: numberToWords(totalAmount), italic: true },
        { label: 'Note', value: val?.reason || '', hide: !val?.reason },
        { label: 'Entry Date', value: val?.date || '' },
    ].filter(r => !r.hide)

  return (
      <>
          <Card sx={{ height: 'calc(100vh - 135px)', display: 'flex', flexDirection: 'column' }}>
          {/* ---- Top Action Bar ---- */}
          <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              px: 2.5, py: 1,
              borderBottom: `2px solid ${theme.palette.primary.main}`,
              bgcolor: `${theme.palette.primary.main}08`,
              flexShrink: 0,
          }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography component="span" sx={{ fontWeight: 600, fontSize: 14, color: theme.palette.primary.main }}>
                      {val?.receipt_number || headerTitle}
                  </Typography>
                  {val?.receipt_number && (
                      <Chip label={headerTitle} size="small" sx={{ fontWeight: 600, fontSize: 10, height: 20 }} />
                  )}
              </Stack>

              <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Tooltip title="Actions">
                      <IconButton size="small" onClick={(e) => setActionAnchor(e.currentTarget)} disabled={getPayInOut === 0}>
                          <MoreVertIcon fontSize="small" />
                      </IconButton>
                  </Tooltip>

                  <Menu
                      anchorEl={actionAnchor}
                      open={Boolean(actionAnchor)}
                      onClose={() => setActionAnchor(null)}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                      {props.EditRights && (
                          <MenuItem onClick={() => handleActionMenuClick('edit')} disabled={getPayInOut === 0}>
                              <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                              <ListItemText>Edit</ListItemText>
                          </MenuItem>
                      )}
                      {props.DeleteRights && (
                          <MenuItem onClick={() => handleActionMenuClick('delete')} disabled={getPayInOut === 0}>
                              <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                              <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
                          </MenuItem>
                      )}
                  </Menu>

                  <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                  {props.onPrev && (
                      <Tooltip title="Previous">
                          <span>
                              <IconButton size="small" disabled={props.prevDisabled} onClick={props.onPrev}>
                                  <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                          </span>
                      </Tooltip>
                  )}
                  {props.onNext && (
                      <Tooltip title="Next">
                          <span>
                              <IconButton size="small" disabled={props.nextDisabled} onClick={props.onNext}>
                                  <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                          </span>
                      </Tooltip>
                  )}

                  {props.onClose && (
                      <Tooltip title="Close">
                          <IconButton size="small" onClick={props.onClose}>
                              <CloseIcon fontSize="small" />
                          </IconButton>
                      </Tooltip>
                  )}
              </Stack>
          </Box>

          {/* ---- Scrollable Content ---- */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>

              {/* ---- Ledger Header ---- */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                      <Typography sx={{ fontWeight: 500, fontSize: 11, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
                          {partyLabel}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: 14, color: 'text.primary' }}>
                          {(val?.name || '').toUpperCase()}
                      </Typography>
                      {val?.description && (
                          <Typography sx={{ fontSize: 12 }} color="text.secondary">{val.description}</Typography>
                      )}
                  </Box>
                  <Typography sx={{ fontWeight: 500, fontSize: 12, color: 'text.secondary' }}>
                      Date : {val?.date || ''}
                  </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* ---- Payment Details + Amount Badge ---- */}
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                      <Table size="small" sx={{ '& td': { border: 0, py: 0.5, px: 0 } }}>
                          <TableBody>
                              {detailRows.map((row, i) => (
                                  <TableRow key={i}>
                                      <TableCell sx={{ width: 160, fontWeight: 700, fontSize: 12, color: 'text.primary' }}>{row.label}</TableCell>
                                      <TableCell sx={{ width: 20, fontSize: 12, color: 'text.secondary' }}>:</TableCell>
                                      <TableCell sx={{ fontSize: 12, fontWeight: 400, color: 'text.primary', fontStyle: row.italic ? 'italic' : 'normal' }}>{row.value}</TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                      <Box sx={{
                          border: `2px solid ${theme.palette.primary.main}`,
                          borderRadius: 1, px: 3, py: 1.5, textAlign: 'center', minWidth: 170,
                          bgcolor: `${theme.palette.primary.main}08`,
                      }}>
                          <Typography sx={{ fontWeight: 700, fontSize: 11, letterSpacing: 1, color: theme.palette.primary.main, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                              {amountLabel}
                          </Typography>
                          <Typography sx={{ fontWeight: 700, fontSize: 18, color: theme.palette.primary.main }}>
                              {getPayInOut > 0 ? `₹ ${totalAmount}` : ''}
                          </Typography>
                      </Box>

                      {paymentType !== 'Cash' && paymentType !== null && paymentType !== false && !isContra && (
                          <Chip
                              label={manualMatchType || 'Unreconciled'}
                              size="small"
                              sx={{
                                  fontWeight: 600, fontSize: 11,
                                  bgcolor: manualMatchType === 'Reconciled' ? 'info.light' : 'action.selected',
                                  color: manualMatchType === 'Reconciled' ? 'info.dark' : 'text.secondary',
                              }}
                              onClick={manualMatchType === 'Reconciled' ? () => setConfirmationDialogOpen(true) : undefined}
                          />
                      )}
                  </Box>
              </Box>

              {/* ---- Timeline ---- */}
              {getPayinPayout?.timeline?.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                      <Divider />
                      <h4 style={{ paddingLeft: 10, fontSize: headerStyle.fontSize, fontWeight: headerStyle.fontWeight, marginTop: 10 }}>
                          Timeline
                      </h4>
                      <Box sx={{
                          '& .MuiTimeline-root': { padding: 0 },
                          '& .MuiTimelineItem-root:before': { display: 'none' },
                          '& .MuiTimelineOppositeContent-root': { flex: '0 0 160px', textAlign: 'left' },
                      }}>
                          {getPayinPayout.timeline.map((data) => (
                              <OppositeContentTimeline
                                  key={data.id}
                                  m={{...data, updated_at: data.updatedAt}}
                                  title={data.entry_type}
                                  content={`${data.content} created by ${data.userName || data.first_name}`}
                              />
                          ))}
                      </Box>
                  </div>
              )}
          </Box>
          </Card>

          {/* ---- Unreconcile Confirmation Dialog ---- */}
          <Dialog open={confirmationDialogOpen} onClose={() => setConfirmationDialogOpen(false)}>
              <DialogTitle>Change to unreconciled confirmation ?</DialogTitle>

              <DialogContent>
                  <Typography variant='h6'>
                      Are you sure you want to unmark from bank reconciliation ?
                  </Typography>

                  <Typography variant='h6'>
                      This action will remove the data from bank reconciliation and cannot be undone.
                  </Typography>
              </DialogContent>

              <DialogActions>
                  <Button
                      variant='contained'
                      color='error'
                      onClick={() => setConfirmationDialogOpen(false)}
                  >
                      Cancel
                  </Button>

                  <Button
                      variant='contained'
                      color='primary'
                      onClick={handleConfirm}
                      disabled={countDown > 0}
                  >
                      OK {countDown > 0 && `(${countDown})`}
                  </Button>
              </DialogActions>
          </Dialog>
      </>
  );
}

export default React.memo(PayinPayoutDetails);
