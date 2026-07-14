import React from 'react';
import { Box, Grid, Typography, Divider, Chip } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

const InfoRow = ({ label, value, masked }) => (
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 500, mb: 0.3 }}>
      {label}
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 400, minHeight: 20 }}>
        {value || '-'}
      </Typography>
      {masked && value && <LockIcon sx={{ fontSize: 12, color: 'text.disabled' }} />}
    </Box>
  </Grid>
);

const SectionTitle = ({ title }) => (
  <Grid size={12}>
    <Typography sx={{ fontSize: 14, fontWeight: 600, mt: 2, mb: 1, color: 'primary.main' }}>
      {title}
    </Typography>
    <Divider />
  </Grid>
);

export default function BankStatutoryTab({ profile }) {
  if (!profile) return null;

  const maskAccount = (val) => {
    if (!val || val.length < 4) return val;
    return '****' + val.slice(-4);
  };

  return (
    <Box>
      <Chip
        label='Bank and statutory details are managed via Employee Creation. This is a read-only view.'
        size='small'
        variant='outlined'
        color='info'
        sx={{ mb: 2, fontSize: 11 }}
      />

      <Grid container spacing={2.5}>
        <SectionTitle title='Bank Details' />
        <InfoRow label='Bank Name' value={profile.bank_name} />
        <InfoRow label='Account Number' value={maskAccount(profile.beneficiary_account_no)} masked />
        <InfoRow label='IFSC Code' value={profile.ifsc_code} />

        <SectionTitle title='Statutory Details' />
        <InfoRow label='UAN Number' value={profile.uan_number} />
        <InfoRow label='ESI Number' value={profile.esi_number} />
        <InfoRow label='PAN Number' value={profile.pan_number} masked />
        <InfoRow label='Aadhar Number' value={profile.aadhar_number ? '****' + String(profile.aadhar_number).slice(-4) : '-'} masked />
      </Grid>
    </Box>
  );
}
