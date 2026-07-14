import React, {useState, useEffect, useContext} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Box from '@mui/material/Box';
import AppSearchBar from '@crema/core/AppSearchBar';
import PropTypes from 'prop-types';
import {useIntl} from 'react-intl';
import CheckBox from './CheckBox';
import ContactCheckedActions from './ContactCheckedActions';
import ViewSelectButtons from './ViewSelectButtons';
import AppsPagination from '@crema/core/AppsPagination';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import * as XLSX from "xlsx-js-style";
import {employeebulkForToken, requestForToken} from '../../../../../../firebase/firebase.service';
import moment from 'moment';
import CommonSearch from 'utils/commonSearch';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import GSTINDialog from 'pages/assets/alert/GSTINDialog';
import { listSalesManPaginateAction } from 'redux/actions/salesMan_action';
import apiCalls from 'utils/apiCalls';
import Context from '../../../../../../../src/context/CreateNewButtonContext';
import { listCustomerSalesManAction } from 'redux/actions/customer_actions';
import { ErrormsgAlert } from 'redux/actions/load';



const ContactHeader = (props) => {
  const {
    checkedContacts,
    setCheckedContacts,
    filterText,
    onSetFilterText,
    onChangePageView,
    onSelectContactsForDelete,
    page,
    onPageChange,
    pageView,
    tabledata,
    headerLocationId,
    Bulkinsert,
    type,
    userBulkinsert,
    customer_paginate,
    customer_paginateCount,
    cancelSearch,
    requestSearch,
    rowsPerPage,
    onRowsPerPageChange,
    handleFilterApply,
    filteredValue,
    setFilteredValue,
    handleFilterClear
  } = props;

  const  {
    customerReducer: { customer_filter }, salesManReducer: { salesManByPagination, getAllSalesmanIncentive } } = useSelector((state) => state); 
    const [token, setToken] = useState('');
    const [openAlert, setOpenAlert] = useState(false);
    const [missingRequiredRows, setMissingRequiredRows] = useState([]);
    const [validRows, setValidRows] = useState([]);
    const [missingGSTINTypeRows, setMissingGSTINTypeRows] = useState([]); 
    const [invalidGSTINTypeRows, setInvalidGSTINTypeRows] = useState([]); 
    const [pincodeInvalidRows, setPincodeInvalidRows] = useState([]); 
    const [showGSTINDialog, setShowGSTINDialog] = useState(false); 
    const [unmatchedSalesmenList, setUnmatchedSalesmen] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [open, setOpen] = useState(false);
    const contactList = tabledata;
  // const contactList = useSelector(({contactApp}) => contactApp.contactList);

  // const totalContacts = numRowsuseSelector(({contactApp}) => contactApp.totalContacts);
  const totalContacts = customer_paginateCount

  console.log(salesManByPagination, "salesManByPagination")

  // const {
  //     setModalStatusHandler,
  //     setModalTypeHandler,
  //     selectData,
  //     setselectData,
  //     setLoaderStatusHandler,
  //     locationId,
  //     commoncookie,
  //   } = useContext(Context);

   const dispatch = useDispatch();

  const {messages} = useIntl();
  useEffect(()=>{
    if(type === 3){
    requestForToken(() => {}, setToken);
    }
  }, [])
  
//   useEffect(() => {
//     const fetchSalesMen = async () => {
//         try {
//             const paginationData = {
//                 pageCount: 0,
//                 numPerPage: 50,
//                 page: "Contact"
//           };
          
//           const data = { customer: "null" };

//           await dispatch(listSalesManPaginateAction(paginationData));
//           await dispatch(listCustomerSalesManAction(data));


//         } catch (error) {
//             console.error("Error fetching Salesmen:", error);
//         }
//     };

//     fetchSalesMen();
// }, []);

  const handleCSVUpload = (data) => {
    if (headerLocationId !== 'null') {
      const xl_data = data.map((i) => ({
        ['company_name']: i.company_name, 
        ['first_name']: i.first_name?.replace(/[^\w\s\r\n|\n|\r]/gm, "").trim(),
        ['phone_number']: parseInt(i.phone_number),
        ['zip']: parseInt(i.zip),
        ['city']: i.city?.replace(/[^\w\s\r\n|\n|\r]/gm, "").trim(),
        ['state']: i.state?.replace(/[^\w\s\r\n|\n|\r]/gm, "").trim(),
        ['credit_days']: parseInt(i.credit_days),
        ['tcs']: parseInt(i.tcs),
        ['taxable']: i.gst_number === undefined ? 0 : 1,
        ['tax_id']: i.gst_number === undefined ? null : i.gst_number?.replace(/[^\w\s\r\n|\n|\r]/gm, "").trim(),
        ['gender']: i.gender?.replace(/[^\w\s\r\n|\n|\r]/gm, "").trim() === 'Male' ? parseInt(1) : parseInt(2),
        ['email']: i.email === undefined ? null : i.email,
        ['address']: i.address === undefined ? null : i.address?.replace(/[^\w\s\r\n|\n|\r]/gm, "").trim(),
        ['area']: i.area === undefined ? null : i.area?.replace(/[^\w\s\r\n|\n|\r]/gm, "").trim(),
        ['customer_type']: type,
        ['amount']: i.opening_balance,
        ['debit']: type === 2 ? Math.sign(i.opening_balance) === -1 ? (i.opening_balance) : 0 : Math.sign(i.opening_balance) === -1 ? 0 : (i.opening_balance) * -1,
        ['credit']: type === 2 ? Math.sign(i.opening_balance) === -1 ? 0 : (i.opening_balance) : Math.sign(i.opening_balance) === -1 ? (i.opening_balance) * -1 : 0,
        ['location_id']: headerLocationId
      }));
      // Bulkinsert(xl_data);
    } else {
      setOpenAlert(true);
    }
  };
  

  const encodeImageFileAsURL = async(file) => {
    const paginationData = {
      pageCount: 0,
      numPerPage: 50,
      page: "Contact"
    };
    await dispatch(listSalesManPaginateAction(paginationData));

    // if(headerLocationId !== 'null'){
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
      
      fileReader.onload = (e) => {
        const bufferArray = e.target.result;
        
        const wb = XLSX.read(bufferArray, { type: "buffer" });
  
        const wsname = wb.SheetNames[0];
  
        const ws = wb.Sheets[wsname];
   
        const data = XLSX.utils.sheet_to_json(ws);

        const requiredFields = ["Company Name", "Zip Code", "City", "State", "Country", "Primary Contact"];

        const allowedGSTINTypes = new Set([
         "REG", "CMP", "URB", "SEZ", "CTP", "NRTP", "ISD", "ECO", "TDS", "GOVUIN"
        ].map(type => type.toLowerCase()));

        let missingRequiredRows = [];
        let validRows = [];
        let invalidGSTINTypeRows = [];
        let matchedSalesmenList = [];
        let unmatchedSalesmenList = [];
        let pincodeInvalidRows = []

        data.forEach((row) => {
          // let dynamicRequiredFields = [...requiredFields];

          // if (row["GSTIN"] && row["GSTIN"].toString().trim() !== "") {
          //   dynamicRequiredFields.push("GSTIN Type");
          // }
          const zipRegex = /^[1-9][0-9]{5}$/;
          let missingFields = requiredFields?.filter(field => !row[field] || row[field].toString().trim() === "");
          if (missingFields.length > 0) {
            missingRequiredRows.push({ ...row, missingFields: missingFields.join(", ") });
          } else if (row["GSTIN Type"] && (!row["GSTIN"] || row["GSTIN"].toString().trim() === "")) { 
            missingRequiredRows.push({ ...row, reason: "GSTIN Type present but GSTIN missing" });
          }
          else if(!zipRegex.test(row['Zip Code'])){
            pincodeInvalidRows.push({ ...row, invalid: "Enter a valid 6-digit pincode" })
          } 
          else{
            validRows.push(row);
          }

          if (row["GSTIN"]) {
            const gstinType = row["GSTIN Type"] ? row["GSTIN Type"].toString().trim().toLowerCase() : "";

              if (!allowedGSTINTypes.has(gstinType)) {
              invalidGSTINTypeRows.push({
                companyName: row["Company Name"],
                gstin: row["GSTIN"],
                gstintype: row["GSTIN Type"]
              });
            }
          }
        });

        if (type === 1) {
          if (salesManByPagination.length === 0) {
              matchedSalesmenList.push([]);  
              setUnmatchedSalesmen([]); 
          } else {
            validRows = validRows.filter((row) => {
              const salesmanId = row["Salesman ID"];
        
              // Check only if "Salesman ID" exists and is not empty
              if (salesmanId && salesmanId.toString().trim() !== "") {
                const isMatched = salesManByPagination.some(
                  (salesman) => salesman.employee_id === Number(salesmanId)
                );
        
                if (isMatched) {
                  matchedSalesmenList.push(row);
                } else {
                  unmatchedSalesmenList.push(row);
                }
        
                return isMatched; // Only return matched rows for validRows
              }
        
              // If "Salesman ID" is not present, just include the row
              return true;
            });
        
            setUnmatchedSalesmen(unmatchedSalesmenList);
          }
      } else {
          matchedSalesmenList.push([]);
          setUnmatchedSalesmen([]);  
      }
        setValidRows(validRows);

        if (missingRequiredRows.length > 0 || invalidGSTINTypeRows.length > 0 || unmatchedSalesmenList?.length > 0 || validRows.length > 0 || pincodeInvalidRows.length > 0) {
          console.log("lklklklk")
          setMissingRequiredRows(missingRequiredRows);
          setInvalidGSTINTypeRows(invalidGSTINTypeRows);
          setPincodeInvalidRows(pincodeInvalidRows)
          setShowGSTINDialog(true);
          return;
        } 
      };
     
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  
  // } else {
  //   setOpenAlert(true);
  // }
  };
  
  const encodeemployeeImageFileAsURL = (file) => {
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
  
      fileReader.onload = async (e) => {
        const bufferArray = e.target.result;
  
        const wb = XLSX.read(bufferArray, { type: "binary" , cellDates : true});
  
        const wsname = wb.SheetNames[0];
  
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, {raw: false});
      
        // const temp_1_xl_data =  data.filter(i =>  i.role_name) 
        const xl_data = await Promise.all( data.map(async(i) => { 
          let tempObj =  {
                ['role_name']: i.role_name === undefined ? null : i.role_name?.replace(/[^\w\s\r\n|\n|\r]/gm, "").trim(),
                ['location_id']: i.location_id === undefined ? null : i.location_id?.toString().trim().split(',').map((d) =>({location_id : d})),
                ['first_name']: i.first_name?.replace(/[^\w\s\r\n|\n|\r]/gm, "").trim(),
                ['phone_number']: parseInt(i.phone_number),
                ['zip']: parseInt(i.zip),
                ['city']: i.city?.replace(/[^\w\s\r\n|\n|\r]/gm, "").trim(),
                ['state']: i.state?.replace(/[^\w\s\r\n|\n|\r]/gm, "").trim(),
                ['country']:i.country?.replace(/[^\w\s\r\n|\n|\r]/gm, "").trim(),
                ['gender']: i.gender?.replace(/[^\w\s\r\n|\n|\r]/gm, "").trim() === 'Male' ? parseInt(1) : parseInt(2),
                ['email']: i.email === undefined ? null : i.email,
                ['address']: i.address === undefined ? null : i.address?.replace(/[^\w\s\r\n|\n|\r]/gm, "").trim(),
                ['area']: i.area === undefined ? null : i.area?.replace(/[^\w\s\r\n|\n|\r]/gm, "").trim(),
                ['username']: i.username.trim(),
                ['password']: i.password.trim(),
                ['bike_name']: i.bike_name === undefined ? null : i.bike_name.replace(/[^\w\s\r\n|\n|\r]/gm, "").trim(),
                ['model']: i.model === undefined ? null : parseInt(i.model),
                ['mileage']: i.mileage === undefined ? null : parseInt(i.mileage),
                ['dl_number'] : i.driving_licen_number === undefined ? null : i.driving_licen_number?.replace(/[^\w\s\r\n|\n|\r]/gm, "").trim(),
                ['expiry_date'] : i.expiry_date === undefined ? null : moment(i.expiry_date).format('YYYY-MM-DD'),
                ['token'] : token,
                ['employeeId'] : parseInt(i.employee_code),
                ['category_id'] : parseInt(i.employee_category),
                ['designation']:i.designation === undefined ? null : i.designation?.replace(/[^\w\s\r\n|\n|\r]/gm, "").trim(),
                ['primary_location']:parseInt(i.primary_location),
                ['dateOfJoining']:moment(i.date_of_joining, "DD-MM-YYYY").format("YYYY-MM-DD"),
                ['dob']:moment(i.date_of_joining, "DD-MM-YYYY").format("YYYY-MM-DD"),
                ['department_id']: i.department === undefined ? null : i.department?.toString().trim().split(',').map((d) =>({id : d}))

              }

            return tempObj;
           //}
            
        }));

        resolve(xl_data);
        
       
      };
     
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  
    promise.then((d) => {
     // setContacts(d);
  
        userBulkinsert(d)
    });
   

  };

 

  
 
  const encodeIndividualFileAsURL = (file) => {
    // if (headerLocationId !== 'null') {
      const promise = new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
  
        fileReader.onload = (e) => {
          try {
            const bufferArray = e.target.result;
            const wb = XLSX.read(bufferArray, { type: "buffer" });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);
  
            // Extract and validate data
            const xl_data = data.map((i) => {
              const first_name = i["First Name"] ? String(i["First Name"]).trim() : null;
              const last_name = i["Last Name"]?.toUpperCase() === "NULL" || !i["Last Name"] ? null : String(i["Last Name"]).trim();
              const phone_number = i["Primary Contact"] && !isNaN(i["Primary Contact"]) ? parseInt(i["Primary Contact"]) : null;
              const zip = i["Zip Code"] && !isNaN(i["Zip Code"]) ? parseInt(i["Zip Code"]) : null;
              const city = i["City"] ? String(i["City"]).trim() : null;
              const state = i["State"] ? String(i["State"]).trim() : null;
              const country = i["Country"] ? String(i["Country"]).trim() : null;
              const gender = i["Gender"]?.trim() === "Male" ? 1 : 2;
              const email = i["Email"] || null;
              const address = i["Full Address"] ? String(i["Full Address"]).trim() : null;
  
              return { first_name, last_name, phone_number, zip, city, state, country, gender, email, address };
            });
  
            const missingFields = [];

            xl_data.forEach((item, index) => {
              if (!item.first_name || !item.state || !item.country || !item.city || !item.phone_number) {
                missingFields.push(`Row ${index + 2}`); 
              }
            });
            
            console.log("missingFields",missingFields)
            if (missingFields.length > 0) {
               ErrormsgAlert(
                          dispatch,
                         `Some Mandatory fields are missing in: ${missingFields.join(", ")}.Please check excel`
                        );
            }else{
              Bulkinsert(xl_data);
              allClose();
              uploadClose();
            }
          
          } catch (error) {
            console.log("errordd",error)
            ErrormsgAlert(dispatch, "Error processing the file. Please check the format.");
          }
        };
  
        fileReader.onerror = (error) => {
          reject(error);
        };
      });
  
    // } else {
    //   setOpenAlert(true);
    // }
  };
  const handleCSVUploademployee = (data) => {
    if (headerLocationId !== 'null') {
      const temp_1_xl_data = data.filter((i) => i.role_name);
      const xl_data = temp_1_xl_data.map((i) => ({
        ['role_name']: i.role_name?.replace(/[^\w\s\r\n|\n|\r]/gm, '').trim(),
        ['location_id']: i.location_id
          ?.toString()
          .trim()
          .split(',')
          .map((d) => ({ location_id: d })),
        ['first_name']: i.first_name?.replace(/[^\w\s\r\n|\n|\r]/gm, '').trim(),
        ['phone_number']: parseInt(i.phone_number),
        ['zip']: parseInt(i.zip),
        ['city']: i.city?.replace(/[^\w\s\r\n|\n|\r]/gm, '').trim(),
        ['state']: i.state?.replace(/[^\w\s\r\n|\n|\r]/gm, '').trim(),
        ['country']: i.country?.replace(/[^\w\s\r\n|\n|\r]/gm, '').trim(),
        ['gender']:
          i.gender?.replace(/[^\w\s\r\n|\n|\r]/gm, '').trim() === 'Male' ? parseInt(1) : parseInt(2),
        ['email']: i.email === undefined ? null : i.email,
        ['address']: i.address === undefined ? null : i.address?.replace(/[^\w\s\r\n|\n|\r]/gm, '').trim(),
        ['area']: i.area === undefined ? null : i.area?.replace(/[^\w\s\r\n|\n|\r]/gm, '').trim(),
        ['username']: i.username.trim(),
        ['password']: i.password.trim(),
        ['bike_name']: i.bike_name === undefined ? null : i.bike_name.replace(/[^\w\s\r\n|\n|\r]/gm, '').trim(),
        ['model']: i.model === undefined ? null : parseInt(i.model),
        ['mileage']: i.mileage === undefined ? null : parseInt(i.mileage),
        ['dl_number']: i.driving_licen_number === undefined ? null : i.driving_licen_number?.replace(/[^\w\s\r\n|\n|\r]/gm, '').trim(),
        ['expiry_date']: i.expiry_date === undefined ? null : moment(i.expiry_date).format('YYYY-MM-DD'),
        ['token']: token,
      }));
      // userBulkinsert(xl_data)
    } else {
      setOpenAlert(true);
    }
  };

  const handleConfirmUpload = (rows) => {
    Bulkinsert(rows);
    setShowGSTINDialog(false);
  };


  const allClose = () => {
    setOpenDialog(false);
  };
  const uploadClose = () => {
    setOpen(false);
  };

  const handleCloseDialog = () => {
    console.log("KKJKJKJK")
    
    
    // Reset the necessary state when dialog is closed
    setMissingGSTINTypeRows([]);
    setInvalidGSTINTypeRows([]);
    setMissingRequiredRows([]);
    setValidRows([]);
    setUnmatchedSalesmen([])
    setShowGSTINDialog(false);
    
};
console.log(missingRequiredRows, "1missingRequiredRows")

  return (
    <>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {/* <CheckBox
          checkedContacts={checkedContacts}
          setCheckedContacts={setCheckedContacts}
        /> */}

        {/* <AppSearchBar
          iconPosition='right'
          overlap={false}
          value={filterText}
          onChange={(event) => onSetFilterText(event.target.value)}
          placeholder={'Search here'}
        /> */}
        <CommonSearch
          searchVal={filterText}
          requestSearch={(event) => requestSearch(event.target.value)}
          cancelSearch={cancelSearch}
        />
        {checkedContacts.length > 0 ? (
          <ContactCheckedActions
            onSelectContactsForDelete={onSelectContactsForDelete}
            checkedContacts={checkedContacts}
            setCheckedContacts={setCheckedContacts}
          />
        ) : null}

        <ViewSelectButtons
          encodeImageFileAsURL={encodeImageFileAsURL}
          encodeemployeeImageFileAsURL={encodeemployeeImageFileAsURL}
          encodeIndividualFileAsURL={encodeIndividualFileAsURL}
          headerLocationId={headerLocationId}
          type={type}
          pageView={pageView}
          onChangePageView={onChangePageView}
          userBulkinsert={userBulkinsert}
          allClose={allClose}
          uploadClose={uploadClose}
          setOpen={setOpen}
          setOpenDialog={setOpenDialog}
          openDialog={openDialog}
          open={open}
          handleFilterApply={handleFilterApply}
          filteredValue={filteredValue}
          setFilteredValue={setFilteredValue}
          handleFilterClear={handleFilterClear}
        />
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        {customer_paginate && customer_paginate.length > 0 ? (
          <AppsPagination
            sx={{ml: 2}}
            count={totalContacts}
            page={page}
            onPageChange={onPageChange}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[20, 50, 100]}
            onRowsPerPageChange={onRowsPerPageChange}
          />
        ) : null}
      </Box>
    {/* {type !==3 ?
        <div style={{ display: 'flex' }}>
          <input
            style={{ display: 'none' }}
            id="index-file-upload-545"
            type="file"
            onChange={(e) => {
              const file = e.target.files[0];
              encodeImageFileAsURL(file);
            }}
            disabled={headerLocationId !== 'null' ? false : true}
          />
          <label style={{ display: 'flex', cursor: 'pointer' }} htmlFor="index-file-upload-545">
            <UploadFileIcon onClick={() => {
              if (headerLocationId === 'null') {
                alert('Choose location')
              }
            }} />
          </label>
        </div>
        :
        <div style={{ display: 'flex' }}>
          <input
            style={{ display: 'none' }}
            id="index-file-upload-565"
            type="file"
            onChange={(e) => {
              const file = e.target.files[0];
              encodeemployeeImageFileAsURL(file);
              // alert('jiiii')
            }}
            // disabled={headerLocationId !== 'null' ? false : true}
          />
          <label style={{ display: 'flex', cursor: 'pointer' }} htmlFor="index-file-upload-565">
            <UploadFileIcon
            // onClick={() => {
            //   if (headerLocationId === 'null') {
            //     alert('Choose location')
            //   }
            // }}
             />
          </label>
        </div>
} */}
   <LocationAlert open={openAlert} onClose={ ()=> setOpenAlert(false)}/>

   <GSTINDialog
        open={showGSTINDialog} 
        onClose={() => setShowGSTINDialog(false)}
      handleCloseDialog={handleCloseDialog}
      missingGSTINTypeRows={missingGSTINTypeRows} 
      invalidGSTINTypeRows ={invalidGSTINTypeRows}
      missingRequiredRows={missingRequiredRows}
      validRows = {validRows}
      unmatchedSalesmenList = {unmatchedSalesmenList}
      onConfirmUpload={handleConfirmUpload}
      headerLocationId={headerLocationId} 
      Bulkinsert={Bulkinsert}
      type={type}
      allClose={allClose}
      uploadClose={uploadClose}
      pincodeInvalidRows ={pincodeInvalidRows}
    />
    
  
    </>
  );
};

export default ContactHeader;

ContactHeader.propTypes = {
  checkedContacts: PropTypes.array,
  setCheckedContacts: PropTypes.func,
  filterText: PropTypes.string,
  onSetFilterText: PropTypes.func,
  onSelectContactsForDelete: PropTypes.func,
  page: PropTypes.number,
  onPageChange: PropTypes.func,
  rowsPerPage: PropTypes.number,
  onRowsPerPageChange: PropTypes.func,
  pageView: PropTypes.string.isRequired,
  onChangePageView: PropTypes.func,
};
