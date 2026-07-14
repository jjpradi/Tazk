import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import SendIcon from '@mui/icons-material/Send'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import moment from 'moment'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import { OpenalertActions } from 'redux/actions/alert_actions'
import { FailLoad, ListLoad } from 'redux/actions/load'
import quotationsApi from './quotationsApi'

const getErrorMessage = (error, fallbackMessage) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.ERROR ||
    error?.message ||
    fallbackMessage
  )
}

const formatDateTime = (value) => {
  if (!value) return '-'

  const parsed = moment(value)
  return parsed.isValid() ? parsed.format('DD/MM/YYYY HH:mm') : value
}

const formatDate = (value) => {
  if (!value) return '-'

  const parsed = moment(value)
  return parsed.isValid() ? parsed.format('DD/MM/YYYY') : value
}

const formatAmount = (value) => {
  if (value === null || value === undefined || value === '') return '-'

  const parsed = Number(value)
  if (Number.isNaN(parsed)) return value

  return parsed.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export default function QuotationViewPage(props) {
  const { quotationId: quotationIdProp, onBack } = props

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const params = useParams()

  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext)

  const quotationId = quotationIdProp || params?.quotationId

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [quotation, setQuotation] = useState(null)
  const [items, setItems] = useState([])

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: 'sent',
    loading: false,
    error: '',
  })

  const subtotalAmount = useMemo(() => {
    if (quotation?.subtotal_amount !== null && quotation?.subtotal_amount !== undefined) {
      return Number(quotation.subtotal_amount)
    }

    return (items || []).reduce((sum, item) => {
      const quantity = Number(item.quantity || 0)
      const unitPrice = Number(item.price || 0)
      return sum + quantity * unitPrice
    }, 0)
  }, [quotation, items])

  const discountAmount = useMemo(() => Number(quotation?.discount_amount || 0), [quotation])
  const taxAmount = useMemo(() => Number(quotation?.tax_amount || 0), [quotation])

  const totalAmount = useMemo(() => {
    if (quotation?.total_amount !== null && quotation?.total_amount !== undefined) {
      return Number(quotation.total_amount)
    }

    return subtotalAmount - discountAmount + taxAmount
  }, [quotation, subtotalAmount, discountAmount, taxAmount])

  const loadQuotation = async () => {
    if (!quotationId) return

    setLoading(true)
    setErrorMessage('')
    ListLoad(setModalTypeHandler, setLoaderStatusHandler)

    try {
      const response = await quotationsApi.getQuotation(quotationId)
      setQuotation(response?.data?.quotation || null)
      setItems(response?.data?.items || [])
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Unable to load quotation details'))
      setQuotation(null)
      setItems([])
    } finally {
      setLoading(false)
      FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    }
  }

  useEffect(() => {
    loadQuotation()
  }, [quotationId])

  const handleBack = () => {
    if (onBack) {
      onBack()
      return
    }

    navigate('/crm/quotation')
  }

  const handleEdit = () => {
    if (!quotationId) return
    navigate(`/crm/quotation/${quotationId}?mode=edit`)
  }

  const openConfirm = (type) => {
    setConfirmDialog({
      open: true,
      type,
      loading: false,
      error: '',
    })
  }

  const closeConfirm = () => {
    setConfirmDialog({
      open: false,
      type: 'sent',
      loading: false,
      error: '',
    })
  }

  const handleMarkStatus = async () => {
    if (!quotationId) return

    setConfirmDialog((prev) => ({
      ...prev,
      loading: true,
      error: '',
    }))

    try {
      if (confirmDialog.type === 'accepted') {
        await quotationsApi.markQuotationAccepted(quotationId)
      } else {
        await quotationsApi.markQuotationSent(quotationId)
      }

      dispatch(
        OpenalertActions({
          msg: confirmDialog.type === 'accepted' ? 'Quotation marked as accepted' : 'Quotation marked as sent',
          severity: 'success',
        }),
      )

      closeConfirm()
      await loadQuotation()
    } catch (error) {
      setConfirmDialog((prev) => ({
        ...prev,
        loading: false,
        error: getErrorMessage(error, 'Unable to update quotation status'),
      }))
    }
  }

  if (loading) {
    return (
      <Card sx={{ p: 2 }}>
        <Typography>Loading quotation details...</Typography>
      </Card>
    )
  }

  if (errorMessage) {
    return (
      <Card sx={{ p: 2 }}>
        <Typography color='error'>{errorMessage}</Typography>
        <Box sx={{ mt: 2 }}>
          <Button variant='outlined' onClick={loadQuotation}>
            Retry
          </Button>
        </Box>
      </Card>
    )
  }

  if (!quotation) {
    return (
      <Card sx={{ p: 2 }}>
        <Typography color='text.secondary'>Quotation not found.</Typography>
      </Card>
    )
  }

  return (
    <Box>
      <Card sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant='h6'>Quotation #{quotation.quotation_id}</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button startIcon={<ArrowBackIcon />} color='inherit' onClick={handleBack}>
              Back
            </Button>
            <Button startIcon={<EditIcon />} variant='outlined' onClick={handleEdit}>
              Edit
            </Button>
            <Button startIcon={<SendIcon />} variant='outlined' onClick={() => openConfirm('sent')}>
              Mark Sent
            </Button>
            <Button startIcon={<CheckCircleIcon />} variant='contained' onClick={() => openConfirm('accepted')}>
              Mark Accepted
            </Button>
          </Box>
        </Box>
      </Card>
      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              md: 3
            }}>
            <Typography variant='body2' color='text.secondary'>
              Customer
            </Typography>
            <Typography>{quotation.customer_company_name || '-'}</Typography>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 3
            }}>
            <Typography variant='body2' color='text.secondary'>
              Deal
            </Typography>
            <Typography>{quotation.deal_name || '-'}</Typography>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 2
            }}>
            <Typography variant='body2' color='text.secondary'>
              Status
            </Typography>
            <Typography>{quotation.status || '-'}</Typography>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 2
            }}>
            <Typography variant='body2' color='text.secondary'>
              Currency
            </Typography>
            <Typography>{quotation.currency_code || '-'}</Typography>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 2
            }}>
            <Typography variant='body2' color='text.secondary'>
              Valid Until
            </Typography>
            <Typography>{formatDate(quotation.valid_until)}</Typography>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 3
            }}>
            <Typography variant='body2' color='text.secondary'>
              Created At
            </Typography>
            <Typography>{formatDateTime(quotation.createdAt)}</Typography>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 3
            }}>
            <Typography variant='body2' color='text.secondary'>
              Updated At
            </Typography>
            <Typography>{formatDateTime(quotation.updatedAt)}</Typography>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 3
            }}>
            <Typography variant='body2' color='text.secondary'>
              Sent At
            </Typography>
            <Typography>{formatDateTime(quotation.sent_at)}</Typography>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 3
            }}>
            <Typography variant='body2' color='text.secondary'>
              Accepted At
            </Typography>
            <Typography>{formatDateTime(quotation.accepted_at)}</Typography>
          </Grid>
        </Grid>
      </Card>
      <Card sx={{ p: 2, mb: 2 }}>
        <Typography variant='h6' sx={{ mb: 2 }}>
          Line Items
        </Typography>

        {!items.length ? <Typography color='text.secondary'>No line items found.</Typography> : null}

        {items.map((item, index) => (
          <Box key={`${item.product_id || index}-${index}`}>
            <Grid container spacing={2} sx={{ py: 1 }}>
              <Grid
                size={{
                  xs: 12,
                  md: 4
                }}>
                <Typography variant='body2' color='text.secondary'>
                  Product
                </Typography>
                <Typography>{item.catalog_product_name || item.product || '-'}</Typography>
                {item.catalog_sku ? (
                  <Typography variant='caption' color='text.secondary'>
                    SKU: {item.catalog_sku}
                  </Typography>
                ) : null}
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 3
                }}>
                <Typography variant='body2' color='text.secondary'>
                  Description
                </Typography>
                <Typography>{item.description || '-'}</Typography>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 1
                }}>
                <Typography variant='body2' color='text.secondary'>
                  Qty
                </Typography>
                <Typography>{item.quantity}</Typography>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 2
                }}>
                <Typography variant='body2' color='text.secondary'>
                  Unit Price
                </Typography>
                <Typography>{formatAmount(item.price)}</Typography>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 2
                }}>
                <Typography variant='body2' color='text.secondary'>
                  Line Total
                </Typography>
                <Typography>{formatAmount(Number(item.quantity || 0) * Number(item.price || 0))}</Typography>
              </Grid>
            </Grid>
            {index < items.length - 1 ? <Divider /> : null}
          </Box>
        ))}
      </Card>
      <Card sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              md: 3
            }}>
            <Typography variant='body2' color='text.secondary'>
              Subtotal
            </Typography>
            <Typography>{formatAmount(subtotalAmount)}</Typography>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 3
            }}>
            <Typography variant='body2' color='text.secondary'>
              Discount
            </Typography>
            <Typography>{formatAmount(discountAmount)}</Typography>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 3
            }}>
            <Typography variant='body2' color='text.secondary'>
              Tax
            </Typography>
            <Typography>{formatAmount(taxAmount)}</Typography>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 3
            }}>
            <Typography variant='body2' color='text.secondary'>
              Total
            </Typography>
            <Typography variant='h6'>
              {formatAmount(totalAmount)} {quotation.currency_code || ''}
            </Typography>
          </Grid>
        </Grid>
      </Card>
      <Dialog open={confirmDialog.open} onClose={closeConfirm} maxWidth='xs' fullWidth>
        <DialogTitle>
          {confirmDialog.type === 'accepted' ? 'Mark Quotation as Accepted' : 'Mark Quotation as Sent'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.type === 'accepted'
              ? 'This will set accepted timestamp for this quotation.'
              : 'This will set sent timestamp for this quotation.'}
          </Typography>
          {confirmDialog.error ? (
            <Typography color='error' sx={{ mt: 1 }}>
              {confirmDialog.error}
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm} color='inherit' disabled={confirmDialog.loading}>
            Cancel
          </Button>
          <Button onClick={handleMarkStatus} variant='contained' disabled={confirmDialog.loading}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
