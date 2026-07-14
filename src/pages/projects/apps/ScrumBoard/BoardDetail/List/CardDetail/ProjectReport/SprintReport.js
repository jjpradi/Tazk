import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Chip,
    CircularProgress,
    Grid,
    IconButton,
    LinearProgress,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { getSprintReportAction } from 'redux/actions/payrollDashboard_actions';
import CommonSearch from 'utils/commonSearch';

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

const metricCards = [
    {
        key: 'sprints',
        label: 'Total Sprints',
        // icon: <FlagRoundedIcon fontSize='small' />,
        color: '#2563eb',
        bg: '#eff6ff',
    },
    {
        key: 'tasks',
        label: 'Total Tasks',
        // icon: <PlaylistAddCheckCircleRoundedIcon fontSize='small' />,
        color: '#0f766e',
        bg: '#ecfeff',
    },
    {
        key: 'loggedTasks',
        label: 'Logged Tasks',
        // icon: <TaskAltRoundedIcon fontSize='small' />,
        color: '#d97706',
        bg: '#fff7ed',
    },
    {
        key: 'time',
        label: 'Actual Time Spent',
        // icon: <QueryBuilderRoundedIcon fontSize='small' />,
        color: '#7c3aed',
        bg: '#f5f3ff',
    },
    {
        key: "estimatedTime",
        label: "Estimated Time",
        // icon: <QueryBuilderRoundedIcon fontSize='small' />,
        color: '#16a34a',
        bg: '#dcfce7',
    },
    {
        key: "overloggedtasks",
        label: "Overlogged Tasks",
        // icon: <TaskAltRoundedIcon fontSize='small' />,
        color: '#b91c1c',
        bg: '#fee2e2',
    },
    {
        key: "overloggedHours",
        label: "Overlogged Hours",
        // icon: <QueryBuilderRoundedIcon fontSize='small' />,
        color: '#b91c1c',
        bg: '#fee2e2',
    },
    {
        key: "totalloggedhours",
        label: "Total Logged Hours",
        // icon: <QueryBuilderRoundedIcon fontSize='small' />,
        color: '#7c3aed',
        bg: '#f5f3ff',
    },
    {
        key: 'avgTime',
        label: 'Avg Hours / Task',
        // icon: <QueryBuilderRoundedIcon fontSize='small' />,
        color: '#7c3aed',
        bg: '#f5f3ff',
    },
];

// const getTaskList = (value) =>
//     String(value || '')
//         .split('|')
//         .map((task) => task.trim())
//         .filter(Boolean);

const timeStringToSeconds = (value) => {
    const [hours = 0, minutes = 0, seconds = 0] = String(value || '00:00:00')
        .split(':')
        .map((part) => Number(part || 0));

    return (hours * 3600) + (minutes * 60) + seconds;
};

const secondsToTimeString = (value) => {
    const totalSeconds = Number(value || 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
};

const formatSprintDate = (value) => (value ? moment(value).format('DD MMM YYYY') : '-');

const getStatusStyles = (status) => {
    switch (String(status || '').toLowerCase()) {
        case 'completed':
            return { color: '#166534', backgroundColor: '#dcfce7' };
        case 'active':
            return { color: '#1d4ed8', backgroundColor: '#dbeafe' };
        default:
            return { color: '#92400e', backgroundColor: '#fef3c7' };
    }
};

const getCoveragePercentage = (row) => {
    const totalTasks = Number(row.active_tasks_count || 0);
    const loggedTasks = Number(row.logged_tasks_count || 0);

    if (!totalTasks) {
        return 0;
    }

    return Math.min(100, Math.round((loggedTasks / totalTasks) * 100));
};

const formatAverageHours = (value) => `${Number(value || 0).toFixed(2)}h`;

const SprintReport = ({ project_id: projectId }) => {
    const dispatch = useDispatch();
    const {
        PayrolldashboardReducers: { getSprintReport },
    } = useSelector((state) => state);

    const [searchValue, setSearchValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const sprintRows = useMemo(() => {
        if (Array.isArray(getSprintReport)) {
            return getSprintReport;
        }

        if (Array.isArray(getSprintReport?.data)) {
            return getSprintReport.data;
        }

        return [];
    }, [getSprintReport]);

    const fetchSprintReport = async () => {
        if (!projectId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            await dispatch(getSprintReportAction({ project_id: projectId }));
        } catch (error) {
            console.error('Failed to fetch sprint report', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSprintReport();
    }, [projectId]);

    useEffect(() => {
        setPage(0);
    }, [projectId, searchValue, sprintRows.length]);

    const filteredRows = useMemo(() => {
        const query = searchValue.trim().toLowerCase();

        if (!query) {
            return sprintRows;
        }

        return sprintRows.filter((row) => {
            // const tasks = getTaskList(row.sprint_tasks).join(' ').toLowerCase();
            return (
                String(row.sprint_name || '').toLowerCase().includes(query) ||
                String(row.sprint_id || '').toLowerCase().includes(query) ||
                String(row.sprint_status || '').toLowerCase().includes(query) ||
                String(row.total_time_spent || '').toLowerCase().includes(query) ||
                String(row.total_estimated_time || '').toLowerCase().includes(query) ||
                String(row.total_over_logged_time || '').toLowerCase().includes(query) ||
                String(row.goal || '').toLowerCase().includes(query)
                // tasks.includes(query)
            );
        });
    }, [searchValue, sprintRows]);

    const summary = useMemo(() => {
        const totalSprints = filteredRows.length;
        const totalTasks = filteredRows.reduce(
            (sum, row) => sum + Number(row.active_tasks_count || 0),
            0,
        );
        const totalLoggedTasks = filteredRows.reduce(
            (sum, row) => sum + Number(row.logged_tasks_count || 0),
            0,
        );
        const totalActualSeconds = filteredRows.reduce(
            (sum, row) => sum + timeStringToSeconds(row.total_time_spent),
            0,
        );
        const totalEstimatedSeconds = filteredRows.reduce(
            (sum, row) => sum + timeStringToSeconds(row.total_estimated_time),
            0,
        );
        const totalOverLoggedSeconds = filteredRows.reduce(
            (sum, row) => sum + timeStringToSeconds(row.total_over_logged_time),
            0,
        );
        const totalLoggedHours = filteredRows.reduce(
            (sum, row) => sum + Number(row.total_logged_hours || 0),
            0,
        );
        const totalOverLoggedTasks = filteredRows.reduce(
            (sum, row) => sum + Number(row.over_logged_tasks_count || 0),
            0,
        );

        return {
            totalSprints,
            totalTasks,
            totalLoggedTasks,
            totalTime:totalActualSeconds ? secondsToTimeString(totalActualSeconds) : '-',
            totalEstimatedTime: totalEstimatedSeconds?secondsToTimeString(totalEstimatedSeconds) : '-',
            totalOverLoggedTime: totalOverLoggedSeconds?secondsToTimeString(totalOverLoggedSeconds) : '-',
            totalLoggedHours: totalLoggedHours? totalLoggedHours.toFixed(2) : '-',
            totalOverLoggedTasks,
            averageTimePerTask: totalTasks ? (totalLoggedHours / totalTasks).toFixed(2) : 'no logged tasks',
        };
    }, [filteredRows]);

    const gridRows = useMemo(() => filteredRows.map((row, index) => ({
        ...row,
        id: row.sprint_id || index + 1,
        sprint_period: `${formatSprintDate(row.start_date)} to ${formatSprintDate(row.end_date)}${row.duration ? ` | ${row.duration}` : ''}`,
        goal_text: row.goal || 'No sprint goal added',
        avg_hours_label: formatAverageHours(row.avg_hours_per_task),
        log_coverage: getCoveragePercentage(row),
    })), [filteredRows]);

    const paginatedRows = useMemo(() => {
        const startIndex = page * pageSize;
        return gridRows.slice(startIndex, startIndex + pageSize);
    }, [gridRows, page, pageSize]);

    const columns = useMemo(() => [
        {
            field: 'sprint_name',
            headerName: 'Sprint',
            flex: 1.25,
            minWidth: 260,
            sortable: false,
            renderCell: ({ row }) => (
                <Box sx={{ py: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                        {row.sprint_name || `Sprint ${row.sprint_id}`}
                    </Typography>
                    <Typography sx={{ mt: 0.35, fontSize: 12, color: '#64748b' }}>
                        {row.sprint_period}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'sprint_status',
            headerName: 'Status',
            minWidth: 120,
            sortable: false,
            renderCell: ({ value }) => {
                const statusStyles = getStatusStyles(value);

                return (
                    <Chip
                        label={value || 'Planned'}
                        size='small'
                        sx={{
                            fontWeight: 700,
                            color: statusStyles.color,
                            backgroundColor: statusStyles.backgroundColor,
                        }}
                    />
                );
            },
        },
        {
            field: 'active_tasks_count',
            headerName: 'Total Tasks',
            minWidth: 110,
            type: 'number',
            sortable: false,
        },
        {
            field: 'logged_tasks_count',
            headerName: 'Logged Tasks',
            minWidth: 120,
            type: 'number',
            sortable: false,
        },
        {
            field: 'total_time_spent',
            headerName: 'Overall Logged Time',
            minWidth: 170,
            sortable: false,
            renderCell: ({ value }) => (
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#1d4ed8' }}>
                    {value || '-'}
                </Typography>
            ),
        },
        {
            field: 'avg_hours_label',
            headerName: 'Avg Hours / Task',
            minWidth: 150,
            sortable: false,
            renderCell: ({ value }) => (
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#7c3aed' }}>
                    {value}
                </Typography>
            ),
        },
        {
            field: 'goal_text',
            headerName: 'Sprint Goal',
            flex: 1,
            minWidth: 240,
            sortable: false,
            renderCell: ({ value }) => (
                <Typography sx={{ py: 1, fontSize: 13, color: '#334155', whiteSpace: 'normal', lineHeight: 1.45 }}>
                    {value}
                </Typography>
            ),
        },
        {
            field: 'log_coverage',
            headerName: 'Log Coverage',
            flex: 0.9,
            minWidth: 200,
            sortable: false,
            renderCell: ({ row }) => (
                <Box sx={{ width: '100%', py: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>
                            Coverage
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: '#64748b' }}>
                            {row.log_coverage}%
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant='determinate'
                        value={row.log_coverage}
                        sx={{
                            height: 8,
                            borderRadius: 999,
                            backgroundColor: '#e2e8f0',
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 999,
                                backgroundColor: row.log_coverage >= 100 ? '#16a34a' : '#3b82f6',
                            },
                        }}
                    />
                </Box>
            ),
        },
    ], []);

    const handleExport = () => {
        const headers = [
            'Project ID',
            'Sprint ID',
            'Sprint Name',
            'Sprint Status',
            'Start Date',
            'End Date',
            'Duration',
            'Goal',
            'Active Tasks',
            'Logged Tasks',
            'Total Time Spent',
            'Log Coverage',
            'Total Logged Hours',
            'Average Hours Per Task',
        ];
        const rows = filteredRows.map((row) => [
            row.project_id,
            row.sprint_id,
            row.sprint_name,
            row.sprint_status,
            row.start_date,
            row.end_date,
            row.duration,
            row.goal,
            row.active_tasks_count,
            row.logged_tasks_count,
            row.total_time_spent,
            `${getCoveragePercentage(row)}%`,
            row.total_logged_hours,
            row.avg_hours_per_task,
        ]);

        downloadCsv('Sprint_Report.csv', headers, rows);
    };

    return (
        <Box>
            <Paper
                elevation={0}
                sx={{
                    border: '1px solid #d7deea',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#ffffff',
                }}
            >
                <Box
                    sx={{
                        px: 2,
                        py: 1.5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                        borderBottom: '1px solid #e7edf5',
                        flexWrap: 'wrap',
                        backgroundColor: '#f8fafc',
                    }}
                >
                    <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                        Sprint Report
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Tooltip title='Export'>
                            <IconButton onClick={handleExport} size='small' sx={{ color: '#64748b' }}>
                                <FileDownloadIcon />
                            </IconButton>
                        </Tooltip>

                        <Box
                            sx={{
                                width: { xs: '100%', sm: 240 },
                                minWidth: { xs: '100%', sm: 240 },
                                '& .MuiInputBase-root': {
                                    height: 36,
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
                                cancelSearch={() => setSearchValue('')}
                                requestSearch={(event) => setSearchValue(event.target.value)}
                            />
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ p: 2 }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#0f172a', m: 3 }}>
                        Total Summary
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        {metricCards.map((card) => {
                            const value =
                                card.key === 'sprints'
                                    ? summary.totalSprints
                                    : card.key === 'tasks'
                                        ? summary.totalTasks
                                        : card.key === 'loggedTasks'
                                            ? summary.totalLoggedTasks
                                            : card.key === 'estimatedTime'
                                                ? summary.totalEstimatedTime
                                                : card.key === 'overloggedHours'
                                                    ? summary.totalOverLoggedTime
                                                    : card.key === 'overloggedtasks'
                                                        ? summary.totalOverLoggedTasks
                                                        : card.key === 'totalloggedhours'
                                                            ? summary.totalLoggedHours
                                                            : card.key === 'avgTime'
                                                                ? summary.averageTimePerTask
                                            : summary.totalTime;

                            return (
                                <Grid item xs={12} md={6} xl={3} key={card.key}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            height: '100%',
                                            borderRadius: '8px',
                                            border: '1px solid #6d6d6d',
                                            backgroundColor: '#ffffff',
                                            boxShadow: '0 8px 22px rgba(15, 23, 42, 0.05)',
                                        }}
                                    >
                                        <Stack direction='row' spacing={1.5} alignItems='center'>
                                            {/* <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: '8px',
                          display: 'grid',
                          placeItems: 'center',
                          backgroundColor: card.bg,
                          color: card.color,
                        }}
                      >
                        {card.icon}
                      </Box> */}

                                            <Box>
                                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#111111af' }}>
                                                    {card.label}
                                                </Typography>
                                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#5f6166' }}>
                                                    {value}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {loading ? (
                        <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}>
                            <CircularProgress size={28} />
                        </Box>
                    ) : filteredRows.length ? (
                        <>
                            <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#0f172a', m: 3 }}>
                                Sprint Details
                            </Typography>

                            <DataGrid
                                autoHeight
                                rows={paginatedRows}
                                columns={columns}
                                rowCount={gridRows.length}
                                pagination
                                paginationMode='server'
                                density='compact'
                                disableRowSelectionOnClick
                                getRowHeight={() => 'auto'}
                                pageSizeOptions={[10, 20, 50]}
                                paginationModel={{ page, pageSize }}
                                onPaginationModelChange={(model) => {
                                    if (model.page !== page) {
                                        setPage(model.page);
                                    }

                                    if (model.pageSize !== pageSize) {
                                        setPage(0);
                                        setPageSize(model.pageSize);
                                    }
                                }}
                                sx={{
                                    border: '1px solid #dbe4f0',
                                    borderRadius: '8px',
                                    '& .MuiDataGrid-columnHeaders': {
                                        backgroundColor: '#f4f7fe',
                                        color: 'rgba(0, 0, 0, 0.7)',
                                        fontWeight: 600,
                                    },
                                    '& .MuiDataGrid-columnHeaderTitle': {
                                        fontWeight: 700,
                                        fontSize: 12,
                                    },
                                    '& .MuiDataGrid-cell': {
                                        alignItems: 'center',
                                        borderBottom: '1px solid #edf2f7',
                                    },
                                    '& .MuiDataGrid-footerContainer': {
                                        minHeight: 52,
                                    },
                                }}
                            />
                        </>
                    ) : (
                        <Box
                            sx={{
                                minHeight: 220,
                                borderRadius: '8px',
                                border: '1px dashed #cbd5e1',
                                display: 'grid',
                                placeItems: 'center',
                                backgroundColor: '#f8fbff',
                            }}
                        >
                            <Box sx={{ textAlign: 'center', px: 2 }}>
                                <Typography sx={{ color: '#64748b', fontWeight: 700 }}>
                                    No sprint report data found
                                </Typography>
                                <Typography sx={{ mt: 0.75, color: '#94a3b8', fontSize: 13 }}>
                                    Check whether this project has sprint records in tasks_sprint for your company,
                                    and whether those sprints are linked to tasks through tasks.sprint_id.
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default SprintReport;
