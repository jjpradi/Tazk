import MaterialTable, { MTablePagination, MTableToolbar } from 'utils/SafeMaterialTable'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import React, { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { GetPriorityAction, GetServiceTypeAction, ListServiceDue, getSearchServiceDueAction, setSearchServiceDueAction } from 'redux/actions/serviceDue_actions'
import CommonSearch from 'utils/commonSearch'
import { formatTime12Hour, maxBodyHeight, headerStyle, cellStyle } from 'utils/pageSize'
import AddIcon from '@mui/icons-material/Add';
import ServiceDueForm from './ServiceDueForm'
import PropTypes from 'prop-types'
import moment from 'moment'
import { Autocomplete, Box, Button, Card, Checkbox, Chip, Dialog, DialogActions, DialogContent, TablePagination, DialogContentText, DialogTitle, FormControlLabel, Grid, IconButton, Modal, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { Close } from '@mui/icons-material'
import VisibilityIcon from '@mui/icons-material/Visibility';
import ServiceDetail from './ServiceDetail'
import { getFormDetailsAction } from 'redux/actions/renewals_actions'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteRenewalsAction } from 'redux/actions/asset_actions'
import EditIcon from '@mui/icons-material/Edit';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import apiCalls from 'utils/apiCalls';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';


const ServiceDueTable = (props) => {
    const storage = getsessionStorage();
    const dispatch = useDispatch()

    const [showForm, setShowForm] = useState(false)
    const [detail, setDetail] = useState(false)
    const [rowData, setRowData] = useState()
    const [images, setImages] = useState([])
    const [imageOpen, setImageOpen] = useState(false)
    const [filterOpen, setFilterOpen] = useState(false)
    const [dialogConfirm, setDialogConfirm] = useState(false)
    const [deleteId, setDeleteId] = useState(false)
    // const [edit ,setEdit] =useState(false)
    const [editData ,setEditData] = useState()
    const [ formType,setFromType] = useState(null)


    const [filterValues,setFilterValues] = useState({
        priority :  [],
        serviceType : null,
        dueDate :  null
    })

    const [errors,setErrors] = useState({
        priority :  null,
        serviceType : null,
    })

    const { 
        setModalTypeHandler, 
        setLoaderStatusHandler 
    } = useContext(CreateNewButtonContext)

    const {
        ServiceDueReducers : {serviceDueList, serviceDueListCount,getServiceDuePriority,getServiceType},
         RenewalsReducers: { getTotalDetails },rbacReducer: { menuAccess } 
    } = useSelector((state) => state)

    const [paginateData, setPaginateData] = useState({
        searchString : "",
        pageCount : 0,
        pageSize : props?.type === 'asset_id' ? 5 : 20
    })

    const handleOpen = () => {
        setShowForm(true)
        setFromType('newServiceDueForm')

    }

    const editOpen = () => {
         setShowForm(true)
         setFromType('edit')
    }

    const isFilterEmpty =
        (!filterValues.priority || filterValues.priority.length === 0) &&
        !filterValues.serviceType &&
        !filterValues.dueDate;
    const handleCancel = () => {
        setShowForm(false)
        setDetail(false)
        const payload = {
            searchString : paginateData.searchString,
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize
        }
        dispatch(ListServiceDue(payload))
    }

    const handleDetailClick = (data) =>{
        setRowData(data)
        setDetail(true)
    }

    
        const handleDelete = async()=>{
            const payload = {
                type : 'serviceDue'
            }
    
           await dispatch(deleteRenewalsAction(payload,deleteId))
            cancelSearch()
            
            setDialogConfirm(false)
        }

          const selectedRole = storage?.role_name
                        useEffect(() => {
                          if (!selectedRole) return;
                          apiCalls(
                            setModalTypeHandler,
                            setLoaderStatusHandler, dispatch(getMenuAccessAction(selectedRole)));
                        }, [selectedRole, dispatch]);
                
            const serviceDueCreate =UserRightsAuthorization(menuAccess[selectedRole], 'renewals__service_due', 'can_create') 
            const serviceDueEdit = UserRightsAuthorization(menuAccess[selectedRole], 'renewals__service_due', 'can_edit') 
            const serviceDueDelete =UserRightsAuthorization(menuAccess[selectedRole], 'renewals__service_due', 'can_delete') 
             

    const columnServiceDue = [
        {
            field: 'name',
            title: 'Asset Name'
        },
        {
            field: 'asset_code',
            title: 'Code'
        },
        {
            field: 'title',
            title: 'Title'
        },
        {
            field: 'priority_name',
            title: 'Priority'
        },
        {
            field: 'due_date',
            title: 'Due Date'
        },
        {
            field: 'amount',
            title: 'Amount'
        },
        {
            field: 'service_type',
            title: 'Service Type'
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
        ...(props?.type !== 'asset_id' ? [
        {
            field: 'action',
            title: 'Action',
            render: (rowData) => {
                return (

                    <div style={{ display: "flex" }}>

                        {
                            serviceDueEdit &&
                            <Tooltip title="Edit">
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        editOpen()
                                        // setEdit(true)
                                        setEditData(rowData)

                                    }}
                                >
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                        }

                        {
                            serviceDueDelete &&
                            <Tooltip title="Delete">
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setDeleteId(rowData.id)
                                        setDialogConfirm(true)
                                    }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        }
                      
                        
                    </div>
                )
            }

        }] : []),
        // {
        //     field : 'image',
        //     title : 'Image',
        //     render : (rowData) => {
        //         if(rowData.image.length > 0) {
        //             const firstImage = rowData.image[0].imageUrl
        //             return (
        //                 <img 
        //                     src = {firstImage}
        //                     alt = 'imagess'
        //                     style = {{ width : '50px', height : '50px', cursor : 'pointer' }}
        //                     onClick = {() => handleDialogImageOpen(rowData.image)}
        //                 />
        //             )
        //         }
        //         else {
        //             return (
        //                 <div style={{ width : '50px', height : '50px', display : 'flex', justifyContent : 'center', alignItems : 'center' }}>
        //                     No Data
        //                 </div>
        //             )
        //         }
        //     }
        // }
    ]

    useEffect(() => {
        console.log("data entered for next page")
        let payload = {}
        if(props?.type !== 'asset_id') {
            payload = {
                searchString : paginateData.searchString,
                pageCount : paginateData.pageCount,
                numPerPage : paginateData.pageSize
            }
        }
        else {
            payload = {
                searchString : paginateData.searchString,
                pageCount : paginateData.pageCount,
                numPerPage : paginateData.pageSize,
                asset_id : props?.id
            }
        }
        dispatch(ListServiceDue(payload))
        dispatch(getFormDetailsAction('serviceDue'))
        dispatch(GetServiceTypeAction())
        dispatch(GetPriorityAction())
        
    }, [paginateData.pageCount, paginateData.pageSize, props?.index])


    // const handlePageChange = (page) => {
    //     setPaginateData({...paginateData, pageCount : page})
    // }


    // const handlePageSizeChange = (size) => {
    //     setPaginateData({...paginateData, pageSize : size})
    // }

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
            pageCount: 0,
        }))
    }


    const cancelSearch = () => {
        setPaginateData({...paginateData, searchString : ''})

        dispatch(setSearchServiceDueAction({data : [], numRows : 0}))

        const payload = {
            searchString : '',
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize
        }
        const asset_payload = {
            searchString : '',
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize,
            asset_id : props?.id
        }
        if(props?.type === 'asset_id'){
            dispatch(getSearchServiceDueAction
                (asset_payload, setModalTypeHandler, setLoaderStatusHandler)
            )
        }
       else{
        dispatch(getSearchServiceDueAction
            (payload, setModalTypeHandler, setLoaderStatusHandler)
        )
       }
    }

    const requestSearch = (e) => {
        const val = e.target.value
        setPaginateData({...paginateData, searchString : val})

        dispatch(setSearchServiceDueAction({data : [], numRows : 0}))

        const payload = {
            searchString : val,
            pageCount : 0,
            numPerPage : paginateData.pageSize
        }
        const asset_payload = {
            searchString : val,
            pageCount : 0,
            numPerPage : paginateData.pageSize,
            asset_id : props?.id
        }
        if(props?.type === 'asset_id'){
            dispatch(getSearchServiceDueAction
                (asset_payload, setModalTypeHandler, setLoaderStatusHandler))
        }
        else{
            dispatch(getSearchServiceDueAction
                (payload, setModalTypeHandler, setLoaderStatusHandler))
        }
    }

    const handleDialogImageOpen = (images) => {
        setImages(images)
        setImageOpen(true)
    }

    const handleDialogImageClose = () => {
        setImageOpen(false)
    }

    const handleChange = (name, value) => {
    const updatedValues = {
        ...filterValues,
        [name]: value
    };

    setFilterValues(updatedValues);

    setErrors({
        priority: updatedValues.priority ? null : "Priority is required!",
        serviceType: updatedValues.serviceType ? null : "Service Type is required!"
    });
};

const handleSubmit =  ()=>{
    if (
        (!filterValues.priority || filterValues.priority.length === 0) &&
        !filterValues.serviceType &&
        !filterValues.dueDate
       ) {
       return;
       }

    let priority = null
    

     const payload = {
            searchString : paginateData.searchString,
            pageCount : 0,
            numPerPage : paginateData.pageSize,
            priority : filterValues.priority?.length ? filterValues.priority.map((p) => p.id) : null,
            serviceType : filterValues.serviceType?.id || null,
            due: filterValues.dueDate ? 1 : 0, ...(props?.type === 'asset_id' ? { asset_id: props?.id } : {}),
        }

        dispatch(getSearchServiceDueAction
                (payload, setModalTypeHandler, setLoaderStatusHandler))

        setFilterOpen(false)

}

const handleClear = ()=>{

         const payload = {
            searchString : paginateData.searchString,
            pageCount : 0,
            numPerPage : paginateData.pageSize,
            priority :  null,
            serviceType : null,
            due : 0
        }

        setFilterValues(({...filterValues,priority : [],serviceType : null,dueDate : 0}))

        dispatch(getSearchServiceDueAction
                (payload, setModalTypeHandler, setLoaderStatusHandler))

        setFilterOpen(false)
}


    const chips = [
        {id:1,label:'Total Service',value : serviceDueListCount || 0},
        {id:2,label:'Due This Week',value : getTotalDetails[0]?.due_this_week_amount || 0},
        {id:3,label:'Due This Week Count',value : getTotalDetails[0]?.due_this_week_count || 0},
        {id:4,label:'Total Service Amount',value : getTotalDetails[0]?.total_service_value || 0},
    ]

  return (
      <>
          {
              (showForm === false && detail === false) &&

              <>

                <Grid container >
                  {  props.type !== 'asset_id' &&
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
                           location.pathname === '/assets/serviceDue' &&
                           (chip.label === 'Total Service' ||
                           chip.label === 'Due This Week' ||
                           chip.label === 'Due This Week Count')
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

              <Card sx={{ width: '100%', height: '100%', overflow: 'hidden'}}>
                  <MaterialTable
                      style = {props.type === 'asset_id' ? { margin : '12px'} : {}}
                      totalCount = {serviceDueListCount}
                      columns = {columnServiceDue}
                      data = {serviceDueList}
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
                          pageSizeOptions : props?.type === 'asset_id' ? [5,10,20] :  [20, 50, 100],
                          search : false,
                          maxBodyHeight : 'calc(100vh - 260px)',
                          minBodyHeight : 'calc(100vh - 260px)',
                         fixedHeader: true,
                      }}
                    //   page = {paginateData.pageCount}
                    //   onPageChange = {(page) => handlePageChange(page)}
                    //   onRowsPerPageChange = {(size) => handlePageSizeChange(size)}
                    {...(props?.type !== 'asset_id'
                      ? { onRowClick: (e, rowData) => handleDetailClick(rowData) }
                      : {})}
                      components = {{
                          Toolbar : (props) => (
                              <div>
                                  <div
                                      style={{
                                          display : 'flex',
                                          width : '100%',
                                          alignItems : 'center'
                                      }}
                                  >
                                      <div style={{width : '100%'}}>
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
                          )
                                 
                            ,
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
                                    count={serviceDueListCount || 0}
                                    page={paginateData.pageCount || 0}
                                    rowsPerPage={paginateData.pageSize || 20}
                                    onPageChange={(event, newPage) => handlePageChange(newPage)}                                  
                                    rowsPerPageOptions={props?.type === 'asset_id' ? [5, 10, 20] : [20, 50, 100]}

                                    onRowsPerPageChange={(event) =>
                                      handlePageSizeChange(parseInt(event.target.value, 10))
                                    }
                                    labelRowsPerPage="Rows per page:"
                                  />
                                </div>
                              ),
                      }}
                      actions = {[
                          props?.type === 'asset_id' ? '' : serviceDueCreate ?{
                              icon : () => <AddIcon />,
                              tooltip : 'Add',
                              isFreeAction : true,
                              onClick : handleOpen
                          } : null ,
                           props?.type === 'asset_id' ? '' : {
                              icon : () => <FilterAltIcon />,
                              tooltip : 'Filter',
                              isFreeAction : true,
                              onClick : ()=> setFilterOpen(true)
                          }
                      ]}
                      title = 'Service Due'
                  >
                      
                  </MaterialTable>
                  </Card>

                 <Dialog
                  maxWidth="xs"
                  fullWidth
                  open={filterOpen}
                  >
                  <DialogContent sx={{ padding: 5 }}>
                  <Grid
                  container
                  display={'flex'}
                  justifyContent={'flex-end'}
                  >
                  <IconButton aria-label='close' onClick={() => setFilterOpen(false)}>
                    <CloseIcon />
                  </IconButton>
                </Grid>
                      <Grid container spacing={2}>
                      <Grid size={12}>
                          <Autocomplete
                          fullWidth
                          multiple
                          options={getServiceDuePriority}
                          getOptionLabel={(option) => option.priority_name || ''}
                          value={filterValues.priority || []}
                          onChange={(event, value) =>
                              handleChange('priority', value)
                          }
                          renderInput={(params) => (
                              <TextField
                              {...params}
                              label="Priority"
                              variant="filled"
                              />
                          )}
                          />
                      </Grid>
                      <Grid size={12}>
                          <Autocomplete
                          fullWidth
                          options={getServiceType}
                          getOptionLabel={(option) => option.service_type || ''}
                          value={filterValues.serviceType || null}
                          onChange={(event, value) =>
                              handleChange('serviceType', value)
                          }
                          renderInput={(params) => (
                              <TextField
                              {...params}
                              label="Service Type"
                              variant="filled"
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
                          <FormControlLabel
                              control={<Checkbox 
                                      checked={filterValues.dueDate}          
                                      onChange={(e) => handleChange('dueDate',e.target.checked)} 
                                      />}
                              label='Due Soon(within 7 days)'
                          />
                          
      
                      </Grid>
                      </Grid>
                  </DialogContent>

                  <DialogActions>
                      <Button variant='contained' color='error' onClick={handleClear}>Clear</Button>
                      <Button variant="contained" onClick={handleSubmit} disabled={isFilterEmpty}>Apply</Button>
                  </DialogActions>
                  </Dialog>

              </>

          }
           {
               detail === true &&
              <ServiceDetail rowData = {rowData} handleClose = {handleCancel}/>
          }
          {showForm && (
            <ServiceDueForm
              type={formType}
              handleCancel={handleCancel}
              rowData={formType === 'edit' ? editData : undefined}
            />
          )}
          {
              <Modal 
                  open = {imageOpen === true}
                  aria-labelledby = "image-modal-title"
                  aria-describedby = "image-modal-description"
               >
                  <Box
                      sx = {{
                          position : 'absolute',
                          top : '50%',
                          left : '50%',
                          transform : 'translate(-50%, -50%)',
                          bgcolor : 'background.paper',
                          boxShadow : 24,
                          alignContent : 'center',
                          p : 4,
                          maxWidth : '700px',
                          width : '90vw',
                          maxHeight : '700px',
                          height : '95vh'
                      }}
                  >
                      <Tooltip title = 'Close'>
                          <IconButton
                              onClick = {handleDialogImageClose}
                              sx = {{ position : 'absolute', top : 8, right : 8, zIndex : 1}}
                          >
                              <Close />
                          </IconButton>
                      </Tooltip>

                      <img
                          src = {images[0]?.imageUrl} 
                          alt = "Image"
                          style = {{ width : '600px', height : '600px', objectFit : 'fit', marginLeft : '33px', marginTop : '5px' }}
                      />

                  </Box>
              </Modal>
          }
          <Dialog
                    open={dialogConfirm}
                    onClose={!dialogConfirm}
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

ServiceDueTable.propTypes = {
    type : PropTypes.string,
    id : PropTypes.number,
    index : PropTypes.number
}

export default ServiceDueTable
