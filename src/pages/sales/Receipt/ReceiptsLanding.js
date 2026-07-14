import { Box, Button, ButtonGroup, Card, Chip, ClickAwayListener, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, Grow, IconButton, Menu, MenuList, MenuItem, ListItemIcon, ListItemText, Paper, Popper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography, useTheme } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import CloseIcon from '@mui/icons-material/Close'
import OppositeContentTimeline from 'components/erpDesign/timeline_design';
import { headerStyle } from 'utils/pageSize';
import { useContext, useEffect, useState } from 'react';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { UpdateUnreconciledAction } from 'redux/actions/bankCreation_actions';
import { getReceiptsByIdAction } from 'redux/actions/sales_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import docTemplateService from 'services/docTemplate_services';


const ReceiptsLanding = (props) => {
    const dispatch = useDispatch()
    const theme = useTheme()
    const storage = getsessionStorage()
    const selectedRole = storage.role_name
    const [actionAnchor, setActionAnchor] = useState(null)

    const {
        headerLocationId,
    } = useContext(CreateNewButtonContext)

    const {
        salesReducer : { getReceiptsById },
        vendorReducer : { po_temp },
        rbacReducer: { menuAccess },
        appConfigReducer: { app_config_data },
        CompanyReducers: { company_logo },
    } = useSelector(state => state)

    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
    const [countDown, setCountDown] = useState(5)

    const receiptId = props.rowData?.id
    const types = props.type === 'Receipts' || props.type === 'Customer Refund' ? 'Receipts' : 'Payments'

    const getReceipts = getReceiptsById ? Object.keys(getReceiptsById).length : 0

    const paymentType = getReceipts > 0 && getReceiptsById.receiptDetails?.[0]?.payment_type

    const isDebitCreditNotePayment = paymentType && (paymentType.includes('Debit Note') || paymentType.includes('Credit Note') || paymentType.includes('Unused Credit'))
    const manualMatchType = isDebitCreditNotePayment ? 'Adjusted' : (getReceipts > 0 && getReceiptsById.reconciledType?.[0]?.type || 'Unreconciled')

    const address = getReceipts > 0 ? [getReceiptsById.cust?.[0]?.address, getReceiptsById?.cust?.[0]?.area].filter(Boolean).join(', ') : ''
    const address1 = getReceipts > 0 ?[getReceiptsById.cust?.[0]?.city, getReceiptsById.cust?.[0]?.state, getReceiptsById.cust?.[0]?.zip].filter(Boolean).join(', ') : ''

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

    const getConfigValue = (key) => {
        const item = app_config_data?.find(f => f.key_name === key)
        return item?.value || ''
    }

    const buildVoucherPayload = () => {
        const receipt = getReceiptsById?.receiptDetails?.[0] || {}
        const cust = getReceiptsById?.cust?.[0] || {}
        const receipts = getReceiptsById?.receipts || []
        const isReceipt = types === 'Receipts'

        return {
            company: {
                name: getConfigValue('company.name'),
                address: getConfigValue('address.fulladdress'),
                city: getConfigValue('address.city'),
                state: getConfigValue('address.state'),
                zip: getConfigValue('address.pincode'),
                gstin: getConfigValue('company.gstin/uin'),
                phone: getConfigValue('company.mobile'),
                email: getConfigValue('company.email'),
                logo: company_logo?.[0]?.image || '',
            },
            document: {
                title: isReceipt ? 'RECEIPT VOUCHER' : 'PAYMENT VOUCHER',
                number: receipt.receipt_number || '',
                date: receipt.receipt_date || '',
                party_label: isReceipt ? 'Received From' : 'Paid To',
            },
            party: {
                name: (cust.company_name || '').toUpperCase(),
                address: [cust.address, cust.area].filter(Boolean).join(', '),
                city: cust.city || '',
                state: cust.state || '',
                zip: cust.zip || '',
                gstin: cust.tax_id || '',
                phone: cust.phone || '',
            },
            payment: {
                mode: (getReceiptsById?.receiptDetails || []).map(d => d.payment_type).filter(Boolean).join(', '),
                reference: receipt.reference || '',
                amount_in_words: numberToWords(totalAmount),
                note: receipt.note || '',
                entry_date: receipt.entry_date || '',
                currency: '₹',
                total_amount: totalAmount.toFixed(2),
            },
            items: receipts.map((r, i) => ({
                index: i + 1,
                doc_number: r.invoice_number || 'Advance',
                doc_date: r.invoice_date || '',
                doc_amount: r.total ? Number(r.total).toFixed(2) : '',
                due_amount: r.due_amount ? Number(r.due_amount).toFixed(2) : '',
                paid_amount: r.payment_amount ? Number(r.payment_amount).toFixed(2) : '',
            })),
        }
    }

    const getVoucherPdf = async () => {
        const isReceipt = types === 'Receipts'
        const payload = buildVoucherPayload()

        const renderRes = await docTemplateService.renderPreview({
            document_type: isReceipt ? 'receipt_voucher' : 'payment_voucher',
            paper_size: 'A4_portrait',
            output_type: 'print',
            location_id: props.rowData?.location_id || headerLocationId,
            company_id: storage.company_id,
            payload,
        })

        return renderRes.data?.pdfBase64 || null
    }

    const getPdfBlob = (base64) => {
        const byteChars = atob(base64)
        const byteNumbers = new Array(byteChars.length).fill(0).map((_, i) => byteChars.charCodeAt(i))
        return new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' })
    }

    const handlePrintReceipt = async () => {
        try {
            const base64 = await getVoucherPdf()
            if (!base64) return

            const blobUrl = URL.createObjectURL(getPdfBlob(base64))
            const iframe = document.createElement('iframe')
            iframe.style.display = 'none'
            iframe.src = blobUrl
            document.body.appendChild(iframe)

            iframe.onload = () => {
                iframe.contentWindow.focus()
                iframe.contentWindow.print()
            }
        } catch (err) {
            console.error('Print error:', err)
        }
    }

    const handleDownloadReceipt = async () => {
        try {
            const base64 = await getVoucherPdf()
            if (!base64) return

            const receiptNumber = getReceiptsById?.receiptDetails?.[0]?.receipt_number || 'Download'
            const url = URL.createObjectURL(getPdfBlob(base64))
            const link = document.createElement('a')
            link.href = url
            link.download = `${receiptNumber}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Download error:', err)
        }
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

    const handleConfirm = async () => {
        const id = getReceiptsById.reconciledType?.[0]?.id
        const reference = getReceiptsById.reconciledType?.[0]?.reference
        const payment_transaction_id = getReceiptsById.reconciledType?.[0]?.payment_transaction_id

        const payload = {
            id: id,
            reference: reference,
            payment_transaction_id: payment_transaction_id
        }
        await dispatch(UpdateUnreconciledAction(payload))
        dispatch(getReceiptsByIdAction(receiptId, types))
        setConfirmationDialogOpen(false)
    }

    const receiptEdit = UserRightsAuthorization(menuAccess[selectedRole], 'sales__receipts', 'can_edit')
    const receiptDelete = UserRightsAuthorization(menuAccess[selectedRole], 'sales__receipts', 'can_delete')
    const receiptExport = UserRightsAuthorization(menuAccess[selectedRole], 'sales__receipts', 'can_export')

    const paymentEdit = UserRightsAuthorization(menuAccess[selectedRole], 'purchases__payments', 'can_edit')
    const paymentDelete = UserRightsAuthorization(menuAccess[selectedRole], 'purchases__payments', 'can_delete')
    const paymentExport = UserRightsAuthorization(menuAccess[selectedRole], 'purchases__payments', 'can_export')

    const receiptEditBtn = types === 'Receipts' ? receiptEdit : paymentEdit
    const receiptDeleteBtn = types === 'Receipts' ? receiptDelete : paymentDelete
    const receiptExportBtn = types === 'Receipts' ? receiptExport : paymentExport

    const sanitizeTimelineContent = (content) => {
        const value = String(content || '').trim();
        if (!value) return '';
        const receiptDate = getReceiptsById?.receiptDetails?.[0]?.receipt_date || '';
        return value
            .replace(/\s+dated\s+Invalid Date/gi, receiptDate ? ` dated ${receiptDate}` : '')
            .replace(/\s+on\s+Invalid Date/gi, receiptDate ? ` on ${receiptDate}` : '')
            .replace(/\s{2,}/g, ' ')
            .trim();
    };

    const totalAmount = getReceipts > 0 ? getReceiptsById?.receipts?.reduce((sum, list) => sum + Number(list?.payment_amount || 0), 0) ?? 0 : 0

    const handleActionMenuClick = (action) => {
        setActionAnchor(null)
        switch(action) {
            case 'print': handlePrintReceipt(); break;
            case 'download': handleDownloadReceipt(); break;
            case 'edit': props.handleEdit(); break;
            case 'delete': props.handleDelete(); break;
        }
    }

    const detailRows = [
        { label: 'Payment Mode', value: getReceipts > 0 ? getReceiptsById.receiptDetails?.map(d => d.payment_type).filter(Boolean).join(', ') || '' : '' },
        { label: 'Reference', value: getReceipts > 0 ? getReceiptsById.receiptDetails?.[0]?.reference || '' : '', hide: !(getReceipts > 0 && getReceiptsById.receiptDetails?.[0]?.reference) },
        { label: 'Amount (In Words)', value: numberToWords(totalAmount), italic: true },
        { label: 'Note', value: getReceipts > 0 ? getReceiptsById.receiptDetails?.[0]?.note ?? '' : '', hide: !(getReceipts > 0 && getReceiptsById.receiptDetails?.[0]?.note) },
        { label: 'Entry Date', value: getReceipts > 0 ? getReceiptsById.receiptDetails?.[0]?.entry_date ?? '' : '' },
    ].filter(r => !r.hide)

  return (
      <>
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
                      {getReceipts > 0 ? getReceiptsById.receiptDetails?.[0]?.receipt_number || '' : ''}
                  </Typography>

                  <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Tooltip title="Actions">
                          <IconButton size="small" onClick={(e) => setActionAnchor(e.currentTarget)}>
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
                          <MenuItem onClick={() => handleActionMenuClick('print')} disabled={getReceipts === 0}>
                              <ListItemIcon><PrintIcon fontSize="small" /></ListItemIcon>
                              <ListItemText>Print</ListItemText>
                          </MenuItem>
                          {receiptExportBtn && (
                              <MenuItem onClick={() => handleActionMenuClick('download')} disabled={getReceipts === 0}>
                                  <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
                                  <ListItemText>Download</ListItemText>
                              </MenuItem>
                          )}
                          {receiptEditBtn && (
                              <MenuItem onClick={() => handleActionMenuClick('edit')} disabled={getReceipts === 0}>
                                  <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                                  <ListItemText>Edit</ListItemText>
                              </MenuItem>
                          )}
                          {receiptDeleteBtn && (
                              <MenuItem onClick={() => handleActionMenuClick('delete')} disabled={getReceipts === 0}>
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
          )}

          {/* ---- Scrollable Content ---- */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>

              {/* ---- Party Header ---- */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 14, color: 'text.primary' }}>
                          {getReceipts > 0 ? (getReceiptsById.cust?.[0]?.company_name || '').toUpperCase() : ''}
                      </Typography>
                      {address && <Typography sx={{ fontSize: 12 }} color="text.secondary">{address}</Typography>}
                      {address1 && <Typography sx={{ fontSize: 12 }} display="block" color="text.secondary">{address1}</Typography>}
                      {getReceipts > 0 && getReceiptsById.cust?.[0]?.tax_id && (
                          <Typography sx={{ fontSize: 12 }} color="text.secondary">GSTIN/UIN : {getReceiptsById.cust[0].tax_id}</Typography>
                      )}
                  </Box>
                  <Typography sx={{ fontWeight: 500, fontSize: 12, color: 'text.secondary' }}>
                      Date : {getReceipts > 0 ? getReceiptsById.receiptDetails?.[0]?.receipt_date : ''}
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
                              {props.type === 'Receipts' || props.type === 'Vendor Refund' ? 'Amount Received' : 'Amount Paid'}
                          </Typography>
                          <Typography sx={{ fontWeight: 700, fontSize: 18, color: theme.palette.primary.main }}>
                              {getReceipts > 0 ? `₹ ${totalAmount}` : ''}
                          </Typography>
                      </Box>

                      {paymentType !== 'Cash' && paymentType !== 'Advance' && (paymentType && !paymentType.startsWith('Credit Note')) && paymentType !== false && (
                          <Chip
                              label={manualMatchType}
                              size="small"
                              sx={{
                                  fontWeight: 600, fontSize: 11,
                                  bgcolor: manualMatchType === 'Reconciled' ? 'info.light' : manualMatchType === 'Adjusted' ? 'success.light' : 'action.selected',
                                  color: manualMatchType === 'Reconciled' ? 'info.dark' : manualMatchType === 'Adjusted' ? 'success.dark' : 'text.secondary',
                              }}
                              onClick={manualMatchType === 'Reconciled' ? () => setConfirmationDialogOpen(true) : undefined}
                          />
                      )}
                  </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* ---- Linked Documents Table ---- */}
              <Table size="small">
                  <TableHead>
                      <TableRow sx={{ backgroundColor: '#F4F7FE' }}>
                          <TableCell sx={{ fontSize: headerStyle.fontSize, fontWeight: headerStyle.fontWeight }}>
                              {props.type === 'Vendor Refund' || props.type === 'Customer Refund' ? 'Receipt Number' : 'Invoice Number'}
                          </TableCell>
                          <TableCell sx={{ fontSize: headerStyle.fontSize, fontWeight: headerStyle.fontWeight }}>
                              {props.type === 'Vendor Refund' || props.type === 'Customer Refund' ? 'Receipt Date' : 'Invoice Date'}
                          </TableCell>
                          <TableCell sx={{ fontSize: headerStyle.fontSize, fontWeight: headerStyle.fontWeight, textAlign: 'right' }}>
                              {props.type === 'Vendor Refund' || props.type === 'Customer Refund' ? 'Total Amount' : 'Invoice Amount'}
                          </TableCell>
                          <TableCell sx={{ fontSize: headerStyle.fontSize, fontWeight: headerStyle.fontWeight, textAlign: 'right' }}>
                              {props.type === 'Vendor Refund' || props.type === 'Customer Refund' ? 'Balance Amount' : 'Due Amount'}
                          </TableCell>
                          <TableCell sx={{ fontSize: headerStyle.fontSize, fontWeight: headerStyle.fontWeight, textAlign: 'right' }}>
                              {props.type === 'Receipts' || props.type === 'Vendor Refund' ? 'Received Amount' : 'Paid Amount'}
                          </TableCell>
                      </TableRow>
                  </TableHead>

                  <TableBody>
                      {getReceipts > 0 && getReceiptsById?.receipts?.length > 0 &&
                          getReceiptsById.receipts.map((rowData, index) => (
                              <TableRow key={index}>
                                  <TableCell sx={{ fontSize: 12 }}>{rowData?.invoice_number === null ? 'Advance' : rowData?.invoice_number}</TableCell>
                                  <TableCell sx={{ fontSize: 12 }}>{rowData?.invoice_date || ''}</TableCell>
                                  <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>{rowData?.total || ''}</TableCell>
                                  <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>{rowData?.due_amount || ''}</TableCell>
                                  <TableCell sx={{ fontSize: 12, textAlign: 'right' }}>{rowData?.payment_amount || ''}</TableCell>
                              </TableRow>
                          ))
                      }
                  </TableBody>
              </Table>

              {/* ---- Timeline ---- */}
              {getReceipts > 0 && getReceiptsById?.timelineData?.length > 0 && (
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
                          {getReceiptsById.timelineData.map((data) => (
                              <OppositeContentTimeline
                                  key={data.id}
                                  m={{ ...data, updated_at: data.updated_at }}
                                  title={data.type}
                                  content={sanitizeTimelineContent(data.content)}
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

export default ReceiptsLanding
