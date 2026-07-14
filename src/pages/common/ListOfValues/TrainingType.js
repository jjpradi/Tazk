import React, { useState , useEffect, useContext } from 'react';
import { Container,Card, Grid, Typography, IconButton, Fade,DialogContent,Dialog, DialogContentText, DialogActions, Button,Tooltip  } from '@mui/material';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import CommonSearch from 'utils/commonSearch';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import DeleteIcon from '@mui/icons-material/Delete'
import { deleteDesignationAction, deleteTrainingTypeAction, designationAction, getSearchDesignation, getSearchTrainingType, setSearchDesignation, setSearchTrainingType, trainingTypeAction } from 'redux/actions/userCreation_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import DesignationForm from './DesignationForm';
import TrainingTypeForm from './TrainingTypeForm';
import { headerStyle, cellStyle, maxBodyHeight } from 'utils/pageSize';

export default function Designation() {
    const dispatch = useDispatch()
    const[designationlist,SetDesignationList]=useState(false);
    const [search , setSearch]=useState({searchString:''})
    const [data, SetData]=useState()
    const [rowData,setRowData]=useState();
    const [open,setOpen]=useState(false)

    const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(
        CreateNewButtonContext,
      );

      const { UserRoleReducer: { trainingType } } = useSelector((state) => state);

    useEffect(() => { (async () => {
            dispatch(
                trainingTypeAction(async (response) => {
                    const res = await response;
                    SetData(res);
                })
            );
        
    })();
}, [designationlist]);

    const handleDeleteOpen = (rowData)=>{
        setRowData(rowData)
        setOpen(true)
    }

    const handleDelete = async()=>{
        setOpen(false);
        await dispatch(deleteTrainingTypeAction(rowData.id));
    }

    const handleClose = ()=>{
        SetDesignationList(false)
    } 


    const column = [
        {
            field :'training_type',
            title:'Name'
        },
        {
            title :'Action',
            render: (rowData) => (
                <>
                    <Grid>
                        <Tooltip
                            title = 'Delete'
                            TransitionComponent={Fade}
                            TransitionProps={{timeout:600}}
                            placement='top'
                        />
                       <IconButton onClick={()=>{handleDeleteOpen(rowData)}} >
                       <DeleteIcon/>
                       </IconButton>
                    </Grid>
                </>
            )
        }
    ]

    const cancelSearch = () =>{

        setSearch({searchString:''})
        dispatch(setSearchTrainingType({
            data:[],
            numCount:0
        }))

        const payload = {
            searchString:''
        }
  
  
        dispatch(getSearchTrainingType(payload,
        setModalTypeHandler,
        setLoaderStatusHandler))
    }
  
  
    const requestSearch = (e)=>{
        console.log('trainingtype')
        const val = e.target.value;
        setSearch({searchString:val})
        dispatch(setSearchTrainingType({
            data:[],
            numCount:0
        }))

        const payload = {
            searchString: val
        }
  
  
        dispatch(getSearchTrainingType(payload,
        setModalTypeHandler,
        setLoaderStatusHandler))
    }


  return (
      <>
          <style>
            {`
              /* Remove border under 'No records to display' */
              .MuiTableBody-root .MuiTableRow-root td {
                border-bottom: none !important;
              }
            `}
          </style>
          <MaterialTable
              columns={column}
              title={'Training Type'}
              data={trainingType}
              options={{
                  headerStyle,
                  cellStyle,
                  filtering:false,
                  actionsColumnIndex : -1,
                  paging : false,
                  search : false,
                  maxBodyHeight,
                  minBodyHeight: maxBodyHeight,
                  // overflowX: 'hidden'
              }}
              
              components={{Toolbar: (props) => (
                  <div>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px' }}>
                      <Typography variant="h6" component="div">
                                                  {props.title}
                                              </Typography>
                                              <IconButton onClick={() => SetDesignationList(true)}>
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
              )}}

          />
          <Dialog open={designationlist === true}>
                  <TrainingTypeForm handleClose={handleClose} setSearch ={setSearch}/>
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
                          <Button variant='contained' color='error' onClick={()=> handleDelete(rowData) }>Delete</Button>
                          </DialogActions>
            
          </Dialog>
      </>
  );
}

