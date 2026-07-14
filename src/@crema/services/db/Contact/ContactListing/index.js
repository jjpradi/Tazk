import React, {useEffect, useState, useContext, useRef, useCallback } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Navigate, useLocation} from 'react-router-dom';
import {
  onDeleteContacts,
  onGetContactList,
  onUpdateStarredStatus,
} from '../../../../../redux/actions/ContactApp';
import ContactHeader from './ContactHeader';
import AppConfirmDialog from '@crema/core/AppConfirmDialog';
import IntlMessages from '@crema/utility/IntlMessages';
import CreateContact from '../CreateContact';
import {Box, Grid, Typography, useMediaQuery} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ContactView from './ContactView';
import ContactDetail from '../ContactDetail';
import AppsPagination from '@crema/core/AppsPagination';
import AppsHeader from '@crema/core/AppsContainer/AppsHeader';
import AppsContent from '@crema/core/AppsContainer/AppsContent';
import AppsFooter from '@crema/core/AppsContainer/AppsFooter';
import {
  listCustomerAction,
  FilterAction,
  updateCustomerAction,
  deleteCustomerAction,
  createCustomerAction,
  listCustomerStatementAction,
  StaredUpdateAction,
  get_searchContactsAction,
  set_searchContactsAction,
  get_searchContactsActionFinal
} from '../../../../../redux/actions/customer_actions';
import NewCustomer from 'components/NewCustomer';
import context from '../../../../../context/CreateNewButtonContext'
import {listTaxAction} from '../../../../../redux/actions/tax_actions';
import {listTaxCategoryAction} from '../../../../../redux/actions/tax_Category_actions';

import CreateNewButtonContext from '../../../../../context/CreateNewButtonContext';
import {listTaxCodesAction} from '../../../../../redux/actions/taxcodes_actions';
import {
  updateVendorAction,
  createVendorAction,
  deleteVendorAction,
} from '../../../../../redux/actions/vendor_actions';
import {
  createDiscountTypeAction,
  listDiscountTypeAction,
} from '../../../../../redux/actions/discountType_actions';
import {listUserCreationAction} from '../../../../../redux/actions/userCreation_actions';
import PointofsaleCustomer from 'components/Pointofsalecustomer';
import {getByIdMailConfigurationAction} from '../../../../../redux/actions/configuration_actions';
import apiCalls from 'utils/apiCalls';
import { Pageview } from '@mui/icons-material';
import { getsessionStorage } from 'pages/common/login/cookies';
import { searchErrorMessage } from 'utils/content';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';



const customer_filtering = (props) => {
  const dispatch = useDispatch();
  const {pathname} = useLocation();
  const storage = getsessionStorage()
  // const [newform, setNewform] = useState(false)
  // const [type, setType] = useState(0)
  // const [type_details, setType_details] = useState('customer')
  // const [newcustomer_type, setNewcustomer_type] = useState('type-1')
  const [status, setStatus] = useState('create')
  const [deleteid, setDeleteid] = useState(null)
  const [tabledata, setTabledata] = useState([])
  const [tablefiltervalue, SettableFilter] = useState([])


  const {
    setLoaderStatusHandler,
    setModalStatusHandler,
    setselectData,
    setModalTypeHandler,
    commoncookie,
    headerLocationId,
  } = useContext(context);



  const  {
    customerReducer: { customer_filter, customer_id_data, customer_type,customer_paginate,customer_paginateCount }, taxReducer:{tax}, taxCategoryReducer:{taxcategory}, taxCodeReducer:{taxcodes},
    discountTypeReducer:{discount_type_list}, UserCreationReducer:{createUser}, ConfigurationReducer:{mail_configuration},
    roleReducer: { user_rights }
  } = useSelector((state) => state);

  // useEffect(() => {
  //   const body = {
  //     searchString: filterText.toString().toLowerCase().trim(),
  //     type_details: props.type_details,
  //     type: props.type,
  //     pageCount: 0,
  //     numPerPage: 15,
  //   }
  //   apiCalls(
  //     setModalTypeHandler,
  //     setLoaderStatusHandler,
  //     !createUser.length && dispatch(listUserCreationAction()),
  //     // dispatch(FilterAction( props.type, props.type_details, setModalTypeHandler, setLoaderStatusHandler,()=>{})),
  //     dispatch(get_searchContactsActionFinal(body, setModalTypeHandler, setLoaderStatusHandler)),
  //     );
  //     setPage(0)
  // }, [props.type])

// const customer_filter = useSelector(({contactApp}) => contactApp.customer_filter);


  // const customer_filter = customer_filter

  const totalContacts = useSelector(({contactApp}) => contactApp.totalContacts);

  const [filterText, onSetFilterText] = useState('');

  // const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [pageView, setPageView] = useState('list');
  const [list, setList] = useState([]);
  const didMountRef = useRef(false);

  const [statusid, setStatusid ] = useState(0);
const [totalcount, settotalcount] = useState(0)


  // const [checkedContacts, setCheckedContacts] = useState([]);

  // const [toDeleteContacts, setToDeleteContacts] = useState([]);

  const [sortConfig, setSortConfig] = useState({ key: '', order: 'desc' });

  const [isAddContact, onSetIsAddContact] = useState(false);

  const [isShowDetail, onShowDetail] = useState(false);
  const loading = useSelector(({common}) => common.loading);

  useEffect(() => {
    onSetFilterText('')
  }, [props.type])

  useEffect(() => {
    if (didMountRef.current) {
      props.setPage(0);
    } else {
      didMountRef.current = true;
    }
  }, [props.type]);


  useEffect(() => {
  //  const path = pathname.split('/');
    // dispatch(
    //   onGetContactList(path[path.length - 2], path[path.length - 1], page),
    // );
    const paginatedData = customer_paginate
    setTabledata(paginatedData)
    setList(paginatedData)

  }, [customer_paginate, pageView, props.page]);

  function paginate(array, page_size, page_number) {
    // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
    return array?.slice(page_number * page_size, page_number * page_size + page_size);

  }

  const handleAddContactOpen = () => {
    // onSetIsAddContact(true);
    props.setNewform(true)

  };

  const handleAddContactClose = () => {
    onSetIsAddContact(false);
  };


  const cancelSearch = () => {
    onSetFilterText('')
     props.setSearchStringFromChild('');
    dispatch(set_searchContactsAction({ data: [], numRows: 0 }))
    props.setPage(0);
    props.setIsApiFinished(false)
    const body = {
      searchString: '',
      type_details: props.type_details,
      type: props.type,
      pageCount: 0,
      numPerPage: rowsPerPage,
      location_id: props.filteredValue.location.length === 1 && props.filteredValue.location[0] === '' ? 'null' : props.filteredValue.location,
      department_id: props.filteredValue.department.length === 1 && props.filteredValue.department[0] === '' ? 'null' : props.filteredValue.department,
      sortKey: sortConfig.key,
      sortOrder: sortConfig.order,
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(get_searchContactsActionFinal(body, setModalTypeHandler, setLoaderStatusHandler)),(response) => {
        props.setIsApiFinished(true)
      }
    );
  };

  const handleSort = (columnKey) => {
    if (columnKey === 'starred' || columnKey === 'action') return;
    const newOrder = sortConfig.key === columnKey && sortConfig.order === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key: columnKey, order: newOrder });
    props.setPage(0);
    const body = {
      searchString: filterText.toString().toLowerCase().trim(),
      type_details: props.type_details,
      type: props.type,
      pageCount: 0,
      numPerPage: rowsPerPage,
      location_id: props.filteredValue.location.length === 1 && props.filteredValue.location[0] === '' ? 'null' : props.filteredValue.location,
      department_id: props.filteredValue.department.length === 1 && props.filteredValue.department[0] === '' ? 'null' : props.filteredValue.department,
      sortKey: columnKey,
      sortOrder: newOrder,
    };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(get_searchContactsActionFinal(body, setModalTypeHandler, setLoaderStatusHandler)),
    );
  };

  const requestSearch = (val) => {
    // const context = props.context;
    onSetFilterText(val);
    props.setSearchStringFromChild(val);

    // if(val.trim() !== ''){
      if(val.length >= 3 || val.length === 0) {
        dispatch(set_searchContactsAction({ data: [], numRows: 0 }))
        props.setPage(0);
        props.setIsApiFinished(false)
      }
    const body = {
      searchString: val,
      type_details: props.type_details,
      type: props.type,
      pageCount: 0,
      numPerPage: rowsPerPage,
      location_id: props.filteredValue.location.length === 1 && props.filteredValue.location[0] === '' ? 'null' : props.filteredValue.location,
      department_id: props.filteredValue.department.length === 1 && props.filteredValue.department[0] === '' ? 'null' : props.filteredValue.department,
      sortKey: sortConfig.key,
      sortOrder: sortConfig.order,
    }
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(get_searchContactsAction(body, setModalTypeHandler, setLoaderStatusHandler, (response) => {
          setTabledata(response.data)
          setList(response.data)
          props.setIsApiFinished(true)
        }))
      );

  };



  const contFunc = (contact) => {

    let result = ''

    if (customer_paginate[0]?.customer_id) {
      // result = 'Customer'

      return customer_paginate.findIndex((i) =>
        i.customer_id === contact.customer_id
      )
    }

    if (customer_paginate[0]?.supplier_id) {

      // result = 'Supplier'

      return customer_paginate.findIndex((i) =>
        i.supplier_id === contact.supplier_id
      )
    }

    if (!(customer_paginate[0]?.supplier_id) && !(customer_paginate[0]?.customer_id)) {
      // result = 'Employee'

      return customer_paginate.findIndex((i) =>
        i.person_id === contact.person_id
      )
    }

    return -1

  }


  const onViewContactDetail = (contact) => {
    // if(props.type === 4){ //props.type ===3 || 
    //   alert('No Detail Available')
    // }else{

    props.setSelectedContact(contact);
    let viewvalue =   contFunc(contact)
    props.setRowIndex(viewvalue);
    // onShowDetail(true);
    // alert('hiiiii')
    props.setOnrowclick(true)
    // }
  };

  const onPageChange = (event, value) => {
    props.setPage(value);
    const body = {
      searchString:filterText.toString().toLowerCase().trim(),
      type_details: props.type_details,
      type : props.type,
      pageCount: value,
      numPerPage: rowsPerPage,
      location_id: props.filteredValue.location.length === 1 && props.filteredValue.location[0] === '' ? 'null' : props.filteredValue.location,
      department_id: props.filteredValue.department.length === 1 && props.filteredValue.department[0] === '' ? 'null' : props.filteredValue.department,
      sortKey: sortConfig.key,
      sortOrder: sortConfig.order,
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(get_searchContactsActionFinal(body, setModalTypeHandler, setLoaderStatusHandler)),
    );

  };

  const onRowsPerPageChange = (event) => {
    const value = parseInt(event.target.value, 10);
    setRowsPerPage(value);
    props.setPage(0);

    const body = {
      searchString: filterText.toString().toLowerCase().trim(),
      type_details: props.type_details,
      type: props.type,
      pageCount: 0,
      numPerPage: value,
      location_id: props.filteredValue.location.length === 1 && props.filteredValue.location[0] === '' ? 'null' : props.filteredValue.location,
      department_id: props.filteredValue.department.length === 1 && props.filteredValue.department[0] === '' ? 'null' : props.filteredValue.department,
      sortKey: sortConfig.key,
      sortOrder: sortConfig.order,
    };

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(get_searchContactsActionFinal(body, setModalTypeHandler, setLoaderStatusHandler)),
    );
  };

  const onChangePageView = (view) => {
    setPageView(view);
  };

  const onChangeCheckedContacts = (event, id) => {
    if(props.type ===3 || props.type === 4){
      alert('No Checkbox Allocation')
    }else{
    if (event.target.checked) {
      props.setCheckedContacts(props.checkedContacts.concat(id));
    } else {
      props.setCheckedContacts(
        props.checkedContacts.filter((contactId) => contactId !== id),
      );
    }
  }
  };

  const onChangeStarred = (status, contact) => {

    //if(status === true){
      // setStatusid(1)
      const body = {
        searchString:filterText.toString().toLowerCase().trim(),
        type_details: props.type_details,
        type : props.type,
        pageCount: props.page,
        numPerPage: rowsPerPage,
        sortKey: sortConfig.key,
        sortOrder: sortConfig.order,
      }
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(StaredUpdateAction(1, contact.person_id, setModalTypeHandler, setLoaderStatusHandler)),
        // dispatch(FilterAction( props.type, props.type_details, setModalTypeHandler, setLoaderStatusHandler,()=>{}))
        dispatch(get_searchContactsActionFinal(body, setModalTypeHandler, setLoaderStatusHandler)),

      );
    //}
    // else{
    //   const body = {
    //     searchString:filterText.toString().toLowerCase().trim(),
    //     type_details: props.type_details,
    //     type : props.type,
    //     pageCount: props.page,
    //     numPerPage: rowsPerPage,
    //     sortKey: sortConfig.key,
    //     sortOrder: sortConfig.order,
    //   }
    //   apiCalls(
    //     setModalTypeHandler,
    //     setLoaderStatusHandler,
    //     dispatch(StaredUpdateAction(0, contact.person_id, setModalTypeHandler, setLoaderStatusHandler)),
    //     // dispatch(FilterAction( props.type, props.type_details, setModalTypeHandler, setLoaderStatusHandler,()=>{})),
    //     dispatch(get_searchContactsActionFinal(body, setModalTypeHandler, setLoaderStatusHandler)),
    //   );
    // }

  };
  const onUpdateContact = (contact) => {
    props.setSelectedContact(contact);
    handleAddContactClose();
  };


  const commonHeaderName = 'Customer Management';
  const isMDDown = useMediaQuery((theme) => theme.breakpoints.up('md'));
  const canShowPhone = storage.company_type === 5 ? getRoleAuthorization(user_rights, 'Show MobileNumber') : true;

  const getColumnsByCompanyType = (companyType, type) => {
    if(companyType === 12) {
      type = 5
    }
    console.log(companyType, type, 'extracompantype2')
    const starred = [ { key: 'starred', label: '', width: 1 } ];
    const name = [
      { key: 'company_name', label: 'Name', width: 2 },
    ];
  const phone = canShowPhone
    ? [{ key: 'phone_number', label: 'Contact', width: 2 }]
    : [];

    if (type === 3) {
      return [
        ...starred,
         { key: 'employee_code', label: 'Code', width: 1 },
        ...name,
        ...phone,
        { key: 'role_name', label: 'Role', width: 2 },
        { key: 'department', label: 'Department', width: 2 },
        { key: 'designation', label: 'Designation', width: 2 },
        { key: 'category_name', label: 'Category', width: 2 },
        { key: 'action', label: '', width: 1 }, 
      ];
    }

    if (type === 0) {
      return [
        ...starred,
        ...name,
        ...phone,
        { key: 'email', label: 'Email', width: 2 },
        { key: 'area', label: 'Area', width: 2 },
      ];
    }

    //  case: company_type === 3 and type === 1 or 2
    if ((companyType === 3 || companyType === 2) && (type === 1 || type === 2)) {
      return [
        ...starred,
        ...name,
        { key: 'primary_contact_person', label: 'Contact Person', width: 2 },
        ...phone,
        { key: 'area', label: 'Area', width: 2 },
      ];
    }

    // Base fields for most company types
    const base = [
      ...starred,
       { key: 'employee_code', label: 'Code', width: 1 },
      ...name,
      ...phone,
    ];
console.log(...base, companyType, 'extracompantype1')
    // Additional fields
    const extraByCompany = {
      12: [ { key: 'client_code', label: 'Client Code', width: 2 } ],
      5: [
        { key: 'role_name', label: 'Role', width: 2 },
        { key: 'department', label: 'Department', width: 2 },
        { key: 'designation', label: 'Designation', width: 2 },
        { key: 'category_name', label: 'Category', width: 2 },
      ],
      3: [
        { key: 'role_name', label: 'Role', width: 2 },
      ],
      10: [ { key: 'designation', label: 'Designation', width: 2 } ],
      2: type !== 2 && type !== 3 ? [ { key: 'designation', label: 'Designation', width: 2 } ] : [],
    };
  console.log( base, extraByCompany, companyType, 'extracompantype')

    return [ ...base, ...(extraByCompany[ companyType ] || []) ];
  };
  const columns = getColumnsByCompanyType(storage.company_type, props.type);
  const columnCount = columns.length;

  const getFlexBasis = (col) => {
    if (col.key === 'starred') return '40px';
    if (col.key === 'company_name') return '22%';
    return `${Math.min(col.width * 8, 18)}%`;
  };

  const getGridTemplateColumns = (columns) => {
    const STARRED_WIDTH = 40;
    const ACTION_WIDTH = 50; 

    const totalRelativeWidth = columns
      .filter((col) => col.key !== 'starred' && col.key !== 'action')
      .reduce((acc, col) => acc + col.width, 0);

    return columns
      .map((col) => {
        if (col.key === 'starred') return `${STARRED_WIDTH}px`;
        if (col.key === 'action') return `${ACTION_WIDTH}px`;
        const percent = (col.width / totalRelativeWidth) * 100;
        return `minmax(80px, ${percent.toFixed(2)}%)`;
      })
      .join(' ');
  };



  return (
    <>
      <AppsHeader>
        <ContactHeader
          checkedContacts={props.checkedContacts}
          setCheckedContacts={props.setCheckedContacts}
          filterText={filterText}
          onSelectContactsForDelete={props.onSelectContactsForDelete}
          onSetFilterText={onSetFilterText}
          onPageChange={onPageChange}
          page={props.page}
          onChangePageView={onChangePageView}
          pageView={pageView}
          tabledata={tabledata}
          headerLocationId={headerLocationId}
          Bulkinsert={props.Bulkinsert}
          type={props.type}
          userBulkinsert={props.userBulkinsert}
          customer_paginate={customer_paginate}
          customer_paginateCount={customer_paginateCount}
          cancelSearch={cancelSearch}
          requestSearch={requestSearch}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          handleFilterApply={props.handleFilterApply}
          filteredValue={props.filteredValue} 
          setFilteredValue={props.setFilteredValue}
          handleFilterClear={props.handleFilterClear}
        />
      </AppsHeader>
{pageView === 'list' && (
  <AppsHeader>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: getGridTemplateColumns(columns),
              gap: 2,
              px: 2,
              py: 1.5,
              width: '100%',
              whiteSpace: 'nowrap',
            }}
          >
            {columns.map((col) => (
              <Typography
                key={col.key}
                className="table-title"
                onClick={() => handleSort(col.key)}
                sx={{
                  fontWeight: 500,
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textAlign: 'left',
                  cursor: col.key !== 'starred' && col.key !== 'action' ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  userSelect: 'none',
                }}
              >
                {col.label}
                {col.key !== 'starred' && col.key !== 'action' && sortConfig.key === col.key ? (
                  sortConfig.order === 'asc' ? (
                    <ArrowUpwardIcon sx={{ fontSize: 14 }} />
                  ) : (
                    <ArrowDownwardIcon sx={{ fontSize: 14 }} />
                  )
                ) : null}
              </Typography>
            ))}
          </Box>

  </AppsHeader>
)}

      <AppsContent>
        <ContactView
          list={list}
          loading={loading}
          pageView={pageView}
          handleAddContactOpen={handleAddContactOpen}
          onChangeCheckedContacts={onChangeCheckedContacts}
          onChangeStarred={onChangeStarred}
          checkedContacts={props.checkedContacts}
          onSelectContactsForDelete={props.onSelectContactsForDelete}
          onViewContactDetail={onViewContactDetail}
          onOpenEditContact={props.onOpenEditContact}
          type={props.type}
          SetStaredDel={props.SetStaredDel}
          tabledata={tablefiltervalue}
          isApiFinished={props.isApiFinished}
        />
      </AppsContent>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {customer_paginate && customer_paginate.length > 0 ? (
          <AppsFooter>
            <AppsPagination
              count={totalContacts}
              page={props.page}
              onPageChange={onPageChange}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[20, 50, 100]}
              onRowsPerPageChange={onRowsPerPageChange}
            />
          </AppsFooter>
        ) : null}
      </Box>
      {/* <AppsPagination
              count={totalContacts}
              page={page}
              onPageChange={onPageChange}
            /> */}

      <CreateContact
        isAddContact={isAddContact}
        handleAddContactClose={handleAddContactClose}
        selectContact={props.selectedContact}
        onUpdateContact={onUpdateContact}
      />

      <ContactDetail
        selectedContact={props.selectedContact}
        isShowDetail={isShowDetail}
        onShowDetail={onShowDetail}
        onSelectContactsForDelete={props.onSelectContactsForDelete}
        onOpenEditContact={props.onOpenEditContact}
        type={props.type}
      />
    </>
  );
};

export default customer_filtering;
 