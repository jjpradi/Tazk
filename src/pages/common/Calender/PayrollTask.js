import React, { useContext, useEffect, useState } from 'react'
import { Avatar, Box, Button, Drawer, Fade, Grid, IconButton, Paper, Tooltip, Typography } from '@mui/material'
import { styled } from '@mui/system'
import dayjs from 'dayjs'
import moment from 'moment'
import { useDispatch, useSelector } from 'react-redux'
import { ListTaskCalenderAction } from 'redux/actions/calender_actions'
import CloseIcon from '@mui/icons-material/Close';
import personIcon from '../../../assets/dashboardIcons/total-clients.svg'
import AddTaskDialog from 'pages/projects/AssignTask'
import { get_search_company_based_employee, getEmpbasecompanyFilterAction, set_search_company_based_employee } from 'redux/actions/attendance_actions'
import context from '../../../../src/context/CreateNewButtonContext'
import apiCalls from 'utils/apiCalls'
import { createTaskAction, filterTaskDetailsAction, getActivityAction, getProjectDetailsAction, getTaskByStatusAction, taskDetailsCountAction, updateTaskAction } from 'redux/actions/payrollDashboard_actions'
import { GET_EMP_BASECOMPANY_FILTER } from 'redux/actionTypes'
import CardHeader from 'pages/projects/apps/ScrumBoard/BoardDetail/List/AddCard/CardHeader'

const CalenderContainer = styled(Box) ({
    display : 'grid',
    gridTemplateColumns : 'repeat(7, 1fr)',
    paddingBottom : '16px',
    gridAutoRows : 'auto',
    overflow : 'auto',
    margin : '0px'
})

const DayBox = styled(Paper) (({ theme }) => ({
    padding : theme.spacing(1),
    minHeight : '100px',
    maxHeight : '100px',
    height : '100px',
    textAlign : 'right',
    position : 'relative',
    border : '1px solid rgba(200, 200, 200, 0.5)',
    overflow : 'hidden',
    display : 'flex',
    flexDirection : 'column',
    justifyContent : 'space-between',
    margin : '0',
    borderRadius : '0 !important',
    boxShadow : 'none',
    '&.MuiPaper-root' : {
        borderRadius : '0px !important'
    }
}))

const EventLabel = styled(Box) (({ color }) => ({
    backgroundColor : color,
    color : 'black',
    padding : '4px 8px',
    borderRadius : '4px',
    marginTop : '4px',
    display : 'flex',
    alignItems : 'center',
    justifyContent : 'center',
    textAlign : 'center',
    gap : '8px',
    position : 'relative',
    overflow : 'hidden',
    textOverflow : 'ellipsis',
    whiteSpace : 'nowrap',
    maxWidth : '100%',
    opacity : '0.8',
    cursor : 'pointer'
}))

const DayWeekBox = styled(Paper) (({ theme }) => ({
    padding : theme.spacing(1),
    minHeight : '10px',
    display : 'flex',
    justifyContent : 'center',
    alignItems : 'center',
    position : 'relative',
    border : '1px solid rgba(200, 200, 200, 0.5)',
    margin : '0',
    borderRadius : '0 !important',
    boxShadow : 'none',
    '&.MuiPaper-root' : {
        borderRadius : '0px !important'
    }
}))

const PayrollTask = ({ projectname, duedate, search, employee }) => {

    const dispatch = useDispatch()

    const { setModalTypeHandler, setLoaderStatusHandler } = useContext(context)

    const [taskEventsOpen, setTaskEventsOpen] = useState(false)
    const [selectedDaysTask, setSelectedDaysTask] = useState([])
    const [taskEventsList, setTaskEventsList] = useState([])
    const [searchString, setSearchString] = useState('')

    const [showAddTaskDialog, setShowAddTaskDialog] = useState(false)
    const [selectedTaskForEdit, setSelectedTaskForEdit] = useState({})
    const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('')
    const [value, setValue] = useState([])
    const [tasks, setTasks] = useState([])
    const [projectData, setProjectData] = useState({})
    const [loading, setLoading] = useState(true)
    const [selectedTaskData, setSelectedTaskData] = useState([])

    const maxEventsToShow = 1

    const today = dayjs()
    const [currentDay, setCurrentDay] = useState(today.date())
    const [currentMonth, setCurrentMonth] = useState(today.month())
    const [currentYear, setCurrentYear] = useState(today.year())
    const firstDayOfMonth = dayjs(new Date(currentYear, currentMonth)).startOf('month').day()
    const daysInMonth = dayjs(new Date(currentYear, currentMonth)).daysInMonth()

    const {
        CalenderReducers : { taskCalenderList, tasksCount },
        PayrolldashboardReducers : { get_projects },
        attendanceReducer : { getCompanyBasedEmployeeFilter, searchCompanyBasedEmployeeFilter },
        stockLocationReducer : { stocklocation }
    } = useSelector((state) => state)

    useEffect(() => {
        const startDate = moment(new Date(currentYear, currentMonth, 1)).startOf('month')
        const endDate = moment(new Date(currentYear, currentMonth, daysInMonth)).endOf('month')

        const payload = {
            searchString : searchString,
            fromDate : startDate.format('YYYY-MM-DD'),
            toDate : endDate.format('YYYY-MM-DD')
        }
        dispatch(ListTaskCalenderAction(payload))
        
        let data1 = {
            searchString : ''
        }
        dispatch(getEmpbasecompanyFilterAction(data1, (res) => {
            dispatch({
                type : GET_EMP_BASECOMPANY_FILTER,
                payload : res
            })
        }))
    }, [])

    useEffect(() => {
        setLoading(true)
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(taskDetailsCountAction()),
            dispatch(getActivityAction()),
            dispatch(filterTaskDetailsAction({
                'searchString' : '',
                'numPerPage' : null,
                'pageCount' : null,
                'employeeFilter' : null,
                'dueDateFilter' : null,
                'projectFilter' : null,
                'typeFilter' : 'all'
            }, (res) => {
                setTasks(res.data)
                setLoading(false)
            }))
        )
    }, [showAddTaskDialog])

    useEffect(() => {
        if(tasks.length > 0) {
            const employeeTaskData = tasks.find((d) => d?.asignee === selectedTaskData.asignee)
            setSelectedTaskForEdit(employeeTaskData)
        }
    }, [selectedTaskData])

    useEffect(() => {
        const tasksObj = []

        if(tasksCount?.length > 0) {
            tasksCount.forEach((field) => {
                tasksObj.push(
                    {
                        date : field.start_date,
                        title : `Tasks - ${field.task_count}`,
                        color : '#F0EAAC',
                        employee_name : taskCalenderList.filter((e) => e.start_date === field.start_date && e.task_id)
                    }
                )
            })
        }
        setTaskEventsList(tasksObj)
    }, [tasksCount])

    const handleClickTaskEventsOpen = (events) => {
        setSelectedDaysTask(events)
        setTaskEventsOpen(true)
    }

    const handleClickTaskEventsClose = () => {
        setTaskEventsOpen(false)
    }

    const handlePrevMonth = () => {
        let startDate
        let endDate

        if(currentMonth === 0) {
            setCurrentMonth(11)
            setCurrentYear(currentYear - 1)

            const daysInMonth = dayjs(new Date(currentYear - 1, 11)).daysInMonth()
            startDate = moment(new Date(currentYear - 1, 11, 1)).startOf('month')
            endDate = moment(new Date(currentYear - 1, 11, daysInMonth)).endOf('month')
        }
        else {
            setCurrentMonth(currentMonth - 1)

            const daysInMonth = dayjs(new Date(currentYear, currentMonth - 1)).daysInMonth()
            startDate = moment(new Date(currentYear, currentMonth - 1, 1)).startOf('month')
            endDate = moment(new Date(currentYear, currentMonth - 1, daysInMonth)).endOf('month')
        }

        const payload = {
            searchString : searchString,
            fromDate : startDate.format('YYYY-MM-DD'),
            toDate : endDate.format('YYYY-MM-DD')
        }
        dispatch(
            ListTaskCalenderAction(payload)
        )

        if(currentMonth === today.month() + 1 && currentYear === today.year()) {
            setCurrentDay(today.date())
        }
        else {
            setCurrentDay(1)
        }
    }

    const handleNextMonth = () => {
        let startDate
        let endDate

        if(currentMonth === 11) {
            setCurrentMonth(0)
            setCurrentYear(currentYear + 1)

            const daysInMonth = dayjs(new Date(currentYear + 1, 0)).daysInMonth()
            startDate = moment(new Date(currentYear + 1, 0, 1)).startOf('month')
            endDate = moment(new Date(currentYear + 1, 0, daysInMonth)).endOf('month')
        }
        else {
            setCurrentMonth(currentMonth + 1)
            const daysInMonth = dayjs(new Date(currentYear, currentMonth + 1)).daysInMonth()
            startDate = moment(new Date(currentYear, currentMonth + 1, 1)).startOf('month')
            endDate = moment(new Date(currentYear, currentMonth + 1, daysInMonth)).endOf('month')
        }

        const payload = {
            searchString : searchString,
            fromDate : startDate.format('YYYY-MM-DD'),
            toDate : endDate.format('YYYY-MM-DD')
        }
        dispatch(
            ListTaskCalenderAction(payload)
        )

        if(currentMonth === today.month() - 1 && currentYear === today.year()) {
            setCurrentDay(today.date())
        }
        else {
            setCurrentDay(1)
        }
    }

    const handleToday = () => {
        setCurrentMonth(today.month())
        setCurrentYear(today.year())
        setCurrentDay(today.date())

        const daysInMonth = dayjs(new Date(today.year(), today.month())).daysInMonth()
        const startDate = moment(new Date(today.year(), today.month(), 1)).startOf('month')
        const endDate = moment(new Date(today.year(), today.month(), daysInMonth)).endOf('month')

        const payload = {
            searchString : searchString,
            fromDate : startDate.format('YYYY-MM-DD'),
            toDate : endDate.format('YYYY-MM-DD')
        }
        dispatch(
            ListTaskCalenderAction(payload)
        )
    }

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    const getDaysInMonth = Array.from({ length : daysInMonth }, (_, i) => i + 1)

    const totalDays = getDaysInMonth.length + firstDayOfMonth

    const numberOfEmptyDays = (7 - (totalDays % 7)) % 7

    const daysToRender = [...Array(firstDayOfMonth).fill(null), ...getDaysInMonth, ...Array(numberOfEmptyDays).fill(null)]

    function compareObjects(obj1, obj2) {
        const changedValues = {}
        for (const key in obj1) {
            if(
                Object.prototype.hasOwnProperty.call(obj1, key) &&
                Object.prototype.hasOwnProperty.call(obj2, key)
            ) {
                if(obj1[key] !== obj2[key]) {
                    changedValues[key] = obj2[key]
                }
            }
        }
        return changedValues
    }

    const requestSearchEmployeeFilter = (val) => {
        setSearchValEmployeeFilter(val)
        dispatch(set_search_company_based_employee([]))

        if(!val) {
            return
        }

        let data = {
            searchString : val
        }

        dispatch(
            get_search_company_based_employee(
                data,
                setModalTypeHandler,
            setLoaderStatusHandler,

            )
        )
    }

    const handleSaveTask = async(task, actionName) => {
        console.log('payrolltask',task,actionName)
        if(actionName === 'copy') {
            let newTaskData = {
                task_name : task.taskName,
                user_id : task.selectedStaff === '' ? null : task.selectedStaff,
                start_date : moment().format('yyyy-MM-DD'),
                project_id : selectedTaskForEdit.project_id,
                priority : 2,
                status: 1,
                repeat: task?.repeat ?? null,
                description : task.description,
                orginalEstimation : task.orginalEstimation,
                asignee : value?.employee_id,
                previews : [task.preImage],
                type : 'copy',
                taskLocation : task.taskLocation,
                task_latitude : task.task_latitude,
                task_longitude : task.task_longitude,
                due_date : task.dueDate,
                issue_type : task?.issueType,
                project_key:task.project_key,
                epic_name:task.epic_name
            }
console.log('payroll',newTaskData)
            apiCalls(
                dispatch(
                    createTaskAction(newTaskData, (response) => {
                        if(response === 200) {
                            let payload = {
                                project_id : selectedTaskForEdit.project_id
                            }
                            dispatch(getTaskByStatusAction(selectedTaskForEdit.project_id))
                            dispatch(taskDetailsCountAction())
                            dispatch(filterTaskDetailsAction({
                                'searchString' : '',
                                'numPerPage' : null,
                                'pageCount' : null,
                                'employeeFilter' : null,
                                'dueDateFilter' : null,
                                'projectFilter' : null,
                                'typeFilter' : 'all'
                            }, (res) => {
                                setTasks(res.data)
                            }))
                        }
                    })
                )
            )
        }
        else {
            if(selectedTaskForEdit.project_id) {
                let updatedTaskData = {
                    task_name : task.taskName,
                    user_id : task.selectedStaff === '' ? null : task.selectedStaff,
                    start_date : task.startDate ? moment(task.startDate).format('yyyy-MM-DD') : null,
                    due_date : task.dueDate ? moment(task.dueDate).format('yyyy-MM-DD') : null,
                    location_id : task.projectLocation,
                    project_id : selectedTaskForEdit.project_id,
                    priority : task.priority,
                    priority_name : task.priority_name,
                    description : task.description,
                    status : task.status,
                    repeatId : task.repeat,
                    status_name : task.status_name,
                    reporter : task.reporter,
                    orginalEstimation : task.orginalEstimation,
                    asignee : value?.employee_id,
                    remarks : task.remarks,
                    previews : task.previews?.length ? task.previews : [''],
                    taskLocation : task.taskLocation,
                    task_latitude : task.task_latitude,
                    task_longitude : task.task_longitude,
                    issue_type : task?.issueType,
                    epic_name:task.epic_name
                }

                let data = {
                    project_id : task.selectedProject
                }

                let payload = compareObjects(selectedTaskForEdit, updatedTaskData)

                await apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(
                        updateTaskAction(selectedTaskForEdit.taskId, {...payload, project_id : selectedTaskForEdit.project_id, image_key : task.imageKey}, (response) => {
                            if(response === 200) {
                                let payload = {
                                    project_id : selectedTaskForEdit.project_id
                                }
                                dispatch(getTaskByStatusAction(selectedTaskForEdit.project_id))
                                dispatch(taskDetailsCountAction())
                                dispatch(filterTaskDetailsAction({
                                    'searchString' : '',
                                    'numPerPage' : null,
                                    'pageCount' : null,
                                    'employeeFilter' : null,
                                    'dueDateFilter' : null,
                                    'projectFilter' : null,
                                    'typeFilter' : 'all'
                                }, (res) => {
                                    setTasks(res.data)
                                }))
                            }
                        })
                    )
                )
            }
            else {
                let newTaskData = {
                    task_name : task.taskName,
                    user_id : task.selectedStaff === '' ? null : task.selectedStaff,
                    start_date : task.startDate ? moment(task.startDate).format('yyyy-MM-DD') : null,
                    due_date : task.dueDate ? moment(task.dueDate).format('yyyy-MM-DD') : null,
                    location_id : task.projectLocation,
                    project_id : task.project_id,
                    priority : task.priority === '' ? 2 : task.priority,
                    description : task.description,
                    status : task.status === '' ? 4 : task.status,
                    repeat : task.repeat,
                    reporter : task.reporter,
                    orginalEstimation : task.orginalEstimation,
                    asignee : value?.employee_id,
                    remarks : task.remarks,
                    previews : task.previews,
                    taskLocation : task.taskLocation,
                    task_latitude : task.task_latitude,
                    task_longitude : task.task_longitude,
                    issue_type : task?.issueType,
                    project_key:task.project_key,
                    epic_name:task.epic_name
                }

                let data = {
                    project_id : task.selectedProject
                }

                apiCalls(
                    dispatch(
                        createTaskAction(newTaskData, (response) => {
                            if(response === 200) {
                                let payload = {
                                    project_id : task.project_id
                                }
                                dispatch(getTaskByStatusAction(task.project_id))
                                dispatch(taskDetailsCountAction())
                                dispatch(filterTaskDetailsAction({
                                    'searchString' : search ?? '',
                                    'numPerPage' : null,
                                    'pageCount' : null,
                                    'employeeFilter' : employee.length ? employee : null,
                                    'dueDateFilter' : duedate?moment(duedate).format('YYYY-MM-DD') : null,
                                    'projectFilter' : projectname ?? null,
                                    'typeFilter' : 'all'
                                }, (res) => {
                                    setTasks(res.data)
                                }))
                            }
                        })
                    )
                )
            }
        }
        setShowAddTaskDialog(false)
    }

    const handleChangeEmployeeName = (val) => {
        setValue(val)
    }

    const handleTaskDetailsOpen = async(projectId, val) => {
        setSelectedTaskData(val)
        await dispatch(getProjectDetailsAction(val.project_id, async(response) => {
            const res = await response
            if(res.status === 200) {
                setProjectData(res.data)
            }
        }))
        console.log(val, 'uuu')
        setShowAddTaskDialog(true)
    }

  return (
      <>
          <Box sx = {{ overflow : 'auto' }}>
              <Grid container spacing = {2}>
                  <Grid
                      display = 'flex'
                      justifyContent = 'flex-end'
                      alignItems = 'center'
                      size={{
                          lg: 4,
                          md: 4,
                          sm: 4,
                          xs: 12
                      }}>
                      {/* <CommonSearch /> */}
                  </Grid>

                  <Grid
                      display = 'flex'
                      justifyContent = 'center'
                      alignItems = 'center'
                      mb = {2}
                      size={{
                          lg: 4,
                          md: 4,
                          sm: 4,
                          xs: 12
                      }}>
                      <Typography sx={{ fontSize : '13px', fontWeight : 600 }}>
                          {dayjs(new Date(currentYear, currentMonth, currentDay)).format('DD/MM/YYYY')}
                      </Typography>
                  </Grid>

                  <Grid
                      display = 'flex'
                      justifyContent = 'center'
                      alignItems = 'center'
                      gap = {2}
                      size={{
                          lg: 4,
                          md: 4,
                          sm: 4,
                          xs: 12
                      }}>
                      <Tooltip
                          title = 'Prev'
                          TransitionComponent = {Fade}
                          TransitionProps = {{ timeout : 600 }}
                          placement = 'top'
                      >
                          <Button sx={{ fontSize : '30px', color : 'grey' }} onClick={handlePrevMonth}>
                              &lt;
                          </Button>
                      </Tooltip>

                      <Button
                          variant = 'contained'
                          color = 'primary'
                          onClick = {handleToday}
                      >
                          Today
                      </Button>

                      <Tooltip
                          title = 'Next'
                          TransitionComponent = {Fade}
                          TransitionProps = {{ timeout : 600 }}
                          placement = 'top'
                      >
                          <Button sx={{ fontSize : '30px', color : 'grey' }} onClick={handleNextMonth}>
                              &gt;
                          </Button>
                      </Tooltip>
                  </Grid>
              </Grid>

              <CalenderContainer>
                  {
                      daysOfWeek.map((day) => (
                          <DayWeekBox
                              key = {day}
                          >
                              <Typography  variant='h6'>
                                  {day}
                              </Typography>
                          </DayWeekBox>
                      ))
                  }

                  {
                      daysToRender.map((day, index) => {
                          if(day === null) {
                              return <DayBox key = {`empty-${index}`} />
                          }

                          const dayEvents = taskEventsList.filter((event) => {
                              const eventDate = dayjs(event.date)
                              return eventDate.date() === day && eventDate.month() === currentMonth && eventDate.year() === currentYear
                          })

                          return (
                              <DayBox key = {day}>
                                  <Typography
                                      sx = {{
                                          color : day === currentDay ? 'primary.main' : 'inherit',
                                          display : 'inline-block',
                                          width : '30px',
                                          height : '30px',
                                          lineHeight : '30px',
                                          borderRadius : '50%',
                                          backgroundColor : day === currentDay ? '#e3f2fd' : 'transparent',
                                          textAlign : 'center',
                                          fontWeight : day === currentDay ? 600 : 'normal'
                                      }}
                                  >
                                      {String(day).padStart(2, '0')}
                                  </Typography>
                                  {
                                      dayEvents.slice(0, maxEventsToShow).map((event, index) => (
                                          <EventLabel
                                              key = {index}
                                              color = {event.color}
                                              onClick = {() => handleClickTaskEventsOpen([event])}
                                          >
                                              <Typography>
                                                  {event.title}
                                              </Typography>
                                          </EventLabel>
                                      ))
                                  }
                              </DayBox>
                          )
                      })
                  }

                  <Drawer
                      sx = {{
                          flexShrink : 0,
                          '& .MuiDrawer-paper' : {
                              width : { xs : 150, sm : 250, md : 350, lg : 450 },
                              boxSizing : 'border-box',
                              display : 'flex',
                              flexDirection : 'column',
                              alignItems : 'center'
                          }
                      }}
                          anchor = 'right'
                          open = {taskEventsOpen}
                          onClose = {handleClickTaskEventsClose}
                  >
                      <Grid container spacing={2}>
                          <Grid
                              size={{
                                  lg: 6,
                                  md: 6,
                                  sm: 6,
                                  xs: 6
                              }}>
                              <Typography 
                                  variant='h6' 
                                  sx = {{
                                      position : 'absolute',
                                      top : '10px',
                                      left : '10px'
                                  }}
                              >
                                  Tasks
                              </Typography>
                          </Grid>

                          <Grid
                              size={{
                                  lg: 6,
                                  md: 6,
                                  sm: 6,
                                  xs: 6
                              }}>
                              <IconButton
                                  onClick = {handleClickTaskEventsClose}
                                  sx = {{
                                      position : 'absolute',
                                      right : '0px'
                                  }}
                              >
                                  <CloseIcon />
                              </IconButton>
                          </Grid>
                      </Grid>
                      
                      <Grid
                          sx={{ marginTop : '50px' }}
                          size={{
                              lg: 12,
                              md: 12,
                              sm: 12,
                              xs: 12
                          }}>
                          {
                              selectedDaysTask.map((event, index) => (
                                  <Box key={index} mb={2}>
                                      {
                                          event.employee_name.length > 0 ? event.employee_name.map((val, valIndex) => (
                                              <Box key={valIndex} display='flex' alignItems='center' sx={{ gap : '10px', mb : 2 }}>
                                                  <Avatar>
                                                      <img src = {personIcon} height = {40} width = {40} alt = 'person' />
                                                  </Avatar>

                                                  <Button 
                                                      sx={{ color : 'black' }}
                                                      onClick={() => handleTaskDetailsOpen(val.project_id, val)}
                                                  >
                                                      {val.assignee_name} , {val.task_name} , {val.task_id}
                                                  </Button>
                                              </Box>
                                          ))
                                          :
                                          <Typography>
                                              No Records
                                          </Typography>
                                      }
                                  </Box>
                              ))
                          }
                      </Grid>

                  </Drawer>
              </CalenderContainer>
          </Box>
          <Drawer
              sx = {{
                  flexShrink : 0,
                  '& .MuiDrawer-paper' : {
                      width : { xs : 420, sm : 600, md : 750, lg : 850 },
                      boxSizing : 'border-box'
                  }
              }}
              anchor = 'right'
              open = {showAddTaskDialog}
              onClose = {() => setShowAddTaskDialog(false)}
          >
              <CardHeader
                  onAddAttachments = {() => { }}
                  onClickDeleteIcon = {() => { }}
                  onCloseAddCard = {() => setShowAddTaskDialog(false)}
                  taskDataForEdit = {selectedTaskForEdit}
              />
              <AddTaskDialog 
                  type = {'board'}
                  searchVal = {searchValEmployeeFilter}
                  setSearchValEmployeeFilter = {setSearchValEmployeeFilter}
                  requestSearch = {requestSearchEmployeeFilter}
                  open = {showAddTaskDialog}
                  onClose = {() => setShowAddTaskDialog(false)}
                  value = {value}
                  onSave = {handleSaveTask}
                  setValue = {handleChangeEmployeeName}
                  projectData = {projectData}
                  taskDataForEdit = {selectedTaskForEdit}
                  projectSelection = {get_projects}
                  staffsList = {getCompanyBasedEmployeeFilter}
                  searchType = {searchCompanyBasedEmployeeFilter}
                  location = {stocklocation}
              />
          </Drawer>
      </>
  );
}

export default PayrollTask