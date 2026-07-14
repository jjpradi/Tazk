import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable'
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditIcon from '@mui/icons-material/Edit'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import { OpenalertActions } from 'redux/actions/alert_actions'
import { FailLoad, ListLoad } from 'redux/actions/load'
import CommonSearch from 'utils/commonSearch'
import { maxBodyHeight, headerStyle, cellStyle } from 'utils/pageSize'
import moment from 'moment'
import catalogApi from '../catalogApi'

const INITIAL_FORM = {
  catalog_product_id: '',
  unit_price: '',
  min_qty: '',
  max_qty: '',
}

const getErrorMessage = (error, fallbackMessage) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.ERROR ||
    error?.message ||
    fallbackMessage
  )
}

export default function PriceListItemsPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { price_list_id } = useParams()
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext)

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [rows, setRows] = useState([])
  const [searchString, setSearchString] = useState('')
  const [catalogProducts, setCatalogProducts] = useState([])
  const [priceListName, setPriceListName] = useState('')

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
      const product = String(row?.product_name || '').toLowerCase()
      const sku = String(row?.sku || '').toLowerCase()
      return product.includes(query) || sku.includes(query)
    })
  }, [rows, searchString])

  const productOptions = useMemo(() => {
    return (catalogProducts || []).map((product) => ({
      catalog_product_id: product.catalog_product_id,
      name: product.name || '',
      sku: product.sku || '',
    }))
  }, [catalogProducts])

  const selectedProductOption = useMemo(() => {
    return (
      productOptions.find(
        (product) => String(product.catalog_product_id) === String(formData.catalog_product_id),
      ) || null
    )
  }, [productOptions, formData.catalog_product_id])

  const loadLookups = async () => {
    const [productsResult, priceListsResult] = await Promise.allSettled([
      catalogApi.listProducts({ pageCount: 0, numPerPage: 1000, is_active: 1 }),
      catalogApi.listPriceLists({ pageCount: 0, numPerPage: 1000 }),
    ])

    if (productsResult.status === 'fulfilled') {
      setCatalogProducts(productsResult.value?.data?.data || [])
    }

    if (priceListsResult.status === 'fulfilled') {
      const allLists = priceListsResult.value?.data?.data || []
      const current = allLists.find(
        (priceList) => String(priceList?.price_list_id) === String(price_list_id),
      )
      setPriceListName(current?.name || '')
    }
  }

  const loadItems = async () => {
    if (!price_list_id) return

    setLoading(true)
    setErrorMessage('')
    ListLoad(setModalTypeHandler, setLoaderStatusHandler)

    try {
      const response = await catalogApi.listPriceListItems(price_list_id)
      setRows(Array.isArray(response?.data) ? response.data : [])
    } catch (error) {
      setRows([])
      setErrorMessage(getErrorMessage(error, 'Unable to load price list items'))
    } finally {
      setLoading(false)
      FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    }
  }

  useEffect(() => {
    loadLookups()
  }, [price_list_id])

  useEffect(() => {
    loadItems()
  }, [price_list_id])

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
      catalog_product_id: rowData?.catalog_product_id ? String(rowData.catalog_product_id) : '',
      unit_price:
        rowData?.unit_price !== null && rowData?.unit_price !== undefined
          ? String(rowData.unit_price)
          : '',
      min_qty:
        rowData?.min_qty !== null && rowData?.min_qty !== undefined ? String(rowData.min_qty) : '',
      max_qty:
        rowData?.max_qty !== null && rowData?.max_qty !== undefined ? String(rowData.max_qty) : '',
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
    if (!formData.catalog_product_id) return 'Product is required'
    const price = Number(formData.unit_price)
    if (Number.isNaN(price)) return 'Unit price is required'
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
      catalog_product_id: Number(formData.catalog_product_id),
      unit_price: Number(formData.unit_price),
      min_qty: formData.min_qty === '' ? null : Number(formData.min_qty),
      max_qty: formData.max_qty === '' ? null : Number(formData.max_qty),
    }

    try {
      if (dialogMode === 'edit' && editingRow?.price_list_item_id) {
        await catalogApi.updatePriceListItem(editingRow.price_list_item_id, payload)
      } else {
        await catalogApi.createPriceListItem(price_list_id, payload)
      }

      dispatch(
        OpenalertActions({
          msg: dialogMode === 'edit' ? 'Price list item updated' : 'Price list item created',
          severity: 'success',
        }),
      )

      closeDialog()
      await loadItems()
    } catch (error) {
      setFormError(getErrorMessage(error, 'Unable to save price list item'))
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      title: 'Product',
      field: 'product_name',
      render: (rowData) => rowData?.product_name || '-',
    },
    {
      title: 'SKU',
      field: 'sku',
      render: (rowData) => rowData?.sku || '-',
    },
    {
      title: 'Unit Price',
      field: 'unit_price',
      render: (rowData) =>
        rowData?.unit_price !== null && rowData?.unit_price !== undefined ? rowData.unit_price : '-',
    },
    {
      title: 'Min Qty',
      field: 'min_qty',
      render: (rowData) =>
        rowData?.min_qty !== null && rowData?.min_qty !== undefined ? rowData.min_qty : '-',
    },
    {
      title: 'Max Qty',
      field: 'max_qty',
      render: (rowData) =>
        rowData?.max_qty !== null && rowData?.max_qty !== undefined ? rowData.max_qty : '-',
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant='h6'>Price List Items</Typography>
            <Typography color='text.secondary'>
              {priceListName ? `${priceListName} (ID: ${price_list_id})` : `Price List ID: ${price_list_id}`}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant='outlined' color='inherit' startIcon={<ArrowBackIcon />} onClick={() => navigate('/crm/catalog/price-lists')}>
              Back
            </Button>
            <Button variant='outlined' startIcon={<RefreshIcon />} onClick={loadItems}>
              Refresh
            </Button>
            <Button variant='contained' startIcon={<AddIcon />} onClick={openCreateDialog}>
              Add Item
            </Button>
          </Box>
        </Box>
      </Card>
      {errorMessage ? (
        <Card sx={{ p: 2, mb: 2 }}>
          <Typography color='error'>{errorMessage}</Typography>
        </Card>
      ) : null}
      <Card>
        <MaterialTable
          title='Items'
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
              tooltip: 'Edit Item',
              onClick: (_, rowData) => openEditDialog(rowData),
            },
            {
              icon: () => <DeleteOutlineIcon />,
              tooltip: 'Remove Item (not supported by backend)',
              disabled: true,
              onClick: () => {},
            },
          ]}
        />
      </Card>
      {!loading && !errorMessage && filteredRows.length === 0 ? (
        <Card sx={{ p: 2, mt: 2 }}>
          <Typography color='text.secondary'>No items found for this price list.</Typography>
        </Card>
      ) : null}
      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth='sm'>
        <DialogTitle>{dialogMode === 'edit' ? 'Edit Price List Item' : 'Add Price List Item'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <Autocomplete
                options={productOptions}
                value={selectedProductOption}
                onChange={(_, value) => handleFormChange('catalog_product_id', value ? String(value.catalog_product_id) : '')}
                getOptionLabel={(option) => (option?.sku ? `${option.name} (${option.sku})` : option?.name || '')}
                isOptionEqualToValue={(option, value) =>
                  String(option?.catalog_product_id || '') === String(value?.catalog_product_id || '')
                }
                renderInput={(params) => <TextField {...params} label='Product' variant='filled' />}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 4
              }}>
              <TextField
                type='number'
                fullWidth
                variant='filled'
                label='Unit Price'
                value={formData.unit_price}
                onChange={(event) => handleFormChange('unit_price', event.target.value)}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 4
              }}>
              <TextField
                type='number'
                fullWidth
                variant='filled'
                label='Min Qty'
                value={formData.min_qty}
                onChange={(event) => handleFormChange('min_qty', event.target.value)}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 4
              }}>
              <TextField
                type='number'
                fullWidth
                variant='filled'
                label='Max Qty'
                value={formData.max_qty}
                onChange={(event) => handleFormChange('max_qty', event.target.value)}
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

