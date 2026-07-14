import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable'
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconButton, Tooltip, Fade, Grid, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { asstGeneralContactAction, getAsstGeneralContactAction, setAsstGeneralContactAction, deleteAsstGeneralContactAction } from 'redux/actions/asset_actions';
import CommonSearch from "utils/commonSearch";
import { maxBodyHeight } from 'utils/pageSize';
import AssetGeneralForm from './AssetGeneralForm';

const GeneralFormListing = () => {

    const dispatch = useDispatch()

      const [paginateData, setPaginateData] = useState({
        searchString: '',
        pageCount: 0,
        pageSize: 20,
      });
  const [newGeneralForm, setNewGeneralForm] = useState(false)
  const [newGeneralFormType, setNewGeneralFormType] = useState('')
  const [rowData,setRowData] = useState('')
  const [deleteId,setDeleteId] = useState(null)
  const [dialogConfirm,setDialogConfirm] = useState(false)

        const {
          AssetReducers: {get_asst_general},
        } = useSelector((state) => state);
      
        const {
          setModalTypeHandler,
          setLoaderStatusHandler,
          commoncookie,
          headerLocationId,
        } = useContext(CreateNewButtonContext);
    
      // console.log(rowData)
    
      const requestSearch = (e) => {
        const val = e.target.value;
    
        setPaginateData({...paginateData, searchString: val});
    
        dispatch(
          setAsstGeneralContactAction({
            data: [],
            numRows: 0,
          }),
        );
    
        const payload = {
          searchString: val,
          pageCount: 0,
          numPerPage: paginateData.pageSize,
        };
        dispatch(
          getAsstGeneralContactAction(
            payload,
            setModalTypeHandler,
            setLoaderStatusHandler,
          ),
        );
      };

    const handlePageChange = (page) => {
    setPaginateData({...paginateData, pageCount: page});
  };

  const handleSizeChange = (size) => {
    setPaginateData({...paginateData, pageSize: size});
  };
    
      const cancelSearch = () => {
        setPaginateData({...paginateData, searchString: ''});
    
        dispatch(
          setAsstGeneralContactAction({
            data: [],
            numRows: 0,
          }),
        );
    
        const payload = {
          searchString: '',
          pageCount: paginateData.pageCount,
          numPerPage: paginateData.pageSize,
        };
        dispatch(
          asstGeneralContactAction(payload, setModalTypeHandler, setLoaderStatusHandler),
        );
      };

    const handleEdit = (rowData) => {
      setNewGeneralFormType("edit")
      setNewGeneralForm(true)
      setRowData(rowData)
    }

    const handleDelete = async () => {
      await dispatch(deleteAsstGeneralContactAction(deleteId))
      setDialogConfirm(false)
      const payload = {
        numPerPage : paginateData.pageSize,
        pageCount : paginateData.pageCount,
        searchString : paginateData.searchString
      }
      await dispatch(asstGeneralContactAction(payload))
    }

    const columns = [
        {field : 'name',title : 'Name'},
        {field : 'email',title : 'Email',  render: (rowData) =>
          rowData.email && rowData.email !== "null"
            ? rowData.email
            : '-'},
 
        {field : 'contact',title : 'Contact'},
        {
            title: 'Action',
            render: (rowData) => (
                <Grid container spacing={1} style={{ flexWrap: 'nowrap' }}>
                    <Grid item>
                        <Tooltip title="Edit" TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top">
                            <IconButton onClick={() => { handleEdit(rowData) }}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                    <Grid item>
                        <Tooltip title="Delete" TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top">
                            <IconButton onClick={() => { setDeleteId(rowData.id); setDialogConfirm(true) }}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>
            )
        },
    ]
    
    useEffect(()=>{ (async () => {
        const payload = {
            numPerPage : paginateData.pageSize,
            pageCount : paginateData.pageCount,
            searchString : paginateData.searchString

        }
        await dispatch(asstGeneralContactAction(payload))
    })();
},[paginateData.pageCount,paginateData.pageSize])

  return (
    <div >
        { !newGeneralForm && <MaterialTable
                            style={{height: 'calc(100vh - 80px)', overflowY: 'scroll',}}
                            totalCount={get_asst_general?.numRows}
                            columns={columns}
                            title={"General Contact"}
                            data={get_asst_general?.data || []}
                            options={{
                                filtering : false,
                                actionsColumnIndex : -1,
                                paging:true,
                                pageSize : paginateData.pageSize,
                                pageSizeOptions:[20, 50, 100],
                                search:false,
                                maxBodyHeight: maxBodyHeight,
                                minBodyHeight: maxBodyHeight,
                                // overflowY: 'visible',
                                emptyRowsWhenPaging: false,
                                // minBodyHeight : maxBodyHeight
                            }}
                            
                            page={paginateData.pageCount}
                            onPageChange={(page) => {
                            handlePageChange(page);
                            }}
                            onRowsPerPageChange={(size) => {
                            handleSizeChange(size);
                            }}
                            components={{
                                Toolbar:(props)=>(
                                <div
                                style={{
                                    display: 'flex',
                                    width: '100%',
                                    alignItems: 'center',
                                }}
                                >
                                    <div style={{width: '100%'}}>
                                                    <MTableToolbar {...props} />
                                    </div>
                                    <div>
                                        <CommonSearch
                                            searchVal = {paginateData.searchString}
                                            cancelSearch={cancelSearch}
                                            requestSearch={requestSearch}  
                                            />
                                    </div>

                                    
                                </div>
                                )
                            }}
                    />}

      {newGeneralForm === true &&
        <AssetGeneralForm
          handleClose={() => setNewGeneralForm(false)}
          type={newGeneralFormType}
          rowData = {rowData}
        />
      }

      <Dialog
        open={dialogConfirm}
        onClose={() => setDialogConfirm(false)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{'Delete ?'}</DialogTitle>
        <Grid container>
          <Grid
            size={{
              lg: 6,
              md: 6
            }}>
            <DialogContent style={{ width: 500 }}>
              <DialogContentText
                id='alert-dialog-description'
                sx={{ color: 'warning.main' }}
              >
                Are you sure you want to delete ?
              </DialogContentText>
            </DialogContent>
          </Grid>
        </Grid>

        <DialogActions>
          <Button onClick={() => setDialogConfirm(false)} color='secondary'>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color='primary'
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  )
}

export default GeneralFormListing
