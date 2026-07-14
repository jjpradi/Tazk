import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable'
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import SendIcon from '@mui/icons-material/Send'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import { OpenalertActions } from 'redux/actions/alert_actions'
import { FailLoad, ListLoad } from 'redux/actions/load'
import CommonSearch from 'utils/commonSearch'
import { maxBodyHeight, headerStyle, cellStyle } from 'utils/pageSize'
import moment from 'moment'
import quotationsApi from './quotationsApi'

const getErrorMessage = (error, fallbackMessage) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.ERROR ||
    error?.message ||
    fallbackMessage
  )
}

const INITIAL_FILTERS = {
  customer_id: '',
  deal_id: '',
  status: '',
  from_date: '',
  to_date: '',
}

const DEFAULT_STATUS_OPTIONS = ['Draft', 'Sent', 'Accepted', 'Rejected']

export default function QuotationListPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext)

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [rows, setRows] = useState([])
  const [customers, setCustomers] = useState([])
  const [deals, setDeals] = useState([])

  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [searchString, setSearchString] = useState('')

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: 'sent',
    row: null,
    loading: false,
    error: '',
  })

  const statusOptions = useMemo(() => {
    const statusSet = new Set(DEFAULT_STATUS_OPTIONS)

    ;(rows || []).forEach((quotation) => {
      if (quotation?.status) statusSet.add(String(quotation.status))
    })

    return Array.from(statusSet)
  }, [rows])

  const filteredRows = useMemo(() => {
    const query = searchString.trim().toLowerCase()
    if (!query) return rows

    return (rows || []).filter((quotation) => {
      const quotationNumber = String(quotation?.quotation_number || quotation?.quotation_id || '')
      const customerName = String(quotation?.customer_company_name || '')
      const dealName = String(quotation?.deal_name || '')

      return (
        quotationNumber.toLowerCase().includes(query) ||
        customerName.toLowerCase().includes(query) ||
        dealName.toLowerCase().includes(query)
      )
    })
  }, [rows, searchString])

  const loadLookups = async () => {
    try {
      const [customersResponse, dealsResponse] = await Promise.all([
        quotationsApi.listCustomers(),
        quotationsApi.listDeals({ pageCount: 0, numPerPage: 500 }),
      ])

      setCustomers(customersResponse?.data || [])
      setDeals(dealsResponse?.data?.data || [])
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Unable to load filter options'))
    }
  }

  const loadQuotations = async () => {
    setLoading(true)
    setErrorMessage('')
    ListLoad(setModalTypeHandler, setLoaderStatusHandler)

    try {
      const response = await quotationsApi.listQuotations({
        customer_id: filters.customer_id || undefined,
        deal_id: filters.deal_id || undefined,
        status: filters.status || undefined,
        from_date: filters.from_date || undefined,
        to_date: filters.to_date || undefined,
        pageCount: 0,
        numPerPage: 500,
      })

      setRows(response?.data?.data || [])
    } catch (error) {
      setRows([])
      setErrorMessage(getErrorMessage(error, 'Unable to load quotations'))
    } finally {
      setLoading(false)
      FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    }
  }

  useEffect(() => {
    loadLookups()
  }, [])

  useEffect(() => {
    loadQuotations()
  }, [filters.customer_id, filters.deal_id, filters.status, filters.from_date, filters.to_date])

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS)
    setSearchString('')
  }

  const openCreatePage = () => {
    navigate('/crm/quotation/new')
  }

  const openViewPage = (rowData) => {
    navigate(`/crm/quotation/${rowData.quotation_id}`)
  }

  const openEditPage = (rowData) => {
    navigate(`/crm/quotation/${rowData.quotation_id}?mode=edit`)
  }

  const openConfirm = (type, row) => {
    setConfirmDialog({
      open: true,
      type,
      row,
      loading: false,
      error: '',
    })
  }

  const closeConfirm = () => {
    setConfirmDialog((prev) => ({
      ...prev,
      open: false,
      row: null,
      loading: false,
      error: '',
    }))
  }

  const handleMarkStatus = async () => {
    if (!confirmDialog?.row?.quotation_id) return

    setConfirmDialog((prev) => ({
      ...prev,
      loading: true,
      error: '',
    }))

    try {
      if (confirmDialog.type === 'accepted') {
        await quotationsApi.markQuotationAccepted(confirmDialog.row.quotation_id)
      } else {
        await quotationsApi.markQuotationSent(confirmDialog.row.quotation_id)
      }

      dispatch(
        OpenalertActions({
          msg: confirmDialog.type === 'accepted' ? 'Quotation marked as accepted' : 'Quotation marked as sent',
          severity: 'success',
        }),
      )

      closeConfirm()
      await loadQuotations()
    } catch (error) {
      setConfirmDialog((prev) => ({
        ...prev,
        loading: false,
        error: getErrorMessage(error, 'Unable to update quotation status'),
      }))
    }
  }

  const requestSearch = (event) => {
    setSearchString(event.target.value)
  }

  const cancelSearch = () => {
    setSearchString('')
  }

  const columns = [
    {
      title: 'Quotation ID',
      field: 'quotation_id',
    },
    {
      title: 'Customer',
      field: 'customer_company_name',
      render: (rowData) => rowData.customer_company_name || '-',
    },
    {
      title: 'Deal',
      field: 'deal_name',
      render: (rowData) => rowData.deal_name || '-',
    },
    {
      title: 'Status',
      field: 'status',
      render: (rowData) => rowData.status || '-',
    },
    {
      title: 'Total Amount',
      field: 'total_amount',
      render: (rowData) => {
        if (rowData.total_amount === null || rowData.total_amount === undefined) return '-'

        const amount = Number(rowData.total_amount)
        if (Number.isNaN(amount)) return rowData.total_amount

        return amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
      },
    },
    {
      title: 'Currency',
      field: 'currency_code',
      render: (rowData) => rowData.currency_code || '-',
    },
    {
      title: 'Created At',
      field: 'createdAt',
      render: (rowData) => {
        if (!rowData.createdAt) return '-'

        const created = moment(rowData.createdAt)
        return created.isValid() ? created.format('DD/MM/YYYY HH:mm') : rowData.createdAt
      },
    },
    {
      title: 'Updated At',
      field: 'updatedAt',
      render: (rowData) => {
        if (!rowData.updatedAt) return '-'

        const updated = moment(rowData.updatedAt)
        return updated.isValid() ? updated.format('DD/MM/YYYY HH:mm') : rowData.updatedAt
      },
    },
  ]

  return (
    <Box>
      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems='center'>
          <Grid
            size={{
              xs: 12,
              md: 3
            }}>
            <TextField
              select
              label='Customer'
              value={filters.customer_id}
              onChange={(event) => handleFilterChange('customer_id', event.target.value)}
              fullWidth
              variant='filled'
            >
              <MenuItem value=''>All Customers</MenuItem>
              {customers.map((customer) => (
                <MenuItem key={customer.customer_id} value={customer.customer_id}>
                  {customer.company_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 3
            }}>
            <TextField
              select
              label='Deal'
              value={filters.deal_id}
              onChange={(event) => handleFilterChange('deal_id', event.target.value)}
              fullWidth
              variant='filled'
            >
              <MenuItem value=''>All Deals</MenuItem>
              {deals.map((deal) => (
                <MenuItem key={deal.deal_id} value={deal.deal_id}>
                  {deal.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 2
            }}>
            <TextField
              select
              label='Status'
              value={filters.status}
              onChange={(event) => handleFilterChange('status', event.target.value)}
              fullWidth
              variant='filled'
            >
              <MenuItem value=''>All Status</MenuItem>
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 2
            }}>
            <TextField
              type='date'
              label='From Date'
              value={filters.from_date}
              onChange={(event) => handleFilterChange('from_date', event.target.value)}
              fullWidth
              variant='filled'
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 2
            }}>
            <TextField
              type='date'
              label='To Date'
              value={filters.to_date}
              onChange={(event) => handleFilterChange('to_date', event.target.value)}
              fullWidth
              variant='filled'
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={clearFilters} color='inherit'>
                Clear
              </Button>
              <Button onClick={loadQuotations} variant='outlined' startIcon={<RefreshIcon />}>
                Refresh
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>
      {errorMessage ? (
        <Card sx={{ p: 3, mb: 2 }}>
          <Typography color='error'>{errorMessage}</Typography>
          <Box sx={{ mt: 1 }}>
            <Button variant='outlined' onClick={loadQuotations} startIcon={<RefreshIcon />}>
              Retry
            </Button>
          </Box>
        </Card>
      ) : null}
      <Card>
        <MaterialTable
          title='Quotations'
          columns={columns}
          data={filteredRows}
          isLoading={loading}
          options={{
            filtering: false,
            actionsColumnIndex: -1,
            paging: true,
            pageSize: 20,
            pageSizeOptions: [20, 50, 100],
            search: false,
            maxBodyHeight,
            minBodyHeight: maxBodyHeight,
            overflowY: 'visible',
            headerStyle,
            cellStyle,
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
                      searchVal={searchString}
                      requestSearch={requestSearch}
                      cancelSearch={cancelSearch}
                    />
                  </div>
                </div>
              </div>
            ),
          }}
          actions={[
            {
              icon: () => <AddIcon />,
              tooltip: 'Create Quotation',
              isFreeAction: true,
              onClick: openCreatePage,
            },
            {
              icon: () => <VisibilityIcon />,
              tooltip: 'View',
              onClick: (_, rowData) => openViewPage(rowData),
            },
            {
              icon: () => <EditIcon />,
              tooltip: 'Edit',
              onClick: (_, rowData) => openEditPage(rowData),
            },
            {
              icon: () => <SendIcon />,
              tooltip: 'Mark Sent',
              onClick: (_, rowData) => openConfirm('sent', rowData),
            },
            {
              icon: () => <CheckCircleIcon />,
              tooltip: 'Mark Accepted',
              onClick: (_, rowData) => openConfirm('accepted', rowData),
            },
          ]}
        />
      </Card>
      {!loading && !errorMessage && filteredRows.length === 0 ? (
        <Card sx={{ p: 2, mt: 2 }}>
          <Typography color='text.secondary'>No quotations found for the selected filters.</Typography>
        </Card>
      ) : null}
      <Dialog open={confirmDialog.open} onClose={closeConfirm} maxWidth='xs' fullWidth>
        <DialogTitle>
          {confirmDialog.type === 'accepted' ? 'Mark Quotation as Accepted' : 'Mark Quotation as Sent'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.type === 'accepted'
              ? 'This will set accepted timestamp for the quotation.'
              : 'This will set sent timestamp for the quotation.'}
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

