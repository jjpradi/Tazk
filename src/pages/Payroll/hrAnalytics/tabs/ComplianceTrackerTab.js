import React, {useMemo} from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  GavelRounded,
  DescriptionRounded,
  PolicyRounded,
  CakeRounded,
  WorkRounded,
  CelebrationRounded,
} from '@mui/icons-material';
import {format} from 'date-fns';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmtDate = (d) => {
  if (!d) return '--';
  try {
    return format(new Date(d), 'dd MMM yyyy');
  } catch {
    return '--';
  }
};

const fmtShortDate = (d) => {
  if (!d) return '--';
  try {
    return format(new Date(d), 'dd MMM');
  } catch {
    return '--';
  }
};

const getDaysRemainingColor = (days) => {
  if (days < 0) return 'error.main';
  if (days <= 15) return 'warning.main';
  if (days <= 30) return '#f9a825'; // yellow-ish
  return 'success.main';
};

const getDaysRemainingLabel = (days) => {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  return `${days}d`;
};

const getExpiryChipProps = (days, status) => {
  const isExpired =
    days < 0 ||
    (status && status.toLowerCase() === 'expired') ||
    (status && status.toLowerCase() === 'overdue');
  if (isExpired) return {color: 'error', label: status || 'Expired'};
  if (days < 30) return {color: 'warning', label: status || 'Expiring Soon'};
  if (days < 60) return {color: 'info', label: status || 'Upcoming'};
  return {color: 'default', label: status || 'Valid'};
};

const policyCategoryColorMap = {
  general: 'default',
  leave: 'info',
  attendance: 'primary',
  conduct: 'warning',
  safety: 'error',
  benefits: 'success',
  it: 'secondary',
  travel: 'default',
};

const getPolicyCategoryColor = (cat) => {
  if (!cat) return 'default';
  return policyCategoryColorMap[cat.toLowerCase()] || 'default';
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const SummaryCard = ({title, value, icon, color}) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      height: '100%',
    }}>
    <Avatar
      sx={{
        bgcolor: `${color}.lighter`,
        color: `${color}.main`,
        width: 52,
        height: 52,
      }}>
      {icon}
    </Avatar>
    <Box>
      <Typography variant='h4' fontWeight={700}>
        {value}
      </Typography>
      <Typography variant='body2' color='text.secondary'>
        {title}
      </Typography>
    </Box>
  </Paper>
);

const SectionPaper = ({title, children, sx}) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      overflow: 'hidden',
      ...sx,
    }}>
    <Box sx={{px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider'}}>
      <Typography variant='subtitle1' fontWeight={600}>
        {title}
      </Typography>
    </Box>
    {children}
  </Paper>
);

const EmptyState = ({message}) => (
  <Box sx={{py: 6, textAlign: 'center'}}>
    <Typography variant='body2' color='text.secondary'>
      {message}
    </Typography>
  </Box>
);

const headCellSx = {fontWeight: 600, whiteSpace: 'nowrap'};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const ComplianceTrackerTab = ({
  probationDue = [],
  documentExpiry = [],
  policyAck = [],
  birthdays = [],
  anniversaries = [],
}) => {
  // --- derived data ---

  const sortedProbation = useMemo(
    () =>
      [...probationDue].sort(
        (a, b) => new Date(a.probation_end_date) - new Date(b.probation_end_date),
      ),
    [probationDue],
  );

  const pendingPolicies = useMemo(
    () => policyAck.filter((p) => (p.acknowledged_count ?? 0) < (p.total_employees ?? 0)),
    [policyAck],
  );

  // --- summary counts ---

  const summaryCards = [
    {
      title: 'Probation Due',
      value: probationDue.length,
      icon: <GavelRounded />,
      color: 'warning',
    },
    {
      title: 'Documents Expiring',
      value: documentExpiry.length,
      icon: <DescriptionRounded />,
      color: 'error',
    },
    {
      title: 'Pending Acknowledgments',
      value: pendingPolicies.length,
      icon: <PolicyRounded />,
      color: 'info',
    },
    {
      title: 'Upcoming Birthdays',
      value: birthdays.length,
      icon: <CakeRounded />,
      color: 'success',
    },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
      {/* -------- 1. Summary Cards -------- */}
      <Grid container spacing={2.5}>
        {summaryCards.map((card) => (
          <Grid key={card.title} size={{xs: 12, sm: 6, md: 3}}>
            <SummaryCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* -------- 2. Probation Tracker -------- */}
      <SectionPaper title='Probation Due'>
        {sortedProbation.length === 0 ? (
          <EmptyState message='No employees with upcoming probation due dates.' />
        ) : (
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell sx={headCellSx}>Employee</TableCell>
                  <TableCell sx={headCellSx}>Emp Code</TableCell>
                  <TableCell sx={headCellSx}>Department</TableCell>
                  <TableCell sx={headCellSx}>Designation</TableCell>
                  <TableCell sx={headCellSx}>DOJ</TableCell>
                  <TableCell sx={headCellSx}>Probation End</TableCell>
                  <TableCell sx={headCellSx} align='center'>
                    Days Remaining
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedProbation.map((row) => (
                  <TableRow key={row.employee_id} hover>
                    <TableCell>{row.employee_name}</TableCell>
                    <TableCell>{row.emp_code}</TableCell>
                    <TableCell>{row.department_name}</TableCell>
                    <TableCell>{row.designation}</TableCell>
                    <TableCell>{fmtDate(row.dateOfJoining)}</TableCell>
                    <TableCell>{fmtDate(row.probation_end_date)}</TableCell>
                    <TableCell align='center'>
                      <Typography
                        variant='body2'
                        fontWeight={600}
                        sx={{color: getDaysRemainingColor(row.days_remaining)}}>
                        {getDaysRemainingLabel(row.days_remaining)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionPaper>

      {/* -------- 3. Document Expiry -------- */}
      <SectionPaper title='Documents Expiring (Next 90 Days)'>
        {documentExpiry.length === 0 ? (
          <EmptyState message='No documents expiring in the next 90 days.' />
        ) : (
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell sx={headCellSx}>Employee</TableCell>
                  <TableCell sx={headCellSx}>Emp Code</TableCell>
                  <TableCell sx={headCellSx}>Document Type</TableCell>
                  <TableCell sx={headCellSx}>Category</TableCell>
                  <TableCell sx={headCellSx}>Expiry Date</TableCell>
                  <TableCell sx={headCellSx} align='center'>
                    Days to Expiry
                  </TableCell>
                  <TableCell sx={headCellSx} align='center'>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documentExpiry.map((row) => {
                  const chipProps = getExpiryChipProps(
                    row.days_to_expiry,
                    row.verification_status,
                  );
                  return (
                    <TableRow key={row.id ?? `${row.employee_id}-${row.document_type}`} hover>
                      <TableCell>{row.employee_name}</TableCell>
                      <TableCell>{row.emp_code}</TableCell>
                      <TableCell>{row.document_type}</TableCell>
                      <TableCell>{row.category_name}</TableCell>
                      <TableCell>{fmtDate(row.expiry_date)}</TableCell>
                      <TableCell align='center'>
                        <Typography
                          variant='body2'
                          fontWeight={600}
                          sx={{
                            color:
                              row.days_to_expiry < 0
                                ? 'error.main'
                                : row.days_to_expiry < 30
                                  ? 'warning.main'
                                  : 'text.primary',
                          }}>
                          {row.days_to_expiry < 0
                            ? `${Math.abs(row.days_to_expiry)}d overdue`
                            : `${row.days_to_expiry}d`}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <Chip
                          label={chipProps.label}
                          color={chipProps.color}
                          size='small'
                          variant='outlined'
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionPaper>

      {/* -------- 4. Policy Acknowledgment -------- */}
      <SectionPaper title='Policy Acknowledgment Status'>
        {policyAck.length === 0 ? (
          <EmptyState message='No policy acknowledgment data available.' />
        ) : (
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell sx={headCellSx}>Policy Name</TableCell>
                  <TableCell sx={headCellSx}>Category</TableCell>
                  <TableCell sx={headCellSx} align='center'>
                    Total Employees
                  </TableCell>
                  <TableCell sx={headCellSx} align='center'>
                    Acknowledged
                  </TableCell>
                  <TableCell sx={headCellSx} align='center'>
                    Pending
                  </TableCell>
                  <TableCell sx={{...headCellSx, minWidth: 180}}>Completion</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {policyAck.map((row) => {
                  const total = row.total_employees || 0;
                  const acked = row.acknowledged_count || 0;
                  const pending = Math.max(total - acked, 0);
                  const pct = total > 0 ? Math.round((acked / total) * 100) : 0;
                  const progressColor =
                    pct === 100 ? 'success' : pct >= 60 ? 'primary' : 'warning';

                  return (
                    <TableRow key={row.policy_id} hover>
                      <TableCell>{row.policy_name}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.policy_category || '--'}
                          color={getPolicyCategoryColor(row.policy_category)}
                          size='small'
                          variant='outlined'
                        />
                      </TableCell>
                      <TableCell align='center'>{total}</TableCell>
                      <TableCell align='center'>{acked}</TableCell>
                      <TableCell align='center'>
                        <Typography
                          variant='body2'
                          fontWeight={pending > 0 ? 600 : 400}
                          color={pending > 0 ? 'warning.main' : 'text.secondary'}>
                          {pending}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                          <LinearProgress
                            variant='determinate'
                            value={pct}
                            color={progressColor}
                            sx={{flex: 1, height: 8, borderRadius: 4}}
                          />
                          <Typography
                            variant='caption'
                            fontWeight={600}
                            sx={{minWidth: 36, textAlign: 'right'}}>
                            {pct}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionPaper>

      {/* -------- 5. Upcoming Events -------- */}
      <Grid container spacing={2.5}>
        {/* Birthdays */}
        <Grid size={{xs: 12, md: 6}}>
          <SectionPaper title='Upcoming Birthdays (Next 30 Days)' sx={{height: '100%'}}>
            {birthdays.length === 0 ? (
              <EmptyState message='No upcoming birthdays in the next 30 days.' />
            ) : (
              <List disablePadding>
                {birthdays.map((row, idx) => (
                  <React.Fragment key={row.employee_id}>
                    {idx > 0 && <Divider component='li' />}
                    <ListItem sx={{px: 2.5, py: 1.5}}>
                      <ListItemAvatar>
                        <Avatar sx={{bgcolor: 'success.lighter', color: 'success.main'}}>
                          <CakeRounded fontSize='small' />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant='body2' fontWeight={600}>
                            {row.employee_name}
                            <Typography
                              component='span'
                              variant='caption'
                              color='text.secondary'
                              sx={{ml: 1}}>
                              {row.emp_code}
                            </Typography>
                          </Typography>
                        }
                        secondary={
                          <Typography variant='caption' color='text.secondary'>
                            {row.department_name}
                          </Typography>
                        }
                      />
                      <Typography variant='body2' fontWeight={600} color='success.main'>
                        {fmtShortDate(row.dob)}
                      </Typography>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </SectionPaper>
        </Grid>

        {/* Anniversaries */}
        <Grid size={{xs: 12, md: 6}}>
          <SectionPaper title='Work Anniversaries (Next 30 Days)' sx={{height: '100%'}}>
            {anniversaries.length === 0 ? (
              <EmptyState message='No upcoming work anniversaries in the next 30 days.' />
            ) : (
              <List disablePadding>
                {anniversaries.map((row, idx) => (
                  <React.Fragment key={row.employee_id}>
                    {idx > 0 && <Divider component='li' />}
                    <ListItem sx={{px: 2.5, py: 1.5}}>
                      <ListItemAvatar>
                        <Avatar sx={{bgcolor: 'primary.lighter', color: 'primary.main'}}>
                          <CelebrationRounded fontSize='small' />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant='body2' fontWeight={600}>
                            {row.employee_name}
                            <Typography
                              component='span'
                              variant='caption'
                              color='text.secondary'
                              sx={{ml: 1}}>
                              {row.emp_code}
                            </Typography>
                          </Typography>
                        }
                        secondary={
                          <Typography variant='caption' color='text.secondary'>
                            {row.department_name}
                          </Typography>
                        }
                      />
                      <Chip
                        icon={<WorkRounded sx={{fontSize: 14}} />}
                        label={`${row.completing_years} ${row.completing_years === 1 ? 'Year' : 'Years'}`}
                        size='small'
                        color='primary'
                        variant='outlined'
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </SectionPaper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ComplianceTrackerTab;
