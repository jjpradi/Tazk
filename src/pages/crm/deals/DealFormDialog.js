import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
} from '@mui/material'
import dealsApi from './dealsApi'

const DEFAULT_FORM = {
  pipeline_id: '',
  stage_id: '',
  name: '',
  owner_employee_id: '',
  amount: '',
  currency_code: 'USD',
  expected_close_date: '',
  probability_pct: '',
  status: 'open',
  lead_ref_table: '',
  lead_ref_id: '',
}

const getErrorMessage = (error, fallbackMessage) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.ERROR ||
    error?.message ||
    fallbackMessage
  )
}

const buildPayload = (form) => {
  const payload = {
    pipeline_id: Number(form.pipeline_id),
    stage_id: Number(form.stage_id),
    name: form.name.trim(),
    owner_employee_id: Number(form.owner_employee_id),
    status: form.status,
  }

  if (form.amount !== '') payload.amount = Number(form.amount)
  if (form.currency_code.trim()) payload.currency_code = form.currency_code.trim().toUpperCase()
  if (form.expected_close_date) payload.expected_close_date = form.expected_close_date
  if (form.probability_pct !== '') payload.probability_pct = Number(form.probability_pct)
  if (form.lead_ref_table) payload.lead_ref_table = form.lead_ref_table
  if (form.lead_ref_id !== '') payload.lead_ref_id = Number(form.lead_ref_id)

  return payload
}

const validateForm = (form) => {
  const nextErrors = {}

  if (!form.pipeline_id) nextErrors.pipeline_id = 'Pipeline is required'
  if (!form.stage_id) nextErrors.stage_id = 'Stage is required'
  if (!form.name.trim()) nextErrors.name = 'Deal name is required'
  if (!form.owner_employee_id) nextErrors.owner_employee_id = 'Owner is required'
  if (!form.status) nextErrors.status = 'Status is required'

  if (form.amount !== '' && Number.isNaN(Number(form.amount))) {
    nextErrors.amount = 'Amount must be a number'
  }

  if (
    form.probability_pct !== '' &&
    (Number.isNaN(Number(form.probability_pct)) ||
      Number(form.probability_pct) < 0 ||
      Number(form.probability_pct) > 100)
  ) {
    nextErrors.probability_pct = 'Probability must be between 0 and 100'
  }

  return nextErrors
}

const normalizeDealToForm = (deal = {}, mode = 'create') => {
  const name = deal.name || deal.title || ''

  return {
    ...DEFAULT_FORM,
    pipeline_id:
      deal.pipeline_id !== undefined && deal.pipeline_id !== null
        ? String(deal.pipeline_id)
        : '',
    stage_id:
      deal.stage_id !== undefined && deal.stage_id !== null
        ? String(deal.stage_id)
        : '',
    name,
    owner_employee_id:
      deal.owner_employee_id !== undefined && deal.owner_employee_id !== null
        ? String(deal.owner_employee_id)
        : '',
    amount:
      deal.amount !== undefined && deal.amount !== null && deal.amount !== ''
        ? String(deal.amount)
        : '',
    currency_code: deal.currency_code || 'USD',
    expected_close_date: deal.expected_close_date || '',
    probability_pct:
      deal.probability_pct !== undefined && deal.probability_pct !== null && deal.probability_pct !== ''
        ? String(deal.probability_pct)
        : '',
    status: deal.status || 'open',
    lead_ref_table:
      mode === 'create' && deal.lead_ref_table ? String(deal.lead_ref_table) : '',
    lead_ref_id:
      mode === 'create' && deal.lead_ref_id !== undefined && deal.lead_ref_id !== null
        ? String(deal.lead_ref_id)
        : '',
  }
}

const statusOptions = ['open', 'won', 'lost', 'closed']

function DealFormDialog(props) {
  const { open, mode, deal, pipelines, owners, onClose, onSaved } = props

  const [form, setForm] = useState(DEFAULT_FORM)
  const [stages, setStages] = useState([])
  const [loadingStages, setLoadingStages] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    if (!open) return

    const normalized = normalizeDealToForm(deal, mode)
    const fallbackPipelineId = normalized.pipeline_id || (pipelines[0]?.pipeline_id ? String(pipelines[0].pipeline_id) : '')

    setForm({
      ...normalized,
      pipeline_id: fallbackPipelineId,
    })
    setErrors({})
    setApiError('')
  }, [open, deal, mode, pipelines])

  useEffect(() => { (async () => {
    if (!open || !form.pipeline_id) {
      setStages([])
      return
    }

    const loadStages = async () => {
      setLoadingStages(true)
      try {
        const response = await dealsApi.listPipelineStages(form.pipeline_id)
        const stageRows = response?.data || []
        setStages(stageRows)

        setForm((prev) => {
          const stageExists = stageRows.some((row) => String(row.stage_id) === String(prev.stage_id))
          if (stageExists) return prev

          return {
            ...prev,
            stage_id: stageRows[0]?.stage_id ? String(stageRows[0].stage_id) : '',
          }
        })
      } catch (error) {
        setApiError(getErrorMessage(error, 'Unable to load stages'))
      } finally {
        setLoadingStages(false)
      }
    }

    loadStages()
  })();
}, [open, form.pipeline_id])

  const ownerOptions = useMemo(() => owners || [], [owners])

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

  const handleSubmit = async () => {
    const validationErrors = validateForm(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    setApiError('')

    try {
      const payload = buildPayload(form)
      const response =
        mode === 'edit' && deal?.deal_id
          ? await dealsApi.updateDeal(deal.deal_id, payload)
          : await dealsApi.createDeal(payload)

      onSaved(response?.data)
    } catch (error) {
      setApiError(getErrorMessage(error, 'Unable to save deal'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>{mode === 'edit' ? 'Edit Deal' : 'Create Deal'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          <Grid
            size={{
              xs: 12,
              md: 6
            }}>
            <TextField
              select
              label='Pipeline'
              value={form.pipeline_id}
              onChange={(event) => handleFieldChange('pipeline_id', event.target.value)}
              error={Boolean(errors.pipeline_id)}
              helperText={errors.pipeline_id || ''}
              fullWidth
              variant='filled'
            >
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
              md: 6
            }}>
            <TextField
              select
              label='Stage'
              value={form.stage_id}
              onChange={(event) => handleFieldChange('stage_id', event.target.value)}
              error={Boolean(errors.stage_id)}
              helperText={errors.stage_id || ''}
              fullWidth
              variant='filled'
              disabled={!form.pipeline_id || loadingStages}
            >
              {stages.map((stage) => (
                <MenuItem key={stage.stage_id} value={stage.stage_id}>
                  {stage.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 6
            }}>
            <TextField
              label='Deal Name'
              value={form.name}
              onChange={(event) => handleFieldChange('name', event.target.value)}
              error={Boolean(errors.name)}
              helperText={errors.name || ''}
              fullWidth
              variant='filled'
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 6
            }}>
            <TextField
              select
              label='Owner'
              value={form.owner_employee_id}
              onChange={(event) => handleFieldChange('owner_employee_id', event.target.value)}
              error={Boolean(errors.owner_employee_id)}
              helperText={errors.owner_employee_id || ''}
              fullWidth
              variant='filled'
            >
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
              md: 6
            }}>
            <TextField
              label='Amount'
              type='number'
              value={form.amount}
              onChange={(event) => handleFieldChange('amount', event.target.value)}
              error={Boolean(errors.amount)}
              helperText={errors.amount || ''}
              fullWidth
              variant='filled'
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 6
            }}>
            <TextField
              label='Currency Code'
              value={form.currency_code}
              onChange={(event) => handleFieldChange('currency_code', event.target.value)}
              fullWidth
              variant='filled'
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 6
            }}>
            <TextField
              label='Expected Close Date'
              type='date'
              value={form.expected_close_date}
              onChange={(event) => handleFieldChange('expected_close_date', event.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              variant='filled'
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 6
            }}>
            <TextField
              label='Probability %'
              type='number'
              value={form.probability_pct}
              onChange={(event) => handleFieldChange('probability_pct', event.target.value)}
              error={Boolean(errors.probability_pct)}
              helperText={errors.probability_pct || ''}
              fullWidth
              variant='filled'
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 6
            }}>
            <TextField
              select
              label='Status'
              value={form.status}
              onChange={(event) => handleFieldChange('status', event.target.value)}
              error={Boolean(errors.status)}
              helperText={errors.status || ''}
              fullWidth
              variant='filled'
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {apiError ? (
            <Grid size={12}>
              <TextField
                value={apiError}
                fullWidth
                variant='filled'
                color='error'
                InputProps={{ readOnly: true }}
              />
            </Grid>
          ) : null}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='inherit' disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant='contained' disabled={saving || loadingStages}>
          {mode === 'edit' ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DealFormDialog
