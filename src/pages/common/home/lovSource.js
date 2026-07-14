import MaterialTable from 'utils/SafeMaterialTable'
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, Fade,Grid, IconButton, TextField, Tooltip, Typography } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add';
import CommonSearch from 'utils/commonSearch';
import { useDispatch, useSelector } from 'react-redux';
import { addNewSource, deleteInitialSourceAction, deleteLeadSourceAction, getLeadManagementSourceAction, getLeadSourceList, leadInitialSourceAction, setLeadSourceList } from 'redux/actions/leadManagement_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import NewSource from 'pages/crm/leadManagement/NewSource';


const LovSource = ({handleSource}) => {

    const [data,setData] =useState([])
    const [initialVal, setInitialVal] = useState([]);
    const [open,setOpen] = useState(false)
    const [source,setSource] = useState(false)
    const [search , setSearch]=useState({searchString:''})
    const [values, setValues] = useState({ sourceName: '' });
    const[newSource, setNewSource] = useState(null)
    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const dispatch  = useDispatch()

    const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(
        CreateNewButtonContext,
      );

    const {
        leadManagementReducers : { leadManagementSource, leadInitialSource }
    } = useSelector((state) => state)
console.log(leadInitialSource,'leadInitialSource')

    const handleDeleteOpen=(rowData)=>{
        setData(rowData)
        setOpen(true)
    }

    useEffect(()=>{
    //    await  dispatch(leadInitialSourceAction())
       dispatch(leadInitialSourceAction((response) => {
        if (response?.length > 0) {
          setInitialVal(response)
        }
      }));
    },[])

    useEffect(() => {
        let filter = initialVal.filter(source_id => source_id.isDeleted == 0);
        console.log(filter, initialVal, values, 'filllterrr')
        setSelectedRows(filter?.map(v => v.source_id))
      }, [initialVal])

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

    const handleSelectRow = (event, source_id) => {
        const selectedIndex = selectedRows.indexOf(source_id);
        let newSelectedRows = [];
    
        if (selectedIndex === -1) {
          newSelectedRows = newSelectedRows.concat(selectedRows, source_id);
        } else if (selectedIndex > 0) {
          newSelectedRows = newSelectedRows.concat(selectedRows.slice(0, selectedIndex), selectedRows.slice(selectedIndex + 1));
        }
        const deleteId = leadInitialSource?.filter((v) => !newSelectedRows.includes(v.source_id));
        const addSource = leadInitialSource?.filter((v) => newSelectedRows.includes(v.source_id));
        const ids = deleteId?.map((v) => v.source_id);
        const names = addSource?.map((v) => v.source_name);
        handleSource(newSelectedRows, ids);
        setSelectedRows(newSelectedRows);
        setSelectAll(newSelectedRows.length === leadInitialSource?.length);
        console.log(leadInitialSource?.filter((v) => newSelectedRows.includes(v.source_id)),leadInitialSource,leadInitialSource,leadInitialSource?.data?.filter((v) => !newSelectedRows.includes(v.source_id)),'addcattttt');    
        console.log(source_id,selectedRows,newSelectedRows,deleteId,addSource,ids,names, 'addcattttt1')
      };

    const renderCheckbox = (rowData) => {
        const isChecked = selectedRows.includes(rowData.source_id);
        return <Checkbox checked={isChecked} onChange={(e) => handleSelectRow(e, rowData.source_id)} />;
    };

    const handleSelectAllClick = () => {
        if (!selectAll) {
          const allIds = leadInitialSource.map((row) => row.source_id);
          setSelectedRows(allIds);
          handleSource(leadInitialSource.map((row) => row.source_name), [])
        } else {
          setSelectedRows([]);
          handleSource([], leadInitialSource.map((row) => row.source_id));
        }
        setSelectAll(!selectAll);
      };

    const handleChange = (val, name) => {
        setValues({ ...values, [name]: val });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValues({sourceName: ''})
        await dispatch(addNewSource({sourceName: values.sourceName}))
        await  dispatch(leadInitialSourceAction())
        // await dispatch(createAssetGroup(values, () => {
        //     dispatch(leadManagementSourceAction(pagination));
        //     setPagination({ searchString: '' });
        // }));
        // setValues({ groupName: '' })
    };

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
            title : 'Name',
            width: '90%',
            render: (rowData) => {
              if (rowData.id === 'new') {
                return (
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <TextField
                      fullWidth
                      label='sourceName'
                      variant="outlined"
                      value={values.sourceName}
                      onChange={(e) => handleChange(e.target.value, 'sourceName')}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {    
                          handleSubmit(e);
                        }
                      }}
                    />
                  </div>
                );
              }
              return rowData.source_name;
            },
        },
        {
            field: 'Action',
            title: 'Action',
            width: '5%',
            render: (rowData) => (
              <Grid container justifyContent="flex-end">
                {rowData.createdBy !== null && rowData.createdBy !== 0 && rowData.id !== 'new' ? (
                  <>
                    <Tooltip
                      title='Delete'
                      TransitionComponent={Fade}
                      TransitionProps={{ timeout: 600 }}
                      placement='top'
                    />
                    <IconButton onClick={() => { handleDeleteOpen(rowData) }}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                ) : null}
              </Grid>
      
            ),
        },
        {
            field: 'select',
            width: '5%',
            title: (
              <Checkbox
                checked={selectAll}
                onChange={handleSelectAllClick}
                inputProps={{ 'aria-label': 'select all source' }}
              />
            ),
            render: (rowData) => {
              if (rowData.id !== 'new') {
                return renderCheckbox(rowData);
              }
              return (
                <IconButton onClick={handleSubmit} disabled={!values.sourceName}>
                  <AddIcon />
                </IconButton>
              );
            },
          }
    ]

    const handleDelete = async()=>{
        setOpen(false);
        await dispatch(deleteInitialSourceAction(data.source_id));
        await  dispatch(leadInitialSourceAction())
    }

    console.log(leadInitialSource,'leadManagementSourceleadManagementSource')

    const handleClose = ()=>{
        setSource(false)
    } 

  return (
    <div>
      <MaterialTable
          columns={columns}
          title={'Lead Source'}
          data = {[{id: 'new', Source: 'New Source' }, ...leadInitialSource]}
          options={{
              filtering:false,
              actionsColumnIndex : -1,
              paging : false,
              search : false,
              maxBodyHeight : 'calc(100vh - 230px)',
              minBodyHeight : 'calc(100vh - 230px)'
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
          
                              {/* <IconButton onClick={() => { setSource(true) }}>
                                  <AddIcon />
                              </IconButton> */}
                              </div>
          
                              {/* <div style={{ padding: '8px 16px' }}>
                                  <CommonSearch
                                      searchVal={search.searchString}
                                      cancelSearch={cancelSearch}
                                      requestSearch={requestSearch}
                                  />
                              </div> */}
                          
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
                              <Button variant='contained' color='primary' onClick={()=> handleDelete(data) }>Delete</Button>
                              </DialogActions>
                
              </Dialog>
    </div>
  );
}

export default LovSource
