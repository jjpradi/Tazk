import React, { useContext, useEffect, useState } from 'react'
import { Autocomplete, Button, Card, Chip, Dialog, DialogActions, TablePagination,DialogContent, DialogContentText, DialogTitle, Grid, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable'
import AddIcon from '@mui/icons-material/Add'
import CompliancesForm from './CompliancesForm'
import NewComplianceForm from './NewComplianceForm'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import { getCompliancesAction, getSearchCompliancesAction, setSearchCompliancesAction } from 'redux/actions/compliances_actions'
import { maxBodyHeight, headerStyle, cellStyle } from 'utils/pageSize'
import CommonSearch from 'utils/commonSearch'
import moment from 'moment'
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import CloseIcon from '@mui/icons-material/Close';
import { getFormDetailsAction } from 'redux/actions/renewals_actions'
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteRenewalsAction } from 'redux/actions/asset_actions'
import toMomentOrNull from 'utils/DateFixer'
import EditIcon from '@mui/icons-material/Edit';
import CompliancesDetails from './CompliancesDetails'
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import apiCalls from 'utils/apiCalls';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';

const CompliancesTable = () => {
    const storage = getsessionStorage();
    const dispatch = useDispatch()

    const {
        setModalTypeHandler,
        setLoaderStatusHandler
    } = useContext(CreateNewButtonContext)
 
    const [showForm, setShowForm] = useState(false)
    const [filterOpen, setFilterOpen] = useState(false);
    const [editData, setEditData] = useState(null)
    const [formtype, setFormtype] = useState(null)
    const [rowData,setRowData] = useState(null) 

    const [paginateData, setPaginateData] = useState({
        searchString : '',
        pageCount : 0,
        pageSize : 20
    })

        const currentMonth = moment().startOf('month');
        const firstDateOfMonth = currentMonth.format('YYYY-MM-DD');
        const lastDateOfMonth = currentMonth.endOf('month').format('YYYY-MM-DD')

    const {
        compliancesReducers : { compliancesList, compliancesListCount },
         RenewalsReducers: { getTotalDetails },rbacReducer: { menuAccess } 
    } = useSelector((state) => state)

    
    const [dialogConfirm, setDialogConfirm] = useState(false)
    const [deleteId, setDeleteId] = useState(false)

     const [formValues,setFormValues] =  useState({
          startDate : firstDateOfMonth,
          endDate : lastDateOfMonth,
          priority : null,
          frequency : null
        })

    const [formErrors, setFormErrors] = useState({
        startDate : null,
        endDate : null,
    });

    
    let requiredFields = ['startDate','endDate'];

    useEffect(() => {


        const payload = {
            searchString : paginateData.searchString,
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize,
            startDate : formValues.startDate || firstDateOfMonth,
            endDate : formValues.endDate || lastDateOfMonth,
            priority : formValues.priority?.priority,
            frequency : formValues.frequency?.frequency,
        }
        dispatch(getCompliancesAction(payload))
        dispatch(getFormDetailsAction('filings'))
    }, [paginateData.pageCount, paginateData.pageSize])

    const selectedRole = storage?.role_name
                    useEffect(() => {
                      if (!selectedRole) return;
                      apiCalls(
                        setModalTypeHandler,
                        setLoaderStatusHandler, dispatch(getMenuAccessAction(selectedRole)));
                    }, [selectedRole, dispatch]);
    const fillingsCreate =UserRightsAuthorization(menuAccess[selectedRole], 'filings', 'can_create') 
    const fillingsEdit =UserRightsAuthorization(menuAccess[selectedRole], 'filings', 'can_edit') 
    const fillingsDelete =UserRightsAuthorization(menuAccess[selectedRole], 'filings', 'can_delete') 
         

    const handleOpen = () => {
        setShowForm(true)
        setFormtype("new")
    }

    const editOpen = () => {
        setShowForm(true)
        setFormtype("edit")
    }

    const handleClose = () => {
        setShowForm(false)
        const payload = {
            searchString : paginateData.searchString,
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize,
            startDate : firstDateOfMonth,
            endDate : lastDateOfMonth,
        }
        dispatch(getCompliancesAction(payload))
    }

    const handlePageChange = (newPage) => {
        setPaginateData((prev) => ({
            ...prev,
            pageCount: newPage,
        }))
    }

    const handlePageSizeChange = (newSize) => {
        setPaginateData((prev) => ({
            ...prev,
            pageSize: newSize,
            pageCount:0,
        }))
    }

    const handleDetailClick = (rowData) => {
        setShowForm(true)
        setRowData(rowData)
        setFormtype('details')
    }

    const cancelSearch = () => {
        setPaginateData({...paginateData, searchString : ''})

        dispatch(setSearchCompliancesAction({data : [], numRows : 0}))

        const payload = {
            searchString : '',
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize
        }
        dispatch(getSearchCompliancesAction(payload, setModalTypeHandler, setLoaderStatusHandler))
    }

    const requestSearch = (e) => {
        const val = e.target.value
        setPaginateData({...paginateData, searchString : val})

        dispatch(setSearchCompliancesAction({data : [], numRows : 0}))

        const payload = {
            searchString : val,
            pageCount : 0,
            numPerPage : paginateData.pageSize
        }
        dispatch(getSearchCompliancesAction(payload, setModalTypeHandler, setLoaderStatusHandler))
    }

    const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "0000-00-00" || dateStr === "null") return "-";
    const date = new Date(dateStr);
    if (isNaN(date)) return "-";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
    };

    const showValue = (val) => {
    return val && val !== "null" ? val : "-";
    };



    const columnCompliances = [
        {
            field : 'title',
            title : 'Title'
        },
        {
            field : 'priority',
            title : 'Priority'
        },
        {
            field : 'due_date',
            title : 'Due Date',
            render: (rowData) => formatDate(rowData.due_date)
        },
        {
            field : 'description',
            title : 'Description',
            render: (rowData) => showValue(rowData.description)
        },
        {
            field : 'amount',
            title : 'Amount',
        },
        {
            field : 'regulation',
            title : 'Regulation',
            render: (rowData) => showValue(rowData.regulation)
        },
        {
            field : 'frequency_type',
            title : 'Frenquency'
        },
        {
            field: 'image',
            title: 'Attachment',
            render: (rowData) => {
                const imageUrl = rowData?.image?.[0]?.imageUrl;

                return imageUrl ? (
                <img 
                    src={imageUrl}
                    alt="Attachment"
                    style={{ width: 60, height: 60, objectFit: 'cover' }}
                />
                ) : (
                '-'
                );
            }
        },
        {
            field: 'action',
            title: 'Actions',
            render: (rowData) => {
                return (
                    <div style={{ display: 'flex' }}>
                        {
                        fillingsEdit &&   
                         <Tooltip title="Edit">
                            <IconButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    editOpen();
                                    setEditData(rowData);
                                }}
                            >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        }

                        {
                           fillingsDelete &&      
                            <Tooltip title="Delete">
                            <IconButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteId(rowData.id);
                                    setDialogConfirm(true);
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                        }
                     

                  
                    </div>
                )
            }
        }
        
    ]

    const handleChange = (name, value) => {
      setFormValues((prevData) => {
        const newFormData = {...prevData, [name]: value || null};
        validateForm(name, value);
        return newFormData;
      });
    };
  
    const validateForm = (name, value) => {
      if (requiredFields.includes(name) && (value === null || value === '')) {
        setFormErrors((prevErr) => ({
          ...prevErr,
          [name]: `${name} is Required`,
        }));
      } else {
        setFormErrors((prevErr) => ({
          ...prevErr,
          [name]: null,
        }));
      }
  
    };

    const handleSubmit =async ()=>{

        const payload = {
            searchString : paginateData.searchString,
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize,
            startDate : formValues.startDate,
            endDate : formValues.endDate,
            priority :  formValues.priority?.priority,
            frequency : formValues.frequency?.frequency
            
        }
        dispatch(getCompliancesAction(payload))
        setFilterOpen(false)
    }

        const handleClear =async ()=>{

        const currentMonth = moment().startOf('month');
        const firstDateOfMonth = currentMonth.format('YYYY-MM-DD');
        const lastDateOfMonth = currentMonth.endOf('month').format('YYYY-MM-DD');

        const payload = {
            searchString : paginateData.searchString,
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize,
            startDate : firstDateOfMonth,
            endDate : lastDateOfMonth,
            
        }

        setFormValues({...formValues,startDate : firstDateOfMonth ,endDate : lastDateOfMonth, priority : null ,frequency : null})
        await dispatch(getCompliancesAction(payload))
        setFilterOpen(false)
    }

const priority = [
    {id: 1, priority: 'LOW'},
    {id: 2, priority: 'MEDIUM'},
    {id: 3, priority: 'HIGH'},
    {id: 4, priority: 'CRITICAL'},
  ];

  const frequency = [
    {id: 1, frequency: 'MONTHLY'},
    {id: 2, frequency: 'QUARTERLY'},
    {id: 3, frequency: 'HALF YEARLY'},
    {id: 4, frequency: 'YEARLY'},
  ];

    const chips = [
      {id:1,label:'Total Filings Value Of This Week',value : getTotalDetails[0]?.due_this_week_amount || 0},
      {id:2,label:'Penalty',value : getTotalDetails[0]?.total_penalty_amount || 0},
      {id:3,label:'Due This Week',value : getTotalDetails[0]?.due_this_week_count || 0},
      {id:4,label:'Total Filings Amount',value : getTotalDetails[0]?.total_filings_value || 0},
  ]

  
    const handleDelete = async()=>{
        const payload = {
            type : 'Filings'
        }

       await dispatch(deleteRenewalsAction(payload,deleteId))
        cancelSearch()
        
        setDialogConfirm(false)
    }


  return (
      <>
          {
              showForm === false &&
              <>
              
                <Grid container >
                  {
                      chips.map((chip)=> (
                      <Grid
                          size={{
                              lg: 3,
                              md: 3,
                              xs: 6
                          }}>
                           <Stack
                                                    direction="row"
                                                    spacing={0}
                                                    justifyContent="flex-start" sx={{ p: "3px", flexWrap: "wrap", overflowX: "hidden" }}>
                  <Chip
                      key={chip.id}
                      sx={{
                      cursor: "pointer",
                      fontWeight: "normal",
                      flex: `calc(${100 / 4}% - 8px)`,
                      height: "50px",
                      backgroundColor: 'white',
                      border: "1px solid #ddd", 
                      color: "#000000ff",
                      padding: "4px 8px",
                      // width : '400px',
                      boxShadow: "none", 
                      transform: "none", 
                      borderRadius: "7px",
                      position: "relative",
                      zIndex: 1,
                      transition: "none",
                      marginRight: "8px",
                      marginBottom: "8px",
                      }}
                      label={
                      <Stack spacing={0} alignItems="center">
                          <Typography
                          variant="body2"
                          sx={{ fontSize: "12px", fontWeight: "bold" }}
                          letterSpacing ='0.5px'
                          >
                          {chip.label}
                          </Typography>
                          <Typography
                          variant="caption"
                          sx={{
                              // fontSize: "11px",
                              lineHeight: "10px",
                              // fontWeight: "700",
                              marginTop: "6px",
                              color: "#000000ff",
                              letterSpacing :'0.5px'
                          }}
                          >
                          {
                            (chip.label === 'Total Filings Value' ||
                            chip.label === 'Due This Week')
                                ? parseInt(chip.value || 0)
                                : parseFloat(chip.value || 0).toFixed(2)
                          }
                           </Typography>
                      </Stack>
                      }
                  />

                  </Stack>

                  </Grid>

                      ))
                  }

                  </Grid>

                  <MaterialTable
                      title = 'Filings'
                      totalCount = {compliancesListCount}
                      columns = {columnCompliances}
                      data = {compliancesList}
                      options = {{
                           headerStyle: {
                                ...headerStyle,
                                position: "sticky",
                                top: 0,
                                zIndex: 10,
                                backgroundColor: "#f5f5f5"
                           },     
                          cellStyle,
                          filtering : false,
                          actionsColumnIndex : -1,
                          paging : true,
                          pageSize : paginateData.pageSize,
                          pageSizeOptions : [20, 50, 100],
                          search : false,
                          maxBodyHeight : 'calc(100vh - 260px)',
                          minBodyHeight : 'calc(100vh - 260px)',
                          fixedHeader: true,

                      }}
                      onRowClick = {(event,rowData) => handleDetailClick(rowData)}
                    //   page = {paginateData.pageCount}
                    //   onPageChange = {(page) => handlePageChange(page)}
                    //   onRowsPerPageChaange = {(size) => handlePageSizeChange(size)}
                      components = {{
                          Toolbar : (props) => (
                              <div>
                                  <div
                                      style = {{
                                          display : 'flex',
                                          width : '100%',
                                          alignItems : 'center'
                                      }}
                                  >
                                      <div style = {{ width : '100%' }}>
                                          <MTableToolbar {...props} />
                                      </div>

                                      <div>
                                          <CommonSearch
                                              searchVal = {paginateData.searchString}
                                              cancelSearch = {cancelSearch}
                                              requestSearch = {requestSearch} 
                                          />
                                      </div>
                                  </div>
                              </div>
                          )                            ,
                                                      Pagination: (props) => (
                                                          <div
                                                            style={{
                                                              display: "flex",
                                                              justifyContent: "flex-end",
                                                              alignItems: "center",
                                                              padding: "8px 16px",
                                                            }}
                                                          >
                                                            <TablePagination
                                                              {...props} 
                                                               component="div"
                                                              count={compliancesListCount || 0}
                                                              page={paginateData.pageCount || 0}
                                                              rowsPerPage={paginateData.pageSize || 20}
                                                              onPageChange={(event, newPage) => handlePageChange(newPage)}                                  
                                                              rowsPerPageOptions={[20, 50, 100]}
                          
                                                              onRowsPerPageChange={(event) =>
                                                                handlePageSizeChange(parseInt(event.target.value, 10))
                                                              }
                                                              labelRowsPerPage="Rows per page:"
                                                            />
                                                          </div>
                                                        ),
                          
                      }}
                      actions = {[
                           fillingsCreate && {
                              icon : () => <AddIcon />,
                              tooltip : 'Add',
                              isFreeAction : true,
                              onClick : handleOpen
                          },
                          {
                              icon: () => (
                                  <div style={{ display: 'flex' }}>
                                      <IconButton onClick={()=> setFilterOpen(true)}>
                                          <FilterAltIcon/>
                                      </IconButton>
                                  </div>
                              ),
                              tooltip: 'Filter',
                              isFreeAction: true,
                              },
                      ]}
                  >
                  </MaterialTable>
              </>
          }
          {
              showForm &&  formtype !== 'details' && (
              <NewComplianceForm 
              type = {formtype}
              rowData = { formtype === "edit" ? editData : undefined }
              handleClose = {handleClose}
              />)
          }

          {
            showForm && formtype === 'details' && (
                <CompliancesDetails rowData = {rowData} handleClose = {handleClose} user_rights = {menuAccess}/>
            )
          }
          <Dialog open={filterOpen} maxWidth="xs">
                  <Card sx={{pt: 3,p : 5}}>

  <div style={{ display: 'flex', justifyContent: 'end',marginBottom : '10px' }}>
              <IconButton aria-label="close" onClick={() => setFilterOpen(false)}>
              <CloseIcon />
           
              </IconButton>
              </div>

                      <Grid container spacing={3}>
                        <Grid
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                          <LocalizationProvider dateAdapter={DateAdapter}>
                                  <DatePicker
                                      label='From Date'
                                      value={toMomentOrNull(formValues.startDate || null)}
                                      onChange={(date) =>
                                      handleChange('startDate', moment(date).format('YYYY-MM-DD'))
                                      }
                                      slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
                                  />
                              </LocalizationProvider>
                      </Grid>
                        <Grid
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                          <LocalizationProvider dateAdapter={DateAdapter}>
                                  <DatePicker
                                      label='To Date'
                                      value={toMomentOrNull(formValues.endDate || null)}
                                      onChange={(date) =>
                                      handleChange('endDate', moment(date).format('YYYY-MM-DD'))
                                      }
                                      slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
                                  />
                              </LocalizationProvider>
                      </Grid>
                               <Grid
                                   size={{
                                       lg: 6,
                                       md: 6,
                                       sm: 6,
                                       xs: 12
                                   }}>
                         <Autocomplete
                           // disablePortal
                           options={ priority || []}
                           getOptionLabel={(option) => 
                             option.priority
                           }
                           value={formValues.priority ||  null} 
                           onChange={(e, newValue) => handleChange('priority', newValue)}
                           renderInput={(params) => (
                             <TextField
                               {...params}
                               fullWidth
                               label={'Priority'}
                               variant='filled'
                             />
                           )}
                         />
                       </Grid>
                               <Grid
                                   size={{
                                       lg: 6,
                                       md: 6,
                                       sm: 6,
                                       xs: 12
                                   }}>
                         <Autocomplete
                           // disablePortal
                           options={ frequency || []}
                           getOptionLabel={(option) => 
                             option.frequency
                           }
                           value={formValues.frequency ||  null} 
                           onChange={(e, newValue) => handleChange('frequency', newValue)}
                           renderInput={(params) => (
                             <TextField
                               {...params}
                               fullWidth
                               label={'Frequency'}
                               variant='filled'
                             />
                           )}
                         />
                       </Grid>
                    
                      <Grid
                          size={{
                              lg: 12,
                              md: 12,
                              sm: 12,
                              xs: 12
                          }}>
                                                      <Grid container justifyContent='flex-end' spacing={2} mb={2}>
                                                        <Grid>
                                                          <Button
                                                            variant='contained'
                                                            color='error'
                                                            onClick={handleClear}
                                                          >
                                                            Clear
                                                          </Button>
                                                        </Grid>
                                          
                                                        <Grid>
                                                          <Button
                                                            variant='contained'
                                                            color='primary'
                                                            onClick={handleSubmit}
                                                          >
                                                            Apply
                                                          </Button>
                                                        </Grid>
                                                      </Grid>
                                                    </Grid>
                                                    </Grid>
                  </Card>
                </Dialog>
          <Dialog
              open={dialogConfirm}
              onClose={() => setDialogConfirm(false)}
              aria-labelledby='alert-dialog-title'
              aria-describedby='alert-dialog-description'
            >
              <DialogTitle id='alert-dialog-title'>{'Delete ?'}</DialogTitle>
              <Grid container>
                <Grid
                    size={{
                        lg: 6,
                        md: 6
                    }}>
                  <DialogContent style={{width: 500}}>
                    <DialogContentText
                      id='alert-dialog-description'
                      sx={{color: 'warning.main'}}
                    >
                      Are you sure you want to delete ?
                    </DialogContentText>
                  </DialogContent>
                </Grid>
              </Grid>
      
              <DialogActions>
                <Button onClick={() => setDialogConfirm(false)} color='secondary'>
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  color='primary'
                  autoFocus
                >
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
      </>
  );
}

export default CompliancesTable
