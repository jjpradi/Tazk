import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Divider,
} from '@mui/material';

const TaskAssignPage = () => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedTasks, setSelectedTasks] = useState([]);

  // Sample Employee Data
  const employees = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    // ... other employees
  ];

  // Sample Tasks Data
  const tasks = [
    { id: 1, name: 'Task 1', description: 'Description of Task 1', dueDate: '2023-07-31' },
    { id: 2, name: 'Task 2', description: 'Description of Task 2', dueDate: '2023-08-15' },
    // ... other tasks
  ];

  const handleEmployeeChange = (event) => {
    setSelectedEmployee(event.target.value);
  };

  const handleTaskToggle = (taskId) => () => {
    const currentIndex = selectedTasks.indexOf(taskId);
    const newSelectedTasks = [...selectedTasks];

    if (currentIndex === -1) {
      newSelectedTasks.push(taskId);
    } else {
      newSelectedTasks.splice(currentIndex, 1);
    }

    setSelectedTasks(newSelectedTasks);
  };

  const handleSubmit = () => {
    // Save assigned task data to backend or perform necessary actions
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Assign Task
      </Typography>
      <FormControl fullWidth variant="outlined" margin="normal">
        <InputLabel>Employee</InputLabel>
        <Select value={selectedEmployee} onChange={handleEmployeeChange} label="Employee">
          {employees.map((employee) => (
            <MenuItem key={employee.id} value={employee.id}>
              {employee.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <List>
        {tasks.map((task) => (
          <React.Fragment key={task.id}>
            <ListItem button onClick={handleTaskToggle(task.id)}>
              <ListItemText primary={task.name} secondary={task.description} />
              <ListItemSecondaryAction>
                <Checkbox
                  edge="end"
                  checked={selectedTasks.indexOf(task.id) !== -1}
                  disableRipple
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
      <Button
        variant="contained"
        color="primary"
        size="large"
        disabled={selectedEmployee === '' || selectedTasks.length === 0}
        onClick={handleSubmit}
      >
        Assign Tasks
      </Button>
    </Box>
  );
};

export default TaskAssignPage;
