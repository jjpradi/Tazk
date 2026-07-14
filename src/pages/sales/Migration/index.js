import React, { useContext, useEffect, useRef, useState } from 'react';
import { Typography, Container, Grid, Paper, Button, IconButton, Divider, Menu, MenuItem, Card, CardContent, Tooltip, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, FormControl, InputLabel, Select, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import InfoIcon from '@mui/icons-material/Info';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
// import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { useDispatch, useSelector } from 'react-redux';
import context from '../../../context/CreateNewButtonContext'
import apiCalls from 'utils/apiCalls';
import { ledgerMigrationNameAction, listMigrationAction, updateMigrationAction, craeteAccountsMigration, listAccountGroup, handleExistupdateAction, createSundryAccounts } from 'redux/actions/ledger_actions';
import ConfirmationDialog from './ConfirmationDialog';
import AddAccountComponent from './AddAccounts';
import NewAccountsComponent from './NewAccounts';
import moment from 'moment';
import { string } from 'prop-types';
import NewsundryAcc from './NewsundryAcc';
import LedgerRow from './LedgerRow';
import CSVReader from 'react-csv-reader';
import './csvstyle.css'
import YourDialogComponent from './YourDialogComponent';
import { Helmet } from 'react-helmet-async';
import AccountDialog from './AccountDialog';
import CommonToolTip from '../../../components/ToolTip';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import { titleURL } from 'http-common';
import toMomentOrNull from 'utils/DateFixer';

export default function LandingPage() {
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

    const dispatch = useDispatch();

    const {
        ledgerReducer: { migrationList, ledger_migration, list_groups },
    } = useSelector((state) => state);
    const { setLoaderStatusHandler, setModalTypeHandler, headerLocationId } = useContext(context);

    useEffect(() => {
        dispatch(listMigrationAction())
    }, []);


    const handleAddAccountData = (newData) => {
        setAccountDataList(newData);
    };

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



    const titlesWithIcons = migrationList
        ? [
            {
                title: "Accounts Receivables",
                icon: <AccountBalanceIcon color="secondary" />,
                infoIcon: (
                    <Tooltip title="Information about Accounts Receivables">
                        <InfoIcon style={{ fontSize: '1rem', color: 'gray', marginLeft: '0.5rem' }} />
                    </Tooltip>
                ),
            },
            {
                title: "Accounts Payables",
                icon: <AccountBalanceIcon color="primary" />,
                infoIcon: (
                    <Tooltip title="Information about Accounts Payables">
                        <InfoIcon style={{ fontSize: '1rem', color: 'gray', marginLeft: '0.5rem' }} />
                    </Tooltip>
                ),
            },
            ...migrationList.map((item, index) => ({
                title: item.name,
                icon: <AccountBalanceIcon color={index % 2 === 0 ? 'secondary' : 'primary'} />,
            })),
        ]
        : [];

    const handleCardClick = async (index) => {
        if (showDropdownIndex === index) {
            setShowDropdownIndex(null);
        }
        else {
            try {
                // const response = await dispatch(ledgerMigrationNameAction({
                //     ledger_name: titlesWithIcons[index].title,
                //     financialStartDate: moment(financialStartDate).format('YYYY-MM-DD')
                // }));

                const getGroups = await dispatch(listAccountGroup({
                    ledger_name: titlesWithIcons[index].title
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


    //     const fetchNamesFromAPI = async (data, sectionIndex) => {
    //         try {
    //             setIsLoading(true);
    //             const parent_name = sectionIndex + 1 === 1 ? 'Sundry Debtors' : 'Sundry Creditors';
    //             const apiData = await dispatch(handleExistupdateAction({data,name: parent_name,trans_date: moment(financialStartDate).format('YYYY-MM-DD') }));
    //             setCSVData(data);

    //             const csvNames = data.map((row) => row.ledgername);
    //             const apiNames = apiData.map((item) => item.name);

    //             const matched = csvNames.filter((name) => apiNames.includes(name));

    //             const parsedData = matched.map((name) => {
    //                 const matchingApiData = apiData.find((item) => item.name === name);

    //                 if (matchingApiData) {
    //                     const { accountGroup, parentAccountId, name: apiName, id } = matchingApiData;

    //                     const matchingDataRow = data.find((row) => row.ledgername === name);

    //                     if (matchingDataRow) {
    //                         const { debit, credit } = matchingDataRow;

    //                         setMatchedNames((prevState) => [
    //                             ...prevState,
    //                             {
    //                                 id,
    //                                 parent_name,
    //                                 accountGroup,
    //                                 parentAccountId,
    //                                 name: apiName,
    //                                 debit,
    //                                 credit,
    //                             },
    //                         ]);

    //                         return {
    //                             id,
    //                             parent_name,
    //                             accountGroup,
    //                             parentAccountId,
    //                             name: apiName,
    //                             debit,
    //                             credit,
    //                         };
    //                     }
    //                 }

    //                 return null;
    //             });

    //             const unmatched = csvNames.filter((name) => !apiNames.includes(name));

    //             setUnmatchedNames(unmatched);

    //             // Update parsedDataBySection
    //             setParsedDataBySection((prevState) => ({
    //                 ...prevState,
    //                 [sectionIndex]: parsedData.filter(row => row !== null),
    //             }));

    //             if (unmatched.length) {
    //                 setShowDialog(true);
    //             }
    //             handleCardClick(sectionIndex);
    //             setCSVKey((prevKey) => prevKey + 1);
    //             setIsLoading(false);
    //         } catch (error) {
    //             setIsLoading(false);
    //             console.error('Error fetching data from API:', error);
    //         }
    //     };


    const fetchNamesFromAPI = async (data, sectionIndex) => {
        try {
            setIsLoading(true);
            const parent_name = sectionIndex + 1 === 1 ? 'Sundry Debtors' : 'Sundry Creditors';

            // Dispatch the action to get matched and unmatched data
            const apiData = await dispatch(handleExistupdateAction({
                data,
                name: parent_name,
                trans_date: moment(financialStartDate).format('YYYY-MM-DD')
            }));

            // Extract matched and unmatched data
            const matched = apiData.matchedData || [];
            const unmatched = apiData.unmatchedData || [];

            // Update state variables accordingly
            setCSVData(data);
            setMatchedNames(matched);


            // Update parsedDataBySection with matched data
            setParsedDataBySection((prevState) => ({
                ...prevState,
                [sectionIndex]: matched,
            }));

            // Set unmatched names and showDialog if unmatched data is present
            setUnmatchedNames(unmatched);
            if (unmatched.length) {
                setShowDialog(true);
            }

            // handleCardClick(sectionIndex);
            setCSVKey((prevKey) => prevKey + 1);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.error('Error fetching data from API:', error);
        }
    };


    const handleCSVFile = (data, sectionIndex) => {

        // Call the function to fetch names from the API
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


    return (
        <>
            <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | Migration </title>
            </Helmet>
            <Container
            sx={{
                maxHeight: '80vh',      
                overflowY: 'auto',
                padding: 2,              
                backgroundColor: '#f5f5f5' 
            }}>
                {/* <Typography variant="h4" gutterBottom>
        Migration Opening Balance
      </Typography> */}

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                    <Typography variant="subtitle1" required style={{ color: 'red', fontFamily: 'YourCustomFont', fontSize: '1rem' }}>
                        Migration Date:
                    </Typography>
                    <span style={{ marginLeft: '1rem' }}>&nbsp;</span>
                    <LocalizationProvider dateAdapter={DateAdapter}>
                        <DatePicker
                            label='Financial Year'
                            // inputFormat='DD/MM/yyyy'
                            value={toMomentOrNull(financialStartDate)}
                            inputVariant='outlined'
                            format='DD/MM/YYYY'
                            onChange={(newDate) => setFinancialStartDate(newDate)}
                            slotProps={{ textField: { variant: 'filled' } }}
                            disableFuture
                        />
                    </LocalizationProvider>
                </div>


                <Grid container spacing={2}>
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
                                    {index <= 1 ? (
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
                                    ) : null}
                                    <CommonToolTip title ='More'>
                                    <IconButton onClick={() => handleCardClick(index)}>
                                        {showDropdownIndex === index ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
                                    </IconButton>
                                    </CommonToolTip>
                                </div>
                            </Paper>

                            {showDropdownIndex === index && parsedDataBySection[index] && parsedDataBySection[index].length > 0 && index <= 1 && (
                                <NewAccountsComponent
                                    parsedDataBySection={parsedDataBySection}
                                    selectedLedgerName={list_groups}
                                    index={index}
                                    handleCancel={() => handleCancel(index)}
                                    handleSave={handleSave}
                                />
                            )}

                            {showDropdownIndex === index && (
                                <Card style={{ marginTop: '1rem' }}>
                                    <CardContent>
                                        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                                            <Grid
                                                size={{
                                                    xs: 12,
                                                    sm: 3
                                                }}>
                                                <Typography variant="h5">Accounts</Typography>
                                            </Grid>
                                            <Grid
                                                style={{ textAlign: 'center' }}
                                                size={{
                                                    xs: 12,
                                                    sm: 3
                                                }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Typography variant="h5">Available Balance</Typography>
                                                    <Tooltip title="This is the available balance information.">
                                                        <InfoIcon style={{ marginLeft: '0.5rem', fontSize: '1rem', color: 'gray' }} />
                                                    </Tooltip>
                                                </div>
                                            </Grid>
                                            <Grid
                                                style={{ textAlign: 'end' }}
                                                size={{
                                                    xs: 12,
                                                    sm: 2
                                                }}>
                                                <Typography variant="h5">Debit (INR)</Typography>
                                            </Grid>
                                            <Grid
                                                style={{ textAlign: 'end' }}
                                                size={{
                                                    xs: 12,
                                                    sm: 2
                                                }}>
                                                <Typography variant="h5">Credit (INR)</Typography>
                                            </Grid>
                                            <Grid
                                                style={{ textAlign: 'end' }}
                                                size={{
                                                    xs: 12,
                                                    sm: 2
                                                }}>
                                                <Typography variant="h5">Actions</Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>

                            )}

                            {showDropdownIndex === index && (
                                <Card style={{ marginTop: '1rem' }}>
                                    <CardContent>
                                        <Grid container spacing={2}>
                                            {/* {ledger_migration.map((item, subIndex) => (
                                            <Grid size={12} key={subIndex}>
                                                <Paper
                                                    elevation={3}
                                                    style={{
                                                        padding: '1rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        borderRadius: '13px',
                                                    }}
                                                >
                                                    <LedgerRow
                                                        item={item}
                                                        subIndex={subIndex}
                                                        currentLedgerData={changedData[item.id] || {
                                                            opening_balance: item.opening_balance || null,
                                                            debit: item.debit || null,
                                                            credit: item.credit || null,
                                                        }}
                                                        handleDebitChange={handleDebitChange}
                                                        handleCreditChange={handleCreditChange}
                                                        isEditable={editableRows[subIndex] || false}
                                                        setEditable={() => handleEdit(subIndex)}
                                                    />
                                                </Paper>
                                            </Grid>
                                        ))} */}

                                        </Grid>
                                        {showDropdownIndex === index && index > 1 ? (
                                            <Button style={{ margin: '1rem' }} onClick={toggleAccountAddition}>
                                                + Add Account
                                            </Button>
                                        ) : (
                                            // <Button style={{ margin: '1rem' }} onClick={handleOpensundry}>
                                            //     + Add Account
                                            // </Button>
                                            ("")
                                        )}
                                        {openNewsundry && index <= 1 && (
                                            <NewsundryAcc
                                                ledgerData={ledger_migration || ''}
                                                onAddAccount={handleNewsundry}
                                                onexistUpdate={handleExistupdate}
                                                onCancel={handleOpensundry}
                                                selectedLedgerName={list_groups}
                                            />
                                        )}
                                        {index > 1 && showGrid && (
                                            <AddAccountComponent
                                                ledgerData={ledger_migration || ''}
                                                onAddAccount={handleAddAccountData}
                                                // onexistUpdate={handleExistupdate}
                                                onCancel={toggleAccountAddition}
                                                selectedLedgerName={list_groups}
                                                existsdata={accountDataList}
                                                showGrid={showGrid}
                                            />
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>
                    ))}
                </Grid>

                <Divider style={{ margin: '2rem 0' }} />
                <Grid container spacing={2}>
                    <Grid size={12}>
                        <Paper elevation={3} style={{ padding: '1rem', background: '#FFE4B5' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
                                <Typography variant="h6" style={{ flex: 2, textAlign: "right" }}>
                                    Total
                                </Typography>
                                <Typography variant="h6" style={{ flex: 1, textAlign: "right" }}>
                                    {calculateTotalDebit()}
                                </Typography>
                                <Typography variant="h6" style={{ flex: 1, textAlign: "right" }}>
                                    {calculateTotalCredit()}
                                </Typography>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h6" style={{ flex: 5, textAlign: "center", color: '#FA5F55' }}>
                                    Opening Balance Adjustments
                                    <Typography variant="body1" style={{ flex: 4, textAlign: "center", color: 'black', fontSize: '10px' }}>
                                        This account will hold the difference in credit and debit.
                                    </Typography>
                                </Typography>
                                <Typography variant="h6" style={{ flex: 1, textAlign: "right", color: '#FA5F55' }}>
                                    0.00
                                </Typography>
                            </div>
                            <Divider style={{ margin: '2rem 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h6" style={{ flex: 2, textAlign: "right" }}>
                                    Total Amount
                                    {/* <Typography variant="body1" style={{ flex: 2, textAlign: "right", color: 'black', fontSize: '10px' }}>
                                    Includes Opening Balance Adjustment account
                                </Typography> */}
                                </Typography>
                                <Typography variant="h6" style={{ flex: 1, textAlign: "right" }}>
                                    {calculateTotalDebit()}
                                </Typography>
                                <Typography variant="h6" style={{ flex: 1, textAlign: "right" }}>
                                    {calculateTotalCredit()}
                                </Typography>
                            </div>
                        </Paper>
                    </Grid>
                </Grid>

                <Divider style={{ margin: '2rem 0' }} />

                <Grid container spacing={2} justifyContent="space-between">
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
                </Grid>

                <ConfirmationDialog
                    open={confirmationOpen}
                    onClose={handleClose}
                    onConfirm={() => {
                        handleConfirm();
                    }}
                />

                {isDialogOpen && <AccountDialog isOpen={true} accountName={dialogAccountName} message={dialogMessage} onClose={() => setIsDialogOpen(false)} />}
                {showDialog && <YourDialogComponent open={true} unmatched={unmatchedNames} matched={matchedNames} onClose={() => setShowDialog(false)} />}
                <LocationAlert open={openAlert} onClose={ ()=> setOpenAlert(false)}/>
            </Container>
        </>
    );
};
