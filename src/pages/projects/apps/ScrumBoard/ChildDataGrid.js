import React, { useEffect, useState, useMemo } from 'react';
import {
  Alert, Avatar, Box, Chip, CircularProgress, Paper, 
  Typography, Divider, Tooltip, TextField, InputAdornment,
  IconButton, Collapse, Button
} from '@mui/material';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import BugReportIcon from '@mui/icons-material/BugReport';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import InboxIcon from '@mui/icons-material/Inbox';
import PayrollDashboardServices from 'services/payrollDashboard_services';
import {IssueTypeIcon} from 'pages/projects/CommenData';


const getPriorityMeta = (priority) => {
  const value = String(priority || '').toLowerCase();
  if (value.includes('highest') || value === '1') return { label: 'Highest', color: '#750909', bgColor: '#fdecec' };
  if (value.includes('high')) return { label: 'High', color: '#e02847', bgColor: '#fdecef' };
  if (value.includes('medium') || value === '2') return { label: 'Medium', color: '#ed6c02', bgColor: '#fff1e5' };
  if (value.includes('low') || value === '3') return { label: 'Low', color: '#2e7d32', bgColor: '#edf7ed' };
  return { label: priority || 'None', color: '#757575', bgColor: '#f5f5f5' };
};

const getStatusMeta = (status) => {
  const value = String(status || '').toLowerCase().trim();
  if (value.includes('backlog')) return { label: 'Backlog', color: '#546e7a', bgColor: '#eceff1' };
  if (value.includes('to do') || value.includes('todo')) return { label: 'To Do', color: '#1565c0', bgColor: '#e3f2fd' };
  if (value.includes('in progress')) return { label: 'In Progress', color: '#00838f', bgColor: '#e0f7fa' };
  if (value.includes('testing') || value.includes('qa')) return { label: 'Testing', color: '#ed6c02', bgColor: '#fff3e0' };
  if (value.includes('done') || value.includes('completed')) return { label: 'Completed', color: '#2e7d32', bgColor: '#edf7ed' };
  return { label: status || 'Unknown', color: '#757575', bgColor: '#f5f5f5' };
};

const getAvatarColor = (name) => {
  if (!name || name === '-') return '#9e9e9e';
  const palette = ['#1e88e5', '#00897b', '#8e24aa', '#f4511e', '#3949ab', '#6d4c41', '#039be5', '#43a047'];
  const hash = Array.from(String(name)).reduce((total, char) => total + char.charCodeAt(0), 0);
  return palette[hash % palette.length];
};


const HierarchyItem = ({ title, type, status, priority, assignee, isSubtask = false, hasChildren, isOpen, onToggle }) => {
  const statusMeta = getStatusMeta(status);
  const priorityMeta = getPriorityMeta(priority);
  
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 1,
        px: 2,
        ml: isSubtask ? 6 : 0,
        position: 'relative',
        bgcolor: isSubtask ? 'transparent' : '#fff',
        borderBottom: '1px solid #f0f0f0',
        '&:hover': { bgcolor: '#f8fbff' },
      }}
    >
      {!isSubtask && hasChildren && (
        <IconButton size="small" onClick={onToggle} sx={{ mr: 0.5 }}>
          {isOpen ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
        </IconButton>
      )}

      <Box sx={{ mr: 1.5, display: 'flex' }}>
        {/* {type === 'Bug' ? <BugReportIcon sx={{ color: '#e02847', fontSize: 18 }} /> : 
         type === 'Task' ? <AssignmentIcon sx={{ color: '#1565c0', fontSize: 18 }} /> : 
         <SubtitlesIcon sx={{ color: '#757575', fontSize: 18 }} />} */}
         <IssueTypeIcon type={type} />

      </Box>

      <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: isSubtask ? 400 : 600, fontSize: '0.85rem' }}>
        {title}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Priority Chip */}
        <Tooltip title="Priority">
          <Chip label={priorityMeta.label} size="small" sx={{ height: 18, fontSize: 9, color: priorityMeta.color, bgcolor: priorityMeta.bgColor, fontWeight: 700 }} />
        </Tooltip>
        
        {/* Status Chip */}
        <Chip size="small" label={statusMeta.label} sx={{ height: 18, fontSize: 9, color: statusMeta.color, backgroundColor: statusMeta.bgColor, fontWeight: 700 }} />
        
        {/* Decrypted Assignee */}
        <Tooltip title={assignee || 'Unassigned'}>
          <Avatar sx={{ width: 22, height: 22, fontSize: 10, bgcolor: getAvatarColor(assignee) }}>
            {assignee && assignee !== '-' ? assignee.charAt(0).toUpperCase() : '-'}
          </Avatar>
        </Tooltip>
      </Box>
    </Box>
  );
};


const ChildDataGrid = ({ id, project_id, open = true }) => {
  const [hierarchy, setHierarchy] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTasks, setExpandedTasks] = useState({});

  useEffect(() => {
    if (!open || !id || !project_id) return;
    const fetchHierarchy = async () => {
      setIsLoading(true);
      try {
        const res = await PayrollDashboardServices.getStoryRelatedTask({ id, project_id });
        const data = res?.data?.data;
        setHierarchy(Array.isArray(data) ? data[0] : null);
      } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };
    fetchHierarchy();
  }, [id, open, project_id]);

  const toggleTask = (taskId) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const filteredHierarchy = useMemo(() => {
    if (!hierarchy) return null;
    if (!searchQuery) return hierarchy;
    const query = searchQuery.toLowerCase();
    const filteredTasks = (hierarchy.tasks || []).filter(t => t.title.toLowerCase().includes(query) || (t.subtasks && t.subtasks.some(s => s.title.toLowerCase().includes(query))));
    const filteredDirect = (hierarchy.directSubtasks || []).filter(s => s.title.toLowerCase().includes(query));
    return { ...hierarchy, tasks: filteredTasks, directSubtasks: filteredDirect };
  }, [hierarchy, searchQuery]);

  const isActuallyEmpty = !hierarchy || ((hierarchy.tasks?.length || 0) === 0 && (hierarchy.directSubtasks?.length || 0) === 0);
  const isSearchEmpty = filteredHierarchy && (filteredHierarchy.tasks.length === 0 && filteredHierarchy.directSubtasks.length === 0);

  if (isLoading) return <Box sx={{ textAlign: 'center', py: 5 }}><CircularProgress size={28} /></Box>;

  return (
    <Paper elevation={0} sx={{ mt: 1, border: '1px solid #dee2e6', borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ p: 1.5, bgcolor: '#f8f9fa', borderBottom: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Box display="flex" alignItems="center">
          <TaskAltIcon sx={{ color: '#3DB4F2', mr: 1, fontSize: 20 }} />
          <Typography variant="subtitle2" fontWeight={700}>Child tasks</Typography>
        </Box>
        {!isActuallyEmpty && (
          <TextField
            size="small"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ bgcolor: 'white', width: 220 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
            }}
          />
        )}
      </Box>

      <Box sx={{ maxHeight: 450, overflowY: 'auto' }}>
        {isActuallyEmpty ? (
          <Box sx={{ textAlign: 'center', py: 6 }}><InboxIcon color="disabled" sx={{ fontSize: 40 }} /><Typography color="text.secondary">No tasks found.</Typography></Box>
        ) : isSearchEmpty ? (
          <Box sx={{ textAlign: 'center', py: 6 }}><Typography color="text.secondary">No matches found.</Typography><Button onClick={() => setSearchQuery('')}>Clear</Button></Box>
        ) : (
          <Box>
            {filteredHierarchy.tasks.map((task) => (
              <Box key={task.id}>
                <HierarchyItem 
                  title={task.title} 
                  type={task.type} 
                  status={task.status} 
                  priority={task.priority}
                  assignee={task.assignee}
                  hasChildren={task.subtasks?.length > 0}
                  isOpen={expandedTasks[task.id]}
                  onToggle={() => toggleTask(task.id)}
                />
                <Collapse in={expandedTasks[task.id] || searchQuery.length > 0}>
                  {task.subtasks?.map((sub) => (
                    <HierarchyItem key={sub.id} title={sub.title} type="Subtask" status={sub.status} priority={sub.priority} assignee={sub.assignee} isSubtask />
                  ))}
                </Collapse>
              </Box>
            ))}
            {filteredHierarchy.directSubtasks.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Divider><Chip label="Direct" size="small" sx={{ fontSize: 9 }} /></Divider>
                {filteredHierarchy.directSubtasks.map((sub) => (
                  <HierarchyItem key={sub.id} title={sub.title} type="Subtask" status={sub.status} priority={sub.priority} assignee={sub.assignee} />
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ChildDataGrid;