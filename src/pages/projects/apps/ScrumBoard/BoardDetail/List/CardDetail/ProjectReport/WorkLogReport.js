import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  Fade,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { ArrowForward, FilterAlt } from '@mui/icons-material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment as DateAdapter } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { capitalize } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { getEmployeeListAction, workLogReportAction } from 'redux/actions/payrollDashboard_actions';
import CommonSearch from 'utils/commonSearch';
import toMomentOrNull from 'utils/DateFixer';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const REPORT_FETCH_LIMIT = 5000;
const AUTHOR_COLUMN_WIDTH = 228;
const TOTAL_COLUMN_WIDTH = 114;
const DATE_COLUMN_WIDTH = 88;
const STICKY_NAME_LEFT = 0;
const STICKY_TOTAL_LEFT = AUTHOR_COLUMN_WIDTH;
const TOOLBAR_HEIGHT = 52;
const FOOTER_BOTTOM_OFFSET = 0;
const RANGE_PRESETS = [
  { key: 'thisWeek', label: 'This week' },
  { key: 'thisMonth', label: 'This month' },
  { key: 'lastMonth', label: 'Last month' },
  // { key: 'custom', label: 'Custom' },
];

const getRangePresetDates = (rangeKey) => {
  switch (rangeKey) {
    case 'thisWeek':
      return {
        fromDate: moment().startOf('week'),
        toDate: moment().endOf('week'),
      };
    case 'thisMonth':
      return {
        fromDate: moment().startOf('month'),
        toDate: moment().endOf('month'),
      };
    case 'lastMonth':
      return {
        fromDate: moment().subtract(1, 'month').startOf('month'),
        toDate: moment().subtract(1, 'month').endOf('month'),
      };
    default:
      return null;
  }
};

const formatHours = (value) => {
  const numberValue = Number(value || 0);

  if (!numberValue) {
    return '';
  }

  const fixedValue = numberValue.toFixed(2);
  return `${fixedValue.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')}h`;
};

const formatTotalHours = (value) => {
  const numberValue = Number(value || 0);
  const fixedValue = numberValue.toFixed(2);
  return `${fixedValue.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')}h`;
};

const getDateColumns = (fromDate, toDate) => {
  const start = moment.min(moment(fromDate), moment(toDate)).startOf('day');
  const end = moment.max(moment(fromDate), moment(toDate)).startOf('day');
  const columns = [];
  const cursor = start.clone();

  while (cursor.isSameOrBefore(end, 'day')) {
    columns.push(cursor.format('YYYY-MM-DD'));
    cursor.add(1, 'day');
  }

  return columns;
};

const buildEmployeeName = (employee) => {
  const firstName = employee?.first_name || '';
  const lastName = employee?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || employee?.full_name || 'Unknown Employee';
};

const normalizeEmployeeId = (value, fallbackValue) => {
  if (value === null || value === undefined || value === '') {
    return String(fallbackValue || 'unknown');
  }

  return String(value);
};

const stringToColor = (name) => {
  const safeName = name || 'Unknown';
  let hash = 0;

  for (let i = 0; i < safeName.length; i += 1) {
    hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
};

const getInitials = (name) => {
  const safeName = (name || 'Unknown').trim();
  const parts = safeName.split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return 'U';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const buildMatrix = (rows, employees, fromDate, toDate) => {
  const dateColumns = getDateColumns(fromDate, toDate);
  const groupedRows = new Map();
  const footerTotals = dateColumns.reduce((acc, dateKey) => {
    acc[dateKey] = 0;
    return acc;
  }, {});

  employees.forEach((employee) => {
    const employeeId = normalizeEmployeeId(
      employee.employee_id || employee.emp_id,
      buildEmployeeName(employee),
    );

    if (!groupedRows.has(employeeId)) {
      groupedRows.set(employeeId, {
        employeeId,
        full_name: buildEmployeeName(employee),
        total: 0,
        values: dateColumns.reduce((acc, dateKey) => {
          acc[dateKey] = 0;
          return acc;
        }, {}),
      });
    }
  });

  rows.forEach((row) => {
    const employeeId = normalizeEmployeeId(row.emp_id, row.full_name);
    const fullName = row.full_name || 'Unknown Employee';
    const workDate = row.work_date ? moment(row.work_date).format('YYYY-MM-DD') : null;
    const totalHours = Number(row.total_hours || 0);

    if (!groupedRows.has(employeeId)) {
      groupedRows.set(employeeId, {
        employeeId,
        full_name: fullName,
        total: 0,
        values: dateColumns.reduce((acc, dateKey) => {
          acc[dateKey] = 0;
          return acc;
        }, {}),
      });
    }

    const employeeRow = groupedRows.get(employeeId);

    if (employeeRow.full_name === 'Unknown Employee' && fullName !== 'Unknown Employee') {
      employeeRow.full_name = fullName;
    }

    if (workDate && Object.prototype.hasOwnProperty.call(employeeRow.values, workDate)) {
      employeeRow.values[workDate] = Number(employeeRow.values[workDate] || 0) + totalHours;
      employeeRow.total += totalHours;
    }

    if (workDate && typeof footerTotals[workDate] === 'number') {
      footerTotals[workDate] += totalHours;
    }
  });

  const matrixRows = Array.from(groupedRows.values()).sort((left, right) =>
    left.full_name.localeCompare(right.full_name),
  );

  const grandTotal = matrixRows.reduce((sum, row) => sum + row.total, 0);

  return {
    dateColumns,
    rows: matrixRows,
    footerTotals,
    grandTotal,
  };
};

const downloadCsv = (fileName, headers, rows) => {
  const escapeCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.map(escapeCell).join(',')]
    .concat(rows.map((row) => row.map(escapeCell).join(',')))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const WorkLogReport = ({ project_id: projectId }) => {
  const dispatch = useDispatch();
  const {
    PayrolldashboardReducers: { getWorkLogReport, getEmployeeList },
  } = useSelector((state) => state);

  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const [filterOpen, setFilterOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedRange, setSelectedRange] = useState('thisWeek');
  const [formData, setFormData] = useState(() => getRangePresetDates('thisWeek'));
  const [formErrors, setFormErrors] = useState({
    fromDate: null,
    toDate: null,
  });

  const reportRows = useMemo(() => {
    if (Array.isArray(getWorkLogReport)) {
      return getWorkLogReport;
    }

    if (Array.isArray(getWorkLogReport?.data)) {
      return getWorkLogReport.data;
    }

    return [];
  }, [getWorkLogReport]);

  const allEmployees = useMemo(() => (Array.isArray(getEmployeeList) ? getEmployeeList : []), [getEmployeeList]);

  const fetchReport = async (nextFormData = formData, nextSearchString = searchValue) => {
    const payload = {
      searchString: (nextSearchString || '').trim(),
      numPerPage: REPORT_FETCH_LIMIT,
      pageCount: 0,
      fromDate: moment(nextFormData.fromDate).format('YYYY-MM-DD'),
      toDate: moment(nextFormData.toDate).format('YYYY-MM-DD'),
      project_id: projectId,
    };

    await dispatch(workLogReportAction(payload, setModalTypeHandler, setLoaderStatusHandler));
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const isInitialSearchRef = useRef(true);
  useEffect(() => {
    if (isInitialSearchRef.current) {
      isInitialSearchRef.current = false;
      return undefined;
    }

    const handle = setTimeout(() => {
      fetchReport(formData, searchValue);
    }, 400);

    return () => clearTimeout(handle);
  }, [searchValue]);

  useEffect(() => {
    if (!allEmployees.length) {
      dispatch(getEmployeeListAction());
    }
  }, [allEmployees.length, dispatch]);

  const matrixData = useMemo(
    () => buildMatrix(reportRows, allEmployees, formData.fromDate, formData.toDate),
    [reportRows, allEmployees, formData.fromDate, formData.toDate],
  );

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return matrixData.rows;
    }

    return matrixData.rows.filter((row) => row.full_name.toLowerCase().includes(normalizedSearch));
  }, [matrixData.rows, searchValue]);

  const filteredFooterTotals = useMemo(() => {
    const totals = matrixData.dateColumns.reduce((acc, dateKey) => {
      acc[dateKey] = 0;
      return acc;
    }, {});

    filteredRows.forEach((row) => {
      matrixData.dateColumns.forEach((dateKey) => {
        totals[dateKey] += Number(row.values[dateKey] || 0);
      });
    });

    return totals;
  }, [filteredRows, matrixData.dateColumns]);

  const filteredGrandTotal = useMemo(
    () => filteredRows.reduce((sum, row) => sum + Number(row.total || 0), 0),
    [filteredRows],
  );

  const validateForm = (name, value) => {
    if (!value) {
      setFormErrors((prevState) => ({
        ...prevState,
        [name]: `${capitalize(name.replace(/([A-Z])/g, ' $1').trim())} is required`,
      }));
      return false;
    }

    setFormErrors((prevState) => ({
      ...prevState,
      [name]: null,
    }));
    return true;
  };

  const validateDateRange = (nextFormData) => {
    const { fromDate, toDate } = nextFormData;
    if (fromDate && toDate && moment(fromDate).isAfter(moment(toDate), 'day')) {
      setFormErrors((prevState) => ({
        ...prevState,
        fromDate: 'From date must be on or before To date',
        toDate: 'To date must be on or after From date',
      }));
      return false;
    }
    return true;
  };

  const handleChange = (name, value) => {
    const nextFormData = { ...formData, [name]: value };
    setFormData(nextFormData);
    validateForm(name, value);
    validateDateRange(nextFormData);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const fromValid = validateForm('fromDate', formData.fromDate);
    const toValid = validateForm('toDate', formData.toDate);

    if (!fromValid || !toValid) {
      return;
    }

    await fetchReport();
    setFilterOpen(false);
  };

  const handleClear = async () => {
    const clearedFormData = getRangePresetDates('thisWeek');

    setSelectedRange('thisWeek');
    setFormData(clearedFormData);
    setFormErrors({
      fromDate: null,
      toDate: null,
    });
    setSearchValue('');

    await fetchReport(clearedFormData);
    setFilterOpen(false);
  };

  const handleSearch = (event) => {
    setSearchValue(event.target.value);
  };

  const applyRangePreset = async (rangeKey) => {
    setSelectedRange(rangeKey);

    if (rangeKey === 'custom') {
      return;
    }

    const nextFormData = getRangePresetDates(rangeKey);
    setFormData(nextFormData);
    setFormErrors({
      fromDate: null,
      toDate: null,
    });
    await fetchReport(nextFormData);
  };

  const handleInlineDateChange = async (name, value) => {
    const nextFormData = {
      ...formData,
      [name]: value,
    };

    setSelectedRange('custom');
    setFormData(nextFormData);
    const fieldValid = validateForm(name, value);
    const rangeValid = validateDateRange(nextFormData);

    if (fieldValid && rangeValid && nextFormData.fromDate && nextFormData.toDate) {
      await fetchReport(nextFormData);
    }
  };

  const cancelSearch = () => {
    setSearchValue('');
  };

  const handleExport = () => {
    const headers = [
      'Employee',
      'Total',
      ...matrixData.dateColumns.map((dateKey) => moment(dateKey).format('DD MMM YYYY')),
    ];

    const rows = filteredRows.map((row) => [
      row.full_name,
      formatTotalHours(row.total),
      ...matrixData.dateColumns.map((dateKey) => formatHours(row.values[dateKey])),
    ]);

    rows.push([
      'Total',
      formatTotalHours(filteredGrandTotal),
      ...matrixData.dateColumns.map((dateKey) => formatTotalHours(filteredFooterTotals[dateKey])),
    ]);

    downloadCsv('WorkLog_Report.csv', headers, rows);
  };

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          border: '1px solid #d7deea',
          borderRadius: '10px',
          overflow: 'hidden',
          backgroundColor: '#fff',
        }}
      >

        <Box
          sx={{
            px: 1.75,
            minHeight: TOOLBAR_HEIGHT,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            borderBottom: '1px solid #dfe6f1',
            flexWrap: 'wrap',
            backgroundColor: '#f8fafc',
          }}
        >
          <Typography
            variant='h6'
            sx={{ fontWeight: 700, fontSize: 15, color: '#1e293b', lineHeight: 1.2 }}
          >
            Work Log Report
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              flexWrap: 'wrap',
            }}
          >
              <Tooltip title='Export' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
                <IconButton onClick={handleExport} size='small' sx={{ color: '#6b7280' }}>
                  <FileDownloadIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title='Filter' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
                <IconButton onClick={() => setFilterOpen(true)} size='small' sx={{ color: '#6b7280' }}>
                  <FilterAlt />
                </IconButton>
              </Tooltip>

              <Box
                sx={{
                  width: { xs: '100%', sm: 220 },
                  minWidth: { xs: '100%', sm: 220 },
                  '& .MuiInputBase-root': {
                    height: 34,
                    borderRadius: '18px',
                    backgroundColor: '#eef2f7',
                  },
                  '& .MuiInputBase-input': {
                    fontSize: 13,
                    color: '#475569',
                  },
                }}
              >
                <CommonSearch
                  searchVal={searchValue}
                  cancelSearch={cancelSearch}
                  requestSearch={handleSearch}
                />
              </Box>
          </Box>
        </Box>

        <LocalizationProvider dateAdapter={DateAdapter}>
          <Box
            sx={{
              mx: 1.75,
              mt: 1.5,
              mb: 1.25,
              px: 1.5,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              flexWrap: 'wrap',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
            }}
          >
            <Typography
              sx={{
                minWidth: 44,
                color: '#2d2f31',
                fontSize: 14,
                fontWeight: 500,
                lineHeight: 1.15,
              }}
            >
              Date range
            </Typography>
            <Box sx={{ display: 'inline-flex', flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
              {RANGE_PRESETS.map((preset) => {
                const isSelected = selectedRange === preset.key;

                return (
                  <Button
                    key={preset.key}
                    variant='outlined'
                    onClick={() => applyRangePreset(preset.key)}
                    sx={{
                      minWidth: 'unset',
                      px: 2.1,
                      py: 1.05,
                      color: isSelected ? '#ffffff' : '#111827',
                      borderColor: isSelected ? '#2563eb' : '#d1d5db',
                      backgroundColor: isSelected ? '#2563eb' : '#ffffff',
                      borderRadius: '9px',
                      fontSize: 13,
                      fontWeight: 700,
                      lineHeight: 1.15,
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#2563eb',
                        backgroundColor: isSelected ? '#1d4ed8' : '#eff6ff',
                        color: isSelected ? '#ffffff' : '#2563eb',
                      },
                    }}
                  >
                    {preset.key === 'custom' ? '' : preset.label}
                  </Button>
                );
              })}
            </Box>
            <Box sx={{ display: 'inline-flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: { xs: '100%', md: 164 },
                  minWidth: { xs: '100%', md: 164 },
                }}
              >
                <DatePicker
                  format='DD-MM-YYYY'
                  value={toMomentOrNull(formData.fromDate)}
                  onChange={(date) => handleInlineDateChange('fromDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: formErrors.fromDate !== null,
                      helperText: formErrors.fromDate,
                    },
                  }}
                  sx={{
                    p:2,
                    '& .MuiOutlinedInput-root': {
                      height: 42,
                      borderRadius: '7px',
                      color: '#1e293b',
                      backgroundColor: '#f8fafc',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#296cc9',
                    },
                    '& .MuiSvgIcon-root': {
                      color: '#296cc9',
                    },
                    '& .MuiInputBase-input': {
                      py: 0.9,
                      fontSize: 13,
                      fontWeight: 700,
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#ef4444',
                      mx: 0,
                    },
                  }}
                />
              </Box>
              <Typography sx={{ color: '#64748b', fontSize: 20, lineHeight: 1, px: 0.25 }}>
                <ArrowForwardIcon sx={{ fontSize: 16 }} />
              </Typography>
              <Box
                sx={{
                  width: { xs: '100%', md: 164 },
                  minWidth: { xs: '100%', md: 164 },
                }}
              >
                <DatePicker
                  format='DD-MM-YYYY'
                  value={toMomentOrNull(formData.toDate)}
                  onChange={(date) => handleInlineDateChange('toDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: formErrors.toDate !== null,
                      helperText: formErrors.toDate,
                    },
                  }}
                  sx={{
                    p:2,
                    '& .MuiOutlinedInput-root': {
                      height: 42,
                      borderRadius: '7px',
                      color: '#1e293b',
                      backgroundColor: '#f8fafc',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#296cc9',
                    },
                    '& .MuiSvgIcon-root': {
                      color: '#296cc9',
                    },
                    '& .MuiInputBase-input': {
                      py: 0.9,
                      fontSize: 13,
                      fontWeight: 700,
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#ef4444',
                      mx: 0,
                    },
                  }}
                />
              </Box>
            </Box>

          </Box>
        </LocalizationProvider>

        <TableContainer
          sx={{
            maxHeight: '70vh',
            overflow: 'auto',
            backgroundColor: '#fbfcfe',
          }}
        >
          <Table stickyHeader size='small'>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    position: 'sticky',
                    left: STICKY_NAME_LEFT,
                    zIndex: 4,
                    width: AUTHOR_COLUMN_WIDTH,
                    minWidth: AUTHOR_COLUMN_WIDTH,
                    maxWidth: AUTHOR_COLUMN_WIDTH,
                    backgroundColor: '#ffffff',
                    borderRight: '1px solid #dfe6f1',
                    fontWeight: 700,
                    boxSizing: 'border-box',
                  }}
                >
                  Employees
                </TableCell>
                <TableCell
                  align='center'
                  sx={{
                    position: 'sticky',
                    left: STICKY_TOTAL_LEFT,
                    zIndex: 4,
                    width: TOTAL_COLUMN_WIDTH,
                    minWidth: TOTAL_COLUMN_WIDTH,
                    maxWidth: TOTAL_COLUMN_WIDTH,
                    backgroundColor: '#fff3bf',
                    borderRight: '1px solid #dfe6f1',
                    fontWeight: 700,
                    boxSizing: 'border-box',
                  }}
                >
                  Total
                </TableCell>
                {matrixData.dateColumns.map((dateKey) => (
                  <TableCell
                    key={dateKey}
                    align='center'
                    sx={{
                      width: DATE_COLUMN_WIDTH,
                      minWidth: DATE_COLUMN_WIDTH,
                      maxWidth: DATE_COLUMN_WIDTH,
                      backgroundColor: '#e8f1ff',
                      borderRight: '1px solid #dfe6f1',
                      fontWeight: 700,
                      boxSizing: 'border-box',
                    }}
                  >
                    <Box sx={{ fontSize: 12, fontWeight: 700 }}>
                      {moment(dateKey).format('DD')}
                    </Box>
                    <Box sx={{ fontSize: 11, color: '#64748b' }}>
                      {moment(dateKey).format('ddd')}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredRows.map((row) => (
                <TableRow hover key={row.employeeId}>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: STICKY_NAME_LEFT,
                      zIndex: 2,
                      backgroundColor: '#ffffff',
                      borderRight: '1px solid #edf1f7',
                      width: AUTHOR_COLUMN_WIDTH,
                      minWidth: AUTHOR_COLUMN_WIDTH,
                      maxWidth: AUTHOR_COLUMN_WIDTH,
                      boxSizing: 'border-box',
                      height: 46,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          flexShrink: 0,
                          bgcolor: stringToColor(row.full_name),
                          color: '#fff',
                        }}
                      >
                        {getInitials(row.full_name)}
                      </Avatar>
                      <Typography
                        variant='body2'
                        sx={{
                          fontWeight: 600,
                          color: '#1e293b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          minWidth: 0,
                        }}
                      >
                        {row.full_name}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell
                    align='center'
                    sx={{
                      position: 'sticky',
                      left: STICKY_TOTAL_LEFT,
                      zIndex: 2,
                      backgroundColor: '#fff9db',
                      borderRight: '1px solid #edf1f7',
                      width: TOTAL_COLUMN_WIDTH,
                      minWidth: TOTAL_COLUMN_WIDTH,
                      maxWidth: TOTAL_COLUMN_WIDTH,
                      fontWeight: 700,
                      boxSizing: 'border-box',
                    }}
                  >
                    {formatTotalHours(row.total)}
                  </TableCell>

                  {matrixData.dateColumns.map((dateKey) => (
                    <TableCell
                      key={`${row.employeeId}-${dateKey}`}
                      align='center'
                      sx={{
                        width: DATE_COLUMN_WIDTH,
                        minWidth: DATE_COLUMN_WIDTH,
                        maxWidth: DATE_COLUMN_WIDTH,
                        borderRight: '1px solid #edf1f7',
                        boxSizing: 'border-box',
                      }}
                    >
                      {formatHours(row.values[dateKey])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}

              {!filteredRows.length && (
                <TableRow>
                  <TableCell
                    colSpan={matrixData.dateColumns.length + 2}
                    align='center'
                    sx={{ py: 5, color: '#64748b' }}
                  >
                    No work log data found for the selected filters.
                  </TableCell>
                </TableRow>
              )}

              {!!filteredRows.length && (
                <TableRow>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: STICKY_NAME_LEFT,
                      zIndex: 3,
                      bottom: FOOTER_BOTTOM_OFFSET,
                      backgroundColor: '#f7f9fc',
                      borderTop: '2px solid #d7deea',
                      borderRight: '1px solid #dfe6f1',
                      fontWeight: 800,
                      width: AUTHOR_COLUMN_WIDTH,
                      minWidth: AUTHOR_COLUMN_WIDTH,
                      maxWidth: AUTHOR_COLUMN_WIDTH,
                      boxSizing: 'border-box',
                      boxShadow: '0 -1px 0 #d7deea',
                    }}
                  >
                    Total
                  </TableCell>
                  <TableCell
                    align='center'
                    sx={{
                      position: 'sticky',
                      left: STICKY_TOTAL_LEFT,
                      zIndex: 3,
                      bottom: FOOTER_BOTTOM_OFFSET,
                      backgroundColor: '#fff3bf',
                      borderTop: '2px solid #d7deea',
                      borderRight: '1px solid #dfe6f1',
                      fontWeight: 800,
                      width: TOTAL_COLUMN_WIDTH,
                      minWidth: TOTAL_COLUMN_WIDTH,
                      maxWidth: TOTAL_COLUMN_WIDTH,
                      boxSizing: 'border-box',
                      boxShadow: '0 -1px 0 #d7deea',
                    }}
                  >
                    {formatTotalHours(filteredGrandTotal)}
                  </TableCell>
                  {matrixData.dateColumns.map((dateKey) => (
                    <TableCell
                      key={`total-${dateKey}`}
                      align='center'
                      sx={{
                        position: 'sticky',
                        bottom: FOOTER_BOTTOM_OFFSET,
                        backgroundColor: '#f7f9fc',
                        borderTop: '2px solid #d7deea',
                        borderRight: '1px solid #dfe6f1',
                        fontWeight: 800,
                        width: DATE_COLUMN_WIDTH,
                        minWidth: DATE_COLUMN_WIDTH,
                        maxWidth: DATE_COLUMN_WIDTH,
                        boxSizing: 'border-box',
                        boxShadow: '0 -1px 0 #d7deea',
                      }}
                    >
                      {formatTotalHours(filteredFooterTotals[dateKey])}
                    </TableCell>
                  ))}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)}>
        <LocalizationProvider dateAdapter={DateAdapter}>
          <Box component='form' onSubmit={handleSubmit}>
            <Grid container spacing={3} padding={3}>
              <Grid item xs={12}>
                <DatePicker
                  label='From Date'
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'filled',
                      required: true,
                      error: formErrors.fromDate !== null,
                      helperText: formErrors.fromDate,
                    },
                  }}
                  value={toMomentOrNull(formData.fromDate)}
                  onChange={(date) => handleChange('fromDate', date)}
                />
              </Grid>

              <Grid item xs={12}>
                <DatePicker
                  label='To Date'
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'filled',
                      required: true,
                      error: formErrors.toDate !== null,
                      helperText: formErrors.toDate,
                    },
                  }}
                  value={toMomentOrNull(formData.toDate)}
                  onChange={(date) => handleChange('toDate', date)}
                />
              </Grid>
            </Grid>

            <Grid container justifyContent='flex-end' spacing={2} padding={3} sx={{ pt: 0 }}>
              <Grid item>
                <Button variant='contained' color='error' onClick={handleClear}>
                  Clear
                </Button>
              </Grid>
              <Grid item>
                <Button variant='contained' color='inherit' onClick={() => setFilterOpen(false)}>
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button variant='contained' color='primary' type='submit'>
                  Submit
                </Button>
              </Grid>
            </Grid>
          </Box>
        </LocalizationProvider>
      </Dialog>
    </Box>
  );
};

export default WorkLogReport;