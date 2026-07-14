import React from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  CssBaseline,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { styled } from "@mui/system";
import FilterListIcon from "@mui/icons-material/FilterList";
import ShareIcon from "@mui/icons-material/Share";
import DownloadIcon from "@mui/icons-material/Download";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Dummy data for tasks
const tasks = [
  { id: 1, name: "test Sprint 1", start: "2025-01-01", end: "2025-01-15" },
  { id: 2, name: "test-2 Dashboard", start: "2025-01-05", end: "2025-01-20" },
  { id: 3, name: "test-3  Statutory Compliance", start: "2025-01-10", end: "2025-01-25" },
];

// Calendar events
const events = tasks.map((task) => ({
  title: task.name,
  start: new Date(task.start),
  end: new Date(task.end),
}));

const localizer = momentLocalizer(moment);

// Styled component for timeline bars
const TaskBar = styled(Box)(({ theme, start, end }) => {
  const startPercent =
    ((new Date(start) - new Date("2025-01-01")) / (30 * 24 * 60 * 60 * 1000)) *
    100;
  const durationPercent =
    ((new Date(end) - new Date(start)) / (30 * 24 * 60 * 60 * 1000)) * 100;

  return {
    position: "absolute",
    left: `${startPercent}%`,
    width: `${durationPercent}%`,
    height: "20px",
    backgroundColor: theme.palette.primary.main,
    borderRadius: "4px",
  };
});

// Create Material-UI theme with Poppins font
const theme = createTheme({
  typography: {
    fontFamily: "Poppins, Arial, sans-serif",
    fontSize: 12,
  },
});

const ProjectTimeline = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 2 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h5">Project Timeline</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField size="small" placeholder="Search timeline" />
            <Button variant="outlined" startIcon={<FilterListIcon />}>
              Status category
            </Button>
            <Button variant="outlined">Epic</Button>
           
            {/* <IconButton>
              <ShareIcon />
            </IconButton>
            <IconButton>
              <DownloadIcon />
            </IconButton> */}
          </Box>
        </Box>

        {/* Calendar View */}
        <Box sx={{ mb: 4 }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600, fontFamily: "Poppins, Arial, sans-serif", fontSize: "12px" }}
            views={['month', 'week', 'day']}
          />
        </Box>

        {/* Timeline */}
        <Grid container spacing={2}>
          {/* Task List */}
          {/* <Grid>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tasks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>{task.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid> */}

          {/* Task Timeline */}
          <Box sx={{ position: "relative", height: "100%", backgroundColor: "#f9f9f9" }}>
            {tasks.map((task) => (
              <TaskBar key={task.id} start={task.start} end={task.end} />
            ))}
          </Box>
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default ProjectTimeline;
