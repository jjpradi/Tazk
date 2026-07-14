import React, { useContext, useEffect, useRef, useState } from 'react';
import { Typography, Container, Grid, Paper, Button, IconButton, Divider, Menu, MenuItem, Card, CardContent, Tooltip, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, FormControl, InputLabel, Select, Table, TableHead, TableRow, TableCell, TableBody,
    FormHelperText,
    Box, } from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import AddCardIcon from '@mui/icons-material/AddCard';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import SchoolIcon from '@mui/icons-material/School';
import CardTravelIcon from '@mui/icons-material/CardTravel';
import InfoIcon from '@mui/icons-material/Info';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
// import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { useDispatch, useSelector } from 'react-redux';
import context from '../../../context/CreateNewButtonContext'
import apiCalls from 'utils/apiCalls';
import { ledgerMigrationNameAction, listMigrationAction, updateMigrationAction, craeteAccountsMigration, listAccountGroup, handleExistupdateAction, createSundryAccounts } from 'redux/actions/ledger_actions';
import ConfirmationDialog from '../../Migration/ConfirmationDialog';
import AddDocument from './Adddocument';
import NewAccountsComponent from '../../Migration/NewAccounts';
import moment from 'moment';
import { string } from 'prop-types';
import NewsundryAcc from '../../Migration/NewsundryAcc';
import LedgerRow from '../../Migration/LedgerRow';
import {useCustomFetch} from 'utils/useCustomFetch';
import '../Migration/csvstyle.css'
import OriginalDocument from './originaldialog';
import { Helmet } from 'react-helmet-async';
import AccountDialog from '../../Migration/AccountDialog';
import CommonToolTip from '../../../components/ToolTip';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import { titleURL } from 'http-common';
import { getEmpbasecompanyAction } from 'redux/actions/attendance_actions';
import { completedIndexValue, employeeDetailAction, EmployeeVerificationDetail, uploadFile } from 'redux/actions/userCreation_actions';
import StepperDesign from '../../../components/employeeVerification/stepper';
import EmployeeDetails from '../../../components/employeeVerification/employeeDetails'

export default function EmployeeVerification(props) {
    const { handleVClose } = props
    const [showDropdownIndex, setShowDropdownIndex] = useState(null);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentFinancial = new Date(currentYear, 3, 1);
    const [financialStartDate, setFinancialStartDate] = useState(currentFinancial);
    const [ledgerData, setLedgerData] = useState([]);
    const [changedData, setChangedData] = useState({});
    const [modifiedItems, setModifiedItems] = useState([]);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [isAddingAccount, setIsAddingAccount] = useState(false);
    const [openNewsundry, setopenNewsundry] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [parsedDataBySection, setParsedDataBySection] = useState({});
    const [accountDataList, setAccountDataList] = useState([]);
    const [savedData, setSavedData] = useState({ index: null, formValData: null });
    const [editableRows, setEditableRows] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [csvData, setCSVData] = useState(null);
    const [matchedNames, setMatchedNames] = useState([]);
    const [unmatchedNames, setUnmatchedNames] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [csvKey, setCSVKey] = useState(0);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogAccountName, setDialogAccountName] = useState('');
    const [dialogMessage, setDialogMessage] = useState('');
    const [showGrid, setShowGrid] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);
    const [empDetails, setEmpDetails] = useState({});
    const customFetch = useCustomFetch();

    const [formValues, setFormValues] = useState({employee_id : null, name : null, file : null})
    const [formErrors, setFormErrors] = useState({employee_id : null})
    const [fetchDatas, setFetchDatas] = useState()
    // const [formValue, setFormValue] = ([
    //     {
    //     name : '', reason : ''
    //    },
    // ])
    

    const dispatch = useDispatch();

    // console.log('empDetails', empDetails);

    const {
        ledgerReducer: { migrationList, ledger_migration, list_groups },
        attendanceReducer: {  get_empbasecompany},
        UserCreationReducer: {empVerificationDetail, completed_index_value}

    } = useSelector((state) => state);
    const { setLoaderStatusHandler, setModalTypeHandler, headerLocationId } = useContext(context);

    useEffect(() => {
        // dispatch(listMigrationAction());
        dispatch(getEmpbasecompanyAction())
    }, []);

    useEffect(()=>{
        if (formValues.employee_id !== null) {
            dispatch(completedIndexValue(formValues.employee_id))
            dispatch(employeeDetailAction(formValues.employee_id, (response) => {
                setEmpDetails(response)
            }))
        }
    }, [formValues.employee_id])
    
    // console.log('empVerificationDetail', empVerificationDetail)

    const handleAddAccountData = (newData) => {
        setAccountDataList(newData);
    };
    // console.log('accountdatalits', accountDataList)

    useEffect(() => {
    }, [accountDataList])


    const handleSave = async (index, formValData) => {
        setSavedData({ index, formValData });

    };

    const handleImportAdd = async () => {
        const { index, formValData } = savedData;
        const modifiedAccounts = formValData.map(formValData => {
            return {
                ...formValData,
                location_id: headerLocationId,
                trans_date: moment(financialStartDate).format('YYYY-MM-DD'),
                opening_balance: formValData.debit === null ? parseFloat(formValData.credit) * -1 : parseFloat(formValData.debit) * +1,
                type: "Ledger creation"
            };
        });
        const response = await dispatch(createSundryAccounts({ data: modifiedAccounts, location_id: headerLocationId, type: 'Ledger creation', trans_date: moment(financialStartDate).format('YYYY-MM-DD') }));

        const updatedParsedDataBySection = { ...parsedDataBySection };
        updatedParsedDataBySection[index] = [];
        let accountNamesWithStatus420 = [];
        response.forEach(response => {
            if (response.status === 420) {
                accountNamesWithStatus420.push(response.accountName);
                setIsDialogOpen(true);
            }
        });

        setDialogAccountName(accountNamesWithStatus420);

        setParsedDataBySection(updatedParsedDataBySection);
        setShowDropdownIndex(null);

    }

    const handleSaveButtonClick = () => {
        setConfirmationOpen(true);
    };

    const toggleAccountAddition = () => {
        setIsAddingAccount(!isAddingAccount);
    };

    const handleOpensundry = () => {
        setopenNewsundry(!openNewsundry);
    };

    const handleNewsundry = (sundryValue) => {
        if (headerLocationId === 'null') {
            setOpenAlert(true)
            return;
        }
        const modifiedNewAccount = {
            ...sundryValue,
            location_id: headerLocationId,
            trans_date: moment(financialStartDate).format('YYYY-MM-DD'),
            opening_balance:
                sundryValue.debit === '' ? parseFloat(sundryValue.credit) * -1 : parseFloat(sundryValue.debit) * +1,
            type: "Ledger creation"
        };

        setAccounts(prevAccounts => [...prevAccounts, modifiedNewAccount]);

        apiCalls(dispatch(craeteAccountsMigration(modifiedNewAccount)))

        handleOpensundry();
        setShowDropdownIndex(null);


    };

    const handleAddAccount = async () => {
        try {
            const modifiedAccounts = accountDataList.map(newAccount => {
                let modifiedNewAccount = {
                    ...newAccount,
                    location_id: headerLocationId,
                    trans_date: moment(financialStartDate).format('YYYY-MM-DD'),
                    opening_balance: newAccount.debit === '' ? parseFloat(newAccount.credit) * -1 : parseFloat(newAccount.debit) * +1,
                    type: "Ledger creation"
                };

                // Modify the account data if the accountGroup and parentAccountId are the same
                if (newAccount.accountGroup === newAccount.parentAccountId) {
                    modifiedNewAccount = {
                        ...modifiedNewAccount,
                        parentAccountId: null
                    };
                } else {
                    modifiedNewAccount = {
                        ...modifiedNewAccount,
                        accountGroup: newAccount.parentAccountId,
                        parentAccountId: newAccount.accountGroup
                    };
                }

                return modifiedNewAccount;
            });

            const response = await dispatch(craeteAccountsMigration({ data: modifiedAccounts, location_id: headerLocationId, type: 'Ledger creation',trans_date: moment(financialStartDate).format('YYYY-MM-DD') }));

            setAccountDataList([]);
        } catch (error) {
            console.error('Error adding accounts:', error);
        }
    };

    const handleEdit = (subIndex) => {
        setEditableRows((prevEditableRows) => {
            const updatedEditableRows = [...prevEditableRows];
            updatedEditableRows[subIndex] = !updatedEditableRows[subIndex];
            return updatedEditableRows;
        });
    };



    const handleExistupdate = (existId, updateValue) => {
        if (headerLocationId === 'null') {
            setOpenAlert(true)
            return;
        }
        let existDataArray = {
            id: existId,
            opening_balance:
                updateValue.debit === '' ? parseFloat(updateValue.credit) * -1 : parseFloat(updateValue.debit) * +1,
            trans_date: moment(financialStartDate).format('YYYY-MM-DD'),
        }
        dispatch(handleExistupdateAction({ data: existDataArray, location_id: headerLocationId }))
        toggleAccountAddition();
        setShowDropdownIndex(null);
    }

    const resetAllStates = () => {
        setShowDropdownIndex(null);
        setFinancialStartDate(currentFinancial);
        setLedgerData([]);
        setChangedData({});
        setModifiedItems([]);
        setConfirmationOpen(false);
        setIsAddingAccount(false);
        setopenNewsundry(false);
        setAccounts([]);
        setParsedDataBySection({});
        setAccountDataList([]);
        setSavedData({ index: null, formValData: null });
        setEditableRows([]);
        setIsLoading(false);
        setCSVData(null);
        setMatchedNames([]);
        setUnmatchedNames([]);
        setShowDialog(false);
    };

    const handleConfirm = async () => {
        setIsLoading(true);

        if (modifiedItems.length === 0 && accountDataList.length === 0 && savedData.formValData === null) {
            alert("No changes to confirm.");
            setIsLoading(false);
            return;
        }
        const isAnyRowEditable = editableRows.some((isEditable) => isEditable);

        if (isAnyRowEditable) {
            alert('Please finish editing before submitting.');
            setIsLoading(false);
            return;
        }

        if (headerLocationId === 'null') {
            setOpenAlert(true)
            setIsLoading(false);
            return;
        }

        try {
            // previous code will use later
            // const modifiedDataArray = modifiedItems.map(id => ({
            //     id,
            //     opening_balance: changedData[id].credit === "" ? changedData[id].debit * +1 : changedData[id].credit * -1,
            //     trans_date: moment(financialStartDate).format('YYYY-MM-DD')
            // }));

            // // const modifiedDataArray = modifiedItems.map(id => ({
            // //     id,
            // //     debit: changedData[id].credit === "" ? changedData[id].debit * +1 : null,
            // //     credit: changedData[id].debit  === "" ? changedData[id].credit * -1 : null,
            // //     balance: changedData[id].credit === "" ? changedData[id].debit * +1 : changedData[id].credit * -1,
            // //     trans_date: moment(financialStartDate).format('YYYY-MM-DD')
            // // }));


            // if (modifiedItems.length > 0) {
            //     const response = await dispatch(updateMigrationAction({ data: modifiedDataArray, location_id: headerLocationId }));
            // }

            // setChangedData(prevData => {
            //     const newData = { ...prevData };
            //     modifiedItems.forEach(id => {
            //         delete newData[id];
            //     });
            //     return newData;
            // });
            // setModifiedItems([]);

            // If there are pending accounts in accountDataList, add them
            if (accountDataList.length > 0) {
                handleAddAccount();
            }
            if (savedData.formValData !== null) {
                handleImportAdd();
            }

            resetAllStates();
        } catch (error) {
            console.error('API error:', error);
        }
        setIsLoading(false);
        setConfirmationOpen(false);
    };


    const handleClose = () => {
        setConfirmationOpen(false);
    };
    useEffect(() => {
        if (ledger_migration.length > 0) {
            const initialData = Object.fromEntries(
                ledger_migration.map((item) => [item.id, { debit: item.debit || null, credit: item.credit || null, opening_balance: item.opening_balance || null }])
            );
            setChangedData(initialData);
        }
    }, [ledger_migration]);


    const handleDebitChange = (id, value) => {
        setChangedData(prevData => ({
            ...prevData,
            [id]: {
                ...prevData[id],
                debit: value,
                credit: value ? '' : prevData[id]?.credit || '',
            },
        }));

        if (!modifiedItems.includes(id)) {
            setModifiedItems(prevItems => [...prevItems, id]);
        }
    };


    const handleCreditChange = (id, value) => {
        setChangedData(prevData => ({
            ...prevData,
            [id]: {
                ...prevData[id],
                credit: value,
                debit: value ? '' : prevData[id]?.debit || '',
            },
        }));

        if (!modifiedItems.includes(id)) {
            setModifiedItems(prevItems => [...prevItems, id]);
        }
    };



    const titlesWithIcons = 
         [
            {
                title: "Identity Verification",
                icon: <AddCardIcon color="secondary" />,
                infoIcon: (
                    <Tooltip title="Pancard, DL, Aadhar original check and document upload">
                        <InfoIcon style={{ fontSize: '1rem', color: 'gray', marginLeft: '0.5rem' }} />
                    </Tooltip>
                ),
            },
            {
                title: "Address Verification",
                icon: <AddLocationAltIcon color="secondary" />,
                infoIcon: (
                    <Tooltip title="VoterId,Pancard, DL, Aadhar, Ration Card, Gas Bill Verification and  document upload">
                        <InfoIcon style={{ fontSize: '1rem', color: 'gray', marginLeft: '0.5rem' }} />
                    </Tooltip>
                ),
            },
            {
                title: "Employment Verification",
                icon: <AddCardIcon color="secondary" />,
                infoIcon: (
                    <Tooltip title="Mail and Phone call verification on previous employement">
                        <InfoIcon style={{ fontSize: '1rem', color: 'gray', marginLeft: '0.5rem' }} />
                    </Tooltip>
                ),
            },
            {
                title: "Educational Qualification Check",
                icon: <SchoolIcon  color="secondary" />,
                infoIcon: (
                    <Tooltip title="(TC, Marksheet, Graduation Certificate) Both school and college">
                        <InfoIcon style={{ fontSize: '1rem', color: 'gray', marginLeft: '0.5rem' }} />
                    </Tooltip>
                ),
            },
            {
                title: "Driving License Verification",
                icon: <CardTravelIcon color="secondary" />,
                infoIcon: (
                    <Tooltip title="Driving License expiry date and original verification, License type">
                        <InfoIcon style={{ fontSize: '1rem', color: 'gray', marginLeft: '0.5rem' }} />
                    </Tooltip>
                ),
            },
            {
                title: "Social Media Check",
                icon: <ConnectWithoutContactIcon color="secondary" />,
                infoIcon: (
                    <Tooltip title="facebook, linkedin, insta accounts check and page url">
                        <InfoIcon style={{ fontSize: '1rem', color: 'gray', marginLeft: '0.5rem' }} />
                    </Tooltip>
                ),
            },
            {
                title: "Criminal Record Check",
                icon: <GraphicEqIcon color="secondary" />,
                infoIcon: (
                    <Tooltip title="Nearby police station verification">
                        <InfoIcon style={{ fontSize: '1rem', color: 'gray', marginLeft: '0.5rem' }} />
                    </Tooltip>
                ),
            },
            {
                title: "Drug Test Check",
                icon: <VaccinesIcon color="secondary" />,
                // infoIcon: (
                //     <Tooltip title="">
                //         <InfoIcon style={{ fontSize: '1rem', color: 'gray', marginLeft: '0.5rem' }} />
                //     </Tooltip>
                // ),
            },
            {
                title: "Family Background Verification",
                icon: <EmojiPeopleIcon color="secondary" />,
                // infoIcon: (
                //     <Tooltip title="">
                //         <InfoIcon style={{ fontSize: '1rem', color: 'gray', marginLeft: '0.5rem' }} />
                //     </Tooltip>
                // ),
            },
            {
                title: "Current Residence Lat Long Check",
                icon: <DirectionsWalkIcon color="secondary" />,
                infoIcon: (
                    <Tooltip title="Match Lat Long with address proof">
                        <InfoIcon style={{ fontSize: '1rem', color: 'gray', marginLeft: '0.5rem' }} />
                    </Tooltip>
                ),
            },
            {
                title: "Passport & Aadhar Verification",
                icon: <CreditScoreIcon  color="secondary" />,
                infoIcon: (
                    <Tooltip title="Document Upload and original verification">
                        <InfoIcon style={{ fontSize: '1rem', color: 'gray', marginLeft: '0.5rem' }} />
                    </Tooltip>
                ),
            },
            // {
            //     title: "Accounts Payables",
            //     icon: <AccountBalanceIcon color="primary" />,
            //     infoIcon: (
            //         <Tooltip title="Information about Accounts Payables">
            //             <InfoIcon style={{ fontSize: '1rem', color: 'gray', marginLeft: '0.5rem' }} />
            //         </Tooltip>
            //     ),
            // },
            // ...migrationList.map((item, index) => ({
            //     title: item.name,
            //     icon: <AccountBalanceIcon color={index % 2 === 0 ? 'secondary' : 'primary'} />,
            // })),
        ]
      
    const handleCardClick = async (index) => {
        // console.log('indexxxxx', index)
        if (showDropdownIndex === index) {
            setShowDropdownIndex(null);
        }
        else {
            try {
                // const response = await dispatch(ledgerMigrationNameAction({
                //     ledger_name: titlesWithIcons[index].title,
                //     financialStartDate: moment(financialStartDate).format('YYYY-MM-DD')  
                // }));

                dispatch(EmployeeVerificationDetail({
                    index_value : index,
                    employee_id : formValues.employee_id
                }))


                // Initialize ledgerData with the response data
                // const initialData = response.map(item => ({
                //     parentName: item.accountName,
                //     debit: item.debit || null,
                //     credit: item.credit || null,
                //     opening_balance: item.opening_balance || null,
                //     accountGroup: item.accountGroup || null,
                //     id: item.id
                // }));
                // setLedgerData(initialData);
                setShowDropdownIndex(index);
                setShowGrid(true)
                setIsAddingAccount(false);
            } catch (error) {
                console.error('API error:', error);
            }
        }
    };


    const fetchNamesFromAPI = async (data, sectionIndex) => {
        // console.log('handlecsvdata', data)
        try {
            setIsLoading(true);
            const parent_name = sectionIndex + 1 === 1 ? 'Sundry Debtors' : 'Sundry Creditors';

            // Dispatch the action to get matched and unmatched data
            // const apiData = await dispatch(handleExistupdateAction({
            //     data,
            //     name: parent_name,
            //     trans_date: moment(financialStartDate).format('YYYY-MM-DD')
            // }));

            // Extract matched and unmatched data
            // const matched = apiData.matchedData || [];
            // const unmatched = apiData.unmatchedData || [];

            // Update state variables accordingly
            setCSVData(data);
            // setMatchedNames(matched);


            // Update parsedDataBySection with matched data
            // setParsedDataBySection((prevState) => ({
            //     ...prevState,
            //     [sectionIndex]: matched,
            // }));

            // Set unmatched names and showDialog if unmatched data is present
            // setUnmatchedNames(unmatched);
            // if (unmatched.length) {
            //     setShowDialog(true);
            // }

            // handleCardClick(sectionIndex);
            setCSVKey((prevKey) => prevKey + 1);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.error('Error fetching data from API:', error);
        }
    };

    // console.log('csvdata', csvData)
    const handleCSVFile = (data, sectionIndex) => {

        // Call the function to fetch names from the API
        // console.log('handlecsvfile', data, sectionIndex)
        fetchNamesFromAPI(data, sectionIndex);
    };


    const handleCancel = (index) => {
        const updatedParsedData = { ...parsedDataBySection };
        updatedParsedData[index] = [];
        setParsedDataBySection(updatedParsedData);
        // setShowDropdownIndex(null)
    };

    const calculateTotalDebit = () => {
        let totalDebit = 0;

        Object.values(parsedDataBySection).forEach((sectionData) => {
            sectionData.forEach((entry) => {
                totalDebit += parseFloat(entry.debit) || 0;
            });
        });

        accountDataList.forEach((entry) => {
            totalDebit += parseFloat(entry.debit) || 0;
        });

        return totalDebit.toFixed(2);
    };



    const calculateTotalCredit = () => {
        let totalCredit = 0;
        Object.values(parsedDataBySection).forEach((sectionData) => {
            sectionData.forEach((entry) => {
                totalCredit += parseFloat(entry.credit) || 0;
            });
        });

        accountDataList.forEach((entry) => {
            totalCredit += parseFloat(entry.credit) || 0;
        });

        return totalCredit.toFixed(2);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prevValues) => ({
            ...prevValues,
            [name]: value
        }));
        setFormErrors((prevErrors) => ({
            ...prevErrors,
            [name]: value ? null : 'Field is required'
        }));
    };

    const handlesubmit = (data) =>{
        // console.log('dataaaaaaaaaaaa', data)
        setFormValues({...formValues, name : data.name, file : data.file, index: data.index_value})
    }
    // console.log('fetchDatasss', fetchDatas)

    const finaldata = () =>{
        // setShowGrid(false)
        setShowDialog(false)
        // customFetch(`/posMessage/emp_verification/uploadFile`, 'POST', fetchDatas);
        dispatch(uploadFile(fetchDatas, (response) =>{
            // console.log('responseeeeeee', response)
            if(response === 200) {
                dispatch( completedIndexValue(formValues.employee_id))
            }
        }))
    }

    async function sendFileMessageHelper(fileMessage, uploadType, data, index_type, formindex) {
        // console.log('filemessageeee', fileMessage, uploadType)
        const formData = new FormData();
        if(index_type === 5 || index_type === 10){
            // console.log('index555555555', data)
            formData.append('emp_id',formValues.employee_id);
            formData.append('document_type', data[formindex].name);
            formData.append('reason', data[formindex].reason);
            formData.append('dl_number', data[formindex].dl_number);
            formData.append('latitude', data[formindex].latitude);
            formData.append('longitude', data[formindex].longitude);
            formData.append('expiry_date', data[formindex].expiry_date);
            if(data[formindex]?.id) {
                formData.append('id', data[formindex]?.id);
            }
            formData.append('index_value', index_type);
        }
        else if(fileMessage !== undefined){
            formData.append('fileType', uploadType);
            for (const single_file of fileMessage) {
                // const {name, size, type} = single_file;
                // body.files.push({
                //   base64String: await toBase64(single_file),
                //   fileDetails: {name, size, mimetype: type},
                // });
                formData.append('files', single_file);
                formData.append('emp_id',formValues.employee_id);
                formData.append('document_type', data.name);
                formData.append('reason', data.reason);
                formData.append('dl_number', data.dl_number);
                formData.append('latitude', data.latitude);
                formData.append('longitude', data.longitude);
                formData.append('expiry_date', data.expiry_date);
                if(data?.id) {
                    formData.append('id', data?.id);
                }
                formData.append('index_value', index_type);
      
              }
             
        }else{
            // console.log('hhhhhhhhhhhhhh',data )
            formData.append('emp_id',formValues.employee_id);
            formData.append('document_type', data.name);
            formData.append('reason', data.reason);
            formData.append('dl_number', data.dl_number);
            formData.append('latitude', data.latitude);
            formData.append('longitude', data.longitude);
            formData.append('expiry_date', data.expiry_date);
            if(data.id) {
                formData.append('id', data?.id);
            }
            formData.append('index_value', index_type);
        }
      
        // const body = {
        //   fileType: uploadType,
        //   files: [],
        // };
       
        
        // console.log('appendformdataaa', formData)
        // const {
        //   data: resData,
        //   loading,
        //   error,
        // } =
    //    const datas = {
    //     formData : formData,
    //     employee_id: employee_id,
    //     document_type : document_type
    //    }
         setFetchDatas(formData)
         setShowDialog(true)
         // await customFetch(`/posMessage/emp_verification/uploadFile`, 'POST', formData);
    
    
        // if (error) {
        //   return;
        // }
    
        const msg_content = [];
        const fileUrl = [];
    
        // resData.forEach((i) => {
        //   const {fileName, size, mimetype, format, fileAccessUrl} = i;
        //   msg_content.push({
        //     fileName,
        //     size,
        //     mimetype,
        //     format,
        //   });
    
        //   fileUrl.push({
        //     fileName,
        //     fileAccessUrl,
        //   });
        // });
    
        // const data = {
        //   fileUrl,
        //   msg_content: JSON.stringify(msg_content),
        //   temp_msg_id: uid(),
        //   message_type: uploadType,
        //   sender: user.id,
        //   msg_from_uid: user.id,
        //   msg_to_uid: selectedUser.employee_id,
        //   time: moment().format(),
        // };
        // const roomId = getInboxId(user.id, selectedUser.employee_id, company_id);
        // dispatch(onSendMessage(data));
        // setMessage('');
        // sendMessageHelper(data, roomId, user);
      }
// console.log('formValuessssssss', formValues)
// const addEvent = () => {
//     setFormValue([...formValue, { name: '', reason: '' }]);
//   };

    return (
        <>
            <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | Employee Verification </title>
            </Helmet>
            <Container maxWidth="lg" >
            <Grid
            container
            display='flex'
            flexDirection='row'
            alignItems='center'
            spacing={5}
          >
                    <Grid
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        <Box width='100%' display='flex' flexDirection='row' alignItems='center' justifyContent='space-between' gap={2}>
                            <FormControl variant='outlined' fullWidth>
                                <InputLabel>User</InputLabel>
                                <Select
                                    value={formValues.employee_id}
                                    name='employee_id'
                                    onChange={handleChange}
                                    label='User'
                                    required
                                    error={formErrors.employee_id !== null}
                                    helperText={formErrors.employee_id}
                                    sx={{
                                        '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline':
                                        {
                                            borderColor: 'red', // Set the border color to red when error is true
                                        },
                                        '& .MuiFormHelperText-root.Mui-error': {
                                            color: 'red', // Set the helper text color to red when error is true
                                        },
                                    }}
                                >
                                    {get_empbasecompany.map((m) => (
                                        <MenuItem key={m.employee_id} value={m.employee_id}>
                                            {m.last_name ? `${m.first_name} ${m.last_name}` : m.first_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText sx={{ color: 'red' }}>
                                    {formErrors.employee_id}
                                </FormHelperText>
                            </FormControl>
                            <Button
                                onClick={() => {
                                    setEmpDetails({});                                    
                                    handleVClose();                                    
                                }}
                            >
                                Back
                            </Button>
                        </Box>
                    </Grid>
                    
                    {Object.keys(empDetails).length ? (
                        <Grid
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            <EmployeeDetails user={empDetails} />
                        </Grid>
                    ) : null}

                    <Grid
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        <StepperDesign completed_index_value={completed_index_value} />
                    </Grid>

                    {titlesWithIcons.map(({ title, icon, infoIcon }, index) => (
                        <Grid key={index} size={12}>
                            <Paper elevation={3} style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {icon}
                                    <Typography variant="h6" style={{ marginLeft: '0.5rem' }}>
                                        {title}
                                    </Typography>
                                    {infoIcon}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                    {/* {index <= 1 ? (
                                        <CSVReader
                                            key={csvKey}
                                            onFileLoaded={(data) => handleCSVFile(data, index)}
                                            parserOptions={{
                                                dynamicTyping: true,
                                                header: true,
                                                skipEmptyLines: true,
                                            }}
                                        >
                                        </CSVReader>
                                    ) : null} */}
                                    <CommonToolTip title ='More'>
                                    <IconButton onClick={() => formValues.employee_id === null ? alert('Please Select Employee') : handleCardClick(index)}>
                                        {showDropdownIndex === index ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
                                    </IconButton>
                                    </CommonToolTip>
                                </div>
                            </Paper>

                            {/* {showDropdownIndex === index && parsedDataBySection[index] && parsedDataBySection[index].length > 0 && index <= 1 && (
                                <NewAccountsComponent
                                    parsedDataBySection={parsedDataBySection}
                                    selectedLedgerName={list_groups}
                                    index={index}
                                    handleCancel={() => handleCancel(index)}
                                    handleSave={handleSave}
                                />
                             )} */}

                            {/* {showDropdownIndex === index && (
                                <Card style={{ marginTop: '1rem' }}>
                                    <CardContent>
                                        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                                            <Grid size={{ xs: 12, sm: 3 }}>
                                                <Typography variant="h5">Accounts</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 3 }} style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Typography variant="h5">Available Balance</Typography>
                                                    <Tooltip title="This is the available balance information.">
                                                        <InfoIcon style={{ marginLeft: '0.5rem', fontSize: '1rem', color: 'gray' }} />
                                                    </Tooltip>
                                                </div>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 2 }} style={{ textAlign: 'end' }}>
                                                <Typography variant="h5">Debit (INR)</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 2 }} style={{ textAlign: 'end' }}>
                                                <Typography variant="h5">Credit (INR)</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 2 }} style={{ textAlign: 'end' }}>
                                                <Typography variant="h5">Actions</Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>

                            )} */}

                            {showDropdownIndex === index && (
                                <Card style={{ marginTop: '1rem' }}>
                                    <CardContent>
                                        {/* {showDropdownIndex === index && index === 5 || index === 10? (
                                            <Button style={{ margin: '1rem' }} onClick={addEvent}>
                                                + Add
                                            </Button>
                                        ) : ( */}
                                            {/* // <Button style={{ margin: '1rem' }} onClick={handleOpensundry}>
                                            //     + Add Account
                                            // </Button>
                                            '' */}
                                        {/* )} */}
                                      
                                        { showGrid && (
                                            <AddDocument
                                                ledgerData={[{name:'Aadhar'}, {name: 'DL'}, {name: 'Pancard'}] }
                                                onAddAccount={handleAddAccountData}
                                                // onexistUpdate={handleExistupdate}
                                                onCancel={toggleAccountAddition}

                                                selectedLedgerName={index === 0 || index === 1 ? [{ name: 'Aadhar' }, { name: 'DL' }, { name: 'Pancard' }] : index === 2 || index === 3 || index === 6 || index === 7 || index === 8 || index === 9 ? [{ name: 'Please Select' }, { name: 'Yes' }, { name: 'No' }] : index === 4 ? [{ name: 'DL' }] : index === 5 ? [{ name: 'facebook' }, { name: 'LinkedIn' }, { name: 'Insta' }] : [{ name: 'Aadhar' }, { name: 'Passport' }]}
                                                
                                                existsdata={accountDataList}
                                                showGrid={showGrid}
                                                
                                                index = {index}
                                                showdialog = {setShowDialog}
                                                handlesubmit = {handlesubmit}
                                                sendFileMessageHelper = {sendFileMessageHelper}
                                                empVerificationDetail = {empVerificationDetail}
                                                // formValue = {formValue}
                                                // setFormValue = {setFormValue}
                                            />
                                        )}
                                        
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>
                    ))}
                </Grid>

              

                <Divider style={{ margin: '2rem 0' }} />

                {/* <Grid container spacing={2} justifyContent="space-between">
                    <Grid>
                        <Button variant="outlined" color="primary" onClick={resetAllStates}>
                            Clear
                        </Button>
                    </Grid>
                    <Grid>
                        <Button variant="contained" color="primary" onClick={handleSaveButtonClick}>
                            Submit
                        </Button>

                    </Grid>
                </Grid> */}

                <ConfirmationDialog
                    open={confirmationOpen}
                    onClose={handleClose}
                    onConfirm={() => {
                        handleConfirm();
                    }}
                />

                {/* {isDialogOpen && <AccountDialog isOpen={true} accountName={dialogAccountName} message={dialogMessage} onClose={() => setIsDialogOpen(false)} />} */}
                {showDialog && <OriginalDocument open={true} unmatched={unmatchedNames} matched={matchedNames} onClose={() => setShowDialog(false)} submit = {finaldata}/>}
                {/* <LocationAlert openAlert={openAlert} onClose={ ()=> setOpenAlert(false)} /> */}
            </Container>
        </>
    );
};
