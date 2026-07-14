import React, { useState, useEffect, useContext } from 'react';
import { Grid, TextField, Autocomplete, IconButton, Tooltip, Dialog, Container, Fade, Card, Button, DialogContentText, DialogContent, DialogActions, Typography, Checkbox } from '@mui/material';

import { useDispatch, useSelector } from 'react-redux';
import { createAssetType, deleteAssetType, deleteInitialAssetTypeAction, getAssetGroupIdAction, getAssetTypeIdAction, getInitialAssetTypeAction, setSearchAssetGroupAction, setSearchAssetGroupListAction, setSearchAssetTypeAction, setSearchAssetTypeListAction } from 'redux/actions/asset_actions';
// import AssetTypeForm from './AssetTypeForm';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import CommonSearch from 'utils/commonSearch';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { set } from 'lodash';

const LovType = ({handleType}) =>{

    const dispatch = useDispatch()
    const [pagination,setPagination] = useState({
        searchString:'',
    })
    const[values, setValues] = useState({
        asset_group_id : null,
        AssetType: null
    })
    const [selectAll, setSelectAll] = useState(false);
    const [open,setOpen] = useState(false)
    const [AssetType,setAssetType]=useState()
    const [rowData,setRowData]=useState()
    const [selectedRows, setSelectedRows] = useState([]);
    const [data, SetData] = useState([]);
    const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(
        CreateNewButtonContext,
      );

    const { AssetReducers: { getAssetType, getInitialAssetType } } = useSelector((state) => state);
console.log(getAssetType,getInitialAssetType,'getAssetType')

    useEffect(() => {
        // dispatch(getAssetTypeIdAction(pagination));
        dispatch(getInitialAssetTypeAction(pagination, (response) => {
          if (response?.length > 0) {
            SetData(response)
          }
        }));
    }, [pagination]);

    useEffect(()=>{
      let filter = data.filter(id => id.isDeleted == 0);
      console.log(filter,data,pagination,values,'filllterrr')
      setSelectedRows(filter?.map(v=>v.id))
    },[data])

    const cancelSearch = () =>{

        setPagination({...pagination,searchString:''})

        dispatch(setSearchAssetTypeAction({data:[],numCount:0}))

        const payload ={
            searchString :'',
        }

        dispatch(setSearchAssetTypeListAction(payload,
            setModalTypeHandler,setLoaderStatusHandler
        ))
    }


    const requestSearch = (e)=>{
        const val = e.target.value;
        setPagination({...pagination,searchString:val})
        dispatch(setSearchAssetTypeAction({
            data:[],
            numCount:0
        }))

        const payload = {
            searchString:val,
        }

        dispatch(setSearchAssetTypeListAction(payload,
        setModalTypeHandler,
        setLoaderStatusHandler))
    }

    const handleClose = ()=>{
        setAssetType(false)
    }

    const handleChange = (val, name) => {
        setValues({ ...values, [name]: val });
    };

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            id : 1,
            assetType : values.AssetType
          }
            await dispatch(createAssetType(data,()=>{
             dispatch(getInitialAssetTypeAction(pagination))
             setPagination(
              {
                searchString:'',
                pageCount : 0,
                numPerPage : 5
            }
             )
            }))
        setValues({ AssetType: '', asset_group_id: '' })
    };

    
    const renderCheckbox = (rowData) => {
        const isChecked = selectedRows.includes(rowData.id);
        return <Checkbox checked={isChecked} onChange={(e) => handleSelectRow(e, rowData.id)} />;
    };
    
  const handleSelectRow = (event, id) => {
    const selectedIndex = selectedRows.indexOf(id);
    let newSelectedRows = [];

    if (selectedIndex === -1) {
      newSelectedRows = newSelectedRows.concat(selectedRows, id);
    } else if (selectedIndex > 0) {
      newSelectedRows = newSelectedRows.concat(selectedRows.slice(0, selectedIndex), selectedRows.slice(selectedIndex + 1));
    }
    const assetTypeData = Array.isArray(getInitialAssetType) ? getInitialAssetType : [];
    const deleteId = getInitialAssetType?.data?.filter((v) => !newSelectedRows.includes(v.id));
    const addType = assetTypeData?.filter((v) => newSelectedRows.includes(v.id));
    const ids = deleteId?.map((v) => v.id);
    const names = addType?.map((v) => v.asset_group);
    handleType(newSelectedRows, ids);
    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.length === assetTypeData?.length);
    console.log(assetTypeData?.filter((v) => newSelectedRows.includes(v.id)),assetTypeData,getAssetType,getAssetType?.data?.filter((v) => !newSelectedRows.includes(v.id)),'addcattttt');    
    console.log(id,selectedRows,newSelectedRows,deleteId,addType,ids,names, 'addcattttt1')
  };

const handleSelectAllClick = () => {
    if (!selectAll) {
      const allIds = getInitialAssetType?.data.map((row) => row.id);
      setSelectedRows(allIds);
      handleType(getInitialAssetType?.data.map((row) => row.asset_type), [])
    } else {
      setSelectedRows([]);
      handleType([], getInitialAssetType?.data.map((row) => row.id));
    }
    setSelectAll(!selectAll);
  };

    const handleDelete = async(rowData)=>{
        setOpen(false)
        await dispatch(deleteInitialAssetTypeAction(rowData?.asset_type_id))
        dispatch(getInitialAssetTypeAction(pagination, (response) => {
          if (response?.length > 0) {
            SetData(response)
          }
        }));
    }

    
    const handleDeleteOpen = (rowdata)=>{

        setRowData(rowdata)
        setOpen(true)
    }


    const column = [
        {
            field : 'asset_type',
            title:'Name',
            width: '90%',
            render: (rowData) => {
              if (rowData.id === 'new') {
                return (
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <TextField
                      fullWidth
                      label='Type'
                      variant="outlined"
                      value={values.AssetType}
                      onChange={(e) => handleChange(e.target.value, 'AssetType')}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {    
                          handleSubmit(e);
                        }
                      }}
                    />
                  </div>
                );
              }
              return rowData.asset_type;
            },
        },
        {
            title :'Action',
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
                inputProps={{ 'aria-label': 'select all groups' }}
              />
            ),
            render: (rowData) => {
              if (rowData.id !== 'new') {
                return renderCheckbox(rowData);
              }
              return (
                <IconButton onClick={handleSubmit} disabled={!values.AssetType}>
                  <AddIcon />
                </IconButton>
              );
            },
          }
    ]
   
    return (
      <>
        <MaterialTable
            columns={column}
            title={'Asset Type'}
            // data={getAssetType?.data}
            data={[
                { id: 'new', Type: 'New Type' },
                ...(Array.isArray(getInitialAssetType?.data) ? getInitialAssetType.data : [])
              ]}
            options={{
                filtering:false,
                actionsColumnIndex : -1,
                paging : false,
                search : false,
                maxBodyHeight: 'calc(100vh - 230px)',
                minBodyHeight: 'calc(100vh - 230px)',
            }}
            components={{Toolbar: (props) => (
                <div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px' }}>
                        <Typography variant="h6" component="div">
                            {props.title}
                        </Typography>
                        {/* <IconButton onClick={() => setAssetType(true)}>
                            <AddIcon />
                        </IconButton> */}
                    </div>
    
                    {/* <div style={{ padding: '8px 16px' }}>
                        <CommonSearch
                            searchVal={pagination.searchString}
                            cancelSearch={cancelSearch}
                            requestSearch={requestSearch}
                        />
                    </div> */}
                </div>
            )}}
        />
        {/* <Dialog open={AssetType === true}>
 <AssetTypeForm handleClose={handleClose} setPagination = {setPagination}/>
</Dialog> */}
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
                        {/* Are you sure you want to delete */}
                        </Grid>
                       
                </Grid>
                <DialogActions>
                        <Button variant='contained' color='error' onClick={()=>setOpen(false)}>cancel</Button>
                        <Button variant='contained' color='primary' onClick={()=> handleDelete(rowData) }>Delete</Button>
                        </DialogActions>
          
        </Dialog>
      </>
    );
}

export default LovType;
