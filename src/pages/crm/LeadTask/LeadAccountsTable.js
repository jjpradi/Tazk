import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSearchLeadsAccountsAction, listLeadsAccountsAction, setLeadsAccountsAction } from 'redux/actions/leads_task_actions';
import CommonSearch from 'utils/commonSearch';
import { maxBodyHeight, headerStyle, cellStyle } from 'utils/pageSize';
import { IconButton, Tooltip } from "@mui/material"
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccountsDetail from './AccountsDetail';
import AddIcon from '@mui/icons-material/Add'
import AccountLeadsForm from 'pages/crm/leadManagement/AccountLeadsForm';
import { getAllLeadAccountsAction } from 'redux/actions/leadManagement_actions';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import apiCalls from 'utils/apiCalls';
import { getsessionStorage } from 'pages/common/login/cookies';

const LeadAccountsTable = () => {
    const dispatch = useDispatch();
   const storage = getsessionStorage();
    const {
        LeadsTaskReducer: { getLeadsAccounts }, rbacReducer: { menuAccess } 
    } = useSelector((state) => state);

    const [open,setOpen] = useState(false);
    const[rowData, setRowData] = useState([])
    const [showForm, setShowForm] = useState(false)

    const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

    const [paginateData, setPaginateData] = useState({
        searchString: '',
        pageCount: 0,
        pageSize: 20
    });

     const selectedRole = storage.role_name
      useEffect(() => {
        if (!selectedRole) return;
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler, dispatch(getMenuAccessAction(selectedRole)));
      }, [selectedRole, dispatch]);
    
  const leadAccountCreate =UserRightsAuthorization(menuAccess[selectedRole], 'lead_accounts', 'can_create') 

    const columns = [
        
        { field: 'company_name', title: 'Company Name',
            render : (rowData) => {
                return rowData.company_name === null ? '-' : rowData.company_name
            } 
         },
        { field: 'company_phone_number', title: 'Company phone Number',
            render : (rowData) => {
                return rowData.company_phone_number === null ? '-' : rowData.company_phone_number
            } 
         },
        { 
            field: 'email', 
            title: 'Email',
            render : (rowData) => {
                return rowData.email === null ? '-' : rowData.email
            } 
        },
        { 
            field: 'company_website', 
            title: 'Company Website',
            render : (rowData) => {
                return rowData.company_website === null ? '-' : rowData.company_website
            } 
        },

        { 
            field: 'contactPersonFirstName', 
            title: 'Contact Person Name',
            render : (rowData) => {
                if(rowData.contactPersonFirstName !== null || rowData.contactPersonLastName !== null) {
                    return rowData.contactPersonLastName ? `${rowData.contactPersonFirstName} ${rowData.contactPersonLastName}` : rowData.contactPersonFirstName
                }
                else {
                    return '-'
                }
            }
         },
        // { 
        //     field: 'salutation', 
        //     title: 'Title',
        //     render : (rowData) => {
        //         return rowData.salutation === null ? '-' : rowData.salutation
        //     } 
        // },
        { 
            field: 'contactPersonPhoneNumber', 
            title: 'Contact Person Number',
            render : (rowData) => {
                return rowData.contactPersonPhoneNumber === null ? '-' : rowData.contactPersonPhoneNumber
            } 
        },
        { 
            field: 'no_of_employees', 
            title: 'No of Employees',
            render : (rowData) => {
                return rowData.no_of_employees === null ? '-' : rowData.no_of_employees
            } 
        },
        // { field: 'mobile', title: 'Mobile' ,
        //     render:(rowData)=>{
        //         if(rowData.mobile === null || '' || 'null'){
        //             return '-'
        //         }
        //         else{
        //             return rowData.mobile
        //         }
        //     }
        // },


        { 
            field: 'company_industry', 
            title: 'Company Industry',
            render : (rowData) => {
                return rowData.company_industry === null ? '-' : rowData.company_industry
            } 
        },
        // { 
        //     field: 'company_email', 
        //     title: 'Company Email',
        //     render : (rowData) => {
        //         return rowData.company_email === null ? '-' : rowData.company_email
        //     } 
        // },

        { field: 'address', title: 'Address',
            render : (rowData) => {
                return rowData.address === null ? '-' : rowData.address
            } 
         },
        { field: 'state', title: 'State',
            render : (rowData) => {
                return rowData.state === null ? '-' : rowData.state
            } 
         },
        { field: 'city', title: 'City',
            render : (rowData) => {
                return rowData.city === null ? '-' : rowData.city
            } 
         },
        { field: 'zip', title: 'Pincode',
            render : (rowData) => {
                return rowData.zip === null ? '-' : rowData.zip
            } 
         },
        { field: 'country', title: 'Country',
            render : (rowData) => {
                return rowData.country === null ? '-' : rowData.country
            } 
         },
        // {field :'action',title:'view',
        //     render:(rowData)=>{
        //         return(
        //             <Tooltip title='view'>
        //                 <IconButton onClick={()=>{
        //                     handleDetail(rowData)
        //                 }}>
        //                     <VisibilityIcon/>
        //                 </IconButton>
        //             </Tooltip>
        //         )
        //     }
        // }
    ];

    const handleDetail = (data) => {
        console.log(data,'rowwadata')
        setRowData(data)
        setOpen(true)
        dispatch(getAllLeadAccountsAction())
    }
    
    const handleFormOpen = () => {
        setShowForm(true)
    }

    const handleClose =()=>{
        setOpen(false)
        setShowForm(false)
        const payload =  {
            searchString : paginateData.searchString,
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize
        }
        dispatch(listLeadsAccountsAction(payload))
    }

    const handlePageChange = (page) => {
        setPaginateData((prevState) => ({ ...prevState, pageCount: page }));
    };

    const handleSizeChange = (size) => {
        setPaginateData((prevState) => ({ ...prevState, pageSize: size }));
    };

    const cancelSearch = () => {
        setPaginateData((prevState) => ({ ...prevState, searchString: '' }));

        dispatch(setLeadsAccountsAction({
            data: [],
            numRows: 0
        }));

        const payload = {
            searchString: '',
            pageCount: paginateData.pageCount,
            numPerPage: paginateData.pageSize
        };

        dispatch(listLeadsAccountsAction(payload, setModalTypeHandler, setLoaderStatusHandler));
    };

    const requestSearch = (e) => {
        const val = e.target.value;
        setPaginateData((prevState) => {
            const updatedPaginateData = { ...prevState, searchString: val };

            dispatch(setLeadsAccountsAction({
                data: [],
                numRows: 0
            }));

            const payload = {
                searchString: val,
                pageCount: 0,
                numPerPage: updatedPaginateData.pageSize
            };

            dispatch(getSearchLeadsAccountsAction(payload, setModalTypeHandler, setLoaderStatusHandler));

            return updatedPaginateData;
        });
    };

    useEffect(() => {
        const payload = {
            searchString: paginateData.searchString,
            pageCount: paginateData.pageCount,
            numPerPage: paginateData.pageSize
        };
        dispatch(listLeadsAccountsAction(payload));
    }, [paginateData.pageCount,paginateData.pageSize]);

    console.log(' ',getLeadsAccounts)

    return (
        <div >
           { open === false && showForm === false && 
           <MaterialTable
                columns={columns}
                totalCount={getLeadsAccounts.numRows}
                title={'Leads Accounts'}
                data={getLeadsAccounts.data}
                options={{
                    actionsColumnIndex: -1,
                    paging: true,
                    filtering: false,
                    search: false,
                    pageSize: paginateData.pageSize,
                    pageSizeOptions: [20, 50, 100],
                    maxBodyHeight: maxBodyHeight,
                    minBodyHeight: maxBodyHeight,
                    overflowY:'visible',
                    headerStyle,
                    cellStyle
                }}
                page={paginateData.pageCount}
                onPageChange={(page) => {
                    handlePageChange(page);
                }}
                onRowsPerPageChange={(size) => {
                    handleSizeChange(size);
                }}
                onRowClick={(event, rowData) => {
                    handleDetail(rowData);
                }}
                components={{
                    Toolbar: (props) => (
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <div style={{ width: '100%' }}>
                                <MTableToolbar {...props} />
                            </div>
                            <div>
                                <CommonSearch
                                    searchVal={paginateData.searchString}
                                    cancelSearch={cancelSearch}
                                    requestSearch={requestSearch}
                                />
                            </div>
                        </div>
                    )
                }}
                actions = {[
                   leadAccountCreate ? {
                        icon : () => <AddIcon />,
                        tooltip : 'Add',
                        isFreeAction : true,
                        onClick : handleFormOpen
                    } : null
                ]}
            />}
            {
                open === true &&  <AccountsDetail
                data={getLeadsAccounts.data} 
                rowData={rowData}
                index={rowData?.customer_id}
                customerId={rowData?.customer_id}
                handleClose={handleClose}
                length={getLeadsAccounts?.numRows}
                /> 
            }

            {
                showForm &&
                <AccountLeadsForm 
                    type = 'create'
                    showForm = {showForm}
                    handleClose = {handleClose}
                />
            }
           
        </div>
    );
};



export default LeadAccountsTable;

