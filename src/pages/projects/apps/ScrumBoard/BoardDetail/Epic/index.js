import React, { useMemo, useState } from 'react'
import { Button } from '@mui/material';
import EpicCreation from "./EpicCreation"
import ProjectEpicTaskList from './ProjectEpicTaskList';
import { Box } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';

const EpicDeatail = ({
  boardDetail,
  projectData,
  get_taskProjects,
  get_epicList,
  taskByStatus,
  onRefreshEpics,
}) => {
  const [showAddProjectForm, setShowAddProjectForm] = useState(false);

  const handelEpicCreationOpen = () => {
    setShowAddProjectForm(true);
  };

  const listTasks = useMemo(() => {
    if (Array.isArray(taskByStatus)) {
      if (Array.isArray(taskByStatus[0]) && taskByStatus[0].length) {
        return taskByStatus[0];
      }
      if (taskByStatus.length) {
        return taskByStatus;
      }
    }

    if (taskByStatus && typeof taskByStatus === 'object') {
      if (
        Array.isArray(taskByStatus.allTasks) &&
        taskByStatus.allTasks.length
      ) {
        return taskByStatus.allTasks;
      }
      if (Array.isArray(taskByStatus.tasks) && taskByStatus.tasks.length) {
        return taskByStatus.tasks;
      }
      if (Array.isArray(taskByStatus.data) && taskByStatus.data.length) {
        return taskByStatus.data;
      }
      if (Array.isArray(taskByStatus[0]) && taskByStatus[0].length) {
        return taskByStatus[0];
      }

      const statusWiseTasks = Object.entries(taskByStatus)
        .filter(([, value]) => Array.isArray(value))
        .flatMap(([statusName, items]) =>
          items.map((item) => ({
            ...item,
            status_name: item.status_name || item.STATUS || statusName,
          })),
        );
      if (statusWiseTasks.length) {
        return statusWiseTasks;
      }
    }

    if (Array.isArray(boardDetail?.lanes) && boardDetail.lanes.length) {
      const laneTasks = boardDetail.lanes.flatMap((lane) =>
        (lane.cards || []).map((card) => ({
          ...card,
          task_name: card.task_name || card.title,
          status_name: card.status_name || lane.name,
        })),
      );
      if (laneTasks.length) {
        return laneTasks;
      }
    }

    return Array.isArray(get_taskProjects) ? get_taskProjects : [];
  }, [taskByStatus, boardDetail, get_taskProjects]);

  const epicGroups = useMemo(() => {
    const tasks = Array.isArray(listTasks) ? listTasks : [];
    const epics = Array.isArray(get_epicList) ? get_epicList : get_epicList?.data ?? [];

    const byId = new Map();
    const byName = new Map();

    const groups = epics.map((epic, i) => {
      const group = {
        key: epic?.id ?? epic?.name ?? `epic-${i}`,
        epicId: epic?.id,
        epicName: epic?.name,
        epic,
        tasks: [],
      };
      if (epic?.id != null) byId.set(String(epic.id), group);
      if (epic?.name) byName.set(epic.name.toLowerCase(), group);
      return group;
    });

    const noEpicGroup = { key: 'no-epic', epicId: null, epicName: 'No Epic', epic: null, tasks: [] };

    for (const task of tasks) {
      const id = task?.epic_id ?? task?.epicId ?? task?.epicID ?? task?.epic;
      const name = task?.epic_name ?? task?.epicName ?? task?.epic_title ?? task?.epic;
      const group =
        (id != null && byId.get(String(id))) ||
        (name && byName.get(String(name).toLowerCase())) ||
        noEpicGroup;
      group.tasks.push(task);
    }

    if (noEpicGroup.tasks.length) groups.push(noEpicGroup);
    return groups;
  }, [listTasks, get_epicList]);


  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end"}}>
      <Button variant="contained" sx={{margin:"8px" ,'&:hover':{backgroundColor: '#ff3d00'}}} startIcon={<AddIcon />} onClick={handelEpicCreationOpen}>Add Epic</Button>
      </div>
      <EpicCreation
        open={showAddProjectForm}
        onClose={() => setShowAddProjectForm(false)}
        projectId={projectData?.project_id ?? projectData?.id ?? ''}
        onSaved={onRefreshEpics}
        // onSave={handleSaveProject}
      />
      <ProjectEpicTaskList
        epicGroups={epicGroups}
        projectKey={projectData?.project_key}
        projectId={projectData?.project_id ?? projectData?.id ?? null}
        onRefreshEpics={onRefreshEpics}
      />
    </div>
  );
};

export default EpicDeatail

