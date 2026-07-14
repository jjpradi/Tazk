import React, { useState , useEffect, useContext } from 'react';
import { Container,Card, Grid, Typography, IconButton, Fade,DialogContent,Dialog, DialogContentText, DialogActions, Button,Tooltip  } from '@mui/material';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import CommonSearch from 'utils/commonSearch';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import DeleteIcon from '@mui/icons-material/Delete'
import { benefitsAction, deleteBenefitsAction, deleteDesignationAction, designationAction, getSearchBenefits, getSearchDesignation, setSearchBenefits, setSearchDesignation } from 'redux/actions/userCreation_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import DesignationForm from './DesignationForm';
import BenefitsForm from './BenefitsForm';
import { headerStyle, cellStyle, maxBodyHeight } from 'utils/pageSize';

export default function Benefits() {
    const dispatch = useDispatch()
    const[designationlist,SetDesignationList]=useState(false);
    const [search , setSearch]=useState({searchString:''})
    const [data, SetData]=useState()
    const [rowData,setRowData]=useState();
    const [open,setOpen]=useState(false)

    const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(
        CreateNewButtonContext,
      );

      const { UserRoleReducer: { benefits } } = useSelector((state) => state);

    useEffect(() => { (async () => {
            dispatch(
                benefitsAction(async (response) => {
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
        await dispatch(deleteBenefitsAction(rowData.id));
    }

    const handleClose = ()=>{
        SetDesignationList(false)
    } 


    const column = [
        {
            field :'benefits',
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
        dispatch(setSearchBenefits({
            data:[],
            numCount:0
        }))

        const payload = {
            searchString:''
        }
  
  
        dispatch(getSearchBenefits(payload,
        setModalTypeHandler,
        setLoaderStatusHandler))
    }
  
  
    const requestSearch = (e)=>{
        const val = e.target.value;
        setSearch({searchString:val})
        dispatch(setSearchBenefits({
            data:[],
            numCount:0
        }))

        const payload = {
            searchString: val
        }
  
  
        dispatch(getSearchBenefits(payload,
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
              title={'Benefits'}
              data={benefits}
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
                  <BenefitsForm handleClose={handleClose} setSearch ={setSearch}/>
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

