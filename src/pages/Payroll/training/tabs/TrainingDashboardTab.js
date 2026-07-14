import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Rating,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  SchoolOutlined,
  EventAvailable,
  PeopleOutline,
  CheckCircleOutline,
  PendingActions,
  StarOutline,
  AccountBalanceWallet,
  Refresh,
  FileDownload,
} from '@mui/icons-material';

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/* -------------------- CONSTANTS -------------------- */

const CATEGORY_COLOR_MAP = {
  technical: 'primary',
  soft_skills: 'success',
  compliance: 'error',
  leadership: 'secondary',
  onboarding: 'info',
  safety: 'warning',
  domain: 'default',
  other: 'default',
};

const PROFICIENCY_COLORS = {
  beginner: '#9e9e9e',
  intermediate: '#1976d2',
  advanced: '#ed6c02',
  expert: '#2e7d32',
};

const formatINR = (val) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);

/* -------------------- EXPORT HELPERS -------------------- */

const exportExcel = (data, fileName, sheetName) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buffer]), `${fileName}.xlsx`);
};

/* -------------------- UI COMPONENTS -------------------- */

const KpiCard = ({icon, label, value, color}) => (
  <Paper elevation={3} sx={{p: 2.5, display: 'flex', alignItems: 'center', gap: 2}}>
    <Box sx={{bgcolor: `${color}.lighter`, color: `${color}.main`, borderRadius: 2, p: 1.5}}>
      {icon}
    </Box>
    <Box>
      <Typography variant='h4' fontWeight={700}>{value ?? 0}</Typography>
      <Typography variant='body2'>{label}</Typography>
    </Box>
  </Paper>
);

const SkillBar = ({beginner, intermediate, advanced, expert, total}) => {
  if (!total) return null;
  const segments = [
    {value: beginner, color: PROFICIENCY_COLORS.beginner},
    {value: intermediate, color: PROFICIENCY_COLORS.intermediate},
    {value: advanced, color: PROFICIENCY_COLORS.advanced},
    {value: expert, color: PROFICIENCY_COLORS.expert},
  ];
  return (
    <Box sx={{display: 'flex', height: 18, borderRadius: 1, overflow: 'hidden'}}>
      {segments.map((seg, i) => {
        const pct = (seg.value / total) * 100;
        if (!pct) return null;
        return <Box key={i} sx={{width: `${pct}%`, bgcolor: seg.color}} />;
      })}
    </Box>
  );
};

/* -------------------- MAIN COMPONENT -------------------- */

export default function TrainingDashboardTab({
  dashboard = {},
  categoryBreakdown = [],
  skillGap = [],
  refreshDashboard,
}) {

  /* -------- EXPORT: FULL TRAINING REPORT -------- */

  const handleFullExport = async () => {
    try {
      const res = await fetch('/training/export-report');
      const data = await res.json();

      const formatted = data.map(r => ({
        "Session Name": r.session_name,
        "Attendees": r.attendees,
        "Department": r.department,
        "Location": r.location,
        "Trainer": r.trainer,
        "Mode": r.mode,
        "Date": r.date,
        "Time": r.time,
        "Budget": r.budget,
        "Expenses": r.expenses,
        "Feedback": r.feedback,
        "Skill Gap": r.skill_gap,
      }));

      exportExcel(formatted, "Training_Report", "Report");

    } catch (e) {
      console.error("Export failed", e);
    }
  };

  /* -------- EXPORT: CATEGORY -------- */

  const handleCategoryExport = () => {
    const data = categoryBreakdown.map(r => ({
      Category: r.category,
      Programs: r.program_count,
      Trainees: r.trainee_count,
      Completed: r.completed_count,
      "Completion %": r.trainee_count
        ? ((r.completed_count / r.trainee_count) * 100).toFixed(1)
        : 0,
    }));

    exportExcel(data, "Training_Category", "Category");
  };

  /* -------- EXPORT: SKILL GAP -------- */

  const handleSkillExport = () => {
    const data = skillGap.map(r => ({
      Skill: r.skill_name,
      Category: r.skill_category,
      Beginner: r.beginner_count,
      Intermediate: r.intermediate_count,
      Advanced: r.advanced_count,
      Expert: r.expert_count,
      Total: r.total_mapped,
    }));

    exportExcel(data, "Skill_Gap", "Skill Gap");
  };

  /* -------------------- RENDER -------------------- */

  return (
    <Box sx={{p: 2}}>

      {/* HEADER */}
      <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2}}>
        <Tooltip title='Export Full Report'>
          <IconButton onClick={handleFullExport} color='success'>
            <FileDownload />
          </IconButton>
        </Tooltip>

        <Tooltip title='Refresh'>
          <IconButton onClick={refreshDashboard} color='primary'>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* KPI */}
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <KpiCard icon={<SchoolOutlined />} label='Programs' value={dashboard.active_programs} color='primary'/>
        </Grid>
        <Grid item xs={3}>
          <KpiCard icon={<EventAvailable />} label='Sessions' value={dashboard.upcoming_sessions} color='info'/>
        </Grid>
        <Grid item xs={3}>
          <KpiCard icon={<PeopleOutline />} label='Trainees' value={dashboard.total_trainees} color='secondary'/>
        </Grid>
        <Grid item xs={3}>
          <KpiCard icon={<CheckCircleOutline />} label='Completed' value={dashboard.completions} color='success'/>
        </Grid>
      </Grid>

      {/* CATEGORY TABLE */}
      <Paper sx={{mt: 3, p: 2}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
          <Typography variant='h6'>Training by Category</Typography>

          <IconButton onClick={handleCategoryExport} color='success'>
            <FileDownload />
          </IconButton>
        </Box>

        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell align='right'>Programs</TableCell>
              <TableCell align='right'>Trainees</TableCell>
              <TableCell align='right'>Completed</TableCell>
              <TableCell align='right'>%</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {categoryBreakdown.map((r, i) => (
              <TableRow key={i}>
                <TableCell>{r.category}</TableCell>
                <TableCell align='right'>{r.program_count}</TableCell>
                <TableCell align='right'>{r.trainee_count}</TableCell>
                <TableCell align='right'>{r.completed_count}</TableCell>
                <TableCell align='right'>
                  {r.trainee_count
                    ? ((r.completed_count / r.trainee_count) * 100).toFixed(1)
                    : 0}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* SKILL GAP */}
      <Paper sx={{mt: 3, p: 2}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
          <Typography variant='h6'>Skill Gap</Typography>

          <IconButton onClick={handleSkillExport} color='success'>
            <FileDownload />
          </IconButton>
        </Box>

        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Skill</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Distribution</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {skillGap.map((r, i) => (
              <TableRow key={i}>
                <TableCell>{r.skill_name}</TableCell>
                <TableCell>{r.skill_category}</TableCell>
                <TableCell>
                  <SkillBar
                    beginner={r.beginner_count}
                    intermediate={r.intermediate_count}
                    advanced={r.advanced_count}
                    expert={r.expert_count}
                    total={r.total_mapped}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

    </Box>
  );
}