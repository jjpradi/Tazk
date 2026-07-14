import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable'
import { Box, Button, Card, IconButton, Tooltip, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import RefreshIcon from '@mui/icons-material/Refresh'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import CommonSearch from 'utils/commonSearch'
import { maxBodyHeight, headerStyle, cellStyle } from 'utils/pageSize'
import leadHubApi from './leadHubApi'

const getErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.message ||
  error?.response?.data?.ERROR ||
  error?.message ||
  fallbackMessage

function formatAmount(amount) {
  if (amount === null || amount === undefined) return '-'
  const parsed = Number(amount)
  if (Number.isNaN(parsed)) return amount
  return parsed.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function formatDateTime(value) {
  if (!value) return '-'
  const parsed = moment(value)
  return parsed.isValid() ? parsed.format('DD/MM/YYYY HH:mm') : value
}

export default function LeadQuotationsTab(props) {
  const { dealSummary, leadId, onCreateQuotation } = props
  const navigate = useNavigate()

  const convertedDealId = dealSummary?.converted_deal_id

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchString, setSearchString] = useState('')

  const filteredRows = useMemo(() => {
    const query = String(searchString || '').trim().toLowerCase()
    if (!query) return rows

    return (rows || []).filter((quotation) => {
      const quotationNumber = String(quotation?.quotation_number || quotation?.quotation_id || '')
      const status = String(quotation?.status || '')
      return (
        quotationNumber.toLowerCase().includes(query) || status.toLowerCase().includes(query)
      )
    })
  }, [rows, searchString])

  const loadQuotations = async () => {
    if (!convertedDealId) {
      setRows([])
      setLoading(false)
      setErrorMessage('')
      return
    }

    setLoading(true)
    setErrorMessage('')
    try {
      const response = await leadHubApi.listQuotations({
        deal_id: convertedDealId,
        pageCount: 0,
        numPerPage: 200,
      })
      setRows(response?.data?.data || [])
    } catch (error) {
      setRows([])
      setErrorMessage(getErrorMessage(error, 'Unable to load quotations'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuotations()
  }, [convertedDealId])

  const requestSearch = (event) => {
    setSearchString(event.target.value)
  }

  const cancelSearch = () => {
    setSearchString('')
  }

  if (!convertedDealId) {
    const query = new URLSearchParams()
    query.set('next', '/crm/quotation/new')
    const convertRoute = leadId
      ? `/crm/leads/${encodeURIComponent(String(leadId))}/convert?${query.toString()}`
      : '/crm/leads'

    return (
      <Card sx={{ p: 2 }}>
        <Typography color='text.secondary' sx={{ mb: 2 }}>
          Convert this lead to a deal to view and create quotations.
        </Typography>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          disabled={!leadId}
          onClick={() => navigate(convertRoute)}
        >
          Convert & Create Quotation
        </Button>
      </Card>
    )
  }

  const columns = [
    { title: 'Quotation ID', field: 'quotation_id' },
    {
      title: 'Status',
      field: 'status',
      render: (rowData) => rowData.status || '-',
    },
    {
      title: 'Total Amount',
      field: 'total_amount',
      render: (rowData) => formatAmount(rowData.total_amount),
    },
    {
      title: 'Currency',
      field: 'currency_code',
      render: (rowData) => rowData.currency_code || '-',
    },
    {
      title: 'Valid Until',
      field: 'valid_until',
      render: (rowData) => formatDateTime(rowData.valid_until),
    },
    {
      title: 'Sent At',
      field: 'sent_at',
      render: (rowData) => formatDateTime(rowData.sent_at),
    },
    {
      title: 'Accepted At',
      field: 'accepted_at',
      render: (rowData) => formatDateTime(rowData.accepted_at),
    },
    {
      title: 'Updated At',
      field: 'updatedAt',
      render: (rowData) => formatDateTime(rowData.updatedAt),
    },
    {
      title: 'Action',
      field: 'action',
      render: (rowData) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title='View'>
            <IconButton onClick={() => navigate(`/crm/quotation/${rowData.quotation_id}`)}>
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Edit'>
            <IconButton
              onClick={() => navigate(`/crm/quotation/${rowData.quotation_id}?mode=edit`)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ]

  return (
    <Card>
      <MaterialTable
        title='Quotations'
        columns={columns}
        data={Array.isArray(filteredRows) ? filteredRows : []}
        isLoading={loading}
        options={{
          filtering: false,
          actionsColumnIndex: -1,
          paging: false,
          search: false,
          maxBodyHeight: maxBodyHeight,
          minBodyHeight: 320,
          overflowY: 'visible',
          headerStyle,
          cellStyle,
        }}
        components={{
          Toolbar: (toolbarProps) => (
            <div>
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  alignItems: 'center',
                  gap: 12,
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ flex: 1 }}>
                  <MTableToolbar {...toolbarProps} />
                </div>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 2 }}>
                  <Button
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={() => {
                      if (onCreateQuotation) onCreateQuotation()
                    }}
                  >
                    New Quotation
                  </Button>
                  <Button
                    variant='outlined'
                    startIcon={<RefreshIcon />}
                    onClick={loadQuotations}
                  >
                    Refresh
                  </Button>
                </Box>
              </div>
              <CommonSearch
                search={searchString}
                requestSearch={requestSearch}
                cancelSearch={cancelSearch}
                placeholder='Search quotations'
              />
            </div>
          ),
        }}
      />

      {errorMessage ? (
        <Typography color='error' sx={{ px: 2, pb: 2 }}>
          {errorMessage}
        </Typography>
      ) : null}

      {!loading && !errorMessage && filteredRows.length === 0 ? (
        <Typography color='text.secondary' sx={{ px: 2, pb: 2 }}>
          No quotations available for this deal.
        </Typography>
      ) : null}
    </Card>
  )
}

