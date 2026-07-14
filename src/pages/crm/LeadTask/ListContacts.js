import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AccountsContactsAction, getSearchAccountsContact, getSearchLeadsAccountsAction, listLeadsAccountsAction, setAccountContacts, setLeadsAccountsAction } from 'redux/actions/leads_task_actions';
import { listUserCreationAction } from 'redux/actions/userCreation_actions';
import CommonSearch from 'utils/commonSearch';
import { maxBodyHeight, headerStyle, cellStyle } from 'utils/pageSize';

const ListContacts = (props) => {
    const dispatch = useDispatch();

    const {
        LeadsTaskReducer: { getAccountsContacts ,getLeadsAccounts},
        // UserCreationReducer : { createUser },
    } = useSelector((state) => state);



    const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

    const [paginateData, setPaginateData] = useState({
        searchString: '',
        pageCount: 0,
        pageSize: 5
    });

    // console.log(props.rowData.contactPersonFirstName,'saasasd')
    const col = props.rowData.AdditionalContactDetails 
 useEffect(()=>{

    let primary_contact = {
        firstName : props.rowData.contactPersonFirstName,
        gender : props.rowData.contactPersonGender,
        designation : props.rowData.contactPersonDesignation,
        email : props.rowData.email,
        phone_number : props.rowData.phone_number,
    }
    col?.push(primary_contact)
},[dispatch])

// console.log(col,'asd3424')



    const columns = [
        { 
            field: 'firstName', 
            title: 'Full Name ' 
        },
        { 
            field: 'email', 
            title: 'Email ',
            render : (rowData) => {
                return rowData.email === null ? '-' : rowData.email
            } 
        },
        { 
            field: 'designation', 
            title: 'Designation',
            render : (rowData) => {
                return rowData.designation === null || '' ? '-' : rowData.designation
            }  
        },
        { 
            field: 'gender', 
            title: 'Gender',
            render : (rowData) => {
                return rowData.gender === null ? '-' : rowData.gender
            }  
        },
        { 
            field: 'phone_number', 
            title: 'Phone Number',
            render : (rowData) => {
                return rowData.phone_number === null ? '-' : rowData.phone_number
            }  
        }
    ]
   

    // const handlePageChange = (page) => {
    //     setPaginateData((prevState) => ({ ...prevState, pageCount: page }));
    // };

    // const handleSizeChange = (size) => {
    //     setPaginateData((prevState) => ({ ...prevState, pageSize: size }));
    // };

    // const cancelSearch = () => {
    //     setPaginateData((prevState) => ({ ...prevState, searchString: '' }));

    //     dispatch(setAccountContacts({
    //         data: [],
    //         numRows: 0
    //     }));

    //     const payload = {
    //         searchString: '',
    //         pageCount: paginateData.pageCount,
    //         numPerPage: paginateData.pageSize,
    //         details : props?.data
    //     };

    //     dispatch(AccountsContactsAction(payload, setModalTypeHandler, setLoaderStatusHandler));
    // };

    // const requestSearch = (e) => {
    //     const val = e.target.value;
    //     setPaginateData((prevState) => {
    //         const updatedPaginateData = { ...prevState, searchString: val };

    //         dispatch(setAccountContacts({
    //             data: [],
    //             numRows: 0
    //         }));

    //         const payload = {
    //             searchString: val,
    //             pageCount: updatedPaginateData.pageCount,
    //             numPerPage: updatedPaginateData.pageSize,
    //             details : props?.data
    //         };

    //         dispatch(getSearchAccountsContact(payload, setModalTypeHandler, setLoaderStatusHandler));

    //         return updatedPaginateData;
    //     });
    // };


    // useEffect(() => {
    //     let timer = setTimeout(()=>{
    //         if(props?.data){
    //             const payload = {
    //                 searchString: paginateData.searchString,
    //                 pageCount: paginateData.pageCount,
    //                 numPerPage: paginateData.pageSize,
    //                 details : props?.data,
    //                 customer_id : props?.customer_id
    //             };
    //              dispatch(AccountsContactsAction(payload))
    //         }
    //         else{
    //             const payload = {
    //                 searchString: paginateData.searchString,
    //                 pageCount: paginateData.pageCount,
    //                 numPerPage: paginateData.pageSize,
    //             };
    //              dispatch(AccountsContactsAction(payload))
    //         }
    //     },1000)
        
    //     return ()=> clearTimeout(timer)

    // }, [paginateData.pageCount,paginateData.pageSize, props.data]);



    return (
        <div style={{marginBottom:'100px'}}>
            <MaterialTable
                columns={columns}
                totalCount={getAccountsContacts.numRows}
                title={'Contacts'}
                data={col}
                
                options={{
                    actionsColumnIndex: -1,
                    paging: true,
                    filtering: false,
                    search: false,
                    pageSize: paginateData.pageSize,
                    pageSizeOptions: [5,10],
                    maxBodyHeight: maxBodyHeight,
                    headerStyle,
                    cellStyle
                }}
                // page={paginateData.pageCount}
                // onPageChange={(page) => {
                //     handlePageChange(page);
                // }}
                // onRowsPerPageChange={(size) => {
                //     handleSizeChange(size);
                // }}
                // components={{
                //     Toolbar: (props) => (
                //         <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                //             <div style={{ width: '100%' }}>
                //                 <MTableToolbar {...props} />
                //             </div>
                //             <div>
                //                 <CommonSearch
                //                     searchVal={paginateData.searchString}
                //                     cancelSearch={cancelSearch}
                //                     requestSearch={requestSearch}
                //                 />
                //             </div>
                //         </div>
                //     )
                // }}
            />
        </div>
    );
};

export default ListContacts;

