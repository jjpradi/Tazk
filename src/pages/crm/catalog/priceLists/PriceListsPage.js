import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable'
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import ListAltIcon from '@mui/icons-material/ListAlt'
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
import catalogApi from '../catalogApi'

const INITIAL_FORM = {
  name: '',
  currency_code: 'USD',
  region_tag: '',
  channel_tag: '',
  effective_from: '',
  effective_to: '',
  is_active: true,
}

const getErrorMessage = (error, fallbackMessage) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.ERROR ||
    error?.message ||
    fallbackMessage
  )
}

export default function PriceListsPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext)

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [rows, setRows] = useState([])
  const [searchString, setSearchString] = useState('')
  const [activeFilter, setActiveFilter] = useState('active')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState('create')
  const [editingRow, setEditingRow] = useState(null)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const filteredRows = useMemo(() => {
    const query = searchString.trim().toLowerCase()
    if (!query) return rows

    return rows.filter((row) => {
      const name = String(row?.name || '').toLowerCase()
      const currencyCode = String(row?.currency_code || '').toLowerCase()
      const regionTag = String(row?.region_tag || '').toLowerCase()
      const channelTag = String(row?.channel_tag || '').toLowerCase()
      return (
        name.includes(query) ||
        currencyCode.includes(query) ||
        regionTag.includes(query) ||
        channelTag.includes(query)
      )
    })
  }, [rows, searchString])

  const loadPriceLists = async () => {
    setLoading(true)
    setErrorMessage('')
    ListLoad(setModalTypeHandler, setLoaderStatusHandler)

    try {
      const response = await catalogApi.listPriceLists({
        pageCount: 0,
        numPerPage: 500,
        is_active: activeFilter === 'all' ? undefined : activeFilter === 'active' ? 1 : 0,
      })
      setRows(response?.data?.data || [])
    } catch (error) {
      setRows([])
      setErrorMessage(getErrorMessage(error, 'Unable to load price lists'))
    } finally {
      setLoading(false)
      FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    }
  }

  useEffect(() => {
    loadPriceLists()
  }, [activeFilter])

  const requestSearch = (event) => {
    setSearchString(event.target.value)
  }

  const cancelSearch = () => {
    setSearchString('')
  }

  const openCreateDialog = () => {
    setDialogMode('create')
    setEditingRow(null)
    setFormData(INITIAL_FORM)
    setFormError('')
    setDialogOpen(true)
  }

  const openEditDialog = (rowData) => {
    setDialogMode('edit')
    setEditingRow(rowData)
    setFormData({
      name: rowData?.name || '',
      currency_code: rowData?.currency_code || 'USD',
      region_tag: rowData?.region_tag || '',
      channel_tag: rowData?.channel_tag || '',
      effective_from: rowData?.effective_from ? String(rowData.effective_from).slice(0, 10) : '',
      effective_to: rowData?.effective_to ? String(rowData.effective_to).slice(0, 10) : '',
      is_active: Number(rowData?.is_active) === 1,
    })
    setFormError('')
    setDialogOpen(true)
  }

  const closeDialog = () => {
    if (saving) return
    setDialogOpen(false)
    setEditingRow(null)
    setFormError('')
    setFormData(INITIAL_FORM)
  }

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateForm = () => {
    if (!String(formData.name || '').trim()) return 'Name is required'
    const currencyCode = String(formData.currency_code || '').trim().toUpperCase()
    if (!currencyCode) return 'Currency code is required'
    if (currencyCode.length !== 3) return 'Currency code must be 3 characters'
    return ''
  }

  const handleSave = async () => {
    const validationMessage = validateForm()
    if (validationMessage) {
      setFormError(validationMessage)
      return
    }

    setSaving(true)
    setFormError('')

    const payload = {
      name: String(formData.name || '').trim(),
      currency_code: String(formData.currency_code || '').trim().toUpperCase(),
      region_tag: String(formData.region_tag || '').trim() || null,
      channel_tag: String(formData.channel_tag || '').trim() || null,
      effective_from: formData.effective_from || null,
      effective_to: formData.effective_to || null,
      is_active: formData.is_active ? 1 : 0,
    }

    try {
      if (dialogMode === 'edit' && editingRow?.price_list_id) {
        await catalogApi.updatePriceList(editingRow.price_list_id, payload)
      } else {
        await catalogApi.createPriceList(payload)
      }

      dispatch(
        OpenalertActions({
          msg: dialogMode === 'edit' ? 'Price list updated' : 'Price list created',
          severity: 'success',
        }),
      )

      closeDialog()
      await loadPriceLists()
    } catch (error) {
      setFormError(getErrorMessage(error, 'Unable to save price list'))
    } finally {
      setSaving(false)
    }
  }

  const openItems = (rowData) => {
    navigate(`/crm/catalog/price-lists/${rowData.price_list_id}/items`)
  }

  const columns = [
    { title: 'Name', field: 'name', render: (rowData) => rowData?.name || '-' },
    {
      title: 'Currency',
      field: 'currency_code',
      render: (rowData) => rowData?.currency_code || '-',
    },
    {
      title: 'Active',
      field: 'is_active',
      render: (rowData) => (Number(rowData?.is_active) === 1 ? 'Yes' : 'No'),
    },
    {
      title: 'Region Tag',
      field: 'region_tag',
      render: (rowData) => rowData?.region_tag || '-',
    },
    {
      title: 'Channel Tag',
      field: 'channel_tag',
      render: (rowData) => rowData?.channel_tag || '-',
    },
    {
      title: 'Updated At',
      field: 'updatedAt',
      render: (rowData) => {
        if (!rowData?.updatedAt) return '-'
        const parsed = moment(rowData.updatedAt)
        return parsed.isValid() ? parsed.format('DD/MM/YYYY HH:mm') : rowData.updatedAt
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
              fullWidth
              variant='filled'
              label='Status'
              value={activeFilter}
              onChange={(event) => setActiveFilter(event.target.value)}
            >
              <MenuItem value='active'>Active</MenuItem>
              <MenuItem value='inactive'>Inactive</MenuItem>
              <MenuItem value='all'>All</MenuItem>
            </TextField>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 9
            }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={loadPriceLists} variant='outlined' startIcon={<RefreshIcon />}>
                Refresh
              </Button>
              <Button onClick={openCreateDialog} variant='contained' startIcon={<AddIcon />}>
                Add Price List
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>
      {errorMessage ? (
        <Card sx={{ p: 2, mb: 2 }}>
          <Typography color='error'>{errorMessage}</Typography>
        </Card>
      ) : null}
      <Card>
        <MaterialTable
          title='CRM Price Lists'
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
              icon: () => <EditIcon />,
              tooltip: 'Edit Price List',
              onClick: (_, rowData) => openEditDialog(rowData),
            },
            {
              icon: () => <ListAltIcon />,
              tooltip: 'Open Items',
              onClick: (_, rowData) => openItems(rowData),
            },
          ]}
        />
      </Card>
      {!loading && !errorMessage && filteredRows.length === 0 ? (
        <Card sx={{ p: 2, mt: 2 }}>
          <Typography color='text.secondary'>No price lists found.</Typography>
        </Card>
      ) : null}
      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth='sm'>
        <DialogTitle>{dialogMode === 'edit' ? 'Edit Price List' : 'Add Price List'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
                fullWidth
                variant='filled'
                label='Name'
                value={formData.name}
                onChange={(event) => handleFormChange('name', event.target.value)}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
                fullWidth
                variant='filled'
                label='Currency Code'
                value={formData.currency_code}
                onChange={(event) => handleFormChange('currency_code', event.target.value)}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
                fullWidth
                variant='filled'
                label='Region Tag'
                value={formData.region_tag}
                onChange={(event) => handleFormChange('region_tag', event.target.value)}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
                fullWidth
                variant='filled'
                label='Channel Tag'
                value={formData.channel_tag}
                onChange={(event) => handleFormChange('channel_tag', event.target.value)}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
                type='date'
                fullWidth
                variant='filled'
                label='Effective From'
                InputLabelProps={{ shrink: true }}
                value={formData.effective_from}
                onChange={(event) => handleFormChange('effective_from', event.target.value)}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
                type='date'
                fullWidth
                variant='filled'
                label='Effective To'
                InputLabelProps={{ shrink: true }}
                value={formData.effective_to}
                onChange={(event) => handleFormChange('effective_to', event.target.value)}
              />
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                label='Active'
                control={
                  <Switch
                    checked={Boolean(formData.is_active)}
                    onChange={(event) => handleFormChange('is_active', event.target.checked)}
                  />
                }
              />
            </Grid>
            {formError ? (
              <Grid size={12}>
                <Typography color='error'>{formError}</Typography>
              </Grid>
            ) : null}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color='inherit' onClick={closeDialog} disabled={saving}>
            Cancel
          </Button>
          <Button variant='contained' onClick={handleSave} disabled={saving}>
            {dialogMode === 'edit' ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

