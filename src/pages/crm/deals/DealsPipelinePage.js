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
import AltRouteIcon from '@mui/icons-material/AltRoute'
import EditIcon from '@mui/icons-material/Edit'
import RefreshIcon from '@mui/icons-material/Refresh'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { OpenalertActions } from 'redux/actions/alert_actions'
import { FailLoad, ListLoad } from 'redux/actions/load'
import { listUserCreationAction } from 'redux/actions/userCreation_actions'
import CommonSearch from 'utils/commonSearch'
import { maxBodyHeight, headerStyle, cellStyle } from 'utils/pageSize'
import moment from 'moment'
import DealFormDialog from './DealFormDialog'
import MoveStageDialog from './MoveStageDialog'
import dealsApi from './dealsApi'

const getErrorMessage = (error, fallbackMessage) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.ERROR ||
    error?.message ||
    fallbackMessage
  )
}

const isLikelyEncryptedText = (value) => {
  if (typeof value !== 'string') return false
  const text = value.trim()
  if (!text || text.length < 80) return false
  return /^[A-Za-z0-9+/=]+$/.test(text)
}

const INITIAL_FILTERS = {
  pipeline_id: '',
  stage_id: '',
  owner_employee_id: '',
  status: '',
}

const DEFAULT_STATUS_OPTIONS = ['open', 'won', 'lost', 'closed']

export default function DealsPipelinePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const routeParams = useParams()

  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext)

  const {
    UserCreationReducer: { createUser },
  } = useSelector((state) => state)

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [pipelines, setPipelines] = useState([])
  const [pipelineStages, setPipelineStages] = useState([])
  const [deals, setDeals] = useState([])

  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [searchString, setSearchString] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState('create')
  const [selectedDeal, setSelectedDeal] = useState(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewLoading, setViewLoading] = useState(false)
  const [viewDeal, setViewDeal] = useState(null)
  const [viewError, setViewError] = useState('')

  const [moveStageOpen, setMoveStageOpen] = useState(false)
  const [autoCreateHandled, setAutoCreateHandled] = useState(false)

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  )
  const routeDealId = routeParams?.deal_id
  const defaultLeadId = queryParams.get('leadId')
  const defaultLeadName = queryParams.get('leadName')

  const ownerOptions = useMemo(() => {
    const ownerMap = new Map()

    ;(createUser || []).forEach((employee) => {
      if (!employee?.employee_id) return
      if (ownerMap.has(employee.employee_id)) return

      const firstName = employee.first_name || ''
      const lastName = employee.last_name || ''
      const fullName = `${firstName}${lastName ? ` ${lastName}` : ''}`.trim()

      ownerMap.set(employee.employee_id, {
        employee_id: employee.employee_id,
        displayName: fullName || `Employee ${employee.employee_id}`,
      })
    })

    return Array.from(ownerMap.values())
  }, [createUser])

  const ownerOptionById = useMemo(() => {
    const map = new Map()
    ownerOptions.forEach((owner) => {
      map.set(String(owner.employee_id), owner.displayName)
    })
    return map
  }, [ownerOptions])

  const statusOptions = useMemo(() => {
    const statusSet = new Set(DEFAULT_STATUS_OPTIONS)

    ;(deals || []).forEach((deal) => {
      if (deal?.status) statusSet.add(String(deal.status))
    })

    return Array.from(statusSet)
  }, [deals])

  const filteredDeals = useMemo(() => {
    const query = searchString.trim().toLowerCase()
    if (!query) return deals

    return (deals || []).filter((deal) => String(deal?.name || '').toLowerCase().includes(query))
  }, [deals, searchString])

  const loadPipelines = async () => {
    try {
      const response = await dealsApi.listPipelines({ include_inactive: 1 })
      setPipelines(response?.data || [])
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Unable to load pipelines'))
    }
  }

  const loadPipelineStagesForFilter = async (pipelineId) => {
    if (!pipelineId) {
      setPipelineStages([])
      return
    }

    try {
      const response = await dealsApi.listPipelineStages(pipelineId)
      setPipelineStages(response?.data || [])
    } catch (error) {
      setPipelineStages([])
      setErrorMessage(getErrorMessage(error, 'Unable to load stages'))
    }
  }

  const loadDeals = async () => {
    setLoading(true)
    setErrorMessage('')
    ListLoad(setModalTypeHandler, setLoaderStatusHandler)

    try {
      const response = await dealsApi.listDeals({
        pipeline_id: filters.pipeline_id || undefined,
        stage_id: filters.stage_id || undefined,
        owner_employee_id: filters.owner_employee_id || undefined,
        status: filters.status || undefined,
        pageCount: 0,
        numPerPage: 500,
      })

      setDeals(response?.data?.data || [])
    } catch (error) {
      setDeals([])
      setErrorMessage(getErrorMessage(error, 'Unable to load deals'))
    } finally {
      setLoading(false)
      FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    }
  }

  useEffect(() => {
    dispatch(listUserCreationAction())
    loadPipelines()
  }, [])

  useEffect(() => {
    loadDeals()
  }, [filters.pipeline_id, filters.stage_id, filters.owner_employee_id, filters.status])

  useEffect(() => {
    loadPipelineStagesForFilter(filters.pipeline_id)
  }, [filters.pipeline_id])

  useEffect(() => {
    if (!defaultLeadId || autoCreateHandled || pipelines.length === 0) return

    setSelectedDeal({
      name: defaultLeadName ? `Deal for ${defaultLeadName}` : '',
      lead_ref_table: 'ls_leads',
      lead_ref_id: defaultLeadId,
      pipeline_id: pipelines[0]?.pipeline_id || '',
    })
    setFormMode('create')
    setFormOpen(true)
    setAutoCreateHandled(true)
  }, [defaultLeadId, defaultLeadName, autoCreateHandled, pipelines])

  useEffect(() => {
    if (!routeDealId) return
    openViewDialog(routeDealId)
  }, [routeDealId])

  const requestSearch = (event) => {
    setSearchString(event.target.value)
  }

  const cancelSearch = () => {
    setSearchString('')
  }

  const handleFilterChange = (name, value) => {
    if (name === 'pipeline_id') {
      setFilters((prev) => ({
        ...prev,
        pipeline_id: value,
        stage_id: '',
      }))
      return
    }

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS)
    setSearchString('')
  }

  const openCreateDialog = () => {
    setFormMode('create')
    setSelectedDeal({})
    setFormOpen(true)
  }

  const openViewDialog = async (dealValue) => {
    const dealId =
      typeof dealValue === 'object'
        ? dealValue?.deal_id
        : Number(dealValue)

    if (!dealId) return

    setViewOpen(true)
    setViewLoading(true)
    setViewError('')
    setViewDeal(typeof dealValue === 'object' ? dealValue : null)

    try {
      const response = await dealsApi.getDeal(dealId)
      setViewDeal(response?.data || (typeof dealValue === 'object' ? dealValue : null))
    } catch (error) {
      setViewError(getErrorMessage(error, 'Unable to load deal details'))
    } finally {
      setViewLoading(false)
    }
  }

  const openEditDialog = (dealRow) => {
    setFormMode('edit')
    setSelectedDeal(dealRow)
    setFormOpen(true)
  }

  const openMoveStageDialog = (dealRow) => {
    setSelectedDeal(dealRow)
    setMoveStageOpen(true)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setSelectedDeal(null)

    if (defaultLeadId) {
      navigate('/crm/deals')
    }
  }

  const handleMoveStageClose = () => {
    setMoveStageOpen(false)
    setSelectedDeal(null)
  }

  const handleViewClose = () => {
    if (routeDealId) {
      navigate('/crm/deals', { replace: true })
    }
    setViewOpen(false)
    setViewLoading(false)
    setViewDeal(null)
    setViewError('')
  }

  const handleDealSaved = async () => {
    setFormOpen(false)
    setSelectedDeal(null)

    dispatch(
      OpenalertActions({
        msg: formMode === 'edit' ? 'Deal updated' : 'Deal created',
        severity: 'success',
      }),
    )

    if (defaultLeadId) {
      navigate('/crm/deals')
    }

    await loadDeals()
  }

  const handleStageMoved = async () => {
    setMoveStageOpen(false)
    setSelectedDeal(null)

    dispatch(OpenalertActions({ msg: 'Deal moved to new stage', severity: 'success' }))

    await loadDeals()
  }

  const resolveOwnerName = (dealRow) => {
    if (!dealRow) return '-'

    const rawOwnerName =
      typeof dealRow.owner_full_name === 'string' ? dealRow.owner_full_name.trim() : ''

    if (rawOwnerName && !isLikelyEncryptedText(rawOwnerName)) {
      return rawOwnerName
    }

    const fallbackOwnerName = ownerOptionById.get(String(dealRow.owner_employee_id))
    if (fallbackOwnerName) return fallbackOwnerName

    return '-'
  }

  const columns = [
    {
      title: 'Deal Name',
      field: 'name',
    },
    {
      title: 'Pipeline',
      field: 'pipeline_name',
      render: (rowData) => rowData.pipeline_name || '-',
    },
    {
      title: 'Stage',
      field: 'stage_name',
      render: (rowData) => rowData.stage_name || '-',
    },
    {
      title: 'Owner',
      field: 'owner_full_name',
      render: (rowData) => resolveOwnerName(rowData),
    },
    {
      title: 'Amount',
      field: 'amount',
      render: (rowData) => {
        if (rowData.amount === null || rowData.amount === undefined || rowData.amount === '') {
          return '-'
        }

        const amount = Number(rowData.amount)
        if (Number.isNaN(amount)) return rowData.amount

        return amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
      },
    },
    {
      title: 'Expected Close',
      field: 'expected_close_date',
      render: (rowData) => {
        if (!rowData.expected_close_date) return '-'

        const date = moment(rowData.expected_close_date)
        return date.isValid() ? date.format('DD/MM/YYYY') : rowData.expected_close_date
      },
    },
    {
      title: 'Status',
      field: 'status',
      render: (rowData) => rowData.status || '-',
    },
    {
      title: 'Last Updated',
      field: 'updatedAt',
      render: (rowData) => {
        if (!rowData.updatedAt) return '-'

        const date = moment(rowData.updatedAt)
        return date.isValid() ? date.format('DD/MM/YYYY HH:mm') : rowData.updatedAt
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
              label='Pipeline'
              value={filters.pipeline_id}
              onChange={(event) => handleFilterChange('pipeline_id', event.target.value)}
              fullWidth
              variant='filled'
            >
              <MenuItem value=''>All Pipelines</MenuItem>
              {pipelines.map((pipeline) => (
                <MenuItem key={pipeline.pipeline_id} value={pipeline.pipeline_id}>
                  {pipeline.name}
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
              label='Stage'
              value={filters.stage_id}
              onChange={(event) => handleFilterChange('stage_id', event.target.value)}
              fullWidth
              variant='filled'
              disabled={!filters.pipeline_id}
            >
              <MenuItem value=''>All Stages</MenuItem>
              {pipelineStages.map((stage) => (
                <MenuItem key={stage.stage_id} value={stage.stage_id}>
                  {stage.name}
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
              label='Owner'
              value={filters.owner_employee_id}
              onChange={(event) => handleFilterChange('owner_employee_id', event.target.value)}
              fullWidth
              variant='filled'
            >
              <MenuItem value=''>All Owners</MenuItem>
              {ownerOptions.map((owner) => (
                <MenuItem key={owner.employee_id} value={owner.employee_id}>
                  {owner.displayName}
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

          <Grid size={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={clearFilters} color='inherit'>
                Clear
              </Button>
              <Button onClick={loadDeals} variant='outlined' startIcon={<RefreshIcon />}>
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
            <Button variant='outlined' onClick={loadDeals} startIcon={<RefreshIcon />}>
              Retry
            </Button>
          </Box>
        </Card>
      ) : null}
      <Card>
        <MaterialTable
          title='Deals'
          columns={columns}
          data={filteredDeals}
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
              tooltip: 'Create Deal',
              isFreeAction: true,
              onClick: openCreateDialog,
            },
            {
              icon: () => <VisibilityIcon />,
              tooltip: 'View Deal',
              onClick: (_, rowData) => openViewDialog(rowData),
            },
            {
              icon: () => <EditIcon />,
              tooltip: 'Edit Deal',
              onClick: (_, rowData) => openEditDialog(rowData),
            },
            {
              icon: () => <AltRouteIcon />,
              tooltip: 'Move Stage',
              onClick: (_, rowData) => openMoveStageDialog(rowData),
            },
          ]}
        />
      </Card>
      {!loading && !errorMessage && filteredDeals.length === 0 ? (
        <Card sx={{ p: 2, mt: 2 }}>
          <Typography color='text.secondary'>No deals found for the selected filters.</Typography>
        </Card>
      ) : null}
      <Dialog open={viewOpen} onClose={handleViewClose} maxWidth='sm' fullWidth>
        <DialogTitle>Deal Details</DialogTitle>
        <DialogContent>
          {viewLoading ? (
            <Typography sx={{ pt: 1 }}>Loading deal details...</Typography>
          ) : (
            <Grid container spacing={2} sx={{ pt: 1 }}>
              {viewError ? (
                <Grid size={12}>
                  <Typography color='error'>{viewError}</Typography>
                </Grid>
              ) : null}
              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}>
                <Typography variant='body2' color='text.secondary'>
                  Deal Name
                </Typography>
                <Typography>{viewDeal?.name || '-'}</Typography>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}>
                <Typography variant='body2' color='text.secondary'>
                  Pipeline
                </Typography>
                <Typography>{viewDeal?.pipeline_name || '-'}</Typography>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}>
                <Typography variant='body2' color='text.secondary'>
                  Stage
                </Typography>
                <Typography>{viewDeal?.stage_name || '-'}</Typography>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}>
                <Typography variant='body2' color='text.secondary'>
                  Owner
                </Typography>
                <Typography>{resolveOwnerName(viewDeal)}</Typography>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}>
                <Typography variant='body2' color='text.secondary'>
                  Amount
                </Typography>
                <Typography>
                  {viewDeal?.amount !== null && viewDeal?.amount !== undefined && viewDeal?.amount !== ''
                    ? `${viewDeal?.currency_code || ''} ${Number(viewDeal.amount).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}`.trim()
                    : '-'}
                </Typography>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}>
                <Typography variant='body2' color='text.secondary'>
                  Expected Close
                </Typography>
                <Typography>
                  {viewDeal?.expected_close_date
                    ? moment(viewDeal.expected_close_date).isValid()
                      ? moment(viewDeal.expected_close_date).format('DD/MM/YYYY')
                      : viewDeal.expected_close_date
                    : '-'}
                </Typography>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}>
                <Typography variant='body2' color='text.secondary'>
                  Probability
                </Typography>
                <Typography>
                  {viewDeal?.probability_pct !== null &&
                  viewDeal?.probability_pct !== undefined &&
                  viewDeal?.probability_pct !== ''
                    ? `${viewDeal.probability_pct}%`
                    : '-'}
                </Typography>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}>
                <Typography variant='body2' color='text.secondary'>
                  Status
                </Typography>
                <Typography>{viewDeal?.status || '-'}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewClose}>Close</Button>
          <Button
            onClick={() => {
              if (!viewDeal?.deal_id) return
              handleViewClose()
              openEditDialog(viewDeal)
            }}
            disabled={!viewDeal?.deal_id}
            variant='contained'
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>
      <DealFormDialog
        open={formOpen}
        mode={formMode}
        deal={selectedDeal}
        pipelines={pipelines}
        owners={ownerOptions}
        onClose={handleFormClose}
        onSaved={handleDealSaved}
      />
      <MoveStageDialog
        open={moveStageOpen}
        deal={selectedDeal}
        onClose={handleMoveStageClose}
        onMoved={handleStageMoved}
      />
    </Box>
  );
}

