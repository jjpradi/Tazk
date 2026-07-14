import { Box, Button, Card, CircularProgress, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import leadHubApi from './leadHubApi'

const getErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.message ||
  error?.response?.data?.ERROR ||
  error?.message ||
  fallbackMessage

const normalizeNextPath = (rawValue) => {
  if (!rawValue || typeof rawValue !== 'string') return '/crm/deals'

  const trimmed = rawValue.trim()
  if (!trimmed) return '/crm/deals'

  if (trimmed.startsWith('/')) return trimmed
  return `/${trimmed}`
}

const buildRedirectPath = (nextPath, dealId, leadId) => {
  const normalizedNext = normalizeNextPath(nextPath)

  if (normalizedNext === '/crm/quotations/new' || normalizedNext === '/crm/quotation/new') {
    const query = new URLSearchParams()
    if (dealId) query.set('deal_id', String(dealId))
    if (leadId) query.set('lead_id', String(leadId))
    return `/crm/quotation/new${query.toString() ? `?${query.toString()}` : ''}`
  }

  if (normalizedNext === '/crm/deals' || normalizedNext.startsWith('/crm/deals/')) {
    if (dealId) return `/crm/deals/${encodeURIComponent(String(dealId))}`
    return '/crm/deals'
  }

  return normalizedNext
}

export default function LeadConvertPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { lead_id: leadIdParam } = useParams()

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const nextPath = normalizeNextPath(queryParams.get('next'))
  const leadId = leadIdParam ? Number(leadIdParam) : null

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const redirectToNext = (dealIdValue) => {
    navigate(buildRedirectPath(nextPath, dealIdValue, leadIdParam), { replace: true })
  }

  const loadLeadSummary = async () => {
    if (!leadId) {
      setLoading(false)
      setErrorMessage('Invalid lead_id')
      return
    }

    setLoading(true)
    setErrorMessage('')

    try {
      const response = await leadHubApi.getLeadDealSummary(leadId)
      const summary = response?.data || null
      const convertedDealId = summary?.converted_deal_id || summary?.deal?.deal_id

      if (convertedDealId) {
        redirectToNext(convertedDealId)
        return
      }
    } catch (error) {
      if (error?.response?.status === 404) {
        setErrorMessage('Lead not found')
      } else {
        setErrorMessage(getErrorMessage(error, 'Unable to validate lead conversion status'))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeadSummary()
  }, [leadIdParam, nextPath])

  const handleConvert = async () => {
    if (!leadId || submitting) return

    setSubmitting(true)
    setErrorMessage('')

    try {
      const response = await leadHubApi.convertLeadToDeal(leadId)
      const responseData = response?.data || {}
      const convertedDealId =
        responseData?.deal_id ||
        responseData?.converted_deal_id ||
        responseData?.deal?.deal_id

      if (!convertedDealId) {
        setErrorMessage('Conversion succeeded but deal id was not returned')
        return
      }

      redirectToNext(convertedDealId)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Unable to convert lead to deal'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 12 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', mt: 4, px: 2 }}>
      <Card sx={{ p: 3 }}>
        <Typography variant='h5' sx={{ mb: 1 }}>
          Convert Lead to Deal
        </Typography>
        <Typography color='text.secondary' sx={{ mb: 1 }}>
          Lead ID: {leadIdParam || '-'}
        </Typography>
        <Typography color='text.secondary' sx={{ mb: 2 }}>
          Next route: {nextPath}
        </Typography>
        <Typography sx={{ mb: 2 }}>
          Confirm conversion to create a deal and continue to the next page.
        </Typography>

        {errorMessage ? (
          <Typography color='error' sx={{ mb: 2 }}>
            {errorMessage}
          </Typography>
        ) : null}

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button variant='outlined' onClick={() => navigate('/crm/leads')}>
            Back to Leads
          </Button>
          <Button variant='contained' disabled={submitting || !leadId} onClick={handleConvert}>
            {submitting ? 'Converting...' : 'Convert & Continue'}
          </Button>
        </Box>
      </Card>
    </Box>
  )
}
