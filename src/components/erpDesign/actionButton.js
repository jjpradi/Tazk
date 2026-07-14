import React, {useRef} from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { IconButton, Tooltip } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import {blue} from '@mui/material/colors';
import { getsessionStorage } from 'pages/common/login/cookies';
import { roleType, roleType1 } from 'utils/roleType';
import { getRoleAuthorization } from '../../@crema/utility/helper/RoleAuthHelper';
import { UserRightsAuthorization } from '../../@crema/utility/helper/UserRightsHelper';

const customerOptions = ['EDIT'];

const SupplierOptionsWhenNoLink = ['EDIT', 'LINK CUSTOMER'];

const SupplierOptionsWhenLinked = ['EDIT', 'UNLINK CUSTOMER'];

const employeeOptions = ['EDIT', 'DELETE', 'RELIEVE' ];

const AssertOptions = ['ASSIGN', 'MOVE','SCRAP', 'EDIT','SET ALERTS','AUDIT' ];

const leadOptions = ['EDIT', 'CREATE TASK', 'CREATE CALL', 'CREATE MEETING' , 'CREATE QUOTATION']

const campaignOptions = ['EDIT']

const renewalsOptions = ['PAUSE', 'ALERT']

const renewalsResumeOptions = ['RENEW', 'RESUME', 'ALERT']

const creditNotesOptions = ['EDIT', 'DELETE']

const receiptsOptions = ['PRINT', 'DELETE']

const quotationOptions = ['CONVERT','DELETE']

const collectDefectOptions = ['EDIT', 'DELETE', 'ISSUE REPLACEMENT']

const sendDefectOptions = ['EDIT', 'DELETE', 'COLLECT REPLACEMENT']

export default function OptionButton(props) {
 const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const storage = getsessionStorage()

  const componentRef = useRef(null);
  
  const handleMenuItemClick = (event, index) => {
    if (props.type === 'product') {
      props.handleProductChange(index);
    } else if (props.type === 'customer') {
      props.handleCustomerChange(index);
    } else if (props.type === 'custom_renewals') {
      props.handleCustomRenewalsChange(index);
    } else if (props.checkType === 'Assets'){
      props.handleAssetChange(index)
    } else if (props.checkType === 'Leads'){
      props.handleLeadOptionChange(index)
    } else if (props.checkType === 'Campaign') {
      props.handleCampaignOptionChange(index)
    }else if (props.checkType === 'Renewals') {
      props.handleRenewalsOptionChange(index)
    }else if (props.checkType === 'CreditNotes') {
      props.handleCreditNotesOptionsChange(index)
    }else if (props.checkType === 'DebitNotes') {
      props.handleDebitNotesOptionsChange(index)
    }else if (props.checkType === 'ReceiptsOption') {
      props.handleReceiptsOptionsChange(index)
    }else if (props.checkType === 'Quotations'){
      props.handleQuotationOptionChange(index)
    } else if(props.checkType === 'collectDefect' || props.checkType === 'sendDefect'){
      props.handleActionChange(index)
    }
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };
console.log(props.type, 'type')
  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  let options = props.checkType==='Assets' ? AssertOptions : props.checkType === 'Employee' ? employeeOptions : props.checkType === 'Leads' ? leadOptions : props.checkType === 'Campaign' ? campaignOptions : props.checkType === 'Renewals' ? (props.disablePause ? renewalsOptions : renewalsResumeOptions) : (props.checkType === 'CreditNotes' || props.checkType === 'DebitNotes') ? creditNotesOptions : props.checkType === 'ReceiptsOption' ? receiptsOptions : props.checkType === 'Supplier' ? props.customerVendorLinked ? SupplierOptionsWhenLinked : SupplierOptionsWhenNoLink : props.checkType === 'Quotations' ? quotationOptions : props.checkType === 'collectDefect' ? collectDefectOptions : props.checkType === 'sendDefect' ? sendDefectOptions : customerOptions

  const selectedRole = storage.role_name
  const customerEdit = storage.company_type === 3 ? UserRightsAuthorization(props?.user_rights?.[selectedRole], 'contact__customer', 'can_edit') : true
  const vendorEdit = storage.company_type === 3 ? UserRightsAuthorization(props?.user_rights?.[selectedRole], 'contact__vendor', 'can_edit') : true
  const contactEdit = storage.company_type === 5 || storage.company_type === 3 || storage.company_type === 9 ? UserRightsAuthorization(props?.user_rights?.[selectedRole], 'contact__employee', 'can_edit') : true
  const contactDelete = storage.company_type === 5 || storage.company_type === 3 || storage.company_type === 9                 ? UserRightsAuthorization(props?.user_rights?.[selectedRole], 'contact__employee', 'can_delete') : true
  const productEdit =  UserRightsAuthorization(props?.user_rights?.[selectedRole], 'inventory__product_master', 'can_edit') 
  const quotationDelete =  UserRightsAuthorization(props?.user_rights?.[selectedRole], 'sales__quotation', 'can_delete') 
  const salesConvert =  UserRightsAuthorization(props?.user_rights?.[selectedRole], 'sales__sales_orders', 'can_create')
  const creditNoteEdit =  UserRightsAuthorization(props?.user_rights?.[selectedRole], 'sales__credit_notes', 'can_edit')
  const creditNoteDelete =  UserRightsAuthorization(props?.user_rights?.[selectedRole], 'sales__credit_notes', 'can_delete')
  const debitNoteEdit =  UserRightsAuthorization(props?.user_rights?.[selectedRole], 'purchases__debit_notes', 'can_edit')
  const debitNoteDelete =  UserRightsAuthorization(props?.user_rights?.[selectedRole], 'purchases__debit_notes', 'can_delete')

  const collectDefectEdit = UserRightsAuthorization(props?.user_rights?.[selectedRole], 'defects__collect_defects', 'can_edit')
  const collectDefectDelete = UserRightsAuthorization(props?.user_rights?.[selectedRole], 'defects__collect_defects', 'can_delete')
  const issueReplacementCreate = UserRightsAuthorization(props?.user_rights?.[selectedRole], 'defects__issue_replacement', 'can_create')

  const sendDefectEdit = UserRightsAuthorization(props?.user_rights?.[selectedRole], 'defects__send_defects', 'can_edit')
  const sendDefectDelete = UserRightsAuthorization(props?.user_rights?.[selectedRole], 'defects__send_defects', 'can_delete')
  const collectReplacementCreate = UserRightsAuthorization(props?.user_rights?.[selectedRole], 'defects__collect_replacement', 'can_create')
  
  const assetEdit = UserRightsAuthorization(props?.user_rights?.[selectedRole],'assets','can_edit');

    const alertEdit =UserRightsAuthorization(props?.user_rights?.[selectedRole], 'renewals__custom_renewals', 'can_edit') 

  if(props.checkType === 'Employee' && !contactEdit) {
    options = options.filter(option => option !== 'EDIT');
  }
  if(props.checkType === 'Employee' && !contactDelete) {
    options = options.filter(option => option !== 'DELETE');
  }
  if(props.checkType === 'Employee' && !contactEdit) {
    options = options.filter(option => option !== 'RELIEVE');
  }
  if(props.checkType === 'Customer' && !customerEdit) {
    options = options.filter(option => option !== 'EDIT');
  }
  if(props.checkType === 'Supplier' && !vendorEdit) {
    options = options.filter(option => option !== 'EDIT');
  }

  if (props.type === 'product' && !productEdit) {
    options = options.filter(option => option !== 'EDIT');
  }
  if (props.checkType === 'Quotations' && !quotationDelete) {
    options = options.filter(option => option !== 'DELETE');
  }
  if (props.checkType === 'Quotations' && !salesConvert) {
    options = options.filter(option => option !== 'CONVERT');
  }
  if(props.checkType === 'CreditNotes' && !creditNoteEdit) {
    options = options.filter(option => option !== 'EDIT');
  }
  if(props.checkType === 'CreditNotes' && !creditNoteDelete) {
    options = options.filter(option => option !== 'DELETE');
  }
  if(props.checkType === 'DebitNotes' && !debitNoteEdit) {
    options = options.filter(option => option !== 'EDIT');
  }
  if(props.checkType === 'DebitNotes' && !debitNoteDelete) {
    options = options.filter(option => option !== 'DELETE');
  }

  if(props.checkType === 'collectDefect' && !collectDefectEdit) {
    options = options.filter(option => option !== 'EDIT');
  }
  if(props.checkType === 'collectDefect' && !collectDefectDelete) {
    options = options.filter(option => option !== 'DELETE');
  }
  if(props.checkType === 'collectDefect' && !issueReplacementCreate) {
    options = options.filter(option => option !== 'ISSUE REPLACEMENT');
  }
  
  if(props.checkType === 'sendDefect' && !sendDefectEdit) {
    options = options.filter(option => option !== 'EDIT');
  }
  if(props.checkType === 'sendDefect' && !sendDefectDelete) {
    options = options.filter(option => option !== 'DELETE');
  }
  if(props.checkType === 'sendDefect' && !collectReplacementCreate) {
    options = options.filter(option => option !== 'COLLECT REPLACEMENT');
  }

  if (props.checkType === 'Assets' && !assetEdit) {
    options = options.filter(option => option !== 'EDIT');
  }
  
   if (props.type === 'custom_renewals' && !alertEdit) {
    options = options.filter(option => option !== 'EDIT');
  }

  const defectsLandingPageActionDisable = (option) => {
    switch(option){
      case 'EDIT':
      case 'DELETE':
        return (props.checkType === 'collectDefect' || props.checkType === 'sendDefect') ? props.editDeleteDisable : false
      
      case 'ISSUE REPLACEMENT':
      case 'COLLECT REPLACEMENT':
        return (props.checkType === 'collectDefect' || props.checkType === 'sendDefect') ? props.issueReplacementDisable : false

      default:
        return false
    }
  }
  
  const shouldShowOption = (action) => {
    console.log(props.user_rights, action, 'props.user_rights')
    if (storage.company_type !== 3) return true;

    const allowedRoles = ['Administrator', 'Manager', 'Salesman', 'SalesManager'];

    if (!allowedRoles.includes(storage.role_name)) return false;
    if (!props.user_rights) return false;
    return getRoleAuthorization(props.user_rights, action) === true;
  };

  return (
    <React.Fragment>
      <Tooltip title="Actions">
        <IconButton
          size='small'
          ref={anchorRef}
          disabled={storage.role_name === "Employee" ? true : false}
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup='menu'
          onClick={handleToggle}
        >
          <MoreVertIcon fontSize='small' />
        </IconButton>
      </Tooltip>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        sx={{zIndex:10}}
      >
        {({TransitionProps, placement}) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper >
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id='split-button-menu'>
                     {options.map((option, index) => (
                    <MenuItem
                      key={option}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                      disabled={(storage.person_id !== props.customer_data && !roleType1.includes(storage.role_name)) || (props.buttonDisabled || props.disableOption === 'Sales' || props.disableOption === 'Adjusted' || props.disableOption === 'Purchase' || (props.checkType === 'Quotations' && props.disableConvert) || defectsLandingPageActionDisable(option) ? true : false)}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  );
}
