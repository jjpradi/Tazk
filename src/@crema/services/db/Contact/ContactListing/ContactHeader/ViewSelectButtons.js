import React, {useContext, useEffect, useState} from 'react';
import IconButton from '@mui/material/IconButton';
import AppsIcon from '@mui/icons-material/Apps';
import clsx from 'clsx';
import ListIcon from '@mui/icons-material/List';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import {styled} from '@mui/material/styles';
import CommonToolTip from 'components/ToolTip';
import {alpha, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, Stack, Tooltip, Typography} from '@mui/material';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import {getsessionStorage} from 'pages/common/login/cookies';
import AttachmentField from 'pages/common/Timesheet/Attachment';
import excelicon from 'assets/icon/excelicon.svg';
import Link from '@mui/material/Link';
import * as XLSX from 'xlsx-js-style';
import {ErrormsgAlert} from 'redux/actions/load';
import {useDispatch, useSelector} from 'react-redux';
import Uploadfeilds from './employeeUploadFileds';
import {departmentListAction} from 'redux/actions/userCreation_actions';
import {
  getEventNameAction,
  getUserRoleAction,
} from 'redux/actions/userRole_actions';
import {allListStockLocation} from 'redux/actions/stock_Location_actions';
import {listEmployeeCategoryAction} from 'redux/actions/shifts.actions';
import apiCalls from 'utils/apiCalls';
import context from '../../../../../../context/CreateNewButtonContext';
import {designationAction} from 'redux/actions/userCreation_actions';
import SampleTemplateLink from './template';
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import CloseIcon from '@mui/icons-material/Close'
import CancelIcon from '@mui/icons-material/Cancel';
import { listStockLocationAction } from '../../../../../../redux/actions/stock_Location_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { listRbacRolesAction } from 'redux/actions/rbac_actions';

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

const ViewSelectButtons = ({
  pageView,
  onChangePageView,
  type,
  encodeemployeeImageFileAsURL,
  encodeImageFileAsURL,
  // headerLocationId,
  userBulkinsert,
  encodeIndividualFileAsURL,
  uploadClose,allClose,setOpenDialog,setOpen,openDialog,open, handleFilterApply, filteredValue, setFilteredValue, handleFilterClear
}) => {
  let storage = getsessionStorage();
  let dispatch = useDispatch();
  const hideCreateContact = !(
    [5, 6].includes(storage.company_type) && storage.role_name === 'Employee'
  );

  const employeeCategoryList = useSelector((state) => state.ShiftsReducer.employeeCategoryList)

  const stocklocation = useSelector((state) => state.stockLocationReducer.allliststocklocation)

  const stocklocations = useSelector((state) => state.stockLocationReducer.stocklocation)
    
  const departmentList = useSelector((state) => state.UserCreationReducer.departmentList)

  const designationList = useSelector((state) => state.UserRoleReducer.designation)

  const userRoleList = useSelector((state) => state.UserRoleReducer.userRole)

  const list_department = useSelector((state) => state.ShiftsReducer.list_department)

  const menuAccess = useSelector((state) => state.rbacReducer.menuAccess)
  const rbacReducer = useSelector((state) => state.rbacReducer.roles)
  const hasSingleStockLocation = stocklocations.length === 1;
  const singleStockLocationId = stocklocations[0]?.location_id ?? null;

  let browser_id = localStorage.getItem('tazk_browser_id')
  if (browser_id) {
    browser_id = JSON.parse(browser_id);
  }
 
  const [openAlert, setOpenAlert] = useState(false);

  const [filePreviews, setFilePreviews] = useState([]);
  const [uploadType, setUploadType] = useState('employee');

  const [exceldata, setexcelData] = useState([]);
  const [fileEvents, setFileEvents] = useState({})
  const {setLoaderStatusHandler, setModalTypeHandler, commoncookie, headerLocationId} = useContext(context);
  const [filterOpen, setFilterOpen] = useState(false)

  const FIELD_MAPPING = storage.company_type === 12
    ? {
        'First Name': 'first_name',
        'Last Name': 'last_name',
        'Primary Contact': 'phone_number',
        'Date Of Birth': 'dob',
        'Full Address': 'address',
        'Zip Code': 'zip',
        City: 'city',
        State: 'state',
        Country: 'country',
      }
    : {
        'Employee Code': 'employeeId',
        'Join Date': 'dateOfJoining',
        'First Name': 'first_name',
        'Last Name': 'last_name',
        Gender: 'gender',
        'Primary Contact': 'phone_number',
        Email: 'email',
        'Date Of Birth': 'dob',
        'Full Address': 'address',
        'Zip Code': 'zip',
        City: 'city',
        State: 'state',
        Country: 'country',
        Username: 'username',
        Password: 'password',
        Designation: 'designation',
        Category: 'category_id',
        Location: 'location_id',
        Department: 'department_id',
        'User Role': 'role_name'
    };


   const REQUIRED_FIELDS = storage.company_type === 12
    ? [
        'first_name',
        'phone_number',
        'dob',
        'zip',
        'state',
        'country',
      ]
    : [
        'dateOfJoining',
        'first_name',
        'gender',
        'phone_number',
        'email',
        'dob',
        'zip',
        'state',
        'country',
        'username',
        'password',
        'employeeId',
        'designation',
        'category_id',
        'location_id',
        'department_id',
        'role_name',
      ];

  const base64ToArray = (base64String) => {
    try {
      const base64WithoutPrefix = base64String.split(',')[1];

      if (!base64WithoutPrefix) {
        throw new Error('Invalid Base64 format');
      }

      const binaryStr = atob(base64WithoutPrefix);
      const byteArray = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        byteArray[i] = binaryStr.charCodeAt(i);
      }

      const workbook = XLSX.read(byteArray, {type: 'array'});

      const sheetName = workbook.SheetNames[0];
      let sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      // Convert column names to match required field names
      sheetData = sheetData.map((row) => {
        const transformedRow = {};
        Object.keys(row).forEach((originalKey) => {
          const newKey = FIELD_MAPPING[originalKey] || originalKey;
          transformedRow[newKey] = row[originalKey];
        });
        return transformedRow;
      });

      const errors = [];
      sheetData.forEach((row, index) => {
        console.log(row, 'rowss');
        REQUIRED_FIELDS.forEach((field) => {
          if (!row[field] || row[field].toString().trim() === '') {
            errors.push(`Row ${index + 2}: Missing ${field}`);
          }
        });
      });

      if (errors.length > 0) {
        console.error('Validation Errors:', errors);
        return {success: false, errors};
      }

      return {success: true, data: sheetData};
    } catch (error) {
      console.error('Error processing XLSX:', error);
      return {success: false, errors: ['Invalid XLSX format']};
    }
  };

  useEffect(() => {
    dispatch(departmentListAction())
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      commoncookie,
      headerLocationId,
      dispatch(listStockLocationAction(commoncookie, headerLocationId)),
      dispatch(listRbacRolesAction())
    )
  }, [])

  const uploadOpen = () => {
    const data = {
      type: 'LIST_CATEGORY'
    }
    setOpenDialog(true)
    dispatch(departmentListAction())
    dispatch(allListStockLocation())
    dispatch(listEmployeeCategoryAction(data))
    dispatch(designationAction())
    dispatch(getUserRoleAction())
  }

  const excelDateToJSDate = (serial) => {
    const excelEpoch = new Date(1899, 11, 30);
    const jsDate = new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);
    
    const year = jsDate.getFullYear();
    const month = String(jsDate.getMonth() + 1).padStart(2, "0");
    const day = String(jsDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const upload = (e) => {
    // console.log("00000",type)
    // if (!headerLocationId || headerLocationId === 'null') {
    //   return setOpenAlert(true);
    // }

    try {
      // console.log("9999")
      if (type !== 1 && type !== 2 && type !== 0 ) {
        const file = fileEvents?.target?.files?.[0]

        
        if (!file) {
          return ErrormsgAlert(dispatch, "No file selected")
        }
        
        const allowedTypes = [
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ]
        
        if (!allowedTypes.includes(file.type)) {
          return ErrormsgAlert(dispatch, "Only Excel files (.xls, .xlsx) are allowed")
        }
        //console.log(result,'dfdd');
        let result = base64ToArray(filePreviews[0]); 

        if (result?.data?.length) {
          let data = result.data.map((v) => {
            const category_id = employeeCategoryList.find(d => d.category_name?.replace(/\s+/g,'').toLowerCase() === v.category_id?.replace(/\s+/g,'').toLowerCase())
            const matchedLocation = stocklocation.find(d => d.location_name?.replace(/\s+/g,'').toLowerCase() === v.location_id?.replace(/\s+/g,'').toLowerCase())
            const matchedDepartment = departmentList.find(d => d.department?.replace(/\s+/g,'').toLowerCase() === v.department_id?.replace(/\s+/g,'').toLowerCase())
            const designationName = designationList.find(d => d.designation?.replace(/\s+/g,'').toLowerCase() === v.designation?.replace(/\s+/g,'').toLowerCase())
            const userRoleName = userRoleList.find(d => d.role_name?.replace(/\s+/g,'').toLowerCase() === v.role_name?.replace(/\s+/g,'').toLowerCase())
            return {
              ...v,
              gender: v?.gender?.toLowerCase().includes('male') ? 1 : 2,
              token: '',
              role_name: storage.company_type === 12 ? "Client" : userRoleName ? userRoleName.role_name : null,
              location_id: matchedLocation ? [{...matchedLocation}] : null,
              employeeId: v?.employeeId,
              category_id: category_id?.id ?? null,
              browser_id : browser_id ? browser_id?.id : null,
              browser_name : browser_id ? browser_id?.browser : null,
              department_id: matchedDepartment ? [{...matchedDepartment}] : null,
              designation: designationName ? designationName.designation : null,
              primary_location: matchedLocation ? matchedLocation.location_id : null,
              dateOfJoining: excelDateToJSDate(v.dateOfJoining),
              dob: excelDateToJSDate(v.dob)
          }
          });
          // console.log('dataass', data);

          setexcelData(data);

          if (result.success) {
            userBulkinsert(data);
            uploadClose();
            allClose();
            // setOpen(true);
          }
        } else {
          ErrormsgAlert(
            dispatch,
            result?.errors?.length
              ? 'Some fields are missing'
              : 'Something went wrong',
          );
         
        }
      } 
      else {
        // console.log("asdasd")
        const file = fileEvents?.target?.files[0];
        if (file) {
          if(type === 0 || type === 5){
            encodeIndividualFileAsURL(file) 
          }else{
            encodeImageFileAsURL(file)
          }
        } else {
          console.error("Upload error: No file provided");
          ErrormsgAlert(dispatch, "No file selected for upload");
        }
      }
    } catch (e) {
      console.error('Upload error:', e);
      ErrormsgAlert(dispatch, 'Error processing the file');
    }
  };

  const handleChange = async (e) => {
    let { name, value } = e.target
    setFilteredValue((prev) => ({
      ...prev,
      [name]: value === '' ? null : value
    }))
  }

  const handleApply = () => {
    const data = {
      location_id: hasSingleStockLocation && singleStockLocationId ? [singleStockLocationId] : filteredValue.location.length === 1 && filteredValue.location[0] === '' ? 'null' : filteredValue.location,
      department_id: filteredValue.department.length === 1 && filteredValue.department[0] === '' ? 'null' : filteredValue.department,
      role:filteredValue.role.length === 1 && filteredValue.role[0] === '' ? 'null' : filteredValue.role
    }
    handleFilterApply(data)
    setFilterOpen(false)
  }

  const handleClear = () => {
    handleFilterClear()
    setFilterOpen(false)
  }

  const isDisabled = () => {
      const isLocationEmpty =
        filteredValue.location.length === 0 ||
        (filteredValue.location.length === 1 && filteredValue.location[0] === "");

      const isDepartmentEmpty =
        filteredValue.department.length === 0 ||
        (filteredValue.department.length === 1 && filteredValue.department[0] === "");

      return isLocationEmpty && isDepartmentEmpty;
    };

    const selectedRole = storage.role_name
    const customerCreate = UserRightsAuthorization(menuAccess[selectedRole], 'contact__customer', 'can_create')
    const vendorCreate = UserRightsAuthorization(menuAccess[selectedRole], 'contact__vendor', 'can_create')
    const employeeCreate = UserRightsAuthorization(menuAccess[selectedRole], 'contact__employee', 'can_create')
 
  return (
    <>
      {!open && (
        <Box sx={{display: 'flex', alignItems: 'center', ml: 'auto'}}>
          <Box sx={{mr: 1}}>
            {type === 1 ? (
              customerCreate && <CommonToolTip title='Upload'>
                <IconBtn
                  size='large'
                  onClick={() =>
                    // headerLocationId === 'null'
                    //   ? setOpenAlert(true)
                    //   : 
                      uploadOpen()
                  }
                >
                  <UploadFileIcon />
                </IconBtn>
              </CommonToolTip>
            ) : type === 2 ? (
              vendorCreate && <CommonToolTip title='Upload'>
                <IconBtn
                  size='large'
                  onClick={() =>
                    // headerLocationId === 'null'
                    //   ? setOpenAlert(true)
                    //   : 
                      uploadOpen()
                  }
                >
                  <UploadFileIcon />
                </IconBtn>
              </CommonToolTip>
            ) : type === 3 ? (
              hideCreateContact && (
                <Stack direction="row" spacing={1}>
                <Tooltip title='Filter'>
                  <IconBtn size='large' onClick={() => setFilterOpen(true)}>
                    <FilterAltIcon />
                  </IconBtn>
                </Tooltip>
                {
                  employeeCreate &&
                  <CommonToolTip title='Upload'>
                    <IconBtn size='large' onClick={() => uploadOpen()}>
                      <UploadFileIcon />
                    </IconBtn>
                  </CommonToolTip>
                }
                </Stack>
              )
            ) : ('')}
          </Box>

          <Box>
            <CommonToolTip title='Grid View'>
              <IconBtn
                className={clsx({active: pageView === 'grid'})}
                onClick={() => onChangePageView('grid')}
                size='large'
              >
                <AppsIcon />
              </IconBtn>
            </CommonToolTip>
          </Box>
          <Box sx={{ml: 1}}>
            <CommonToolTip title='List View'>
              <IconBtn
                className={clsx({active: pageView === 'list'})}
                onClick={() => onChangePageView('list')}
                size='large'
              >
                <ListIcon />
              </IconBtn>
            </CommonToolTip>
          </Box>
          <LocationAlert open={openAlert} onClose={() => setOpenAlert(false)} />

          {/* Upload Dialog */}
          <div>
            {/* <Button onClick={() => handleOpenDialog("vendor")}>Open Vendor Upload</Button>
      <Button onClick={() => handleOpenDialog("employee")}>Open Employee Upload</Button> */}
            <Dialog
              open={openDialog}
              fullWidth
              PaperProps={{style: {minWidth: '50px', padding: '30px'}}}
            >
              {/* <Typography marginY={"10px"} > Employee Upload */}
              {/* {uploadType === 'vendor' ? 'Vendor Upload' : 'Employee Upload'}E */}
              {/* </Typography> */}
              <Grid
                container
                flexDirection='column'
                justifyContent='center'
                spacing={5}
              >
                <Grid size="grow">
                  <Grid container justifyContent='center'>
                    <Grid
                      size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                      }}>
                      <AttachmentField
                        type='excel'
                        previews={filePreviews}
                        setPreviews={setFilePreviews}
                        style={{ width: '100%' }}
                        contactUpload={true}
                        handleChange={(e) => {
                          setFileEvents(e)
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid>
                  <Grid
                    container
                    alignItems='center'
                    justifyContent='space-between'
                  >
                    {/* Sample Template Link */}
                    <SampleTemplateLink type={type} excelicon={excelicon} />

                    {/* Action Buttons */}
                    <Grid>
                      <Button
                        onClick={() => {
                          setOpenDialog(false);
                          setFilePreviews([]);
                        }}
                        variant='contained'
                        color='error'
                        sx={{marginRight: 2}}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant='contained'
                        color='primary'
                        disabled={filePreviews.length === 0}
                        onClick={upload} 
                      >
                        Upload
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Dialog>
          </div>
        </Box>
      )}
      {open && (
        <Uploadfeilds
          open={open}
          onClose={uploadClose}
          excelData={exceldata}
          userBulkinsert={userBulkinsert}
          allClose={allClose}
        />
      )}
      <Dialog open={filterOpen} maxWidth='xs' fullWidth>
        <DialogTitle display='flex' justifyContent='flex-end' sx={{ py: '5px !important', px: '5px !important' }}>
          <IconButton onClick={() => setFilterOpen(false)}>
              <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Grid container rowGap={3}>
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <FormControl fullWidth variant='filled'>
              <InputLabel id='demo-multiple-name-label'>
                Select Location
              </InputLabel>

              <Select
                name='location'
                multiple
                disabled={stocklocations?.length == 1}
                value={filteredValue.location}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 250,
                      overflowY: 'auto'
                    }
                  }
                }}
                  onChange={(e) => {
                    const { value } = e.target;
                    if (stocklocations.length > 1) {
                      if (value.includes("")) {
                        setFilteredValue(prev => ({
                          ...prev,
                          location: [""]
                        }));
                      } else {
                        setFilteredValue(prev => ({
                          ...prev,
                          location: value
                        }));
                      }
                      return;
                    }

                    setFilteredValue(prev => ({
                      ...prev,
                      location: value.filter(v => v !== "")
                    }));
                  }}
                  renderValue={(selected) => {
                   
                    const singleStockLocationName = stocklocations[0]?.location_name || "";
                    const selectedNames = selected.map((value) => {
                      const locate = stocklocations.find(
                        (emp) => String(emp.location_id) === String(value)
                      );
                      return locate ? locate.location_name : "";
                    }).filter(Boolean);

                    return (
                      <Stack gap={1} direction="row" flexWrap="wrap">
                        {selectedNames.length > 0 ? (
                          selectedNames.map((name, index) => (
                            <Chip
                              key={index}
                              label={name}
                              onDelete={() => {
                                if(stocklocations?.length > 1){const updatedList = selected.filter((_, i) => i !== index);  // FIX
                                handleChange({
                                  target: { name: "location", value: updatedList },
                                });}
                              }}

                              deleteIcon={
                                stocklocations.length > 1 ? (
                                  <CancelIcon onMouseDown={(e) => e.stopPropagation()} />
                                ) : null
                              }
                            />
                          ))
                        ) : (
                          <Chip
                            label={hasSingleStockLocation ? singleStockLocationName : "All Locations"}
                            onDelete={() => {
                              if(stocklocations?.length > 1) { handleChange({
                                target: { name: "location", value: [] },
                              });}
                            }}
                            deleteIcon={
                              stocklocations?.length > 1 && <CancelIcon onMouseDown={(event) => event.stopPropagation()} />
                            }
                          />
                        )}
                      </Stack>
                      );
                      }}
                >
                  {stocklocations.length > 1 && (
                    <MenuItem value=''>All Location</MenuItem>
                  )}
                {
                  stocklocations.map((m) => (
                    <MenuItem
                      key={m.location_id}
                      value={m.location_id}
                      disabled={filteredValue.location[0] === ''}
                    >
                      {m.location_name}
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          </Grid>

          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <FormControl fullWidth variant='filled'>
              <InputLabel id='demo-multiple-name-label'>
                Select Department
              </InputLabel>
              <Select
                name='department'
                multiple
                value={filteredValue.department}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                      overflowY: 'auto'
                    }
                  }
                }}
                onChange={(e) => {
                  const { value } = e.target
                  setFilteredValue((prev) => ({
                    ...prev,
                    department: value.includes('') ? [''] : value
                  }))
                }}
                renderValue={(selected) => {
                    return (
                    <Stack gap={1} direction='row' flexWrap='wrap'>
                      {
                        selected.includes('') ? (
                          <Chip
                            key=''
                            label='All Department'
                            onDelete={() => {
                              setFilteredValue((prev) => ({
                                ...prev,
                                department: []
                              }))
                              handleChange({
                                target: {name: 'department', value: []}
                              })
                            }}
                            deleteIcon={
                              <CommonToolTip title='Cancel'>
                                <CancelIcon onMouseDown={(event) => event.stopPropagation()} />
                              </CommonToolTip>
                            }
                          />
                        ) : (
                          selected.map((value) => {
                            const locate = departmentList.find((emp) => emp.id === value)
                            return (
                              <Chip
                                key={value}
                                label={locate ? locate.department : ''}
                                onDelete={() => {
                                  setFilteredValue((prev) => ({
                                    ...prev,
                                    department: []
                                  }))
                                  handleChange({
                                    target: {name: 'department', value: []}
                                  })
                                }}
                                deleteIcon={
                                  <CancelIcon onMouseDown={(event) => event.stopPropagation()} />
                                }
                              />
                            );
                          })
                      )}
                    </Stack>
                  );
                }}
              >
                <MenuItem value=''>All Department</MenuItem>
                {
                  departmentList.map((m) => (
                    <MenuItem
                      key={m.id}
                      value={m.id}
                      disabled={filteredValue.department[0] === ''}
                    >
                      {m.department}
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          </Grid>
           <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12,
              }}
            >
              <FormControl fullWidth variant='filled'>
                <InputLabel>Select Role</InputLabel>

                <Select
                  name='role'
                  multiple
                  value={filteredValue.role || []}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200,
                        overflowY: 'auto',
                      },
                    },
                  }}
                  onChange={(e) => {
                    const {value} = e.target;

                    setFilteredValue((prev) => ({
                      ...prev,
                      role: value.includes('') ? [''] : value,
                    }));
                  }}
                renderValue={(selected) => {
                    return (
                    <Stack gap={1} direction='row' flexWrap='wrap'>
                      {selected.includes('') ? (
                        <Chip
                          label='All Roles'
                          onDelete={() => {
                            setFilteredValue((prev) => ({ ...prev, role: [] }));
                          }}
                          deleteIcon={<CancelIcon onMouseDown={(e) => e.stopPropagation()} />}
                        />
                      ) : (
                        selected.map((value) => {
                          const roleObj = rbacReducer.find((r) => r.role_id === value);

                          return (
                            <Chip
                              key={value}
                              label={roleObj ? roleObj.role_name : ''} 
                              onDelete={() => {
                                const updated = selected.filter((v) => v !== value);
                                setFilteredValue((prev) => ({
                                  ...prev,
                                  role: updated,
                                }));
                              }}
                              deleteIcon={<CancelIcon onMouseDown={(e) => e.stopPropagation()} />}
                            />
                          );
                        })
                      )}
                    </Stack>
                  );
                }}
                >
                  <MenuItem value=''>All Roles</MenuItem>

                  {rbacReducer && rbacReducer.map((r) => (
                    <MenuItem
                      key={r.role_id}
                      value={r.role_id}
                      disabled={filteredValue.role[0] === ''}
                    >
                      {r.role_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Grid display='flex' justifyContent='flex-end' size={12}>
            <Grid container spacing={5}>
              <Grid>
                <Button
                  color='secondary'
                  variant='contained'
                  onClick={handleClear}
                >
                  Clear
                </Button>
              </Grid>

              <Grid>
                <Button
                  color='primary'
                  variant='contained'
                  onClick={handleApply}
                  // disabled={isDisabled()}
                >
                  Apply
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ViewSelectButtons;

ViewSelectButtons.propTypes = {
  pageView: PropTypes.string.isRequired,
  onChangePageView: PropTypes.func,
};

