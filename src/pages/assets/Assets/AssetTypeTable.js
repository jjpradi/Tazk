import React, { useState, useEffect, useContext } from 'react';
import { Grid, TextField, Autocomplete, IconButton, Tooltip, Dialog, Container, Fade, Card, Button, DialogContentText, DialogContent, DialogActions, Typography } from '@mui/material';

import { useDispatch, useSelector } from 'react-redux';
import { deleteAssetType, getAssetGroupIdAction, getAssetTypeIdAction, setSearchAssetGroupAction, setSearchAssetGroupListAction, setSearchAssetTypeAction, setSearchAssetTypeListAction } from 'redux/actions/asset_actions';
import AssetTypeForm from './AssetTypeForm';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import CommonSearch from 'utils/commonSearch';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { maxBodyHeight, headerStyle, cellStyle } from 'utils/pageSize';
import { set } from 'lodash';

const AssetTypeTable = () =>{

    const dispatch = useDispatch()
    
    const [pagination,setPagination] = useState({
        searchString:'',
    })

    const [open,setOpen] = useState(false)
    const [AssetType,setAssetType]=useState()
    const [rowData,setRowData]=useState()

    const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(
        CreateNewButtonContext,
      );

    const { AssetReducers: { getAssetType } } = useSelector((state) => state);

    useEffect(() => {
        dispatch(getAssetTypeIdAction(pagination));
    }, []);

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

    const handleDelete = async(rowData)=>{
        setOpen(false)
        await dispatch(deleteAssetType(rowData?.asset_type_id))
    }

    
    const handleDeleteOpen = (rowdata)=>{

        setRowData(rowdata)
        setOpen(true)
    }


    const column = [
        {
            field : 'asset_type',
            title:'Asset Type'
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
                       <IconButton onClick={()=>{ handleDeleteOpen(rowData)}}>
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
                title={'Asset Type'}
                data={getAssetType?.data}
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
                            <IconButton onClick={() => setAssetType(true)}>
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
            <Dialog open={AssetType === true}>
     <AssetTypeForm handleClose={handleClose} setPagination = {setPagination}/>
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
}

export default AssetTypeTable;
