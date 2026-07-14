import React,{useEffect,useState, useContext} from 'react'
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import { useSelector ,useDispatch} from 'react-redux';
import {
    createManualSchemesAction,
    get_searchManualSchemesAction,
    listManualSchemesAction,
    manualSchemePaginationAction,
    set_searchManualSchemesAction
  } from '../../../redux/actions/manual_schemes_actions';
  import {InputAdornment, TextField, Typography} from '@mui/material'
  import context from '../../../context/CreateNewButtonContext';
  import NewManualSchemes from '../../../components/NewManualSchemes'
  import {listCustomerAction} from '../../../redux/actions/customer_actions';
import { ExportCsv, ExportPdf } from '@material-table/exporters';
import {Helmet} from "react-helmet-async";
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500 } from 'utils/pageSize';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CommonSearch from 'utils/commonSearch';
import apiCalls from 'utils/apiCalls';
import { commonDateFormat } from 'utils/getTimeFormat';
import { titleURL } from 'http-common';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getsessionStorage } from 'pages/common/login/cookies';


function ManualSchemes() {
    const [open,setOpen] = useState(false)
  const [searchData, setSearchData] = useState({
      page: 0,
      searchVal: '',
      searchPageData: [],
      pageSize: 20,
      searchData: [],
    
    }
  )
  
  const [isApiFinished, setIsApiFinished] = useState(false)

    const {manualSchemesReducer:{manualSchemes,createStatus,searchManualSchemesData,searchManualSchemesCount},customerReducer:{customer},rbacReducer: { menuAccess }} = useSelector(state => state)
    const dispatch = useDispatch();
    const {
        commoncookie,
        setModalTypeHandler,
        setLoaderStatusHandler,
        headerLocationId,
      } = useContext(context);
  const storage = getsessionStorage();

  const callListManualSchemesAction = () => {
    const body = {
      searchString:'',
      employeeId:commoncookie,
      headerLocationId: headerLocationId,
      pageCount:0,
      numPerPage: searchData.pageSize,
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(manualSchemePaginationAction(
        body,
        setModalTypeHandler,
        setLoaderStatusHandler))
    )
    }
    useEffect(() => {
        dispatch(set_searchManualSchemesAction({data:[], numRows:0}));
        const body = {
          searchString:'',
          employeeId:commoncookie,
          headerLocationId: headerLocationId,
          pageCount:0,
          numPerPage: searchData.pageSize,
        }
      // apiCalls(
      //   setModalTypeHandler,
      //   setLoaderStatusHandler,
      //   dispatch(manualSchemePaginationAction(
      //     body,
      //     setModalTypeHandler,
      //     setLoaderStatusHandler)))
        // if (!customer.length) {
        //     dispatch(listCustomerAction(setModalTypeHandler, setLoaderStatusHandler));
        // }
    }, [])
  
  useEffect(() => {
    
    const body = {
      pageCount: searchData.page,
      numPerPage:searchData.pageSize,
      searchString:searchData.searchVal,
      employeeId:commoncookie,
      headerLocationId:headerLocationId
    }
    
    apiCalls(
    setModalTypeHandler,
    setLoaderStatusHandler,
    dispatch(manualSchemePaginationAction(
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
      ))
    ).finally(() => setIsApiFinished(true))
  }, [searchData.page,searchData.pageSize])
  
 const selectedRole = storage.role_name
  useEffect(() => {
    if (!selectedRole) return;
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler, dispatch(getMenuAccessAction(selectedRole)));
  }, [selectedRole, dispatch]);

  const manualSchemeCreate = UserRightsAuthorization(menuAccess[selectedRole], 'schemes__manual_schemes', 'can_create') 
  const manualSchemeExport =UserRightsAuthorization(menuAccess[selectedRole], 'schemes__manual_schemes', 'can_export')
  //
  // useEffect(() => {
    
  //   const body = {
  //     pageCount: searchData.page,
  //     numPerPage: searchData.pageSize,
  //     searchString:searchData.searchVal,
  //     employeeId:commoncookie,
  //     headerLocationId:headerLocationId
  //   }

  //   apiCalls(
  //     setModalTypeHandler,
  //     setLoaderStatusHandler,
  //     dispatch(manualSchemePaginationAction(
  //       body,
  //       setModalTypeHandler,
  //       setLoaderStatusHandler
  //     ))
  //   )
  // },[searchData.pageSize])

    useEffect(() => {
        if (createStatus > 0) {
           apiCalls( callListManualSchemesAction())
            handleClose()
        }

    }, [createStatus])

    const handleClose = () => {
        setOpen(false)
    }

    const handleSubmit = (data) => {
        let postData = { ...data, employee_id: commoncookie }

      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(createManualSchemesAction(
          postData,
          setModalTypeHandler,
          setLoaderStatusHandler)))
      
         handleClose()
      
    }

    const requestSearch = (e) => {
      // const context = props.context;
      let val = e.target.value;
      setSearchData({...searchData, searchVal: val});
  
      // if(val.trim() !== ''){
        dispatch(set_searchManualSchemesAction({data:[], numRows:0}))
      // }
      const body = {
        searchString:val,
        employeeId:commoncookie,
        headerLocationId: headerLocationId,
        pageCount:0,
        numPerPage: searchData.pageSize,
      }
      dispatch(get_searchManualSchemesAction(body,setModalTypeHandler,setLoaderStatusHandler,))
      
  };
  
  const handlePageSizeChange = async (size) => {
    setSearchData({
      ...searchData, 
      pageSize: size
      
    })
    

  }
  const handlePageChange = async (page) => {
    setSearchData({
      ...searchData, 
      page,
    })
    // setSearchData({
    //   page:page
    // })
    
  }
  
  const cancelSearch = (e) => {
      setSearchData({
        ...searchData, 
        searchVal:'',
        page :0,
      })
    //   setSearchData({...searchData, searchPageData: [], page: 0, searchVal: ''});
    // dispatch(set_searchManualSchemesAction({ data: [], numRows: 0 }))
    const body = {
      searchString:'',
      employeeId:commoncookie,
      headerLocationId: headerLocationId,
      pageCount:0,
      numPerPage: searchData.pageSize,
    }

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,

      dispatch(
        manualSchemePaginationAction(
          body,
          setModalTypeHandler,
          setLoaderStatusHandler
        )
      ))
    

  };
  
  return (
    <div>
       <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | Manual Schemes  </title>
      </Helmet>
        {open === false && (
          <MaterialTable
          totalCount={searchManualSchemesCount}
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
            //   {
            //     icon: 'edit',
            //     tooltip: 'edit',
            //     position: 'row',
            //     onClick: (event, rowData) => this.handleEdit(rowData.id),
            //   },
            //   {
            //     icon: 'delete',
            //     tooltip: 'Delete',
            //     onClick: (event, rowData) => this.handledialog(rowData.id),
            //   },
              manualSchemeCreate ?{
                icon: 'add',
                tooltip: 'add',
                isFreeAction: true,
                onClick: (event, rowData) =>
                setOpen(true),
              } : null,
          ]}
          page={searchData.page}
          onPageChange={(page) => handlePageChange(page)}
          onRowsPerPageChange={(size) =>handlePageSizeChange(size)}

          options={{
            showEmptyDataSourceMessage: isApiFinished,
              headerStyle,
              cellStyle,
              // fixedColumns: {
              //   left: 2,
              //   right: 0
              // },
              search: false,
              exportButton:manualSchemeExport ? true : false,
              filtering: false,
              actionsColumnIndex: -1,
              maxBodyHeight: maxHeight,
              pageSize: 20,
              pageSizeOptions: [20, 50, 100],
              exportMenu: manualSchemeExport ? [
                {
                  label: 'Export PDF',
                  exportFunc: (cols, datas) =>
                  {
                    this.props.listSchemesAction( 
                      ()=>{},
                      ()=>{},
                   (exportData) => {
                     ExportPdf(
                       cols,
                       exportData,
                       'SchemesData',
                     );
                   },
                 );
                 }
                },
                {
                  label: 'Export CSV',
                  exportFunc: (cols, datas) =>
                  {
                    this.props.listSchemesAction( 
                      ()=>{},
                      ()=>{},
                   (exportData) => {
                     ExportCsv(
                       cols,
                       exportData,
                       'SchemesData',
                     );
                   },
                 );
                 }
                },
              ] : [],
          }}
          // columns={
          //   this.props.schemes ? this.props.schemes.map((t) => {
          //     const { tableData, products, schemeId, ...record } = t;
          //     return Object.keys(record).map((o) => {
          //       return { title: o, field: o }
          //     })
          //   })[0] : []

          // }
          columns={[
            { title: 'Scheme name', field: 'scheme_name' },
            {
              title: 'Amount', field: 'scheme_amount', cellStyle: {
                textAlign: 'right',
                fontSize: cellStyle.fontSize,
                paddingRight: '130px'
              },
            },
            { title: 'Type', field: 'note_type' },
            { title: 'Adjusted', field: 'adjusted' },
            { title: 'Reference', field: 'reference' },
            {
              title: 'Date',
              field: 'created_at',
              render: (rowData) => (
                commonDateFormat(rowData.created_at)
              )
            },
          ]}
          // data={
          //     manualSchemes
          //     ? manualSchemes.map((r) => {
          //         const {tableData, products, ...record} = r;
          //         return {...record};
          //       })
          //     : []
          // }
          data={searchManualSchemesData}
            title={
            <Typography variant='h6' align='left'  style={{ paddingTop: '10px', paddingBottom: '10px' }}>
              Manual Schemes
              </Typography>}
          />
        )}
        {open&& <NewManualSchemes handleSubmit={handleSubmit} handleClose={handleClose}/>}
    </div>
  )
}

export default ManualSchemes;
