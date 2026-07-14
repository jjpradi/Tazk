import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Avatar, Chip,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function ExpiringDocsTab() {
  const { DocumentManagementReducer: { expiringDocuments } } = useSelector((s) => s);
  const docs = expiringDocuments || [];

  const getUrgencyColor = (days) => {
    if (days < 0) return { bg: '#ffebee', color: '#c62828', label: 'Expired' };
    if (days <= 7) return { bg: '#ffebee', color: '#d32f2f', label: 'Critical' };
    if (days <= 15) return { bg: '#fff3e0', color: '#ed6c02', label: 'Warning' };
    return { bg: '#fffde7', color: '#f9a825', label: 'Upcoming' };
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <WarningAmberIcon sx={{ fontSize: 20, color: '#ed6c02' }} />
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
          Expiring & Expired Documents
          {docs.length > 0 && (
            <Chip size='small' label={docs.length}
              sx={{ ml: 1, fontSize: 10, height: 20, bgcolor: '#fff3e0', color: '#ed6c02', fontWeight: 700 }} />
          )}
        </Typography>
      </Box>

      {docs.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            No documents expiring within the next 30 days.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={1.5}>
          {docs.map((doc) => {
            const urg = getUrgencyColor(doc.days_until_expiry);
            return (
              <Grid key={doc.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper
                  elevation={0}
                  sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                    borderLeft: `3px solid ${urg.color}` }}
                >
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1 }}>
                    <Avatar src={doc.image || undefined} sx={{ width: 36, height: 36, bgcolor: 'primary.light' }}>
                      {(doc.employee_name || '?')[0]}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600 }} noWrap>
                        {doc.employee_name} ({doc.employee_code})
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: 'text.secondary' }} noWrap>
                        {doc.document_type_name}{doc.category_name ? ` - ${doc.category_name}` : ''}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      {doc.file_name && (
                        <Typography sx={{ fontSize: 11 }} noWrap>{doc.file_name}</Typography>
                      )}
                      <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                        Expiry: {doc.expiry_date_formatted}
                      </Typography>
                    </Box>
                    <Chip
                      size='small'
                      label={doc.days_until_expiry < 0
                        ? `Expired ${Math.abs(doc.days_until_expiry)}d ago`
                        : doc.days_until_expiry === 0
                          ? 'Expires today'
                          : `${doc.days_until_expiry}d left`}
                      sx={{ fontSize: 10, height: 22, bgcolor: urg.bg, color: urg.color, fontWeight: 600 }}
                    />
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
