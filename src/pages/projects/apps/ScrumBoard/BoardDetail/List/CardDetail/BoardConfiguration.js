import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import { deleteProjectLanesAction, getProjectLanesAction } from 'redux/actions/payrollDashboard_actions';

const BoardConfiguration = (props) => {
  const {
    PayrolldashboardReducers: { getProjectLanes,taskByStatus },
  } = useSelector((state) => state);

  const dispatch = useDispatch();
  const [column, setColumn] = useState(false);
  const [formValue, setFormValue] = useState({ name: null });

  const handleSave = async () => {
    const data = {
      project_id: props.id,
      name: formValue.name,
    };
    await dispatch(getProjectLanesAction(data));
    setColumn(false);
  };

  const handleDelete = async(laneId)=>{
    const data = {
      project_id: props.id,
      laneId : laneId
    }
   await dispatch(deleteProjectLanesAction(data))
   const data1 = {
    project_id: props.id,
  };
  await dispatch(getProjectLanesAction(data1));

  }

  useEffect(() => { (async () => {
    const fetchData = async () => {
      const data = {
        project_id: props.id,
      };
      await dispatch(getProjectLanesAction(data));
      setFormValue({ ...formValue, name: null });
    };
    fetchData();
  })();
}, [column]); 

  const statusCount = taskByStatus[0].reduce((acc, task) => {
    const statusKey = task.STATUS.toLowerCase().replace(/ /g, ""); // Normalize the status key
    acc[statusKey] = (acc[statusKey] || 0) + 1; // Increment the count
    return acc;
}, {});

const updatedProjectLanes = getProjectLanes.map(lane => {
  const statusKey = lane.name.toLowerCase().replace(/\s+/g, '');
  const count = statusCount[statusKey] || 0;
  return { ...lane, count };
});



  return (
    <Box sx={{ p: 3 }} overflow={'scroll'}>
      <Grid container spacing={2} alignItems="flex-start" >
        {updatedProjectLanes.map((item) => (
          <Grid
            key={item.id}
            size={{
              xs: 12,
              sm: 6,
              md: 4,
              lg: 3
            }}>
            <Card sx={{ width: '100%', minHeight: 500 }}>
              <CardContent>
                <Grid container justifyContent="space-between" alignItems="center">
                  <Grid>{item.name}</Grid>
                  <Grid>
                      <IconButton disabled={item.count != 0} onClick={()=> handleDelete(item.laneId)}>
                    <Tooltip title="Delete">
                        <DeleteIcon />
                    </Tooltip>
                      </IconButton>
                  </Grid>
                </Grid>
                <Grid container spacing={2} mt={2}>
                  <Grid size={6}>
                    <TextField fullWidth label="Min" value="" />
                  </Grid>
                  <Grid size={6}>
                    <TextField fullWidth label="Max" value="" />
                  </Grid>
                </Grid>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    mt: 3,
                  }}
                >
                  <Paper sx={{ p: 3, flex: 1 }}>
                      <Button variant="outlined" fullWidth>
                    <Tooltip title={item.name}>
                        {item.name}
                    </Tooltip>
                      </Button>
                    <Typography mt={1}>{`${item.count} - Issues `}</Typography>
                  </Paper>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
            lg: 3
          }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: 500,
              bgcolor: 'rgb(245, 245, 245)',
            }}
          >
            <IconButton
              onClick={() => setColumn(true)}
              sx={{
                height: '50px',
                width: '50px',
                bgcolor: 'rgb(231, 231, 231)',
              }}
            >
            <Tooltip title={'Add Column'}>
              <AddIcon />
            </Tooltip>
            </IconButton>
          </Box>
        </Grid>
      </Grid>
      <Dialog open={column} onClose={() => setColumn(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <TextField
            label="Column Name"
            value={formValue.name}
            fullWidth
            onChange={(e) => setFormValue({ ...formValue, name: e.target.value })}
            sx={{ mb: 3 }}
          />
          <Grid container justifyContent="flex-end" spacing={2}>
            <Grid>
              <Button onClick={() => setColumn(false)} variant="contained" color="secondary">
                Close
              </Button>
            </Grid>
            <Grid>
              <Button onClick={handleSave} variant="contained" color="primary">
                Save
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Dialog>
    </Box>
  );
};

export default BoardConfiguration;
