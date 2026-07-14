import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  Switch,
  Slide,
  FormControlLabel,
  Radio,
  FormLabel,
  RadioGroup,
  Typography,
  Autocomplete,
  Box,
} from '@mui/material';
import CreateNewButtonContext from '../../context/CreateNewButtonContext';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { userRolePaginationAction } from 'redux/actions/role_actions';
import { CreateProjectAction, projectTypesaction, getActiveStatusByLane, getActiveStatusByLaneAction, get_checkProjectExistsAction } from 'redux/actions/payrollDashboard_actions';
import { listEmployeeCategoryAction } from 'redux/actions/shifts.actions';
import { listUserCreationAction } from 'redux/actions/userCreation_actions';
import { allListStockLocation } from 'redux/actions/stock_Location_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import { titleURL } from 'http-common';
import { getAppConfigDataAction } from 'redux/actions/app_config_actions';
import { showTasklistAction } from 'redux/actions/payrollDashboard_actions';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Stack from '@mui/material/Stack';
import CheckIcon from '@mui/icons-material/Check';
import apiCalls from 'utils/apiCalls';
import { boolean } from 'yup';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});

const AddProjectForm = ({ open, onClose, onSave, projectData }) => {
  
  const IOSSwitch = styled((props) => (
    <Switch
      focusVisibleClassName='.Mui-focusVisible'
      disableRipple
      {...props}
    />
  ))(({ theme }) => ({
    width: 42,
    height: 26,
    padding: 0,
    '& .MuiSwitch-switchBase': {
      padding: 0,
      margin: 2,
      transitionDuration: '300ms',
      '&.Mui-checked': {
        transform: 'translateX(16px)',
        color: '#FFFFFF',
        '& + .MuiSwitch-track': {
          backgroundColor:
            theme.palette.mode === 'dark' ? '#4682B4' : '#4682B4',
          opacity: 1,
          border: 0,
        },
        '&.Mui-disabled + .MuiSwitch-track': {
          opacity: 0.5,
        },
      },
      '&.Mui-focusVisible .MuiSwitch-thumb': {
        color: '#33cf4d',
        border: '6px solid #fff',
      },
      '&.Mui-disabled .MuiSwitch-thumb': {
        color:
          theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[600],
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
      },
    },
    '& .MuiSwitch-thumb': {
      boxSizing: 'border-box',
      width: 22,
      height: 22,
    },
    '& .MuiSwitch-track': {
      borderRadius: 26 / 2,
      backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
      opacity: 1,
      transition: theme.transitions.create(['background-color'], {
        duration: 500,
      }),
    },
  }));

  const dispatch = useDispatch();
  const storage = getsessionStorage();
  const {
    stockLocationReducer: { stocklocation, allliststocklocation },
    roleReducer: { searchUserRoleData },
    PayrolldashboardReducers: {get_taskProjects,getprojectTypes,get_projects},
    ShiftsReducer: { employeeCategoryList },
    UserCreationReducer: {createUser}
  } = useSelector((state) => state);

  const [isStstusList, getIsStatusList] = useState([])
  const [isSwitch, setisSwitch] = useState(false);
  const [isExternalSwitch, setisExternalSwitch] = useState(false);
  const [isTimeSwitch, setisTimeSwitch] = useState();
  const [showAlerts, setShowAlerts] = useState({
    backlogAlert: false,
    inProgressAlert: false,
    testingAlert: false,
  });
  const [formErrors, setFormErrors] = useState({
    projectName: null,
    projectType: null,
    location_name: null,
    latitude: null,
    longitude: null,
    board:null,
    key : null
    // user_name: null,
  });
  const baseRequiredFields = ['projectName', 'projectType', 'board', 'key'];
  const [requiredFields, setRequiredFields] = useState(baseRequiredFields);
  const [formData, setFormData] = useState({
    projectName: '',
    projectType: 1,
    location_name: '',
    time_tracking: 0,
    live_location: 0,
    location_restriction: 0,
    latitude: '',
    longitude: '',
    // user_name: '',
    // externalProject: 0,
    backlog: 0,
    todo: 1,
    inProgress: 0,
    testing: 0,
    completed: 1,
    backlog_count: '',
    inProgress_count: '',
    testing_count: '',
    work_from_home: '',
    locationMethod: 'dropdown',
    location_id: '',
    board : '',
    template : 'null',
    key: '',
    project_url: '',
    category: '',
    project_lead: ''
  });
  const [enableLiveLocation, setEnableLiveLocation] = useState(false)
  const [flag, setFlag] = useState(false)
  const [isKeyDirty, setIsKeyDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  // Synchronous guard: React state updates are async, so rapid clicks can all pass `saving` check before re-render.
  const savingRef = useRef(false);
  useEffect(() => {
    if (projectData) {      

      let data = {
        project_id: projectData.id,
      };

      dispatch(showTasklistAction(data, 
        (response) => {
          if(response.length){
            setFlag(true)
          }
        }
      ));

      setFormData({
        projectName: projectData.project_name,
        projectType: projectData.project_type,
        location_name: projectData.location_id,
        latitude: projectData.latitude,
        longitude: projectData.longitude,
        // user_name: projectData.user_name,
        // externalProject: projectData.externalProject,
        location_restriction : projectData.location_restriction,
        time_tracking: projectData.time_tracking,
        live_location: projectData.live_location,
        work_from_home: projectData.work_from_home,
        backlog: projectData.backlog,
        todo: projectData.todo,
        inProgress: projectData.inProgress,
        testing: projectData.testing,
        completed: projectData.completed,
        backlog_count: projectData.backlog_count,
        inProgress_count: projectData.inProgress_count,
        testing_count: projectData.testing_count,
        locationMethod:
          projectData.location_id != null && projectData.location_id !== ''
            ? 'dropdown'
            : (projectData.latitude != null && projectData.latitude !== '') ||
              (projectData.longitude != null && projectData.longitude !== '')
            ? 'coordinates'
            : 'dropdown',
        board:projectData.boardType,
        template : projectData.temp_id,
        key: projectData?.project_key,
        project_url: projectData?.project_url || '',
        category: projectData?.category || '',
        project_lead: projectData?.project_lead || ''
        // live_location: enableLiveLocation ? projectData.live_location : 0,
      });
    }
  }, [projectData, open]);

    const adminEmployees = useMemo(
      () =>
        (createUser || []).map((emp) => ({
          ...emp,
          role_name: emp?.role_name?.toLowerCase(),
        })).filter((emp) =>
          ['administrator', 'admin', 'manager'].includes(emp?.role_name),
        ),
      [createUser],
    );
  
  useEffect(() => {
    if (open) {
      setIsKeyDirty(Boolean(projectData));
    }
  }, [open, projectData]);

  useEffect(() => {
    if (projectData) {
      let project_id = projectData.id
      dispatch(getActiveStatusByLaneAction(project_id,
        (response) => {
              const statusList = (response || []).map((list) => list.status_name);
              getIsStatusList(statusList)

        }
      ));
    }
  }, [projectData, open])
  
  useEffect(() => {
    if (formData.projectType === 4) {
      setFormData({ ...formData, time_tracking: 1, live_location: 1 });
    }
  }, [formData.projectType]);

  useEffect(() => {
    const trimmed = String(formData.projectName || '').trim();
    if (!trimmed) return;
    const timer = setTimeout(() => {
      dispatch(
        get_checkProjectExistsAction(
          {
            type: 'PROJECT_NAME',
            value: trimmed,
            exclude_id: projectData?.id || 0,
          },
          (response) => {
            setFormErrors((prev) => ({
              ...prev,
              projectName: response?.exists
                ? 'Project name already exists for this company.'
                : null,
            }));
          }
        )
      );
    }, 400);
    return () => clearTimeout(timer);
  }, [formData.projectName, projectData?.id]);

  useEffect(() => {
    const trimmed = String(formData.key || '').trim();
    if (!trimmed || !isValidKey(trimmed)) return;
    const timer = setTimeout(() => {
      dispatch(
        get_checkProjectExistsAction(
          {
            type: 'PROJECT_KEY',
            value: trimmed,
            exclude_id: projectData?.id || 0,
          },
          (response) => {
            setFormErrors((prev) => ({
              ...prev,
              key: response?.exists
                ? 'Project key already exists for this company.'
                : null,
            }));
          }
        )
      );
    }, 400);
    return () => clearTimeout(timer);
  }, [formData.key, projectData?.id]);

  const handleCancel = () => {
    if (projectData) {
      setFormErrors({
        projectName: null,
        projectType: null,
        location_name: null,
        latitude: null,
        longitude: null,
        key: null
        // user_name: null,
      });
      onClose();
    } else {
      setFormData({
        projectName: '',
        projectType: '',
        location_name: '',
        latitude: '',
        longitude: '',
        key: ''
        // user_name: '',
      });
      setFormErrors({
        projectName: null,
        projectType: null,
        location_name: null,
        latitude: null,
        longitude: null,
        key: null
        // user_name: null,
      });
      onClose();
    }
  };
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(CreateNewButtonContext);

  useEffect(() => {
    const body = {
      searchString: '',
      employee_id: commoncookie,
      headerLocationId: headerLocationId,
      numPerPage: 20,
      pageCount: 0,
    };
    dispatch(userRolePaginationAction(body));

    dispatch(getAppConfigDataAction(
      setModalTypeHandler,
      setLoaderStatusHandler,
      (response) => {
        if (response) {
          response.forEach((d) => {
            if (d.key_name === 'company.enableLiveLocation' && d.value === 'true') {
              setEnableLiveLocation(true)
            }
          });
        }
      }
    ))

    dispatch(projectTypesaction());
    dispatch(listEmployeeCategoryAction({ type: 'LIST_CATEGORY' }));
    dispatch(allListStockLocation());
    if (!createUser.length) dispatch(listUserCreationAction());

  }, []);

  // useEffect(() => {
  //   if (formData.externalProject === 0) {
  //     console.log('externalProject formData if---------------------------', formData);
  //     setFormData({
  //       ...formData,
  //       latitude: null,
  //       longitude: null,
  //       user_name: null,
  //     });
  //   } else {
  //     console.log('externalProject formData else--------------', formData);
  //     setFormData({
  //       ...formData,
  //       location_name: null,
  //     });
  //   }
  // }, [formData.externalProject]);

  const live_loaction = searchUserRoleData?.data?.filter(
    (v) => v.role_id === storage.role_id,
  );
  // const handleSave = () => {
  //   if (formData.projectName && formData.projectType && formData.location_name) {
  //     if (projectData) {
  //       onSave(formData, projectData.id);
  //       setFormData({
  //         projectName: '',
  //         projectType: '',
  //         location_name: '',
  //       });
  //     } else {
  //       onSave(formData);
  //       setFormData({
  //         projectName: '',
  //         projectType: '',
  //         location_name: '',
  //       });
  //     }
  //     onClose();
  //   }
  // };

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const sanitizeKeyValue = (value) => {
    if (!value) return '';
    const cleaned = String(value).replace(/[^a-zA-Z0-9-]/g, '');
    const normalized = cleaned.replace(/^-+/, '');
    return normalized.toUpperCase();
  };

  const isValidKey = (value) => /^[A-Z0-9][A-Z0-9-]*$/.test(value || '');

  const checkProjectExists = (type, value) => new Promise((resolve) => {
    dispatch(
      get_checkProjectExistsAction(
        { type, value: String(value).trim(), exclude_id: projectData?.id || 0 },
        (response) => resolve(Boolean(response?.exists))
      )
    );
  });

  const handleSave = async (event) => {
    event.preventDefault();
    // console.log("savingRef",savingRef.current)
    if (savingRef.current) return;
    savingRef.current = true;

    let isValid = true;
    let formErrorsObj = { 
      projectName: null,
      projectType: null,
      location_name: null,
      latitude: null,
      longitude: null,
      board: null,
      key: null, };
    
    if (formData.projectType === 2) {
      if (formData.locationMethod === 'dropdown' && !formData.location_name) {
        isValid = false;
        formErrorsObj.location_name = 'Project Location is Required!';
      } else if (formData.locationMethod === 'coordinates') {
        if (!formData.latitude) {
          isValid = false;
          formErrorsObj.latitude = 'Latitude is Required!';
        }
        if (!formData.longitude) {
          isValid = false;
          formErrorsObj.longitude = 'Longitude is Required!';
        }
      }
    }

    
    await Object.keys(formData).map((key, i) => {
      if (
        requiredFields.includes(key) &&
        (formData[key] === null ||
          formData[key] === '' ||
          formData[key] === 'undefined')
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Required!';
      }
      // else if (regex[key]) {
      //   if (!regex[key].test(formData[key])) {
      //     isValid = false;
      //     formErrorsObj[key] = capitalize(key) + ' is Invalid!';
      //   }                                                                                 
      // }
      return null;
    });

    if (!formData.key || !isValidKey(formData.key)) {
      isValid = false;
      formErrorsObj.key =
        'Key must start with a letter or number and contain only letters, numbers, and hyphens.';
    }

    if (formErrors.projectName && String(formErrors.projectName).includes('already exists')) {
      isValid = false;
      formErrorsObj.projectName = formErrors.projectName;
    }
    if (formErrors.key && String(formErrors.key).includes('already exists')) {
      isValid = false;
      formErrorsObj.key = formErrors.key;
    }

    if (isValid && formData.projectName && formData.key && isValidKey(formData.key)) {
      const nameExists = await checkProjectExists('PROJECT_NAME', formData.projectName);
      const keyExists = await checkProjectExists('PROJECT_KEY', formData.key);

      if (nameExists) {
        isValid = false;
        formErrorsObj.projectName = 'Project name already exists for this company.';
      }
      if (keyExists) {
        isValid = false;
        formErrorsObj.key = 'Project key already exists for this company.';
      }
    }

    setFormErrors(formErrorsObj);

    if (!isValid) {
      savingRef.current = false;
      return;
    }

    {

      if (formData.projectType === 2) {
        if (formData.locationMethod === 'dropdown') {
          formData.latitude = '';
          formData.longitude = '';
        } else if (formData.locationMethod === 'coordinates') {
          formData.location_name = '';
        }
      }

      setSaving(true);
      try {
        if (projectData) {
          const editData = {
            ...formData,
            editType: flag ? 'afterTask' : 'beforeTask',
          };
          await onSave(editData, projectData.id);
        } else {
          await onSave(formData); 
        }
        setFormData({
          projectName: '',
          projectType: '',
          location_name: '',
          latitude: '',
          longitude: '',
        });
        onClose();
      } catch (err) {
        if (err && err.code === 'DUPLICATE') {
          const message = err.message || 'Duplicate project';
          setFormErrors((prev) => ({
            ...prev,
            projectName:
              err.field === 'project_name' ? message : prev.projectName,
            key: err.field === 'project_key' ? message : prev.key,
          }));
        }
      } finally {
        setSaving(false);
        savingRef.current = false;
      }
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    const normalizedValue = name === 'projectType' ? Number(value) : value;

    if (name === 'projectName') {
      const nextKey = !isKeyDirty && !projectData ? sanitizeKeyValue(value) : formData.key;
      setFormData((prevFormData) => ({
        ...prevFormData,
        projectName: value,
        key: nextKey,
      }));
      if (!isKeyDirty && !projectData) {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          key: nextKey ? null : prevErrors.key,
        }));
      }
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: normalizedValue,
      }));
    }
  
    if (name === 'projectType') {
      if (normalizedValue === 1) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          // externalProject: 0
          location_restriction: 0,
          live_location: null,
          latitude: null,
          longitude: null,
          location_id: null,
          location_name: null
          
        }));
        setRequiredFields(baseRequiredFields);
      } else if (normalizedValue === 2) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          live_location: 0,
        }));
        setRequiredFields(baseRequiredFields);
      } else if (normalizedValue === 3) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          live_location: 0,
          location_id: null,
          latitude: null,
          longitude: null,
          location_name: null
          
        }));
        setRequiredFields(baseRequiredFields);

      } else if(normalizedValue === 4) {
        // for projecttype -4 (live tracking)
        setFormData((prevFormData) => ({
          ...prevFormData,
          // externalProject: 1
          latitude: null,
          longitude: null,
          location_id: null,
          location_name: null
        }));
        setRequiredFields(baseRequiredFields);
      }
      if (normalizedValue === 2 || normalizedValue === 3) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          location_restriction: 1,
        }));
      }
    }
    if (name === 'latitude' || name === 'longitude') {
  setFormErrors((prevErrors) => ({
    ...prevErrors,
    [name]:
      value !== '' && value !== null && value !== undefined
        ? null
        : prevErrors[name],
  }));
}
    if (name === 'locationMethod') {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        location_name: value === 'dropdown' ? prevErrors.location_name : null,
        latitude: value === 'coordinates' ? prevErrors.latitude : null,
        longitude: value === 'coordinates' ? prevErrors.longitude : null,
      }));
    }
  };

  const handleKeyChange = (event) => {
    const rawValue = event.target.value;
    const nextKey = sanitizeKeyValue(rawValue);
    setIsKeyDirty(true);
    setFormData((prevData) => ({
      ...prevData,
      key: nextKey,
    }));
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      key: nextKey && isValidKey(nextKey)
        ? null
        : 'Key must start with a letter or number and contain only letters, numbers, and hyphens.',
    }));
  };
  
  

  const setStateHandler = async (name, value) => {
    let formObj = {};

    formObj = {
      ...formData,
      [name]: value === '' ? null : value,
    };

    await setFormData(formObj);
    validationHandler(name, value);
  };

  const validationHandler = (name, value) => {
    if (!Object.keys(formErrors).includes(name)) return;

    if (
      requiredFields.includes(name) &&
      (value === null ||
        value === 'null' ||
        value === '' ||
        value === false ||
        value === 'undefined' ||
        (Object.keys(value) && value.value === null))
    ) {
      setFormErrors({
        ...formErrors,
        [name]: capitalize(name) + ' is Required!',
      });
    } else {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  // const handleSwitchChange = (e) => {
  //   if (e.target.checked === true) {
  //     setFormData({ ...formData, live_location: 1 })
  //   } else {
  //     setFormData({ ...formData, live_location: 0 })
  //   }
  // };
  const handleSwitchChange = (e) => {
     if (formData.time_tracking === 1) { 
      setFormData({ ...formData, live_location: e.target.checked ? 1 : 0 }); 
    }
  };
  const handleLocationSwitchChange = (e) => {
    const isChecked = e.target.checked;
    if (formData.projectType === 4) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        location_restriction: isChecked ? 1 : 0,
        time_tracking: 1,
        live_location: 1,
      }));
      
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        location_restriction: isChecked ? 1 : 0,
        // time_tracking: isChecked ? 1 : 0,
        live_location: 0,
      }));
    }
  };

  // const handleExternalSwitchChange = (e) => {
  //   if (formData.projectType !== 1) {
  //     return; // Prevent switching off if projectType is not 1
  //   }
  
  //   if (e.target.checked) {
  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       latitude: null,
  //       longitude: null,
  //       // externalProject: 1
  //     }));
  //     if (formData.projectType !== 1) {
  //       setRequiredFields(['projectName', 'projectType', 'latitude', 'longitude']);
  //     } else {
  //       setRequiredFields(['projectName', 'projectType', 'location_name']);
  //     }
  //   } else {
  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       location_name: null,
  //       // externalProject: 0,
  //       // location_restriction: 0y
  //     }));
  //     setRequiredFields(['projectName', 'projectType', 'location_name']);
  //   }
  // };
  // const handleTimeSwitchChange = (e) => {
  //   if (e.target.checked === true) {
  //     setFormData({ ...formData, time_tracking: 1 })
  //   } else {
  //     setFormData({ ...formData, time_tracking: 0 })
  //   }
  // };
  const handleTimeSwitchChange = (e) => {
    const isChecked = e.target.checked;

    
    if (formData.projectType === 4) {
      setFormData({ ...formData, time_tracking: 1, live_location: 1 });
    } else {
        setFormData({ ...formData, time_tracking: isChecked ? 1 : 0, live_location: 0 });
    }
  };
  const handleBackLogSwitchChange = (e) => {
    if (formData.backlog_count > 0 ) {
      setShowAlerts({ ...showAlerts, backlogAlert: true });
    } else {
      if (e.target.checked === true) {
        setFormData({ ...formData, backlog: 1 });
      } else {
        setFormData({ ...formData, backlog: 0 });
      }
    }
  };
  const handletodoSwitchChange = (e) => {
    if (e.target.checked === true) {
      setFormData({ ...formData, todo: 0 })
    } else {
      setFormData({ ...formData, todo: 1 })
    }
  };
  const handleinProgressSwitchChange = (e) => {
    if (formData.inProgress_count > 0 ) {
      setShowAlerts({ ...showAlerts, inProgressAlert: true });
    } else {
      if (e.target.checked === true) {
        setFormData({ ...formData, inProgress: 1 })
      } else {
        setFormData({ ...formData, inProgress: 0 })
      }
    }
  };
  
  const handleTestSwitchChange = (e) => {
    if (formData.testing_count > 0 ) {
      setShowAlerts({ ...showAlerts, testingAlert: true });
    } else {
      if (e.target.checked === true) {
        setFormData({ ...formData, testing: 1 })
      } else {
        setFormData({ ...formData, testing: 0 })
      }
    }
  };
 
  const handlecompletedSwitchChange = (e) => {
    if (e.target.checked === true) {
      setFormData({ ...formData, completed: 0 })
    } else {
      setFormData({ ...formData, completed: 1 })
    }
  };
  useEffect(() => {
    dispatch(getAppConfigDataAction(setModalTypeHandler, setLoaderStatusHandler, (response) => {
      if (response) {
        response.forEach((d) => {
          if (d.key_name === 'company.enableWorkFromHome' && d.value === 'true' && !projectData) {
            setFormData({ ...formData, work_from_home: 0 })
          }
        });
      }
    }))
  }, [!projectData]);

  useEffect(() => {
    if (projectData?.location_id !== null && projectData?.latitude === null) {
      setFormData(prevState => ({
        ...prevState,
        locationMethod: 'dropdown'
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        locationMethod: 'coordinates'
      }));
    }
  }, [projectData?.location_id, projectData?.latitude]);
  

const showLatLonFields = formData.projectType !== 1 && formData.projectType !== 4 && formData.projectType !== 2 && formData.projectType !== 3;
const projectSingleLocation = formData.projectType === 2;
const templatesByBoard = get_projects.filter(
  (project) => Number(project.boardType) === Number(formData.board),
);

const BoardTypes = [ {id : 1 , type : 'Scrum'},{id : 2 , type : 'Kanban'}]

const methodologyDescriptions = {
  1: 'Work in structured sprints with fixed durations. Ideal for teams requiring predictable delivery cadences and complex planning.',
  2: 'Continuous flow paradigm focusing on work-in-progress limits. Ideal for support, operations, or continuous delivery teams.',
};

  const categoryOptions = (employeeCategoryList || []).map((c) => ({
    id: c.id,
    name: c.category_name || c.name || '',
  })).filter((c) => c.name);

  const modernFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
      backgroundColor: '#FFFFFF',
      fontSize: 14,
    '& fieldset': { borderColor: '#E2E8F0' },
    '&:hover fieldset': { borderColor: '#CBD5E1' },
    '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: 1.5 },
  },
  '& .MuiInputLabel-root': { fontSize: 13.5, color: '#64748B' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#2563EB' },
};

  const projectUrlPreview = (() => {
    const keyPart = String(formData.key || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
    return `architect.pro/projects/${keyPart || 'your-key'}`;
  })();

  const selectedProjectLead = useMemo(() => {
    const currentValue = String(formData.project_lead || '').trim().toLowerCase();
    if (!currentValue) return null;

    return (
      adminEmployees.find((u) => String(u.employee_id || '').trim().toLowerCase() === currentValue) ||
      adminEmployees.find((u) => {
        const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim().toLowerCase();
        return fullName === currentValue;
      }) ||
      adminEmployees.find((u) => String(u.user_name || '').trim().toLowerCase() === currentValue) ||
      null
    );
  }, [adminEmployees, formData.project_lead]);

const handleBoardChange = (event) => {
  const { name, value } = event.target;

  setFormData((prevData) => ({
    ...prevData,
    [name]: value,
    ...(name === 'board' ? { template: '' } : {}),
  }));

  setFormErrors((prevError) => ({
    ...prevError,
    [name]: value ? null : `${name} is required`, // Dynamic error message
  }));
};

const handleTempleteChange = (event, selectedTemplate) => {
  if (selectedTemplate) {
    setFormData((prevData) => ({
      ...prevData,
      template: selectedTemplate.id,
      backlog: Number(selectedTemplate.backlog),
      todo: Number(selectedTemplate.todo),
      inProgress: Number(selectedTemplate.inProgress),
      testing: Number(selectedTemplate.testing),
      completed: Number(selectedTemplate.completed),
      backlog_count: selectedTemplate.backlog_count,
      inProgress_count: selectedTemplate.inProgress_count,
      testing_count: selectedTemplate.testing_count,
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      template: 'null',
      backlog: 0,
      todo: 1,
      inProgress: 0,
      testing: 0,
      completed: 1,
      backlog_count: '',
      inProgress_count: '',
      testing_count: '',
    }));
  }
  setShowAlerts({
    backlogAlert: false,
    inProgressAlert: false,
    testingAlert: false,
  });
};

  const segmentChips = [
    { key: 'backlog', label: 'Backlog', active: formData.backlog === 1, onToggle: handleBackLogSwitchChange, disabled: isStstusList.some((name) => String(name).toLowerCase().replace(/\s+/g, '') === 'Backlog') },
    { key: 'todo', label: 'To Do', active: formData.todo === 1, onToggle: null, disabled: true },
    { key: 'inProgress', label: 'In Progress', active: formData.inProgress === 1, onToggle: handleinProgressSwitchChange, disabled: isStstusList.some((name) => String(name).toLowerCase().replace(/\s+/g, '') === 'In Progress') },
    { key: 'testing', label: 'Testing', active: formData.testing === 1, onToggle: handleTestSwitchChange, disabled: isStstusList.some((name) => String(name).toLowerCase().replace(/\s+/g, '') === 'Testing') },
    { key: 'completed', label: 'Completed', active: formData.completed === 1, onToggle: null, disabled: true },
  ];

  const toggleCard = (title, description, checked, onChange, disabled = false, show = true) => {
    if (!show) return null;
    return (
      <Box
        sx={{
          p: 2,
          border: '1px solid #E2E8F0',
          borderRadius: 2,
          bgcolor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mt: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A' }}>{title}</Typography>
          <Typography sx={{ fontSize: 12, color: '#64748B', mt: 0.25 }}>{description}</Typography>
        </Box>
        <IOSSwitch checked={checked} onChange={onChange} disabled={disabled} />
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      fullWidth
      maxWidth='lg'
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
        },
      }}
    >
      <Box
        sx={{
          px: 4,
          pt: 3.5,
          pb: 2.5,
          borderBottom: '1px solid #E2E8F0',
          background: '#FFFFFF',
        }}
      >
        <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>
          {projectData?.project_name?.length > 0 ? projectData?.project_name : 'Create New Project'}
        </Typography>
      </Box>

      <DialogContent
        onClick={() =>
          setShowAlerts({
            ...showAlerts,
            backlogAlert: false,
            inProgressAlert: false,
            testingAlert: false,
          })
        }
        sx={{ px: 4, py: 3, bgcolor: '#F8FAFC' }}
      >
        <Helmet>
          <meta charSet='utf-8' />
          <title> {titleURL} | Projects </title>
        </Helmet>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              label='Project Name'
              name='projectName'
              placeholder='e.g. Website Redesign Q3'
              value={formData.projectName}
              onChange={handleChange}
              fullWidth
              required
              size='small'
              error={formErrors.projectName !== null}
              helperText={formErrors.projectName || ''}
              disabled={flag === true}
              sx={modernFieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label='Key'
              name='key'
              placeholder='WEB'
              value={formData.key}
              onChange={handleKeyChange}
              disabled={flag === true}
              fullWidth
              required
              size='small'
              error={formErrors.key !== null}
              helperText={formErrors.key}
              sx={modernFieldSx}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Typography sx={{ fontSize: 12, color: '#64748B', mb: 0.5, fontWeight: 500 }}>
            Project URL (Optional)
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'stretch',
              borderRadius: 1.5,
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              bgcolor: '#FFFFFF',
              '&:hover': { borderColor: '#CBD5E1' },
              '&:focus-within': { borderColor: '#2563EB' },
            }}
          >
            {/* <Box
              sx={{
                px: 1.5,
                display: 'flex',
                alignItems: 'center',
                bgcolor: '#F1F5F9',
                color: '#475569',
                fontSize: 13,
                fontWeight: 500,
                borderRight: '1px solid #E2E8F0',
              }}
            >
              https://
            </Box> */}
  
            <TextField
              label='URL'
              name='project_url'
              value={formData.project_url || ''}
              onChange={handleChange}
              fullWidth
              size='small'
              sx={modernFieldSx}
              placeholder={projectUrlPreview}
            />
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              options={categoryOptions}
              getOptionLabel={(option) => option.name || ''}
              value={
                categoryOptions.find(
                  (c) => Number(c.id) === Number(formData.category)
                ) || null
              }
              onChange={(event, newValue) =>
                handleChange({
                  target: { name: 'category', value: newValue ? newValue.id : '' },
                })
              }
              isOptionEqualToValue={(option, value) =>
                Number(option.id) === Number(value.id)
              }
              size='small'
              fullWidth
              sx={modernFieldSx}
              renderInput={(params) => (
                <TextField {...params} label='Category' fullWidth />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              options={adminEmployees}
              getOptionLabel={(option) =>
                `${capitalize(option.first_name || '')} ${capitalize(option.last_name || '')}${option.employee_code ? ' - ' + option.employee_code : ''}`.trim()
              }              
              value={selectedProjectLead}
              onChange={(event, newValue) =>
                handleChange({
                  target: { name: 'project_lead', value: newValue ? newValue.employee_id : '' },
                })
              }
              isOptionEqualToValue={(option, value) =>
                Number(option.employee_id) === Number(value.employee_id)
              }
              size='small'
              fullWidth
              sx={modernFieldSx}
              renderInput={(params) => (
                <TextField {...params} label='Project Lead' placeholder='Assign a lead' fullWidth />
              )}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, sm: templatesByBoard.length > 0 ? 6 : 12 }}>
            <Autocomplete
              options={getprojectTypes}
              getOptionLabel={(option) => option.project_type || ''}
              value={
                getprojectTypes.find(
                  (t) => Number(t.id) === Number(formData.projectType)
                ) || null
              }
              onChange={(event, newValue) =>
                handleChange({
                  target: { name: 'projectType', value: newValue ? newValue.id : '' },
                })
              }
              isOptionEqualToValue={(option, value) =>
                Number(option.id) === Number(value.id)
              }
              size='small'
              fullWidth
              sx={modernFieldSx}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Project Type'
                  required
                  fullWidth
                  error={formErrors.projectType !== null}
                  helperText={formErrors.projectType !== null ? 'Project Type is required' : ''}
                />
              )}
            />
          </Grid>
          {templatesByBoard.length > 0 && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                options={templatesByBoard}
                getOptionLabel={(option) => option.project_name || ''}
                value={
                  templatesByBoard.find(
                    (t) => Number(t.id) === Number(formData.template)
                  ) || null
                }
                onChange={handleTempleteChange}
                isOptionEqualToValue={(option, value) =>
                  Number(option.id) === Number(value.id)
                }
                disabled={!formData.board}
                size='small'
                sx={{
                  opacity: !formData.board ? 0.6 : 1,
                  transition: 'opacity .2s ease',
                  ...modernFieldSx,
                }}
                renderInput={(params) => (
                  <TextField {...params} label='Template (Optional)' fullWidth />
                )}
              />
            </Grid>
          )}
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A', mb: 1 }}>
            Methodology *
          </Typography>
          <Grid container spacing={2}>
            {BoardTypes.map((type) => {
              const selected = Number(formData.board) === Number(type.id);
              return (
                <Grid key={type.id} size={{ xs: 12, sm: 6 }}>
                  <Box
                    onClick={() =>
                      handleBoardChange({ target: { name: 'board', value: type.id } })
                    }
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      cursor: 'pointer',
                      bgcolor: '#FFFFFF',
                      border: `2px solid ${selected ? '#2563EB' : '#E2E8F0'}`,
                      boxShadow: selected ? '0 0 0 4px rgba(37, 99, 235, 0.08)' : 'none',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                      '&:hover': {
                        borderColor: selected ? '#2563EB' : '#CBD5E1',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          bgcolor: selected ? '#DBEAFE' : '#F1F5F9',
                          color: selected ? '#2563EB' : '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      >
                        {type.type.charAt(0)}
                      </Box>
                      <Box sx={{ flex: 1, pr: 3 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
                          {type.type}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: '#64748B', mt: 0.5, lineHeight: 1.5 }}>
                          {methodologyDescriptions[type.id]}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          border: `2px solid ${selected ? '#2563EB' : '#CBD5E1'}`,
                          bgcolor: selected ? '#2563EB' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {selected && (
                          <CheckIcon sx={{ color: '#FFFFFF', fontSize: 12 }} />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
          {formErrors.board && (
            <FormHelperText error sx={{ mt: 0.5, ml: 0.5 }}>
              {formErrors.board}
            </FormHelperText>
          )}
        </Box>

        {showLatLonFields && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='Latitude'
                name='latitude'
                value={formData.latitude}
                type='number'
                onChange={handleChange}
                fullWidth
                size='small'
                onWheel={(e) => e.target.blur()}
                required
                error={formErrors.latitude !== null}
                helperText={formErrors.latitude !== null ? 'Latitude is required' : ''}
                sx={modernFieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='Longitude'
                name='longitude'
                value={formData.longitude}
                type='number'
                onChange={handleChange}
                fullWidth
                size='small'
                onWheel={(e) => e.target.blur()}
                required
                error={formErrors.longitude !== null}
                helperText={formErrors.longitude !== null ? 'Longitude is required' : ''}
                sx={modernFieldSx}
              />
            </Grid>
          </Grid>
        )}

        {projectSingleLocation && (
          <Box sx={{ mt: 2 }}>
            <FormControl component='fieldset'>
              <RadioGroup
                row
                aria-label='locationMethod'
                name='locationMethod'
                value={formData.locationMethod}
                onChange={handleChange}
              >
                <FormControlLabel
                  value='dropdown'
                  control={<Radio size='small' />}
                  label={<Typography sx={{ fontSize: 13 }}>Select Location</Typography>}
                />
                <FormControlLabel
                  value='coordinates'
                  control={<Radio size='small' />}
                  label={<Typography sx={{ fontSize: 13 }}>Enter Latitude and Longitude</Typography>}
                />
              </RadioGroup>
            </FormControl>

            {formData.locationMethod === 'dropdown' ? (
              <Autocomplete
                options={allliststocklocation || []}
                getOptionLabel={(option) => option.location_name || ''}
                value={
                  (allliststocklocation || []).find(
                    (l) => Number(l.location_id) === Number(formData.location_name)
                  ) || null
                }
                onChange={(event, newValue) =>
                  handleChange({
                    target: {
                      name: 'location_name',
                      value: newValue ? newValue.location_id : '',
                    },
                  })
                }
                isOptionEqualToValue={(option, value) =>
                  Number(option.location_id) === Number(value.location_id)
                }
                size='small'
                fullWidth
                sx={{ ...modernFieldSx, mt: 1 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Project Location'
                    required
                    fullWidth
                    error={formErrors.location_name !== null}
                    helperText={
                      formErrors.location_name !== null ? 'Project Location is required' : ''
                    }
                  />
                )}
              />
            ) : (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label='Latitude'
                    name='latitude'
                    value={formData.latitude}
                    type='number'
                    onChange={handleChange}
                    fullWidth
                    size='small'
                    onWheel={(e) => e.target.blur()}
                    required
                    error={Boolean(formErrors.latitude)}
                    helperText={formErrors.latitude || ' '}
                    inputProps={{ step: 'any' }}
                    sx={modernFieldSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label='Longitude'
                    name='longitude'
                    value={formData.longitude}
                    type='number'
                    onChange={handleChange}
                    fullWidth
                    size='small'
                    onWheel={(e) => e.target.blur()}
                    required
                    error={Boolean(formErrors.longitude)}
                    helperText={formErrors.longitude || ' '}
                    inputProps={{ step: 'any' }}
                    sx={modernFieldSx}
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        )}

        <Box
          sx={{
            mt: 3,
            p: 2.25,
            border: '1px solid #E2E8F0',
            borderRadius: 2,
            bgcolor: '#FFFFFF',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A' }}>
                Workflow Segments
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#2563EB', cursor: 'default' }}>
              Customize
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 12, color: '#64748B', mt: 0.5, mb: 1 }}>
            Default states enabled for issues in this project.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5, flexWrap: 'wrap' }}>
            {segmentChips.map((seg) => (
              <FormControlLabel
                key={seg.key}
                control={
                  <Switch
                    checked={seg.active}
                    disabled={seg.disabled || !seg.onToggle}
                    onChange={(e) =>
                      seg.onToggle && seg.onToggle({ target: { checked: e.target.checked } })
                    }
                  />
                }
                label={
                  <Typography sx={{ fontSize: 13.5, color: '#0F172A' }}>
                    {seg.label}
                  </Typography>
                }
              />
            ))}
          </Box>
        </Box>

        {toggleCard(
          'Location Restriction',
          'Require members to be at the assigned location when working.',
          formData.projectType === 2 ||
            formData.projectType === 3 ||
            formData.location_restriction === 1,
          handleLocationSwitchChange,
          formData.projectType === 2 || formData.projectType === 3,
          formData.projectType !== 1 && formData.projectType !== 4
        )}

        {toggleCard(
          'Time Tracking',
          'Allow team members to log hours against issues.',
          formData.time_tracking === 1,
          handleTimeSwitchChange,
          formData.projectType === 4
        )}

        {toggleCard(
          'Live Location',
          'Continuously track team member location while on task.',
          formData.projectType === 4 || Boolean(formData.live_location),
          handleSwitchChange,
          formData.projectType === 4,
          formData.projectType === 4
        )}

        {showAlerts.backlogAlert && (
          <Alert severity='info' sx={{ mt: 2, borderRadius: 2 }}>
            <AlertTitle>Clear Cards</AlertTitle>
            Clear the Backlog before disabling it.
          </Alert>
        )}
        {showAlerts.inProgressAlert && (
          <Alert severity='info' sx={{ mt: 2, borderRadius: 2 }}>
            <AlertTitle>Clear Cards</AlertTitle>
            Clear the InProgress before disabling it.
          </Alert>
        )}
        {showAlerts.info && (
          <Alert severity='info' sx={{ mt: 2, borderRadius: 2 }}>
            <AlertTitle>Clear Cards</AlertTitle>
            Clear the Testing disabling it.
          </Alert>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 4,
          py: 2,
          borderTop: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
        }}
      >
        <Button
          onClick={handleCancel}
          sx={{
            color: '#64748B',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': { bgcolor: 'transparent', color: '#0F172A' },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          variant='contained'
          disableElevation
          sx={{
            bgcolor: '#2563EB',
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
            borderRadius: 1.5,
            '&:hover': { bgcolor: '#1D4ED8' },
          }}
        >
          {saving ? 'Saving…' : projectData ? 'Save Changes' : 'Create Project'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProjectForm;

