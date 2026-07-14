import React, { useState, useEffect, useContext } from 'react';
import { Grid, TextField, Autocomplete, IconButton, Tooltip, Dialog, Container, Fade, Card, DialogContent, DialogContentText, DialogActions, Button, Typography } from '@mui/material';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle, font14_500 } from 'utils/pageSize';
import { useDispatch, useSelector } from 'react-redux';
import { deleteAssetGroup, getAssetGroupIdAction, getAssetTypeIdAction, setSearchAssetGroupAction, setSearchAssetGroupListAction } from 'redux/actions/asset_actions';
import AssetGroupForm from './AssetGroupForm';
import AssetTypeForm from './AssetTypeForm';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import CommonSearch from 'utils/commonSearch';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import AssetTypeTable from './AssetTypeTable';

const AssetConfig = (props) => {

    const dispatch = useDispatch()
    
    const [pagination,setPagination] = useState({
        searchString:'',
    })

    const [Assetgroup,setAssetGroup]=useState()

    const [rowData,setRowData]=useState();
    const [open,setOpen]=useState(false)

    const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(
        CreateNewButtonContext,
      );

    const { AssetReducers: { getAssetGroup } } = useSelector((state) => state);
   
    useEffect(() => {
        dispatch(getAssetGroupIdAction(pagination));
    }, []);


    const cancelSearch = () =>{

        setPagination({...pagination,searchString:''})
        dispatch(setSearchAssetGroupAction({
            data:[],
            numCount:0
        }))

        const payload = {
            searchString:'',
        }

        dispatch(setSearchAssetGroupListAction(payload,
        setModalTypeHandler,
        setLoaderStatusHandler))
    }


    const requestSearch = (e)=>{
        const val = e.target.value;
        setPagination({...pagination,searchString:val})
        dispatch(setSearchAssetGroupAction({
            data:[],
            numCount:0
        }))

        const payload = {
            searchString:val,
        }

        dispatch(setSearchAssetGroupListAction(payload,
        setModalTypeHandler,
        setLoaderStatusHandler))
    }

    const handleClose = ()=>{
        setAssetGroup(false)
    } 

    const handleDeleteOpen = (rowData)=>{
        setRowData(rowData)
        setOpen(true)
    }


    const handleDelete = async(rowData)=>{
        setOpen(false);
        await dispatch(deleteAssetGroup(rowData?.asset_group_id));
    }


    const column = [
        {
            field : 'asset_group',
            title:'Asset Group'
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
                       <IconButton onClick={()=>{handleDeleteOpen(rowData)}}>
                       <DeleteIcon/>
                       </IconButton>
                    </Grid>
                </>
            )
        }
    ]
   
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
                title={'Asset Group'}
                data={getAssetGroup?.data}
                options={{
                    filtering:false,
                    actionsColumnIndex : -1,
                    paging : false,
                    search : false,
                    headerStyle,
                    cellStyle,
                    maxBodyHeight,
                    minBodyHeight: 'calc(100vh - 230px)',
                }}
                components={{Toolbar: (props) => (
                    <div>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px' }}>
                        <Typography variant="h6" component="div">
                                                    {props.title}
                                                </Typography>
                                                <IconButton onClick={() => setAssetGroup(true)}>
                                                    <AddIcon />
                                                </IconButton>
                                            </div>
        
                            <div style={{ padding: '8px 16px' }}>
                                <CommonSearch
                                    searchVal={pagination.searchString}
                                    cancelSearch={cancelSearch}
                                    requestSearch={requestSearch}
                                />
                            </div>
                            </div>
                )}}
            />
            <Dialog open={Assetgroup === true}>
                <AssetGroupForm handleClose={handleClose} setPagination = {setPagination}/>
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
                        {/* Are you sure you want to delete */}
                        </Grid>
                       
                </Grid>
                <DialogActions>
                        <Button variant='contained' color='error' onClick={()=>setOpen(false)}>cancel</Button>
                        <Button variant='contained' color='error' onClick={()=> handleDelete(rowData) }>Delete</Button>
                        </DialogActions>
          
        </Dialog>
        </>
    );
};

export default AssetConfig;

