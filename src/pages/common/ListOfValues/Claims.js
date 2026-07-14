import React , { useState , useEffect, useContext }from 'react';
import { Container,Card, Grid, Typography, IconButton ,  Fade,DialogContent, DialogContentText, DialogActions, Button , Dialog,Tooltip} from '@mui/material';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import CommonSearch from 'utils/commonSearch';
import { useDispatch, useSelector } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete'
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { deleteClaimsCategoryAction, getClaimsCategoryAction, getSearchClaimsCategoryList, setSearchClaimsCategoryList } from 'redux/actions/loan_actions';
import ClaimsForm from './ClaimsForm';
import { headerStyle, cellStyle, maxBodyHeight } from 'utils/pageSize';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

export default function Claims() {

    const dispatch = useDispatch()
    const storage = getsessionStorage()
    const selectedRole = storage.role_name

    const[claimsCategories,SetclaimsCategories]=useState(false);
    const [search , setSearch]=useState({searchString:''})
    const [data, SetData]=useState()
    const [rowData,setRowData]=useState();
    const [open,setOpen]=useState(false)

    const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(
        CreateNewButtonContext,
      );

    const { 
        LoanReducer: { claimsCategory },
        rbacReducer: { menuAccess }
    } = useSelector((state) => state);

    useEffect(()=>{ (async () => {
        if (claimsCategories === false) {
            dispatch(
                getClaimsCategoryAction(async (response) => {
                   const res = await response;
                   SetData(res);
                 }),
               );
        }
       })();
},[claimsCategories])

       const handleClose = ()=>{
        SetclaimsCategories(false)
    } 

    const handleDeleteOpen = (rowData)=>{
        setRowData(rowData)
        setOpen(true)
    }

    const handleDelete = async()=>{
        setOpen(false);
        await dispatch(deleteClaimsCategoryAction(rowData.id));
    }

    const claimsLovCreate = UserRightsAuthorization(menuAccess[selectedRole], 'info__lov', 'can_create')
    const claimsLovDelete = UserRightsAuthorization(menuAccess[selectedRole], 'info__lov', 'can_delete')

    const column = [
        {
            field :'category_name',
            title:'Name'
        },
        claimsLovDelete && {
            title :'Action',
            render: (rowData) => (
                
                    <Grid>
                        <Tooltip
                            title = 'Delete'
                            TransitionComponent={Fade}
                            TransitionProps={{timeout:600}}
                            placement='top'
                        />
                       <IconButton onClick={()=>{handleDeleteOpen(rowData)}}>
                       <DeleteIcon/>
                       </IconButton>
                    </Grid>
                
            )
        }
    ]

    const cancelSearch = () =>{

        setSearch({searchString:''})
        dispatch(setSearchClaimsCategoryList({
            data:[],
            numCount:0
        }))
  
        const payload = {
            searchString:''
        }
  
        dispatch(getSearchClaimsCategoryList(payload,
        setModalTypeHandler,
        setLoaderStatusHandler))
    }
  
  
    const requestSearch = (e)=>{
        const val = e.target.value;
        setSearch({searchString:val})
        dispatch(setSearchClaimsCategoryList({
            data:[],
            numCount:0
        }))
  
        const payload = {
            searchString:val
        }
  
        dispatch(getSearchClaimsCategoryList(payload,
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
              title={'Claims'}
              data={claimsCategory}
              options={{
                  headerStyle,
                  cellStyle,
                  filtering:false,
                  actionsColumnIndex : -1,
                  paging : false,
                  search : false,
                  maxBodyHeight,
                  minBodyHeight: maxBodyHeight,
                  overflowX: 'hidden'
              }}
              
              components={{Toolbar: (props) => (
                  <div>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px' }}>
                      <Typography variant="h6" component="div">
                                                  {props.title}
                                              </Typography>
                                              {
                                                claimsLovCreate &&
                                                <IconButton onClick={() => SetclaimsCategories(true)}>
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
          <Dialog open={claimsCategories === true}>
                  <ClaimsForm handleClose={handleClose} setSearch ={setSearch}/>
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

