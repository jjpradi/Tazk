import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TextField, MenuItem, Chip, Box, Typography } from '@mui/material';
import { getPeriodsAction } from '../../../../redux/actions/salesTarget_actions';

const STATUS_MAP = {
  draft: { label: 'Draft', color: 'default' },
  published: { label: 'Published', color: 'info' },
  locked: { label: 'Locked', color: 'warning' },
  closed: { label: 'Closed', color: 'success' },
};

export default function PeriodSelector({ value, onChange, companyId, sx = {} }) {
  const dispatch = useDispatch();
  const { periods } = useSelector((s) => s.salesTargetReducer);

  useEffect(() => {
    const params = companyId ? { company_id: companyId } : {};
    dispatch(getPeriodsAction(params));
  }, [dispatch, companyId]);

  const periodList = Array.isArray(periods) ? periods : [];

  return (
    <TextField
      select
      size="small"
      value={value || ''}
      onChange={onChange}
      sx={{ minWidth: 220, ...sx }}
      SelectProps={{
        displayEmpty: true,
        renderValue: (selected) => {
          if (!selected) {
            return <Typography sx={{ fontSize: 13, color: '#999' }}>Select Period</Typography>;
          }
          const p = periodList.find((pr) => (pr.id || pr.period_id) === selected);
          if (!p) return selected;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: 13 }}>{p.period_name}</Typography>
              <Chip
                label={(STATUS_MAP[p.status] || STATUS_MAP.draft).label}
                color={(STATUS_MAP[p.status] || STATUS_MAP.draft).color}
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: 10 }}
              />
            </Box>
          );
        },
      }}
    >
      {periodList.length === 0 && (
        <MenuItem disabled value="">
          <Typography sx={{ fontSize: 13, color: '#999' }}>No periods available</Typography>
        </MenuItem>
      )}
      {periodList.map((p) => {
        const id = p.id || p.period_id;
        const cfg = STATUS_MAP[p.status] || STATUS_MAP.draft;
        return (
          <MenuItem key={id} value={id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <Typography sx={{ fontSize: 13, flex: 1 }}>{p.period_name}</Typography>
              <Chip
                label={cfg.label}
                color={cfg.color}
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: 10 }}
              />
            </Box>
          </MenuItem>
        );
      })}
    </TextField>
  );
}
