import React, {useContext, useEffect, useState} from 'react';
import NewVendorPriceList from './newVendorPriceList';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import {headerStyle, cellStyle, maxBodyHeight, pageSize} from 'utils/pageSize';
import {Typography,TablePagination} from '@mui/material';
import {useDispatch, useSelector} from 'react-redux';
import {listVendorIdAndNameAction, vendorPriceListAction} from 'redux/actions/vendor_actions';
import context from '../../../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import CommonSearch from 'utils/commonSearch';
import ViewDialog from './viewDialog';
import {setISODay} from 'date-fns';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {Helmet} from 'react-helmet-async';
import { GetAllProductBrand } from 'redux/actions/product_actions';
import {useCustomFetch} from 'utils/useCustomFetch';
import { titleURL } from 'http-common';
import API_URLS from '../../../utils/customFetchApiUrls';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { searchErrorMessage } from 'utils/content';
import  "../../../index.css";
  import {
    getStickyTableOptions,
    stickyTableComponents,
  } from 'utils/stickyTableLayout';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';


// import { MTablePagination } from '@material-table/core';

function VendorPriceList() {
  const dispatch = useDispatch();
  const customFetch = useCustomFetch();

  const {
    vendorReducer: {vendorPriceList, vendorIdAndName: vendor},
    productReducer: {
      product_all_brand, 
    },    rbacReducer: { menuAccess } 
  } = useSelector((state) => state);

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
    selectData,
    setselectData,
  } = useContext(context);

  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState({});
  const [searchData, setSearchData] = useState({
    pageNum: 0,
    searchVal: '',
    rowsPerPage: pageSize,
  });
  const [status, setStatus] = useState('create')
  const [edit_id_data, setEdit_id_data] = useState([])
  const [isApiFinished, setIsApiFinished] = useState(false);
  const [datas, setDatas] = useState([])
  const sessionStorage = getsessionStorage()

  useEffect(() => {
    setIsApiFinished(false);
    let data = {
      searchString: '',
      pageNum: 0,
      rowsPerPage: 20,
    };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(vendorPriceListAction(data)),
      !vendor.length && dispatch(listVendorIdAndNameAction()),
      !product_all_brand.length &&
      dispatch(
        GetAllProductBrand(setModalTypeHandler, setLoaderStatusHandler),
      ),
    ).finally(() => setIsApiFinished(true));
  }, [searchData.pageNum, searchData.rowsPerPage]);

   const selectedRole = sessionStorage.role_name
    useEffect(() => {
      if (!selectedRole) return;
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler, dispatch(getMenuAccessAction(selectedRole)));
    }, [selectedRole, dispatch]);
  
    const priceListCreate =UserRightsAuthorization(menuAccess[selectedRole], 'purchases__vendor_price_list', 'can_create') ;
    const priceListEdit = UserRightsAuthorization(menuAccess[selectedRole], 'purchases__vendor_price_list', 'can_edit') ;
    const priceListDelete =  UserRightsAuthorization(menuAccess[selectedRole], 'purchases__vendor_price_list', 'can_delete');
    const priceListView =  UserRightsAuthorization(menuAccess[selectedRole], 'purchases__vendor_price_list', 'can_view') ;



  const handlePageSizeChange = async (size) => {
    setSearchData({
      ...searchData,
      rowsPerPage: size,
    });
  };
  const handlePageChange = async (page) => {
    setSearchData({
      ...searchData,
      pageNum: page,
    });
  };

  const handleOpen = () => {
    setOpen(true);
    setStatus('create');
    setEdit_id_data({})
  };

  const handleEdit = async (rowData) => {
    

    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   this.props.getbyidStockLocationAction(
    //     id,
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //   )
	  // );
     setEdit_id_data(rowData)
     setStatus('edit'); 
      let body = {
        priceId: rowData.id,
      };
    const { data: productData } = await customFetch(
      API_URLS.SUPPLIER_PRICE_LIST_VIEW,
      'POST',
      body
    );
      await setDatas(productData);
      await setOpen(true);
      
     
      
  };
console.log('datas', datas)

  // useEffect(()=>{
  //   if(datas?.length){
  //     setOpen(true);
  //     setStatus('edit');    
  //   }
  // },[datas?.length])

  const handleClose = () => {
    setOpen(false);
  };

  const handleViewOpen = (rowData) => {
    setViewData(rowData);
    setViewOpen(true);
  };

  const handleViewClose = () => {
    setViewOpen(false);
  };

  useEffect(() => {
    let timer;
    if (searchData.searchVal) {
      // Set a timer for 3 seconds after the user stops typing
      timer = setTimeout(() => {
        const data = {
          searchString: searchData.searchVal,
          pageNum: 0,
          rowsPerPage: searchData.rowsPerPage,
        };

        if(searchData.searchVal.length >= 3 || searchData.searchVal.length === 0) {
          apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(vendorPriceListAction(data)),
          ).finally(() => setIsApiFinished(true));
        }
        else {
          dispatch(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
          setIsApiFinished(true)
        }
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [searchData.searchVal]);

  const requestSearch = (e) => {
    setIsApiFinished(false);
    let val = e.target.value;
    setSearchData({...searchData, searchVal: val});
  };

  const cancelSearch = (e) => {
    setIsApiFinished(false);
    setSearchData({
      ...searchData,
      searchVal: '',
      pageNum: 0,
    });

    const data = {
      searchString: '',
      pageNum: 0,
      rowsPerPage: searchData.rowsPerPage,
    };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(vendorPriceListAction(data)),
    ).finally(() => setIsApiFinished(true));
  };

  return (
    <React.Fragment>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Vendor Price List </title>
      </Helmet>
      {open  && (
        <NewVendorPriceList
          handleClose={handleClose}
          selectData={selectData}
          setselectData={setselectData}
          status = {status}
          edit_id_data = {status === 'create' ? {} : edit_id_data}
          datas = {status === 'create' ? [] : datas}
        />
      )}
      
      

      {open === false && (
        <>
          {viewOpen && (
            <ViewDialog
              open={viewOpen}
              handleClose={handleViewClose}
              viewData={viewData}
            />
          )}
          <MaterialTable
            totalCount={vendorPriceList.numRows}
            style={{height: 'calc(100vh - 80px)', overflow:'hidden'}}
            components={{
              ...stickyTableComponents,
               Pagination: (props) => (
               <div
               style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                padding: "8px 16px",
                 }}>
                 <TablePagination
                 {...props}
                 count={vendorPriceList.numRows} 
                  page={searchData.pageNum}
                  rowsPerPage={20}
                  onPageChange={(event, page) => handlePageChange(page)}
                 onRowsPerPageChange={(event) => handlePageSizeChange(Number(event.target.value))}/>
                 </div>),
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
                    </div>
                    <div></div>
                  </div>
                </>
              ),
            }}
            actions={[
              priceListCreate ? {
                icon: 'add',
                tooltip: 'Add',
                isFreeAction: true,
                onClick: () => handleOpen(),
              } : null,
             priceListEdit ? {
                icon: 'edit',
                tooltip: 'edit',
                position: 'row',
                onClick: (event, rowData) =>
                  handleEdit(rowData),
              } : null,
             priceListView ? {
                icon: () => <VisibilityIcon color='primary' />,
                tooltip: 'View',
                onClick: (event, rowData) => handleViewOpen(rowData),
              } : null,
            ]}
            page={searchData.pageNum}
            onPageChange={(page) => handlePageChange(page)}
            onRowsPerPageChange={(size) => handlePageSizeChange(size)}
            options={getStickyTableOptions({
              headerStyle,
              bodyOffset: 200,
              cellStyle,
              options:{
                 exportButton: true,
              search: false,
              filtering: false,
              actionsColumnIndex: -1,
              pageSize: 20,
              pageSizeOptions: [20, 50, 100],
               tableLayout: "auto",
                toolbar: true,
              },
            })}
            columns={[
              {title: 'Vendor', field: 'name'},
              {title: 'From', field: 'from_date'},
              {title: 'To', field: 'to_date'},
              {
                title: 'Brand',
                field: 'brand',
              },
              {
                title: 'Category',
                field: 'category',
                render: (rowData) => {
                  let jsonArray = JSON.parse(rowData.category);
                  let categoryNames = jsonArray
                    .map((item) => item.category)
                    .join(', ');
                  return categoryNames;
                },
              },
              {title: 'Note', field: 'note'},
              {title: 'CreatedAt', field : 'createdAt'}
            ]}
            data={vendorPriceList.data}
            title={<Typography variant='h6'>{'Vendor Price List'}</Typography>}
          />
        </>
      )}
    </React.Fragment>
  );
}

export default VendorPriceList;

