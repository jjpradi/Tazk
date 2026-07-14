import {
  Autocomplete,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import { OpenalertActions } from 'redux/actions/alert_actions'
import { FailLoad, ListLoad } from 'redux/actions/load'
import quotationsApi from './quotationsApi'

const DEFAULT_FORM = {
  customer_id: '',
  deal_id: '',
  price_list_id: '',
  currency_code: '',
  reference: '',
  comments: '',
  valid_until: '',
  status: 'Draft',
  discount_amount: '',
  tax_amount: '',
  notes: '',
}

const STATUS_OPTIONS = ['Draft', 'Sent', 'Accepted', 'Rejected']

const createEmptyLineItem = () => ({
  row_key: `${Date.now()}-${Math.random()}`,
  catalog_product_id: '',
  product_name: '',
  description: '',
  quantity: '1',
  unit_price: '',
})

const getErrorMessage = (error, fallbackMessage) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.ERROR ||
    error?.message ||
    fallbackMessage
  )
}

const parseNumber = (value, fallback = 0) => {
  if (value === '' || value === null || value === undefined) return fallback

  const parsed = Number(value)
  if (Number.isNaN(parsed)) return fallback

  return parsed
}

const formatDateInput = (dateValue) => {
  if (!dateValue) return ''

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return ''

  return date.toISOString().slice(0, 10)
}

const normalizeCatalogProducts = (rows = []) => {
  return (rows || [])
    .map((row) => ({
      option_key: `catalog-${row.catalog_product_id}`,
      catalog_product_id: row.catalog_product_id,
      name: row.name || '',
      sku: row.sku || '',
      unit_of_measure: row.unit_of_measure || '',
      is_active: row.is_active,
    }))
    .filter((row) => row.name)
}

const buildPriceListItemsMap = (rows = []) => {
  return (rows || []).reduce((acc, row) => {
    const productId = row?.catalog_product_id
    if (!productId) return acc

    const key = String(productId)
    if (!acc[key]) acc[key] = []

    acc[key].push({
      unit_price: parseNumber(row?.unit_price, NaN),
      min_qty: row?.min_qty === null || row?.min_qty === undefined ? null : Number(row.min_qty),
      max_qty: row?.max_qty === null || row?.max_qty === undefined ? null : Number(row.max_qty),
    })

    return acc
  }, {})
}

const resolvePriceForProduct = (priceListMap, catalogProductId, quantityValue = 1) => {
  const priceRows = priceListMap?.[String(catalogProductId)] || []
  if (!priceRows.length) return null

  const quantity = parseNumber(quantityValue, 1)

  const match = priceRows.find((row) => {
    const withinMin = row.min_qty === null || quantity >= row.min_qty
    const withinMax = row.max_qty === null || quantity <= row.max_qty
    return withinMin && withinMax
  })

  const fallbackRow = match || priceRows[0]
  if (!fallbackRow || Number.isNaN(fallbackRow.unit_price)) return null

  return Number(fallbackRow.unit_price)
}

const getLineTotal = (item) => {
  const quantity = parseNumber(item.quantity, 0)
  const unitPrice = parseNumber(item.unit_price, 0)

  return Number((quantity * unitPrice).toFixed(2))
}

const normalizeQuotationToForm = (quotation = {}, items = []) => {
  const normalizedItems = (items || []).length
    ? items.map((item) => ({
      row_key: `${Date.now()}-${Math.random()}`,
      catalog_product_id:
          item.catalog_product_id !== null && item.catalog_product_id !== undefined
            ? String(item.catalog_product_id)
            : '',
      product_name: item.product || item.catalog_product_name || '',
      description: item.description || '',
      quantity: item.quantity !== null && item.quantity !== undefined ? String(item.quantity) : '1',
      unit_price: item.price !== null && item.price !== undefined ? String(item.price) : '',
    }))
    : [createEmptyLineItem()]

  return {
    form: {
      customer_id:
          quotation.customer_id !== null && quotation.customer_id !== undefined
            ? String(quotation.customer_id)
            : '',
      deal_id: quotation.deal_id !== null && quotation.deal_id !== undefined ? String(quotation.deal_id) : '',
      price_list_id:
          quotation.price_list_id !== null && quotation.price_list_id !== undefined
            ? String(quotation.price_list_id)
            : '',
      currency_code: quotation.currency_code || '',
      reference: quotation.reference || '',
      comments: quotation.quotation_for || '',
      valid_until: formatDateInput(quotation.valid_until),
      status: quotation.status || 'Draft',
      discount_amount:
          quotation.discount_amount !== null && quotation.discount_amount !== undefined
            ? String(quotation.discount_amount)
            : '',
      tax_amount:
          quotation.tax_amount !== null && quotation.tax_amount !== undefined
            ? String(quotation.tax_amount)
            : '',
      notes: quotation.terms || '',
    },
    items: normalizedItems,
  }
}

const buildPayload = (form, items) => {
  const payload = {
    customer_id: Number(form.customer_id),
    reference: String(form.reference || '').trim() || undefined,
    quotation_for: String(form.comments || '').trim() || undefined,
    status: form.status || 'Draft',
    terms: String(form.notes || '').trim() || undefined,
    discount_amount: parseNumber(form.discount_amount, 0),
    tax_amount: parseNumber(form.tax_amount, 0),
    items: items.map((item, index) => ({
      catalog_product_id: item.catalog_product_id ? Number(item.catalog_product_id) : undefined,
      product: item.product_name?.trim() || `Item ${index + 1}`,
      description: item.description?.trim() || undefined,
      quantity: parseNumber(item.quantity, 0),
      unit_price: parseNumber(item.unit_price, 0),
    })),
  }

  if (form.deal_id) payload.deal_id = Number(form.deal_id)
  if (form.price_list_id) payload.price_list_id = Number(form.price_list_id)
  if (form.currency_code) payload.currency_code = String(form.currency_code).trim().toUpperCase()
  if (form.valid_until) payload.valid_until = form.valid_until

  return payload
}

const validateForm = (form, items) => {
  const nextErrors = {}

  if (!form.customer_id) nextErrors.customer_id = 'Customer is required'

  if (!items.length) {
    nextErrors.items = 'At least one line item is required'
  }

  items.forEach((item, index) => {
    const quantity = parseNumber(item.quantity, NaN)
    const unitPrice = parseNumber(item.unit_price, NaN)

    if (!item.catalog_product_id && !String(item.product_name || '').trim()) {
      nextErrors[`item_${index}_product`] = 'Product is required'
    }

    if (Number.isNaN(quantity) || quantity <= 0) {
      nextErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0'
    }

    if (Number.isNaN(unitPrice) || unitPrice < 0) {
      nextErrors[`item_${index}_unit_price`] = 'Unit price must be 0 or more'
    }
  })

  return nextErrors
}

export default function QuotationFormPage(props) {
  const { mode: modeProp, quotationId: quotationIdProp, onClose } = props

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search])

  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext)

  const quotationId = quotationIdProp || params?.quotationId
  const prefillCustomerId = queryParams.get('customer_id')
  const prefillDealId = queryParams.get('deal_id')
  const resolvedMode = modeProp || (queryParams.get('mode') === 'edit' ? 'edit' : quotationId ? 'edit' : 'create')
  const isEditMode = resolvedMode === 'edit'

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')

  const [customers, setCustomers] = useState([])
  const [deals, setDeals] = useState([])
  const [products, setProducts] = useState([])
  const [priceLists, setPriceLists] = useState([])
  const [priceListItemsMap, setPriceListItemsMap] = useState({})
  const [lineWarnings, setLineWarnings] = useState({})

  const [form, setForm] = useState(DEFAULT_FORM)
  const [items, setItems] = useState([createEmptyLineItem()])
  const [errors, setErrors] = useState({})

  const subtotalAmount = useMemo(() => {
    return Number(
      items
        .reduce((sum, item) => {
          return sum + getLineTotal(item)
        }, 0)
        .toFixed(2),
    )
  }, [items])

  const discountAmount = useMemo(() => parseNumber(form.discount_amount, 0), [form.discount_amount])
  const taxAmount = useMemo(() => parseNumber(form.tax_amount, 0), [form.tax_amount])
  const totalAmount = useMemo(() => {
    return Number((subtotalAmount - discountAmount + taxAmount).toFixed(2))
  }, [subtotalAmount, discountAmount, taxAmount])
  const totalQuantity = useMemo(() => {
    return items.reduce((sum, item) => sum + parseNumber(item.quantity, 0), 0)
  }, [items])

  const handleBack = () => {
    if (onClose) {
      onClose()
      return
    }

    if (quotationId) {
      navigate(`/crm/quotation/${quotationId}`)
      return
    }

    navigate('/crm/quotation')
  }

  const setItemWarning = (rowKey, message = '') => {
    setLineWarnings((prev) => {
      const next = { ...prev }
      if (message) {
        next[rowKey] = message
      } else {
        delete next[rowKey]
      }
      return next
    })
  }

  const loadLookups = async () => {
    const [customersResult, dealsResult, catalogProductsResult, priceListsResult] =
      await Promise.allSettled([
        quotationsApi.listCustomers(),
        quotationsApi.listDeals({ pageCount: 0, numPerPage: 500 }),
        quotationsApi.listCatalogProducts({ pageCount: 0, numPerPage: 1000, is_active: 1 }),
        quotationsApi.listPriceLists({ pageCount: 0, numPerPage: 500, is_active: 1 }),
      ])

    if (customersResult.status === 'fulfilled') {
      setCustomers(customersResult.value?.data || [])
    }

    if (dealsResult.status === 'fulfilled') {
      setDeals(dealsResult.value?.data?.data || [])
    }

    const catalogProducts =
      catalogProductsResult.status === 'fulfilled' &&
      Array.isArray(catalogProductsResult.value?.data?.data)
        ? catalogProductsResult.value.data.data
        : []

    const fetchedPriceLists =
      priceListsResult.status === 'fulfilled' &&
      Array.isArray(priceListsResult.value?.data?.data)
        ? priceListsResult.value.data.data
        : []

    setProducts(normalizeCatalogProducts(catalogProducts))
    setPriceLists(fetchedPriceLists)

    const failedLookups = [
      customersResult,
      dealsResult,
      catalogProductsResult,
      priceListsResult,
    ].filter((result) => result.status === 'rejected')

    if (failedLookups.length) {
      setApiError('Some quotation lookup data could not be loaded. Please refresh and try again.')
    } else {
      setApiError('')
    }
  }

  const loadPriceListItems = async (priceListId) => {
    if (!priceListId) {
      setPriceListItemsMap({})
      return
    }

    try {
      const response = await quotationsApi.listPriceListItems(priceListId)
      const rows = Array.isArray(response?.data) ? response.data : []
      setPriceListItemsMap(buildPriceListItemsMap(rows))
    } catch (error) {
      setPriceListItemsMap({})
      dispatch(
        OpenalertActions({
          msg: getErrorMessage(error, 'Unable to load selected price list items'),
          severity: 'warning',
        }),
      )
    }
  }

  const loadQuotationById = async () => {
    if (!isEditMode || !quotationId) return

    setLoading(true)
    setApiError('')
    ListLoad(setModalTypeHandler, setLoaderStatusHandler)

    try {
      const response = await quotationsApi.getQuotation(quotationId)
      const quotation = response?.data?.quotation || {}
      const quotationItems = response?.data?.items || []

      const normalized = normalizeQuotationToForm(quotation, quotationItems)
      setForm(normalized.form)
      setItems(normalized.items)
    } catch (error) {
      setApiError(getErrorMessage(error, 'Unable to load quotation details'))
    } finally {
      setLoading(false)
      FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    }
  }

  useEffect(() => {
    loadLookups()
  }, [])

  useEffect(() => {
    loadQuotationById()
  }, [isEditMode, quotationId])

  useEffect(() => {
    if (isEditMode) return
    if (!prefillDealId) return

    setForm((prev) => ({
      ...prev,
      deal_id: String(prefillDealId),
    }))
  }, [isEditMode, prefillDealId])

  useEffect(() => {
    if (isEditMode) return
    if (!prefillCustomerId) return

    setForm((prev) => ({
      ...prev,
      customer_id: String(prefillCustomerId),
    }))
  }, [isEditMode, prefillCustomerId])

  useEffect(() => {
    if (isEditMode) return
    if (!form.deal_id || form.customer_id) return

    const selectedDeal = deals.find((deal) => String(deal?.deal_id) === String(form.deal_id))
    if (!selectedDeal?.customer_id) return

    setForm((prev) => ({
      ...prev,
      customer_id: String(selectedDeal.customer_id),
    }))
  }, [isEditMode, form.deal_id, form.customer_id, deals])

  useEffect(() => {
    if (!form.price_list_id) {
      setPriceListItemsMap({})
      setLineWarnings({})
      return
    }

    const selectedPriceList = priceLists.find(
      (priceList) => String(priceList?.price_list_id) === String(form.price_list_id),
    )

    if (selectedPriceList?.currency_code) {
      setForm((prev) => ({
        ...prev,
        currency_code: String(selectedPriceList.currency_code || '').toUpperCase(),
      }))
    }

    loadPriceListItems(form.price_list_id)
  }, [form.price_list_id, priceLists])

  useEffect(() => {
    if (!form.price_list_id) return

    setItems((prev) =>
      prev.map((item) => {
        if (!item.catalog_product_id) return item

        const autoPrice = resolvePriceForProduct(
          priceListItemsMap,
          item.catalog_product_id,
          item.quantity,
        )

        if (autoPrice === null) return item
        if (String(item.unit_price || '').trim() !== '') return item

        return {
          ...item,
          unit_price: String(autoPrice),
        }
      }),
    )

    setLineWarnings((prev) => {
      const next = { ...prev }

      items.forEach((item) => {
        if (!item.catalog_product_id) {
          delete next[item.row_key]
          return
        }

        const autoPrice = resolvePriceForProduct(
          priceListItemsMap,
          item.catalog_product_id,
          item.quantity,
        )

        if (autoPrice === null) {
          next[item.row_key] =
            'No price found for selected product in this price list. Enter price manually.'
        } else {
          delete next[item.row_key]
        }
      })

      return next
    })
  }, [priceListItemsMap])

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))

    setErrors((prev) => {
      if (!prev[field]) return prev
      const nextErrors = { ...prev }
      delete nextErrors[field]
      return nextErrors
    })
  }

  const handleItemFieldChange = (index, field, value) => {
    const currentItem = items[index]

    if (field === 'quantity' && currentItem?.catalog_product_id && form.price_list_id) {
      const autoPrice = resolvePriceForProduct(
        priceListItemsMap,
        currentItem.catalog_product_id,
        value,
      )

      if (autoPrice === null) {
        setItemWarning(
          currentItem.row_key,
          'No price found for selected product in this price list. Enter price manually.',
        )
      } else {
        setItemWarning(currentItem.row_key, '')
      }
    }

    setItems((prev) => {
      const nextItems = [...prev]
      const existing = nextItems[index]

      let nextUnitPrice = existing.unit_price
      if (
        field === 'quantity' &&
        form.price_list_id &&
        existing.catalog_product_id &&
        String(existing.unit_price || '').trim() === ''
      ) {
        const autoPrice = resolvePriceForProduct(
          priceListItemsMap,
          existing.catalog_product_id,
          value,
        )

        if (autoPrice !== null) {
          nextUnitPrice = String(autoPrice)
        }
      }

      nextItems[index] = {
        ...existing,
        [field]: value,
        unit_price: nextUnitPrice,
      }
      return nextItems
    })

    setErrors((prev) => {
      const nextErrors = { ...prev }
      delete nextErrors[`item_${index}_${field}`]
      return nextErrors
    })
  }

  const handleProductSelect = (index, productOption) => {
    const currentItem = items[index]
    const autoPrice =
      productOption?.catalog_product_id && form.price_list_id
        ? resolvePriceForProduct(
            priceListItemsMap,
            productOption.catalog_product_id,
            currentItem?.quantity,
          )
        : null

    if (currentItem?.row_key) {
      if (productOption?.catalog_product_id && form.price_list_id && autoPrice === null) {
        const warningMessage =
          'No price found for selected product in this price list. Enter price manually.'
        setItemWarning(currentItem.row_key, warningMessage)
        dispatch(
          OpenalertActions({
            msg: warningMessage,
            severity: 'warning',
          }),
        )
      } else {
        setItemWarning(currentItem.row_key, '')
      }
    }

    setItems((prev) => {
      const nextItems = [...prev]
      const existing = nextItems[index]
      const normalizedExistingPrice = parseNumber(existing.unit_price, 0)

      let nextUnitPrice = existing.unit_price
      if (autoPrice !== null) {
        nextUnitPrice = String(autoPrice)
      } else if (normalizedExistingPrice > 0 && !form.price_list_id) {
        nextUnitPrice = existing.unit_price
      }

      nextItems[index] = {
        ...existing,
        catalog_product_id: productOption?.catalog_product_id
          ? String(productOption.catalog_product_id)
          : '',
        product_name: productOption?.name || existing.product_name,
        unit_price: nextUnitPrice,
      }

      return nextItems
    })

    setErrors((prev) => {
      const nextErrors = { ...prev }
      delete nextErrors[`item_${index}_product`]
      return nextErrors
    })
  }

  const addLineItem = () => {
    setItems((prev) => [...prev, createEmptyLineItem()])
  }

  const removeLineItem = (index) => {
    if (items.length === 1) return

    const item = items[index]
    if (item?.row_key) {
      setItemWarning(item.row_key, '')
    }

    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
  }

  const handleSubmit = async () => {
    const validationErrors = validateForm(form, items)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const payload = buildPayload(form, items)

    setSaving(true)
    setApiError('')

    try {
      const response = isEditMode && quotationId
        ? await quotationsApi.updateQuotation(quotationId, payload)
        : await quotationsApi.createQuotation(payload)

      const savedQuotationId =
        response?.data?.quotation?.quotation_id ||
        response?.data?.quotation_id ||
        quotationId

      dispatch(
        OpenalertActions({
          msg: isEditMode ? 'Quotation updated' : 'Quotation created',
          severity: 'success',
        }),
      )

      if (savedQuotationId) {
        navigate(`/crm/quotation/${savedQuotationId}`)
      } else {
        navigate('/crm/quotation')
      }
    } catch (error) {
      setApiError(getErrorMessage(error, 'Unable to save quotation'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems='center'>
          <Grid
            size={{
              xs: 12,
              md: 8
            }}>
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              {isEditMode ? 'Edit Quotation' : 'Create Quotation'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {isEditMode
                ? `Quotation ID: ${quotationId || '-'}`
                : `Quotation Date: ${new Date().toLocaleDateString()}`}
            </Typography>
          </Grid>
          <Grid
            sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}
            size={{
              xs: 12,
              md: 4
            }}>
            <Button startIcon={<ArrowBackIcon />} onClick={handleBack} color='inherit'>
              Back
            </Button>
          </Grid>
        </Grid>
      </Card>
      {(apiError || loading) ? (
        <Card sx={{ p: 2, mb: 2 }}>
          {loading ? <Typography>Loading quotation...</Typography> : null}
          {apiError ? <Typography color='error'>{apiError}</Typography> : null}
        </Card>
      ) : null}
      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              md: 4
            }}>
            <TextField
              select
              label='Customer'
              value={form.customer_id}
              onChange={(event) => handleFieldChange('customer_id', event.target.value)}
              fullWidth
              variant='outlined'
              error={Boolean(errors.customer_id)}
              helperText={errors.customer_id || ''}
            >
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
              md: 4
            }}>
            <TextField
              select
              label='Deal (Optional)'
              value={form.deal_id}
              onChange={(event) => handleFieldChange('deal_id', event.target.value)}
              fullWidth
              variant='outlined'
            >
              <MenuItem value=''>None</MenuItem>
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
              md: 4
            }}>
            <TextField
              select
              label='Price List (Optional)'
              value={form.price_list_id}
              onChange={(event) => handleFieldChange('price_list_id', event.target.value)}
              fullWidth
              variant='outlined'
            >
              <MenuItem value=''>None</MenuItem>
              {priceLists.map((priceList) => (
                <MenuItem key={priceList.price_list_id} value={priceList.price_list_id}>
                  {priceList.name}
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
              label='Currency Code'
              value={form.currency_code}
              onChange={(event) => handleFieldChange('currency_code', event.target.value.toUpperCase())}
              fullWidth
              variant='outlined'
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 3
            }}>
            <TextField
              type='date'
              label='Valid Until'
              value={form.valid_until}
              onChange={(event) => handleFieldChange('valid_until', event.target.value)}
              fullWidth
              variant='outlined'
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 3
            }}>
            <TextField
              select
              label='Status'
              value={form.status}
              onChange={(event) => handleFieldChange('status', event.target.value)}
              fullWidth
              variant='outlined'
            >
              {STATUS_OPTIONS.map((statusOption) => (
                <MenuItem key={statusOption} value={statusOption}>
                  {statusOption}
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
              label='Reference'
              value={form.reference}
              onChange={(event) => handleFieldChange('reference', event.target.value)}
              fullWidth
              variant='outlined'
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 3
            }}>
            <TextField
              label='Comments'
              value={form.comments}
              onChange={(event) => handleFieldChange('comments', event.target.value)}
              fullWidth
              variant='outlined'
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 3
            }}>
            <TextField
              type='number'
              label='Discount Amount'
              value={form.discount_amount}
              onChange={(event) => handleFieldChange('discount_amount', event.target.value)}
              fullWidth
              variant='outlined'
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 3
            }}>
            <TextField
              type='number'
              label='Tax Amount'
              value={form.tax_amount}
              onChange={(event) => handleFieldChange('tax_amount', event.target.value)}
              fullWidth
              variant='outlined'
            />
          </Grid>
        </Grid>
      </Card>
      <Card sx={{ mb: 2 }}>
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant='h6'>Sales Items</Typography>
          <Button variant='outlined' startIcon={<AddIcon />} onClick={addLineItem}>
            Add Item
          </Button>
        </Box>

        {errors.items ? (
          <Typography color='error' sx={{ px: 2, pt: 2 }}>
            {errors.items}
          </Typography>
        ) : null}

        {items.map((item, index) => {
          const selectedProduct =
            products.find((product) => {
              if (item.catalog_product_id) {
                return String(product.catalog_product_id || '') === String(item.catalog_product_id)
              }
              return String(product.name || '') === String(item.product_name || '')
            }) || null

          return (
            <Box key={item.row_key} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Grid container spacing={2} alignItems='center'>
                <Grid
                  size={{
                    xs: 12,
                    md: 4
                  }}>
                  <Autocomplete
                    options={products}
                    value={selectedProduct}
                    onChange={(_, value) => handleProductSelect(index, value)}
                    getOptionLabel={(option) => {
                      if (typeof option === 'string') return option
                      if (!option) return ''
                      return option?.sku ? `${option.name} (${option.sku})` : option.name || ''
                    }}
                    isOptionEqualToValue={(option, value) => {
                      return String(option?.option_key || '') === String(value?.option_key || '')
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label='Catalog Product'
                        variant='outlined'
                        error={Boolean(errors[`item_${index}_product`])}
                        helperText={errors[`item_${index}_product`] || ''}
                      />
                    )}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    md: 2
                  }}>
                  <TextField
                    label='Display Name'
                    value={item.product_name}
                    onChange={(event) => handleItemFieldChange(index, 'product_name', event.target.value)}
                    fullWidth
                    variant='outlined'
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    md: 1
                  }}>
                  <TextField
                    label='Quantity'
                    type='number'
                    value={item.quantity}
                    onChange={(event) => handleItemFieldChange(index, 'quantity', event.target.value)}
                    fullWidth
                    variant='outlined'
                    error={Boolean(errors[`item_${index}_quantity`])}
                    helperText={errors[`item_${index}_quantity`] || ''}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    md: 2
                  }}>
                  <TextField
                    label='Unit Price'
                    type='number'
                    value={item.unit_price}
                    onChange={(event) => handleItemFieldChange(index, 'unit_price', event.target.value)}
                    fullWidth
                    variant='outlined'
                    error={Boolean(errors[`item_${index}_unit_price`])}
                    helperText={errors[`item_${index}_unit_price`] || ''}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    md: 2
                  }}>
                  <TextField
                    label='Line Total'
                    value={getLineTotal(item)}
                    fullWidth
                    variant='outlined'
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    md: 1
                  }}>
                  <IconButton
                    onClick={() => removeLineItem(index)}
                    disabled={items.length === 1}
                    color='error'
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>

                <Grid size={12}>
                  <TextField
                    label='Description'
                    value={item.description}
                    onChange={(event) => handleItemFieldChange(index, 'description', event.target.value)}
                    fullWidth
                    variant='outlined'
                    multiline
                    minRows={2}
                  />
                </Grid>

                {lineWarnings[item.row_key] ? (
                  <Grid size={12}>
                    <Typography color='warning.main'>{lineWarnings[item.row_key]}</Typography>
                  </Grid>
                ) : null}
              </Grid>
              {index < items.length - 1 ? <Divider sx={{ mt: 2 }} /> : null}
            </Box>
          );
        })}

        {!products.length ? (
          <Typography color='text.secondary' sx={{ px: 2, pb: 2 }}>
            No catalog products found. Create products in CRM Catalog (`/crm/catalog/products`).
          </Typography>
        ) : null}

        <Box sx={{ px: 2, pb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Typography variant='body2' color='text.secondary'>
            Total Quantity: {totalQuantity}
          </Typography>
        </Box>
      </Card>
      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              md: 7
            }}>
            <TextField
              label='Notes'
              value={form.notes}
              onChange={(event) => handleFieldChange('notes', event.target.value)}
              fullWidth
              multiline
              minRows={6}
              variant='outlined'
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 5
            }}>
            <Card variant='outlined' sx={{ p: 2, bgcolor: 'action.hover' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color='text.secondary'>Subtotal</Typography>
                <Typography>{subtotalAmount}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color='text.secondary'>Discount</Typography>
                <Typography>{discountAmount}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color='text.secondary'>Tax</Typography>
                <Typography>{taxAmount}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 700 }}>Total</Typography>
                <Typography sx={{ fontWeight: 700 }}>{totalAmount}</Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Card>
      <Card sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={handleBack} color='inherit' disabled={saving}>
            Cancel
          </Button>
          <Button variant='contained' startIcon={<SaveIcon />} onClick={handleSubmit} disabled={saving}>
            {isEditMode ? 'Update Quotation' : 'Create Quotation'}
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
