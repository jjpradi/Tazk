import MaterialTable from 'utils/SafeMaterialTable'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, Fade,Grid, IconButton, Tooltip, Typography } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add';
import CommonSearch from 'utils/commonSearch';
import { useDispatch, useSelector } from 'react-redux';
import { deleteLeadSourceAction, getLeadManagementSourceAction, getLeadSourceList, setLeadSourceList } from 'redux/actions/leadManagement_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import NewSource from 'pages/crm/leadManagement/NewSource';
import { headerStyle, cellStyle, maxBodyHeight } from 'utils/pageSize';


const LeadSource = () => {

    const [data,setData] =useState([])
    const [open,setOpen] = useState(false)
    const [source,setSource] = useState(false)
    const [search , setSearch]=useState({searchString:''})

    const dispatch  = useDispatch()

    const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(
        CreateNewButtonContext,
      );

    const {
        leadManagementReducers : { leadManagementSource }
    } = useSelector((state) => state)

    const handleDeleteOpen=(rowData)=>{
        setData(rowData)
        setOpen(true)
    }

    useEffect(()=>{ (async () => {
       await  dispatch(getLeadManagementSourceAction())
    })();
},[])

    const cancelSearch = ()=>{
        setSearch({searchString : ''})
        dispatch(setLeadSourceList({
            data:[],
            numCount:0
        }))
  
        const payload = {
            searchString:'',
            // type: 'LIST_CATEGORY'
        }
  
        dispatch(getLeadSourceList(payload,
        setModalTypeHandler,
        setLoaderStatusHandler))
    }

const requestSearch = (e)=>{
        const val = e.target.value;
        setSearch({searchString:val})
        dispatch(setLeadSourceList({
            data:[],
            numCount:0
        }))
  
        const payload = {
            searchString:val,
            // type: 'LIST_CATEGORY'
        }
  
        dispatch(getLeadSourceList(payload,
        setModalTypeHandler,
        setLoaderStatusHandler))
    }

    const columns = [
        {
            field : 'source_name',
            title : 'Name'
        },
        // {
        //     field  : 'Action',
        //     title  : 'Action',
        //     render :(rowData)=>{
        //         <>
        //             <Grid>
        //                 <Tooltip
        //                     title = 'Delete'
        //                     TransitionComponent={Fade}
        //                     TransitionProps={{timeout:600}}
        //                     placement='top'
        //                 />
        //                 <IconButton onClick={()=> {handleDeleteOpen(rowData)}}>
        //                     <DeleteIcon/>
        //                 </IconButton>
        //             </Grid>
        //         </>
        //     }
        // }
        {
            field: 'Action',
            title: 'Action',
            render: (rowData) => {
                return (
                    <Grid>
                        <Tooltip
                            title='Delete'
                            TransitionComponent={Fade}
                            TransitionProps={{ timeout: 600 }}
                            placement='top'
                        >
                            <IconButton onClick={() => { handleDeleteOpen(rowData) }}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                );
            }
        }
    ]

    const handleDelete = async()=>{
        setOpen(false);
        await dispatch(deleteLeadSourceAction(data.source_id));
    }

    console.log(leadManagementSource,'leadManagementSourceleadManagementSource')

    const handleClose = ()=>{
        setSource(false)
    } 

  return (
      <div>
          <style>
           {`
             /* Remove border under 'No records to display' */
             .MuiTableBody-root .MuiTableRow-root td {
               border-bottom: none !important;
             }
           `}
         </style>
          <MaterialTable
              columns={columns}
              title={'Lead Source'}
              data = {leadManagementSource}
              options={{
                  headerStyle,
                  cellStyle,
                  filtering:false,
                  actionsColumnIndex : -1,
                  paging : false,
                  search : false,
                  maxBodyHeight,
                  minBodyHeight : maxBodyHeight
              }}

              // components={{
              //     Toolbar : (props)=>{
              //         <div>
              //               <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px' }}>
              //                 <Typography variant='h6' component={"div"}>
              //                 {props.title}
              //                 </Typography>

              //                 <IconButton onClick={()=> {setSource(true)}}>
              //                     <AddIcon/>
              //                 </IconButton>

              //                 <div style={{padding: '8px 16px'}}>
              //                     <CommonSearch
              //                         searchVal = {search.searchString}
              //                         cancelSearch = {cancelSearch}
              //                         requestSearch = {requestSearch}
              //                     />
              //                 </div>
              //               </div>
              //         </div>
              //     }
              // }}
              components={{
                  Toolbar: (props) => {
                      return (
                          <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px' }}>
                                  <Typography variant='h6' component={"div"}>
                                      {props.title}
                                  </Typography>
              
                                  <IconButton onClick={() => { setSource(true) }}>
                                      <AddIcon />
                                  </IconButton>
                                  </div>
              
                                  <div style={{ padding: '8px 16px' }}>
                                      <CommonSearch
                                          searchVal={search.searchString}
                                          cancelSearch={cancelSearch}
                                          requestSearch={requestSearch}
                                      />
                                  </div>
                              
                          </div>
                      );
                  }
              }}
          >

          </MaterialTable>
          <Dialog open={source === true}>
          <NewSource type = 'Lead Source' closeDialog={handleClose} setSearch ={setSearch}/>
          </Dialog>
          <Dialog open={open === true}>
                          
                          <Grid container >
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
                                  <Button variant='contained' color='error' onClick={()=>setOpen(false)}>cancel</Button>
                                  <Button variant='contained' color='error' onClick={()=> handleDelete(data) }>Delete</Button>
                                  </DialogActions>
                    
                  </Dialog>
      </div>
  );
}

export default LeadSource
