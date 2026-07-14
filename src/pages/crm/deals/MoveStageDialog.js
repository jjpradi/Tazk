import { useEffect, useState } from 'react'
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

const getErrorMessage = (error, fallbackMessage) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.ERROR ||
    error?.message ||
    fallbackMessage
  )
}

function MoveStageDialog(props) {
  const { open, deal, onClose, onMoved } = props

  const [stages, setStages] = useState([])
  const [toStageId, setToStageId] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => { (async () => {
    if (!open || !deal?.pipeline_id) {
      setStages([])
      setToStageId('')
      setNotes('')
      setErrorMessage('')
      return
    }

    const loadStages = async () => {
      setLoading(true)
      setErrorMessage('')

      try {
        const response = await dealsApi.listPipelineStages(deal.pipeline_id)
        const rows = response?.data || []
        setStages(rows)

        const defaultStage = rows.find((stage) => String(stage.stage_id) !== String(deal.stage_id))
        setToStageId(defaultStage ? String(defaultStage.stage_id) : '')
      } catch (error) {
        setErrorMessage(getErrorMessage(error, 'Unable to load stages'))
      } finally {
        setLoading(false)
      }
    }

    loadStages()
  })();
}, [open, deal])

  const handleSubmit = async () => {
    if (!deal?.deal_id || !toStageId) return

    setSaving(true)
    setErrorMessage('')

    try {
      const response = await dealsApi.moveDealStage(deal.deal_id, {
        to_stage_id: Number(toStageId),
        notes: notes.trim() || undefined,
      })

      onMoved(response?.data)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Unable to move stage'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Move Stage</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          <Grid size={12}>
            <TextField
              label='Deal Name'
              value={deal?.name || '-'}
              fullWidth
              variant='filled'
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid size={12}>
            <TextField
              select
              label='To Stage'
              value={toStageId}
              onChange={(event) => setToStageId(event.target.value)}
              fullWidth
              variant='filled'
              disabled={loading}
            >
              {stages
                .filter((stage) => String(stage.stage_id) !== String(deal?.stage_id))
                .map((stage) => (
                  <MenuItem key={stage.stage_id} value={stage.stage_id}>
                    {stage.name}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>

          <Grid size={12}>
            <TextField
              label='Notes'
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              fullWidth
              multiline
              minRows={3}
              variant='filled'
            />
          </Grid>

          {errorMessage ? (
            <Grid size={12}>
              <TextField
                value={errorMessage}
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
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={saving || loading || !toStageId}
        >
          Move
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MoveStageDialog
