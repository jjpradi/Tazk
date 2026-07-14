import React, { useState , useEffect, useContext } from 'react';
import { Container,Card, Grid, Typography, IconButton, Fade,DialogContent,Dialog, DialogContentText, DialogActions, Button,Tooltip, TextField  } from '@mui/material';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import CommonSearch from 'utils/commonSearch';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import DeleteIcon from '@mui/icons-material/Delete'
import { deleteDesignationAction, designationAction, getSearchDesignation, setSearchDesignation, updateDesignationAction } from 'redux/actions/userCreation_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import DesignationForm from './DesignationForm';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { headerStyle, cellStyle, maxBodyHeight } from 'utils/pageSize';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

export default function Designation() {
    const dispatch = useDispatch()
    const storage = getsessionStorage()
    const selectedRole = storage.role_name

    const[designationlist,SetDesignationList]=useState(false);
    const [search , setSearch]=useState({searchString:''})
    const [data, SetData]=useState()
    const [rowData,setRowData]=useState();
    const [open,setOpen]=useState(false)
    const [editRowId, setEditRowId] = useState(null);
    const [editName, setEditName] = useState("");

    const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(
        CreateNewButtonContext,
      );

      const { 
        UserRoleReducer: { designation},
        rbacReducer: { menuAccess }
      } = useSelector((state) => state);

    useEffect(() => { (async () => {
            dispatch(
                designationAction(async (response) => {
                    const res = await response;
                    SetData(res);
                })
            );
        
    })();
}, [designationlist]);

    const fetchDesignation = async () => {
        dispatch(
            designationAction(async (response) => {
                const res = await response;
                SetData(res);
            })
        );
    };

    const handleDeleteOpen = (rowData)=>{
        setRowData(rowData)
        setOpen(true)
    }

    const handleDelete = async()=>{
        setOpen(false);
        await dispatch(deleteDesignationAction(rowData.id));
    }

    const handleClose = ()=>{
        SetDesignationList(false)
    } 

    const handleSave = (rowData) => {
        const payload = {
            designation_id: rowData.id,
            designation: editName.trim(),
        };
        dispatch(updateDesignationAction(payload, (res) => {
            fetchDesignation();
            setEditRowId(null);
        })
        )
    };

    const designationLovCreate = UserRightsAuthorization(menuAccess[selectedRole], 'info__lov', 'can_create')
    const designationLovEdit = UserRightsAuthorization(menuAccess[selectedRole], 'info__lov', 'can_edit')
    const designationLovDelete = UserRightsAuthorization(menuAccess[selectedRole], 'info__lov', 'can_delete')

    const column = [
        {
            field: 'designation',
            title: 'Name',
            render: (rowData) =>
                editRowId === rowData.id ? (
                    <TextField
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        size="small"
                        autoFocus
                    />
                ) : (
                    rowData.designation
                ),
        },
        (designationLovEdit || designationLovDelete) && {
            title: 'Action',
            render: (rowData) => (
                <Grid container spacing={1}>

                    {editRowId === rowData.id ? (
                        <>
                            <IconButton
                                onClick={() => handleSave(rowData)}
                                title="Save"
                            >
                                <CheckIcon />
                            </IconButton>

                            <IconButton
                                onClick={() => setEditRowId(null)}
                                title="Cancel"
                            >
                                <CloseIcon />
                            </IconButton>
                        </>
                    ) : (
                        <>
                            {
                                designationLovEdit &&
                                <IconButton
                                    onClick={() => {
                                        setEditRowId(rowData.id);
                                        setEditName(rowData.designation);
                                    }}
                                    title="Edit"
                                >
                                    <EditIcon />
                                </IconButton>
                            }

                            {
                                designationLovDelete &&
                                <IconButton
                                    onClick={() => handleDeleteOpen(rowData)}
                                    title="Delete"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            }
                        </>
                    )}

                </Grid>
            ),
        },
    ]

    const cancelSearch = () =>{

        setSearch({searchString:''})
        dispatch(setSearchDesignation({
            data:[],
            numCount:0
        }))

        const payload = {
            searchString:''
        }
  
  
        dispatch(getSearchDesignation(payload,
        setModalTypeHandler,
        setLoaderStatusHandler))
    }
  
  
    const requestSearch = (e)=>{
        const val = e.target.value;
        setSearch({searchString:val})
        dispatch(setSearchDesignation({
            data:[],
            numCount:0
        }))

        const payload = {
            searchString: val
        }
  
  
        dispatch(getSearchDesignation(payload,
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
              title={'Designation'}
              data={designation}
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
                                              {
                                                designationLovCreate &&
                                                <IconButton onClick={() => SetDesignationList(true)}>
                                                    <AddIcon />
                                                </IconButton>
                                              }
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
                  <DesignationForm handleClose={handleClose} setSearch ={setSearch}/>
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

