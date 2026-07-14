import React, {useEffect, useState, useContext} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  onGetFolderList,
  onGetLabelList,
} from '../../../../../src/redux/actions/ContactApp';
import ContactListing from './ContactListing';
import {useIntl} from 'react-intl';
import AppsContainer from '../../../core/AppsContainer';
import SideBarContent from './ContactSideBar';
import {
  listCustomerAction,
  FilterAction,
  updateCustomerAction,
  deleteCustomerAction,
  createCustomerAction,
  listCustomerStatementAction,
  StaredDetailsAction,
  bulkCustomercreate,
  get_searchContactsActionFinal,
  employeeDeleteAction,
  getUpdatedFollowersList,
  SalesmaninsertAction,
  ListsalesmanAction,
  clientDeleteAction,
} from '../../../../redux/actions/customer_actions';
import NewCustomer from 'components/NewCustomer';
import context from '../../../../context/CreateNewButtonContext'
import {listTaxAction} from '../../../../redux/actions/tax_actions';
import {listTaxCategoryAction} from '../../../../redux/actions/tax_Category_actions';

import CreateNewButtonContext from '../../../../context/CreateNewButtonContext';
import {listTaxCodesAction} from '../../../../redux/actions/taxcodes_actions';
import {
  updateVendorAction,
  createVendorAction,
  deleteVendorAction,
  bulkSupplierCreate
} from '../../../../redux/actions/vendor_actions';

import {
  bulkcreateUserCreationAction,
  bulkcreateClientUserCreationAction
} from '../../../../redux/actions/userCreation_actions';
import {
  createDiscountTypeAction,
  listDiscountTypeAction,
} from '../../../../redux/actions/discountType_actions';
import {listUserCreationAction} from '../../../../redux/actions/userCreation_actions';
import App from 'components/customer_erpDesign/index';
import { set } from 'date-fns';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import AppConfirmDialog from '@crema/core/AppConfirmDialog';
import IntlMessages from '@crema/utility/IntlMessages';
import { getsessionStorage } from 'pages/common/login/cookies';
import { clientwebsocket, titleURL } from 'http-common';
import DeleteDialog from 'components/customer_erpDesign/DeleteDialog';
import { restrictNewCreationBasedOnPlanAction } from 'redux/actions/subscription_action';
import { getRoutesConfigAction } from 'redux/actions/userRole_actions';
import { getManagerBasedRoutesAction } from 'redux/actions/requestConfig';
import { getUserRightsAction } from 'redux/actions/userRole_actions';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import RenewalsNewForm from '../../../../pages/assets/Renewals/RenewalsNewForm';
import AssetGeneralForm from './CreateContact/AssetGeneralForm';
import GeneralFormListing from './CreateContact/generalFormListing';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { CannotDeleteAlert } from 'redux/actions/load';

const Contact = (props) => {
  const storage = getsessionStorage();
  const dispatch = useDispatch();
  // const [selectlink, setSelectlink] = useState(0)
  // const [selectname, setSelectname] = useState('customer')
  const [newform, setNewform] = useState(false)
  const [newGeneralForm, setNewGeneralForm] = useState(false)
  const [page, setPage] = useState(0);
  const [type, setType] = useState(() => {
    if(storage?.company_type === 12) {
    return 5
    }
   else if(storage.company_type === 5 || storage.company_type === 6 || storage.company_type === 9 || storage.company_type === 11){
      return 3
    }
   else if(storage.company_type === 3){
      return 1
    }
    else{
      return 0
    }
  })

  const [type_details, setType_details] = useState(() => {
    if(storage?.company_type == 12) {
      return 'client'
    }
    else if(storage.company_type === 5 || storage.company_type === 6 || storage.company_type === 9 || storage.company_type === 11){
      return 'employee'
    }
    else if(props.payable === 'payable'){
      return 'vendor'
    }
    else{
      return 'customer'
    }
  })
  // console.log(type,'type333',type_details)
  const {company_id, employee_id, role_name} = storage;
  const [newcustomer_type, setNewcustomer_type] = useState('type-1')
  const [createedittype, setCreateedittype] = useState('')
  const [selectedContact, setSelectedContact] = useState([]);
  const [editFinds, setEditFind] = useState(false)
  const [onrowclick, setOnrowclick] = useState(false)
  const [onbackClick, setOnbackClick] = useState(false)
  const [toDeleteContacts, setToDeleteContacts] = useState([]);
  const [rowIndex, setRowIndex] = useState('')
  const [checkedContacts, setCheckedContacts] = useState([]);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [payable,setPayable]= useState(false)
  const [deleteid, setDeleteid] = useState([])
  const [isactive, setIsactive] = useState(() => {
    if(storage.company_type === 5 || storage.company_type === 6 || storage.company_type === 9 || storage.company_type === 11){
      return 126
    }
    else if(storage.company_type === 3){
      return 123
    }
    else if(storage.company_type === 12){
      return 127
    }
    else{
      return 121
    }
  })
  const [starededit, setStarededit] = useState(false)
  const [stareddel, SetStaredDel] = useState(0)
  const [isApiFinished, setIsApiFinished] = useState(false)
  const [searchStringFromChild, setSearchStringFromChild] = useState('');

  
  const {
    setLoaderStatusHandler,
    setModalStatusHandler,
    setselectData,
    selectData,
    setModalTypeHandler,
    commoncookie,
    headerLocationId,usertype
  } = useContext(context);
  
  const  {
    customerReducer: {customer_mapping,customer_paginate, customer_filter, customer_id_data, customer_type,Get_customer_statement, stared_edit_details }, taxReducer:{tax}, taxCategoryReducer:{taxcategory}, taxCodeReducer:{taxcodes},
    discountTypeReducer:{discount_type_list}, UserCreationReducer:{createUser}, ConfigurationReducer:{mail_configuration}, SubscriptionReducer: {restrictUserLocationCreation}, RequestConfigReducer:{getManagerBasedRoutes},
    stockLocationReducer: { stocklocation },
  } = useSelector((state) => state);
  
  const selectedRole = storage.role_name
  const [filteredValue, setFilteredValue] = useState({
    location:  stocklocation.length === 1 ? [stocklocation[0].location_id] : [''],
    department: [''],
    role: ['']
  })
  const handleClose = () => {
    if(editFinds === true){
      setNewform(false)
      setOnrowclick(true)
    }else{
    setNewform(false)
    }
    // setOnrowclick(true)
 };

 useEffect(() => {
  // console.log(props.routeFrom,"werrwerwrouteFrom",onrowclick);
  
   if(props.routeFrom === "SALES" || props.routeFrom === "CREDITNOTE" || props.routeFrom === 'QUOTATION'){
    setRowIndex(props.rowIndex)
    setType(1)
    setOnrowclick(true)
   }
   if(props.routeFrom === "PAYABLES" || props.routeFrom === "DEBITNOTE"){
    setRowIndex(props.rowIndex)
    setType(2)
    setOnrowclick(true)
   }
 
 }, [props.routeFrom])
 

 const Bulkinsert = async(data) =>{
  const body = {
    searchString: '',
    type_details: type_details,
    type: type, 
    pageCount: 0,
    numPerPage: 15,
  }
  if(type === 0 || type === 1){
    // data.push(body)
    const customerResponse = 
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,dispatch(bulkCustomercreate(data, body, setModalTypeHandler, setLoaderStatusHandler)));
    return customerResponse;
  }
  else if(type === 2){
    try {
      // Wait for bulkSupplierCreate to complete first
      await dispatch(bulkSupplierCreate(data, setModalTypeHandler, setLoaderStatusHandler));
  
      const body = {
        searchString: '',
        type_details: type_details,
        type: type,
        pageCount: 0,
        numPerPage: 15,
      };
  
      const employee_data = {
        employee: employee_id,
        customer: 'null',
      };
  
      // Run all API calls in parallel after bulkSupplierCreate completes
      await Promise.all([
        dispatch(get_searchContactsActionFinal(body, setModalTypeHandler, setLoaderStatusHandler)),
        dispatch(ListsalesmanAction(employee_data, setModalTypeHandler, setLoaderStatusHandler)),
        dispatch(restrictNewCreationBasedOnPlanAction()),
        dispatch(getManagerBasedRoutesAction()),
        // dispatch(getUserRightsByRoleIdAction()),
        dispatch(getMenuAccessAction(selectedRole))
      ]);
      
    } catch (error) {
      console.error("Error in API calls:", error);
    } finally {
      setLoaderStatusHandler(false);
      setIsApiFinished(true);
    }
  }
  }
  
  useEffect(()=>{
    // Wait until stocklocation is loaded before calling API
    // Skip this check for Asset Management (company_type 9) as it may not require stock locations
    if (storage?.company_type != 12 && storage?.company_type != 9 && stocklocation.length === 0) return;

    const locationId = stocklocation.length === 1 ? [stocklocation[0].location_id] : 'null';

    const body = storage?.company_type == 12
  ? {
      searchString: '',
      type_details: 'client',
      type: 5,
      pageCount: 0,
      numPerPage: 15,
    }
  : {
      searchString: '',
      type_details: type_details,
      type: type,
      pageCount: page,
      numPerPage: 20,
      location_id: locationId,
      department_id: 'null',
    };

    // Sync filteredValue with stocklocation
    if (stocklocation.length === 1) {
      setFilteredValue((prev) => ({
        ...prev,
        location: [stocklocation[0].location_id],
      }));
    }

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(get_searchContactsActionFinal(body, setModalTypeHandler, setLoaderStatusHandler)),
      //  dispatch(listUserCreationAction()),

      dispatch(restrictNewCreationBasedOnPlanAction()),
      dispatch(getManagerBasedRoutesAction()),
      // dispatch(getUserRightsByRoleIdAction())
      // dispatch(getUserRightsAction())
      // dispatch(FilterAction( props.type, props.type_details, setModalTypeHandler, setLoaderStatusHandler,()=>{})),
      ).finally(() => setIsApiFinished(true));
  }, [type, stocklocation])

  useEffect(() => {
    dispatch(getMenuAccessAction(selectedRole));
  }, [selectedRole, dispatch]);

  
  
  //   useEffect(() => {
  //   clientwebsocket.socket.onmessage = async (message) => {
  //     let { event } = JSON.parse(message.data)
  //     if (event === 'getFollowList') {
  //       const body = {
  //         searchString: '',
  //         type_details: type_details,
  //         type: type,
  //         pageCount: 0,
  //         numPerPage: 15,
  //       }
  //       apiCalls(
  //         setModalTypeHandler,
  //         setLoaderStatusHandler,
  //         dispatch(get_searchContactsActionFinal(body, setModalTypeHandler, setLoaderStatusHandler)),
  //         //  dispatch(listUserCreationAction()),
  //         // dispatch(FilterAction( props.type, props.type_details, setModalTypeHandler, setLoaderStatusHandler,()=>{})),
  //         ).finally(() => setIsApiFinished(true));
  //     }
  //   }
  // }
  // )
  //  useEffect(() => {
  //   clientwebsocket.socket.onmessage = async (message) => {
  //     try {
  //       let { event } = JSON.parse(message.data);
  
  //       if (event === 'getFollowStatusWS') {
          
  //         dispatch(getUpdatedFollowersList());
  //       }
  //     } catch (error) {
  //       console.error('Error processing WebSocket message:', error);
  //     }
  //   };
  // });

 const userBulkinsert = async(data) =>{
   // if(data[0].token){
   const actionToDispatch = storage.company_type === 12
    ? bulkcreateClientUserCreationAction
    : bulkcreateUserCreationAction;
   
    await  dispatch(actionToDispatch(data, setModalTypeHandler, setLoaderStatusHandler,
       (response) => {
    // const cookies = new Cookies()
    if (response === 200) {
      const body = {
        searchString: '',
        type_details: type_details,
        type: type, 
        pageCount: 0,
        numPerPage: 15,
        location_id: filteredValue.location.length === 1 && filteredValue.location[0] === '' ? 'null' : filteredValue.location,
        department_id: filteredValue.department.length === 1 && filteredValue.department[0] === '' ? 'null' : filteredValue.department,
      }
      const employee_data = {
        employee: employee_id,
        customer:'null'
      }
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(get_searchContactsActionFinal(body, setModalTypeHandler, setLoaderStatusHandler)),
        //  dispatch(listUserCreationAction()),
        dispatch(ListsalesmanAction(employee_data, setModalTypeHandler, setLoaderStatusHandler)),
        dispatch(restrictNewCreationBasedOnPlanAction()),
        dispatch(getManagerBasedRoutesAction()),
        // dispatch(getUserRightsByRoleIdAction()),
        dispatch(getMenuAccessAction(selectedRole)),
        dispatch(FilterAction(
          type,
          type_details,
          setModalTypeHandler,
          setLoaderStatusHandler,
          ()=>{}
        ))
    
        ).finally(() => setIsApiFinished(true));
    }
  },))
  // }
 }

 const handleSubmit = async (data, asVendor, isIndividual, indi_customer_type) => {
   const {...values} = data;
   for (let val in values) {
     if (values[val] === true) {
       values[val] = 1;
     }
     if (values[val] === false) {
       values[val] = 0;
     }
   }
   //--------------------------------------
   if (asVendor) {
     const {customer_id, customer_type, ...record} = data;
     
     if (data.supplier_id) {
      await apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
       dispatch(updateVendorAction(
         data.supplier_id,
         record,
         setModalTypeHandler,
         setLoaderStatusHandler,
         sample,
       ))
      );
      const body = {
        searchString: "",
        type_details: type_details,
        type: type,
        pageCount: 0,
        numPerPage: 15,
      }
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(get_searchContactsActionFinal(body, setModalTypeHandler, setLoaderStatusHandler)),
      )

       // setTimeout(() =>{
       //   this.apiAlert()
       // },4000)
       // await this.setState({ open: false})
       // this.apiAlert()
     } else {
      // console.log("createvendor");
      
       dispatch(createVendorAction(
         record,
         setModalStatusHandler,
         setselectData,
         setModalTypeHandler,
         setLoaderStatusHandler,
         sample,
         (response)=>{
          // console.log("responseresponse",response);
          
          if(response.status === 200 && response.data.status !== "Phone Number Already Exists"){
          setType(2); setType_details('vendor');setNewcustomer_type('type:3');
          setNewform(false)
          setOnrowclick(false)
      }
    }
    )).then(res=> {
      const body = {
        searchString: "",
        type_details: type_details,
        type: type,
        pageCount: 0,
        numPerPage: 15,
      }
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(get_searchContactsActionFinal(body, setModalTypeHandler, setLoaderStatusHandler)),
      )
    })
    

     }
      props?.backToSales?.();
    //  apiCalls(
    //   setModalTypeHandler,
    //   setLoaderStatusHandler,
    //   dispatch(FilterAction(
    //     type,
    //     type_details,
    //     setModalTypeHandler,
    //     setLoaderStatusHandler,
    //     ()=>{},
    //   ))
    // );
   }else {
     if (data.customer_id) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(updateCustomerAction(
          data.customer_id,
          values,
          setModalTypeHandler,
          setLoaderStatusHandler, 
          sample,
          (res) => {
            console.log(props.routeFrom,props.routeFrom !== undefined && props.routeFrom === "SALES",res.status,props.rowIndex,rowIndex,props,"cbvcvcbvhgf");

            if (res?.status === 200) {
              if(props.routeFrom !== undefined && props.routeFrom === "SALES" || props.routeFrom !== undefined && props.routeFrom === "CREDITNOTE"){
                // dispatch(listCustomerAction())

                // setRowIndex(props.rowIndex)
                // setType(1)
                // setOnrowclick(true)
                props.backToSales();
              }
            }
          }
        )).then(res => {
          const body = {
            searchString: "",
            type_details: type_details,
            type: type,
            pageCount: 0,
            numPerPage: 15,
          }
          apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(get_searchContactsActionFinal(body, setModalTypeHandler, setLoaderStatusHandler)),
          )
        })
       );
     } else {
       apiCalls(
         setModalTypeHandler,
         setLoaderStatusHandler,
         dispatch(createCustomerAction(
           values,
           setModalStatusHandler,
           setselectData,
           setModalTypeHandler,
           setLoaderStatusHandler,
           sample,

           (response) => {
            
            const statusMessage = response.data;
            const errorMessages = [
              "Phone Number Already Exists",
              "Company Name Already Exists",
              "Phone Number and Company Name Already Exist"
            ];

            if (response.status === 200 && !errorMessages.includes(statusMessage)) {
             

               setType(isIndividual); setType_details('customer'); setNewcustomer_type(isIndividual === 0 ? 'type-1' : 'type-2');
               setNewform(false)
               setOnrowclick(false)
              //  apiCalls(
              //         setModalTypeHandler,
              //         setLoaderStatusHandler,
              //          dispatch(listCustomerAction(setModalTypeHandler, setLoaderStatusHandler)),
              //       );
             }
           },
           async(custData) => {
            
             if (custData.status === 200 && role_name === 'Salesman') {
           const employee_data = {
              employee: employee_id,
              customer:'null'
             }
            await dispatch(ListsalesmanAction(employee_data, setModalTypeHandler, setLoaderStatusHandler))
            const previos_map = customer_mapping.length > 0 ? customer_mapping.map((d)=>d.customer_id) : []
               const data = {
                 employee_id: employee_id,
                 customer_id: [custData.data.data[0]?.id,...previos_map],
                 previous_id: previos_map
               };
             
                apiCalls(
                  setModalTypeHandler,
                  setLoaderStatusHandler,
                  dispatch (SalesmaninsertAction(
                    data,
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                  ))
                );
              }
            },
          )).then(res => {
            const body = {
              searchString: "",
              type_details: type_details,
              type: type,
              pageCount: 0,
              numPerPage: 15,
            }
            apiCalls(
              setModalTypeHandler,
              setLoaderStatusHandler,
              dispatch(get_searchContactsActionFinal(body, setModalTypeHandler, setLoaderStatusHandler)),
            )
          })
        );        
     }
   }
  //  if (selectedContact !== null) {
  //       setNewform(false)
  //  } else {
  //       setNewform(false)
  //  }
 };

 const handleDeactive = async (data, status) => {
   const active = {is_active: status};
   if (data.id) {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(updateCustomerAction(data.id, active))
    ).then(res => {
      const body = {
        searchString: "",
        type_details: type_details,
        type: type,
        pageCount: 0,
        numPerPage: 15,
      }
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(get_searchContactsActionFinal(body, setModalTypeHandler, setLoaderStatusHandler)),
      )
    });
     setNewform(false)
   }
 };

 const sample = (value) => {
   setNewform(value)
 };
 const employeeSetState = async () => {

     setType(3);setType_details('employee');setNewcustomer_type('type:3')

     apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(FilterAction(
        type,
        type_details,
        setModalTypeHandler,
        setLoaderStatusHandler,
        ()=>{}
      ))
    );
 }
 const handleEdit = async (data, editIndex, erpedit) => {
  // console.log('herrwwww44')
   if (erpedit === 'erp') {
     setEditFind(true)
   } else {
     setEditFind(false)
   }
   
   if (type === 3) {
     setNewcustomer_type('type:4')
   }
   
   setSelectedContact(data);
   setNewform(true);
   setCreateedittype('edit');
   setRowIndex(editIndex);
   setOnrowclick(false)
};


useEffect(()=>{
  if(stared_edit_details.length >0){
   setSelectedContact(stared_edit_details[0])
  if(selectedContact[0]?.customer_type === 0){
        setType(0)
     }
     else if(selectedContact[0]?.customer_type === 1){
       setType(1)
     }
     else if(selectedContact[0]?.customer_type === 2){
      setType(2)
     }
     else{
      setType(3)
     }
     setCreateedittype('edit');
     setNewform(true)
    }
 
     
},[stared_edit_details, starededit])


const onOpenEditContact = async(contact) => {
  if(type === 4){
  //  alert('edit mode stared')
  let data ={
    type : contact.customer_id ===null ? 'vendor' : 'customer',
    type_id :  contact.customer_id === null ? contact.supplier_id : contact.customer_id,
    customer_type : contact.customer_id !== null ? contact.customer_type : ''
  }
   apiCalls(
    setModalTypeHandler,
    setLoaderStatusHandler,
    dispatch(StaredDetailsAction(
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      ()=>{},
    ))
  );
  setStarededit(true)
  }
  else{
  setSelectedContact(contact);
  // handleAddContactOpen();
  setNewform(true)
  setCreateedittype('edit')
  }

};
const rowPopupClose = () => {
  // this.setState({rowPopup: {open: false, rowIndex: ''}});
  setOnrowclick(false)
  setRowIndex('')
};
// useEffect(() =>{
//   if(usertype === 'Administrator'){
//     setType(3);
//     setIsactive(126)
//    }
// }, [usertype])

  useEffect(() => {
    dispatch(onGetFolderList());
   
  }, [dispatch]);

  useEffect(() => {
    dispatch(onGetLabelList());
  }, [dispatch]);

  const {messages} = useIntl();

  const onSelectContactsForDelete = async(contactIds,payable) => {
    // console.log(payable,'payable2332')   // if(type === 4){
    //    customer_filter

    // }else{
     setToDeleteContacts(contactIds);
     setDeleteid(contactIds)
     if(payable){
        CannotDeleteAlert(dispatch, {message: 'CANNOT DELETE'})
        return setDeleteDialogOpen(false)
     }
     setDeleteDialogOpen(true);
    

    // }
      
  };
  const onDeleteSelectedContacts = async() => {

    let id = deleteid 
    if (type === 2 || stareddel === 1) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(deleteVendorAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        )),
        // dispatch(FilterAction(
        //   type,
        //   type_details,
        //   setModalTypeHandler,
        //   setLoaderStatusHandler,
        //   ()=>{}
        // )),
      ).then(res => {
        const body = {
          searchString: "",
          type_details: type_details,
          type: type,
          pageCount: 0,
          numPerPage: 15,
        }
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(get_searchContactsActionFinal(body, setModalTypeHandler, setLoaderStatusHandler)),
        )
      });
    } 
    else if(type === 3){
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(employeeDeleteAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ))
      ).then(res => {
        const body = {
          searchString: "",
          type_details: type_details,
          type: type,
          pageCount: 0,
          numPerPage: 15,
          location_id: filteredValue.location.length === 1 && filteredValue.location[0] === '' ? 'null' : filteredValue.location,
          department_id: filteredValue.department.length === 1 && filteredValue.department[0] === '' ? 'null' : filteredValue.department,
        }
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(get_searchContactsActionFinal(body, setModalTypeHandler, setLoaderStatusHandler)),
        )
      });
      setOnrowclick(false)
    }
    else if(type === 5){
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(clientDeleteAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ))
      ).then(res => {
        const body = {
          searchString: "",
          type_details: type_details,
          type: type,
          pageCount: 0,
          numPerPage: 15,
        }
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(get_searchContactsActionFinal(body, setModalTypeHandler, setLoaderStatusHandler)),
        )
      });
      setOnrowclick(false)
    }
    else {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(deleteCustomerAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        )),
        // dispatch(FilterAction(
        //    type,
        //    type_details,
        //   setModalTypeHandler,
        //   setLoaderStatusHandler,
        //   ()=>{},
        // ))
      ).then(res => {
        const body = {
          searchString: "",
          type_details: type_details,
          type: type,
          pageCount: 0,
          numPerPage: 15,
        }
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(get_searchContactsActionFinal(body, setModalTypeHandler, setLoaderStatusHandler)),
        )
      });
    }
    setDeleteDialogOpen(false);
    setCheckedContacts([]);

  };

  useEffect(()=>{
    if (onbackClick) {
    const body = {
      searchString: '',
      type_details: type_details,
      type: type,
      pageCount: page,
      numPerPage: 20,
      location_id: filteredValue.location.length === 1 && filteredValue.location[0] === '' ? 'null' : filteredValue.location,
      department_id: filteredValue.department.length === 1 && filteredValue.department[0] === '' ? 'null' : filteredValue.department,
    }  
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(get_searchContactsActionFinal(body, setModalTypeHandler, setLoaderStatusHandler))
      // dispatch(FilterAction( props.type, props.type_details, setModalTypeHandler, setLoaderStatusHandler,()=>{})),
      ).finally(() => {
        setIsApiFinished(true);
        setOnbackClick(false); 
      });
    
    }
  }, [onbackClick])

  const handleFilterApply = (filterData) => {
    const data = {
      searchString: searchStringFromChild,
      type_details: type_details,
      type: type,
      pageCount: 0,
      numPerPage: 20,
      ...filterData
    }

     apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(get_searchContactsActionFinal(data, setModalTypeHandler, setLoaderStatusHandler))
    )
  }

  const handleFilterClear = () => {
    const data = {
      searchString: '',
      type_details: type_details,
      type: type,
      pageCount: page,
      numPerPage: 20,
      location_id: stocklocation?.length == 1 ? [stocklocation[0].location_id] : 'null',
      department_id: 'null',
      role: 'null'
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(get_searchContactsActionFinal(data, setModalTypeHandler, setLoaderStatusHandler))
    )
    setFilteredValue((prev) => ({
      ...prev,
      location: stocklocation.length == 1 ? [stocklocation[0].location_id] : [''],
      department: [''],
      role: ['']
    }))
  }

  const { approverOrVerifier, managerAllowedRoute } = getManagerBasedRoutes;


  console.log(onrowclick,'onrowclick')

  return (
    <>
    {type === 3 ? (
      <DeleteDialog
      open={isDeleteDialogOpen}
        onDeny={setDeleteDialogOpen}
        onConfirm={onDeleteSelectedContacts}
        title={<IntlMessages id='contactApp.deleteContact' />}
        dialogTitle={<IntlMessages id='common.deleteItem' />}
        empData={selectedContact}
      />
      ) : (

      <AppConfirmDialog
        open={isDeleteDialogOpen}
        onDeny={setDeleteDialogOpen}
        onConfirm={onDeleteSelectedContacts}
        title={<IntlMessages id='contactApp.deleteContact' />}
        dialogTitle={<IntlMessages id='common.deleteItem' />}
      />
      )}
     <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | Contacts </title>
      </Helmet>
    {newform === true && <> 
      
      <NewCustomer 
              newcustomer_type={newcustomer_type}
              edit_id_data={createedittype !== 'create' ? selectedContact :[]}
              status={createedittype}
              type= {type_details}
              handleClose={handleClose}
              handleSubmit={handleSubmit}
              handleDeactive={handleDeactive}
              discount_type_list = {discount_type_list}
              setModalStatusHandler={setModalStatusHandler}
              setModalTypeHandler={setModalTypeHandler}
              open={newform}
              sample={sample}
              leadsgender={props.leadsgender}
              employeeSetState={employeeSetState}
              type_id = {type}
              selectData = {selectData}
              setselectData = {setselectData}
              Bulkinsert = {Bulkinsert}
              setNewcustomer_type = {setNewcustomer_type}
              
            />
    </>}

    {newGeneralForm === true && 
      <AssetGeneralForm
        handleClose={()=> setNewGeneralForm(false)}
      />
    }
    
          {   //ERP Design Module
            // type === 3 ? '':
              onrowclick && (
                <App
                  // statementOfAccount={Get_customer_statement}
                  sales_customer_id = {props.sales_customer_id}
                  rowIndex={rowIndex}
                  handleEdit={handleEdit}
                  rowPopupClose={rowPopupClose}
                  handleDelete={onSelectContactsForDelete}
                  type={'customer'}
                  mail_configuration={mail_configuration}
                  customertype = {type}
                  setEditfind={setEditFind}
                  setOnbackClick={setOnbackClick}
                  employeeSetState={employeeSetState}
                  salesOrder = {props.salesOrder}
                  backToSales={props.backToSales}
                  payable ={props.payable}
                  purchaseOrder ={props.purchaseOrder}
                  
                />
              )
            }
    {newform === false && onrowclick === false && newGeneralForm === false  ?
    <AppsContainer
      // title={messages['contactApp.contact']}
      sxStyle={{ height: '100%', overflow: 'hidden' }}
      cardStyle={{ height: 'calc(100dvh - 80px)', overflow: 'hidden' }}
      sidebarStyle={{ height: 'calc(100dvh - 80px)' }}
      sidebarContent={<SideBarContent type = {type} setType={setType}  type_details ={type_details} setType_details = {setType_details} setNewGeneralForm = {setNewGeneralForm} setNewform = {setNewform} setCreateedittype = {setCreateedittype} isactive ={isactive} setIsactive = {setIsactive} newcustomer_type = {newcustomer_type} setNewcustomer_type = {setNewcustomer_type} restrictCreateUser={restrictUserLocationCreation.create_user}  managerAllowedRoute ={managerAllowedRoute}/>}
    >
      {isactive === 127 ? 
        <>
          <GeneralFormListing/>
        </>
      :
      <ContactListing type = {type} setType={setType}  type_details = {type_details} setType_details= {setType_details} newform = {newform} setNewform = {setNewform} createedittype ={createedittype} setCreateedittype = {setCreateedittype} setSelectedContact = {setSelectedContact} selectedContact ={selectedContact} onOpenEditContact = {onOpenEditContact} onSelectContactsForDelete ={onSelectContactsForDelete} onDeleteSelectedContacts = {onDeleteSelectedContacts} setOnrowclick = {setOnrowclick} setOnbackClick = {setOnbackClick} checkedContacts = {checkedContacts} setCheckedContacts= {setCheckedContacts} setRowIndex = {setRowIndex} isDeleteDialogOpen = {isDeleteDialogOpen} setDeleteDialogOpen = {setDeleteDialogOpen} SetStaredDel = {SetStaredDel}  Bulkinsert = {Bulkinsert} userBulkinsert = {userBulkinsert} isApiFinished= {isApiFinished} setIsApiFinished={setIsApiFinished} handleFilterApply={handleFilterApply} filteredValue={filteredValue} setFilteredValue={setFilteredValue} handleFilterClear={handleFilterClear}  setSearchStringFromChild={setSearchStringFromChild} page={page} setPage={setPage}/>
      }
      
    </AppsContainer> : ''}

    

    {/* {newGeneralForm === true && } */}
    </>
     
  );
  
};

export default Contact;
