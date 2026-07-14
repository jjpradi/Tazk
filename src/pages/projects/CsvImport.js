import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  FormControlLabel,
  Checkbox,
  Slide,
  IconButton,
  Autocomplete,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  LinearProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import { read, utils } from 'xlsx-js-style';
import { useDispatch, useSelector } from 'react-redux';
import { importCsvAction, getProjectsAction } from 'redux/actions/payrollDashboard_actions';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});

const steps = ['Upload CSV', 'Preview & Mapping', 'Import Results'];

const CsvImport = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [csvSummary, setCsvSummary] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({ phase: 'idle', done: 0, total: 0 });

  // Import options
  const [importComments, setImportComments] = useState(true);
  const [importWorkLogs, setImportWorkLogs] = useState(true);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  // Employee mapping
  const [employeeMapping, setEmployeeMapping] = useState({});
  const [unmatchedNames, setUnmatchedNames] = useState([]);

  // Get employee list from Redux store
  const employeeList = useSelector(state => state?.PayrolldashboardReducers?.getEmployeeList || []);

  const resetState = useCallback(() => {
    setActiveStep(0);
    setFile(null);
    setParsedData(null);
    setCsvSummary(null);
    setImporting(false);
    setImportResult(null);
    setImportError(null);
    setImportComments(true);
    setImportWorkLogs(true);
    setSkipDuplicates(true);
    setEmployeeMapping({});
    setUnmatchedNames([]);
    setUploadProgress({ phase: 'idle', done: 0, total: 0 });
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };

    const sampleColumns = [
    { name: 'Project key', required: true, description: 'Short project code (e.g. TZK)' },
    { name: 'Summary', required: true, description: 'Task title / summary' },
    { name: 'Issue key', required: true, description: 'Unique issue key (e.g. TZK-101)' },
    { name: 'Issue Type', required: true, description: 'Story, Task, Bug, Epic, Sub-task' },
    { name: 'Status', required: false, description: 'To Do, In Progress, Done' },
    { name: 'Priority', required: false, description: 'Highest, High, Medium, Low, Lowest' },
    { name: 'Assignee', required: false, description: 'User display name' },
    { name: 'Reporter', required: false, description: 'User display name' },
    { name: 'Custom field (Epic Name)', required: false, description: 'Epic this task belongs to' },
    { name: 'Custom field (Sprint)', required: false, description: 'Sprint name (auto-created if new)' },
  ];

  const sampleRows = [
    {
      'Project key': 'TZK',
      'Summary': 'Setup authentication module',
      'Issue key': 'TZK-101',
      'Issue Type': 'Story',
      'Status': 'In Progress',
      'Priority': 'High',
      'Assignee': 'Jane Doe',
      'Reporter': 'John Smith',
      'Custom field (Epic Name)': 'User Management',
      'Custom field (Sprint)': 'Sprint 1',
    },
    {
      'Project key': 'TZK',
      'Summary': 'Fix login redirect bug',
      'Issue key': 'TZK-102',
      'Issue Type': 'Bug',
      'Status': 'To Do',
      'Priority': 'Medium',
      'Assignee': 'Jane Doe',
      'Reporter': 'John Smith',
      'Custom field (Epic Name)': 'User Management',
      'Custom field (Sprint)': 'Sprint 1',
    },
  ];

  const handleDownloadSample = () => {

    const SAMPLE_ROWS = [
      {
        summary: 'claims -> show the claims list',
        issueKey: 'EW-21012',
        issueId: '67159',
        issueType: 'Task',
        status: 'To Do',
        project: {
          key: 'EW', name: 'ERP Web', type: 'software', lead: 'Venkat',
          id: '557058:dc84464a-b4c6-4e37-9f1e-dc84464a1234',
          description: 'ERP Web platform project'
        },
        priority: 'Medium',
        resolution: '',
        assignee: { name: 'Srimen S', id: '712020:d0473226-327e-41e3-a3e3-1d33e5860dab' },
        reporter: { name: 'Srimen S', id: '712020:d0473226-327e-41e3-a3e3-1d33e5860dab' },
        creator:  { name: 'Srimen S', id: '712020:d0473226-327e-41e3-a3e3-1d33e5860dab' },
        created: '01/Oct/24 10:58 AM',
        updated: '21/Oct/24 10:58 AM',
        lastViewed: '',
        resolved: '',
        components: '',
        dueDate: '',
        votes: 0,
        description: 'Show claims list on dashboard with filters',
        environment: '',
        watchers: [
          { name: 'Srimen S', id: '712020:d0473226-327e-41e3-a3e3-1d33e5860dab' }
        ],
        logWork: [
          { authorId: '557058:6ea6e311-a9aa-4b45-a6a4-9a9598d94585', date: '21/Oct/24 10:58 AM', workLogId: '3ece32c4-7efa-4e56-876c-1b2f05b1fa5b', seconds: 7200 }
        ],
        estimates: { original: 7200, remaining: 7200, timeSpent: 0, workRatio: '0%', sumOriginal: 7200, sumRemaining: 7200, sumTimeSpent: 0 },
        security: '',
        inwardLink: '',
        outwardLink: '',
        attachments: [],
        customFields: {
          approvals: 'com.atlassian.servicedesk.plugins.approvals.internal.customfield.ApprovalsCFValue@63361d22',
          epicLink: 'EW-1083',
          epicName: 'Payroll',
          storyPoints: 3,
          satisfaction: ''
        },
        sprints: ['ERP-WEB Sprint 17'],
        comments: [],
        parent: { id: '64986', key: 'EW-2045', summary: 'MS-Payroll' },
        statusCategory: { name: 'To Do', changed: '01/Oct/24 10:58 AM' }
      },
      {
        summary: 'Error log -> track failed logins',
        issueKey: 'EW-8768',
        issueId: '38484',
        issueType: 'Task',
        status: 'To Do',
        project: {
          key: 'EW', name: 'ERP Web', type: 'software', lead: 'Venkat',
          id: '557058:dc84464a-b4c6-4e37-9f1e-dc84464a1234',
          description: 'ERP Web platform project'
        },
        priority: 'Highest',
        resolution: '',
        assignee: { name: 'shreenivi', id: '6207873135a62a006845a462' },
        reporter: { name: 'arun',      id: '557058:6ea6e311-a9aa-4b45-a6a4-9a9598d94585' },
        creator:  { name: 'arun',      id: '557058:6ea6e311-a9aa-4b45-a6a4-9a9598d94585' },
        created: '21/Oct/24 10:58 AM',
        updated: '21/Oct/24 10:58 AM',
        lastViewed: '',
        resolved: '',
        components: '',
        dueDate: '',
        votes: 0,
        description: 'Capture failed login attempts in error log table',
        environment: '',
        watchers: [
          { name: 'arun',    id: '557058:6ea6e311-a9aa-4b45-a6a4-9a9598d94585' },
          { name: 'Benazir', id: '60d093eaf6505400693bda8d' }
        ],
        logWork: [],
        estimates: { original: 10800, remaining: 10800, timeSpent: 0, workRatio: '0%', sumOriginal: 10800, sumRemaining: 10800, sumTimeSpent: 0 },
        security: '',
        inwardLink: '',
        outwardLink: '',
        attachments: [],
        customFields: {
          approvals: 'com.atlassian.servicedesk.plugins.approvals.internal.customfield.ApprovalsCFValue@4e63d1ac',
          epicLink: 'EW-1083',
          epicName: 'Payroll',
          storyPoints: 2,
          satisfaction: ''
        },
        sprints: ['ERP-WEB Sprint 14'],
        comments: [],
        parent: { id: '27664', key: 'EW-1083', summary: 'Payroll' },
        statusCategory: { name: 'To Do', changed: '21/Oct/24 10:58 AM' }
      },
      {
        summary: 'Inventory denomination flow',
        issueKey: 'EW-2083',
        issueId: '29420',
        issueType: 'Task',
        status: 'Done',
        project: {
          key: 'EW', name: 'ERP Web', type: 'software', lead: 'Venkat',
          id: '557058:dc84464a-b4c6-4e37-9f1e-dc84464a1234',
          description: 'ERP Web platform project'
        },
        priority: 'Highest',
        resolution: 'Done',
        assignee: { name: 'Pathrala', id: '712020:84b0e7ed-8f2c-428e-82e5-a79b0e8f03d9' },
        reporter: { name: 'arun',     id: '557058:6ea6e311-a9aa-4b45-a6a4-9a9598d94585' },
        creator:  { name: 'arun',     id: '557058:6ea6e311-a9aa-4b45-a6a4-9a9598d94585' },
        created:    '03/Nov/23 09:45 AM',
        updated:    '06/Nov/23 04:20 PM',
        lastViewed: '06/Nov/23 05:10 PM',
        resolved:   '06/Nov/23 04:20 PM',
        components: '',
        dueDate: '',
        votes: 0,
        description: 'Fix denomination computation in inventory module',
        environment: '',
        watchers: [
          { name: 'shreenivas', id: '6207873135a62a006845a462' }
        ],
        logWork: [
          { authorId: '557058:6ea6e311-a9aa-4b45-a6a4-9a9598d94585', date: '03/Nov/23 10:00 AM', workLogId: '3ece32c4-7efa-4e56-876c-1b2f05b1fa5b', seconds: 21600 },
          { authorId: '557058:6ea6e311-a9aa-4b45-a6a4-9a9598d94585', date: '06/Nov/23 11:30 AM', workLogId: '3ece32c4-7efa-4e56-876c-1b2f05b1fa5c', seconds: 32400 }
        ],
        estimates: { original: 21600, remaining: 0, timeSpent: 54000, workRatio: '250%', sumOriginal: 21600, sumRemaining: 0, sumTimeSpent: 54000 },
        security: '',
        inwardLink: 'EW-8225',
        outwardLink: '',
        attachments: [
          '28/Aug/24 2:43 PM;712020:84b0e7ed-8f2c-428e-82e5-a79b0e8f03d9;inventory-flow.png'
        ],
        customFields: {
          approvals: 'com.atlassian.servicedesk.plugins.approvals.internal.customfield.ApprovalsCFValue@5e06b641',
          epicLink: 'EW-1061',
          epicName: 'Testing',
          storyPoints: 4,
          satisfaction: ''
        },
        sprints: ['ERP-WEB Sprint 12'],
        comments: [
          '06/Nov/23 04:20 PM;arun;Tested on staging - OK'
        ],
        parent: { id: '27621', key: 'EW-1061', summary: 'Testing' },
        statusCategory: { name: 'Done', changed: '06/Nov/23 04:20 PM' }
      }
    ];

    const maxOf  = (key) => Math.max(1, ...SAMPLE_ROWS.map(r => (r[key] || []).length));
    const fmtLog = (l) => `${l.authorId};${l.date};ug:${l.workLogId};${l.seconds}`;
    const escape = (v) => {
      const s = v === null || v === undefined ? '' : String(v);
      return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const N = {
      watchers:    maxOf('watchers'),
      logWork:     maxOf('logWork'),
      attachments: maxOf('attachments'),
      sprints:     maxOf('sprints'),
      comments:    maxOf('comments')
    };

    const one   = (header, get) => [{ header, get }];
    const many  = (header, n, get) => Array.from({ length: n }, (_, i) => ({ header, get: (r) => get(r, i) }));

    const stamp = Date.now().toString(36).slice(-4).toUpperCase();
    const uniqueProjectKey  = `SMP${stamp}`;
    const uniqueProjectName = `Sample Project ${stamp}`;

    const schema = [
      ...one('Summary',             r => r.summary),
      ...one('Issue key',           r => r.issueKey),
      ...one('Issue id',            r => r.issueId),
      ...one('Issue Type',          r => r.issueType),
      ...one('Status',              r => r.status),
      ...one('Project key',         () => uniqueProjectKey),
      ...one('Project name',        () => uniqueProjectName),
      ...one('Project type',        r => r.project.type),
      ...one('Project lead',        r => r.project.lead),
      ...one('Project Id',          r => r.project.id),
      ...one('Project description', r => r.project.description),
      ...one('Priority',            r => r.priority),
      ...one('Resolution',          r => r.resolution),
      ...one('Assignee',            r => r.assignee.name),
      ...one('Assignee Id',         r => r.assignee.id),
      ...one('Reporter',            r => r.reporter.name),
      ...one('Reporter Id',         r => r.reporter.id),
      ...one('Creator',             r => r.creator.name),
      ...one('Creator Id',          r => r.creator.id),
      ...one('Created',             r => r.created),
      ...one('Updated',             r => r.updated),
      ...one('Last Viewed',         r => r.lastViewed),
      ...one('Resolved',            r => r.resolved),
      ...one('Component/s',         r => r.components),
      ...one('Due date',            r => r.dueDate),
      ...one('Votes',               r => r.votes),
      ...one('Description',         r => r.description),
      ...one('Environment',         r => r.environment),
      ...many('Watchers',    N.watchers, (r, i) => r.watchers[i]?.name ?? ''),
      ...many('Watchers Id', N.watchers, (r, i) => r.watchers[i]?.id ?? ''),
      ...many('Log Work',    N.logWork,  (r, i) => r.logWork[i] ? fmtLog(r.logWork[i]) : ''),
      ...one('Original estimate',     r => r.estimates.original),
      ...one('Remaining Estimate',    r => r.estimates.remaining),
      ...one('Time Spent',            r => r.estimates.timeSpent),
      ...one('Work Ratio',            r => r.estimates.workRatio),
      ...one('Σ Original Estimate',   r => r.estimates.sumOriginal),
      ...one('Σ Remaining Estimate',  r => r.estimates.sumRemaining),
      ...one('Σ Time Spent',          r => r.estimates.sumTimeSpent),
      ...one('Security Level',                r => r.security),
      ...one('Inward issue link (Blocks)',    r => r.inwardLink),
      ...one('Outward issue link (Blocks)',   r => r.outwardLink),
      ...many('Attachment', N.attachments, (r, i) => r.attachments[i] ?? ''),
      ...one('Custom field (Approvals)',      r => r.customFields.approvals),
      ...one('Custom field (Epic Link)',      r => r.customFields.epicLink),
      ...one('Custom field (Epic Name)',      r => r.customFields.epicName),
      ...one('Custom field (Story Points)',   r => r.customFields.storyPoints),
      ...one('Custom field (Satisfaction)',   r => r.customFields.satisfaction),
      ...many('Sprint',  N.sprints,  (r, i) => r.sprints[i] ?? ''),
      ...many('Comment', N.comments, (r, i) => r.comments[i] ?? ''),
      ...one('Parent id',                  r => r.parent.id),
      ...one('Parent key',                 r => r.parent.key),
      ...one('Parent summary',             r => r.parent.summary),
      ...one('Status Category',            r => r.statusCategory.name),
      ...one('Status Category Changed',    r => r.statusCategory.changed)
    ];

    const headerRow = schema.map(c => c.header);
    const dataRows  = SAMPLE_ROWS.map(r => schema.map(c => c.get(r)));

    const csv = [headerRow, ...dataRows]
      .map(row => row.map(escape).join(','))
      .join('\r\n') + '\r\n';

    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `projects-import-sample-${uniqueProjectKey}-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setImportError('Please select a CSV file');
      return;
    }

    if (selectedFile.size > 30 * 1024 * 1024) {
      setImportError('File size must be under 30MB');
      return;
    }

    setImportError(null);
    setFile(selectedFile);

    // Parse CSV client-side for preview using xlsx-js-style
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const workbook = read(evt.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        // Two-pass parse: array-of-arrays first so we can preserve duplicate
        // "Sprint" column headers (Jira emits one per sprint in a task's history).
        const aoa = utils.sheet_to_json(sheet, { header: 1, defval: '' });
        const headerRow = aoa[0] || [];
        const sprintColIndexes = [];
        headerRow.forEach((h, idx) => {
          if (String(h).trim() === 'Sprint') sprintColIndexes.push(idx);
        });
        const data = aoa.slice(1).map((r) => {
          const obj = {};
          headerRow.forEach((h, idx) => {
            const key = String(h);
            if (key.trim() === 'Sprint') return; // handled below
            obj[key] = r[idx] ?? '';
          });
          const sprints = sprintColIndexes
            .map((idx) => String(r[idx] ?? '').trim())
            .filter(Boolean);
          obj.__sprints = sprints;
          // Keep a single "Sprint" property for downstream code that expects it
          // (csvSummary builder, preview table). Use the current/rightmost value.
          obj.Sprint = sprints.length ? sprints[sprints.length - 1] : '';
          return obj;
        });
        const columns = data.length > 0 ? Object.keys(data[0]) : [];

        if (data.length === 0) {
          setImportError('CSV is empty.');
          return;
        }

        const missing = sampleColumns
          .filter((c) => c.required)
          .map((c) => c.name)
          .filter((col) => !columns.includes(col));

        if (missing.length) {
          setImportError(`Missing required column(s): ${missing.join(', ')}.`);
          return;
        }

        setParsedData({ data, meta: { fields: columns } });

        // Build summary
        const projects = new Set();
        const epics = new Set();
        const sprints = new Set();
        const assignees = new Set();
        const issueTypes = {};

        // Jira CSVs sometimes omit "Project key"; derive from "Issue key" prefix.
        const deriveProjectKey = (issueKey) => {
          const m = String(issueKey || '').trim().match(/^(.+)-\d+$/);
          return m ? m[1] : '';
        };
        data.forEach(row => {
          const pk = row['Project key'] || deriveProjectKey(row['Issue key']);
          if (pk) projects.add(pk);
          if (row['Custom field (Epic Name)']) epics.add(row['Custom field (Epic Name)']);
          const sprintCol = row['Custom field (Sprint)'] || row['Sprint'] || '';
          if (sprintCol) sprints.add(sprintCol);
          if (row['Assignee']) assignees.add(row['Assignee']);
          if (row['Reporter']) assignees.add(row['Reporter']);
          const type = row['Issue Type'] || 'Unknown';
          issueTypes[type] = (issueTypes[type] || 0) + 1;
        });

        setCsvSummary({
          totalRows: data.length,
          projects: [...projects],
          epics: [...epics],
          sprints: [...sprints],
          assignees: [...assignees],
          issueTypes,
          columns
        });

        setUnmatchedNames([...assignees]);
        setActiveStep(1);
      } catch (error) {
        setImportError(`Failed to parse CSV: ${error.message}`);
      }
    };
    reader.onerror = () => {
      setImportError('Failed to read file');
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect({ target: { files: [droppedFile] } });
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleImport = async () => {
    if (!parsedData?.data?.length) return;
    setImporting(true);
    setImportError(null);
    setUploadProgress({ phase: 'upload', done: 0, total: 1 });

    try {
      const result = await dispatch(importCsvAction(
        parsedData.data,
        { importComments, importWorkLogs, skipDuplicates, employeeMapping },
        (p) => setUploadProgress(p)
      ));
      setImportResult(result);
      dispatch(getProjectsAction({}));
    } catch (err) {
      setImportError(err?.response?.data?.message || err?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleEmployeeMap = (userName, employee) => {
    setEmployeeMapping(prev => ({
      ...prev,
      [userName]: employee ? employee.employee_id : null
    }));
  };

  // --- RENDER STEPS ---

  const renderUploadStep = () => (
  <Box sx={{ textAlign: 'center', py: 4 }}>
    <Box
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      sx={{
        border: '2px dashed',
        borderColor: 'primary.main',
        borderRadius: 2,
        p: 6,
        cursor: 'pointer',
        backgroundColor: 'action.hover',
        '&:hover': { backgroundColor: 'action.selected' },
        transition: 'background-color 0.2s'
      }}
      onClick={() => document.getElementById('csv-import-input').click()}
    >
      <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Drag & drop your CSV file here
      </Typography>
      <Typography variant="body2" color="text.secondary">
        or click to browse (max 30MB)
      </Typography>
      <input
        id="csv-import-input"
        type="file"
        accept=".csv"
        hidden
        onChange={handleFileSelect}
      />
    </Box>

    {importError && (
      <Alert severity="error" sx={{ mt: 2 }}>{importError}</Alert>
    )}

    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
      Expected format: CSV with columns like Project key, Issue key, Summary, Issue Type, Status, Assignee, Reporter.
    </Typography>

    <Paper
      variant="outlined"
      sx={{
        mt: 3,
        p: 2,
        textAlign: 'left',
        borderRadius: 2,
        backgroundColor: '#fafafa'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Sample CSV Format
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadSample}
        >
          Download Sample CSV
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Use the columns below as headers in your CSV. Required columns are marked. The file must be UTF-8 encoded.
      </Typography>

      <Accordion defaultExpanded disableGutters sx={{ backgroundColor: 'transparent', boxShadow: 'none', '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, minHeight: 32, '& .MuiAccordionSummary-content': { my: 0 } }}>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>Expected Columns ({sampleColumns.length})</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0, pt: 0 }}>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Column</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 90 }}>Required</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sampleColumns.map(col => (
                  <TableRow key={col.name}>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{col.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={col.required ? 'Yes' : 'Optional'}
                        size="small"
                        color={col.required ? 'error' : 'default'}
                        variant={col.required ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>{col.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
            Example Rows
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 180 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {sampleColumns.map(col => (
                    <TableCell key={col.name} sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                      {col.name}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sampleRows.map((row, idx) => (
                  <TableRow key={idx}>
                    {sampleColumns.map(col => (
                      <TableCell key={col.name} sx={{ whiteSpace: 'nowrap' }}>
                        {row[col.name] || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
        Tip: Prepare your CSV with the columns above, or click <strong>Download Sample CSV</strong> to get a ready-to-edit template.
      </Typography>
    </Paper>
  </Box>
);


  const renderPreviewStep = () => {
    if (!parsedData || !csvSummary) return null;

    return (
      <Box>
        {/* File info */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <DescriptionIcon color="primary" />
          <Typography variant="subtitle1">{file?.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            ({(file?.size / 1024).toFixed(1)} KB)
          </Typography>
        </Box>

        {/* Summary chips */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          <Chip label={`${csvSummary.totalRows} tasks`} color="primary" />
          <Chip label={`${csvSummary.projects.length} project(s)`} variant="outlined" />
          {csvSummary.epics.length > 0 && (
            <Chip label={`${csvSummary.epics.length} epic(s)`} variant="outlined" />
          )}
          {csvSummary.sprints.length > 0 && (
            <Chip label={`${csvSummary.sprints.length} sprint(s)`} variant="outlined" />
          )}
          <Chip label={`${csvSummary.assignees.length} assignee(s)`} variant="outlined" />
        </Box>

        {/* Issue type breakdown */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Issue Types:</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {Object.entries(csvSummary.issueTypes).map(([type, count]) => (
              <Chip key={type} label={`${type}: ${count}`} size="small" variant="outlined" />
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Data preview table */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">Data Preview (first 5 rows)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {['Summary', 'Issue key', 'Issue Type', 'Status', 'Priority', 'Assignee'].map(col => (
                      <TableCell key={col} sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>{col}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parsedData.data.slice(0, 5).map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row['Summary'] || '-'}
                      </TableCell>
                      <TableCell>{row['Issue key'] || '-'}</TableCell>
                      <TableCell>{row['Issue Type'] || '-'}</TableCell>
                      <TableCell>{row['Status'] || '-'}</TableCell>
                      <TableCell>{row['Priority'] || '-'}</TableCell>
                      <TableCell>{row['Assignee'] || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>

        {/* Employee Mapping */}
        {unmatchedNames.length > 0 && (
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2">Employee Mapping</Typography>
                <Chip label={`${unmatchedNames.length} name(s)`} size="small" color="warning" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Map CSV users to existing employees. Unmatched names will be auto-matched by the system or left unassigned.
              </Typography>
              {unmatchedNames.map(name => (
                <Grid container spacing={2} key={name} sx={{ mb: 1, alignItems: 'center' }}>
                  <Grid item xs={4}>
                    <Typography variant="body2">{name}</Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Typography variant="body2" color="text.secondary">→</Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Autocomplete
                      size="small"
                      options={employeeList}
                      getOptionLabel={(opt) => `${opt.first_name || ''} ${opt.last_name || ''}`.trim()}
                      onChange={(_, value) => handleEmployeeMap(name, value)}
                      renderInput={(params) => (
                        <TextField {...params} placeholder="Search employee..." variant="outlined" size="small" />
                      )}
                    />
                  </Grid>
                </Grid>
              ))}
            </AccordionDetails>
          </Accordion>
        )}

        {/* Sprint preview */}
        {csvSummary.sprints.length > 0 && (
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">Sprints Found ({csvSummary.sprints.length})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                These sprints will be auto-created if they don't already exist in the project.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {csvSummary.sprints.map(s => (
                  <Chip key={s} label={s} size="small" variant="outlined" />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Import options */}
        <Typography variant="subtitle2" gutterBottom>Import Options:</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <FormControlLabel
            control={<Checkbox checked={importComments} onChange={(e) => setImportComments(e.target.checked)} size="small" />}
            label={<Typography variant="body2">Import comments</Typography>}
          />
          <FormControlLabel
            control={<Checkbox checked={importWorkLogs} onChange={(e) => setImportWorkLogs(e.target.checked)} size="small" />}
            label={<Typography variant="body2">Import work logs</Typography>}
          />
          <FormControlLabel
            control={<Checkbox checked={skipDuplicates} onChange={(e) => setSkipDuplicates(e.target.checked)} size="small" />}
            label={<Typography variant="body2">Skip duplicate tasks (by issue key)</Typography>}
          />
        </Box>

        {importError && (
          <Alert severity="error" sx={{ mt: 2 }}>{importError}</Alert>
        )}
      </Box>
    );
  };

  const renderResultStep = () => {
    if (importing) {
      const pct = uploadProgress.phase === 'commit'
        ? 85
        : uploadProgress.phase === 'done'
          ? 100
          : uploadProgress.phase === 'upload' && uploadProgress.total > 0
            ? Math.round((uploadProgress.done / uploadProgress.total) * 80)
            : 0;

      const label = uploadProgress.phase === 'upload'
        ? `Uploading batch ${uploadProgress.done} of ${uploadProgress.total}...`
        : uploadProgress.phase === 'commit'
          ? 'Finalizing import...'
          : uploadProgress.phase === 'done'
            ? 'Almost done'
            : 'Preparing...';

      return (
        <Box sx={{ py: 6, px: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>{label}</Typography>
          <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 4, mb: 1 }} />
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            {pct}%
          </Typography>
        </Box>
      );
    }

    if (importError && !importResult) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" color="error.main" gutterBottom>Import Failed</Typography>
          <Alert severity="error">{importError}</Alert>
        </Box>
      );
    }

    if (!importResult?.summary) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <DescriptionIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>Ready to create project</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {csvSummary?.totalRows || 0} task(s) across {csvSummary?.projects?.length || 0} project(s) will be imported.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click <strong>Done</strong> to create the project.
          </Typography>
        </Box>
      );
    }

    const s = importResult.summary;

    return (
      <Box>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
          <Typography variant="h6">Import Completed</Typography>
        </Box>

        {/* Summary cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Projects Created', value: s.projects?.created || 0, color: 'primary.main' },
            { label: 'Projects Existing', value: s.projects?.existing || 0, color: 'text.secondary' },
            { label: 'Epics Created', value: s.epics?.created || 0, color: 'secondary.main' },
            { label: 'Sprints Created', value: s.sprints?.created || 0, color: 'info.main' },
            { label: 'Tasks Created', value: s.tasks?.created || 0, color: 'success.main' },
            { label: 'Tasks Skipped', value: s.tasks?.skipped || 0, color: 'warning.main' },
            { label: 'Comments', value: s.comments?.created || 0, color: 'text.secondary' },
            { label: 'Work Logs', value: s.workLogs?.created || 0, color: 'text.secondary' },
          ].map(item => (
            <Grid item xs={3} key={item.label}>
              <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ color: item.color, fontWeight: 'bold' }}>
                  {item.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">{item.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Unmatched assignees */}
        {s.unmatchedAssignees?.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Unmatched Assignees:</Typography>
            <Typography variant="body2">
              {s.unmatchedAssignees.join(', ')} — these tasks were imported without an assignee.
            </Typography>
          </Alert>
        )}

        {/* Errors */}
        {s.errors?.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningAmberIcon color="error" />
                <Typography variant="subtitle2">{s.errors.length} Error(s)</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Row</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Issue Key</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Error</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {s.errors.map((err, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{err.row}</TableCell>
                        <TableCell>{err.issueKey || '-'}</TableCell>
                        <TableCell>{err.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        )}
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Import CSV
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && renderUploadStep()}
        {activeStep === 1 && renderPreviewStep()}
        {activeStep === 2 && renderResultStep()}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {activeStep === 1 && (
          <>
            <Button onClick={() => { resetState(); }} color="inherit">
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => setActiveStep(2)}
            >
              {`Review ${csvSummary?.totalRows || 0} Tasks`}
            </Button>
          </>
        )}
        {activeStep === 2 && (
          importResult ? (
            <Button variant="contained" onClick={handleClose}>
              Close
            </Button>
          ) : (
            <>
              <Button onClick={() => setActiveStep(1)} color="inherit" disabled={importing}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleImport}
                disabled={importing}
                startIcon={importing ? <CircularProgress size={16} /> : null}
              >
                {importing ? 'Creating...' : 'Done'}
              </Button>
            </>
          )
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CsvImport;
