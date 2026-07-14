import { Card, Grid, Typography } from '@mui/material'
import moment from 'moment'

function renderAmount(amount, currencyCode) {
  if (amount === null || amount === undefined || amount === '') return '-'

  const numericAmount = Number(amount)
  if (Number.isNaN(numericAmount)) return amount

  const formattedAmount = numericAmount.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })

  return currencyCode ? `${currencyCode} ${formattedAmount}` : formattedAmount
}

function formatDate(dateValue) {
  if (!dateValue) return '-'
  const parsedDate = moment(dateValue)
  return parsedDate.isValid() ? parsedDate.format('DD/MM/YYYY') : dateValue
}

export default function LeadDealSummaryCard(props) {
  const { dealSummary } = props

  if (!dealSummary?.deal) return null

  const { deal } = dealSummary

  return (
    <Card sx={{ p: 2, mb: 2 }}>
      <Typography variant='h6' sx={{ mb: 2 }}>
        Deal Summary
      </Typography>
      <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <Typography color='text.secondary'>Deal</Typography>
          <Typography>{deal.name || '-'}</Typography>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <Typography color='text.secondary'>Pipeline</Typography>
          <Typography>{deal.pipeline_name || '-'}</Typography>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <Typography color='text.secondary'>Stage</Typography>
          <Typography>{deal.stage_name || '-'}</Typography>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <Typography color='text.secondary'>Status</Typography>
          <Typography>{deal.status || '-'}</Typography>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <Typography color='text.secondary'>Amount</Typography>
          <Typography>{renderAmount(deal.amount, deal.currency_code)}</Typography>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <Typography color='text.secondary'>Expected Close</Typography>
          <Typography>{formatDate(deal.expected_close_date)}</Typography>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <Typography color='text.secondary'>Owner</Typography>
          <Typography>{deal.owner_full_name || '-'}</Typography>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3
          }}>
          <Typography color='text.secondary'>Converted At</Typography>
          <Typography>{formatDate(dealSummary.converted_at)}</Typography>
        </Grid>
      </Grid>
    </Card>
  );
}
