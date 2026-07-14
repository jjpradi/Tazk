import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  Menu,
  MenuItem,
  InputAdornment,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getFYPresets } from '../reportUtils';

/**
 * ReportToolbar — Date range, FY presets, search, toggles, export/print.
 * Styled to match the application's enterprise theme (Poppins, 8px radius, consistent spacing).
 */
const ReportToolbar = ({
  fromDate,
  toDate,
  onDateChange,
  search,
  onSearchChange,
  showSearch = false,
  includeZero,
  onIncludeZeroChange,
  showIncludeZero = false,
  onApply,
  onPrint,
  onExport,
  asOnMode = false,
  asOnDate,
  onAsOnChange,
  exportEnabled = true,
}) => {
  const [fyAnchor, setFyAnchor] = useState(null);
  const presets = getFYPresets();

  const handleFYSelect = (preset) => {
    setFyAnchor(null);
    if (onDateChange) onDateChange(preset.fromDate, preset.toDate);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        flexWrap: 'wrap',
        mb: 2,
        py: 1,
        px: 2,
        bgcolor: 'background.default',
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'grey.200',
      }}
    >
      {/* FY Presets */}
      <Tooltip title="Financial Year presets">
        <IconButton
          size="small"
          onClick={(e) => setFyAnchor(e.currentTarget)}
          sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, width: 32, height: 32 }}
        >
          <CalendarMonthIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={fyAnchor} open={Boolean(fyAnchor)} onClose={() => setFyAnchor(null)}>
        {presets.map((p) => (
          <MenuItem key={p.label} onClick={() => handleFYSelect(p)} sx={{ fontSize: 13 }}>
            {p.label}
          </MenuItem>
        ))}
      </Menu>

      {asOnMode ? (
        <TextField
          label="As on date"
          type="date"
          size="small"
          value={asOnDate || ''}
          onChange={(e) => onAsOnChange && onAsOnChange(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 160, '& .MuiInputBase-input': { fontSize: 13 } }}
        />
      ) : (
        <>
          <TextField
            label="From"
            type="date"
            size="small"
            value={fromDate || ''}
            onChange={(e) => onDateChange && onDateChange(e.target.value, toDate)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 155, '& .MuiInputBase-input': { fontSize: 13 } }}
          />
          <TextField
            label="To"
            type="date"
            size="small"
            value={toDate || ''}
            onChange={(e) => onDateChange && onDateChange(fromDate, e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 155, '& .MuiInputBase-input': { fontSize: 13 } }}
          />
        </>
      )}

      {onApply && (
        <Button
          variant="contained"
          size="small"
          onClick={onApply}
          startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
          sx={{ textTransform: 'none', minWidth: 80, fontSize: 13, fontWeight: 500, borderRadius: 1.5 }}
        >
          Apply
        </Button>
      )}

      <Box sx={{ flex: 1 }} />

      {showSearch && (
        <TextField
          size="small"
          placeholder="Search..."
          value={search || ''}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: 200, '& .MuiInputBase-input': { fontSize: 13 } }}
        />
      )}

      {showIncludeZero && (
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={!!includeZero}
              onChange={(e) => onIncludeZeroChange && onIncludeZeroChange(e.target.checked)}
            />
          }
          label="Zero bal."
          slotProps={{ typography: { sx: { fontSize: 12 } } }}
        />
      )}

      {(onPrint || onExport) && <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />}

      {onPrint && (
        <Tooltip title="Print report">
          <IconButton size="small" onClick={onPrint} sx={{ color: 'text.secondary' }}>
            <PrintIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}
      {exportEnabled && onExport &&(
        <Tooltip title="Export CSV">
          <IconButton size="small" onClick={onExport} sx={{ color: 'text.secondary' }}>
            <FileDownloadIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default ReportToolbar;
