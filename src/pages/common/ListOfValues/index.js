import React, { useState, useEffect, useContext  } from 'react';
import { Container,Card, Grid, Typography, IconButton ,Dialog, Tooltip, Fade,DialogContent, DialogContentText, DialogActions, Button, TextField} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import CommonSearch from 'utils/commonSearch';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete'
import Category from './Category';
import Claims from './Claims';
import DepartmentForm from './DepartmentForm';
import Designation from './Designation';
import GstItcBlockReason from './GstItcBlockReason';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { listDepartment,addDepartmentAction,deleteDepartmentAction, listEmployeeCategoryAction, setSearchDepartmentList, getSearchDepartmentList, updateDepartmentAction } from 'redux/actions/shifts.actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import TermsAndCondition from './TermsAndCondition';
import LeadSource from './LeadSource';
import LeadStatus from './LeadStatus';
import AssetTypeTable from 'pages/assets/Assets/AssetTypeTable';
import AssetConfig from 'pages/assets/Assets/AssetConfig';
import Compliances from './Compliances';
import RenewalTable from './RenewalTable';
import ProductUnits from './ProductUnits';
import CreditDays from './CreditDays';
import TrainingType from './TrainingType';
import PlanType from './PlanType';
import Benefits from './Benefits';
import PaymentTerms from './PaymentTerms';
import deliveryTerms from './DeliveryTerms'
import DeliveryTerms from './DeliveryTerms';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import InsuranceType from './InsuranceType';
import { headerStyle, cellStyle, maxBodyHeight } from 'utils/pageSize';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

export default function ListOfValues({pageType}) {

    const dispatch = useDispatch()

    const storage = getsessionStorage()
    const company_type = storage.company_type || null
    const selectedRole = storage.role_name

    const {
        rbacReducer: { menuAccess }
    } = useSelector((state) => state)

    const[departments,SetDepartments]=useState(false)
    const [data, SetData]=useState([])
    const [rowData,setRowData]=useState();
    const [open,setOpen]=useState(false)
    const [search, setSearch] = useState({
      searchString:''
    })
    const [editRowId, setEditRowId] = useState(null);
    const [editName, setEditName] = useState("");

    const [toolbarHeight, setToolbarHeight] = useState(document.getElementsByClassName('MuiToolbar-root')[0]?.clientHeight || 70)
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);

    let resizeWindow = () => {
        const dynamicToolbarHeight_val = document.getElementsByClassName('MuiToolbar-root')[0]?.clientHeight || 70;
        setToolbarHeight(dynamicToolbarHeight_val);
        setWindowHeight(window.innerHeight);
      };

    const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(
        CreateNewButtonContext,
      );

    //   const { ShiftsReducer: { listDepartment } } = useSelector((state) => state);
      useEffect(() => {
        resizeWindow();
        window.addEventListener('resize', resizeWindow);
        return () => window.removeEventListener('resize', resizeWindow);
      }, []);


      const fetchDepartments = async () => {
        const data = { searchString: '' };
        dispatch(
            listDepartment(data, async (response) => {
                const res = await response;
                SetData(res);
            }),
        );
    };
    
    useEffect(() => {
        if (departments === false && open === false) {
            fetchDepartments();
        }
    }, [departments, open]);



      const handleDeleteOpen = (rowData)=>{
        setRowData(rowData)
        setOpen(true)
    }

    const handleDelete = async()=>{
        setOpen(false);
        await dispatch(deleteDepartmentAction(rowData.id));
        fetchDepartments();
    }
        
    const handleClose = ()=>{
        SetDepartments(false)
    } 

    const cancelSearch = () =>{

      setSearch({searchString:''})
      dispatch(setSearchDepartmentList({
          data:[],
          numCount:0
      }))

      const payload = {
          searchString:''
      }

      dispatch(getSearchDepartmentList(payload,
        (response) => {
            SetData(response.data);
        },
      setModalTypeHandler,
      setLoaderStatusHandler))
  }


  const requestSearch = (e)=>{
      const val = e.target.value;
      setSearch({searchString:val})
      dispatch(setSearchDepartmentList({
          data:[],
          numCount:0
      }))

      const payload = {
          searchString:val
      }

      dispatch(getSearchDepartmentList(payload,
        (response) => {
            SetData(response.data);
        },
      setModalTypeHandler,
      setLoaderStatusHandler))
  }

    const handleSave = (rowData) => {
        const payload = {
            department_id: rowData.id,
            department: editName.trim(),
        };

         dispatch(updateDepartmentAction(payload, (res) => {
            fetchDepartments();
            setEditRowId(null);
          })
        )
    };

    const depratmentLovCreate = UserRightsAuthorization(menuAccess[selectedRole], 'info__lov', 'can_create')
    const depratmentLovEdit = UserRightsAuthorization(menuAccess[selectedRole], 'info__lov', 'can_edit')
    const depratmentLovDelete = UserRightsAuthorization(menuAccess[selectedRole], 'info__lov', 'can_delete')


const column = [
  {
    field: 'department',
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
        rowData.department
      ),
  },
  (depratmentLovEdit || depratmentLovDelete) && {
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
                depratmentLovEdit &&
                <IconButton
                    onClick={() => {
                        setEditRowId(rowData.id);
                        setEditName(rowData.department);
                    }}
                    title="Edit"
                >
                    <EditIcon />
                </IconButton>
            }

            {
                depratmentLovDelete &&
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
];



    console.log(data, "SSSSS")

  return (
      <>
          <style>
                          {`
                              /* Customize scrollbar width */
                              ::-webkit-scrollbar {
                                  width: 10px;  /* Vertical scrollbar */
                                  height: 4px; /* Horizontal scrollbar */
                              }

                              /* Customize scrollbar track */
                              ::-webkit-scrollbar-track {
                                  background: #f1f1f1;
                              }

                              /* Customize scrollbar thumb */
                              ::-webkit-scrollbar-thumb {
                                  background: #888;
                                  border-radius: 10px;
                              }

                              /* Customize scrollbar thumb on hover */
                              ::-webkit-scrollbar-thumb:hover {
                                  background: #555;
                              }
                              .MuiTableCell-head {
                                  text-align: right !important; /* Force align header cells to the right */
                              }
                              /* Remove border under 'No records to display' */
                              .MuiTableBody-root .MuiTableRow-root td {
                                  border-bottom: none !important;
                              }
                          `}
                      </style>
          {/* <Card > */}
         <Grid
               container
               style={{
                 maxHeight: '75vh',
                 overflowY: 'auto',
                padding: '16px' 
              }}>
              {/* {
                  company_type !== 2 ? ( */}
              <>
              
              {storage.company_type !== 3 && storage.company_type !== 2 && storage.company_type !== 12 && <Grid
                  style={{ height: '100%' }}
                  size={{
                      lg: 3,
                      md: pageType === 'detailpage' ? 4 : 3,
                      sm: 6,
                      xs: 12
                  }}>
          {/* <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}> */}
          <MaterialTable
              columns={column}
              title={'Department'}
              data={data}
              options={{
                  headerStyle,
                  cellStyle,
                  filtering:false,
                  actionsColumnIndex: -1,
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
                                                depratmentLovCreate &&
                                                <IconButton onClick={() => SetDepartments(true)}>
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
          
          {/* </Card> */}
            </Grid>}

              {storage?.company_type !== 10 && storage.company_type !== 12 && <Grid
                  style={{ height: '100%' }}
                  size={{
                      lg: 3,
                      md: pageType === 'detailpage' ? 4 : 3,
                      sm: 6,
                      xs: 12
                  }}>
                  {/* <Card sx={{ height: '100%' }}> */}
                      <Category />
                  {/* </Card> */}
              </Grid>}

                  {storage?.company_type !== 10 && storage.company_type !== 9 && storage.company_type !== 2 && storage.company_type !== 3 && storage.company_type !== 12 && <Grid
                      style={{ height: '100%' }}
                      size={{
                          lg: 3,
                          md: 3,
                          sm: 6,
                          xs: 12
                      }}>
                  {/* <Card sx={{ height: '100%' }}> */}
                      <Claims />
                  {/* </Card> */}
                  </Grid> }

                  {storage?.company_type === 10 && storage.company_type !== 3 && storage.company_type !== 2 && 
                  <>
                      <Grid
                          style={{ height: '100%' }}
                          size={{
                              lg: 3,
                              md: 3,
                              sm: 6,
                              xs: 12
                          }}>
                          <LeadSource/>
                      </Grid>

                      <Grid
                          style={{ height: '100%' }}
                          size={{
                              lg: 3,
                              md: 3,
                              sm: 6,
                              xs: 12
                          }}>
                          <LeadStatus/>
                      </Grid>
                  </> }

                  {storage?.company_type === 9 && storage.company_type !== 3 && storage.company_type !== 2 && 
                  <>
                      <Grid
                          style={{ height: '100%' }}
                          size={{
                              lg: 3,
                              md: 3,
                              sm: 6,
                              xs: 12
                          }}>
                          <AssetConfig /> {/* Asset Group */}
                      </Grid>
                      <Grid
                          style={{ height: '100%' }}
                          size={{
                              lg: 3,
                              md: 3,
                              sm: 6,
                              xs: 12
                          }}>
                          <AssetTypeTable />
                      </Grid>
                      <Grid
                          style={{ height: '100%' }}
                          size={{
                              lg: 3,
                              md: 3,
                              sm: 6,
                              xs: 12
                          }}>
                          <Compliances />
                      </Grid>
                      <Grid
                          style={{ height : '100%' }}
                          size={{
                              lg: 3,
                              md: 3,
                              sm: 6,
                              xs: 12
                          }}>
                          <RenewalTable />
                      </Grid>
                      {/* <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }} style={{ height : '100%' }}>
                          <ServiceType />
                      </Grid> */}
                      <Grid
                          style={{ height : '100%' }}
                          size={{
                              lg: 3,
                              md: 3,
                              sm: 6,
                              xs: 12
                          }}>
                          <InsuranceType />
                      </Grid>
                  </> }

                  {storage?.company_type === 12 && 
                  <>
                      <Grid
                          style={{ height: '100%' }}
                          size={{
                              lg: 3,
                              md: 3,
                              sm: 6,
                              xs: 12
                          }}>
                          <TrainingType />
                      </Grid>
                      <Grid
                          style={{ height: '100%' }}
                          size={{
                              lg: 3,
                              md: 3,
                              sm: 6,
                              xs: 12
                          }}>
                          <PlanType />
                      </Grid>
                      <Grid
                          style={{ height: '100%' }}
                          size={{
                              lg: 3,
                              md: 3,
                              sm: 6,
                              xs: 12
                          }}>
                          <Benefits />
                      </Grid>
                  </> }

                  {storage?.company_type !== 10  && storage.company_type !== 2 && storage.company_type !== 12 &&  <Grid
                      style={{ height: '100%' }}
                      size={{
                          lg: 3,
                          md: pageType === 'detailpage' ? 4 : 3,
                          sm: 6,
                          xs: 12
                      }}>
                  {/* <Card sx={{ height: '100%' }}> */}
                      <Designation />
                  {/* </Card> */}
                  </Grid> }

                  <Grid
                      style={{ height: '100%' }}
                      size={{
                          lg: 3,
                          md: pageType === 'detailpage' ? 4 : 3,
                          sm: 6,
                          xs: 12
                      }}>
                      <GstItcBlockReason />
                  </Grid>
                  </>
                  
                      {
                          (storage?.company_type === 2 || storage?.company_type === 3) &&
                          <>
                              <Grid
                                  style={{ height: '100%' }}
                                  size={{
                                      lg: 3,
                                      md: 3,
                                      sm: 6,
                                      xs: 12
                                  }}>
                                  <TermsAndCondition />
                              </Grid>

                              <Grid
                                  style={{ height : '100%' }}
                                  size={{
                                      lg: 3,
                                      md: 3,
                                      sm: 6,
                                      xs: 12
                                  }}>
                                  <ProductUnits />
                              </Grid>

                              <Grid
                                  style={{ height : '100%' }}
                                  size={{
                                      lg: 3,
                                      md: 3,
                                      sm: 6,
                                      xs: 12
                                  }}>
                                  <CreditDays />
                              </Grid>
                          </>
                      }

                    {
                        (storage?.company_type === 3) &&
                        <>
                            <Grid
                                style={{ height: '100%' }}
                                size={{
                                    lg: 3,
                                    md: 3,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <PaymentTerms />
                            </Grid>

                            <Grid
                                style={{ height: '100%' }}
                                size={{
                                    lg: 3,
                                    md: 3,
                                    sm: 6,
                                    xs: 12
                                }}>
                                <DeliveryTerms />
                            </Grid>
                        </>
                    }
                      
                  {/* ) } */}

            </Grid>
          {/* </Card> */}
          <Dialog open={departments === true}>
          <DepartmentForm handleClose={handleClose} setSearch ={setSearch}/>
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
                          <Button variant='contained' color='error' onClick={()=> handleDelete() }>Delete</Button>
                          </DialogActions>
            
          </Dialog>
      </>
  );
}

