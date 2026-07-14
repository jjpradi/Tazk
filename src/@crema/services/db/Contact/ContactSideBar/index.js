import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import React, {useEffect, useState} from 'react';
import {useSelector,useDispatch} from 'react-redux';
import IntlMessages from '@crema/utility/IntlMessages';
import AppScrollbar from '@crema/core/AppScrollbar';
import CreateContact from '../CreateContact';
import LabelItem from './LabelItem';
import AppsSideBarFolderItem from '@crema/core/AppsSideBarFolderItem';
import {Fonts} from '@crema/shared/constants/AppEnums';
import AppList from '@crema/core/AppList';
import ListEmptyResult from '@crema/core/AppList/ListEmptyResult';
import SidebarPlaceholder from '@crema/core/AppSkeleton/SidebarListSkeleton';
import AddIcon from '@mui/icons-material/Add';
import {Zoom} from '@mui/material';
import { getsessionStorage } from 'pages/common/login/cookies';
// import { getUserRightsAction } from 'redux/actions/userRole_actions';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import { getAppConfigDataAction } from 'redux/actions/app_config_actions';
import { findMenuByKey } from 'utils/menuTreeUtils';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

// Contact folder map — imported from central registry
import { contactTabMap } from 'utils/menuComponentRegistry';


const SideBarContent = (props) => {
  let storage = getsessionStorage()
  const dispatch = useDispatch();

  const labelList = useSelector(({contactApp}) => contactApp.labelList);

  const folderList = useSelector(({contactApp}) => contactApp.folderList);

  const [isAddContact, onSetIsAddContact] = useState(false);
  // const [userRight, setUserRight] = useState(null);

  const {roleReducer:{user_rights}, appConfigReducer:{app_config_data}, rbacReducer: {menuAccess}}=useSelector((state) => state);

  const restrictCreateUser = props.restrictCreateUser

  const customOrder = ['Customer', 'Vendor', 'Employee', 'Starred'];

  const vendorRights = storage.company_type === 3 ? getRoleAuthorization(user_rights, 'Show Vendor') : true;

  const allowedOrder = vendorRights ? customOrder : customOrder.filter(role => role !== 'Vendor');

  const salesCompanyContacts = folderList.filter(item => customOrder.includes(item.name))
                                .sort((a, b) => customOrder.indexOf(a.name) - customOrder.indexOf(b.name))

  const AssetfolderList = [
  {id: 126, name: 'Employee', alias: 'employee',type: 3, type_name : 'employee'},
  {id: 127, name: 'General', alias: 'general',type: 3, type_name : 'general'},
];

  const addAcc = app_config_data.find(item => item.key_name === "additional_acc")?.value == 1 ? 1 : 0;
 
  const filteredList = storage.company_type === 12 ? [{
    "id": 127,
    "name": "Client",
    "alias": "client",
    "type": 5,
    "type_name": "client"
}] : storage.company_type === 5 || storage.company_type === 6 || storage.company_type === 11 ? folderList.filter(item => item.name === 'Employee') : storage.company_type === 10 ? folderList.filter(item => item.name !== 'Vendor') :  storage.company_type === 9 ? AssetfolderList :  storage.company_type === 3 ? salesCompanyContacts : storage.company_type === 2 && addAcc == 1 ? folderList.filter(item => item.name === 'Individual' || item.name === 'Vendor' || item.name === 'Employee') : folderList
  
  // const hideCreateContact = !([5, 6, 9].includes(storage.company_type) && 
  // (storage.role_name === 'Employee' || storage.role_name === 'Manager'));


  const allowedCreateButton = props.managerAllowedRoute === "true"

  useEffect(() => {
    dispatch(getAppConfigDataAction());
  }, [])

  const handleAddContactOpen = () => {
    let type ;
    (storage.company_type === 10 && props.type === 0 || storage.company_type === 3 && props.type === 4) ? type = 1 : (storage.company_type === 9 && props.isactive === 127) ? type = 6 :  type = props.type
    
    console.log(props.type,'type555',type)
    // onSetIsAddContact(true);
    if(props.isactive === 127){
      props.setNewGeneralForm(true);
    }
    else{
      props.setNewform(true);
    }
    props.setCreateedittype('create');
    props.setType(type);
    // props.setNewcustomer_type(props.type === 0 ? 'type-1' : props.type === 1 ? 'type-2' : props.type === 2 ? 'type-3':'type-4')
  };

  const handleAddContactClose = () => {
    onSetIsAddContact(false);
  };

  // useEffect(() => {dispatch(getUserRightsByRoleIdAction());
  //     // setUserRight(rights); 
  
  // }, []);
  
  const selectedRole = storage.role_name

  const customerCreate = UserRightsAuthorization(menuAccess[selectedRole], 'contact__customer', 'can_create')
  const vendorCreate = UserRightsAuthorization(menuAccess[selectedRole], 'contact__vendor', 'can_create')
  const employeeCreate = UserRightsAuthorization(menuAccess[selectedRole], 'contact__employee', 'can_create')
  const individualCreate = UserRightsAuthorization(menuAccess[selectedRole], 'contact__individual', 'can_create')

  const salesCompanyCreate = customerCreate || vendorCreate || employeeCreate
  const posCompanyCreate = individualCreate || customerCreate || vendorCreate || employeeCreate

  const generalCreate = UserRightsAuthorization(menuAccess[selectedRole], 'contact__general', 'can_create')


  const userRights =
    storage.company_type === 5 ? employeeCreate
    : storage.company_type === 9 ? (props.isactive === 127 ? generalCreate : employeeCreate)
    : storage.company_type === 3 ? salesCompanyCreate
     : storage.company_type === 2 ? posCompanyCreate
      : true;

  const createContact =
    userRights && restrictCreateUser === "enable";
// console.log(restrictCreateUser,userRights,allowedCreateButton,"restrictCreateUser")

console.log(props.isactive,'isactyusjdsfg')

  return (
    <>
      <Box
         sx={{
        //   px: {xs: 4, md: 5},
             pt: {xs: 4, md: 5},
             pl:{xs: 3, md: 3},
             pb: 2.5
        //   display: 'flex',
        //   justifyContent: 'center',
        //   // backgroundColor:'red'
        }}
      >
        {/* {userRight && userRights[0].rights.ContactAdd === 'true' && restrictCreateUser === "enable" && ( */}
        {createContact && (
          <Zoom in style={{transitionDelay: '300ms'}}>
          <Button
            variant='outlined'
            color='primary'
            sx={{
              padding: '8px 28px',
              borderRadius: 8,
              '& .MuiSvgIcon-root': {
                // fontSize: 26,
              },
            }}
            startIcon={<AddIcon />}
            onClick={handleAddContactOpen}
          >
            <IntlMessages id='contactApp.createContact' />
          </Button>
            </Zoom>
        )}
      </Box>

      <AppScrollbar className='scroll-app-sidebar'>
        <Box
          sx={{
            pr: 4,
            pb: {xs: 4, md: 5, lg: 6.2},
            // backgroundColor:'blue',
            minHeightheight:'1200px'
          }}
        >
          <List
            sx={{
              mb: {xs: 2, xl: 5},
            }}
            component='nav'
            aria-label='main task folders'
          >
            <AppList
              animation='transition.slideLeftIn'
              data={filteredList}
              ListEmptyComponent={
                <ListEmptyResult
                  loading={true}
                  placeholder={
                    <Box
                      sx={{
                        px: {xs: 4, md: 5, lg: 6.2},
                      }}
                    >
                      <SidebarPlaceholder />
                    </Box>
                  }
                />
              }
              renderRow={(item) => (
                <AppsSideBarFolderItem
                  key={item.id}
                  item={item}
                  type = {props.type}
                  setType = {props.setType}
                  type_details = {props.type_details}
                  setType_details = {props.setType_details}
                  alias = {`${item.alias}`}
                  isactive = {props.isactive}
                  setIsactive = {props.setIsactive}
                  //path={`/apps/contact/folder/${item.alias}`}
                />
              )}
            />
          </List>

          {/* <Box
            component='h4'
            sx={{
              mt: {xs: 4, xl: 5},
              px: {xs: 4, md: 5, lg: 6.2},
              fontWeight: Fonts.SEMI_BOLD,
            }}
          >
            <IntlMessages id='common.labels' />
          </Box>

          <List component='nav' aria-label='main mailbox folders'>
            <AppList
              animation='transition.slideLeftIn'
              data={labelList}
              ListEmptyComponent={
                <ListEmptyResult
                  loading={true}
                  placeholder={
                    <Box
                      sx={{
                        px: {xs: 4, md: 5, lg: 6.2},
                      }}
                    >
                      <SidebarPlaceholder />
                    </Box>
                  }
                />
              }
              renderRow={(label) => <LabelItem key={label.id} label={label} />}
            />
          </List> */}

          <CreateContact
            isAddContact={isAddContact}
            handleAddContactClose={handleAddContactClose}
          />
        </Box>
      </AppScrollbar>
    </>
  );
};

export default SideBarContent;
