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
import RefreshIcon from '@mui/icons-material/Refresh'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import ToggleOffIcon from '@mui/icons-material/ToggleOff'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import { OpenalertActions } from 'redux/actions/alert_actions'
import { FailLoad, ListLoad } from 'redux/actions/load'
import CommonSearch from 'utils/commonSearch'
import { maxBodyHeight, headerStyle, cellStyle } from 'utils/pageSize'
import moment from 'moment'
import catalogApi from '../catalogApi'

const INITIAL_FORM = {
  sku: '',
  name: '',
  description: '',
  unit_of_measure: '',
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

export default function ProductCatalogPage() {
  const dispatch = useDispatch()
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext)

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [rows, setRows] = useState([])
  const [searchString, setSearchString] = useState('')
  const [activeFilter, setActiveFilter] = useState('active')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState('create')
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingRow, setEditingRow] = useState(null)

  const filteredRows = useMemo(() => {
    const query = searchString.trim().toLowerCase()
    if (!query) return rows

    return rows.filter((row) => {
      const sku = String(row?.sku || '').toLowerCase()
      const name = String(row?.name || '').toLowerCase()
      return sku.includes(query) || name.includes(query)
    })
  }, [rows, searchString])

  const loadProducts = async () => {
    setLoading(true)
    setErrorMessage('')
    ListLoad(setModalTypeHandler, setLoaderStatusHandler)

    try {
      const response = await catalogApi.listProducts({
        pageCount: 0,
        numPerPage: 500,
        is_active: activeFilter === 'all' ? undefined : activeFilter === 'active' ? 1 : 0,
      })
      setRows(response?.data?.data || [])
    } catch (error) {
      setRows([])
      setErrorMessage(getErrorMessage(error, 'Unable to load catalog products'))
    } finally {
      setLoading(false)
      FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    }
  }

  useEffect(() => {
    loadProducts()
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
      sku: rowData?.sku || '',
      name: rowData?.name || '',
      description: rowData?.description || '',
      unit_of_measure: rowData?.unit_of_measure || '',
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
    if (!String(formData.sku || '').trim()) return 'SKU is required'
    if (!String(formData.name || '').trim()) return 'Name is required'
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
      sku: String(formData.sku || '').trim(),
      name: String(formData.name || '').trim(),
      description: String(formData.description || '').trim() || null,
      unit_of_measure: String(formData.unit_of_measure || '').trim() || null,
      is_active: formData.is_active ? 1 : 0,
    }

    try {
      if (dialogMode === 'edit' && editingRow?.catalog_product_id) {
        await catalogApi.updateProduct(editingRow.catalog_product_id, payload)
      } else {
        await catalogApi.createProduct(payload)
      }

      dispatch(
        OpenalertActions({
          msg: dialogMode === 'edit' ? 'Product updated' : 'Product created',
          severity: 'success',
        }),
      )

      closeDialog()
      await loadProducts()
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to save product')
      setFormError(message)
    } finally {
      setSaving(false)
    }
  }

  const toggleProductStatus = async (rowData) => {
    if (!rowData?.catalog_product_id) return

    try {
      await catalogApi.updateProduct(rowData.catalog_product_id, {
        is_active: Number(rowData?.is_active) === 1 ? 0 : 1,
      })

      dispatch(
        OpenalertActions({
          msg: Number(rowData?.is_active) === 1 ? 'Product deactivated' : 'Product activated',
          severity: 'success',
        }),
      )

      await loadProducts()
    } catch (error) {
      dispatch(
        OpenalertActions({
          msg: getErrorMessage(error, 'Unable to update product status'),
          severity: 'error',
        }),
      )
    }
  }

  const columns = [
    { title: 'SKU', field: 'sku', render: (rowData) => rowData?.sku || '-' },
    { title: 'Name', field: 'name', render: (rowData) => rowData?.name || '-' },
    {
      title: 'UOM',
      field: 'unit_of_measure',
      render: (rowData) => rowData?.unit_of_measure || '-',
    },
    {
      title: 'Active',
      field: 'is_active',
      render: (rowData) => (Number(rowData?.is_active) === 1 ? 'Yes' : 'No'),
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
              <Button onClick={loadProducts} variant='outlined' startIcon={<RefreshIcon />}>
                Refresh
              </Button>
              <Button onClick={openCreateDialog} variant='contained' startIcon={<AddIcon />}>
                Add Product
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
          title='CRM Product Catalog'
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
              tooltip: 'Edit Product',
              onClick: (_, rowData) => openEditDialog(rowData),
            },
            {
              icon: (rowData) =>
                Number(rowData?.is_active) === 1 ? <ToggleOffIcon /> : <ToggleOnIcon />,
              tooltip: (rowData) =>
                Number(rowData?.is_active) === 1 ? 'Deactivate Product' : 'Activate Product',
              onClick: (_, rowData) => toggleProductStatus(rowData),
            },
          ]}
        />
      </Card>
      {!loading && !errorMessage && filteredRows.length === 0 ? (
        <Card sx={{ p: 2, mt: 2 }}>
          <Typography color='text.secondary'>No catalog products found.</Typography>
        </Card>
      ) : null}
      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth='sm'>
        <DialogTitle>{dialogMode === 'edit' ? 'Edit Product' : 'Add Product'}</DialogTitle>
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
                label='SKU'
                value={formData.sku}
                onChange={(event) => handleFormChange('sku', event.target.value)}
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
                label='Name'
                value={formData.name}
                onChange={(event) => handleFormChange('name', event.target.value)}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                variant='filled'
                label='Description'
                value={formData.description}
                onChange={(event) => handleFormChange('description', event.target.value)}
                multiline
                minRows={2}
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
                label='Unit Of Measure'
                value={formData.unit_of_measure}
                onChange={(event) => handleFormChange('unit_of_measure', event.target.value)}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
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

