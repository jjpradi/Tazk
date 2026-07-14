import React, { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import WorkLogReport from './WorkLogReport';
import SprintReport from './SprintReport';
import { useSearchParams } from 'react-router-dom';

const REPORT_MENU = [
  {
    key: 'workLog',
    title: 'Work log report',
    subtitle: 'Hours by employee & date',
    icon: <AssessmentRoundedIcon fontSize='small' />,
    statusLabel: 'Active',
  },
  {
    key: 'sprint',
    title: 'Sprint report',
    subtitle: 'Sprint progress & velocity',
    icon: <ChecklistRoundedIcon fontSize='small' />,
    statusLabel: 'New',
  },
  // {
  //   key: 'codeReview',
  //   title: 'Code review report',
  //   subtitle: 'PR status & review time',
  //   icon: <RateReviewRoundedIcon fontSize='small' />,
  // },
  // {
  //   key: 'bugIssue',
  //   title: 'Bug / Issue report',
  //   subtitle: 'Open bugs by priority',
  //   icon: <BugReportRoundedIcon fontSize='small' />,
  // },
  // {
  //   key: 'taskSummary',
  //   title: 'Task summary report',
  //   subtitle: 'Task status per module',
  //   icon: <QueryStatsRoundedIcon fontSize='small' />,
  // },
];

const iconBackgrounds = ['#d9e7ff', '#e6f7df', '#ece8ff', '#ffe8e1', '#fff0d6'];
const ProjectReport = (props) => {
  const [searchParams] = useSearchParams();
  const boardType = searchParams.get("type"); // This will be "1" or "2" as a string

  const [activeReport, setActiveReport] = useState('workLog');
  const visibleMenuItems = useMemo(() => {
    return REPORT_MENU.filter((item) => {
      if (item.key === 'sprint') {
        return boardType === "1";
      }
      return true; 
    });
  }, [boardType]);

  const activeMenu = useMemo(
    () => visibleMenuItems.find((item) => item.key === activeReport) || visibleMenuItems[0],
    [activeReport, visibleMenuItems],
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* The Select Dropdown */}
      <Select
        value={activeReport}
        onChange={(e) => setActiveReport(e.target.value)}
        displayEmpty
        sx={{
          ml: 2,
          fontSize: 14,
          fontWeight: 'medium',
          color: '#111827',
          '.MuiSelect-icon': { color: '#111827' },
          // height: 30,
          maxWidth: 300,
        }}
      >
        {visibleMenuItems.map((item) => (
          <MenuItem 
            key={item.key} 
            value={item.key}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              py: 1.5,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
              {item.title}
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#64748b' }}>
              {item.subtitle}
            </Typography>
          </MenuItem>
        ))}
      </Select>

      {/* Report Content Area */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Paper elevation={0} sx={{ border: '1px solid #d7deea', borderRadius: '8px' }}>
          {activeReport === 'workLog' ? (
            <WorkLogReport project_id={props.project_id} />
          ) : activeReport === 'sprint' && boardType === "1" ? (
            <SprintReport project_id={props.project_id} />
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
               <Typography sx={{ color: '#64748b' }}>
                  {activeMenu?.title} coming soon
               </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};
export default ProjectReport;
