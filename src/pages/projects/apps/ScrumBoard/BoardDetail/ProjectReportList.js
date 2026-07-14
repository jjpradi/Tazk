import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import PlaylistAddCheckOutlinedIcon from '@mui/icons-material/PlaylistAddCheckOutlined';
import BugReportIcon from '@mui/icons-material/BugReport';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import FolderSpecialOutlinedIcon from '@mui/icons-material/FolderSpecialOutlined';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import moment from 'moment';
import CommonSearch from 'utils/commonSearch';
import {IssueTypeIcon} from 'pages/projects/CommenData';


const ISSUE_TYPE_LABELS = {
  1: 'Task',
  3: 'Story',
  4: 'Bug',
  5: 'Sub Task',
};

const STATUS_COLORS = {
  'in progress': { bg: '#e3f2fd', color: '#0d47a1', label: 'In Progress' },
  'to do':       { bg: '#f5f5f5', color: '#616161', label: 'To Do' },
  'completed':   { bg: '#e8f5e9', color: '#1b5e20', label: 'Completed' },
  'done':        { bg: '#e8f5e9', color: '#1b5e20', label: 'Done' },
};

const PRIORITY_META = {
  highest: { label: 'Highest', color: '#b71c1c', dot: '#ef5350' },
  high:    { label: 'High',    color: '#c62828', dot: '#ef9a9a' },
  medium:  { label: 'Medium',  color: '#e65100', dot: '#ffb74d' },
  low:     { label: 'Low',     color: '#2e7d32', dot: '#81c784' },
  none:    { label: 'None',    color: '#9e9e9e', dot: '#bdbdbd' },
};

const AVATAR_SIZE = 30;
const AVATAR_OVERLAP = 22;
const MAX_VISIBLE_AVATARS = 5;
const AVATAR_COLORS = ['#f44336', '#ff9800', '#4caf50', '#2196f3', '#9c27b0'];
const selectedRing = { boxShadow: '0 0 0 2px #1976d2' };


const formatDate = (date) => {
  if (!date) return '—';
  const parsed = moment(date);
  return parsed.isValid() ? parsed.format('MMM D, YYYY') : '—';
};

const getDisplayName = (...values) => {
  const found = values.find((v) => typeof v === 'string' && v.trim() && v.trim() !== '-');
  return found?.trim() || '—';
};

const getTaskType = (task) => {
  const typeName = String(task?.issue_type_name || task?.task_type || task?.type || '').trim().toLowerCase();
  if (typeName === 'subtask') return 'Sub Task';
  if (typeName === 'bug')     return 'Bug';
  if (typeName === 'story')   return 'Story';
  if (typeName === 'task')    return 'Task';
  return ISSUE_TYPE_LABELS[Number(task?.issue_type)] || 'Task';
};

const getTaskKey = (task, projectKey) =>
  task?.custom_task_id ||
  task?.task_id ||
  task?.task_key ||
  task?.key ||
  (task?.id ? `${projectKey || 'TSK'}-${task.id}` : '—');

const getPriorityMeta = (priority) => {
  const val = String(priority || '').toLowerCase();
  if (val.includes('highest') || val === '4') return PRIORITY_META.highest;
  if (val.includes('high')    || val === '3') return PRIORITY_META.high;
  if (val.includes('medium')  || val === '2') return PRIORITY_META.medium;
  if (val.includes('low')     || val === '1') return PRIORITY_META.low;
  return PRIORITY_META.none;
};

const getStatusMeta = (statusName) => {
  const key = String(statusName || '').toLowerCase();
  return STATUS_COLORS[key] || { bg: '#fce4ec', color: '#880e4f', label: statusName || '—' };
};

const buildTaskRow = (task, projectKey, epicTitle, level) => ({
  id:         task?.id || task?.task_id,
  type:       getTaskType(task),
  key:        getTaskKey(task, projectKey),
  summary:    task?.task_name || task?.title || '—',
  status:     task?.status_name || task?.STATUS || '—',
  comments:   Array.isArray(task?.comments) ? task.comments.length : (task?.comments_count || 0),
  sprint:     task?.sprint_name || task?.sprint || '—',
  assignee:   getDisplayName(task?.assigneeName, task?.assignee_name, task?.assignee),
  dueDate:    formatDate(task?.due_date || task?.dueDate),
  priority:   getPriorityMeta(task?.priority_name || task?.priority),
  labels:     task?.epic_name || epicTitle || '—',
  created:    formatDate(task?.createdAt || task?.creationDate),
  updated:    formatDate(task?.updatedAt || task?.modificationDate),
  reporter:   getDisplayName(task?.reporterName, task?.reporter_name, task?.reporter),
  epicTitle:  epicTitle || task?.epic_name || '',
  level,
  childCount: (task?.stories?.length || 0) + (task?.tasks?.length || 0) + (task?.subtasks?.length || 0) + (task?.directSubtasks?.length || 0),
});

const collectRows = (task, projectKey, epicTitle, level = 0) => {
  if (!task || (!task.task_name && !task.title)) return [];
  const rows = [buildTaskRow(task, projectKey, epicTitle, level)];
  [task?.stories, task?.tasks, task?.directSubtasks, task?.subtasks].forEach((group) => {
    (group || []).forEach((child) => {
      rows.push(...collectRows(child, projectKey, epicTitle, level + 1));
    });
  });
  return rows;
};


const EpicGroupHeader = ({
  title,
  count,
  open,
  onToggle,
  groupChecked,
  groupIndeterminate,
  onGroupSelect,
}) => (
  <TableRow
    onClick={onToggle}
    sx={{
      cursor: 'pointer',
      bgcolor: 'action.hover',
      '&:hover': { bgcolor: 'action.selected' },
      userSelect: 'none',
    }}
  >
    <TableCell colSpan={15} sx={{ py: 0.75, px: 2, borderBottom: '2px solid', borderColor: 'divider' }}>
      <Box display='flex' alignItems='center' gap={1}>
        <Checkbox
          size='small'
          checked={groupChecked}
          indeterminate={groupIndeterminate}
          onChange={(e) => onGroupSelect?.(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          sx={{ p: 0.25 }}
        />
        <IconButton size='small' sx={{ p: 0.25 }} tabIndex={-1}>
          {open ? <KeyboardArrowDownIcon fontSize='small' /> : <KeyboardArrowRightIcon fontSize='small' />}
        </IconButton>
        <FolderSpecialOutlinedIcon fontSize='small' sx={{ color: 'primary.main' }} />
        <Typography variant='body2' fontWeight={600} sx={{ flexGrow: 1 }}>
          {title || 'No Epic'}
        </Typography>
        <Chip
          label={`${count} item${count !== 1 ? 's' : ''}`}
          size='small'
          sx={{ height: 20, fontSize: 11, bgcolor: 'primary.50', color: 'primary.main' }}
        />
      </Box>
    </TableCell>
  </TableRow>
);


const TypeIcon = ({ type }) => {
  const props = { fontSize: 'small' };
  if (type === 'Bug')      return <BugReportIcon {...props} sx={{ color: '#d32f2f' }} />;
  if (type === 'Story')    return <BookmarkIcon  {...props} sx={{ color: '#7b1fa2' }} />;
  if (type === 'Sub Task') return <SubdirectoryArrowRightIcon {...props} sx={{ color: '#0288d1' }} />;
  return <TaskAltIcon {...props} color='primary' />;
};


const TaskRow = ({ row, expandedRows, onToggleRow, selected, onToggleSelect }) => {
  const isExpandable = row.childCount > 0;
  const isExpanded = expandedRows.has(row.key);
  const statusMeta = getStatusMeta(row.status);

  return (
    <TableRow hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
      {/* Selection checkbox */}
      <TableCell padding='checkbox' sx={{ width: 44 }}>
        <Checkbox
          size='small'
          checked={selected}
          onChange={() => onToggleSelect?.(row.id)}
          onClick={(e) => e.stopPropagation()}
          disabled={row.id == null}
        />
      </TableCell>
      {/* Expand toggle */}
      <TableCell sx={{ width: 44, p: 0.5 }}>
        {isExpandable ? (
          <IconButton size='small' onClick={() => onToggleRow(row.key)}>
            {isExpanded
              ? <KeyboardArrowDownIcon fontSize='small' />
              : <KeyboardArrowRightIcon fontSize='small' />}
          </IconButton>
        ) : null}
      </TableCell>

      {/* Type */}
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Box display='flex' alignItems='center' gap={0.75}>
          <IssueTypeIcon type={row.type} />

          <Typography variant='caption' color='text.secondary'>{row.type}</Typography>
        </Box>
      </TableCell>

      {/* Key */}
      <TableCell>
        <Typography variant='caption' sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
          {row.key}
        </Typography>
      </TableCell>

      {/* Summary with indent + hierarchy connector */}
      <TableCell sx={{ minWidth: 280 }}>
        <Box
          sx={{
            pl: row.level * 2.5,
            borderLeft: row.level > 0 ? '2px solid' : 'none',
            borderColor: 'divider',
            ml: row.level > 0 ? 0.5 : 0,
          }}
        >
          <Typography variant='body2' fontWeight={row.level === 0 ? 500 : 400}>
            {row.summary}
          </Typography>
          {row.epicTitle && row.level === 0 ? (
            <Typography variant='caption' color='text.secondary' noWrap>
              {row.epicTitle}
            </Typography>
          ) : null}
        </Box>
      </TableCell>

      {/* Status */}
      <TableCell>
        <Chip
          size='small'
          label={statusMeta.label}
          sx={{
            bgcolor: statusMeta.bg,
            color: statusMeta.color,
            fontWeight: 500,
            fontSize: 11,
            height: 22,
            border: 'none',
          }}
        />
      </TableCell>

      {/* Comments */}
      <TableCell align='center'>
        <Typography variant='body2' color={row.comments > 0 ? 'text.primary' : 'text.disabled'}>
          {row.comments || '—'}
        </Typography>
      </TableCell>

      {/* Sprint */}
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant='caption' color='text.secondary'>{row.sprint}</Typography>
      </TableCell>

      {/* Assignee */}
      <TableCell>
        <Box display='flex' alignItems='center' gap={0.75}>
          {row.assignee !== '—' ? (
            <Tooltip title={row.assignee}>
              <Avatar sx={{ width: 24, height: 24, fontSize: 11, bgcolor: 'primary.light' }}>
                {row.assignee[0]?.toUpperCase()}
              </Avatar>
            </Tooltip>
          ) : (
            <Avatar sx={{ width: 24, height: 24, fontSize: 11, bgcolor: 'grey.200', color: 'text.disabled' }}>
              ?
            </Avatar>
          )}
          <Typography
            variant='body2'
            color={row.assignee === '—' ? 'text.disabled' : 'text.primary'}
          >
            {row.assignee === '—' ? 'Unassigned' : row.assignee}
          </Typography>
        </Box>
      </TableCell>

      {/* Due date */}
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant='caption' color={row.dueDate === '—' ? 'text.disabled' : 'text.primary'}>
          {row.dueDate}
        </Typography>
      </TableCell>

      {/* Priority */}
      <TableCell>
        <Box display='flex' alignItems='center' gap={0.75}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: row.priority.dot,
              flexShrink: 0,
            }}
          />
          <Typography variant='body2' sx={{ color: row.priority.color, fontWeight: 500 }}>
            {row.priority.label}
          </Typography>
        </Box>
      </TableCell>

      {/* Labels */}
      <TableCell>
        <Typography variant='caption' color='text.secondary' noWrap sx={{ maxWidth: 120, display: 'block' }}>
          {row.labels}
        </Typography>
      </TableCell>

      {/* Created */}
      <TableCell>
        <Typography variant='caption' color='text.secondary'>{row.created}</Typography>
      </TableCell>

      {/* Updated */}
      <TableCell>
        <Typography variant='caption' color='text.secondary'>{row.updated}</Typography>
      </TableCell>

      {/* Reporter */}
      <TableCell>
        <Typography variant='body2'>{row.reporter}</Typography>
      </TableCell>
    </TableRow>
  );
};


const ProjectReportList = ({
  tasks = [],
  projectKey = '',
  searchVal = '',
  requestSearch,
  cancelSearch,
  onLoadMore,
  loading = false,
  totalCount,
  onDeleteTasks,
}) => {
  const [collapsedEpics, setCollapsedEpics] = useState(new Set());
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selectedEmpId, setSelectedEmpId] = useState('all');
  const [avatarOverflowAnchorEl, setAvatarOverflowAnchorEl] = useState(null);
  const [selectedRowIds, setSelectedRowIds] = useState(() => new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const scrollRef = useRef(null);
  const sentinelRef = useRef(null);

  const handleAvatarClick = useCallback((empId) => {
    setSelectedEmpId((prev) => (prev === empId && empId !== 'all' ? 'all' : empId));
  }, []);

  const toggleEpic = useCallback((epicTitle) => {
    setCollapsedEpics((prev) => {
      const next = new Set(prev);
      next.has(epicTitle) ? next.delete(epicTitle) : next.add(epicTitle);
      return next;
    });
  }, []);

  const toggleRow = useCallback((rowKey) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(rowKey) ? next.delete(rowKey) : next.add(rowKey);
      return next;
    });
  }, []);

  const toggleRowSelect = useCallback((rowId) => {
    if (rowId == null) return;
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      next.has(rowId) ? next.delete(rowId) : next.add(rowId);
      return next;
    });
  }, []);

  const setGroupSelection = useCallback((rowIds, shouldSelect) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      rowIds.forEach((id) => {
        if (id == null) return;
        if (shouldSelect) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  }, []);

  // Build epic-grouped structure
  const epicGroups = useMemo(() => {
    const taskList = Array.isArray(tasks) ? tasks : [];

    const hasHierarchy = taskList.some(
      (item) => Array.isArray(item?.stories) || Array.isArray(item?.tasks) || Array.isArray(item?.directSubtasks),
    );

    if (!hasHierarchy) {
      // Flat list — group under single virtual epic
      const rows = taskList
        .filter((t) => t && (t.task_name || t.title))
        .map((t, i) => buildTaskRow(t, projectKey, t?.epic_name || '', 0, i));
      return [{ title: '', rows }];
    }

    return taskList.map((epicGroup) => {
      const epicTitle = epicGroup?.title || epicGroup?.epic_name || epicGroup?.name || '';
      const allRows = [
        ...(epicGroup?.stories || []).flatMap((s) => collectRows(s, projectKey, epicTitle, 0)),
        ...(epicGroup?.tasks || []).flatMap((t) => collectRows(t, projectKey, epicTitle, 0)),
        ...(epicGroup?.directSubtasks || []).flatMap((s) => collectRows(s, projectKey, epicTitle, 0)),
      ];

      return { title: epicTitle, rows: allRows };
    });
  }, [tasks, projectKey]);

  // Unique assignees from the full task set (independent of search/employee filter)
  const employeeList = useMemo(() => {
    const seen = new Map();
    const walk = (task) => {
      if (!task) return;
      const name = getDisplayName(task?.assigneeName, task?.assignee_name, task?.assignee);
      if (name && name !== '—' && !seen.has(name)) {
        seen.set(name, { name });
      }
      [task?.stories, task?.tasks, task?.directSubtasks, task?.subtasks].forEach((g) =>
        (g || []).forEach(walk),
      );
    };
    (Array.isArray(tasks) ? tasks : []).forEach((epic) => {
      walk(epic);
      [epic?.stories, epic?.tasks, epic?.directSubtasks].forEach((g) => (g || []).forEach(walk));
    });
    return Array.from(seen.values());
  }, [tasks]);

  // Filter epic groups by selected employee
  const filteredEpicGroups = useMemo(() => {
    if (selectedEmpId === 'all') return epicGroups;
    return epicGroups.map((g) => ({
      ...g,
      rows: g.rows.filter((r) => {
        if (selectedEmpId === 'unassigned') return r.assignee === '—';
        return r.assignee === selectedEmpId;
      }),
    }));
  }, [epicGroups, selectedEmpId]);

  const allVisibleRowIds = useMemo(
    () =>
      filteredEpicGroups.flatMap((g) =>
        g.rows.map((r) => r.id).filter((id) => id != null),
      ),
    [filteredEpicGroups],
  );

  const selectedCount = selectedRowIds.size;
  const visibleSelectedCount = allVisibleRowIds.reduce(
    (acc, id) => (selectedRowIds.has(id) ? acc + 1 : acc),
    0,
  );
  const allVisibleSelected =
    allVisibleRowIds.length > 0 && visibleSelectedCount === allVisibleRowIds.length;
  const someVisibleSelected = visibleSelectedCount > 0 && !allVisibleSelected;

  const toggleSelectAllVisible = useCallback(() => {
    if (allVisibleSelected) {
      setGroupSelection(allVisibleRowIds, false);
    } else {
      setGroupSelection(allVisibleRowIds, true);
    }
  }, [allVisibleRowIds, allVisibleSelected, setGroupSelection]);

  // Clear stale selections when the underlying visible data changes
  useEffect(() => {
    setSelectedRowIds((prev) => {
      if (prev.size === 0) return prev;
      const valid = new Set(allVisibleRowIds);
      let changed = false;
      const next = new Set();
      prev.forEach((id) => {
        if (valid.has(id)) next.add(id);
        else changed = true;
      });
      return changed ? next : prev;
    });
  }, [allVisibleRowIds]);

  const handleBulkDeleteClick = useCallback(() => {
    if (selectedRowIds.size === 0) return;
    setDeleteDialogOpen(true);
  }, [selectedRowIds]);

  const handleCloseDeleteDialog = useCallback(() => {
    if (deleting) return;
    setDeleteDialogOpen(false);
  }, [deleting]);

  const handleConfirmDelete = useCallback(async () => {
    if (selectedRowIds.size === 0 || typeof onDeleteTasks !== 'function') {
      setDeleteDialogOpen(false);
      return;
    }
    const ids = Array.from(selectedRowIds);
    setDeleting(true);
    try {
      await onDeleteTasks(ids);
      setSelectedRowIds(new Set());
      setDeleteDialogOpen(false);
    } catch (err) {
      // Parent surfaces the error via alerts; leave selection intact.
    } finally {
      setDeleting(false);
    }
  }, [selectedRowIds, onDeleteTasks]);

  const avatarItems = useMemo(
    () => [
      {
        key: 'all',
        label: 'All',
        name: 'All Tasks',
        tooltip: 'All Tasks',
        bgColor: '#1976d2',
        selected: selectedEmpId === 'all',
        onClick: () => handleAvatarClick('all'),
      },
      {
        key: 'unassigned',
        label: 'U',
        name: 'Unassigned',
        tooltip: 'Unassigned Tasks',
        bgColor: '#9e9e9e',
        selected: selectedEmpId === 'unassigned',
        onClick: () => handleAvatarClick('unassigned'),
      },
      ...employeeList.map((emp, index) => ({
        key: emp.name,
        label: emp.name?.[0]?.toUpperCase() || '?',
        name: emp.name,
        tooltip: emp.name,
        bgColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
        selected: selectedEmpId === emp.name,
        onClick: () => handleAvatarClick(emp.name),
      })),
    ],
    [employeeList, selectedEmpId, handleAvatarClick],
  );

  const visibleAvatarItems = avatarItems.slice(0, MAX_VISIBLE_AVATARS);
  const overflowAvatarItems = avatarItems.slice(MAX_VISIBLE_AVATARS);
  const avatarStackCount =
    visibleAvatarItems.length + (overflowAvatarItems.length > 0 ? 1 : 0);
  const avatarStackWidth = Math.max(avatarStackCount, 1) * AVATAR_OVERLAP + AVATAR_SIZE;

  const loadedCount = filteredEpicGroups.reduce((acc, g) => acc + g.rows.length, 0);
  const displayCount = typeof totalCount === 'number' ? totalCount : loadedCount;
  const hasMore = typeof totalCount === 'number' && loadedCount < totalCount;

  useEffect(() => {
    if (!hasMore || loading || !onLoadMore) return undefined;
    const node = sentinelRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore();
      },
      { root: scrollRef.current, rootMargin: '300px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore, loadedCount]);

  // For expanded rows: only show top-level + explicitly expanded subtrees
  // Since rows are already flat with level info, we filter based on parent expansion
  // We track which top-level row keys are expanded; children (level > 0) only show when parent expanded
  const getVisibleRows = (rows) => {
    // Build a visibility map: a child row is visible only if its closest level-0/1 ancestor is expanded
    const visible = [];
    const ancestorStack = []; // stack of {level, key, expanded}

    rows.forEach((row) => {
      // Pop stack entries that are at same or deeper level
      while (ancestorStack.length > 0 && ancestorStack[ancestorStack.length - 1].level >= row.level) {
        ancestorStack.pop();
      }

      if (row.level === 0) {
        visible.push(row);
        ancestorStack.push({ level: row.level, key: row.key, expanded: expandedRows.has(row.key) });
      } else {
        // Show only if every ancestor in stack is expanded
        const allExpanded = ancestorStack.every((a) => a.expanded);
        if (allExpanded) {
          visible.push(row);
          ancestorStack.push({ level: row.level, key: row.key, expanded: expandedRows.has(row.key) });
        }
      }
    });

    return visible;
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      {/* Toolbar */}
      <Box
        px={2}
        py={1.5}
        display='flex'
        flexDirection={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent='space-between'
        gap={2}
        borderBottom='1px solid'
        borderColor='divider'
      >
        <Box display='flex' alignItems='center' gap={2} flexWrap='wrap'>
        <CommonSearch
          searchVal={searchVal}
          requestSearch={requestSearch}
          cancelSearch={cancelSearch}
        />

          {/* Employee filter — stacked avatars */}
          <Box
            sx={{
              position: 'relative',
              display: 'inline-block',
              width: `${avatarStackWidth}px`,
              height: AVATAR_SIZE,
              flexShrink: 0,
            }}
          >
            {visibleAvatarItems.map((avatarItem, index) => (
              <Tooltip
                key={avatarItem.key}
                title={avatarItem.tooltip}
                arrow
                placement='top'
              >
                <span
                  style={{
                    position: 'absolute',
                    left: `${index * AVATAR_OVERLAP}px`,
                    width: AVATAR_SIZE,
                    height: AVATAR_SIZE,
                    display: 'inline-flex',
                  }}
                >
                  <Avatar
                    sx={{
                      width: AVATAR_SIZE,
                      height: AVATAR_SIZE,
                      fontSize: 'small',
                      bgcolor: avatarItem.bgColor,
                      zIndex: avatarStackCount - index + 1,
                      border: '2px solid white',
                      cursor: 'pointer',
                      ...(avatarItem.selected && selectedRing),
                    }}
                    onClick={avatarItem.onClick}
                  >
                    {avatarItem.label}
                  </Avatar>
                </span>
              </Tooltip>
            ))}

            {overflowAvatarItems.length > 0 && (
              <Tooltip
                title={`+${overflowAvatarItems.length} more`}
                arrow
                placement='top'
              >
                <span
                  style={{
                    position: 'absolute',
                    left: `${visibleAvatarItems.length * AVATAR_OVERLAP}px`,
                    width: AVATAR_SIZE,
                    height: AVATAR_SIZE,
                    display: 'inline-flex',
                  }}
                >
                  <Avatar
                    sx={{
                      width: AVATAR_SIZE,
                      height: AVATAR_SIZE,
                      fontSize: 'small',
                      bgcolor: '#4b5563',
                      border: '2px solid white',
                      cursor: 'pointer',
                    }}
                    onClick={(event) => setAvatarOverflowAnchorEl(event.currentTarget)}
                  >
                    +{overflowAvatarItems.length}
                  </Avatar>
                </span>
              </Tooltip>
            )}
          </Box>

          <Popover
            open={Boolean(avatarOverflowAnchorEl)}
            anchorEl={avatarOverflowAnchorEl}
            onClose={() => setAvatarOverflowAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 240,
                maxHeight: 220,
                overflowY: 'auto',
                color: '#f3f4f6',
                border: '1px solid #3f4350',
                p: 2,
              },
            }}
          >
            <Box py={0.5}>
              {overflowAvatarItems.map((avatarItem) => (
                <Box
                  key={avatarItem.key}
                  onClick={() => {
                    avatarItem.onClick();
                    setAvatarOverflowAnchorEl(null);
                  }}
                  sx={{
                    px: 1,
                    py: 0.75,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Checkbox
                    checked={avatarItem.selected}
                    onChange={() => {}}
                    sx={{
                      color: '#9ca3af',
                      '&.Mui-checked': { color: '#60a5fa' },
                      p: 0.5,
                      mr: 1,
                    }}
                  />
                  <Avatar
                    sx={{
                      width: 26,
                      height: 26,
                      fontSize: 12,
                      bgcolor: avatarItem.bgColor,
                      mr: 1.2,
                    }}
                  >
                    {avatarItem.label}
                  </Avatar>
                  <Typography variant='body2' sx={{ color: '#2c2d2e' }}>
                    {avatarItem.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Popover>
        </Box>

        <Box display='flex' alignItems='center' gap={1.5}>
          {selectedCount > 0 && (
            <Button
              variant='contained'
              color='error'
              size='small'
              onClick={handleBulkDeleteClick}
              disabled={deleting}
            >
              Delete ({selectedCount})
            </Button>
          )}
          {/* Legend */}
          {[
            { icon: <PlaylistAddCheckOutlinedIcon sx={{ fontSize: 14, color: '#2196F3'  }} />, label: 'Task' },
            { icon: <AutoStoriesOutlinedIcon sx={{ fontSize: 14, color: '#4CAF50' }} />, label: 'Story' },
            { icon: <BugReportIcon sx={{ fontSize: 14, color:  '#e60909'}} />, label: 'Bug' },
            { icon: <SubdirectoryArrowRightIcon sx={{ fontSize: 14, color: '#2196F3'  }} />, label: 'Sub Task' },
          ].map(({ icon, label }) => (
            <Box key={label} display='flex' alignItems='center' gap={0.5}>
              {icon}
              <Typography variant='caption' color='text.secondary'>{label}</Typography>
            </Box>
          ))}
          <Typography variant='body2' color='text.secondary' sx={{ ml: 1, borderLeft: '1px solid', borderColor: 'divider', pl: 1.5 }}>
            {displayCount} item{displayCount !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Box>

      <TableContainer ref={scrollRef} sx={{ maxHeight: 'calc(100vh - 260px)' }}>
        <Table stickyHeader size='small'>
          <TableHead>
            <TableRow>
              <TableCell padding='checkbox' sx={{ width: 44, bgcolor: 'background.paper' }}>
                <Checkbox
                  size='small'
                  checked={allVisibleSelected}
                  indeterminate={someVisibleSelected}
                  onChange={toggleSelectAllVisible}
                  disabled={allVisibleRowIds.length === 0}
                />
              </TableCell>
              <TableCell sx={{ width: 44, bgcolor: 'background.paper' }} />
              <TableCell sx={{ bgcolor: 'background.paper', whiteSpace: 'nowrap' }}>Type</TableCell>
              <TableCell sx={{ bgcolor: 'background.paper' }}>Key</TableCell>
              <TableCell sx={{ minWidth: 280, bgcolor: 'background.paper' }}>Summary</TableCell>
              <TableCell sx={{ bgcolor: 'background.paper' }}>Status</TableCell>
              <TableCell sx={{ bgcolor: 'background.paper' }} align='center'>Comments</TableCell>
              <TableCell sx={{ bgcolor: 'background.paper', whiteSpace: 'nowrap' }}>Sprint</TableCell>
              <TableCell sx={{ bgcolor: 'background.paper' }}>Assignee</TableCell>
              <TableCell sx={{ bgcolor: 'background.paper', whiteSpace: 'nowrap' }}>Due date</TableCell>
              <TableCell sx={{ bgcolor: 'background.paper' }}>Priority</TableCell>
              <TableCell sx={{ bgcolor: 'background.paper' }}>Labels</TableCell>
              <TableCell sx={{ bgcolor: 'background.paper', whiteSpace: 'nowrap' }}>Created</TableCell>
              <TableCell sx={{ bgcolor: 'background.paper', whiteSpace: 'nowrap' }}>Updated</TableCell>
              <TableCell sx={{ bgcolor: 'background.paper' }}>Reporter</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loadedCount === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={15} align='center'>
                  <Typography variant='body2' color='text.secondary' sx={{ py: 6 }}>
                    {searchVal ? 'No tasks match your search.' : 'No tasks available.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredEpicGroups.map((group) => {
                const isOpen = !collapsedEpics.has(group.title);
                const visibleRows = getVisibleRows(group.rows);
                const groupRowIds = group.rows.map((r) => r.id).filter((id) => id != null);
                const groupSelectedCount = groupRowIds.reduce(
                  (acc, id) => (selectedRowIds.has(id) ? acc + 1 : acc),
                  0,
                );
                const groupChecked =
                  groupRowIds.length > 0 && groupSelectedCount === groupRowIds.length;
                const groupIndeterminate =
                  groupSelectedCount > 0 && groupSelectedCount < groupRowIds.length;

                return (
                  <React.Fragment key={group.title || '__no_epic__'}>
                    <EpicGroupHeader
                      title={group.title || 'No Epic'}
                      count={group.rows.length}
                      open={isOpen}
                      onToggle={() => toggleEpic(group.title)}
                      groupChecked={groupChecked}
                      groupIndeterminate={groupIndeterminate}
                      onGroupSelect={(checked) => setGroupSelection(groupRowIds, checked)}
                    />

                    {/* Rows (or collapsed) */}
                    {isOpen &&
                      visibleRows.map((row) => (
                        <TaskRow
                          key={`${row.id}-${row.key}`}
                          row={row}
                          expandedRows={expandedRows}
                          onToggleRow={toggleRow}
                          selected={selectedRowIds.has(row.id)}
                          onToggleSelect={toggleRowSelect}
                        />
                      ))}
                  </React.Fragment>
                );
              })
            )}
            {(hasMore || loading) && (
              <TableRow>
                <TableCell colSpan={15} align='center' sx={{ py: 2, border: 0 }}>
                  <Box ref={sentinelRef} display='flex' justifyContent='center'>
                    {loading && <CircularProgress size={20} />}
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete task{selectedCount !== 1 ? 's' : ''}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedCount} selected task
            {selectedCount !== 1 ? 's' : ''}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color='primary' disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color='error'
            variant='contained'
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ProjectReportList;