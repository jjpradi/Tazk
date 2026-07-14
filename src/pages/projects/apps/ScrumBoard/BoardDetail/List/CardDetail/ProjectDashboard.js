import React from 'react'
import TaskCompetedCard from '../ProjectsDashboard/TaskCompetedCard'
import { Grid } from '@mui/material'
import CreatedTasksCard from '../ProjectsDashboard/CreatedTasksCard'
import UpdatedTasksCard from '../ProjectsDashboard/UpdatedTasksCard'
import DueTasksCard from '../ProjectsDashboard/DueTasksCard'
import TasksStatusChart from '../ProjectsDashboard/TasksStatusChart'
import TasksPriorityChart from '../ProjectsDashboard/TasksPriorityChart'
import TeamWorkload from '../ProjectsDashboard/TeamWorkload'
import TypesOfWork from '../ProjectsDashboard/TypesOfWork'
import EpicProgressChart from '../ProjectsDashboard/EpicProgressChart'
import RecentActiveTask from '../ProjectsDashboard/RecentActiveTask'


const ProjectDashboard = (props) => {
  return (
      <div style={{maxHeight: '80vh', overflowY: 'auto', overflowX: 'hidden'}}>
          <Grid container  spacing={2} display={'flex'}>
              <Grid container spacing={2}>
              <Grid
                  size={{
                      lg: 3,
                      md: 4,
                      sm: 6,
                      xs: 12
                  }}>
                  <TaskCompetedCard/>
              </Grid>
              <Grid
                  size={{
                      lg: 3,
                      md: 4,
                      sm: 6,
                      xs: 12
                  }}>
                  <CreatedTasksCard/>
              </Grid>
              <Grid
                  size={{
                      lg: 3,
                      md: 4,
                      sm: 6,
                      xs: 12
                  }}>
                  <UpdatedTasksCard/>
              </Grid>
              <Grid
                  size={{
                      lg: 3,
                      md: 4,
                      sm: 6,
                      xs: 12
                  }}>
                  <DueTasksCard/>
              </Grid>
              </Grid>
              <Grid
                  size={{
                      lg: 6,
                      md: 6,
                      sm: 12,
                      xs: 12
                  }}>
                  <TasksStatusChart/>
              </Grid>
              <Grid
                  size={{
                      lg: 6,
                      md: 6,
                      sm: 12,
                      xs: 12
                  }}>
                  <TasksPriorityChart/>
              </Grid>
              <Grid
                  size={{
                      lg: 6,
                      md: 6,
                      sm: 12,
                      xs: 12
                  }}>
                  <TeamWorkload/>
              </Grid>
              <Grid
                  size={{
                      lg: 6,
                      md: 6,
                      sm: 12,
                      xs: 12
                  }}>
                  <TypesOfWork/>
              </Grid>
              <Grid
                  size={{
                      lg: 6,
                      md: 6,
                      sm: 12,
                      xs: 12
                  }}>
                  <EpicProgressChart projectId = {props.projectId}/>
              </Grid>
              <Grid
                  size={{
                      lg: 6,
                      md: 6,
                      sm: 12,
                      xs: 12
                  }}>
                  <RecentActiveTask/>
              </Grid>
          </Grid>
      </div>
  );
}

export default ProjectDashboard