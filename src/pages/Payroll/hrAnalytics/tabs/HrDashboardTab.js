import React, {useMemo} from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import PeopleOutline from '@mui/icons-material/PeopleOutline';
import PersonAdd from '@mui/icons-material/PersonAdd';
import PersonRemove from '@mui/icons-material/PersonRemove';
import WorkOutline from '@mui/icons-material/WorkOutline';
import PendingActions from '@mui/icons-material/PendingActions';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import SchoolOutlined from '@mui/icons-material/SchoolOutlined';
import NotificationsActive from '@mui/icons-material/NotificationsActive';
import CakeOutlined from '@mui/icons-material/CakeOutlined';
import CelebrationOutlined from '@mui/icons-material/CelebrationOutlined';
import Refresh from '@mui/icons-material/Refresh';
import moment from 'moment';

const kpiCardSx = (accentColor) => ({
  p: 2.5,
  borderRadius: 2,
  borderLeft: `5px solid ${accentColor}`,
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  transition: 'box-shadow 0.2s',
  '&:hover': {boxShadow: 6},
});

const kpiIconBoxSx = (accentColor) => ({
  width: 56,
  height: 56,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  bgcolor: `${accentColor}14`,
  color: accentColor,
  flexShrink: 0,
});

const secondaryCardSx = (accentColor) => ({
  p: 2,
  borderRadius: 2,
  borderLeft: `4px solid ${accentColor}`,
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
});

const sectionPaperSx = {
  p: 2.5,
  borderRadius: 2,
  height: '100%',
};

function KpiCard({icon: Icon, label, value, color}) {
  return (
    <Paper elevation={3} sx={kpiCardSx(color)}>
      <Box sx={kpiIconBoxSx(color)}>
        <Icon sx={{fontSize: 30}} />
      </Box>
      <Box>
        <Typography variant='h4' fontWeight={700} lineHeight={1.2}>
          {value ?? 0}
        </Typography>
        <Typography variant='body2' color='text.secondary' mt={0.25}>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
}

function SecondaryCard({icon: Icon, label, value, color}) {
  return (
    <Paper elevation={1} sx={secondaryCardSx(color)}>
      <Icon sx={{fontSize: 22, color}} />
      <Box sx={{minWidth: 0}}>
        <Typography variant='h6' fontWeight={600} lineHeight={1.2}>
          {value ?? 0}
        </Typography>
        <Typography variant='caption' color='text.secondary' noWrap>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
}

function HorizontalBar({label, value, maxValue, color, showPercent, total}) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const displayPct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
  return (
    <Box sx={{mb: 1.5}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 0.5}}>
        <Typography variant='body2' fontWeight={500}>
          {label}
        </Typography>
        <Typography variant='body2' fontWeight={600}>
          {value}
          {showPercent ? ` (${displayPct}%)` : ''}
        </Typography>
      </Box>
      <LinearProgress
        variant='determinate'
        value={Math.min(pct, 100)}
        sx={{
          height: 10,
          borderRadius: 5,
          bgcolor: `${color}22`,
          '& .MuiLinearProgress-bar': {
            borderRadius: 5,
            bgcolor: color,
          },
        }}
      />
    </Box>
  );
}

function JoiningAttritionChart({headcountTrend = [], attritionTrend = []}) {
  const months = useMemo(() => {
    const monthSet = new Set();
    headcountTrend.forEach((h) => monthSet.add(h.month));
    attritionTrend.forEach((a) => monthSet.add(a.month));
    return Array.from(monthSet).sort();
  }, [headcountTrend, attritionTrend]);

  const trendMap = useMemo(() => {
    const map = {};
    headcountTrend.forEach((h) => {
      map[h.month] = {...(map[h.month] || {}), joiners: h.joiners || 0};
    });
    attritionTrend.forEach((a) => {
      map[a.month] = {
        ...(map[a.month] || {}),
        separations: a.separations || 0,
      };
    });
    return map;
  }, [headcountTrend, attritionTrend]);

  const maxVal = useMemo(() => {
    let m = 1;
    months.forEach((mo) => {
      const d = trendMap[mo] || {};
      m = Math.max(m, d.joiners || 0, d.separations || 0);
    });
    return m;
  }, [months, trendMap]);

  if (months.length === 0) {
    return (
      <Typography variant='body2' color='text.secondary' textAlign='center' py={4}>
        No trend data available
      </Typography>
    );
  }

  return (
    <Box>
      <Box sx={{display: 'flex', gap: 3, mb: 2, justifyContent: 'flex-end'}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
          <Box sx={{width: 14, height: 14, borderRadius: 1, bgcolor: '#4caf50'}} />
          <Typography variant='caption'>Joiners</Typography>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
          <Box sx={{width: 14, height: 14, borderRadius: 1, bgcolor: '#ef5350'}} />
          <Typography variant='caption'>Separations</Typography>
        </Box>
      </Box>
      {months.map((mo) => {
        const d = trendMap[mo] || {};
        const joiners = d.joiners || 0;
        const separations = d.separations || 0;
        const jPct = (joiners / maxVal) * 100;
        const sPct = (separations / maxVal) * 100;
        return (
          <Box
            key={mo}
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 1,
              gap: 1,
            }}
          >
            <Typography
              variant='caption'
              sx={{width: 70, flexShrink: 0, textAlign: 'right', fontWeight: 500}}
            >
              {mo}
            </Typography>
            <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', gap: 0.4}}>
              <Box
                sx={{
                  height: 14,
                  width: `${Math.max(jPct, 2)}%`,
                  bgcolor: '#4caf50',
                  borderRadius: '0 4px 4px 0',
                  transition: 'width 0.4s ease',
                }}
              />
              <Box
                sx={{
                  height: 14,
                  width: `${Math.max(sPct, 2)}%`,
                  bgcolor: '#ef5350',
                  borderRadius: '0 4px 4px 0',
                  transition: 'width 0.4s ease',
                }}
              />
            </Box>
            <Box sx={{width: 50, flexShrink: 0, textAlign: 'right'}}>
              <Typography variant='caption' sx={{color: '#4caf50', fontWeight: 600}}>
                {joiners}
              </Typography>
              <Typography variant='caption' sx={{mx: 0.5, color: 'text.disabled'}}>
                /
              </Typography>
              <Typography variant='caption' sx={{color: '#ef5350', fontWeight: 600}}>
                {separations}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

export default function HrDashboardTab({
  dashboard = {},
  headcountSummary = {},
  headcountTrend = [],
  attritionTrend = [],
  genderDiversity = [],
  birthdays = [],
  anniversaries = [],
  refreshDashboard,
}) {
  const {
    total_active = 0,
    new_joiners_30d = 0,
    separations_30d = 0,
    open_positions = 0,
    probation_due_30d = 0,
    docs_expiring_30d = 0,
    upcoming_trainings = 0,
  } = dashboard;

  const onNotice = headcountSummary.on_notice || 0;

  // Workforce composition
  const compositionItems = useMemo(() => {
    const items = [
      {label: 'Permanent', value: headcountSummary.permanent || 0, color: '#4caf50'},
      {label: 'Contract', value: headcountSummary.contract || 0, color: '#ff9800'},
      {label: 'Interns', value: headcountSummary.interns || 0, color: '#42a5f5'},
      {label: 'Consultants', value: headcountSummary.consultants || 0, color: '#ab47bc'},
    ];
    return items;
  }, [headcountSummary]);

  const compositionTotal = useMemo(
    () => compositionItems.reduce((s, i) => s + i.value, 0),
    [compositionItems],
  );
  const compositionMax = useMemo(
    () => Math.max(...compositionItems.map((i) => i.value), 1),
    [compositionItems],
  );

  // Gender diversity
  const genderColors = {Male: '#42a5f5', Female: '#ec407a', Other: '#78909c'};
  const genderTotal = useMemo(
    () => genderDiversity.reduce((s, g) => s + (g.count || 0), 0),
    [genderDiversity],
  );
  const genderMax = useMemo(
    () => Math.max(...genderDiversity.map((g) => g.count || 0), 1),
    [genderDiversity],
  );

  // Combined events
  const events = useMemo(() => {
    const bItems = (birthdays || []).map((b) => ({
      type: 'birthday',
      name: b.employee_name,
      department: b.department_name,
      detail: moment(b.dob).format("DD-MM-YYYY"),
    }));
    const aItems = (anniversaries || []).map((a) => ({
      type: 'anniversary',
      name: a.employee_name,
      department: a.department_name,
      detail: `${a.completing_years} year${a.completing_years !== 1 ? 's' : ''}`,
    }));
    return [...bItems, ...aItems].slice(0, 10);
  }, [birthdays, anniversaries]);

  return (
    <Box>
      {/* Header with refresh */}
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5}}>
        <Typography variant='h5' fontWeight={700}>
          HR Executive Dashboard
        </Typography>
        {refreshDashboard && (
          <Tooltip title='Refresh Dashboard'>
            <IconButton onClick={refreshDashboard} color='primary' size='medium'>
              <Refresh />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Primary KPI Cards */}
      <Grid container spacing={2.5} sx={{mb: 2.5}}>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <KpiCard
            icon={PeopleOutline}
            label='Total Active Employees'
            value={total_active}
            color='#1976d2'
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <KpiCard
            icon={PersonAdd}
            label='New Joiners (30d)'
            value={new_joiners_30d}
            color='#2e7d32'
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <KpiCard
            icon={PersonRemove}
            label='Separations (30d)'
            value={separations_30d}
            color='#d32f2f'
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <KpiCard
            icon={WorkOutline}
            label='Open Positions'
            value={open_positions}
            color='#ed6c02'
          />
        </Grid>
      </Grid>

      {/* Secondary KPI Cards */}
      <Grid container spacing={2} sx={{mb: 3}}>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <SecondaryCard
            icon={PendingActions}
            label='Probation Due (30d)'
            value={probation_due_30d}
            color='#7b1fa2'
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <SecondaryCard
            icon={DescriptionOutlined}
            label='Docs Expiring (30d)'
            value={docs_expiring_30d}
            color='#c62828'
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <SecondaryCard
            icon={SchoolOutlined}
            label='Upcoming Trainings'
            value={upcoming_trainings}
            color='#0277bd'
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <SecondaryCard
            icon={NotificationsActive}
            label='On Notice'
            value={onNotice}
            color='#ef6c00'
          />
        </Grid>
      </Grid>

      {/* Joining vs Attrition Trend - Full width */}
      <Paper elevation={2} sx={{...sectionPaperSx, mb: 3}}>
        <Typography variant='subtitle1' fontWeight={700} mb={2}>
          Joining vs Attrition (Last 12 Months)
        </Typography>
        <JoiningAttritionChart
          headcountTrend={headcountTrend}
          attritionTrend={attritionTrend}
        />
      </Paper>

      {/* Bottom row: Composition, Gender, Events */}
      <Grid container spacing={2.5}>
        {/* Workforce Composition */}
        <Grid size={{xs: 12, md: 6}}>
          <Paper elevation={2} sx={sectionPaperSx}>
            <Typography variant='subtitle1' fontWeight={700} mb={2}>
              Workforce Composition
            </Typography>
            {compositionItems.map((item) => (
              <HorizontalBar
                key={item.label}
                label={item.label}
                value={item.value}
                maxValue={compositionMax}
                color={item.color}
                showPercent
                total={compositionTotal}
              />
            ))}
            <Divider sx={{my: 1.5}} />
            <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
              <Typography variant='body2' fontWeight={600}>
                Total
              </Typography>
              <Typography variant='body2' fontWeight={600}>
                {compositionTotal}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Gender Diversity */}
        <Grid size={{xs: 12, md: 6}}>
          <Paper elevation={2} sx={sectionPaperSx}>
            <Typography variant='subtitle1' fontWeight={700} mb={2}>
              Gender Diversity
            </Typography>
            {genderDiversity.length === 0 ? (
              <Typography variant='body2' color='text.secondary' textAlign='center' py={4}>
                No gender data available
              </Typography>
            ) : (
              <>
                {genderDiversity.map((g) => (
                  <HorizontalBar
                    key={g.gender}
                    label={g.gender}
                    value={g.count || 0}
                    maxValue={genderMax}
                    color={genderColors[g.gender] || '#78909c'}
                    showPercent
                    total={genderTotal}
                  />
                ))}
                <Divider sx={{my: 1.5}} />
                <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                  <Typography variant='body2' fontWeight={600}>
                    Total
                  </Typography>
                  <Typography variant='body2' fontWeight={600}>
                    {genderTotal}
                  </Typography>
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        {/* Upcoming Events */}
        <Grid size={{xs: 12, md: 6}}>
          <Paper elevation={2} sx={sectionPaperSx}>
            <Typography variant='subtitle1' fontWeight={700} mb={1}>
              Birthdays & Anniversaries
            </Typography>
            {events.length === 0 ? (
              <Typography variant='body2' color='text.secondary' textAlign='center' py={4}>
                No upcoming events
              </Typography>
            ) : (
              <List dense disablePadding>
                {events.map((evt, idx) => (
                  <React.Fragment key={`${evt.type}-${evt.name}-${idx}`}>
                    {idx > 0 && <Divider component='li' />}
                    <ListItem disableGutters sx={{py: 0.75}}>
                      <ListItemIcon sx={{minWidth: 36}}>
                        {evt.type === 'birthday' ? (
                          <CakeOutlined sx={{color: '#e91e63', fontSize: 20}} />
                        ) : (
                          <CelebrationOutlined sx={{color: '#ff9800', fontSize: 20}} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant='body2' fontWeight={600}>
                            {evt.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant='caption' color='text.secondary'>
                            {evt.department}
                            {evt.detail ? ` \u2022 ${evt.detail}` : ''}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
