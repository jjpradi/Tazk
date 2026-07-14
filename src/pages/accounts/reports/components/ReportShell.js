import React from 'react';
import { Box, Card, Typography, Breadcrumbs, Link, CircularProgress, Chip, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import { reportTheme, fmtDateLong } from '../reportUtils';

/**
 * ReportShell — Enterprise-grade report page wrapper.
 * Adopts the application's Card theme (borderRadius 8, Poppins font, consistent spacing).
 */
const ReportShell = ({ title, subtitle, breadcrumbs, headerMeta, toolbar, tiles, actions, loading = false, children }) => {
  const navigate = useNavigate();
  const crumbs = breadcrumbs || ['Reports', 'Accounts', title];

  return (
    <Card
      sx={{
        p: 3,
        width: '100%',
        height: 'calc(100vh - 80px)',
        minHeight: '100%',
        overflow: 'auto',
        borderRadius: 2,
        '@media print': { height: 'auto', overflow: 'visible', boxShadow: 'none' },
      }}
    >
      <Helmet>
        <title>{titleURL} | {title}</title>
      </Helmet>

      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 1, fontSize: 12 }}>
        <Link
          underline="hover"
          color="primary"
          sx={{ cursor: 'pointer', fontSize: 12 }}
          onClick={() => navigate('/report')}
        >
          Home
        </Link>
        {crumbs.slice(0, -1).map((c, i) => (
          <Link
            key={i}
            underline="hover"
            color="primary"
            sx={{ cursor: 'pointer', fontSize: 12 }}
            onClick={() => {
              if (c === 'Accounts') navigate('/accounts/generalLedger');
              else if(c === 'Reports') navigate('/report')
            }}
          >
            {c}
          </Link>
        ))}
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          {crumbs[crumbs.length - 1]}
        </Typography>
      </Breadcrumbs>

      {/* Title row */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 0.75 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, fontSize: 16 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12 }}>
            {subtitle}
          </Typography>
        )}
        <Box sx={{ flex: 1 }} />
        {actions}
      </Box>

      {/* Header meta block */}
      {headerMeta && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
            mb: 2,
            py: 1,
            px: 2,
            bgcolor: 'grey.100',
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'grey.200',
            '@media print': { border: 'none', bgcolor: 'transparent' },
          }}
        >
          {headerMeta.companyName && (
            <MetaItem label="Company" value={headerMeta.companyName} />
          )}
          {headerMeta.fy && (
            <MetaItem label="FY" value={headerMeta.fy} />
          )}
          {headerMeta.fromDate && headerMeta.toDate && (
            <MetaItem
              label="Period"
              value={`${fmtDateLong(headerMeta.fromDate)} – ${fmtDateLong(headerMeta.toDate)}`}
            />
          )}
          <Chip
            label={headerMeta.currency || 'INR'}
            size="small"
            variant="outlined"
            sx={{ fontSize: 11, height: 22, fontWeight: 600, borderRadius: 1 }}
          />
          {headerMeta.generatedAt && (
            <Typography sx={{ fontSize: 11, color: 'text.disabled', ml: 'auto' }}>
              Generated: {new Date(headerMeta.generatedAt).toLocaleString('en-IN')}
            </Typography>
          )}
        </Box>
      )}

      {/* Toolbar */}
      {toolbar}

      {/* Tiles */}
      {tiles}

      {/* Body */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
          <CircularProgress size={32} />
          <Typography sx={{ ml: 2, color: 'text.secondary', fontSize: 13 }}>Loading report data...</Typography>
        </Box>
      ) : (
        children
      )}
    </Card>
  );
};

/** Small label: value pair for the header meta block. */
const MetaItem = ({ label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
    <Typography sx={{ fontSize: 11, color: 'text.secondary', textTransform: 'uppercase', fontWeight: 500, letterSpacing: 0.3 }}>
      {label}:
    </Typography>
    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
      {value}
    </Typography>
  </Box>
);

export default ReportShell;
