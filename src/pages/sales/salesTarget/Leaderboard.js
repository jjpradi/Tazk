import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {
  Box, Card, Typography, Avatar,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DataGrid } from '@mui/x-data-grid';
import { Helmet } from 'react-helmet-async';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import moment from 'moment';
import { titleURL } from 'http-common';
import {
  getPeriodsAction,
  getLeaderboardAction,
} from '../../../redux/actions/salesTarget_actions';
import PeriodSelector from './components/PeriodSelector';

const formatCurrency = (val) => {
  if (val == null || val === '' || isNaN(val)) return '\u20B90';
  return `\u20B9${Number(val).toLocaleString('en-IN')}`;
};

const MEDAL_COLORS = {
  1: { bg: 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)', text: '#7B5800', border: '#FFD700', label: 'Gold' },
  2: { bg: 'linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 100%)', text: '#555', border: '#C0C0C0', label: 'Silver' },
  3: { bg: 'linear-gradient(135deg, #FFCC80 0%, #CD7F32 100%)', text: '#5D3A00', border: '#CD7F32', label: 'Bronze' },
};

function TopCard({ rank, data }) {
  const medal = MEDAL_COLORS[rank];
  if (!medal || !data) return null;

  const pct = Number(data.achievement_pct) || (Number(data.target_value) > 0 ? ((Number(data.achieved_value) / Number(data.target_value)) * 100) : 0);

  return (
    <Card
      sx={{
        p: 2.5, textAlign: 'center', position: 'relative',
        background: medal.bg, border: `2px solid ${medal.border}`,
        borderRadius: 2, overflow: 'visible',
      }}
      elevation={2}
    >
      <Box
        sx={{
          position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
          bgcolor: medal.border, color: '#fff', borderRadius: '50%',
          width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 13, boxShadow: 1,
        }}
      >
        {rank}
      </Box>
      <EmojiEventsIcon sx={{ fontSize: 32, color: medal.text, mt: 1 }} />
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: medal.text, mt: 1 }}>
        {data.employee_name || '-'}
      </Typography>
      <Typography sx={{ fontSize: 11, color: medal.text, opacity: 0.8 }}>
        {data.location || ''}
      </Typography>
      <Typography sx={{ fontSize: 22, fontWeight: 800, color: medal.text, mt: 1 }}>
        {pct.toFixed(1)}%
      </Typography>
      <Typography sx={{ fontSize: 11, color: medal.text, opacity: 0.7 }}>
        {formatCurrency(data.achieved_value)} / {formatCurrency(data.target_value)}
      </Typography>
    </Card>
  );
}

export default function Leaderboard() {
  const dispatch = useDispatch();
  const context = useContext(CreateNewButtonContext);
  const headerLocationId = context.headerLocationId;
  const locFilter = headerLocationId && headerLocationId !== 'null' ? { location_id: headerLocationId } : {};
  const { periods, leaderboard, loading } = useSelector((s) => s.salesTargetReducer);

  const [selectedPeriod, setSelectedPeriod] = useState('');

  useEffect(() => {
    dispatch(getPeriodsAction());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedPeriod && Array.isArray(periods) && periods.length > 0) {
      setSelectedPeriod(periods[0].id || periods[0].period_id);
    }
  }, [periods, selectedPeriod]);

  useEffect(() => {
    if (selectedPeriod) {
      dispatch(getLeaderboardAction(selectedPeriod, locFilter));
    }
  }, [dispatch, selectedPeriod, headerLocationId]);

  const rankedRows = useMemo(() => {
    const rows = Array.isArray(leaderboard) ? leaderboard : [];
    return rows
      .map((r, idx) => ({
        ...r,
        id: r.salesman_id || r.id || idx,
        rank: r.rank || idx + 1,
        achievement_pct: r.achievement_pct || (r.target_value > 0 ? ((r.achieved_value / r.target_value) * 100) : 0),
        gap: (Number(r.target_value) || 0) - (Number(r.achieved_value) || 0),
      }))
      .sort((a, b) => (b.achievement_pct || 0) - (a.achievement_pct || 0))
      .map((r, idx) => ({ ...r, rank: idx + 1 }));
  }, [leaderboard]);

  const top3 = rankedRows.slice(0, 3);

  const columns = [
    {
      field: 'rank',
      headerName: 'Rank',
      flex: 0.3,
      minWidth: 60,
      align: 'center',
      headerAlign: 'center',
      renderCell: (p) => {
        const r = p.value;
        const medal = MEDAL_COLORS[r];
        if (medal) {
          return (
            <Avatar sx={{ width: 26, height: 26, fontSize: 12, fontWeight: 700, bgcolor: medal.border, color: '#fff' }}>
              {r}
            </Avatar>
          );
        }
        return <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#666' }}>{r}</Typography>;
      },
    },
    { field: 'employee_name', headerName: 'Salesman Name', flex: 1.2, minWidth: 160,
      renderCell: (p) => <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{p.value || '-'}</Typography> },
    { field: 'location_name', headerName: 'Location', flex: 0.8, minWidth: 120 },
    {
      field: 'achievement_pct',
      headerName: 'Achievement %',
      flex: 0.6,
      minWidth: 110,
      align: 'right',
      headerAlign: 'right',
      renderCell: (p) => {
        const pct = Number(p.value) || 0;
        const color = pct >= 100 ? '#4CAF50' : pct >= 75 ? '#FF9800' : '#F44336';
        return <Typography sx={{ fontSize: 13, fontWeight: 700, color }}>{pct.toFixed(1)}%</Typography>;
      },
    },
    { field: 'target_value', headerName: 'Target', flex: 0.7, minWidth: 110, align: 'right', headerAlign: 'right',
      renderCell: (p) => formatCurrency(p.value) },
    { field: 'achieved_value', headerName: 'Achieved', flex: 0.7, minWidth: 110, align: 'right', headerAlign: 'right',
      renderCell: (p) => (
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#4CAF50' }}>
          {formatCurrency(p.value)}
        </Typography>
      ),
    },
    {
      field: 'gap',
      headerName: 'Gap',
      flex: 0.6,
      minWidth: 100,
      align: 'right',
      headerAlign: 'right',
      renderCell: (p) => {
        const g = p.value || 0;
        return (
          <Typography sx={{ fontSize: 13, color: g > 0 ? '#F44336' : '#4CAF50' }}>
            {g > 0 ? `-${formatCurrency(g)}` : formatCurrency(Math.abs(g))}
          </Typography>
        );
      },
    },
  ];

  return (
    <>
      <Helmet><title>{titleURL} | Leaderboard</title></Helmet>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)', gap: 2 }}>
        {/* Header */}
        <Card sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <EmojiEventsIcon sx={{ color: '#FFD700', fontSize: 28 }} />
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#2E3A59' }}>
              Leaderboard
            </Typography>
            <PeriodSelector value={selectedPeriod} onChange={setSelectedPeriod} />
          </Box>
        </Card>

        {/* Top 3 Podium */}
        {top3.length > 0 && (
          <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
            {top3.length > 1 && (
              <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                <Box sx={{ mt: { sm: 3 } }}>
                  <TopCard rank={2} data={top3[1]} />
                </Box>
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <TopCard rank={1} data={top3[0]} />
            </Grid>
            {top3.length > 2 && (
              <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                <Box sx={{ mt: { sm: 4 } }}>
                  <TopCard rank={3} data={top3[2]} />
                </Box>
              </Grid>
            )}
          </Grid>
        )}

        {/* Full Rankings Table */}
        <Card sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#2E3A59', mb: 1 }}>
            Full Rankings
          </Typography>
          <DataGrid
            rows={rankedRows}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
              sorting: { sortModel: [{ field: 'rank', sort: 'asc' }] },
            }}
            sx={{
              flex: 1, border: 'none',
              '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F5F7FA', borderBottom: '1px solid #E8EDF5' },
              '& .MuiDataGrid-row:hover': { backgroundColor: '#F8FAFC' },
              '& .MuiDataGrid-cell': { fontSize: 13 },
            }}
            slots={{
              noRowsOverlay: () => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography sx={{ color: '#999', fontSize: 14 }}>
                    {selectedPeriod ? 'No leaderboard data available for this period.' : 'Select a period to view rankings.'}
                  </Typography>
                </Box>
              ),
            }}
          />
        </Card>
      </Box>
    </>
  );
}
