import {
  Box,
  Button,
  Card,
  alpha,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  styled,
  Dialog,
} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import apiCalls from 'utils/apiCalls';
import {useDispatch, useSelector} from 'react-redux';
import context from 'context/CreateNewButtonContext';
import {Helmet} from 'react-helmet-async';
import CommonToolTip from 'components/ToolTip';
import CancelIcon from '@mui/icons-material/Cancel';
import {
  getEmpbasecompanyAction,
  getLocBaseEmpAction,
  get_searchSelfieImagesAction,
  set_searchSelfieImagesAction,
  viewSelfieAttendanceImagesAction,
} from '../../../redux/actions/attendance_actions';
import {listStockLocationAction} from 'redux/actions/stock_Location_actions';
import AppScrollbar from '@crema/core/AppScrollbar';
import ListAltIcon from '@mui/icons-material/ListAlt';
import GridOnIcon from '@mui/icons-material/GridOn';
import Filter from './filter';
import CommonSearch from 'utils/commonSearch';
import {departmentListAction} from 'redux/actions/userCreation_actions';
import moment from 'moment';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import { titleURL } from 'http-common';
import IOSSwitch from 'utils/cssSwitch';
import PhotoComponent from 'components/todayAttendance/photoComponent'
import AppAnimate from '../../../@crema/core/AppAnimate';
import { date } from 'yup';
import { listDepartment } from 'redux/actions/shifts.actions';
import AppsIcon from '@mui/icons-material/Apps';
import ListIcon from '@mui/icons-material/List';
import clsx from 'clsx';
import { DataGrid } from '@mui/x-data-grid';
import { maxBodyHeight } from "utils/pageSize";
import mapsImage from '../../../assets/dashboardIcons/maps.png';
import location from '../../../assets/dashboardIcons/location.jpg';
import UserImage from '../../../assets/user/noimage.png';
import CloseIcon from '@mui/icons-material/Close';
import { justifyContent } from '@mui/system';

const Wrapper = styled(Card)(({
  theme
}) => ({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  [theme.breakpoints.down("md")]: {
    gridTemplateColumns: "1fr"
  }
}));
const BoxItem = styled(Box)(({
  theme
}) => ({
  padding: 24,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  [theme.breakpoints.up("md")]: {
    borderRight: `1px dashed ${theme.palette.divider}`
  }
}));

const IconBtn = styled(IconButton)(({theme}) => {
  return {  
    color: theme.palette.text.disabled,
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    padding: 8,
    '&:hover, &:focus': {
      color: theme.palette.primary.main,
    },
    '&.active': {
      color: theme.palette.primary.main,
    },
  };
});

function SelfieAttendance() {
  const {
    attendanceReducer: {selfie_images},
    attendanceReducer: {get_empbasecompany},
    stockLocationReducer: {stocklocation},
    UserCreationReducer: {departmentList},
    ShiftsReducer: { list_department },
  } = useSelector((state) => state);

  // console.log("list_department",list_department)
  const dispatch = useDispatch();
  const {
    setLoaderStatusHandler,
    setModalTypeHandler,
    commoncookie,
    headerLocationId,
  } = useContext(context);

  const [toggleGridView, setToggleGridView] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [isApiFinished, setIsApiFinished] = useState(false);
  const [selectedButton, setSelectedButton] = useState(null); 
  const [mapOpen, setMapOpen] = React.useState(false);
  const [mapUrl, setMapUrl] = React.useState("");
  const [formValues, setFormValues] = useState({
    empName: [''],
    location: [''],
    department: [''],
    date: moment().format('YYYY-MM-DD'),
  });

    const [pageView,setPageView] = useState('list')

    const [previewImg, setPreviewImg] = useState(null);

    const handleImageClick = (img) => {
      setPreviewImg(img);
    };

    

        const[pagination, setPagination] = useState({
        searchString: "",
        pageCount: 0,
        numPerPage: 20
    })

        const pageChangeHandler = async (page) => {
        setPagination((prev) => ({
            ...prev,
            pageCount: page
        }))
    }

    const pageSizeChangeHandler = async (size) => {
        setPagination((prev) => ({
            ...prev,
            numPerPage: size,
            pageCount: 0 
        }))
    }

  const paginatedRows = selfie_images?.slice(
  pagination.pageCount * pagination.numPerPage,
  pagination.pageCount * pagination.numPerPage + pagination.numPerPage
);


const openMapPopup = (lat, lng) => {
  const url = `https://www.google.com/maps?q=${lat},${lng}&output=embed`;
  setMapUrl(url);
  setMapOpen(true);
};

   
    const columns = (onClick) => [
          {field: 'employeeId', headerName: 'Emp Code', width: 120},
          {field: 'full_name', headerName: 'Employee', width: 200},
          {field: 'startDate', headerName: 'Date', width: 150},
          {field: 'clock_in_time', headerName: 'In Time', width: 150},
          {
            field: 'start_location',
            headerName: 'Start Location',
            width: 240,
            cellClassName: 'center-cell',
            renderCell: (params) => {
              const row = params.row;
              const lat = row.start_lat;
              const lng = row.start_long;
              const isDisabled = lat == null || lng == null;
              const locationName = row.start_location || '-';
              const hasLocation = !!row.start_location;

              return (
                <Box sx={{position: 'relative', width: '100%', pr: hasLocation && !isDisabled ? '36px' : 0}}>
                  <Typography
                    variant='body2'
                    sx={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}
                  >
                    {locationName}
                  </Typography>
                  {hasLocation && !isDisabled && (
                    <Box
                      component='img'
                      src={location}
                      alt='location'
                      sx={{
                        position: 'absolute',
                        right: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 28,
                        height: 28,
                        borderRadius: '20%',
                        objectFit: 'cover',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        openMapPopup(lat, lng);
                      }}
                    />
                  )}
                </Box>
              );
            },
          },
          { 
            field: 'type',
            headerName: 'Type',
            width: 150,
            renderCell: (params) => {
              const row = params.row;
              return (row.type ? typeMap[row.type] : typeMap[row.attendance_type]) || '';
            }
          },
          {
          field: 'url',
          headerName: 'Image',
          width: 120,
          cellClassName: 'image-center-cell',
          renderCell: ({row}) => {
                const imgUrl =row.url || UserImage;
                return (
                  <div
                    style={{ cursor: 'pointer', width: '100%', display: 'flex', justifyContent: 'flex-start' }}
                    onClick={() => onClick(imgUrl)}
                  >
                    <img
                      src={imgUrl}
                      alt="user"
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: '20%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                );
              
          },
        },
          {field: 'clock_out_time', headerName: 'Out Time', width: 150},
          {
            field: 'end_location',
            headerName: 'End Location',
            width: 240,
            cellClassName: 'center-cell',
            renderCell: (params) => {
              const row = params.row;
              const lat = row.end_lat;
              const lng = row.end_long;
              const isDisabled = lat == null || lng == null;
              const locationName = row.end_location || '-';
              const hasLocation = !!row.end_location;

              return (
                <Box sx={{position: 'relative', width: '100%', pr: hasLocation && !isDisabled ? '36px' : 0}}>
                  <Typography
                    variant='body2'
                    sx={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}
                  >
                    {locationName}
                  </Typography>
                  {hasLocation && !isDisabled && (
                    <Box
                      component='img'
                      src={location}
                      alt='location'
                      sx={{
                        position: 'absolute',
                        right: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 28,
                        height: 28,
                        borderRadius: '20%',
                        objectFit: 'cover',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        openMapPopup(lat, lng);
                      }}
                    />
                  )}
                </Box>
              );
            },
          },
          {field: 'end_type', headerName: 'Type', width: 150,
            renderCell: (params) => {
              const row = params.row;
              return (row.type ? typeMap[row.end_type] : '' );
            }
          },
         {
          field: 'clock_out_url',
          headerName: 'Image',
          width: 120,
          cellClassName: 'image-center-cell',
          renderCell: ({ row }) => {
            const imgUrl = row.clock_out_url || UserImage;
            return (
              <div
                style={{ cursor: 'pointer', width: '100%', display: 'flex', justifyContent: 'flex-start' }}
                onClick={() => onClick(imgUrl)}
              >
                <img
                  src={imgUrl}
                  alt="user"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '20%',
                    objectFit: 'cover'
                  }}
                />
              </div>
            );
          }
        }

          
      ]

    const typeMap = {
    face_attendance: 'Face',
    manual_attendance: 'Manual',
    selfie:"Selfie",
    qr:"Qr",
    gps:"Gps",
    wifi:"WiFi",
    no_restriction:"None",
    device: "Device"
  };
  

  const [selectedAll, setSelectedAll] = useState(false);
  const [button, setButton] = useState(0);
  const [departmentLists, setDepartmentList] = useState(false);
  const [departmentListsArray, setDepartmentListArray] = useState([]);
  const handleChange = async (e) => {
    let {name, value} = e.target;
  };

  const [value, setValue] = React.useState([]);

  const [formErrors,setFormErrors] = useState({
    empName: null,
  })

  // console.log("departmentListsArray",departmentLists,departmentListsArray)
  const handleChangeEmployeeName =(val)=>{
    setValue(val)
    if(val?.length > 0){
     setFormErrors({...formErrors,empName:null})
     
    }

}

  useEffect(() => {
    const data = {
      searchString: ''
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(listDepartment(data, (response)=>{
        // console.log("response",response)
        if (response.length) {
        //  console.log("response.length",response.length)
          setDepartmentList(true)
          setDepartmentListArray(response)
        }
      
      })),
      dispatch(getEmpbasecompanyAction()),
      dispatch(listStockLocationAction(commoncookie, headerLocationId)),
      
    ).finally(() => setIsApiFinished(true));
  }, []);

  useEffect(() => {
   

    if (departmentLists) {
      let payload = {
        empName: [''],
        location: [''],
        department: formValues?.department.includes('') || formValues?.department.length === 0 
        ? list_department.map((d) => d.department)
        : formValues?.department ,
        date: formValues?.date,
      }
      dispatch(
        viewSelfieAttendanceImagesAction({ ...payload, searchString: '', }),
      )
    }
  }, [departmentLists]);

  const ApplyButton = () => {
    setButton()
    if (selectedAll) {

      dispatch(getLocBaseEmpAction(formValues, (res) => {
        if (res.data?.employees) {
          processFunction(res.data?.employees)
        }
      }))
    }

    else {

      dispatch(getLocBaseEmpAction(formValues, (res) => {
        if (res.data?.employees) {
          processFunction(res.data?.employees)
        }
      }))
    }
    
  };

  const processFunction =  async (value) =>{
    // dispatch(filterDataAction(filteredValue))
    setFilterOpen(false);
    const appliedDate = moment(formValues.date).format('YYYY-MM-DD');
    setSelectedButton(appliedDate);
    syncQuickDateSelection(appliedDate);
    const data = {
      ...formValues,
         department: 
      !formValues?.department || formValues?.department.includes('') || formValues?.department.length === 0
        ? list_department.map((d) => d.department)
        : formValues.department,
      // department: formValues.department?.filter(x => x)?.length > 0 ? formValues.department : departmentList?.map(v => v?.department),
      date: appliedDate,
      searchString: '',
    };
    dispatch(viewSelfieAttendanceImagesAction(data));
  }

  const requestSearch = (e) => {
    const {value} = e.target;
    setSearchVal(value);
    dispatch(set_searchSelfieImagesAction([]));
    const data = {
      ...formValues,
      empName: formValues?.empName.length > 0 ? formValues?.empName : [""],
      date: selectedButton ? selectedButton : moment(formValues.date).format('yyyy-MM-DD'),
      searchString: value,
      department: formValues?.department.includes('') || formValues?.department.length === 0 
      ? list_department.map((d) => d.department)
      : formValues?.department || [],
    };
    dispatch(
      get_searchSelfieImagesAction(
        data,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );
  };

  const cancelSearch = () => {
    setSearchVal('');

    dispatch(set_searchSelfieImagesAction([]));
    const data = {
      ...formValues,
      empName: formValues?.empName.length > 0 ? formValues?.empName : [""],
      date: selectedButton ? selectedButton : moment(formValues.date).format('yyyy-MM-DD'),
      searchString: '',
      department: formValues?.department.includes('') || formValues?.department.length === 0 
      ? list_department.map((d) => d.department)
      : formValues?.department || [],
    };

    dispatch(
      get_searchSelfieImagesAction(
        data,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );
  };

  const today = new Date();

  function formatDate1(date) {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    return `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`;
  }

  function formatDate2(date) {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  const dates = [];
  const payloadDates = [];
  for (let i = 3; i >= 1; i--) {
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - i);
    dates.push(formatDate1(pastDate));
    payloadDates.push(formatDate2(pastDate));
  }

  // Function to format date as "DD-MM-YYYY"
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get the current date
const currentDate = new Date();
const formattedCurrentDate = formatDate(currentDate);

// Get yesterday's date
const yesterdayDate = new Date(currentDate);
yesterdayDate.setDate(currentDate.getDate() - 1);
const formattedYesterdayDate = formatDate(yesterdayDate);

// Get the date from two days ago
const twoDaysAgoDate = new Date(currentDate);
twoDaysAgoDate.setDate(currentDate.getDate() - 2);
const formattedTwoDaysAgoDate = formatDate(twoDaysAgoDate);

// Get the date from three days ago
const threeDaysAgoDate = new Date(currentDate);
threeDaysAgoDate.setDate(currentDate.getDate() - 3);
const formattedThreeDaysAgoDate = formatDate(threeDaysAgoDate);

  const dateStr = dates.join(', ');

  const syncQuickDateSelection = (date) => {
    if (date === formattedThreeDaysAgoDate) {
      setButton(1);
      return;
    }

    if (date === formattedTwoDaysAgoDate) {
      setButton(2);
      return;
    }

    if (date === formattedYesterdayDate) {
      setButton(3);
      return;
    }

    setButton(null);
  };

  const handleThree = (date) => {
    let payload = {
      empName: [''],
      location: [''],
      department: [''],
      date: date,
    }

    dispatch(getLocBaseEmpAction(payload, (res) => {
      if (res.data?.employees) {
        const data = {
          empName:  res.data?.employees.map((d)=> d.employee_id) ,
          date: date,
          searchString: '',
          location: [''],
          department: [''],
        };
        dispatch(viewSelfieAttendanceImagesAction(data));
      }
    }))
  }

  const handleClick = (date) => {
    setSelectedButton(date);
    syncQuickDateSelection(date);
    setSearchVal('')
    setFormValues((prev) => ({
      ...prev,
      date: date,
    }));

    if(departmentLists){
      let payload = {
        empName: [''],
        location: [''],
        department: formValues?.department.includes('') || formValues?.department.length === 0 
        ? list_department.map((d) => d.department)
        : formValues?.department || [],
        date: date,
      }
  
      dispatch(getLocBaseEmpAction(payload, (res) => {
        if (res.data?.employees) {
          const data = {
            empName:  res.data?.employees.map((d)=> d.employee_id) ,
            date: date,
            searchString: '',
            location: [''],
            department: formValues?.department.includes('') || formValues?.department.length === 0 
            ? list_department.map((d) => d.department)
            : formValues?.department || [],
  
          };
          dispatch(viewSelfieAttendanceImagesAction(data));
        }
      }))
    }
    
  }

  const handleFilterButtonState = (value) => {
    if (typeof value === 'undefined') {
      const currentDate = moment().format('YYYY-MM-DD');
      setSelectedButton(currentDate);
      setButton(null);
      return;
    }

    setButton(value);
  }
  
  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Selfie Attendance </title>
      </Helmet>
      <Dialog open={mapOpen} onClose={() => setMapOpen(false)} maxWidth="md" fullWidth>
  <Card sx={{ p: '10px', height: 'calc(100vh - 430px)' }}>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <IconButton aria-label="close"
        onClick={() => setMapOpen(false)}
      >
        <CloseIcon />

      </IconButton>
    </Box>
    <div style={{ height: "400px" }}>
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
      ></iframe>
    </div>
  </Card>
      </Dialog>
      <AppAnimate animation='transition.slideLeftIn' delay={300}>
        <Card sx={{ p: '40px',height: 'calc(100vh - 80px)' }}>
          <Grid
            container
            display='flex'
            flexDirection='row'
            alignItems='center'
            spacing={5}
            style={{ height: '100%', overflow: 'hidden' }}
          >

            <Grid size={12}>
              <Box display="flex" alignItems="center" justifyContent="space-between" flexDirection={{ xs: 'column', sm: 'row' }}>
                <Box display="flex" alignItems="center" sx={{ whiteSpace: 'nowrap' }} >
                          <Typography className='page-title'>{'Today Attendance'}</Typography>
                        </Box>

                {/* <FormGroup>
                    <FormControlLabel
                      control={
                        <IOSSwitch
                          // sx={{m: 2}}
                          name=''
                          default
                          onChange={() => setToggleGridView(!toggleGridView)}
                        />
                      }
                      label=''
                    />
                </FormGroup> */}

                {/* <Button onClick={handleThree} >
                    {dateStr}
                  </Button> */}
                <Grid
                  display='flex'
                  flexDirection={{ xs: 'column', sm: 'row' }}
                  justifyContent={{ xs: 'center', sm: 'flex-end' }}
                  gap={{ xs: 2, sm: 1 }}
                  size={{
                    lg: 9,
                    md: 9,
                    sm: 9,
                    xs: 12
                  }}>
                  <Grid>
                    <Button
                      variant={button === 1 ? "contained" : "outlined"}
                      color='primary'
                      sx={{
                        height: { xs: 'auto', sm: '30px' },
                        padding: { xs: '8px 16px', sm: '4px 8px' },
                        borderRadius: 8,
                        whiteSpace: 'nowrap',
                        '& .MuiSvgIcon-root': {
                          fontSize: 26,
                        },
                        marginBottom: { xs: 1, sm: 0 },
                        marginRight: { xs: 0, sm: 1 }
                      }}
                      onClick={() => {
                        handleClick(formattedThreeDaysAgoDate)
                        setButton(1);
                      }}
                    >
                      {moment(formattedThreeDaysAgoDate).format('DD-MM-YYYY')}
                    </Button>
                    <Button
                      variant={button === 2 ? "contained" : "outlined"}
                      color='primary'
                      sx={{
                        height: { xs: 'auto', sm: '30px' },
                        padding: { xs: '8px 16px', sm: '4px 8px' },
                        borderRadius: 8,
                        whiteSpace: 'nowrap',
                        '& .MuiSvgIcon-root': {
                          fontSize: 26,
                        },
                        marginBottom: { xs: 1, sm: 0 },
                        marginRight: { xs: 0, sm: 1 }
                      }}
                      onClick={() => {
                        handleClick(formattedTwoDaysAgoDate)
                        setButton(2);
                      }
                      }
                    >
                      {moment(formattedTwoDaysAgoDate).format('DD-MM-YYYY')}
                    </Button>
                    <Button
                      variant={button === 3 ? "contained" : "outlined"}
                      color='primary'
                      sx={{
                        height: { xs: 'auto', sm: '30px' },
                        padding: { xs: '8px 16px', sm: '4px 8px' },
                        borderRadius: 8,
                        whiteSpace: 'nowrap',
                        '& .MuiSvgIcon-root': {
                          fontSize: 26,
                        },
                        marginRight: { xs: 0, sm: 1 }
                      }}
                      onClick={() => {
                        handleClick(formattedYesterdayDate)
                        setButton(3);
                      }
                      }
                    >
                      {moment(formattedYesterdayDate).format('DD-MM-YYYY')}
                    </Button>
                  </Grid>

                     <Box>
            <CommonToolTip title='Grid View'>
              <IconBtn
                className={clsx({active: pageView === 'grid'})}
                onClick={() => setPageView('grid')}
                size='large'
              >
                <AppsIcon />
              </IconBtn>
            </CommonToolTip>
          </Box>
          <Box sx={{ml: 3.5}}>
            <CommonToolTip title='List View'>
              <IconBtn
                className={clsx({active: pageView === 'list'})}
                onClick={() => setPageView('list')}
                size='large'
              >
                <ListIcon />
              </IconBtn>
            </CommonToolTip>
          </Box>


                  <Filter
                    open={filterOpen}
                    handleClose={() => setFilterOpen(false)}
                    handleOpen={() => {
                      setFormValues((prev) => ({
                        ...prev,
                        date: selectedButton || prev.date,
                      }));
                      setFilterOpen(true);
                    }}
                    formValues={formValues}
                    setFormValues={setFormValues}
                    ApplyButton={ApplyButton}
                    selectedAll={selectedAll}
                    setSelectedAll={setSelectedAll}
                    value={value}
                    setValue={handleChangeEmployeeName}
                    formErrors={formErrors}
                    setButton ={handleFilterButtonState}
                    departmentListsArray={departmentListsArray}
                    departmentLists={departmentLists}
                  />

                  <Grid
                    sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', sm: 'auto' }, marginTop: { xs: 2, sm: 0 } }}>
                    <CommonSearch
                      searchVal={searchVal}
                      cancelSearch={cancelSearch}
                      requestSearch={requestSearch}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
                {pageView === 'list' ? 
              
              <Box sx={{width: '100%', height: '92%',}}>
                    <DataGrid
                        getRowId={(row) => row.employee_id}
                        rows={selfie_images || []}
                        columns={columns(handleImageClick)}
                        pagination
                        paginationMode="client"
                        
                        
                        
                        
                        pageSizeOptions={[20, 50, 100]}
                        disableVirtualization // <-- Key Fix 🚀
                        sx={{
                          minHeight : 'calc(100vh - 230px)',
                          maxHeight : 'calc(100vh - 230px)',
                          overflowY: 'auto',
                          '& .center-cell': {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                          },
                          '& .image-center-cell': {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                          },
                        }} paginationModel={{ page: pagination.pageCount, pageSize: pagination.numPerPage }} onPaginationModelChange={(model) => { if (model.page !== pagination.pageCount) { (pageChangeHandler)(model.page); } if (model.pageSize !== pagination.numPerPage) { (pageSizeChangeHandler)(model.pageSize); } }}
                      />
                </Box> 
              :
              <PhotoComponent
                toggleGridView={toggleGridView}
                selfie_images={selfie_images}
                isApiFinished={isApiFinished}
              />}
            </Grid>
          </Grid>

          {previewImg && (
            <Box
              onClick={() => setPreviewImg(null)}
              sx={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.8)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 3000,
              }}
            >
              <CardMedia
                component="img"
                image={previewImg}
                sx={{
                  maxWidth: '40vw',
                  maxHeight: '40vh',
                  // width: '100%',
                  height: '100%',
                  objectFit: 'contain', // ✨ maintain aspect ratio
                  borderRadius: 2,
                  // boxShadow: 8,
                  // backgroundColor: '#000', // optional, helps show transparent spaces
                }}
                onClick={(e) => e.stopPropagation()} // don't close when clicking the image itself
              />

            </Box>
          )}
        </Card>
      </AppAnimate>
    </>
  );
}

export default SelfieAttendance;
