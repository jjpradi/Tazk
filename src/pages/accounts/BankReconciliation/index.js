import React, {Component, useContext, useEffect, useState} from 'react';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';

import {TextField, InputAdornment, Button, Grid} from '@mui/material';
import {connect} from 'react-redux';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import {useNavigate} from 'react-router-dom';
import {Typography} from '@mui/material';
import {useDispatch, useSelector} from 'react-redux';
import {listBankReconciliationTableAction, 
  listBankReconciliation, 
  set_searchBankReconciliationAction,
  get_searchBankReconciliationAction,
  } from 'redux/actions/bankCreation_actions';
import {deleteBankReconciliationTableAction} from 'redux/actions/bankCreation_actions';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import EditMatchEntries from './editMatchEntries';
import ArticleIcon from '@mui/icons-material/Article';
import UnmatchEntries from './unmatchviews';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle } from 'utils/pageSize';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CommonSearch from 'utils/commonSearch';
import { titleURL } from 'http-common';



export default function BankReconciliation(props) {
  const [open, setOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState();
  const [isApiFinished, setIsApiFinished] = useState(false);


  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [editTableOpen, setEditTableOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [viewopen, setViewopen] = useState(false);
  const [searchData, setSearchData] = useState({page: 0,
    pageSize: 20,
    searchVal: '',
    searchPageData: []})
  const [viewId, setViewId] = useState()
  const dispatch = useDispatch();
  const {
    bankCreationReducer: {bank_reconciliation_table, bank_reconciliation, searchBankCreationData, searchBankCreationCount, bank_reconciliation_table_count},
  } = useSelector((state) => state);
  const {headerLocationId,commoncookie,setModalTypeHandler, setLoaderStatusHandler} = useContext(
    CreateNewButtonContext,
  );

  const handleDelete = () => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        deleteBankReconciliationTableAction(
          deleteRow,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      )
    );

    handleClose();
  };

  useEffect(() => {
    dispatch(set_searchBankReconciliationAction({data:[], numRows:0}));
    const body = {
      pageCount : searchData.page,
      numPerPage : searchData.pageSize,
      searchString :  searchData.searchVal
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        listBankReconciliationTableAction(
          body,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      )
      
    ).finally(() => setIsApiFinished(true));
  }, []);

  useEffect(() => {

    const body = {pageCount: searchData.page || 0, numPerPage:  searchData.pageSize, searchString: searchData.searchVal}

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        listBankReconciliationTableAction(
          body,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      )
      
    )
  }, [searchData.page, searchData.pageSize])

  // const navigate = Navigate()
  let navigate = useNavigate();

  function handleClick() {
    navigate('/bankdetails');
  }
 function  reconcilateView(bankId) {
  setViewId(bankId)
  setViewopen(true)
  }

  const requestSearch = (e) => {
    // const context = props.context;
    let val = e.target.value;
    setSearchData({...searchData, searchVal: val});

    // if(val.trim() !== ''){
      dispatch(set_searchBankReconciliationAction({data:[], numRows:0}))
    // }
    const body = {
      searchString:val,
      employeeId:commoncookie,
      headerLocationId:headerLocationId,
      pageCount: 0, 
      numPerPage:  searchData.pageSize
    }
    dispatch(get_searchBankReconciliationAction(
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
      )
    )
  };

  const cancelSearch = (e) => {
    setSearchData({...searchData, searchPageData: [], page: 0, searchVal: ''});
    dispatch(set_searchBankReconciliationAction({data:[], numRows:0}))

    const body = {pageCount: searchData.page || 0, numPerPage:  searchData.pageSize, searchString: ''}

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        listBankReconciliationTableAction(
          body,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      )
      
    )
  };

  const handlePageChange = async (page) => {

    setSearchData({...searchData, page: page});

    // const body = {pageCount: searchData.page || 0, numPerPage:  searchData.pageSize, searchString: searchData.searchVal}

    // apiCalls(
    //   setModalTypeHandler,
    //   setLoaderStatusHandler,
    //   dispatch(
    //     listBankReconciliationTableAction(
    //       body,
    //       setModalTypeHandler,
    //       setLoaderStatusHandler,
    //     ),
    //   )
      
    // )
  }

  const handlePageSizeChange = async (size) => {

    setSearchData({...searchData, pageSize: size});

    // const body = {pageCount: searchData.page || 0, numPerPage:  searchData.pageSize, searchString: searchData.searchVal}

    // apiCalls(
    //   setModalTypeHandler,
    //   setLoaderStatusHandler,
    //   dispatch(
    //     listBankReconciliationTableAction(
    //       body,
    //       setModalTypeHandler,
    //       setLoaderStatusHandler,
    //     ),
    //   )
      
    // )
  };

  return (
    <>
     <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | Bank Reconciliation </title>
      </Helmet>
    <CreateNewButtonContext>
      {({drawerOpen}) => (
        <div>
          {viewopen === false ? (
            <>
            <MaterialTable
              totalCount={searchBankCreationData?.length > 0 || searchData.searchVal.length > 0 ? searchBankCreationCount : bank_reconciliation_table_count}
              components={{
                Toolbar: (props) => (
                  <>
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
                              searchVal={searchData.searchVal}
                              cancelSearch={cancelSearch}
                              requestSearch={requestSearch}
                            />
                            {/* <TextField
                          autoFocus={searchData.searchVal ? true : false}
                          sx={{
                            borderRadius: '8px',
                            pr: '10px',
                            '& .MuiOutlinedInput-root': {
                              height: '42px',
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position='start'>
                                <SearchIcon />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position='end'>
                                <ClearIcon
                                  onClick={cancelSearch}
                                  sx={{cursor: 'pointer'}}
                                />
                              </InputAdornment>
                            ),
                          }}
                          placeholder='Search'
                          value={searchData.searchVal}
                          onChange={requestSearch}
                        /> */}
                          </div>
                          <div></div>
                        </div>
                      </>
                    ),
                  }}
                  actions={[
                    {
                      icon: () => (
                        <Button variant='outlined' style={{ fontSize: headerStyle.fontSize }} onClick={handleClick}>
                          Process Reconciliation
                        </Button>
                      ),
                      tooltip: 'Process Reconciliation',
                      isFreeAction: true,
                    },
                    (rowData) => ({
                      icon: () => (
                        <ArticleIcon
                          color={
                            'success'

                          }
                        />
                      ),
                      tooltip: 'View',
                      onClick: (event, rowData) => { reconcilateView(rowData.bankAccountId) }
                      //   setTimeout(() => {
                      //     this.setState({
                      //       rowPopup: {
                      //         ...this.state.rowPopup,open: false}})
                      //   }, 0);},
                      // disabled: rowData.receive_goods === 'received' ? true : false,
                    }),

                    // {
                    //   icon:'delete',
                    //   onClick: (event, rowData) => {
                    //     setDeleteRow(rowData.id);
                    //     handleClickOpen();
                    //   },
                    //   isFreeAction: false,
                    // },
                    //   {
                    //     icon: 'edit',
                    //     onClick: (event, rowData) => {

                    //       setEditData(rowData);
                    //       setEditTableOpen(true);
                    //     },
                    //     tooltip: 'Match',
                    //     isFreeAction: false,
                    //   },
                  ]}
                  options={{
                    showEmptyDataSourceMessage: isApiFinished,
                    headerStyle,
                    cellStyle,
                    search: false,
                    exportButton: true,
                    filtering: false,
                    actionsColumnIndex: -1,
                    maxBodyHeight: maxHeight,
                    pageSize: 20,
                    pageSizeOptions: [20, 50, 100],
                  }}

                  page={searchData.page}
                  onPageChange={(page) => handlePageChange(page)}
                  onRowsPerPageChange={(size) => handlePageSizeChange(size)}

                  columns={[
                    { title: 'Bank', field: 'bankName' },
                    { title: 'No of Entries', field: 'noofEntreies' },
                  ]}
                  //data={bank_reconciliation_table}
                  data={searchBankCreationData?.length > 0 || searchData.searchVal.length > 0 ? searchBankCreationData : bank_reconciliation_table}
              title={
                <Typography
                  variant='h6'
                  align='left'
                  style={{paddingTop: '10px', paddingBottom: '10px'}}
                >
                  Bank Reconciliation
                </Typography>
              }
            />
          <Grid>
            <Grid>
              <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{'Delete Alert'}</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Are you sure you want to Delete this?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button variant='contained' color='error' onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button variant='contained' onClick={handleDelete} autoFocus>
                    Delete
                  </Button>
                </DialogActions>
              </Dialog>
            </Grid>
          </Grid>
          </>
          ) : (
            <UnmatchEntries
              setViewopen={setViewopen}
              bankId = {viewId}
            />
          )}
          {}
          <></>
        </div>
      )}
    </CreateNewButtonContext>
    </>
  );
}

